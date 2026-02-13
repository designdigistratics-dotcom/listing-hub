"use client";

import { useParams } from "next/navigation";
import ProjectDetailView from "@/components/project/ProjectDetailView";

export default function ProjectPage() {
    const params = useParams();
    const projectId = params.id as string;

    return <ProjectDetailView projectIdOrSlug={projectId} />;
}
