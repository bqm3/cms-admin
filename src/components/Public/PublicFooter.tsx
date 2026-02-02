/* eslint-disable react/jsx-sort-props */
/* eslint-disable prettier/prettier */
import { useMemo, useState, useRef, useEffect } from "react";
import { LayoutGrid, ChevronDown } from "lucide-react";

interface PublicFooterProps {
  parentCategories: any[];
  categories: any[];
  onCategoryClick: (parentId: string, categoryId: string) => void;
}

export function PublicFooter({ parentCategories, categories, onCategoryClick }: PublicFooterProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreWrapRef = useRef<HTMLDivElement | null>(null);

  const parents = useMemo(
    () => (parentCategories || []).filter((pc) => !pc?.is_deleted),
    [parentCategories]
  );

  const MAX_PARENT_COLUMNS = 4;
  const visibleParents = parents.slice(0, MAX_PARENT_COLUMNS);
  const overflowParents = parents.slice(MAX_PARENT_COLUMNS);

  const childrenOf = (parentId: any) =>
    (categories || []).filter((c) => c?.parent_id === parentId && !c?.is_deleted);

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

  return (
    <footer className="bg-white border-t border-slate-200 mt-32 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-10 gap-y-12 mb-16">
          {/* BRAND */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 p-2 rounded-xl shadow-blue-500/20 shadow-lg">
                <LayoutGrid className="text-white" size={20} />
              </div>
              <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                GLOBAL PROMOTION
              </span>
            </div>

            <p className="text-sm text-slate-700 font-semibold leading-relaxed mb-6">
              Nền tảng trưng bày và khám phá những mẫu thiết kế website cao cấp được xây dựng trên công nghệ Craft JS.
            </p>

            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
                />
              ))}
            </div>
          </div>

          {/* VISIBLE PARENTS */}
          {visibleParents.map((pc) => (
            <div key={pc.id} className="min-w-0">
              <button
                onClick={() => onCategoryClick(String(pc.id), "")}
                className="text-xs font-extrabold text-slate-900 uppercase tracking-[0.18em] mb-5 hover:text-blue-600 transition-colors text-left block"
                title={pc.name}
              >
                <span className="inline-block truncate max-w-full">{pc.name}</span>
              </button>

              <ul className="space-y-3">
                {childrenOf(pc.id).map((cat) => (
                  <li key={cat.id} className="min-w-0">
                    <button
                      onClick={() => onCategoryClick(String(pc.id), String(cat.id))}
                      className="text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors text-left block w-full"
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
              <div className="flex items-center justify-between mb-5">
                {/* "More" = về trang chủ */}
                <button
                  type="button"
                  onClick={() => {
                    onCategoryClick("", ""); // home / all
                    setMoreOpen(false);
                  }}
                  className="text-xs font-extrabold text-slate-900 uppercase tracking-[0.18em] hover:text-blue-600 transition-colors text-left inline-flex items-center"
                  title="Về trang chủ"
                >
                  Xem toàn bộ
                </button>

                {/* icon riêng để mở dropdown */}
                {/* <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
                  aria-label="Mở danh mục"
                >
                  <ChevronDown size={16} className={`transition ${moreOpen ? "rotate-180" : ""}`} />
                </button> */}
              </div>

              <div className="relative">
                <div
                  className={[
                    "absolute left-0 right-0 z-20",
                    "rounded-xl border border-slate-200 bg-white shadow-lg",
                    "p-3",
                    moreOpen ? "block" : "hidden",
                  ].join(" ")}
                >
                  <div className="max-h-72 overflow-auto pr-1">
                    {overflowParents.map((pc) => (
                      <div key={pc.id} className="py-2">
                        <button
                          onClick={() => {
                            onCategoryClick(String(pc.id), "");
                            setMoreOpen(false);
                          }}
                          className="w-full text-left text-sm font-extrabold text-slate-900 hover:text-blue-600 transition-colors"
                          title={pc.name}
                        >
                          <span className="inline-block truncate max-w-full">{pc.name}</span>
                        </button>

                        <ul className="mt-2 space-y-2 pl-3 border-l border-slate-200">
                          {childrenOf(pc.id).slice(0, 8).map((cat) => (
                            <li key={cat.id} className="min-w-0">
                              <button
                                onClick={() => {
                                  onCategoryClick(String(pc.id), String(cat.id));
                                  setMoreOpen(false);
                                }}
                                className="text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors text-left block w-full"
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
                                  onCategoryClick(String(pc.id), "");
                                  setMoreOpen(false);
                                }}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                              >
                                Xem tất cả →
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

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-[0.22em] text-center md:text-left">
            © {new Date().getFullYear()} GLOBAL PROMOTION. TẤT CẢ QUYỀN ĐƯỢC BẢO LƯU.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-3">
            {["Về chúng tôi", "Điều khoản", "Bảo mật", "Liên hệ"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs font-bold text-slate-700 hover:text-slate-950 uppercase tracking-[0.18em] transition-colors"
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
