import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import api, { SERVER_URL } from "../services/api";
import { usePublicData } from "../hooks/usePublicData";
import { PublicHeader } from "../components/Public/PublicHeader";
import { PublicFooter } from "../components/Public/PublicFooter";

function stripHtml(html: string) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
}

export function PublicReviewDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { categories, parentCategories } = usePublicData();
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/reviews/public/${slug}`);
        setReview(res.data);
      } catch (error) {
        console.error(error);
        setReview(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [slug]);

  const ogImage = useMemo(() => {
    if (!review?.img_bg) return undefined;
    return review.img_bg.startsWith("http") ? review.img_bg : `${SERVER_URL}${review.img_bg}`;
  }, [review]);

  const descriptionText = useMemo(() => {
    const source = review?.meta_description || stripHtml(review?.description || "");
    return source || review?.title || "Review";
  }, [review]);

  const navigateToCategory = (parentSlug: string, categorySlug: string) => {
    navigate(categorySlug ? `/category/${parentSlug}/${categorySlug}` : `/category/${parentSlug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[#f3efe8] text-slate-500">Loading...</div>;
  }

  if (!review) {
    return <div className="grid min-h-screen place-items-center bg-[#f3efe8] text-slate-500">Review not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#f3efe8] text-slate-900">
      <Helmet>
        <title>{review.meta_title || review.title}</title>
        <meta name="description" content={descriptionText} />
        <meta name="keywords" content={review.meta_keyword || review.title} />
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      </Helmet>

      <PublicHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={(e) => {
          e?.preventDefault();
          if (searchQuery.trim()) navigate(`/category?search=${encodeURIComponent(searchQuery.trim())}`);
        }}
        parentCategories={parentCategories}
        categories={categories}
      />

      <main className="px-4 pb-20 pt-8 md:px-6 md:pt-12">
        <div className="mx-auto max-w-[1320px]">
          <Link
            to="/review"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-700 backdrop-blur transition hover:bg-white"
          >
            <ArrowLeft size={14} />
            All Reviews
          </Link>

          <article className="mt-6 overflow-hidden bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
            {ogImage ? (
              <div className="relative h-[320px] bg-[#e9e2d7] md:h-[460px] xl:h-[620px]">
                <img src={ogImage} alt={review.title} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-900/10 to-transparent" />
              </div>
            ) : null}

            <div className="px-6 py-8 md:px-10 md:py-12 xl:px-16 xl:py-16">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
                <span className="rounded-full bg-[#ee4d2d] px-3 py-1 text-white">Review</span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={14} />
                  {new Date(review.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>

              <h1 className="mt-6 max-w-[14ch] text-4xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl xl:text-6xl">
                {review.title}
              </h1>

              <div className="prose prose-slate mt-8 max-w-[960px] text-base leading-8 md:text-lg" dangerouslySetInnerHTML={{ __html: review.description || "" }} />
            </div>
          </article>
        </div>
      </main>

      <PublicFooter parentCategories={parentCategories} categories={categories} onCategoryClick={navigateToCategory} />
    </div>
  );
}
