import { Link, useLocation } from 'react-router-dom';
import { Home, Send, Download, History, Settings, Zap } from 'lucide-react';
import { cn } from '@/lib/utils.ts';
import { APP_NAME } from '@/lib/constants.ts';

const navItems = [
    { name: 'Dashboard', path: '/app', icon: Home },
    { name: 'Send', path: '/app/send', icon: Send },
    { name: 'Receive', path: '/app/receive', icon: Download },
    { name: 'History', path: '/app/history', icon: History },
    { name: 'Settings', path: '/app/settings', icon: Settings },
];

export const Sidebar = () => {
    const location = useLocation();

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-neutral-200 h-screen sticky top-0 bg-white">
            <div className="p-8 flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" fill="white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-black">{APP_NAME}</span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-black text-white'
                                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};
