"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
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

interface Salesperson {
    id: string;
    name: string;
    email: string;
}

export default function NewAdvertiserPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [salespeople, setSalespeople] = useState<Salesperson[]>([]);

    const [formData, setFormData] = useState({
        companyName: "",
        ownerName: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        gst: "",
        assignedSalespersonId: "unassigned",
    });

    useEffect(() => {
        const fetchSalespeople = async () => {
            try {
                const response = await adminAPI.getSalespeople();
                setSalespeople(response.data);
            } catch (error) {
                console.error("Failed to fetch salespeople", error);
            }
        };
        fetchSalespeople();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSalespersonChange = (value: string) => {
        setFormData((prev) => ({ ...prev, assignedSalespersonId: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                ...formData,
                assignedSalespersonId: formData.assignedSalespersonId === "unassigned" ? null : formData.assignedSalespersonId
            };
            await adminAPI.createAdvertiser(payload);
            toast.success("Advertiser created successfully");
            router.push("/admin/advertisers");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to create advertiser");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add New Advertiser</h1>
                    <p className="text-muted-foreground">
                        Onboard a new advertiser to the platform.
                    </p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Advertiser Details</CardTitle>
                    <CardDescription>
                        Enter the business and contact information.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
                                name="companyName"
                                placeholder="e.g. Acme Realty"
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
                                    placeholder="e.g. Alice Smith"
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
                                    placeholder="+91 98765 43210"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="contact@acmerealty.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Initial Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                name="address"
                                placeholder="Head office address..."
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
                                    placeholder="GSTIN..."
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

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    "Creating..."
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" /> Create Advertiser
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
