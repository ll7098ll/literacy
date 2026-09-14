import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LogOut, Menu, X, Copy, Check, Sparkles, BookOpen, 
  Flame, GraduationCap, ChevronRight, LayoutDashboard, 
  BookA, BarChart3, Users, FileText, PenTool, ExternalLink
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Badge from './ui/Badge';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface Props {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
}

const DashboardLayout: React.FC<Props> = ({ children, navItems, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyTeacherCode = () => {
    if (!user) return;
    const code = user.classCode || user.uid;
    const inviteLink = `${window.location.origin}/?invite=${code}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const displayCode = useMemo(() => {
    if (!user?.classCode) return null;
    const c = user.classCode;
    return `${c.slice(0, 3)}-${c.slice(3)}`;
  }, [user?.classCode]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans antialiased selection:bg-brand-600 selection:text-white">
      
      {/* ─────────────────────────────────────────────────────────────
          1. Left Modern Sidebar (Desktop: Fixed 260px, Mobile: Drawer)
      ───────────────────────────────────────────────────────────── */}
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside className={`
        fixed md:sticky top-0 z-50 h-screen w-64 bg-white border-r-2 border-slate-200 shadow-subtle flex flex-col justify-between shrink-0 transition-transform duration-200 ease-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header: Brand Identity */}
        <div className="p-5 border-b-2 border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-tactile-sm group-hover:translate-y-0.5 transition-transform shrink-0">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-black text-base text-slate-900 leading-tight tracking-tight truncate">
                문해력 코스웨어
              </span>
              <span className="text-[11px] font-bold text-slate-500 truncate">
                {user?.role === 'teacher' ? '선생님 교과 관리' : '5·6학년 심층 독해'}
              </span>
            </div>
          </Link>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Middle: Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
            학습 메뉴
          </div>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && item.path !== '/teacher' && item.path !== '/student' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-black transition-all duration-100 group select-none ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-tactile-sm border-2 border-slate-950'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-900'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.name}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`ml-2 px-2 py-0.5 text-[10px] font-black rounded-full shrink-0 ${
                    isActive ? 'bg-slate-800 text-amber-300' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Quick Info Widgets in Sidebar */}
          <div className="pt-6 px-1 space-y-3">
            {/* Student Continuous Streak Widget */}
            {user?.role === 'student' && (
              <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 shadow-tactile-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-amber-900 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    연속 학습
                  </span>
                  <span className="text-xs font-black text-amber-900">3일 달성! 🔥</span>
                </div>
                <p className="text-[10px] text-amber-800 font-bold">
                  오늘도 1개 지문을 완독해 불꽃을 이어가세요.
                </p>
              </div>
            )}

            {/* Teacher Invitation Pin Card */}
            {user?.role === 'teacher' && displayCode && (
              <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-300 shadow-tactile-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-800">
                    학급 초대 코드
                  </span>
                  <span className="font-mono text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                    {displayCode}
                  </span>
                </div>
                <button
                  onClick={copyTeacherCode}
                  className="w-full py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-[11px] font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer tactile-btn"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-growth-600" />
                      <span>링크 복사됨!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-500" />
                      <span>학생 초대 링크 복사</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer: User Profile & Logout */}
        <div className="p-4 border-t-2 border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white border-2 border-slate-950 flex items-center justify-center text-xs font-black shadow-tactile-sm shrink-0">
                {user?.displayName?.[0] || '유'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-slate-900 truncate leading-tight">
                  {user?.displayName || '사용자'}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {user?.role === 'teacher' ? '선생님' : '학생'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. Right Main Canvas (Fluid width, Clean Top App Bar)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 w-full h-16 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-subtle">
          
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                {title}
              </h1>
              <Badge 
                variant="stamp" 
                size="sm"
                className="hidden sm:inline-flex shrink-0"
              >
                {user?.role === 'teacher' ? '교사용 모드' : '학생용 모드'}
              </Badge>
            </div>
          </div>

          {/* Right Header Status / Mini Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {user?.role === 'student' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                <span>오늘 목표:</span>
                <span className="font-black text-blue-700">3지문 완독</span>
              </span>
            )}

            {user?.role === 'teacher' && displayCode && (
              <button
                onClick={copyTeacherCode}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black text-slate-900 bg-white hover:bg-slate-100 border-2 border-slate-300 px-3 py-1 rounded-xl transition-all cursor-pointer shadow-tactile-sm tactile-btn"
              >
                <Copy className="w-3.5 h-3.5 text-blue-700" />
                <span>학급 {displayCode}</span>
              </button>
            )}
          </div>

        </header>

        {/* Main Canvas Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Minimal Clean Footer */}
        <footer className="w-full border-t border-slate-200/60 py-5 text-center text-xs text-slate-400 font-medium">
          <p>© 2026 초등 문해력 스마트 코스웨어 · 300편 교과 지문 데이터베이스 연동</p>
        </footer>

      </div>

    </div>
  );
};

export default DashboardLayout;
