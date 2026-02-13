"use client";

import Spline from '@splinetool/react-spline';
import { useState } from 'react';

interface SplineSceneProps {
    scene: string;
    className?: string;
}

export default function SplineScene({ scene, className }: SplineSceneProps) {
    const [loading, setLoading] = useState(true);

    return (
        <div className={`relative w-full h-full overflow-hidden rounded-3xl ${className}`}>
            {/* 
                Scale & Crop Strategy (Aggressive):
                We scale the scene by 18% and offset it more significantly.
                This ensures even larger watermark variants are pushed out.
            */}
            <div className="w-full h-full scale-[1.18] origin-center translate-x-[6%] translate-y-[6%]">
                <Spline
                    scene={scene}
                    onLoad={() => setLoading(false)}
                    className="w-full h-full"
                />
            </div>

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-teal-50/50 backdrop-blur-sm z-10 transition-opacity duration-500">
                    <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
