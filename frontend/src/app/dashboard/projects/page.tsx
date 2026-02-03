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
import { Input } from "@/components/ui/input";
import { formatBudgetRange } from "@/lib/utils";
import {
    FolderOpen,
    Plus,
    Search,
    Eye,
    Edit,
    MapPin,
    Building,
    Calendar,
} from "lucide-react";

interface Project {
    id: string;
    name: string;
    builderName: string;
    city: string;
    locality: string;
    status: string;
    budgetMin: number;
    budgetMax: number;
    propertyType: string;
    createdAt: string;
    featuredImage?: string;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await advertiserAPI.getProjects();
                console.log("Fetched Projects:", response.data);
                setProjects(response.data);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            LIVE: { variant: "success", label: "Live" },
            SUBMITTED_FOR_REVIEW: { variant: "warning", label: "Under Review" },
            REJECTED: { variant: "destructive", label: "Rejected" },
            DRAFT: { variant: "secondary", label: "Draft" },
            PAUSED: { variant: "outline", label: "Paused" },
            PENDING_PLACEMENT: { variant: "info", label: "Pending Placement" },
        };
        const config = variants[status] || { variant: "secondary", label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.builderName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || project.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const statusCounts = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

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
                        Projects
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your property listings
                    </p>
                </div>
                <Link href="/dashboard/projects/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={statusFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("all")}
                    >
                        All ({projects.length})
                    </Button>
                    <Button
                        variant={statusFilter === "LIVE" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("LIVE")}
                    >
                        Live ({statusCounts["LIVE"] || 0})
                    </Button>
                    <Button
                        variant={statusFilter === "DRAFT" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("DRAFT")}
                    >
                        Draft ({statusCounts["DRAFT"] || 0})
                    </Button>
                    <Button
                        variant={statusFilter === "SUBMITTED_FOR_REVIEW" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("SUBMITTED_FOR_REVIEW")}
                    >
                        Under Review ({statusCounts["SUBMITTED_FOR_REVIEW"] || 0})
                    </Button>
                </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <Card key={project.id} className="card-hover overflow-hidden">
                            {/* Project Image */}
                            <div
                                className="h-40 bg-cover bg-center bg-slate-100"
                                style={{
                                    backgroundImage: project.featuredImage
                                        ? `url(${project.featuredImage})`
                                        : undefined,
                                }}
                            >
                                {!project.featuredImage && (
                                    <div className="h-full flex items-center justify-center">
                                        <Building className="h-12 w-12 text-slate-300" />
                                    </div>
                                )}
                            </div>

                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-lg line-clamp-1">
                                        {project.name}
                                    </CardTitle>
                                    {getStatusBadge(project.status)}
                                </div>
                                <CardDescription className="line-clamp-1">
                                    by {project.builderName}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>
                                            {project.locality}, {project.city}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Building className="h-4 w-4" />
                                        <span>{project.propertyType}</span>
                                    </div>
                                    <div className="font-semibold text-primary">
                                        {formatBudgetRange(project.budgetMin, project.budgetMax)}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link href={`/dashboard/projects/${project.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <FolderOpen className="h-4 w-4 mr-1" />
                                            Manage
                                        </Button>
                                    </Link>
                                    <Link href={`/project/${project.id}`} target="_blank" className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Eye className="h-4 w-4 mr-1" />
                                            Preview
                                        </Button>
                                    </Link>
                                    <Link href={`/dashboard/projects/${project.id}/edit`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-12">
                    <CardContent>
                        <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchQuery || statusFilter !== "all"
                                ? "Try adjusting your filters"
                                : "Create your first project to get started"}
                        </p>
                        {!searchQuery && statusFilter === "all" && (
                            <Link href="/dashboard/projects/new">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Project
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
