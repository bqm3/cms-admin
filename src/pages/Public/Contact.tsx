import { Helmet } from "react-helmet-async";
import { PublicHeader } from "../../components/Public/PublicHeader";
import { PublicFooter } from "../../components/Public/PublicFooter";
import { usePublicData } from "../../hooks/usePublicData";
import { useNavigate } from "react-router-dom";

export function Contact() {
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
        <title>Contact - Global Promotion</title>
        <meta name="title" content="Contact - Global Promotion" />
        <meta name="description" content="Get in touch with Global Promotion LLC. Have questions or feedback? We'd love to hear from you." />
        <meta name="robots" content="index,follow" />
      </Helmet>

      <PublicHeader
        searchQuery=""
        onSearchChange={() => { }}
        onSearchSubmit={(e) => e?.preventDefault()}
        parentCategories={parentCategories}
        categories={categories}
      />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 mt-16 mb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-12 h-12 border-4 border-[#21294a]/20 border-t-[#21294a] rounded-full animate-spin"></div>
            <p className="text-gray-700 text-xs font-semibold uppercase tracking-wide animate-pulse">
              Loading...
            </p>
          </div>
        ) : (
          <article className="prose prose-slate prose-lg max-w-none">
            <h1 className="text-4xl font-extrabold text-[#21294a] mb-8 tracking-tight border-b pb-4">Contact Us</h1>
            <div className="space-y-6 text-[#4a4a4a] leading-relaxed">
              <p>If you have any questions or feedback, please don't hesitate to contact us. We'd love to hear from you!</p>
              <h2 className="text-2xl font-bold text-[#21294a] mt-8 mb-4">Our Contact Information</h2>
              <p><strong>Email:</strong> info@globalpromotionllc.com</p>
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
