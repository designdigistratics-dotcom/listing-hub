"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { adminAPI } from "@/lib/api";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Salesperson {
    id: string;
    name: string;
    email: string;
}

export default function EditAdvertiserPage() {
    const router = useRouter();
    const params = useParams();
    const advertiserId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [salespeople, setSalespeople] = useState<Salesperson[]>([]);

    const [formData, setFormData] = useState({
        companyName: "",
        ownerName: "",
        email: "",
        phone: "",
        address: "",
        gst: "",
        assignedSalespersonId: "unassigned",
        status: "active" as string | null,
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [advRes, spRes] = await Promise.all([
                    adminAPI.getAdvertiser(advertiserId),
                    adminAPI.getSalespeople()
                ]);

                const adv = advRes.data;
                setFormData({
                    companyName: adv.companyName || "",
                    ownerName: adv.ownerName || "",
                    email: adv.email || "",
                    phone: adv.phone || "",
                    address: adv.address || "",
                    gst: adv.gst || "",
                    assignedSalespersonId: adv.assignedSalespersonId || "unassigned",
                    status: adv.status,
                });
                setSalespeople(spRes.data);
            } catch (error) {
                console.error("Failed to load data", error);
                toast.error("Failed to load advertiser details");
                router.push("/admin/advertisers");
            } finally {
                setIsLoading(false);
            }
        };

        if (advertiserId) {
            loadData();
        }
    }, [advertiserId, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSalespersonChange = (value: string) => {
        setFormData((prev) => ({ ...prev, assignedSalespersonId: value }));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                assignedSalespersonId: formData.assignedSalespersonId === "unassigned" ? null : formData.assignedSalespersonId
            };
            await adminAPI.updateAdvertiser(advertiserId, payload);
            toast.success("Advertiser updated successfully");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to update advertiser");
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            await adminAPI.toggleAdvertiserStatus(advertiserId);
            const newStatus = formData.status === "active" ? "inactive" : "active";
            setFormData(prev => ({ ...prev, status: newStatus }));
            toast.success(`Advertiser marked as ${newStatus}`);
        } catch (error: any) {
            toast.error("Failed to toggle status");
        }
    };

    const handleDelete = async () => {
        try {
            await adminAPI.deleteAdvertiser(advertiserId);
            toast.success("Advertiser deleted");
            router.push("/admin/advertisers");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete advertiser");
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading advertiser details...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Advertiser</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span>{formData.companyName}</span>
                            <Badge variant={formData.status === "active" ? "default" : "destructive"}>
                                {formData.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleToggleStatus}
                        className={formData.status === "active" ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600"}
                    >
                        <Power className="mr-2 h-4 w-4" />
                        {formData.status === "active" ? "Deactivate" : "Activate"}
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Advertiser?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will verify if they have active packages or projects.
                                    If distinct data exists, deletion may be blocked.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                    Confirm Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="packages">Packages</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>Business Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input
                                        id="companyName"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ownerName">Owner Name</Label>
                                        <Input
                                            id="ownerName"
                                            name="ownerName"
                                            value={formData.ownerName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="gst">GST Number (Optional)</Label>
                                        <Input
                                            id="gst"
                                            name="gst"
                                            value={formData.gst}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="salesperson">Assigned Salesperson</Label>
                                        <Select
                                            value={formData.assignedSalespersonId}
                                            onValueChange={handleSalespersonChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Assign a salesperson" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                                                {salespeople.map((sp) => (
                                                    <SelectItem key={sp.id} value={sp.id}>
                                                        {sp.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="packages">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Packages</CardTitle>
                            <CardDescription>View actively purchased packages for this advertiser.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-32 items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                                Package history list will appear here
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="projects">
                    <Card>
                        <CardHeader>
                            <CardTitle>Projects</CardTitle>
                            <CardDescription>Manage real estate projects for this advertiser.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-32 items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                                Project list will appear here
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing History</CardTitle>
                            <CardDescription>Invoices and payment history.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-32 items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                                Billing ledger will appear here
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
