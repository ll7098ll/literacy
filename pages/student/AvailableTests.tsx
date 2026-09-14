import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, Clock, Search, ArrowRight, BookOpen } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

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
    <Card variant="paper" padding="lg" className="space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-tactile-sm">
            <FileText className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="editorial-serif text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                응시 가능한 과제 & 모의고사
              </h3>
              <Badge variant="stamp-amber" size="sm">
                {pendingTests.length}개 대기
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              선생님이 배정하신 교과 지문과 추천 모의고사를 풀어보세요.
            </p>
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
            className="block w-full pl-10 pr-4 py-2.5 border-2 border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:border-slate-900 text-xs font-bold transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Tests Bento List */}
      <div className="space-y-3">
        {pendingTests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-300">
            <div className="w-14 h-14 bg-emerald-50 rounded-xl border-2 border-emerald-300 flex items-center justify-center text-emerald-600 mx-auto mb-3 shadow-tactile-sm">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h4 className="editorial-serif text-slate-900 font-black text-base">
              {searchQuery ? '검색 조건과 일치하는 과제가 없습니다.' : '모든 배정 과제를 완료했습니다! 🎉'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {!searchQuery && '새로운 과제가 배정되면 여기에 표시됩니다. [완료한 과제] 탭에서 오답 노트를 복습해 보세요.'}
            </p>
          </div>
        ) : (
          pendingTests.map(test => (
            <div 
              key={test.id} 
              className="p-5 sm:p-6 rounded-xl border-2 border-slate-300 hover:border-slate-900 hover:shadow-tactile-sm transition-all duration-150 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {test.isDaily ? (
                    <Badge variant="stamp-amber" size="sm">
                      오늘의 일일 학습
                    </Badge>
                  ) : (
                    <Badge variant="stamp" size="sm">
                      초등 문해력 과제
                    </Badge>
                  )}
                  <h4 className="font-black text-slate-900 text-base group-hover:text-blue-900 transition-colors truncate">
                    {test.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>배정일: {test.createdAt ? new Date(test.createdAt).toLocaleDateString('ko-KR') : '오늘'}</span>
                </div>
              </div>

              <Button
                onClick={() => navigate(`/test/${test.id}`)}
                variant="tactile"
                size="sm"
                iconRight={<ArrowRight className="w-4 h-4" />}
                className="shrink-0"
              >
                학습 시작하기
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default AvailableTests;
