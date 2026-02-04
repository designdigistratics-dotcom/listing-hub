"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
    const router = useRouter();
    const { register, loginWithGoogle, user } = useAuth();

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                // Using loginWithGoogle for signup as well since backend handles find-or-create
                const success = await loginWithGoogle(tokenResponse.access_token || "");
                if (success) {
                    toast.success("Account created successfully!");
                    router.push("/dashboard");
                }
            } catch (err: any) {
                toast.error("Google Signup failed");
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            toast.error("Google Signup Failed");
            setLoading(false);
        }
    });

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        companyName: "",
        phone: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push(user.role === "advertiser" ? "/dashboard" : "/admin");
        }
    }, [user, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.email || !formData.password || !formData.companyName) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            await register({
                email: formData.email,
                password: formData.password,
                companyName: formData.companyName,
                phone: formData.phone || undefined,
            });
            toast.success("Account created successfully!");
            router.push("/dashboard");
        } catch (err: any) {
            const errorDetail = err.response?.data?.detail || err.response?.data?.error;
            if (Array.isArray(errorDetail)) {
                toast.error(errorDetail.map((e: any) => e.msg || e.message || String(e)).join(', '));
            } else if (typeof errorDetail === 'object') {
                toast.error(errorDetail.msg || errorDetail.message || 'Registration failed');
            } else {
                toast.error(errorDetail || 'Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative bg-accent">
                <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent/80" />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-center text-white">
                        <h2 className="font-heading text-4xl font-bold mb-4">
                            Start Advertising Today
                        </h2>
                        <p className="text-lg text-white/80 max-w-md">
                            Create your advertiser account and get your real estate projects
                            in front of qualified buyers.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-display font-bold text-2xl text-slate-900">
                                Topickx
                            </span>
                        </Link>
                        <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">
                            Create account
                        </h1>
                        <p className="text-slate-600">
                            Register as an advertiser to get started
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            onClick={() => googleLogin()}
                            disabled={loading}
                        >
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Sign up with Google
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">
                                    Or sign up with email
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company / Builder Name *</Label>
                            <Input
                                id="companyName"
                                name="companyName"
                                placeholder="Enter your company name"
                                value={formData.companyName}
                                onChange={handleChange}
                                className="h-12"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                className="h-12"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone (Optional)</Label>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                className="h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="h-12 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password *</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="h-12"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-full bg-accent hover:bg-accent/90"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>

                    <p className="text-center mt-8 text-slate-600">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-primary font-medium hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
