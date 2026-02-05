/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable padding-line-between-statements */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
import { useEditor, Editor, Frame, Element } from "@craftjs/core";
import { useState, useEffect, useRef } from "react";
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
  FileText,
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
import { PopupModalComponent } from "./Craft/Components/PopupModalComponent";
import { InputComponent } from "./Craft/Components/InputComponent";

// --- Frame Default ---
import { DefaultNewPostFrame } from "./DefaultNewPostFrame";
import { MimicPCLandingFrame } from "./MimicPCLandingFrame";
import { PortfolioTemplate } from "./PortfolioTemplate";
import { BlogTemplate } from "./BlogTemplate";
import { ServiceTemplate } from "./ServiceTemplate";
import { ContactTemplate } from "./ContactTemplate";
import { ProductTemplate } from "./ProductTemplate";
import { StoreCouponTemplate } from "./StoreCouponTemplate";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure
} from "@heroui/modal";

// Presets
import { PresetHeader } from "./Craft/presets/PresetHeader";
import { PresetHero } from "./Craft/presets/PresetHero";
import { PresetOffersGrid } from "./Craft/presets/PresetOffersGrid";
import { PresetFAQ } from "./Craft/presets/PresetFAQ";
import { PresetFooter } from "./Craft/presets/PresetFooter";
import { SliderComponent } from "./Craft/Components/SliderComponent";
import { PopupOfferComponent } from "./Craft/Components/PopupOfferComponent";

// ✅ Move resolver outside to keep it stable
const CRAFT_RESOLVER = {
  // Default frame
  MimicPCLandingFrame,
  DefaultNewPostFrame,
  PortfolioTemplate,
  BlogTemplate,
  ServiceTemplate,
  ContactTemplate,
  ProductTemplate,
  StoreCouponTemplate,
  // Component
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
  SpacerComponent,
  SliderComponent,
  InputComponent,
  PopupModalComponent,
  PopupOfferComponent,
  // Preset
  PresetHeader,
  PresetHero,
  PresetOffersGrid,
  PresetFAQ,
  PresetFooter,
};

