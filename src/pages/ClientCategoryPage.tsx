/* eslint-disable prettier/prettier */
import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Pagination } from "@heroui/pagination";
import { ChevronRight, X, Search, LayoutGrid } from "lucide-react";
import api from "../services/api";
import { usePublicData } from "../hooks/usePublicData";
import { PostCard } from "../components/Public/PostCard";
import { PublicHeader } from "../components/Public/PublicHeader";
import { PublicFooter } from "../components/Public/PublicFooter";

export function ClientCategoryPage() {
  const { parentSlug: pathParentSlug, categorySlug: pathCategorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { categories, parentCategories, loading: dataLoading } = usePublicData();

  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // Params from URL
  const search = searchParams.get("search") || "";
  const selectedCategory = pathCategorySlug || searchParams.get("category") || "";
  const selectedParentCategory = pathParentSlug || searchParams.get("parentCategory") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 12;

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchPosts = useCallback(async () => {
    try {
      setPostsLoading(true);

      let url = "/posts/public";
      if (selectedParentCategory) {
        url = `/posts/public/catalog/${selectedParentCategory}`;
        if (selectedCategory) {
          url += `/${selectedCategory}`;
        }
      }

      const response = await api.get(url, {
        params: {
          sort: "sequence_number:ASC",
          search,
          page,
          limit,
        },
      });
      if (response.data.posts) {
        setPosts(response.data.posts);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.total || 0);
      } else {
        setPosts(response.data);
        setTotalPages(1);
        setTotalItems(response.data.length || 0);
      }
    } catch (err) {
      console.error("Error fetching category posts:", err);
    } finally {
      setPostsLoading(false);
    }
  }, [search, selectedCategory, selectedParentCategory, page, limit]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const updateParams = useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const handleSearchChange = (val: string) => {
    updateParams({ search: val, page: "1" });
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    // search is already updated in URL via handleSearchChange if using on-the-fly search,
    // or we can just let it be.
  };

  const navigateToCategory = (pSlug: string, cSlug: string) => {
    let url = `/category/${pSlug}`;
    if (cSlug) url += `/${cSlug}`;

    const searchStr = searchParams.get("search");
    if (searchStr) url += `?search=${encodeURIComponent(searchStr)}`;

    navigate(url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLoading = dataLoading || (postsLoading && posts.length === 0);

  // Dynamic page title
  // ===== SEO dynamic =====
  const parentName = parentCategories.find((p) => String(p.slug) === String(selectedParentCategory))?.name || "";

  const categoryName = categories.find((c) => String(c.slug) === String(selectedCategory))?.name || "";

  // Ưu tiên category con > category cha
  const brandName = categoryName || parentName || "Global Promotion";

  const pageTitle = `${brandName} promotion latest`;

  const pageDescription = `Use Globalpromotionllc.com to find the latest discount codes and best deals when shopping online at ${brandName} through Globalpromotionllc.com. Save more on every order with our verified discount codes, food coupons, and cashback offers.`;

  const pageKeywords = `${brandName}, ${brandName.toLowerCase()} promotion, ${brandName.toLowerCase()} promotion newest`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-slate-200 selection:text-slate-900">
      <Helmet prioritizeSeoTags>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index,follow" />
      </Helmet>

      <PublicHeader
        searchQuery={search}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        selectedParentCategory={selectedParentCategory}
        onParentCategoryChange={(val) => navigateToCategory(val, "")}
        parentCategories={parentCategories}
        categories={categories}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        <section>
          {/* Header Section */}
          <div className="flex flex-col gap-8 mb-12">
            {/* Breadcrumb / Category Info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[13px] font-bold text-black uppercase tracking-widest">
                  <LayoutGrid size={14} />
                  <span>Explore the project</span>
                  {selectedParentCategory && (
                    <>
                      <ChevronRight size={14} />
                      <span className="text-black">{parentCategories.find((p) => String(p.slug) === String(selectedParentCategory))?.name}</span>
                    </>
                  )}
                </div>

                <h2 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight leading-none">
                  {search ? (
                    <span className="flex items-center gap-4">
                      Results for: <span className="opacity-40 italic">&ldquo;{search}&ldquo;</span>
                    </span>
                  ) : (
                    parentCategories.find((p) => String(p.slug) === String(selectedParentCategory))?.name || "All projects"
                  )}
                </h2>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-full border border-black/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[13px] font-bold text-black uppercase tracking-wider">
                      <span className="font-black">{totalItems}</span> The website is live
                    </p>
                  </div>
                </div>
              </div>

              {/* Filters Bar */}
              {/* <div className="flex flex-wrap items-center gap-3 self-start md:self-end">
                                {selectedParentCategory && (
                                    <div className="relative group min-w-[200px]">
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => updateParams({ category: e.target.value, page: "1" })}
                                            className="appearance-none w-full bg-white border border-slate-200 rounded-xl text-[14px] font-bold text-black px-5 py-3.5 pr-10 outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all cursor-pointer shadow-sm hover:border-slate-300"
                                        >
                                            <option value="">All subcategories</option>
                                            {categories
                                                .filter(c => c.parent_id === Number(selectedParentCategory) && !c.is_deleted)
                                                .map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronRight size={16} className="rotate-90" />
                                        </div>
                                    </div>
                                )}

                                {(search || selectedParentCategory || selectedCategory) && (
                                    <button
                                        onClick={() => navigate('/category')}
                                        className="h-[52px] px-6 rounded-xl border border-rose-100 bg-rose-50/50 text-rose-500 text-[12px] font-bold uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-2 group"
                                    >
                                        <X size={16} className="group-hover:rotate-90 transition-transform duration-300" /> 
                                        Clear filters
                                    </button>
                                )}
                            </div> */}
            </div>
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-6">
              <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Retrieving data...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-32 text-center flex flex-col items-center gap-8">
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 border-2 border-slate-100 shadow-inner">
                <Search size={40} strokeWidth={1.5} className="text-slate-300" />
              </div>
              <div className="max-w-md">
                <h3 className="text-3xl font-extrabold text-black tracking-tight mb-4">No project found</h3>
                <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
                  {" "}
                  Sorry, we couldn&apos;t find any projects that match your current filter criteria. Try changing other keywords or filters.
                </p>
              </div>
              <button
                onClick={() => navigate("/category")}
                className="bg-black text-white font-bold h-14 px-10 rounded-2xl shadow-xl shadow-black/20 hover:scale-105 transition-all duration-300 active:scale-95 uppercase tracking-wider text-[13px]"
              >
                Back to all projects
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination area */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-20 pt-10 border-t border-slate-100">
                  <Pagination
                    total={totalPages}
                    page={page}
                    onChange={(p) => updateParams({ page: String(p) })}
                    showControls
                    classNames={{
                      wrapper: "flex items-center gap-2",
                      base: "flex items-center",
                      item: "w-12 h-12 min-w-[48px] min-h-[48px] text-xs font-black rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center",
                      cursor:
                        "bg-black text-white font-black shadow-2xl shadow-black/40 w-12 h-12 min-w-[48px] min-h-[48px] flex items-center justify-center border-2 border-black",
                      prev: "bg-white border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-xl w-12 h-12 min-w-[48px] min-h-[48px] flex items-center justify-center transition-all",
                      next: "bg-white border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-xl w-12 h-12 min-w-[48px] min-h-[48px] flex items-center justify-center transition-all",
                    }}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <PublicFooter parentCategories={parentCategories} categories={categories} onCategoryClick={navigateToCategory} />
    </div>
  );
}
