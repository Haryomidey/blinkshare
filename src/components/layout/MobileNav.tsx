import { Link, useLocation } from 'react-router-dom';
import { Home, Send, Download, History, Settings } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

const navItems = [
    { name: 'Home', path: '/app', icon: Home },
    { name: 'Send', path: '/app/send', icon: Send },
    { name: 'Receive', path: '/app/receive', icon: Download },
    { name: 'History', path: '/app/history', icon: History },
    { name: 'Settings', path: '/app/settings', icon: Settings },
];

export const MobileNav = () => {
    const location = useLocation();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-neutral-200 flex items-center justify-around px-4 z-40">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            'flex flex-col items-center justify-center gap-1 transition-colors duration-200',
                            isActive ? 'text-black' : 'text-neutral-400'
                        )}
                    >
                        <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />
                        <span className="text-[10px] font-medium uppercase tracking-tight">{item.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
};
