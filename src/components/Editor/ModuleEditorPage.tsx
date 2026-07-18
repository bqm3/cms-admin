import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/modal";
import { CheckCircle2, Copy, GripVertical, ImagePlus, Link2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import api, { SERVER_URL } from "../../services/api";
import { AdminLayout } from "../../layouts/AdminLayout";
import { TinyMceEditor } from "../Common/TinyMceEditor";
import type { StoreCouponModuleCoupon, StoreCouponModuleData } from "../Public/StoreCouponModuleView";

type CategoryOption = {
  id: number;
  name: string;
};

type ModuleFormData = Omit<StoreCouponModuleData, "slug"> & {
  slug: string;
  categoryId: string;
  categoryName: string;
  projectImageUrl: string;
  heroImageUrl: string;
};

const emptyCoupon: StoreCouponModuleCoupon = {
  title: "",
  content: "",
  buttonText: "Get code",
  code: "",
  url: "",
};

function resolveAssetUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
  return `${SERVER_URL}${url}`;
}

function getSharedCouponUrl(coupons: StoreCouponModuleCoupon[], fallbackUrl = "") {
  const firstCouponWithUrl = coupons.find((coupon) => (coupon.url || coupon.buttonHref || "").trim());
  return firstCouponWithUrl?.url || firstCouponWithUrl?.buttonHref || fallbackUrl;
}

function applyAffiliateUrlToCoupons(coupons: StoreCouponModuleCoupon[], affiliateUrl?: string) {
  const nextAffiliateUrl = (affiliateUrl || "").trim();
  if (!nextAffiliateUrl) return coupons;
  return coupons.map((coupon) => ({
    ...coupon,
    url: (coupon.url || "").trim() || nextAffiliateUrl,
    buttonHref: (coupon.buttonHref || coupon.url || "").trim() || nextAffiliateUrl,
  }));
}

function createDefaultData(): ModuleFormData {
  return {
    pageType: "store_coupon_module_v1",
    title: "",
    slug: "",
    categoryId: "",
    categoryName: "",
    affiliateUrl: "",
    logoUrl: "",
    projectImageUrl: "",
    heroImageUrl: "",
    heroTitle: "",
    heroSubtitle: "",
    ratingText: "Popular choice with our visitors",
    ratingButtonText: "Get code",
    ratingButtonHref: "",
    aboutTitle: "",
    aboutSubtitle: "",
    aboutHtml: "<p></p>",
    coupons: [],
    gallery: [],
    popup: {
      enabled: false,
      delayMs: 2500,
      title: "",
      description: "",
      imageUrl: "",
      buttonText: "Get code",
      buttonHref: "",
    },
  };
}

function parseModuleData(content: string | null | undefined): Partial<ModuleFormData> | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.pageType !== "store_coupon_module_v1") return null;
    return parsed;
  } catch {
    return null;
  }
}

