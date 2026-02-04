"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, ArrowLeft, Lock, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error("Invalid or missing reset token");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await authAPI.resetPassword(token, password);
            setSubmitted(true);
            toast.success("Password reset successfully");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.detail || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                    Invalid Link
                </h1>
                <p className="text-slate-600 mb-8 max-w-xs mx-auto">
                    This password reset link is invalid or has expired. Please request a new
                    one.
                </p>
                <Link href="/forgot-password">
                    <Button variant="default" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Forgot Password
                    </Button>
                </Link>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                    Password Reset!
                </h1>
                <p className="text-slate-600 mb-8">
                    Your password has been successfully updated. You can now login with your
                    new password.
                </p>
                <Link href="/login">
                    <Button className="w-full gap-2" size="lg">
                        Login Now
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="mb-8">
                <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">
                    Reset Password
                </h1>
                <p className="text-slate-600">Please enter your new password below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-11"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 h-11"
                            required
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                </Button>
            </form>

            <p className="text-center mt-8">
                <Link
                    href="/login"
                    className="text-sm text-slate-500 hover:text-primary hover:underline flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>
            </p>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex">
            {/* Left side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <Link href="/" className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-heading text-xl font-bold text-slate-900">
                            Topickx
                        </span>
                    </Link>

                    <Suspense fallback={<div>Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>

            {/* Right side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative bg-primary">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-center text-white">
                        <h2 className="font-heading text-4xl font-bold mb-4">
                            Set New Password
                        </h2>
                        <p className="text-lg text-white/80 max-w-md">
                            Choose a strong password to secure your account.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
