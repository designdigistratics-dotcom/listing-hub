"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { publicAPI } from "@/lib/api";
import { getImageUrl, getProjectUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  Building2,
  ArrowRight,
  ChevronRight,
  BarChart3,
  Users,
  Zap,
  MapPin,
  TrendingUp,
} from "lucide-react";
import Footer from "@/components/Footer";
import AuthToggle from "@/components/AuthToggle";
import dynamic from "next/dynamic";
import Counter from "@/components/Counter";

// Dynamically import SplineScene to avoid SSR issues and improve initial load
const SplineScene = dynamic(() => import("@/components/SplineScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-emerald-800/40 font-medium">
      Loading 3D Scene...
    </div>
  ),
});

export default function HomePage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await publicAPI.getLandingPages();
        const lpData = response.data || [];
        setLandingPages(lpData);

        // Map projects from landing pages
        const allProjects = lpData.flatMap((lp: any) => lp.projects || []);
        const uniqueProjects = Array.from(new Map(allProjects.map((p: any) => [p.id, p])).values()).slice(0, 6);
        setProjects(uniqueProjects);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdfa] via-[#ccfbf1] to-[#99f6e4] text-emerald-950 selection:bg-teal-200 selection:text-teal-900 overflow-x-hidden">
      {/* Texture Overlay for Premium Feel */}
      <div className="fixed inset-0 opacity-[0.4] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay z-0"></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-teal-900/5 backdrop-blur-md flex items-center justify-center border border-teal-900/10 group-hover:bg-teal-900/10 transition-all">
                <Building2 className="w-5 h-5 text-teal-800" />
              </div>
              <span className="font-bold text-xl tracking-tight text-teal-900">
                Topickx
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8 text-base font-medium text-teal-800/80">
              {[
                { label: 'Advertise', href: user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/register" },
                { label: 'Features', href: '#features' },
                { label: 'Contact', href: '/contact' }
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="hover:text-teal-950 transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-600 transition-all group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
                  <Button className="rounded-full bg-teal-900 text-white hover:bg-teal-800 font-semibold px-6 shadow-lg shadow-teal-900/10">
                    Dashboard
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              ) : (
                <AuthToggle />
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-teal-900"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-teal-100 p-4 space-y-4 shadow-2xl">
              {[
                { label: 'Advertise', href: user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/register" },
                { label: 'Features', href: '#features' },
                { label: 'Contact', href: '/contact' }
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-teal-900 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-teal-100 flex flex-col gap-3">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-teal-900 text-white">Login</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6 lg:px-8 max-w-[1400px] mx-auto min-h-screen flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Content */}
          <div className="relative z-10 space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-1000">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-teal-950 drop-shadow-sm">
              Advertise Your Projects to <br />
              <span className="text-teal-600">Qualified Buyers</span>
            </h1>

            <p className="text-lg sm:text-xl text-teal-800/80 max-w-lg leading-relaxed font-light">
              Get your real estate projects featured on high-converting landing pages. Reach buyers actively searching in your target locations.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/register"}>
                <Button
                  size="lg"
                  className="h-14 px-8 rounded-full bg-teal-900 text-white hover:bg-teal-800 font-bold text-lg shadow-[0_0_40px_-10px_rgba(13,148,136,0.2)] hover:shadow-[0_0_60px_-10px_rgba(13,148,136,0.3)] transition-all duration-300 group"
                >
                  {user ? 'Go to Dashboard' : 'Start Advertising'}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 rounded-full border-teal-900/10 text-teal-900 hover:bg-teal-900/5 font-medium text-lg backdrop-blur-sm"
                >
                  Learn more
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="pt-12 mt-12">
              <div className="inline-flex items-center gap-12 p-8 rounded-[2rem] bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl shadow-teal-900/10 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-500">
                {[
                  { label: 'Active Listings', end: 1500, suffix: '+' },
                  { label: 'Trusted Agents', end: 300, suffix: '+' },
                  { label: 'Satisfied Families', end: 50, suffix: 'k+' },
                ].map((stat, i) => (
                  <div key={i} className="relative group">
                    <div className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-indigo-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                      <Counter end={stat.end} suffix={stat.suffix} />
                    </div>
                    <div className="text-[10px] text-teal-900/40 font-black uppercase tracking-[0.25em] mt-2 group-hover:text-teal-900/60 transition-colors">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Spline 3D */}
          <div className="relative h-[500px] lg:h-[700px] w-full animate-in fade-in duration-1000 delay-300 lg:-mr-20">
            {/* Glow Effect behind model */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-teal-400/20 blur-[120px] rounded-full pointer-events-none" />

            <SplineScene
              scene="https://prod.spline.design/wAnPbyrX2X70LI56/scene.splinecode"
              className="transform scale-110 lg:scale-125"
            />
          </div>

        </div>
      </section>


      {/* Why Choose Topickx Section */}
      <section id="features" className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 animate-in slide-in-from-bottom-5 fade-in duration-700">
            <h2 className="text-3xl sm:text-4xl font-bold text-teal-950 mb-4">
              Why Choose Topickx?
            </h2>
            <p className="text-teal-800/70 text-lg max-w-2xl mx-auto font-light">
              The smartest way to list, track, and sell real estate projects with modern technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Project Listings",
                description: "Create stunning, high-converting pages for your real estate projects in minutes.",
                icon: <Building2 className="w-6 h-6 text-teal-600" />,
              },
              {
                title: "Lead Tracking",
                description: "Monitor every interaction and track where your most qualified leads are coming from.",
                icon: <BarChart3 className="w-6 h-6 text-teal-600" />,
              },
              {
                title: "Qualified Leads",
                description: "Get connected with buyers who are pre-screened based on their search preferences.",
                icon: <Users className="w-6 h-6 text-teal-600" />,
              },
              {
                title: "Quick Setup",
                description: "Our easy-to-use dashboard lets you go live and start capturing leads instantly.",
                icon: <Zap className="w-6 h-6 text-teal-600" />,
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 group border border-teal-50">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-teal-950 mb-3">{feature.title}</h3>
                <p className="text-teal-800/60 leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Location Section */}
      <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-in slide-in-from-bottom-5 fade-in duration-700">
          <h2 className="text-4xl font-bold text-teal-950 mb-4 tracking-tight">
            Browse by Location
          </h2>
          <p className="text-teal-800/70 text-lg max-w-2xl mx-auto font-light">
            Explore curated landing pages for top real estate markets
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {landingPages.map((lp: any, i: number) => (
            <Link
              key={lp.id}
              href={`/lp/${lp.slug}`}
              className="group relative bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-[2.5rem] shadow-xl shadow-teal-900/5 hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-500 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-5"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-teal-900/5 flex items-center justify-center border border-teal-900/10 group-hover:bg-teal-900 group-hover:border-teal-900 transition-all duration-300">
                  <MapPin className="w-6 h-6 text-teal-800 group-hover:text-white transition-colors" />
                </div>
                <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-none font-bold px-3 py-1">
                  City
                </Badge>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-teal-950 leading-tight">
                  Top Projects in {(lp.title || lp.name || 'Location').replace('Projects in ', '').replace('Top Projects in ', '')}
                </h3>
                <p className="text-teal-800/60 font-medium">
                  {lp.location || lp.city || 'Strategic Location'}
                </p>
                <div className="pt-4 flex items-center text-teal-900 font-bold group-hover:text-teal-700 transition-colors">
                  View Projects
                  <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Subtle Gradient Accent */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-indigo-400/0 via-blue-500/0 to-cyan-400/0 group-hover:from-indigo-400/5 group-hover:via-blue-500/5 group-hover:to-cyan-400/5 transition-all duration-500" />
            </Link>
          ))}
        </div>
      </section>
      <section id="projects" className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-800 text-sm font-bold tracking-wide uppercase">
              <TrendingUp className="w-4 h-4" />
              Verified Listings
            </div>
            <h2 className="text-4xl font-bold text-teal-950">
              Featured Projects
            </h2>
            <p className="text-teal-800/70 text-lg max-w-xl font-light">
              Hand-picked premium real estate opportunities in high-growth locations.
            </p>
          </div>
          <Link href="/search">
            <Button variant="ghost" className="text-teal-900 font-bold group">
              View All Projects
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-[450px] rounded-3xl bg-teal-900/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project: any) => (
              <Link
                key={project.id}
                href={getProjectUrl(project)}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-500 hover:-translate-y-2 border border-teal-50"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={getImageUrl(project.cardImage || project.heroImage || project.featuredImage)}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                    <Badge className="bg-white/90 backdrop-blur-md text-teal-900 border-none px-3 py-1 text-xs font-bold shadow-sm">
                      {project.propertyType || 'Residential'}
                    </Badge>
                    {project.usp1 && (
                      <Badge className="bg-amber-500/90 backdrop-blur-md text-white border-none px-3 py-1 text-xs font-bold shadow-sm">
                        {project.usp1}
                      </Badge>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="p-8 space-y-4">
                  <div className="flex items-center gap-2 text-teal-600/80 text-sm font-medium">
                    <MapPin className="w-4 h-4" />
                    {project.locality ? `${project.locality}, ${project.city}` : project.city}
                  </div>
                  <h3 className="text-2xl font-bold text-teal-950 group-hover:text-teal-700 transition-colors">
                    {project.name}
                  </h3>
                  <div className="pt-4 flex items-center justify-between border-t border-teal-50">
                    <div className="text-teal-900 font-bold text-xl">
                      {project.budgetMax ? `₹${(project.budgetMax / 10000000).toFixed(2)} Cr+` : 'Price on Request'}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-900 group-hover:bg-teal-900 group-hover:text-white transition-all duration-300">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
