import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, RefreshCw, Loader2, Share2, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { QRCodePanel } from '@/components/transfer/QRCodePanel.tsx';
import { useReceiveSession } from '@/hooks/useReceiveSession.ts';
import { useAppSettings } from '@/hooks/useAppSettings.ts';

export default function Receive() {
    const navigate = useNavigate();
    const { settings } = useAppSettings();
    const { session, isLoading, error, refresh } = useReceiveSession(settings.deviceName);
    const isPaired = session?.status === 'paired';
    const statusTitle = isPaired ? 'Sender Connected' : 'Waiting for Sender';
    const statusDescription = isPaired
        ? 'Sender is paired. You will move to the transfer screen when they start sharing files.'
        : 'Keep this page open. You will move to the transfer screen when the sender starts the transfer.';

    const copyInviteLink = () => {
        if (!session) return;
        const url = `${window.location.origin}/app/send?session=${session.code}`;
        navigator.clipboard.writeText(url);
    };

    useEffect(() => {
        if (session?.status === 'paired' && session.transferId) {
            navigate(`/app/session/${session.transferId}`, { state: { role: 'receiver' } });
        }
    }, [navigate, session?.status, session?.transferId]);

    return (
        <div className="mx-auto max-w-4xl min-w-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 sm:space-y-10">
            <header className="flex min-w-0 flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="min-w-0">
                    <Badge className="mb-4">Receive</Badge>
                    <h1 className="text-3xl font-bold tracking-tighter text-black sm:text-4xl">Ready to Receive</h1>
                    <p className="mt-2 text-sm text-neutral-500 sm:text-base">Share this code or invite link with the sender.</p>
                    {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
                </div>
            </header>

            <Card className="border-2 border-black p-3 md:hidden">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-neutral-50 border border-neutral-100">
                        {isPaired ? (
                            <CheckCircle2 className="h-5 w-5 text-black" strokeWidth={1.8} />
                        ) : (
                            <Loader2 className="h-5 w-5 animate-spin text-black" strokeWidth={1.4} />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold uppercase tracking-tight text-black">{statusTitle}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-neutral-500">{statusDescription}</p>
                    </div>
                </div>
            </Card>

            <div className="grid min-w-0 gap-6 pt-1 md:grid-cols-2 md:gap-12 md:pt-8">
                <div className="min-w-0 space-y-5 sm:space-y-10 md:space-y-12">
                    <QRCodePanel value={session?.code ?? 'Loading...'} />
                    
                    <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                        <Button variant="secondary" onClick={copyInviteLink} className="flex-1" disabled={!session}>
                            <Copy className="w-4 h-4 mr-2" />
                            Invite Link
                        </Button>
                        <Button variant="secondary" onClick={refresh} className="flex-1" isLoading={isLoading}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            New Session
                        </Button>
                    </div>
                </div>

                <div className="min-w-0 space-y-8">
                    <Card className="hidden p-8 border-2 border-black md:flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-6 animate-pulse border border-neutral-100">
                            {isPaired ? (
                                <CheckCircle2 className="w-8 h-8 text-black" strokeWidth={1.5} />
                            ) : (
                                <Loader2 className="w-8 h-8 text-black animate-spin" strokeWidth={1} />
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-black mb-2 uppercase tracking-tight">
                            {statusTitle}
                        </h3>
                        <p className="text-sm text-neutral-500 max-w-xs">
                            {statusDescription}
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
