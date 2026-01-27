import { Menu, Bell, Search, Settings } from 'lucide-react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Link } from 'react-router-dom';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
            <div className="px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Menu Button & Search */}
                    <div className="flex items-center gap-4 flex-1">
                        <Button
                            isIconOnly
                            variant="flat"
                            size="md"
                            onClick={onMenuClick}
                            className="bg-slate-50 text-slate-600 rounded-xl lg:hidden border border-slate-200"
                        >
                            <Menu size={20} />
                        </Button>

                        <div className="hidden md:flex flex-1 max-w-sm">
                            <Input
                                placeholder="Tìm kiếm hệ thống..."
                                variant="flat"
                                size="md"
                                startContent={<Search className="text-slate-400" size={18} />}
                                classNames={{
                                    inputWrapper: "bg-slate-50 border border-slate-200 shadow-none h-11 rounded-xl px-4",
                                    input: "text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                                }}
                            />
                        </div>
                    </div>

                    {/* Right: Actions & User */}
                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <Button
                            isIconOnly
                            variant="flat"
                            size="md"
                            className="bg-slate-50 text-slate-600 rounded-xl hidden sm:flex border border-slate-200 h-11 w-11 hover:bg-slate-100 transition-colors"
                        >
                            <Bell size={18} />
                        </Button>

                        {/* Settings */}
                        <Button
                            isIconOnly
                            variant="flat"
                            size="md"
                            className="bg-slate-50 text-slate-600 rounded-xl hidden sm:flex border border-slate-200 h-11 w-11 hover:bg-slate-100 transition-colors"
                            as={Link}
                            to="/dashboard"
                        >
                            <Settings size={18} />
                        </Button>

                        {/* User Avatar */}
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 h-8">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-bold text-slate-800 leading-tight">
                                    {user.username || 'Admin'}
                                </p>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    {user.role || 'user'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-100 border border-blue-700">
                                {user.username?.substring(0, 1).toUpperCase() || 'A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
