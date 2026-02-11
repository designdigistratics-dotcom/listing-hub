"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { publicAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Building2,
  Users,
  MapPin,
  ArrowRight,
  Zap,
  BarChart3,
  ChevronRight,
} from "lucide-react";

interface LandingPage {
  id: string;
  name: string;
  slug: string;
  city: string;
  locality?: string;
  heroImage?: string;
  page_type?: string;
}

export default function HomePage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);

  useEffect(() => {
    publicAPI
      .getLandingPages()
      .then((res) => setLandingPages(res.data.slice(0, 6)))
      .catch(console.error);
  }, []);

  const features = [
    {
      icon: Building2,
      title: "Project Listings",
      description:
        "Showcase your real estate projects on curated landing pages designed for conversion.",
    },
    {
      icon: BarChart3,
      title: "Lead Tracking",
      description:
        "Track every lead with UTM parameters and detailed analytics.",
    },
    {
      icon: Users,
      title: "Qualified Leads",
      description:
        "Receive high-intent inquiries from buyers searching specific locations.",
    },
    {
      icon: Zap,
      title: "Quick Setup",
      description:
        "Get your project live within days with our streamlined approval process.",
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-slate-900">
                Topickx
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="#features"
                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link
                href="#locations"
                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
              >
                Locations
              </Link>
              {user ? (
                <Link
                  href={user.role === "admin" ? "/admin" : "/dashboard"}
                >
                  <Button className="rounded-full px-6">
                    Go to Dashboard
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <Button variant="ghost" className="rounded-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="rounded-full px-6 bg-accent hover:bg-accent/90">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4 space-y-3 animate-in slide-in-from-top-2">
            <Link
              href="#features"
              className="block py-2 text-slate-600 hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="#locations"
              className="block py-2 text-slate-600 hover:text-primary"
            >
              Locations
            </Link>
            {user ? (
              <Link
                href={user.role === "admin" ? "/admin" : "/dashboard"}
              >
                <Button className="w-full rounded-full">Go to Dashboard</Button>
              </Link>
            ) : (
              <div className="space-y-2 pt-2">
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full rounded-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="block">
                  <Button className="w-full rounded-full bg-accent hover:bg-accent/90">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-in slide-in-from-bottom-8 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Real Estate Advertising Platform
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6">
                Advertise Your Projects to{" "}
                <span className="text-primary">Qualified Buyers</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-xl">
                Get your real estate projects featured on high-converting
                landing pages. Reach buyers actively searching in your target
                locations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="rounded-full px-8 bg-accent hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all"
                  >
                    Start Advertising
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-8"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-slate-100">
                <div>
                  <p className="text-2xl font-bold text-slate-900">500+</p>
                  <p className="text-sm text-slate-500">Active Projects</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">10K+</p>
                  <p className="text-sm text-slate-500">Leads Generated</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">50+</p>
                  <p className="text-sm text-slate-500">Cities Covered</p>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block animate-in fade-in duration-1000">
              <div className="absolute -top-10 -left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=500&fit=crop"
                alt="Modern Real Estate"
                className="relative rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Topickx?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to advertise your real estate projects
              effectively
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section id="locations" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Browse by Location
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explore curated landing pages for top real estate markets
            </p>
          </div>
          {landingPages.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {landingPages.map((lp) => (
                <Link
                  key={lp.id}
                  href={`/p/${lp.slug}`}
                  className="group bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">
                      {lp.page_type || "City"}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-slate-900 mb-2 group-hover:text-primary transition-colors">
                    {lp.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {lp.city}
                    {lp.locality ? `, ${lp.locality}` : ""}
                  </p>
                  <div className="flex items-center text-sm text-primary font-medium">
                    View Projects
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
              <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No landing pages available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Simple steps to get your project advertised
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Request Package",
                desc: "Choose 3, 6, or 12 month advertising duration",
              },
              {
                step: "02",
                title: "Get Approved",
                desc: "Our team verifies your payment and activates the package",
              },
              {
                step: "03",
                title: "Submit Project",
                desc: "Add your project details, images, and amenities",
              },
              {
                step: "04",
                title: "Go Live",
                desc: "Admin assigns your project to a landing page and you start receiving leads",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                {index < 3 && (
                  <div
                    className="hidden md:block absolute top-8 left-full w-full h-px bg-slate-700"
                    style={{ width: "calc(100% - 2rem)" }}
                  />
                )}
                <div className="text-5xl font-heading font-bold text-primary/30 mb-4">
                  {item.step}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Ready to Advertise Your Project?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join hundreds of developers already getting qualified leads through
            Topickx.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="rounded-full px-10 bg-primary hover:bg-primary/90 shadow-lg"
              >
                Create Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-10"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
