import { Link } from 'react-router-dom';
import { ArrowLeft, Box } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-4 text-center">
            <div className="relative mb-8">
                <Box size={120} strokeWidth={1} className="text-neutral-100" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold tracking-tighter sm:text-6xl">404</span>
                </div>
            </div>
            <h1 className="mb-2 text-xl font-bold uppercase tracking-tight sm:text-2xl">Node Not Found</h1>
            <p className="text-neutral-500 max-w-xs mb-12">
                The direct link you are looking for has expired or never existed.
            </p>
            <Link to="/app">
                <Button size="lg" className="w-full sm:w-auto">
                    <ArrowLeft className="mr-2 w-5 h-5" />
                    Back to Terminal
                </Button>
            </Link>
        </div>
    );
}
