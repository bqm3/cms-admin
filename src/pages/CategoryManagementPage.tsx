import { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Plus, Trash, Edit, Tag, Search, Calendar, Upload, Link as LinkIcon } from 'lucide-react';
import api, { SERVER_URL } from '../services/api';
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
    const [image, setImage] = useState<File | null>(null);
    const [imageLink, setImageLink] = useState('');
    const [imageType, setImageType] = useState<'upload' | 'link'>('upload');

    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [editName, setEditName] = useState('');
    const [editImage, setEditImage] = useState<File | null>(null);
    const [editImageLink, setEditImageLink] = useState('');
    const [editImageType, setEditImageType] = useState<'upload' | 'link'>('upload');
    const [currentImageUrl, setCurrentImageUrl] = useState('');

    const navigate = useNavigate();

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Modal disclosures
    const createModal = useDisclosure();
    const editModal = useDisclosure();

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
    }, [page, limit, searchTerm, startDate, endDate]);

    const handleCreate = async () => {
        if (!name.trim()) return;
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (imageType === 'upload' && image) {
                formData.append('image', image);
            } else if (imageType === 'link' && imageLink) {
                formData.append('image', imageLink);
            }

            await api.post('/categories', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setName('');
            setImage(null);
            setImageLink('');
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
        setEditImage(null);
        setEditImageLink(cat.image && !cat.image.startsWith('/uploads/') ? cat.image : '');
        setEditImageType(cat.image && !cat.image.startsWith('/uploads/') ? 'link' : 'upload');
        setCurrentImageUrl(cat.image || '');
        editModal.onOpen();
    };

    const handleUpdate = async () => {
        if (!editingCategory) return;
        try {
            const formData = new FormData();
            formData.append('name', editName);
            if (editImageType === 'upload' && editImage) {
                formData.append('image', editImage);
            } else if (editImageType === 'link') {
                formData.append('image', editImageLink);
            }

            await api.put(`/categories/${editingCategory.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
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
                        <div className="bg-blue-600 p-3 rounded-lg shadow-blue-100 shadow-md">
                            <Tag className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Quản lý danh mục</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Tổ chức cấu trúc nội dung của bạn
                            </p>
                        </div>
                    </div>
                    <Button
                        onPress={createModal.onOpen}
                        className="bg-blue-600 text-white font-bold h-10 px-6 rounded-lg shadow-md shadow-blue-100"
                        startContent={<Plus size={18} />}
                    >
                        Thêm danh mục
                    </Button>
                </div>

                {/* Search & Date Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm danh mục..."
                            className="h-10 pl-11 pr-4 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-white px-4 h-10 border border-slate-200 rounded-lg shadow-sm w-full">
                        <Calendar size={16} className="text-slate-400" />
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase">Từ</span>
                            <input
                                type="date"
                                className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 w-full"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setPage(1);
                                }}
                            />
                            <span className="text-[9px] font-black text-slate-400 uppercase">Đến</span>
                            <input
                                type="date"
                                className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 w-full"
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
                                className="text-[9px] font-black text-rose-500 uppercase hover:text-rose-600 transition-colors"
                            >
                                Xóa
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
                        render: (cat) => <span className="text-[9px] font-bold text-slate-400 font-mono">#{cat.id}</span>
                    },
                    {
                        header: 'Tên danh mục',
                        render: (cat) => (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center overflow-hidden border border-blue-100/50 relative group/thumb">
                                    {cat.image ? (
                                        <img
                                            src={cat.image.startsWith('/uploads/') ? `${SERVER_URL}${cat.image}` : cat.image}
                                            alt={cat.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Tag size={16} className="text-blue-500" />
                                    )}
                                    {cat.image && (
                                        <div
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                            onClick={() => window.open(cat.image.startsWith('/uploads/') ? `${SERVER_URL}${cat.image}` : cat.image, '_blank')}
                                        >
                                            <Search size={12} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700 text-xs">{cat.name}</p>
                                    {cat.slug && (
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{cat.slug}</p>
                                    )}
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'Ngày tạo/cập nhật',
                        render: (cat) => (
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{formatDate(cat.created_at)}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{formatDate(cat.updated_at)}</p>
                            </div>
                        )
                    },
                    {
                        header: 'Hành động',
                        align: 'right',
                        render: (cat) => (
                            <div className="flex items-center justify-end gap-1.5">
                                <Button
                                    isIconOnly
                                    variant="flat"
                                    size="sm"
                                    className="bg-blue-50 text-blue-600 rounded h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onPress={() => startEdit(cat)}
                                >
                                    <Edit size={14} />
                                </Button>
                                <Button
                                    isIconOnly
                                    variant="flat"
                                    size="sm"
                                    className="bg-rose-50 text-rose-500 rounded h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onPress={() => handleDelete(cat.id)}
                                >
                                    <Trash size={14} />
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
                backdrop="blur"
                classNames={{
                    base: "rounded-xl bg-slate-50",
                    header: "border-b border-slate-100 p-6",
                    body: "p-6",
                    footer: "border-t border-slate-100 p-4"
                }}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Thêm danh mục mới</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tạo nhóm nội dung để quản lý bài viết</p>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <Input
                                label="Tên danh mục"
                                placeholder="Ví dụ: Portfolio, Tin tức..."
                                variant="flat"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                            />

                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Hình ảnh đại diện</p>
                                <div className="flex bg-white p-1 rounded-lg shadow-sm border border-slate-100">
                                    <button
                                        onClick={() => setImageType('upload')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold transition-all ${imageType === 'upload' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <Upload size={12} /> Tải ảnh lên
                                    </button>
                                    <button
                                        onClick={() => setImageType('link')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold transition-all ${imageType === 'link' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <LinkIcon size={12} /> Gắn link
                                    </button>
                                </div>

                                {imageType === 'upload' ? (
                                    <div className="space-y-3">
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                id="category-image-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => setImage(e.target.files?.[0] || null)}
                                            />
                                            <label
                                                htmlFor="category-image-upload"
                                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                                            >
                                                {image ? (
                                                    <div className="relative w-full h-full p-2">
                                                        <img
                                                            src={URL.createObjectURL(image)}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                            <Upload className="text-white" size={20} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="bg-blue-50 p-3 rounded-lg mb-2 group-hover:scale-110 transition-transform">
                                                            <Upload className="text-blue-500" size={20} />
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-500">Kéo thả hoặc click để chọn ảnh</p>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <Input
                                        label="URL Hình ảnh"
                                        placeholder="https://example.com/image.jpg"
                                        variant="flat"
                                        value={imageLink}
                                        onChange={(e) => setImageLink(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                                        startContent={<LinkIcon size={14} className="text-slate-400" />}
                                    />
                                )}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" size="sm" onPress={createModal.onClose} className="font-bold rounded-lg">Hủy</Button>
                        <Button
                            className="bg-blue-600 text-white font-bold size-sm px-6 rounded-lg shadow-md shadow-blue-100"
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
                    base: "rounded-xl bg-slate-50",
                    header: "border-b border-slate-100 p-6",
                    body: "p-6",
                    footer: "border-t border-slate-100 p-4"
                }}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Chỉnh sửa danh mục</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cập nhật thông tin cho danh mục</p>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <Input
                                label="Tên danh mục"
                                variant="flat"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                            />

                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Hình ảnh đại diện</p>
                                <div className="flex bg-white p-1 rounded-lg shadow-sm border border-slate-100">
                                    <button
                                        onClick={() => setEditImageType('upload')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold transition-all ${editImageType === 'upload' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <Upload size={12} /> Tải ảnh lên
                                    </button>
                                    <button
                                        onClick={() => setEditImageType('link')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold transition-all ${editImageType === 'link' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <LinkIcon size={12} /> Gắn link
                                    </button>
                                </div>

                                {editImageType === 'upload' ? (
                                    <div className="space-y-3">
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                id="edit-category-image-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                                            />
                                            <label
                                                htmlFor="edit-category-image-upload"
                                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                                            >
                                                {editImage ? (
                                                    <div className="relative w-full h-full p-2">
                                                        <img
                                                            src={URL.createObjectURL(editImage)}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                            <Upload className="text-white" size={20} />
                                                        </div>
                                                    </div>
                                                ) : currentImageUrl && currentImageUrl.startsWith('/uploads/') ? (
                                                    <div className="relative w-full h-full p-2">
                                                        <img
                                                            src={`${SERVER_URL}${currentImageUrl}`}
                                                            alt="Current"
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                            <Upload className="text-white" size={20} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="bg-blue-50 p-3 rounded-lg mb-2 group-hover:scale-110 transition-transform">
                                                            <Upload className="text-blue-500" size={20} />
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-500">Kéo thả hoặc click để chọn ảnh</p>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <Input
                                        label="URL Hình ảnh"
                                        placeholder="https://example.com/image.jpg"
                                        variant="flat"
                                        value={editImageLink}
                                        onChange={(e) => setEditImageLink(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                                        startContent={<LinkIcon size={14} className="text-slate-400" />}
                                    />
                                )}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" size="sm" onPress={editModal.onClose} className="font-bold rounded-lg">Hủy</Button>
                        <Button
                            className="bg-blue-600 text-white font-bold size-sm px-6 rounded-lg shadow-md shadow-blue-100"
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
