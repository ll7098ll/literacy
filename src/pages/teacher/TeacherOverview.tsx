import React, { useState, useMemo } from 'react';
import { Users, FileText, CheckCircle, BarChart3, Layers, Calendar, ArrowRight, Sparkles, Send, Eye, Check, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { allTestSets } from '../../../data/tests';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';

interface TeacherOverviewProps {
  students: any[];
  tests: any[];
  submissions: any[];
  assignments: any[];
}

const TeacherOverview: React.FC<TeacherOverviewProps> = ({ students, tests, submissions, assignments = [] }) => {
  const navigate = useNavigate();
  
  // Sort assignments by date (latest first)
  const sortedAssignments = useMemo(() => {
    return [...assignments].sort((a, b) => (b.assignedDate || b.createdAt || '').localeCompare(a.assignedDate || a.createdAt || ''));
  }, [assignments]);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');

  // Active assignment bundle
  const activeAssignment = useMemo(() => {
    if (selectedAssignmentId) {
      return assignments.find(a => a.id === selectedAssignmentId);
    }
    return sortedAssignments[0] || null;
  }, [selectedAssignmentId, sortedAssignments, assignments]);

  // Matrix calculation
  const matrixData = useMemo(() => {
    if (!activeAssignment || students.length === 0) return [];

    const testIds = activeAssignment.testSetIds || [];

    return students.map(student => {
      const studentSubs = submissions.filter(sub => 
        sub.studentUid === student.id && 
        testIds.includes(sub.testId)
      );

      const subMap: Record<string, any> = {};
      studentSubs.forEach(sub => {
        if (!subMap[sub.testId] || new Date(sub.submittedAt) > new Date(subMap[sub.testId].submittedAt)) {
          subMap[sub.testId] = sub;
        }
      });

      const completedCount = Object.keys(subMap).length;
      const totalCount = testIds.length;
      const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      let totalScore = 0;
      Object.values(subMap).forEach(sub => {
        totalScore += sub.score || 0;
      });
      const avgScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;

      return {
        studentId: student.id,
        displayName: student.displayName || student.email || '알 수 없음',
        completedCount,
        totalCount,
        progressPercent,
        avgScore,
        subMap
      };
    });
  }, [activeAssignment, students, submissions]);

  // Overall class average
  const classStats = useMemo(() => {
    if (submissions.length === 0) return { avgScore: 0, totalSubmitted: 0 };
    const sum = submissions.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return {
      avgScore: Math.round(sum / submissions.length),
      totalSubmitted: submissions.length
    };
  }, [submissions]);

  return (
    <div className="space-y-8">
      
      {/* Tremor-Style Precision KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <Card padding="md" className="flex items-center gap-4 bg-white border-2 border-slate-300 shadow-card">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-slate-950 flex items-center justify-center text-white shrink-0 shadow-tactile-sm">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500">연결된 학생</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{students.length}명</div>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4 bg-white border-2 border-slate-300 shadow-card">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-slate-950 flex items-center justify-center text-white shrink-0 shadow-tactile-sm">
            <Layers className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500">출제된 과제</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{assignments.length}건</div>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4 bg-white border-2 border-slate-300 shadow-card">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-slate-950 flex items-center justify-center text-white shrink-0 shadow-tactile-sm">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500">총 제출 답안</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{classStats.totalSubmitted}건</div>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4 bg-white border-2 border-slate-300 shadow-card">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-slate-950 flex items-center justify-center text-white shrink-0 shadow-tactile-sm">
            <BarChart3 className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500">학급 평균 점수</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{classStats.avgScore}점</div>
          </div>
        </Card>
      </div>

      {/* Quick Test Generator Banner */}
      <Card padding="lg" className="bg-[#FAF8F5] border-2 border-slate-800 shadow-tactile flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <Badge variant="stamp" size="sm">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
            1-Click 스마트 출제 추천
          </Badge>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            오늘 우리 반 학생들을 위한 문해력 과제를 배정해 보세요
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-xl">
            300개의 정제된 5·6학년 교과 지문 풀에서 인문, 과학, 사회 테마별 3개 세트를 1클릭으로 바로 출제할 수 있습니다.
          </p>
        </div>

        <Button
          onClick={() => navigate('/teacher/generate')}
          variant="tactile"
          size="lg"
          iconRight={<ArrowRight className="w-4 h-4" />}
          className="shrink-0 z-10"
        >
          스마트 과제 출제하기
        </Button>
      </Card>

      {/* Student Progress & Score Matrix */}
      <Card padding="lg" className="space-y-6 bg-white border-2 border-slate-300 shadow-card">
        
        {/* Matrix Header & Assignment Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                학생별 과제 제출 & 성취도 매트릭스
              </h3>
              {activeAssignment && (
                <Badge variant="stamp" size="sm">
                  {activeAssignment.testSetIds?.length || 0}개 지문 포함
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              과제별로 학생들의 제출 현황과 취득 점수를 실시간 모니터링합니다.
            </p>
          </div>

          {/* Assignment Selector Dropdown / Pills */}
          {sortedAssignments.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-600">과제 선택:</span>
              <select
                value={activeAssignment?.id || ''}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                className="px-3.5 py-2 rounded-xl text-xs font-black border-2 border-slate-300 bg-white text-slate-900 focus:border-slate-900 outline-none shadow-tactile-sm"
              >
                {sortedAssignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.assignedDate || '날짜 없음'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Matrix Table */}
        {!activeAssignment || students.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Layers className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h4 className="text-base font-black text-slate-800">
              {students.length === 0 ? '등록된 학생이 없습니다' : '출제된 과제가 없습니다'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              {students.length === 0 ? '학생 관리 탭에서 초대 링크를 학생들에게 전달하세요.' : '스마트 과제 출제 탭에서 과제를 생성해 보세요.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border-2 border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b-2 border-slate-300 text-slate-800 font-black">
                <tr>
                  <th className="py-3.5 px-4 min-w-[120px]">학생명</th>
                  <th className="py-3.5 px-4 min-w-[130px]">진도율</th>
                  <th className="py-3.5 px-4 min-w-[90px]">평균 점수</th>
                  {(activeAssignment.testSetIds || []).map((tId: string, idx: number) => {
                    const testSet = allTestSets.find(ts => ts.id === tId);
                    return (
                      <th key={tId} className="py-3.5 px-4 min-w-[110px]" title={testSet?.title}>
                        지문 {idx + 1}
                      </th>
                    );
                  })}
                  <th className="py-3.5 px-4 text-right min-w-[90px]">상세 분석</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 font-medium text-slate-800 bg-white">
                {matrixData.map((row) => (
                  <tr key={row.studentId} className="hover:bg-blue-50/40 transition-colors">
                    
                    {/* Student Name */}
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      {row.displayName}
                    </td>

                    {/* Progress */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-2.5 border border-slate-200 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full ${
                              row.progressPercent === 100 ? 'bg-emerald-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${row.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-black text-slate-600">
                          {row.completedCount}/{row.totalCount}
                        </span>
                      </div>
                    </td>

                    {/* Avg Score */}
                    <td className="py-3.5 px-4 font-black text-sm">
                      {row.completedCount > 0 ? (
                        <span className={row.avgScore >= 80 ? 'text-emerald-700' : row.avgScore >= 60 ? 'text-blue-700' : 'text-amber-800'}>
                          {row.avgScore}점
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Passage Score Badges */}
                    {(activeAssignment.testSetIds || []).map((tId: string) => {
                      const sub = row.subMap[tId];
                      return (
                        <td key={tId} className="py-3.5 px-4">
                          {sub ? (
                            <Badge
                              variant={sub.score >= 80 ? 'stamp-emerald' : sub.score >= 60 ? 'brand' : 'stamp-amber'}
                              size="sm"
                            >
                              {sub.score}점
                            </Badge>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-400">
                              미제출
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Link to detail */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/teacher/students/${row.studentId}`)}
                        className="text-xs font-black text-blue-700 hover:text-blue-900 flex items-center gap-1 ml-auto cursor-pointer underline underline-offset-2"
                      >
                        <span>진단서 보기</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </Card>

    </div>
  );
};

export default TeacherOverview;
