import { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Pagination } from "@heroui/pagination";
import { Plus, Trash, Image as ImageIcon, Link as LinkIcon, Upload, Search, Copy, Check, Calendar } from 'lucide-react';
import api, { SERVER_URL } from '../services/api';
import { AdminLayout } from '../layouts/AdminLayout';
import { formatDate } from "../utils/formatDate";

export function MediaManagementPage() {
    const [media, setMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
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
            const response = await api.get(`/media`, {
                params: {
                    page,
                    limit,
                    search: searchTerm,
                    startDate,
                    endDate
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
        fetchMedia();
    }, [page, limit, searchTerm, startDate, endDate]);

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

    return (
        <AdminLayout>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-3 rounded-lg shadow-blue-100 shadow-md">
                            <ImageIcon className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Thư viện ảnh</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Quản lý tài nguyên hình ảnh của bạn
                            </p>
                        </div>
                    </div>
                    <Button
                        onPress={onOpen}
                        className="bg-blue-600 text-white font-bold h-10 px-6 rounded-lg shadow-md shadow-blue-100"
                        startContent={<Plus size={18} />}
                    >
                        Thêm ảnh
                    </Button>
                </div>

                {/* Search & Date Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm ảnh..."
                            className="h-10 pl-11 pr-4 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 w-full shadow-sm transition-all"
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

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-4 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Ảnh</th>
                                        <th className="px-4 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Thông tin ảnh</th>
                                        <th className="px-4 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Loại</th>
                                        <th className="px-4 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Ngày tạo</th>
                                        <th className="px-4 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {media.map((m) => (
                                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-4 py-3">
                                                <div className="w-12 h-12 rounded bg-slate-50 overflow-hidden border border-slate-100 shadow-sm relative group/thumb">
                                                    <img
                                                        src={m.url.startsWith('/uploads/') ? `${SERVER_URL}${m.url}` : m.url}
                                                        alt={m.name}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                                                    />
                                                    <div
                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                                        onClick={() => window.open(m.url.startsWith('/uploads/') ? `${SERVER_URL}${m.url}` : m.url, '_blank')}
                                                    >
                                                        <Search size={14} className="text-white" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-0.5 max-w-xs">
                                                    <p className="font-bold text-slate-700 truncate text-xs">{m.name}</p>
                                                    <div className="flex items-center gap-2 group/link cursor-pointer" onClick={() => copyToClipboard(m.url, m.id)}>
                                                        <p className="text-[10px] text-slate-400 truncate flex-1 font-mono">{m.url}</p>
                                                        {copiedId === m.id ? (
                                                            <Check size={10} className="text-emerald-500 shrink-0" />
                                                        ) : (
                                                            <Copy size={10} className="text-slate-300 group-hover/link:text-blue-500 shrink-0 transition-colors" />
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${m.type === 'upload'
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    {m.type === 'upload' ? 'Upload' : 'Link'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Calendar size={12} className="text-slate-300" />
                                                    <span className="text-[10px] font-medium">{formatDate(m.created_at)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        isIconOnly
                                                        variant="flat"
                                                        size="sm"
                                                        className="bg-rose-50 text-rose-500 rounded h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onPress={() => handleDelete(m.id)}
                                                    >
                                                        <Trash size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer với phân trang góc phải */}
                        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Hiện:
                                </p>
                                <select
                                    className="bg-white border border-slate-200 rounded text-[10px] font-bold px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                                    value={limit}
                                    onChange={handleLimitChange}
                                >
                                    <option value={5}>5 ảnh</option>
                                    <option value={10}>10 ảnh</option>
                                    <option value={20}>20 ảnh</option>
                                    <option value={50}>50 ảnh</option>
                                </select>
                                <p className="text-[10px] font-bold text-slate-400">
                                    Tổng: {totalItems}
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
                                        cursor: "bg-blue-600 shadow-md shadow-blue-100",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" classNames={{ base: "rounded-xl bg-slate-50", header: "border-b border-slate-100 p-6", body: "p-6", footer: "border-t border-slate-100 p-4" }}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Thêm ảnh vào thư viện</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lưu trữ ảnh để tái sử dụng</p>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <Input
                                label="Tên gợi nhớ"
                                placeholder="Ví dụ: Banner trang chủ, Icon dịch vụ..."
                                variant="flat"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                            />

                            <div className="space-y-2">
                                <div className="flex bg-white p-1 rounded-lg shadow-sm border border-slate-100">
                                    <button
                                        onClick={() => setUploadType('upload')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold transition-all ${uploadType === 'upload' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <Upload size={12} /> Tải lên
                                    </button>
                                    <button
                                        onClick={() => setUploadType('link')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold transition-all ${uploadType === 'link' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <LinkIcon size={12} /> Nhập Link
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
                                            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-xl bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                                        >
                                            {file ? (
                                                <div className="relative w-full h-full p-2">
                                                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                        <ImageIcon className="text-white" size={20} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="bg-blue-50 p-3 rounded-lg mb-2 group-hover:scale-110 transition-transform">
                                                        <Upload className="text-blue-600" size={20} />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-500">Click để chọn ảnh mới</p>
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
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                                    />
                                )}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" size="sm" onPress={onClose} className="font-bold rounded-lg">Hủy</Button>
                        <Button className="bg-blue-600 text-white font-bold px-6 rounded-lg shadow-md shadow-blue-100" size="sm" onPress={handleCreate}>Hoàn tất</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </AdminLayout>
    );
}
