import React, { useState, useMemo } from 'react';
import { Users, Search, Link2, Copy, Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';

interface StudentManagementProps {
  students: any[];
  tests: any[];
  submissions: any[];
}

const StudentManagement: React.FC<StudentManagementProps> = ({ students, tests, submissions }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyInviteLink = () => {
    if (!user) return;
    const inviteLink = `${window.location.origin}/?invite=${user.classCode || user.uid}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => {
      console.error('Failed to copy', err);
      alert('클립보드 복사 중 오류가 발생했습니다. 초대 코드: ' + (user.classCode || user.uid));
    });
  };

  const formattedClassCode = useMemo(() => {
    if (!user?.classCode) return '...';
    const c = user.classCode;
    return `${c.slice(0, 3)}-${c.slice(3)}`;
  }, [user?.classCode]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(s => 
      (s.displayName && s.displayName.toLowerCase().includes(query)) || 
      (s.email && s.email.toLowerCase().includes(query))
    );
  }, [students, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Student Invite Editorial Card */}
      <Card variant="paper" padding="lg" className="border-2 border-slate-900 shadow-tactile flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-2">
          <Badge variant="stamp-amber" size="sm">
            <Link2 className="w-3.5 h-3.5 mr-1" />
            초등 학급 연동 시스템
          </Badge>
          <h3 className="editorial-serif text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            원클릭 학생 초대 및 학급 연결
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl">
            초대 링크를 전달하거나 6자리 학급 코드를 안내하면, 학생이 가입 즉시 선생님의 학급으로 자동 편성됩니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-white border-2 border-slate-900 px-4 py-2 rounded-xl shadow-tactile-sm flex items-center gap-2.5">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">학급 코드</span>
            <span className="font-mono text-base font-black text-slate-900 tracking-wider">
              {formattedClassCode}
            </span>
          </div>

          <Button
            onClick={handleCopyInviteLink}
            variant="tactile"
            size="md"
            icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? '복사 완료!' : '초대 링크 복사'}
          </Button>
        </div>
      </Card>

      {/* Main Students List Tremor-Style Container */}
      <Card variant="paper" padding="lg" className="space-y-6">
        
        {/* Top Header & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-tactile-sm">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="editorial-serif text-lg sm:text-xl font-black text-slate-900 tracking-tight">우리 반 학생 명단</h3>
                <Badge variant="stamp" size="sm">{students.length}명 등록</Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                학생의 독해 성취도를 클릭하여 개별 진단 리포트를 열람하세요.
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="학생 이름 또는 이메일 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs font-bold border-2 border-slate-300 focus:border-slate-900 outline-none bg-white shadow-inner transition-all"
            />
          </div>
        </div>

        {/* Tremor High-Contrast Students Table */}
        {filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-xl border-2 border-dashed border-slate-300">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h4 className="editorial-serif text-base font-black text-slate-900">
              {searchQuery ? '검색 결과가 없습니다' : '아직 연결된 학생이 없습니다'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              상단의 초대 링크를 복사하여 학생들에게 전달해 주세요.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border-2 border-slate-900 bg-white shadow-tactile-sm">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-900 text-white font-mono font-bold">
                  <th className="py-3 px-4 min-w-[160px]">학생 정보</th>
                  <th className="py-3 px-4 min-w-[110px]">완료 지문 수</th>
                  <th className="py-3 px-4 min-w-[110px]">평균 독해 점수</th>
                  <th className="py-3 px-4 min-w-[110px]">최근 제출일</th>
                  <th className="py-3 px-4 text-right min-w-[90px]">개별 진단</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                {filteredStudents.map((student) => {
                  const studentSubs = submissions.filter(s => s.studentUid === student.id);
                  const completedCount = studentSubs.length;
                  const totalScore = studentSubs.reduce((acc, curr) => acc + (curr.score || 0), 0);
                  const avgScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;
                  
                  const latestSub = studentSubs.sort((a, b) => 
                    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                  )[0];
                  const lastActive = latestSub ? new Date(latestSub.submittedAt).toLocaleDateString('ko-KR') : '응시 이력 없음';

                  return (
                    <tr 
                      key={student.id} 
                      onClick={() => navigate(`/teacher/students/${student.id}`)}
                      className="hover:bg-amber-50/50 transition-colors cursor-pointer group"
                    >
                      {/* Student Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs shadow-tactile-sm border border-slate-700">
                            {student.displayName?.[0] || '학'}
                          </div>
                          <div>
                            <span className="editorial-serif font-black text-slate-900 block text-xs sm:text-sm group-hover:text-blue-900">
                              {student.displayName || '이름 없음'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {student.email || '계정 정보 없음'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Completed Count */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-800">
                        {completedCount}편 완료
                      </td>

                      {/* Average Score */}
                      <td className="py-4 px-4 font-mono font-black">
                        {completedCount > 0 ? (
                          <Badge
                            variant={avgScore >= 80 ? 'stamp-emerald' : avgScore >= 60 ? 'stamp' : 'stamp-amber'}
                            size="sm"
                          >
                            {avgScore}점
                          </Badge>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="py-4 px-4 text-slate-500 font-mono text-xs font-medium">
                        {lastActive}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-slate-900 group-hover:text-blue-900 font-black text-xs">
                          <span>진단서 열람</span>
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

    </div>
  );
};

export default StudentManagement;
