import { cn } from '@/lib/utils.ts';

interface ToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    label?: string;
}

export const Toggle = ({ enabled, onChange, label }: ToggleProps) => {
    return (
        <div className="flex items-center justify-between py-2">
            {label && <span className="text-sm font-medium text-neutral-700">{label}</span>}
            <button
                type="button"
                onClick={() => onChange(!enabled)}
                className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
                    enabled ? 'bg-black' : 'bg-neutral-200'
                )}
            >
                <span
                    className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        enabled ? 'translate-x-5' : 'translate-x-0'
                    )}
                />
            </button>
        </div>
    );
};
