/* eslint-disable prettier/prettier */
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Pagination } from "@heroui/pagination";
import { ChevronRight, X, Search, LayoutGrid } from "lucide-react";
import api from "../services/api";
import { usePublicData } from "../hooks/usePublicData";
import { PostCard } from "../components/Public/PostCard";
import { PublicHeader } from "../components/Public/PublicHeader";
import { PublicFooter } from "../components/Public/PublicFooter";

export function ClientCategoryPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { categories, parentCategories, loading: dataLoading } = usePublicData();

    const [posts, setPosts] = useState<any[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);

    // Params from URL
    const search = searchParams.get("search") || "";
    const selectedCategory = searchParams.get("category") || "";
    const selectedParentCategory = searchParams.get("parentCategory") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 12;

    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchPosts = useCallback(async () => {
        try {
            setPostsLoading(true);
            const response = await api.get("/posts/public", {
                params: {
                    sort: "sequence_number:ASC",
                    search,
                    category: selectedCategory,
                    parentCategory: selectedParentCategory,
                    page,
                    limit
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

    const updateParams = useCallback((newParams: Record<string, string>) => {
        const params = new URLSearchParams(searchParams);
        Object.entries(newParams).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        setSearchParams(params);
    }, [searchParams, setSearchParams]);

    const handleSearchChange = (val: string) => {
        updateParams({ search: val, page: "1" });
    };

    const handleSearchSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        // search is already updated in URL via handleSearchChange if using on-the-fly search,
        // or we can just let it be.
    };

    const navigateToCategory = (parentId: string, categoryId: string) => {
        updateParams({ parentCategory: parentId, category: categoryId, page: "1" });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isLoading = dataLoading || (postsLoading && posts.length === 0);

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans selection:bg-blue-100 selection:text-blue-900">
            <PublicHeader
                searchQuery={search}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
                selectedParentCategory={selectedParentCategory}
                onParentCategoryChange={(val) => updateParams({ parentCategory: val, category: "", page: "1" })}
                parentCategories={parentCategories}
                categories={categories}
            />

            <main className="max-w-7xl mx-auto px-4 md:px-6 mt-12">
                <section>
                    {/* Page Controls & Meta */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 pb-10 border-b border-slate-200/60">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 hover:border-blue-500/40 hover:text-blue-600 rounded-2xl transition-all shadow-sm hover:shadow-md group"
                                title="Quay lại"
                            >
                                <ChevronRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                                        {search ? `Tìm kiếm: ${search}` : 'Khám phá dự án'}
                                    </h2>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                    Tìm thấy <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{totalItems}</span> trang web đang hoạt động
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {/* Sub-category Filter (only if parent category is active) */}
                            {selectedParentCategory && (
                                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">Lọc theo:</span>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => updateParams({ category: e.target.value, page: "1" })}
                                        className="bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-700 py-2.5 px-4 outline-none focus:ring-0 transition-all cursor-pointer min-w-[160px] hover:bg-slate-100"
                                    >
                                        <option value="">Tất cả danh mục</option>
                                        {categories
                                            .filter(c => c.parent_id === Number(selectedParentCategory) && !c.is_deleted)
                                            .map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                    </select>
                                </div>
                            )}

                            {/* Clear All Results (Quick Reset) */}
                            {(search || selectedParentCategory || selectedCategory) && (
                                <button
                                    onClick={() => navigate('/category')}
                                    className="h-12 px-6 rounded-2xl border border-rose-100 bg-rose-50/30 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-colors flex items-center gap-2"
                                >
                                    <X size={14} /> Xóa tất cả lọc
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results Grid */}
                    {isLoading ? (
                        <div className="py-40 flex flex-col items-center justify-center gap-6">
                            <div className="w-12 h-12 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Đang truy xuất dữ liệu...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="py-32 text-center flex flex-col items-center gap-8">
                            <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200 border border-slate-100">
                                <Search size={40} strokeWidth={1.5} />
                            </div>
                            <div className="max-w-md">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">Không có kết quả</h3>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-wide leading-relaxed"> Rất tiếc, chúng tôi không tìm thấy dự án nào phù hợp với các tiêu chí lọc hiện tại của bạn.</p>
                            </div>
                            <button
                                onClick={() => navigate('/category')}
                                className="bg-blue-600 text-white font-black h-14 px-10 rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform"
                            >
                                QUAY LẠI TẤT CẢ DỰ ÁN
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                                {posts.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </div>

                            {/* Pagination area */}
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-20 pt-10 border-t border-slate-100">
                                    <Pagination
                                        total={totalPages}
                                        page={page}
                                        onChange={(p) => updateParams({ page: String(p) })}
                                        showControls
                                        classNames={{
                                            item: "w-12 h-12 text-[11px] font-black rounded-2xl border-transparent hover:bg-slate-100 transition-colors",
                                            cursor: "bg-blue-600 text-white font-black shadow-2xl shadow-blue-500/40",
                                            prev: "bg-white border border-slate-200 rounded-2xl w-12 h-12",
                                            next: "bg-white border border-slate-200 rounded-2xl w-12 h-12"
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>

            <PublicFooter
                parentCategories={parentCategories}
                categories={categories}
                onCategoryClick={navigateToCategory}
            />
        </div>
    );
}
