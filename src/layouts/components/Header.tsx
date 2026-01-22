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
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200/80 shadow-sm">
            <div className="px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Menu Button & Search */}
                    <div className="flex items-center gap-4 flex-1">
                        <Button
                            isIconOnly
                            variant="flat"
                            onClick={onMenuClick}
                            className="bg-slate-100 text-slate-600 rounded-xl lg:hidden"
                        >
                            <Menu size={20} />
                        </Button>
                        
                        <div className="hidden md:flex flex-1 max-w-md">
                            <Input
                                placeholder="Tìm kiếm..."
                                variant="flat"
                                startContent={<Search className="text-slate-400" size={18} />}
                                classNames={{
                                    inputWrapper: "bg-slate-50 border-none shadow-none h-11 rounded-xl",
                                    input: "text-sm font-medium text-slate-700 placeholder:text-slate-400"
                                }}
                            />
                        </div>
                    </div>

                    {/* Right: Actions & User */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <Button
                            isIconOnly
                            variant="flat"
                            className="bg-slate-100 text-slate-600 rounded-xl hidden sm:flex"
                        >
                            <Bell size={18} />
                        </Button>

                        {/* Settings */}
                        <Button
                            isIconOnly
                            variant="flat"
                            className="bg-slate-100 text-slate-600 rounded-xl hidden sm:flex"
                            as={Link}
                            to="/dashboard"
                        >
                            <Settings size={18} />
                        </Button>

                        {/* User Avatar */}
                        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-bold text-slate-800">
                                    {user.username || 'Admin'}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {user.role || 'user'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-100">
                                {user.username?.substring(0, 1).toUpperCase() || 'A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

