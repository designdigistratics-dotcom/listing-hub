"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function AuthToggle() {
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState<"signup" | "login">("login");
    const [isHovered, setIsHovered] = useState<"signup" | "login" | null>(null);

    useEffect(() => {
        if (pathname === "/register") {
            setActiveTab("signup");
        } else {
            setActiveTab("login");
        }
    }, [pathname]);

    const displayTab = isHovered || activeTab;

    return (
        <div className="relative flex items-center bg-teal-950/5 backdrop-blur-xl border border-teal-900/10 rounded-full p-1.5 h-[52px] w-[210px] shadow-inner overflow-hidden">
            {/* Sliding Indicator */}
            <div
                className={cn(
                    "absolute h-[40px] rounded-full bg-teal-900 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-lg shadow-teal-900/30",
                    displayTab === "signup" ? "translate-x-0 w-[100px]" : "translate-x-[98px] w-[100px]"
                )}
            />

            {/* Sign Up Link */}
            <Link
                href="/register"
                onMouseEnter={() => setIsHovered("signup")}
                onMouseLeave={() => setIsHovered(null)}
                className={cn(
                    "relative z-10 flex-1 flex items-center justify-center text-sm font-bold transition-colors duration-300 h-full",
                    displayTab === "signup" ? "text-white" : "text-teal-800/80 hover:text-teal-900"
                )}
            >
                Sign Up
            </Link>

            {/* Login Link */}
            <Link
                href="/login"
                onMouseEnter={() => setIsHovered("login")}
                onMouseLeave={() => setIsHovered(null)}
                className={cn(
                    "relative z-10 flex-1 flex items-center justify-center text-sm font-bold tracking-wide transition-colors duration-300 h-full",
                    displayTab === "login" ? "text-white" : "text-teal-800/80 hover:text-teal-900"
                )}
            >
                LOGIN
            </Link>
        </div>
    );
}
