/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable prettier/prettier */
import { useState, useEffect, useMemo, useRef } from "react";
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

  // accordion open state (single-open)
  const [openParentId, setOpenParentId] = useState<string>("");
  // desktop categories dropdown open
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  // hover sub-category (desktop nested dropdown)
  const [hoveredParentId, setHoveredParentId] = useState<string | null>(null);
  // delay timer refs to prevent premature close
  const catCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selectedParentCategory != null) {
      setActiveParentSlug(String(selectedParentCategory));
    }
  }, [selectedParentCategory]);

  useEffect(() => {
    if (!activeParentSlug && parents?.length) setActiveParentSlug(String(parents[0].slug));
  }, [parents, activeParentSlug]);

  useEffect(() => {
    if (mobileOpen) {
      const slug = String(activeParentSlug || parents?.[0]?.slug || "");
      setOpenParentId(slug);
    }
  }, [mobileOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const LogoContent = (
    <div className="flex items-center shrink-0 select-none group">
      <img
        src="/couponzas_logo.png"
        alt="Couponza"
        width="180"
        height="80"
        className="h-30 w-auto group-hover:opacity-90 transition-opacity duration-200"
      />
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
              onSearchChange(localSearch);
              navigate(`/category?search=${encodeURIComponent((localSearch || "").trim())}`);
            }}
            className="flex-1 max-w-xl hidden lg:flex items-center relative group"
          >
            <Input
              placeholder="Search projects and categories..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              startContent={<Search size={18} className="text-slate-900 group-focus-within:text-[#ee4d2d] transition-colors" />}
              isClearable
              onClear={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              classNames={{
                inputWrapper:
                  "bg-white border-2 border-slate-200 h-11 px-4 shadow-none rounded-full group-hover:border-[#ee4d2d] group-focus-within:border-[#ee4d2d] transition-all",
                input: "text-[15px] font-medium text-[#1a1a1a] placeholder:text-gray-700 pl-1",
              }}
            />
            <button
              type="submit"
              className="absolute right-1 w-9 h-9 bg-[#ee4d2d] rounded-full flex items-center justify-center text-white hover:opacity-90 transition-all shadow-sm"
            >
              <Search size={16} strokeWidth={3} />
            </button>
          </form>

          {/* Desktop Nav: Danh mục + Review */}
          <nav className="hidden lg:flex items-center gap-1 shrink-0">
            {/* Danh mục dropdown */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (catCloseTimer.current) clearTimeout(catCloseTimer.current);
                setCatDropdownOpen(true);
              }}
              onMouseLeave={() => {
                catCloseTimer.current = setTimeout(() => {
                  setCatDropdownOpen(false);
                  setHoveredParentId(null);
                }, 120);
              }}
            >
              <button
                className={`flex items-center gap-1.5 px-4 py-2 text-[15px] font-semibold rounded-lg transition-all ${catDropdownOpen ? "bg-[#e6e6e6] text-[#1a1a1a]" : "text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-[#e6e6e6]"
                  }`}
                aria-haspopup="true"
                aria-expanded={catDropdownOpen}
              >
                Categories
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${catDropdownOpen ? "rotate-180 text-[#1a1a1a]" : "text-gray-700"}`}
                />
              </button>

              {/* Level 1: parent categories */}
              <div
                className={`absolute top-full left-0 pt-1 transition-all duration-200 z-[60] ${catDropdownOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
                  }`}
                onMouseEnter={() => {
                  if (catCloseTimer.current) clearTimeout(catCloseTimer.current);
                }}
                onMouseLeave={() => {
                  catCloseTimer.current = setTimeout(() => {
                    setCatDropdownOpen(false);
                    setHoveredParentId(null);
                  }, 120);
                }}
              >
                <div className="bg-white border border-slate-200 shadow-xl rounded-xl overflow-visible min-w-[220px] p-1.5">
                  {parents.map((pc) => {
                    const sub = (categories || []).filter((c) => c.parent_id === pc.id && !c.is_deleted);
                    const isHovered = hoveredParentId === String(pc.id);
                    return (
                      <div
                        key={pc.id}
                        className="relative"
                        onMouseEnter={() => {
                          if (subCloseTimer.current) clearTimeout(subCloseTimer.current);
                          setHoveredParentId(String(pc.id));
                        }}
                        onMouseLeave={() => {
                          subCloseTimer.current = setTimeout(() => {
                            setHoveredParentId(null);
                          }, 100);
                        }}
                      >
                        {isPreview ? (
                          <div className={`w-full flex items-center justify-between px-3 py-2 text-[14px] font-medium rounded-lg transition-all ${isHovered ? "bg-[#e6e6e6] text-[#1a1a1a]" : "text-[#4a4a4a]"}`}>
                            <span>{pc.name}</span>
                            {sub.length > 0 && <ChevronDown size={13} className="-rotate-90 text-gray-500" />}
                          </div>
                        ) : (
                          <Link
                            to={`/category/${pc.slug}`}
                            onClick={() => { setCatDropdownOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-[14px] font-medium rounded-lg transition-all ${isHovered ? "bg-[#e6e6e6] text-[#1a1a1a]" : "text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-[#e6e6e6]"}`}
                          >
                            <span>{pc.name}</span>
                            {sub.length > 0 && <ChevronDown size={13} className="-rotate-90 text-gray-500" />}
                          </Link>
                        )}

                        {/* Level 2: sub categories — extended hit area to prevent gap-close */}
                        {sub.length > 0 && (
                          <div
                            className={`absolute top-0 left-full transition-all duration-150 z-[70] ${isHovered ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-2 pointer-events-none"
                              }`}
                            style={{ paddingLeft: "8px" }}
                            onMouseEnter={() => {
                              if (subCloseTimer.current) clearTimeout(subCloseTimer.current);
                              setHoveredParentId(String(pc.id));
                            }}
                            onMouseLeave={() => {
                              subCloseTimer.current = setTimeout(() => {
                                setHoveredParentId(null);
                              }, 100);
                            }}
                          >
                            <div className="bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden min-w-[200px] p-1.5">
                              {sub.map((cat) => (
                                isPreview ? (
                                  <span key={cat.id} className="w-full text-left px-3 py-2 text-[14px] font-medium text-[#4a4a4a] block">
                                    {cat.name}
                                  </span>
                                ) : (
                                  <Link
                                    key={cat.id}
                                    to={`/category/${pc.slug}/${cat.slug}`}
                                    onClick={() => { setCatDropdownOpen(false); setHoveredParentId(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                    className="w-full text-left px-3 py-2 text-[14px] font-medium text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-[#e6e6e6] rounded-lg transition-all block"
                                  >
                                    {cat.name}
                                  </Link>
                                )
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Review link */}
            <Link
              to="/review"
              className="flex items-center px-4 py-2 text-[15px] font-semibold rounded-lg text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-[#e6e6e6] transition-all"
            >
              Review
            </Link>
          </nav>

          {/* Right: Auth */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Button
              as={Link}
              to="/login"
              className="bg-[#ee4d2d] text-white font-bold text-sm h-10 px-6 rounded-full shadow-lg shadow-[#ee4d2d]/10 hover:bg-[#ee4d2d]/80 transition-all active:scale-95 hidden sm:flex"
            >
              Log in
            </Button>

            <Button
              as={Link}
              to="/login"
              className="bg-[#ee4d2d] text-white font-bold text-sm h-9 px-4 rounded-full shadow-sm sm:hidden"
            >
              Log in
            </Button>
          </div>
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
          className={`fixed top-0 left-0 h-full w-[86%] max-w-[360px] z-[90] bg-white shadow-2xl transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {/* header panel */}
          <div className="h-16 px-4 border-b border-[#e6e6e6] flex items-center justify-between">
            <img
              src="/logo_coupons.svg"
              alt="Couponza"
              width="120"
              height="34"
              className="h-9 w-auto"
            />

            <Button isIconOnly variant="light" className="text-black" onPress={() => setMobileOpen(false)} aria-label="Close menu">
              <X size={22} />
            </Button>
          </div>

          {/* MOBILE ACCORDION */}
          <div className="px-4 pt-4 pb-6 overflow-y-auto h-[calc(100%-64px-52px)]">
            {/* Review link */}
            <Link
              to="/review"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-3 mb-4 rounded-2xl bg-[#f3f4f6] border border-slate-200 text-[15px] font-semibold text-[#1a1a1a] hover:bg-[#e6e6e6] transition"
            >
              Review
            </Link>

            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Danh mục</div>

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
                    className={`border rounded-2xl overflow-hidden transition-all ${isOpen ? "border-[#ee4d2d] bg-[#f6f8ff]" : "border-slate-200 bg-white"
                      }`}
                  >
                    {/* header row */}
                    <div
                      className={`flex items-center justify-between px-3 py-3 ${isOpen ? "bg-[#eef2ff]" : "bg-white"
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
                        className={`flex-1 text-left font-semibold text-[15px] ${isOpen ? "text-[#ee4d2d]" : "text-[#1a1a1a]"
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
                          setOpenParentId((prev) => (prev === pSlug ? "" : pSlug));
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${isOpen ? "bg-[#ee4d2d] text-white" : "bg-[#f3f4f6] text-[#1a1a1a]"
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
            © {new Date().getFullYear()} Couponza
          </div>
        </div>
      </div>
    </header>
  );
}
