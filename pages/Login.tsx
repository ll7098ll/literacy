import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, GraduationCap, Users, BrainCircuit, Flame, BookCheck, Compass } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  // Listen to ?invite=teacherUid query parameter and save to localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get('invite') || params.get('teacherCode');
    if (inviteCode) {
      localStorage.setItem('pendingTeacherCode', inviteCode);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-slate-800 font-sans antialiased flex flex-col justify-between selection:bg-slate-900 selection:text-white relative overflow-hidden">
      
      {/* Editorial Top App Bar */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b-2 border-slate-300 sticky top-0 z-30 shadow-subtle">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-tactile-sm border-2 border-slate-950">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-slate-900 tracking-tight leading-tight">
                  문해력 코스웨어
                </span>
                <Badge variant="stamp" size="sm">초등 5·6학년</Badge>
              </div>
              <span className="text-[10px] font-bold text-slate-500 hidden sm:inline">
                교과 중심 디지털 리터러시 플랫폼
              </span>
            </div>
          </div>

          <Button
            onClick={signInWithGoogle}
            size="sm"
            variant="tactile"
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            시작하기
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center py-12 md:py-20 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white border-2 border-slate-900 text-slate-900 text-xs font-black shadow-tactile-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>2026 초등 국어 교육과정 연계 문해력 코스웨어</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            생각하며 깊이 읽는 힘,<br className="hidden sm:inline" />
            <span className="text-blue-700 underline decoration-blue-300 underline-offset-8">
              초등 문해력 스마트 코스웨어
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-700 font-medium text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed break-words px-2">
            검증된 300편의 교과 연계 지문과 2단계 몰입형 독서 리더 인터페이스.<br className="hidden sm:inline" />
            정독 사고 전략 체크와 지문 대조 3D 키캡 문제 풀이, 실시간 AI 오답 튜터링을 경험해 보세요.
          </p>

          {/* Login CTA Card */}
          <div className="pt-2 max-w-sm mx-auto space-y-3 px-4 sm:px-0">
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-black py-4 px-6 rounded-2xl border-2 border-slate-900 shadow-tactile hover:shadow-tactile active:translate-y-0.5 active:shadow-tactile-pressed transition-all duration-100 text-sm sm:text-base cursor-pointer tactile-btn group"
            >
              <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google 계정으로 바로 시작</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-slate-600 text-xs font-bold text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>선생님 초대 링크로 접속 시 해당 학급으로 자동 배정됩니다.</span>
            </div>
          </div>

          {/* 3 Core Highlights (Tactile 3D Cards) */}
          <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-5 text-left max-w-5xl mx-auto">
            
            <Card interactive padding="lg" className="space-y-3 bg-white border-2 border-slate-900 shadow-tactile">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-slate-950 flex items-center justify-center text-white shadow-tactile-sm">
                <BookCheck className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">300편 정밀 교과 지문</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words font-medium">
                인문, 역사, 사회, 과학 교과와 연계된 300편의 검증된 글감으로 독해력과 어휘력을 확장합니다.
              </p>
            </Card>

            <Card interactive padding="lg" className="space-y-3 bg-white border-2 border-slate-900 shadow-tactile">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-slate-950 flex items-center justify-center text-white shadow-tactile-sm">
                <Compass className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">2단계 몰입형 독서 리더</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words font-medium">
                1단계 정독(사고 체크리스트)과 2단계 Split-Screen(3D 키캡 지문-문제 교차 풀이)을 지원합니다.
              </p>
            </Card>

            <Card interactive padding="lg" className="space-y-3 bg-white border-2 border-slate-900 shadow-tactile">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-slate-950 flex items-center justify-center text-white shadow-tactile-sm">
                <BrainCircuit className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">실시간 AI 1:1 오답 튜터링</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words font-medium">
                제출 즉시 6대 문해력 역량(사실/추론/비판 등)을 정밀 진단하고 지문 근거 기반 AI 해설을 제공합니다.
              </p>
            </Card>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t-2 border-slate-300 py-6 text-center text-xs text-slate-600 font-medium">
        <div className="max-w-7xl mx-auto px-6 space-y-1">
          <p className="font-bold text-slate-800">© 2026 초등 문해력 스마트 코스웨어. All rights reserved.</p>
          <p className="text-[11px] text-slate-500">초등 5·6학년 국어 교과 연계 디지털 리터러시 LMS 플랫폼</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
