import { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, Search, User, X, Zap, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils.ts';
import { motion, AnimatePresence } from 'motion/react';
import { useRealtimeTransfers } from '@/hooks/useRealtimeTransfers.ts';
import { useAppSettings } from '@/hooks/useAppSettings.ts';

const getRelativeTime = (dateString: string) => {
    const seconds = Math.max(1, Math.floor((Date.now() - new Date(dateString).getTime()) / 1000));
    if (seconds < 60) return 'Just now';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return `${Math.floor(hours / 24)}d ago`;
};

export const Header = () => {
    const [isNotifyOpen, setIsNotifyOpen] = useState(false);
    const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { transfers } = useRealtimeTransfers();
    const { settings } = useAppSettings();

    const notifications = useMemo(() => {
        if (!settings.notifyOnComplete) return [];

        return transfers.slice(0, 6).map((transfer) => {
            const isCompleted = transfer.status === 'completed';
            const isFailed = transfer.status === 'failed' || transfer.status === 'cancelled';
            const Icon = isCompleted ? CheckCircle2 : isFailed ? AlertCircle : transfer.status === 'transferring' ? Zap : Clock;
            const device = transfer.type === 'sent' ? transfer.receiver : transfer.sender;

            return {
                id: `${transfer.id}-${transfer.status}`,
                title: isCompleted ? 'Transfer complete' : isFailed ? 'Transfer stopped' : 'Transfer update',
                message: `${transfer.name} ${isCompleted ? 'finished' : isFailed ? 'did not finish' : 'is in progress'}${device ? ` with ${device}` : ''}.`,
                time: getRelativeTime(transfer.updatedAt),
                icon: Icon,
            };
        });
    }, [settings.notifyOnComplete, transfers]);

    const hasUnread = notifications.some((note) => !readNotificationIds.includes(note.id));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsNotifyOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-30 flex h-16 min-w-0 items-center justify-between gap-3 border-b border-neutral-100 bg-white px-3 sm:px-4 md:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-sm border border-neutral-200 bg-neutral-50 px-3 py-1.5 md:max-w-md">
                <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="min-w-0 w-full bg-transparent border-none text-xs focus:ring-0 placeholder:text-neutral-400 outline-none"
                />
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-4">
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsNotifyOpen(!isNotifyOpen)}
                        className={cn(
                            "p-2 hover:bg-neutral-50 rounded-sm transition-colors relative",
                            isNotifyOpen && "bg-neutral-100"
                        )}
                    >
                        <Bell className="w-5 h-5 text-neutral-500" />
                        {hasUnread && <span className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full border border-white" />}
                    </button>

                    <AnimatePresence>
                        {isNotifyOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="fixed left-3 right-3 top-[4.5rem] z-50 max-h-[calc(100vh-5.5rem)] overflow-hidden rounded-sm border border-neutral-200 bg-white text-left shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80"
                            >
                                <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Notifications</h3>
                                    <button onClick={() => setIsNotifyOpen(false)} className="text-neutral-400 hover:text-black">
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="max-h-[min(340px,calc(100vh-12rem))] overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <p className="text-sm font-bold text-black">No notifications yet</p>
                                            <p className="mt-1 text-xs text-neutral-500">Transfer updates will appear here.</p>
                                        </div>
                                    ) : notifications.map((note) => (
                                        <div key={note.id} className="flex min-w-0 cursor-pointer gap-3 border-b border-neutral-50 p-4 text-left transition-colors hover:bg-neutral-50 group">
                                            <div className="mt-0.5 shrink-0">
                                                <div className="w-8 h-8 rounded-sm bg-black flex items-center justify-center">
                                                    <note.icon size={14} className="text-white" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-0.5 flex min-w-0 items-start justify-between gap-3">
                                                    <p className="min-w-0 truncate text-xs font-bold text-black">{note.title}</p>
                                                    <span className="shrink-0 text-[9px] text-neutral-400 uppercase font-medium">{note.time}</span>
                                                </div>
                                                <p className="line-clamp-2 text-[11px] leading-relaxed text-neutral-500">{note.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 bg-neutral-50 text-center">
                                    <button
                                        onClick={() => setReadNotificationIds(notifications.map((note) => note.id))}
                                        className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
                                    >
                                        Mark all as read
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="w-8 h-8 rounded-sm bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-black transition-colors">
                    <User className="w-5 h-5 text-neutral-400" />
                </div>
            </div>
        </header>
    );
};
