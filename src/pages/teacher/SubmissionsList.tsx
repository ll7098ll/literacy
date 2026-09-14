import React, { useState, useMemo } from 'react';
import { BarChart3, Search, ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { allTestSets } from '../../../data/tests';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';

interface SubmissionsListProps {
  submissions: any[];
  students: any[];
  tests: any[];
}

const SubmissionsList: React.FC<SubmissionsListProps> = ({ submissions, students, tests }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubmissions = useMemo(() => {
    if (!searchQuery.trim()) return submissions;
    const query = searchQuery.toLowerCase();
    return submissions.filter(sub => {
      const student = students.find(s => s.id === sub.studentUid);
      const testData = allTestSets.find(t => t.id === sub.testId);
      const testTitle = testData ? testData.title : (tests.find(t => t.id === sub.testId)?.title || '');
      const studentName = student?.displayName?.toLowerCase() || '';
      return studentName.includes(query) || testTitle.toLowerCase().includes(query);
    });
  }, [submissions, students, tests, searchQuery]);

  return (
    <Card variant="paper" padding="lg" className="space-y-6 border-2 border-slate-900 shadow-tactile">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-tactile-sm">
            <FileText className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="editorial-serif text-lg sm:text-xl font-black text-slate-900 tracking-tight">제출 답안 현황</h3>
              <Badge variant="stamp" size="sm">총 {filteredSubmissions.length}건</Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              학생들이 제출한 과제 답안 및 오답 분석 결과를 검토합니다.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="학생 이름 또는 과제 제목 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs font-bold border-2 border-slate-300 focus:border-slate-900 outline-none bg-white shadow-inner transition-all"
          />
        </div>
      </div>

      {/* Tremor High-Contrast Table */}
      {filteredSubmissions.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-xl border-2 border-dashed border-slate-300">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h4 className="editorial-serif text-base font-black text-slate-900">
            {searchQuery ? '검색된 답안이 없습니다' : '아직 제출된 답안이 없습니다'}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            학생들이 과제를 제출하면 이곳에 실시간으로 집계됩니다.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border-2 border-slate-900 bg-white shadow-tactile-sm">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-900 text-white font-mono font-bold">
                <th className="py-3 px-4 min-w-[120px]">학생명</th>
                <th className="py-3 px-4 min-w-[220px]">과제 / 지문 제목</th>
                <th className="py-3 px-4 min-w-[100px]">취득 점수</th>
                <th className="py-3 px-4 min-w-[140px]">제출 일시</th>
                <th className="py-3 px-4 text-right min-w-[80px]">상세 답안</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {filteredSubmissions.map((sub) => {
                const student = students.find(s => s.id === sub.studentUid);
                const testData = allTestSets.find(t => t.id === sub.testId);
                const testTitle = testData ? testData.title : (tests.find(t => t.id === sub.testId)?.title || sub.testId);

                return (
                  <tr
                    key={sub.id}
                    onClick={() => navigate(`/review/${sub.id}`)}
                    className="hover:bg-amber-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 editorial-serif font-black text-slate-900">
                      {student?.displayName || '알 수 없음'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 truncate max-w-xs group-hover:text-blue-900">
                      {testTitle}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black">
                      <Badge
                        variant={sub.score >= 80 ? 'stamp-emerald' : sub.score >= 60 ? 'stamp' : 'stamp-amber'}
                        size="sm"
                      >
                        {sub.score}점
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {new Date(sub.submittedAt).toLocaleString('ko-KR')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-slate-900 group-hover:text-blue-900 font-black text-xs">
                        <span>답안 검토</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </Card>
  );
};

export default SubmissionsList;
