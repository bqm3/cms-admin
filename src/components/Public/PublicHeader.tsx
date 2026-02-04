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
  isPreview?: boolean;
}

export function PublicHeader({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedParentCategory,
  onParentCategoryChange,
  parentCategories = [],
  categories = [],
  isSticky = true,
  isPreview = false
}: PublicHeaderProps) {
  const navigate = useNavigate();

  const handleCategoryClick = (parentId: string, categoryId: string = "") => {
    if (isPreview) return;
    let url = `/category?parentCategory=${parentId}`;
    if (categoryId) url += `&category=${categoryId}`;
    navigate(url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const LogoContent = (
    <div className="flex items-center gap-2 group shrink-0 select-none">
      <div className="bg-blue-600 w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all duration-300">
        <LayoutGrid className="text-white" size={20} />
      </div>
      <div className="flex flex-col">
        <span className="text-xl md:text-2xl font-extrabold text-[#0067ff] leading-none tracking-tight">GLOBAL<span className="text-red-500">PROMOTION</span></span>
        <span className="text-[9px] md:text-[11px] font-semibold text-[#4a4a4a] uppercase tracking-wide mt-1">Giải pháp cao cấp</span>
      </div>
    </div>
  );

  return (
    <header className={`font-sans ${isSticky ? 'sticky top-0 z-50 transition-all duration-300' : 'relative'}`}>
      {/* Main Header: Logo, Search, Auth */}
      <div className="w-full border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">
          {/* Logo */}
          {isPreview ? LogoContent : <Link to="/" className="cursor-pointer">{LogoContent}</Link>}

          {/* Search Bar - Centers on desktop */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (isPreview) return;
              onSearchSubmit(e);
            }} 
            className="flex-1 max-w-xl hidden lg:flex items-center relative group"
          >
            <Input
              placeholder="Tìm kiếm dự án, danh mục..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              startContent={<Search size={18} className="text-slate-900 group-focus-within:text-blue-500 transition-colors" />}
              isClearable
              onClear={() => onSearchChange("")}
              classNames={{
                inputWrapper: "bg-white border-2 border-slate-200 h-11 px-4 shadow-none rounded-full group-hover:border-[#0067ff] group-focus-within:border-[#0067ff] transition-all",
                input: "text-[15px] font-medium text-[#1a1a1a] placeholder:text-[#999999] pl-1"
              }}
            />
            <button 
              type="submit"
              className="absolute right-1 w-9 h-9 bg-[#0067ff] rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Search size={16} strokeWidth={3} />
            </button>
          </form>

          {/* Auth Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link 
              to="/login" 
              className="text-[15px] font-bold text-[#1a1a1a] hover:text-[#0067ff] transition-colors px-2 py-2"
            >
              Đăng nhập
            </Link>
            {/* <Button 
              as={Link}
              to="/login"
              className="bg-[#0067ff] text-white font-bold text-sm h-10 px-6 rounded-full shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all active:scale-95 hidden sm:flex"
            >
              Đăng ký
            </Button> */}
            
            {/* Mobile Search Icon */}
            <Button 
              isIconOnly
              variant="light"
              className="lg:hidden text-black"
            >
              <Search size={22} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (Only visible on small/medium screens) */}
      <div className="lg:hidden px-4 py-3 bg-white border-b border-slate-100">
         <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isPreview) return;
              onSearchSubmit(e);
            }}
            className="font-sans w-full flex items-center relative group"
          >
            <Input
              placeholder="Tìm kiếm dự án..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              startContent={<Search size={16} className="text-slate-900" />}
              classNames={{
                inputWrapper: "bg-slate-50 border-slate-200/60 h-10 rounded-full",
                input: "text-sm font-semibold text-black"
              }}
            />
          </form>
      </div>

      {/* Navigation Bar: Categories */}
      <div className="font-sans bg-white border-b border-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-12 overflow-x-auto md:overflow-visible custom-scrollbar">
          <nav className="flex items-center h-full min-w-max md:min-w-0 md:justify-around gap-4 px-2">
            {parentCategories.filter(pc => !pc.is_deleted).map((pc) => {
              const subCats = categories.filter(c => c.parent_id === pc.id && !c.is_deleted);
              const isActive = String(pc.id) === selectedParentCategory;

              return (
                <div key={pc.id} className="relative group h-full shrink-0 flex items-center">
                  <button
                    onClick={() => handleCategoryClick(String(pc.id))}
                    className={`flex items-center gap-1.5 px-4 py-2 text-[16px] font-semibold rounded-lg transition-all ${isActive ? 'bg-[#e6e6e6] text-[#1a1a1a]' : 'text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-[#e6e6e6]'}`}
                  >
                    {pc.name}
                    {subCats.length > 0 && <ChevronDown size={14} className={`transition-transform duration-300 hidden md:block ${isActive ? 'text-[#1a1a1a]' : 'text-[#999999] group-hover:text-[#1a1a1a]'} group-hover:rotate-180`} />}
                  </button>

                  {/* Dropdown Menu - Desktop Only */}
                  {subCats.length > 0 && (
                    <div className="absolute top-full left-0 pt-1 opacity-0 translate-y-2 pointer-events-none md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto transition-all duration-200 z-[60] hidden md:block">
                      <div className="bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden min-w-[200px] p-1.5">
                        {subCats.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(String(pc.id), String(cat.id))}
                            className="w-full text-left px-3 py-2 text-[14px] font-medium text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-[#e6e6e6] rounded-lg transition-all"
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
          </nav>
        </div>
      </div>
    </header>
  );
}
