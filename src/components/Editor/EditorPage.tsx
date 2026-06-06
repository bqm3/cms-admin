/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable padding-line-between-statements */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
import { Editor, Frame, Element, useEditor } from "@craftjs/core";
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
import { ScriptComponent } from "./Craft/Components/ScriptComponent";

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
  useDisclosure,
} from "@heroui/modal";

// Presets
import { PresetHeader } from "./Craft/presets/PresetHeader";
import { PresetHero } from "./Craft/presets/PresetHero";
import { PresetOffersGrid } from "./Craft/presets/PresetOffersGrid";
import { PresetFAQ } from "./Craft/presets/PresetFAQ";
import { PresetFooter } from "./Craft/presets/PresetFooter";
import { CRAFT_RESOLVER } from "./Craft/craftResolver";
import { SliderComponent } from "./Craft/Components/SliderComponent";
import { PopupOfferComponent } from "./Craft/Components/PopupOfferComponent";
import { TiptapComponent } from "./Craft/Components/TiptapComponent";

function isStoreCouponModuleContent(content: string | null | undefined) {
  if (!content) return false;
  try {
    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    return parsed?.pageType === "store_coupon_module_v1";
  } catch {
    return false;
  }
}

// ✅ Move resolver outside to keep it stable
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

      const bad: any[] = [];
      const fixedNodes: any = {};

      for (const [nodeId, node] of Object.entries(nodes as any)) {
        const n = node as any;
        const d = n?.data;

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

        if (d.nodes !== undefined && d.nodes !== null && !Array.isArray(d.nodes)) {
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

      if (bad.length > 0) console.table(bad);

      const unfixableErrors = bad.filter((b) => !b.fixed);
      if (unfixableErrors.length > 0) {
        throw new Error(
          `Found ${unfixableErrors.length} unfixable node errors. Check console for details.`,
        );
      }

      let json: string;
      if (bad.length > 0) {
        console.warn(`Fixed ${bad.length} node issues before serialization`);
        const tempState = { ...state, nodes: fixedNodes };
        try {
          json = JSON.stringify(tempState.nodes);
        } catch (err) {
          console.error("Failed to serialize even after fixes:", err);
          throw new Error(
            "Unable to serialize editor state. Please refresh and try again.",
          );
        }
      } else {
        json = query.serialize();
      }


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

      // ✅ meta
      formData.append("meta_override", String(!!postInfo.meta_override));
      formData.append("meta_title", (postInfo.meta_title || "").trim());
      formData.append("meta_keyword", (postInfo.meta_keyword || "").trim());
      formData.append("meta_description", (postInfo.meta_description || "").trim());

      if (postInfo.logoFile) formData.append("logo", postInfo.logoFile);

      if (isNew) {
        const res = await api.post("/posts", formData);
        alert("🎉 Xuất bản thành công!");
        navigate(`/editor/${res.data.id}`);
      } else {
        const res = await api.put(`/posts/${id}`, formData);
        alert("✅ Cập nhật thành công!");
      }
    } catch (err: any) {
      console.error("SAVE ERROR:", err);
      console.error("SERVER:", err?.response?.status, err?.response?.data);

      let errorMessage = "Lỗi khi lưu: ";
      if (err?.response?.data?.message) errorMessage += err.response.data.message;
      else if (err?.message) errorMessage += err.message;
      else errorMessage += "Unknown error";

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
      initialized.current = true;
    } catch (err) {
      console.error("Failed to deserialize content:", err);
    }
  }, [content, actions]);

  useEffect(() => {
    if (content === null) initialized.current = false;
  }, [content]);

  return null;
};

const TitleInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
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
        if (localTitle !== value) onChange(localTitle);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
    />
  );
};

