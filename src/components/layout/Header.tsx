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
        <header className="h-16 border-b border-neutral-100 bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-sm px-3 py-1.5 w-full max-w-[200px] md:max-w-md">
                <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none text-xs focus:ring-0 w-full placeholder:text-neutral-400 outline-none"
                />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
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
                                className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-sm shadow-2xl overflow-hidden z-50 text-left"
                            >
                                <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Notifications</h3>
                                    <button onClick={() => setIsNotifyOpen(false)} className="text-neutral-400 hover:text-black">
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <p className="text-sm font-bold text-black">No notifications yet</p>
                                            <p className="mt-1 text-xs text-neutral-500">Transfer updates will appear here.</p>
                                        </div>
                                    ) : notifications.map((note) => (
                                        <div key={note.id} className="p-4 hover:bg-neutral-50 border-b border-neutral-50 flex gap-3 group transition-colors cursor-pointer text-left">
                                            <div className="mt-0.5 shrink-0">
                                                <div className="w-8 h-8 rounded-sm bg-black flex items-center justify-center">
                                                    <note.icon size={14} className="text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className="text-xs font-bold text-black">{note.title}</p>
                                                    <span className="text-[9px] text-neutral-400 uppercase font-medium">{note.time}</span>
                                                </div>
                                                <p className="text-[11px] text-neutral-500 leading-relaxed">{note.message}</p>
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
