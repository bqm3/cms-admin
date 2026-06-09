import { useEffect, useMemo, useState } from "react";
import { X, Star, Copy, Check } from "lucide-react";
import { SERVER_URL } from "../../services/api";

export type StoreCouponModuleCoupon = {
  title: string;
  content?: string;
  description?: string;
  buttonText: string;
  code?: string;
  url?: string;
  buttonHref?: string;
  buttonTarget?: "_self" | "_blank";
};

export type StoreCouponModuleGalleryItem = {
  src: string;
  alt: string;
};

export type StoreCouponModulePopup = {
  enabled: boolean;
  delayMs: number;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonHref: string;
};

export type StoreCouponModuleData = {
  pageType: "store_coupon_module_v1";
  title: string;
  slug?: string;
  categoryId?: string;
  categoryName?: string;
  logoUrl: string;
  affiliateUrl: string;
  projectImageUrl?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  ratingText: string;
  ratingButtonText: string;
  ratingButtonHref: string;
  coupons: StoreCouponModuleCoupon[];
  aboutTitle: string;
  aboutSubtitle: string;
  aboutHtml: string;
  gallery: StoreCouponModuleGalleryItem[];
  popup: StoreCouponModulePopup;
};

function resolveAssetUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
  return `${SERVER_URL}${url}`;
}

