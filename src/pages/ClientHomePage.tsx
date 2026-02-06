/* eslint-disable prettier/prettier */
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@heroui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import api from "../services/api";
import { usePublicData } from "../hooks/usePublicData";
import { PostCard } from "../components/Public/PostCard";
import { PublicHeader } from "../components/Public/PublicHeader";
import { PublicFooter } from "../components/Public/PublicFooter";

export function ClientHomePage() {
  const navigate = useNavigate();
  const {
    categories,
    parentCategories,
    loading: dataLoading,
  } = usePublicData();

  const [groupedPosts, setGroupedPosts] = useState<Record<number, any[]>>({});
  const [postsLoading, setPostsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchGroupedPosts = useCallback(async (parents: any[]) => {
    try {
      setPostsLoading(true);
      const results = await Promise.all(
        parents.map((pc) =>
          api.get("/posts/public", {
            params: {
              parentCategory: pc.id,
              limit: 8,
              sort: "sequence_number:ASC",
            },
          }),
        ),
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
      fetchGroupedPosts(parentCategories.filter((p) => !p.is_deleted));
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLoading =
    dataLoading ||
    (parentCategories.length > 0 &&
      postsLoading &&
      Object.keys(groupedPosts).length === 0);

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans selection:bg-blue-100 selection:text-blue-900">
      <Helmet>
        <title>Global Promotion - Explore the project website cao cấp</title>
        <meta
          name="description"
          content="Nền tảng trưng bày và khám phá những mẫu thiết kế website cao cấp được xây dựng trên công nghệ Craft JS."
        />
        <meta
          property="og:title"
          content="Global Promotion - Explore the project website cao cấp"
        />
        <meta
          property="og:description"
          content="Nền tảng trưng bày và khám phá những mẫu thiết kế website cao cấp được xây dựng trên công nghệ Craft JS."
        />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index,follow" />
      </Helmet>

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
            <div className="w-12 h-12 border-4 border-[#21294a]/20 border-t-[#21294a] rounded-full animate-spin"></div>
            <p className="text-[#999999] text-[11px] font-semibold uppercase tracking-wide animate-pulse">
              Đang tải nội dung...
            </p>
          </div>
        ) : (
          <div className="space-y-20">

            {/* Grouped Categories */}
            {parentCategories
              .filter((pc) => !pc.is_deleted)
              .map((pc) => {
                const pcPosts = groupedPosts[pc.id] || [];
                if (pcPosts.length === 0) return null;

                return (
                  <section key={pc.id} className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <h2 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight">
                        {pc.name}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {pcPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>

                    <div className="flex justify-center mt-10">
                      <Button
                        variant="light"
                        className="
                          font-semibold text-[14px]
                          bg-[#21294a] text-white
                          hover:bg-[#21294a]/90
                          px-6 h-10 rounded-lg
                          group/btn transition-all
                        "
                        onClick={() => navigateToCategory(String(pc.id), "")}
                      >
                        More
                        <ChevronRight
                          size={16}
                          className="ml-1 text-white"
                        />
                      </Button>
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
