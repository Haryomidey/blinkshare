import React from 'react';
import { motion } from 'motion/react';
import { File as FileIcon, X, Zap, Clock, Package } from 'lucide-react';
import { Progress } from '@/components/ui/Progress.tsx';
import { formatFileSize, formatSpeed } from '@/lib/formatters.ts';
import { cn } from '@/lib/utils.ts';

interface TransferProgressProps {
    files: any[];
    overallProgress: number;
    speed: number;
    timeLeft: number;
    isCompleted: boolean;
}

export const TransferProgress = ({ files, overallProgress, speed, timeLeft, isCompleted }: TransferProgressProps) => {
    return (
        <div className="space-y-8">
            <div className="relative p-10 bg-black text-white rounded-sm overflow-hidden border border-black shadow-2xl">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 mb-2">Overall Progress</p>
                            <h2 className="text-6xl font-bold tracking-tighter leading-none">
                                {Math.round(overallProgress)}%
                            </h2>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-[0.1em] font-medium text-neutral-500 mb-1">Status</p>
                            <div className="flex items-center gap-2 justify-end">
                                <div className={cn("w-2 h-2 rounded-full", isCompleted ? "bg-white" : "bg-white animate-pulse")} />
                                <span className={cn("text-sm font-medium", isCompleted ? "text-white" : "text-white/80")}>
                                    {isCompleted ? 'Transfer Complete' : 'Transferring...'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${overallProgress}%` }}
                            className="h-full bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-8 mt-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-sm">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-neutral-500 tracking-tight">Speed</p>
                                <p className="text-sm font-mono font-medium">{isCompleted ? '0 B/s' : formatSpeed(speed)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-sm">
                                <Clock className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-neutral-500 tracking-tight">Est. Time</p>
                                <p className="text-sm font-mono font-medium">
                                    {isCompleted ? '--:--' : timeLeft > 60 ? `${Math.floor(timeLeft / 60)}m ${Math.floor(timeLeft % 60)}s` : `${Math.floor(timeLeft)}s`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-sm">
                                <Package className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-neutral-500 tracking-tight">Total Files</p>
                                <p className="text-sm font-mono font-medium">{files.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Transfer Queue</h3>
                <div className="space-y-2">
                    {files.map((file) => (
                        <div key={file.id} className="p-4 bg-white border border-neutral-100 rounded-sm flex items-center gap-4 group">
                            <div className="w-10 h-10 bg-neutral-50 border border-neutral-100 rounded-sm flex items-center justify-center">
                                <FileIcon className="w-5 h-5 text-neutral-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <p className="text-sm font-medium text-black truncate">{file.name}</p>
                                    <p className="text-xs text-neutral-400 font-mono">{formatFileSize(file.size)}</p>
                                </div>
                                <Progress value={file.progress} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
