import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, X, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils.ts';
import { motion, AnimatePresence } from 'motion/react';

const mockNotifications = [
    {
        id: 1,
        title: "Connection Established",
        message: "You are now securely linked with 'iPad Pro'.",
        time: "Just now",
        type: "success",
        icon: Zap
    },
    {
        id: 2,
        title: "Protocol Update",
        message: "Peer-to-peer discovery has been optimized for your current network.",
        time: "2 hours ago",
        type: "info",
        icon: Shield
    }
];

export const Header = () => {
    const [isNotifyOpen, setIsNotifyOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
                        <span className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full border border-white" />
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
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">System Feed</h3>
                                    <button onClick={() => setIsNotifyOpen(false)} className="text-neutral-400 hover:text-black">
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {mockNotifications.map((note) => (
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
                                    <button className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors">
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
