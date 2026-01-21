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
      formData.append('category_name', postInfo.category);
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
      className="bg-indigo-600 text-white font-black px-8 h-12 rounded-2xl shadow-lg shadow-indigo-100"
      startContent={<Rocket size={18} />}
    >
      {isNew ? 'Publish website' : 'Update changes'}
    </Button>
  );
};

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new' || !id;
  const [postInfo, setPostInfo] = useState({
    title: '',
    category: '',
    logoFile: null as File | null,
    logoUrl: ''
  });
  const [loadedContent, setLoadedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      const loadPost = async () => {
        try {
          const res = await api.get(`/posts/public/${id}`);
          setPostInfo({
            title: res.data.title,
            category: res.data.category_name || '',
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
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 overflow-hidden font-sans">
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
        {/* Top Header */}
        <div className="h-20 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 shadow-sm relative z-50">
          <div className="flex items-center gap-6">
            <Button
              variant="flat"
              className="text-slate-400 hover:bg-slate-50 h-12 w-12 min-w-0 p-0 rounded-2xl"
              onClick={() => navigate('/dashboard')}
              startContent={<ChevronLeft size={20} />}
            />
            <div className="flex gap-4 items-center">
              <div className="flex flex-col">
                <Input
                  placeholder="Site Name"
                  variant="flat"
                  value={postInfo.title}
                  onChange={(e) => setPostInfo({ ...postInfo, title: e.target.value })}
                  classNames={{
                    input: "text-lg font-black text-slate-900 placeholder:text-slate-300",
                    inputWrapper: "bg-transparent h-8 min-h-0 p-0 shadow-none border-none"
                  }}
                  className="w-56"
                />
                <div className="flex items-center gap-2">
                  <Layout size={12} className="text-indigo-500" />
                  <Input
                    placeholder="Tag (e.g. Portfolio)"
                    variant="flat"
                    value={postInfo.category}
                    onChange={(e) => setPostInfo({ ...postInfo, category: e.target.value })}
                    classNames={{
                      input: "text-[10px] font-bold text-slate-400 uppercase tracking-widest p-0",
                      inputWrapper: "bg-transparent h-4 min-h-0 p-0 shadow-none border-none"
                    }}
                    className="w-40"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl">
              <label className="cursor-pointer hover:bg-white p-2 rounded-xl transition-all shadow-sm flex items-center gap-2">
                <ImageIcon size={18} className="text-indigo-600" />
                <span className="text-xs font-bold text-slate-600 px-1">{postInfo.logoFile ? 'Image Selected' : 'Upload Icon'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setPostInfo({ ...postInfo, logoFile: e.target.files?.[0] || null })}
                />
              </label>
            </div>
            <div className="w-[1px] h-8 bg-slate-200 mx-2"></div>
            <SaveButton postInfo={postInfo} isNew={isNew} />
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative flex">
          {/* Main Stage */}
          <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-slate-100 p-12">
            <div className="max-w-[1280px] mx-auto min-h-full">
              <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-100/50 overflow-hidden ring-1 ring-slate-200">
                <Frame data={loadedContent || undefined}>
                  <Element
                    canvas
                    background="#ffffff"
                    is={Container}
                    padding={60}
                    margin={0}
                    width="100%"
                    height="auto"
                    flexDirection="column"
                    justifyContent="flex-start"
                    alignItems="stretch"
                    gap={0}
                    borderRadius={0}
                  >
                    {!loadedContent && (
                      <div className="py-40 flex flex-col items-center justify-center border-4 border-dashed border-slate-50 rounded-[2.5rem] m-10 group hover:border-indigo-100 transition-all">
                        <div className="bg-slate-50 p-6 rounded-full group-hover:bg-indigo-50 transition-all mb-6">
                          <Layout size={40} className="text-slate-200 group-hover:text-indigo-200 transition-all" />
                        </div>
                        <h3 className="text-xl font-black text-slate-300 group-hover:text-indigo-300 mb-2">Editor Canvas Empty</h3>
                        <p className="text-sm font-bold text-slate-200 uppercase tracking-widest">Drag and drop components from the library</p>
                      </div>
                    )}
                  </Element>
                </Frame>
              </div>
            </div>
          </div>

          {/* Side Panels */}
          <div className="w-[380px] h-full bg-white border-l border-slate-200 flex flex-col overflow-hidden shadow-2xl relative z-10">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-xl">
                  <Settings className="text-amber-600" size={16} />
                </div>
                <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Property Inspector</h2>
              </div>
              <div className="p-4 bg-slate-50/50">
                <SettingsPanel />
              </div>
              <div className="mt-4 border-t border-slate-100">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-xl">
                    <Layout className="text-indigo-600" size={16} />
                  </div>
                  <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Component Library</h2>
                </div>
                <div className="p-4">
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
