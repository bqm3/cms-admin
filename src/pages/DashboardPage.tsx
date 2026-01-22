import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import {
    Plus,
    Search,
    ExternalLink,
    Edit,
    Trash,
    CheckCircle,
    Clock,
    LogOut,
    Eye,
    Shield,
    Globe
} from 'lucide-react';
import api, { SERVER_URL } from '../services/api';

export function DashboardPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navigate = useNavigate();

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts/admin', {
                params: { search }
            });
            setPosts(response.data);
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
        fetchPosts();
    }, [search]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleApprove = async (id: number) => {
        try {
            await api.patch(`/posts/${id}/approve`);
            fetchPosts();
        } catch (err) {
            alert('Failed to approve');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/posts/${id}`);
            fetchPosts();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 text-slate-900 font-sans">
            <div className="max-w-7xl mx-auto">
                <nav className="flex justify-between items-center mb-12 bg-white px-8 py-5 rounded-[2rem] shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100">
                            <Shield className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight">
                                Control Center
                            </h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                {user.username} • {user.role}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {user.role === 'admin' && (
                            <>
                                <Button
                                    as={Link}
                                    to="/categories"
                                    variant="flat"
                                    className="bg-slate-100 text-slate-600 font-bold h-11 rounded-2xl"
                                >
                                    Categories
                                </Button>
                                <Button
                                    as={Link}
                                    to="/users"
                                    variant="flat"
                                    className="bg-slate-100 text-slate-600 font-bold h-11 rounded-2xl"
                                >
                                    Users
                                </Button>
                            </>
                        )}
                        <Button
                            as={Link}
                            to="/editor/new"
                            className="bg-indigo-600 text-white font-bold h-11 px-6 rounded-2xl shadow-xl shadow-indigo-100"
                            startContent={<Plus size={18} />}
                        >
                            Build New Site
                        </Button>
                        <Button
                            variant="flat"
                            className="bg-slate-100 text-slate-600 font-bold h-11 rounded-2xl"
                            onClick={handleLogout}
                            startContent={<LogOut size={18} />}
                        >
                            Log Out
                        </Button>
                    </div>
                </nav>

                <div className="mb-10 max-w-2xl">
                    <Input
                        placeholder="Search for projects, categories, or owners..."
                        variant="flat"
                        startContent={<Search className="text-slate-400" size={20} />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full"
                        classNames={{
                            inputWrapper: "bg-white border-none shadow-sm h-14 rounded-2xl px-6",
                            input: "placeholder:text-slate-400 font-medium",
                        }}
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
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
                                            <Button as={Link} to={`/site/${post.id}`} isIconOnly variant="solid" className="bg-white text-emerald-600 rounded-2xl shadow-xl">
                                                <ExternalLink size={20} />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-7">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-xl text-slate-800 truncate tracking-tight">{post.title}</h3>
                                            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs bg-slate-50 px-2 py-1 rounded-lg">
                                                <Eye size={14} className="text-indigo-500" /> {post.view_count}
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                                            {post.category?.name || 'Personal Project'}
                                        </p>

                                        <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                                            <Chip
                                                startContent={post.is_approved ? <CheckCircle size={14} /> : <Clock size={14} />}
                                                variant="flat"
                                                color={post.is_approved ? "success" : "warning"}
                                                className="rounded-xl px-2.5 h-7 font-bold text-[10px] uppercase border-none"
                                            >
                                                {post.is_approved ? 'Published' : 'Under Review'}
                                            </Chip>

                                            <div className="flex gap-2">
                                                {user.role === 'admin' && !post.is_approved && (
                                                    <Button size="sm" className="bg-emerald-50 text-emerald-600 font-bold rounded-xl" onClick={() => handleApprove(post.id)}>Approve</Button>
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
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Owner</p>
                                                    <p className="text-[11px] font-bold text-slate-400">{post.creator?.username || 'System'}</p>
                                                </div>
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-300 flex items-center gap-1 mt-1 uppercase">
                                                <Clock size={10} /> Created {new Date(post.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
