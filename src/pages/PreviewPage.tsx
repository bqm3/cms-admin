/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useMemo } from "react";
import { Editor, Frame } from "@craftjs/core";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LayoutGrid } from "lucide-react";
import { usePublicData } from "../hooks/usePublicData";
import { PublicHeader } from "../components/Public/PublicHeader";
import { PublicFooter } from "../components/Public/PublicFooter";

// Components for resolver
import { DefaultNewPostFrame } from "../components/Editor/DefaultNewPostFrame";
import { MimicPCLandingFrame } from "../components/Editor/MimicPCLandingFrame";
import { PortfolioTemplate } from "../components/Editor/PortfolioTemplate";
import { BlogTemplate } from "../components/Editor/BlogTemplate";
import { ServiceTemplate } from "../components/Editor/ServiceTemplate";
import { ContactTemplate } from "../components/Editor/ContactTemplate";
import { ProductTemplate } from "../components/Editor/ProductTemplate";
import { StoreCouponTemplate } from "../components/Editor/StoreCouponTemplate";

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
import { NavbarComponent } from "../components/Editor/Craft/Components/NavbarComponent";
import { SectionComponent } from "../components/Editor/Craft/Components/SectionComponent";
import { GridComponent } from "../components/Editor/Craft/Components/GridComponent";
import { BadgeComponent } from "../components/Editor/Craft/Components/BadgeComponent";
import { AccordionComponent } from "../components/Editor/Craft/Components/AccordionComponent";
import { SpacerComponent } from "../components/Editor/Craft/Components/SpacerComponent";
import { SliderComponent } from "../components/Editor/Craft/Components/SliderComponent";
import { PresetFAQ } from "../components/Editor/Craft/presets/PresetFAQ";
import { PresetFooter } from "../components/Editor/Craft/presets/PresetFooter";
import { PresetHeader } from "../components/Editor/Craft/presets/PresetHeader";
import { PresetHero } from "../components/Editor/Craft/presets/PresetHero";
import { PresetOffersGrid } from "../components/Editor/Craft/presets/PresetOffersGrid";
import { InputComponent } from "../components/Editor/Craft/Components/InputComponent";
import { PopupModalComponent } from "../components/Editor/Craft/Components/PopupModalComponent";
import { PopupOfferComponent } from "../components/Editor/Craft/Components/PopupOfferComponent";

export function PreviewPage() {
  const navigate = useNavigate();
  const { categories, parentCategories } = usePublicData();
  const [content, setContent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const data = localStorage.getItem("craft_preview_content");
    if (data) {
      setContent(data);
    }
  }, []);

  const frameData = useMemo(() => {
    if (!content) return null;
    try {
      const parsed = JSON.parse(content);
    return parsed?.nodes || parsed;
    } catch (e) {
      console.error("Preview data error:", e);
      return null;
    }
  }, [content]);

  const navigateToCategory = () => {
    // Disable navigation in preview mode
    console.log("Navigation disabled in preview mode");
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    // Disable search in preview mode
    console.log("Search disabled in preview mode");
  };

  if (!content) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 font-sans">
        <LayoutGrid size={48} className="mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-slate-600 mb-2">Không có nội dung xem trước</h2>
        <p className="text-sm">Vui lòng quay lại editor và nhấn "Xem nhanh".</p>
        <Link to="/dashboard" className="mt-6 text-[#21294a] font-bold hover:underline select-none">Quay lại Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Xem trước - Global Promotion</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <PublicHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
        parentCategories={parentCategories}
        categories={categories}
        isPreview={true}
      />
      <div className="fixed top-24 right-4 z-[9999] pointer-events-none">
        <div className="bg-[#21294a] text-white px-4 py-2 rounded-full text-xs font-black shadow-2xl shadow-[#21294a]/50 uppercase tracking-widest border border-white/20 backdrop-blur-md">
          Chế độ xem trước
        </div>
      </div>
      <Editor
        enabled={false}
        resolver={{
          MimicPCLandingFrame,
          DefaultNewPostFrame,
          PortfolioTemplate,
          BlogTemplate,
          ServiceTemplate,
          ContactTemplate,
          ProductTemplate,
          StoreCouponTemplate,
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
        isPreview={true}
      />
    </div>
  );
}
