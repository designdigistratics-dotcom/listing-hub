"use client";

import { useEffect, useState } from "react";
import { advertiserAPI } from "@/lib/api";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    Download,
    CreditCard,
    Package as PackageIcon,
    AlertCircle,
    CheckCircle,
    Clock,
    FileText,
    ArrowUpRight,
    Loader2
} from "lucide-react";
import { toast } from "sonner";

interface BillingRecord {
    id: string;
    type: string;
    amount: number;
    description: string;
    invoiceNumber?: string;
    createdAt: string;
}

interface PackageDefinition {
    id: string;
    name: string;
    price: number;
    durationMonths?: number;
    isActive: boolean;
}

interface PackagePurchase {
    id: string;
    packageDefinition: PackageDefinition;
    state: string; // UNSTARTED, ACTIVE, EXPIRED, PENDING_PAYMENT
    amountPaid?: number;
    pendingAmount?: number;
    paymentType?: string; // 'UPFRONT', 'PART_PAYMENT', 'CREDIT'
    paymentDueDate?: string;
    startDate?: string;
    endDate: string;
    createdAt: string;
    billingRecords?: BillingRecord[];
}

export default function BillingPage() {
    const [packages, setPackages] = useState<PackagePurchase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                // We use getPackages because it now includes billingRecords via backend modification
                const response = await advertiserAPI.getPackages();
                setPackages(response.data || []);
            } catch (error) {
                console.error("Error fetching packages for billing:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);



    const getStatusColor = (state: string) => {
        switch (state) {
            case "ACTIVE": return "success"; // green
            case "UNSTARTED": return "secondary"; // gray
            case "EXPIRED": return "destructive"; // red
            case "PENDING_PAYMENT": return "warning"; // yellow
            default: return "outline";
        }
    };

    const getPaymentBadge = (pkg: PackagePurchase) => {
        // Decide badge based on payment status
        if (pkg.paymentType === 'CREDIT') return <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">Credit</Badge>;
        if (pkg.paymentType === 'PART_PAYMENT') return <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">Part Payment</Badge>;
        if (pkg.pendingAmount && pkg.pendingAmount > 0) return <Badge variant="destructive">Pending Due</Badge>;
        return <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Paid</Badge>;
    };

    const calculateValidity = (pkg: PackagePurchase) => {
        if (pkg.state === "UNSTARTED") {
            // Logic: CreatedAt + Duration
            const created = new Date(pkg.createdAt);
            const months = pkg.packageDefinition.durationMonths || 12;
            created.setMonth(created.getMonth() + months);
            return `Valid until ${created.toLocaleDateString()} `;
        }
        if (pkg.state === "ACTIVE") {
            return `Expires on ${new Date(pkg.endDate).toLocaleDateString()} `;
        }
        if (pkg.state === "EXPIRED") {
            return `Expired on ${new Date(pkg.endDate).toLocaleDateString()} `;
        }
        return "N/A";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold">Billing & Invoices</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your packages, payments, and invoices.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Purchased Packages</CardTitle>
                    <CardDescription>All your package subscriptions and payment history</CardDescription>
                </CardHeader>
                <CardContent>
                    {packages.length > 0 ? (
                        <div className="space-y-6">
                            {/* Desktop Header */}
                            <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                                <div className="col-span-3">Package</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-2">Payment</div>
                                <div className="col-span-1 text-right">Amount</div>
                                <div className="col-span-2 text-right">Invoice</div>
                            </div>

                            {/* Rows */}
                            {packages.map((pkg) => {
                                const invoiceRecord = pkg.billingRecords?.find(r => r.invoiceNumber) || pkg.billingRecords?.[0];
                                const hasPending = pkg.pendingAmount && pkg.pendingAmount > 0;
                                const totalAmount = (pkg.amountPaid || 0) + (pkg.pendingAmount || 0);

                                return (
                                    <div key={pkg.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4 border-b last:border-0 hover:bg-slate-50 transition-colors items-center">
                                        {/* Package Info */}
                                        <div className="col-span-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <PackageIcon className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{pkg.packageDefinition.name}</p>
                                                    <p className="text-xs text-muted-foreground md:hidden block mt-1">
                                                        {formatDate(pkg.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="col-span-2 hidden md:block text-sm">
                                            <p>{formatDate(pkg.createdAt)}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Purchased</p>
                                        </div>

                                        {/* Status & Validity */}
                                        <div className="col-span-2">
                                            <Badge variant={getStatusColor(pkg.state) as any} className="mb-1">
                                                {pkg.state.replace('_', ' ')}
                                            </Badge>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <Clock className="h-3 w-3" />
                                                {calculateValidity(pkg)}
                                            </div>
                                        </div>

                                        {/* Payment Status */}
                                        <div className="col-span-2">
                                            <div className="flex flex-col items-start gap-1">
                                                {getPaymentBadge(pkg)}
                                                {hasPending && (
                                                    <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        Due: {formatCurrency(pkg.pendingAmount || 0)}
                                                    </span>
                                                )}
                                                {pkg.paymentDueDate && hasPending && (
                                                    <span className="text-xs text-muted-foreground">
                                                        By {new Date(pkg.paymentDueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div className="col-span-1 md:text-right font-medium">
                                            {formatCurrency(totalAmount > 0 ? totalAmount : (pkg.packageDefinition.price || 0))}
                                        </div>

                                        {/* Action / Invoice */}
                                        <div className="col-span-2 flex justify-end gap-2">
                                            {hasPending ? (
                                                <Button size="sm" variant="default" className="w-full md:w-auto bg-red-600 hover:bg-red-700">
                                                    Pay Pending
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full md:w-auto"
                                                    disabled={!invoiceRecord}
                                                    asChild={!!invoiceRecord}
                                                >
                                                    {invoiceRecord ? (
                                                        <a href={`/dashboard/invoices/${invoiceRecord.id}`} target="_blank" rel="noopener noreferrer">
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            View Invoice
                                                        </a>
                                                    ) : (
                                                        <span>
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            Invoice
                                                        </span>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No Packages Found</h3>
                            <p className="text-muted-foreground">
                                You haven&apos;t purchased any packages yet.
                            </p>
                            <Button className="mt-4" variant="outline" onClick={() => window.location.href = '/dashboard/packages'}>
                                View Packages <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
