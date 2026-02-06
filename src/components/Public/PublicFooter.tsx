/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable prettier/prettier */
import React from "react";
import { Link } from "react-router-dom";
import { useMemo, useState, useRef, useEffect } from "react";
import { LayoutGrid, ChevronDown } from "lucide-react";

interface PublicFooterProps {
  parentCategories: any[];
  categories: any[];
  onCategoryClick: (parentId: string, categoryId: string) => void;
  isPreview?: boolean;
}

export function PublicFooter({ parentCategories, categories, onCategoryClick, isPreview = false }: PublicFooterProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreWrapRef = useRef<HTMLDivElement | null>(null);

  const parents = useMemo(() => (parentCategories || []).filter((pc) => !pc?.is_deleted), [parentCategories]);

  const MAX_PARENT_COLUMNS = 5;
  const visibleParents = parents.slice(0, MAX_PARENT_COLUMNS);
  const overflowParents = parents.slice(MAX_PARENT_COLUMNS);

  const childrenOf = (parentId: any) => (categories || []).filter((c) => c?.parent_id === parentId && !c?.is_deleted);

  const handleLinkClick = (parentId: string, categoryId: string) => {
    if (isPreview) return;
    onCategoryClick(parentId, categoryId);
  };

  // đóng dropdown khi click ra ngoài
  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!moreOpen) return;
      const el = moreWrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [moreOpen]);

  const LogoContent = (
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-[#21294a] w-12 h-12 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-[#21294a]/20 group-hover:scale-105 transition-all duration-300">
        <img src="/logo_4.png"/>
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
    <footer className="font-sans bg-white border-t border-[#e6e6e6] mt-20 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2.5fr_repeat(5,1fr)] gap-x-8 gap-y-10 mb-12">
          {/* BRAND */}
          <div className="min-w-0">
            {isPreview ? (
              LogoContent
            ) : (
              <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="cursor-pointer">
                {LogoContent}
              </Link>
            )}
          </div>

          {/* VISIBLE PARENTS */}
          {visibleParents.map((pc) => (
            <div key={pc.id} className="min-w-0">
              <button
                onClick={() => handleLinkClick(String(pc.id), "")}
                className={`text-[12px] font-bold text-[#1a1a1a] uppercase tracking-wide mb-6 transition-colors text-left block w-full ${isPreview ? "cursor-default" : "hover:text-[#4a4a4a]"}`}
                title={pc.name}
              >
                <span className="inline-block truncate max-w-full">{pc.name}</span>
              </button>

              <ul className="space-y-3.5">
                {childrenOf(pc.id).map((cat) => (
                  <li key={cat.id} className="min-w-0">
                    <button
                      onClick={() => handleLinkClick(String(pc.id), String(cat.id))}
                      className={`text-[14px] font-normal text-[#666666] transition-colors text-left block w-full ${isPreview ? "cursor-default" : "hover:text-[#1a1a1a]"}`}
                      title={cat.name}
                    >
                      <span className="inline-block truncate max-w-full">{cat.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* MORE: text là Home, dropdown là icon */}
          {overflowParents.length > 0 && (
            <div className="min-w-0" ref={moreWrapRef}>
              <div className="relative">
                <div
                  className={[
                    "absolute left-0 right-0 z-20",
                    "rounded-lg border border-slate-200 bg-white shadow-lg",
                    "p-3",
                    moreOpen ? "block" : "hidden",
                  ].join(" ")}
                >
                  <div className="max-h-72 overflow-auto pr-1">
                    {overflowParents.map((pc) => (
                      <div key={pc.id} className="py-2">
                        <button
                          onClick={() => {
                            handleLinkClick(String(pc.id), "");
                            setMoreOpen(false);
                          }}
                          className={`w-full text-left text-[15px] font-semibold text-[#1a1a1a] transition-colors ${isPreview ? "cursor-default" : "hover:text-[#4a4a4a]"}`}
                          title={pc.name}
                        >
                          <span className="inline-block truncate max-w-full">{pc.name}</span>
                        </button>

                        <ul className="mt-2 space-y-2 pl-3 border-l border-slate-200">
                          {childrenOf(pc.id)
                            .slice(0, 8)
                            .map((cat) => (
                              <li key={cat.id} className="min-w-0">
                                <button
                                  onClick={() => {
                                    handleLinkClick(String(pc.id), String(cat.id));
                                    setMoreOpen(false);
                                  }}
                                  className={`text-[14px] font-normal text-[#666666] transition-colors text-left block w-full ${isPreview ? "cursor-default" : "hover:text-[#1a1a1a]"}`}
                                  title={cat.name}
                                >
                                  <span className="inline-block truncate max-w-full">{cat.name}</span>
                                </button>
                              </li>
                            ))}

                          {childrenOf(pc.id).length > 8 && (
                            <li>
                              <button
                                onClick={() => {
                                  handleLinkClick(String(pc.id), "");
                                  setMoreOpen(false);
                                }}
                                className={`text-xs font-bold text-black transition ${isPreview ? "cursor-default" : "hover:text-black"}`}
                              >
                                More →
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-[#e6e6e6] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] font-medium text-[#999999] uppercase tracking-wide text-center md:text-left">
            © {new Date().getFullYear()} GLOBAL PROMOTION. ALL RIGHTS RESERVED.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3">
            {["About us", "Terms", "Privacy", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                onClick={(e) => isPreview && e.preventDefault()}
                className={`text-[11px] font-medium text-[#999999] uppercase tracking-wide transition-colors ${isPreview ? "cursor-default" : "hover:text-[#1a1a1a]"}`}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}