"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import {
    Users,
    Plus,
    Search,
    Edit,
    Shield,
    Mail,
    Calendar,
    MoreVertical,
} from "lucide-react";

interface AdminUser {
    id: string;
    email: string;
    name?: string;
    role: string;
    roleId?: string;
    userRole?: {
        name: string;
        permissions: string[];
    };
    permissions?: string[];
    isActive: boolean;
    createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
    SUPER_ADMIN: "bg-purple-500",
    SUB_ADMIN: "bg-indigo-500",
    ACCOUNTS: "bg-green-500",
    OPS: "bg-blue-500",
    SALES: "bg-orange-500",
    PRODUCT: "bg-pink-500",
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getUsers();
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.userRole?.name || user.role).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggleStatus = async (id: string, isActive: boolean) => {
        try {
            await adminAPI.updateUser(id, { isActive: !isActive });
            fetchUsers();
        } catch (error) {
            console.error("Error toggling user status:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-heading font-bold">
                        Admin Users
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage admin team members and permissions
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/roles">
                        <Button variant="outline">
                            <Shield className="h-4 w-4 mr-2" />
                            Manage Roles
                        </Button>
                    </Link>
                    <Link href="/admin/users/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Admin User
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name, email, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Users Grid */}
            {filteredUsers.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((user) => (
                        <Card
                            key={user.id}
                            className={`card-hover ${!user.isActive ? "opacity-60" : ""}`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-12 h-12 rounded-full ${ROLE_COLORS[user.role] || "bg-slate-500"
                                                } flex items-center justify-center text-white font-semibold`}
                                        >
                                            {user.name?.[0] || user.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {user.name || user.email.split("@")[0]}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant={user.isActive ? "success" : "secondary"}>
                                        {user.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium capitalize">
                                            {user.userRole?.name || user.role.toLowerCase().replace("_", " ")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>Since {formatDate(user.createdAt)}</span>
                                    </div>
                                </div>

                                {user.permissions && user.permissions.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {user.permissions.slice(0, 3).map((perm) => (
                                            <Badge key={perm} variant="outline" className="text-xs">
                                                {perm}
                                            </Badge>
                                        ))}
                                        {user.permissions.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{user.permissions.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Link href={`/admin/users/${user.id}/edit`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                                    >
                                        {user.isActive ? "Deactivate" : "Activate"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-12">
                    <CardContent>
                        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No Admin Users Found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchQuery
                                ? "Try adjusting your search"
                                : "Add your first admin user"}
                        </p>
                        {!searchQuery && (
                            <Link href="/admin/users/new">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Admin User
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