export function StoreCouponModuleView({ data }: { data: StoreCouponModuleData }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [clickedPopupData, setClickedPopupData] = useState<{
    title: string;
    description: string;
    imageUrl?: string;
    buttonText: string;
    buttonHref: string;
    code?: string;
  } | null>(null);

  const currentPopup = clickedPopupData || {
    title: data.popup?.title || "",
    description: data.popup?.description || "",
    imageUrl: data.popup?.imageUrl || "",
    buttonText: data.popup?.buttonText || "Open offer",
    buttonHref: data.popup?.buttonHref || "",
    code: "",
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setCopied(false);
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  useEffect(() => {
    if (!data.popup?.enabled) return;
    const timer = window.setTimeout(() => setPopupOpen(true), Math.max(0, data.popup.delayMs || 0));
    return () => window.clearTimeout(timer);
  }, [data.popup]);

  const logoSrc = useMemo(() => resolveAssetUrl(data.logoUrl), [data.logoUrl]);
  const galleryItems = useMemo(
    () => (data.gallery || []).filter((item) => item?.src).map((item) => ({ ...item, src: resolveAssetUrl(item.src) })),
    [data.gallery],
  );

  const sharedCouponUrl = useMemo(() => {
    const firstCouponWithUrl = (data.coupons || []).find((coupon) => (coupon.url || coupon.buttonHref || "").trim());
    return firstCouponWithUrl?.url || firstCouponWithUrl?.buttonHref || data.affiliateUrl || "";
  }, [data.affiliateUrl, data.coupons]);

  const handleOpen = (href?: string) => {
    const target = href || data.affiliateUrl;
    if (!target) return;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[#f4f4f6] text-slate-900">
      <div className="mx-auto max-w-[1180px] px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-4 lg:grid-cols-[330px_1fr]">
          <aside className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex min-h-[140px] items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-6">
                {logoSrc ? (
                  <img src={logoSrc} alt={data.title} className="max-h-24 max-w-[120px] object-contain" />
                ) : (
                  <div className="text-center">
                    <div className="text-3xl font-black tracking-tight text-[#21294a]">{data.title}</div>
                    <div className="mt-2 text-xs font-semibold text-slate-400">Upload logo or paste image URL</div>
                  </div>
                )}
              </div>
              <div className="mt-5 text-center">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">{data.title}</h1>
                <div className="mt-4 flex items-center justify-center gap-1.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={18} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                  {data.ratingText || "Popular choice with our visitors"}
                </p>
                <button
                  type="button"
                  onClick={() => handleOpen(data.ratingButtonHref || data.affiliateUrl)}
                  className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-emerald-500 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
                >
                  {data.ratingButtonText || "Get code"}
                </button>
              </div>
            </div>
          </aside>

          <main className="space-y-4">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-800 md:text-3xl">{data.heroTitle || data.title} Best Online Coupons & Deals</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{data.heroSubtitle}</p>
                </div>
                {null}
              </div>

              <div className="grid gap-3">
                {(data.coupons || []).map((coupon, index) => {
                  const codeText = coupon.code || "";
                  const actionUrl = coupon.url || coupon.buttonHref || sharedCouponUrl;
                  const contentText = coupon.content || coupon.description || "";
                  return (
                    <div
                      key={`${coupon.title}-${index}`}
                      className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:grid-cols-[180px_1fr] md:items-center"
                    >
                      <div className="rounded-2xl bg-emerald-50 px-4 py-5 text-center">
                        <div className="line-clamp-2 text-sm font-black leading-5 text-emerald-700">UP TO</div>
                        <div className="mt-2 text-2xl font-black text-emerald-600">{coupon.title || "Promo"} </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div>
                          <h3 className="text-lg font-black text-slate-900">{coupon.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{contentText}</p>
                        </div>
                        <div className="flex justify-start md:justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (coupon.code) {
                                setClickedPopupData({
                                  title: `Code: ${coupon.code}`,
                                  description: contentText,
                                  imageUrl: data.logoUrl || data.popup?.imageUrl || "",
                                  buttonText: coupon.buttonText || "Get code",
                                  buttonHref: actionUrl,
                                  code: coupon.code,
                                });
                                setPopupOpen(true);
                              } else {
                                handleOpen(actionUrl);
                              }
                            }}
                            className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-bold text-white transition hover:bg-emerald-600"
                          >
                            {coupon.buttonText || "Get code"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {galleryItems.length > 0 ? (
              <section className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 md:grid-cols-2">
                {galleryItems.map((item, index) => (
                  <div key={`${item.src}-${index}`} className="overflow-hidden rounded-2xl bg-slate-100">
                    <img src={item.src} alt={item.alt || `${data.title} ${index + 1}`} className="h-40 w-full object-cover" />
                  </div>
                ))}
              </section>
            ) : null}
          </main>
        </div>
      </div>

      <section className="w-full overflow-hidden border-y border-slate-200 bg-white shadow-sm">
        <div className="w-full px-4 py-6 md:px-6 md:py-8">
          <div
            className="prose prose-slate w-full max-w-none break-words text-sm leading-7 [&_*]:max-w-full [&_img]:h-auto [&_img]:rounded-2xl [&_table]:w-full [&_table]:table-fixed [&_table]:break-words [&_td]:break-words [&_th]:break-words [&_pre]:whitespace-pre-wrap [&_code]:break-all"
            dangerouslySetInnerHTML={{ __html: data.aboutHtml || "" }}
          />
        </div>
      </section>

      {popupOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close popup"
            className="absolute inset-0 cursor-default bg-black/55"
            onClick={handleClosePopup}
          />
          <div className="relative z-[101] w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <button
              type="button"
              onClick={handleClosePopup}
              className="absolute right-3 top-3 rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
            >
              <X size={18} />
            </button>
            <div className="grid gap-0 ">
              {/* <div className="bg-slate-100">
                {currentPopup.imageUrl ? (
                  <img src={resolveAssetUrl(currentPopup.imageUrl)} alt={currentPopup.title} className="h-full w-full object-cover md:min-h-[320px]" />
                ) : null}
              </div> */}
              <div className="p-6 text-center">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Special offer</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <h3 className="text-3xl font-black tracking-tight text-slate-900">{currentPopup.title}</h3>
                  {currentPopup.code ? (
                    <button
                      type="button"
                      onClick={() => handleCopyCode(currentPopup.code!)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                      title="Copy code"
                    >
                      {copied ? (
                        <Check size={16} className="text-emerald-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  ) : null}
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-600">{currentPopup.description}</p>
                <button
                  type="button"
                  onClick={() => handleOpen(currentPopup.buttonHref)}
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#21294a] px-5 text-sm font-bold text-white transition hover:bg-[#161d36]"
                >
                  {currentPopup.buttonText || "Open offer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
