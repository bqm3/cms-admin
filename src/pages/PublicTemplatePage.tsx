import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Editor, Frame } from "@craftjs/core";
import { Helmet } from "react-helmet-async";
import api from "../services/api";

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
import { NavbarComponent } from "../components/Editor/Craft/Components/NavbarComponent";
import { SectionComponent } from "../components/Editor/Craft/Components/SectionComponent";
import { GridComponent } from "../components/Editor/Craft/Components/GridComponent";
import { BadgeComponent } from "../components/Editor/Craft/Components/BadgeComponent";
import { AccordionComponent } from "../components/Editor/Craft/Components/AccordionComponent";
import { SpacerComponent } from "../components/Editor/Craft/Components/SpacerComponent";
import { SliderComponent } from "@/components/Editor/Craft/Components/SliderComponent";
import { TiptapComponent } from "../components/Editor/Craft/Components/TiptapComponent";
import { PresetFAQ } from "@/components/Editor/Craft/presets/PresetFAQ";
import { PresetFooter } from "@/components/Editor/Craft/presets/PresetFooter";
import { PresetHeader } from "@/components/Editor/Craft/presets/PresetHeader";
import { PresetHero } from "@/components/Editor/Craft/presets/PresetHero";
import { PresetOffersGrid } from "@/components/Editor/Craft/presets/PresetOffersGrid";
import { InputComponent } from "@/components/Editor/Craft/Components/InputComponent";
import { PopupModalComponent } from "@/components/Editor/Craft/Components/PopupModalComponent";
import { PopupOfferComponent } from "@/components/Editor/Craft/Components/PopupOfferComponent";

function stripHtmlToText(html: string) {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
}
function truncate(s: string, max = 160) {
  const x = (s || "").trim();
  if (x.length <= max) return x;
  return x.slice(0, max - 1).trimEnd() + "…";
}

export function PublicTemplatePage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const [seo, setSeo] = useState<{
    title: string;
    description: string;
    canonical: string;
    ogImage?: string;
    robots: string;
  }>({
    title: "Template",
    description: "Template",
    canonical: typeof window !== "undefined" ? window.location.href : "",
    robots: "index,follow",
  });

  useEffect(() => {
    const fetchTemplate = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        const preview = searchParams.get("preview");

        const response = await api.get(`/templates/public/${slug}`, {
          params: { preview },
        });

        const title = response.data.title ?? "Template";

        const rawDesc =
          (response.data.description && String(response.data.description).trim()) || "";

        const rawContent = response.data.content ?? "";
        const contentText =
          typeof rawContent === "string" ? stripHtmlToText(rawContent) : "";

        const description = truncate(rawDesc || contentText || title, 160);

        const ogImageRaw = response.data.cover_image || response.data.og_image || "";
        const ogImage = ogImageRaw
          ? ogImageRaw.startsWith("http")
            ? ogImageRaw
            : `${window.location.origin}${ogImageRaw}`
          : undefined;

        const canonical = window.location.origin + window.location.pathname;
        const robots = preview ? "noindex,nofollow" : "index,follow";

        setContent(rawContent);
        document.title = title; 

        setSeo({
          title,
          description,
          canonical,
          ogImage,
          robots,
        });
      } catch (err) {
        console.error(err);
        hasFetched.current = false;
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
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

  if (loading)
    return (
      <div className=" text-zinc-500 h-screen flex items-center justify-center">
        Loading template...
      </div>
    );

  if (!frameData)
    return (
      <div className=" text-zinc-500 h-screen flex items-center justify-center">
        Template not found or not approved.
      </div>
    );

  return (
    <div className="min-h-screen p-0 m-0">
      <Helmet prioritizeSeoTags>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={seo.canonical} />
        <meta name="robots" content={seo.robots} />

        {/* OpenGraph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={seo.canonical} />
        {seo.ogImage ? <meta property="og:image" content={seo.ogImage} /> : null}

        {/* Twitter */}
        <meta
          name="twitter:card"
          content={seo.ogImage ? "summary_large_image" : "summary"}
        />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        {seo.ogImage ? <meta name="twitter:image" content={seo.ogImage} /> : null}
      </Helmet>

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
          TiptapComponent,
          InputComponent,
          PopupModalComponent,
          PopupOfferComponent,
          // Preset
          PresetHeader,
          PresetHero,
          PresetOffersGrid,
          PresetFAQ,
          PresetFooter,
          //
        }}
      >
        <Frame data={frameData} />
      </Editor>
    </div>
  );
}
