import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4 border border-neutral-100">
                <Icon className="w-8 h-8 text-neutral-400" strokeWidth={1.5} />
            </div>
            <h3 className="mb-1 text-base font-medium text-black sm:text-lg">{title}</h3>
            <p className="text-sm text-neutral-500 max-w-xs mb-6">{description}</p>
            {action}
        </div>
    );
};
