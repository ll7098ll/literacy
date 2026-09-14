import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BrainCircuit, Layers, CheckCircle2, ChevronRight, Award, AlertCircle, 
  Bookmark, Sparkles, GraduationCap, ArrowRight, Flame, BookOpen, Check, Target, Clock
} from 'lucide-react';
import LiteracyReport from '../../components/LiteracyReport';
import { allTestSets } from '../../data/tests';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

interface StudentOverviewProps {
  user: any;
  submissions: any[];
  assignments: any[];
}

const StudentOverview: React.FC<StudentOverviewProps> = ({
  user,
  submissions,
  assignments = []
}) => {
  const navigate = useNavigate();

  // Sort assignments by date (latest first)
  const sortedAssignments = useMemo(() => {
    return [...assignments].sort((a, b) => b.assignedDate.localeCompare(a.assignedDate));
  }, [assignments]);

  // Calculate overall assignment statistics
  const stats = useMemo(() => {
    let completedAssignmentsCount = 0;
    let totalScoreSum = 0;
    let completedTestsCount = 0;
    let totalTestsCount = 0;

    sortedAssignments.forEach(assign => {
      const testIds = assign.testSetIds || [];
      totalTestsCount += testIds.length;
      const isCompleted = testIds.length > 0 && testIds.every(tId => 
        submissions.some(sub => sub.studentUid === user?.uid && sub.testId === tId)
      );

      if (isCompleted) {
        completedAssignmentsCount++;
      }

      testIds.forEach(tId => {
        const sub = submissions.find(s => s.studentUid === user?.uid && s.testId === tId);
        if (sub) {
          totalScoreSum += sub.score || 0;
          completedTestsCount++;
        }
      });
    });

    const averageScore = completedTestsCount > 0 ? Math.round(totalScoreSum / completedTestsCount) : 0;

    return {
      totalAssignments: sortedAssignments.length,
      completedAssignments: completedAssignmentsCount,
      totalTestsCount,
      completedTestsCount,
      averageScore
    };
  }, [sortedAssignments, submissions, user]);

  // Find the most recent reading habit feedback
  const recentFeedbackSubmission = useMemo(() => {
    return [...submissions]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .find(s => s.readingHabitFeedback);
  }, [submissions]);

  // Format 6-digit class code
  const displayClassCode = useMemo(() => {
    if (!user?.classCode) return null;
    const c = user.classCode;
    return `${c.slice(0, 3)}-${c.slice(3)}`;
  }, [user?.classCode]);

  // Next Best Action (first unfinished test)
  const nextUnfinishedTest = useMemo(() => {
    for (const assign of sortedAssignments) {
      const testIds = assign.testSetIds || [];
      for (const testId of testIds) {
        const isSolved = submissions.some(sub => sub.studentUid === user?.uid && sub.testId === testId);
        if (!isSolved) {
          const testSet = allTestSets.find(ts => ts.id === testId);
          if (testSet) {
            return { testId, testSet, assignmentTitle: assign.title };
          }
        }
      }
    }
    return null;
  }, [sortedAssignments, submissions, user]);

  // Literacy Level & XP calculation
  const literacyLevel = useMemo(() => {
    const count = stats.completedTestsCount;
    if (count >= 15) return { level: 5, title: '문맥의 지배자', badgeColor: 'from-amber-600 to-amber-500', icon: '👑', target: 20 };
    if (count >= 10) return { level: 4, title: '비판적 탐험가', badgeColor: 'from-slate-900 to-blue-900', icon: '🚀', target: 15 };
    if (count >= 5) return { level: 3, title: '열정 독서가', badgeColor: 'from-blue-700 to-blue-600', icon: '📖', target: 10 };
    if (count >= 2) return { level: 2, title: '성실한 리더', badgeColor: 'from-emerald-700 to-emerald-600', icon: '🌱', target: 5 };
    return { level: 1, title: '독서 새싹', badgeColor: 'from-teal-700 to-emerald-600', icon: '🌿', target: 2 };
  }, [stats.completedTestsCount]);

  return (
    <div className="space-y-8">
      
      {/* Student Quest Hub: Top Hero & Adaptive Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Quest Cell 1: Welcome & Next Best Quest (2 Columns on Large Screens) */}
        <Card padding="lg" className="lg:col-span-2 bg-white border-2 border-slate-300 shadow-card flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <Badge variant="stamp" size="md">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400 mr-1" />
                <span>초등 5·6학년 국어 문해력 코스웨어</span>
              </Badge>

              {displayClassCode && (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded-xl border-2 border-slate-200 font-bold">
                  <span>소속 학급:</span>
                  <span className="font-mono font-black text-slate-900">{displayClassCode}</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              반가워요, <span className="text-blue-700 underline decoration-blue-300 underline-offset-4">{user?.displayName || '학생'}</span> 친구! 👋
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-2 max-w-xl font-medium">
              오늘도 한 편의 교과 글을 정독하고 사고 체크리스트를 완성하며 진짜 문해력을 키워보세요.
            </p>
          </div>

          {/* Next Best Action Focus Banner */}
          <div className="mt-6 pt-5 border-t-2 border-slate-100">
            {nextUnfinishedTest ? (
              <div className="bg-amber-50/50 rounded-2xl p-4 sm:p-5 border-2 border-slate-800 shadow-tactile flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="stamp-amber" size="sm">오늘의 추천 독해 퀘스트</Badge>
                    <span className="text-xs font-bold text-slate-500">
                      {nextUnfinishedTest.testSet.subject} · {nextUnfinishedTest.testSet.difficulty}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight truncate">
                    {nextUnfinishedTest.testSet.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium truncate">
                    {nextUnfinishedTest.assignmentTitle} 과제에 배정된 지문입니다.
                  </p>
                </div>

                <Button
                  onClick={() => navigate(`/test/${nextUnfinishedTest.testId}`)}
                  variant="tactile-emerald"
                  size="md"
                  iconRight={<ArrowRight className="w-4 h-4" />}
                  className="shrink-0"
                >
                  지금 읽기 시작
                </Button>
              </div>
            ) : (
              <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border-2 border-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black shadow-tactile-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-950 text-sm sm:text-base">
                      배정된 모든 과제를 완료했습니다! 🎉
                    </h4>
                    <p className="text-xs text-emerald-800 font-medium">
                      나만의 단어장에서 어휘를 복습하거나 이전 과제 오답을 확인해 보세요.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/student/vocabulary')}
                  variant="outline"
                  size="sm"
                >
                  단어장 가기
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Quest Cell 2: Literacy Level & Streak Widget (1 Column) */}
        <Card padding="lg" className="border-2 border-slate-300 shadow-card flex flex-col justify-between space-y-6 bg-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                문해력 탐험 레벨
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs font-black shadow-tactile-sm">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>3일 연속 학습</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border-2 border-slate-950 text-white flex items-center justify-center text-2xl shadow-tactile shrink-0">
                {literacyLevel.icon}
              </div>
              <div>
                <div className="text-xs font-black text-blue-700">Lv.{literacyLevel.level}</div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                  {literacyLevel.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                  총 {stats.completedTestsCount}편 독해 완료
                </p>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-black">
                <span className="text-slate-600">다음 레벨까지</span>
                <span className="text-blue-700 font-black">
                  {stats.completedTestsCount} / {literacyLevel.target}편
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-300 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((stats.completedTestsCount / literacyLevel.target) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-slate-100 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block">평균 독해 점수</span>
              <span className="text-xl font-black text-slate-900">{stats.averageScore}점</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block">완료 과제</span>
              <span className="text-xl font-black text-slate-900">{stats.completedAssignments}건</span>
            </div>
          </div>
        </Card>

      </div>

      {/* Student Assignments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">선생님이 배정한 과제 목록</h3>
            <Badge variant="stamp" size="sm">{sortedAssignments.length}건</Badge>
          </div>
        </div>

        {sortedAssignments.length === 0 ? (
          <Card padding="lg" className="text-center py-16 text-slate-500 border-2 border-slate-300 bg-white">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <h4 className="text-base font-black text-slate-900">아직 배정된 과제가 없습니다</h4>
            <p className="text-xs text-slate-600 mt-1">선생님이 과제를 출제하면 이곳에 타임라인 형태로 표시됩니다.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sortedAssignments.map((assign) => {
              const testIds = assign.testSetIds || [];
              const solvedCount = testIds.filter(tId => 
                submissions.some(sub => sub.studentUid === user?.uid && sub.testId === tId)
              ).length;
              const isAllCompleted = testIds.length > 0 && solvedCount === testIds.length;
              const progressRate = testIds.length > 0 ? Math.round((solvedCount / testIds.length) * 100) : 0;

              return (
                <Card key={assign.id} padding="lg" className="border-2 border-slate-300 shadow-card space-y-4 flex flex-col justify-between bg-white">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> 배정일: {assign.assignedDate || '오늘'}
                          </span>
                          <Badge variant={isAllCompleted ? 'stamp-emerald' : 'stamp'} size="sm">
                            {isAllCompleted ? '완료' : '진행 중'}
                          </Badge>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                          {assign.title}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-blue-700">{progressRate}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 border border-slate-200 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          isAllCompleted ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${progressRate}%` }}
                      />
                    </div>

                    {/* Test items chips */}
                    <div className="space-y-2 pt-1">
                      {testIds.map((tId: string) => {
                        const testSet = allTestSets.find(ts => ts.id === tId);
                        const sub = submissions.find(s => s.studentUid === user?.uid && s.testId === tId);
                        const isSolved = !!sub;

                        return (
                          <div
                            key={tId}
                            onClick={() => {
                              if (isSolved) {
                                navigate(`/review/${sub.id}`);
                              } else {
                                navigate(`/test/${tId}`);
                              }
                            }}
                            className={`p-3.5 rounded-xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer tactile-btn active:scale-[0.99] ${
                              isSolved 
                                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' 
                                : 'bg-white border-slate-300 text-slate-900 hover:border-slate-800 hover:shadow-tactile-sm'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 border ${
                                isSolved ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-slate-100 border-slate-300 text-slate-700'
                              }`}>
                                {isSolved ? <Check className="w-3.5 h-3.5" /> : '•'}
                              </span>
                              <span className="text-xs font-black truncate block min-w-0">
                                {testSet?.title || '지문 ' + tId}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isSolved ? (
                                <Badge variant="growth" size="sm">
                                  {sub.score}점
                                </Badge>
                              ) : (
                                <span className="text-xs font-black text-blue-700 flex items-center gap-1">
                                  <span>읽고 풀기</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Bento Grid Row 3: Comprehensive Literacy Diagnosis Report */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">나의 문해력 정밀 분석 리포트</h3>
          </div>
        </div>

        <LiteracyReport submissions={submissions} studentName={user?.displayName || '학생'} />
      </div>

    </div>
  );
};

export default StudentOverview;
