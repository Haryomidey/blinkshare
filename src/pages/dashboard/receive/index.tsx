import { useState, useEffect } from 'react';
import { Smartphone, Download, Copy, RefreshCw, Loader2, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { QRCodePanel } from '@/components/transfer/QRCodePanel.tsx';
import { generateId } from '@/lib/formatters.ts';

export default function Receive() {
    const [sessionId, setSessionId] = useState(generateId());
    const [isWaiting, setIsWaiting] = useState(true);

    const refreshSession = () => {
        setSessionId(generateId());
    };

    const copyInviteLink = () => {
        const url = `${window.location.origin}/app/send?session=${sessionId}`;
        navigator.clipboard.writeText(url);
        // Toast notification would be nice here
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Badge className="mb-4">Receive Module</Badge>
                    <h1 className="text-4xl font-bold tracking-tighter text-black">Ready to Receive</h1>
                    <p className="text-neutral-500 mt-2">Open this screen on the receiving device to start pairing.</p>
                </div>
            </header>

            <div className="grid md:grid-cols-2 gap-12 pt-8">
                <div className="space-y-12">
                    <QRCodePanel value={sessionId} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="secondary" onClick={copyInviteLink} className="flex-1">
                            <Copy className="w-4 h-4 mr-2" />
                            Invite Link
                        </Button>
                        <Button variant="secondary" onClick={refreshSession} className="flex-1">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            New Session
                        </Button>
                    </div>
                </div>

                <div className="space-y-8">
                    <Card className="p-8 border-2 border-black flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-6 animate-pulse border border-neutral-100">
                            <Loader2 className="w-8 h-8 text-black animate-spin" strokeWidth={1} />
                        </div>
                        <h3 className="text-lg font-bold text-black mb-2 uppercase tracking-tight">Searching for Sender...</h3>
                        <p className="text-sm text-neutral-500 max-w-xs">
                            Keep this window open. Once a sender scans the QR code or enters your session ID, a direct P2P link will be established.
                        </p>
                    </Card>

                    <div className="space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Pairing Instructions</h4>
                        <div className="space-y-4">
                            {[
                                { step: "01", text: "Open BlinkShare on the sending device." },
                                { step: "02", text: "Select 'Send Files' from the home screen." },
                                { step: "03", text: "Scan the QR code displayed to the left." }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-black font-mono">{item.step}</span>
                                    <p className="text-sm text-neutral-600">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Card className="p-6 bg-neutral-50 border-neutral-200">
                        <div className="flex gap-4">
                            <div className="p-2 bg-black rounded-sm h-fit">
                                <Share2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-black mb-1">Direct signaling only</h4>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                    Your data never touches a server. We only use a signaling server to help the two browsers "find" each other.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
