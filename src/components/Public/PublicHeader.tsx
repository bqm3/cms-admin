/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable prettier/prettier */
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";

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

  // desktop search (giữ nguyên)
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => setLocalSearch(searchQuery), [searchQuery]);

  useEffect(() => {
    if (debouncedSearch !== searchQuery) onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange, searchQuery]);

  const handleCategoryClick = (parentSlug: string, categorySlug: string = "") => {
    if (isPreview) return;
    let url = `/category/${parentSlug}`;
    if (categorySlug) url += `/${categorySlug}`;
    navigate(url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ======= MOBILE: hamburger drawer =======
  const [mobileOpen, setMobileOpen] = useState(false);

  const parents = useMemo(
    () => (parentCategories || []).filter((pc) => !pc?.is_deleted),
    [parentCategories]
  );

  const [activeParentSlug, setActiveParentSlug] = useState<string>(() => {
    const first = parents?.[0]?.slug ? String(parents[0].slug) : "";
    return selectedParentCategory ? String(selectedParentCategory) : first;
  });

  // ✅ accordion open state (single-open)
  const [openParentId, setOpenParentId] = useState<string>("");

  // sync active parent when selectedParentCategory changes
  useEffect(() => {
    if (selectedParentCategory != null) {
      setActiveParentSlug(String(selectedParentCategory));
    }
  }, [selectedParentCategory]);

  // update default when parents loaded later
  useEffect(() => {
    if (!activeParentSlug && parents?.length) setActiveParentSlug(String(parents[0].slug));
  }, [parents, activeParentSlug]);

  // ✅ set default opened item when opening mobile drawer
  useEffect(() => {
    if (mobileOpen) {
      const slug = String(activeParentSlug || parents?.[0]?.slug || "");
      setOpenParentId(slug);
    }
  }, [mobileOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const subCats = useMemo(() => {
    const parentSlug = String(activeParentSlug || "");
    const parent = (parentCategories || []).find(p => p.slug === parentSlug);
    if (!parent) return [];
    return (categories || []).filter((c) => c.parent_id === parent.id && !c?.is_deleted);
  }, [categories, activeParentSlug, parentCategories]);

  const LogoContent = (
    <div className="flex items-center gap-2 group shrink-0 select-none">
      <div className="bg-[#21294a] w-12 h-12 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-[#21294a]/20 group-hover:scale-105 transition-all duration-300">
        <img src="/logo_4.png" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl md:text-2xl font-extrabold text-[#21294a] leading-none tracking-tight">
          GLOBAL
        </span>
        <span className="text-xl md:text-2xl font-extrabold text-[#21294a] leading-none tracking-tight">
          <span className="text-red-500">PROMOTION</span>
        </span>
      </div>
    </div>
  );

  return (
    <header className={`font-sans ${isSticky ? "sticky top-0 z-50 transition-all duration-300" : "relative"}`}>
      {/* Main Header */}
      <div className="w-full border-b border-[#e6e6e6] bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">
          {/* Left: mobile hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              isIconOnly
              variant="light"
              className="text-black"
              onPress={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </Button>
          </div>

          {/* Logo */}
          {isPreview ? LogoContent : <Link to="/" className="cursor-pointer">{LogoContent}</Link>}

          {/* Desktop Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isPreview) return;
              onSearchSubmit(e);
            }}
            className="flex-1 max-w-xl hidden lg:flex items-center relative group"
          >
            <Input
              placeholder="Search projects and categories..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              startContent={<Search size={18} className="text-slate-900 group-focus-within:text-[#21294a] transition-colors" />}
              isClearable
              onClear={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              classNames={{
                inputWrapper:
                  "bg-white border-2 border-slate-200 h-11 px-4 shadow-none rounded-full group-hover:border-[#21294a] group-focus-within:border-[#21294a] transition-all",
                input: "text-[15px] font-medium text-[#1a1a1a] placeholder:text-[#999999] pl-1",
              }}
            />
            <button
              type="submit"
              className="absolute right-1 w-9 h-9 bg-[#21294a] rounded-full flex items-center justify-center text-white hover:opacity-90 transition-all shadow-sm"
            >
              <Search size={16} strokeWidth={3} />
            </button>
          </form>

          {/* Right: Auth */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Button
              as={Link}
              to="/login"
              className="bg-[#21294a] text-white font-bold text-sm h-10 px-6 rounded-full shadow-lg shadow-[#21294a]/10 hover:bg-[#21294a]/80 transition-all active:scale-95 hidden sm:flex"
            >
              Log in
            </Button>

            <Button
              as={Link}
              to="/login"
              className="bg-[#21294a] text-white font-bold text-sm h-9 px-4 rounded-full shadow-sm sm:hidden"
            >
              Log in
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar: Categories (giữ nguyên) */}
      <div className="font-sans bg-white border-b border-[#e6e6e6] hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-12 overflow-x-auto md:overflow-visible custom-scrollbar">
          <nav className="flex items-center h-full min-w-max md:min-w-0 md:justify-around gap-4 px-2">
            {parents.map((pc) => {
              const sub = (categories || []).filter((c) => c.parent_id === pc.id && !c.is_deleted);
              const isActive = String(pc.slug) === selectedParentCategory;

              return (
                <div key={pc.id} className="relative group h-full shrink-0 flex items-center">
                  <button
                    onClick={() => handleCategoryClick(String(pc.slug))}
                    className={`flex items-center gap-1.5 px-4 py-2 text-[16px] font-semibold rounded-lg transition-all ${
                      isActive ? "bg-[#e6e6e6] text-[#1a1a1a]" : "text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-[#e6e6e6]"
                    }`}
                  >
                    {pc.name}
                    {sub.length > 0 && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${
                          isActive ? "text-[#1a1a1a]" : "text-[#999999] group-hover:text-[#1a1a1a]"
                        } group-hover:rotate-180`}
                      />
                    )}
                  </button>

                  {sub.length > 0 && (
                    <div className="absolute top-full left-0 pt-1 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-[60]">
                      <div className="bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden min-w-[200px] p-1.5">
                        {sub.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(String(pc.slug), String(cat.slug))}
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

      {/* ======= MOBILE DRAWER ======= */}
      <div className={`lg:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        {/* backdrop */}
        <div
          className={`fixed inset-0 z-[80] transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"} bg-black/40`}
          onClick={() => setMobileOpen(false)}
        />

        {/* panel */}
        <div
          className={`fixed top-0 left-0 h-full w-[86%] max-w-[360px] z-[90] bg-white shadow-2xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* header panel */}
          <div className="h-16 px-4 border-b border-[#e6e6e6] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-[#21294a] w-10 h-10 rounded-2xl flex items-center justify-center">
                <img src="/logo_4.png" className="w-8 h-8 object-contain" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-extrabold text-[#21294a]">GLOBAL</div>
                <div className="text-sm font-extrabold text-red-500">PROMOTION</div>
              </div>
            </div>

            <Button isIconOnly variant="light" className="text-black" onPress={() => setMobileOpen(false)} aria-label="Close menu">
              <X size={22} />
            </Button>
          </div>

          {/* ✅ MOBILE ACCORDION */}
          <div className="px-4 pt-4 pb-6 overflow-y-auto h-[calc(100%-64px-52px)]">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Category</div>

            <div className="space-y-2">
              {parents.map((pc) => {
                const pSlug = String(pc.slug);
                const sub = (categories || []).filter(
                  (c) => c.parent_id === pc.id && !c?.is_deleted
                );

                const isOpen = openParentId === pSlug;

                return (
                    <div
                      key={pSlug}
                      className={`border rounded-2xl overflow-hidden transition-all ${
                        isOpen ? "border-[#21294a] bg-[#f6f8ff]" : "border-slate-200 bg-white"
                      }`}
                    >
                      {/* header row */}
                      <div
                        className={`flex items-center justify-between px-3 py-3 ${
                          isOpen ? "bg-[#eef2ff]" : "bg-white"
                        }`}
                      >
                        {/* click title => navigate parent */}
                        <button
                          onClick={() => {
                            setActiveParentSlug(pSlug);
                            onParentCategoryChange?.(pSlug);
                            handleCategoryClick(pSlug);
                            setMobileOpen(false);
                          }}
                          className={`flex-1 text-left font-semibold text-[15px] ${
                            isOpen ? "text-[#21294a]" : "text-[#1a1a1a]"
                          }`}
                        >
                          {pc.name}
                        </button>

                        {/* chevron rotate toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveParentSlug(pSlug);
                            onParentCategoryChange?.(pSlug);
                            setOpenParentId((prev) => (prev === pSlug ? "" : pSlug)); // ✅ single open
                          }}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            isOpen ? "bg-[#21294a] text-white" : "bg-[#f3f4f6] text-[#1a1a1a]"
                          }`}
                          aria-label={isOpen ? "Collapse" : "Expand"}
                        >
                          <ChevronDown
                            size={18}
                            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                          />
                        </button>
                      </div>

                      {/* content (simple show/hide) */}
                      <div className={`${isOpen ? "block" : "hidden"} px-3 pb-3`}>
                        {/* View all */}
                        <button
                          onClick={() => {
                            setActiveParentSlug(pSlug);
                            handleCategoryClick(pSlug);
                            setMobileOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold bg-[#e6e6e6] text-[#1a1a1a]"
                        >
                          View all
                        </button>

                      <div className="mt-2 space-y-2">
                        {sub.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setActiveParentSlug(pSlug);
                              handleCategoryClick(pSlug, String(cat.slug));
                              setMobileOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold bg-[#f3f4f6] text-[#1a1a1a] hover:bg-[#e6e6e6] transition"
                          >
                            {cat.name}
                          </button>
                        ))}

                        {sub.length === 0 && (
                          <div className="text-sm text-slate-500 px-2 py-2">There are no subcategories</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* footer */}
          <div className="mt-auto p-4 border-t border-[#e6e6e6] text-xs text-slate-500">
            © {new Date().getFullYear()} Global Promotion
          </div>
        </div>
      </div>
    </header>
  );
}
