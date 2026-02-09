"use client";

import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { getImageUrl, formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    FileCheck,
    Check,
    X,
    Edit,
    Building2,
    MapPin,
    Clock,
    Eye,
    Info
} from 'lucide-react';
import Link from 'next/link';

export default function AdminProjectReviewPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [reviewAction, setReviewAction] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await adminAPI.getProjectsForReview();
            setProjects(res.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast.error('Failed to load review queue');
        } finally {
            setLoading(false);
        }
    };

    const openReviewDialog = (project: any, action: string) => {
        setSelectedProject(project);
        setReviewAction(action);
        setReviewComment('');
        setShowReviewDialog(true);
    };

    const handleReview = async () => {
        if (reviewAction === 'request_changes' && !reviewComment.trim()) {
            toast.error('Please provide feedback for the advertiser');
            return;
        }

        setProcessing(true);
        try {
            await adminAPI.reviewProject(selectedProject.id, {
                action: reviewAction,
                comment: reviewComment || undefined
            });
            toast.success(`Project ${reviewAction === 'approve' ? 'approved' : reviewAction === 'reject' ? 'rejected' : 'sent back for changes'}`);
            setShowReviewDialog(false);
            fetchProjects();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to process review');
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Project Review</h1>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-blue-800 text-sm">
                    <strong>Review Guidelines:</strong> Verify project details, images, and compliance before approving.
                    Only approved projects can be placed on landing pages.
                </p>
            </div>

            <Card className="border-slate-100">
                <CardHeader>
                    <CardTitle className="font-display flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-primary" />
                        Projects Awaiting Review ({projects.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {projects.length > 0 ? (
                        <div className="space-y-4">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors gap-4"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Image */}
                                        <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                                            {project.images?.length > 0 ? (
                                                <img
                                                    src={getImageUrl(project.images[0])}
                                                    alt={project.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Building2 className="w-8 h-8 text-slate-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div>
                                            <h3 className="font-medium text-slate-900">{project.name}</h3>
                                            <p className="text-sm text-slate-500">by {project.builderName || project.builder_name}</p>
                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                                                <span className="flex items-center gap-1 text-slate-500">
                                                    <MapPin className="w-4 h-4" />
                                                    {project.locality}, {project.city}
                                                </span>
                                                <Badge variant="secondary" className="bg-slate-100">
                                                    {Array.isArray(project.propertyType) ? project.propertyType.join(', ') : (project.propertyType || project.property_type)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-primary font-medium mt-1">
                                                {formatCurrency(project.budgetMin || project.budget_min)} - {formatCurrency(project.budgetMax || project.budget_max)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                        {/* Advertiser & Date */}
                                        <div className="text-sm border-l pl-4 hidden sm:block">
                                            <p className="text-slate-600 font-medium">{project.advertiser?.companyName}</p>
                                            <p className="text-slate-400 flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(project.createdAt)}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/project/${project.id}`}
                                                target="_blank"
                                            >
                                                <Button size="sm" variant="ghost">
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Preview
                                                </Button>
                                            </Link>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                                                onClick={() => openReviewDialog(project, 'request_changes')}
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                Request Changes
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                onClick={() => openReviewDialog(project, 'reject')}
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => openReviewDialog(project, 'approve')}
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Approve
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileCheck className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No pending reviews</h3>
                            <p className="text-slate-500">
                                Great job! You've successfully reviewed all submitted projects.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-display">
                            {reviewAction === 'approve' && 'Approve Project'}
                            {reviewAction === 'request_changes' && 'Request Changes'}
                            {reviewAction === 'reject' && 'Reject Project'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedProject?.name} by {selectedProject?.builderName || selectedProject?.builder_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {reviewAction === 'approve' && (
                            <div className="flex gap-3 bg-green-50 p-3 rounded-lg border border-green-100">
                                <Check className="w-5 h-5 text-green-600 shrink-0" />
                                <p className="text-green-800 text-sm">
                                    This project will be marked as approved. You can then schedule it on landing pages from the Placement Queue.
                                </p>
                            </div>
                        )}
                        {reviewAction === 'request_changes' && (
                            <div className="space-y-3">
                                <p className="text-slate-600 text-sm">
                                    Provide specific feedback for the advertiser. They will be notified to make changes and resubmit.
                                </p>
                                <Textarea
                                    placeholder="e.g., Please upload higher resolution images and fix the description typo..."
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>
                        )}
                        {reviewAction === 'reject' && (
                            <div className="space-y-3">
                                <div className="flex gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                                    <X className="w-5 h-5 text-red-600 shrink-0" />
                                    <p className="text-red-800 text-sm">
                                        This project will be permanently rejected. This action cannot be undone.
                                    </p>
                                </div>
                                <Textarea
                                    placeholder="Reason for rejection (optional)..."
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    rows={3}
                                    className="resize-none"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReview}
                            disabled={processing}
                            className={`min-w-[100px] ${reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                                reviewAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                                    'bg-amber-600 hover:bg-amber-700'
                                }`}
                        >
                            {processing ? 'Processing...' : 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
