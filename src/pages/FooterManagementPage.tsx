import { useEffect, useState } from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Save, Layout, ExternalLink, Facebook, Twitter, Disc as Pinterest, Video as TikTok } from "lucide-react";
import api from "../services/api";

interface FooterLink {
  id?: number;
  label: string;
  href: string;
  order: number;
  icon?: string;
  type: 'social' | 'bottom';
}

const SOCIAL_PLATFORMS = [
  { name: 'Facebook', icon: <Facebook size={18} /> },
  { name: 'X', icon: <Twitter size={18} /> },
  { name: 'Pinterest', icon: <Pinterest size={18} /> },
  { name: 'TikTok', icon: <TikTok size={18} /> }
];

export function FooterManagementPage() {
  const [socialLinks, setSocialLinks] = useState<FooterLink[]>([]);
  const [bottomLinks, setBottomLinks] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const [socialRes, bottomRes] = await Promise.all([
        api.get("/footer-links", { params: { type: 'social' } }),
        api.get("/footer-links", { params: { type: 'bottom' } })
      ]);
      
      // Initialize if empty
      if (socialRes.data.length === 0) {
        setSocialLinks(SOCIAL_PLATFORMS.map((p, i) => ({
          label: p.name,
          href: "#",
          order: i,
          icon: p.name,
          type: 'social'
        })));
      } else {
        setSocialLinks(socialRes.data);
      }
      
      if (bottomRes.data.length === 0) {
        setBottomLinks([
          { label: "About us", href: "/#", order: 0, type: 'bottom' },
          { label: "Terms", href: "/#", order: 1, type: 'bottom' },
          { label: "Privacy", href: "/#", order: 2, type: 'bottom' },
          { label: "Contact", href: "/#", order: 3, type: 'bottom' },
          { label: "Review", href: "/review", order: 4, type: 'bottom' },
        ]);
      } else {
        const hasReview = bottomRes.data.some((item: FooterLink) => item.label.toLowerCase() === "review");
        setBottomLinks(
          hasReview
            ? bottomRes.data
            : [...bottomRes.data, { label: "Review", href: "/review", order: bottomRes.data.length, type: "bottom" }],
        );
      }
    } catch (error) {
      console.error("Error fetching links:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put("/footer-links/bulk", [...socialLinks, ...bottomLinks]);
      alert("Đã lưu các liên kết footer thành công! ✨");
      fetchLinks();
    } catch (error) {
      console.error("Error saving footer links:", error);
      alert("Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const updateSocialLink = (index: number, href: string) => {
    const newLinks = [...socialLinks];
    newLinks[index] = { ...newLinks[index], href };
    setSocialLinks(newLinks);
  };

  const updateBottomLink = (index: number, field: 'label' | 'href', value: string) => {
    const newLinks = [...bottomLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setBottomLinks(newLinks);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#21294a] p-3 rounded-lg shadow-[#21294a]/10 shadow-lg">
              <Layout className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Quản lý Footer
              </h1>
              <p className="text-sm font-medium text-slate-400">
                Chỉnh sửa các liên kết mạng xã hội và thông tin ở chân trang
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            isLoading={saving}
            className="bg-[#21294a] text-white font-bold h-11 px-8 rounded-lg shadow-lg shadow-[#21294a]/10"
            startContent={<Save size={18} />}
          >
            Lưu thay đổi
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SOCIAL LINKS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Facebook size={20} className="text-[#1877F2]" />
                Mạng xã hội (4 Link)
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-1">
                Các biểu tượng Facebook, X, Pinterest, TikTok ở phần đầu Footer
              </p>
            </div>
            <div className="p-6 space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                socialLinks.map((link, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      {link.label === 'Facebook' && <Facebook size={14} />}
                      {link.label === 'X' && <Twitter size={14} />}
                      {link.label === 'Pinterest' && <Pinterest size={14} />}
                      {link.label === 'TikTok' && <TikTok size={14} />}
                      Link {link.label}
                    </label>
                    <Input
                      placeholder={`Nhập URL profile ${link.label}...`}
                      value={link.href}
                      onChange={(e) => updateSocialLink(index, e.target.value)}
                      variant="flat"
                      startContent={<ExternalLink size={16} className="text-slate-400" />}
                      classNames={{
                        inputWrapper: "bg-slate-50 border border-slate-200 h-11 px-4 rounded-lg",
                        input: "font-medium text-slate-600",
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BOTTOM LINKS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Layout size={20} className="text-[#21294a]" />
                Liên kết phụ (Dưới cùng)
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-1">
                About us, Terms, Privacy, Contact ở thanh ngang dưới cùng
              </p>
            </div>
            <div className="p-6 space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                bottomLinks.map((link, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <label className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-1 block">Tên hiển thị</label>
                      <Input
                        value={link.label}
                        onChange={(e) => updateBottomLink(index, 'label', e.target.value)}
                        variant="flat"
                        size="sm"
                        classNames={{ inputWrapper: "bg-white", input: "font-bold" }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-1 block">Đường dẫn</label>
                      <Input
                        value={link.href}
                        onChange={(e) => updateBottomLink(index, 'href', e.target.value)}
                        variant="flat"
                        size="sm"
                        classNames={{ inputWrapper: "bg-white" }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
