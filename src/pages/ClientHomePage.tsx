/* eslint-disable prettier/prettier */
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@heroui/button";
import { ChevronRight, Clock, ExternalLink, Tag, Flame } from "lucide-react";
import api, { SERVER_URL } from "../services/api";
import { usePublicData } from "../hooks/usePublicData";
import { PostCard } from "../components/Public/PostCard";
import { PublicHeader } from "../components/Public/PublicHeader";
import { PublicFooter } from "../components/Public/PublicFooter";
import { PUBLIC_SITE_HOST, PUBLIC_SITE_URL } from "../config/site";

// ─── Countdown hook ──────────────────────────────────────────────────────────
function useCountdown(endDate: string | null) {
  const calc = () => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds, expired: false };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    if (!endDate) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [endDate]); // eslint-disable-line react-hooks/exhaustive-deps
  return time;
}

// ─── CountdownDisplay component ───────────────────────────────────────────────
function CountdownDisplay({ endDate }: { endDate: string | null }) {
  const time = useCountdown(endDate);
  if (!time) return null;
  if (time.expired) return (
    <div className="flex items-center gap-1 text-xs font-bold text-red-400">
      <Clock size={15} /> Expired
    </div>
  );
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-[20px] font-semibold text-white/80">Hunt for Hot Deals inside:</span>
      {[time.hours, time.minutes, time.seconds].map((val, i) => (
        <div key={i} className="flex items-center gap-1.5 text-[20px]">
          <div className="bg-[#ee4d2d] text-[20px] text-white font-black text-sm w-9 h-9 flex items-center justify-center rounded-lg tabular-nums shadow-inner">
            {pad(val)}
          </div>
          {i < 2 && <span className="text-white font-black text-base text-[18px]">:</span>}
        </div>
      ))}
    </div>
  );
}

