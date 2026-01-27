import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Shield, ArrowRight, User as UserIcon, Lock } from 'lucide-react';
import api from '../services/api';

export function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            const response = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6 selection:bg-blue-100 selection:text-blue-900">
            <Card className="w-full max-w-[420px] bg-white shadow-xl shadow-blue-100/50 border-none rounded-2xl overflow-hidden">
                <CardBody className="p-0">
                    <div className="bg-blue-600 p-10 text-center relative overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full -mr-16 -mt-16 opacity-30"></div>
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-700/20 rounded-full -ml-10 -mb-10 opacity-30"></div>

                        <div className="bg-white/10 w-16 h-16 rounded-2xl backdrop-blur-md mx-auto flex items-center justify-center mb-5 shadow-xl">
                            <Shield className="text-white" size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight mb-1">Hệ thống Quản trị</h1>
                        <p className="text-blue-100 font-bold text-[10px] uppercase tracking-widest opacity-80">Administrative Portal</p>
                    </div>

                    <form onSubmit={handleLogin} className="p-8 flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <Input
                                label="Username"
                                placeholder="Tên đăng nhập"
                                variant="flat"
                                startContent={<UserIcon className="text-slate-400 mr-2" size={16} />}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                classNames={{
                                    label: "text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1",
                                    input: "text-slate-900 font-medium",
                                    inputWrapper: "bg-slate-50 border border-slate-100 focus-within:border-blue-500/20 h-12 rounded-lg transition-all px-4",
                                }}
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                variant="flat"
                                startContent={<Lock className="text-slate-400 mr-2" size={16} />}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                classNames={{
                                    label: "text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1",
                                    input: "text-slate-900 font-medium",
                                    inputWrapper: "bg-slate-50 border border-slate-100 focus-within:border-blue-500/20 h-12 rounded-lg transition-all px-4",
                                }}
                            />
                        </div>

                        {error && (
                            <div className="bg-rose-50 text-rose-500 p-3 rounded-lg text-[11px] font-bold border border-rose-100 animate-shake">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-lg shadow-lg shadow-blue-100 text-sm group transition-all"
                            endContent={<ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />}
                        >
                            Đăng nhập
                        </Button>

                        <p className="text-center text-slate-400 text-[10px] font-bold tracking-tight uppercase">
                            Protected by secure encryption
                        </p>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
