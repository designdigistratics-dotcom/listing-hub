"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { adminAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatDate, formatCurrency, getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";
import {
    Building,
    ArrowLeft,
    Edit,
    Key,
    Power,
    Trash2,
    Mail,
    Phone,
    Calendar,
    Package,
    FolderOpen,
    Users,
    FileText,
    Receipt,
    StickyNote,
    MapPin,
    Building2,
    IndianRupee,
    Eye,
    User,
    Plus,
    Filter,
} from "lucide-react";

interface Advertiser {
    id: string;
    email: string;
    companyName: string;
    ownerName?: string;
    phone?: string;
    address?: string;
    gst?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    salesperson?: {
        id: string;
        name: string;
        email: string;
    };
    leadFilters?: {
        location?: string[];
        budgetRange?: { min?: number; max?: number };
        projectType?: string[];
        propertyType?: string[];
        unitType?: string[];
    };
    maxLeadsPerDay?: number;
}

interface PackagePurchase {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    liveDate?: string;
    totalCredits: number;
    usedCredits: number;
    price: number;
    packageDefinition: {
        name: string;
        duration: number;
    };
}

interface Project {
    id: string;
    name: string;
    builderName: string;
    city: string;
    locality: string;
    status: string;
    budgetMin: number;
    budgetMax: number;
    featuredImage?: string;
    slug?: string;
    expiryDate?: string;
    landingPages?: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
    placements?: Array<{
        landingPage: {
            name: string;
        };
    }>;
}

interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string;
    createdAt: string;
    propertyType?: string;
    city?: string;
    unitType?: string;
    location?: string;
    budget?: string;
    project: {
        name: string;
    };
    landingPage?: {
        name: string;
    };
}

interface BillingItem {
    id: string;
    invoiceNumber?: string;
    amount: number;
    status?: string;
    createdAt: string;
    dueDate?: string;
    paymentMode?: string;
    transactionReference?: string;
    package?: {
        packageDefinition?: {
            name: string;
        };
    };
}

interface InternalNote {
    id: string;
    content: string;
    priority: "low" | "normal" | "high";
    createdAt: string;
    createdBy?: {
        name: string;
        email: string;
    };
}

interface PackageDefinition {
    id: string;
    name: string;
    price: number;
    durationMonths: number;
}

interface Salesperson {
    id: string;
    name: string;
    email: string;
}

