import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
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
    ChevronLeft,
    ChevronRight,
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
    const limit = 6; // Number of posts per page
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
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 rounded-2xl shadow-lg shadow-indigo-100">
                        <LayoutDashboard className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                            Trang chủ
                        </h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">
                            Quản lý và theo dõi các dự án của bạn
                        </p>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <Input
                            placeholder="Tìm kiếm dự án, danh mục hoặc chủ sở hữu..."
                            variant="flat"
                            startContent={<Search className="text-slate-400" size={20} />}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full"
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
                            className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 shadow-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.2rem' }}
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
                    <p className="ml-4 font-medium text-slate-500">Đang tải dữ liệu...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Card key={post.id} className="bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500 rounded-[2.5rem] group overflow-hidden">
                                <CardBody className="p-0">
                                    <div className="aspect-[16/10] bg-slate-50 relative overflow-hidden">
                                        {post.logo ? (
                                            <img src={`${SERVER_URL}${post.logo}`} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                                <Globe size={40} className="text-slate-200" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
                                            <Button as={Link} to={`/editor/${post.id}`} isIconOnly variant="solid" className="bg-white text-indigo-600 rounded-2xl shadow-xl">
                                                <Edit size={20} />
                                            </Button>
                                            <a href={`/site/${post.slug || post.id}?preview=true`} target="_blank" rel="noopener noreferrer">
                                                <Button isIconOnly variant="solid" className="bg-white text-emerald-600 rounded-2xl shadow-xl">
                                                    <ExternalLink size={20} />
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                    <div className="p-7">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-xl text-slate-800 truncate tracking-tight">{post.title}</h3>
                                                <p className="text-[10px] font-medium text-slate-400 truncate">/{post.slug || post.id}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs bg-slate-50 px-2 py-1 rounded-lg">
                                                <Eye size={14} className="text-indigo-500" /> {post.view_count}
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                                            {post.category?.name || 'Dự án cá nhân'}
                                        </p>

                                        <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                                            <Chip
                                                startContent={post.is_approved ? <CheckCircle size={14} /> : <Clock size={14} />}
                                                variant="flat"
                                                color={post.is_approved ? "success" : "warning"}
                                                className="rounded-xl px-2.5 h-7 font-bold text-[10px] uppercase border-none"
                                            >
                                                {post.is_approved ? 'Đã xuất bản' : 'Đang chờ duyệt'}
                                            </Chip>

                                            <div className="flex gap-2">
                                                {user.role === 'admin' && !post.is_approved && (
                                                    <Button size="sm" className="bg-emerald-50 text-emerald-600 font-bold rounded-xl" onClick={() => handleApprove(post.id)}>Duyệt</Button>
                                                )}
                                                {user.role === 'admin' && (
                                                    <Button isIconOnly size="sm" variant="flat" className="bg-rose-50 text-rose-500 rounded-xl" onClick={() => handleDelete(post.id)}>
                                                        <Trash size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600 text-[10px]">
                                                    {post.creator?.username?.substring(0, 1).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Chủ sở hữu</p>
                                                    <p className="text-[11px] font-bold text-slate-400">{post.creator?.username || 'Hệ thống'}</p>
                                                </div>
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-300 flex items-center gap-1 mt-1 uppercase">
                                                <Clock size={10} /> Đã tạo {new Date(post.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-12 pb-10">
                            <Button
                                isIconOnly
                                variant="flat"
                                isDisabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="bg-white border border-slate-200 rounded-xl shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </Button>
                            <div className="flex items-center gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <Button
                                        key={i}
                                        size="sm"
                                        variant={page === i + 1 ? "solid" : "flat"}
                                        onClick={() => setPage(i + 1)}
                                        className={page === i + 1 ? "bg-indigo-600 text-white rounded-xl min-w-[40px] shadow-md shadow-indigo-100" : "bg-white border border-slate-200 rounded-xl min-w-[40px] shadow-sm"}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                isIconOnly
                                variant="flat"
                                isDisabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="bg-white border border-slate-200 rounded-xl shadow-sm"
                            >
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </AdminLayout>
    );
}
