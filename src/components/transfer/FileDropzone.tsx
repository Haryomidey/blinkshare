import React, { useCallback } from 'react';
import { FileCheck2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils.ts';
import { formatFileSize } from '@/lib/formatters.ts';

interface FileDropzoneProps {
    onFilesAdded: (files: File[]) => void;
    selectedFiles?: File[];
}

export const FileDropzone = ({ onFilesAdded, selectedFiles = [] }: FileDropzoneProps) => {
    const latestFile = selectedFiles.at(-1);
    const totalSize = selectedFiles.reduce((total, file) => total + file.size, 0);

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
                'group relative border-2 border-dashed border-neutral-200 rounded-sm p-6 transition-all duration-200 text-center cursor-pointer sm:p-12',
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
            <h3 className="mb-2 text-base font-medium text-black sm:text-lg">Drop files here or click to upload</h3>
            <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                No storage limits. Direct p2p transfer means your files never touch any server.
            </p>
            {selectedFiles.length > 0 && (
                <div className="pointer-events-none mt-6 grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-sm border border-black bg-white p-3 text-left shadow-sm">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-black text-white">
                        <FileCheck2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-black">
                            {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                            {latestFile?.name}
                        </p>
                    </div>
                    <p className="shrink-0 whitespace-nowrap font-mono text-[10px] text-neutral-400">
                        {formatFileSize(totalSize)}
                    </p>
                </div>
            )}
        </div>
    );
};
