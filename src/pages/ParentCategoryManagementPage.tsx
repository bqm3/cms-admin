import { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Plus, Trash, Edit, Layers, Search, Calendar } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { formatDate } from "../utils/formatDate";
import { DataTable } from '../components/Common/DataTable';

export function ParentCategoryManagementPage() {
    const [parentCategories, setParentCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [editName, setEditName] = useState('');
    const [editSlug, setEditSlug] = useState('');

    const navigate = useNavigate();

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Modal disclosures
    const createModal = useDisclosure();
    const editModal = useDisclosure();

    const fetchParentCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/parent-categories`, {
                params: {
                    page,
                    limit,
                    search: searchTerm,
                    startDate,
                    endDate
                }
            });
            if (response.data.parentCategories) {
                setParentCategories(response.data.parentCategories);
                setTotalPages(response.data.totalPages);
                setTotalItems(response.data.total);
            } else {
                setParentCategories(response.data);
                setTotalPages(1);
                setTotalItems(response.data.length);
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
        fetchParentCategories();
    }, [page, limit, searchTerm, startDate, endDate]);

    const handleCreate = async () => {
        if (!name.trim()) return;
        try {
            await api.post('/parent-categories', { name, slug });
            setName('');
            setSlug('');
            createModal.onClose();
            alert('Thêm danh mục cha mới thành công! 📁');
            if (page === 1) fetchParentCategories(); else setPage(1);
        } catch (err) {
            alert('Lỗi khi tạo danh mục cha');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục cha này?')) return;
        try {
            await api.delete(`/parent-categories/${id}`);
            alert('Xóa danh mục cha thành công! 🗑️');
            fetchParentCategories();
        } catch (err) {
            alert('Lỗi khi xóa danh mục cha');
        }
    };

    const startEdit = (cat: any) => {
        setEditingCategory(cat);
        setEditName(cat.name);
        setEditSlug(cat.slug || '');
        editModal.onOpen();
    };

    const handleUpdate = async () => {
        if (!editingCategory) return;
        try {
            await api.put(`/parent-categories/${editingCategory.id}`, { name: editName, slug: editSlug });
            editModal.onClose();
            alert('Cập nhật danh mục cha thành công! ✨');
            fetchParentCategories();
        } catch (err) {
            alert('Lỗi khi cập nhật danh mục cha');
        }
    };

    return (
        <AdminLayout>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-3 rounded-xl shadow-blue-100 shadow-lg">
                            <Layers className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý danh mục cha</h1>
                            <p className="text-sm font-medium text-slate-400">
                                Cấu trúc tầng 1 cho hệ thống danh mục
                            </p>
                        </div>
                    </div>
                    <Button
                        onPress={createModal.onOpen}
                        className="bg-blue-600 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-blue-100"
                        startContent={<Plus size={18} />}
                    >
                        Thêm danh mục cha
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm danh mục cha..."
                            className="h-11 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-white px-4 h-11 border border-slate-200 rounded-xl shadow-sm w-full">
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
                        {(searchTerm || startDate || endDate) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStartDate('');
                                    setEndDate('');
                                    setPage(1);
                                }}
                                className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors px-3 py-1 bg-rose-50 rounded-lg border border-rose-100 whitespace-nowrap"
                            >
                                Xóa tất cả lọc
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <DataTable
                data={parentCategories}
                loading={loading}
                columns={[
                    {
                        header: 'ID',
                        render: (cat) => <span className="text-xs font-bold text-slate-400 font-mono">#{cat.id}</span>
                    },
                    {
                        header: 'Tên danh mục cha',
                        render: (cat) => (
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                                    <Layers size={16} className="text-blue-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-800 text-sm">{cat.name}</p>
                                    <p className="text-xs font-medium text-slate-400 mt-0.5 font-mono">{cat.slug || 'N/A'}</p>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'Danh mục con',
                        render: (cat) => (
                            <div className="flex flex-wrap gap-1">
                                {cat.subcategories?.length > 0 ? (
                                    cat.subcategories.map((sub: any) => (
                                        <span key={sub.id} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                            {sub.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-slate-400 italic">Trống</span>
                                )}
                            </div>
                        )
                    },
                    {
                        header: 'Ngày tạo',
                        render: (cat) => (
                            <p className="text-xs font-semibold text-slate-600">{formatDate(cat.created_at)}</p>
                        )
                    },
                    {
                        header: 'Hành động',
                        align: 'right',
                        render: (cat) => (
                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    isIconOnly
                                    variant="flat"
                                    size="sm"
                                    className="bg-blue-50 text-blue-600 rounded-lg h-8 w-8 transition-all hover:bg-blue-100"
                                    onPress={() => startEdit(cat)}
                                >
                                    <Edit size={16} />
                                </Button>
                                <Button
                                    isIconOnly
                                    variant="flat"
                                    size="sm"
                                    className="bg-rose-50 text-rose-500 rounded-lg h-8 w-8 transition-all hover:bg-rose-500 hover:text-white"
                                    onPress={() => handleDelete(cat.id)}
                                >
                                    <Trash size={16} />
                                </Button>
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
                    unitName: 'mục'
                }}
            />

            {/* Create Modal */}
            <Modal isOpen={createModal.isOpen} onClose={createModal.onClose} backdrop="blur">
                <ModalContent>
                    <ModalHeader>Thêm danh mục cha mới</ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <Input label="Tên danh mục" variant="flat" value={name} onChange={(e) => setName(e.target.value)} />
                            <Input label="Slug (Không bắt buộc)" variant="flat" value={slug} onChange={(e) => setSlug(e.target.value)} />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={createModal.onClose}>Hủy</Button>
                        <Button className="bg-blue-600 text-white font-bold" onPress={handleCreate}>Tạo mới</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={editModal.isOpen} onClose={editModal.onClose} backdrop="blur">
                <ModalContent>
                    <ModalHeader>Chỉnh sửa danh mục cha</ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <Input label="Tên danh mục" variant="flat" value={editName} onChange={(e) => setEditName(e.target.value)} />
                            <Input label="Slug" variant="flat" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={editModal.onClose}>Hủy</Button>
                        <Button className="bg-blue-600 text-white font-bold" onPress={handleUpdate}>Lưu thay đổi</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </AdminLayout>
    );
}
