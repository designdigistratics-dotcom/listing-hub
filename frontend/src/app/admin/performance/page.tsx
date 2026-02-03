"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { subDays, format } from "date-fns";
import { BarChart, Loader2, ArrowUpRight, Search } from "lucide-react";

export default function AdminPerformancePage() {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [advertisers, setAdvertisers] = useState<any[]>([]);
    const [dateRange, setDateRange] = useState({
        startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"), // Default to last 30 days
        endDate: format(new Date(), "yyyy-MM-dd"),
    });
    const [selectedAdvertiser, setSelectedAdvertiser] = useState<string>("all");
    const [selectedType, setSelectedType] = useState<string>("all");

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchStats();
    }, [dateRange, selectedAdvertiser, selectedType]);

    const fetchInitialData = async () => {
        try {
            const res = await adminAPI.getAdvertisers({ status: 'active' });
            setAdvertisers(res.data || []);
        } catch (error) {
            console.error("Error fetching advertisers:", error);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const advertiserId = selectedAdvertiser === "all" ? undefined : selectedAdvertiser;
            const type = selectedType === "all" ? undefined : selectedType;
            const res = await adminAPI.getPerformance(dateRange.startDate, dateRange.endDate, advertiserId, type);
            setStats(res.data.data || []);
        } catch (error) {
            console.error("Error fetching performance stats:", error);
            toast.error("Failed to load performance data");
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    const totalVisits = stats.reduce((sum, item) => sum + item.visits, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Global Performance Analytics</h1>
                    <p className="text-muted-foreground">
                        Track visitor engagement across all advertisers
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-2 bg-white p-2 rounded-lg border shadow-sm">
                    <div className="grid gap-1 min-w-[150px]">
                        <Label htmlFor="type" className="text-xs">Page Type</Label>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="h-8">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="landing-page">Landing Pages</SelectItem>
                                <SelectItem value="project-page">Project Pages</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1 min-w-[200px]">
                        <Label htmlFor="advertiser" className="text-xs">Filter by Advertiser</Label>
                        <Select value={selectedAdvertiser} onValueChange={setSelectedAdvertiser}>
                            <SelectTrigger className="h-8">
                                <SelectValue placeholder="All Advertisers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Advertisers</SelectItem>
                                {advertisers.map((adv) => (
                                    <SelectItem key={adv.id} value={adv.id}>
                                        {adv.companyName || adv.name || adv.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1">
                        <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                        <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                            className="h-8 w-36"
                        />
                    </div>
                    <div className="grid gap-1">
                        <Label htmlFor="endDate" className="text-xs">End Date</Label>
                        <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={dateRange.endDate}
                            onChange={handleDateChange}
                            className="h-8 w-36"
                        />
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "..." : totalVisits}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {stats.length} active pages
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                    <CardDescription>
                        Breakdown of visitors by Advertiser, Landing Page, and Project
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : stats.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No data found for the selected range.
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Advertiser</TableHead>
                                        <TableHead>Page Type</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead className="text-right">Visitors</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.map((stat, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{stat.project?.advertiser?.companyName || 'Unknown'}</span>
                                                    <span className="text-xs text-muted-foreground">{stat.project?.advertiser?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {stat.landingPage ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                        Landing Page
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        Project Page
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {stat.landingPage ? (
                                                    <div className="flex flex-col">
                                                        <span>{stat.landingPage.name}</span>
                                                        <span className="text-xs text-muted-foreground">/{stat.landingPage.slug}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm italic">Direct Project View</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{stat.project?.name}</TableCell>
                                            <TableCell className="text-right font-bold">{stat.visits}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <a
                                                        href={stat.landingPage ? `/lp/${stat.landingPage.slug}` : `/project/${stat.project?.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
