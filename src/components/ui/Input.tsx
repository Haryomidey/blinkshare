import React from 'react';
import { cn } from '@/lib/utils.ts';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'w-full bg-white border border-neutral-200 rounded-sm px-4 py-2.5 text-black placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors',
                        error && 'border-black',
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-[10px] text-black font-medium">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
