import React from 'react';
import { BrainCircuit, PlayCircle, CheckCircle, Sparkles, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GradeLevel } from '../../../types';
import Spinner from '../../../components/Spinner';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';

interface DailyLearningProps {
  hasCompletedToday: boolean;
  pendingTodayTest: any;
  completedTodayTest: any;
  selectedGrade: GradeLevel | '';
  setSelectedGrade: (grade: GradeLevel) => void;
  handleGenerateDaily: () => void;
  isGeneratingDaily: boolean;
  submissions: any[];
}

const DailyLearning: React.FC<DailyLearningProps> = ({
  hasCompletedToday,
  pendingTodayTest,
  completedTodayTest,
  selectedGrade,
  setSelectedGrade,
  handleGenerateDaily,
  isGeneratingDaily,
  submissions
}) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Editorial Royal Navy Hero Banner */}
      <div className="bg-[#0F172A] rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden border-2 border-slate-900 shadow-tactile">
        {/* Subtle Paper Texture Line Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-blue-500" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border-2 border-slate-700 shadow-tactile-sm">
              <BrainCircuit className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="stamp-amber" size="sm">
                  AI DAILY HABIT
                </Badge>
                <span className="text-xs font-mono font-bold text-slate-400">매일 1지문 3분 훈련</span>
              </div>
              <h2 className="editorial-serif text-2xl sm:text-3xl font-black tracking-tight text-white">
                오늘의 매일 문해력 훈련
              </h2>
            </div>
          </div>
          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal max-w-xl">
            매일 한 편의 엄선된 교과 융합 지문을 정독하고 실시간 AI 문해력 진단 퀴즈를 해결하세요. 
            하루 1지문의 꾸준한 독서 습관이 깊이 있는 사고력을 만듭니다.
          </p>

          {!hasCompletedToday && !pendingTodayTest && (
            <div className="bg-slate-900/90 rounded-xl p-5 border-2 border-slate-800 space-y-2.5">
              <label className="block text-xs font-black text-amber-400 uppercase tracking-wider">
                학습 대상 학년 선택
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value as GradeLevel)}
                className="w-full bg-[#FAF8F5] text-slate-900 font-bold rounded-xl px-4 py-3 border-2 border-slate-700 outline-none focus:border-amber-500 transition-all text-xs sm:text-sm cursor-pointer shadow-inner"
              >
                <option value="">학년을 선택해주세요</option>
                <option value={GradeLevel.ELEM_5}>초등학교 5학년 (개념 이해 및 사실적 추론)</option>
                <option value={GradeLevel.ELEM_6}>초등학교 6학년 (비판적 사고 및 심화 독해)</option>
              </select>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!hasCompletedToday && !pendingTodayTest && (
              <Button
                onClick={handleGenerateDaily}
                disabled={isGeneratingDaily || !selectedGrade}
                variant="tactile-emerald"
                size="lg"
                icon={isGeneratingDaily ? <Spinner size="sm" /> : <PlayCircle className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                {isGeneratingDaily ? '오늘의 맞춤 지문 로딩 중...' : '오늘의 문해력 학습 시작하기'}
              </Button>
            )}

            {pendingTodayTest && (
              <Button
                onClick={() => navigate(`/test/${pendingTodayTest.id}`)}
                variant="tactile-emerald"
                size="lg"
                icon={<PlayCircle className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                오늘의 학습 바로 이어하기
              </Button>
            )}

            {hasCompletedToday && completedTodayTest && (
              <div className="w-full bg-slate-900 border-2 border-emerald-500/50 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-tactile-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-950 rounded-xl flex items-center justify-center border-2 border-emerald-500">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-black text-base text-white">오늘의 일일 학습을 완료했습니다! 🎉</h4>
                    <p className="text-slate-400 text-xs">내일 새로운 일일 지문이 배정됩니다. 오답 노트를 복습해 보세요.</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const submission = submissions.find(s => s.testId === completedTodayTest.id);
                    if (submission) navigate(`/review/${submission.id}`);
                  }}
                  variant="tactile"
                  size="sm"
                  icon={<BookOpen className="w-4 h-4" />}
                  className="w-full sm:w-auto shrink-0"
                >
                  결과 및 오답 확인하기
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyLearning;
