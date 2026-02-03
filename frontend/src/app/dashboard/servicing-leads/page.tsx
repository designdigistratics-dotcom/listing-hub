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
import { Users, Search, Phone, Mail, Calendar, Building, CheckCircle2 } from "lucide-react";

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
    propertyType?: string;
    unitType?: string;
    city?: string;
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

export default function ServicingLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const response = await advertiserAPI.getServicingLeads();
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
            lead.project?.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold">Servicing Leads</h1>
                <p className="text-muted-foreground mt-1">
                    Leads assigned to you or uploaded specifically for your follow-up
                </p>
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
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {leads.filter((l) => l.source === 'manual').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Uploaded</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* Simplified stats for servicing leads */}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search assigned leads..."
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
                                        <th className="text-left p-4 font-medium">Lead</th>
                                        <th className="text-left p-4 font-medium">Date</th>
                                        <th className="text-left p-4 font-medium">Property Type</th>
                                        <th className="text-left p-4 font-medium">Unit Type</th>
                                        <th className="text-left p-4 font-medium">City</th>
                                        <th className="text-left p-4 font-medium">Location</th>
                                        <th className="text-left p-4 font-medium">Budget</th>
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
                                                    <p className="font-medium">{lead.name}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{lead.phone}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {formatDate(lead.createdAt)}
                                            </td>
                                            <td className="p-4 text-sm">{lead.propertyType || "N/A"}</td>
                                            <td className="p-4 text-sm">{lead.unitType || "N/A"}</td>
                                            <td className="p-4 text-sm">{lead.city || "N/A"}</td>
                                            <td className="p-4 text-sm">{lead.location || "N/A"}</td>
                                            <td className="p-4 text-sm font-medium">{lead.budget || "N/A"}</td>
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
                        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No Servicing Leads</h3>
                        <p className="text-muted-foreground">
                            Leads specifically assigned to you will appear here.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
