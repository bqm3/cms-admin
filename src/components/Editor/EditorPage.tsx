/* eslint-disable padding-line-between-statements */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
import { useEditor, Editor, Frame, Element } from "@craftjs/core";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Save,
  ChevronLeft,
  Image as ImageIcon,
  Layout,
  MonitorPlay,
  Layers,
  Eye,
} from "lucide-react";

import api, { SERVER_URL } from "../../services/api";

// Import các Craft Components
import { TextComponent } from "./Craft/Components/TextComponent";
import { Container } from "./Craft/Components/Container";
import { ButtonComponent } from "./Craft/Components/ButtonComponent";
import { ImageComponent } from "./Craft/Components/ImageComponent";
import { HeadingComponent } from "./Craft/Components/HeadingComponent";
import { CardComponent } from "./Craft/Components/CardComponent";
import { VideoComponent } from "./Craft/Components/VideoComponent";
import { TableComponent } from "./Craft/Components/TableComponent";
import { ShapeComponent } from "./Craft/Components/ShapeComponent";
import { RowComponent } from "./Craft/Components/RowComponent";
import { ColumnComponent } from "./Craft/Components/ColumnComponent";
import { NavbarComponent } from "./Craft/Components/NavbarComponent";
import { SectionComponent } from "./Craft/Components/SectionComponent";
import { GridComponent } from "./Craft/Components/GridComponent";
import { BadgeComponent } from "./Craft/Components/BadgeComponent";
import { AccordionComponent } from "./Craft/Components/AccordionComponent";
import { SpacerComponent } from "./Craft/Components/SpacerComponent";
import { Toolbox } from "./Craft/Toolbox";
import { SettingsPanel } from "./Craft/SettingsPanel";
import { DefaultNewPostFrame } from "./DefaultNewPostFrame";

// --- Sub Components ---

