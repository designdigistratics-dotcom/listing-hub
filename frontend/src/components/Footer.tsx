"use client";

import Link from "next/link";
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
    return (
        <footer className="relative bg-[#050505] text-white pt-24 pb-12 overflow-hidden border-t border-white/5">
            {/* Premium Background Accents */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/5 blur-[100px] rounded-full translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative bg-emerald-600 p-2.5 rounded-xl border border-emerald-400/20 shadow-xl group-hover:-translate-y-1 transition-transform">
                                    <Building2 className="h-7 w-7 text-white" />
                                </div>
                            </div>
                            <span className="text-3xl font-black tracking-tighter">
                                Topick<span className="text-emerald-500 font-sans">x</span>
                            </span>
                        </Link>
                        <p className="text-slate-400 leading-relaxed text-sm font-medium">
                            The definitive destination for ultra-luxury real estate in India. Curating only the most prestigious addresses for the global citizen.
                        </p>
                        <div className="flex items-center gap-3">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/30 transition-all group">
                                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Discovery Links */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-8 relative inline-block">
                            Discovery
                            <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-amber-500 -mb-2" />
                        </h4>
                        <ul className="space-y-5">
                            {['Featured Projects', 'New Launches', 'Ready to Move', 'Investment Picks'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-slate-400 hover:text-white transition-all flex items-center gap-3 group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 scale-0 group-hover:scale-100 transition-transform" />
                                        <span className="group-hover:translate-x-1 transition-transform">{item}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-8 relative inline-block">
                            Platform
                            <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-amber-500 -mb-2" />
                        </h4>
                        <ul className="space-y-5">
                            {['About Topickx', 'Contact Support', 'Partner Portal', 'Post Your Project'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-slate-400 hover:text-white transition-all flex items-center gap-3 group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 scale-0 group-hover:scale-100 transition-transform" />
                                        <span className="group-hover:translate-x-1 transition-transform">{item}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Connect Section */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-8 relative inline-block">
                            Connect
                            <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-amber-500 -mb-2" />
                        </h4>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-400/10 transition-colors">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed pt-1">
                                    Corporate Office,<br />
                                    Sector 63, Noida, NCR
                                </p>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-400/10 transition-colors">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <p className="text-slate-400 text-sm font-semibold">+91 99999 00000</p>
                            </div>
                            <div className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-400/10 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <p className="text-slate-400 text-sm font-semibold hover:text-white transition-colors">hello@topickx.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Refined Bottom Bar */}
                <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col gap-2">
                        <p className="text-slate-500 text-xs text-center md:text-left font-medium tracking-wide">
                            © {new Date().getFullYear()} TOPICKX REAL ESTATE PRIVATE LIMITED.
                        </p>
                        <p className="text-slate-600 text-[10px] text-center md:text-left italic">
                            Redefining Luxury. Connecting Legacies.
                        </p>
                    </div>
                    <div className="flex items-center gap-10">
                        {['Privacy', 'Terms', 'Disclaimer'].map((item) => (
                            <Link key={item} href="#" className="text-slate-500 hover:text-amber-400 transition-all text-xs font-bold uppercase tracking-widest">
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