export default function AdvertiserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [advertiser, setAdvertiser] = useState<Advertiser | null>(null);
    const [packages, setPackages] = useState<PackagePurchase[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [billing, setBilling] = useState<BillingItem[]>([]);
    const [notes, setNotes] = useState<InternalNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("profile");

    // Add Package Data
    const [packageDefinitions, setPackageDefinitions] = useState<PackageDefinition[]>([]);
    const [salespeople, setSalespeople] = useState<Salesperson[]>([]);

    // Dialog states
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAddPackageModal, setShowAddPackageModal] = useState(false);

    // Options State
    const [cityOptions, setCityOptions] = useState<{ label: string; value: string }[]>([]);
    const [propTypeOptions, setPropTypeOptions] = useState<{ label: string; value: string }[]>([]);
    const [projTypeOptions, setProjTypeOptions] = useState<{ label: string; value: string }[]>([]);
    const [unitTypeOptions, setUnitTypeOptions] = useState<{ label: string; value: string }[]>([]);

    // Lead Filters State
    const [leadFilters, setLeadFilters] = useState<{
        location: string[];
        budgetRange: { min: string; max: string };
        projectType: string[];
        propertyType: string[];
        unitType: string[];
    }>({
        location: [],
        budgetRange: { min: "", max: "" },
        projectType: [],
        propertyType: [],
        unitType: []
    });
    const [maxLeadsPerDay, setMaxLeadsPerDay] = useState<string>("");

    // Update state when advertiser data loads
    useEffect(() => {
        if (advertiser) {
            if (advertiser.leadFilters) {
                setLeadFilters({
                    location: advertiser.leadFilters.location || [],
                    budgetRange: {
                        min: advertiser.leadFilters.budgetRange?.min?.toString() || "",
                        max: advertiser.leadFilters.budgetRange?.max?.toString() || ""
                    },
                    projectType: advertiser.leadFilters.projectType || [],
                    propertyType: advertiser.leadFilters.propertyType || [],
                    unitType: advertiser.leadFilters.unitType || []
                });
            }
            setMaxLeadsPerDay(advertiser.maxLeadsPerDay?.toString() || "");
        }
    }, [advertiser]);

    const handleSaveFilters = async () => {
        try {
            setActionLoading(true);
            const payload = {
                maxLeadsPerDay: maxLeadsPerDay ? parseInt(maxLeadsPerDay) : 0,
                leadFilters: {
                    location: leadFilters.location,
                    projectType: leadFilters.projectType,
                    propertyType: leadFilters.propertyType,
                    unitType: leadFilters.unitType,
                    budgetRange: {
                        min: leadFilters.budgetRange.min ? parseFloat(leadFilters.budgetRange.min) : undefined,
                        max: leadFilters.budgetRange.max ? parseFloat(leadFilters.budgetRange.max) : undefined
                    }
                }
            };

            await adminAPI.updateUser(id, payload);
            toast.success("Lead filters updated");
            fetchAdvertiserData();
        } catch (error) {
            toast.error("Failed to update filters");
        } finally {
            setActionLoading(false);
        }
    };



    // Form States
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // New Note State
    const [newNote, setNewNote] = useState("");
    const [notePriority, setNotePriority] = useState<"low" | "normal" | "high">("normal");
    const [addingNote, setAddingNote] = useState(false);

    // Add Package State
    const [addPackageData, setAddPackageData] = useState({
        packageDefinitionId: "",
        paymentMode: "bank_transfer",
        transactionReference: "",
        salespersonId: "none",
        amountPaid: "",
        notes: "",
        isActive: true
    });

    // Import State
    const [importLeads, setImportLeads] = useState<any[]>([]);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState("");

    useEffect(() => {
        if (id) {
            fetchAdvertiserData();
        }
    }, [id]);

    const fetchAdvertiserData = async () => {
        try {
            setLoading(true);

            // Fetch advertiser first
            const advRes = await adminAPI.getAdvertiser(id);
            setAdvertiser(advRes.data);

            // Fetch related data in parallel
            const [
                pkgRes,
                projRes,
                leadRes,
                billRes,
                noteRes,
                pkgDefRes,
                salesRes,
                cityRes,
                propRes,
                projTypeRes,
                unitRes
            ] = await Promise.allSettled([
                adminAPI.getAdvertiserPackages(id),
                adminAPI.getAdvertiserProjects(id),
                adminAPI.getAdvertiserLeads(id),
                adminAPI.getAdvertiserBilling(id),
                adminAPI.getAdvertiserNotes(id),
                adminAPI.getPackageDefinitions(false),
                adminAPI.getSalespeople(),
                adminAPI.getOptions('city'),
                adminAPI.getOptions('property_type'),
                adminAPI.getOptions('project_type'),
                adminAPI.getOptions('unit_type')
            ]);

            if (pkgRes.status === 'fulfilled') setPackages(pkgRes.value.data || []);
            if (projRes.status === 'fulfilled') setProjects(projRes.value.data || []);
            if (leadRes.status === 'fulfilled') setLeads(leadRes.value.data || []);
            if (billRes.status === 'fulfilled') setBilling(billRes.value.data || []);
            if (noteRes.status === 'fulfilled') setNotes(noteRes.value.data || []);
            if (pkgDefRes.status === 'fulfilled') setPackageDefinitions(pkgDefRes.value.data || []);
            if (salesRes.status === 'fulfilled') setSalespeople(salesRes.value.data || []);

            // Handle Options
            if (cityRes.status === 'fulfilled') setCityOptions(cityRes.value.data.map((o: any) => ({ label: o.label, value: o.value })));
            if (propRes.status === 'fulfilled') setPropTypeOptions(propRes.value.data.map((o: any) => ({ label: o.label, value: o.value })));
            if (projTypeRes.status === 'fulfilled') setProjTypeOptions(projTypeRes.value.data.map((o: any) => ({ label: o.label, value: o.value })));
            if (unitRes.status === 'fulfilled') setUnitTypeOptions(unitRes.value.data.map((o: any) => ({ label: o.label, value: o.value })));

        } catch (error) {
            console.error("Error fetching advertiser data:", error);
            toast.error("Failed to load advertiser details");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!advertiser) return;
        try {
            setActionLoading(true);
            await adminAPI.toggleAdvertiserStatus(id);
            toast.success(`Advertiser ${advertiser.status === "active" ? "deactivated" : "activated"}`);
            fetchAdvertiserData();
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setActionLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            setActionLoading(true);
            await adminAPI.changeAdvertiserPassword(id, newPassword);
            toast.success("Password changed successfully");
            setShowPasswordDialog(false);
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            toast.error("Failed to change password");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setActionLoading(true);
            await adminAPI.deleteAdvertiser(id);
            toast.success("Advertiser deleted");
            router.push("/admin/advertisers");
        } catch (error) {
            toast.error("Failed to delete advertiser");
        } finally {
            setActionLoading(false);
            setShowDeleteDialog(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) {
            toast.error("Please enter a note");
            return;
        }
        setAddingNote(true);
        try {
            await adminAPI.addAdvertiserNote(id, {
                content: newNote,
                priority: notePriority,
            });
            toast.success("Note added");
            setNewNote("");
            setNotePriority("normal");
            // Refresh notes
            const res = await adminAPI.getAdvertiserNotes(id);
            setNotes(res.data);
        } catch (error) {
            toast.error("Failed to add note");
        } finally {
            setAddingNote(false);
        }
    };

    const handleAddPackage = async () => {
        if (!addPackageData.packageDefinitionId) {
            toast.error("Please select a package");
            return;
        }
        setActionLoading(true);
        try {
            const payload = {
                ...addPackageData,
                amountPaid: parseFloat(addPackageData.amountPaid) || 0,
                salespersonId: addPackageData.salespersonId === "none" ? null : addPackageData.salespersonId
            };

            await adminAPI.addPackageToAdvertiser(id, payload);
            toast.success("Package added successfully");
            setShowAddPackageModal(false);
            // Reset form
            setAddPackageData({
                packageDefinitionId: "",
                paymentMode: "bank_transfer",
                transactionReference: "",
                salespersonId: "none",
                amountPaid: "",
                notes: "",
                isActive: true
            });
            // Refresh data
            fetchAdvertiserData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to add package");
        } finally {
            setActionLoading(false);
        }
    };

    // Auto-fill price when package selected
    const handlePackageSelect = (pkgId: string) => {
        const pkg = packageDefinitions.find(p => p.id === pkgId);
        setAddPackageData(prev => ({
            ...prev,
            packageDefinitionId: pkgId,
            amountPaid: pkg ? pkg.price.toString() : ""
        }));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event: any) => {
            try {
                const text = event.target.result;
                const rows = text.split(/\r?\n/).filter((line: string) => line.trim());
                if (rows.length < 2) {
                    toast.error("CSV must have a header row and data");
                    return;
                }

                const headers = rows[0].split(",").map((h: string) => h.trim().toLowerCase().replace(/[\s_]/g, ""));

                // Required fields for servicing leads
                const requiredFields = ["name", "phone", "propertytype", "unittype", "city", "location", "budget"];
                const missingFields = requiredFields.filter(field => !headers.includes(field));

                if (missingFields.length > 0) {
                    toast.error(`Missing required fields: ${missingFields.join(", ")}. Please add these columns to your CSV.`);
                    return;
                }

                // Helper functions for validation
                const isValidPhone = (phone: string) => /^[0-9]{10}$/.test(phone.replace(/[\s\-\+\(\)]/g, "").slice(-10));
                const isValidEmail = (email: string) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

                const validationErrors: string[] = [];

                const parsedLeads = rows.slice(1).map((row: string, rowIndex: number) => {
                    const values = row.split(",").map((v: string) => v.trim());
                    const lead: any = {};
                    headers.forEach((header: string, i: number) => {
                        let key = header;
                        // Map CSV headers to Lead field names
                        if (header === "propertytype") key = "propertyType";
                        if (header === "unittype") key = "unitType";
                        if (header === "projecttype") key = "projectType";
                        if (header === "city") key = "city";
                        if (header === "location") key = "location";
                        if (header === "budget") key = "budget";
                        if (header === "date") key = "date";

                        lead[key] = values[i] || "";
                    });

                    // Validate phone number
                    if (lead.phone && !isValidPhone(lead.phone)) {
                        validationErrors.push(`Row ${rowIndex + 2}: Invalid phone number "${lead.phone}" (must be 10 digits)`);
                    }

                    // Validate email if provided
                    if (lead.email && !isValidEmail(lead.email)) {
                        validationErrors.push(`Row ${rowIndex + 2}: Invalid email format "${lead.email}"`);
                    }

                    // Check required fields have values
                    if (!lead.name || lead.name.trim() === "") {
                        validationErrors.push(`Row ${rowIndex + 2}: Name is required`);
                    }
                    if (!lead.phone || lead.phone.trim() === "") {
                        validationErrors.push(`Row ${rowIndex + 2}: Phone is required`);
                    }

                    return lead;
                }).filter((l: any) => {
                    return Object.values(l).some(v => v && String(v).trim() !== "");
                });

                // Show first 5 validation errors if any
                if (validationErrors.length > 0) {
                    const errorsToShow = validationErrors.slice(0, 5);
                    const moreErrors = validationErrors.length > 5 ? `\n...and ${validationErrors.length - 5} more errors` : "";
                    toast.error(`Validation errors:\n${errorsToShow.join("\n")}${moreErrors}`);
                    return;
                }

                if (parsedLeads.length === 0) {
                    toast.error("No valid leads found in CSV");
                    return;
                }

                setImportLeads(parsedLeads);
                setSelectedProjectId(projects[0]?.id || "");
                setShowImportDialog(true);
            } catch (err) {
                toast.error("Failed to parse CSV file");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    const handleConfirmImport = async () => {
        if (!selectedProjectId) {
            toast.error("Please select a project");
            return;
        }

        setActionLoading(true);
        try {
            const response = await adminAPI.uploadLeads({
                leads: importLeads,
                projectId: selectedProjectId,
                assignedToId: id
            });
            toast.success(`Successfully uploaded and assigned ${response.data.success} leads`);
            setShowImportDialog(false);
            setImportLeads([]);
            fetchAdvertiserData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to upload leads");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!advertiser) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold">Advertiser not found</h2>
                <Link href="/admin/advertisers">
                    <Button className="mt-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Advertisers
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/advertisers">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-heading font-bold">
                            Advertiser Details
                        </h1>
                        <p className="text-muted-foreground">{advertiser.companyName}</p>
                    </div>
                </div>
                <Badge variant={advertiser.status === "active" ? "success" : "secondary"}>
                    {advertiser.status}
                </Badge>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
                <Link href={`/admin/advertisers/${id}/edit`}>
                    <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        EditDetails
                    </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => setShowPasswordDialog(true)}>
                    <Key className="h-4 w-4 mr-2" />
                    Password
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={actionLoading}
                >
                    <Power className="h-4 w-4 mr-2" />
                    {advertiser.status === "active" ? "Deactivate" : "Activate"}
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="leads" className="gap-2">
                        <Users className="h-4 w-4" />
                        Leads ({leads.length})
                    </TabsTrigger>
                    <TabsTrigger value="filters" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Lead Filters
                    </TabsTrigger>
                    <TabsTrigger value="packages" className="gap-2">
                        <Package className="h-4 w-4" />
                        Packages ({packages.length})
                    </TabsTrigger>
                    <TabsTrigger value="projects" className="gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Projects ({projects.length})
                    </TabsTrigger>
                    <TabsTrigger value="leads" className="gap-2">
                        <Users className="h-4 w-4" />
                        Leads ({leads.filter(l => l.landingPage).length})
                    </TabsTrigger>
                    <TabsTrigger value="servicing" className="gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Servicing Leads ({leads.filter(l => !l.landingPage).length})
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="gap-2">
                        <Receipt className="h-4 w-4" />
                        Billing ({billing.length})
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="gap-2">
                        <StickyNote className="h-4 w-4" />
                        Notes ({notes.length})
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Company Name</p>
                                    <p className="font-medium">{advertiser.companyName || "-"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Owner Name</p>
                                    <p className="font-medium">{advertiser.ownerName || "-"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p className="font-medium">
                                        {advertiser.email ? (
                                            <a href={`mailto:${advertiser.email}`} className="text-primary hover:underline">
                                                {advertiser.email}
                                            </a>
                                        ) : "-"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                    <p className="font-medium">
                                        {advertiser.phone ? (
                                            <a href={`tel:${advertiser.phone}`} className="text-primary hover:underline">
                                                {advertiser.phone}
                                            </a>
                                        ) : "-"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                                    <p className="font-medium">{advertiser.address || "-"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">GST</p>
                                    <p className="font-medium">{advertiser.gst || "-"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge variant={advertiser.status === "active" ? "success" : "secondary"}>
                                        {advertiser.status}
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Assigned Salesperson</p>
                                    <p className="font-medium">{advertiser.salesperson?.name || "-"}</p>
                                </div>
                                <div className="sm:col-span-2 pt-4 border-t mt-2">
                                    <p className="text-sm text-muted-foreground">
                                        Created: {formatDate(advertiser.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Packages Tab */}
                <TabsContent value="filters" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lead Distribution Filters</CardTitle>
                            <CardDescription>
                                Configure which Leads from the common pool are eligible for this advertiser.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Max Leads Per Day (0 for unlimited)</Label>
                                    <Input
                                        type="number"
                                        value={maxLeadsPerDay}
                                        onChange={(e) => setMaxLeadsPerDay(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Budget Range (Min - Max)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={leadFilters.budgetRange.min}
                                            onChange={(e) => setLeadFilters(prev => ({ ...prev, budgetRange: { ...prev.budgetRange, min: e.target.value } }))}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={leadFilters.budgetRange.max}
                                            onChange={(e) => setLeadFilters(prev => ({ ...prev, budgetRange: { ...prev.budgetRange, max: e.target.value } }))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label>Target Cities</Label>
                                    <MultiSelect
                                        options={cityOptions}
                                        selected={leadFilters.location}
                                        onChange={(values) => setLeadFilters(prev => ({ ...prev, location: values }))}
                                        placeholder="Select cities..."
                                    />
                                    <p className="text-xs text-muted-foreground">Leads from these cities will be distributed.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Property Types</Label>
                                    <MultiSelect
                                        options={propTypeOptions}
                                        selected={leadFilters.propertyType}
                                        onChange={(values) => setLeadFilters(prev => ({ ...prev, propertyType: values }))}
                                        placeholder="Select property types..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Unit Types</Label>
                                    <MultiSelect
                                        options={unitTypeOptions}
                                        selected={leadFilters.unitType}
                                        onChange={(values) => setLeadFilters(prev => ({ ...prev, unitType: values }))}
                                        placeholder="Select unit types..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Project Types</Label>
                                    <MultiSelect
                                        options={projTypeOptions}
                                        selected={leadFilters.projectType}
                                        onChange={(values) => setLeadFilters(prev => ({ ...prev, projectType: values }))}
                                        placeholder="Select project types..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={handleSaveFilters} disabled={loading}>
                                    Save Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="packages" className="mt-6">
                    <Card className="mb-6">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle>Package History</CardTitle>
                                <CardDescription>View and manage advertiser packages</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setShowAddPackageModal(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Package
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {packages.length > 0 ? (
                                <div className="grid gap-4">
                                    {packages.map((pkg) => {
                                        const isExpiring = pkg.endDate &&
                                            new Date(pkg.endDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 &&
                                            new Date(pkg.endDate).getTime() > Date.now();

                                        return (
                                            <div key={pkg.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <Package className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{pkg.packageDefinition.name}</p>
                                                        <div className="text-sm text-muted-foreground space-y-0.5">
                                                            {pkg.liveDate && (
                                                                <p>
                                                                    <span className="font-medium text-green-600">Live:</span> {formatDate(pkg.liveDate)}
                                                                </p>
                                                            )}
                                                            <p>
                                                                <span className="font-medium">Expires:</span> {formatDate(pkg.endDate)}
                                                                {isExpiring && (
                                                                    <Badge variant="destructive" className="ml-2 text-xs">
                                                                        Expiring Soon
                                                                    </Badge>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant={pkg.status === "active" ? "success" : "secondary"}>
                                                        {pkg.status}
                                                    </Badge>
                                                    <p className="text-sm mt-1">
                                                        {pkg.usedCredits}/{pkg.totalCredits} credits used
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No packages purchased yet
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Projects, Leads, Billing Tabs - Kept simple for brevity, assumed unchanged in functionality but rendered */}
                <TabsContent value="projects" className="mt-6">
                    {projects.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projects.map((project) => (
                                <Card key={project.id} className="overflow-hidden">
                                    <div className="h-32 bg-slate-100 relative">
                                        {project.featuredImage ? (
                                            <img
                                                src={getImageUrl(project.featuredImage)}
                                                alt={project.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Building2 className="h-12 w-12 text-slate-300" />
                                            </div>
                                        )}
                                        <Badge
                                            className="absolute top-2 right-2"
                                            variant={project.status === "LIVE" ? "success" : "secondary"}
                                        >
                                            {project.status.toLowerCase()}
                                        </Badge>
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold line-clamp-1">{project.name}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            {project.locality}, {project.city}
                                        </p>

                                        {/* Landing Page Links */}
                                        {project.landingPages && project.landingPages.length > 0 ? (
                                            <div className="mt-2">
                                                <p className="text-xs text-muted-foreground mb-1">Landing Pages:</p>
                                                {project.landingPages.map((lp) => (
                                                    <a
                                                        key={lp.id}
                                                        href={`/lp/${lp.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary hover:underline flex items-center gap-1 mb-0.5"
                                                    >
                                                        {lp.name}
                                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                ))}
                                            </div>
                                        ) : project.placements?.[0] ? (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                LP: {project.placements[0].landingPage.name}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                No landing page assigned
                                            </p>
                                        )}

                                        {/* Expiry Date */}
                                        {project.expiryDate && (
                                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span className="font-medium">Expires:</span> {formatDate(project.expiryDate)}
                                                {new Date(project.expiryDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 &&
                                                    new Date(project.expiryDate).getTime() > Date.now() && (
                                                        <Badge variant="destructive" className="ml-1 text-xs py-0 px-1">
                                                            Soon
                                                        </Badge>
                                                    )}
                                            </p>
                                        )}

                                        <Link href={`/admin/projects/${project.id}`}>
                                            <Button variant="outline" size="sm" className="w-full mt-3">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border rounded-lg">
                            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">No projects created yet</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="leads" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle>Landing Page Leads</CardTitle>
                                <CardDescription>Leads captured through landing page forms</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {leads.filter(l => l.landingPage).length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b">
                                            <tr>
                                                <th className="text-left p-4 font-medium">Lead</th>
                                                <th className="text-left p-4 font-medium">Contact</th>
                                                <th className="text-left p-4 font-medium">Landing Page</th>
                                                <th className="text-left p-4 font-medium">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leads.filter(l => l.landingPage).map((lead) => (
                                                <tr key={lead.id} className="border-b hover:bg-slate-50">
                                                    <td className="p-4"><p className="font-medium">{lead.name}</p></td>
                                                    <td className="p-4 text-sm">
                                                        <div className="space-y-1">
                                                            <p>{lead.phone}</p>
                                                            <p className="text-muted-foreground">{lead.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm">
                                                        <p className="font-medium">{lead.landingPage?.name || "N/A"}</p>
                                                        <p className="text-xs text-muted-foreground">{lead.project?.name}</p>
                                                    </td>
                                                    <td className="p-4 text-sm text-muted-foreground">{formatDate(lead.createdAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <p className="text-muted-foreground">No landing page leads yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="servicing" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle>Servicing Leads</CardTitle>
                                <CardDescription>Leads uploaded directly for this advertiser</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" asChild>
                                    <label className="cursor-pointer flex items-center">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Upload Leads
                                        <input
                                            type="file"
                                            accept=".csv"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />
                                    </label>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {leads.filter(l => !l.landingPage).length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b">
                                            <tr>
                                                <th className="text-left p-4 font-medium">Lead</th>
                                                <th className="text-left p-4 font-medium">Date</th>
                                                <th className="text-left p-4 font-medium">Property Type</th>
                                                <th className="text-left p-4 font-medium">Unit Type</th>
                                                <th className="text-left p-4 font-medium">City</th>
                                                <th className="text-left p-4 font-medium">Location</th>
                                                <th className="text-left p-4 font-medium">Budget</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leads.filter(l => !l.landingPage).map((lead: any) => (
                                                <tr key={lead.id} className="border-b hover:bg-slate-50">
                                                    <td className="p-4">
                                                        <p className="font-medium">{lead.name}</p>
                                                        <p className="text-xs text-muted-foreground">{lead.phone}</p>
                                                    </td>
                                                    <td className="p-4 text-sm text-muted-foreground">{formatDate(lead.createdAt)}</td>
                                                    <td className="p-4 text-sm">{lead.propertyType || "N/A"}</td>
                                                    <td className="p-4 text-sm">{lead.unitType || "N/A"}</td>
                                                    <td className="p-4 text-sm">{lead.city || "N/A"}</td>
                                                    <td className="p-4 text-sm">{lead.location || "N/A"}</td>
                                                    <td className="p-4 text-sm font-medium">{lead.budget || "N/A"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <p className="text-muted-foreground">No servicing leads uploaded yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing" className="mt-6">
                    <Card>
                        <CardContent className="p-0">
                            {billing.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b">
                                            <tr>
                                                <th className="text-left p-4 font-medium">Invoice</th>
                                                <th className="text-left p-4 font-medium">Package</th>
                                                <th className="text-left p-4 font-medium">Amount</th>
                                                <th className="text-left p-4 font-medium">Status</th>
                                                <th className="text-left p-4 font-medium">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {billing.map((item) => (
                                                <tr key={item.id} className="border-b hover:bg-slate-50">
                                                    <td className="p-4 font-medium">{item.invoiceNumber}</td>
                                                    <td className="p-4 text-sm">{item.package?.packageDefinition?.name}</td>
                                                    <td className="p-4"><IndianRupee className="h-3 w-3 inline" /> {item.amount.toLocaleString('en-IN')}</td>
                                                    <td className="p-4"><Badge variant={item.status === "paid" ? "success" : "warning"}>{item.status}</Badge></td>
                                                    <td className="p-4 text-sm text-muted-foreground">{formatDate(item.createdAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <p className="text-muted-foreground">No billing records yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Internal Notes</CardTitle>
                            <CardDescription>
                                Add notes about this advertiser (only visible to admins)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Add Note Form */}
                            <div className="p-4 rounded-lg bg-slate-50 border space-y-3">
                                <h4 className="font-medium flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Internal Note
                                </h4>
                                <Textarea
                                    placeholder="Enter note..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    rows={3}
                                />
                                <div className="flex items-center gap-4">
                                    <Select value={notePriority} onValueChange={(v: any) => setNotePriority(v)}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={handleAddNote} disabled={addingNote} size="sm">
                                        {addingNote ? 'Adding...' : 'Add Note'}
                                    </Button>
                                </div>
                            </div>

                            {/* Notes List */}
                            <div className="space-y-4">
                                {notes.length > 0 ? (
                                    notes.map((note) => (
                                        <div key={note.id} className={`p-4 rounded-lg border ${note.priority === 'high' ? 'border-red-200 bg-red-50' :
                                            note.priority === 'low' ? 'border-slate-200' : 'border-slate-100'
                                            }`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-900">
                                                        {note.createdBy?.name || note.createdBy?.email || "Unknown"}
                                                    </span>
                                                    <Badge variant={note.priority === 'high' ? 'destructive' : 'outline'}>
                                                        {note.priority}
                                                    </Badge>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(note.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-4">No notes yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Password Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Set a new password for {advertiser.companyName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleChangePassword} disabled={actionLoading}>
                            Change Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Advertiser</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {advertiser.companyName}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Package Modal */}
            <Dialog open={showAddPackageModal} onOpenChange={setShowAddPackageModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Package Manually</DialogTitle>
                        <DialogDescription>
                            Assign a package directly to {advertiser.companyName}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Package Definition</Label>
                            <Select
                                value={addPackageData.packageDefinitionId}
                                onValueChange={handlePackageSelect}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a package" />
                                </SelectTrigger>
                                <SelectContent>
                                    {packageDefinitions.map((pkg) => (
                                        <SelectItem key={pkg.id} value={pkg.id}>
                                            {pkg.name} ({pkg.durationMonths}mo) - {formatCurrency(pkg.price)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount Paid</Label>
                                <Input
                                    type="number"
                                    value={addPackageData.amountPaid}
                                    onChange={(e) => setAddPackageData({ ...addPackageData, amountPaid: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Mode</Label>
                                <Select
                                    value={addPackageData.paymentMode}
                                    onValueChange={(v) => setAddPackageData({ ...addPackageData, paymentMode: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="upi">UPI</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Transaction Reference / ID</Label>
                            <Input
                                placeholder="e.g. UPI Ref, Cheque No"
                                value={addPackageData.transactionReference}
                                onChange={(e) => setAddPackageData({ ...addPackageData, transactionReference: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Salesperson</Label>
                            <Select
                                value={addPackageData.salespersonId}
                                onValueChange={(v) => setAddPackageData({ ...addPackageData, salespersonId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select salesperson" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">-- None --</SelectItem>
                                    {salespeople.map((sp) => (
                                        <SelectItem key={sp.id} value={sp.id}>
                                            {sp.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddPackageModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddPackage} disabled={actionLoading}>
                            {actionLoading ? "Adding..." : "Add Package"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Import Preview Dialog */}
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Preview Leads Import</DialogTitle>
                        <DialogDescription>
                            Verify the data from your CSV before assigning to {advertiser?.companyName}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 flex-1 overflow-hidden flex flex-col py-4">
                        <div className="flex flex-col gap-2">
                            <Label>Select Project for these leads</Label>
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose project..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="border rounded-lg overflow-auto flex-1">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b sticky top-0">
                                    <tr>
                                        <th className="text-left p-2 font-medium">Name</th>
                                        <th className="text-left p-2 font-medium">Phone</th>
                                        <th className="text-left p-2 font-medium">Property Type</th>
                                        <th className="text-left p-2 font-medium">Unit Type</th>
                                        <th className="text-left p-2 font-medium">City</th>
                                        <th className="text-left p-2 font-medium">Location</th>
                                        <th className="text-left p-2 font-medium">Budget</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {importLeads.map((l, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="p-2">{l.name || "-"}</td>
                                            <td className="p-2">{l.phone || "-"}</td>
                                            <td className="p-2">{l.propertyType || "-"}</td>
                                            <td className="p-2">{l.unitType || "-"}</td>
                                            <td className="p-2">{l.city || "-"}</td>
                                            <td className="p-2">{l.location || "-"}</td>
                                            <td className="p-2">{l.budget || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
                        <Button onClick={handleConfirmImport} disabled={actionLoading || importLeads.length === 0}>
                            {actionLoading ? "Uploading..." : `Confirm Import (${importLeads.length} leads)`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
