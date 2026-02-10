"use client";

import { useEffect, useState } from "react";
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
import { Package, CheckCircle, Clock, AlertCircle, Plus } from "lucide-react";

interface PackageDefinition {
    id: string;
    name: string;
    description?: string;
    price: number;
    durationDays?: number; // Optional as backend sends durationMonths
    durationMonths?: number;
    features: string[];
    isActive: boolean;
}

interface PackageRequest {
    id: string;
    packageDefinition: PackageDefinition;
    status: string;
    createdAt: string;
}

interface PackagePurchase {
    id: string;
    packageDefinition: PackageDefinition;
    state: string;
    startDate: string;
    endDate: string;
    createdAt: string;
}

export default function PackagesPage() {
    const [definitions, setDefinitions] = useState<PackageDefinition[]>([]);
    const [requests, setRequests] = useState<PackageRequest[]>([]);
    const [purchases, setPurchases] = useState<PackagePurchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [requestingId, setRequestingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [defsRes, reqsRes, purchasesRes] = await Promise.all([
                advertiserAPI.getPackageDefinitions(),
                advertiserAPI.getPackageRequests(),
                advertiserAPI.getPackages(),
            ]);
            setDefinitions(defsRes.data || []);
            setRequests(reqsRes.data || []);
            setPurchases(purchasesRes.data || []);
        } catch (error) {
            console.error("Error fetching packages:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestPackage = async (packageId: string) => {
        setRequestingId(packageId);
        try {
            await advertiserAPI.createPackageRequest(packageId);
            await fetchData();
        } catch (error) {
            console.error("Error requesting package:", error);
        } finally {
            setRequestingId(null);
        }
    };

    const getStateColor = (state: string) => {
        switch (state) {
            case "ACTIVE":
                return "success";
            case "PENDING_PAYMENT":
                return "warning";
            case "EXPIRED":
                return "destructive";
            default:
                return "secondary";
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
            <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold">Packages</h1>
                <p className="text-muted-foreground mt-1">
                    Purchase packages to list your projects
                </p>
            </div>

            {/* Active Packages */}
            {purchases?.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Your Packages</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(purchases || []).map((purchase) => (
                            <Card key={purchase.id} className="card-hover-subtle">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">
                                            {purchase.packageDefinition?.name}
                                        </CardTitle>
                                        <Badge variant={getStateColor(purchase.state) as any}>
                                            {purchase.state?.replace("_", " ")}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <span className="text-muted-foreground mr-1">Valid Until</span>
                                        <span className="font-semibold">
                                            {purchase.state === "UNSTARTED" && purchase.createdAt
                                                ? (() => {
                                                    const created = new Date(purchase.createdAt);
                                                    const months = purchase.packageDefinition.durationMonths || 12;
                                                    created.setMonth(created.getMonth() + months);
                                                    return created.toLocaleDateString();
                                                })()
                                                : new Date(purchase.endDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Pending Requests */}
            {requests?.filter((r) => r.status === "pending").length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(requests || [])
                            .filter((r) => r.status === "pending")
                            .map((request) => (
                                <Card key={request.id} className="border-yellow-200 bg-yellow-50">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">
                                                {request.packageDefinition?.name}
                                            </CardTitle>
                                            <Badge variant="warning">
                                                <Clock className="h-3 w-3 mr-1" />
                                                Pending
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Requested on{" "}
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-yellow-600 mt-2">
                                            Waiting for payment confirmation
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                </div>
            )}

            {/* Available Packages */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Available Packages</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(definitions || []).map((pkg) => (
                        <Card
                            key={pkg.id}
                            className="card-hover relative overflow-hidden"
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Package className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle>{pkg.name}</CardTitle>
                                        <CardDescription>
                                            {pkg.durationMonths
                                                ? `${pkg.durationMonths} months validity`
                                                : `${pkg.durationDays || 365} days validity`}
                                        </CardDescription>
                                    </div>
                                </div>
                                {pkg.description && (
                                    <p className="text-sm text-muted-foreground mt-2">{pkg.description}</p>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-center py-4 bg-slate-50 rounded-lg">
                                    <span className="text-3xl font-bold text-primary">
                                        {formatCurrency(pkg.price)}
                                    </span>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Unlimited projects
                                    </p>
                                </div>

                                <ul className="space-y-2">
                                    {(pkg.features || []).map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className="w-full"
                                    onClick={() => handleRequestPackage(pkg.id)}
                                    loading={requestingId === pkg.id}
                                    disabled={
                                        requestingId !== null ||
                                        requests?.some(
                                            (r) =>
                                                r.packageDefinition?.id === pkg.id &&
                                                r.status === "pending"
                                        )
                                    }
                                >
                                    {requests?.some(
                                        (r) =>
                                            r.packageDefinition?.id === pkg.id &&
                                            r.status === "pending"
                                    )
                                        ? "Request Pending"
                                        : "Request Package"}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {definitions.length === 0 && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">
                                No packages available at the moment.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
