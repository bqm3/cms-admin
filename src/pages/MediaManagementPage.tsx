import { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Pagination } from "@heroui/pagination";
import { Plus, Trash, Image as ImageIcon, Link as LinkIcon, Upload, Search, Copy, Check, Calendar } from 'lucide-react';
import api, { SERVER_URL } from '../services/api';
import { AdminLayout } from '../layouts/AdminLayout';

export function MediaManagementPage() {
    const [media, setMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState<number | null>(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploadType, setUploadType] = useState<'upload' | 'link'>('upload');

    const { isOpen, onOpen, onClose } = useDisclosure();

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/media?page=${page}&limit=${limit}`);
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
        fetchMedia();
    }, [page, limit]);

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLimit(Number(e.target.value));
        setPage(1); // Reset to first page when limit changes
    };

    const handleCreate = async () => {
        try {
            const formData = new FormData();
            formData.append('name', name);
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
            onClose();
            alert('Thêm ảnh vào thư viện thành công! 🖼️');
            if (page === 1) fetchMedia(); else setPage(1);
        } catch (err) {
            alert('Lỗi khi thêm ảnh');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này khỏi thư viện?')) return;
        try {
            await api.delete(`/media/${id}`);
            alert('Xóa thành công! 🗑️');
            fetchMedia();
        } catch (err) {
            alert('Lỗi khi xóa ảnh');
        }
    };

    const copyToClipboard = (text: string, id: number) => {
        const fullUrl = text.startsWith('/uploads/') ? `${SERVER_URL}${text}` : text;
        navigator.clipboard.writeText(fullUrl);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredMedia = media.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg shadow-indigo-100">
                        <ImageIcon className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Thư viện ảnh</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">
                            Quản lý tài nguyên hình ảnh của bạn
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm ảnh..."
                            className="h-12 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64 shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onPress={onOpen}
                        className="bg-indigo-600 text-white font-black h-12 px-6 rounded-2xl shadow-lg shadow-indigo-100"
                        startContent={<Plus size={20} />}
                    >
                        Thêm ảnh
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Ảnh</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Thông tin ảnh</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Loại</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Ngày tạo</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredMedia.map((m) => (
                                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-5">
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
                                                        <Search size={16} className="text-white" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1 max-w-xs">
                                                    <p className="font-bold text-slate-700 truncate">{m.name}</p>
                                                    <div className="flex items-center gap-2 group/link cursor-pointer" onClick={() => copyToClipboard(m.url, m.id)}>
                                                        <p className="text-xs text-slate-400 truncate flex-1">{m.url}</p>
                                                        {copiedId === m.id ? (
                                                            <Check size={12} className="text-emerald-500 shrink-0" />
                                                        ) : (
                                                            <Copy size={12} className="text-slate-300 group-hover/link:text-indigo-500 shrink-0 transition-colors" />
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${m.type === 'upload'
                                                        ? 'bg-indigo-50 text-indigo-600'
                                                        : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    {m.type === 'upload' ? 'Upload' : 'Link'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Calendar size={14} className="text-slate-300" />
                                                    <span className="text-xs font-medium">{formatDate(m.createdAt)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        isIconOnly
                                                        variant="flat"
                                                        size="sm"
                                                        className="bg-rose-50 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onPress={() => handleDelete(m.id)}
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

                        {/* Footer với phân trang góc phải */}
                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Hiển thị:
                                </p>
                                <select
                                    className="bg-white border border-slate-200 rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                                    value={limit}
                                    onChange={handleLimitChange}
                                >
                                    <option value={5}>5 ảnh</option>
                                    <option value={10}>10 ảnh</option>
                                    <option value={20}>20 ảnh</option>
                                    <option value={50}>50 ảnh</option>
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
                                    color="primary"
                                    radius="sm"
                                    size="sm"
                                    classNames={{
                                        cursor: "bg-indigo-600 shadow-lg shadow-indigo-100",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" classNames={{ base: "rounded-[2rem] bg-slate-50", header: "border-b border-slate-100 p-8", body: "p-8", footer: "border-t border-slate-100 p-6" }}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Thêm ảnh vào thư viện</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lưu trữ ảnh để tái sử dụng</p>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-6">
                            <Input
                                label="Tên gợi nhớ"
                                placeholder="Ví dụ: Banner trang chủ, Icon dịch vụ..."
                                variant="flat"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                            />

                            <div className="space-y-3">
                                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                                    <button
                                        onClick={() => setUploadType('upload')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${uploadType === 'upload' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <Upload size={14} /> Tải lên
                                    </button>
                                    <button
                                        onClick={() => setUploadType('link')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${uploadType === 'link' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <LinkIcon size={14} /> Nhập Link
                                    </button>
                                </div>

                                {uploadType === 'upload' ? (
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            id="media-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                        <label
                                            htmlFor="media-upload"
                                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
                                        >
                                            {file ? (
                                                <div className="relative w-full h-full p-2">
                                                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded-[1.5rem]" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] flex items-center justify-center">
                                                        <ImageIcon className="text-white" size={24} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="bg-indigo-50 p-4 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                                                        <Upload className="text-indigo-600" size={24} />
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-500">Click để chọn ảnh mới</p>
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
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                                    />
                                )}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose} className="font-bold rounded-xl">Hủy</Button>
                        <Button className="bg-slate-900 text-white font-black px-8 rounded-xl" onPress={handleCreate}>Hoàn tất</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </AdminLayout>
    );
}
