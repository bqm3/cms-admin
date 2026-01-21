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
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6 selection:bg-indigo-100 selection:text-indigo-900">
            <Card className="w-full max-w-[480px] bg-white shadow-2xl shadow-indigo-100/50 border-none rounded-[3rem] overflow-hidden">
                <CardBody className="p-0">
                    <div className="bg-indigo-600 p-12 text-center relative overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500 rounded-full -mr-20 -mt-20 opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-700/30 rounded-full-ml-10 -mb-10 opacity-50"></div>

                        <div className="bg-white/10 w-20 h-20 rounded-3xl backdrop-blur-md mx-auto flex items-center justify-center mb-6 shadow-2xl">
                            <Shield className="text-white" size={40} />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-indigo-100 font-bold text-sm uppercase tracking-widest">Administrative Portal</p>
                    </div>

                    <form onSubmit={handleLogin} className="p-10 flex flex-col gap-8">
                        <div className="flex flex-col gap-5">
                            <Input
                                label="Username"
                                placeholder="Enter your username"
                                variant="flat"
                                startContent={<UserIcon className="text-slate-400 mr-2" size={18} />}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                classNames={{
                                    label: "text-slate-500 font-bold text-xs uppercase tracking-wider mb-2",
                                    input: "text-slate-900 font-medium",
                                    inputWrapper: "bg-slate-50 border-2 border-transparent focus-within:border-indigo-500/10 h-16 rounded-[1.25rem] transition-all px-6",
                                }}
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                variant="flat"
                                startContent={<Lock className="text-slate-400 mr-2" size={18} />}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                classNames={{
                                    label: "text-slate-500 font-bold text-xs uppercase tracking-wider mb-2",
                                    input: "text-slate-900 font-medium",
                                    inputWrapper: "bg-slate-50 border-2 border-transparent focus-within:border-indigo-500/10 h-16 rounded-[1.25rem] transition-all px-6",
                                }}
                            />
                        </div>

                        {error && (
                            <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-xs font-bold border border-rose-100 animate-shake">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-16 rounded-[1.25rem] shadow-xl shadow-indigo-100 text-lg group transition-all"
                            endContent={<ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />}
                        >
                            Authenticate
                        </Button>

                        <p className="text-center text-slate-400 text-xs font-bold tracking-tight">
                            Protected by enterprise-grade encryption.
                        </p>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
