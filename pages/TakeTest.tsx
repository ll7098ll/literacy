import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';
import {
  ArrowLeft, ArrowRight, CheckCircle, BrainCircuit,
  BookOpen, ClipboardList, Check, FileText, Sparkles, Type,
  SlidersHorizontal, Eye, Palette, Hash, ZoomIn, AlertCircle, ChevronRight
} from 'lucide-react';
import {
  getReadingHabitFeedback, getQuestionFeedback,
  getTestSet
} from '../services/contentService';
import { SubmissionStats } from '../types';
import { getReadingStrategies } from '../utils/readingStrategies';
import MarkdownRenderer from '../src/components/MarkdownRenderer';
import Spinner from '../components/Spinner';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

// ─────────────────────────────────────────────
// Sub-components: Reader Settings Modal
// ─────────────────────────────────────────────

interface ReaderSettingsProps {
  theme: 'paper' | 'white' | 'soft';
  setTheme: (t: 'paper' | 'white' | 'soft') => void;
  font: 'serif' | 'sans';
  setFont: (f: 'serif' | 'sans') => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (s: 'normal' | 'large' | 'xlarge') => void;
  showParaNums: boolean;
  setShowParaNums: (b: boolean) => void;
  focusRuler: boolean;
  setFocusRuler: (b: boolean) => void;
}

