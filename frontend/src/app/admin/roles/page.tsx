"use client";

import { useEffect, useState } from "react";
import { adminAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Shield,
    Plus,
    Edit,
    Trash2,
    Lock,
    Users,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    isSystem: boolean;
    _count?: {
        users: number;
    };
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);

    // Dialog State
    const [showDialog, setShowDialog] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        permissions: [] as string[],
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesRes, permsRes] = await Promise.all([
                adminAPI.getRoles(),
                adminAPI.getPermissions()
            ]);
            setRoles(rolesRes.data);
            setAvailablePermissions(permsRes.data.permissions);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load roles");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingRole(null);
        setFormData({ name: "", description: "", permissions: [] });
        setShowDialog(true);
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            description: role.description || "",
            permissions: role.permissions,
        });
        setShowDialog(true);
    };

    const handleDelete = async (role: Role) => {
        if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;

        try {
            await adminAPI.deleteRole(role.id);
            toast.success("Role deleted successfully");
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete role");
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Role name is required");
            return;
        }

        setSaving(true);
        try {
            if (editingRole) {
                await adminAPI.updateRole(editingRole.id, formData);
                toast.success("Role updated successfully");
            } else {
                await adminAPI.createRole(formData);
                toast.success("Role created successfully");
            }
            setShowDialog(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to save role");
        } finally {
            setSaving(false);
        }
    };

    const togglePermission = (perm: string) => {
        setFormData(prev => {
            const newPerms = prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm];
            return { ...prev, permissions: newPerms };
        });
    };

    const toggleAllPermissions = () => {
        if (formData.permissions.length === availablePermissions.length) {
            setFormData({ ...formData, permissions: [] });
        } else {
            setFormData({ ...formData, permissions: [...availablePermissions] });
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-heading font-bold">
                        Roles & Permissions
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage roles and access levels for admin users
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <Card key={role.id} className="flex flex-col">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <CardTitle className="font-semibold text-lg flex items-center gap-2">
                                    {role.isSystem && <Lock className="h-4 w-4 text-amber-500" />}
                                    {role.name}
                                </CardTitle>
                                {role.isSystem && (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">System</Badge>
                                )}
                            </div>
                            <CardDescription>
                                {role.description || "No description provided"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Users className="h-4 w-4" />
                                {role._count?.users || 0} Users assigned
                            </div>
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Permissions ({role.permissions.includes('all') ? 'ALL' : role.permissions.length})
                                </span>
                                <div className="flex flex-wrap gap-1">
                                    {role.permissions.includes('all') ? (
                                        <Badge className="bg-slate-900">All Access</Badge>
                                    ) : (
                                        role.permissions.slice(0, 5).map(perm => (
                                            <Badge key={perm} variant="outline" className="text-xs bg-slate-50">
                                                {perm}
                                            </Badge>
                                        ))
                                    )}
                                    {!role.permissions.includes('all') && role.permissions.length > 5 && (
                                        <Badge variant="outline" className="text-xs">+{role.permissions.length - 5} more</Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2 border-t flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(role)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            {!role.isSystem && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(role)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
                        <DialogDescription>
                            Configure role details and permissions
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Content Manager"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={editingRole?.isSystem}
                                />
                                {editingRole?.isSystem && <p className="text-xs text-amber-600">System role names cannot be changed</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe what this role is for..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Permissions</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleAllPermissions}
                                    className="h-8 text-xs"
                                >
                                    {formData.permissions.length === availablePermissions.length ? "Deselect All" : "Select All"}
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg bg-slate-50">
                                {availablePermissions.map((perm) => (
                                    <div key={perm} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`perm-${perm}`}
                                            checked={formData.permissions.includes(perm)}
                                            onCheckedChange={() => togglePermission(perm)}
                                        />
                                        <Label
                                            htmlFor={`perm-${perm}`}
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {perm.replace('_', ' ')}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving ? "Saving..." : "Save Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
