import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex min-w-0 items-center justify-center p-3 sm:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={cn(
                            'relative flex max-h-[calc(100vh-1.5rem)] min-w-0 w-full max-w-lg flex-col overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-2xl sm:max-h-[calc(100vh-2rem)]',
                            className
                        )}
                    >
                        <div className="flex min-w-0 shrink-0 items-center justify-between gap-4 border-b border-neutral-100 p-4 sm:p-6">
                            <h2 className="min-w-0 truncate text-base font-medium tracking-tight text-black">{title}</h2>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-neutral-100 rounded-sm transition-colors"
                            >
                                <X className="w-5 h-5 text-neutral-400" />
                            </button>
                        </div>
                        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 custom-scrollbar sm:p-6">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