// --- Sub Components ---
const SaveButton = ({ postInfo, isNew }: any) => {
  const { query } = useEditor();
  const navigate = useNavigate();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const state = query.getState();
      const nodes = state.nodes;

      // ✅ Enhanced validation with more detailed error reporting
      const bad: any[] = [];
      const fixedNodes: any = {};

      for (const [nodeId, node] of Object.entries(nodes as any)) {
        const n = node as any;
        const d = n?.data;

        // Create a fixed version of the node
        fixedNodes[nodeId] = { ...n };

        if (!d) {
          bad.push({
            nodeId,
            name: n?.displayName || "Unknown",
            field: "data (missing entirely)",
            value: d,
          });
          continue;
        }

        // Fix props if invalid
        if (!d.props || typeof d.props !== "object" || Array.isArray(d.props)) {
          bad.push({
            nodeId,
            name: d.displayName || "Unknown",
            field: "data.props",
            value: d.props,
            fixed: true,
          });
          fixedNodes[nodeId].data = {
            ...d,
            props: d.props && typeof d.props === "object" ? d.props : {},
          };
        }

        // Fix linkedNodes if invalid
        if (
          d.linkedNodes !== undefined &&
          (d.linkedNodes === null ||
            typeof d.linkedNodes !== "object" ||
            Array.isArray(d.linkedNodes))
        ) {
          bad.push({
            nodeId,
            name: d.displayName || "Unknown",
            field: "data.linkedNodes",
            value: d.linkedNodes,
            fixed: true,
          });
          fixedNodes[nodeId].data = {
            ...fixedNodes[nodeId].data,
            linkedNodes: typeof d.linkedNodes === "object" ? d.linkedNodes : {},
          };
        }

        // Fix nodes if invalid (should be array or undefined)
        if (
          d.nodes !== undefined &&
          d.nodes !== null &&
          !Array.isArray(d.nodes)
        ) {
          bad.push({
            nodeId,
            name: d.displayName || "Unknown",
            field: "data.nodes",
            value: d.nodes,
            fixed: true,
          });
          fixedNodes[nodeId].data = {
            ...fixedNodes[nodeId].data,
            nodes: [],
          };
        }
      }

      console.log("Validation results:", bad);
      if (bad.length > 0) {
        console.table(bad);
      }

      // ✅ Check if there are any unfixable errors
      const unfixableErrors = bad.filter((b) => !b.fixed);
      if (unfixableErrors.length > 0) {
        throw new Error(
          `Found ${unfixableErrors.length} unfixable node errors. Check console for details.`,
        );
      }

      // ✅ If we had to fix nodes, temporarily apply fixes
      let json: string;
      if (bad.length > 0) {
        console.warn(`Fixed ${bad.length} node issues before serialization`);
        // Create temporary state with fixed nodes
        const tempState = { ...state, nodes: fixedNodes };

        // Manually serialize with fixed state
        // Note: This is a workaround - ideally you'd fix the source of bad nodes
        try {
          json = JSON.stringify(tempState.nodes);
        } catch (err) {
          console.error("Failed to serialize even after fixes:", err);
          throw new Error(
            "Unable to serialize editor state. Please refresh and try again.",
          );
        }
      } else {
        // Normal serialization
        json = query.serialize();
      }

      console.log("Serialized JSON length:", json.length);
      if (postInfo.category_id == "") {
        alert("Thiếu danh mục!");
        return;
      }

      const formData = new FormData();
      formData.append("title", (postInfo.title || "").trim());
      formData.append("category_id", String(postInfo.category_id ?? ""));
      formData.append("content", json);
      formData.append("view_count", String(postInfo.viewCount ?? 0));
      formData.append("is_hidden", String(postInfo.isHidden));
      formData.append("description", postInfo.description || "");
      if (postInfo.logoFile) formData.append("logo", postInfo.logoFile);

      if (isNew) {
        if (isNew) {
          const res = await api.post("/posts", formData);

          alert("🎉 Xuất bản thành công!");
          navigate(`/editor/${res.data.id}`);
        }
      } else {
        const res = await api.put(`/posts/${id}`, formData);
        console.log("Post updated:", res.data);

        alert("✅ Cập nhật thành công!");
      }
    } catch (err: any) {
      console.error("SAVE ERROR:", err);
      console.error("SERVER:", err?.response?.status, err?.response?.data);

      let errorMessage = "Lỗi khi lưu: ";
      if (err?.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err?.message) {
        errorMessage += err.message;
      } else {
        errorMessage += "Unknown error";
      }

      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      className="bg-[#21294a] font-bold px-6 shadow-md shadow-[#21294a]/20"
      color="primary"
      size="sm"
      isLoading={saving}
      startContent={!saving && <Save size={16} />}
      onPress={handleSave}
    >
      {isNew ? "Xuất bản" : "Cập nhật thay đổi"}
    </Button>
  );
};

const PreviewButton = () => {
  const { query } = useEditor();
  const handlePreview = () => {
    const json = query.serialize();
    localStorage.setItem("craft_preview_content", json);
    window.open("/preview", "_blank");
  };

  return (
    <Button
       variant="flat"
       size="sm"
       className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-4"
       onPress={handlePreview}
       startContent={<Eye size={16} />}
    >
      Xem nhanh
    </Button>
  );
};

const ContentLoader = ({ content }: { content: string | null }) => {
  const { actions } = useEditor();
  const initialized = useRef(false);

  useEffect(() => {
    if (!content || initialized.current) return;
    
    try {
      actions.deserialize(content);
      initialized.current = true; // Đánh dấu đã nạp xong, không nạp lại nữa
    } catch (err) {
      console.error("Failed to deserialize content:", err);
    }
  }, [content, actions]);

  // Reset flag if content is explicitly cleared (e.g. for a new blank state)
  useEffect(() => {
    if (content === null) {
      initialized.current = false;
    }
  }, [content]);

  return null;
};

