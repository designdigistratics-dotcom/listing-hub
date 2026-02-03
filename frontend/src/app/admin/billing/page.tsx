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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Receipt, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface BillingEntry {
    id: string;
    invoiceNumber: string;
    advertiserName: string;
    packageName: string;
    amount: number;
    status: string;
    date: string;
    billingPeriod: string;
}

export default function BillingLedgerPage() {
    const [entries, setEntries] = useState<BillingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        // Mock data or API integration
        // adminAPI.getBillingLedger()
        fetchBillingLedger();
    }, []);

    const fetchBillingLedger = async () => {
        try {
            const response = await adminAPI.getBillingLedger();
            // Map the API response to the BillingEntry interface
            const mappedEntries = response.data.map((record: any) => ({
                id: record.id,
                invoiceNumber: record.id.substring(0, 8).toUpperCase(),
                advertiserName: record.package?.advertiser?.companyName || "Unknown",
                packageName: record.package?.packageDefinition?.name || "Unknown",
                amount: record.amount,
                status: "PAID", // Billing records are generally paid transactions
                date: record.createdAt,
                billingPeriod: record.package?.packageDefinition?.durationMonths
                    ? `${record.package.packageDefinition.durationMonths} Months`
                    : "N/A"
            }));
            setEntries(mappedEntries);
        } catch (error) {
            console.error("Error fetching billing ledger:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEntries = entries.filter((entry) =>
        entry.advertiserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold">Billing Ledger</h1>
                <p className="text-muted-foreground mt-1">
                    Track all payments and invoices across advertisers
                </p>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search invoices or advertisers..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>A list of all recent billing activities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Advertiser</TableHead>
                                <TableHead>Package</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">PDF</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        Loading ledger...
                                    </TableCell>
                                </TableRow>
                            ) : filteredEntries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No billing records found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEntries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium">{entry.invoiceNumber}</TableCell>
                                        <TableCell>{entry.advertiserName}</TableCell>
                                        <TableCell>{entry.packageName}</TableCell>
                                        <TableCell>{formatDate(entry.date)}</TableCell>
                                        <TableCell>{formatCurrency(entry.amount)}</TableCell>
                                        <TableCell>
                                            <Badge variant={entry.status === 'PAID' ? 'success' : 'secondary'}>
                                                {entry.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/invoice/${entry.id}`} target="_blank">
                                                    <Receipt className="h-4 w-4 text-slate-500" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
