import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.tsx';
import { MobileNav } from './MobileNav.tsx';
import { Header } from './Header.tsx';

export const AppLayout = () => {
    return (
        <div className="flex bg-white min-h-screen text-black font-sans selection:bg-black selection:text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
            <MobileNav />
        </div>
    );
};
