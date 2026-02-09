"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { publicAPI } from "@/lib/api";
import { getImageUrl, formatCurrency, formatBudgetRange } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    BedDouble,
    IndianRupee,
    Home,
    Shield,
    Star,
    ArrowRight,
    CheckCircle,
    User,
    X,
    Clock,
    TrendingUp,
    Timer,
    CheckCircle2,
} from "lucide-react";
import { OtpInput } from "@/components/ui/otp-input";

// Budget options for dropdowns
const BUDGET_OPTIONS = [
    { label: "Any", value: "any" },
    { label: "₹5 Lakhs", value: "500000" },
    { label: "₹10 Lakhs", value: "1000000" },
    { label: "₹20 Lakhs", value: "2000000" },
    { label: "₹30 Lakhs", value: "3000000" },
    { label: "₹50 Lakhs", value: "5000000" },
    { label: "₹75 Lakhs", value: "7500000" },
    { label: "₹1 Cr", value: "10000000" },
    { label: "₹1.5 Cr", value: "15000000" },
    { label: "₹2 Cr", value: "20000000" },
    { label: "₹3 Cr", value: "30000000" },
    { label: "₹5 Cr", value: "50000000" },
    { label: "₹10 Cr+", value: "100000000" },
];

interface Project {
    id: string;
    name: string;
    slug: string;
    builderName: string;
    city: string;
    locality: string;
    propertyType: string;
    unitTypes: string[];
    budgetMin: number;
    budgetMax: number;
    featuredImage?: string;
    heroImage?: string;
    cardImage?: string;
    reraId?: string;
    projectLogo?: string;
    advertiserLogo?: string;
    images?: string[];
}

interface LandingPageData {
    id: string;
    name: string;
    slug: string;
    city: string;
    locality?: string;
    description?: string;
    projects: Project[];
    heroImage?: string;
    pageType?: string;
}

