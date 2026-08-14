import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  GraduationCap,
  Award,
  BarChart3,
  MessageSquareQuote,
  Settings,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export type NavItemKey =
  | 'dashboard'
  | 'batches'
  | 'essays'
  | 'students'
  | 'classes'
  | 'rubrics'
  | 'analytics'
  | 'comments'
  | 'settings';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  pendingCount?: number;
  aiGradedCount?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingCount = 27,
  aiGradedCount = 95,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { key: 'dashboard' as NavItemKey, label: 'Trang chủ', icon: LayoutDashboard },
    {
      key: 'batches' as NavItemKey,
      label: 'Đợt chấm bài',
      icon: FolderKanban,
      badge: '4 đợt',
    },
    {
      key: 'essays' as NavItemKey,
      label: 'Bài viết',
      icon: FileText,
      badge: pendingCount > 0 ? `${pendingCount} chờ` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    { key: 'students' as NavItemKey, label: 'Học sinh', icon: Users },
    { key: 'classes' as NavItemKey, label: 'Lớp học', icon: GraduationCap },
    { key: 'rubrics' as NavItemKey, label: 'Đề thi & Rubric', icon: Award },
    { key: 'analytics' as NavItemKey, label: 'Thống kê', icon: BarChart3 },
    { key: 'comments' as NavItemKey, label: 'Ngân hàng nhận xét', icon: MessageSquareQuote },
    { key: 'settings' as NavItemKey, label: 'Cài đặt', icon: Settings },
  ];

  const handleNavClick = (key: NavItemKey) => {
    onSelectTab(key);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          id="sidebar-overlay"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-2 ring-indigo-400/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-wide">
                  AI CHẤM VĂN
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  THPT
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal leading-tight">
                Trợ lý AI hỗ trợ giáo viên Ngữ văn
              </p>
            </div>
          </div>

          {/* Principle reminder chip */}
          <div className="mt-2 p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 leading-snug">
              <span className="font-semibold text-emerald-300">Nguyên tắc:</span> AI đề xuất, Giáo viên duyệt điểm cuối cùng.
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                id={`nav-item-${item.key}`}
                onClick={() => handleNavClick(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      item.badgeColor ||
                      (isActive
                        ? 'bg-indigo-700 text-indigo-100 border-indigo-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom AI Status Box */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-900/40 text-xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Mô hình chấm GDPT 2018</span>
              </div>
              <span className="text-[10px] text-slate-400">v1.2</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Cập nhật cấu trúc Đề thi Tốt nghiệp THPT 2025 (Đọc hiểu 4đ / NLXH 2đ / NLVH 4đ)
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
