"use client";

import { useEffect, useState } from "react";
import { adminAPI } from "@/lib/api";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
    Search,
    Download,
    Plus,
    Globe,
} from "lucide-react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";

interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string;
    createdAt: string;
    otpVerified: boolean;
    source: string;
    status: string;
    fbLeadId?: string;
    location?: string;
    budget?: string;
    project?: {
        id: string;
        name: string;
        builderName: string;
        advertiser?: {
            id: string;
            companyName: string;
        };
    };
    landingPageId?: string;
    landingPage?: {
        id: string;
        name: string;
        fbAdAccountId?: string;
    };
}

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const response = await adminAPI.getLeads({});
            setLeads(response.data.leads || response.data);
            setTotal(response.data.total || response.data.length);
        } catch (error) {
            console.error("Error fetching leads:", error);
        } finally {
            setLoading(false);
        }
    };

    const lpLeads = leads.filter(l => l.landingPageId);
    const commonLeads = leads.filter(l => l.landingPageId && l.status === 'unassigned');

    const filterFn = (lead: Lead) =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.project?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.project?.advertiser?.companyName.toLowerCase().includes(searchQuery.toLowerCase());

    const handleExport = (data: Lead[]) => {
        const csvContent = [
            ["Name", "Phone", "Email", "Project", "Advertiser", "LP", "Source", "FB Lead ID", "Date"].join(","),
            ...data.map((lead) =>
                [
                    lead.name,
                    lead.phone,
                    lead.email,
                    lead.project?.name || "",
                    lead.project?.advertiser?.companyName || "",
                    lead.landingPage?.name || "",
                    lead.source,
                    lead.fbLeadId || "",
                    formatDate(lead.createdAt),
                ].join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const Table = ({ data }: { data: Lead[] }) => {
        const filtered = data.filter(filterFn);
        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="text-left p-4 font-medium">Contact</th>
                            <th className="text-left p-4 font-medium">Project / LP</th>
                            <th className="text-left p-4 font-medium">Source Details</th>
                            <th className="text-left p-4 font-medium">Date</th>
                            <th className="text-left p-4 font-medium">Assignment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((lead) => (
                            <tr key={lead.id} className="border-b hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-medium">{lead.name}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{lead.phone} | {lead.email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm">
                                        <p className="font-medium text-slate-700">{lead.project?.name || '-'}</p>
                                        <p className="text-xs text-muted-foreground">{lead.landingPage?.name || 'Direct'}</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="text-xs space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="capitalize text-[10px]">{lead.source}</Badge>
                                            {lead.source === 'facebook' && <Globe className="h-3 w-3 text-blue-600" />}
                                        </div>
                                        {lead.landingPage?.fbAdAccountId && <p className="text-[10px]">Acc: {lead.landingPage.fbAdAccountId}</p>}
                                        {lead.fbLeadId && <p className="text-[10px]">ID: {lead.fbLeadId}</p>}
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-muted-foreground">
                                    {formatDate(lead.createdAt)}
                                </td>
                                <td className="p-4">
                                    {lead.status === 'assigned' ? (
                                        <div className="text-xs">
                                            <Badge variant="success" className="mb-1">Assigned</Badge>
                                            <p className="text-muted-foreground truncate max-w-[120px]">
                                                {lead.project?.advertiser?.companyName}
                                            </p>
                                        </div>
                                    ) : (
                                        <Badge variant="secondary" className="bg-slate-200">Pending Pool</Badge>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-heading font-bold">Leads Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Track and distribute leads across all landing pages
                    </p>
                </div>
            </div>

            <Tabs defaultValue="lp" className="w-full">
                <div className="flex items-center justify-between mb-4 border-b">
                    <TabsList className="bg-transparent h-auto p-0 gap-6">
                        <TabsTrigger value="lp" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-0 py-2 text-base font-semibold">
                            Landing Page Leads
                        </TabsTrigger>
                        <TabsTrigger value="common" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-0 py-2 text-base font-semibold">
                            Common Pool
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2 mb-2">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search leads..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-9"
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleExport(lpLeads)}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                <TabsContent value="lp" className="mt-0">
                    <Card>
                        <CardContent className="p-0">
                            <Table data={lpLeads} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="common" className="mt-0">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Common Nature Leads</CardTitle>
                            <CardDescription>Unassigned leads from Facebook and Landing Pages shared pool.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table data={commonLeads} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
