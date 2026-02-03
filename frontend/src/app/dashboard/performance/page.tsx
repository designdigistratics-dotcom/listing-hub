"use client";

import { useState, useEffect } from "react";
import { analyticsAPI } from "@/lib/api";
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
import { toast } from "sonner";
import { subDays, format } from "date-fns";
import { BarChart, Calendar, Loader2, ArrowUpRight } from "lucide-react";

export default function PerformancePage() {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"), // Default to last 30 days
        endDate: format(new Date(), "yyyy-MM-dd"),
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await analyticsAPI.getPerformance(dateRange.startDate, dateRange.endDate);
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

    const handleApplyFilter = () => {
        fetchStats();
    };

    const totalVisits = stats.reduce((sum, item) => sum + item.visits, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Performance Analytics</h1>
                    <p className="text-muted-foreground">
                        Track visitor engagement on your landing pages
                    </p>
                </div>

                <div className="flex items-end gap-2 bg-white p-2 rounded-lg border shadow-sm">
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
                    <Button size="sm" onClick={handleApplyFilter} disabled={loading} className="h-8">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </Button>
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
                            Across {stats.length} active landing page placements
                        </p>
                    </CardContent>
                </Card>
                {/* Additional cards could go here */}
            </div>

            {/* Detailed Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                    <CardDescription>
                        Breakdown of visitors by Landing Page and Project
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : stats.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No data found for the selected date range.
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Landing Page</TableHead>
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
                                                    <span>{stat.landingPage?.name}</span>
                                                    <span className="text-xs text-muted-foreground">/{stat.landingPage?.slug}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{stat.project?.name}</TableCell>
                                            <TableCell className="text-right font-bold">{stat.visits}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <a href={`/lp/${stat.landingPage?.slug}`} target="_blank" rel="noopener noreferrer">
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
