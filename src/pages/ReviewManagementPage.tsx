import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { DataTable } from "../components/Common/DataTable";
import { TiptapEditor } from "../components/Common/TiptapEditor";
import api, { SERVER_URL } from "../services/api";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Calendar, Edit, Eye, ImagePlus, LayoutDashboard, Link2, Plus, Search, Trash2, Upload } from "lucide-react";

interface ReviewItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  description: string;
  img_bg: string;
  meta_title: string;
  meta_keyword: string;
  meta_description: string;
  meta_override: boolean;
  created_at: string;
}

const emptyForm = {
  title: "",
  content: "",
  description: "",
  img_bg: "",
  meta_title: "",
  meta_keyword: "",
  meta_description: "",
  meta_override: false,
};

export function ReviewManagementPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reviews", { params: { search, page, limit } });
      setReviews(res.data.reviews || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalItems(res.data.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [search, page, limit]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const openEdit = async (id: number) => {
    try {
      const res = await api.get(`/reviews/public/${id}`);
      const review = res.data;
      setEditingId(review.id);
      setForm({
        title: review.title || "",
        content: review.content || "",
        description: review.description || "",
        img_bg: review.img_bg || "",
        meta_title: review.meta_title || "",
        meta_keyword: review.meta_keyword || "",
        meta_description: review.meta_description || "",
        meta_override: !!review.meta_override,
      });
      setIsOpen(true);
    } catch (error) {
      console.error(error);
      alert("Không tải được review");
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert("Title là bắt buộc");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await api.put(`/reviews/${editingId}`, form);
      } else {
        await api.post("/reviews", form);
      }
      setIsOpen(false);
      resetForm();
      fetchReviews();
    } catch (error) {
      console.error(error);
      alert("Lưu review thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa review này?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      fetchReviews();
    } catch (error) {
      console.error(error);
      alert("Xóa review thất bại");
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const media = Array.isArray(res.data) ? res.data[0] : res.data;
      setForm((prev) => ({ ...prev, img_bg: media.url || "" }));
    } catch (error) {
      console.error(error);
      alert("Upload ảnh background thất bại");
    } finally {
      setUploadingImage(false);
    }
  };

  const previewImage = useMemo(() => {
    if (!form.img_bg) return "";
    return form.img_bg.startsWith("http") ? form.img_bg : `${SERVER_URL}${form.img_bg}`;
  }, [form.img_bg]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#ee4d2d] p-3 shadow-lg shadow-[#ee4d2d]/10">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Quản lý Review</h1>
              <p className="text-sm font-medium text-slate-400">CRUD bài review hiển thị ở public site</p>
            </div>
          </div>
          <Button
            className="h-11 rounded-lg bg-[#ee4d2d] px-6 font-bold text-white shadow-lg shadow-[#ee4d2d]/10"
            startContent={<Plus size={18} />}
            onPress={openCreate}
          >
            Tạo Review
          </Button>
        </div>

        <div className="mb-6 flex max-w-md items-center gap-3">
          <Input
            placeholder="Tìm kiếm review..."
            startContent={<Search size={18} className="text-slate-400" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            classNames={{
              inputWrapper: "h-11 rounded-lg border border-slate-200 bg-white shadow-sm",
            }}
          />
        </div>

        <DataTable
          data={reviews}
          loading={loading}
          minWidth="920px"
          pagination={{
            page,
            totalPages,
            totalItems,
            limit,
            onChange: setPage,
            onLimitChange: (value) => {
              setLimit(value);
              setPage(1);
            },
            unitName: "review",
          }}
          columns={[
            {
              header: "Review",
              render: (review) => (
                <div className="flex items-center gap-4">
                  <div className="h-14 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    {review.img_bg ? (
                      <img
                        src={review.img_bg.startsWith("http") ? review.img_bg : `${SERVER_URL}${review.img_bg}`}
                        alt={review.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-bold text-slate-800">{review.title}</div>
                    <div className="truncate font-mono text-xs text-slate-400">/{review.slug}</div>
                  </div>
                </div>
              ),
            },
            {
              header: "SEO",
              render: (review) => (
                <div className="max-w-[280px]">
                  <div className="truncate text-sm font-semibold text-slate-700">{review.meta_title || "-"}</div>
                  <div className="truncate text-xs text-slate-400">{review.meta_keyword || "-"}</div>
                </div>
              ),
            },
            {
              header: "Ngày tạo",
              render: (review) => (
                <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <Calendar size={14} />
                  {new Date(review.created_at).toLocaleDateString("vi-VN")}
                </div>
              ),
            },
            {
              header: "Thao tác",
              align: "right",
              render: (review) => (
                <div className="flex justify-end gap-2">
                  <a href={`/review/${review.slug}`} target="_blank" rel="noreferrer">
                    <Button isIconOnly size="sm" variant="flat" className="bg-slate-50 text-slate-600">
                      <Eye size={16} />
                    </Button>
                  </a>
                  <Button isIconOnly size="sm" variant="flat" className="bg-blue-50 text-blue-600" onPress={() => openEdit(review.id)}>
                    <Edit size={16} />
                  </Button>
                  <Button isIconOnly size="sm" variant="flat" className="bg-rose-50 text-rose-500" onPress={() => handleDelete(review.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="5xl"
        scrollBehavior="inside"
        classNames={{ base: "bg-slate-50", body: "pb-6" }}
      >
        <ModalContent>
          <ModalHeader>{editingId ? "Cập nhật Review" : "Tạo Review"}</ModalHeader>
          <ModalBody>
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-4">
                <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                  <TiptapEditor
                    value={form.description}
                    onChange={(value) => setForm({ ...form, description: value })}
                    placeholder="Nhập phần mô tả review..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Content</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="min-h-[220px] w-full rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none"
                    placeholder="Nội dung chi tiết review..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <ImagePlus size={16} />
                    Image background
                  </div>

                  <Input
                    label="Image background URL"
                    value={form.img_bg}
                    onChange={(e) => setForm({ ...form, img_bg: e.target.value })}
                    placeholder="/uploads/images/... hoặc https://..."
                    startContent={<Link2 size={16} className="text-slate-400" />}
                  />

                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <Upload size={14} />
                      Upload file
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#ee4d2d] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
                      onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                      disabled={uploadingImage}
                    />
                    <p className="mt-2 text-xs text-slate-400">
                      Có thể upload file hoặc dán trực tiếp du?ng d?n ?nh vào ô URL phía trên.
                    </p>
                  </div>
                </div>

                {previewImage ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <img src={previewImage} alt="Preview" className="h-48 w-full object-cover" />
                  </div>
                ) : null}

                {uploadingImage ? <div className="text-xs font-semibold text-slate-500">Đang upload ảnh background...</div> : null}

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.meta_override}
                    onChange={(e) => setForm({ ...form, meta_override: e.target.checked })}
                  />
                  Ghi đè SEO meta
                </label>
                <Input
                  label="Meta title"
                  value={form.meta_title}
                  isDisabled={!form.meta_override}
                  onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                />
                <Input
                  label="Meta keyword"
                  value={form.meta_keyword}
                  isDisabled={!form.meta_override}
                  onChange={(e) => setForm({ ...form, meta_keyword: e.target.value })}
                />
                <textarea
                  value={form.meta_description}
                  disabled={!form.meta_override}
                  onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                  className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none disabled:bg-slate-100"
                  placeholder="Meta description"
                />
                <Button onPress={handleSave} isLoading={saving} className="h-11 w-full bg-[#ee4d2d] font-bold text-white">
                  {editingId ? "Lưu cập nhật" : "Tạo Review"}
                </Button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
}
