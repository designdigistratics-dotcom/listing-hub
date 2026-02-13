"use client";

import Link from "next/link";
import { MoveRight, Timer, Construction, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-8 py-20">
            {/* Visual Element */}
            <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full"></div>
                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl border border-emerald-100 ring-1 ring-emerald-500/5 transition-transform hover:scale-105 duration-500">
                    <Construction className="h-24 w-24 text-emerald-600 animate-pulse" />
                </div>
                <div className="absolute -top-4 -right-4 bg-amber-500 text-white p-3 rounded-2xl shadow-xl shadow-amber-500/20 rotate-12">
                    <Timer className="h-6 w-6" />
                </div>
            </div>

            {/* Text Content */}
            <div className="max-w-xl space-y-4">
                <h1 className="text-5xl md:text-6xl font-black text-emerald-950 tracking-tight leading-tight">
                    Coming <span className="text-emerald-600 italic">Soon</span>
                </h1>
                <p className="text-slate-500 text-lg md:text-xl leading-relaxed">
                    We're currently perfecting this space for you. This exclusive project experience will be live very shortly.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Button asChild className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-2xl px-8 h-14 text-lg font-bold shadow-xl shadow-emerald-900/20 group">
                    <Link href="/" className="flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        Back to Home
                        <MoveRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
                <Button variant="ghost" className="text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 h-14 px-8 text-lg font-semibold rounded-2xl transition-all">
                    View Other Projects
                </Button>
            </div>

            {/* Sub-text */}
            <p className="text-slate-400 text-sm font-medium pt-8 max-w-sm">
                Get notified when we launch. Follow us on social media or check back in a few days.
            </p>
        </div>
    );
}
