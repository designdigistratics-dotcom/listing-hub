"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { publicAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatBudgetRange, getImageUrl } from "@/lib/utils";
import {
    Building2,
    MapPin,
    Building,
    Phone,
    ArrowLeft,
    Check,
    ChevronLeft,
    ChevronRight,
    Home,
    Car,
    Dumbbell,
    Trees,
    Shield,
    Droplets,
    Wifi,
    Zap,
    Users,
    Timer,
    CheckCircle2,
    X,
    Play,
    Calendar,
    Ruler,
    IndianRupee,
    Verified,
    Star,
    ChevronDown,
    AlertTriangle,
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { OtpInput } from "@/components/ui/otp-input";
import { toast } from "sonner";

interface FloorPlan {
    url: string;
    description?: string;
    price?: string;
}

interface ProjectData {
    id: string;
    name: string;
    builderName: string;
    city: string;
    locality: string;
    address?: string;
    propertyType: string | string[];
    budgetMin: number;
    budgetMax: number;
    price?: string;
    priceDetails?: string;
    unitTypes: string[];
    highlights: string[];
    amenities: string[];
    images: string[];
    floorPlans?: FloorPlan[];
    videoUrl?: string;
    heroImage?: string;
    projectLogo?: string;
    advertiserLogo?: string;
    cardImage?: string;
    possessionStatus: string;
    reraId?: string;
    aboutProject?: string;
    builderDescription?: string;
    disclaimer?: string;
    locationHighlights?: string[];
    advertiser?: {
        companyName: string;
        phone?: string;
        ownerName?: string;
    };
    is_preview?: boolean;
    status?: string;
}

const AMENITY_ICONS: Record<string, any> = {
    "swimming pool": Droplets,
    "pool": Droplets,
    "gym": Dumbbell,
    "fitness": Dumbbell,
    "garden": Trees,
    "park": Trees,
    "parking": Car,
    "security": Shield,
    "cctv": Shield,
    "wifi": Wifi,
    "internet": Wifi,
    "power backup": Zap,
    "power": Zap,
    "club house": Users,
    "clubhouse": Users,
    "community": Users,
};

export default function ProjectPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const projectId = params.id as string;
    const landingPageId = searchParams.get('lp') || undefined;

    const [project, setProject] = useState<ProjectData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState(-1);
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // OTP State
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otp, setOtp] = useState("");
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await publicAPI.getProject(projectId);
                setProject(response.data);
            } catch (error: any) {
                if (error.response?.status === 404) {
                    try {
                        const previewRes = await publicAPI.getProjectPreview(projectId);
                        setProject({ ...previewRes.data, is_preview: true });
                        setLoading(false);
                        return;
                    } catch (previewError) {
                        console.error("Error fetching project preview:", previewError);
                    }
                }
                console.error("Error fetching project:", error);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchProject();
            publicAPI.recordVisit({ projectId, landingPageId }).catch(err => console.error("Error recording visit:", err));
        }
    }, [projectId, landingPageId]);

    // OTP Timer
    useEffect(() => {
        if (otpTimer > 0) {
            const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [otpTimer]);

    // Lightbox Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === -1) return;
            if (e.key === "ArrowRight") {
                setLightboxIndex(prev => (prev < lightboxImages.length - 1 ? prev + 1 : prev));
            }
            if (e.key === "ArrowLeft") {
                setLightboxIndex(prev => (prev > 0 ? prev - 1 : prev));
            }
            if (e.key === "Escape") {
                setLightboxIndex(-1);
                setLightboxImages([]);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxIndex, lightboxImages]);

    const handleSendOtp = async () => {
        if (!formData.phone || formData.phone.length !== 10) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        setSendingOtp(true);
        try {
            await publicAPI.sendOtp(formData.phone);
            setOtpSent(true);
            setOtpTimer(60);
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
            await publicAPI.verifyOtp(formData.phone, otp);
            setOtpVerified(true);
            toast.success("Phone verified successfully!");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Invalid OTP");
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otpVerified) {
            toast.error("Please verify your phone number with OTP first");
            return;
        }

        setSubmitting(true);

        try {
            await publicAPI.submitLead({
                ...formData,
                projectId: project?.id || projectId,
                landingPageId: landingPageId || "direct",
                otpVerified: true,
            });
            setSubmitted(true);
            toast.success("Inquiry submitted successfully!");
        } catch (error) {
            console.error("Error submitting lead:", error);
            toast.error("Failed to submit inquiry. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const getAmenityIcon = (amenity: string) => {
        const key = amenity.toLowerCase();
        for (const [name, Icon] of Object.entries(AMENITY_ICONS)) {
            if (key.includes(name)) {
                return Icon;
            }
        }
        return Check;
    };

    const openLightbox = (index: number, images: string[]) => {
        setLightboxImages(images);
        setLightboxIndex(index);
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (lightboxIndex < lightboxImages.length - 1) {
            setLightboxIndex(lightboxIndex + 1);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (lightboxIndex > 0) {
            setLightboxIndex(lightboxIndex - 1);
        }
    };

    const scrollToEnquiry = () => {
        document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading project details...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center max-w-md mx-auto p-8">
                    <Building className="h-20 w-20 mx-auto mb-6 text-slate-300" />
                    <h1 className="text-3xl font-bold mb-3">Project Not Found</h1>
                    <p className="text-muted-foreground mb-6">
                        This project may have been removed or is no longer available.
                    </p>
                    <Link href="/">
                        <Button size="lg">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const heroImage = project.heroImage || (project.images?.length > 0 ? project.images[0] : null);
    const galleryImages = project.images?.length > 0 ? project.images : [];

    return (
        <div className="min-h-screen bg-stone-50 font-sans selection:bg-amber-100 selection:text-amber-900 relative">
            <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
            {/* Preview Banner */}
            {project.is_preview && project.status !== 'LIVE' && (
                <div className="bg-amber-600 text-white text-center py-2 px-4 text-sm font-medium sticky top-0 z-50 flex items-center justify-center gap-2 shadow-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Preview Mode - This project is not yet live</span>
                </div>
            )}

            {/* Sticky Header */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                        <Building2 className="h-8 w-8 text-primary" />
                        <span className="text-xl font-heading font-bold">
                            <span className="text-primary">Topickx</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Button onClick={scrollToEnquiry} className="bg-emerald-950 hover:bg-emerald-900 text-amber-50 font-semibold shadow-md border border-white/10 rounded-full px-6">
                            Enquire
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-end overflow-hidden bg-emerald-900">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center blur-[2px] scale-105"
                    style={{
                        backgroundImage: heroImage
                            ? `url(${getImageUrl(heroImage)})`
                            : 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)',
                    }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-900/70 to-emerald-900/30" />


                {/* Project Logo Overlay */}
                {project.projectLogo && (
                    <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50 bg-white/95 p-2 rounded-lg shadow-lg backdrop-blur-sm">
                        <div className="relative h-12 w-12 md:h-16 md:w-16">
                            <Image
                                src={getImageUrl(project.projectLogo)}
                                alt={`${project.name} Logo`}
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                )}

                {/* Hero Content */}
                <div className="relative container mx-auto px-4 py-12 md:py-20">
                    <div className="grid lg:grid-cols-5 gap-8 items-end">
                        {/* Project Info - Left Side */}
                        <div className="lg:col-span-3 text-white">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                <Badge className="bg-amber-500/90 text-amber-950 border border-amber-400/30 px-4 py-1.5 text-sm font-semibold shadow-lg backdrop-blur-md">
                                    {Array.isArray(project.propertyType) ? project.propertyType.join(', ') : project.propertyType}
                                </Badge>
                                {project.reraId && (
                                    <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                                        <Verified className="h-3 w-3 mr-1" />
                                        RERA Approved
                                    </Badge>
                                )}
                                <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {project.possessionStatus}
                                </Badge>
                            </div>

                            {/* Project Name */}
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                                {project.name}
                            </h1>

                            {/* Builder */}
                            <p className="text-lg text-white/80 mb-4">
                                by <span className="font-semibold text-white">{project.builderName}</span>
                            </p>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-white/80 mb-6">
                                <MapPin className="h-5 w-5" />
                                <span className="text-lg">{project.locality}, {project.city}</span>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <p className="text-white/60 text-sm uppercase tracking-wider mb-1">Starting Price</p>
                                <p className="text-3xl md:text-4xl font-bold text-white">
                                    {formatBudgetRange(project.budgetMin, project.budgetMax)}
                                </p>
                                {project.priceDetails && (
                                    <p className="text-white/70 text-sm mt-1">{project.priceDetails}</p>
                                )}
                            </div>

                            {/* Quick Stats */}
                            <div className="flex flex-wrap gap-4 md:gap-6">
                                {project.unitTypes?.length > 0 && (
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                                        <p className="text-white/60 text-xs uppercase">Configuration</p>
                                        <p className="text-white font-semibold">{project.unitTypes.join(", ")}</p>
                                    </div>
                                )}
                                {project.reraId && (
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                                        <p className="text-white/60 text-xs uppercase">RERA ID</p>
                                        <p className="text-white font-semibold text-sm">{project.reraId}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Enquiry Form - Right Side */}
                        <div className="lg:col-span-2" id="enquiry-form">
                            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                                        Request Quote
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Fill your details to receive more information
                                    </p>
                                </div>

                                {submitted ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                            <Check className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h4 className="text-lg font-semibold mb-2 text-slate-900">Thank You!</h4>
                                        <p className="text-slate-500 mb-4">
                                            Our team will contact you shortly.
                                        </p>
                                        {project.advertiser?.phone && (
                                            <a
                                                href={`tel:${project.advertiser.phone}`}
                                                className="inline-flex items-center gap-2 text-teal-600 font-medium hover:underline"
                                            >
                                                <Phone className="h-4 w-4" />
                                                Call Now: {project.advertiser.phone}
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <Input
                                                placeholder="Your Name *"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                className="h-12 bg-slate-50 border-slate-200"
                                            />
                                        </div>

                                        <div>
                                            <Input
                                                type="tel"
                                                placeholder="Mobile Number *"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                                disabled={otpSent || otpVerified}
                                                className="h-12 bg-slate-50 border-slate-200"
                                            />

                                            {otpVerified ? (
                                                <div className="flex items-center gap-2 text-green-600 text-sm mt-2 font-medium">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Phone verified
                                                </div>
                                            ) : !otpSent ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-2 w-full"
                                                    onClick={handleSendOtp}
                                                    disabled={sendingOtp || !formData.phone || formData.phone.length !== 10}
                                                >
                                                    {sendingOtp ? "Sending..." : "Verify with OTP"}
                                                </Button>
                                            ) : (
                                                <div className="space-y-3 mt-3 p-4 bg-slate-50 rounded-xl border">
                                                    <div className="text-center space-y-2">
                                                        <Label className="text-xs text-slate-500 uppercase font-bold">Enter OTP</Label>
                                                        <OtpInput
                                                            value={otp}
                                                            onChange={setOtp}
                                                            disabled={verifyingOtp}
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        className="w-full"
                                                        onClick={handleVerifyOtp}
                                                        disabled={verifyingOtp || otp.length !== 6}
                                                    >
                                                        {verifyingOtp ? "Verifying..." : "Verify"}
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
                                                                Resend OTP
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Input
                                                type="email"
                                                placeholder="Email Address *"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                className="h-12 bg-slate-50 border-slate-200"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-14 text-lg font-bold bg-emerald-950 hover:bg-emerald-900 text-amber-50 shadow-md rounded-xl border border-white/10"
                                            size="lg"
                                            disabled={submitting || !otpVerified}
                                        >
                                            {submitting ? "Submitting..." : "Get Exclusive Details"}
                                        </Button>

                                        <p className="text-xs text-center text-slate-400">
                                            By submitting, you agree to our Terms & Privacy Policy
                                        </p>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-10 relative z-10">

                {/* About Project */}
                {project.aboutProject && (
                    <section className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100">
                        <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 mb-6 flex items-center gap-3">
                            <span className="bg-amber-50 p-2 rounded-xl text-amber-600"><Building className="h-6 w-6" /></span>
                            About {project.name}
                        </h2>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                            {project.aboutProject}
                        </p>
                    </section>
                )}

                {/* Highlights */}
                {project.highlights?.length > 0 && (
                    <section className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100">
                        <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 mb-8 flex items-center gap-3">
                            <span className="bg-amber-50 p-2 rounded-xl text-amber-600"><Star className="h-6 w-6" /></span>
                            Key Highlights
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {project.highlights.flatMap(h => {
                                // 1. Terminology Replacement: Property -> Project
                                const cleanH = h.replace(/\bProperty\b/g, 'Project').replace(/\bProperties\b/g, 'Projects');

                                // 2. Robust Splitting Logic
                                if (cleanH.includes('\n')) {
                                    return cleanH.split('\n').filter(s => s.trim());
                                }
                                // Split by sentences if no newlines (matches periods followed by whitespace and capital letter)
                                const sentences = cleanH.match(/[^.!?]+[.!?]+(?=\s*[A-Z]|$)|[^.!?]+[.!?]*$/g);
                                return sentences ? sentences.map(s => s.trim()).filter(s => s.length > 5) : [cleanH];
                            }).map((highlight, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-5 bg-stone-50 rounded-2xl border border-stone-100">
                                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                                        <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
                                    </div>
                                    <span className="text-emerald-900 font-medium leading-relaxed">{highlight}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Location */}
                {project.address && (
                    <section className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100">
                        <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 mb-6 flex items-center gap-3">
                            <span className="bg-amber-50 p-2 rounded-xl text-amber-600"><MapPin className="h-6 w-6" /></span>
                            Address
                        </h2>
                        <p className="text-slate-600 text-lg">{project.address}</p>
                        <p className="text-slate-500 mt-2">{project.locality}, {project.city}</p>
                    </section>
                )}

                {/* Location Highlights */}
                {project.locationHighlights && project.locationHighlights?.length > 0 && (
                    <section className="bg-emerald-950 rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                        <h2 className="text-3xl md:text-4xl font-serif text-amber-50 mb-8 flex items-center gap-3 relative z-10">
                            <span className="bg-white/10 p-2 rounded-xl text-amber-400 backdrop-blur-sm"><MapPin className="h-6 w-6" /></span>
                            Commute & Convenience
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
                            {project.locationHighlights.map((highlight, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400">
                                        <Check className="h-4 w-4" />
                                    </div>
                                    <span className="text-stone-200">{highlight}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Video Tour */}
                {project.videoUrl && (
                    <section className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100">
                        <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 mb-8 flex items-center gap-3">
                            <span className="bg-amber-50 p-2 rounded-xl text-amber-600"><Play className="h-6 w-6" /></span>
                            Project Video Tour
                        </h2>
                        <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-2xl ring-4 ring-slate-100">
                            <iframe
                                src={project.videoUrl.replace("watch?v=", "embed/")}
                                title="Project Video Tour"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </section>
                )}

                {/* Floor Plans */}
                {project.floorPlans && project.floorPlans.length > 0 && (
                    <section className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100">
                        <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 mb-8 flex items-center gap-3">
                            <span className="bg-amber-50 p-2 rounded-xl text-amber-600"><Ruler className="h-6 w-6" /></span>
                            Floor Plans & Configuration
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {project.floorPlans.map((fp, idx) => (
                                <div
                                    key={idx}
                                    className="group border border-slate-200 rounded-xl overflow-hidden cursor-pointer"
                                    onClick={() => {
                                        const images = project.floorPlans!.map(p => getImageUrl(typeof p === 'string' ? p : p.url));
                                        openLightbox(idx, images);
                                    }}
                                >
                                    <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                                        <img
                                            src={getImageUrl(typeof fp === 'string' ? fp : fp.url)}
                                            alt={typeof fp === 'string' ? `Floor Plan ${idx + 1}` : (fp.description || `Floor Plan ${idx + 1}`)}
                                            className="w-full h-full object-contain"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                                                Click to expand
                                            </span>
                                        </div>
                                    </div>
                                    {typeof fp !== 'string' && (fp.description || fp.price) && (
                                        <div className="p-4 bg-white">
                                            {fp.description && (
                                                <p className="font-semibold text-slate-900">{fp.description}</p>
                                            )}
                                            {fp.price && (
                                                <p className="text-primary font-bold text-lg flex items-center gap-1 mt-1">
                                                    <IndianRupee className="h-4 w-4" />
                                                    {fp.price}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Gallery */}
                {galleryImages.length > 1 && (
                    <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">Gallery</h2>
                        <div className="relative group">
                            {/* Left Arrow */}
                            <button
                                onClick={() => {
                                    const container = document.getElementById('gallery-scroll');
                                    if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                                }}
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 -translate-x-1/2 hover:scale-110"
                            >
                                <ChevronLeft className="w-6 h-6 text-slate-700" />
                            </button>

                            {/* Gallery Container */}
                            <div
                                id="gallery-scroll"
                                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {galleryImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="flex-shrink-0 w-64 md:w-80 aspect-video rounded-xl overflow-hidden cursor-pointer group/item"
                                        onClick={() => openLightbox(idx, galleryImages.map(img => getImageUrl(img)))}
                                    >
                                        <img
                                            src={getImageUrl(img)}
                                            alt={`Gallery ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Right Arrow */}
                            <button
                                onClick={() => {
                                    const container = document.getElementById('gallery-scroll');
                                    if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                                }}
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 translate-x-1/2 hover:scale-110"
                            >
                                <ChevronRight className="w-6 h-6 text-slate-700" />
                            </button>
                        </div>
                    </section>
                )}

                {/* Amenities */}
                {project.amenities?.length > 0 && (
                    <section className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100">
                        <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 mb-8 flex items-center gap-3">
                            <span className="bg-amber-50 p-2 rounded-xl text-amber-600"><Home className="h-6 w-6" /></span>
                            World-Class Amenities
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {project.amenities.map((amenity, idx) => {
                                const Icon = getAmenityIcon(amenity);
                                return (
                                    <div
                                        key={idx}
                                        className="flex flex-col items-center justify-center gap-3 p-6 bg-stone-50 rounded-2xl border border-stone-100 group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center group-hover:bg-amber-50 group-hover:border-amber-500 transition-colors">
                                            <Icon className="h-6 w-6 text-emerald-900 group-hover:text-amber-600 transition-colors" />
                                        </div>
                                        <span className="text-emerald-950 font-medium text-center">{amenity}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}



                {/* Builder Info - Luxurious Dark Card */}
                {(project.advertiser || project.builderDescription) && (
                    <section className="bg-emerald-950 rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px]"></div>

                        <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
                            {project.advertiserLogo ? (
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                                    <img
                                        src={getImageUrl(project.advertiserLogo)}
                                        alt={project.advertiser?.companyName || project.builderName}
                                        className="w-24 h-24 object-contain rounded-xl bg-white p-2"
                                    />
                                </div>
                            ) : (
                                <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                                    <Building className="h-10 w-10 text-white/50" />
                                </div>
                            )}
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-amber-500 text-amber-950 border-0 px-3 py-1 font-bold hover:bg-amber-500 hover:text-amber-950">PREMIER PARTNER</Badge>
                                </div>
                                <h3 className="text-3xl font-serif font-bold text-white tracking-wide">
                                    {project.advertiser?.companyName || project.builderName}
                                </h3>
                                {project.builderDescription && (
                                    <p className="text-emerald-100/80 text-lg font-light leading-relaxed max-w-2xl">{project.builderDescription}</p>
                                )}
                            </div>
                            {project.advertiser?.phone && (
                                <button
                                    onClick={scrollToEnquiry}
                                    className="bg-amber-500 text-amber-950 px-8 py-4 rounded-xl font-bold hover:bg-amber-400 shadow-md flex items-center gap-3"
                                >
                                    <Phone className="h-5 w-5" />
                                    Contact Now
                                </button>
                            )}
                        </div>
                    </section>
                )}


            </div>

            {/* Disclaimer */}
            {project.disclaimer && (
                <div className="container mx-auto px-4 mt-8">
                    <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Disclaimer</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{project.disclaimer}</p>
                    </div>
                </div>
            )}

            {/* Sticky Mobile CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 md:hidden z-40">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-slate-500">Starting from</p>
                        <p className="font-bold text-teal-600">
                            {formatBudgetRange(project.budgetMin, project.budgetMax)}
                        </p>
                    </div>
                    <Button onClick={scrollToEnquiry} className="bg-emerald-950 hover:bg-emerald-900 text-amber-50 font-semibold shadow-lg rounded-xl px-6">
                        Enquire
                    </Button>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxIndex !== -1 && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => {
                        setLightboxIndex(-1);
                        setLightboxImages([]);
                    }}
                >
                    <button
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50"
                        onClick={() => {
                            setLightboxIndex(-1);
                            setLightboxImages([]);
                        }}
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Left Arrow */}
                    {lightboxIndex > 0 && (
                        <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50"
                            onClick={prevImage}
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </button>
                    )}

                    {/* Right Arrow */}
                    {lightboxIndex < lightboxImages.length - 1 && (
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50"
                            onClick={nextImage}
                        >
                            <ChevronRight className="h-8 w-8" />
                        </button>
                    )}

                    <div className="relative max-w-full max-h-[90vh] flex flex-col items-center">
                        <img
                            src={lightboxImages[lightboxIndex]}
                            alt={`Gallery ${lightboxIndex + 1}`}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <p className="text-white/70 mt-4 text-sm font-medium">
                            {lightboxIndex + 1} / {lightboxImages.length}
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}
