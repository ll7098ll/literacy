import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, ChevronRight } from 'lucide-react';
import LiteracyReport from '../../../components/LiteracyReport';
import { allTestSets } from '../../../data/tests';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';

interface StudentDetailProps {
  students: any[];
  submissions: any[];
  tests: any[];
}

const StudentDetail: React.FC<StudentDetailProps> = ({ students, submissions, tests }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const student = students.find(s => s.id === id);
  const studentSubmissions = submissions.filter(s => s.studentUid === id);

  if (!student) {
    return (
      <Card variant="paper" padding="lg" className="text-center py-16 border-2 border-slate-900 shadow-tactile">
        <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="editorial-serif text-slate-900 font-black text-base">학생 정보를 찾을 수 없습니다.</h3>
        <p className="text-xs text-slate-500 mt-1">삭제되었거나 접근 권한이 없는 학생입니다.</p>
        <Button 
          onClick={() => navigate('/teacher/students')} 
          variant="tactile"
          size="sm"
          className="mt-4"
        >
          학생 목록으로 돌아가기
        </Button>
      </Card>
    );
  }

  const totalScore = studentSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const avgScore = studentSubmissions.length > 0 ? Math.round(totalScore / studentSubmissions.length) : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Navigation */}
      <button 
        onClick={() => navigate('/teacher/students')} 
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors bg-[#FAF8F5] px-3.5 py-2 rounded-xl border-2 border-slate-300 hover:border-slate-900 shadow-tactile-sm cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>학생 목록으로 돌아가기</span>
      </button>

      {/* Student Profile Editorial Hero Card */}
      <Card variant="paper" padding="lg" className="border-2 border-slate-900 shadow-tactile flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center font-black text-2xl sm:text-3xl shadow-tactile-sm border-2 border-slate-900 shrink-0">
            {student.displayName?.charAt(0) || '학'}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h2 className="editorial-serif text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {student.displayName}
              </h2>
              <Badge variant="stamp" size="sm">초등 5·6학년</Badge>
            </div>
            <p className="text-xs font-mono text-slate-400">
              {student.email || '계정 정보 없음'}
            </p>
          </div>
        </div>

        {/* Tremor-Style Profile Metric Blocks */}
        <div className="flex items-center gap-3 sm:gap-4 border-t-2 md:border-t-0 md:border-l-2 border-slate-200 pt-4 md:pt-0 md:pl-8">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border-2 border-slate-900 shadow-tactile-sm text-center min-w-[100px]">
            <span className="text-[11px] font-mono font-bold text-slate-500 block mb-1">완료 지문</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-slate-900">
              {studentSubmissions.length}편
            </span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border-2 border-slate-900 shadow-tactile-sm text-center min-w-[100px]">
            <span className="text-[11px] font-mono font-bold text-slate-500 block mb-1">평균 점수</span>
            <span className={`font-mono text-xl sm:text-2xl font-black ${
              avgScore >= 80 ? 'text-emerald-700' : avgScore >= 60 ? 'text-blue-900' : 'text-amber-700'
            }`}>
              {avgScore}점
            </span>
          </div>
        </div>
      </Card>

      {/* Comprehensive Literacy Diagnosis Report */}
      <LiteracyReport submissions={studentSubmissions} studentName={student.displayName} />

      {/* Student Submissions History Table */}
      <Card variant="paper" padding="lg" className="space-y-4 border-2 border-slate-900 shadow-tactile">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
          <h4 className="editorial-serif text-base sm:text-lg font-black text-slate-900 tracking-tight">
            최근 과제 제출 및 응시 이력
          </h4>
          <span className="text-xs font-mono font-bold text-slate-500">
            총 {studentSubmissions.length}건 제출됨
          </span>
        </div>

        {studentSubmissions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium bg-white rounded-xl border-2 border-dashed border-slate-300">
            아직 응시한 과제가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border-2 border-slate-900 bg-white shadow-tactile-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-900 text-white font-mono font-bold">
                  <th className="py-3 px-4">과제 / 지문명</th>
                  <th className="py-3 px-4">취득 점수</th>
                  <th className="py-3 px-4">제출 일시</th>
                  <th className="py-3 px-4 text-right">상세 복습</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                {studentSubmissions.map((sub) => {
                  const testSet = allTestSets.find(ts => ts.id === sub.testId);
                  return (
                    <tr key={sub.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="py-3.5 px-4 editorial-serif font-black text-slate-900">
                        {testSet?.title || sub.testId}
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
                        <button
                          onClick={() => navigate(`/review/${sub.id}`)}
                          className="text-xs font-black text-slate-900 hover:text-blue-900 flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <span>답안 보기</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
};

export default StudentDetail;