const SaveButton = ({ postInfo, isNew }: any) => {
  const { query } = useEditor();
  const navigate = useNavigate();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const state = query?.getState?.();
      const nodes = state?.nodes ?? {}; // ✅ luôn là object

      // ✅ Nếu editor chưa load nodes thì báo rõ
      if (!state || !state.nodes) {
        throw new Error(
          "Editor chưa sẵn sàng (nodes is null). Thử lại sau 1-2s hoặc sau khi Frame render xong.",
        );
      }

      const bad: any[] = [];
      Object.entries(nodes).forEach(([id, n]: any) => {
        if (!n?.data?.props)
          bad.push({ id, reason: "props is null/undefined", n });
        if (n?.data?.custom === null)
          bad.push({ id, reason: "custom is null", n });
      });

      if (bad.length) {
        console.error("BAD NODES:", bad);
        throw new Error("Có node bị null/undefined props/custom. Xem console.");
      }

      const json = query.serialize(); // serialize sau khi nodes ok

      console.log("json", json);

      const formData = new FormData();
      formData.append("title", (postInfo.title || "").trim());
      formData.append("category_id", String(postInfo.categoryId ?? ""));
      formData.append("content", json);
      formData.append("view_count", String(postInfo.viewCount ?? 0));
      if (postInfo.logoFile) formData.append("logo", postInfo.logoFile);

      if (isNew) {
        const res = await api.post("/posts", formData);
        navigate(`/editor/${res.data.id}`);
      } else {
        await api.put(`/posts/${id}`, formData);
      }
    } catch (err: any) {
      console.error("SAVE ERROR:", err);
      console.error("SERVER:", err?.response?.status, err?.response?.data);
      alert(
        "Lỗi khi lưu: " +
          (err?.response?.data?.message || err?.message || "Unknown"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      className="bg-indigo-600 font-medium px-6 shadow-lg shadow-indigo-500/20"
      color="primary"
      isLoading={saving}
      startContent={!saving && <Save size={18} />}
      onPress={handleSave}
    >
      {isNew ? "Xuất bản" : "Cập nhật thay đổi"}
    </Button>
  );
};

const ContentLoader = ({ content }: { content: string | null }) => {
  const { actions } = useEditor();

  useEffect(() => {
    if (!content) return;
    try {
      actions.deserialize(content);
    } catch (err) {
      console.error("Failed to deserialize content:", err);
    }
  }, [content, actions]);

  return null;
};

// --- Main Page ---

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new" || !id;

  const [postInfo, setPostInfo] = useState({
    title: "",
    categoryId: "",
    viewCount: 0,
    logoFile: null as File | null,
    logoUrl: "",
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [loadedContent, setLoadedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Post Data
  useEffect(() => {
    if (!isNew && id) {
      const loadPost = async () => {
        try {
          const res = await api.get(`/posts/public/${id}`);
          setPostInfo({
            title: res.data.title,
            categoryId: res.data.category_id || "",
            viewCount: res.data.view_count || 0,
            logoFile: null,
            logoUrl: res.data.logo ? `${SERVER_URL}${res.data.logo}` : "",
          });
          setLoadedContent(res.data.content);
        } catch (err) {
          console.error(err);
          navigate("/dashboard");
        } finally {
          setLoading(false);
        }
      };
      loadPost();
    }
  }, [id, isNew, navigate]);

  if (loading)
    return (
      <div className="bg-zinc-950 h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-zinc-500 font-medium text-xs tracking-widest uppercase">
          Loading Editor...
        </p>
      </div>
    );

  return (
    // ✅ Không cho page scroll ngoài, chỉ scroll trong 2 cột
    <div className="h-screen bg-zinc-950 text-white font-sans overflow-hidden">
      <Editor
        resolver={{
          DefaultNewPostFrame,
          TextComponent,
          Container,
          ButtonComponent,
          ImageComponent,
          HeadingComponent,
          CardComponent,
          VideoComponent,
          TableComponent,
          ShapeComponent,
          RowComponent,
          ColumnComponent,
          NavbarComponent,
          SectionComponent,
          GridComponent,
          BadgeComponent,
          AccordionComponent,
          SpacerComponent
        }}
      >
        <ContentLoader content={loadedContent} />

        {/* ✅ Header sticky */}
        <header className="sticky top-0 h-[72px] px-4 md:px-6 flex items-center justify-between gap-3 border-b border-white/10 bg-zinc-950/60 backdrop-blur-md z-50">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              isIconOnly
              className="min-w-10 w-10 h-10 p-0 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
              variant="light"
              onPress={() => navigate("/dashboard")}
            >
              <ChevronLeft size={18} />
            </Button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="font-medium">Trang chủ</span>
                <span className="opacity-50">•</span>
                <span className="font-medium">Chỉnh sửa</span>
                <span className="opacity-50">•</span>
                <span className="truncate max-w-[240px]">
                  {isNew ? "Bài viết mới" : `Bài viết #${id}`}
                </span>
              </div>

              <div className="mt-1 flex items-center gap-3 min-w-0">
                <Input
                  classNames={{
                    base: "w-[320px] max-w-[55vw]",
                    inputWrapper:
                      "h-10 rounded-xl bg-white/10 border border-white/20 hover:border-white/30 focus-within:border-indigo-400 focus-within:bg-white/15 transition-all duration-200 shadow-lg shadow-black/20 data-[hover=true]:bg-white/15",
                    input:
                      "text-white !text-white placeholder:!text-zinc-400 font-semibold caret-indigo-400",
                  }}
                  placeholder="Nhập tiêu đề bài viết..."
                  value={postInfo.title}
                  onChange={(e) =>
                    setPostInfo({ ...postInfo, title: e.target.value })
                  }
                />

                {/* Category pill */}
                <div className="hidden lg:flex items-center gap-2 px-3 h-10 rounded-xl bg-white/5 border border-white/10 text-zinc-200">
                  <Layout size={16} className="text-indigo-400" />
                  <select
                    className="bg-transparent outline-none text-[13px] font-semibold cursor-pointer"
                    value={postInfo.categoryId}
                    onChange={(e) =>
                      setPostInfo({ ...postInfo, categoryId: e.target.value })
                    }
                  >
                    <option className="bg-zinc-900" value="">
                      Chọn danh mục
                    </option>
                    {categories.map((cat) => (
                      <option
                        key={cat.id}
                        className="bg-zinc-900"
                        value={cat.id}
                      >
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Count pill */}
                {!isNew && (
                  <div className="hidden md:flex items-center gap-2 px-3 h-10 rounded-xl bg-white/5 border border-white/10 text-zinc-200">
                    <Eye size={16} className="text-amber-400" />
                    <input
                      type="number"
                      value={postInfo.viewCount}
                      onChange={(e) =>
                        setPostInfo({
                          ...postInfo,
                          viewCount: parseInt(e.target.value) || 0,
                        })
                      }
                      className="bg-transparent outline-none text-[13px] font-semibold w-16 text-center"
                      title="Chỉnh sửa lượt xem"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="md:hidden">
              <select
                className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-[13px] font-semibold text-zinc-200 outline-none"
                value={postInfo.categoryId}
                onChange={(e) =>
                  setPostInfo({ ...postInfo, categoryId: e.target.value })
                }
              >
                <option className="bg-zinc-900" value="">
                  Danh mục
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} className="bg-zinc-900" value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="group cursor-pointer h-10 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 text-zinc-200">
              <span
                className={`w-7 h-7 grid place-items-center rounded-lg border ${
                  postInfo.logoFile
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : "bg-white/5 border-white/10 text-indigo-300"
                }`}
              >
                <ImageIcon size={16} />
              </span>

              <span className="hidden sm:inline text-[13px] font-semibold text-zinc-300 group-hover:text-white">
                {postInfo.logoFile ? "Đã chọn logo" : "Tải logo"}
              </span>

              <input
                accept="image/*"
                className="hidden"
                type="file"
                onChange={(e) =>
                  setPostInfo({
                    ...postInfo,
                    logoFile: e.target.files?.[0] || null,
                  })
                }
              />
            </label>

            <div className="hidden md:block h-6 w-px bg-white/10 mx-1" />

            <SaveButton isNew={isNew} postInfo={postInfo} />
          </div>
        </header>

        {/* ✅ Workspace: 3 cột (Left Toolbox | Center Canvas | Right Settings) */}
        <div className="flex h-[calc(100vh-72px)] overflow-hidden">
          {/* ================= LEFT: Toolbox ================= */}
          <div className="w-72 min-h-0 bg-zinc-900 border-r border-white/5 flex flex-col shadow-xl z-10 overflow-hidden">
            <div className="shrink-0 h-10 flex items-center px-4 border-b border-white/5 bg-zinc-900/80 backdrop-blur">
              <Layers size={14} className="text-zinc-400 mr-2" />
              <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Thành phần
              </h2>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <Toolbox />
            </div>
          </div>

          {/* ================= CENTER: Canvas ================= */}
          <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <div className="p-8">
                <div className="flex justify-center">
                  <div className="w-full max-w-[1024px] shadow-2xl shadow-black ring-1 ring-white/5 min-h-[800px] transition-all">
                    <Frame>
                      {isNew ? (
                        <DefaultNewPostFrame />
                      ) : (
                        <Element
                          canvas
                          is={Container}
                          padding={40}
                          background="transparent"
                          width="100%"
                          height="100%"
                          className="min-h-full"
                        />
                      )}
                    </Frame>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer cố định theo cột center */}
            <div className="shrink-0 h-8 bg-zinc-900 border-t border-white/5 flex items-center justify-between px-4 text-[10px] text-zinc-500">
              <span>1024px (Máy tính)</span>
              <div className="flex gap-2">
                <span>Trạng thái: Sẵn sàng</span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: SettingsPanel ================= */}
          <div className="w-80 min-h-0 bg-zinc-900 border-l border-white/5 flex flex-col shadow-xl z-10 overflow-hidden">
            <div className="shrink-0 h-10 flex items-center px-4 bg-zinc-900 border-b border-white/5">
              <MonitorPlay className="text-zinc-400 mr-2" size={14} />
              <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Properties
              </h2>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
              <SettingsPanel />
            </div>
          </div>
        </div>
      </Editor>
    </div>
  );
}