// --- Description Modal Content (Sub-component to avoid lag) ---
const DescriptionModalContent = ({ initialDescription, onSave }: { initialDescription: string, onSave: (desc: string) => void }) => {
  const [localDesc, setLocalDesc] = useState(initialDescription);
  
  return (
    <ModalContent>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Mô tả bài viết (SEO)</h2>
        <p className="text-sm font-medium text-zinc-400">Đoạn mô tả ngắn hiển thị trên kết quả tìm kiếm và khi chia sẻ liên kết.</p>
      </ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
              Nội dung mô tả
            </label>
            <textarea
              className="w-full h-40 bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-sm font-medium text-zinc-200 outline-none focus:border-[#21294a]/50 transition-all resize-none custom-scrollbar"
              placeholder="Nhập mô tả cho bài viết này..."
              value={localDesc}
              onChange={(e) => setLocalDesc(e.target.value)}
              autoFocus
            />
            <div className="flex justify-between px-1">
              <span className="text-[10px] text-zinc-500 font-bold">
                Gợi ý: 150 - 160 ký tự
              </span>
              <span className={`text-[10px] font-bold ${localDesc.length > 160 ? 'text-amber-500' : 'text-zinc-500'}`}>
                {localDesc.length} ký tự
              </span>
            </div>
          </div>
          <Button
            onPress={() => onSave(localDesc)}
            className="bg-[#21294a] font-bold h-12 rounded-xl text-white shadow-lg shadow-[#21294a]/20"
          >
            LƯU MÔ TẢ
          </Button>
        </div>
      </ModalBody>
    </ModalContent>
  );
};

// --- Optimize Title Input to avoid full page re-render ---
const TitleInput = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const [localTitle, setLocalTitle] = useState(value);

  useEffect(() => {
    setLocalTitle(value);
  }, [value]);

  return (
    <Input
      classNames={{
        base: "w-[280px] max-w-[50vw]",
        inputWrapper:
          "h-8 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 focus-within:border-[#21294a] focus-within:bg-white/10 transition-all duration-200 shadow-sm data-[hover=true]:bg-white/10",
        input:
          "text-white !text-white placeholder:!text-zinc-500 font-bold text-xs caret-[#21294a]",
      }}
      placeholder="Tiêu đề..."
      value={localTitle}
      onChange={(e) => setLocalTitle(e.target.value)}
      onBlur={() => {
        if (localTitle !== value) {
          onChange(localTitle);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          (e.target as HTMLInputElement).blur();
        }
      }}
    />
  );
};

