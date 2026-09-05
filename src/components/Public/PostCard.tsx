/* eslint-disable jsx-a11y/no-static-element-interactions */
import { ExternalLink, ChevronRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { SERVER_URL } from "../../services/api";

interface PostCardProps {
  post: any;
}

// Helper function to highlight numbers and %
function renderHighlightedText(text: string) {
  if (!text) return "";
  
  // Split by numbers and %
  const regex = /(\d+(?:[.,]\d+)*%?|%)/g;
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (/^\d|%/.test(part)) {
      return (
        <span key={index} className="text-[#ee4d2d] text-[1.15em] font-extrabold">
          {part}
        </span>
      );
    }
    return part;
  });
}

export function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();

  const imageUrl = post.logo
    ? post.logo.startsWith("http") || post.logo.startsWith("data:") || post.logo.startsWith("blob:")
      ? post.logo
      : `${SERVER_URL}${post.logo}`
    : "";

  const firstLink = post.links && post.links.length > 0 ? post.links[0] : null;
  const postPath = `/${post.slug || post.id}`;

  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked link inside card, don't double navigate
    if ((e.target as HTMLElement).closest("a")) return;
    navigate(postPath);
  };

  return (
    <div
      className="group relative bg-white border border-[#e6e6e6] hover:border-[#cccccc] rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* HOT badge — top right */}
      {post.is_hot && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-[#ee4d2d] text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-[#ee4d2d]/40 border border-white/20">
          🔥 HOT
        </div>
      )}

      <div className="p-4 flex flex-col gap-3">
        {/* Top row: image + title */}
        <div className="flex items-center gap-3">
          {/* Image 64x64 */}
          <Link
            to={postPath}
            className="w-8 h-8 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 block"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                width="32"
                height="32"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300 font-black text-xl uppercase italic">
                {post.title?.substring(0, 2)}
              </div>
            )}
          </Link>

        {/* Title */}
        <h3 className="flex-1 text-[15px] font-bold text-[#1a1a1a] group-hover:text-[#ee4d2d] transition-colors line-clamp-3 leading-snug tracking-tight">
          <Link to={postPath} className="hover:underline">
            {renderHighlightedText(post.title)}
          </Link>
        </h3>
        </div>

        {/* First link — text style, 1 only */}
        {firstLink && (
          <a
            href={firstLink.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full flex items-center justify-between gap-2 text-left text-[13px] font-semibold hover:text-[#d9431f] border-t border-slate-100 pt-2 transition-colors group/link relative z-20"
          >
            <span className="truncate">{renderHighlightedText(firstLink.title)}</span>
            <ExternalLink size={13} className="shrink-0 opacity-60 group-hover/link:opacity-100 transition-opacity" />
          </a>
        )}

        {/* See details */}
        <Link
          to={postPath}
          onClick={(e) => e.stopPropagation()}
          className="w-full flex items-center justify-center gap-1.5 bg-[#ee4d2d] hover:bg-[#d9431f] text-white text-[12px] font-bold py-2 rounded-lg transition-all duration-200 active:scale-[0.98] relative z-20"
        >
          See Details <ChevronRight size={13} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}
