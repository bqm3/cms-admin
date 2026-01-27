import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@heroui/button";
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
    Plus,
    Calendar
} from 'lucide-react';
import api, { SERVER_URL } from '../services/api';
import { AdminLayout } from '../layouts/AdminLayout';
import { DataTable } from '../components/Common/DataTable';

export function DashboardPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

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
                    startDate,
                    endDate,
                    page,
                    limit
                }
            });
            setPosts(response.data.posts);
            setTotalPages(response.data.totalPages);
            setTotalItems(response.data.total);
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
    }, [search, selectedCategory, startDate, endDate, page, limit]);

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
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-3 rounded-xl shadow-blue-100 shadow-lg">
                            <LayoutDashboard className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                                Quản lý bài viết
                            </h1>
                            <p className="text-sm font-medium text-slate-400">
                                Tổng quan và quản lý nội dung hệ thống
                            </p>
                        </div>
                    </div>
                    <Button
                        as={Link}
                        to="/editor/new"
                        className="bg-blue-600 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-blue-100"
                        startContent={<Plus size={18} />}
                    >
                        Viết bài mới
                    </Button>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                        <div className="flex-1 w-full relative">
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
                                    inputWrapper: "bg-white border border-slate-200 shadow-sm h-11 rounded-xl px-4 hover:shadow-md transition-shadow",
                                    input: "placeholder:text-slate-400 text-sm font-medium",
                                }}
                            />
                        </div>
                        <div className="flex flex-col md:flex-row gap-3 items-center">
                            <div className="flex items-center gap-3 bg-white px-4 h-11 border border-slate-200 rounded-xl shadow-sm flex-1 w-full">
                                <Calendar size={18} className="text-slate-400" />
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Từ</span>
                                    <input
                                        type="date"
                                        className="bg-transparent border-none outline-none text-sm font-semibold text-slate-600 w-full"
                                        value={startDate}
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            setPage(1);
                                        }}
                                    />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đến</span>
                                    <input
                                        type="date"
                                        className="bg-transparent border-none outline-none text-sm font-semibold text-slate-600 w-full"
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            setPage(1);
                                        }}
                                    />
                                </div>
                                {(startDate || endDate) && (
                                    <button
                                        onClick={() => {
                                            setStartDate('');
                                            setEndDate('');
                                            setPage(1);
                                        }}
                                        className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors px-2"
                                    >
                                        Xóa lọc
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="w-full md:w-64">
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full h-11 px-4 rounded-xl bg-white border border-slate-200 shadow-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all cursor-pointer text-sm"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2rem' }}
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <DataTable
                data={posts}
                loading={loading}
                minWidth="1000px"
                columns={[
                    {
                        header: 'Dự án',
                        render: (post) => (
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm">
                                    {post.logo ? (
                                        <img src={`${SERVER_URL}${post.logo}`} alt={post.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-50/50">
                                            <Globe size={16} className="text-blue-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 max-w-[320px]">
                                    <h4 className="font-bold text-slate-800 text-sm leading-tight truncate group-hover:text-blue-600 transition-colors" title={post.title}>
                                        {post.title}
                                    </h4>
                                    <p className="text-xs font-medium text-slate-400 mt-1 whitespace-nowrap overflow-hidden text-ellipsis font-mono">
                                        /{post.slug || post.id}
                                    </p>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'Phân loại',
                        render: (post) => (
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 w-fit px-2 py-0.5 rounded-md border border-blue-100">
                                    {post.category?.name || 'Chưa phân loại'}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                    @{post.creator?.username || 'vô danh'}
                                </span>
                            </div>
                        )
                    },
                    {
                        header: 'Ngày tạo',
                        render: (post) => (
                            <div className="text-sm font-medium text-slate-500 whitespace-nowrap">
                                {new Date(post.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                        )
                    },
                    {
                        header: 'Trạng thái',
                        render: (post) => (
                            <Chip
                                startContent={post.is_approved ? <CheckCircle size={12} /> : <Clock size={12} />}
                                variant="flat"
                                color={post.is_approved ? "success" : "warning"}
                                size="sm"
                                className="rounded-lg font-bold text-xs uppercase px-2 h-6"
                            >
                                {post.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                            </Chip>
                        )
                    },
                    {
                        header: 'Lượt xem',
                        align: 'center',
                        render: (post) => (
                            <div className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                                <Eye size={12} /> {post.view_count || 0}
                            </div>
                        )
                    },
                    {
                        header: 'Thao tác',
                        align: 'right',
                        render: (post) => (
                            <div className="flex items-center justify-end gap-2">
                                {user.role === 'admin' && !post.is_approved && (
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        className="bg-emerald-50 text-emerald-600 font-bold text-xs h-8 px-4 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-100"
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
                                    className="bg-blue-50 text-blue-600 rounded-lg h-8 w-8 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-100"
                                    title="Sửa nội dung"
                                >
                                    <Edit size={16} />
                                </Button>
                                <a href={`/site/${post.slug || post.id}`} target="_blank" rel="noopener noreferrer">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="flat"
                                        className="bg-slate-50 text-slate-600 rounded-lg h-8 w-8 opacity-0 group-hover:opacity-100 transition-all border border-slate-200 hover:bg-slate-100"
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
                                        className="bg-rose-50 text-rose-500 rounded-lg h-8 w-8 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                        onClick={() => handleDelete(post.id)}
                                        title="Xóa bài"
                                    >
                                        <Trash size={16} />
                                    </Button>
                                )}
                            </div>
                        )
                    }
                ]}
                pagination={{
                    page,
                    totalPages,
                    totalItems,
                    limit,
                    onChange: setPage,
                    onLimitChange: (l) => {
                        setLimit(l);
                        setPage(1);
                    },
                    unitName: 'dự án'
                }}
            />
        </AdminLayout>
    );
}
