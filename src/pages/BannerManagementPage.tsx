/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { DataTable } from "../components/Common/DataTable";
import {
  LayoutPanelTop,
  Edit,
  Eye,
  EyeOff,
  ImagePlus,
  Link2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import api, { SERVER_URL } from "../services/api";

interface BannerItem {
  id: number;
  title: string;
  description: string;
  image: string;
  url: string;
  is_active: number;
  sort_order: number;
  created_at: string;
}

const emptyForm = {
  title: "",
  description: "",
  image: "",
  url: "",
  is_active: 1,
  sort_order: 0,
};

export function BannerManagementPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get("/banners");
      setBanners(res.data.banners || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const resetForm = () => {
    setForm({ ...emptyForm, sort_order: banners.length });
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
  };

  const openCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const openEdit = (banner: BannerItem) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title || "",
      description: banner.description || "",
      image: banner.image || "",
      url: banner.url || "",
      is_active: banner.is_active ?? 1,
      sort_order: banner.sort_order ?? 0,
    });
    setImageFile(null);
    setImagePreview(
      banner.image
        ? banner.image.startsWith("http")
          ? banner.image
          : `${SERVER_URL}${banner.image}`
        : ""
    );
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert("Title là bắt buộc");
      return;
    }
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("url", form.url);
      formData.append("is_active", String(form.is_active));
      formData.append("sort_order", String(form.sort_order));
      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        formData.append("image", form.image);
      }

      if (editingId) {
        await api.put(`/banners/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/banners", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setIsOpen(false);
      resetForm();
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert("Lưu banner thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa banner này?")) return;
    try {
      await api.delete(`/banners/${id}`);
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert("Xóa banner thất bại");
    }
  };

  const handleToggleActive = async (banner: BannerItem) => {
    try {
      await api.put(`/banners/${banner.id}`, { is_active: banner.is_active === 1 ? 0 : 1 });
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveOrder = async (banner: BannerItem, direction: "up" | "down") => {
    const sorted = [...banners].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((b) => b.id === banner.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swapBanner = sorted[swapIdx];
    try {
      await Promise.all([
        api.put(`/banners/${banner.id}`, { sort_order: swapBanner.sort_order }),
        api.put(`/banners/${swapBanner.id}`, { sort_order: banner.sort_order }),
      ]);
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (file?: File | null) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const currentPreview = useMemo(() => {
    if (imagePreview) return imagePreview;
    if (!form.image) return "";
    return form.image.startsWith("http") ? form.image : `${SERVER_URL}${form.image}`;
  }, [imagePreview, form.image]);

  const sortedBanners = [...banners].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <AdminLayout>
      <div className="mb-6">
        {/* Page Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#ee4d2d] p-3 shadow-lg shadow-[#ee4d2d]/20">
              <LayoutPanelTop className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Quản lý Banner</h1>
              <p className="text-sm font-medium text-slate-400">
                Banner hiển thị ngay dưới header trang chủ
              </p>
            </div>
          </div>
          <Button
            className="h-11 rounded-lg bg-[#ee4d2d] px-6 font-bold text-white shadow-lg shadow-[#ee4d2d]/10"
            startContent={<Plus size={18} />}
            onPress={openCreate}
          >
            Thêm Banner
          </Button>
        </div>

        <DataTable
          data={sortedBanners}
          loading={loading}
          minWidth="800px"
          columns={[
            {
              header: "Banner",
              render: (banner) => (
                <div className="flex items-center gap-4">
                  <div className="h-14 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    {banner.image ? (
                      <img
                        src={
                          banner.image.startsWith("http")
                            ? banner.image
                            : `${SERVER_URL}${banner.image}`
                        }
                        alt={banner.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <ImagePlus size={18} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-bold text-slate-800">{banner.title}</div>
                    {banner.description && (
                      <div className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                        {banner.description}
                      </div>
                    )}
                    {banner.url && (
                      <a
                        href={banner.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 flex items-center gap-1 text-xs text-blue-500 hover:underline"
                      >
                        <Link2 size={11} />
                        <span className="max-w-[200px] truncate">{banner.url}</span>
                      </a>
                    )}
                  </div>
                </div>
              ),
            },
            {
              header: "Trạng thái",
              align: "center",
              render: (banner) => (
                <button
                  onClick={() => handleToggleActive(banner)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    banner.is_active === 1
                      ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {banner.is_active === 1 ? <Eye size={13} /> : <EyeOff size={13} />}
                  {banner.is_active === 1 ? "Hiển thị" : "Ẩn"}
                </button>
              ),
            },
            {
              header: "Thứ tự",
              align: "center",
              render: (banner: any) => {
                const idx = sortedBanners.findIndex((b) => b.id === banner.id);
                return (
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleMoveOrder(banner, "up")}
                      disabled={idx === 0}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-slate-500">
                      {idx + 1}
                    </span>
                    <button
                      onClick={() => handleMoveOrder(banner, "down")}
                      disabled={idx === sortedBanners.length - 1}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                    >
                      <ArrowDown size={15} />
                    </button>
                  </div>
                );
              },
            },
            {
              header: "Thao tác",
              align: "right",
              render: (banner) => (
                <div className="flex justify-end gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    className="bg-blue-50 text-blue-600"
                    onPress={() => openEdit(banner)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    className="bg-rose-50 text-rose-500"
                    onPress={() => handleDelete(banner.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="2xl"
        scrollBehavior="inside"
        classNames={{ base: "bg-slate-50", body: "pb-6" }}
      >
        <ModalContent>
          <ModalHeader className="text-lg font-black text-slate-900">
            {editingId ? "Chỉnh sửa Banner" : "Tạo Banner mới"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Tiêu đề *"
                placeholder="VD: Siêu sale mùa hè"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                classNames={{
                  inputWrapper: "bg-white border border-slate-200 rounded-xl h-12",
                  input: "text-sm font-medium",
                }}
              />

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Mô tả
                </label>
                <textarea
                  className="min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#ee4d2d] transition"
                  placeholder="Mô tả ngắn hiển thị trên banner..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <Input
                label="URL đích (khi click nút)"
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                startContent={<Link2 size={15} className="text-slate-400" />}
                classNames={{
                  inputWrapper: "bg-white border border-slate-200 rounded-xl h-12",
                  input: "text-sm font-medium",
                }}
              />

              {/* Image Upload */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <ImagePlus size={16} />
                  Ảnh nền banner (full background)
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />

                {currentPreview ? (
                  <div className="group relative overflow-hidden rounded-xl border border-slate-200">
                    <img
                      src={currentPreview}
                      alt="preview"
                      className="h-44 w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow"
                      >
                        Đổi ảnh
                      </button>
                      <button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                          setForm((f) => ({ ...f, image: "" }));
                        }}
                        className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-bold text-white shadow"
                      >
                        <X size={12} className="inline mr-1" />
                        Xóa ảnh
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-8 text-sm font-semibold text-slate-400 hover:border-[#ee4d2d] hover:text-[#ee4d2d] transition-colors"
                  >
                    <ImagePlus size={20} />
                    Chọn ảnh nền
                  </button>
                )}

                <Input
                  label="Hoặc nhập URL ảnh trực tiếp"
                  placeholder="/uploads/banners/... hoặc https://..."
                  value={form.image}
                  onChange={(e) => {
                    setForm({ ...form, image: e.target.value });
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  startContent={<Link2 size={15} className="text-slate-400" />}
                  classNames={{
                    inputWrapper: "bg-white border border-slate-200 rounded-xl h-12",
                    input: "text-sm font-medium",
                  }}
                />
              </div>

              {/* Sort order & Active */}
              <div className="flex gap-4">
                <Input
                  type="number"
                  label="Thứ tự"
                  value={String(form.sort_order)}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  classNames={{
                    inputWrapper: "bg-white border border-slate-200 rounded-xl h-12",
                    input: "text-sm font-medium",
                  }}
                  className="flex-1"
                />
                <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm">
                  <input
                    type="checkbox"
                    checked={form.is_active === 1}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
                    className="h-4 w-4"
                  />
                  Hiển thị trên trang chủ
                </label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsOpen(false)} isDisabled={saving}>
              Hủy
            </Button>
            <Button
              className="bg-[#ee4d2d] font-bold text-white"
              onPress={handleSave}
              isLoading={saving}
            >
              {editingId ? "Lưu cập nhật" : "Tạo Banner"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
}
