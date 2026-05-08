import { useState, useEffect, useRef } from 'react';

interface FileProgress {
    id: string;
    name: string;
    size: number;
    progress: number;
    status: 'waiting' | 'transferring' | 'completed' | 'failed';
}

export function useMockTransfer(files: FileProgress[], active: boolean = false) {
    const [transferState, setTransferState] = useState<{
        files: FileProgress[];
        overallProgress: number;
        speed: number;
        timeLeft: number;
        isCompleted: boolean;
    }>({
        files: files.map(f => ({ ...f, progress: 0, status: 'waiting' })),
        overallProgress: 0,
        speed: 0,
        timeLeft: 0,
        isCompleted: false
    });

    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (!active || transferState.isCompleted) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = window.setInterval(() => {
            setTransferState(prev => {
                const totalSize = prev.files.reduce((acc, f) => acc + f.size, 0);
                let newFiles = [...prev.files];
                let currentFileIndex = newFiles.findIndex(f => f.status !== 'completed');

                if (currentFileIndex === -1) {
                    return { ...prev, isCompleted: true, speed: 0, timeLeft: 0 };
                }

                const currentFile = newFiles[currentFileIndex];
                const increment = Math.random() * 5000000 + 2000000; // 2-7 MB/s
                const newProgress = Math.min(100, currentFile.progress + (increment / currentFile.size) * 100);

                newFiles[currentFileIndex] = {
                    ...currentFile,
                    progress: newProgress,
                    status: newProgress === 100 ? 'completed' : 'transferring'
                };

                const completedSize = newFiles.reduce((acc, f) => acc + (f.progress / 100) * f.size, 0);
                const overallProgress = (completedSize / totalSize) * 100;

                return {
                    files: newFiles,
                    overallProgress,
                    speed: increment,
                    timeLeft: Math.max(0, (totalSize - completedSize) / increment),
                    isCompleted: overallProgress >= 100
                };
            });
        }, 500);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [active, transferState.isCompleted]);

    return transferState;
}