// ─── FeaturedDealCard ─────────────────────────────────────────────────────────
function FeaturedDealCard({ deal }: { deal: any }) {
  const imageUrl = deal.image
    ? deal.image.startsWith("http") ? deal.image : `${SERVER_URL}${deal.image}`
    : "";

  const handleClick = () => {
    if (deal.url) window.open(deal.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-row rounded-2xl overflow-hidden border-2 border-[#ee4d2d]/70 bg-gradient-to-r from-[#1a2240] to-[#1a2240] hover:shadow-xl transition-all duration-300 h-[240px] ${deal.url ? "cursor-pointer" : ""}`}
    >
      {/* Left: text content — takes exactly half width */}
      <div className="flex flex-col justify-center gap-3 px-8 py-6 w-1/2 min-w-0 shrink-0 z-10">
        {/* Top label */}
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-400 shrink-0" />
          <span className="text-white/70 text-sm font-bold uppercase tracking-widest">Featured Deal</span>
        </div>

        {/* Countdown */}
        {deal.countdown_end && (
          <CountdownDisplay endDate={deal.countdown_end} />
        )}

        {/* Title */}
        <h3 className="text-white font-black text-2xl md:text-3xl leading-tight line-clamp-2 group-hover:text-orange-200 transition-colors">
          {deal.title}
        </h3>

        {/* Description */}
        {deal.description && (
          <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
            {deal.description}
          </p>
        )}

        {/* CTA */}
        {deal.url && (
          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 inline-flex items-center gap-1.5 text-orange-300 hover:text-orange-200 text-sm font-bold transition-colors w-fit"
          >
            Find More <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* Right: image — absolute, fills exactly the right half, full height */}
      {imageUrl && (
        <div className="absolute right-0 top-0 bottom-0 w-1/2">
          <img
            src={imageUrl}
            alt={deal.title}
            className="w-full h-full object-[inherit]  transition-transform duration-500"
            loading="lazy"
          />
          {/* left edge fade so text doesn't clash */}
          <div className="absolute inset-y-0 left-0 w-16  pointer-events-none" />
        </div>
      )}
    </div>
  );
}

function stripHtml(html: string) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ClientHomePage() {
  const navigate = useNavigate();
  const {
    categories,
    parentCategories,
    loading: dataLoading,
  } = usePublicData();

  const [groupedPosts, setGroupedPosts] = useState<Record<string, any[]>>({});
  const [postsLoading, setPostsLoading] = useState(true);
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [featuredDeals, setFeaturedDeals] = useState<any[]>([]);
  const [latestReviews, setLatestReviews] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchGroupedPosts = useCallback(async (parents: any[]) => {
    try {
      setPostsLoading(true);
      const results = await Promise.all(
        parents.map((pc) =>
          api.get(`/posts/public/catalog/${pc.slug || pc.id}`, {
            params: { limit: 8, sort: "created_at:DESC" },
          }),
        ),
      );
      const mapping: Record<string, any[]> = {};
      parents.forEach((pc, idx) => {
        mapping[pc.slug || pc.id] = results[idx].data.posts || [];
      });
      setGroupedPosts(mapping);
    } catch (err) {
      console.error("Error fetching grouped posts:", err);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  // Fetch latest 8 posts across all categories
  const fetchLatestPosts = useCallback(async () => {
    try {
      const res = await api.get("/posts/public", {
        params: { limit: 8, sort: "created_at:DESC" },
      });
      setLatestPosts(res.data.posts || []);
    } catch (err) {
    }
  }, []);

  // Fetch featured deals
  const fetchFeaturedDeals = useCallback(async () => {
    try {
      const res = await api.get("/featured-deals/public");
      setFeaturedDeals(res.data.deals || []);
    } catch (err) {
      console.error("Error fetching featured deals:", err);
    }
  }, []);

  // Fetch latest reviews
  const fetchLatestReviews = useCallback(async () => {
    try {
      const res = await api.get("/reviews/public", { params: { limit: 3 } });
      setLatestReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Error fetching latest reviews:", err);
    }
  }, []);

  // Fetch banners
  const fetchBanners = useCallback(async () => {
    try {
      const res = await api.get("/banners/public");
      setBanners(res.data.banners || []);
    } catch (err) {
      console.error("Error fetching banners:", err);
    }
  }, []);

  useEffect(() => {
    if (parentCategories.length > 0) {
      fetchGroupedPosts(parentCategories.filter((p) => !p.is_deleted));
    }
  }, [parentCategories, fetchGroupedPosts]);

  useEffect(() => {
    fetchLatestPosts();
    fetchFeaturedDeals();
    fetchLatestReviews();
    fetchBanners();
  }, [fetchLatestPosts, fetchFeaturedDeals, fetchLatestReviews, fetchBanners]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navigateToCategory = (parentId: string, categoryId: string) => {
    let url = `/category/${parentId}`;
    if (categoryId) url += `/${categoryId}`;
    navigate(url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeParents = parentCategories.filter((pc) => !pc.is_deleted);

  const isLoading =
    dataLoading ||
    (parentCategories.length > 0 && postsLoading && Object.keys(groupedPosts).length === 0);

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans selection:bg-blue-100 selection:text-blue-900">
      <Helmet prioritizeSeoTags>
        <title>Couponza</title>
        <meta name="title" content="Couponza latest" />
        <meta name="description" content={`Use ${PUBLIC_SITE_HOST} to find the latest discount codes...`} />
        <meta name="keywords" content="Couponza, couponza latest, couponza coupons" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={`${PUBLIC_SITE_URL}/`} />
        <meta property="og:title" content="Couponza latest" />
        <meta property="og:description" content={`Use ${PUBLIC_SITE_HOST} to find the latest discount codes...`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${PUBLIC_SITE_URL}/`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Couponza latest" />
        <meta name="twitter:description" content={`Use ${PUBLIC_SITE_HOST} to find the latest discount codes...`} />
      </Helmet>

      <PublicHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
        parentCategories={parentCategories}
        categories={categories}
      />

      {/* ── BANNERS ──────────────────────────────────────────────────── */}
      {banners.length > 0 && (
        <div className="w-full">
          {banners.map((banner) => {
            const imgUrl = banner.image
              ? banner.image.startsWith("http") ? banner.image : `${SERVER_URL}${banner.image}`
              : null;
            return (
              <div
                key={banner.id}
                className="relative w-full overflow-hidden"
                style={{ minHeight: "320px" }}
              >
                {/* Full background image */}
                {imgUrl && (
                  <img
                    src={imgUrl}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="eager"
                  />
                )}
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />

                {/* Content — left aligned */}
                <div className="relative z-10 flex flex-col justify-center gap-4 px-8 md:px-16 py-16 max-w-2xl h-full min-h-[320px]">
                  <h2 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">
                    {banner.title}
                  </h2>
                  {banner.description && (
                    <p className="text-white/80 text-base md:text-lg leading-relaxed font-medium max-w-lg">
                      {banner.description}
                    </p>
                  )}
                  {banner.url && (
                    <div className="mt-2">
                      <a
                        href={banner.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#ee4d2d] hover:bg-[#d9431f] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-[#ee4d2d]/30 transition-all duration-200 hover:-translate-y-0.5"
                      >
                        Discover now
                        <ExternalLink size={15} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <main className="max-w-[1500px] mx-auto px-4 md:px-6 mt-12 pb-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-12 h-12 border-4 border-[#ee4d2d]/20 border-t-[#ee4d2d] rounded-full animate-spin" />
            <p className="text-gray-700 text-xs font-semibold uppercase tracking-wide animate-pulse">Loading...</p>
          </div>
        ) : (
          <div className="space-y-20">

            {/* ── 1. 8 BÀI MỚI NHẤT ──────────────────────────────────── */}
            {latestPosts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight flex items-center gap-2">
                    <Clock size={24} className="text-[#ee4d2d]" />
                    Latest Posts
                  </h2>
                  <Button
                    variant="light"
                    className="font-semibold text-[14px] bg-[#ee4d2d] text-white hover:bg-[#ee4d2d]/90 px-5 h-9 rounded-lg group/btn transition-all"
                    onClick={() => navigate("/category")}
                  >
                    Find More <ChevronRight size={15} className="ml-1 text-white" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {latestPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* ── 2. DANH MỤC PHỔ BIẾN ────────────────── */}
            {activeParents.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Tag size={22} className="text-[#ee4d2d]" />
                  <h2 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight">Popular Categories</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {activeParents.map((pc) => {
                    const sub = categories.filter((c) => c.parent_id === pc.id && !c.is_deleted);
                    const imgUrl = pc.image
                      ? pc.image.startsWith("http") ? pc.image : `${SERVER_URL}${pc.image}`
                      : null;
                    return (
                      <button
                        key={pc.id}
                        onClick={() => navigateToCategory(String(pc.slug || pc.id), "")}
                        className="group flex flex-col items-center justify-center gap-2 bg-white border-2 border-[#e6e6e6] hover:border-[#ee4d2d] rounded-xl px-4 py-5 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#f3f4f6] group-hover:bg-[#ee4d2d]/10 flex items-center justify-center transition-colors overflow-hidden">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={pc.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Tag size={22} className="text-[#ee4d2d]" />
                          )}
                        </div>
                        <span className="font-bold text-[14px] text-[#1a1a1a] group-hover:text-[#ee4d2d] transition-colors leading-tight">
                          {pc.name}
                        </span>
                        {sub.length > 0 && (
                          <span className="text-[11px] text-slate-400 font-medium">{sub.length} subcategories</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── 3. DEAL NỔI BẬT ─────────────────────────────────────── */}
            {featuredDeals.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Flame size={22} className="text-red-500" />
                  <h2 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight">Featured Deals</h2>
                </div>
                <div className="space-y-5">
                  {featuredDeals.map((deal) => (
                    <FeaturedDealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              </section>
            )}

            {/* ── 4. GROUPED CATEGORY POSTS ───────────────────────────── */}
            {/* {activeParents.map((pc) => {
              const pcPosts = groupedPosts[pc.slug || pc.id] || [];
              if (pcPosts.length === 0) return null;
              return (
                <section key={pc.id} className="relative">
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight">{pc.name}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pcPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                  <div className="flex justify-center mt-10">
                    <Button
                      variant="light"
                      className="font-semibold text-[14px] bg-[#ee4d2d] text-white hover:bg-[#ee4d2d]/90 px-6 h-10 rounded-lg group/btn transition-all"
                      onClick={() => navigateToCategory(String(pc.slug || pc.id), "")}
                    >
                      More <ChevronRight size={16} className="ml-1 text-white" />
                    </Button>
                  </div>
                </section>
              );
            })} */}

            {/* ── 5. REVIEW MỚI NHẤT ──────────────────────────────────── */}
            {latestReviews.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight">Latest Review Posts</h2>
                  <Button
                    as={Link}
                    to="/review"
                    variant="light"
                    className="font-semibold text-[14px] bg-[#ee4d2d] text-white hover:bg-[#ee4d2d]/90 px-5 h-9 rounded-lg transition-all"
                  >
                    Find More <ChevronRight size={15} className="ml-1 text-white" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {latestReviews.map((review) => {
                    const imageUrl = review.img_bg
                      ? review.img_bg.startsWith("http") ? review.img_bg : `${SERVER_URL}${review.img_bg}`
                      : "";
                    const contentText = stripHtml(review.content || "");
                    const excerpt = contentText.length > 180 ? `${contentText.slice(0, 180).trimEnd()}...` : contentText;
                    return (
                      <Link
                        key={review.id}
                        to={`/review/${review.slug}`}
                        className="group overflow-hidden rounded-2xl border border-[#e6e6e6] bg-white shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                      >
                        <div className="h-48 bg-slate-100 overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={review.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-3xl uppercase italic">
                              {review.title?.substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col gap-2">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {new Date(review.created_at).toLocaleDateString("vi-VN")}
                          </p>
                          <h3 className="text-lg font-bold text-[#1a1a1a] line-clamp-2 group-hover:text-[#ee4d2d] transition-colors">
                            {review.title}
                          </h3>
                          {excerpt && (
                            <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{excerpt}</p>
                          )}
                          <div className="mt-auto pt-3">
                            <span className="inline-flex items-center gap-1 text-[#ee4d2d] font-bold text-sm group-hover:gap-2 transition-all">
                              Read more <ChevronRight size={14} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

          </div>
        )}
      </main>

      <PublicFooter
        parentCategories={parentCategories}
        categories={categories}
        onCategoryClick={navigateToCategory}
      />
    </div>
  );
}
