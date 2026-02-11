import { Link, useNavigate } from "react-router-dom";
import { Card, CardBody } from "@heroui/card";
import { Clock, ChevronRight } from "lucide-react";
import { SERVER_URL } from "../../services/api";
import { formatDate } from "../../utils/formatDate";

interface PostCardProps {
    post: any;
}
export function PostCard({ post }: PostCardProps) {
    const navigate = useNavigate();

    return (
        <div
            className="font-sans block group h-full focus:outline-none relative cursor-pointer"
            onClick={() => window.open(`/site/${post.slug || post.id}`, "_blank")}
        >
            <Card className="bg-white border border-[#e6e6e6] hover:border-[#cccccc] transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg rounded-xl h-full flex flex-col">
                <CardBody className="p-0 flex-1 flex flex-col relative">
                    {/* Image Container */}
                    <div className="aspect-[16/10] bg-slate-50 overflow-hidden relative">
                        {post.logo ? (
                            <img
                                src={`${SERVER_URL}${post.logo}`}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300 font-black text-3xl uppercase italic tracking-tighter">
                                {post.title.substring(0, 2)}
                            </div>
                        )}

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Hover Action Badge */}
                        <div className="absolute top-4 right-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out z-10">
                            <div className="bg-white/95 backdrop-blur-md shadow-xl px-4 py-2 rounded-lg text-xs font-semibold text-[#21294a] uppercase flex items-center gap-2 border border-slate-100">
                                See details <ChevronRight size={12} strokeWidth={3} />
                            </div>
                        </div>
                    </div>

                    {/* Content area */}
                    <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-2.5 group-hover:text-[#21294a] transition-colors line-clamp-2 leading-tight tracking-tight">
                            {post.title}
                        </h3>

                        {/* Category Badges Below Title */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            {post.category?.parent && (
                                <Link
                                    to={`/category/${post.category.parent.slug}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className="bg-slate-50 text-[#21294a] px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border border-slate-200/50 hover:bg-[#21294a] hover:text-white transition-all z-20 relative"
                                >
                                    {post.category.parent.name}
                                </Link>
                            )}
                            {post.category && (
                                <Link
                                    to={`/category/${post.category?.parent?.slug || "all"}/${post.category.slug}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className="bg-slate-50 text-[#666666] px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border border-slate-200/50 hover:bg-slate-200 transition-all z-20 relative"
                                >
                                    {post.category.name}
                                </Link>
                            )}
                        </div>

                        <div className="mt-auto pt-4 border-t border-[#e6e6e6] flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-black group-hover:text-[#21294a] transition-colors">
                                <Clock size={20} />
                                <span className="text-[15px] font-medium uppercase tracking-wider">
                                    {formatDate(post.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
