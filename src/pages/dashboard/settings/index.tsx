import { User, Smartphone, Shield, Zap, History, RotateCcw, Globe, Fingerprint } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Toggle } from '@/components/ui/Toggle.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { motion } from 'motion/react';
import { useAppSettings } from '@/hooks/useAppSettings.ts';
import { api } from '@/services/api.ts';

export default function Settings() {
    const { settings, updateSetting, clearSettings, resetDeviceId } = useAppSettings();
    const clearHistory = async () => {
        localStorage.removeItem('blinkshare_transfer_history');
        await api.clearTransfers().catch(() => undefined);
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
                        <Badge className="mb-4 bg-black text-white hover:bg-black border-none px-3">Settings</Badge>
                        <h1 className="text-5xl font-bold tracking-tight text-neutral-900 mb-4">App Preferences</h1>
                        <p className="text-lg text-neutral-500 max-w-xl">
                            Manage how this device appears to others and how BlinkShare handles incoming transfers.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-neutral-50 p-4 rounded-sm border border-neutral-100">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-neutral-200">
                            <Fingerprint className="w-6 h-6 text-neutral-800" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Device ID</p>
                            <p className="text-sm font-mono font-bold text-black">{settings.deviceId}</p>
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
                                <h2 className="text-xl font-bold text-black tracking-tight">Device Name</h2>
                                <p className="text-sm text-neutral-500">This is the name people see when pairing with you.</p>
                            </div>
                        </div>

                        <Card className="p-10 space-y-8 border-neutral-100 shadow-sm transition-all hover:shadow-md">
                            <div className="grid md:grid-cols-2 gap-10 items-start">
                                <div className="space-y-4">
                                    <Input 
                                        label="Display Name" 
                                        value={settings.deviceName} 
                                        onChange={(e) => updateSetting('deviceName', e.target.value)}
                                        placeholder="E.G. My MacBook"
                                        className="text-lg py-6"
                                    />
                                    <p className="text-xs text-neutral-400 leading-relaxed italic">
                                        Use a name that is easy to recognize on your own devices.
                                    </p>
                                </div>
                                <div className="p-6 bg-neutral-50 rounded-sm border border-neutral-100 space-y-3">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Privacy Tip</h4>
                                    <p className="text-xs text-neutral-600 leading-relaxed">
                                        Avoid using your full name if you share files on public or shared networks.
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
                                <h2 className="text-xl font-bold text-black tracking-tight">Transfer Preferences</h2>
                                <p className="text-sm text-neutral-500">Choose how new transfer requests should behave.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="p-8 border-neutral-100 hover:border-black transition-all">
                                <Toggle 
                                    label="Auto-Accept Trusted Devices" 
                                    enabled={settings.autoAccept} 
                                    onChange={(val) => updateSetting('autoAccept', val)} 
                                />
                                <div className="mt-4 flex items-start gap-3">
                                    <div className="mt-1"><Shield className="w-3 h-3 text-neutral-400" /></div>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        Trusted devices can start transfers without asking every time.
                                        <span className="block mt-2 font-bold text-amber-600 uppercase text-[9px] tracking-widest">Use with care</span>
                                    </p>
                                </div>
                            </Card>

                            <Card className="p-8 border-neutral-100 hover:border-black transition-all">
                                <Toggle 
                                    label="Device Discovery" 
                                    enabled={settings.discovery} 
                                    onChange={(val) => updateSetting('discovery', val)} 
                                />
                                <div className="mt-4 flex items-start gap-3">
                                    <div className="mt-1"><Globe className="w-3 h-3 text-neutral-400" /></div>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        Let nearby devices find this browser on the local network.
                                        <span className="block mt-2 font-bold text-neutral-400 uppercase text-[9px] tracking-widest">Currently on</span>
                                    </p>
                                </div>
                            </Card>

                            <Card className="p-8 border-neutral-100 hover:border-black transition-all">
                                <Toggle
                                    label="Transfer Notifications"
                                    enabled={settings.notifyOnComplete}
                                    onChange={(val) => updateSetting('notifyOnComplete', val)}
                                />
                                <div className="mt-4 flex items-start gap-3">
                                    <div className="mt-1"><Shield className="w-3 h-3 text-neutral-400" /></div>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        Show completion updates in the notification menu.
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
                                <h2 className="text-xl font-bold text-black tracking-tight">Security & Network</h2>
                                <p className="text-sm text-neutral-500">Control how BlinkShare connects during transfers.</p>
                            </div>
                        </div>

                        <Card className="border-neutral-100 overflow-hidden divide-y divide-neutral-50">
                            <div className="p-8 flex items-center justify-between gap-8 group">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-neutral-900">Secure Signaling</h4>
                                    <p className="text-sm text-neutral-500">Use encrypted signaling when setting up a transfer.</p>
                                </div>
                                <Toggle 
                                    enabled={settings.secureSignaling} 
                                    onChange={(val) => updateSetting('secureSignaling', val)} 
                                />
                            </div>
                            <div className="p-8 flex items-center justify-between gap-8">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-neutral-900">Connection Optimization</h4>
                                    <p className="text-sm text-neutral-500">Adjust transfer settings automatically when the connection changes.</p>
                                </div>
                                <Toggle 
                                    enabled={settings.p2pOptimized} 
                                    onChange={(val) => updateSetting('p2pOptimized', val)} 
                                />
                            </div>
                        </Card>
                    </section>
                </div>

                {/* Sidebar Utilities */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-8 bg-neutral-900 text-white border-none shadow-2xl">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-6">Maintenance</h4>
                        <div className="space-y-3">
                            <Button variant="ghost" onClick={clearHistory} className="w-full justify-start text-xs font-bold text-white hover:bg-white/10 uppercase tracking-widest py-6">
                                <History className="w-4 h-4 mr-4 text-neutral-500" />
                                Clear History
                            </Button>
                            <Button variant="ghost" onClick={resetDeviceId} className="w-full justify-start text-xs font-bold text-white hover:bg-white/10 uppercase tracking-widest py-6">
                                <RotateCcw className="w-4 h-4 mr-4 text-neutral-500" />
                                Reset Device ID
                            </Button>
                            <Button variant="ghost" onClick={() => updateSetting('privateMode', !settings.privateMode)} className="w-full justify-start text-xs font-bold text-red-400 hover:bg-red-900/20 hover:text-red-400 uppercase tracking-widest py-6">
                                <Shield className="w-4 h-4 mr-4" />
                                {settings.privateMode ? 'Disable Private Mode' : 'Private Mode'}
                            </Button>
                            <Button variant="ghost" onClick={clearSettings} className="w-full justify-start text-xs font-bold text-white hover:bg-white/10 uppercase tracking-widest py-6">
                                <RotateCcw className="w-4 h-4 mr-4 text-neutral-500" />
                                Reset Settings
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-10 bg-neutral-50 border-neutral-200 border-dashed">
                        <div className="text-center space-y-4">
                            <Smartphone className="w-8 h-8 text-neutral-300 mx-auto" />
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Current Version</p>
                                <p className="text-lg font-mono font-bold text-black tracking-tight">BlinkShare 1.2.4</p>
                            </div>
                            <div className="pt-4">
                                <Badge variant="outline" className="bg-white border-neutral-200">Up to date</Badge>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
