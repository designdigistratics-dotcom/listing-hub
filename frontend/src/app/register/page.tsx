"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
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
        <div className="min-h-screen flex w-full bg-white">
            {/* Left side - Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 xl:p-24">
                <div className="w-full max-w-[400px] space-y-10">
                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Create an account
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Enter your details to register as an advertiser
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Google Button */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium relative flex items-center justify-center gap-3 transition-all"
                            onClick={() => googleLogin()}
                            disabled={loading}
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                            <span>Sign up with Google</span>
                        </Button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-3 text-slate-400 font-medium">
                                    Or sign up with email
                                </span>
                            </div>
                        </div>

                        {/* Inputs */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName" className="text-sm font-medium text-slate-700">Company / Builder Name *</Label>
                                <Input
                                    id="companyName"
                                    name="companyName"
                                    placeholder="Enter your company name"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-400 transition-colors"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email *</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-400 transition-colors"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone (Optional)</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-400 transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password *</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create a password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-400 pr-10 transition-colors"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm *</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-400 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md shadow-sm transition-all text-sm"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </Button>

                        {/* Footer Link */}
                        <p className="text-center text-sm text-slate-500">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-slate-900 hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* Right side - Image Section */}
            <div className="hidden lg:block lg:w-1/2 bg-white p-4">
                <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden">
                    <img
                        src="/auth-bg.png"
                        alt="Luxury Home at Dusk"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
}
