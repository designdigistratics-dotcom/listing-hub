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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Settings,
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    MapPin,
    Home,
    Tag,
    Check,
} from "lucide-react";

interface Option {
    id: string;
    category: string;
    value: string;
    label: string;
    isActive: boolean;
}

const CATEGORIES = [
    { id: "city", name: "Cities", icon: MapPin },
    { id: "location", name: "Localities", icon: MapPin },
    { id: "propertyType", name: "Property Types", icon: Home },
    { id: "amenity", name: "Amenities", icon: Check },
    { id: "unitType", name: "Unit Types", icon: Tag },
    { id: "possessionStatus", name: "Possession Status", icon: Tag },
];

export default function OptionsPage() {
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("city");
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newOption, setNewOption] = useState({ value: "", label: "" });
    const [editOption, setEditOption] = useState({ value: "", label: "" });
    const [parentOptions, setParentOptions] = useState<Option[]>([]);
    const [parentId, setParentId] = useState<string>("");

    useEffect(() => {
        if (activeCategory === 'location') {
            // Fetch cities for parent dropdown
            adminAPI.getOptions('city').then(res => setParentOptions(res.data));
        } else {
            setParentOptions([]);
            setParentId("");
        }
        fetchOptions();
    }, [activeCategory]);

    const fetchOptions = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getOptions(activeCategory);
            setOptions(response.data);
        } catch (error) {
            console.error("Error fetching options:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newOption.value || !newOption.label) return;
        try {
            await adminAPI.createOption({
                category: activeCategory,
                value: newOption.value,
                label: newOption.label,
                parentId: activeCategory === 'location' ? parentId : undefined,
            });
            setNewOption({ value: "", label: "" });
            setIsAdding(false);
            fetchOptions();
        } catch (error) {
            console.error("Error adding option:", error);
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            await adminAPI.updateOption(id, editOption);
            setEditingId(null);
            fetchOptions();
        } catch (error) {
            console.error("Error updating option:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this option?")) return;
        try {
            await adminAPI.deleteOption(id);
            fetchOptions();
        } catch (error) {
            console.error("Error deleting option:", error);
        }
    };

    const startEdit = (option: Option) => {
        setEditingId(option.id);
        setEditOption({ value: option.value, label: option.label });
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold">Options</h1>
                <p className="text-muted-foreground mt-1">
                    Manage dropdown options for forms
                </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Category Sidebar */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <nav className="space-y-1 p-2">
                            {CATEGORIES.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeCategory === category.id
                                        ? "bg-primary text-white"
                                        : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                >
                                    <category.icon className="h-5 w-5" />
                                    {category.name}
                                </button>
                            ))}
                        </nav>
                    </CardContent>
                </Card>

                {/* Options List */}
                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">
                                {CATEGORIES.find((c) => c.id === activeCategory)?.name}
                            </CardTitle>
                            <CardDescription>
                                Manage {activeCategory} options
                            </CardDescription>
                        </div>
                        {!isAdding && (
                            <Button onClick={() => setIsAdding(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Option
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {/* Add New Form */}
                        {isAdding && (
                            <div className="p-4 mb-4 rounded-lg border-2 border-dashed border-primary/50 bg-primary/5">
                                {activeCategory === 'location' && (
                                    <div className="mb-4">
                                        <Label>City</Label>
                                        <Select value={parentId} onValueChange={setParentId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a city" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {parentOptions.map((opt) => (
                                                    <SelectItem key={opt.id} value={opt.id}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                        <Label>Value (internal)</Label>
                                        <Input
                                            placeholder="e.g. mumbai"
                                            value={newOption.value}
                                            onChange={(e) =>
                                                setNewOption({ ...newOption, value: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Label (display)</Label>
                                        <Input
                                            placeholder="e.g. Mumbai"
                                            value={newOption.label}
                                            onChange={(e) =>
                                                setNewOption({ ...newOption, label: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleAdd}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsAdding(false);
                                            setNewOption({ value: "", label: "" });
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Options List */}
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : options.length > 0 ? (
                            <div className="space-y-2">
                                {options.map((option) => (
                                    <div
                                        key={option.id}
                                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors"
                                    >
                                        {editingId === option.id ? (
                                            <>
                                                <div className="flex gap-4 flex-1 mr-4">
                                                    <Input
                                                        value={editOption.value}
                                                        onChange={(e) =>
                                                            setEditOption({
                                                                ...editOption,
                                                                value: e.target.value,
                                                            })
                                                        }
                                                        className="max-w-[150px]"
                                                    />
                                                    <Input
                                                        value={editOption.label}
                                                        onChange={(e) =>
                                                            setEditOption({
                                                                ...editOption,
                                                                label: e.target.value,
                                                            })
                                                        }
                                                        className="max-w-[200px]"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUpdate(option.id)}
                                                    >
                                                        <Save className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setEditingId(null)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-4">
                                                    <Badge variant="outline">{option.value}</Badge>
                                                    <span className="font-medium">{option.label}</span>
                                                    {!option.isActive && (
                                                        <Badge variant="secondary">Inactive</Badge>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => startEdit(option)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(option.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No options found for this category</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => setIsAdding(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Option
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
