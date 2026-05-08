import { File as FileIcon, X } from 'lucide-react';
import { formatFileSize } from '@/lib/formatters.ts';
import { Button } from '@/components/ui/Button.tsx';

interface FileQueueProps {
    files: File[];
    onRemove: (index: number) => void;
}

export const FileQueue = ({ files, onRemove }: FileQueueProps) => {
    if (files.length === 0) return null;

    return (
        <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Selected Files ({files.length})</h3>
                <p className="text-xs text-neutral-500 font-mono">
                    Total: {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
                </p>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {files.map((file, index) => (
                    <div 
                        key={`${file.name}-${index}`} 
                        className="p-3 bg-white border border-neutral-100 rounded-sm flex items-center justify-between group hover:border-neutral-300 transition-colors"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 bg-neutral-50 rounded-sm flex items-center justify-center">
                                <FileIcon className="w-4 h-4 text-neutral-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-black truncate">{file.name}</p>
                                <p className="text-[10px] text-neutral-400 font-mono uppercase">{formatFileSize(file.size)}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => onRemove(index)}
                            className="p-1.5 hover:bg-neutral-100 rounded-sm text-neutral-400 hover:text-black transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
