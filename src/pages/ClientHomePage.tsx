import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Eye, Clock, ArrowUpDown, Layout } from 'lucide-react';
import api, { SERVER_URL } from '../services/api';

export function ClientHomePage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [sort, setSort] = useState('sequence_number:ASC');
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts/public', {
                params: { sort }
            });
            setPosts(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [sort]);

    const toggleSort = () => {
        setSort(prev => prev === 'view_count:DESC' ? 'sequence_number:ASC' : 'view_count:DESC');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 p-3 rounded-2xl shadow-indigo-200 shadow-lg">
                            <Layout className="text-white" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                WebShowcase
                            </h1>
                            <p className="text-slate-500 font-medium">Explore premium websites built by our community.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="flat"
                            className="bg-slate-100 text-slate-700 font-bold"
                            onClick={toggleSort}
                            startContent={<ArrowUpDown size={18} />}
                        >
                            Sort by: {sort === 'view_count:DESC' ? 'Popularity' : 'Order'}
                        </Button>
                        <Button as={Link} to="/login" variant="solid" className="bg-indigo-600 text-white font-bold shadow-indigo-100 shadow-xl">Admin Portal</Button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-medium tracking-wide">Fetching amazing sites...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {posts.map((post) => (
                            <Link to={`/site/${post.id}`} key={post.id} className="block group">
                                <Card className="bg-white border-transparent hover:border-indigo-500/30 transition-all duration-500 overflow-hidden shadow-md hover:shadow-2xl rounded-[2rem]">
                                    <CardBody className="p-0">
                                        <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                                            {post.logo ? (
                                                <img
                                                    src={`${SERVER_URL}${post.logo}`}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300 font-black text-2xl uppercase italic">
                                                    {post.title.substring(0, 2)}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                            <div className="absolute top-4 right-4 shadow-xl">
                                                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-slate-900 text-xs font-bold border border-white">
                                                    <Eye size={14} className="text-indigo-600" /> {post.view_count}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
                                                    {post.category?.name || 'Project'}
                                                </span>
                                                <span className="text-slate-300 text-[10px]">•</span>
                                                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                    <Clock size={12} /> {new Date(post.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors leading-tight">{post.title}</h3>
                                            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">Built by {post.creator?.username || 'Community Expert'}</p>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
