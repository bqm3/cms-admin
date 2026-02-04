/* eslint-disable prettier/prettier */
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import api from "../services/api";
import { usePublicData } from "../hooks/usePublicData";
import { PostCard } from "../components/Public/PostCard";
import { PublicHeader } from "../components/Public/PublicHeader";
import { PublicFooter } from "../components/Public/PublicFooter";

export function ClientHomePage() {
  const navigate = useNavigate();
  const { categories, parentCategories, loading: dataLoading } = usePublicData();

  const [groupedPosts, setGroupedPosts] = useState<Record<number, any[]>>({});
  const [postsLoading, setPostsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchGroupedPosts = useCallback(async (parents: any[]) => {
    try {
      setPostsLoading(true);
      const results = await Promise.all(
        parents.map(pc =>
          api.get("/posts/public", { params: { parentCategory: pc.id, limit: 4, sort: "sequence_number:ASC" } })
        )
      );
      const mapping: Record<number, any[]> = {};
      parents.forEach((pc, idx) => {
        mapping[pc.id] = results[idx].data.posts || [];
      });
      setGroupedPosts(mapping);
    } catch (err) {
      console.error("Error fetching grouped posts:", err);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (parentCategories.length > 0) {
      fetchGroupedPosts(parentCategories.filter(p => !p.is_deleted));
    }
  }, [parentCategories, fetchGroupedPosts]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navigateToCategory = (parentId: string, categoryId: string) => {
    let url = `/category?parentCategory=${parentId}`;
    if (categoryId) url += `&category=${categoryId}`;
    navigate(url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLoading = dataLoading || (parentCategories.length > 0 && postsLoading && Object.keys(groupedPosts).length === 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900  font-sans selection:bg-blue-100 selection:text-blue-900">
      <PublicHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
        parentCategories={parentCategories}
        categories={categories}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-12 h-12 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Đang thiết lập trải nghiệm...</p>
          </div>
        ) : (
          <div className="space-y-32">
            {/* <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-10 md:p-20 text-white shadow-3xl shadow-slate-200 border border-white/5">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-3 bg-blue-600/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-lg shadow-blue-500/20">
                  <Sparkles size={14} className="text-yellow-300 fill-yellow-300" /> Landing Page Showcase
                </div>
                <h1 className="text-4xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">Sáng tạo không <br /> giới hạn.</h1>
                <p className="text-slate-400 text-base md:text-lg font-bold leading-relaxed max-w-lg mb-12 opacity-80 uppercase tracking-wide">
                  Khám phá kho thư viện giao diện kéo thả mẫu được xây dựng trên nền tảng Craft JS hiện đại nhất.
                </p>
                <Button
                  onClick={() => navigate('/category')}
                  className="bg-white text-slate-900 font-black h-14 px-10 rounded-2xl shadow-xl hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  XEM TẤT CẢ DỰ ÁN
                </Button>
              </div>
              <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
              <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
            </div> */}

            {/* Grouped Categories */}
            {parentCategories.filter(pc => !pc.is_deleted).map((pc) => {
              const pcPosts = groupedPosts[pc.id] || [];
              if (pcPosts.length === 0) return null;

              return (
                <section key={pc.id} className="relative group/section">
                  <div className="flex justify-between items-end mb-12">
                    <div className="flex items-center gap-6">
                      <div className="w-1.5 h-10 bg-blue-600 rounded-md shadow-lg shadow-blue-500/20 group-hover/section:scale-y-110 transition-transform duration-500"></div>
                      <div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight uppercase">{pc.name}</h2>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-3 opacity-70">Creative Portfolio & Landing Solutions</p>
                      </div>
                    </div>
                    <Button
                      variant="light"
                      className="font-bold text-[11px] uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-8 h-12 rounded-xl group/btn"
                      onClick={() => navigateToCategory(String(pc.id), "")}
                    >
                      Xem tất cả <ChevronRight size={16} className="ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {pcPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </section>
              );
            })}
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
