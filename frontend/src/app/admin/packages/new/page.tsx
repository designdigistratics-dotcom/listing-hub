"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { adminAPI } from "@/lib/api";

export default function NewPackagePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        durationMonths: "",
        price: "",
        currency: "INR",
        description: "",
        isActive: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                ...formData,
                durationMonths: parseInt(formData.durationMonths),
                price: parseFloat(formData.price),
            };
            await adminAPI.createPackageDefinition(payload);
            toast.success("Package definition created successfully");
            router.push("/admin/packages");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to create package");
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
                    <h1 className="text-2xl font-bold tracking-tight">Add New Package</h1>
                    <p className="text-muted-foreground">
                        Define a new subscription package for advertisers.
                    </p>
                </div>
            </div>

            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle>Package Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Package Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. Premium 3 Months"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="durationMonths">Duration (Months)</Label>
                                <Input
                                    id="durationMonths"
                                    name="durationMonths"
                                    type="number"
                                    placeholder="3"
                                    value={formData.durationMonths}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (INR)</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    placeholder="25000"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Details about what's included..."
                                value={formData.description}
                                onChange={handleChange}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="flex items-center space-x-2 border p-3 rounded-md">
                            <Checkbox
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked as boolean }))}
                            />
                            <label
                                htmlFor="isActive"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Active (Visible for purchase/assignment)
                            </label>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()} className="mr-2">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Creating..." : <><Save className="mr-2 h-4 w-4" /> Create Package</>}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
