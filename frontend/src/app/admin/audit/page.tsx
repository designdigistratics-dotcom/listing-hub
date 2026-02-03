"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminAPI } from "@/lib/api";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { toast } from "sonner";

export default function AuditLogsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const page = parseInt(searchParams.get("page") || "1");
    const actionFilter = searchParams.get("action") || "";
    const userIdFilter = searchParams.get("userId") || "";
    const limit = 50;

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter, userIdFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getAuditLogs({
                page,
                limit,
                action: actionFilter || undefined,
                userId: userIdFilter || undefined
            });
            setLogs(res.data.logs);
            setTotal(res.data.total);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load audit logs");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const action = formData.get("action") as string;
        const userId = formData.get("userId") as string;

        const params = new URLSearchParams();
        if (action) params.set("action", action);
        if (userId) params.set("userId", userId);
        params.set("page", "1");

        router.push(`/admin/audit?${params.toString()}`);
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>

            <Card>
                <CardHeader>
                    <CardTitle>System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                name="action"
                                placeholder="Filter by Action (e.g., project_created)"
                                defaultValue={actionFilter}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                name="userId"
                                placeholder="Filter by User ID"
                                defaultValue={userIdFilter}
                            />
                        </div>
                        <Button type="submit">
                            <Search className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                    </form>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            No logs found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                                {format(new Date(log.timestamp), "MMM d, HH:mm:ss")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{log.user?.name || "Unknown"}</span>
                                                    <span className="text-xs text-muted-foreground">{log.user?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">
                                                    {log.userRole}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {log.action}
                                            </TableCell>
                                            <TableCell className="max-w-[300px]">
                                                <pre className="text-[10px] bg-slate-50 p-2 rounded overflow-x-auto">
                                                    {JSON.stringify(log.details, null, 2)}
                                                </pre>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/audit?page=${page - 1}&action=${actionFilter}&userId=${userIdFilter}`)}
                            disabled={page <= 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {page} of {totalPages || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/audit?page=${page + 1}&action=${actionFilter}&userId=${userIdFilter}`)}
                            disabled={page >= totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
