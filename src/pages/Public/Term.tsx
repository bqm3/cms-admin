import { Helmet } from "react-helmet-async";
import { PublicHeader } from "../../components/Public/PublicHeader";
import { PublicFooter } from "../../components/Public/PublicFooter";
import { usePublicData } from "../../hooks/usePublicData";
import { useNavigate } from "react-router-dom";

export function Term() {
  const navigate = useNavigate();
  const { categories, parentCategories, loading } = usePublicData();

  const navigateToCategory = (parentId: string, categoryId: string) => {
    let url = `/category/${parentId}`;
    if (categoryId) url += `/${categoryId}`;
    navigate(url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans selection:bg-blue-100 selection:text-blue-900">
      <Helmet prioritizeSeoTags>
        <title>Terms of Service - Couponza</title>
        <meta name="title" content="Terms of Service - Couponza" />
        <meta name="description" content="Read our Terms of Service to understand how you can use our website and services." />
        <meta name="robots" content="index,follow" />
      </Helmet>

      <PublicHeader
        searchQuery=""
        onSearchChange={() => {}}
        onSearchSubmit={(e) => e?.preventDefault()}
        parentCategories={parentCategories}
        categories={categories}
      />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 mt-16 mb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-12 h-12 border-4 border-[#ee4d2d]/20 border-t-[#ee4d2d] rounded-full animate-spin"></div>
            <p className="text-gray-700 text-xs font-semibold uppercase tracking-wide animate-pulse">
              Loading...
            </p>
          </div>
        ) : (
          <article className="prose prose-slate prose-lg max-w-none">
            <h1 className="text-4xl font-extrabold text-[#ee4d2d] mb-8 tracking-tight border-b pb-4">Terms of Service</h1>
            <div className="space-y-6 text-[#4a4a4a] leading-relaxed">
              <p>By accessing this website, we assume you accept these terms and conditions. Do not continue to use <strong>Couponza</strong> if you do not agree to take all of the terms and conditions stated on this page.</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Content Accuracy:</strong> The coupons, promo codes, and deals provided on this site are sourced from third parties. While we strive to provide the most accurate and up-to-date information, Couponza does not warrant that the codes are 100% active or that the descriptions are error-free.</li>
                <li><strong>Limitation of Liability:</strong> In no event shall Couponza be held liable for any expired codes, failed transactions, or dissatisfaction resulting from the use of third-party websites linked from our platform.</li>
                <li><strong>User Responsibility:</strong> It is the user's responsibility to verify the discount at the merchant's checkout page before finalizing a purchase.</li>
                <li><strong>Intellectual Property:</strong> Unless otherwise stated, Couponza owns the intellectual property rights for all material on the website. All rights are reserved.</li>
              </ul>
            </div>
          </article>
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
