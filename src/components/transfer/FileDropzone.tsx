import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils.ts';
import { formatFileSize } from '@/lib/formatters.ts';

interface FileDropzoneProps {
    onFilesAdded: (files: File[]) => void;
}

export const FileDropzone = ({ onFilesAdded }: FileDropzoneProps) => {
    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files) as File[];
        onFilesAdded(files);
    }, [onFilesAdded]);

    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className={cn(
                'group relative border-2 border-dashed border-neutral-200 rounded-sm p-12 transition-all duration-200 text-center cursor-pointer',
                'hover:border-black hover:bg-neutral-50'
            )}
        >
            <input
                type="file"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                    if (e.target.files) {
                        onFilesAdded(Array.from(e.target.files));
                    }
                }}
            />
            <div className="mx-auto w-16 h-16 bg-neutral-50 border border-neutral-100 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                <Upload className="w-8 h-8 text-neutral-400 group-hover:text-black transition-colors" />
            </div>
            <h3 className="text-lg font-medium text-black mb-2">Drop files here or click to upload</h3>
            <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                No storage limits. Direct p2p transfer means your files never touch any server.
            </p>
        </div>
    );
};
