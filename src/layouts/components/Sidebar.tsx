import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Tag,
    Plus,
    LogOut,
    Shield,
    X,
    Image as ImageIcon
} from 'lucide-react';
import { Button } from '@heroui/button';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        {
            icon: LayoutDashboard,
            label: 'Trang chủ',
            path: '/dashboard',
            activeBg: 'bg-blue-50',
            activeBorder: 'border-blue-200',
            activeText: 'text-blue-700',
            iconBg: 'bg-blue-100',
            iconText: 'text-blue-600'
        },
        {
            icon: Plus,
            label: 'Tạo mới',
            path: '/editor/new',
            activeBg: 'bg-blue-50',
            activeBorder: 'border-blue-200',
            activeText: 'text-blue-700',
            iconBg: 'bg-blue-100',
            iconText: 'text-blue-600'
        },
        ...(user.role === 'admin' ? [
            {
                icon: Users,
                label: 'Quản lý người dùng',
                path: '/users',
                activeBg: 'bg-blue-50',
                activeBorder: 'border-blue-200',
                activeText: 'text-blue-700',
                iconBg: 'bg-blue-100',
                iconText: 'text-blue-600'
            },
            {
                icon: Tag,
                label: 'Danh mục',
                path: '/categories',
                activeBg: 'bg-blue-50',
                activeBorder: 'border-blue-200',
                activeText: 'text-blue-700',
                iconBg: 'bg-blue-100',
                iconText: 'text-blue-600'
            },
            {
                icon: ImageIcon,
                label: 'Thư viện ảnh',
                path: '/media',
                activeBg: 'bg-blue-50',
                activeBorder: 'border-blue-200',
                activeText: 'text-blue-700',
                iconBg: 'bg-blue-100',
                iconText: 'text-blue-600'
            }
        ] : [])
    ];

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200/80 shadow-md z-50 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'
                    } hidden lg:flex flex-col`}
            >
                {/* Logo Section */}
                <div className="p-5 border-b border-slate-200/80">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100 flex-shrink-0">
                            <Shield className="text-white" size={20} />
                        </div>
                        {isOpen && (
                            <div className="flex-1">
                                <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                                    Quản trị hệ thống
                                </h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                                    Trung tâm điều khiển
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${active
                                    ? `${item.activeBg} border ${item.activeBorder} shadow-sm`
                                    : 'hover:bg-slate-50'
                                    }`}
                            >
                                <div
                                    className={`p-2 rounded-lg flex-shrink-0 transition-all ${active
                                        ? `${item.iconBg} ${item.iconText}`
                                        : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
                                        }`}
                                >
                                    <Icon size={20} />
                                </div>
                                {isOpen && (
                                    <span
                                        className={`font-semibold text-sm flex-1 ${active
                                            ? item.activeText
                                            : 'text-slate-600 group-hover:text-slate-800'
                                            }`}
                                    >
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info & Logout */}
                {isOpen && (
                    <div className="p-4 border-t border-slate-200/80">
                        <div className="bg-slate-50 p-3 rounded-xl mb-3 border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-100 flex-shrink-0">
                                    {user.username?.substring(0, 1).toUpperCase() || 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 text-sm truncate">
                                        {user.username || 'Admin'}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={handleLogout}
                            size="sm"
                            className="w-full bg-white border border-slate-200 text-slate-700 font-bold rounded-xl h-10 hover:bg-slate-50 transition-colors shadow-sm"
                            startContent={<LogOut size={18} />}
                        >
                            Đăng xuất
                        </Button>
                    </div>
                )}
            </aside>

            {/* Mobile Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 shadow-2xl z-50 transition-transform duration-300 w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:hidden flex flex-col`}
            >
                {/* Mobile Header */}
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100">
                            <Shield className="text-white" size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                                Quản trị hệ thống
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Trung tâm điều khiển
                            </p>
                        </div>
                    </div>
                    <Button
                        isIconOnly
                        variant="flat"
                        size="sm"
                        onClick={onClose}
                        className="bg-slate-100 text-slate-600 rounded-lg"
                    >
                        <X size={18} />
                    </Button>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${active
                                    ? `${item.activeBg} border ${item.activeBorder} shadow-sm`
                                    : 'hover:bg-slate-50'
                                    }`}
                            >
                                <div
                                    className={`p-2 rounded-lg flex-shrink-0 ${active
                                        ? `${item.iconBg} ${item.iconText}`
                                        : 'bg-slate-100 text-slate-400'
                                        }`}
                                >
                                    <Icon size={20} />
                                </div>
                                <span
                                    className={`font-semibold text-sm ${active ? item.activeText : 'text-slate-600'
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Mobile User Info & Logout */}
                <div className="p-4 border-t border-slate-200">
                    <div className="bg-slate-50 p-3 rounded-xl mb-3 border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-100">
                                {user.username?.substring(0, 1).toUpperCase() || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 text-sm truncate">
                                    {user.username || 'Admin'}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={handleLogout}
                        size="sm"
                        className="w-full bg-white border border-slate-200 text-slate-700 font-bold rounded-xl h-11 hover:bg-slate-50 transition-all shadow-sm"
                        startContent={<LogOut size={18} />}
                    >
                        Đăng xuất
                    </Button>
                </div>
            </aside>
        </>
    );
}
