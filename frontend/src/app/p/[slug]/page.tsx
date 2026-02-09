import { notFound } from "next/navigation";
import Link from "next/link";
import { publicAPI } from "@/lib/api";
import { formatBudgetRange } from "@/lib/utils";
import {
    Building2,
    MapPin,
    Building,
    Phone,
    Mail,
    ArrowRight,
    ChevronRight,
} from "lucide-react";

interface Props {
    params: Promise<{ slug: string }>;
}

interface LandingPageData {
    id: string;
    name: string;
    slug: string;
    city: string;
    locality: string;
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
    heroImage?: string;
    projects: Array<{
        id: string;
        name: string;
        builderName: string;
        city: string;
        locality: string;
        propertyType: string;
        budgetMin: number;
        budgetMax: number;
        unitTypes: string[];
        heroImage?: string;
        highlights: string[];
        amenities: string[];
    }>;
}

async function getLandingPage(slug: string): Promise<LandingPageData | null> {
    try {
        const response = await publicAPI.getLandingPage(slug);
        return response.data;
    } catch {
        return null;
    }
}

export default async function LandingPage({ params }: Props) {
    const { slug } = await params;
    const data = await getLandingPage(slug);

    if (!data) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                        <Building2 className="h-8 w-8 text-primary" />
                        <span className="text-xl font-heading font-bold">
                            Listing<span className="text-primary">Hub</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <a
                            href="tel:+919876543210"
                            className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <Phone className="h-4 w-4" />
                            +91 98765 43210
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section
                className="relative py-16 md:py-24 bg-gradient-to-r from-primary/90 to-primary"
                style={{
                    backgroundImage: data.heroImage
                        ? `linear-gradient(rgba(0,137,123,0.85), rgba(0,137,123,0.9)), url(${data.heroImage})`
                        : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="container mx-auto px-4 text-center text-white">
                    <div className="flex items-center justify-center gap-2 text-white/80 mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>
                            {data.locality}, {data.city}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4">
                        {data.name}
                    </h1>
                    {data.description && (
                        <p className="text-lg text-white/90 max-w-2xl mx-auto">
                            {data.description}
                        </p>
                    )}
                    <div className="mt-8 flex items-center justify-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {data.projects.length} Properties
                        </span>
                    </div>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-heading font-bold mb-8">
                        Featured Properties
                    </h2>

                    {data.projects.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/project/${project.id}`}
                                    className="group"
                                >
                                    <article className="bg-white rounded-xl shadow-soft overflow-hidden card-hover">
                                        {/* Image */}
                                        <div
                                            className="h-48 bg-cover bg-center bg-slate-100 relative"
                                            style={{
                                                backgroundImage: project.heroImage
                                                    ? `url(${project.heroImage})`
                                                    : undefined,
                                            }}
                                        >
                                            {!project.heroImage && (
                                                <div className="h-full flex items-center justify-center">
                                                    <Building className="h-12 w-12 text-slate-300" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
                                                    {Array.isArray(project.propertyType) ? project.propertyType.join(', ') : project.propertyType}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
                                                {project.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                by {project.builderName}
                                            </p>

                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                                <MapPin className="h-4 w-4" />
                                                <span>
                                                    {project.locality}, {project.city}
                                                </span>
                                            </div>

                                            <div className="text-lg font-bold text-primary mb-3">
                                                {formatBudgetRange(project.budgetMin, project.budgetMax)}
                                            </div>

                                            {project.unitTypes.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {project.unitTypes.slice(0, 3).map((type) => (
                                                        <span
                                                            key={type}
                                                            className="px-2 py-1 bg-slate-100 text-xs rounded"
                                                        >
                                                            {type}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center text-primary font-medium text-sm">
                                                View Details
                                                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl">
                            <Building className="h-16 w-16 mx-auto mb-4 text-slate-200" />
                            <h3 className="text-xl font-semibold mb-2">
                                No Properties Available
                            </h3>
                            <p className="text-muted-foreground">
                                Check back soon for new listings in this area.
                            </p>
                        </div>
                    )}
                </div>
            </section>

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

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const data = await getLandingPage(slug);

    if (!data) {
        return {
            title: "Page Not Found",
        };
    }

    return {
        title: data.metaTitle || `${data.name} | Properties in ${data.locality}, ${data.city}`,
        description:
            data.metaDescription ||
            `Explore premium properties in ${data.locality}, ${data.city}. Find your dream home today.`,
    };
}