function AssetField({
  label,
  value,
  onChange,
  onUpload,
  preview,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
  preview?: string;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const showPreview = preview || value;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-600">{label}</h3>
        {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50 md:w-36">
          {showPreview ? (
            <img src={resolveAssetUrl(showPreview)} alt={label} className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="text-slate-300" size={26} />
          )}
        </div>

        <div className="flex-1 space-y-3">
          <Input
            label="URL"
            placeholder="https://..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            classNames={{
              inputWrapper: "bg-white border border-slate-200 shadow-sm rounded-2xl h-12",
              input: "text-sm font-medium",
            }}
          />
          <label className={`inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold transition ${uploading ? "bg-slate-100 text-slate-400" : "bg-[#21294a] text-white hover:bg-[#1a213d]"}`}>
            {uploading ? "Uploading..." : "Upload image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setUploading(true);
                  await onUpload(file);
                } catch (error) {
                  console.error(error);
                  alert("Upload image failed");
                } finally {
                  setUploading(false);
                  e.target.value = "";
                }
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-black tracking-tight text-slate-900">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

export function ModuleEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id || id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [projectPreview, setProjectPreview] = useState("");
  const [data, setData] = useState<ModuleFormData>(createDefaultData());
  const [couponDraft, setCouponDraft] = useState<StoreCouponModuleCoupon>(emptyCoupon);
  const [editingCouponIndex, setEditingCouponIndex] = useState<number | null>(null);
  const [initialAffiliateUrl, setInitialAffiliateUrl] = useState("");

  const couponModal = useDisclosure();
  const linkModal = useDisclosure();

  // ── Post Links state ──────────────────────────────────────────────────
  type PostLinkItem = { id?: number; title: string; href: string; sequence_number: number };
  const emptyLink: PostLinkItem = { title: "", href: "", sequence_number: 0 };
  const [postLinks, setPostLinks] = useState<PostLinkItem[]>([]);
  const [linkDraft, setLinkDraft] = useState<PostLinkItem>(emptyLink);
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const [linksSaving, setLinksSaving] = useState(false);

  const loadPostLinks = useCallback(async (postId: string) => {
    try {
      const res = await api.get(`/post-links/${postId}`);
      setPostLinks(res.data || []);
    } catch (err) {
      console.error("Error loading post links", err);
    }
  }, []);

  const savePostLinks = async () => {
    if (!id || id === "new") {
      alert("Vui lòng lưu bài viết trước khi quản lý links.");
      return;
    }
    try {
      setLinksSaving(true);
      const res = await api.post(`/post-links/bulk/${id}`, {
        links: postLinks.map((l, idx) => ({ ...l, sequence_number: idx })),
      });
      setPostLinks(res.data || []);
      alert("✅ Lưu links thành công!");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Lưu links thất bại");
    } finally {
      setLinksSaving(false);
    }
  };

  const openCreateLink = () => {
    setLinkDraft({ ...emptyLink, sequence_number: postLinks.length });
    setEditingLinkIndex(null);
    linkModal.onOpen();
  };

  const openEditLink = (index: number) => {
    setLinkDraft({ ...postLinks[index] });
    setEditingLinkIndex(index);
    linkModal.onOpen();
  };

  const saveLinkDraft = () => {
    if (!linkDraft.title.trim()) { alert("Vui lòng nhập title."); return; }
    if (!linkDraft.href.trim()) { alert("Vui lòng nhập URL."); return; }
    setPostLinks((prev) => {
      const next = [...prev];
      if (editingLinkIndex === null) {
        next.push({ ...linkDraft, sequence_number: next.length });
      } else {
        next[editingLinkIndex] = linkDraft;
      }
      return next;
    });
    setLinkDraft(emptyLink);
    setEditingLinkIndex(null);
  };

  const loadCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.categories || response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setCategoriesLoaded(true);
    }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);
    formData.append("name", file.name);
    const res = await api.post("/media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const media = Array.isArray(res.data) ? res.data[0] : res.data;
    return media?.url || "";
  };

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/public/${id}`, {
        params: { is_editor: "true" },
      });

      const post = response.data;
      const parsed = parseModuleData(post.content) || {};
      const categoryId = String(post.category_id ?? parsed.categoryId ?? "");
      const categoryName =
        parsed.categoryName ||
        categories.find((item) => String(item.id) === categoryId)?.name ||
        post.category?.name ||
        "";

      const merged: ModuleFormData = {
        ...createDefaultData(),
        ...parsed,
        title: post.title || parsed.title || "",
        slug: post.slug || parsed.slug || "",
        categoryId,
        categoryName,
        logoUrl: parsed.logoUrl || post.logo || "",
        projectImageUrl: parsed.projectImageUrl || parsed.heroImageUrl || "",
        heroImageUrl: parsed.heroImageUrl || parsed.projectImageUrl || "",
        aboutHtml: parsed.aboutHtml || "<p></p>",
        coupons: Array.isArray(parsed.coupons) ? parsed.coupons : [],
        gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [],
        popup: parsed.popup || createDefaultData().popup,
      };

      setData({
        ...merged,
        coupons: applyAffiliateUrlToCoupons(merged.coupons, merged.affiliateUrl),
      });
      setInitialAffiliateUrl((merged.affiliateUrl || "").trim());
      setLogoPreview(merged.logoUrl ? resolveAssetUrl(merged.logoUrl) : "");
      setProjectPreview(merged.projectImageUrl ? resolveAssetUrl(merged.projectImageUrl) : "");
    } catch (error) {
      console.error(error);
      alert("Không thể tải dữ liệu page.");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    if (!categoriesLoaded) return;
    void loadPost();
    void loadPostLinks(id!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew, categoriesLoaded]);

  const handleSave = async () => {
    if (!(data.title || "").trim()) {
      alert("Vui lòng nhập title.");
      return;
    }

    try {
      setSaving(true);

      const affUrl = (data.affiliateUrl || "").trim();
      const oldAffUrl = (initialAffiliateUrl || "").trim();

      const updatedCoupons = data.coupons.map((c) => {
        const cUrl = (c.url || "").trim();
        const cHref = (c.buttonHref || "").trim();

        // If coupon URL/Href is empty, or matches the old affiliate URL, we overwrite it with the new affiliate URL.
        // If it's a custom URL (not empty, and not matching the old affiliate URL), we preserve it.
        const isDefaultUrl = !cUrl || (oldAffUrl && cUrl === oldAffUrl);
        const isDefaultHref = !cHref || (oldAffUrl && cHref === oldAffUrl) || cHref === cUrl;

        return {
          ...c,
          url: isDefaultUrl ? affUrl : cUrl,
          buttonHref: isDefaultHref ? affUrl : cHref,
        };
      });

      const finalData = {
        ...data,
        coupons: updatedCoupons,
      };

      const formData = new FormData();
      formData.append("title", (finalData.title || "").trim());
      formData.append("content", JSON.stringify(finalData));
      formData.append("category_id", finalData.categoryId || "");
      formData.append("logo_url", finalData.logoUrl || "");
      formData.append("topic_name", "store-coupon-module");
      formData.append("sequence_number", "0");
      formData.append("view_count", "0");
      formData.append("is_hidden", "false");
      formData.append("meta_override", "false");

      const request = isNew ? api.post("/posts", formData) : api.put(`/posts/${id}`, formData);
      const response = await request;

      setData(finalData);
      setInitialAffiliateUrl(affUrl);
      alert(isNew ? "🎉 Tạo trang thành công!" : "✅ Cập nhật thành công!");
      navigate(`/module/${response.data.id}`);
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Lưu page thất bại");
    } finally {
      setSaving(false);
    }
  };

  const openCreateCoupon = () => {
    setCouponDraft({
      ...emptyCoupon,
    });
    setEditingCouponIndex(null);
    couponModal.onOpen();
  };

  const openEditCoupon = (index: number) => {
    setCouponDraft({ ...data.coupons[index] });
    setEditingCouponIndex(index);
    couponModal.onOpen();
  };

  const saveCoupon = () => {
    if (!(couponDraft.title || "").trim()) {
      alert("Vui lòng nhập coupon title.");
      return;
    }

    setData((prev) => {
      const sharedAffiliateUrl = (prev.affiliateUrl || "").trim();
      const nextCoupons = [...prev.coupons];
      const normalizedCoupon = {
        ...couponDraft,
        url: (couponDraft.url || "").trim() || sharedAffiliateUrl,
        buttonHref: (couponDraft.buttonHref || couponDraft.url || "").trim() || sharedAffiliateUrl,
      };
      if (editingCouponIndex === null) {
        nextCoupons.push(normalizedCoupon);
      } else {
        nextCoupons[editingCouponIndex] = normalizedCoupon;
      }
      return {
        ...prev,
        coupons: applyAffiliateUrlToCoupons(nextCoupons, sharedAffiliateUrl),
      };
    });

    setCouponDraft(emptyCoupon);
    setEditingCouponIndex(null);
  };

  const handleDuplicateCoupon = (index: number) => {
    setData((prev) => {
      const nextCoupons = [...prev.coupons];
      const couponToCopy = nextCoupons[index];
      const duplicatedCoupon = {
        ...couponToCopy,
      };
      nextCoupons.splice(index + 1, 0, duplicatedCoupon);
      return {
        ...prev,
        coupons: nextCoupons,
      };
    });
  };

  if (loading) {
    return (
      <AdminLayout fluid>
        <div className="grid min-h-[60vh] place-items-center text-slate-500">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout fluid>
      <div className="w-full space-y-6 px-4 pb-10 md:px-6 xl:px-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Store Coupon Page</h1>
           
          </div>

          <div className="flex flex-wrap gap-3">
            <Button as={Link} to="/dashboard" variant="flat" className="bg-slate-100 font-bold text-slate-700">
              Back
            </Button>
            {data.slug ? (
              <Button
                as={Link}
                to={`/${data.slug}?preview=true`}
                target="_blank"
                variant="flat"
                className="bg-white font-bold text-slate-700"
              >
                Preview public
              </Button>
            ) : null}
            <Button
              onClick={handleSave}
              isLoading={saving}
              className="bg-[#21294a] font-bold text-white shadow-lg shadow-[#21294a]/10"
              startContent={saving ? null : <Save size={18} />}
            >
              {isNew ? "Create Fixed Page" : "Save Fixed Page"}
            </Button>
          </div>
        </div>

          {/* ── POST LINKS ─────────────────────────────────────────────── */}
          {!isNew && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <SectionTitle
                  title="Link phụ (Post Links)"
                  subtitle="Hiển thị dưới dạng nút trực tiếp trên card bài viết ở trang chủ và trang danh mục."
                />
                <div className="flex gap-2">
                  <Button
                    onClick={openCreateLink}
                    className="bg-[#21294a] font-bold text-white"
                    startContent={<Plus size={16} />}
                  >
                    Thêm link
                  </Button>
                  <Button
                    onClick={savePostLinks}
                    isLoading={linksSaving}
                    className="bg-emerald-600 font-bold text-white"
                    startContent={linksSaving ? null : <Save size={16} />}
                  >
                    Lưu links
                  </Button>
                </div>
              </div>

              {postLinks.length > 0 ? (
                <div className="space-y-2">
                  {postLinks.map((link, index) => (
                    <div
                      key={`${link.id ?? "new"}-${index}`}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <GripVertical size={16} className="text-slate-300 shrink-0" />
                      <Link2 size={15} className="text-[#21294a] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-800 truncate">{link.title}</div>
                        <div className="text-xs text-slate-400 truncate">{link.href}</div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditLink(index)}
                          className="rounded-full bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-100"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPostLinks((prev) => prev.filter((_, i) => i !== index))}
                          className="rounded-full bg-white p-2 text-rose-500 shadow-sm transition hover:bg-rose-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-400">
                  Chưa có link phụ. Bấm <strong>Thêm link</strong> để tạo.
                </div>
              )}
            </section>
          )}

        <div className="grid gap-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle
                title="Coupons"
                subtitle="Coupons được quản lý bằng modal. Mỗi coupon gồm title, content, code, button text và URL. URL đầu tiên sẽ được dùng làm mặc định cho các coupon sau nếu để trống."
              />
              <Button onClick={openCreateCoupon} className="bg-[#21294a] font-bold text-white" startContent={<Plus size={16} />}>
                Manage coupons
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.coupons.length > 0 ? (
                data.coupons.map((coupon, index) => (
                  <div key={`${coupon.title}-${index}`} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-slate-900">{coupon.title || `Coupon ${index + 1}`}</div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{coupon.content || "No content"}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {coupon.code ? (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">
                              {coupon.code}
                            </span>
                          ) : null}
                          {coupon.url ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                              URL added
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => openEditCoupon(index)}
                          className="rounded-full bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-100"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateCoupon(index)}
                          className="rounded-full bg-white p-2 text-blue-600 shadow-sm transition hover:bg-blue-50"
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setData((prev) => ({
                              ...prev,
                              coupons: prev.coupons.filter((_, itemIndex) => itemIndex !== index),
                            }))
                          }
                          className="rounded-full bg-white p-2 text-rose-600 shadow-sm transition hover:bg-rose-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-400">
                  Chưa có coupon nào. Bấm <strong>Manage coupons</strong> để tạo coupon đầu tiên.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <SectionTitle title="Basic information" subtitle="Title, category, affiliate URL." />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Title"
                placeholder="Gate.io Promo Codes"
                value={data.title}
                onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
                classNames={{
                  inputWrapper: "bg-white border border-slate-200 shadow-sm rounded-2xl h-12",
                  input: "text-sm font-medium",
                }}
              />
              <div className="space-y-1.5">
                <label className="ml-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Category</label>
                <select
                  value={data.categoryId}
                  onChange={(e) => {
                    const selected = categories.find((item) => String(item.id) === e.target.value);
                    setData((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                      categoryName: selected?.name || "",
                    }));
                  }}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-[#21294a]"
                >
                  <option value="">-- Select category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Affiliate URL"
                placeholder="https://..."
                value={data.affiliateUrl}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    affiliateUrl: e.target.value,
                    coupons: applyAffiliateUrlToCoupons(prev.coupons, e.target.value),
                  }))
                }
                classNames={{
                  inputWrapper: "bg-white border border-slate-200 shadow-sm rounded-2xl h-12",
                  input: "text-sm font-medium",
                }}
              />
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 md:col-span-1">
                <span className="font-bold text-slate-700">Slug</span> will be auto-generated by backend when saving.
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <AssetField
              label="Logo"
              hint="Logo URL or upload file."
              value={data.logoUrl}
              preview={logoPreview}
              onChange={(value) => setData((prev) => ({ ...prev, logoUrl: value }))}
              onUpload={async (file) => {
                const url = await handleUpload(file);
                setData((prev) => ({ ...prev, logoUrl: url }));
                setLogoPreview(resolveAssetUrl(url));
              }}
            />

            <AssetField
              label="Project image"
              hint="Ảnh dự án / ảnh content không hiển thị trực tiếp trên public page."
              value={data.projectImageUrl}
              preview={projectPreview}
              onChange={(value) =>
                setData((prev) => ({
                  ...prev,
                  projectImageUrl: value,
                  heroImageUrl: value,
                }))
              }
              onUpload={async (file) => {
                const url = await handleUpload(file);
                setData((prev) => ({
                  ...prev,
                  projectImageUrl: url,
                  heroImageUrl: url,
                }));
                setProjectPreview(resolveAssetUrl(url));
              }}
            />
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <SectionTitle title="Description" subtitle="Chỉ cần một trình soạn thảo mô tả. Public page sẽ hiển thị đúng đoạn này." />
            <TinyMceEditor
              value={data.aboutHtml}
              onChange={(value) => setData((prev) => ({ ...prev, aboutHtml: value }))}
              placeholder="Write description..."
            />
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <SectionTitle
              title="Public CTA text"
              subtitle="Các text này xuất hiện trên public page và có thể chỉnh sửa tại đây."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Hero title"
                placeholder="Royalclips Coupon Codes & Promo Codes - Complete Savings Guide"
                value={data.heroTitle}
                onChange={(e) => setData((prev) => ({ ...prev, heroTitle: e.target.value }))}
                classNames={{
                  inputWrapper: "bg-white border border-slate-200 shadow-sm rounded-2xl h-12",
                  input: "text-sm font-medium",
                }}
              />
              <Input
                label="Hero subtitle"
                placeholder="Short summary shown under title"
                value={data.heroSubtitle}
                onChange={(e) => setData((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                classNames={{
                  inputWrapper: "bg-white border border-slate-200 shadow-sm rounded-2xl h-12",
                  input: "text-sm font-medium",
                }}
              />
              <Input
                label="Rating text"
                placeholder="Popular choice with our visitors"
                value={data.ratingText}
                onChange={(e) => setData((prev) => ({ ...prev, ratingText: e.target.value }))}
                classNames={{
                  inputWrapper: "bg-white border border-slate-200 shadow-sm rounded-2xl h-12",
                  input: "text-sm font-medium",
                }}
              />
              <Input
                label="CTA button text"
                placeholder="Get code"
                value={data.ratingButtonText}
                onChange={(e) => setData((prev) => ({ ...prev, ratingButtonText: e.target.value }))}
                classNames={{
                  inputWrapper: "bg-white border border-slate-200 shadow-sm rounded-2xl h-12",
                  input: "text-sm font-medium",
                }}
              />
              <Input
                label="CTA URL"
                placeholder="Use Affiliate URL if empty"
                value={data.ratingButtonHref}
                onChange={(e) => setData((prev) => ({ ...prev, ratingButtonHref: e.target.value }))}
                classNames={{
                  inputWrapper: "bg-white border border-slate-200 shadow-sm rounded-2xl h-12",
                  input: "text-sm font-medium",
                }}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              Nút CTA public sẽ mở <strong>Affiliate URL</strong> đã nhập ở phần Basic information.
            </p>
          </section>

        
        </div>
      </div>

      <Modal
        isOpen={couponModal.isOpen}
        onClose={couponModal.onClose}
        backdrop="blur"
        size="5xl"
        classNames={{
          base: "mx-2 md:mx-4",
          body: "p-0",
          header: "border-b border-slate-100 px-6 py-5",
          footer: "border-t border-slate-100 px-6 py-4",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-black tracking-tight text-slate-900">Manage coupons</h2>
            <p className="text-xs font-medium text-slate-400">
              Coupon cards và form nhập nằm trong cùng một modal, bố cục thẳng hàng hơn.
            </p>
          </ModalHeader>

          <ModalBody>
            <div className="space-y-6 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">Current coupons</h3>
                  <p className="mt-1 text-xs text-slate-400">Chọn coupon để sửa hoặc xóa ngay tại đây.</p>
                </div>
                <Button
                  className="bg-[#21294a] font-bold text-white"
                  startContent={<Plus size={14} />}
                  onClick={openCreateCoupon}
                >
                  New coupon
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {data.coupons.length > 0 ? (
                  data.coupons.map((coupon, index) => (
                    <div
                      key={`${coupon.title}-${index}`}
                      className={`rounded-2xl border p-4 ${editingCouponIndex === index ? "border-[#21294a] bg-[#21294a]/5" : "border-slate-200 bg-white"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-black text-slate-900">{coupon.title || `Coupon ${index + 1}`}</div>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{coupon.content || "No content"}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {coupon.code ? (
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">
                                {coupon.code}
                              </span>
                            ) : null}
                            {coupon.url ? (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                                URL added
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setCouponDraft({ ...coupon });
                              setEditingCouponIndex(index);
                            }}
                            className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateCoupon(index)}
                            className="rounded-full bg-slate-100 p-2 text-blue-600 transition hover:bg-blue-200"
                            title="Duplicate"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setData((prev) => ({
                                ...prev,
                                coupons: prev.coupons.filter((_, itemIndex) => itemIndex !== index),
                              }))
                            }
                            className="rounded-full bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400">
                    Chưa có coupon nào.
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                  {editingCouponIndex === null ? "Create coupon" : "Edit coupon"}
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input
                    label="Title"
                    placeholder="Coupon title"
                    value={couponDraft.title}
                    onChange={(e) => setCouponDraft((prev) => ({ ...prev, title: e.target.value }))}
                    classNames={{
                      inputWrapper: "bg-white border border-slate-200 shadow-sm rounded-2xl h-12",
                      input: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="Button text"
                    placeholder="Get code"
                    value={couponDraft.buttonText}
                    onChange={(e) => setCouponDraft((prev) => ({ ...prev, buttonText: e.target.value }))}
                    classNames={{
                      inputWrapper: "bg-white border border-slate-200 shadow-sm rounded-2xl h-12",
                      input: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="Code"
                    placeholder="SAVE20"
                    value={couponDraft.code}
                    onChange={(e) => setCouponDraft((prev) => ({ ...prev, code: e.target.value }))}
                    classNames={{
                      inputWrapper: "bg-white border border-slate-200 shadow-sm rounded-2xl h-12",
                      input: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="URL"
                    placeholder="Lấy từ Affiliate URL nếu trống"
                    value={couponDraft.url || ""}
                    onChange={(e) => setCouponDraft((prev) => ({ ...prev, url: e.target.value, buttonHref: e.target.value }))}
                    classNames={{
                      inputWrapper: "bg-white border border-slate-200 shadow-sm rounded-2xl h-12",
                      input: "text-sm font-medium",
                    }}
                  />
                  <div className="md:col-span-2">
                    <textarea
                      className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#21294a]"
                      placeholder="Content / description"
                      value={couponDraft.content}
                      onChange={(e) => setCouponDraft((prev) => ({ ...prev, content: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="flat" className="bg-white font-bold text-slate-700" onPress={couponModal.onClose}>
                    Done
                  </Button>
                  <Button
                    className="bg-[#21294a] font-bold text-white"
                    onPress={saveCoupon}
                    startContent={editingCouponIndex === null ? <Plus size={16} /> : <CheckCircle2 size={16} />}
                  >
                    {editingCouponIndex === null ? "Add coupon" : "Update coupon"}
                  </Button>
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="light" className="font-bold" onPress={couponModal.onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Link Modal ───────────────────────────────────────────────── */}
      <Modal
        isOpen={linkModal.isOpen}
        onClose={linkModal.onClose}
        backdrop="blur"
        size="lg"
        classNames={{
          base: "mx-2",
          header: "border-b border-slate-100 px-6 py-5",
          footer: "border-t border-slate-100 px-6 py-4",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-lg font-black text-slate-900">
              {editingLinkIndex === null ? "Thêm link phụ" : "Sửa link phụ"}
            </h2>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4 p-6">
              <Input
                label="Tên hiển thị"
                placeholder="VD: Ưu đãi 20% cho đơn đầu tiên"
                value={linkDraft.title}
                onChange={(e) => setLinkDraft((prev) => ({ ...prev, title: e.target.value }))}
                classNames={{
                  inputWrapper: "bg-white border border-slate-200 shadow-sm rounded-2xl h-12",
                  input: "text-sm font-medium",
                }}
              />
              <Input
                label="URL"
                placeholder="https://..."
                value={linkDraft.href}
                onChange={(e) => setLinkDraft((prev) => ({ ...prev, href: e.target.value }))}
                classNames={{
                  inputWrapper: "bg-white border border-slate-200 shadow-sm rounded-2xl h-12",
                  input: "text-sm font-medium",
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" className="font-bold" onPress={linkModal.onClose}>
              Hủy
            </Button>
            <Button
              className="bg-[#21294a] font-bold text-white"
              onPress={() => { saveLinkDraft(); linkModal.onClose(); }}
              startContent={editingLinkIndex === null ? <Plus size={16} /> : <CheckCircle2 size={16} />}
            >
              {editingLinkIndex === null ? "Thêm" : "Cập nhật"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
}
