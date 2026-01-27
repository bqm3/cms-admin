import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Eye, Clock, ArrowUpDown, Layout } from "lucide-react";
import api, { SERVER_URL } from "../services/api";

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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-amber-950 p-3 rounded-2xl shadow-indigo-200 shadow-lg">
              <Layout className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Danh sách
              </h1>
              <p className="text-slate-500 font-medium">
                Khám phá các trang web cao cấp được xây dựng bởi cộng đồng của chúng tôi.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="flat"
              className="bg-slate-100 text-slate-700 font-bold"
              onClick={toggleSort}
              startContent={<ArrowUpDown size={18} />}
            >
              Sort by: {sort === "view_count:DESC" ? "Popularity" : "Order"}
            </Button>
            {/* <Button
              as={Link}
              to="/login"
              variant="solid"
              className="bg-amber-950 text-white font-bold shadow-indigo-100 shadow-xl"
            >
              Admin Portal
            </Button> */}
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium tracking-wide">
              Fetching amazing sites...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => (
              <a
                href={`/site/${post.slug || post.id}`}
                target="_blank"
                rel="noopener noreferrer"
                key={post.id}
                className="block group"
              >
                <Card className="bg-white border-transparent hover:border-indigo-500/30 transition-all duration-500 overflow-hidden shadow-md hover:shadow-2xl rounded-[2rem]">
                  <CardBody className="p-0">
                    <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                      {post.logo ? (
                        <img
                          src={`${SERVER_URL}${post.logo}`}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300 font-black text-2xl uppercase italic">
                          {post.title.substring(0, 2)}
                        </div>
                      )}
                    </div>

                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Built by {post.creator?.username || "Community Expert"}
                      </p>
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
