"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminAPI } from "@/lib/api";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    Building,
    FolderOpen,
    UserCheck,
    CreditCard,
    TrendingUp,
    ArrowRight,
    Clock,
    AlertCircle,
} from "lucide-react";

interface DashboardStats {
    totalAdvertisers: number;
    pendingRequests: number;
    pendingReview: number;
    liveProjects: number;
    totalLeads: number;
}

interface QuickLink {
    name: string;
    href: string;
    icon: any;
    count?: number;
    color: string;
    description: string;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await adminAPI.getDashboard();
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const quickLinks: QuickLink[] = [
        {
            name: "Payment Requests",
            href: "/admin/payments",
            icon: CreditCard,
            count: stats?.pendingRequests,
            color: "bg-orange-500",
            description: "Pending approval",
        },
        {
            name: "Project Review",
            href: "/admin/projects?status=SUBMITTED_FOR_REVIEW",
            icon: FolderOpen,
            count: stats?.pendingReview,
            color: "bg-yellow-500",
            description: "Awaiting review",
        },
        {
            name: "Advertisers",
            href: "/admin/advertisers",
            icon: Building,
            count: stats?.totalAdvertisers,
            color: "bg-blue-500",
            description: "Total registered",
        },
        {
            name: "Live Projects",
            href: "/admin/projects?status=LIVE",
            icon: TrendingUp,
            count: stats?.liveProjects,
            color: "bg-green-500",
            description: "Currently active",
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold">
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                    Overview of platform activity and quick actions
                </p>
            </div>

            {/* Alert Cards */}
            {(stats?.pendingRequests ?? 0) > 0 || (stats?.pendingReview ?? 0) > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                    {(stats?.pendingRequests ?? 0) > 0 && (
                        <Card className="border-orange-200 bg-orange-50">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                                            <CreditCard className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-orange-900">
                                                {stats?.pendingRequests} Payment Requests
                                            </p>
                                            <p className="text-sm text-orange-700">
                                                Awaiting confirmation
                                            </p>
                                        </div>
                                    </div>
                                    <Link href="/admin/payments">
                                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                                            Review
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {(stats?.pendingReview ?? 0) > 0 && (
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                                            <FolderOpen className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-yellow-900">
                                                {stats?.pendingReview} Projects to Review
                                            </p>
                                            <p className="text-sm text-yellow-700">
                                                Submitted for approval
                                            </p>
                                        </div>
                                    </div>
                                    <Link href="/admin/projects?status=SUBMITTED_FOR_REVIEW">
                                        <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                                            Review
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            ) : null}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickLinks.map((link) => (
                    <Link key={link.name} href={link.href}>
                        <Card className="card-hover-subtle h-full">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div
                                        className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center`}
                                    >
                                        <link.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-3xl font-bold">{link.count || 0}</p>
                                <p className="text-sm font-medium mt-1">{link.name}</p>
                                <p className="text-xs text-muted-foreground">{link.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                        <CardDescription>Common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href="/admin/advertisers/new">
                            <Button variant="outline" className="w-full justify-start">
                                <Building className="h-4 w-4 mr-2" />
                                Add New Advertiser
                            </Button>
                        </Link>
                        <Link href="/admin/packages/new">
                            <Button variant="outline" className="w-full justify-start">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Create Package
                            </Button>
                        </Link>
                        <Link href="/admin/landing-pages/new">
                            <Button variant="outline" className="w-full justify-start">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Create Landing Page
                            </Button>
                        </Link>
                        <Link href="/admin/projects">
                            <Button variant="outline" className="w-full justify-start">
                                <FolderOpen className="h-4 w-4 mr-2" />
                                Manage Projects
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Platform Stats</CardTitle>
                        <CardDescription>Current platform metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-primary" />
                                    <span>Total Advertisers</span>
                                </div>
                                <span className="font-bold">{stats?.totalAdvertisers || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FolderOpen className="h-5 w-5 text-green-500" />
                                    <span>Live Projects</span>
                                </div>
                                <span className="font-bold">{stats?.liveProjects || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <UserCheck className="h-5 w-5 text-blue-500" />
                                    <span>Total Leads</span>
                                </div>
                                <span className="font-bold">{stats?.totalLeads || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
