import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, Clock, Search, ArrowRight } from 'lucide-react';

interface AvailableTestsProps {
  allTests: any[];
  submissions: any[];
}

const AvailableTests: React.FC<AvailableTestsProps> = ({ allTests, submissions }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const pendingTests = useMemo(() => {
    let tests = allTests.filter(t => !submissions.some(s => s.testId === t.id));
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tests = tests.filter(t => t.title.toLowerCase().includes(query));
    }
    return tests;
  }, [allTests, submissions, searchQuery]);

  return (
    <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 p-6 sm:p-8 space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center font-bold shadow-subtle">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">응시 가능한 과제 & 모의고사</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-black border border-brand-200">
                {pendingTests.length}개 대기
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">선생님이 배정하신 과제와 추천 모의고사를 풀어보세요.</p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="과제 제목 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-xs font-semibold transition-all"
          />
        </div>
      </div>

      {/* Tests Bento List */}
      <div className="space-y-3">
        {pendingTests.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/70 rounded-3xl border border-dashed border-slate-200">
            <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-emerald-500 mx-auto mb-3 shadow-xs">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h4 className="text-slate-800 font-bold text-sm">
              {searchQuery ? '검색 조건과 일치하는 과제가 없습니다.' : '모든 배정 과제를 완료했습니다! 🎉'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {!searchQuery && '새로운 과제가 배정되면 여기에 표시됩니다. 완료한 시험 탭에서 오답 노트를 복습해 보세요.'}
            </p>
          </div>
        ) : (
          pendingTests.map(test => (
            <div 
              key={test.id} 
              className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 hover:border-brand-300 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {test.isDaily ? (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-200">
                      오늘의 일일 학습
                    </span>
                  ) : (
                    <span className="bg-brand-50 text-brand-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-brand-200">
                      초등 문해력 과제
                    </span>
                  )}
                  <h4 className="font-black text-slate-900 text-base group-hover:text-brand-600 transition-colors truncate">
                    {test.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>배정일: {test.createdAt ? new Date(test.createdAt).toLocaleDateString('ko-KR') : '오늘'}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/test/${test.id}`)}
                className="bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-black py-2.5 px-6 rounded-2xl transition-all shadow-subtle flex items-center justify-center gap-2 text-xs shrink-0 cursor-pointer"
              >
                <span>학습 시작하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AvailableTests;
