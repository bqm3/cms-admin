import { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Plus, Trash, Image as ImageIcon, Link as LinkIcon, Upload, Search, Copy, Check, Calendar } from 'lucide-react';
import api, { SERVER_URL } from '../services/api';
import { AdminLayout } from '../layouts/AdminLayout';
import { formatDate } from "../utils/formatDate";
import { DataTable } from '../components/Common/DataTable';

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
                    <Button
                        onPress={onOpen}
                        className="bg-blue-600 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-blue-100"
                        startContent={<Plus size={18} />}
                    >
                        Thêm ảnh
                    </Button>
                </div>

                {/* Search & Date Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
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
                        {(startDate || endDate) && (
                            <button
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                    setPage(1);
                                }}
                                className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors px-2"
                            >
                                Xóa
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <DataTable
                data={media}
                loading={loading}
                minWidth="900px"
                columns={[
                    {
                        header: 'Ảnh',
                        render: (m) => (
                            <div className="w-14 h-14 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 shadow-sm relative group/thumb">
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
                        )
                    },
                    {
                        header: 'Thông tin ảnh',
                        render: (m) => (
                            <div className="flex flex-col gap-1 max-w-xs">
                                <p className="font-bold text-slate-700 truncate text-sm">{m.name}</p>
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
                        header: 'Loại',
                        render: (m) => (
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${m.type === 'upload'
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                {m.type === 'upload' ? 'Upload' : 'Link'}
                            </span>
                        )
                    },
                    {
                        header: 'Ngày tạo',
                        render: (m) => (
                            <div className="flex items-center gap-2 text-slate-500">
                                <Calendar size={14} className="text-slate-300" />
                                <span className="text-sm font-medium">{formatDate(m.created_at)}</span>
                            </div>
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
                                    className="bg-rose-50 text-rose-500 rounded-lg h-8 w-8 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                    onPress={() => handleDelete(m.id)}
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
                    unitName: 'ảnh'
                }}
            />

            <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" classNames={{ base: "rounded-2xl bg-slate-50", header: "border-b border-slate-100 p-6", body: "p-6", footer: "border-t border-slate-100 p-4" }}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Thêm ảnh vào thư viện</h2>
                        <p className="text-xs font-medium text-slate-400">Lưu trữ ảnh để tái sử dụng</p>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <Input
                                label="Tên gợi nhớ"
                                placeholder="Ví dụ: Banner trang chủ, Icon dịch vụ..."
                                variant="flat"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                classNames={{ inputWrapper: "bg-white shadow-sm rounded-xl h-12" }}
                            />

                            <div className="space-y-3">
                                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                                    <button
                                        onClick={() => setUploadType('upload')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${uploadType === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <Upload size={14} /> Tải lên
                                    </button>
                                    <button
                                        onClick={() => setUploadType('link')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${uploadType === 'link' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
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
                                            className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-200 rounded-2xl bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group lg:p-4"
                                        >
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
                                                    <p className="text-sm font-bold text-slate-500">Click để chọn ảnh mới</p>
                                                    <p className="text-xs text-slate-400 mt-1">PNG, JPG tối đa 10MB</p>
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
                        <Button variant="light" size="sm" onPress={onClose} className="font-bold rounded-xl h-10 px-6">Hủy</Button>
                        <Button className="bg-blue-600 text-white font-bold h-10 px-8 rounded-xl shadow-lg shadow-blue-100" size="sm" onPress={handleCreate}>Hoàn tất</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </AdminLayout>
    );
}