// --- Main Page ---

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new" || !id;

  const [postInfo, setPostInfo] = useState({
    title: "",
    category_id: "",
    viewCount: 0,
    logoFile: null as File | null,
    logoUrl: "",
    isHidden: false,
    description: "",
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [loadedContent, setLoadedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const { isOpen: isTmplOpen, onOpen: onTmplOpen, onClose: onTmplClose } = useDisclosure({ defaultOpen: isNew });
  const { isOpen: isDescOpen, onOpen: onDescOpen, onClose: onDescClose } = useDisclosure();

  // Fetch Categories, Parent Categories & Templates
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, parentRes, templatesRes] = await Promise.all([
          api.get("/categories"),
          api.get("/parent-categories"),
          api.get("/templates/public")
        ]);
        setCategories(catRes.data || []);
        setParentCategories(parentRes.data.parentCategories || parentRes.data || []);

        // Templates from DB with their saved content
        const templatesFromDB = (templatesRes.data || []).map((tmpl: any) => ({
          ...tmpl,
          preview: tmpl.logo ? `${SERVER_URL}${tmpl.logo}` : "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400&h=300",
          description: tmpl.content ? "Template từ database" : "Mẫu thiết kế tùy chỉnh"
        }));

        setTemplates(templatesFromDB);
        if (templatesFromDB.length > 0 && !selectedTemplate) {
          setSelectedTemplate(templatesFromDB[0]);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  // Fetch Post Data when editing
  useEffect(() => {
    if (!isNew && id) {
      const fetchPost = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/posts/public/${id}`);
          const post = res.data;
          setPostInfo({
            title: post.title || "",
            category_id: String(post.category_id || ""),
            viewCount: post.view_count || 0,
            logoFile: null,
            logoUrl: post.logo || "",
            isHidden: post.is_hidden || false,
            description: post.description || "",
          });
          setLoadedContent(post.content || null);
        } catch (err) {
          console.error("Failed to fetch post:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, isNew]);

  // Load Template Content for new post
  useEffect(() => {
    if (isNew && selectedTemplate?.content) {
      setLoadedContent(selectedTemplate.content);
    }
  }, [isNew, selectedTemplate]);

  if (loading)
    return (
      <div className="bg-zinc-950 h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-[#21294a] rounded-full animate-spin" />
        <p className="text-zinc-500 font-bold text-[10px] tracking-widest uppercase">
          Loading Editor...
        </p>
      </div>
    );

  return (
    <div className="h-screen text-white font-sans overflow-hidden">
      <Editor
        enabled={true}
        resolver={CRAFT_RESOLVER}
      >
        <ContentLoader content={loadedContent} />

        {/* ✅ Header sticky */}
        <header className="sticky top-0 h-[60px] px-4 md:px-6 flex items-center justify-between gap-3 border-b border-white/10 bg-zinc-950 z-50">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              isIconOnly
              size="sm"
              className="min-w-8 w-8 h-8 p-0 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
              variant="light"
              onPress={() => navigate("/dashboard")}
            >
              <ChevronLeft size={16} />
            </Button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[9px] text-zinc-400 uppercase font-black tracking-wider">
                <span className="">Trang chủ</span>
                <span className="opacity-50">•</span>
                <span className="">Chỉnh sửa</span>
                <span className="opacity-50">•</span>
                <span className="truncate max-w-[200px] text-zinc-200">
                  {isNew ? "Mới" : `#${id}`}
                </span>
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <TitleInput
                  value={postInfo.title}
                  onChange={(val) => setPostInfo({ ...postInfo, title: val })}
                />

                {/* Category pill */}
                <div className="hidden lg:flex items-center gap-2 px-2.5 h-8 rounded-lg bg-white/5 border border-white/10 text-zinc-300">
                  <Layout size={14} className="text-[#21294a]" />
                  <select
                    className="bg-transparent outline-none text-[11px] font-bold cursor-pointer"
                    value={postInfo.category_id}
                    onChange={(e) =>
                      setPostInfo({ ...postInfo, category_id: e.target.value })
                    }
                  >
                    <option className="bg-zinc-900" value="">
                      Chọn danh mục
                    </option>
                    {/* Group categories by parent */}
                    {parentCategories.map((parent) => (
                      <optgroup key={parent.id} label={parent.name} className="bg-zinc-900 text-zinc-500 italic">
                        {categories
                          .filter((cat) => cat.parent_id === parent.id)
                          .map((cat) => (
                            <option key={cat.id} className="bg-zinc-900 text-white not-italic" value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                    {/* Categories without parent */}
                    <optgroup label="Khác" className="bg-zinc-900 text-zinc-500 italic">
                      {categories
                        .filter((cat) => !cat.parent_id)
                        .map((cat) => (
                          <option key={cat.id} className="bg-zinc-900 text-white not-italic" value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="md:hidden">
              <select
                className="h-8 px-2 rounded-md bg-white/5 border border-white/10 text-[11px] font-bold text-zinc-200 outline-none"
                value={postInfo.category_id}
                onChange={(e) =>
                  setPostInfo({ ...postInfo, category_id: e.target.value })
                }
              >
                <option className="bg-zinc-900" value="">
                  Danh mục
                </option>
                {parentCategories.map((parent) => (
                  <optgroup key={parent.id} label={parent.name} className="bg-zinc-900 text-zinc-500 italic">
                    {categories
                      .filter((cat) => cat.parent_id === parent.id)
                      .map((cat) => (
                        <option key={cat.id} className="bg-zinc-900 text-white not-italic" value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
                <optgroup label="Khác" className="bg-zinc-900 text-zinc-500 italic">
                  {categories
                    .filter((cat) => !cat.parent_id)
                    .map((cat) => (
                      <option key={cat.id} className="bg-zinc-900 text-white not-italic" value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            <label className="group cursor-pointer h-8 px-2.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 text-zinc-200">
              <span
                className={`w-6 h-6 grid place-items-center rounded border ${postInfo.logoFile
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : "bg-white/5 border-white/10 text-[#21294a]/60"
                  }`}
              >
                <ImageIcon size={14} />
              </span>

              <span className="hidden sm:inline text-[11px] font-bold text-zinc-300 group-hover:text-white">
                {postInfo.logoFile ? "Logo OK" : "Tải logo"}
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

            <button
              onClick={onDescOpen}
              className={`h-8 px-2.5 rounded-md border flex items-center gap-2 text-[11px] font-bold transition-all ${postInfo.description
                ? "bg-[#21294a]/15 border-[#21294a]/30 text-[#21294a]/60 hover:bg-[#21294a]/20"
                : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
                }`}
              title="Nhập mô tả bài viết (SEO)"
            >
              <FileText size={14} className={postInfo.description ? "text-[#21294a]" : ""} />
              <span className="hidden sm:inline">
                Mô tả
              </span>
            </button>

            <button
              onClick={() => setPostInfo({ ...postInfo, isHidden: !postInfo.isHidden })}
              className={`h-8 px-2.5 rounded-md border flex items-center gap-2 text-[11px] font-bold transition-all ${postInfo.isHidden
                ? "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
                }`}
              title={postInfo.isHidden ? "Bài viết đang ẩn" : "Bài viết công khai"}
            >
              <Eye size={14} className={postInfo.isHidden ? "opacity-50" : ""} />
              <span className="hidden sm:inline">
                {postInfo.isHidden ? "Đang ẩn" : "Công khai"}
              </span>
            </button>

            <div className="hidden md:block h-5 w-px bg-white/10 mx-1" />
            
            <PreviewButton />
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
                      <Element
                        canvas
                        is={Container}
                        padding={40}
                        background="transparent"
                        width="100%"
                        height="100%"
                        className="min-h-full"
                      />
                    </Frame>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Selector Modal */}
            <Modal
              isOpen={isTmplOpen}
              onClose={onTmplClose}
              size="5xl"
              backdrop="blur"
              scrollBehavior="inside"
              hideCloseButton
              classNames={{
                base: "bg-zinc-950 border border-white/10 rounded-xl",
                header: "border-b border-white/5 p-6",
                body: "p-6 custom-scrollbar",
              }}
            >
              <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Chọn mẫu thiết kế</h2>
                  <p className="text-sm font-medium text-zinc-400">Bắt đầu nhanh với các mẫu được thiết kế sẵn cho từng mục đích</p>
                  <p className="text-sm font-medium text-zinc-400">Bạn có thể bỏ qua bước này</p>
                </ModalHeader>
                <ModalBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((tmpl: any) => (
                      <div
                        key={tmpl.id}
                        onClick={() => {
                          setSelectedTemplate(tmpl);
                          onTmplClose();
                        }}
                        className="group cursor-pointer flex flex-col bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden hover:border-[#21294a]/50 hover:bg-zinc-900 transition-all duration-300"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={tmpl.preview}
                            alt={tmpl.title || tmpl.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                          <div className="absolute bottom-4 left-4">
                            <h3 className="text-lg font-bold text-white">{tmpl.title || tmpl.name}</h3>
                          </div>
                        </div>
                        <div className="p-4 flex-1">
                          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                            {tmpl.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ModalBody>
              </ModalContent>
            </Modal>

            {/* Description Editor Modal */}
            <Modal
              isOpen={isDescOpen}
              onClose={onDescClose}
              size="2xl"
              backdrop="blur"
              classNames={{
                base: "bg-zinc-950 border border-white/10 rounded-xl",
                header: "border-b border-white/5 p-6",
                body: "p-6",
              }}
            >
              <DescriptionModalContent 
                initialDescription={postInfo.description} 
                onSave={(newDesc) => {
                  setPostInfo({ ...postInfo, description: newDesc });
                  onDescClose();
                }} 
              />
            </Modal>

            {/* Footer cố định theo cột center */}
            {/* <div className="shrink-0 h-8 bg-white/5 border-t border-white/5 flex items-center justify-between px-4 text-[10px] text-zinc-500">
              <span>1024px (Máy tính)</span>
              <div className="flex gap-2">
                <span>Trạng thái: Sẵn sàng</span>
              </div>
            </div> */}
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
