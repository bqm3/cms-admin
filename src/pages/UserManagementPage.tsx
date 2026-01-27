import { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Users, Trash, UserCog, Shield, Mail, Phone, Plus, Search, Calendar } from 'lucide-react';
import api, { SERVER_URL } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { DataTable } from '../components/Common/DataTable';

export function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

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
            const response = await api.get(`/users`, {
                params: {
                    page,
                    limit,
                    search: searchTerm,
                    startDate,
                    endDate
                }
            });
            if (response.data.users) {
                setUsers(response.data.users);
                setTotalPages(response.data.totalPages);
                setTotalItems(response.data.total);
            } else {
                setUsers(response.data);
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
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchUsers();
    }, [page, limit, searchTerm, startDate, endDate]);

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
            if (page === 1) fetchUsers(); else setPage(1);
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
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-3 rounded-lg shadow-blue-100 shadow-md">
                            <Users className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Quản lý người dùng</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Quản lý tài khoản và phân quyền hệ thống
                            </p>
                        </div>
                    </div>
                    <Button
                        onPress={createModal.onOpen}
                        className="bg-blue-600 text-white font-bold h-10 px-6 rounded-lg shadow-md shadow-blue-100"
                        startContent={<Plus size={18} />}
                    >
                        Thêm người dùng
                    </Button>
                </div>

                {/* Search & Date Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm người dùng (Tên, Email, Username)..."
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

            <DataTable
                data={users}
                loading={loading}
                minWidth="800px"
                columns={[
                    {
                        header: 'Người dùng',
                        render: (user) => (
                            <div className="flex items-center gap-3">
                                <div className="relative flex-shrink-0">
                                    {user.avatar ? (
                                        <img
                                            src={`${SERVER_URL}${user.avatar}`}
                                            alt={user.username}
                                            className="w-10 h-10 rounded-lg object-cover shadow-sm ring-2 ring-white"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center font-black text-blue-600 uppercase shadow-sm ring-2 ring-white">
                                            {user.username.substring(0, 1)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-xs leading-tight">
                                        {user.fullName || user.username}
                                    </h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                                        @{user.username}
                                    </p>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'Liên hệ',
                        render: (user) => (
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5">
                                    <Mail size={10} className="text-slate-400" />
                                    <span className="text-slate-600 font-medium text-[12px]">{user.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Phone size={10} className="text-slate-400" />
                                    <span className="text-slate-500 text-xs">{user.phone || 'N/A'}</span>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'Vai trò',
                        render: (user) => (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${user.role === 'admin' ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200 opacity-70'}`}>
                                {user.role === 'admin' ? <Shield size={9} /> : <div className="w-2 h-2 rounded-full bg-slate-400 scale-75"></div>}
                                {user.role}
                            </span>
                        )
                    },
                    {
                        header: 'Hành động',
                        align: 'right',
                        render: (user) => (
                            <div className="flex items-center justify-end gap-1.5">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="flat"
                                    className="bg-blue-50 text-blue-600 rounded h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onPress={() => startEdit(user)}
                                >
                                    <UserCog size={14} />
                                </Button>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="flat"
                                    className="bg-rose-50 text-rose-500 rounded h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onPress={() => handleDelete(user.id)}
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

            {/* Create Modal */}
            <Modal
                isOpen={createModal.isOpen}
                onClose={createModal.onClose}
                size="2xl"
                scrollBehavior="inside"
                backdrop="blur"
                classNames={{
                    base: "rounded-xl bg-slate-50",
                    header: "border-b border-slate-100 p-6",
                    body: "p-6",
                    footer: "border-t border-slate-100 p-4"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Thêm người dùng mới</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nhập thông tin cho tài khoản mới</p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Tên người dùng"
                                        placeholder="..."
                                        variant="flat"
                                        isRequired
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                                    />
                                    <Input
                                        label="Mật khẩu"
                                        type="password"
                                        placeholder="••••••••"
                                        variant="flat"
                                        isRequired
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                                    />
                                    <Input
                                        label="Tên đầy đủ"
                                        placeholder="..."
                                        variant="flat"
                                        value={newFullName}
                                        onChange={(e) => setNewFullName(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                                    />
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Vai trò</label>
                                        <select
                                            value={newRole}
                                            onChange={(e) => setNewRole(e.target.value)}
                                            className="bg-white h-10 px-3 rounded-lg outline-none text-xs font-bold text-slate-700 shadow-sm border border-slate-200"
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
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                                    />
                                    <Input
                                        label="Số điện thoại"
                                        placeholder="..."
                                        variant="flat"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                                    />
                                    <div className="md:col-span-2 space-y-2">
                                        <Textarea
                                            label="Giới thiệu"
                                            placeholder="..."
                                            variant="flat"
                                            value={newBio}
                                            onChange={(e) => setNewBio(e.target.value)}
                                            classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" size="sm" onPress={onClose} className="font-bold rounded-lg">Hủy</Button>
                                <Button
                                    isLoading={creating}
                                    className="bg-blue-600 text-white font-bold px-6 rounded-lg shadow-md shadow-blue-100"
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
                size="2xl"
                scrollBehavior="inside"
                backdrop="blur"
                classNames={{
                    base: "rounded-xl bg-slate-50",
                    header: "border-b border-slate-100 p-6",
                    body: "p-6",
                    footer: "border-t border-slate-100 p-4"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Chỉnh sửa người dùng</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cập nhật thông tin cho @{editUsername}</p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Tên người dùng"
                                        variant="flat"
                                        isRequired
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                                    />
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Vai trò</label>
                                        <select
                                            value={editRole}
                                            onChange={(e) => setEditRole(e.target.value)}
                                            className="bg-white h-10 px-3 rounded-lg outline-none text-xs font-bold text-slate-700 shadow-sm border border-slate-200"
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
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                                    />
                                    <Input
                                        label="Email"
                                        variant="flat"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                                    />
                                    <Input
                                        label="Số điện thoại"
                                        variant="flat"
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                        classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                                    />
                                    <div className="md:col-span-2 space-y-2">
                                        <Textarea
                                            label="Giới thiệu"
                                            variant="flat"
                                            value={editBio}
                                            onChange={(e) => setEditBio(e.target.value)}
                                            classNames={{ inputWrapper: "bg-white shadow-sm rounded-lg" }}
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" size="sm" onPress={onClose} className="font-bold rounded-lg">Hủy</Button>
                                <Button
                                    isLoading={updating}
                                    className="bg-blue-600 text-white font-bold px-6 rounded-lg shadow-md shadow-blue-100"
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
