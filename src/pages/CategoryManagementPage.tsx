import { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Pagination } from "@heroui/pagination";
import { Plus, Trash, Edit, Tag, Save, X } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';

export function CategoryManagementPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [editName, setEditName] = useState('');
    const navigate = useNavigate();

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    // Modal disclosures
    const createModal = useDisclosure();
    const editModal = useDisclosure();

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/categories?page=${page}&limit=${limit}`);
            // Check if response is paginated or not
            if (response.data.categories) {
                setCategories(response.data.categories);
                setTotalPages(response.data.totalPages);
            } else {
                setCategories(response.data);
                setTotalPages(1);
            }
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
    }, [page]);

    const handleCreate = async () => {
        if (!name.trim()) return;
        try {
            await api.post('/categories', { name });
            setName('');
            createModal.onClose();
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
        setEditingCategory(cat);
        setEditName(cat.name);
        editModal.onOpen();
    };

    const handleUpdate = async () => {
        if (!editingCategory) return;
        try {
            await api.put(`/categories/${editingCategory.id}`, { name: editName });
            editModal.onClose();
            alert('Cập nhật danh mục thành công! ✨');
            fetchCategories();
        } catch (err) {
            alert('Lỗi khi cập nhật danh mục');
        }
    };

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
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
                <Button
                    onPress={createModal.onOpen}
                    className="bg-indigo-600 text-white font-black h-14 px-8 rounded-2xl shadow-xl shadow-indigo-100"
                    startContent={<Plus size={20} />}
                >
                    Thêm danh mục
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">ID</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Tên danh mục</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <span className="text-[10px] font-bold text-slate-400 font-mono">#{cat.id}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                                    <Tag size={16} className="text-amber-500" />
                                                </div>
                                                <p className="font-bold text-slate-700">{cat.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    isIconOnly
                                                    variant="flat"
                                                    size="sm"
                                                    className="bg-indigo-50 text-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onPress={() => startEdit(cat)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    isIconOnly
                                                    variant="flat"
                                                    size="sm"
                                                    className="bg-rose-50 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onPress={() => handleDelete(cat.id)}
                                                >
                                                    <Trash size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center pt-4">
                        <Pagination
                            total={totalPages}
                            page={page}
                            onChange={(p) => setPage(p)}
                            showControls
                            color="warning"
                            radius="sm"
                            classNames={{
                                cursor: "bg-amber-500 shadow-lg shadow-amber-100",
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Create Category Modal */}
            <Modal
                isOpen={createModal.isOpen}
                onClose={createModal.onClose}
                backdrop="blur"
                classNames={{
                    base: "rounded-[2rem] bg-slate-50",
                    header: "border-b border-slate-100 p-8",
                    body: "p-8",
                    footer: "border-t border-slate-100 p-6"
                }}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Thêm danh mục mới</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tạo nhóm nội dung để quản lý bài viết</p>
                    </ModalHeader>
                    <ModalBody>
                        <Input
                            label="Tên danh mục"
                            placeholder="Ví dụ: Portfolio, Tin tức..."
                            variant="flat"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={createModal.onClose} className="font-bold rounded-xl">Hủy</Button>
                        <Button
                            className="bg-indigo-600 text-white font-black px-8 rounded-xl shadow-lg shadow-indigo-100"
                            onPress={handleCreate}
                        >
                            Tạo mới
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit Category Modal */}
            <Modal
                isOpen={editModal.isOpen}
                onClose={editModal.onClose}
                backdrop="blur"
                classNames={{
                    base: "rounded-[2rem] bg-slate-50",
                    header: "border-b border-slate-100 p-8",
                    body: "p-8",
                    footer: "border-t border-slate-100 p-6"
                }}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Chỉnh sửa danh mục</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cập nhật thông tin cho danh mục</p>
                    </ModalHeader>
                    <ModalBody>
                        <Input
                            label="Tên danh mục"
                            variant="flat"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={editModal.onClose} className="font-bold rounded-xl">Hủy</Button>
                        <Button
                            className="bg-indigo-600 text-white font-black px-8 rounded-xl shadow-lg shadow-indigo-100"
                            onPress={handleUpdate}
                        >
                            Lưu thay đổi
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </AdminLayout>
    );
}
