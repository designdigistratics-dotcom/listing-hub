"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        setLoading(true);
        try {
            await authAPI.forgotPassword(email);
            setSubmitted(true);
            toast.success("Password reset instructions sent to your email");
        } catch (error) {
            // Still show success to prevent email enumeration
            console.error(error);
            setSubmitted(true);
            toast.success(
                "If an account exists with this email, you will receive password reset instructions"
            );
        } finally {
            setLoading(false);
        }
    };

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
                            ListingHub
                        </span>
                    </Link>

                    {submitted ? (
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                                Check Your Email
                            </h1>
                            <p className="text-slate-600 mb-8">
                                If an account exists with <strong>{email}</strong>, you will
                                receive password reset instructions shortly.
                            </p>
                            <Link href="/login">
                                <Button variant="outline" className="gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">
                                    Forgot Password?
                                </h1>
                                <p className="text-slate-600">
                                    Enter your email address and we'll send you instructions to
                                    reset your password.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 h-11"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Send Reset Instructions"}
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
                    )}
                </div>
            </div>

            {/* Right side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative bg-primary">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-center text-white">
                        <h2 className="font-heading text-4xl font-bold mb-4">
                            Secure Access
                        </h2>
                        <p className="text-lg text-white/80 max-w-md">
                            We take security seriously. Reset your password securely through
                            your email.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
