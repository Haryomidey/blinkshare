import { cn } from '@/lib/utils.ts';

interface ProgressProps {
    value: number;
    className?: string;
    showLabel?: boolean;
}

export const Progress = ({ value, className, showLabel }: ProgressProps) => {
    return (
        <div className={cn('w-full', className)}>
            <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-black transition-all duration-300 ease-out"
                    style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                />
            </div>
            {showLabel && (
                <div className="mt-1 flex justify-end">
                    <span className="text-[10px] font-mono text-neutral-400">{Math.round(value)}%</span>
                </div>
            )}
        </div>
    );
};
