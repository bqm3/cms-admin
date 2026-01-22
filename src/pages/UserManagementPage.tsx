import { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Users, Trash, Save, X, UserCog, UserPlus, Lock, Shield } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';

export function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editRole, setEditRole] = useState('');
    const [editUsername, setEditUsername] = useState('');

    // Create new user state
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('user');
    const [creating, setCreating] = useState(false);

    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
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
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername || !newPassword) return;
        setCreating(true);
        try {
            await api.post('/users', {
                username: newUsername,
                password: newPassword,
                role: newRole
            });
            setNewUsername('');
            setNewPassword('');
            setNewRole('user');
            fetchUsers();
            alert('User created successfully');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to create user');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const startEdit = (user: any) => {
        setEditingId(user.id);
        setEditUsername(user.username);
        setEditRole(user.role);
    };

    const handleUpdate = async (id: number) => {
        try {
            await api.put(`/users/${id}`, { username: editUsername, role: editRole });
            setEditingId(null);
            fetchUsers();
        } catch (err) {
            alert('Failed to update user');
        }
    };

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-100">
                        <Users className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quản lý User</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">
                            Quản lý người dùng và phân quyền
                        </p>
                    </div>
                </div>
            </div>

                {/* Create User Form */}
                <Card className="mb-12 border-none shadow-sm rounded-[2rem] overflow-hidden">
                    <CardBody className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-indigo-100 p-2 rounded-xl">
                                <UserPlus size={18} className="text-indigo-600" />
                            </div>
                            <h2 className="text-lg font-black text-slate-800">Add New User</h2>
                        </div>
                        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <Input
                                label="Username"
                                placeholder="john_doe"
                                variant="flat"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                classNames={{ inputWrapper: "bg-slate-50 rounded-2xl" }}
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                variant="flat"
                                startContent={<Lock size={18} className="text-slate-300" />}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                classNames={{ inputWrapper: "bg-slate-50 rounded-2xl" }}
                            />
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Role</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    className="bg-slate-50 h-14 px-4 rounded-2xl outline-none font-bold text-slate-700 border-none"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <Button
                                type="submit"
                                isLoading={creating}
                                className="bg-indigo-600 text-white font-black h-14 rounded-2xl shadow-xl shadow-indigo-100"
                            >
                                Create User
                            </Button>
                        </form>
                    </CardBody>
                </Card>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        <div className="px-6 mb-2 flex items-center justify-between text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                            <span>User Profiles</span>
                            <span>Actions</span>
                        </div>
                        {users.map((user) => (
                            <Card key={user.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden">
                                <CardBody className="p-0 flex flex-col md:flex-row items-stretch md:items-center">
                                    <div className="bg-slate-100/50 p-6 flex items-center justify-center border-r border-slate-100 min-w-[120px]">
                                        <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center font-black text-2xl text-indigo-600">
                                            {user.username.substring(0, 1).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex-1">
                                            {editingId === user.id ? (
                                                <div className="flex flex-col gap-4">
                                                    <Input
                                                        label="Username"
                                                        variant="underlined"
                                                        value={editUsername}
                                                        onChange={(e) => setEditUsername(e.target.value)}
                                                    />
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Role</label>
                                                        <select
                                                            value={editRole}
                                                            onChange={(e) => setEditRole(e.target.value)}
                                                            className="bg-transparent border-b-2 border-slate-200 py-2 outline-none font-bold text-slate-700"
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="text-xl font-bold text-slate-800">{user.username}</h3>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                            {user.role === 'admin' ? <Shield size={10} className="inline mr-1" /> : null}
                                                            {user.role}
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">ID: {user.id}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex gap-3">
                                            {editingId === user.id ? (
                                                <>
                                                    <Button isIconOnly variant="flat" className="bg-emerald-50 text-emerald-600 rounded-2xl w-14 h-14" onClick={() => handleUpdate(user.id)}>
                                                        <Save size={24} />
                                                    </Button>
                                                    <Button isIconOnly variant="flat" className="bg-slate-50 text-slate-600 rounded-2xl w-14 h-14" onClick={() => setEditingId(null)}>
                                                        <X size={24} />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button isIconOnly variant="flat" className="bg-indigo-50 text-indigo-600 rounded-2xl w-14 h-14" onClick={() => startEdit(user)}>
                                                        <UserCog size={24} />
                                                    </Button>
                                                    <Button isIconOnly variant="flat" className="bg-rose-50 text-rose-500 rounded-2xl w-14 h-14" onClick={() => handleDelete(user.id)}>
                                                        <Trash size={24} />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
        </AdminLayout>
    );
}
