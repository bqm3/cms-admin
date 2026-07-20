/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-unknown-property */
import { Link, useNavigate } from "react-router-dom";
import { Card, CardBody } from "@heroui/card";
import { Clock, ChevronRight, ExternalLink } from "lucide-react";
import { SERVER_URL } from "../../services/api";
import { formatDate } from "../../utils/formatDate";

interface PostCardProps {
  post: any;
}
export function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();

  const imageUrl = post.logo
    ? post.logo.startsWith("http") || post.logo.startsWith("data:") || post.logo.startsWith("blob:")
      ? post.logo
      : `${SERVER_URL}${post.logo}`
    : "";

  return (
    <div
      className="font-sans block group h-full focus:outline-none relative cursor-pointer"
      onClick={() => window.open(`/${post.slug || post.id}`, "_blank")}
    >
      <Card className="bg-white border border-[#e6e6e6] hover:border-[#cccccc] transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg rounded-xl h-full flex flex-col">
        <CardBody className="p-0 flex-1 flex flex-col relative">
          {/* Image Container */}
          <div className="aspect-[16/10] bg-slate-50 overflow-hidden relative">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                width="288"
                height="288"
                loading="lazy"
                decoding="async"
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
              <div className="bg-white/95 backdrop-blur-md shadow-xl px-4 py-2 rounded-lg text-xs font-semibold text-[#ee4d2d] uppercase flex items-center gap-2 border border-slate-100">
                See Details <ChevronRight size={12} strokeWidth={3} />
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-2.5 group-hover:text-[#ee4d2d] transition-colors line-clamp-2 leading-tight tracking-tight">
              {post.title}
            </h3>

            {/* Sub-links (Vertical) */}
            <div className="flex flex-col gap-2 mb-4">
              {post.links && post.links.length > 0 ? (
                post.links.slice(0, 4).map((link: any) => (
                  <button
                    key={link.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(link.href, "_blank");
                    }}
                    className="w-full flex items-center justify-between bg-slate-50 hover:bg-[#ee4d2d] text-slate-700 hover:text-white px-5 py-3.5 rounded-[8px] text-[13px] font-bold border border-slate-200 hover:border-[#ee4d2d] transition-all duration-200 group/link relative z-20 shadow-sm active:scale-[0.98]"
                  >
                    <span className="truncate pr-2">{link.title}</span>
                    <ExternalLink size={14} className="opacity-40 group-hover/link:opacity-100 flex-shrink-0" />
                  </button>
                ))
              ) : null}
              {post.links && post.links.length > 4 && (
                <div className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest mt-1">
                  View {post.links.length - 4} more links in detail
                </div>
              )}
            </div>

            {/* View detail button */}
            <div className="mt-auto pt-3 border-t border-[#e6e6e6]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/${post.slug || post.id}`, "_blank");
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#ee4d2d] hover:bg-[#ee4d2d]/80 text-white text-[13px] font-bold px-4 py-2.5 rounded-[8px] transition-all duration-200 active:scale-[0.98] relative z-20"
              >
                See Details <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
