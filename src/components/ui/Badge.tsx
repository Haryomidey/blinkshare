import React from 'react';
import { cn } from '@/lib/utils.ts';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'outline' | 'success' | 'error';
    className?: string;
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
    const variants = {
        default: 'bg-black text-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        outline: 'border border-neutral-200 text-neutral-500 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        success: 'bg-neutral-100 text-black border border-neutral-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        error: 'bg-black text-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border border-white/20',
    };

    return (
        <span className={cn('inline-block rounded-sm', variants[variant], className)}>
            {children}
        </span>
    );
};
