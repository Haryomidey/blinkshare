import React from 'react';
import { cn } from '@/lib/utils.ts';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        const variants = {
            primary: 'bg-black text-white hover:bg-neutral-800',
            secondary: 'bg-neutral-100 text-black hover:bg-neutral-200 border border-neutral-200',
            outline: 'bg-transparent text-black border border-black hover:bg-neutral-50',
            ghost: 'bg-transparent text-black hover:bg-neutral-100',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base',
            lg: 'px-5 py-3 text-sm font-medium sm:px-8 sm:py-4 sm:text-lg',
            icon: 'p-2',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'relative inline-flex max-w-full min-w-0 items-center justify-center whitespace-nowrap rounded-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading}
                {...props}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <span className={cn('inline-flex min-w-0 max-w-full items-center justify-center whitespace-nowrap', isLoading && 'opacity-0')}>{children}</span>
            </button>
        );
    }
);

Button.displayName = 'Button';
