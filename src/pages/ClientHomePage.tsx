import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Eye, Clock, ArrowUpDown, Layout } from "lucide-react";
import api, { SERVER_URL } from "../services/api";
import { formatDate } from "../utils/formatDate";

export function ClientHomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [sort, setSort] = useState("sequence_number:ASC");
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await api.get("/posts/public", {
        params: { sort },
      });
      setPosts(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sort]);

  const toggleSort = () => {
    setSort((prev) =>
      prev === "view_count:DESC" ? "sequence_number:ASC" : "view_count:DESC",
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white px-5 py-4 rounded-xl shadow-sm border border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-lg shadow-blue-100 shadow-md">
              <Layout className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Danh sách dự án
              </h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                Khám phá các trang web cao cấp
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="flat"
              size="sm"
              className="bg-slate-50 text-slate-700 font-bold rounded-lg border border-slate-200/50"
              onClick={toggleSort}
              startContent={<ArrowUpDown size={14} />}
            >
              Lọc theo: {sort === "view_count:DESC" ? "Lượt xem" : "Thứ tự"}
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Đang tải danh sách...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {posts.map((post) => (
              <a
                href={`/site/${post.slug || post.id}`}
                target="_blank"
                rel="noopener noreferrer"
                key={post.id}
                className="block group"
              >
                <Card className="bg-white border-transparent hover:border-blue-500/20 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md rounded-xl">
                  <CardBody className="p-0">
                    <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                      {post.logo ? (
                        <img
                          src={`${SERVER_URL}${post.logo}`}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50/50 text-blue-200 font-black text-2xl uppercase italic">
                          {post.title.substring(0, 2)}
                        </div>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-black text-blue-600 shadow-sm border border-blue-100 uppercase">
                          Xem trang
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5">
                      <h3 className="text-sm font-bold text-slate-800 mb-0.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {post.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-slate-400 text-[10px] font-medium">
                          @{post.creator?.username || "user"}
                        </p>
                        {/* <div className="flex items-center gap-1.5 text-slate-400">
                          <Eye size={10} />
                          <span className="text-[10px] font-bold">{post.view_count || 0}</span>
                        </div> */}
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock size={10} />
                          <span className="text-[10px] font-bold">{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
