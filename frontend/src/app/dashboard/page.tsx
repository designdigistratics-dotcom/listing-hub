"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { advertiserAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
    Package,
    FolderOpen,
    Users,
    TrendingUp,
    ArrowRight,
    Plus,
} from "lucide-react";

interface DashboardStats {
    activePackages: number;
    totalProjects: number;
    liveProjects: number;
    totalLeads: number;
}

interface RecentProject {
    id: string;
    name: string;
    status: string;
    city: string;
}

interface RecentLead {
    id: string;
    name: string;
    phone: string;
    createdAt: string;
    projectName?: string;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
    const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashboardRes, projectsRes, leadsRes] = await Promise.all([
                    advertiserAPI.getDashboard(),
                    advertiserAPI.getProjects(),
                    advertiserAPI.getDirectLeads(),
                ]);

                setStats(dashboardRes.data.stats);
                setRecentProjects(projectsRes.data.slice(0, 5));
                setRecentLeads(leadsRes.data.slice(0, 5));
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "LIVE":
                return <Badge variant="success">Live</Badge>;
            case "SUBMITTED_FOR_REVIEW":
                return <Badge variant="warning">Under Review</Badge>;
            case "REJECTED":
                return <Badge variant="destructive">Rejected</Badge>;
            case "DRAFT":
                return <Badge variant="secondary">Draft</Badge>;
            default:
                return <Badge>{status}</Badge>;
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
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-heading font-bold">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back! Here&apos;s an overview of your account.
                    </p>
                </div>
                <Link href="/dashboard/projects/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="card-hover-subtle">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Active Packages</p>
                                <p className="text-3xl font-bold mt-1">
                                    {stats?.activePackages || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Package className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-hover-subtle">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Projects</p>
                                <p className="text-3xl font-bold mt-1">
                                    {stats?.totalProjects || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                <FolderOpen className="h-6 w-6 text-accent" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-hover-subtle">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Live Projects</p>
                                <p className="text-3xl font-bold mt-1">
                                    {stats?.liveProjects || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-hover-subtle">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Leads</p>
                                <p className="text-3xl font-bold mt-1">
                                    {stats?.totalLeads || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Projects */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Recent Projects</CardTitle>
                            <CardDescription>Your latest project activities</CardDescription>
                        </div>
                        <Link href="/dashboard/projects">
                            <Button variant="ghost" size="sm">
                                View All
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentProjects.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No projects yet</p>
                                <Link href="/dashboard/projects/new">
                                    <Button size="sm" className="mt-4">
                                        Create Your First Project
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentProjects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/dashboard/projects/${project.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium">{project.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {project.city}
                                            </p>
                                        </div>
                                        {getStatusBadge(project.status)}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Leads */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Recent Leads</CardTitle>
                            <CardDescription>Latest inquiries for your projects</CardDescription>
                        </div>
                        <Link href="/dashboard/leads">
                            <Button variant="ghost" size="sm">
                                View All
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentLeads.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No leads yet</p>
                                <p className="text-sm mt-1">
                                    Leads will appear once your projects go live
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentLeads.map((lead) => (
                                    <div
                                        key={lead.id}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium">{lead.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {lead.phone}
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                    <CardDescription>Common actions you might want to take</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link href="/dashboard/packages">
                            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                                <Package className="h-6 w-6" />
                                <span>Buy Package</span>
                            </Button>
                        </Link>
                        <Link href="/dashboard/projects/new">
                            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                                <FolderOpen className="h-6 w-6" />
                                <span>Create Project</span>
                            </Button>
                        </Link>
                        <Link href="/dashboard/leads">
                            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                                <Users className="h-6 w-6" />
                                <span>View Leads</span>
                            </Button>
                        </Link>
                        <Link href="/dashboard/billing">
                            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                                <TrendingUp className="h-6 w-6" />
                                <span>View Billing</span>
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
