"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { publicAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBudgetRange } from "@/lib/utils";
import {
    Building2,
    MapPin,
    Building,
    Phone,
    Mail,
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
    MessageSquare,
    CheckCircle2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { OtpInput } from "@/components/ui/otp-input";
import { toast } from "sonner";

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
    heroImage?: string;
    projectLogo?: string;
    advertiserLogo?: string;
    possessionStatus: string;
    reraId?: string;
    advertiser?: {
        companyName: string;
        phone?: string;
    };
    is_preview?: boolean;
    status?: string;
}

const AMENITY_ICONS: Record<string, any> = {
    "swimming pool": Droplets,
    "gym": Dumbbell,
    "garden": Trees,
    "parking": Car,
    "security": Shield,
    "wifi": Wifi,
    "power backup": Zap,
    "club house": Users,
};

export default function ProjectPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [project, setProject] = useState<ProjectData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImage, setCurrentImage] = useState(0);
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
                // If project not found (not live), try preview mode
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
            // Record visit
            publicAPI.recordVisit({ projectId }).catch(err => console.error("Error recording visit:", err));
        }
    }, [projectId]);

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
                landingPageId: "direct",
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Building className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                    <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
                    <p className="text-muted-foreground mb-4">
                        This project may have been removed or is no longer available.
                    </p>
                    <Link href="/">
                        <Button>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const images =
        project.images.length > 0
            ? project.images
            : project.heroImage
                ? [project.heroImage]
                : [];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Preview Banner */}
            {project.is_preview && project.possessionStatus && project['status'] !== 'LIVE' && (
                <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium">
                    ⚠️ Preview Mode - This project is not yet live on the landing page
                </div>
            )}

            {/* Navigation */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                        <Building2 className="h-8 w-8 text-primary" />
                        <span className="text-xl font-heading font-bold">
                            Listing<span className="text-primary">Hub</span>
                        </span>
                    </Link>
                    <a
                        href="tel:+919876543210"
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                        <Phone className="h-4 w-4" />
                        <span className="hidden sm:inline">Contact Us</span>
                    </a>
                </div>
            </header>

            {/* Back Button */}
            <div className="container mx-auto px-4 py-4">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to listings
                </Link>
            </div>

            <div className="container mx-auto px-4 pb-16">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        {images.length > 0 && (
                            <div className="relative rounded-xl overflow-hidden">
                                <div
                                    className="aspect-video bg-cover bg-center bg-slate-100"
                                    style={{ backgroundImage: `url(${images[currentImage]})` }}
                                />
                                {images.length > 1 && (
                                    <>
                                        <button
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                                            onClick={() =>
                                                setCurrentImage(
                                                    currentImage === 0 ? images.length - 1 : currentImage - 1
                                                )
                                            }
                                        >
                                            <ChevronLeft className="h-6 w-6" />
                                        </button>
                                        <button
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                                            onClick={() =>
                                                setCurrentImage(
                                                    currentImage === images.length - 1 ? 0 : currentImage + 1
                                                )
                                            }
                                        >
                                            <ChevronRight className="h-6 w-6" />
                                        </button>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                            {images.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentImage ? "bg-white" : "bg-white/50"
                                                        }`}
                                                    onClick={() => setCurrentImage(idx)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Project Header */}
                        <div className="bg-white rounded-xl p-6 shadow-soft">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>
                                            {project.locality}, {project.city}
                                        </span>
                                        {project.reraId && (
                                            <Badge variant="outline" className="ml-2">
                                                RERA: {project.reraId}
                                            </Badge>
                                        )}
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-heading font-bold mb-1">
                                        {project.name}
                                    </h1>
                                    <p className="text-muted-foreground">by {project.builderName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Starting from</p>
                                    <p className="text-2xl md:text-3xl font-bold text-primary">
                                        {formatBudgetRange(project.budgetMin, project.budgetMax)}
                                    </p>
                                    {project.priceDetails && (
                                        <p className="text-sm text-muted-foreground">
                                            {project.priceDetails}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                                <div>
                                    <p className="text-sm text-muted-foreground">Property Type</p>
                                    <p className="font-semibold">{project.propertyType}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Configuration</p>
                                    <p className="font-semibold">{project.unitTypes.join(", ")}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Possession</p>
                                    <p className="font-semibold">{project.possessionStatus}</p>
                                </div>
                                {project.address && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Address</p>
                                        <p className="font-semibold line-clamp-1">{project.address}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Highlights */}
                        {project.highlights.length > 0 && (
                            <div className="bg-white rounded-xl p-6 shadow-soft">
                                <h2 className="text-xl font-semibold mb-4">Highlights</h2>
                                <ul className="grid md:grid-cols-2 gap-3">
                                    {project.highlights.map((highlight, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                            <span>{highlight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Amenities */}
                        {project.amenities.length > 0 && (
                            <div className="bg-white rounded-xl p-6 shadow-soft">
                                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {project.amenities.map((amenity, idx) => {
                                        const Icon = getAmenityIcon(amenity);
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
                                            >
                                                <Icon className="h-5 w-5 text-primary" />
                                                <span className="text-sm">{amenity}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Contact Form */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card className="shadow-soft">
                                <CardHeader>
                                    <CardTitle>Get More Details</CardTitle>
                                    <CardDescription>
                                        Fill in your details and our team will contact you shortly
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {submitted ? (
                                        <div className="text-center py-6">
                                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                                <Check className="h-8 w-8 text-green-600" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">
                                                Thank You!
                                            </h3>
                                            <p className="text-muted-foreground mb-4">
                                                We've received your inquiry. Our team will contact you soon.
                                            </p>

                                            {/* Advertiser Contact Details */}
                                            {project.advertiser && (
                                                <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        Or contact directly:
                                                    </p>
                                                    <div className="flex flex-col items-center gap-2">
                                                        <p className="font-semibold text-lg">
                                                            {project.advertiser.companyName}
                                                        </p>
                                                        {project.advertiser.phone && (
                                                            <a
                                                                href={`tel:${project.advertiser.phone}`}
                                                                className="flex items-center gap-2 text-primary hover:underline font-medium"
                                                            >
                                                                <Phone className="h-4 w-4" />
                                                                {project.advertiser.phone}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Your name"
                                                    value={formData.name}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, name: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="10-digit mobile number"
                                                    value={formData.phone}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, phone: e.target.value })
                                                    }
                                                    required
                                                    disabled={otpSent || otpVerified}
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
                                                        className="mt-2 w-full"
                                                        onClick={handleSendOtp}
                                                        disabled={sendingOtp || !formData.phone || formData.phone.length !== 10}
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
                                                            className="w-full"
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
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="Your email"
                                                    value={formData.email}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, email: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                className="w-full bg-primary hover:bg-primary/90"
                                                size="lg"
                                                disabled={submitting || !otpVerified}
                                            >
                                                {submitting ? "Submitting..." : "Submit Inquiry"}
                                            </Button>
                                            <p className="text-xs text-center text-muted-foreground">
                                                By submitting, you agree to our terms and privacy policy
                                            </p>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Builder Info */}
                            {project.advertiser && (
                                <Card className="mt-4 shadow-soft">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            {project.advertiserLogo ? (
                                                <img
                                                    src={project.advertiserLogo}
                                                    alt={project.advertiser.companyName}
                                                    className="w-12 h-12 rounded-lg object-contain bg-slate-100"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Building className="h-6 w-6 text-primary" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold">
                                                    {project.advertiser.companyName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Verified Developer
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-2">
                            <Building2 className="h-6 w-6 text-primary" />
                            <span className="text-lg font-heading font-bold">
                                Listing<span className="text-primary">Hub</span>
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
