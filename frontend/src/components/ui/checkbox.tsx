"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

// Since radix-ui/react-checkbox is missing/not working, implementing a simple custom one
const Checkbox = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement> & { onCheckedChange?: (checked: boolean) => void }
>(({ className, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e)
        onCheckedChange?.(e.target.checked)
    }

    return (
        <div className="relative flex items-center">
            <input
                type="checkbox"
                className="peer h-4 w-4 shrink-0 rounded-sm border border-slate-200 shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-white checked:bg-slate-900 checked:text-slate-50 checked:border-slate-900"
                ref={ref}
                onChange={handleChange}
                {...props}
            />
            <Check className="absolute left-0 top-0 h-4 w-4 hidden peer-checked:block text-white pointer-events-none p-0.5" />
        </div>
    )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
