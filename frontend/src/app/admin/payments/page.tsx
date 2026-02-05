"use client";

import { useEffect, useState } from "react";
import { adminAPI } from "@/lib/api";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Search,
    Filter,
    DollarSign,
    Calendar,
    User,
    CreditCard
} from "lucide-react";
import { toast } from "sonner";

interface PaymentRequest {
    id: string;
    advertiser: {
        id: string;
        companyName: string;
        email: string;
        phone: string;
    };
    packageDefinition: {
        id: string;
        name: string;
        price: number;
    };
    status: string;
    createdAt: string;
    paymentType?: string;
    pendingAmount?: number;
    paymentDueDate?: string;
    // ... potentially other fields
}

interface PendingDuePackage {
    id: string;
    advertiser: {
        id: string;
        email: string;
        companyName: string;
        phone: string;
    };
    packageDefinition: {
        name: string;
        price: number;
    };
    amountPaid: number;
    pendingAmount: number;
    paymentDueDate?: string;
    paymentType?: string;
}

export default function PaymentsPage() {
    const [activeTab, setActiveTab] = useState("pending");
    const [requests, setRequests] = useState<PaymentRequest[]>([]);
    const [pendingDues, setPendingDues] = useState<PendingDuePackage[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Settlement Modal
    const [selectedDue, setSelectedDue] = useState<PendingDuePackage | null>(null);
    const [showSettlementDialog, setShowSettlementDialog] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");

    // Form states
    const [confirmData, setConfirmData] = useState({
        paymentMode: "bank_transfer",
        transactionReference: "",
        salespersonId: "",
        paymentType: "UPFRONT", // UPFRONT, PART_PAYMENT, CREDIT
        amountPaid: "",
        discount: "",
        paymentDueDate: "",
        notes: "",
    });

    const [settlementData, setSettlementData] = useState({
        amount: "",
        paymentMode: "bank_transfer",
        transactionReference: "",
        notes: "",
    });

    const [salespeople, setSalespeople] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        fetchData();
        fetchSalespeople();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "dues") {
                const response = await adminAPI.getPendingDues();
                setPendingDues(response.data || []);
            } else {
                // Determine status filter based on tab
                let statusFilter = undefined;
                if (activeTab === "pending") statusFilter = "pending";
                if (activeTab === "approved") statusFilter = "approved";
                if (activeTab === "rejected") statusFilter = "rejected";

                const response = await adminAPI.getPaymentRequests(statusFilter);
                setRequests(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const fetchSalespeople = async () => {
        try {
            const response = await adminAPI.getSalespeople();
            setSalespeople(response.data || []);
        } catch (error) {
            console.error("Error fetching salespeople:", error);
        }
    };

    const handleConfirmRequest = (request: PaymentRequest) => {
        setSelectedRequest(request);
        setConfirmData({
            paymentMode: "bank_transfer",
            transactionReference: "",
            salespersonId: "",
            paymentType: "UPFRONT",
            amountPaid: request.packageDefinition.price.toString(),
            discount: "",
            paymentDueDate: "",
            notes: "",
        });
        setShowConfirmDialog(true);
    };

    const submitConfirmation = async () => {
        if (!selectedRequest) return;

        try {
            await adminAPI.confirmPayment(selectedRequest.id, {
                ...confirmData,
                amountPaid: parseFloat(confirmData.amountPaid) || 0,
                discount: parseFloat(confirmData.discount) || 0,
                // Calculate pending if Part Payment
                pendingAmount: confirmData.paymentType === "PART_PAYMENT"
                    ? selectedRequest.packageDefinition.price - (parseFloat(confirmData.amountPaid) || 0) - (parseFloat(confirmData.discount) || 0)
                    : 0,
            });
            toast.success("Payment confirmed successfully");
            setShowConfirmDialog(false);
            fetchData();
        } catch (error) {
            console.error("Error confirming payment:", error);
            toast.error("Failed to confirm payment");
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        if (!confirm("Are you sure you want to reject this request?")) return;

        try {
            await adminAPI.rejectPayment(requestId);
            toast.success("Request rejected");
            fetchData();
        } catch (error) {
            console.error("Error rejecting request:", error);
            toast.error("Failed to reject request");
        }
    };

    const handleRecordSettlement = (due: PendingDuePackage) => {
        setSelectedDue(due);
        setSettlementData({
            amount: due.pendingAmount.toString(),
            paymentMode: "bank_transfer",
            transactionReference: "",
            notes: "",
        });
        setShowSettlementDialog(true);
    };

    const submitSettlement = async () => {
        if (!selectedDue) return;

        try {
            await adminAPI.recordPayment(selectedDue.id, {
                ...settlementData,
                amount: parseFloat(settlementData.amount),
            });
            toast.success("Payment recorded successfully");
            setShowSettlementDialog(false);
            fetchData();
        } catch (error) {
            console.error("Error recording payment:", error);
            toast.error("Failed to record payment");
        }
    };

    const filteredRequests = requests.filter(req =>
        req.advertiser.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.advertiser.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredDues = pendingDues.filter(due =>
        due.advertiser.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold">Payments & Billing</h1>
                <p className="text-muted-foreground mt-1">
                    Manage payment requests and track pending dues.
                </p>
            </div>

            <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pending">Pending Requests</TabsTrigger>
                    <TabsTrigger value="approved">Approved History</TabsTrigger>
                    <TabsTrigger value="dues" className="flex items-center gap-2">
                        Pending Dues
                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px] rounded-full">New</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search advertisers..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* SHARED LOADING STATE */}
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* PENDING REQUESTS TAB */}
                        <TabsContent value="pending" className="mt-0">
                            <div className="grid gap-4">
                                {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                                    <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                                {req.advertiser.companyName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{req.advertiser.companyName}</h3>
                                                <p className="text-sm text-muted-foreground">{req.packageDefinition.name} • {formatCurrency(req.packageDefinition.price)}</p>
                                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Requested {formatDate(req.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="default" onClick={() => handleConfirmRequest(req)}>
                                                <CheckCircle className="w-4 h-4 mr-2" /> Confirm
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleRejectRequest(req.id)}>
                                                <XCircle className="w-4 h-4 mr-2" /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 text-muted-foreground">No pending requests found.</div>
                                )}
                            </div>
                        </TabsContent>

                        {/* APPROVED HISTORY TAB */}
                        <TabsContent value="approved" className="mt-0">
                            <div className="grid gap-4">
                                {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                                    <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{req.advertiser.companyName}</h3>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>{req.packageDefinition.name}</span>
                                                    <span>•</span>
                                                    <span>{formatCurrency(req.packageDefinition.price)}</span>
                                                    {req.paymentType && (
                                                        <Badge variant="outline" className="ml-2 text-[10px]">
                                                            {req.paymentType.replace('_', ' ')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {req.pendingAmount && req.pendingAmount > 0 ? (
                                                    <p className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Pending: {formatCurrency(req.pendingAmount)}
                                                        {req.paymentDueDate && ` • Due: ${new Date(req.paymentDueDate).toLocaleDateString()}`}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="text-right text-sm">
                                            <p className="font-medium text-green-600">Approved</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(req.createdAt)}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 text-muted-foreground">No approved requests found.</div>
                                )}
                            </div>
                        </TabsContent>

                        {/* PENDING DUES TAB (NEW) */}
                        <TabsContent value="dues" className="mt-0">
                            <div className="grid gap-4">
                                <CardDescription className="mb-4">
                                    Track and record payments for packages with outstanding balances.
                                </CardDescription>
                                {filteredDues.length > 0 ? filteredDues.map((due) => (
                                    <div key={due.id} className="flex items-center justify-between p-4 border rounded-lg bg-white border-l-4 border-l-red-500 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                                                <DollarSign className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{due.advertiser.companyName}</h3>
                                                <p className="text-sm text-muted-foreground">{due.packageDefinition.name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                                                        Due: {formatCurrency(due.pendingAmount)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Paid so far: {formatCurrency(due.amountPaid)}
                                                    </span>
                                                </div>
                                                {due.paymentDueDate && (
                                                    <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> Due by {new Date(due.paymentDueDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <Button size="sm" onClick={() => handleRecordSettlement(due)}>
                                                Record Payment
                                            </Button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 text-muted-foreground">No pending dues found. Great job!</div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="rejected" className="mt-0">
                            <div className="text-center py-12 text-muted-foreground">No rejected requests found.</div>
                        </TabsContent>
                    </>
                )}
            </Tabs>

            {/* CONFIRMATION DIALOG */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            Review payment details for {selectedRequest?.advertiser.companyName}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Card Rate & Discount Section */}
                        <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600">Card Rate (Package Price)</span>
                                <span className="font-bold text-lg">
                                    {selectedRequest && formatCurrency(selectedRequest.packageDefinition.price)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <Label className="text-red-600">Discount</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-red-600">- ₹</span>
                                    <Input
                                        className="pl-9 text-red-600 font-medium"
                                        placeholder="0"
                                        value={confirmData.discount}
                                        onChange={(e) => {
                                            const discount = e.target.value;
                                            const price = selectedRequest?.packageDefinition.price || 0;
                                            const discountVal = parseFloat(discount) || 0;
                                            setConfirmData({
                                                ...confirmData,
                                                discount,
                                                amountPaid: (price - discountVal).toString()
                                            });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                                <span className="font-bold text-slate-800">Amount to be Paid</span>
                                <span className="font-bold text-green-600 text-lg">
                                    {formatCurrency(
                                        Math.max(0, (selectedRequest?.packageDefinition.price || 0) - (parseFloat(confirmData.discount) || 0))
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Payment Mode *</Label>
                                <Select
                                    value={confirmData.paymentMode}
                                    onValueChange={(val) => setConfirmData({ ...confirmData, paymentMode: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="upi">UPI</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Transaction Reference *</Label>
                                <Input
                                    value={confirmData.transactionReference}
                                    onChange={(e) => setConfirmData({ ...confirmData, transactionReference: e.target.value })}
                                    placeholder="e.g., UTR number, cheque number"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Amount Paid (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="Actual amount received"
                                    value={confirmData.amountPaid}
                                    onChange={(e) => setConfirmData({ ...confirmData, amountPaid: e.target.value })}
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">Leave empty to auto-calculate</p>
                            </div>
                            <div>
                                <Label>Discount (₹)</Label>
                                <Input
                                    type="number"
                                    value={confirmData.discount}
                                    onChange={(e) => setConfirmData({ ...confirmData, discount: e.target.value })}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Notes</Label>
                            <Textarea
                                placeholder="Additional notes (optional)"
                                value={confirmData.notes}
                                onChange={(e) => setConfirmData({ ...confirmData, notes: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Payment Type</Label>
                                    <Select
                                        value={confirmData.paymentType}
                                        onValueChange={(val) => setConfirmData({ ...confirmData, paymentType: val })}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UPFRONT">Full Upfront</SelectItem>
                                            <SelectItem value="PART_PAYMENT">Part Payment</SelectItem>
                                            <SelectItem value="CREDIT">Credit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {confirmData.paymentType !== "UPFRONT" && (
                                    <div>
                                        <Label>Due Date</Label>
                                        <Input
                                            type="date"
                                            className="h-8"
                                            value={confirmData.paymentDueDate}
                                            onChange={(e) => setConfirmData({ ...confirmData, paymentDueDate: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                            {confirmData.paymentType === "PART_PAYMENT" && selectedRequest && (
                                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-amber-800">Pending Amount</span>
                                        <span className="font-bold text-amber-700">
                                            {formatCurrency(
                                                Math.max(0, selectedRequest.packageDefinition.price - (parseFloat(confirmData.amountPaid) || 0) - (parseFloat(confirmData.discount) || 0))
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-xs text-amber-600 mt-1">Invoice will be generated only after full payment is received.</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label>Salesperson</Label>
                            <Select
                                value={confirmData.salespersonId}
                                onValueChange={(val) => setConfirmData({ ...confirmData, salespersonId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Salesperson" />
                                </SelectTrigger>
                                <SelectContent>
                                    {salespeople.map(sp => (
                                        <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
                        <Button onClick={submitConfirmation}>Confirm Payment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* SETTLEMENT DIALOG (NEW) */}
            <Dialog open={showSettlementDialog} onOpenChange={setShowSettlementDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                        <DialogDescription>
                            Record a payment for {selectedDue?.advertiser.companyName}&apos;s pending balance.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDue && (
                        <div className="p-4 bg-slate-50 rounded-lg mb-4 text-sm">
                            <div className="flex justify-between mb-1">
                                <span className="text-muted-foreground">Total Pending:</span>
                                <span className="font-semibold text-red-600">{formatCurrency(selectedDue.pendingAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Original Price:</span>
                                <span>{formatCurrency(selectedDue.packageDefinition.price)}</span>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4">
                        <div>
                            <Label>Amount Received</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                                <Input
                                    className="pl-7"
                                    value={settlementData.amount}
                                    onChange={(e) => setSettlementData({ ...settlementData, amount: e.target.value })}
                                    placeholder="Enter amount"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Payment Mode</Label>
                            <Select
                                value={settlementData.paymentMode}
                                onValueChange={(val) => setSettlementData({ ...settlementData, paymentMode: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="upi">UPI</SelectItem>
                                    <SelectItem value="cheque">Cheque</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Reference / Notes</Label>
                            <Input
                                value={settlementData.transactionReference}
                                onChange={(e) => setSettlementData({ ...settlementData, transactionReference: e.target.value })}
                                placeholder="UTR / Notes"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSettlementDialog(false)}>Cancel</Button>
                        <Button onClick={submitSettlement}>Record Payment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
