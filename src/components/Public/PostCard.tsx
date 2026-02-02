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
            className="block group h-full focus:outline-none"
        >
            <Card className="bg-white border border-slate-200/50 hover:border-blue-500/30 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 rounded-[2rem] h-full flex flex-col">
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
                            <div className="bg-white/95 backdrop-blur-md shadow-xl px-4 py-2 rounded-full text-[10px] font-black text-blue-600 uppercase flex items-center gap-2 border border-blue-50">
                                Khám phá ngay <ChevronRight size={12} strokeWidth={3} />
                            </div>
                        </div>
                    </div>

                    {/* Content area */}
                    <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-base font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                            {post.title}
                        </h3>

                        <div className="mt-auto pt-4 border-t border-slate-100/60 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-black text-blue-500 uppercase">
                                    {post.creator?.username?.[0] || 'U'}
                                </div>
                                <span className="text-slate-400 text-[11px] font-bold tracking-tight truncate max-w-[100px]">
                                    @{post.creator?.username || "user"}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-300 group-hover:text-blue-400 transition-colors">
                                <Clock size={12} />
                                <span className="text-[11px] font-bold uppercase tracking-wider">
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
