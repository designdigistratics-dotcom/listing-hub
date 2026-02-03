"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function EditPackagePage() {
    const router = useRouter();
    const params = useParams();
    const packageId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        durationMonths: "",
        price: "",
        currency: "INR",
        description: "",
        isActive: true,
    });

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                const response = await adminAPI.getPackageDefinition(packageId);
                const pkg = response.data;
                setFormData({
                    name: pkg.name || "",
                    durationMonths: pkg.durationMonths?.toString() || "",
                    price: pkg.price?.toString() || "",
                    currency: pkg.currency || "INR",
                    description: pkg.description || "",
                    isActive: pkg.isActive,
                });
            } catch (error) {
                console.error("Failed to load package", error);
                toast.error("Failed to load package details");
                router.push("/admin/packages");
            } finally {
                setIsLoading(false);
            }
        };

        if (packageId) {
            fetchPackage();
        }
    }, [packageId, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const payload = {
                ...formData,
                durationMonths: parseInt(formData.durationMonths),
                price: parseFloat(formData.price),
            };
            await adminAPI.updatePackageDefinition(packageId, payload);
            toast.success("Package updated successfully");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to update package");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await adminAPI.deletePackageDefinition(packageId);
            toast.success("Package deleted successfully");
            router.push("/admin/packages");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete package. It may be in use.");
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading package details...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Package</h1>
                        <p className="text-muted-foreground">
                            Update subscription package definition.
                        </p>
                    </div>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Package
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Package?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the package definition.
                                It cannot be deleted if referenced by any existing purchases.
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
                                className="text-sm font-medium leading-none cursor-pointer"
                            >
                                Active (Visible for purchase/assignment)
                            </label>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
