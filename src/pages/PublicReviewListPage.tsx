import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Pagination } from "@heroui/pagination";
import { Input } from "@heroui/input";
import { Search } from "lucide-react";
import { Helmet } from "react-helmet-async";
import api, { SERVER_URL } from "../services/api";
import { usePublicData } from "../hooks/usePublicData";
import { PublicHeader } from "../components/Public/PublicHeader";
import { PublicFooter } from "../components/Public/PublicFooter";

function stripHtml(html: string) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
}

function truncate(text: string, max = 180) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trimEnd()}...` : text;
}

export function PublicReviewListPage() {
  const navigate = useNavigate();
  const { categories, parentCategories } = usePublicData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 9 });
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [headerSearch, setHeaderSearch] = useState("");

  const fetchReviews = async (pageValue: number, searchValue: string) => {
    try {
      setLoading(true);
      const res = await api.get("/reviews/public", {
        params: { page: pageValue, limit: pagination.limit, search: searchValue || undefined },
      });
      setReviews(res.data.reviews || []);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pageValue = Number(searchParams.get("page") || 1);
    const searchValue = searchParams.get("search") || "";
    setSearch(searchValue);
    fetchReviews(pageValue, searchValue);
  }, [searchParams]);

  const navigateToCategory = (parentSlug: string, categorySlug: string) => {
    navigate(categorySlug ? `/category/${parentSlug}/${categorySlug}` : `/category/${parentSlug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Reviews</title>
        <meta name="description" content="Review list" />
      </Helmet>

      <PublicHeader
        searchQuery={headerSearch}
        onSearchChange={setHeaderSearch}
        onSearchSubmit={(e) => {
          e?.preventDefault();
          if (headerSearch.trim()) navigate(`/category?search=${encodeURIComponent(headerSearch.trim())}`);
        }}
        parentCategories={parentCategories}
        categories={categories}
      />

      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#ee4d2d]">Review</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Review List</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium text-slate-500">Displayed in cards with public pagination.</p>
          </div>
          <div className="w-full md:w-[360px]">
            <Input
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchParams({ page: "1", ...(search.trim() ? { search: search.trim() } : {}) });
                }
              }}
              startContent={<Search size={18} className="text-slate-400" />}
              classNames={{ inputWrapper: "h-12 rounded-xl border border-slate-200 bg-white shadow-sm" }}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[360px] animate-pulse rounded-3xl bg-white shadow-sm" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {reviews.map((review) => {
                const contentText = truncate(stripHtml(review.content || ""), 180);
                return (
                  <article key={review.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="h-56 bg-slate-100">
                      {review.img_bg ? (
                        <img
                          src={review.img_bg.startsWith("http") ? review.img_bg : `${SERVER_URL}${review.img_bg}`}
                          alt={review.title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="space-y-4 p-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                          {new Date(review.created_at).toLocaleDateString("en-US")}
                        </p>
                        <h2 className="mt-2 line-clamp-2 text-2xl font-black text-slate-900">{review.title}</h2>
                      </div>
                      <p className="line-clamp-4 text-sm leading-7 text-slate-600">{contentText}</p>
                      <Link to={`/review/${review.slug}`} className="inline-flex rounded-xl bg-[#ee4d2d] px-5 py-3 text-sm font-bold text-white">
                        View details
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 flex justify-center">
              <Pagination
                total={pagination.totalPages || 1}
                page={pagination.page || 1}
                onChange={(value) =>
                  setSearchParams({
                    page: String(value),
                    ...(search.trim() ? { search: search.trim() } : {}),
                  })
                }
                showControls
                color="primary"
                variant="flat"
              />
            </div>
          </>
        )}
      </main>

      <PublicFooter parentCategories={parentCategories} categories={categories} onCategoryClick={navigateToCategory} />
    </div>
  );
}
