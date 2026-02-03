"use client";

import { useEffect, useState } from "react";
import { advertiserAPI } from "@/lib/api";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Users, Search, Phone, Mail, Calendar, Building, Globe } from "lucide-react";

interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string;
    createdAt: string;
    otpVerified: boolean;
    source: string;
    location?: string;
    budget?: string;
    project?: {
        id: string;
        name: string;
        builderName: string;
    };
    landingPage?: {
        id: string;
        name: string;
    };
}

export default function CommonLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const response = await advertiserAPI.getCommonLeads();
                setLeads(response.data);
            } catch (error) {
                console.error("Error fetching leads:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, []);

    const filteredLeads = leads.filter(
        (lead) =>
            lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.phone.includes(searchQuery) ||
            lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.landingPage?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-heading font-bold">Common Leads</h1>
                    <p className="text-muted-foreground mt-1">
                        All incoming leads from your linked Landing Pages
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{leads.length}</p>
                                <p className="text-sm text-muted-foreground">Total Leads</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Globe className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {leads.filter((l) => l.source === 'facebook').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Facebook</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* ... other stats omitted for brevity or kept identical ... */}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search common pool..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Leads Table */}
            {filteredLeads.length > 0 ? (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="text-left p-4 font-medium">Contact</th>
                                        <th className="text-left p-4 font-medium">Capture Info</th>
                                        <th className="text-left p-4 font-medium">LP / Source</th>
                                        <th className="text-left p-4 font-medium">Date</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeads.map((lead) => (
                                        <tr
                                            key={lead.id}
                                            className="border-b hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium text-slate-400">
                                                        {lead.name.split(' ').map(n => n[0] + '***').join(' ')}
                                                        <span className="text-[10px] ml-2 font-normal text-muted-foreground">(Masked)</span>
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                                        {lead.email.split('@')[0].slice(0, 2)}***@{lead.email.split('@')[1]}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-xs space-y-1">
                                                    {lead.location && <p><span className="text-muted-foreground">Loc:</span> {lead.location}</p>}
                                                    {lead.budget && <p><span className="text-muted-foreground">Bud:</span> {lead.budget}</p>}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">
                                                    <p className="font-medium text-slate-700">{lead.landingPage?.name || 'Direct'}</p>
                                                    <Badge variant="outline" className="mt-1 text-[10px] capitalize">
                                                        {lead.source}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {formatDate(lead.createdAt)}
                                            </td>
                                            <td className="p-4">
                                                {lead.id.includes('assigned') ? (
                                                    <Badge variant="success">Assigned</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-slate-200">Processing</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="text-center py-12">
                    <CardContent>
                        <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No Common Leads</h3>
                        <p className="text-muted-foreground">
                            Incoming leads from your landing pages will appear here before final assignment.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
