"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Lock, Trash2 } from "lucide-react";
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
import { toast } from "sonner";
import { adminAPI } from "@/lib/api";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [roles, setRoles] = useState<any[]>([]);

    // Form States
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        roleId: "",
        customPermissions: [] as string[],
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [userRes, rolesRes] = await Promise.all([
                    adminAPI.getUser(userId),
                    adminAPI.getRoles()
                ]);

                const user = userRes.data;
                const availableRoles = rolesRes.data;
                setRoles(availableRoles);

                // Determine default role selection
                let roleId = user.roleId || "";
                if (!roleId && user.role) {
                    // Try to find role by name if roleId is missing (legacy)
                    const matchingRole = availableRoles.find((r: any) => r.name === user.role);
                    if (matchingRole) roleId = matchingRole.id;
                }

                setFormData({
                    name: user.name || "",
                    email: user.email || "",
                    role: user.role || "SALES",
                    roleId: roleId,
                    customPermissions: user.customPermissions || [],
                });
            } catch (error: any) {
                console.error(error);
                toast.error("Failed to fetch user details");
                router.push("/admin/users");
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            loadData();
        }
    }, [userId, router]);

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (roleId: string) => {
        const selectedRole = roles.find((r) => r.id === roleId);
        if (!selectedRole) return;

        const isStandardEnum = ["SUPER_ADMIN", "SUB_ADMIN", "ACCOUNTS", "OPS", "SALES", "PRODUCT"].includes(selectedRole.name);

        setFormData((prev) => ({
            ...prev,
            roleId: roleId,
            role: isStandardEnum ? selectedRole.name : "SUB_ADMIN"
        }));
    };

    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await adminAPI.updateUser(userId, formData);
            toast.success("User details updated successfully");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to update user");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsSaving(true);
        try {
            await adminAPI.changeUserPassword(userId, passwordData.newPassword);
            toast.success("Password updated successfully");
            setPasswordData({ newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to update password");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDeleteUser = async () => {
        try {
            await adminAPI.deleteUser(userId);
            toast.success("User deleted successfully");
            router.push("/admin/users");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to delete user");
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading user details...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
                        <p className="text-muted-foreground">
                            Manage details and permissions for {formData.name}
                        </p>
                    </div>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user account
                                and remove their access to the system.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteUser}>
                                Delete User
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <Tabs defaultValue="info" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="info">General Information</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>User Details</CardTitle>
                            <CardDescription>
                                Update the user's personal information and role access.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateInfo} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInfoChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInfoChange}
                                        required
                                    />
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
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Assigning a role will automatically grant associated permissions.
                                    </p>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card className="max-w-xl">
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>
                                Update the user's password. Ensure it is at least 6 characters long.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdatePassword} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={isSaving} variant="secondary">
                                        {isSaving ? "Updating..." : <><Lock className="mr-2 h-4 w-4" /> Update Password</>}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
