import React, { useState } from 'react';
import { User, Smartphone, Shield, Zap, History, RotateCcw, Ghost, Globe, Fingerprint } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Toggle } from '@/components/ui/Toggle.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { motion } from 'motion/react';

export default function Settings() {
    const [settings, setSettings] = useState({
        deviceName: 'BlinkShare-Workstation-Pro',
        autoAccept: false,
        discovery: true,
        notifyOnComplete: true,
        p2pOptimized: true,
        secureSignaling: true
    });

    const updateSetting = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 md:px-0">
            <motion.header 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16 text-center md:text-left"
            >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <Badge className="mb-4 bg-black text-white hover:bg-black border-none px-3">Preference Center</Badge>
                        <h1 className="text-5xl font-bold tracking-tight text-neutral-900 mb-4">Digital Sovereignty</h1>
                        <p className="text-lg text-neutral-500 max-w-xl">
                            Tailor your BlinkShare experience. Control how your device presents itself and how it interacts with the physical world nearby.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-neutral-50 p-4 rounded-sm border border-neutral-100">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-neutral-200">
                            <Fingerprint className="w-6 h-6 text-neutral-800" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Secure Node</p>
                            <p className="text-sm font-mono font-bold text-black">#NODE-8x221P</p>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="grid lg:grid-cols-12 gap-16">
                {/* Main Controls */}
                <div className="lg:col-span-8 space-y-20">
                    
                    {/* Identity Section */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-black tracking-tight">Identity & Aura</h2>
                                <p className="text-sm text-neutral-500">How you appear to others in the local space.</p>
                            </div>
                        </div>

                        <Card className="p-10 space-y-8 border-neutral-100 shadow-sm transition-all hover:shadow-md">
                            <div className="grid md:grid-cols-2 gap-10 items-start">
                                <div className="space-y-4">
                                    <Input 
                                        label="Surface Name" 
                                        value={settings.deviceName} 
                                        onChange={(e) => updateSetting('deviceName', e.target.value)}
                                        placeholder="E.G. My MacBook"
                                        className="text-lg py-6"
                                    />
                                    <p className="text-xs text-neutral-400 leading-relaxed italic">
                                        This name is broadcast during the handshake phase. Make it recognizable but minimal.
                                    </p>
                                </div>
                                <div className="p-6 bg-neutral-50 rounded-sm border border-neutral-100 space-y-3">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Privacy Tip</h4>
                                    <p className="text-xs text-neutral-600 leading-relaxed">
                                        Avoid using your full legal name. A device-specific descriptor like "BlinkShare-Station" is often best for operational clarity.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* Habits Section */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-black tracking-tight">Interaction Habits</h2>
                                <p className="text-sm text-neutral-500">Define the friction of your digital handshakes.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="p-8 border-neutral-100 hover:border-black transition-all">
                                <Toggle 
                                    label="Seamless Handshake" 
                                    enabled={settings.autoAccept} 
                                    onChange={(val) => updateSetting('autoAccept', val)} 
                                />
                                <div className="mt-4 flex items-start gap-3">
                                    <div className="mt-1"><Shield className="w-3 h-3 text-neutral-400" /></div>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        Files from recognized peers will begin transferring without an explicit prompt. 
                                        <span className="block mt-2 font-bold text-amber-600 uppercase text-[9px] tracking-widest">High Fluidity Mode</span>
                                    </p>
                                </div>
                            </Card>

                            <Card className="p-8 border-neutral-100 hover:border-black transition-all">
                                <Toggle 
                                    label="Public Pulse" 
                                    enabled={settings.discovery} 
                                    onChange={(val) => updateSetting('discovery', val)} 
                                />
                                <div className="mt-4 flex items-start gap-3">
                                    <div className="mt-1"><Globe className="w-3 h-3 text-neutral-400" /></div>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        Emit a signal on local networks so others can find you without a QR code.
                                        <span className="block mt-2 font-bold text-neutral-400 uppercase text-[9px] tracking-widest">Discovery Active</span>
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </section>

                    {/* Protocol Section */}
                    <section className="space-y-8 pb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-black tracking-tight">Transmission Protocol</h2>
                                <p className="text-sm text-neutral-500">The underlying engine that drives your transfers.</p>
                            </div>
                        </div>

                        <Card className="border-neutral-100 overflow-hidden divide-y divide-neutral-50">
                            <div className="p-8 flex items-center justify-between gap-8 group">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-neutral-900">Encrypted Handshake</h4>
                                    <p className="text-sm text-neutral-500">Force all signaling to pass through our E2E encrypted gateway.</p>
                                </div>
                                <Toggle 
                                    enabled={settings.secureSignaling} 
                                    onChange={(val) => updateSetting('secureSignaling', val)} 
                                />
                            </div>
                            <div className="p-8 flex items-center justify-between gap-8">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-neutral-900">Peer Optimization</h4>
                                    <p className="text-sm text-neutral-500">Automatically tune bit-rates based on spatial latency.</p>
                                </div>
                                <Toggle 
                                    enabled={true} 
                                    onChange={() => {}} 
                                />
                            </div>
                        </Card>
                    </section>
                </div>

                {/* Sidebar Utilities */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-8 bg-neutral-900 text-white border-none shadow-2xl">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-6">Deep Maintenance</h4>
                        <div className="space-y-3">
                            <Button variant="ghost" className="w-full justify-start text-xs font-bold text-white hover:bg-white/10 uppercase tracking-widest py-6">
                                <History className="w-4 h-4 mr-4 text-neutral-500" />
                                Purge All History
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-xs font-bold text-white hover:bg-white/10 uppercase tracking-widest py-6">
                                <RotateCcw className="w-4 h-4 mr-4 text-neutral-500" />
                                Recycle Node ID
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-xs font-bold text-red-400 hover:bg-red-900/20 hover:text-red-400 uppercase tracking-widest py-6">
                                <Ghost className="w-4 h-4 mr-4" />
                                Ghost Mode
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-10 bg-neutral-50 border-neutral-200 border-dashed">
                        <div className="text-center space-y-4">
                            <Smartphone className="w-8 h-8 text-neutral-300 mx-auto" />
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Current Version</p>
                                <p className="text-lg font-mono font-bold text-black tracking-tight">BLINKSHARE OS 1.2.4</p>
                            </div>
                            <div className="pt-4">
                                <Badge variant="outline" className="bg-white border-neutral-200">System Nominal</Badge>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
