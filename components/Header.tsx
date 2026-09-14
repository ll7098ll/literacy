
import React from 'react';
import { BookOpen } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 no-print transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_1px_10px_rgb(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo Area */}
        <div className="flex items-center gap-3 group cursor-default">
          <div className="relative flex items-center justify-center w-8 h-8 bg-slate-900 rounded-lg shadow-lg shadow-brand-500/20 group-hover:rotate-3 transition-transform duration-300">
             <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-slate-900 leading-none tracking-tight">
              CSAT <span className="text-brand-600">AI</span> Generator
            </h1>
          </div>
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50/50 rounded-full border border-slate-200/50 text-slate-600 backdrop-blur-sm">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">Gemini 3.0 Flash Connected</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
