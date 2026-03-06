import React, { useEffect, useState } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Plus, Trash, Save, Link as LinkIcon, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface PostLink {
    id?: number;
    post_id: number;
    title: string;
    href: string;
    sequence_number: number;
}

interface PostLinkDialogProps {
    postId: number | null;
    postTitle: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function PostLinkDialog({ postId, postTitle, isOpen, onClose, onSuccess }: PostLinkDialogProps) {
    const [links, setLinks] = useState<PostLink[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Bulk input state
    const [showBulk, setShowBulk] = useState(false);
    const [bulkText, setBulkText] = useState('');

    useEffect(() => {
        if (isOpen && postId) {
            fetchLinks();
        } else {
            setLinks([]);
            setShowBulk(false);
            setBulkText('');
        }
    }, [isOpen, postId]);

    const fetchLinks = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/post-links/${postId}`);
            setLinks(response.data);
        } catch (err: any) {
            console.error('Error fetching links:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLink = () => {
        if (!postId) return;
        const maxSeq = links.length > 0 ? Math.max(...links.map(l => l.sequence_number || 0)) : 0;
        setLinks([...links, {
            post_id: postId,
            title: '',
            href: '',
            sequence_number: maxSeq + 1
        }]);
    };

    const handleAddBulk = () => {
        if (!postId || !bulkText.trim()) return;
        
        const lines = bulkText.split('\n').filter(line => line.trim());
        const maxSeq = links.length > 0 ? Math.max(...links.map(l => l.sequence_number || 0)) : 0;
        
        const newLinks: PostLink[] = lines.map((line, index) => {
            let title = line.trim();
            let href = '';
            
            // Format: "Title | Link" or just "Link"
            if (line.includes('|')) {
                const parts = line.split('|').map(p => p.trim());
                title = parts[0];
                href = parts[1] || '';
            } else if (line.trim().startsWith('http')) {
                href = line.trim();
                title = 'Liên kết mới';
            }

            return {
                post_id: postId,
                title,
                href,
                sequence_number: maxSeq + index + 1
            };
        });

        setLinks([...links, ...newLinks]);
        setBulkText('');
        setShowBulk(false);
    };

    const handleUpdateLocalLink = (index: number, field: keyof PostLink, value: any) => {
        const newLinks = [...links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setLinks(newLinks);
    };

    const handleRemoveLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!postId) return;
        try {
            setSaving(true);
            await api.post(`/post-links/bulk/${postId}`, { links });
            alert('Cập nhật link thành công! ✨');
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error saving links:', err);
            alert('Lưu thất bại: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            size="3xl"
            scrollBehavior="inside"
            backdrop="blur"
            classNames={{
                base: "bg-white rounded-3xl",
                header: "border-b border-slate-100 px-8 py-6",
                body: "px-8 py-6",
                footer: "border-t border-slate-100 px-8 py-6",
                closeButton: "hover:bg-slate-100 top-4 right-4 active:scale-90 transition-all",
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#21294a]/5 rounded-xl text-[#21294a]">
                            <LinkIcon size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Quản lý Link phụ</h2>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">Dự án: <span className="text-[#21294a]">{postTitle}</span></p>
                        </div>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Danh sách link ({links.length})</span>
                            <div className="flex gap-2">
                                <Button 
                                    size="sm" 
                                    variant="flat"
                                    className="bg-slate-100 text-slate-600 font-bold rounded-xl h-9 px-4 hover:bg-slate-200 transition-all"
                                    onPress={() => setShowBulk(!showBulk)}
                                    // startContent={<Layers size={16} />}
                                >
                                    {showBulk ? "Hủy thêm nhanh" : "Thêm nhanh"}
                                </Button>
                                <Button 
                                    size="sm" 
                                    className="bg-[#21294a] text-white font-bold rounded-xl h-9 px-4 shadow-lg shadow-[#21294a]/10 hover:scale-105 transition-all"
                                    onPress={handleAddLink}
                                    startContent={<Plus size={16} />}
                                >
                                    Thêm dòng
                                </Button>
                            </div>
                        </div>

                        {showBulk && (
                            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl mb-4 animate-in fade-in slide-in-from-top-2">
                                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">Nhập nhanh (Mỗi dòng một mục - Định dạng: Tiêu đề | Link)</p>
                                <textarea
                                    className="w-full h-32 p-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#21294a]/10 transition-all"
                                    placeholder={`Link 1 | https://...
Link 2 | https://...
Hoặc chỉ dán Link`}
                                    value={bulkText}
                                    onChange={(e) => setBulkText(e.target.value)}
                                />
                                <div className="mt-3 flex justify-end">
                                    <Button 
                                        size="sm"
                                        className="bg-[#21294a] text-white font-bold rounded-xl px-6 h-9"
                                        onPress={handleAddBulk}
                                    >
                                        Xác nhận thêm ({bulkText.split('\n').filter(l => l.trim()).length})
                                    </Button>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <div className="w-8 h-8 border-3 border-slate-100 border-t-[#21294a] rounded-full animate-spin"></div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
                            </div>
                        ) : links.length === 0 ? (
                            <div className="py-16 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-4 bg-slate-50/50">
                                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                    <AlertCircle size={32} className="text-slate-200" />
                                </div>
                                <p className="text-sm font-bold text-slate-400">Chưa có link phụ nào cho dự án này</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {links.map((link, index) => (
                                    <div key={link.id || `new-${index}`} className="group p-4 bg-white border border-slate-200 rounded-2xl hover:border-[#21294a]/30 hover:shadow-xl hover:shadow-[#21294a]/5 transition-all flex flex-col md:flex-row gap-4 items-end md:items-center">
                                        <div className="w-full md:w-20">
                                            <Input
                                                label="STT"
                                                labelPlacement="outside"
                                                placeholder="0"
                                                size="sm"
                                                type="number"
                                                value={String(link.sequence_number)}
                                                onChange={(e) => handleUpdateLocalLink(index, 'sequence_number', Number(e.target.value))}
                                                classNames={{
                                                    label: "text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1",
                                                    inputWrapper: "bg-slate-50 border-none shadow-none h-10 rounded-xl px-3",
                                                    input: "font-mono font-bold text-slate-600 text-xs"
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 w-full">
                                            <Input
                                                label="Tiêu đề"
                                                labelPlacement="outside"
                                                placeholder="VD: Link đăng ký, Landing page..."
                                                size="sm"
                                                value={link.title}
                                                onChange={(e) => handleUpdateLocalLink(index, 'title', e.target.value)}
                                                classNames={{
                                                    label: "text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1",
                                                    inputWrapper: "bg-slate-50 border-none shadow-none h-10 rounded-xl px-4",
                                                    input: "font-semibold text-slate-700 text-xs placeholder:text-slate-300"
                                                }}
                                            />
                                        </div>
                                        <div className="flex-[2] w-full">
                                            <Input
                                                label="Đường dẫn (HREF)"
                                                labelPlacement="outside"
                                                placeholder="https://..."
                                                size="sm"
                                                value={link.href}
                                                onChange={(e) => handleUpdateLocalLink(index, 'href', e.target.value)}
                                                classNames={{
                                                    label: "text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1",
                                                    inputWrapper: "bg-slate-50 border-none shadow-none h-10 rounded-xl px-4",
                                                    input: "font-medium text-[#21294a] text-xs placeholder:text-slate-300"
                                                }}
                                            />
                                        </div>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="flat"
                                            color="danger"
                                            className="rounded-xl h-10 w-10 active:scale-90 transition-all"
                                            onPress={() => handleRemoveLink(index)}
                                        >
                                            <Trash size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button 
                        variant="flat" 
                        onPress={onClose}
                        className="font-bold text-xs uppercase tracking-widest text-slate-500 rounded-xl h-12 px-6 hover:bg-slate-100 transition-all"
                    >
                        Hủy bỏ
                    </Button>
                    <Button 
                        className="bg-[#21294a] text-white font-bold text-xs uppercase tracking-widest rounded-xl h-12 px-10 shadow-xl shadow-[#21294a]/20 hover:scale-[1.02] active:scale-95 transition-all"
                        onPress={handleSave}
                        isLoading={saving}
                        startContent={!saving && <Save size={16} />}
                    >
                        Lưu thay đổi
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
