import { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Pagination } from "@heroui/pagination";
import { Users, Trash, UserCog, Shield, Mail, Phone, Image as ImageIcon, Plus } from 'lucide-react';
import api, { SERVER_URL } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';

export function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<any>(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    // Disclosure for modals
    const createModal = useDisclosure();
    const editModal = useDisclosure();

    // Edit state
    const [editUsername, setEditUsername] = useState('');
    const [editRole, setEditRole] = useState('');
    const [editFullName, setEditFullName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);

    // Create new user state
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('user');
    const [newFullName, setNewFullName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newBio, setNewBio] = useState('');
    const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);

    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/users?page=${page}&limit=${limit}`);
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchUsers();
    }, [page]);

    const handleCreateUser = async () => {
        if (!newUsername || !newPassword) return;
        setCreating(true);
        try {
            const formData = new FormData();
            formData.append('username', newUsername);
            formData.append('password', newPassword);
            formData.append('role', newRole);
            formData.append('fullName', newFullName);
            formData.append('email', newEmail);
            formData.append('phone', newPhone);
            formData.append('bio', newBio);
            if (newAvatarFile) {
                formData.append('avatar', newAvatarFile);
            }

            await api.post('/users', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Reset form
            setNewUsername('');
            setNewPassword('');
            setNewRole('user');
            setNewFullName('');
            setNewEmail('');
            setNewPhone('');
            setNewBio('');
            setNewAvatarFile(null);

            createModal.onClose();
            fetchUsers();
            alert('Tạo người dùng thành công! 🎉');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Lỗi khi tạo người dùng');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
            alert('Xóa người dùng thành công! 🗑️');
        } catch (err) {
            alert('Lỗi khi xóa người dùng');
        }
    };

    const startEdit = (user: any) => {
        setEditingUser(user);
        setEditUsername(user.username);
        setEditRole(user.role);
        setEditFullName(user.fullName || '');
        setEditEmail(user.email || '');
        setEditPhone(user.phone || '');
        setEditBio(user.bio || '');
        setEditAvatarFile(null);
        editModal.onOpen();
    };

    const handleUpdate = async () => {
        if (!editingUser) return;
        setUpdating(true);
        try {
            const formData = new FormData();
            formData.append('username', editUsername);
            formData.append('role', editRole);
            formData.append('fullName', editFullName);
            formData.append('email', editEmail);
            formData.append('phone', editPhone);
            formData.append('bio', editBio);
            if (editAvatarFile) {
                formData.append('avatar', editAvatarFile);
            }

            await api.put(`/users/${editingUser.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            editModal.onClose();
            fetchUsers();
            alert('Cập nhật người dùng thành công! ✨');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Lỗi khi cập nhật người dùng');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-100/50">
                        <Users className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quản lý người dùng</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">
                            Quản lý tài khoản và phân quyền hệ thống
                        </p>
                    </div>
                </div>
                <Button
                    onPress={createModal.onOpen}
                    className="bg-indigo-600 text-white font-black h-14 px-8 rounded-2xl shadow-xl shadow-indigo-100"
                    startContent={<Plus size={20} />}
                >
                    Thêm người dùng
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Người dùng</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Liên hệ</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Vai trò</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative flex-shrink-0">
                                                        {user.avatar ? (
                                                            <img
                                                                src={`${SERVER_URL}${user.avatar}`}
                                                                alt={user.username}
                                                                className="w-12 h-12 rounded-2xl object-cover shadow-sm ring-2 ring-white"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 uppercase shadow-sm ring-2 ring-white">
                                                                {user.username.substring(0, 1)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm leading-tight">
                                                            {user.fullName || user.username}
                                                        </h4>
                                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                                                            @{user.username}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[13px]">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <Mail size={12} className="text-slate-400" />
                                                        <span className="text-slate-600 font-medium">{user.email || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone size={12} className="text-slate-400" />
                                                        <span className="text-slate-500 text-xs">{user.phone || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200 opacity-70'}`}>
                                                    {user.role === 'admin' ? <Shield size={10} /> : <div className="w-2.5 h-2.5 rounded-full bg-slate-400 scale-75"></div>}
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="flat"
                                                        className="bg-indigo-50 text-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onPress={() => startEdit(user)}
                                                    >
                                                        <UserCog size={18} />
                                                    </Button>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="flat"
                                                        className="bg-rose-50 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onPress={() => handleDelete(user.id)}
                                                    >
                                                        <Trash size={18} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-center pb-8 mt-4">
                        <Pagination
                            total={totalPages}
                            page={page}
                            onChange={(p) => setPage(p)}
                            showControls
                            color="primary"
                            radius="sm"
                            classNames={{
                                cursor: "bg-indigo-600 shadow-lg shadow-indigo-200",
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={createModal.isOpen}
                onClose={createModal.onClose}
                size="3xl"
                scrollBehavior="inside"
                backdrop="blur"
                classNames={{
                    base: "rounded-[2rem] bg-slate-50",
                    header: "border-b border-slate-100 p-8",
                    body: "p-8",
                    footer: "border-t border-slate-100 p-6"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Thêm người dùng mới</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nhập thông tin cho tài khoản mới</p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Tên người dùng"
                                        placeholder="..."
                                        variant="flat"
                                        isRequired
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                                    />
                                    <Input
                                        label="Mật khẩu"
                                        type="password"
                                        placeholder="••••••••"
                                        variant="flat"
                                        isRequired
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                                    />
                                    <Input
                                        label="Tên đầy đủ"
                                        placeholder="..."
                                        variant="flat"
                                        value={newFullName}
                                        onChange={(e) => setNewFullName(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                                    />
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase px-1">Vai trò</label>
                                        <select
                                            value={newRole}
                                            onChange={(e) => setNewRole(e.target.value)}
                                            className="bg-white h-14 px-4 rounded-2xl outline-none font-bold text-slate-700 shadow-sm border-none"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="..."
                                        variant="flat"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                                    />
                                    <Input
                                        label="Số điện thoại"
                                        placeholder="..."
                                        variant="flat"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                                    />
                                    <div className="md:col-span-2 space-y-2">
                                        <Textarea
                                            label="Giới thiệu"
                                            placeholder="..."
                                            variant="flat"
                                            value={newBio}
                                            onChange={(e) => setNewBio(e.target.value)}
                                            classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                                        />
                                    </div>
                                    {/* <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase px-1 mb-2 block">Ảnh đại diện</label>
                                        <label className="flex items-center gap-3 bg-white h-14 px-4 rounded-2xl cursor-pointer border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-colors shadow-sm">
                                            <ImageIcon size={20} className="text-slate-400" />
                                            <span className="text-sm text-slate-500 font-medium">
                                                {newAvatarFile ? newAvatarFile.name : 'Tải ảnh đại diện'}
                                            </span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => setNewAvatarFile(e.target.files?.[0] || null)}
                                            />
                                        </label>
                                    </div> */}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose} className="font-bold rounded-xl">Hủy</Button>
                                <Button
                                    isLoading={creating}
                                    className="bg-indigo-600 text-white font-black px-8 rounded-xl shadow-lg shadow-indigo-100"
                                    onPress={handleCreateUser}
                                >
                                    Tạo người dùng
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={editModal.isOpen}
                onClose={editModal.onClose}
                size="3xl"
                scrollBehavior="inside"
                backdrop="blur"
                classNames={{
                    base: "rounded-[2rem] bg-slate-50",
                    header: "border-b border-slate-100 p-8",
                    body: "p-8",
                    footer: "border-t border-slate-100 p-6"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Chỉnh sửa người dùng</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cập nhật thông tin cho @{editUsername}</p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Tên người dùng"
                                        variant="flat"
                                        isRequired
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                                    />
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase px-1">Vai trò</label>
                                        <select
                                            value={editRole}
                                            onChange={(e) => setEditRole(e.target.value)}
                                            className="bg-white h-14 px-4 rounded-2xl outline-none font-bold text-slate-700 shadow-sm border-none"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <Input
                                        label="Tên đầy đủ"
                                        variant="flat"
                                        value={editFullName}
                                        onChange={(e) => setEditFullName(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                                    />
                                    <Input
                                        label="Email"
                                        variant="flat"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                                    />
                                    <Input
                                        label="Số điện thoại"
                                        variant="flat"
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                                    />
                                    <div className="md:col-span-2 space-y-2">
                                        <Textarea
                                            label="Giới thiệu"
                                            variant="flat"
                                            value={editBio}
                                            onChange={(e) => setEditBio(e.target.value)}
                                            classNames={{ inputWrapper: "bg-white shadow-sm rounded-2xl" }}
                                        />
                                    </div>
                                    {/* <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase px-1 mb-2 block">Ảnh đại diện mới</label>
                                        <label className="flex items-center gap-3 bg-white h-14 px-4 rounded-2xl cursor-pointer border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-colors shadow-sm">
                                            <ImageIcon size={20} className="text-slate-400" />
                                            <span className="text-sm text-slate-500 font-medium">
                                                {editAvatarFile ? editAvatarFile.name : 'Tải lên ảnh mới'}
                                            </span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => setEditAvatarFile(e.target.files?.[0] || null)}
                                            />
                                        </label>
                                    </div> */}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose} className="font-bold rounded-xl">Hủy</Button>
                                <Button
                                    isLoading={updating}
                                    className="bg-indigo-600 text-white font-black px-8 rounded-xl shadow-lg shadow-indigo-100"
                                    onPress={handleUpdate}
                                >
                                    Lưu thay đổi
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </AdminLayout>
    );
}