export default function PublicLandingPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;

    const [landingPage, setLandingPage] = useState<LandingPageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [leadSubmitted, setLeadSubmitted] = useState(false);
    const [advertiserContact, setAdvertiserContact] = useState<any>(null);

    // Filters
    const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
    const [unitTypeFilter, setUnitTypeFilter] = useState("all");
    const [localityFilter, setLocalityFilter] = useState("all");
    const [budgetMinFilter, setBudgetMinFilter] = useState("any");
    const [budgetMaxFilter, setBudgetMaxFilter] = useState("any");
    const [leadForm, setLeadForm] = useState({ name: "", phone: "", email: "" });

    // OTP State
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otp, setOtp] = useState("");
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);

    // Extract unique property types, unit types, and localities from projects
    const { propertyTypes, unitTypes, localities } = useMemo(() => {
        if (!landingPage?.projects) return { propertyTypes: [], unitTypes: [], localities: [] };

        const propTypes = new Set<string>();
        const uTypes = new Set<string>();
        const locs = new Set<string>();

        landingPage.projects.forEach(p => {
            if (p.propertyType) propTypes.add(p.propertyType);
            if (p.unitTypes) p.unitTypes.forEach(u => uTypes.add(u));
            if (p.locality) locs.add(p.locality);
        });

        return {
            propertyTypes: Array.from(propTypes).sort(),
            unitTypes: Array.from(uTypes).sort(),
            localities: Array.from(locs).sort()
        };
    }, [landingPage]);

    // Filtered projects
    const filteredProjects = useMemo(() => {
        if (!landingPage?.projects) return [];
        let filtered = [...landingPage.projects];

        // Apply property type filter
        if (propertyTypeFilter !== "all") {
            filtered = filtered.filter((p) => p.propertyType === propertyTypeFilter);
        }

        // Apply unit type filter
        if (unitTypeFilter !== "all") {
            filtered = filtered.filter((p) =>
                p.unitTypes?.some(u => u === unitTypeFilter)
            );
        }

        // Apply locality filter
        if (localityFilter !== "all") {
            filtered = filtered.filter((p) => p.locality === localityFilter);
        }

        // Apply budget min filter
        if (budgetMinFilter !== "any") {
            const minVal = parseInt(budgetMinFilter);
            filtered = filtered.filter((p) => (p.budgetMax || 0) >= minVal);
        }

        // Apply budget max filter
        if (budgetMaxFilter !== "any") {
            const maxVal = parseInt(budgetMaxFilter);
            filtered = filtered.filter((p) => (p.budgetMin || 0) <= maxVal);
        }
        return filtered;
    }, [landingPage, propertyTypeFilter, unitTypeFilter, localityFilter, budgetMinFilter, budgetMaxFilter]);

    useEffect(() => {
        if (slug) {
            fetchLandingPage();
        }
    }, [slug]);

    const fetchLandingPage = async () => {
        try {
            const res = await publicAPI.getLandingPage(slug);
            setLandingPage(res.data);

            // Record visit
            if (res.data?.id) {
                publicAPI.recordVisit({
                    landingPageId: res.data.id,
                    // If we want to record project specific visits, we could do it here, 
                    // but usually a LP visit is generic to the page unless a specific project is clicked.
                    // However, our backend supports both. For now, tracking LP visit.
                }).catch(err => console.error("Failed to record visit", err));
            }
        } catch (error) {
            console.error("Error fetching landing page:", error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setPropertyTypeFilter("all");
        setUnitTypeFilter("all");
        setLocalityFilter("all");
        setBudgetMinFilter("any");
        setBudgetMaxFilter("any");
    };

    const hasActiveFilters =
        propertyTypeFilter !== "all" ||
        unitTypeFilter !== "all" ||
        localityFilter !== "all" ||
        budgetMinFilter !== "any" ||
        budgetMaxFilter !== "any";

    // OTP Timer
    useEffect(() => {
        if (otpTimer > 0) {
            const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [otpTimer]);

    const handleSendOtp = async () => {
        if (!leadForm.phone || leadForm.phone.length !== 10) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        setSendingOtp(true);
        try {
            await publicAPI.sendOtp(leadForm.phone);
            setOtpSent(true);
            setOtpTimer(60); // 60 second cooldown
            toast.success("OTP sent to your phone");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to send OTP");
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            toast.error("Please enter the 6-digit OTP");
            return;
        }

        setVerifyingOtp(true);
        try {
            await publicAPI.verifyOtp(leadForm.phone, otp);
            setOtpVerified(true);
            toast.success("Phone verified successfully!");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Invalid OTP");
        } finally {
            setVerifyingOtp(false);
        }
    };

    const openLeadForm = (project: Project) => {
        setSelectedProject(project);
        setShowLeadForm(true);
    };

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leadForm.name || !leadForm.phone || !leadForm.email) {
            toast.error("Please fill in all fields");
            return;
        }

        if (!otpVerified) {
            toast.error("Please verify your phone number with OTP first");
            return;
        }

        setSubmitting(true);
        try {
            const response = await publicAPI.submitLead({
                ...leadForm,
                projectId: selectedProject?.id || "",
                landingPageId: landingPage?.id || "",
                utmSource: searchParams.get("utm_source") || undefined,
                utmMedium: searchParams.get("utm_medium") || undefined,
                utmCampaign: searchParams.get("utm_campaign") || undefined,
            });
            toast.success("Thank you! We will contact you soon.");
            setAdvertiserContact(response.data.advertiserContact);
            setLeadSubmitted(true);
            setLeadForm({ name: "", phone: "", email: "" });
            setOtpSent(false);
            setOtpVerified(false);
            setOtp("");
        } catch (error) {
            toast.error("Failed to submit. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading properties...</p>
                </div>
            </div>
        );
    }

    if (!landingPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-10 h-10 text-slate-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-3">Page Not Found</h1>
                    <p className="text-slate-500 mb-6">
                        The property listing you're looking for doesn't exist or has been removed.
                    </p>
                    <Link href="/">
                        <Button className="rounded-full px-8">Go Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const showLocationFilter = !landingPage.locality;

    return (
        <div className="min-h-screen bg-[#f8f9fa]" data-testid="public-landing-page">
            {/* Premium Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="font-bold text-xl text-slate-900">Topickx</span>
                                <span className="hidden sm:block text-[10px] text-slate-400 -mt-1">Premium Properties</span>
                            </div>
                        </Link>
                        <Button className="rounded-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 shadow-lg shadow-orange-500/20 text-sm font-semibold">
                            Post Property
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-primary/90 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                    <div className="text-center">
                        {/* Location Badge */}
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
                            <MapPin className="w-4 h-4 text-orange-400" />
                            {landingPage.city}
                            {landingPage.locality && ` • ${landingPage.locality}`}
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                            {landingPage.name}
                        </h1>

                        {landingPage.description && (
                            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
                                {landingPage.description}
                            </p>
                        )}

                        {/* Stats */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-white/90">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-2xl font-bold">{landingPage.projects?.length || 0}</p>
                                    <p className="text-xs text-white/60">Properties</p>
                                </div>
                            </div>
                            <div className="w-px h-12 bg-white/20"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-2xl font-bold">RERA</p>
                                    <p className="text-xs text-white/60">Verified</p>
                                </div>
                            </div>
                            <div className="w-px h-12 bg-white/20"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    <Star className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-2xl font-bold">Top</p>
                                    <p className="text-xs text-white/60">Builders</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Bar - Integrated into Hero */}
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                    <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6">
                        <div className={`grid grid-cols-1 sm:grid-cols-2 ${showLocationFilter ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-4 items-end`}>
                            {/* Location Filter */}
                            {showLocationFilter && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</Label>
                                    <Select value={localityFilter} onValueChange={setLocalityFilter}>
                                        <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium" data-testid="locality-filter">
                                            <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                            <SelectValue placeholder="All Localities" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Locations</SelectItem>
                                            {localities.map((loc) => (
                                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Property Type */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Property Type</Label>
                                <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium" data-testid="property-type-filter">
                                        <Home className="w-4 h-4 mr-2 text-slate-400" />
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {propertyTypes.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Unit Type / Configuration */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Configuration</Label>
                                <Select value={unitTypeFilter} onValueChange={setUnitTypeFilter}>
                                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium" data-testid="unit-type-filter">
                                        <BedDouble className="w-4 h-4 mr-2 text-slate-400" />
                                        <SelectValue placeholder="All BHK" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Configurations</SelectItem>
                                        {unitTypes.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Budget Min */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Min Budget</Label>
                                <Select value={budgetMinFilter} onValueChange={setBudgetMinFilter}>
                                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium" data-testid="budget-min-filter">
                                        <IndianRupee className="w-4 h-4 mr-1 text-slate-400" />
                                        <SelectValue placeholder="Min" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BUDGET_OPTIONS.map((opt) => (
                                            <SelectItem key={`min-${opt.value}`} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Budget Max */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Max Budget</Label>
                                <Select value={budgetMaxFilter} onValueChange={setBudgetMaxFilter}>
                                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium" data-testid="budget-max-filter">
                                        <IndianRupee className="w-4 h-4 mr-1 text-slate-400" />
                                        <SelectValue placeholder="Max" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BUDGET_OPTIONS.map((opt) => (
                                            <SelectItem key={`max-${opt.value}`} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Clear Filters / Results */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-transparent">Action</Label>
                                {hasActiveFilters ? (
                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                        className="w-full h-12 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                                        data-testid="clear-filters-btn"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Clear Filters
                                    </Button>
                                ) : (
                                    <div className="h-12 flex items-center justify-center bg-primary/5 rounded-xl">
                                        <span className="text-sm font-semibold text-primary">
                                            {filteredProjects.length} Properties
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Results Header */}
            <section className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            <h2 className="font-semibold text-slate-900">
                                {filteredProjects.length} {filteredProjects.length === 1 ? 'Property' : 'Properties'} Found
                            </h2>
                            {hasActiveFilters && (
                                <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                    Filtered
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 hidden sm:block">
                            Showing verified & RERA approved properties
                        </p>
                    </div>
                </div>
            </section>

            {/* Projects Grid */}
            <div className="container mx-auto px-4 py-8">
                {/* Featured Projects Section */}
                {landingPage.projects.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                            <h2 className="text-2xl font-bold text-slate-900">Top 3 Featured Projects</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {landingPage.projects.slice(0, 3).map((project) => (
                                <Link
                                    href={`/project/${project.id}?lp=${landingPage.id}`}
                                    key={project.id}
                                    className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-amber-200 overflow-hidden flex flex-col relative ring-1 ring-amber-100"
                                >
                                    {/* Featured Badge */}
                                    <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-white" />
                                        FEATURED
                                    </div>

                                    {/* Image */}
                                    <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                                        {(project.cardImage || project.featuredImage) ? (
                                            <img
                                                src={getImageUrl(project.cardImage || project.featuredImage)}
                                                alt={project.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Building2 className="w-12 h-12 text-slate-300" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="mb-4">
                                            <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-amber-600 transition-colors line-clamp-1">
                                                {project.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 mb-2">by {project.builderName}</p>
                                            <div className="flex items-center gap-1 text-slate-600 text-sm">
                                                <MapPin className="w-3 h-3 text-slate-400" />
                                                <span className="truncate">
                                                    {project.locality}, {project.city}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-slate-100">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-0.5">Configuration</p>
                                                <p className="font-medium text-slate-800 text-sm truncate">
                                                    {project.unitTypes.join(", ")}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-0.5">Price Range</p>
                                                <p className="font-medium text-primary text-sm">
                                                    {formatBudgetRange(project.budgetMin, project.budgetMax)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-auto flex gap-2">
                                            <Button
                                                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    openLeadForm(project);
                                                }}
                                            >
                                                Enquire Now
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                View Details
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Other Projects */}
                {landingPage.projects.length > 3 && (
                    <>
                        <div className="flex items-center gap-3 mb-6 mt-12 border-t pt-8">
                            <Building2 className="w-6 h-6 text-slate-400" />
                            <h2 className="text-xl font-bold text-slate-900">More Projects</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {landingPage.projects.slice(3).map((project) => (
                                <Link
                                    href={`/project/${project.id}?lp=${landingPage.id}`}
                                    key={project.id}
                                    className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col"
                                >
                                    {/* Image */}
                                    <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                                        {(project.cardImage || project.featuredImage) ? (
                                            <img
                                                src={getImageUrl(project.cardImage || project.featuredImage)}
                                                alt={project.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Building2 className="w-12 h-12 text-slate-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="mb-3">
                                            <h3 className="font-bold text-base text-slate-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
                                                {project.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 mb-1">by {project.builderName}</p>
                                            <div className="flex items-center gap-1 text-slate-600 text-xs">
                                                <MapPin className="w-3 h-3 text-slate-400" />
                                                <span className="truncate">
                                                    {project.locality}, {project.city}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-3 border-t border-slate-50">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <p className="text-xs text-slate-500">Starts from</p>
                                                    <p className="font-bold text-primary text-sm">
                                                        {formatCurrency(project.budgetMin)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white text-xs"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        openLeadForm(project);
                                                    }}
                                                >
                                                    Enquire Now
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-xs">
                                                    View
                                                    <ArrowRight className="w-3 h-3 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Trust Indicators */}
            < section className="bg-white border-t border-slate-100 py-12" >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: Shield, title: 'RERA Verified', desc: 'All properties verified' },
                            { icon: CheckCircle, title: 'Trusted Builders', desc: 'Top-rated developers' },
                            { icon: Clock, title: 'On-time Delivery', desc: 'Track record verified' },
                            { icon: TrendingUp, title: 'Best Prices', desc: 'No brokerage fees' }
                        ].map((item, idx) => (
                            <div key={idx} className="text-center">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <item.icon className="w-7 h-7 text-primary" />
                                </div>
                                <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                                <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Lead Form Dialog */}
            < Dialog open={showLeadForm} onOpenChange={(open) => {
                setShowLeadForm(open);
                if (!open) {
                    setLeadSubmitted(false);
                    setAdvertiserContact(null);
                    setOtpSent(false);
                    setOtpVerified(false);
                    setOtp("");
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    {!leadSubmitted ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl">Get Project Details</DialogTitle>
                                <DialogDescription className="text-slate-500">
                                    {selectedProject?.name}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleLeadSubmit} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter your name"
                                        value={leadForm.name}
                                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                                        className="h-12 rounded-xl"
                                        data-testid="lead-name-input"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Mobile Number *</Label>
                                    <Input
                                        id="phone"
                                        placeholder="10-digit mobile number"
                                        value={leadForm.phone}
                                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                                        className="h-12 rounded-xl"
                                        disabled={otpSent || otpVerified}
                                        data-testid="lead-phone-input"
                                    />
                                    {otpVerified ? (
                                        <div className="flex items-center gap-2 text-green-600 text-sm mt-1 font-medium">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Phone verified
                                        </div>
                                    ) : !otpSent ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="mt-2 w-full h-10 rounded-xl"
                                            onClick={handleSendOtp}
                                            disabled={sendingOtp || !leadForm.phone || leadForm.phone.length !== 10}
                                        >
                                            {sendingOtp ? "Sending..." : "Send Verification Code"}
                                        </Button>
                                    ) : (
                                        <div className="space-y-4 mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <div className="text-center space-y-2">
                                                <Label className="text-xs text-slate-500 uppercase font-bold">Enter 6-digit Code</Label>
                                                <OtpInput
                                                    value={otp}
                                                    onChange={setOtp}
                                                    disabled={verifyingOtp}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                className="w-full h-11 rounded-xl"
                                                onClick={handleVerifyOtp}
                                                disabled={verifyingOtp || otp.length !== 6}
                                            >
                                                {verifyingOtp ? "Verifying..." : "Verify Code"}
                                            </Button>
                                            <div className="text-center">
                                                {otpTimer > 0 ? (
                                                    <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                                                        <Timer className="h-3 w-3" />
                                                        Resend in {otpTimer}s
                                                    </p>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={handleSendOtp}
                                                        className="text-xs text-primary hover:underline font-medium"
                                                    >
                                                        Didn't receive code? Resend
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={leadForm.email}
                                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                                        className="h-12 rounded-xl"
                                        data-testid="lead-email-input"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 font-semibold text-base shadow-lg shadow-orange-500/20"
                                    disabled={submitting || !otpVerified}
                                    data-testid="submit-lead-btn"
                                >
                                    {submitting ? "Submitting..." : "Get Callback Now"}
                                </Button>
                                <p className="text-xs text-center text-slate-500">
                                    By submitting, you agree to our Terms & Privacy Policy
                                </p>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Thank You!</h3>
                            <p className="text-slate-600 mb-6">Your enquiry has been submitted. Here are the contact details:</p>

                            {advertiserContact && (
                                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 text-left space-y-4 border border-primary/20">
                                    <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-primary" />
                                        {advertiserContact.companyName || 'Contact Details'}
                                    </h4>
                                    <div className="space-y-3">
                                        {advertiserContact.contactPerson && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                    <User className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <span className="text-slate-700 font-medium">{advertiserContact.contactPerson}</span>
                                            </div>
                                        )}
                                        {advertiserContact.phone && (
                                            <a href={`tel:${advertiserContact.phone}`} className="flex items-center gap-3 hover:bg-white/50 rounded-lg p-1 -m-1 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shadow-sm">
                                                    <Phone className="w-4 h-4 text-green-600" />
                                                </div>
                                                <span className="text-slate-700 font-medium">{advertiserContact.phone}</span>
                                            </a>
                                        )}
                                        {advertiserContact.email && (
                                            <a href={`mailto:${advertiserContact.email}`} className="flex items-center gap-3 hover:bg-white/50 rounded-lg p-1 -m-1 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                                                    <Mail className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="text-slate-700 font-medium">{advertiserContact.email}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {!advertiserContact && (
                                <p className="text-slate-500">Our team will contact you shortly with the details.</p>
                            )}

                            <Button
                                onClick={() => { setShowLeadForm(false); setLeadSubmitted(false); setAdvertiserContact(null); }}
                                className="mt-6 rounded-full px-8"
                            >
                                Done
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog >

            {/* Footer */}
            < footer className="bg-slate-900 text-white py-12" >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="font-bold text-xl">Topickx</span>
                                <p className="text-xs text-white/50">Premium Properties Platform</p>
                            </div>
                        </div>
                        <p className="text-sm text-white/50">
                            © {new Date().getFullYear()} Topickx. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer >
        </div >
    );
}
