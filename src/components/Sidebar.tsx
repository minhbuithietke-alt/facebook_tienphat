import React from 'react';
import {
  LayoutDashboard,
  MessageSquareText,
  BrainCircuit,
  Sparkles,
  Printer,
  Layers,
  Package,
  LogIn,
  LogOut,
  Database,
  Link2,
} from 'lucide-react';
import { FanpageConfig, PageId } from '../types';
import { User } from '../firebase';

export type ActiveModule = 'dashboard' | 'inbox' | 'ai-rules' | 'marketing';

interface SidebarProps {
  activeModule: ActiveModule;
  onSelectModule: (mod: ActiveModule) => void;
  pages: FanpageConfig[];
  selectedPage: PageId | 'all';
  onSelectPage: (pageId: PageId | 'all') => void;
  unreadInboxCount: number;
  autoPilot: boolean;
  onToggleAutoPilot: () => void;
  currentUser: User | null;
  authLoading: boolean;
  onStaffLogin: () => void;
  onStaffLogout: () => void;
  savedOrdersCount: number;
  onOpenFacebookModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  pages,
  selectedPage,
  onSelectPage,
  unreadInboxCount,
  autoPilot,
  onToggleAutoPilot,
  currentUser,
  authLoading,
  onStaffLogin,
  onStaffLogout,
  savedOrdersCount,
  onOpenFacebookModal,
}) => {
  const navItems: {
    id: ActiveModule;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[] = [
    {
      id: 'dashboard',
      label: '1. Quản Lý 3 Fanpage',
      sublabel: 'Multi-Page & Database',
      icon: LayoutDashboard,
    },
    {
      id: 'inbox',
      label: '2. Hộp Thư & Bình Luận AI',
      sublabel: 'Auto-Care & Lưu đơn Firestore',
      icon: MessageSquareText,
      count: unreadInboxCount,
    },
    {
      id: 'ai-rules',
      label: '3. Quy Tắc Bộ Não Ngành In',
      sublabel: 'System Prompt & JSON Schema',
      icon: BrainCircuit,
    },
    {
      id: 'marketing',
      label: '4. Trợ Lý Viết Bài & Chăm Sóc',
      sublabel: 'Tạo Content & Kịch bản bán hàng',
      icon: Sparkles,
    },
  ];

  const getPageIcon = (id: PageId) => {
    if (id === 'page1') return Printer;
    if (id === 'page2') return Layers;
    return Package;
  };

  return (
    <aside className="w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shrink-0">
            TP
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight text-white truncate">
              TIẾN PHÁT AI
            </h1>
            <p className="text-xs text-slate-400 truncate">
              Quản Trị 3 Fanpage In Ấn & Bao Bì
            </p>
          </div>
        </div>
      </div>

      {/* Staff Authentication Card (Firebase Auth + Firestore Status) */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40">
        {currentUser ? (
          <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser.displayName || 'Nhân viên Tiến Phát'}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {currentUser.email}
                </div>
              </div>
              <button
                type="button"
                aria-label="Đăng xuất nhân viên"
                onClick={onStaffLogout}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-700/80 text-emerald-400">
              <span className="inline-flex items-center gap-1">
                <Database className="w-3 h-3" />
                Firestore Online
              </span>
              <span className="font-mono tabular-nums">
                {savedOrdersCount} đơn đã lưu
              </span>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-300 font-medium">
              Đăng nhập nhân viên để đồng bộ đơn hàng lên Firestore Database
            </div>
            <button
              type="button"
              disabled={authLoading}
              onClick={onStaffLogin}
              className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-900" />
              <span>
                {authLoading
                  ? 'Đang xác thực...'
                  : 'Đăng nhập Nhân viên (Google)'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Main 4 Modules Navigation */}
      <nav aria-label="Phân hệ chính" className="p-3 space-y-1">
        <div className="px-3 py-1 text-xs font-medium text-slate-400">
          4 Phân hệ nghiệp vụ
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-slate-950' : 'text-amber-400'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-sm truncate">{item.label}</div>
                  <div
                    className={`text-xs truncate ${
                      isActive ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {item.sublabel}
                  </div>
                </div>
              </div>
              {typeof item.count === 'number' && item.count > 0 && (
                <span
                  className={`text-xs font-mono tabular-nums px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-slate-950 text-amber-400'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Multi-Page Quick Switcher & Facebook OAuth Connect */}
      <div className="px-3 py-2.5 border-t border-slate-800 flex-1 overflow-y-auto space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium text-slate-400">
            3 Fanpage (Max 3)
          </span>
          <button
            type="button"
            onClick={onOpenFacebookModal}
            className="text-xs font-semibold text-amber-400 hover:underline inline-flex items-center gap-1"
          >
            <Link2 className="w-3 h-3" />
            <span>FB OAuth & Webhook</span>
          </button>
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onSelectPage('all')}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedPage === 'all'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <span className="truncate">Tất cả 3 Fanpage</span>
            <span className="font-mono tabular-nums text-slate-400">3/3</span>
          </button>

          {pages.map((page, idx) => {
            const Icon = getPageIcon(page.id);
            const isSelected = selectedPage === page.id;
            return (
              <button
                key={page.id}
                type="button"
                onClick={() => onSelectPage(page.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? 'bg-slate-800 text-amber-400 font-semibold border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">
                    Page {idx + 1}: {page.name}
                  </span>
                </div>
                <span className="font-mono tabular-nums text-slate-500 shrink-0">
                  {page.collectedPhonesCount} SĐT
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-Pilot Quick Status Control */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-white">
              Chế độ AI Auto-Pilot
            </div>
            <div className="text-xs text-slate-400">
              {autoPilot ? 'Tự động trả lời 100%' : 'Đang tạm dừng tự động'}
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoPilot}
            aria-label="Bật tắt AI Tự Động Trả Lời 100% Auto-Pilot"
            onClick={onToggleAutoPilot}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
              autoPilot ? 'bg-emerald-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-150 ${
                autoPilot ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </aside>
  );
};
