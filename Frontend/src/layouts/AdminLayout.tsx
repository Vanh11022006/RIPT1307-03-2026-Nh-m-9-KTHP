import React, { useState, useEffect } from "react";
import { Dropdown } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  UserOutlined, 
  LogoutOutlined,
} from "@ant-design/icons";

import { useAuthStore } from "../stores/auth.store";
import { useNotificationLogStore } from "../stores/notificationLog.store";
import { useNotificationStream } from "../hooks/useNotificationStream";

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuthStore();
  const notificationLogs = useNotificationLogStore((state) => state.notificationLogs);
  useNotificationStream();

  useEffect(() => {
    document.body.classList.add("dashboard-body");
    return () => {
      document.body.classList.remove("dashboard-body");
    };
  }, []);

  const unreadCount = notificationLogs.filter(
    (log) => String(log.recipientUserId) === String(currentUser?.id) && !log.isRead
  ).length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    { path: "/admin/dashboard", icon: "dashboard", label: "BẢNG ĐIỀU KHIỂN" },
    { path: "/admin/universities", icon: "school", label: "QUẢN LÝ TRƯỜNG" },
    { path: "/admin/majors", icon: "book", label: "QUẢN LÝ NGÀNH" },
    { path: "/admin/subject-groups", icon: "layers", label: "QUẢN LÝ TỔ HỢP" },
    { path: "/admin/candidates", icon: "groups", label: "QUẢN LÝ THÍ SINH" },
    { path: "/admin/applications", icon: "folder_open", label: "QUẢN LÝ HỒ SƠ" },
    { path: "/admin/notifications", icon: "notifications", label: "THÔNG BÁO", badge: unreadCount },
    { path: "/admin/admission-rounds", icon: "calendar_today", label: "QUẢN LÝ ĐỢT" },
    { path: "/admin/users", icon: "manage_accounts", label: "TÀI KHOẢN" },
  ];

  const userMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Hồ sơ cá nhân",
      },
      {
        type: "divider" as const
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
        onClick: handleLogout,
        danger: true
      }
    ]
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFB] text-[#1A1C1E] font-sans relative overflow-x-hidden">
      {/* SideNavBar */}
      <aside 
        className={`h-screen fixed left-0 top-0 bg-white border-r border-black/[0.08] flex flex-col pt-6 pb-12 z-50 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo Section */}
        <div className="px-6 mb-8 mt-2">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 shrink-0" style={{ objectFit: "contain" }} />
              <div>
                <h1 className="text-xl font-extrabold text-[#00616D] tracking-tight m-0">UniAdmission</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#44474E] m-0 mt-0.5">System Admin</p>
                <p className="text-[9px] text-[#00616D]/60 font-bold uppercase tracking-widest m-0 mt-0.5">Niên khóa 2025</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 shrink-0" style={{ objectFit: "contain" }} />
            </div>
          )}
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`flex items-center gap-3 px-6 py-3 duration-200 ease-in-out font-bold text-xs uppercase tracking-widest border-0 cursor-pointer rounded-none text-left w-full bg-transparent ${
                  isActive 
                    ? "text-[#00616D] border-r-4 border-[#00616D] bg-[#00616D]/5" 
                    : "text-[#44474E] hover:text-[#00616D] hover:bg-[#00616D]/5"
                }`}
              >
                <span className="material-symbols-outlined text-lg shrink-0">{link.icon}</span>
                {!collapsed && (
                  <span className="flex-1 flex justify-between items-center truncate">
                    {link.label}
                    {link.badge && link.badge > 0 ? (
                      <span className="bg-[#00616D] text-white px-2 py-0.5 rounded-full text-[10px] font-bold leading-none">
                        {link.badge}
                      </span>
                    ) : null}
                  </span>
                )}
              </button>
            );
          })}
        </nav>


      </aside>

      {/* Main Wrapper */}
      <div 
        className="flex flex-col min-h-screen transition-all duration-300 max-w-full"
        style={{ 
          marginLeft: collapsed ? "80px" : "264px"
        }}
      >
        {/* TopNavBar */}
        <header className="w-full sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.08]">
          <div className="flex justify-between items-center px-6 py-3 max-w-container-max mx-auto">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setCollapsed((value) => !value)}
                className="text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-all border-0 cursor-pointer bg-transparent flex items-center justify-center"
                aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
              >
                <span className="material-symbols-outlined">
                  {collapsed ? "menu_open" : "menu"}
                </span>
              </button>
              
              <div className="flex items-center flex-1 max-w-md">
                <div className="relative w-full">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#44474E] text-lg">search</span>
                  <input 
                    className="w-full bg-[#F1F4F5] border-transparent rounded-full py-2 pl-10 pr-4 text-slate-800 placeholder:text-[#44474E] text-sm focus:ring-2 focus:ring-[#00616D] focus:bg-white transition-all outline-none" 
                    placeholder="Tìm kiếm nhanh..." 
                    type="text"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 ml-auto">
              <button 
                onClick={() => navigate("/admin/notifications")}
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95 bg-transparent border-0 cursor-pointer flex items-center justify-center"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00616D] rounded-full"></span>}
              </button>
              
              <Dropdown menu={userMenu} placement="bottomRight" arrow trigger={['click']}>
                <div className="flex items-center gap-3 pl-4 border-l border-black/[0.08] cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="text-right hidden sm:block">
                    <p className="font-bold text-slate-800 leading-none m-0">{currentUser?.fullName || "Quản trị viên"}</p>
                    <p className="text-xs text-[#44474E] m-0 mt-1">System Admin</p>
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#00616D] flex items-center justify-center bg-slate-100">
                    {currentUser?.avatar ? (
                      <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-slate-400">person</span>
                    )}
                  </div>
                </div>
              </Dropdown>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 max-w-container-max w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
