import { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Pagination } from "@heroui/pagination";
import { Plus, Trash, Edit, Tag, Image as ImageIcon, Link as LinkIcon, Upload, Search, Calendar } from 'lucide-react';
import api, { SERVER_URL } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';

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

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLimit(Number(e.target.value));
        setPage(1);
    };

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
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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
                        className="bg-amber-950 text-white font-black h-14 px-8 rounded-2xl shadow-xl shadow-indigo-100"
                        startContent={<Plus size={20} />}
                    >
                        Thêm danh mục
                    </Button>
                </div>

                {/* Search & Date Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm danh mục..."
                            className="h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 w-full shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 border border-slate-200 rounded-2xl shadow-sm w-full">
                        <Calendar size={18} className="text-slate-400" />
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Từ</span>
                            <input
                                type="date"
                                className="bg-transparent border-none outline-none text-sm font-bold text-slate-600 w-full"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setPage(1);
                                }}
                            />
                            <span className="text-[10px] font-black text-slate-400 uppercase">Đến</span>
                            <input
                                type="date"
                                className="bg-transparent border-none outline-none text-sm font-bold text-slate-600 w-full"
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
                                className="text-[10px] font-black text-rose-500 uppercase hover:text-rose-600 transition-colors"
                            >
                                Xóa
                            </button>
                        )}
                    </div>
                </div>
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
                                                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center overflow-hidden border border-amber-100/50 relative group/thumb">
                                                    {cat.image ? (
                                                        <img
                                                            src={cat.image.startsWith('/uploads/') ? `${SERVER_URL}${cat.image}` : cat.image}
                                                            alt={cat.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Tag size={20} className="text-amber-500" />
                                                    )}
                                                    {cat.image && (
                                                        <div
                                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                                            onClick={() => window.open(cat.image.startsWith('/uploads/') ? `${SERVER_URL}${cat.image}` : cat.image, '_blank')}
                                                        >
                                                            <Search size={14} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700">{cat.name}</p>
                                                    {cat.slug && (
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{cat.slug}</p>
                                                    )}
                                                </div>
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

                        {/* Footer với phân trang góc phải */}
                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Hiển thị:
                                </p>
                                <select
                                    className="bg-white border border-slate-200 rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer"
                                    value={limit}
                                    onChange={handleLimitChange}
                                >
                                    <option value={5}>5 mục</option>
                                    <option value={10}>10 mục</option>
                                    <option value={20}>20 mục</option>
                                    <option value={50}>50 mục</option>
                                </select>
                                <p className="text-xs font-bold text-slate-400 ml-2">
                                    Tổng số: {totalItems}
                                </p>
                            </div>

                            <div className="flex items-center">
                                <Pagination
                                    total={totalPages}
                                    page={page}
                                    onChange={(p) => setPage(p)}
                                    showControls
                                    color="warning"
                                    radius="sm"
                                    size="sm"
                                    classNames={{
                                        cursor: "bg-amber-500 shadow-lg shadow-amber-100",
                                    }}
                                />
                            </div>
                        </div>
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
                        <div className="space-y-6">
                            <Input
                                label="Tên danh mục"
                                placeholder="Ví dụ: Portfolio, Tin tức..."
                                variant="flat"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                            />

                            <div className="space-y-3">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Hình ảnh đại diện</p>
                                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                                    <button
                                        onClick={() => setImageType('upload')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${imageType === 'upload' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <Upload size={14} /> Tải ảnh lên
                                    </button>
                                    <button
                                        onClick={() => setImageType('link')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${imageType === 'link' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <LinkIcon size={14} /> Gắn link
                                    </button>
                                </div>

                                {imageType === 'upload' ? (
                                    <div className="space-y-4">
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
                                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all group"
                                            >
                                                {image ? (
                                                    <div className="relative w-full h-full p-2">
                                                        <img
                                                            src={URL.createObjectURL(image)}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover rounded-[1.5rem]"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] flex items-center justify-center">
                                                            <Upload className="text-white" size={24} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="bg-amber-50 p-4 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                                                            <Upload className="text-amber-500" size={24} />
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-500">Kéo thả hoặc click để chọn ảnh</p>
                                                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">PNG, JPG up to 5MB</p>
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
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                                        startContent={<LinkIcon size={16} className="text-slate-400" />}
                                    />
                                )}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={createModal.onClose} className="font-bold rounded-xl">Hủy</Button>
                        <Button
                            className="bg-amber-950 text-white font-black px-8 rounded-xl shadow-lg shadow-indigo-100"
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
                        <div className="space-y-6">
                            <Input
                                label="Tên danh mục"
                                variant="flat"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                            />

                            <div className="space-y-3">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Hình ảnh đại diện</p>
                                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                                    <button
                                        onClick={() => setEditImageType('upload')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${editImageType === 'upload' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <Upload size={14} /> Tải ảnh lên
                                    </button>
                                    <button
                                        onClick={() => setEditImageType('link')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${editImageType === 'link' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <LinkIcon size={14} /> Gắn link
                                    </button>
                                </div>

                                {editImageType === 'upload' ? (
                                    <div className="space-y-4">
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
                                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all group"
                                            >
                                                {editImage ? (
                                                    <div className="relative w-full h-full p-2">
                                                        <img
                                                            src={URL.createObjectURL(editImage)}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover rounded-[1.5rem]"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] flex items-center justify-center">
                                                            <Upload className="text-white" size={24} />
                                                        </div>
                                                    </div>
                                                ) : currentImageUrl && currentImageUrl.startsWith('/uploads/') ? (
                                                    <div className="relative w-full h-full p-2">
                                                        <img
                                                            src={`${SERVER_URL}${currentImageUrl}`}
                                                            alt="Current"
                                                            className="w-full h-full object-cover rounded-[1.5rem]"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] flex items-center justify-center">
                                                            <Upload className="text-white" size={24} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="bg-amber-50 p-4 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                                                            <Upload className="text-amber-500" size={24} />
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-500">Kéo thả hoặc click để chọn ảnh</p>
                                                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">PNG, JPG up to 5MB</p>
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
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                                        startContent={<LinkIcon size={16} className="text-slate-400" />}
                                    />
                                )}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={editModal.onClose} className="font-bold rounded-xl">Hủy</Button>
                        <Button
                            className="bg-amber-950 text-white font-black px-8 rounded-xl shadow-lg shadow-indigo-100"
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
