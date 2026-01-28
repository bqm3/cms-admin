import { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Plus, Trash, Image as ImageIcon, Link as LinkIcon, Upload, Search, Copy, Check, Calendar, Tag, Layers, Settings2, Edit } from 'lucide-react';
import api, { SERVER_URL } from '../services/api';
import { AdminLayout } from '../layouts/AdminLayout';
import { formatDate } from "../utils/formatDate";
import { DataTable } from '../components/Common/DataTable';

export function MediaManagementPage() {
    const [media, setMedia] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [mediaTypes, setMediaTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterMediaType, setFilterMediaType] = useState('');
    const [copiedId, setCopiedId] = useState<number | null>(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Add Media Form state
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploadType, setUploadType] = useState<'upload' | 'link'>('upload');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedMediaType, setSelectedMediaType] = useState('');

    // Media Type Management state
    const [newMediaTypeName, setNewMediaTypeName] = useState('');
    const [editingMediaType, setEditingMediaType] = useState<any>(null);
    const [editMediaTypeName, setEditMediaTypeName] = useState('');

    const mediaModal = useDisclosure();
    const typeManagementModal = useDisclosure();

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(Array.isArray(res.data) ? res.data : (res.data.categories || []));
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchMediaTypes = async () => {
        try {
            const res = await api.get('/media-types');
            setMediaTypes(res.data || []);
        } catch (err) {
            console.error('Error fetching media types:', err);
        }
    };

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/media`, {
                params: {
                    page,
                    limit,
                    search: searchTerm,
                    startDate,
                    endDate,
                    category_id: filterCategory,
                    media_type_id: filterMediaType
                }
            });
            if (response.data.media) {
                setMedia(response.data.media);
                setTotalPages(response.data.totalPages);
                setTotalItems(response.data.total);
            } else {
                setMedia(response.data);
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
        fetchCategories();
        fetchMediaTypes();
    }, []);

    useEffect(() => {
        fetchMedia();
    }, [page, limit, searchTerm, startDate, endDate, filterCategory, filterMediaType]);

    const handleCreateMedia = async () => {
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (selectedMediaType) formData.append('media_type_id', selectedMediaType);
            if (selectedCategory) formData.append('category_id', selectedCategory);

            if (uploadType === 'upload' && file) {
                formData.append('file', file);
            } else if (uploadType === 'link' && url) {
                formData.append('url', url);
            }

            await api.post('/media', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setName('');
            setUrl('');
            setFile(null);
            setSelectedCategory('');
            setSelectedMediaType('');
            mediaModal.onClose();
            alert('Thêm ảnh thành công! 🖼️');
            if (page === 1) fetchMedia(); else setPage(1);
        } catch (err) {
            alert('Lỗi khi thêm ảnh');
        }
    };

    const handleDeleteMedia = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return;
        try {
            await api.delete(`/media/${id}`);
            alert('Xóa thành công! 🗑️');
            fetchMedia();
        } catch (err) {
            alert('Lỗi khi xóa ảnh');
        }
    };

    // Media Type CRUD
    const handleCreateType = async () => {
        if (!newMediaTypeName.trim()) return;
        try {
            await api.post('/media-types', { name: newMediaTypeName });
            setNewMediaTypeName('');
            fetchMediaTypes();
        } catch (err) {
            alert('Lỗi khi tạo loại ảnh');
        }
    };

    const handleUpdateType = async () => {
        if (!editingMediaType || !editMediaTypeName.trim()) return;
        try {
            await api.put(`/media-types/${editingMediaType.id}`, { name: editMediaTypeName });
            setEditingMediaType(null);
            setEditMediaTypeName('');
            fetchMediaTypes();
            fetchMedia(); // Refresh list to show updated names
        } catch (err) {
            alert('Lỗi khi cập nhật');
        }
    };

    const handleDeleteType = async (id: number) => {
        if (!window.confirm('Xóa loại ảnh này có thể ảnh hưởng đến dữ liệu đang sử dụng. Bạn chắc chắn chứ?')) return;
        try {
            await api.delete(`/media-types/${id}`);
            fetchMediaTypes();
            fetchMedia();
        } catch (err) {
            alert('Lỗi khi xóa loại ảnh');
        }
    };

    const copyToClipboard = (text: string, id: number) => {
        const fullUrl = text.startsWith('/uploads/') ? `${SERVER_URL}${text}` : text;
        navigator.clipboard.writeText(fullUrl);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <AdminLayout>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-3 rounded-xl shadow-blue-100 shadow-lg">
                            <ImageIcon className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Thư viện ảnh</h1>
                            <p className="text-sm font-medium text-slate-400">
                                Quản lý tài nguyên hình ảnh của bạn
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onPress={typeManagementModal.onOpen}
                            variant="flat"
                            className="bg-slate-100 text-slate-600 font-bold h-11 px-5 rounded-xl border border-slate-200"
                            startContent={<Settings2 size={18} />}
                        >
                            Quản lý loại
                        </Button>
                        <Button
                            onPress={mediaModal.onOpen}
                            className="bg-blue-600 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-blue-100"
                            startContent={<Plus size={18} />}
                        >
                            Thêm ảnh
                        </Button>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative group md:col-span-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm ảnh..."
                                className="h-11 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full shadow-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-white px-4 h-11 border border-slate-200 rounded-xl shadow-sm md:col-span-2">
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
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm min-w-[200px]">
                            <Tag size={16} className="text-slate-400" />
                            <select
                                className="bg-transparent outline-none text-xs font-bold text-slate-600 w-full cursor-pointer uppercase tracking-wider"
                                value={filterCategory}
                                onChange={(e) => {
                                    setFilterCategory(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm min-w-[160px]">
                            <Layers size={16} className="text-slate-400" />
                            <select
                                className="bg-transparent outline-none text-xs font-bold text-slate-600 w-full cursor-pointer uppercase tracking-wider"
                                value={filterMediaType}
                                onChange={(e) => {
                                    setFilterMediaType(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">Tất cả loại</option>
                                {mediaTypes.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        {(searchTerm || startDate || endDate || filterCategory || filterMediaType) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStartDate('');
                                    setEndDate('');
                                    setFilterCategory('');
                                    setFilterMediaType('');
                                    setPage(1);
                                }}
                                className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors px-3 py-2 bg-rose-50 rounded-xl border border-rose-100"
                            >
                                Xóa tất cả bộ lọc
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <DataTable
                data={media}
                loading={loading}
                minWidth="1000px"
                columns={[
                    {
                        header: 'Ảnh',
                        render: (m) => (
                            <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 shadow-sm relative group/thumb">
                                <img
                                    src={m.url.startsWith('/uploads/') ? `${SERVER_URL}${m.url}` : m.url}
                                    alt={m.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                                />
                                <div
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    onClick={() => window.open(m.url.startsWith('/uploads/') ? `${SERVER_URL}${m.url}` : m.url, '_blank')}
                                >
                                    <Search size={18} className="text-white" />
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'Thông tin ảnh',
                        render: (m) => (
                            <div className="flex flex-col gap-1 max-w-xs">
                                <p className="font-bold text-slate-800 truncate text-sm">{m.name}</p>
                                <div className="flex items-center gap-2 group/link cursor-pointer hover:text-blue-600 transition-colors" onClick={() => copyToClipboard(m.url, m.id)}>
                                    <p className="text-xs text-slate-400 truncate flex-1 font-mono">{m.url}</p>
                                    {copiedId === m.id ? (
                                        <Check size={12} className="text-emerald-500 shrink-0" />
                                    ) : (
                                        <Copy size={12} className="text-slate-300 group-hover/link:text-blue-500 shrink-0 transition-colors" />
                                    )}
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'Danh mục',
                        render: (m) => (
                            <div className="flex items-center gap-2">
                                {m.category ? (
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                                        {m.category.name}
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-slate-300 italic">N/A</span>
                                )}
                            </div>
                        )
                    },
                    {
                        header: 'Loại ảnh',
                        render: (m) => (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-200">
                                {m.mediaType?.name || 'Khác'}
                            </span>
                        )
                    },
                    {
                        header: 'Nguồn',
                        render: (m) => (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${m.source_type === 'upload'
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                {m.source_type === 'upload' ? 'Upload' : 'Link'}
                            </span>
                        )
                    },
                    {
                        header: 'Ngày tạo',
                        render: (m) => (
                            <span className="text-sm font-medium text-slate-500">{formatDate(m.created_at)}</span>
                        )
                    },
                    {
                        header: 'Hành động',
                        align: 'right',
                        render: (m) => (
                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    isIconOnly
                                    variant="flat"
                                    size="sm"
                                    className="bg-rose-50 text-rose-500 rounded-lg h-9 w-9 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                    onPress={() => handleDeleteMedia(m.id)}
                                >
                                    <Trash size={18} />
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
                    unitName: 'ảnh'
                }}
            />

            {/* Add Media Modal */}
            <Modal size="xl" isOpen={mediaModal.isOpen} onClose={mediaModal.onClose} backdrop="blur" classNames={{ base: "rounded-2xl bg-slate-50", header: "border-b border-slate-100 p-6", body: "p-6", footer: "border-t border-slate-100 p-4" }}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Thêm ảnh vào thư viện</h2>
                        <p className="text-xs font-medium text-slate-400">Lưu trữ ảnh để tái sử dụng</p>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-5">
                            <Input
                                label="Tên gợi nhớ"
                                placeholder="Ví dụ: Banner trang chủ, Icon dịch vụ..."
                                variant="flat"
                                isRequired
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                classNames={{ inputWrapper: "bg-white shadow-sm rounded-xl h-12" }}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Danh mục</label>
                                    <select
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm cursor-pointer"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Loại ảnh</label>
                                    <select
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm cursor-pointer"
                                        value={selectedMediaType}
                                        onChange={(e) => setSelectedMediaType(e.target.value)}
                                    >
                                        <option value="">Chọn loại ảnh</option>
                                        {mediaTypes.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                                    <button
                                        onClick={() => setUploadType('upload')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${uploadType === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <Upload size={14} /> Tải lên
                                    </button>
                                    <button
                                        onClick={() => setUploadType('link')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${uploadType === 'link' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <LinkIcon size={14} /> Nhập Link
                                    </button>
                                </div>

                                {uploadType === 'upload' ? (
                                    <div className="relative group">
                                        <input
                                            type="file" id="media-upload"
                                            className="hidden" accept="image/*"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                        <label htmlFor="media-upload" className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-200 rounded-2xl bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group lg:p-4">
                                            {file ? (
                                                <div className="relative w-full h-full">
                                                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                                        <ImageIcon className="text-white" size={24} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="bg-blue-50 p-4 rounded-xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
                                                        <Upload className="text-blue-600" size={24} />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-500">Click hoặc kéo thả ảnh</p>
                                                    <p className="text-xs text-slate-400 mt-1">Hỗ trợ PNG, JPG, WEBP tối đa 10MB</p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                ) : (
                                    <Input
                                        label="URL hình ảnh"
                                        placeholder="https://..."
                                        variant="flat"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-xl h-12" }}
                                    />
                                )}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" size="sm" onPress={mediaModal.onClose} className="font-bold rounded-xl h-10 px-6">Hủy</Button>
                        <Button className="bg-blue-600 text-white font-bold h-10 px-8 rounded-xl shadow-lg shadow-blue-100" size="sm" onPress={handleCreateMedia}>Hoàn tất</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Manage Media Types Modal */}
            <Modal size="lg" isOpen={typeManagementModal.isOpen} onClose={typeManagementModal.onClose} backdrop="blur" classNames={{ base: "rounded-2xl bg-slate-50", header: "border-b border-slate-100 p-6", body: "p-0", footer: "border-t border-slate-100 p-4" }}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Quản lý loại ảnh</h2>
                        <p className="text-xs font-medium text-slate-400">Thêm hoặc chỉnh sửa các mục đích sử dụng ảnh</p>
                    </ModalHeader>
                    <ModalBody>
                        <div className="p-6 space-y-4">
                            {/* Fast Add Form */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Tên loại mới (VD: Banner Mobile...)"
                                    variant="flat"
                                    value={newMediaTypeName}
                                    onChange={(e) => setNewMediaTypeName(e.target.value)}
                                    classNames={{ inputWrapper: "bg-white shadow-sm rounded-xl h-11" }}
                                />
                                <Button
                                    onPress={handleCreateType}
                                    className="bg-blue-600 text-white font-bold h-11 px-4 rounded-xl flex-shrink-0"
                                >
                                    Thêm
                                </Button>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px] max-h-[400px] overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/80 sticky top-0 z-10 border-b border-slate-100">
                                        <tr>
                                            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tên loại</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {mediaTypes.length === 0 ? (
                                            <tr>
                                                <td colSpan={2} className="px-4 py-10 text-center text-slate-400 text-sm italic">Chưa có loại ảnh nào</td>
                                            </tr>
                                        ) : mediaTypes.map((type) => (
                                            <tr key={type.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-4 py-3">
                                                    {editingMediaType?.id === type.id ? (
                                                        <input
                                                            autoFocus
                                                            className="text-sm font-bold text-slate-700 w-full bg-slate-100 rounded-lg px-2 py-1 outline-none ring-1 ring-blue-500"
                                                            value={editMediaTypeName}
                                                            onChange={(e) => setEditMediaTypeName(e.target.value)}
                                                            onBlur={handleUpdateType}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateType()}
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-bold text-slate-700">{type.name}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right space-x-1">
                                                    {editingMediaType?.id === type.id ? (
                                                        <Button
                                                            size="sm"
                                                            variant="light"
                                                            className="text-blue-600 font-bold"
                                                            onPress={handleUpdateType}
                                                        >
                                                            Lưu
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="flat"
                                                                className="bg-blue-50 text-blue-600 rounded-lg opacity-0 group-hover:opacity-100"
                                                                onPress={() => {
                                                                    setEditingMediaType(type);
                                                                    setEditMediaTypeName(type.name);
                                                                }}
                                                            >
                                                                <Edit size={14} />
                                                            </Button>
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="flat"
                                                                className="bg-rose-50 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100"
                                                                onPress={() => handleDeleteType(type.id)}
                                                            >
                                                                <Trash size={14} />
                                                            </Button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={typeManagementModal.onClose} className="font-bold rounded-xl px-6">Đóng</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </AdminLayout>
    );
}
