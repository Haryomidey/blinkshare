import { motion } from 'motion/react';
import { Smartphone, Laptop, FileText, ImageIcon, Music, Video, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';

export const AnimatedTransferMockup = () => {
    return (
        <section className="py-20 bg-white px-4 sm:py-24">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 border-y border-neutral-100 py-20 sm:gap-12 sm:py-24">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <Card className="w-[280px] p-6 border-2 border-black shadow-2xl relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                                <Laptop className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-tight sm:text-xs">Main Workstation</p>
                                <p className="text-[10px] text-neutral-400">Connected</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.2 }}
                                    className="p-3 bg-neutral-50 border border-neutral-100 rounded-sm flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 rounded-sm bg-white border border-neutral-200 flex items-center justify-center">
                                        {i === 1 ? <Video className="w-4 h-4 text-neutral-400" /> : i === 2 ? <ImageIcon className="w-4 h-4 text-neutral-400" /> : <FileText className="w-4 h-4 text-neutral-400" />}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                                            <motion.div
                                                animate={{ width: ['0%', '100%'] }}
                                                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                                                className="h-full bg-black"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                    <div className="absolute top-10 -left-10 w-full h-full bg-neutral-100 border border-neutral-200 rounded-sm -z-10" />
                </motion.div>

                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-1 bg-black rounded-full" />
                    <motion.div
                        animate={{ x: [0, 20, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-black"
                    >
                        <ArrowRight size={40} strokeWidth={1} />
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <Card className="w-[280px] p-6 border-2 border-black shadow-2xl relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-tight sm:text-xs">Mobile Device</p>
                                <p className="text-[10px] text-neutral-400">Ready</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {[1, 2, 3, 4].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.3 }}
                                    className="aspect-square bg-neutral-50 border border-neutral-100 rounded-sm flex items-center justify-center"
                                >
                                    <div className="text-neutral-300">
                                        {i % 2 === 0 ? <ImageIcon size={24} /> : <FileText size={24} />}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                    <div className="absolute top-10 -right-10 w-full h-full bg-neutral-100 border border-neutral-200 rounded-sm -z-10" />
                </motion.div>
            </div>
        </section>
    );
};
