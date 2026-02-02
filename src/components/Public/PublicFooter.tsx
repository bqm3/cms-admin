/* eslint-disable prettier/prettier */
import { LayoutGrid } from "lucide-react";

interface PublicFooterProps {
    parentCategories: any[];
    categories: any[];
    onCategoryClick: (parentId: string, categoryId: string) => void;
}

export function PublicFooter({
    parentCategories,
    categories,
    onCategoryClick
}: PublicFooterProps) {
    return (
        <footer className="bg-white border-t border-slate-200 mt-32 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-20">
                    <div className="col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-blue-600 p-2 rounded-xl shadow-blue-500/20 shadow-lg">
                                <LayoutGrid className="text-white" size={20} />
                            </div>
                            <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">CMS SHOWCASE</span>
                        </div>
                        <p className="text-xs text-slate-400 font-bold leading-loose uppercase tracking-widest opacity-80 mb-6">
                            Nền tảng trưng bày và khám phá những mẫu thiết kế website cao cấp được xây dựng trên công nghệ Craft JS.
                        </p>
                        <div className="flex gap-4">
                            {/* Decorative social placeholders */}
                            {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100" />)}
                        </div>
                    </div>

                    {parentCategories.filter(pc => !pc.is_deleted).map((pc) => (
                        <div key={pc.id}>
                            <button
                                onClick={() => onCategoryClick(String(pc.id), "")}
                                className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-8 opacity-40 hover:opacity-100 hover:text-blue-600 transition-all text-left block"
                            >
                                {pc.name}
                            </button>
                            <ul className="space-y-4">
                                {categories
                                    .filter(c => c.parent_id === pc.id && !c.is_deleted)
                                    .map(cat => (
                                        <li key={cat.id}>
                                            <button
                                                onClick={() => onCategoryClick(String(pc.id), String(cat.id))}
                                                className="text-[12px] font-bold text-slate-400 hover:text-slate-900 transition-all text-left uppercase tracking-wider"
                                            >
                                                {cat.name}
                                            </button>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        © {new Date().getFullYear()} CMS SHOWCASE. TẤT CẢ QUYỀN ĐƯỢC BẢO LƯU.
                    </p>
                    <div className="flex items-center gap-10">
                        {['Về chúng tôi', 'Điều khoản', 'Bảo mật', 'Liên hệ'].map(item => (
                            <a key={item} href="#" className="text-[10px] font-black text-slate-300 hover:text-slate-900 uppercase tracking-[0.2em] transition-colors">{item}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
