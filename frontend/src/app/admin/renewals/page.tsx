"use client";

import { useEffect, useState } from "react";
import { adminAPI } from "@/lib/api";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { CalendarDays, Mail, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RenewalItem {
    id: string; // Subscription/Package ID
    advertiserName: string;
    packageName: string;
    expiryDate: string;
    daysRemaining: number;
    status: string;
}

export default function RenewalsPage() {
    const [renewals, setRenewals] = useState<RenewalItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRenewals();
    }, []);

    const fetchRenewals = async () => {
        try {
            const response = await adminAPI.getRenewals(30); // Get next 30 days expiry
            setRenewals(response.data);
        } catch (error) {
            console.error("Error fetching renewals:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold">Renewals</h1>
                <p className="text-muted-foreground mt-1">
                    Manage upcoming package expirations and renewals
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expiring Soon (7 Days)</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {renewals.filter(r => r.daysRemaining <= 7).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{renewals.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Expirations</CardTitle>
                    <CardDescription>Packages expiring in the next 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading renewals...</div>
                    ) : renewals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <RefreshCw className="h-10 w-10 mb-4 opacity-20" />
                            <p>No packages expiring soon</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {renewals.map(item => (
                                <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white border rounded-xl hover:shadow-sm transition-shadow">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-slate-900">{item.advertiserName}</h3>
                                            <Badge variant={item.daysRemaining < 7 ? "destructive" : "outline"}>
                                                {item.daysRemaining} days left
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {item.packageName} • Expires {formatDate(item.expiryDate)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                                        <Button size="sm" variant="outline">
                                            <Mail className="h-4 w-4 mr-2" />
                                            Remind
                                        </Button>
                                        <Button size="sm">
                                            Renew
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
