"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollText, Search, User, Calendar } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionFilter, setActionFilter] = useState("all");

    useEffect(() => {
        fetchLogs();
    }, [actionFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params: any = { limit: 200 };
            if (actionFilter !== "all") params.action = actionFilter;
            const res = await adminAPI.getAuditLogs(params);
            setLogs(res.data || []);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action: string) => {
        const colors: Record<string, string> = {
            payment_confirmed: "bg-green-100 text-green-700 hover:bg-green-100",
            payment_rejected: "bg-red-100 text-red-700 hover:bg-red-100",
            project_approved: "bg-blue-100 text-blue-700 hover:bg-blue-100",
            project_rejected: "bg-red-100 text-red-700 hover:bg-red-100",
            project_changes_requested: "bg-amber-100 text-amber-700 hover:bg-amber-100",
            project_placed: "bg-green-100 text-green-700 hover:bg-green-100",
            project_removed_from_lp: "bg-slate-100 text-slate-700 hover:bg-slate-100",
            project_auto_expired: "bg-slate-100 text-slate-600 hover:bg-slate-100",
            landing_page_created: "bg-purple-100 text-purple-700 hover:bg-purple-100",
            landing_page_updated: "bg-purple-100 text-purple-700 hover:bg-purple-100",
            lp_slots_reordered: "bg-blue-100 text-blue-700 hover:bg-blue-100",
            admin_user_created: "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
            user_role_changed: "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
            advertiser_created: "bg-primary/10 text-primary hover:bg-primary/20",
            advertiser_updated: "bg-primary/10 text-primary hover:bg-primary/20",
            project_created_by_admin: "bg-blue-100 text-blue-700 hover:bg-blue-100",
            project_updated: "bg-blue-100 text-blue-700 hover:bg-blue-100",
        };
        return (
            <Badge
                variant="secondary"
                className={colors[action] || "bg-slate-100 text-slate-600 hover:bg-slate-100"}
            >
                {action?.replace(/_/g, " ")}
            </Badge>
        );
    };

    const filteredLogs = searchTerm
        ? logs.filter(
            (log) =>
                log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                JSON.stringify(log.details)
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
        )
        : logs;

    return (
        <div className="space-y-6">
            <h1 className="font-heading text-2xl font-bold">Audit Logs</h1>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10"
                    />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-48 h-10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="payment_confirmed">Payment Confirmed</SelectItem>
                        <SelectItem value="payment_rejected">Payment Rejected</SelectItem>
                        <SelectItem value="project_approved">Project Approved</SelectItem>
                        <SelectItem value="project_rejected">Project Rejected</SelectItem>
                        <SelectItem value="project_placed">Project Placed</SelectItem>
                        <SelectItem value="project_removed_from_lp">
                            Project Removed
                        </SelectItem>
                        <SelectItem value="landing_page_created">LP Created</SelectItem>
                        <SelectItem value="admin_user_created">Admin Created</SelectItem>
                        <SelectItem value="user_role_changed">Role Changed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Logs List */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-heading text-lg flex items-center gap-2">
                        <ScrollText className="w-5 h-5 text-primary" />
                        Activity Log ({filteredLogs.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredLogs.length > 0 ? (
                        <div className="space-y-3">
                            {filteredLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors gap-3"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                            <User className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                {getActionBadge(log.action)}
                                                <span className="text-sm text-slate-500">by</span>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {log.userName || log.user_name || "System"}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    ({log.userRole || log.user_role || "system"})
                                                </span>
                                            </div>
                                            {log.details && Object.keys(log.details).length > 0 && (
                                                <div className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded mt-1 overflow-hidden text-ellipsis">
                                                    {Object.entries(log.details)
                                                        .slice(0, 3)
                                                        .map(([k, v]) => (
                                                            <span key={k} className="mr-3 inline-block">
                                                                {k}: {String(v).substring(0, 50)}
                                                            </span>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap self-end sm:self-auto">
                                        <Calendar className="w-3 h-3" />
                                        {formatDateTime(log.timestamp)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <ScrollText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">No logs found</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