const MetaModalContent = ({
  initial,
  onSave,
}: {
  initial: {
    meta_title: string;
    meta_keyword: string;
    meta_description: string;
    meta_override: boolean;
    title: string;
  };
  onSave: (v: {
    meta_title: string;
    meta_keyword: string;
    meta_description: string;
    meta_override: boolean;
  }) => void;
}) => {
  const [metaTitle, setMetaTitle] = useState(initial.meta_title || "");
  const [metaKeyword, setMetaKeyword] = useState(initial.meta_keyword || "");
  const [metaDesc, setMetaDesc] = useState(initial.meta_description || "");
  const [override, setOverride] = useState(!!initial.meta_override);

  useEffect(() => {
    setMetaTitle(initial.meta_title || "");
    setMetaKeyword(initial.meta_keyword || "");
    setMetaDesc(initial.meta_description || "");
    setOverride(!!initial.meta_override);
  }, [
    initial.meta_title,
    initial.meta_keyword,
    initial.meta_description,
    initial.meta_override,
  ]);

  return (
    <ModalContent>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Meta SEO</h2>
        <p className="text-sm font-medium text-zinc-400">
          Nếu bật “Ghi đè meta”, hệ thống sẽ dùng nội dung bạn nhập. Nếu tắt, backend tự sinh từ Title.
        </p>
      </ModalHeader>

      <ModalBody>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={override}
              onChange={(e) => setOverride(e.target.checked)}
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-200">Ghi đè meta (override)</span>
              <span className="text-xs text-zinc-500">
                Bật để dùng meta custom. Tắt để backend tự sinh theo title: <b>{initial.title || "-"}</b>
              </span>
            </div>
          </label>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
              meta_title
            </label>
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              isDisabled={!override}
              placeholder='Ví dụ: "Binance promotion latest"'
              classNames={{
                inputWrapper:
                  "h-10 rounded-xl bg-zinc-900/50 border border-white/10 data-[disabled=true]:opacity-50",
                input: "text-white text-sm font-medium",
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
              meta_keyword
            </label>
            <Input
              value={metaKeyword}
              onChange={(e) => setMetaKeyword(e.target.value)}
              isDisabled={!override}
              placeholder='Ví dụ: "Binance, Binance promotion, Binance promotion newest"'
              classNames={{
                inputWrapper:
                  "h-10 rounded-xl bg-zinc-900/50 border border-white/10 data-[disabled=true]:opacity-50",
                input: "text-white text-sm font-medium",
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
              meta_description
            </label>
            <textarea
              className="w-full h-36 bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-sm font-medium text-zinc-200 outline-none focus:border-[#21294a]/50 transition-all resize-none custom-scrollbar disabled:opacity-50"
              placeholder="Ví dụ: Use Globalpromotionllc.com to find the latest discount codes..."
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              disabled={!override}
            />
            <div className="flex justify-between px-1">
              <span className="text-[10px] text-zinc-500 font-bold">Gợi ý: 150 - 160 ký tự</span>
              <span
                className={`text-[10px] font-bold ${
                  metaDesc.length > 160 ? "text-amber-500" : "text-zinc-500"
                }`}
              >
                {metaDesc.length} ký tự
              </span>
            </div>
          </div>

          <Button
            onPress={() =>
              onSave({
                meta_title: metaTitle,
                meta_keyword: metaKeyword,
                meta_description: metaDesc,
                meta_override: override,
              })
            }
            className="bg-[#21294a] font-bold h-12 rounded-xl text-white shadow-lg shadow-[#21294a]/20"
          >
            LƯU META
          </Button>
        </div>
      </ModalBody>
    </ModalContent>
  );
};

/**
 * ✅ Component này PHẢI nằm trong <Editor> để dùng useEditor()
 * Sync title -> defaultAlt cho mọi Image node
 */
const TitleAltSync = ({ title, contentKey }: { title: string; contentKey?: string | null }) => {
  const { query, actions } = useEditor();

  useEffect(() => {
    const t = (title || "").trim();
    if (!t) return;

    const state = query.getState();
    const nodes = state?.nodes || {};

    Object.entries(nodes as any).forEach(([nodeId, node]: any) => {
      const displayName = node?.data?.displayName;
      if (displayName !== "Image") return;

      const props = node?.data?.props || {};

      // ✅ chỉ set defaultAlt nếu user chưa custom alt
      const userAlt = (props.alt || "").trim();
      const currentDefaultAlt = (props.defaultAlt || "").trim();

      // Nếu user đã nhập alt rồi thì không đè
      if (userAlt) return;

      if (currentDefaultAlt !== t) {
        actions.setProp(nodeId, (p: any) => {
          p.defaultAlt = t;
        });
      }
    });
  }, [title, contentKey, query, actions]);

  return null;
};


// --- Main Page ---
export function EditorPage() {
  const PUBLIC_SITE_URL =
    import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin;

  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new" || !id;

  const [postInfo, setPostInfo] = useState({
    title: "",
    slug: "",
    category_id: "",
    viewCount: 0,
    logoFile: null as File | null,
    logoUrl: "",
    isHidden: false,

    // ✅ meta fields
    meta_title: "",
    meta_keyword: "",
    meta_description: "",
    meta_override: false,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [loadedContent, setLoadedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const { isOpen: isTmplOpen, onClose: onTmplClose } = useDisclosure({
    defaultOpen: isNew,
  });
  const { isOpen: isMetaOpen, onOpen: onMetaOpen, onClose: onMetaClose } =
    useDisclosure();

  const buildViewUrl = () => {
    const slug = (postInfo as any)?.slug?.trim();
    if (!slug) return PUBLIC_SITE_URL;
    return `${PUBLIC_SITE_URL}/site/${slug}`;
  };

  // Fetch Categories, Parent Categories & Templates
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, parentRes, templatesRes] = await Promise.all([
          api.get("/categories"),
          api.get("/parent-categories"),
          api.get("/templates/public"),
        ]);

        setCategories(catRes.data || []);
        setParentCategories(parentRes.data.parentCategories || parentRes.data || []);

        const templatesFromDB = (templatesRes.data || []).map((tmpl: any) => ({
          ...tmpl,
          preview: tmpl.logo
            ? `${SERVER_URL}${tmpl.logo}`
            : "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400&h=300",
          description: tmpl.content ? "Template t? database" : "M?u thi?t k? tu? ch?nh",
        }));

        setTemplates(templatesFromDB);
        if (templatesFromDB.length > 0 && !selectedTemplate)
          setSelectedTemplate(templatesFromDB[0]);
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
          const res = await api.get(`/posts/public/${id}`, {
            params: { is_editor: "true" }
          });
          const post = res.data;

          if (post?.topic_name === "store-coupon-module" || isStoreCouponModuleContent(post?.content)) {
            navigate(`/module/${post.id}`, { replace: true });
            return;
          }

          setPostInfo({
            title: post.title || "",
            slug: post.slug || "",
            category_id: String(post.category_id || ""),
            viewCount: post.view_count || 0,
            logoFile: null,
            logoUrl: post.logo || "",
            isHidden: post.is_hidden || false,

            meta_title: post.meta_title || "",
            meta_keyword: post.meta_keyword || "",
            meta_description: post.meta_description || "",
            meta_override: !!post.meta_override,
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

  const useScriptNodes = () => {
  const { query } = useEditor();
  const state = query.getState();
  const nodes = state.nodes || {};

  const scripts = Object.entries(nodes)
    .filter(([_, n]: any) => n?.data?.displayName === "Script")
    .map(([id, n]: any) => ({
      id,
      props: n.data.props || {},
    }));

  return scripts;
};

  // Load Template Content for new post
  useEffect(() => {
    if (isNew && selectedTemplate?.content) setLoadedContent(selectedTemplate.content);
  }, [isNew, selectedTemplate]);

  if (loading) {
    return (
      <div className="bg-zinc-950 h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-[#21294a] rounded-full animate-spin" />
        <p className="text-zinc-500 font-bold text-[10px] tracking-widest uppercase">
          Loading Editor...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen text-white font-sans overflow-hidden">
      <Editor enabled={true} resolver={CRAFT_RESOLVER}>
        <ContentLoader content={loadedContent} />
        <TitleAltSync title={postInfo.title} contentKey={loadedContent} />

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
                <span>Trang chủ</span>
                <span className="opacity-50">•</span>
                <span>Chỉnh sửa</span>
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
                    className="bg-transparent outline-none text-xs font-bold cursor-pointer"
                    value={postInfo.category_id}
                    onChange={(e) => setPostInfo({ ...postInfo, category_id: e.target.value })}
                  >
                    <option className="bg-zinc-900" value="">
                      Chọn danh mục
                    </option>

                    {parentCategories.map((parent) => (
                      <optgroup
                        key={parent.id}
                        label={parent.name}
                        className="bg-zinc-900 text-zinc-500 italic"
                      >
                        {categories
                          .filter((cat) => cat.parent_id === parent.id)
                          .map((cat) => (
                            <option
                              key={cat.id}
                              className="bg-zinc-900 text-white not-italic"
                              value={cat.id}
                            >
                              {cat.name}
                            </option>
                          ))}
                      </optgroup>
                    ))}

                    <optgroup label="Khác" className="bg-zinc-900 text-zinc-500 italic">
                      {categories
                        .filter((cat) => !cat.parent_id)
                        .map((cat) => (
                          <option
                            key={cat.id}
                            className="bg-zinc-900 text-white not-italic"
                            value={cat.id}
                          >
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
                className="h-8 px-2 rounded-md bg-white/5 border border-white/10 text-xs font-bold text-zinc-200 outline-none"
                value={postInfo.category_id}
                onChange={(e) => setPostInfo({ ...postInfo, category_id: e.target.value })}
              >
                <option className="bg-zinc-900" value="">
                  Danh mục
                </option>

                {parentCategories.map((parent) => (
                  <optgroup
                    key={parent.id}
                    label={parent.name}
                    className="bg-zinc-900 text-zinc-500 italic"
                  >
                    {categories
                      .filter((cat) => cat.parent_id === parent.id)
                      .map((cat) => (
                        <option
                          key={cat.id}
                          className="bg-zinc-900 text-white not-italic"
                          value={cat.id}
                        >
                          {cat.name}
                        </option>
                      ))}
                  </optgroup>
                ))}

                <optgroup label="Khác" className="bg-zinc-900 text-zinc-500 italic">
                  {categories
                    .filter((cat) => !cat.parent_id)
                    .map((cat) => (
                      <option
                        key={cat.id}
                        className="bg-zinc-900 text-white not-italic"
                        value={cat.id}
                      >
                        {cat.name}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            <label className="group cursor-pointer h-8 px-2.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 text-zinc-200">
              <span
                className={`w-6 h-6 grid place-items-center rounded border ${
                  postInfo.logoFile
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : "bg-white/5 border-white/10 text-[#21294a]/60"
                }`}
              >
                <ImageIcon size={14} />
              </span>

              <span className="hidden sm:inline text-xs font-bold text-zinc-300 group-hover:text-white">
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

            {/* ✅ META button */}
            <button
              onClick={onMetaOpen}
              className={`h-8 px-2.5 rounded-md border flex items-center gap-2 text-xs font-bold transition-all ${
                postInfo.meta_override
                  ? "bg-[#21294a]/15 border-[#21294a]/30 text-[#21294a]/60 hover:bg-[#21294a]/20"
                  : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
              title="Meta SEO"
            >
              <FileText
                size={14}
                className={postInfo.meta_override ? "text-[#21294a]" : ""}
              />
              <span className="hidden sm:inline">Meta</span>
            </button>

            <button
              onClick={() => window.open(buildViewUrl(), "_blank")}
              className="h-8 px-2.5 rounded-md border flex items-center gap-2 text-xs font-bold
              bg-emerald-500/15 border-emerald-500/30 text-emerald-300
              hover:bg-emerald-500/20 transition-all"
              title="Xem trang công khai"
            >
              <Eye size={14} />
              <span className="hidden sm:inline">Xem trang</span>
            </button>

            <div className="hidden md:block h-5 w-px bg-white/10 mx-1" />

            <PreviewButton />
            <SaveButton isNew={isNew} postInfo={postInfo} />
          </div>
        </header>

        {/* ✅ Workspace */}
        <div className="flex h-[calc(100vh-72px)] overflow-hidden">
          {/* LEFT */}
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

          {/* CENTER */}
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
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Chọn mẫu thiết kế
                  </h2>
                  <p className="text-sm font-medium text-zinc-400">
                    Bắt đầu nhanh với các mẫu được thiết kế sẵn cho từng mục đích
                  </p>
                  <p className="text-sm font-medium text-zinc-400">
                    Bạn có thể bỏ qua bước này
                  </p>
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
                            <h3 className="text-lg font-bold text-white">
                              {tmpl.title || tmpl.name}
                            </h3>
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

            {/* ✅ Meta Editor Modal */}
            <Modal
              isOpen={isMetaOpen}
              onClose={onMetaClose}
              size="2xl"
              backdrop="blur"
              classNames={{
                base: "bg-zinc-950 border border-white/10 rounded-xl",
                header: "border-b border-white/5 p-6",
                body: "p-6",
              }}
            >
              <MetaModalContent
                initial={{
                  meta_title: postInfo.meta_title,
                  meta_keyword: postInfo.meta_keyword,
                  meta_description: postInfo.meta_description,
                  meta_override: postInfo.meta_override,
                  title: postInfo.title,
                }}
                onSave={(v) => {
                  setPostInfo({ ...postInfo, ...v });
                  onMetaClose();
                }}
              />
            </Modal>
          </div>

          {/* RIGHT */}
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
