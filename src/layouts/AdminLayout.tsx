/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { ReactNode, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Menu } from 'lucide-react';

interface AdminLayoutProps {
    children: ReactNode;
    fluid?: boolean;
}

export function AdminLayout({ children, fluid = false }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content Area */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                {/* Page Content */}
                <main className={fluid ? "p-0 md:p-0 lg:p-0" : "p-2 md:p-3 lg:p-4"}>
                    <div className={fluid ? "w-full" : "max-w-[90rem] mx-auto"}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}


