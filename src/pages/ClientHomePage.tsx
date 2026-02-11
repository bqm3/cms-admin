/* eslint-disable prettier/prettier */
import { useEffect, useState, useCallback, lazy, Suspense } from "react";
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
          api.get(`/posts/public/catalog/${pc.slug || pc.id}`, {
            params: {
              limit: 8,
              sort: "sequence_number:ASC",
            },
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
    let url = `/category/${parentId}`;
    if (categoryId) url += `/${categoryId}`;
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
      <Helmet prioritizeSeoTags>
        <title>Global Promotion</title>

        <meta name="title" content="Global Promotion latest" />
        <meta
          name="description"
          content="Use globalpromotionllc.com to find the latest discount codes..."
        />
        <meta
          name="keywords"
          content="Global, Global Promotion, Global Promotion newest"
        />
        <meta name="robots" content="index,follow" />

        <link rel="canonical" href="https://globalpromotionllc.com/" />

        <meta property="og:title" content="Global Promotion latest" />
        <meta
          property="og:description"
          content="Use Globalpromotionllc.com to find the latest discount codes..."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://globalpromotionllc.com/" />
        {/* nên có og:image */}
        {/* <meta property="og:image" content="https://globalpromotionllc.com/og.jpg" /> */}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Global Promotion latest" />
        <meta
          name="twitter:description"
          content="Use Globalpromotionllc.com to find the latest discount codes..."
        />
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
            <p className="text-gray-700 text-xs font-semibold uppercase tracking-wide animate-pulse">
              Loading...
            </p>
          </div>
        ) : (
          <div className="space-y-20">
            {/* Grouped Categories */}
            {parentCategories
              .filter((pc) => !pc.is_deleted)
              .map((pc) => {
                const pcPosts = groupedPosts[pc.slug || pc.id] || [];
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
                        onClick={() =>
                          navigateToCategory(String(pc.slug || pc.id), "")
                        }
                      >
                        More
                        <ChevronRight size={16} className="ml-1 text-white" />
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
