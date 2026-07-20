import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import {
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  LayoutDashboard,
  LayoutTemplate,
  Link as LinkIcon,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import api, { SERVER_URL } from "../services/api";
import { AdminLayout } from "../layouts/AdminLayout";
import { DataTable } from "../components/Common/DataTable";
import { PostLinkDialog } from "../components/Common/PostLinkDialog";

export function DashboardPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [viewSort, setViewSort] = useState("");
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedPostTitle, setSelectedPostTitle] = useState("");
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyQuantity, setCopyQuantity] = useState("1");
  const [copyPostId, setCopyPostId] = useState<number | null>(null);
  const [copyLoading, setCopyLoading] = useState(false);

  const [bulkHiddenLoading, setBulkHiddenLoading] = useState(false);

  const handleBulkHidden = async (hide: boolean) => {
    const action = hide ? "ẩn toàn bộ" : "hiện toàn bộ";
    if (!window.confirm(`Bạn có chắc muốn ${action} tất cả bài viết không bị xóa?`)) return;
    try {
      setBulkHiddenLoading(true);
      const res = await api.patch("/posts/bulk-hidden", { is_hidden: hide });
      alert(`✅ Đã ${action} ${res.data.affected ?? ""} bài viết.`);
      fetchPosts();
    } catch (err: any) {
      alert(err?.response?.data?.message || `${action} thất bại`);
    } finally {
      setBulkHiddenLoading(false);
    }
  };

  const [slugDialogOpen, setSlugDialogOpen] = useState(false);
  const [slugPostId, setSlugPostId] = useState<number | null>(null);
  const [slugValue, setSlugValue] = useState("");
  const [slugLoading, setSlugLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const [catRes, parentRes] = await Promise.all([api.get("/categories"), api.get("/parent-categories")]);
      setCategories(catRes.data.categories || catRes.data || []);
      setParentCategories(parentRes.data.parentCategories || parentRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts/admin", {
        params: {
          search,
          category: selectedCategory,
          parentCategory: selectedParentCategory,
          startDate,
          endDate,
          page,
          limit,
          sort: viewSort ? `view_count:${viewSort}` : undefined,
        },
      });
      setPosts(response.data.posts || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [search, selectedCategory, selectedParentCategory, startDate, endDate, page, limit, viewSort]);

  const handleApprove = async (id: number) => {
    try {
      await api.patch(`/posts/${id}/approve`);
      fetchPosts();
    } catch (err) {
      alert("Phê duyệt thất bại");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
    try {
      await api.delete(`/posts/${id}`);
      fetchPosts();
    } catch (err) {
      alert("Xóa thất bại");
    }
  };

  const openCopyDialog = (post: any) => {
    setCopyPostId(post.id);
    setSelectedPostTitle(post.title);
    setCopyQuantity("1");
    setCopyDialogOpen(true);
  };

  const handleCopy = async () => {
    if (!copyPostId) return;
    try {
      setCopyLoading(true);
      await api.post(`/posts/${copyPostId}/copy`, { quantity: Number(copyQuantity) || 1 });
      setCopyDialogOpen(false);
      fetchPosts();
    } catch (err) {
      alert("Nhân bản thất bại");
    } finally {
      setCopyLoading(false);
    }
  };

  const openSlugDialog = (post: any) => {
    setSlugPostId(post.id);
    setSelectedPostTitle(post.title);
    setSlugValue(post.slug || "");
    setSlugDialogOpen(true);
  };

  const handleSaveSlug = async () => {
    if (!slugPostId) return;
    try {
      setSlugLoading(true);
      const formData = new FormData();
      formData.append("slug", slugValue.trim());
      await api.put(`/posts/${slugPostId}`, formData);
      setSlugDialogOpen(false);
      fetchPosts();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Cập nhật slug thất bại");
    } finally {
      setSlugLoading(false);
    }
  };

  const handleToggleHidden = async (id: number, currentHidden: boolean) => {
    try {
      const formData = new FormData();
      formData.append("is_hidden", String(!currentHidden));
      await api.put(`/posts/${id}`, formData);
      fetchPosts();
    } catch (err) {
      alert("Thao tác thất bại");
    }
  };

  const handleToggleHot = async (id: number, currentHot: boolean) => {
    try {
      const formData = new FormData();
      formData.append("is_hot", String(!currentHot));
      await api.put(`/posts/${id}`, formData);
      fetchPosts();
    } catch (err) {
      alert("Thao tác thất bại");
    }
  };

  const openLinkDialog = (post: any) => {
    setSelectedPostId(post.id);
    setSelectedPostTitle(post.title);
    setIsLinkDialogOpen(true);
  };

  const resolveImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
    return `${SERVER_URL}${url}`;
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#ee4d2d] p-3 shadow-lg shadow-[#ee4d2d]/10">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">Quản lý bài viết</h1>
              <p className="text-sm font-medium text-slate-400">Tổng quan và quản lý nội dung hệ thống</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button as={Link} to="/editor/new" className="h-11 rounded-lg bg-[#ee4d2d] px-6 font-bold text-white" startContent={<Plus size={18} />}>
              Viết bài mới
            </Button>
            <Button
              as={Link}
              to="/module/new"
              className="h-11 rounded-lg border border-[#ee4d2d]/15 bg-white px-6 font-bold text-[#ee4d2d] shadow-sm"
              startContent={<LayoutTemplate size={18} />}
            >
              Tạo page cố định
            </Button>
            {user.role === "admin" && (
              <>
                <Button
                  className="h-11 rounded-lg border border-amber-200 bg-amber-50 px-4 font-bold text-amber-700 shadow-sm hover:bg-amber-100"
                  startContent={<EyeOff size={16} />}
                  isLoading={bulkHiddenLoading}
                  onPress={() => handleBulkHidden(true)}
                >
                  Ẩn tất cả
                </Button>
                <Button
                  className="h-11 rounded-lg border border-emerald-200 bg-emerald-50 px-4 font-bold text-emerald-700 shadow-sm hover:bg-emerald-100"
                  startContent={<Eye size={16} />}
                  isLoading={bulkHiddenLoading}
                  onPress={() => handleBulkHidden(false)}
                >
                  Hiện tất cả
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-3 md:flex-row">
            <div className="relative w-full flex-1">
              <Input
                placeholder="Tìm kiếm bài viết..."
                variant="flat"
                startContent={<Search className="text-slate-400" size={18} />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                classNames={{
                  inputWrapper: "h-11 rounded-lg border border-slate-200 bg-white px-4 shadow-sm hover:shadow-md",
                  input: "text-sm font-medium placeholder:text-slate-400",
                }}
              />
            </div>

            <div className="w-full md:w-48">
              <select
                value={selectedParentCategory}
                onChange={(e) => {
                  setSelectedParentCategory(e.target.value);
                  setSelectedCategory("");
                  setPage(1);
                }}
                className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-[#ee4d2d]"
              >
                <option value="">Tất cả danh mục cha</option>
                {parentCategories.map((pc) => (
                  <option key={pc.id} value={pc.id}>{pc.name}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-[#ee4d2d]"
              >
                <option value="">Tất cả danh mục con</option>
                {categories
                  .filter((cat: any) => !selectedParentCategory || cat.parent_id === Number(selectedParentCategory))
                  .map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
              </select>
            </div>

            <div className="w-full md:w-48">
              <select
                value={viewSort}
                onChange={(e) => {
                  setViewSort(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-[#ee4d2d]"
              >
                <option value="">Sắp xếp lượt xem</option>
                <option value="DESC">Lượt xem giảm dần</option>
                <option value="ASC">Lượt xem tăng dần</option>
              </select>
            </div>

            <div className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm md:w-auto">
              <Calendar size={18} className="text-slate-400" />
              <input type="date" className="h-11 bg-transparent text-sm font-semibold text-slate-600 outline-none" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} />
              <input type="date" className="h-11 bg-transparent text-sm font-semibold text-slate-600 outline-none" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} />
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={posts}
        loading={loading}
        minWidth="1000px"
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
          unitName: "dự án",
        }}
        columns={[
          {
            header: "Dự án",
            render: (post) => (
              <div className="flex items-center gap-4">
                <div className="h-10 w-14 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  {post.logo ? (
                    <img src={resolveImageUrl(post.logo)} alt={post.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#ee4d2d]/5">
                      <Globe size={16} className="text-[#ee4d2d]/30" />
                    </div>
                  )}
                </div>
                <div className="max-w-[320px] min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate text-sm font-bold text-slate-800">{post.title}</h4>
                    {post.is_hidden ? <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">Ẩn</span> : null}
                    {post.is_hot ? <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-500">🔥 Hot</span> : null}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="truncate font-mono text-xs font-medium text-slate-400">/{post.slug || post.id}</span>
                    <button
                      onClick={() => openSlugDialog(post)}
                      className="text-slate-300 hover:text-[#ee4d2d] transition-colors"
                      title="Sửa slug"
                    >
                      <Edit size={12} className="inline" />
                    </button>
                  </div>
                </div>
              </div>
            ),
          },
          {
            header: "Phân loại",
            render: (post) => (
              <div className="flex flex-col gap-1">
                <span className="w-fit rounded-md border border-[#ee4d2d]/10 bg-[#ee4d2d]/5 px-2 py-0.5 text-xs font-bold text-[#ee4d2d]">
                  {post.category?.name || "Chưa phân loại"}
                </span>
                <span className="text-xs font-semibold text-slate-400">@{post.creator?.username || "vô danh"}</span>
              </div>
            ),
          },
          {
            header: "Ngày tạo",
            render: (post) => <div className="text-sm font-medium text-slate-500">{new Date(post.created_at).toLocaleDateString("vi-VN")}</div>,
          },
          {
            header: "Trạng thái",
            render: (post) => (
              <Chip
                startContent={post.is_approved ? <CheckCircle size={12} /> : <Clock size={12} />}
                variant="flat"
                color={post.is_approved ? "success" : "warning"}
                size="sm"
                className="h-6 rounded-lg px-2 text-xs font-bold uppercase"
              >
                {post.is_approved ? "Đã duyệt" : "Chờ duyệt"}
              </Chip>
            ),
          },
          {
            header: "Link phụ",
            align: "center",
            render: (post) => (
              <div className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600" onClick={() => openLinkDialog(post)}>
                <LinkIcon size={12} /> {post.links?.length || 0}
              </div>
            ),
          },
          {
            header: "Lượt xem",
            align: "center",
            render: (post) => <div className="inline-flex items-center gap-1.5 rounded-md border border-[#ee4d2d]/10 bg-[#ee4d2d]/5 px-2.5 py-1 text-xs font-bold text-[#ee4d2d]"><Eye size={12} /> {post.view_count || 0}</div>,
          },
          {
            header: "Thao tác",
            align: "right",
            render: (post) => (
              <div className="flex items-center justify-end gap-2">
                {user.role === "admin" && !post.is_approved ? (
                  <Button size="sm" variant="flat" className="bg-emerald-50 text-xs font-bold text-emerald-600" onClick={() => handleApprove(post.id)}>
                    Duyệt
                  </Button>
                ) : null}
                <Button
                  as={Link}
                  to={post.topic_name === "store-coupon-module" ? `/module/${post.id}` : `/editor/${post.id}`}
                  isIconOnly
                  size="sm"
                  variant="flat"
                  className="bg-[#ee4d2d]/5 text-[#ee4d2d]"
                >
                  <Edit size={16} />
                </Button>
                <Button isIconOnly size="sm" variant="flat" className="bg-purple-50 text-purple-600" onClick={() => openCopyDialog(post)}>
                  <Copy size={16} />
                </Button>
                <Button isIconOnly size="sm" variant="flat" className="bg-blue-50 text-blue-600" onClick={() => openLinkDialog(post)}>
                  <LinkIcon size={16} />
                </Button>
                {user.role === "admin" ? (
                  <Button isIconOnly size="sm" variant="flat" className={post.is_hidden ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"} onClick={() => handleToggleHidden(post.id, post.is_hidden)}>
                    {post.is_hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                ) : null}
                {user.role === "admin" ? (
                  <Button isIconOnly size="sm" variant="flat" className={post.is_hot ? "bg-red-300 text-red-500" : "bg-slate-50 text-slate-400"} onClick={() => handleToggleHot(post.id, !!post.is_hot)} title={post.is_hot ? "Bỏ Hot" : "Đánh dấu Hot"}>
                    🔥
                  </Button>
                ) : null}
                <a href={`/${post.slug || post.id}`} target="_blank" rel="noreferrer">
                  <Button isIconOnly size="sm" variant="flat" className="border border-slate-200 bg-slate-50 text-slate-600">
                    <ExternalLink size={16} />
                  </Button>
                </a>
                {user.role === "admin" || user.id === post.created_by ? (
                  <Button isIconOnly size="sm" variant="flat" className="bg-rose-50 text-rose-500" onClick={() => handleDelete(post.id)}>
                    <Trash size={16} />
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
      />

      <PostLinkDialog isOpen={isLinkDialogOpen} onClose={() => setIsLinkDialogOpen(false)} onSuccess={fetchPosts} postId={selectedPostId} postTitle={selectedPostTitle} />

      <Modal isOpen={copyDialogOpen} onClose={() => !copyLoading && setCopyDialogOpen(false)}>
        <ModalContent>
          <ModalHeader>Copy post</ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                Nhập số lượng cần copy cho bài <span className="font-bold text-slate-800">{selectedPostTitle}</span>.
              </p>
              <Input type="number" min={1} max={100} label="Số lượng" value={copyQuantity} onChange={(e) => setCopyQuantity(e.target.value)} />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setCopyDialogOpen(false)} isDisabled={copyLoading}>Hủy</Button>
            <Button className="bg-[#ee4d2d] text-white" onPress={handleCopy} isLoading={copyLoading}>Tạo bản copy</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={slugDialogOpen} onClose={() => !slugLoading && setSlugDialogOpen(false)}>
        <ModalContent>
          <ModalHeader>Sửa slug bài viết</ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                Nhập slug mới cho bài <span className="font-bold text-slate-800">{selectedPostTitle}</span>.
              </p>
              <Input
                label="Slug"
                placeholder="vi-du-slug-bai-viet"
                value={slugValue}
                onChange={(e) => setSlugValue(e.target.value)}
              />
              <p className="text-xs text-amber-600 font-semibold bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                ⚠️ Lưu ý: Thay đổi slug sẽ thay đổi đường dẫn (URL) của bài viết trên trang công khai. Slug chỉ được chứa chữ cái viết liền không dấu, số và dấu gạch ngang (không chứa khoảng trắng).
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setSlugDialogOpen(false)} isDisabled={slugLoading}>Hủy</Button>
            <Button className="bg-[#ee4d2d] text-white" onPress={handleSaveSlug} isLoading={slugLoading}>Lưu thay đổi</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
}
