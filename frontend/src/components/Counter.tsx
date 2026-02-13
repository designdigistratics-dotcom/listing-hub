"use client";

import { useEffect, useState, useRef } from "react";

interface CounterProps {
    end: number;
    duration?: number;
    suffix?: string;
    className?: string;
}

export default function Counter({ end, duration = 2000, suffix = "", className = "" }: CounterProps) {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const countRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (countRef.current) {
            observer.observe(countRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Use easeOutQuad for smoother finish
            const easedProgress = progress * (2 - progress);
            setCount(Math.floor(easedProgress * end));

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    }, [isVisible, end, duration]);

    return (
        <span ref={countRef} className={className}>
            {count.toLocaleString()}{suffix}
        </span>
    );
}
