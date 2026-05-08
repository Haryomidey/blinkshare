import React from 'react';
import { cn } from '@/lib/utils.ts';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
    borderSize?: 'thin' | 'medium';
    children?: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Card = ({ className, hover, borderSize = 'thin', children, ...props }: CardProps) => {
    return (
        <div
            className={cn(
                'bg-white rounded-sm',
                borderSize === 'thin' ? 'border border-neutral-200' : 'border border-neutral-300',
                hover && 'hover:border-black transition-colors duration-200',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
