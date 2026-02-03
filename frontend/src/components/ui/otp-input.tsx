"use client";

import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
    length = 6,
    value,
    onChange,
    disabled = false,
}) => {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Initialize from value if provided
        if (value) {
            const newOtp = value.split("").slice(0, length);
            setOtp([...newOtp, ...new Array(length - newOtp.length).fill("")]);
        }
    }, [value, length]);

    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (isNaN(Number(val))) return;

        const newOtp = [...otp];
        // Only take the last character entered
        newOtp[index] = val.substring(val.length - 1);
        setOtp(newOtp);
        onChange(newOtp.join(""));

        // Move to next input if value is entered
        if (val && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            // Move to previous input on backspace if current is empty
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const data = e.clipboardData.getData("text").trim();
        if (isNaN(Number(data))) return;

        const pasteData = data.split("").slice(0, length);
        const newOtp = [...otp];
        pasteData.forEach((char, i) => {
            newOtp[i] = char;
        });
        setOtp(newOtp);
        onChange(newOtp.join(""));

        // Focus the next empty input or the last one
        const lastIndex = Math.min(pasteData.length, length - 1);
        inputRefs.current[lastIndex]?.focus();
    };

    return (
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {otp.map((digit, index) => (
                <Input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    ref={(el) => {
                        inputRefs.current[index] = el;
                    }}
                    className="w-10 h-12 text-center text-lg font-bold p-0 rounded-xl"
                    disabled={disabled}
                />
            ))}
        </div>
    );
};
