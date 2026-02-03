"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import { adminAPI } from "@/lib/api";

interface Advertiser {
    id: string;
    companyName: string;
    ownerName: string;
}

interface Package {
    id: string;
    packageDefinition: {
        name: string;
    };
    state: string;
}

export default function NewProjectPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Data Loading
    const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
    const [loadingAdvertisers, setLoadingAdvertisers] = useState(true);
    const [packages, setPackages] = useState<Package[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(false);

    // Form Data
    const [selectedAdvertiserId, setSelectedAdvertiserId] = useState("");
    const [selectedPackageId, setSelectedPackageId] = useState("");
    const [basicInfo, setBasicInfo] = useState({
        name: "",
        builderName: "",
        city: "",
        locality: "",
    });

    useEffect(() => {
        const fetchAdvertisers = async () => {
            try {
                const response = await adminAPI.getAdvertisers({ status: 'active' });
                setAdvertisers(response.data);
            } catch (error) {
                console.error("Failed to fetch advertisers", error);
                toast.error("Failed to load advertisers");
            } finally {
                setLoadingAdvertisers(false);
            }
        };
        fetchAdvertisers();
    }, []);

    const handleAdvertiserChange = async (advertiserId: string) => {
        setSelectedAdvertiserId(advertiserId);
        setSelectedPackageId(""); // Reset package
        setLoadingPackages(true);
        try {
            const response = await adminAPI.getAdvertiserAvailablePackages(advertiserId);
            setPackages(response.data);
        } catch (error) {
            console.error("Failed to fetch packages", error);
            toast.error("Failed to load available packages");
        } finally {
            setLoadingPackages(false);
        }
    };

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBasicInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAdvertiserId || !selectedPackageId) {
            toast.error("Please select an advertiser and a package");
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                advertiserId: selectedAdvertiserId,
                packageId: selectedPackageId,
                ...basicInfo,
                propertyType: "apartment", // Default, editable later
                unitTypes: [], // Default
                budgetMin: 0,
                budgetMax: 0,
                possessionStatus: "ready_to_move", // Default
                description: "",
            };

            const response = await adminAPI.createProject(payload);
            toast.success("Project draft created successfully");
            router.push(`/admin/projects/${response.data.id}/edit`);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to create project");
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
                    <h1 className="text-2xl font-bold tracking-tight">Create New Project</h1>
                    <p className="text-muted-foreground">
                        Step 1: Select Advertiser & Package to initialize the project.
                    </p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Project Initialization</CardTitle>
                    <CardDescription>
                        A project must be linked to an active package purchase.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Advertiser Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="advertiser">Select Advertiser</Label>
                            <Select
                                value={selectedAdvertiserId}
                                onValueChange={handleAdvertiserChange}
                                disabled={loadingAdvertisers}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingAdvertisers ? "Loading..." : "Select an advertiser"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {advertisers.map((adv) => (
                                        <SelectItem key={adv.id} value={adv.id}>
                                            {adv.companyName} ({adv.ownerName})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Package Selection */}
                        {selectedAdvertiserId && (
                            <div className="space-y-2">
                                <Label htmlFor="package">Select Available Package</Label>
                                {loadingPackages ? (
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground p-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Fetching packages...
                                    </div>
                                ) : packages.length > 0 ? (
                                    <Select
                                        value={selectedPackageId}
                                        onValueChange={setSelectedPackageId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a package to invoke" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {packages.map((pkg) => (
                                                <SelectItem key={pkg.id} value={pkg.id}>
                                                    {pkg.packageDefinition.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="text-sm text-red-500 p-2 border border-red-200 rounded bg-red-50">
                                        No available packages found. Please add a package to this advertiser first.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Basic Info */}
                        {selectedPackageId && (
                            <div className="space-y-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Project Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. Sunrise Apartments"
                                        value={basicInfo.name}
                                        onChange={handleInfoChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="builderName">Builder Name</Label>
                                    <Input
                                        id="builderName"
                                        name="builderName"
                                        placeholder="e.g. Prestige Group"
                                        value={basicInfo.builderName}
                                        onChange={handleInfoChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            placeholder="e.g. Bangalore"
                                            value={basicInfo.city}
                                            onChange={handleInfoChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="locality">Locality</Label>
                                        <Input
                                            id="locality"
                                            name="locality"
                                            placeholder="e.g. Whitefield"
                                            value={basicInfo.locality}
                                            onChange={handleInfoChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? (
                                            "Creating Draft..."
                                        ) : (
                                            <>
                                                Next Step: Full Details <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
