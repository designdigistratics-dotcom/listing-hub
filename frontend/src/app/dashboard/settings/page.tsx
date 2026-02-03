"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { advertiserAPI, authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Options State
    const [cityOptions, setCityOptions] = useState<{ label: string; value: string }[]>([]);
    const [propTypeOptions, setPropTypeOptions] = useState<{ label: string; value: string }[]>([]);
    const [projTypeOptions, setProjTypeOptions] = useState<{ label: string; value: string }[]>([]);
    const [unitTypeOptions, setUnitTypeOptions] = useState<{ label: string; value: string }[]>([]);

    // Filter State
    const [leadFilters, setLeadFilters] = useState<{
        location: string[];
        budgetRange: { min: string; max: string };
        projectType: string[];
        propertyType: string[];
        unitType: string[];
    }>({
        location: [],
        budgetRange: { min: "", max: "" },
        projectType: [],
        propertyType: [],
        unitType: []
    });

    const [maxLeadsPerDay, setMaxLeadsPerDay] = useState<string>("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Fetch User Profile (fresh data)
                const meRes = await authAPI.me();
                const userData = meRes.data;

                if (userData.leadFilters) {
                    setLeadFilters({
                        location: userData.leadFilters.location || [],
                        budgetRange: userData.leadFilters.budgetRange || { min: "", max: "" },
                        projectType: userData.leadFilters.projectType || [],
                        propertyType: userData.leadFilters.propertyType || [],
                        unitType: userData.leadFilters.unitType || []
                    });
                }
                if (userData.maxLeadsPerDay) {
                    setMaxLeadsPerDay(userData.maxLeadsPerDay.toString());
                }

                // Fetch Options
                const [citiesRes, propTypesRes, projTypesRes, unitTypesRes] = await Promise.allSettled([
                    advertiserAPI.getOptions('city'),
                    advertiserAPI.getOptions('property_type'),
                    advertiserAPI.getOptions('project_type'),
                    advertiserAPI.getOptions('unit_type')
                ]);

                if (citiesRes.status === 'fulfilled') setCityOptions(citiesRes.value.data);
                if (propTypesRes.status === 'fulfilled') setPropTypeOptions(propTypesRes.value.data);
                if (projTypesRes.status === 'fulfilled') setProjTypeOptions(projTypesRes.value.data);
                if (unitTypesRes.status === 'fulfilled') setUnitTypeOptions(unitTypesRes.value.data);

            } catch (error) {
                console.error("Error fetching settings:", error);
                toast.error("Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updateData = {
                leadFilters,
                maxLeadsPerDay: maxLeadsPerDay ? parseInt(maxLeadsPerDay) : null
            };

            await advertiserAPI.updateProfile(updateData);

            toast.success("Settings updated successfully.");

            // Optionally refresh user context if needed, but changes usually reflect on next page load or we can manually update locally if context allows

        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and lead filters.</p>
            </div>
            <Separator />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Lead Distribution Filters</CardTitle>
                        <CardDescription>
                            Configure criteria for leads you want to receive. Leads matching these filters will be automatically assigned to you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Maximum Leads Per Day</Label>
                                <Input
                                    type="number"
                                    placeholder="Enter limit (e.g., 10)"
                                    value={maxLeadsPerDay}
                                    onChange={(e) => setMaxLeadsPerDay(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Limit the number of leads assigned daily. Leave empty for no limit.</p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Target Cities</Label>
                                <MultiSelect
                                    options={cityOptions}
                                    selected={leadFilters.location}
                                    onChange={(values) => setLeadFilters(prev => ({ ...prev, location: values }))}
                                    placeholder="Select cities..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Property Types</Label>
                                <MultiSelect
                                    options={propTypeOptions}
                                    selected={leadFilters.propertyType}
                                    onChange={(values) => setLeadFilters(prev => ({ ...prev, propertyType: values }))}
                                    placeholder="Select property types..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Unit Types</Label>
                                <MultiSelect
                                    options={unitTypeOptions}
                                    selected={leadFilters.unitType}
                                    onChange={(values) => setLeadFilters(prev => ({ ...prev, unitType: values }))}
                                    placeholder="Select unit types..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Project Types</Label>
                                <MultiSelect
                                    options={projTypeOptions}
                                    selected={leadFilters.projectType}
                                    onChange={(values) => setLeadFilters(prev => ({ ...prev, projectType: values }))}
                                    placeholder="Select project types..."
                                />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label>Budget Range (Min - Max)</Label>
                                <div className="flex gap-4">
                                    <div className="w-full">
                                        <Input
                                            type="number"
                                            placeholder="Min Budget"
                                            value={leadFilters.budgetRange.min}
                                            onChange={(e) => setLeadFilters(prev => ({ ...prev, budgetRange: { ...prev.budgetRange, min: e.target.value } }))}
                                        />
                                    </div>
                                    <div className="w-full">
                                        <Input
                                            type="number"
                                            placeholder="Max Budget"
                                            value={leadFilters.budgetRange.max}
                                            onChange={(e) => setLeadFilters(prev => ({ ...prev, budgetRange: { ...prev.budgetRange, max: e.target.value } }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
