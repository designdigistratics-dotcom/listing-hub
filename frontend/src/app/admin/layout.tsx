"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
    Building2,
    LayoutDashboard,
    Users,
    Building,
    Package,
    CreditCard,
    FolderOpen,
    Globe,
    UserCheck,
    Receipt,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    ChevronRight,
    FileText,
    RefreshCw,
    ListOrdered,
    FileCheck,
    BarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarGroups = [
    {
        name: "Overview",
        items: [
            { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        ],
    },
    {
        name: "User Management",
        items: [
            { name: "Admin Users", href: "/admin/users", icon: Users },
            { name: "Advertisers", href: "/admin/advertisers", icon: Building },
        ],
    },
    {
        name: "Packages & Billing",
        items: [
            { name: "Package Definitions", href: "/admin/packages", icon: Package },
            { name: "Payment Requests", href: "/admin/payments", icon: CreditCard },
            { name: "Billing Ledger", href: "/admin/billing", icon: Receipt },
            { name: "Renewals", href: "/admin/renewals", icon: RefreshCw },
        ],
    },
    {
        name: "Content",
        items: [
            { name: "Projects", href: "/admin/projects", icon: FolderOpen },
            { name: "Review Queue", href: "/admin/projects/review", icon: FileCheck },
            { name: "Placement Queue", href: "/admin/placement-queue", icon: ListOrdered },
            { name: "Landing Pages", href: "/admin/landing-pages", icon: Globe },
            { name: "Performance", href: "/admin/performance", icon: BarChart },
            { name: "Leads", href: "/admin/leads", icon: UserCheck },
        ],
    },
    {
        name: "Settings",
        items: [
            { name: "Options", href: "/admin/options", icon: Settings },
            { name: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
        ],
    },
];

const ADMIN_ROLES = ["SUPER_ADMIN", "SUB_ADMIN", "ACCOUNTS", "OPS", "SALES", "PRODUCT"];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (!loading && user && !ADMIN_ROLES.includes(user.role.toUpperCase())) {
            router.push("/dashboard");
        }
    }, [user, loading, router]);

    const toggleGroup = (groupName: string) => {
        setCollapsedGroups((prev) =>
            prev.includes(groupName)
                ? prev.filter((g) => g !== groupName)
                : [...prev, groupName]
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || !ADMIN_ROLES.includes(user.role.toUpperCase())) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
                        <Link href="/admin" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-display font-semibold text-lg text-slate-900">
                                Topickx
                            </span>
                        </Link>
                        <button
                            className="lg:hidden p-1 rounded-md hover:bg-slate-100 text-slate-500"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {sidebarGroups.map((group) => (
                            <div key={group.name} className="mb-4">
                                <button
                                    className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-primary transition-colors"
                                    onClick={() => toggleGroup(group.name)}
                                >
                                    {group.name}
                                    {collapsedGroups.includes(group.name) ? (
                                        <ChevronRight className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </button>
                                {!collapsedGroups.includes(group.name) && (
                                    <div className="mt-1 space-y-1">
                                        {group.items.map((item) => {
                                            const isActive =
                                                pathname === item.href ||
                                                (item.href !== "/admin" && pathname.startsWith(item.href));
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all text-sm",
                                                        isActive
                                                            ? "bg-primary text-white shadow-sm"
                                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                                    )}
                                                >
                                                    <item.icon className="h-5 w-5" />
                                                    {item.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* User Info & Logout */}
                    <div className="p-4 border-t border-slate-200">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                {user.name?.[0] || user.email[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                    {user.name || user.email}
                                </p>
                                <p className="text-xs text-slate-500 truncate capitalize">
                                    {user.role.toLowerCase().replace("_", " ")}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-slate-600 hover:text-red-600 hover:bg-red-50"
                            onClick={logout}
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Top Header */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between">
                    <button
                        className="lg:hidden p-2"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 capitalize hidden sm:inline-block">
                            {user.role.toLowerCase().replace("_", " ")}
                        </span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
