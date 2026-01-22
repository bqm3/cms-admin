import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { ChevronLeft } from "lucide-react";

export function NewPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Button
                        variant="flat"
                        className="text-slate-600 hover:bg-white h-12 w-12 min-w-0 p-0 rounded-2xl shadow-sm"
                        onClick={() => navigate('/dashboard')}
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">New Editor Page</h1>
                        <p className="text-sm text-slate-500 font-medium">This is a simple test page</p>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-12 border border-slate-200">
                    <div className="space-y-6">
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-indigo-200">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-3">
                                Page is Working! ✨
                            </h2>
                            <p className="text-slate-600 font-medium max-w-md mx-auto">
                                If you can see this page, it means routing and React are working correctly.
                                The issue might be with the Editor component specifically.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-slate-200">
                            <div className="p-6 bg-slate-50 rounded-2xl">
                                <h3 className="font-bold text-slate-800 mb-2">✅ React Router</h3>
                                <p className="text-sm text-slate-600">Navigation is working</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl">
                                <h3 className="font-bold text-slate-800 mb-2">✅ HeroUI Components</h3>
                                <p className="text-sm text-slate-600">UI library is loaded</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl">
                                <h3 className="font-bold text-slate-800 mb-2">✅ Tailwind CSS</h3>
                                <p className="text-sm text-slate-600">Styling is working</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl">
                                <h3 className="font-bold text-slate-800 mb-2">✅ TypeScript</h3>
                                <p className="text-sm text-slate-600">Type checking is active</p>
                            </div>
                        </div>

                        <div className="pt-8 flex justify-center gap-4">
                            <Button
                                onClick={() => navigate('/dashboard')}
                                className="bg-slate-600 text-white font-bold px-8 h-12 rounded-2xl shadow-lg"
                            >
                                Back to Dashboard
                            </Button>
                            <Button
                                onClick={() => navigate('/editor/new')}
                                className="bg-indigo-600 text-white font-bold px-8 h-12 rounded-2xl shadow-lg"
                            >
                                Try Editor Again
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Debug Info */}
                <div className="mt-8 p-6 bg-slate-800 rounded-2xl text-white">
                    <h3 className="font-bold mb-3 text-sm uppercase tracking-wider">Debug Information</h3>
                    <div className="space-y-2 text-sm font-mono">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Current Time:</span>
                            <span>{new Date().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Current Path:</span>
                            <span>{window.location.pathname}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">React Version:</span>
                            <span>19.x</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
