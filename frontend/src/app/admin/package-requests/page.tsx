"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    DollarSign,
    Check,
    X,
    Clock,
    Building2,
    Calendar,
    Phone,
    Mail,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PackageRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");
    const [processing, setProcessing] = useState<string | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [paymentData, setPaymentData] = useState({
        payment_mode: "",
        transaction_reference: "",
        discount: "",
        amount_paid: "",
        notes: "",
        salesperson_id: "null",
    });
    const [salespeople, setSalespeople] = useState<any[]>([]);

    useEffect(() => {
        fetchRequests();
    }, [activeTab]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const status = activeTab === "all" ? undefined : activeTab;
            const res = await adminAPI.getPaymentRequests(status);
            setRequests(res.data || []);
        } catch (error) {
            console.error("Error fetching requests:", error);
            toast.error("Failed to fetch requests");
        } finally {
            setLoading(false);
        }
    };

    const fetchSalespeople = async () => {
        try {
            const res = await adminAPI.getSalespeople();
            setSalespeople(res.data || []);
        } catch (error) {
            console.error("Error fetching salespeople:", error);
        }
    };

    const openConfirmDialog = (request: any) => {
        console.log("Opening confirm dialog for:", request.id);
        setSelectedRequest(request);
        setPaymentData({
            payment_mode: "",
            transaction_reference: "",
            discount: "",
            amount_paid: "",
            notes: "",
            salesperson_id: request.salespersonId || "null",
        });
        if (salespeople.length === 0) fetchSalespeople();
        setShowConfirmDialog(true);
    };

    const handleConfirmPayment = async () => {
        if (!paymentData.payment_mode || !paymentData.transaction_reference) {
            toast.error("Please fill in payment mode and transaction reference");
            return;
        }

        if (!selectedRequest) return;

        setProcessing(selectedRequest.id);
        try {
            await adminAPI.confirmPayment(selectedRequest.id, {
                payment_mode: paymentData.payment_mode,
                transaction_reference: paymentData.transaction_reference,
                discount: paymentData.discount ? parseFloat(paymentData.discount) : 0,
                amount_paid: paymentData.amount_paid
                    ? parseFloat(paymentData.amount_paid)
                    : null,
                notes: paymentData.notes,
                salespersonId: paymentData.salesperson_id === "null" ? null : paymentData.salesperson_id,
            });
            toast.success("Payment confirmed and package activated!");
            setShowConfirmDialog(false);
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to confirm payment");
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (requestId: string) => {
        setProcessing(requestId);
        try {
            await adminAPI.rejectPayment(requestId);
            toast.success("Request rejected");
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to reject");
        } finally {
            setProcessing(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                        Pending
                    </Badge>
                );
            case "approved":
                return (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                        Approved
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">
                        Rejected
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="font-heading text-2xl font-bold">Package Requests</h1>

            {/* Info Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-800 text-sm">
                    <strong>Payment Confirmation:</strong> Verify that payment has been
                    received offline before approving. Enter payment mode, transaction
                    reference, and amount for records.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-slate-100 p-1">
                    <TabsTrigger value="pending" className="relative gap-2">
                        Pending
                        {requests.filter((r) => r.status === "pending").length > 0 &&
                            activeTab !== "pending" && (
                                <span className="w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {requests.filter((r) => r.status === "pending").length}
                                </span>
                            )}
                    </TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-heading text-lg flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-primary" />
                                {activeTab === "all"
                                    ? "All Requests"
                                    : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                                    } Requests`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : requests.length > 0 ? (
                                <div className="space-y-4">
                                    {requests.map((req) => (
                                        <div
                                            key={req.id}
                                            className="flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors gap-4"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Building2 className="w-6 h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {req.advertiser?.companyName ||
                                                            req.advertiser_company ||
                                                            "Unknown Company"}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {req.advertiser?.ownerName ||
                                                            req.advertiser?.owner_name ||
                                                            "Unknown Owner"}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {req.advertiser?.email || req.advertiser_email}
                                                        </span>
                                                        {req.advertiser?.phone && (
                                                            <span className="flex items-center gap-1">
                                                                <Phone className="w-3 h-3" />
                                                                {req.advertiser.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {req.packageDefinition?.durationMonths || req.duration_months} Months
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(req.createdAt || req.created_at)}
                                                        </span>
                                                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                                                            <DollarSign className="w-3 h-3" />
                                                            {formatCurrency(req.packageDefinition?.price || req.price || 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {getStatusBadge(req.status)}

                                                {req.status === "pending" && (
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleReject(req.id)}
                                                            disabled={processing === req.id}
                                                        >
                                                            <X className="w-4 h-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700"
                                                            onClick={() => openConfirmDialog(req)}
                                                            disabled={processing === req.id}
                                                        >
                                                            <Check className="w-4 h-4 mr-1" />
                                                            Process Payment
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">
                                        No {activeTab === "all" ? "" : activeTab} requests
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payment Confirmation Dialog */}
                <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Confirm Payment</DialogTitle>
                            <DialogDescription>
                                {selectedRequest?.advertiser?.companyName ||
                                    selectedRequest?.advertiser_company}{" "}
                                - {selectedRequest?.packageDefinition?.durationMonths || selectedRequest?.duration_months} Month Package
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {/* Card Rate Display */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">
                                        Card Rate (Package Price)
                                    </span>
                                    <span className="font-semibold text-lg">
                                        {formatCurrency(selectedRequest?.packageDefinition?.price || selectedRequest?.price || 0)}
                                    </span>
                                </div>
                                {paymentData.discount &&
                                    parseFloat(paymentData.discount) > 0 && (
                                        <>
                                            <div className="flex justify-between items-center mt-2 text-sm">
                                                <span className="text-red-600">Discount</span>
                                                <span className="text-red-600">
                                                    -{" "}
                                                    {formatCurrency(parseFloat(paymentData.discount))}
                                                </span>
                                            </div>
                                            <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between items-center">
                                                <span className="font-medium text-slate-900">
                                                    Amount to be Paid
                                                </span>
                                                <span className="font-bold text-green-600 text-lg">
                                                    {formatCurrency(
                                                        Math.max(
                                                            0,
                                                            (selectedRequest?.packageDefinition?.price || selectedRequest?.price || 0) -
                                                            parseFloat(paymentData.discount || "0")
                                                        )
                                                    )}
                                                </span>
                                            </div>
                                        </>
                                    )}
                            </div>

                            <div className="bg-slate-50 p-3 rounded-md mb-4 border border-slate-200">
                                <Label className="text-xs text-slate-500 uppercase tracking-wide">Card Rate (Package Price)</Label>
                                <div className="text-lg font-bold text-slate-900 mt-1">
                                    {selectedRequest && formatCurrency(selectedRequest.packageDefinition.price)}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Sales Person</Label>
                                <Select
                                    value={paymentData.salesperson_id}
                                    onValueChange={(value) =>
                                        setPaymentData({ ...paymentData, salesperson_id: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select sales person" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">N/A</SelectItem>
                                        {salespeople.map((sp) => (
                                            <SelectItem key={sp.id} value={sp.id}>
                                                {sp.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Payment Mode *</Label>
                                <Select
                                    value={paymentData.payment_mode}
                                    onValueChange={(v: string) =>
                                        setPaymentData({ ...paymentData, payment_mode: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Cheque">Cheque</SelectItem>
                                        <SelectItem value="Card">Card</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Transaction Reference *</Label>
                                <Input
                                    placeholder="e.g., UTR number, cheque number"
                                    value={paymentData.transaction_reference}
                                    onChange={(e) =>
                                        setPaymentData({
                                            ...paymentData,
                                            transaction_reference: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Discount (₹)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Enter discount"
                                        value={paymentData.discount}
                                        onChange={(e) =>
                                            setPaymentData({ ...paymentData, discount: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount Paid (₹)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Actual amount received"
                                        value={paymentData.amount_paid}
                                        onChange={(e) =>
                                            setPaymentData({
                                                ...paymentData,
                                                amount_paid: e.target.value,
                                            })
                                        }
                                    />
                                    <p className="text-xs text-slate-500">
                                        Leave empty to auto-calculate
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea
                                    placeholder="Additional notes (optional)"
                                    value={paymentData.notes}
                                    onChange={(e) =>
                                        setPaymentData({ ...paymentData, notes: e.target.value })
                                    }
                                    rows={2}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirmDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmPayment}
                                disabled={!!processing}
                                className="bg-green-600 hover:bg-green-700 rounded-full"
                            >
                                {processing ? "Processing..." : "Confirm & Activate Package"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Tabs>
        </div>
    );
}
