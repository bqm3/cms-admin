import { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Plus, Trash, Edit, Tag, Save, X } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';

export function CategoryManagementPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        try {
            await api.post('/categories', { name });
            setName('');
            alert('Thêm danh mục mới thành công! 🏷️');
            fetchCategories();
        } catch (err) {
            alert('Lỗi khi tạo danh mục');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa? Hành động này có thể ảnh hưởng đến các bài viết trong danh mục này.')) return;
        try {
            await api.delete(`/categories/${id}`);
            alert('Xóa danh mục thành công! 🗑️');
            fetchCategories();
        } catch (err) {
            alert('Lỗi khi xóa danh mục');
        }
    };

    const startEdit = (cat: any) => {
        setEditingId(cat.id);
        setEditName(cat.name);
    };

    const handleUpdate = async (id: number) => {
        try {
            await api.put(`/categories/${id}`, { name: editName });
            setEditingId(null);
            alert('Cập nhật danh mục thành công! ✨');
            fetchCategories();
        } catch (err) {
            alert('Lỗi khi cập nhật danh mục');
        }
    };

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-2xl shadow-lg shadow-amber-100">
                        <Tag className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quản lý danh mục</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">
                            Tổ chức cấu trúc nội dung của bạn
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleCreate} className="mb-10 flex gap-4">
                <Input
                    placeholder="Tên danh mục mới (ví dụ: Portfolio, Blog...)"
                    variant="flat"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    classNames={{
                        inputWrapper: "bg-white border-none shadow-sm h-14 rounded-2xl px-6 flex-1",
                        input: "font-bold text-slate-700"
                    }}
                />
                <Button
                    type="submit"
                    className="bg-indigo-600 text-white font-black h-14 px-8 rounded-2xl shadow-xl shadow-indigo-100"
                    startContent={<Plus size={20} />}
                >
                    Tạo mới
                </Button>
            </form>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {categories.map((cat) => (
                        <Card key={cat.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl">
                            <CardBody className="p-4 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                        <Tag size={18} className="text-slate-400" />
                                    </div>
                                    {editingId === cat.id ? (
                                        <Input
                                            variant="underlined"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="max-w-xs"
                                            autoFocus
                                        />
                                    ) : (
                                        <div>
                                            <p className="font-black text-slate-700">{cat.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {cat.id}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {editingId === cat.id ? (
                                        <>
                                            <Button isIconOnly variant="flat" className="bg-emerald-50 text-emerald-600 rounded-xl" onClick={() => handleUpdate(cat.id)}>
                                                <Save size={18} />
                                            </Button>
                                            <Button isIconOnly variant="flat" className="bg-slate-50 text-slate-600 rounded-xl" onClick={() => setEditingId(null)}>
                                                <X size={18} />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button isIconOnly variant="flat" className="bg-indigo-50 text-indigo-600 rounded-xl" onClick={() => startEdit(cat)}>
                                                <Edit size={18} />
                                            </Button>
                                            <Button isIconOnly variant="flat" className="bg-rose-50 text-rose-500 rounded-xl" onClick={() => handleDelete(cat.id)}>
                                                <Trash size={18} />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
