import React, { useState } from 'react';
import {
  Plus,
  Bell,
  Settings,
  LogOut,
  Menu,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  User,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { TeacherProfile, NavTabId } from '../types';
import { initialTeacherProfile } from '../data/mockData';

interface HeaderProps {
  teacher?: TeacherProfile;
  activeTab?: NavTabId;
  pendingCount?: number;
  onOpenCreateBatch?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  onToggleMobileSidebar?: () => void;
  onNavigateTab?: (tab: NavTabId) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  teacher = initialTeacherProfile,
  activeTab,
  pendingCount,
  onOpenCreateBatch,
  onOpenSettings,
  onLogout,
  onToggleMobileSidebar,
  onNavigateTab,
  searchQuery = '',
  onSearchChange,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const activeTeacher = teacher || initialTeacherProfile;

  const notifications = [
    {
      id: 'notif-1',
      title: 'AI đã hoàn tất phân tích',
      desc: '38 bài thi của Lớp 12D1 đã có gợi ý điểm chi tiết.',
      time: '10 phút trước',
      unread: true,
    },
    {
      id: 'notif-2',
      title: 'Nhắc nhở hạn nộp',
      desc: 'Đợt chấm 12A1 cần duyệt trước ngày 28/02.',
      time: '1 giờ trước',
      unread: false,
    },
  ];

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 transition-all"
    >
      {/* Left: Mobile menu toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          id="mobile-sidebar-toggle"
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Tìm bài viết, học sinh, đợt chấm, đề thi..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Action Items */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Primary CTA: + Tạo đợt chấm mới */}
        <button
          id="btn-header-create-batch"
          onClick={onOpenCreateBatch}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Tạo đợt chấm mới</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            id="btn-header-notifications"
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative transition-colors cursor-pointer"
            aria-label="Thông báo"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {showNotificationMenu && (
            <div
              id="header-notifications-dropdown"
              className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-800">Thông báo đợt chấm</span>
                <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">
                  Đánh dấu đã đọc
                </span>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-2.5 ${
                      n.unread ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.desc}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Settings Icon */}
        <button
          id="btn-header-quick-settings"
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors hidden sm:inline-flex cursor-pointer"
          title="Cài đặt hệ thống"
        >
          <Settings className="w-5 h-5" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-0.5 hidden sm:block" />

        {/* Teacher Profile Menu */}
        <div className="relative">
          <button
            id="btn-header-profile"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotificationMenu(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left group cursor-pointer"
          >
            {activeTeacher.avatar ? (
              <img
                src={activeTeacher.avatar}
                alt={activeTeacher.name || 'Giáo viên'}
                className="w-8 h-8 rounded-full object-cover ring-1.5 ring-slate-200 group-hover:ring-indigo-300"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {(activeTeacher.name || 'G').charAt(0)}
              </div>
            )}
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 leading-tight">
                {activeTeacher.name || 'Giáo viên Ngữ văn'}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight truncate max-w-[130px]">
                {activeTeacher.school || 'THPT'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div
              id="header-profile-dropdown"
              className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{activeTeacher.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{activeTeacher.title}</p>
                <p className="text-[11px] text-slate-400 truncate">{activeTeacher.email}</p>
              </div>

              <div className="py-1">
                <button
                  id="menu-item-settings"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSettings?.();
                  }}
                  className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Cài đặt & Thang điểm</span>
                </button>
                <button
                  id="menu-item-account"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onNavigateTab) {
                      onNavigateTab('settings');
                    } else if (onOpenSettings) {
                      onOpenSettings();
                    }
                  }}
                  className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Thông tin giáo viên</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  id="menu-item-logout"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout?.();
                  }}
                  className="w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
