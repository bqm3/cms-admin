import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { Eye, Clock, ArrowUpDown, Layout, Search, X } from "lucide-react";
import api, { SERVER_URL } from "../services/api";
import { formatDate } from "../utils/formatDate";

export function ClientHomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [sort, setSort] = useState("sequence_number:ASC");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedParentCategory, setSelectedParentCategory] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const fetchCategories = async () => {
    try {
      const [catRes, parentRes] = await Promise.all([
        api.get("/categories"),
        api.get("/parent-categories"),
      ]);
      setCategories(catRes.data.categories || catRes.data || []);
      setParentCategories(parentRes.data.parentCategories || parentRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts/public", {
        params: {
          sort,
          search,
          category: selectedCategory,
          parentCategory: selectedParentCategory,
          page,
          limit,
        },
      });

      // Handle both paginated and non-paginated responses
      if (response.data.posts) {
        setPosts(response.data.posts);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.total || 0);
      } else {
        setPosts(response.data);
        setTotalPages(1);
        setTotalItems(response.data.length || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [sort, search, selectedCategory, selectedParentCategory, page, limit]);

  const toggleSort = () => {
    setSort((prev) =>
      prev === "view_count:DESC" ? "sequence_number:ASC" : "view_count:DESC",
    );
  };

  const handleReset = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedParentCategory("");
    setPage(1);
  };

  const hasActiveFilters = search || selectedCategory || selectedParentCategory;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 bg-white px-5 py-4 rounded-xl shadow-sm border border-slate-200/60">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-lg shadow-blue-100 shadow-md">
                <Layout className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Danh sách dự án
                </h1>
                <p className="text-slate-500 text-[12px] font-bold uppercase tracking-wider">
                  {totalItems > 0 ? `${totalItems} dự án` : 'Khám phá các trang web cao cấp'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Hiển thị:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors"
              >
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={16}>16</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              placeholder="Tìm kiếm dự án..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              startContent={<Search size={16} className="text-slate-400" />}
              classNames={{
                base: "flex-1",
                inputWrapper: "bg-slate-50 border-slate-200 h-10",
              }}
            />

            <select
              value={selectedParentCategory}
              onChange={(e) => {
                setSelectedParentCategory(e.target.value);
                setSelectedCategory("");
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Tất cả nhóm</option>
              {parentCategories.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Tất cả danh mục</option>
              {categories
                .filter((cat) =>
                  selectedParentCategory
                    ? cat.parent_id === Number(selectedParentCategory)
                    : true
                )
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>

            {hasActiveFilters && (
              <Button
                size="sm"
                variant="flat"
                onClick={handleReset}
                startContent={<X size={14} />}
                className="bg-rose-50 text-rose-600 font-bold border border-rose-200 hover:bg-rose-100"
              >
                Xóa lọc
              </Button>
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">
              Đang tải danh sách...
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="text-slate-300">
              <Layout size={48} />
            </div>
            <p className="text-slate-600 text-sm font-bold">
              Không tìm thấy dự án nào
            </p>
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="flat"
                onClick={handleReset}
                className="bg-blue-50 text-blue-600 font-bold"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {posts.map((post) => (
                <a
                  href={`/site/${post.slug || post.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={post.id}
                  className="block group"
                >
                  <Card className="bg-white border-transparent hover:border-blue-500/20 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md rounded-xl">
                    <CardBody className="p-0">
                      <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                        {post.logo ? (
                          <img
                            src={`${SERVER_URL}${post.logo}`}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-50/50 text-blue-200 font-black text-2xl uppercase italic">
                            {post.title.substring(0, 2)}
                          </div>
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-black text-blue-600 shadow-sm border border-blue-100 uppercase">
                            Xem trang
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5">
                        <h3 className="text-sm font-bold text-slate-800 mb-0.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {post.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-slate-600 text-[12px] font-medium">
                            @{post.creator?.username || "user"}
                          </p>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock size={10} />
                            <span className="text-[12px] font-bold">{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </a>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  total={totalPages}
                  page={page}
                  onChange={setPage}
                  showControls
                  classNames={{
                    wrapper: "gap-2",
                    item: "w-8 h-8 text-sm font-bold bg-white border border-slate-200 rounded-lg",
                    cursor: "bg-blue-600 text-white font-bold shadow-sm",
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
