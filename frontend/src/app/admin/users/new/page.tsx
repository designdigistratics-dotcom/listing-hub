"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { adminAPI } from "@/lib/api";

const ALLOWED_PERMISSIONS = [
    { id: "all", label: "Super Admin (All Access)" },
    { id: "admin_users", label: "Manage Admin Users" },
    { id: "packages", label: "Manage Packages" },
    { id: "payments", label: "Manage Payments" },
    { id: "billing", label: "View Billing" },
    { id: "renewals", label: "Manage Renewals" },
    { id: "projects", label: "Manage Projects" },
    { id: "placements", label: "Manage Placements" },
    { id: "landing_pages", label: "Manage Landing Pages" },
    { id: "advertisers", label: "Manage Advertisers" },
    { id: "leads", label: "View Leads" },
    { id: "audit_logs", label: "View Audit Logs" },
];

export default function NewUserPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [roles, setRoles] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "", // Enum value (fallback)
        roleId: "", // Dynamic Role ID
        customPermissions: [] as string[],
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await adminAPI.getRoles();
            setRoles(res.data);
        } catch (error) {
            console.error("Failed to fetch roles", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (roleId: string) => {
        const selectedRole = roles.find(r => r.id === roleId);
        if (!selectedRole) return;

        // Use role name if it matches Enum, else SUB_ADMIN
        const isStandardEnum = ["SUPER_ADMIN", "SUB_ADMIN", "ACCOUNTS", "OPS", "SALES", "PRODUCT"].includes(selectedRole.name);

        setFormData((prev) => ({
            ...prev,
            roleId: roleId,
            role: isStandardEnum ? selectedRole.name : "SUB_ADMIN"
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await adminAPI.createUser(formData);
            toast.success("User created successfully");
            router.push("/admin/users");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to create user");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add New User</h1>
                    <p className="text-muted-foreground">
                        Create a new administrator account with specific roles.
                    </p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>User Details</CardTitle>
                    <CardDescription>
                        Enter the core information for the new admin user.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.roleId}
                                onValueChange={handleRoleChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Roles determine the default permissions for the user.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    "Creating..."
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" /> Create User
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
