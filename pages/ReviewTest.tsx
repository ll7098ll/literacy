import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';
import { allTestSets } from '../data/tests';
import { getQuestionFAQ } from '../services/contentService';
import { 
  ArrowLeft, CheckCircle2, XCircle, ChevronRight, Sparkles, BookOpen, 
  HelpCircle, Bot, Filter, Eye, RotateCw, ExternalLink, X, Check, Award
} from 'lucide-react';
import MarkdownRenderer from '../src/components/MarkdownRenderer';
import Spinner from '../components/Spinner';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

const ReviewTest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState<any>(null);
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Review & reading states
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [showOnlyWrong, setShowOnlyWrong] = useState(false);
  const [focusedParaIndex, setFocusedParaIndex] = useState<number | null>(null);

  // Reader Customization
  const [readerFontSize, setReaderFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [readerFont, setReaderFont] = useState<'sans' | 'serif'>('serif');
  const [readerTheme, setReaderTheme] = useState<'paper' | 'clean' | 'soft'>('paper');
  const [showParaNums, setShowParaNums] = useState(true);

  // AI 1:1 FAQ Tutor Modal
  const [activeFAQ, setActiveFAQ] = useState<{ faq: any[]; questionNum: number; pIndex: number; qIndex: number } | null>(null);

  // Mobile layout switch
  const [mobileTab, setMobileTab] = useState<'passage' | 'questions'>('passage');

  const passagePanelRef = useRef<HTMLDivElement>(null);
  const questionPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const subDoc = await getDoc(doc(db, 'submissions', id));
        if (subDoc.exists()) {
          const subData = { id: subDoc.id, ...subDoc.data() } as any;
          setSubmission(subData);

          let testData = allTestSets.find(t => t.id === subData.testId);
          if (!testData) {
            const tDoc = await getDoc(doc(db, 'tests', subData.testId));
            if (tDoc.exists()) {
              testData = { id: tDoc.id, ...tDoc.data() } as any;
            }
          }
          setTest(testData);
        } else {
          alert('제출된 시험 결과를 찾을 수 없습니다.');
          navigate('/');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `submissions/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const openFAQ = (uniqueQId: string, globalQNum: number) => {
    const pIndex = parseInt(uniqueQId.split('_')[0]);
    const qIndex = parseInt(uniqueQId.split('_')[1]);
    const testId = submission?.testId || '';
    const faq = getQuestionFAQ(testId, pIndex, qIndex);
    setActiveFAQ({ faq, questionNum: globalQNum, pIndex, qIndex });
  };

  const scrollToPara = (paraIdx: number) => {
    setFocusedParaIndex(paraIdx);
    setTimeout(() => {
      const el = document.getElementById(`review-para-${currentPassageIndex}-${paraIdx}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Spinner size="lg" className="text-slate-900" />
      </div>
    );
  }

  if (!test || !submission) return null;

  const testSet = test.testSet || test;
  if (!testSet || !testSet.passages) return null;

  const passage = testSet.passages[currentPassageIndex];
  const totalPassages = testSet.passages.length;

  const fontClass = readerFont === 'serif' ? 'editorial-serif tracking-normal' : 'font-sans tracking-tight';

  const bodyFontSizeClass = readerFontSize === 'xlarge' 
    ? 'text-xl leading-[2.35]' 
    : readerFontSize === 'large' 
    ? 'text-lg leading-[2.15]' 
    : 'text-base leading-[1.95]';

  const answers = submission.answers || {};
  const feedback = submission.feedback;

  const startQ = testSet.passages
    .slice(0, currentPassageIndex)
    .reduce((acc: number, p: any) => acc + p.questions.length, 0) + 1;

  const displayedQuestions = passage.questions
    .map((q: any, qIdx: number) => ({ q, qIdx, uid: `${currentPassageIndex}_${qIdx}`, globalNum: startQ + qIdx }))
    .filter(({ q, uid }: any) => {
      if (!showOnlyWrong) return true;
      return answers[uid] !== q.answer;
    });

  const score = submission.score || 0;
  const isHigh = score >= 80;
  const isMid = score >= 60 && score < 80;

  return (
    <div className="h-[100dvh] bg-[#F8FAFC] flex flex-col font-sans antialiased text-slate-800 overflow-hidden relative selection:bg-slate-900 selection:text-white">
      
      {/* High-Contrast Top Header */}
      <header className="w-full h-16 bg-white border-b-2 border-slate-900 flex items-center px-4 md:px-6 justify-between shadow-tactile-sm shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-black transition-colors cursor-pointer py-1.5 px-3 rounded-lg border-2 border-slate-300 hover:border-slate-900 bg-[#FAF8F5]"
          >
            <ArrowLeft className="w-4 h-4" /> <span>대시보드</span>
          </button>

          <div className="h-4 w-px bg-slate-300 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="editorial-serif font-black text-sm text-slate-900 truncate max-w-xs hidden sm:inline">
              {test?.title || '문해력 과제 복습'}
            </span>
            <Badge variant={isHigh ? 'stamp-emerald' : isMid ? 'stamp-amber' : 'stamp'} size="sm">
              내 점수: {score}점
            </Badge>
          </div>
        </div>

        {/* Passage Progress Tabs */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPassages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPassageIndex(i)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-mono font-black transition-all cursor-pointer border-2 ${
                i === currentPassageIndex 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-tactile-sm' 
                  : 'bg-[#FAF8F5] text-slate-700 border-slate-300 hover:border-slate-900'
              }`}
            >
              지문 {i + 1}
            </button>
          ))}
        </div>

        {/* Filter & View actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOnlyWrong(!showOnlyWrong)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border-2 ${
              showOnlyWrong 
                ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-tactile-sm' 
                : 'bg-white border-slate-300 text-slate-700 hover:border-slate-900'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>오답만 모아보기</span>
          </button>

          <Button
            onClick={() => navigate('/')}
            variant="tactile"
            size="sm"
          >
            학습 완료
          </Button>
        </div>
      </header>

      {/* 2-Column Split Review Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        
        {/* Left Panel: Passage with Evidence Highlight */}
        <div 
          ref={passagePanelRef}
          className={`h-full overflow-y-auto p-6 md:p-10 border-r-2 border-slate-300 transition-colors bg-[#FAF8F5] ${
            mobileTab === 'questions' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
              <div className="flex items-center gap-2.5">
                <Badge variant="stamp" size="sm">{passage.category || '국어 독해'}</Badge>
                <h2 className="editorial-serif text-xl font-black text-slate-900 tracking-tight">{passage.title}</h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">지문 근거 대조 뷰</span>
            </div>

            <div className={`space-y-6 ${fontClass} ${bodyFontSizeClass} text-slate-900`}>
              {passage.paragraphs ? (
                passage.paragraphs.map((para: string, pIdx: number) => {
                  const isFocused = focusedParaIndex === pIdx;
                  return (
                    <div
                      key={pIdx}
                      id={`review-para-${currentPassageIndex}-${pIdx}`}
                      className={`relative p-4 rounded-xl transition-all border-2 ${
                        isFocused 
                          ? 'bg-amber-50/90 border-amber-500 shadow-tactile-sm' 
                          : 'border-transparent hover:border-slate-300'
                      }`}
                    >
                      {showParaNums && (
                        <span className="inline-block mr-2 px-1.5 py-0.5 rounded text-[11px] font-mono font-black bg-slate-200 text-slate-700 select-none border border-slate-300">
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

        {/* Right Panel: Questions Review & AI Tutor */}
        <div 
          ref={questionPanelRef}
          className={`h-full overflow-y-auto p-6 md:p-10 bg-[#F4EFEA] space-y-6 ${
            mobileTab === 'passage' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Reading Habit Coaching Box */}
            {feedback && (
              <div className="bg-[#FAF8F5] p-5 rounded-xl border-2 border-slate-900 shadow-tactile-sm space-y-2">
                <div className="flex items-center gap-2 text-slate-900">
                  <Badge variant="stamp-amber" size="sm">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    AI 문해력 코칭 피드백
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  {feedback}
                </p>
              </div>
            )}

            {/* Questions List */}
            {displayedQuestions.length === 0 ? (
              <Card variant="paper" padding="lg" className="text-center py-16">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="editorial-serif text-lg font-black text-slate-900">틀린 문제가 없습니다! 완벽해요! 🎉</h4>
                <p className="text-xs text-slate-500 mt-1">이 지문의 모든 문제를 정답으로 맞혔습니다.</p>
              </Card>
            ) : (
              displayedQuestions.map(({ q, qIdx, uid, globalNum }: any) => {
                const userAns = answers[uid];
                const isCorrect = userAns === q.answer;
                const nums = ['①', '②', '③', '④', '⑤'];

                return (
                  <div key={qIdx} className="bg-white p-6 rounded-xl border-2 border-slate-900 shadow-tactile space-y-5">
                    
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-mono font-black shrink-0 text-white shadow-tactile-sm border-2 border-slate-900 ${
                          isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}>
                          {globalNum}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <Badge variant={isCorrect ? 'stamp-emerald' : 'stamp'} size="sm">
                              {isCorrect ? '정답' : '오답'}
                            </Badge>
                            <span className="text-xs font-mono font-bold text-slate-500">
                              {q.type}
                            </span>
                          </div>
                          <h3 className="editorial-serif text-base font-black text-slate-900 leading-snug">
                            <MarkdownRenderer content={q.text || q.question} inline />
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Options Review with 3D Keycap Style */}
                    <div className="space-y-2.5">
                      {q.options.map((opt: string, optIdx: number) => {
                        const isUserChoice = userAns === optIdx;
                        const isRealAnswer = q.answer === optIdx;

                        let optCls = 'border-slate-200 bg-slate-50/50 text-slate-500 opacity-60';
                        if (isRealAnswer) {
                          optCls = 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black opacity-100 shadow-tactile-sm';
                        } else if (isUserChoice && !isCorrect) {
                          optCls = 'border-rose-500 bg-rose-50 text-rose-950 font-bold opacity-100 line-through shadow-tactile-sm';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all ${optCls}`}
                          >
                            <span className="font-black text-sm shrink-0 mt-0.5 font-mono">
                              {nums[optIdx]}
                            </span>
                            <span className="text-xs sm:text-sm leading-relaxed flex-1">
                              <MarkdownRenderer content={opt} inline />
                            </span>
                            {isRealAnswer && (
                              <Badge variant="stamp-emerald" size="sm" className="shrink-0">
                                정답
                              </Badge>
                            )}
                            {isUserChoice && !isCorrect && (
                              <Badge variant="stamp" size="sm" className="shrink-0 text-rose-800 border-rose-500">
                                내 오답
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    {q.explanation && (
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border-2 border-slate-300 space-y-1.5">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-900" /> 해설 및 정답 근거
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          <MarkdownRenderer content={q.explanation} />
                        </p>
                      </div>
                    )}

                    {/* AI 1:1 FAQ Tutor Button */}
                    <div className="flex items-center justify-between pt-2 border-t-2 border-slate-100">
                      <Button
                        variant="tactile"
                        size="sm"
                        onClick={() => openFAQ(uid, globalNum)}
                        icon={<Bot className="w-4 h-4 text-amber-400" />}
                      >
                        AI 1:1 질문하기 (FAQ)
                      </Button>

                      {q.evidenceParagraph !== undefined && (
                        <button
                          onClick={() => scrollToPara(q.evidenceParagraph)}
                          className="text-xs font-black text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>지문 [{q.evidenceParagraph + 1}]단락 근거 확인</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
            )}

            {/* Bottom Complete CTA */}
            <div className="pt-4 pb-12 text-center">
              <Button
                variant="tactile"
                size="lg"
                onClick={() => navigate('/')}
                className="w-full"
              >
                대시보드로 돌아가기
              </Button>
            </div>

          </div>
        </div>

      </div>

      {/* AI FAQ Tutor Slide-over Modal */}
      {activeFAQ && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l-2 border-slate-900 animate-in slide-in-from-right duration-200">
            
            {/* Modal Header: Dark Ink with Amber Accent */}
            <div className="p-6 border-b-2 border-slate-900 flex items-center justify-between bg-[#0F172A] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center shadow-tactile-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="editorial-serif font-black text-white text-base leading-tight">
                    {activeFAQ.questionNum}번 문제 AI 1:1 해설 튜터
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">자주 묻는 질문으로 오답 원인 분석</p>
                </div>
              </div>
              <button
                onClick={() => setActiveFAQ(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: FAQ Accordions */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAF8F5]">
              {activeFAQ.faq.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-medium">
                  이 문제에 등록된 FAQ가 없습니다.
                </div>
              ) : (
                activeFAQ.faq.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border-2 border-slate-300 shadow-tactile-sm space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono font-black shrink-0 mt-0.5">
                        Q
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                        {item.question}
                      </h4>
                    </div>
                    <div className="flex items-start gap-2.5 pl-2 pt-2 border-t border-slate-200">
                      <span className="w-5 h-5 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center text-[10px] font-mono font-black shrink-0 mt-0.5">
                        A
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t-2 border-slate-900 bg-white text-center">
              <Button
                variant="tactile"
                size="md"
                className="w-full"
                onClick={() => setActiveFAQ(null)}
              >
                닫기
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ReviewTest;
