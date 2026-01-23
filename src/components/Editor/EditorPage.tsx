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
    const json = query.serialize();

    try {
      const formData = new FormData();
      formData.append("title", postInfo.title);
      formData.append("category_id", postInfo.categoryId);
      formData.append("content", json);

      if (postInfo.logoFile) formData.append("logo", postInfo.logoFile);

      if (isNew) {
        const res = await api.post("/posts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        navigate(`/editor/${res.data.id}`);
      } else {
        await api.put(`/posts/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
    } catch (err) {
      console.error(err);
      alert("Save failed");
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
      {isNew ? "Publish" : "Update Changes"}
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
    if (isNew || !id) return;

    const loadPost = async () => {
      try {
        const res = await api.get(`/posts/public/${id}`);
        setPostInfo({
          title: res.data.title,
          categoryId: res.data.category_id || "",
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
    // ✅ Page scroll: bỏ h-screen + overflow-hidden
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-y-auto">
      <Editor
        resolver={{
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
                <span className="font-medium">Dashboard</span>
                <span className="opacity-50">•</span>
                <span className="font-medium">Editor</span>
                <span className="opacity-50">•</span>
                <span className="truncate max-w-[240px]">
                  {isNew ? "Bài viết mới" : `Post #${id}`}
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

                <div className="hidden md:flex items-center gap-2 px-3 h-10 rounded-xl bg-white/5 border border-white/10 text-zinc-200">
                  <Layout className="text-indigo-400" size={16} />
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

        {/* ✅ Workspace: không overflow-hidden, để content kéo dài */}
        <div className="flex">
          {/* Canvas Area (no internal scroll) */}
          <div className="flex-1  relative flex flex-col">
            <div className="p-8">
              <div className="flex justify-center">
                <div className="w-full max-w-[1024px]  shadow-2xl shadow-black ring-1 ring-white/5 min-h-[800px] transition-all">
                  {isNew ? (
                    <DefaultNewPostFrame />
                  ) : (
                    <Frame>
                      <Element
                        canvas
                        background="transparent"
                        className="min-h-full"
                        height="100%"
                        is={Container}
                        padding={40}
                        width="100%"
                      />
                    </Frame>
                  )}
                </div>
              </div>
            </div>

            {/* Footer theo content */}
            <div className="h-8 bg-zinc-900 border-t border-white/5 flex items-center justify-between px-4 text-[10px] text-zinc-500">
              <span>1024px (Desktop)</span>
              <div className="flex gap-2">
                <span>Auto-save: Ready</span>
              </div>
            </div>
          </div>

          {/* ✅ Sidebar sticky + chống tràn
              - Sticky dưới header: top-[72px]
              - Max height theo viewport: max-h-[calc(100vh-72px)]
              - Chỉ sidebar scroll khi quá dài: overflow-y-auto
          */}
          <aside className="w-80 bg-zinc-900 border-l border-white/5 shadow-xl z-10 sticky top-[72px] self-start max-h-[calc(100vh-72px)] overflow-y-auto custom-scrollbar">
            {/* Toolbox */}
            <div className="bg-zinc-900/50 border-b border-white/5">
              <div className="h-10 flex items-center px-4 border-b border-white/5 bg-zinc-900/80 backdrop-blur">
                <Layers className="text-zinc-400 mr-2" size={14} />
                <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Components
                </h2>
              </div>
              <Toolbox />
            </div>

            {/* Settings */}
            <div className="bg-zinc-900">
              <div className="h-10 flex items-center px-4 bg-zinc-900 border-b border-white/5">
                <MonitorPlay className="text-zinc-400 mr-2" size={14} />
                <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Properties
                </h2>
              </div>
              <div className="p-4">
                <SettingsPanel />
              </div>
            </div>
          </aside>
        </div>
      </Editor>
    </div>
  );
}
