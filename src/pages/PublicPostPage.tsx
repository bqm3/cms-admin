import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Editor, Frame } from "@craftjs/core";
import api from '../services/api';

// Imports same components as Editor
import { TextComponent } from "../components/Editor/Craft/Components/TextComponent";
import { Container } from "../components/Editor/Craft/Components/Container";
import { ButtonComponent } from "../components/Editor/Craft/Components/ButtonComponent";
import { ImageComponent } from "../components/Editor/Craft/Components/ImageComponent";
import { HeadingComponent } from "../components/Editor/Craft/Components/HeadingComponent";
import { CardComponent } from "../components/Editor/Craft/Components/CardComponent";
import { VideoComponent } from "../components/Editor/Craft/Components/VideoComponent";
import { TableComponent } from "../components/Editor/Craft/Components/TableComponent";
import { ShapeComponent } from "../components/Editor/Craft/Components/ShapeComponent";

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
                    params: { preview: searchParams.get('preview') }
                });
                setContent(response.data.content);
                document.title = response.data.title;
            } catch (err) {
                console.error(err);
                hasFetched.current = false; // Reset if failed
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug, searchParams]);

    if (loading) return <div className="bg-black text-zinc-500 h-screen flex items-center justify-center">Loading website...</div>;
    if (!content) return <div className="bg-black text-zinc-500 h-screen flex items-center justify-center">Website not found or not approved.</div>;

    return (
        <div className="min-h-screen bg-[#18181b]">
            <Editor
                enabled={false}
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
                }}
            >
                <Frame data={content} />
            </Editor>
        </div>
    );
}
