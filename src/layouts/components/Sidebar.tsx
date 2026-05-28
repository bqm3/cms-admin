import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Image as ImageIcon,
  Layout,
  LayoutDashboard,
  LayoutTemplate,
  Layers,
  LogOut,
  Shield,
  Sheet,
  Tag,
  Users,
  X,
} from "lucide-react";
import { Button } from "@heroui/button";
import api from "../../services/api";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Quản lý bài viết",
      path: "/dashboard",
    },
    {
      icon: LayoutTemplate,
      label: "Quản lý Template",
      path: "/template-dashboard",
    },
    {
      icon: Sheet,
      label: "Quản lý bảng dữ liệu",
      path: "/sheets",
    },
    ...(user.role === "admin"
      ? [
          { icon: Users, label: "Quản lý người dùng", path: "/users" },
          { icon: Tag, label: "Danh mục", path: "/categories" },
          { icon: Layers, label: "Danh mục cha", path: "/parent-categories" },
          { icon: ImageIcon, label: "Thư viện ảnh", path: "/media" },
          { icon: Layout, label: "Quản lý Footer", path: "/footer-links" },
          { icon: BookOpen, label: "Quản lý Review", path: "/reviews" },
        ]
      : []),
  ];

  const isActive = (path: string) => (path === "/dashboard" ? location.pathname === path : location.pathname.startsWith(path));

  const linkClasses = (active: boolean) =>
    `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
      active ? "bg-[#21294a]/5 border border-[#21294a]/20 shadow-sm" : "hover:bg-slate-50"
    }`;

  const iconClasses = (active: boolean) =>
    `p-2 rounded-md flex-shrink-0 ${
      active ? "bg-[#21294a]/10 text-[#21294a]" : "bg-slate-100 text-slate-400"
    }`;

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-50 hidden h-full flex-col border-r border-slate-200/80 bg-white shadow-md transition-all duration-300 ${
          isOpen ? "w-64" : "w-20"
        } lg:flex`}
      >
        <div className="border-b border-slate-200/80 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#21294a] p-2.5 shadow-lg shadow-[#21294a]/10">
              <Shield className="text-white" size={20} />
            </div>
            {isOpen ? (
              <div>
                <h1 className="text-lg font-bold text-slate-800">Quản trị hệ thống</h1>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Trung tâm điều khiển</p>
              </div>
            ) : null}
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} className={linkClasses(active)}>
                <div className={iconClasses(active)}>
                  <Icon size={20} />
                </div>
                {isOpen ? <span className={`text-sm font-semibold ${active ? "text-[#21294a]" : "text-slate-600"}`}>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        {isOpen ? (
          <div className="border-t border-slate-200/80 p-4">
            <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#21294a] text-sm font-bold text-white shadow-md shadow-[#21294a]/10">
                  {user.username?.substring(0, 1).toUpperCase() || "A"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{user.username || "Admin"}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              size="sm"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white font-bold text-slate-700 shadow-sm"
              startContent={<LogOut size={18} />}
            >
              Đăng xuất
            </Button>
          </div>
        ) : null}
      </aside>

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#21294a] p-2.5 shadow-lg shadow-[#21294a]/10">
              <Shield className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Quản trị hệ thống</h1>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Trung tâm điều khiển</p>
            </div>
          </div>
          <Button isIconOnly variant="flat" size="sm" onClick={onClose} className="rounded-md bg-slate-100 text-slate-600">
            <X size={18} />
          </Button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} onClick={onClose} className={linkClasses(active)}>
                <div className={iconClasses(active)}>
                  <Icon size={20} />
                </div>
                <span className={`text-sm font-semibold ${active ? "text-[#21294a]" : "text-slate-600"}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#21294a] text-sm font-bold text-white shadow-md shadow-[#21294a]/10">
                {user.username?.substring(0, 1).toUpperCase() || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-800">{user.username || "Admin"}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            size="sm"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white font-bold text-slate-700 shadow-sm"
            startContent={<LogOut size={18} />}
          >
            Đăng xuất
          </Button>
        </div>
      </aside>
    </>
  );
}
