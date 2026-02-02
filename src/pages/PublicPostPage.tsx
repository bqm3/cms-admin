/* eslint-disable prettier/prettier */
import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Editor, Frame } from "@craftjs/core";
import api from "../services/api";
import { usePublicData } from "../hooks/usePublicData";
import { PublicFooter } from "../components/Public/PublicFooter";

// ✅ Import tất cả component mà editor có thể sinh ra trong content
import { DefaultNewPostFrame } from "../components/Editor/DefaultNewPostFrame";
import { MimicPCLandingFrame } from "../components/Editor/MimicPCLandingFrame";
import { PortfolioTemplate } from "../components/Editor/PortfolioTemplate";
import { BlogTemplate } from "../components/Editor/BlogTemplate";
import { ServiceTemplate } from "../components/Editor/ServiceTemplate";
import { ContactTemplate } from "../components/Editor/ContactTemplate";
import { ProductTemplate } from "../components/Editor/ProductTemplate";
import { StoreCouponTemplate } from "../components/Editor/StoreCouponTemplate";

// Craft components
import { TextComponent } from "../components/Editor/Craft/Components/TextComponent";
import { Container } from "../components/Editor/Craft/Components/Container";
import { ButtonComponent } from "../components/Editor/Craft/Components/ButtonComponent";
import { ImageComponent } from "../components/Editor/Craft/Components/ImageComponent";
import { HeadingComponent } from "../components/Editor/Craft/Components/HeadingComponent";
import { CardComponent } from "../components/Editor/Craft/Components/CardComponent";
import { VideoComponent } from "../components/Editor/Craft/Components/VideoComponent";
import { TableComponent } from "../components/Editor/Craft/Components/TableComponent";
import { ShapeComponent } from "../components/Editor/Craft/Components/ShapeComponent";
import { RowComponent } from "../components/Editor/Craft/Components/RowComponent";
import { ColumnComponent } from "../components/Editor/Craft/Components/ColumnComponent";

// ✅ Các component bạn từng dùng trong EditorPage
import { NavbarComponent } from "../components/Editor/Craft/Components/NavbarComponent";
import { SectionComponent } from "../components/Editor/Craft/Components/SectionComponent";
import { GridComponent } from "../components/Editor/Craft/Components/GridComponent";
import { BadgeComponent } from "../components/Editor/Craft/Components/BadgeComponent";
import { AccordionComponent } from "../components/Editor/Craft/Components/AccordionComponent";
import { SpacerComponent } from "../components/Editor/Craft/Components/SpacerComponent";
import { SliderComponent } from "@/components/Editor/Craft/Components/SliderComponent";
import { PresetFAQ } from "@/components/Editor/Craft/presets/PresetFAQ";
import { PresetFooter } from "@/components/Editor/Craft/presets/PresetFooter";
import { PresetHeader } from "@/components/Editor/Craft/presets/PresetHeader";
import { PresetHero } from "@/components/Editor/Craft/presets/PresetHero";
import { PresetOffersGrid } from "@/components/Editor/Craft/presets/PresetOffersGrid";
import { InputComponent } from "@/components/Editor/Craft/Components/InputComponent";
import { PopupModalComponent } from "@/components/Editor/Craft/Components/PopupModalComponent";
import { PopupOfferComponent } from "@/components/Editor/Craft/Components/PopupOfferComponent";

export function PublicPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { categories, parentCategories } = usePublicData();

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        const response = await api.get(`/posts/public/${slug}`, {
          params: { preview: searchParams.get("preview") },
        });

        setContent(response.data.content);
        document.title = response.data.title ?? "Website";
      } catch (err) {
        console.error(err);
        hasFetched.current = false;
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, searchParams]);

  const frameData = useMemo(() => {
    if (!content) return null;

    let parsed: any = content;
    if (typeof content === "string") {
      try {
        parsed = JSON.parse(content);
      } catch {
        return null;
      }
    }

    if (parsed?.nodes && typeof parsed.nodes === "object") return parsed.nodes;

    return parsed;
  }, [content]);

  const navigateToCategory = (parentId: string, categoryId: string) => {
    let url = `/category?parentCategory=${parentId}`;
    if (categoryId) url += `&category=${categoryId}`;
    navigate(url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading)
    return (
      <div className="text-slate-400 h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest">Đang tải nội dung...</p>
      </div>
    );

  if (!frameData)
    return (
      <div className="text-slate-400 h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="text-xl font-black text-slate-800 uppercase tracking-tight">Dự án không tồn tại</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Quay lại trang chủ</button>
      </div>
    );

  return (
    <div className="min-h-screen p-0 m-0 bg-white">
      <Editor
        enabled={false}
        resolver={{
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
        }}
      >
        <Frame data={frameData} />
      </Editor>

      <PublicFooter
        parentCategories={parentCategories}
        categories={categories}
        onCategoryClick={navigateToCategory}
      />
    </div>
  );
}
