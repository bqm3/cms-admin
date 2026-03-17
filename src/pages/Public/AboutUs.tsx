import { Helmet } from "react-helmet-async";
import { PublicHeader } from "../../components/Public/PublicHeader";
import { PublicFooter } from "../../components/Public/PublicFooter";
import { usePublicData } from "../../hooks/usePublicData";
import { useNavigate } from "react-router-dom";

export function AboutUs() {
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
        <title>About Us - Global Promotion</title>
        <meta name="title" content="About Us - Global Promotion" />
        <meta name="description" content="Welcome to Global Promotion LLC, your trusted global partner in navigating the vast world of digital commerce." />
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
            <div className="w-12 h-12 border-4 border-[#21294a]/20 border-t-[#21294a] rounded-full animate-spin"></div>
            <p className="text-gray-700 text-xs font-semibold uppercase tracking-wide animate-pulse">
              Loading...
            </p>
          </div>
        ) : (
          <article className="prose prose-slate prose-lg max-w-none">
            <h1 className="text-4xl font-extrabold text-[#21294a] mb-8 tracking-tight border-b pb-4">About Us</h1>
            <div className="space-y-6 text-[#4a4a4a] leading-relaxed">
              <h2 className="text-2xl font-bold text-[#21294a] mt-8 mb-4">Our Vision: Empowering the Modern Consumer</h2>
              <p>Welcome to <strong>Global Promotion LLC</strong>, your trusted global partner in navigating the vast world of digital commerce. In an era where every click counts, we are dedicated to helping consumers and professionals alike find the most valuable deals, verified coupons, and strategic promotions across the most competitive industries today.</p>

              <h2 className="text-2xl font-bold text-[#21294a] mt-8 mb-4">Who We Are</h2>
              <p>Global Promotion LLC is more than just a coupon site; we are a dedicated team of market analysts and digital enthusiasts committed to transparency. We understand that in fields like Finance, Technology, and Wellness, finding a reliable offer is just as important as the discount itself. That is why we curate, verify, and deliver only the best opportunities from world-class brands.</p>

              <h2 className="text-2xl font-bold text-[#21294a] mt-8 mb-4">What Sets Us Apart?</h2>
              <p>At <strong>Global Promotion LLC</strong>, we don't just list links. We build a bridge between quality brands and smart users through:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Rigorous Verification:</strong> Every promotion featured on our platform undergoes a manual check to ensure it provides genuine value.</li>
                <li><strong>Diverse Expertise:</strong> Our portfolio spans across high-impact sectors including <strong>Fintech & Forex</strong>, <strong>SaaS & Cloud Hosting</strong>, <strong>Health & Performance</strong>, and <strong>Global Travel</strong>.</li>
                <li><strong>User-Centric Approach:</strong> We prioritize your experience, ensuring our platform is easy to navigate and our information is always up-to-date.</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#21294a] mt-8 mb-4">Our Commitment to Transparency</h2>
              <p>As a modern digital entity, Global Promotion LLC operates with full transparency. We may receive commissions from the brands we feature, but our editorial integrity remains uncompromised. Our first priority is—and always will be—providing you with accurate, actionable information that helps you save money and time.</p>

              <h2 className="text-2xl font-bold text-[#21294a] mt-8 mb-4">Join the Global Community</h2>
              <p>The world of digital promotions is constantly evolving. Join thousands of users who start their shopping and investing journey with Global Promotion LLC.</p>
              <p><strong>Global Promotion LLC – Your Gateway to Smarter Savings.</strong></p>
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
