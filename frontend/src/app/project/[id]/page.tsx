"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { publicAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatBudgetRange } from "@/lib/utils";
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
    propertyType: string;
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
    const [currentImage, setCurrentImage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState("");
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
                projectId,
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

    const openLightbox = (imageUrl: string) => {
        setLightboxImage(imageUrl);
        setLightboxOpen(true);
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
        <div className="min-h-screen bg-slate-50">
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
                        <Button onClick={scrollToEnquiry} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all shadow-md hover:shadow-lg">
                            Enquire
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-end">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: heroImage
                            ? `url(${heroImage})`
                            : 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)',
                    }}
                >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                </div>

                {/* Hero Content */}
                <div className="relative container mx-auto px-4 py-12 md:py-20">
                    <div className="grid lg:grid-cols-5 gap-8 items-end">
                        {/* Project Info - Left Side */}
                        <div className="lg:col-span-3 text-white">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge className="bg-teal-600 hover:bg-teal-700 text-white border-0 px-3 py-1 text-sm font-medium shadow-sm">
                                    {project.propertyType}
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
                                            className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
                                            size="lg"
                                            disabled={submitting || !otpVerified}
                                        >
                                            {submitting ? "Submitting..." : "Submit Enquiry"}
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
            <div className="container mx-auto px-4 py-12 space-y-12">

                {/* About Project */}
                {project.aboutProject && (
                    <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-teal-800">
                            <Building className="h-6 w-6 text-teal-600" />
                            About {project.name}
                        </h2>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                            {project.aboutProject}
                        </p>
                    </section>
                )}

                {/* Highlights */}
                {project.highlights?.length > 0 && (
                    <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-teal-800">
                            <Star className="h-6 w-6 text-teal-600" />
                            Key Highlights
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {project.highlights.map((highlight, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 border border-teal-100">
                                        <Check className="h-4 w-4 text-teal-600" />
                                    </div>
                                    <span className="text-slate-700">{highlight}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Floor Plans */}
                {project.floorPlans && project.floorPlans.length > 0 && (
                    <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-teal-800">
                            <Ruler className="h-6 w-6 text-teal-600" />
                            Floor Plans
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {project.floorPlans.map((fp, idx) => (
                                <div
                                    key={idx}
                                    className="group border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                                    onClick={() => openLightbox(typeof fp === 'string' ? fp : fp.url)}
                                >
                                    <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                                        <img
                                            src={typeof fp === 'string' ? fp : fp.url}
                                            alt={typeof fp === 'string' ? `Floor Plan ${idx + 1}` : (fp.description || `Floor Plan ${idx + 1}`)}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {galleryImages.map((img, idx) => (
                                <div
                                    key={idx}
                                    className="aspect-video rounded-xl overflow-hidden cursor-pointer group"
                                    onClick={() => openLightbox(img)}
                                >
                                    <img
                                        src={img}
                                        alt={`Gallery ${idx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Amenities */}
                {project.amenities?.length > 0 && (
                    <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-teal-800">
                            <Home className="h-6 w-6 text-teal-600" />
                            Amenities
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {project.amenities.map((amenity, idx) => {
                                const Icon = getAmenityIcon(amenity);
                                return (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 border border-teal-100">
                                            <Icon className="h-5 w-5 text-teal-600" />
                                        </div>
                                        <span className="text-slate-700 font-medium">{amenity}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Video */}
                {project.videoUrl && (
                    <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-teal-800">
                            <Play className="h-6 w-6 text-teal-600" />
                            Project Video
                        </h2>
                        <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                            <iframe
                                src={project.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                                title={`${project.name} Video`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </section>
                )}

                {/* Builder Info */}
                {(project.advertiser || project.builderDescription) && (
                    <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-white">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            {project.advertiserLogo ? (
                                <img
                                    src={project.advertiserLogo}
                                    alt={project.advertiser?.companyName || project.builderName}
                                    className="w-20 h-20 rounded-xl object-contain bg-white p-2"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center">
                                    <Building className="h-10 w-10 text-white/50" />
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="text-white/60 text-sm uppercase tracking-wider mb-1">Advertiser</p>
                                <h3 className="text-2xl font-bold mb-2">
                                    {project.advertiser?.companyName || project.builderName}
                                </h3>
                                {project.builderDescription && (
                                    <p className="text-white/70 mb-4">{project.builderDescription}</p>
                                )}
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-teal-500/20 text-teal-400 border-0">
                                        <Verified className="h-3 w-3 mr-1" />
                                        Verified Advertiser
                                    </Badge>
                                </div>
                            </div>
                            {project.advertiser?.phone && (
                                <button
                                    onClick={scrollToEnquiry}
                                    className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
                                >
                                    <Phone className="h-5 w-5" />
                                    Call Advertiser
                                </button>
                            )}
                        </div>
                    </section>
                )}

                {/* Location */}
                {project.address && (
                    <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-teal-800">
                            <MapPin className="h-6 w-6 text-teal-600" />
                            Location
                        </h2>
                        <p className="text-slate-600 text-lg">{project.address}</p>
                        <p className="text-slate-500 mt-2">{project.locality}, {project.city}</p>
                    </section>
                )}

                {/* Location Highlights */}
                {project.locationHighlights && project.locationHighlights?.length > 0 && (
                    <section className="bg-gradient-to-r from-teal-50 to-orange-50 rounded-2xl p-6 md:p-8 border border-teal-100">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                            <MapPin className="h-6 w-6 text-teal-600" />
                            Location Highlights
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {project.locationHighlights.map((highlight, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                                        <Check className="h-4 w-4 text-teal-600" />
                                    </div>
                                    <span className="text-slate-700">{highlight}</span>
                                </div>
                            ))}
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
                    <Button onClick={scrollToEnquiry} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md">
                        Enquire
                    </Button>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setLightboxOpen(false)}
                >
                    <button
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        onClick={() => setLightboxOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <img
                        src={lightboxImage}
                        alt="Full size"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-8 mt-12 pb-24 md:pb-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-2">
                            <Building2 className="h-6 w-6 text-teal-400" />
                            <span className="text-lg font-heading font-bold">
                                <span className="text-teal-400">Topickx</span>
                            </span>
                        </div>
                        <p className="text-sm text-slate-400">
                            © {new Date().getFullYear()} Topickx. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
