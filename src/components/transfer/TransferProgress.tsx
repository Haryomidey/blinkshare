import { useEffect, useRef, useState } from 'react';
import { File as FileIcon, Pause, Play, Trash2, Zap, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';
import { Progress } from '@/components/ui/Progress.tsx';
import { formatFileSize, formatSpeed } from '@/lib/formatters.ts';
import type { TransferFile } from '@/types/transfer.ts';

interface TransferProgressProps {
    files: TransferFile[];
    overallProgress: number;
    bytesTransferred: number;
    totalBytes: number;
    speed: number;
    timeLeft: number;
    isCompleted: boolean;
    isConnected?: boolean;
    isPaused?: boolean;
    isSending?: boolean;
    onPause?: () => void;
    onRemoveFile?: (fileId: string) => void;
    onResume?: () => void;
}

export const TransferProgress = ({
    files,
    overallProgress,
    bytesTransferred,
    totalBytes,
    speed,
    timeLeft,
    isCompleted,
    isConnected = true,
    isPaused,
    isSending,
    onPause,
    onRemoveFile,
    onResume,
}: TransferProgressProps) => {
    const activeFile = files.find((file) => file.status === 'transferring' || file.progress < 100);
    const [measuredSpeed, setMeasuredSpeed] = useState(speed);
    const previousBytesRef = useRef(bytesTransferred);
    const previousTimeRef = useRef(performance.now());

    useEffect(() => {
        const now = performance.now();
        const previousBytes = previousBytesRef.current;
        const previousTime = previousTimeRef.current;
        const byteDelta = bytesTransferred - previousBytes;
        const timeDelta = now - previousTime;

        if (speed > 0) {
            setMeasuredSpeed(speed);
        } else if (byteDelta > 0 && timeDelta > 0) {
            setMeasuredSpeed(Math.round((byteDelta / timeDelta) * 1000));
        } else if (bytesTransferred === 0 || isCompleted) {
            setMeasuredSpeed(0);
        }

        previousBytesRef.current = bytesTransferred;
        previousTimeRef.current = now;
    }, [bytesTransferred, isCompleted, speed]);

    const hasStartedMoving = bytesTransferred > 0 || overallProgress > 0;
    const activeSpeed = speed > 0 ? speed : measuredSpeed;
    const isActivelyTransferring = isConnected && !isCompleted && hasStartedMoving;
    const speedLabel = isCompleted ? 'Done' : isActivelyTransferring && activeSpeed > 0 ? formatSpeed(activeSpeed) : 'Waiting';
    const computedTimeLeft = activeSpeed > 0
        ? Math.max(0, (totalBytes - bytesTransferred) / activeSpeed)
        : timeLeft;
    const timeLabel = isCompleted
        ? 'Done'
        : isActivelyTransferring && activeSpeed > 0
            ? computedTimeLeft > 60 ? `${Math.floor(computedTimeLeft / 60)}m ${Math.floor(computedTimeLeft % 60)}s` : `${Math.floor(computedTimeLeft)}s`
            : 'Waiting';

    return (
        <div className="space-y-8">
            <div className="relative min-w-0 overflow-hidden rounded-sm border border-black bg-black p-5 text-white shadow-2xl sm:p-8 lg:p-10">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 mb-2">Share Progress</p>
                            <h2 className="text-4xl font-bold tracking-tighter leading-none sm:text-5xl lg:text-6xl">
                                {Math.round(overallProgress)}%
                            </h2>
                            <p className="mt-3 text-xs font-mono text-neutral-400">
                                {formatFileSize(bytesTransferred)} of {formatFileSize(totalBytes)}
                            </p>
                            {!isCompleted && activeFile && (
                                <p className="mt-2 max-w-full truncate text-xs text-neutral-400 sm:max-w-xs">
                                    Sharing {activeFile.name}
                                </p>
                            )}
                        </div>
                        <div className="min-w-0 text-left sm:text-right">
                            <p className="text-[10px] uppercase tracking-[0.1em] font-medium text-neutral-500 mb-1">Status</p>
                            <div className="flex min-w-0 items-center gap-2 sm:justify-end">
                                <div className="h-2 w-2 rounded-full bg-white" />
                                <span className="min-w-0 truncate text-sm font-medium text-white/80">
                                    {isCompleted ? 'Share Recorded' : isConnected ? 'Recording share...' : 'Waiting for receiver'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                            style={{ width: `${overallProgress}%` }}
                            className="h-full bg-white"
                        />
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-6 lg:gap-8">
                        <div className="min-w-0">
                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-sm bg-white/10 sm:mb-0 sm:mr-3 sm:inline-flex sm:align-middle">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0 sm:inline-block sm:align-middle">
                                <p className="text-[10px] uppercase text-neutral-500 tracking-tight">Speed</p>
                                <p className="truncate text-xs font-medium text-white sm:text-sm">{speedLabel}</p>
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-sm bg-white/10 sm:mb-0 sm:mr-3 sm:inline-flex sm:align-middle">
                                <Clock className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0 sm:inline-block sm:align-middle">
                                <p className="text-[10px] uppercase text-neutral-500 tracking-tight">Est. Time</p>
                                <p className="truncate text-xs font-medium text-white sm:text-sm">
                                    {timeLabel}
                                </p>
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-sm bg-white/10 sm:mb-0 sm:mr-3 sm:inline-flex sm:align-middle">
                                <Package className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0 sm:inline-block sm:align-middle">
                                <p className="text-[10px] uppercase text-neutral-500 tracking-tight">Total Files</p>
                                <p className="truncate text-xs font-mono font-medium sm:text-sm">{files.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Share Queue</h3>
                        <p className="mt-1 text-xs text-neutral-500">
                            Keep both pages open until sharing finishes.
                        </p>
                    </div>
                    {isSending && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={isPaused ? onResume : onPause}
                            className="shrink-0"
                        >
                            {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                            {isPaused ? 'Resume' : 'Pause'}
                        </Button>
                    )}
                </div>
                {isPaused && (
                    <p className="mt-1 text-xs text-neutral-500">
                        Uploads are paused. Active downloads will continue after you resume.
                    </p>
                )}
                <div className="space-y-2">
                    {files.map((file) => {
                        const sharedSize = Math.round((file.progress / 100) * file.size);
                        const canRemove = file.progress < 100 && file.status !== 'completed';

                        return (
                        <div key={file.id} className="p-3 sm:p-4 bg-white border border-neutral-100 rounded-sm flex items-center gap-3 sm:gap-4 group min-w-0">
                            <div className="w-10 h-10 shrink-0 bg-neutral-50 border border-neutral-100 rounded-sm flex items-center justify-center">
                                <FileIcon className="w-5 h-5 text-neutral-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="mb-1 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
                                    <p className="min-w-0 truncate text-sm font-medium text-black">{file.name}</p>
                                    <p className="shrink-0 whitespace-nowrap text-xs text-neutral-400 font-mono">
                                        {formatFileSize(sharedSize)} / {formatFileSize(file.size)}
                                    </p>
                                </div>
                                <Progress value={file.progress} />
                            </div>
                            {canRemove && onRemoveFile && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveFile(file.id)}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
                                    aria-label={`Remove ${file.name}`}
                                    title="Remove file"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
