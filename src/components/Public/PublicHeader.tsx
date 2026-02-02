/* eslint-disable prettier/prettier */
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Search, LayoutGrid, ChevronDown } from "lucide-react";

interface PublicHeaderProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onSearchSubmit: (e?: React.FormEvent) => void;
    selectedParentCategory?: string;
    onParentCategoryChange?: (value: string) => void;
    parentCategories?: any[];
    categories?: any[];
    isSticky?: boolean;
}

export function PublicHeader({
    searchQuery,
    onSearchChange,
    onSearchSubmit,
    selectedParentCategory,
    onParentCategoryChange,
    parentCategories = [],
    categories = [],
    isSticky = true
}: PublicHeaderProps) {
    const navigate = useNavigate();

    const handleCategoryClick = (parentId: string, categoryId: string = "") => {
        let url = `/category?parentCategory=${parentId}`;
        if (categoryId) url += `&category=${categoryId}`;
        navigate(url);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <header className={`${isSticky ? 'sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm' : 'bg-white border-b border-slate-200/60'}`}>
            {/* Top Bar: Logo & Search */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group shrink-0">
                        <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:rotate-6 transition-transform duration-300">
                            <LayoutGrid className="text-white" size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 leading-none tracking-tight uppercase">CMS Showcase</h1>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1.5 opacity-80">Premium Web Solutions</p>
                        </div>
                    </Link>

                    {/* Search Bar */}
                    <form onSubmit={onSearchSubmit} className="flex-1 max-w-2xl w-full flex items-center gap-3">
                        <div className="relative flex-1 group">
                            <Input
                                placeholder="Tìm kiếm dự án, slug, nội dung..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                startContent={<Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />}
                                isClearable
                                onClear={() => onSearchChange("")}
                                classNames={{
                                    inputWrapper: "bg-slate-100/50 border-slate-200/60 h-12 shadow-inner rounded-2xl group-hover:bg-slate-100 transition-all",
                                    input: "text-sm font-medium"
                                }}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="bg-slate-900 text-white font-black h-12 px-8 rounded-2xl shadow-xl shadow-slate-200 transition-all hover:bg-blue-600 hover:shadow-blue-500/20 active:scale-95 hidden sm:flex items-center"
                        >
                            TÌM KIẾM
                        </Button>
                    </form>
                </div>
            </div>

            {/* Navigation Bar: Parent Categories & Dropdowns */}
            <div className="bg-white border-t border-slate-100 hidden md:block">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <nav className="flex items-center gap-1">
                        <Link
                            to="/"
                            className={`px-4 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${!selectedParentCategory ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                        >
                            Trang chủ
                        </Link>

                        {parentCategories.filter(pc => !pc.is_deleted).map((pc) => {
                            const subCats = categories.filter(c => c.parent_id === pc.id && !c.is_deleted);
                            const isActive = String(pc.id) === selectedParentCategory;

                            return (
                                <div key={pc.id} className="relative group">
                                    <button
                                        onClick={() => handleCategoryClick(String(pc.id))}
                                        className={`flex items-center gap-1.5 px-4 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all group-hover:text-blue-600 ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                                    >
                                        {pc.name}
                                        {subCats.length > 0 && <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />}
                                    </button>

                                    {/* Dropdown Menu */}
                                    {subCats.length > 0 && (
                                        <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-[60]">
                                            <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden min-w-[220px] p-2">
                                                {subCats.map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => handleCategoryClick(String(pc.id), String(cat.id))}
                                                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all"
                                                    >
                                                        {cat.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <Link
                            to="/category"
                            className={`px-4 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${!selectedParentCategory && window.location.pathname === '/category' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                        >
                            Tất cả dự án
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
