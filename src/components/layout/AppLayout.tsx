import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.tsx';
import { MobileNav } from './MobileNav.tsx';
import { Header } from './Header.tsx';

export const AppLayout = () => {
    return (
        <div className="flex min-h-screen min-w-0 overflow-x-hidden bg-white text-black font-sans selection:bg-black selection:text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 sm:px-6 md:p-10 md:pb-10">
                    <div className="mx-auto max-w-6xl min-w-0">
                        <Outlet />
                    </div>
                </main>
            </div>
            <MobileNav />
        </div>
    );
};
