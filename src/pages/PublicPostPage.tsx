import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Editor, Frame } from "@craftjs/core";
import api from "../services/api";

// ✅ Import tất cả component mà editor có thể sinh ra trong content
import { DefaultNewPostFrame } from "../components/Editor/DefaultNewPostFrame";

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
// nếu bạn có SpacingComponent / v.v... cũng add vào đây

export function PublicPostPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
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
        return null; // content không phải JSON -> không render craft
      }
    }

    // ✅ nhiều backend lưu dạng { nodes: {...} }
    if (parsed?.nodes && typeof parsed.nodes === "object") return parsed.nodes;

    // ✅ nếu đã là nodes object luôn
    return parsed;
  }, [content]);

  if (loading)
    return (
      <div className=" text-zinc-500 h-screen flex items-center justify-center">
        Loading website...
      </div>
    );

  if (!frameData)
    return (
      <div className=" text-zinc-500 h-screen flex items-center justify-center">
        Website not found or not approved.
      </div>
    );

  return (
    <div className="min-h-screen">
      <Editor
        enabled={false}
        resolver={{
          // ROOT frame
          DefaultNewPostFrame,

          // base
          TextComponent,
          Container,
          ButtonComponent,
          ImageComponent,
          HeadingComponent,
          CardComponent,
          VideoComponent,
          TableComponent,
          ShapeComponent,
          SpacerComponent,
          RowComponent,
          ColumnComponent,

          // layout/sections
          NavbarComponent,
          SectionComponent,
          GridComponent,
          BadgeComponent,
          AccordionComponent,
        }}
      >
        <Frame data={frameData} />
      </Editor>
    </div>
  );
}
