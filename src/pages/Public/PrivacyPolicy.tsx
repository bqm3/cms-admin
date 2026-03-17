import { Helmet } from "react-helmet-async";
import { PublicHeader } from "../../components/Public/PublicHeader";
import { PublicFooter } from "../../components/Public/PublicFooter";
import { usePublicData } from "../../hooks/usePublicData";
import { useNavigate } from "react-router-dom";

export function PrivacyPolicy() {
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
        <title>Privacy Policy - Global Promotion</title>
        <meta name="title" content="Privacy Policy - Global Promotion" />
        <meta name="description" content="View our Privacy Policy. We value your privacy and are committed to protecting your personal data." />
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
            <h1 className="text-4xl font-extrabold text-[#21294a] mb-8 tracking-tight border-b pb-4">Privacy Policy</h1>
            <div className="space-y-6 text-[#4a4a4a] leading-relaxed">
              <h2 className="text-2xl font-bold text-[#21294a] mt-8 mb-4">Statement Information User</h2>
              <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Web servers (the computers that "serve up" Web pages) automatically identify your computer by its IP address; when you request a page from globalpromotionllc.com, our servers log your IP address. We collect this information for the purpose of providing the Service and Web traffic analysis and trend.</p>

              <h2 className="text-2xl font-bold text-[#21294a] mt-8 mb-4">Log Files</h2>
              <p>We may also collect information that your browser sends whenever you visit our Service. This information includes IP addresses, browser type, the time and date of your visit, the time spent on those pages and other statistics.</p>

              <h2 className="text-2xl font-bold text-[#21294a] mt-8 mb-4">Cookies</h2>
              <p>Like many online services, we use cookies to collect information. Cookies are sent to your browser from a web site and transferred to your device. We use cookies to collect information in order to improve our services for you. If you do not accept cookies, you may not be able to use some features of our Service and we recommend that you leave them turned on.</p>

              <h2 className="text-2xl font-bold text-[#21294a] mt-8 mb-4">Links To Other Sites</h2>
              <p>We offer some of our Service in connection with other third parties. We process your information in accordance with this Privacy Policy, however, such third parties may have different privacy practices. Therefore, we encourage you to read their privacy policies prior to disclosing any Personal Information.</p>

              <h2 className="text-2xl font-bold text-[#21294a] mt-8 mb-4">Third Party Company Service Provider</h2>
              <p>We may receive Personal and about you from companies that provide our Service by way of a co-branded or private-labeled website, companies that offer their products and/or services through our Service, and/or companies that otherwise collect such information. These third parties have access to your Personal Information only to perform specific tasks on our behalf and are obligated not to disclose or use your information for any other purpose.</p>

              <h2 className="text-2xl font-bold text-[#21294a] mt-8 mb-4">Affiliates</h2>
              <p>We may share some or all your Personal Data with our parent company, subsidiaries, joint ventures, or other companies under a common control ("Affiliates"), in which case we will require our Affiliates to honor this Privacy Statement.</p>

              <h2 className="text-2xl font-bold text-[#21294a] mt-8 mb-4">Individuals under 13</h2>
              <p>No information should be submitted on globalpromotionllc.com by users under the age of 13 years without consent of their parent or guardian. globalpromotionllc.com does not provide any personally-identifying information for users under the age of 13, regardless of its source, to any third party for any purpose whatsoever unless disclosed during collection. We encourage parents and legal guardians to monitor their children's Internet usage and to help enforce our Privacy Policy by instructing their children never to provide Personal Information to us without their parent's or legal guardian's permission.</p>

              <h2 className="text-2xl font-bold text-[#21294a] mt-8 mb-4">International Transfer</h2>

              <p>Your information, including Personal Information, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.</p>
              <p>If you are located outside United States and choose to provide information to us, please note that we transfer the information, including Personal Information, to United States and process it there.</p>
              <p>Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.</p>
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
