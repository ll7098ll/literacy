import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Users, Link2, Info, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

const RoleSelection: React.FC = () => {
  const { setRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);
  const [teacherCode, setTeacherCode] = useState('');
  const [isInviteMode, setIsInviteMode] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load pending teacher code from localStorage on mount
  useEffect(() => {
    const code = localStorage.getItem('pendingTeacherCode');
    if (code) {
      setSelectedRole('student');
      setTeacherCode(code);
      setIsInviteMode(true);
    }
  }, []);

  const handleCancelInvite = () => {
    localStorage.removeItem('pendingTeacherCode');
    setSelectedRole(null);
    setTeacherCode('');
    setIsInviteMode(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    if (selectedRole === 'student' && !teacherCode.trim()) {
      setError('선생님 초대 코드를 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await setRole(selectedRole, teacherCode.trim());
      localStorage.removeItem('pendingTeacherCode');
    } catch (err) {
      setError('역할 설정 및 연동 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4EFEA] p-4 selection:bg-slate-900 selection:text-white relative overflow-hidden">
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-tactile p-7 sm:p-9 border-2 border-slate-900 relative z-10 space-y-7">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-xl bg-slate-900 border-2 border-slate-950 text-white flex items-center justify-center mx-auto shadow-tactile-sm">
            <Sparkles className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">시작할 역할을 선택해 주세요</h2>
          <p className="text-slate-600 text-xs sm:text-sm font-medium">
            원활한 맞춤 독해 학습을 위해 첫 접속 시 1회 역할 설정이 필요합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Select Buttons */}
          <div className="grid grid-cols-2 gap-3.5">
            <button
              type="button"
              disabled={isInviteMode}
              onClick={() => { setSelectedRole('teacher'); setError(''); }}
              className={`p-5 rounded-xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer tactile-btn ${
                selectedRole === 'teacher' 
                  ? 'border-blue-600 bg-blue-50/80 text-blue-950 shadow-tactile-blue translate-y-0.5' 
                  : 'border-slate-300 bg-white hover:border-slate-800 hover:shadow-tactile-sm text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                selectedRole === 'teacher' ? 'bg-blue-600 text-white shadow-tactile-sm' : 'bg-slate-100 text-slate-600'
              }`}>
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="text-sm font-black block text-slate-900">선생님</span>
                <span className="text-[11px] text-slate-500 font-bold mt-0.5">학급 관리 & 과제 출제</span>
              </div>
            </button>
            
            <button
              type="button"
              disabled={isInviteMode}
              onClick={() => { setSelectedRole('student'); setError(''); }}
              className={`p-5 rounded-xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer tactile-btn ${
                selectedRole === 'student' 
                  ? 'border-blue-600 bg-blue-50/80 text-blue-950 shadow-tactile-blue translate-y-0.5' 
                  : 'border-slate-300 bg-white hover:border-slate-800 hover:shadow-tactile-sm text-slate-700'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                selectedRole === 'student' ? 'bg-blue-600 text-white shadow-tactile-sm' : 'bg-slate-100 text-slate-600'
              }`}>
                <Users className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="text-sm font-black block text-slate-900">학생</span>
                <span className="text-[11px] text-slate-500 font-bold mt-0.5">지문 독해 & 문제 풀이</span>
              </div>
            </button>
          </div>

          {/* Invitation Link Helper Indicator */}
          {isInviteMode && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-start gap-3 shadow-tactile-sm">
              <Link2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 leading-relaxed">
                <span className="font-black block text-sm mb-0.5 text-amber-900">선생님 초대 코드가 확인되었습니다</span>
                시작하기 버튼을 누르면 학급에 자동 편성되어 오늘 배정된 과제를 즉시 풀 수 있습니다.
                <button 
                  type="button"
                  onClick={handleCancelInvite}
                  className="block mt-2 font-black text-rose-700 hover:text-rose-900 underline text-xs cursor-pointer"
                >
                  초대 취소하고 직접 선택하기
                </button>
              </div>
            </div>
          )}

          {/* Teacher Code Input */}
          {selectedRole === 'student' && !isInviteMode && (
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-800">
                선생님 6자리 초대 코드
              </label>
              <input
                type="text"
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value)}
                placeholder="예: ABC-123"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-slate-900 outline-none transition-all text-sm font-mono font-black text-slate-900 bg-white shadow-tactile-sm"
              />
              <p className="text-[11px] text-slate-600 font-bold flex items-center gap-1.5 pl-1">
                <Info className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>선생님께 전달받은 6자리 학급 코드를 입력해 주세요.</span>
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-black text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            variant="tactile-emerald"
            disabled={!selectedRole || isSubmitting}
            loading={isSubmitting}
            className="w-full"
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            시작하기
          </Button>
        </form>

      </div>
    </div>
  );
};

export default RoleSelection;
