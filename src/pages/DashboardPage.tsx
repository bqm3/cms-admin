import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import {
    Search,
    ExternalLink,
    Edit,
    Trash,
    CheckCircle,
    Clock,
    Eye,
    Globe,
    LayoutDashboard,
    Plus,
    Shield,
    Briefcase
} from 'lucide-react';
import api, { SERVER_URL } from '../services/api';
import { AdminLayout } from '../layouts/AdminLayout';

export function DashboardPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10; // Increased limit for table view
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/posts/admin', {
                params: {
                    search,
                    category: selectedCategory,
                    page,
                    limit
                }
            });
            setPosts(response.data.posts);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [search, selectedCategory, page]);

    const handleApprove = async (id: number) => {
        try {
            await api.patch(`/posts/${id}/approve`);
            alert('Bài viết đã được duyệt thành công! ✨');
            fetchPosts();
        } catch (err) {
            alert('Phê duyệt thất bại');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
        try {
            await api.delete(`/posts/${id}`);
            alert('Xóa bài viết thành công! 🗑️');
            fetchPosts();
        } catch (err) {
            alert('Xóa thất bại');
        }
    };

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 rounded-2xl shadow-lg shadow-indigo-100">
                            <LayoutDashboard className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                                Quản lý bài viết
                            </h1>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">
                                Tổng quan và quản lý nội dung hệ thống
                            </p>
                        </div>
                    </div>
                    <Button
                        as={Link}
                        to="/editor/new"
                        className="bg-amber-950 text-white font-black h-14 px-8 rounded-2xl shadow-xl shadow-indigo-100"
                        startContent={<Plus size={20} />}
                    >
                        Viết bài mới
                    </Button>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative">
                        <Input
                            placeholder="Tìm kiếm bài viết..."
                            variant="flat"
                            startContent={<Search className="text-slate-400" size={20} />}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            classNames={{
                                inputWrapper: "bg-white border border-slate-200 shadow-sm h-14 rounded-2xl px-6 hover:shadow-md transition-shadow",
                                input: "placeholder:text-slate-400 font-medium",
                            }}
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setPage(1);
                            }}
                            className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 shadow-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none transition-all cursor-pointer text-sm"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.2rem' }}
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="ml-4 font-bold text-slate-400 uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Nội dung bài viết</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Danh mục & Tác giả</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Ngày tạo</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Trạng thái</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Lượt xem</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {posts.map((post) => (
                                        <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 shadow-sm border border-slate-200">
                                                        {post.logo ? (
                                                            <img src={`${SERVER_URL}${post.logo}`} alt={post.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Globe size={16} className="text-slate-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 max-w-[300px]">
                                                        <h4 className="font-bold text-slate-800 text-sm leading-tight truncate" title={post.title}>
                                                            {post.title}
                                                        </h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 whitespace-nowrap">
                                                            /{post.slug || post.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-0.5 rounded-md mb-1">{post.category?.name || 'Chưa phân loại'}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">@{post.creator?.username || 'vô danh'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                                                    {new Date(post.created_at).toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Chip
                                                    startContent={post.is_approved ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                    variant="flat"
                                                    color={post.is_approved ? "success" : "warning"}
                                                    size="sm"
                                                    className="rounded-xl px-2.5 font-black text-[9px] uppercase border-none h-6"
                                                >
                                                    {post.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                                                </Chip>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 text-indigo-600 font-black text-xs bg-indigo-50/50 px-3 py-1 rounded-full">
                                                    <Eye size={12} /> {post.view_count || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {user.role === 'admin' && !post.is_approved && (
                                                        <Button
                                                            size="sm"
                                                            variant="flat"
                                                            className="bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase h-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => handleApprove(post.id)}
                                                        >
                                                            Duyệt
                                                        </Button>
                                                    )}
                                                    <Button
                                                        as={Link}
                                                        to={`/editor/${post.id}`}
                                                        isIconOnly
                                                        size="sm"
                                                        variant="flat"
                                                        className="bg-indigo-50 text-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Sửa nội dung"
                                                    >
                                                        <Edit size={16} />
                                                    </Button>
                                                    <a href={`/site/${post.slug || post.id}`} target="_blank" rel="noopener noreferrer">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="flat"
                                                            className="bg-sky-50 text-sky-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Xem trước"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </Button>
                                                    </a>
                                                    {(user.role === 'admin' || user.id === post.created_by) && (
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="flat"
                                                            className="bg-rose-50 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => handleDelete(post.id)}
                                                            title="Xóa bài"
                                                        >
                                                            <Trash size={16} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-center pb-8 mt-4">
                        <Pagination
                            total={totalPages}
                            page={page}
                            onChange={(p) => setPage(p)}
                            showControls
                            color="primary"
                            radius="lg"
                            classNames={{
                                cursor: "bg-amber-950 shadow-lg shadow-indigo-200",
                            }}
                        />
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

