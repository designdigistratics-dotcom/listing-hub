"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import {
    Building,
    Plus,
    Search,
    Eye,
    Edit,
    MoreVertical,
    Mail,
    Phone,
    Calendar,
    Package,
    FolderOpen,
    Users,
} from "lucide-react";

interface Advertiser {
    id: string;
    email: string;
    companyName: string;
    phone?: string;
    status: string;
    createdAt: string;
    salespersonId?: string;
    salesperson?: {
        id: string;
        name: string;
    };
    _count?: {
        projects: number;
        packagePurchases: number;
    };
}

export default function AdvertisersPage() {
    const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchAdvertisers();
    }, [statusFilter]);

    const fetchAdvertisers = async () => {
        try {
            const params: { status?: string } = {};
            if (statusFilter !== "all") {
                params.status = statusFilter;
            }
            const response = await adminAPI.getAdvertisers(params);
            setAdvertisers(response.data);
        } catch (error) {
            console.error("Error fetching advertisers:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAdvertisers = advertisers.filter(
        (adv) =>
            adv.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            adv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            adv.phone?.includes(searchQuery)
    );

    const handleToggleStatus = async (id: string) => {
        try {
            await adminAPI.toggleAdvertiserStatus(id);
            fetchAdvertisers();
        } catch (error) {
            console.error("Error toggling status:", error);
        }
    };

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-heading font-bold">
                        Advertisers
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage advertiser accounts
                    </p>
                </div>
                <Link href="/admin/advertisers/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Advertiser
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={statusFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("all")}
                    >
                        All
                    </Button>
                    <Button
                        variant={statusFilter === "active" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("active")}
                    >
                        Active
                    </Button>
                    <Button
                        variant={statusFilter === "inactive" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("inactive")}
                    >
                        Inactive
                    </Button>
                </div>
            </div>

            {/* Advertisers Table */}
            {filteredAdvertisers.length > 0 ? (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="text-left p-4 font-medium">Company</th>
                                        <th className="text-left p-4 font-medium">Contact</th>
                                        <th className="text-left p-4 font-medium">Stats</th>
                                        <th className="text-left p-4 font-medium">Salesperson</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAdvertisers.map((advertiser) => (
                                        <tr
                                            key={advertiser.id}
                                            className="border-b hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Building className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{advertiser.companyName}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Since {formatDate(advertiser.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                                        {advertiser.email}
                                                    </div>
                                                    {advertiser.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                                            {advertiser.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                        {advertiser._count?.packagePurchases || 0}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                                        {advertiser._count?.projects || 0}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm">
                                                {advertiser.salesperson?.name || (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <Badge
                                                    variant={
                                                        advertiser.status === "active" ? "success" : "secondary"
                                                    }
                                                    className="cursor-pointer"
                                                    onClick={() => handleToggleStatus(advertiser.id)}
                                                >
                                                    {advertiser.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/admin/advertisers/${advertiser.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/advertisers/${advertiser.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                </div>
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
                        <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No Advertisers Found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchQuery
                                ? "Try adjusting your search"
                                : "Add your first advertiser to get started"}
                        </p>
                        {!searchQuery && (
                            <Link href="/admin/advertisers/new">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Advertiser
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
