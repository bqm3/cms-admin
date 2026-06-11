/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable prettier/prettier */
import React from "react";
import { Link } from "react-router-dom";
import { useMemo, useState, useRef, useEffect } from "react";
import { ChevronDown, Facebook, Twitter, Disc as Pinterest, Video as TikTok } from "lucide-react";
import api from "../../services/api";

interface PublicFooterProps {
  parentCategories: any[];
  categories: any[];
  onCategoryClick: (parentId: string, categoryId: string) => void;
  isPreview?: boolean;
}

export function PublicFooter({
  parentCategories,
  categories,
  onCategoryClick,
  isPreview = false,
}: PublicFooterProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreWrapRef = useRef<HTMLDivElement | null>(null);
  const [bottomLinks, setBottomLinks] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);

  useEffect(() => {
    const fetchFooterLinks = async () => {
      try {
        const response = await api.get("/footer-links");
        const allLinks = response.data || [];
        
        // Social links
        const socials = allLinks.filter((l: any) => l.type === "social");
        if (socials.length > 0) {
          setSocialLinks(socials);
        } else {
          setSocialLinks([
            { label: "Facebook", href: "https://facebook.com/profile.php?id=61586819626148" },
            { label: "X", href: "https://x.com/lxndrnaiom" },
            { label: "Pinterest", href: "https://www.pinterest.com/lxndrnaiom/" },
            { label: "TikTok", href: "https://www.tiktok.com/@globalpromotionllc" },
          ]);
        }

        // Bottom links
        const bottoms = allLinks.filter((l: any) => l.type === "bottom").map((link: any) => {
          if (link.label.toLowerCase() === "about us" && (link.href === "/#" || link.href === "/")) {
            return { ...link, href: "/about-us" };
          }
          if (link.label.toLowerCase() === "privacy" && (link.href === "/#" || link.href === "/")) {
            return { ...link, href: "/privacy-policy" };
          }
          if (link.label.toLowerCase() === "terms" && (link.href === "/#" || link.href === "/")) {
            return { ...link, href: "/terms" };
          }
          if (link.label.toLowerCase() === "contact" && (link.href === "/#" || link.href === "/")) {
            return { ...link, href: "/contact" };
          }
          return link;
        });

        const reviewLink = bottoms.find((item: any) => item.label?.toLowerCase() === "review");
        const normalizedBottoms = reviewLink ? bottoms : [...bottoms, { label: "Review", href: "/review" }];

        if (normalizedBottoms.length > 0) {
          setBottomLinks(normalizedBottoms);
        } else {
          setBottomLinks([
            { label: "About us", href: "/about-us" },
            { label: "Terms", href: "/terms" },
            { label: "Privacy", href: "/privacy-policy" },
            { label: "Contact", href: "/contact" },
            { label: "Review", href: "/review" },
          ]);
        }

      } catch (error) {
        // Fallbacks
        setSocialLinks([
          { label: "Facebook", href: "https://facebook.com/profile.php?id=61586819626148" },
          { label: "X", href: "https://x.com/lxndrnaiom" },
          { label: "Pinterest", href: "https://www.pinterest.com/lxndrnaiom/" },
          { label: "TikTok", href: "https://www.tiktok.com/@globalpromotionllc" },
        ]);
        setBottomLinks([
          { label: "About us", href: "/about-us" },
          { label: "Terms", href: "/terms" },
          { label: "Privacy", href: "/privacy-policy" },
          { label: "Contact", href: "/contact" },
          { label: "Review", href: "/review" },
        ]);
      }

    };
    fetchFooterLinks();
  }, []);

  const parents = useMemo(
    () => (parentCategories || []).filter((pc) => !pc?.is_deleted),
    [parentCategories],
  );

  const cats = useMemo(
    () => (categories || []).filter((c) => !c?.is_deleted),
    [categories],
  );

  const isDataReady = parents.length > 0; // quan trọng để chống CLS

  const MAX_PARENT_COLUMNS = 5;
  const MAX_CHILDREN_PER_PARENT = 5;
  const visibleParents = parents.slice(0, MAX_PARENT_COLUMNS);
  const overflowParents = parents.slice(MAX_PARENT_COLUMNS);

  const childrenOf = (parentId: any) =>
    cats.filter((c) => c?.parent_id === parentId);

  const handleLinkClick = (parentSlug: string, categorySlug: string) => {
    if (isPreview) return;
    onCategoryClick(parentSlug, categorySlug);
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

  // ✅ Skeleton column để giữ layout cố định, tránh CLS
  const SkeletonColumn = ({ i }: { i: number }) => (
    <div className="min-w-0" key={`sk-${i}`}>
      <div className="h-4 w-28 bg-slate-200 rounded mb-6" />
      <ul className="space-y-3.5">
        {Array.from({ length: 6 }).map((_, k) => (
          <li key={k}>
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </li>
        ))}
      </ul>
    </div>
  );

  const LogoContent = (
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-[#21294a] w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-[#21294a]/20 transition-all duration-300">
        {/* ✅ Logo nhỏ + srcset để giảm ~300KB như PSI report */}
        <img
          src="/logo_cms.webp"
          srcSet="/logo_cms.webp 1x, /logo_cms.webp 2x"
          width={48}
          height={47}
          alt="Couponza"
          decoding="async"
          className="block"
        />
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
    // ✅ min-h để giữ chiều cao footer khi data tới (chặn CLS)
    <footer className="font-sans bg-white border-t border-[#e6e6e6] mt-20 pt-16 pb-10 min-h-[520px]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2.5fr_repeat(5,1fr)] gap-x-8 gap-y-10 mb-12">
          {/* BRAND */}
          <div className="min-w-0">
            {isPreview ? (
              LogoContent
            ) : (
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="cursor-pointer"
              >
                {LogoContent}
              </Link>
            )}

            <div className="flex items-center gap-3.5 mt-8">
              {socialLinks.map((link, idx) => {
                const isFacebook = link.label.toLowerCase().includes("facebook");
                const isX =
                  link.label.toLowerCase().includes("x") ||
                  link.label.toLowerCase().includes("twitter");
                const isPinterest = link.label.toLowerCase().includes("pinterest");
                const isTikTok = link.label.toLowerCase().includes("tiktok");

                let icon = <Facebook size={18} fill="currentColor" fillOpacity={0.2} />;
                let colors =
                  "bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:shadow-[#1877F2]/30";

                if (isX) {
                  icon = (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  );
                  colors = "bg-black/5 text-black hover:bg-black hover:shadow-black/20";
                } else if (isPinterest) {
                  icon = (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.259 7.929-7.259 4.162 0 7.398 2.965 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.62 0 11.983-5.363 11.983-11.987C24 5.367 18.637 0 12.017 0z" />
                    </svg>
                  );
                  colors = "bg-[#E60023]/10 text-[#E60023] hover:bg-[#E60023] hover:shadow-[#E60023]/30";
                } else if (isTikTok) {
                  icon = (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.33-.85.51-1.44 1.43-1.58 2.41-.05.3-.01.61.12.89.26.82.91 1.54 1.72 1.78.73.22 1.57.14 2.23-.29.83-.51 1.34-1.47 1.34-2.43 0-4.07-.02-8.14.02-12.21z" />
                    </svg>
                  );
                  colors = "bg-black/5 text-black hover:bg-black hover:shadow-black/20";
                }

                return (
                  <a
                    key={idx}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 ${colors} hover:text-white`}
                    title={link.label}
                  >
                    {icon}
                  </a>
                );
              })}
            </div>
          </div>

          {/* ✅ giữ layout: nếu chưa có data thì render 5 skeleton columns */}
          {!isDataReady ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonColumn i={i} key={i} />
              ))}
            </>
          ) : (
            <>
              {/* VISIBLE PARENTS */}
              {visibleParents.map((pc) => (
                <div key={pc.id} className="min-w-0">
                  <button
                    onClick={() => handleLinkClick(String(pc.slug), "")}
                    className={`text-[12px] font-bold text-[#1a1a1a] uppercase tracking-wide mb-6 transition-colors text-left block w-full ${
                      isPreview ? "cursor-default" : "hover:text-[#4a4a4a]"
                    }`}
                    title={pc.name}
                  >
                    <span className="inline-block truncate max-w-full">
                      {pc.name}
                    </span>
                  </button>

                  <ul className="space-y-3.5">
                    {childrenOf(pc.id)
                      .slice(0, MAX_CHILDREN_PER_PARENT)
                      .map((cat) => (
                        <li key={cat.id} className="min-w-0">
                          <button
                            onClick={() =>
                              handleLinkClick(String(pc.slug), String(cat.slug))
                            }
                            className={`text-[14px] font-normal text-[#666666] transition-colors text-left block w-full ${
                              isPreview
                                ? "cursor-default"
                                : "hover:text-[#1a1a1a]"
                            }`}
                            title={cat.name}
                          >
                            <span className="inline-block truncate max-w-full">
                              {cat.name}
                            </span>
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}

              {/* ✅ MORE COLUMN: có trigger + dropdown */}
              <div className="min-w-0" ref={moreWrapRef}>
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  className={`text-[12px] font-bold text-[#1a1a1a] uppercase tracking-wide mb-6 transition-colors text-left w-full flex items-center gap-2 ${
                    isPreview ? "cursor-default" : "hover:text-[#4a4a4a]"
                  }`}
                >
                  <span className="truncate">More</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {overflowParents.length > 0 && (
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
                                handleLinkClick(String(pc.slug), "");
                                setMoreOpen(false);
                              }}
                              className={`w-full text-left text-[15px] font-semibold text-[#1a1a1a] transition-colors ${
                                isPreview
                                  ? "cursor-default"
                                  : "hover:text-[#4a4a4a]"
                              }`}
                              title={pc.name}
                            >
                              <span className="inline-block truncate max-w-full">
                                {pc.name}
                              </span>
                            </button>

                            <ul className="mt-2 space-y-2 pl-3 border-l border-slate-200">
                              {childrenOf(pc.id)
                                .slice(0, MAX_CHILDREN_PER_PARENT)
                                .map((cat) => (
                                  <li key={cat.id} className="min-w-0">
                                    <button
                                      onClick={() => {
                                        handleLinkClick(
                                          String(pc.slug),
                                          String(cat.slug),
                                        );
                                        setMoreOpen(false);
                                      }}
                                      className={`text-[14px] font-normal text-[#666666] transition-colors text-left block w-full ${
                                        isPreview
                                          ? "cursor-default"
                                          : "hover:text-[#1a1a1a]"
                                      }`}
                                      title={cat.name}
                                    >
                                      <span className="inline-block truncate max-w-full">
                                        {cat.name}
                                      </span>
                                    </button>
                                  </li>
                                ))}

                              {childrenOf(pc.id).length >
                                MAX_CHILDREN_PER_PARENT && (
                                <li>
                                  <button
                                    onClick={() =>
                                      handleLinkClick(String(pc.slug), "")
                                    }
                                    className={`text-xs font-bold text-black transition ${
                                      isPreview
                                        ? "cursor-default"
                                        : "hover:text-black"
                                    }`}
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
                )}
              </div>
            </>
          )}
        </div>

        {/* ✅ giữ chiều cao khu vực bottom bar để không nhảy */}
        <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 min-h-[44px]">
          <p className="text-xs font-semibold text-gray-700 tracking-wide text-center">
            © {new Date().getFullYear()} COUPONZA. ALL RIGHTS RESERVED.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3">
            {bottomLinks.map((item: any) =>
              isPreview ? (
                <button
                  key={item.label}
                  type="button"
                  className="text-xs font-semibold text-gray-700 uppercase tracking-wide transition-colors cursor-default"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="text-xs font-semibold text-gray-700 uppercase tracking-wide transition-colors hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
