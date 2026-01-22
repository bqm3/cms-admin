import { useEditor, Editor, Frame, Element } from "@craftjs/core";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Save, ChevronLeft, Image as ImageIcon, Layout, Settings, Rocket } from "lucide-react";
import api, { SERVER_URL } from "../../services/api";

import { TextComponent } from "./Craft/Components/TextComponent";
import { Container } from "./Craft/Components/Container";
import { ButtonComponent } from "./Craft/Components/ButtonComponent";
import { ImageComponent } from "./Craft/Components/ImageComponent";
import { HeadingComponent } from "./Craft/Components/HeadingComponent";
import { CardComponent } from "./Craft/Components/CardComponent";
import { VideoComponent } from "./Craft/Components/VideoComponent";
import { TableComponent } from "./Craft/Components/TableComponent";
import { ShapeComponent } from "./Craft/Components/ShapeComponent";
import { Toolbox } from "./Craft/Toolbox";
import { SettingsPanel } from "./Craft/SettingsPanel";

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
      formData.append('title', postInfo.title);
      formData.append('category_id', postInfo.categoryId);
      formData.append('content', json);
      if (postInfo.logoFile) {
        formData.append('logo', postInfo.logoFile);
      }

      if (isNew) {
        const res = await api.post('/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        navigate(`/editor/${res.data.id}`);
      } else {
        await api.put(`/posts/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
    } catch (err) {
      console.error(err);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      onClick={handleSave}
      isLoading={saving}
      style={{ background: '#6366f1', color: 'white' }}
      startContent={<Save size={18} />}
    >
      {isNew ? 'Publish' : 'Update'}
    </Button>
  );
};

// Component mới để load content vào Editor
const ContentLoader = ({ content }: { content: string | null }) => {
  const { actions } = useEditor();

  useEffect(() => {
    if (content) {
      try {
        actions.deserialize(content);
      } catch (err) {
        console.error('Failed to deserialize content:', err);
      }
    }
  }, [content, actions]);

  return null;
};

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new' || !id;

  const [postInfo, setPostInfo] = useState({
    title: '',
    categoryId: '',
    logoFile: null as File | null,
    logoUrl: ''
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [loadedContent, setLoadedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      const loadPost = async () => {
        try {
          const res = await api.get(`/posts/public/${id}`);
          setPostInfo({
            title: res.data.title,
            categoryId: res.data.category_id || '',
            logoFile: null,
            logoUrl: res.data.logo ? `${SERVER_URL}${res.data.logo}` : ''
          });
          setLoadedContent(res.data.content);
        } catch (err) {
          console.error(err);
          navigate('/dashboard');
        } finally {
          setLoading(false);
        }
      };
      loadPost();
    }
  }, [id, isNew, navigate]);

  if (loading) return (
    <div className="bg-slate-50 h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Booting Editor Core</p>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-black text-white selection:bg-purple-500/30">
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
        }}
      >
        {/* Component để load content */}
        <ContentLoader content={loadedContent} />
        
        <div style={{ height: '80px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              variant="flat"
              onClick={() => navigate('/dashboard')}
              style={{ minWidth: '48px', width: '48px', height: '48px', padding: 0, background: 'rgba(255,255,255,0.05)' }}
            >
              <ChevronLeft size={20} style={{ color: 'white' }} />
            </Button>
            <div>
              <Input
                placeholder="Site Name"
                value={postInfo.title}
                onChange={(e) => setPostInfo({ ...postInfo, title: e.target.value })}
                style={{ width: '300px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Layout size={12} style={{ color: '#6366f1' }} />
                <select
                  value={postInfo.categoryId}
                  onChange={(e) => setPostInfo({ ...postInfo, categoryId: e.target.value })}
                  style={{ background: 'transparent', fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', border: 'none', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ImageIcon size={18} style={{ color: '#6366f1' }} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>
                {postInfo.logoFile ? 'Image Selected' : 'Upload Icon'}
              </span>
              <input
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => setPostInfo({ ...postInfo, logoFile: e.target.files?.[0] || null })}
              />
            </label>
            <SaveButton postInfo={postInfo} isNew={isNew} />
          </div>
        </div>

        
        <div className="flex-1 overflow-hidden relative">
          <div className="grid grid-cols-12 h-full">
            <div className="col-span-12 lg:col-span-9 h-full overflow-y-auto custom-scrollbar bg-black">
              <div className="min-h-full p-8 pb-32 max-w-[1200px] mx-auto flex flex-col gap-8">

                <div className="h-[100vh] ">
                  <Frame>
                    <Element
                      canvas
                      background="#18181b"
                      is={Container}
                      padding={40}
                      margin={0}
                      width="100%"
                      height="100%"
                      flexDirection="column"
                      justifyContent="flex-start"
                      alignItems="stretch"
                      gap={0}
                      borderRadius={0}
                    >
                    </Element>
                  </Frame>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Tools & Settings */}
            <div className="col-span-12 lg:col-span-3 h-full bg-zinc-900/80 border-l border-white/10 backdrop-blur-md flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Inspector
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-2">
                  <SettingsPanel />
                </div>
                <div className="border-t border-white/10 mt-4">
                  <div className="p-4 border-b border-white/10">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Library
                    </h2>
                  </div>
                  <Toolbox />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Editor>
    </div>
  );
}