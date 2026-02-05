import { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Plus, Trash, Edit, Tag, Search, Calendar, Layers } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { formatDate } from "../utils/formatDate";
import { DataTable } from '../components/Common/DataTable';

export function CategoryManagementPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [name, setName] = useState('');
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [editName, setEditName] = useState('');
    const [parentId, setParentId] = useState<string>('');
    const [editParentId, setEditParentId] = useState<string>('');
    const [sequenceNumber, setSequenceNumber] = useState('0');
    const [editSequenceNumber, setEditSequenceNumber] = useState('0');
    const [parentCategories, setParentCategories] = useState<any[]>([]);

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
        try {
            const response = await api.get('/parent-categories');
            setParentCategories(response.data.parentCategories || response.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/categories`, {
                params: {
                    page,
                    limit,
                    search: searchTerm,
                    startDate,
                    endDate
                }
            });
            if (response.data.categories) {
                setCategories(response.data.categories);
                setTotalPages(response.data.totalPages);
                setTotalItems(response.data.total);
            } else {
                setCategories(response.data);
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
        fetchCategories();
        fetchParentCategories();
    }, [page, limit, searchTerm, startDate, endDate]);

    const handleCreate = async () => {
        if (!name.trim()) return;
        try {
            await api.post('/categories', { 
                name, 
                parent_id: parentId || null,
                sequence_number: parseInt(sequenceNumber) || 0
            });
            setName('');
            setParentId('');
            setSequenceNumber('0');
            createModal.onClose();
            alert('Thêm danh mục mới thành công! 🏷️');
            if (page === 1) fetchCategories(); else setPage(1);
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
        setEditParentId(cat.parent_id ? String(cat.parent_id) : '');
        setEditSequenceNumber(cat.sequence_number ? String(cat.sequence_number) : '0');
        editModal.onOpen();
    };

    const handleUpdate = async () => {
        if (!editingCategory) return;
        try {
            await api.put(`/categories/${editingCategory.id}`, { 
                name: editName, 
                parent_id: editParentId || null,
                sequence_number: parseInt(editSequenceNumber) || 0
            });
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
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-3 rounded-xl shadow-blue-100 shadow-lg">
                            <Tag className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý danh mục</h1>
                            <p className="text-sm font-medium text-slate-400">
                                Tổ chức cấu trúc nội dung của bạn
                            </p>
                        </div>
                    </div>
                    <Button
                        onPress={createModal.onOpen}
                        className="bg-blue-600 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-blue-100"
                        startContent={<Plus size={18} />}
                    >
                        Thêm danh mục
                    </Button>
                </div>

                {/* Search & Date Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm danh mục..."
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
                data={categories}
                loading={loading}
                columns={[
                    {
                        header: 'ID',
                        render: (cat) => <span className="text-xs font-bold text-slate-400 font-mono">#{cat.id}</span>
                    },
                    {
                        header: 'Tên danh mục',
                        render: (cat) => (
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                                    <Tag size={16} className="text-blue-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{cat.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {cat.parent && (
                                            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded text-[9px] font-bold uppercase tracking-wider">
                                                {cat.parent.name}
                                            </span>
                                        )}
                                        <p className="text-xs font-medium text-slate-400 font-mono">{cat.slug}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'Số thứ tự',
                        render: (cat) => <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{cat.sequence_number || 0}</span>
                    },
                    {
                        header: 'Ngày cập nhật',
                        render: (cat) => (
                            <div className="flex flex-col gap-0.5">
                                <p className="text-xs font-semibold text-slate-600">{formatDate(cat.updated_at)}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tạo: {formatDate(cat.created_at)}</p>
                            </div>
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
                                    className="bg-blue-50 text-blue-600 rounded-lg h-8 w-8 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-100"
                                    onPress={() => startEdit(cat)}
                                >
                                    <Edit size={16} />
                                </Button>
                                <Button
                                    isIconOnly
                                    variant="flat"
                                    size="sm"
                                    className="bg-rose-50 text-rose-500 rounded-lg h-8 w-8 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
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

            {/* Create Category Modal */}
            <Modal
                isOpen={createModal.isOpen}
                onClose={createModal.onClose}
                hideCloseButton
                isDismissable={false}
                isKeyboardDismissDisabled={true}
                backdrop="blur"
                classNames={{
                    base: "rounded-2xl bg-slate-50",
                    header: "border-b border-slate-100 p-6",
                    body: "p-6",
                    footer: "border-t border-slate-100 p-4"
                }}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Thêm danh mục mới</h2>
                        <p className="text-xs font-medium text-slate-400">Tạo nhóm nội dung để quản lý bài viết</p>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <Input
                                label="Tên danh mục"
                                placeholder="Ví dụ: Portfolio, Tin tức..."
                                variant="flat"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                classNames={{ inputWrapper: "bg-white shadow-sm rounded-xl h-12" }}
                            />
                            <Input
                                type="number"
                                label="Thứ tự hiển thị (STT)"
                                placeholder="Số nhỏ hiện trước"
                                variant="flat"
                                value={sequenceNumber}
                                onChange={(e) => setSequenceNumber(e.target.value)}
                                classNames={{ inputWrapper: "bg-white shadow-sm rounded-xl h-12" }}
                            />
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">Danh mục cha</label>
                                <select
                                    className="w-full h-12 px-4 bg-white border-none shadow-sm rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    value={parentId}
                                    onChange={(e) => setParentId(e.target.value)}
                                >
                                    <option value="">Không có danh mục cha</option>
                                    {parentCategories.map(pc => (
                                        <option key={pc.id} value={pc.id}>{pc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" size="sm" onPress={createModal.onClose} className="font-bold rounded-xl h-10 px-6">Hủy</Button>
                        <Button
                            className="bg-blue-600 text-white font-bold h-10 px-8 rounded-xl shadow-lg shadow-blue-100"
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
                hideCloseButton
                isDismissable={false}
                isKeyboardDismissDisabled={true}
                backdrop="blur"
                classNames={{
                    base: "rounded-2xl bg-slate-50",
                    header: "border-b border-slate-100 p-6",
                    body: "p-6",
                    footer: "border-t border-slate-100 p-4"
                }}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Chỉnh sửa danh mục</h2>
                        <p className="text-xs font-medium text-slate-400">Cập nhật thông tin cho danh mục</p>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <Input
                                label="Tên danh mục"
                                variant="flat"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                classNames={{ inputWrapper: "bg-white shadow-sm rounded-xl h-12" }}
                            />
                            <Input
                                type="number"
                                label="Thứ tự hiển thị (STT)"
                                variant="flat"
                                value={editSequenceNumber}
                                onChange={(e) => setEditSequenceNumber(e.target.value)}
                                classNames={{ inputWrapper: "bg-white shadow-sm rounded-xl h-12" }}
                            />
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">Danh mục cha</label>
                                <select
                                    className="w-full h-12 px-4 bg-white border-none shadow-sm rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    value={editParentId}
                                    onChange={(e) => setEditParentId(e.target.value)}
                                >
                                    <option value="">Không có danh mục cha</option>
                                    {parentCategories.map(pc => (
                                        <option key={pc.id} value={pc.id}>{pc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" size="sm" onPress={editModal.onClose} className="font-bold rounded-xl h-10 px-6">Hủy</Button>
                        <Button
                            className="bg-blue-600 text-white font-bold h-10 px-8 rounded-xl shadow-lg shadow-blue-100"
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
