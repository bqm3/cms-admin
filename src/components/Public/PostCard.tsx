/* eslint-disable prettier/prettier */
import { Card, CardBody } from "@heroui/card";
import { Clock, ChevronRight } from "lucide-react";
import { SERVER_URL } from "../../services/api";
import { formatDate } from "../../utils/formatDate";

interface PostCardProps {
    post: any;
}

export function PostCard({ post }: PostCardProps) {
    return (
        <a
            href={`/site/${post.slug || post.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans block group h-full focus:outline-none"
        >
            <Card className="bg-white border border-slate-200/50 hover:border-blue-500/30 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 rounded-xl h-full flex flex-col">
                <CardBody className="p-0 flex-1 flex flex-col">
                    {/* Image Container */}
                    <div className="aspect-[16/10] bg-slate-50 overflow-hidden relative">
                        {post.logo ? (
                            <img
                                src={`${SERVER_URL}${post.logo}`}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-200 font-black text-3xl uppercase italic tracking-tighter">
                                {post.title.substring(0, 2)}
                            </div>
                        )}

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Hover Action Badge */}
                        <div className="absolute top-4 right-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out z-10">
                            <div className="bg-white/95 backdrop-blur-md shadow-xl px-4 py-2 rounded-lg text-[11px] font-semibold text-[#0067ff] uppercase flex items-center gap-2 border border-blue-50">
                                Xem chi tiết <ChevronRight size={12} strokeWidth={3} />
                            </div>
                        </div>
                    </div>

                    {/* Content area */}
                    <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-2.5 group-hover:text-[#0067ff] transition-colors line-clamp-2 leading-tight tracking-tight">
                            {post.title}
                        </h3>

                        {/* Category Badges Below Title */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            {post.category?.parent?.name && (
                                <span className="bg-blue-50 text-[#0067ff] px-3 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider border border-blue-100/30">
                                    {post.category.parent.name}
                                </span>
                            )}
                            {post.category?.name && (
                                <span className="bg-slate-50 text-[#666666] px-3 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider border border-slate-200/50">
                                    {post.category.name}
                                </span>
                            )}
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[11px] font-bold text-blue-500 uppercase">
                                    {post.creator?.username?.[0] || 'U'}
                                </div>
                                <span className="text-[#666666] text-[13px] font-medium tracking-tight truncate max-w-[120px]">
                                    @{post.creator?.username || "user"}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[#999999] group-hover:text-[#0067ff] transition-colors">
                                <Clock size={13} />
                                <span className="text-[12px] font-medium uppercase tracking-wider">
                                    {formatDate(post.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </a>
    );
}
