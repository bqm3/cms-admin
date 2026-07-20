/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { DataTable } from "../components/Common/DataTable";
import { Flame, Edit, Eye, EyeOff, ImagePlus, Link2, Plus, Trash2, Upload, ArrowUp, ArrowDown } from "lucide-react";
import api, { SERVER_URL } from "../services/api";

interface DealItem {
  id: number;
  title: string;
  description: string;
  image: string;
  url: string;
  countdown_end: string | null;
  is_active: number;
  sort_order: number;
  created_at: string;
}

const emptyForm = {
  title: "",
  description: "",
  image: "",
  url: "",
  countdown_end: "",
  is_active: 1,
  sort_order: 0,
};

function toLocalDatetimeInput(iso: string | null) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

export function FeaturedDealManagementPage() {
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await api.get("/featured-deals");
      setDeals(res.data.deals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const resetForm = () => {
    setForm({ ...emptyForm, sort_order: deals.length });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const openEdit = (deal: DealItem) => {
    setEditingId(deal.id);
    setForm({
      title: deal.title || "",
      description: deal.description || "",
      image: deal.image || "",
      url: deal.url || "",
      countdown_end: toLocalDatetimeInput(deal.countdown_end),
      is_active: deal.is_active ?? 1,
      sort_order: deal.sort_order ?? 0,
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert("Title là bắt buộc");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...form,
        countdown_end: form.countdown_end ? new Date(form.countdown_end).toISOString() : null,
      };
      if (editingId) {
        await api.put(`/featured-deals/${editingId}`, payload);
      } else {
        await api.post("/featured-deals", payload);
      }
      setIsOpen(false);
      resetForm();
      fetchDeals();
    } catch (err) {
      console.error(err);
      alert("Lưu deal thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa deal này?")) return;
    try {
      await api.delete(`/featured-deals/${id}`);
      fetchDeals();
    } catch (err) {
      console.error(err);
      alert("Xóa deal thất bại");
    }
  };

  const handleToggleActive = async (deal: DealItem) => {
    try {
      await api.put(`/featured-deals/${deal.id}`, { is_active: deal.is_active === 1 ? 0 : 1 });
      fetchDeals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveOrder = async (deal: DealItem, direction: "up" | "down") => {
    const sorted = [...deals].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((d) => d.id === deal.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swapDeal = sorted[swapIdx];
    try {
      await Promise.all([
        api.put(`/featured-deals/${deal.id}`, { sort_order: swapDeal.sort_order }),
        api.put(`/featured-deals/${swapDeal.id}`, { sort_order: deal.sort_order }),
      ]);
      fetchDeals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (file?: File | null) => {
    if (!file) return;
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("files", file);
      formData.append("name", file.name);
      const res = await api.post("/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const media = Array.isArray(res.data) ? res.data[0] : res.data;
      setForm((prev) => ({ ...prev, image: media.url || "" }));
    } catch (err) {
      console.error(err);
      alert("Upload ảnh thất bại");
    } finally {
      setUploadingImage(false);
    }
  };

  const previewImage = useMemo(() => {
    if (!form.image) return "";
    return form.image.startsWith("http") ? form.image : `${SERVER_URL}${form.image}`;
  }, [form.image]);

  const sortedDeals = [...deals].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <AdminLayout>
      <div className="mb-6">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500 p-3 shadow-lg shadow-red-500/20">
              <Flame className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Deal Nổi Bật</h1>
              <p className="text-sm font-medium text-slate-400">Quản lý các deal hiển thị trên trang chủ với countdown</p>
            </div>
          </div>
          <Button
            className="h-11 rounded-lg bg-[#ee4d2d] px-6 font-bold text-white shadow-lg shadow-[#ee4d2d]/10"
            startContent={<Plus size={18} />}
            onPress={openCreate}
          >
            Thêm Deal
          </Button>
        </div>

        <DataTable
          data={sortedDeals}
          loading={loading}
          minWidth="860px"
          columns={[
            {
              header: "Deal",
              render: (deal) => (
                <div className="flex items-center gap-4">
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    {deal.image ? (
                      <img
                        src={deal.image.startsWith("http") ? deal.image : `${SERVER_URL}${deal.image}`}
                        alt={deal.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <ImagePlus size={18} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-bold text-slate-800">{deal.title}</div>
                    {deal.description && (
                      <div className="mt-0.5 line-clamp-1 text-xs text-slate-400">{deal.description}</div>
                    )}
                    {deal.url && (
                      <a
                        href={deal.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 flex items-center gap-1 text-xs text-blue-500 hover:underline"
                      >
                        <Link2 size={11} />
                        <span className="truncate max-w-[180px]">{deal.url}</span>
                      </a>
                    )}
                  </div>
                </div>
              ),
            },
            {
              header: "Countdown",
              render: (deal) => (
                <div className="text-sm">
                  {deal.countdown_end ? (
                    <div>
                      <div className="font-semibold text-slate-700">
                        {new Date(deal.countdown_end).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {new Date(deal.countdown_end) < new Date() ? (
                        <span className="mt-0.5 inline-block rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-500">
                          Đã hết hạn
                        </span>
                      ) : (
                        <span className="mt-0.5 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                          Còn hạn
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400">Không có</span>
                  )}
                </div>
              ),
            },
            {
              header: "Trạng thái",
              align: "center",
              render: (deal) => (
                <button
                  onClick={() => handleToggleActive(deal)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    deal.is_active === 1
                      ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {deal.is_active === 1 ? <Eye size={13} /> : <EyeOff size={13} />}
                  {deal.is_active === 1 ? "Hiển thị" : "Ẩn"}
                </button>
              ),
            },
            {
              header: "Thứ tự",
              align: "center",
              render: (deal: any) => {
                const idx = sortedDeals.findIndex((d) => d.id === deal.id);
                return (
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleMoveOrder(deal, "up")}
                      disabled={idx === 0}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-slate-500">{idx + 1}</span>
                    <button
                      onClick={() => handleMoveOrder(deal, "down")}
                      disabled={idx === sortedDeals.length - 1}
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
              render: (deal) => (
                <div className="flex justify-end gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    className="bg-blue-50 text-blue-600"
                    onPress={() => openEdit(deal)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    className="bg-rose-50 text-rose-500"
                    onPress={() => handleDelete(deal.id)}
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
            {editingId ? "Chỉnh sửa Deal" : "Tạo Deal mới"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Tiêu đề *"
                placeholder="VD: Giảm 70% vé máy bay"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                classNames={{ inputWrapper: "bg-white border border-slate-200 rounded-xl h-12", input: "text-sm font-medium" }}
              />

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Mô tả ngắn
                </label>
                <textarea
                  className="min-h-[88px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#ee4d2d] transition"
                  placeholder="Giảm đến hết cuối tháng. Giảm 70% vé máy bay nội địa..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <Input
                label="URL đích (khi click deal)"
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                startContent={<Link2 size={15} className="text-slate-400" />}
                classNames={{ inputWrapper: "bg-white border border-slate-200 rounded-xl h-12", input: "text-sm font-medium" }}
              />

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Thời gian kết thúc countdown
                </label>
                <input
                  type="datetime-local"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:border-[#ee4d2d] transition"
                  value={form.countdown_end}
                  onChange={(e) => setForm({ ...form, countdown_end: e.target.value })}
                />
                <p className="mt-1 text-xs text-slate-400">Để trống nếu không cần countdown</p>
              </div>

              {/* Image section */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <ImagePlus size={16} />
                  Ảnh deal
                </div>
                <Input
                  label="URL ảnh"
                  placeholder="/uploads/images/... hoặc https://..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  startContent={<Link2 size={15} className="text-slate-400" />}
                  classNames={{ inputWrapper: "bg-white border border-slate-200 rounded-xl h-12", input: "text-sm font-medium" }}
                />
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <Upload size={14} /> Upload ảnh
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#ee4d2d] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
                    onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                    disabled={uploadingImage}
                  />
                </div>
                {previewImage && (
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <img src={previewImage} alt="Preview" className="h-44 w-full object-cover" />
                  </div>
                )}
                {uploadingImage && <p className="text-xs font-semibold text-slate-400">Đang upload ảnh...</p>}
              </div>

              {/* Sort order & Active */}
              <div className="flex gap-4">
                <Input
                  type="number"
                  label="Thứ tự sắp xếp"
                  value={String(form.sort_order)}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  classNames={{ inputWrapper: "bg-white border border-slate-200 rounded-xl h-12", input: "text-sm font-medium" }}
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
              {editingId ? "Lưu cập nhật" : "Tạo Deal"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
}