const ReaderSettingsModal: React.FC<ReaderSettingsProps & { onClose: () => void }> = ({
  theme, setTheme, font, setFont, fontSize, setFontSize,
  showParaNums, setShowParaNums, focusRuler, setFocusRuler, onClose
}) => {
  return (
    <div className="absolute top-16 right-4 sm:right-6 z-50 w-84 bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-float rounded-3xl p-5 space-y-4 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          <span className="font-black text-sm text-slate-900">독서 집중 환경 설정</span>
        </div>
        <button 
          onClick={onClose} 
          className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          닫기
        </button>
      </div>

      {/* 1. Background Theme */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" /> 배경 테마 (눈 피로 완화)
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setTheme('paper')}
            className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
              theme === 'paper' ? 'border-brand-600 ring-2 ring-brand-500/20 bg-[#FAF8F5] text-slate-900 font-black' : 'border-slate-200 bg-[#FAF8F5] text-slate-700'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-[#F5EFE6] border border-[#E8DFC8]" />
            아이보리
          </button>
          <button
            onClick={() => setTheme('soft')}
            className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
              theme === 'soft' ? 'border-brand-600 ring-2 ring-brand-500/20 bg-[#F4EFEA] text-slate-900 font-black' : 'border-slate-200 bg-[#F4EFEA] text-slate-700'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-[#E5DFD7] border border-[#D5CDC3]" />
            소프트
          </button>
          <button
            onClick={() => setTheme('white')}
            className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
              theme === 'white' ? 'border-brand-600 ring-2 ring-brand-500/20 bg-white text-slate-900 font-black' : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white border border-slate-300" />
            화이트
          </button>
        </div>
      </div>

      {/* 2. Font Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5" /> 본문 서체
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFont('serif')}
            className={`py-2 px-3 rounded-xl text-xs font-serif font-black border transition-all cursor-pointer ${
              font === 'serif' ? 'bg-brand-50 border-brand-600 text-brand-700 ring-1 ring-brand-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            명조체 (정독 권장)
          </button>
          <button
            onClick={() => setFont('sans')}
            className={`py-2 px-3 rounded-xl text-xs font-sans font-black border transition-all cursor-pointer ${
              font === 'sans' ? 'bg-brand-50 border-brand-600 text-brand-700 ring-1 ring-brand-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            고딕체 (깔끔함)
          </button>
        </div>
      </div>

      {/* 3. Font Size */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          <ZoomIn className="w-3.5 h-3.5" /> 글자 크기
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setFontSize('normal')}
            className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              fontSize === 'normal' ? 'bg-brand-50 border-brand-600 text-brand-700 ring-1 ring-brand-600' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            보통 (16px)
          </button>
          <button
            onClick={() => setFontSize('large')}
            className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              fontSize === 'large' ? 'bg-brand-50 border-brand-600 text-brand-700 ring-1 ring-brand-600' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            크게 (18px)
          </button>
          <button
            onClick={() => setFontSize('xlarge')}
            className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              fontSize === 'xlarge' ? 'bg-brand-50 border-brand-600 text-brand-700 ring-1 ring-brand-600' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            더 크게 (20px)
          </button>
        </div>
      </div>

      {/* 4. Reading Aids */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-brand-600" /> 문단 번호 [1], [2] 표시
          </span>
          <input
            type="checkbox"
            checked={showParaNums}
            onChange={(e) => setShowParaNums(e.target.checked)}
            className="w-4 h-4 text-brand-600 rounded accent-brand-600 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-growth-600" /> 독서 포커스 룰러 (줄 놓침 방지)
          </span>
          <input
            type="checkbox"
            checked={focusRuler}
            onChange={(e) => setFocusRuler(e.target.checked)}
            className="w-4 h-4 text-brand-600 rounded accent-brand-600 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Sub-components: Phase 1 Checklist
// ─────────────────────────────────────────────

const ReadingChecklist: React.FC<{
  strategies: { id: string; text: string }[];
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  onProceed: () => void;
}> = ({ strategies, checked, onToggle, onProceed }) => {
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = strategies.length > 0 ? Math.round((checkedCount / strategies.length) * 100) : 0;

  return (
    <Card variant="paper" padding="md" className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b-2 border-[#E8E1D5]">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shadow-tactile-sm shrink-0">
          <BrainCircuit className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-sm sm:text-base leading-tight">독해 사고 체크리스트</h3>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5">글을 꼼꼼히 읽으며 실천한 전략을 체크하세요</p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-black">
          <span className="text-slate-600">사고 전략 달성률</span>
          <span className="text-blue-700 font-black">{progress}%</span>
        </div>
        <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden border border-slate-300">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {strategies.map((s) => (
          <label
            key={s.id}
            className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all select-none ${
              checked[s.id]
                ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 font-bold shadow-tactile-sm'
                : 'bg-white border-slate-300 text-slate-700 hover:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className={`w-5 h-5 mt-0.5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
              checked[s.id] ? 'bg-emerald-600 border-emerald-700 text-white shadow-tactile-sm' : 'border-slate-400 bg-white'
            }`}>
              {checked[s.id] && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </div>
            <input type="checkbox" className="sr-only" checked={!!checked[s.id]} onChange={() => onToggle(s.id)} />
            <span className={`text-xs leading-snug ${checked[s.id] ? 'line-through opacity-80' : ''}`}>
              {s.text}
            </span>
          </label>
        ))}
      </div>

      {/* CTA Button */}
      <Button
        onClick={onProceed}
        variant="tactile-emerald"
        size="lg"
        className="w-full"
        icon={<ClipboardList className="w-4 h-4" />}
        iconRight={<ArrowRight className="w-4 h-4" />}
      >
        문제 풀러 가기
      </Button>

      {progress < 50 && (
        <p className="text-[11px] text-slate-500 text-center font-bold">
          ✍️ 지문을 천천히 정독하고 체크하면 문해력이 쑥쑥 자라요!
        </p>
      )}
    </Card>
  );
};

// ─────────────────────────────────────────────
// Sub-components: Answer Option Radio Button (Tactile 3D Keycap)
// ─────────────────────────────────────────────

const AnswerOption: React.FC<{
  idx: number;
  text: string;
  selected: boolean;
  checked: boolean;
  isCorrect: boolean;
  onSelect: () => void;
  fontSizeClass: string;
}> = ({ idx, text, selected, checked, isCorrect, onSelect, fontSizeClass }) => {
  const nums = ['①', '②', '③', '④', '⑤'];
  
  let containerCls = 'border-2 border-slate-300 bg-white hover:border-slate-800 hover:shadow-tactile-sm cursor-pointer tactile-btn';
  let badgeCls = 'bg-slate-100 text-slate-700 border border-slate-300';
  
  if (checked) {
    if (isCorrect) {
      containerCls = 'border-2 border-emerald-600 bg-emerald-50 text-emerald-950 shadow-tactile-emerald cursor-default';
      badgeCls = 'bg-emerald-600 text-white border-emerald-700';
    } else if (selected) {
      containerCls = 'border-2 border-rose-500 bg-rose-50 text-rose-950 cursor-default';
      badgeCls = 'bg-rose-600 text-white border-rose-700';
    } else {
      containerCls = 'border-2 border-slate-200 opacity-40 cursor-default bg-slate-50';
      badgeCls = 'bg-slate-200 text-slate-400 border-slate-300';
    }
  } else if (selected) {
    containerCls = 'border-2 border-blue-600 bg-blue-50/90 text-blue-950 shadow-tactile-blue translate-y-0.5';
    badgeCls = 'bg-blue-600 text-white border-blue-800 shadow-tactile-sm';
  }

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={checked ? -1 : 0}
      onClick={() => !checked && onSelect()}
      onKeyDown={(e) => { 
        if (!checked && (e.key === ' ' || e.key === 'Enter')) { 
          e.preventDefault(); 
          onSelect(); 
        } 
      }}
      className={`flex items-start gap-3.5 p-4 rounded-xl transition-all duration-100 select-none ${containerCls}`}
    >
      <span className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 transition-colors ${badgeCls}`}>
        {nums[idx]}
      </span>
      <span className={`${fontSizeClass} leading-relaxed flex-1 font-medium ${
        checked && isCorrect ? 'text-emerald-950 font-bold' : checked && selected ? 'text-rose-950' : selected ? 'text-blue-950 font-bold' : 'text-slate-800'
      }`}>
        <MarkdownRenderer content={text} inline />
      </span>
      <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
        {idx + 1}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main TakeTest Page Component
// ─────────────────────────────────────────────

const TakeTest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [test, setTest] = useState<any>(null);
  const [testSet, setTestSet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'real' | 'practice'>('practice');

  // Sequential Flow: 'reading' (Phase 1) -> 'solving' (Phase 2)
  const [phase, setPhase] = useState<'reading' | 'solving'>('reading');
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);

  // Split-screen states
  const [mobileTab, setMobileTab] = useState<'passage' | 'questions'>('questions');
  const [focusedParaIndex, setFocusedParaIndex] = useState<number | null>(null);
  const [hoveredPara, setHoveredPara] = useState<number | null>(null);

  // User input states
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean>>({});
  const [strategiesChecked, setStrategiesChecked] = useState<Record<number, Record<string, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reader Customization States
  const [readerTheme, setReaderTheme] = useState<'paper' | 'white' | 'soft'>('paper');
  const [readerFont, setReaderFont] = useState<'serif' | 'sans'>('serif');
  const [readerFontSize, setReaderFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [showParaNums, setShowParaNums] = useState(true);
  const [focusRuler, setFocusRuler] = useState(false);
  const [isReaderSettingsOpen, setIsReaderSettingsOpen] = useState(false);

  // DOM Refs
  const passagePanelRef = useRef<HTMLDivElement>(null);
  const questionPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTest = async () => {
      if (!id) return;
      try {
        const preGen = getTestSet(id);
        if (preGen) {
          setTest({ id, title: preGen.title, teacherUid: 'system' });
          setTestSet(preGen);
        } else {
          const docRef = doc(db, 'tests', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTest(data);
            setTestSet(JSON.parse(data.testSet));
          } else {
            alert('시험을 찾을 수 없습니다.');
            navigate('/');
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `tests/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id, navigate]);

  const passage = testSet?.passages?.[currentPassageIndex];
  const totalPassages = testSet?.passages?.length || 0;

  const strategies = passage ? getReadingStrategies(testSet?.gradeLevel, passage.category) : [];
  const currentChecked = strategiesChecked[currentPassageIndex] || {};

  const toggleStrategyCheck = (sId: string) => {
    setStrategiesChecked(prev => ({
      ...prev,
      [currentPassageIndex]: {
        ...(prev[currentPassageIndex] || {}),
        [sId]: !prev[currentPassageIndex]?.[sId]
      }
    }));
  };

  const handleSelectAnswer = (qUid: string, optIdx: number) => {
    setAnswers(prev => ({ ...prev, [qUid]: optIdx }));
  };

  const handleProceedToSolving = () => {
    setPhase('solving');
    setMobileTab('questions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToPara = (paraIdx: number) => {
    setFocusedParaIndex(paraIdx);
    setTimeout(() => {
      const el = document.getElementById(`para-${currentPassageIndex}-${paraIdx}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const handleSubmit = async () => {
    if (!testSet || !user) return;

    let totalQ = 0;
    testSet.passages.forEach((p: any) => { totalQ += p.questions.length; });
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQ) {
      if (!window.confirm(`총 ${totalQ}문제 중 ${answeredCount}문제만 풀었습니다. 그래도 제출할까요?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      let correctCount = 0;
      const typeStats: Record<string, { total: number; correct: number }> = {};
      const subjectStats: Record<string, { total: number; correct: number }> = {};

      testSet.passages.forEach((p: any, pIndex: number) => {
        if (!subjectStats[p.category]) subjectStats[p.category] = { total: 0, correct: 0 };
        p.questions.forEach((q: any, qIndex: number) => {
          if (!typeStats[q.type]) typeStats[q.type] = { total: 0, correct: 0 };
          typeStats[q.type].total++;
          subjectStats[p.category].total++;
          const uid = `${pIndex}_${qIndex}`;
          if (answers[uid] === q.answer) {
            correctCount++;
            typeStats[q.type].correct++;
            subjectStats[p.category].correct++;
          }
        });
      });

      const score = Math.round((correctCount / totalQ) * 100);
      const stats: SubmissionStats = { totalQuestions: totalQ, correctCount, score, typeStats, subjectStats };

      let readingHabitFeedback = null;
      const populatedInteractiveFeedback: Record<string, string> = {};

      const allChecked = new Set<string>();
      Object.values(strategiesChecked).forEach(pc =>
        Object.keys(pc).forEach(k => { if (pc[k]) allChecked.add(k); })
      );
      const cat = testSet.passages[0]?.category || '국어';
      const strats = getReadingStrategies(testSet.gradeLevel, cat);
      readingHabitFeedback = getReadingHabitFeedback(score, allChecked.size, strats.length);

      testSet.passages.forEach((p: any, pIndex: number) => {
        const passageChecked = strategiesChecked[pIndex] || {};
        const checkedIds = Object.keys(passageChecked).filter(k => passageChecked[k]);
        p.questions.forEach((q: any, qIndex: number) => {
          const uid = `${pIndex}_${qIndex}`;
          const isCorrect = answers[uid] === q.answer;
          const feedback = getQuestionFeedback(test.id, pIndex, qIndex, isCorrect, checkedIds);
          if (feedback) {
            populatedInteractiveFeedback[uid] = feedback;
          }
        });
      });

      const submissionId = `sub_${Date.now()}`;
      await setDoc(doc(db, 'submissions', submissionId), {
        id: submissionId, testId: test.id,
        studentUid: user.uid, teacherUid: test.teacherUid,
        answers: JSON.stringify(answers),
        score, stats: JSON.stringify(stats), mode,
        strategiesChecked: JSON.stringify(strategiesChecked),
        readingHabitFeedback,
        questionReasonings: '{}',
        interactiveFeedback: JSON.stringify(populatedInteractiveFeedback),
        submittedAt: new Date().toISOString(),
      });

      navigate(`/review/${submissionId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'submissions');
    } finally {
      setSubmitting(false);
    }
  };

  const passageAnsweredCount = (pIdx: number) => {
    const p = testSet?.passages?.[pIdx];
    if (!p) return 0;
    return p.questions.filter((_: any, qIdx: number) => answers[`${pIdx}_${qIdx}`] !== undefined).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Spinner size="lg" className="text-brand-600" />
      </div>
    );
  }

  if (!testSet || !passage) return null;

  const startQ = testSet.passages
    .slice(0, currentPassageIndex)
    .reduce((acc: number, p: any) => acc + p.questions.length, 0) + 1;

  // Typography & Reader styling
  const themeCardClass = readerTheme === 'paper' 
    ? 'bg-[#FAF8F5] text-[#1E293B] border-[#E8E2D9]' 
    : readerTheme === 'soft' 
    ? 'bg-[#F4EFEA] text-[#1E293B] border-[#E2DDD5]' 
    : 'bg-white text-slate-900 border-slate-200';

  const fontClass = readerFont === 'serif' ? 'font-serif tracking-normal' : 'font-sans tracking-tight';

  const bodyFontSizeClass = readerFontSize === 'xlarge' 
    ? 'text-xl leading-[2.35]' 
    : readerFontSize === 'large' 
    ? 'text-lg leading-[2.15]' 
    : 'text-base leading-[1.95]';

  const questionFontSize = readerFontSize === 'xlarge' ? 'text-lg' : readerFontSize === 'large' ? 'text-base' : 'text-sm';

  // ─────────────────────────────────────────────
  // Phase 1: Deep Reading Phase
  // ─────────────────────────────────────────────
  if (phase === 'reading') {
    return (
      <div className="min-h-screen bg-[#F4EFEA] flex flex-col font-sans antialiased text-slate-800 relative">
        {/* Editorial Top Bar */}
        <header className="sticky top-0 z-40 w-full h-16 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 flex items-center px-4 sm:px-6 justify-between shadow-subtle">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-950 text-xs sm:text-sm font-black transition-colors cursor-pointer py-1.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 tactile-btn"
            >
              <ArrowLeft className="w-4 h-4" /> <span>대시보드</span>
            </button>

            <Badge variant="stamp" size="md" className="hidden sm:inline-flex">
              <BookOpen className="w-3.5 h-3.5 mr-1 text-amber-400" />
              1단계: 정독 및 사고 전략 체크
            </Badge>
          </div>

          {/* Progress pills */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {Array.from({ length: totalPassages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPassageIndex(i)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 ${
                  i === currentPassageIndex
                    ? 'bg-slate-900 border-slate-950 text-white shadow-tactile-sm'
                    : i < currentPassageIndex
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                }`}
              >
                {i < currentPassageIndex ? <Check className="w-3.5 h-3.5" /> : null}
                지문 {i + 1}
              </button>
            ))}
          </div>

          {/* Reader Settings Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsReaderSettingsOpen(!isReaderSettingsOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 text-xs font-black cursor-pointer transition-all ${
                isReaderSettingsOpen 
                  ? 'bg-slate-900 border-slate-950 text-white shadow-tactile-sm' 
                  : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">독서 환경 설정</span>
            </button>

            {isReaderSettingsOpen && (
              <ReaderSettingsModal
                theme={readerTheme} setTheme={setReaderTheme}
                font={readerFont} setFont={setReaderFont}
                fontSize={readerFontSize} setFontSize={setReaderFontSize}
                showParaNums={showParaNums} setShowParaNums={setShowParaNums}
                focusRuler={focusRuler} setFocusRuler={setFocusRuler}
                onClose={() => setIsReaderSettingsOpen(false)}
              />
            )}
          </div>
        </header>

        {/* Phase 1 Main Layout: Editorial Reading Studio */}
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left: Passage Reader (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`rounded-2xl p-6 sm:p-10 border-2 shadow-card transition-all ${themeCardClass}`}>
              
              {/* Passage Category & Title */}
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-[#E8E1D5]">
                <div className="flex items-center gap-2">
                  <Badge variant="stamp" size="sm">
                    {passage.category}
                  </Badge>
                  <span className="text-xs font-black text-slate-500">
                    초등 5·6학년 국어 교과 심층 독해
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  지문 {currentPassageIndex + 1} / {totalPassages}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-6">
                {passage.title}
              </h2>

              {/* Passage Content Paragraphs */}
              <div className={`space-y-6 ${fontClass} ${bodyFontSizeClass}`}>
                {passage.paragraphs ? (
                  passage.paragraphs.map((para: string, pIdx: number) => (
                    <div
                      key={pIdx}
                      id={`para-${currentPassageIndex}-${pIdx}`}
                      onMouseEnter={() => setHoveredPara(pIdx)}
                      onMouseLeave={() => setHoveredPara(null)}
                      className={`editorial-para relative p-3 rounded-xl transition-all ${
                        hoveredPara === pIdx && focusRuler ? 'bg-amber-100/60 shadow-sm ring-1 ring-amber-300' : ''
                      }`}
                    >
                      {showParaNums && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-mono font-black bg-slate-800 text-white mr-2.5 select-none shadow-tactile-sm">
                          {pIdx + 1}
                        </span>
                      )}
                      <MarkdownRenderer content={para} inline />
                    </div>
                  ))
                ) : (
                  <div className="p-3 editorial-para">
                    <MarkdownRenderer content={passage.content} />
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="md"
                disabled={currentPassageIndex === 0}
                onClick={() => setCurrentPassageIndex(i => i - 1)}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                이전 지문
              </Button>

              <Button
                variant="tactile-emerald"
                size="md"
                onClick={handleProceedToSolving}
                icon={<ClipboardList className="w-4 h-4" />}
                iconRight={<ArrowRight className="w-4 h-4" />}
              >
                문제 풀러 가기
              </Button>
            </div>
          </div>

          {/* Right: Sticky Checklist Panel (1 col) */}
          <div className="lg:sticky lg:top-24">
            <ReadingChecklist
              strategies={strategies}
              checked={currentChecked}
              onToggle={toggleStrategyCheck}
              onProceed={handleProceedToSolving}
            />
          </div>

        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Phase 2: Split-Screen Solving Phase
  // ─────────────────────────────────────────────
  const answeredInPassage = passageAnsweredCount(currentPassageIndex);
  const totalInPassage = passage.questions.length;

  return (
    <div className="h-[100dvh] bg-[#F4EFEA] flex flex-col font-sans antialiased text-slate-800 overflow-hidden relative">
      
      {/* Split Header */}
      <header className="w-full h-16 bg-white/95 backdrop-blur-md border-b-2 border-slate-300 flex items-center px-4 md:px-6 justify-between shadow-subtle shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPhase('reading')}
            className="flex items-center gap-1.5 text-slate-700 hover:text-slate-950 text-xs sm:text-sm font-black transition-colors cursor-pointer py-1.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 tactile-btn"
          >
            <ArrowLeft className="w-4 h-4" /> <span>정독 화면</span>
          </button>

          <Badge variant="stamp-emerald" size="md" className="hidden sm:inline-flex">
            2단계: 문항 풀이 & 지문 교차검증
          </Badge>
        </div>

        {/* Passage Progress Pills */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPassages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPassageIndex(i)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 ${
                i === currentPassageIndex 
                  ? 'bg-slate-900 border-slate-950 text-white shadow-tactile-sm' :
                i < currentPassageIndex 
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900' :
                  'bg-white border-slate-300 text-slate-500 hover:border-slate-500'
              }`}
            >
              {i < currentPassageIndex ? <Check className="w-3.5 h-3.5" /> : null}
              지문 {i + 1}
            </button>
          ))}
        </div>

        {/* Mobile View Tab Toggle */}
        <div className="flex lg:hidden items-center gap-1 bg-slate-200/80 p-1 rounded-xl border border-slate-300">
          <button
            onClick={() => setMobileTab('passage')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
              mobileTab === 'passage' ? 'bg-white text-slate-900 shadow-sm border border-slate-300' : 'text-slate-600'
            }`}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1" />지문
          </button>
          <button
            onClick={() => setMobileTab('questions')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
              mobileTab === 'questions' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 inline mr-1" />문제 ({answeredInPassage}/{totalInPassage})
          </button>
        </div>

        {/* Actions (Reader Settings & Submit Button) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReaderSettingsOpen(!isReaderSettingsOpen)}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer shadow-subtle"
            title="읽기 환경 설정"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {isReaderSettingsOpen && (
            <ReaderSettingsModal
              theme={readerTheme} setTheme={setReaderTheme}
              font={readerFont} setFont={setReaderFont}
              fontSize={readerFontSize} setFontSize={setReaderFontSize}
              showParaNums={showParaNums} setShowParaNums={setShowParaNums}
              focusRuler={focusRuler} setFocusRuler={setFocusRuler}
              onClose={() => setIsReaderSettingsOpen(false)}
            />
          )}

          <Button
            onClick={handleSubmit}
            size="sm"
            variant="primary"
            loading={submitting}
            icon={<CheckCircle className="w-4 h-4" />}
          >
            최종 제출
          </Button>
        </div>
      </header>

      {/* Split Workspace Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        
        {/* Left Panel: Passage (Independent Scroll) */}
        <div 
          ref={passagePanelRef}
          className={`h-full overflow-y-auto p-6 md:p-10 border-r border-slate-200/80 transition-colors ${
            mobileTab === 'questions' ? 'hidden lg:block' : 'block'
          } ${
            readerTheme === 'paper' ? 'bg-[#FAF8F5]' : readerTheme === 'soft' ? 'bg-[#F4EFEA]' : 'bg-white'
          }`}
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
              <Badge variant="brand" size="sm">{passage.category}</Badge>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{passage.title}</h2>
            </div>

            <div className={`space-y-6 ${fontClass} ${bodyFontSizeClass}`}>
              {passage.paragraphs ? (
                passage.paragraphs.map((para: string, pIdx: number) => {
                  const isFocused = focusedParaIndex === pIdx;
                  return (
                    <div
                      key={pIdx}
                      id={`para-${currentPassageIndex}-${pIdx}`}
                      className={`relative p-3.5 rounded-2xl transition-all ${
                        isFocused 
                          ? 'bg-brand-100/70 shadow-sm ring-2 ring-brand-500/30' 
                          : hoveredPara === pIdx && focusRuler 
                          ? 'bg-brand-50/50 shadow-subtle ring-1 ring-brand-200' 
                          : ''
                      }`}
                    >
                      {showParaNums && (
                        <span className="inline-block mr-2 px-1.5 py-0.5 rounded text-[11px] font-black bg-slate-200/70 text-slate-600 select-none">
                          [{pIdx + 1}]
                        </span>
                      )}
                      <MarkdownRenderer content={para} inline />
                    </div>
                  );
                })
              ) : (
                <MarkdownRenderer content={passage.content} />
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Questions (Independent Scroll) */}
        <div 
          ref={questionPanelRef}
          className={`h-full overflow-y-auto p-6 md:p-10 bg-[#F8FAFC] space-y-8 ${
            mobileTab === 'passage' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="max-w-2xl mx-auto space-y-8">
            
            {/* Questions Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border-2 border-slate-300 shadow-tactile-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-700">지문 {currentPassageIndex + 1} 문항 풀이</span>
                <Badge variant={answeredInPassage === totalInPassage ? 'stamp-emerald' : 'stamp'} size="sm">
                  {answeredInPassage} / {totalInPassage} 완료
                </Badge>
              </div>

              <div className="flex items-center gap-1.5">
                {passage.questions.map((_: any, qIdx: number) => {
                  const uid = `${currentPassageIndex}_${qIdx}`;
                  const isSolved = answers[uid] !== undefined;
                  return (
                    <span
                      key={qIdx}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all border ${
                        isSolved 
                          ? 'bg-blue-600 border-blue-800 text-white shadow-tactile-sm' 
                          : 'bg-slate-100 border-slate-300 text-slate-500'
                      }`}
                    >
                      {startQ + qIdx}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Questions List */}
            {passage.questions.map((q: any, qIdx: number) => {
              const qUid = `${currentPassageIndex}_${qIdx}`;
              const globalNum = startQ + qIdx;
              const selectedOpt = answers[qUid];

              return (
                <Card key={qIdx} padding="lg" className="space-y-5 bg-white border-2 border-slate-300 shadow-card">
                  
                  {/* Question Title Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-900 border-2 border-slate-950 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-tactile-sm">
                        {globalNum}
                      </span>
                      <div>
                        <Badge variant="outline" size="sm" className="mb-1.5 font-black text-slate-600">
                          {q.type}
                        </Badge>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                          <MarkdownRenderer content={q.text || q.question} inline />
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Options List (Brilliant 3D Keycap Options) */}
                  <div className="space-y-2.5 pt-1">
                    {q.options.map((opt: string, optIdx: number) => (
                      <AnswerOption
                        key={optIdx}
                        idx={optIdx}
                        text={opt}
                        selected={selectedOpt === optIdx}
                        checked={false}
                        isCorrect={false}
                        onSelect={() => handleSelectAnswer(qUid, optIdx)}
                        fontSizeClass={questionFontSize}
                      />
                    ))}
                  </div>

                </Card>
              );
            })}

            {/* Bottom Navigation for Next Passage or Submit */}
            <div className="flex items-center justify-between pt-4 pb-12">
              <Button
                variant="outline"
                size="md"
                disabled={currentPassageIndex === 0}
                onClick={() => {
                  setCurrentPassageIndex(i => i - 1);
                  setPhase('reading');
                }}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                이전 지문
              </Button>

              {currentPassageIndex < totalPassages - 1 ? (
                <Button
                  variant="tactile"
                  size="md"
                  onClick={() => {
                    setCurrentPassageIndex(i => i + 1);
                    setPhase('reading');
                  }}
                  iconRight={<ArrowRight className="w-4 h-4" />}
                >
                  다음 지문 읽기
                </Button>
              ) : (
                <Button
                  variant="tactile-emerald"
                  size="md"
                  loading={submitting}
                  onClick={handleSubmit}
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  최종 제출하기
                </Button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default TakeTest;
