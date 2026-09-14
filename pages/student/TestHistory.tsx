import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, BookOpen, Search, ArrowRight } from 'lucide-react';
import { allTestSets } from '../../data/tests';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

interface TestHistoryProps {
  submissions: any[];
  allTests: any[];
}

const TestHistory: React.FC<TestHistoryProps> = ({ submissions, allTests }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubmissions = useMemo(() => {
    if (!searchQuery.trim()) return submissions;
    const query = searchQuery.toLowerCase();
    return submissions.filter(sub => {
      const test = allTests.find(t => t.id === sub.testId);
      const preSet = allTestSets.find(t => t.id === sub.testId);
      const title = preSet?.title || test?.title || '';
      return title.toLowerCase().includes(query);
    });
  }, [submissions, allTests, searchQuery]);

  return (
    <Card variant="paper" padding="lg" className="space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-tactile-sm">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="editorial-serif text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                완료한 과제 & 오답 복습
              </h3>
              <Badge variant="stamp-emerald" size="sm">
                {submissions.length}회 완료
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              제출했던 과제의 점수를 확인하고 AI 문해력 튜터와 함께 오답을 복습하세요.
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

      <div className="space-y-3">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-300">
            <div className="w-14 h-14 bg-slate-100 rounded-xl border-2 border-slate-300 flex items-center justify-center text-slate-400 mx-auto mb-3 shadow-tactile-sm">
              <Clock className="w-7 h-7" />
            </div>
            <h4 className="editorial-serif text-slate-900 font-black text-base">
              {searchQuery ? '검색 결과와 일치하는 완료 과제가 없습니다.' : '아직 완료한 과제가 없습니다.'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {!searchQuery && '응시 가능한 과제에서 문제를 풀고 제출하면 이곳에 오답 노트가 차곡차곡 기록됩니다.'}
            </p>
          </div>
        ) : (
          filteredSubmissions.map(sub => {
            const test = allTests.find(t => t.id === sub.testId);
            const preSet = allTestSets.find(t => t.id === sub.testId);
            const title = preSet?.title || test?.title || '알 수 없는 과제';

            return (
              <div 
                key={sub.id} 
                className="p-5 sm:p-6 rounded-xl border-2 border-slate-300 hover:border-slate-900 hover:shadow-tactile-sm transition-all duration-150 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant={sub.mode === 'learning' ? 'stamp' : 'stamp-amber'} 
                      size="sm"
                    >
                      {sub.mode === 'learning' ? '자기주도 독해' : '실전 모의고사'}
                    </Badge>
                    <h4 className="font-black text-slate-900 text-base group-hover:text-blue-900 transition-colors truncate">
                      {title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 font-mono font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>제출 일시: {new Date(sub.submittedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className={`px-3.5 py-1.5 rounded-lg font-mono font-black text-sm sm:text-base border-2 ${
                    sub.score >= 80 ? 'bg-emerald-50 text-emerald-900 border-emerald-500' : 
                    sub.score >= 60 ? 'bg-amber-50 text-amber-900 border-amber-500' : 
                    'bg-rose-50 text-rose-900 border-rose-500'
                  }`}>
                    {sub.score}점
                  </div>
                  <Button
                    onClick={() => navigate(`/review/${sub.id}`)}
                    variant="tactile"
                    size="sm"
                    icon={<BookOpen className="w-4 h-4" />}
                  >
                    오답노트 복습
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default TestHistory;
