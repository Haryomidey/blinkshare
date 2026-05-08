import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout.tsx';
import { ScrollToTop } from '@/components/layout/ScrollToTop.tsx';
import Landing from '@/pages/home/index.tsx';
import Dashboard from '@/pages/dashboard/index.tsx';
import Send from '@/pages/dashboard/send/index.tsx';
import Receive from '@/pages/dashboard/receive/index.tsx';
import TransferSession from '@/pages/dashboard/session/index.tsx';
import History from '@/pages/dashboard/history/index.tsx';
import Settings from '@/pages/dashboard/settings/index.tsx';
import NotFound from '@/pages/NotFound.tsx';

const RootLayout = () => (
    <>
        <ScrollToTop />
        <Outlet />
    </>
);

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <Landing />,
            },
            {
                path: 'app',
                element: <AppLayout />,
                children: [
                    {
                        index: true,
                        element: <Dashboard />,
                    },
                    {
                        path: 'send',
                        element: <Send />,
                    },
                    {
                        path: 'receive',
                        element: <Receive />,
                    },
                    {
                        path: 'session/:sessionId',
                        element: <TransferSession />,
                    },
                    {
                        path: 'history',
                        element: <History />,
                    },
                    {
                        path: 'settings',
                        element: <Settings />,
                    },
                ],
            },
            {
                path: '*',
                element: <NotFound />,
            },
        ],
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}