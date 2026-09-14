import React, { useState, useEffect, useMemo } from 'react';
import { Difficulty, GradeLevel, PreGeneratedTestSet } from '../types';
import { allTestSets } from '../data/tests';
import { 
  Save, Search, BookOpen, Layers, CheckCircle2, ChevronRight, X, Eye, 
  Sparkles, Filter, Check, Clock, Bookmark, Send, Trash2, Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Card from './ui/Card';

interface TestGeneratorProps {
  initialConfig?: { gradeLevel?: GradeLevel; difficulty?: Difficulty; subject?: string };
}

const TestGenerator: React.FC<TestGeneratorProps> = () => {
  const { user } = useAuth();
  
  // Assignment Info States
  const [assignmentTitle, setAssignmentTitle] = useState<string>('');
  const [assignedDate, setAssignedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  
  // Filter States
  const [gradeFilter, setGradeFilter] = useState<GradeLevel>(GradeLevel.ELEM_5);
  const [subjectFilter, setSubjectFilter] = useState<string>('전체');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('전체');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Preview State
  const [previewTest, setPreviewTest] = useState<PreGeneratedTestSet | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Set default title based on date
  useEffect(() => {
    const formattedDate = assignedDate.replace(/-/g, '. ');
    setAssignmentTitle(`${formattedDate} 문해력 스마트 과제`);
  }, [assignedDate]);

  // Quick template assignment handler
  const handleQuickSelect = (type: 'today' | 'humanities' | 'science') => {
    const elemSets = allTestSets.filter(ts => ts.grade === GradeLevel.ELEM_5 || ts.grade === GradeLevel.ELEM_6);
    
    let selectedIds: string[] = [];
    
    if (type === 'today') {
      const shuffled = [...elemSets].sort(() => 0.5 - Math.random());
      selectedIds = shuffled.slice(0, 3).map(ts => ts.id);
    } else if (type === 'humanities') {
      const filtered = elemSets.filter(ts => ts.subject === '역사' || ts.subject === '사회');
      const shuffled = filtered.sort(() => 0.5 - Math.random());
      selectedIds = shuffled.slice(0, 3).map(ts => ts.id);
    } else if (type === 'science') {
      const filtered = elemSets.filter(ts => ts.subject === '과학');
      const shuffled = filtered.sort(() => 0.5 - Math.random());
      selectedIds = shuffled.slice(0, 3).map(ts => ts.id);
    }
    
    if (selectedIds.length > 0) {
      setSelectedTests(selectedIds);
      const firstSet = allTestSets.find(t => t.id === selectedIds[0]);
      if (firstSet) {
        setGradeFilter(firstSet.grade);
      }
    } else {
      alert('조건에 부합하는 지문 세트가 부족합니다.');
    }
  };

  // Filter 300 test sets (Only showing ELEM_5 & ELEM_6)
  const filteredTestSets = useMemo(() => {
    return allTestSets.filter(ts => {
      if (ts.grade !== GradeLevel.ELEM_5 && ts.grade !== GradeLevel.ELEM_6) {
        return false;
      }
      
      if (ts.grade !== gradeFilter) return false;
      if (subjectFilter !== '전체' && ts.subject !== subjectFilter) return false;
      if (difficultyFilter !== '전체' && ts.difficulty !== difficultyFilter) return false;
      
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        return ts.title.toLowerCase().includes(term) || ts.subject.toLowerCase().includes(term);
      }
      
      return true;
    });
  }, [gradeFilter, subjectFilter, difficultyFilter, searchTerm]);

  // Distinct subjects
  const subjectsList = useMemo(() => {
    const subjects = new Set<string>();
    allTestSets.forEach(ts => {
      if (ts.grade === GradeLevel.ELEM_5 || ts.grade === GradeLevel.ELEM_6) {
        subjects.add(ts.subject);
      }
    });
    return ['전체', ...Array.from(subjects)];
  }, []);

  const handleToggleSelectTest = (id: string) => {
    setSelectedTests(prev => {
      if (prev.includes(id)) {
        return prev.filter(t => t !== id);
      } else {
        if (prev.length >= 5) {
          alert('한 과제 묶음에는 최대 5개 지문 세트까지만 추가할 수 있습니다.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleAssignBundle = async () => {
    if (!user) return;
    if (selectedTests.length === 0) {
      alert('배정할 지문 세트를 최소 1개 이상 선택해 주세요.');
      return;
    }
    if (!assignmentTitle.trim()) {
      alert('과제 제목을 입력해 주세요.');
      return;
    }
    
    setIsSaving(true);
    try {
      const assignmentId = `assign_${Date.now()}`;
      await setDoc(doc(db, 'assignments', assignmentId), {
        id: assignmentId,
        title: assignmentTitle,
        assignedDate: assignedDate,
        testSetIds: selectedTests,
        teacherUid: user.uid,
        createdAt: new Date().toISOString()
      });
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setSelectedTests([]);
      }, 2500);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'assignments');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1-Click Quick Template Editorial Banner */}
      <Card variant="paper" padding="lg" className="border-2 border-slate-900 shadow-tactile space-y-4">
        <div className="flex items-center gap-2.5">
          <Badge variant="stamp-amber" size="sm">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            1-Click 퀵 추천 번들
          </Badge>
          <span className="text-xs font-mono font-bold text-slate-500">교과 필수 지문을 1초 만에 묶어서 출제하세요</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleQuickSelect('today')}
            className="p-4 rounded-xl bg-white border-2 border-slate-900 hover:bg-slate-50 shadow-tactile-sm transition-all text-left flex items-start gap-3.5 group cursor-pointer hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-black shrink-0 shadow-sm text-lg">
              📚
            </div>
            <div>
              <span className="editorial-serif font-black text-sm text-slate-900 block group-hover:text-blue-900 transition-colors">
                오늘의 균형 독해 (3편)
              </span>
              <span className="text-[11px] text-slate-500 font-mono font-bold">인문·사회·과학 교과 골고루 배정</span>
            </div>
          </button>

          <button
            onClick={() => handleQuickSelect('humanities')}
            className="p-4 rounded-xl bg-white border-2 border-slate-900 hover:bg-slate-50 shadow-tactile-sm transition-all text-left flex items-start gap-3.5 group cursor-pointer hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-black shrink-0 shadow-sm text-lg">
              🏛️
            </div>
            <div>
              <span className="editorial-serif font-black text-sm text-slate-900 block group-hover:text-blue-900 transition-colors">
                역사·사회 탐구 (3편)
              </span>
              <span className="text-[11px] text-slate-500 font-mono font-bold">배경지식과 비판적 사고 중심</span>
            </div>
          </button>

          <button
            onClick={() => handleQuickSelect('science')}
            className="p-4 rounded-xl bg-white border-2 border-slate-900 hover:bg-slate-50 shadow-tactile-sm transition-all text-left flex items-start gap-3.5 group cursor-pointer hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center font-black shrink-0 shadow-sm text-lg">
              🔬
            </div>
            <div>
              <span className="editorial-serif font-black text-sm text-slate-900 block group-hover:text-blue-900 transition-colors">
                과학·원리 탐구 (3편)
              </span>
              <span className="text-[11px] text-slate-500 font-mono font-bold">설명문과 논리적 인과 분석</span>
            </div>
          </button>
        </div>
      </Card>

      {/* Main 2-Column Split: Library vs Assignment Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: 300 Passage Library & Filters (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Filter Bar */}
          <Card variant="paper" padding="md" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-900" />
                <h4 className="editorial-serif font-black text-sm text-slate-900">지문 필터링 (총 {filteredTestSets.length}개 검색)</h4>
              </div>

              {/* Grade Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border-2 border-slate-300">
                <button
                  onClick={() => setGradeFilter(GradeLevel.ELEM_5)}
                  className={`px-3 py-1 rounded-md text-xs font-black transition-all cursor-pointer ${
                    gradeFilter === GradeLevel.ELEM_5 ? 'bg-slate-900 text-white shadow-tactile-sm' : 'text-slate-600'
                  }`}
                >
                  초등 5학년
                </button>
                <button
                  onClick={() => setGradeFilter(GradeLevel.ELEM_6)}
                  className={`px-3 py-1 rounded-md text-xs font-black transition-all cursor-pointer ${
                    gradeFilter === GradeLevel.ELEM_6 ? 'bg-slate-900 text-white shadow-tactile-sm' : 'text-slate-600'
                  }`}
                >
                  초등 6학년
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Subject Select */}
              <div>
                <label className="text-[11px] font-mono font-bold text-slate-500 block mb-1">교과 영역</label>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs font-bold border-2 border-slate-300 bg-white focus:border-slate-900 outline-none"
                >
                  {subjectsList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Select */}
              <div>
                <label className="text-[11px] font-mono font-bold text-slate-500 block mb-1">난이도</label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs font-bold border-2 border-slate-300 bg-white focus:border-slate-900 outline-none"
                >
                  <option value="전체">전체 난이도</option>
                  <option value={Difficulty.LOW}>쉬움 (기초)</option>
                  <option value={Difficulty.MEDIUM}>보통 (표준)</option>
                  <option value={Difficulty.HIGH}>어려움 (심화)</option>
                </select>
              </div>

              {/* Search Bar */}
              <div>
                <label className="text-[11px] font-mono font-bold text-slate-500 block mb-1">지문 검색</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="제목, 주제 검색..."
                    className="w-full pl-8 pr-3 py-2 rounded-lg text-xs font-bold border-2 border-slate-300 bg-white focus:border-slate-900 outline-none shadow-inner"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Test Sets Grid */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredTestSets.map((ts) => {
              const isSelected = selectedTests.includes(ts.id);
              return (
                <div
                  key={ts.id}
                  onClick={() => handleToggleSelectTest(ts.id)}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4 cursor-pointer select-none ${
                    isSelected
                      ? 'border-slate-900 bg-amber-50 shadow-tactile-sm ring-2 ring-amber-500/30'
                      : 'border-slate-300 bg-white hover:border-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-400 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" strokeWidth={3} />}
                    </div>

                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-2">
                        <Badge variant="stamp" size="sm">{ts.subject}</Badge>
                        <Badge variant="outline" size="sm">{ts.difficulty}</Badge>
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          총 {ts.passages?.reduce((acc, p) => acc + p.questions.length, 0) || 4}문항
                        </span>
                      </div>
                      <h4 className="editorial-serif text-sm font-black text-slate-900 truncate">
                        {ts.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTest(ts);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-slate-300 hover:border-slate-900 bg-[#FAF8F5] shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>미리보기</span>
                  </button>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right: Selected Bundle & Assignment Action (1 col sticky) */}
        <div className="lg:sticky lg:top-24 space-y-5">
          <Card variant="paper" padding="lg" className="space-y-5 border-2 border-slate-900 shadow-tactile">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-900" />
                <h4 className="editorial-serif font-black text-base text-slate-900">과제 출제 바구니</h4>
              </div>
              <Badge variant="stamp-amber" size="sm">
                {selectedTests.length} / 5개 선택
              </Badge>
            </div>

            {/* Assignment Settings */}
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1 font-mono">
                  과제 제목
                </label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="예: 3월 2주차 문해력 과제"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-black border-2 border-slate-300 focus:border-slate-900 outline-none bg-white shadow-inner"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1 font-mono">
                  배정 일자
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={assignedDate}
                    onChange={(e) => setAssignedDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-black border-2 border-slate-300 focus:border-slate-900 outline-none bg-white shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Selected Tests List */}
            <div className="space-y-2 pt-2 border-t-2 border-slate-200">
              <span className="text-[11px] font-mono font-bold text-slate-500 block">
                배정 대상 지문 목록 ({selectedTests.length})
              </span>

              {selectedTests.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-medium bg-white rounded-xl border-2 border-dashed border-slate-300">
                  왼쪽 목록 또는 상단 퀵 번들에서<br />지문을 선택해 주세요.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedTests.map((tId) => {
                    const testSet = allTestSets.find(ts => ts.id === tId);
                    return (
                      <div
                        key={tId}
                        className="p-2.5 rounded-lg bg-white border-2 border-slate-300 flex items-center justify-between text-xs font-bold"
                      >
                        <span className="truncate max-w-[180px] text-slate-800">
                          {testSet?.title || tId}
                        </span>
                        <button
                          onClick={() => handleToggleSelectTest(tId)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Success Alert */}
            {saveSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border-2 border-emerald-500 text-emerald-950 text-xs font-black flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>우리 반 학생들에게 과제가 성공적으로 배정되었습니다!</span>
              </div>
            )}

            {/* Submit CTA */}
            <Button
              onClick={handleAssignBundle}
              variant="tactile-emerald"
              size="lg"
              className="w-full"
              disabled={selectedTests.length === 0 || isSaving}
              loading={isSaving}
              icon={<Send className="w-4 h-4" />}
            >
              선택한 지문 과제로 배정하기
            </Button>
          </Card>
        </div>

      </div>

      {/* Preview Modal */}
      {previewTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FAF8F5] rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-tactile border-2 border-slate-900 animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b-2 border-slate-900 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <Badge variant="stamp" size="sm">{previewTest.subject}</Badge>
                <h3 className="editorial-serif font-black text-base sm:text-lg text-slate-900">{previewTest.title}</h3>
              </div>
              <button
                onClick={() => setPreviewTest(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {previewTest.passages?.map((p, pIdx) => (
                <div key={pIdx} className="space-y-4">
                  <div className="p-5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 space-y-3">
                    <h4 className="editorial-serif font-black text-slate-900 border-b-2 border-slate-100 pb-2">{p.title}</h4>
                    <div className="text-xs sm:text-sm leading-relaxed editorial-para text-slate-800">
                      {p.content}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-mono font-black text-slate-700 block">포함된 문항 ({p.questions.length}개)</span>
                    {p.questions.map((q, qIdx) => (
                      <div key={qIdx} className="p-3.5 rounded-lg bg-white border-2 border-slate-200 text-xs space-y-2">
                        <div className="font-black text-slate-900">{qIdx + 1}. {q.text || (q as any).question}</div>
                        <div className="space-y-1 pl-3 text-slate-600 font-medium">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx}>
                              {['①','②','③','④','⑤'][oIdx]} {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t-2 border-slate-900 flex justify-end gap-2 bg-white">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewTest(null)}
              >
                닫기
              </Button>
              <Button
                variant="tactile"
                size="sm"
                onClick={() => {
                  handleToggleSelectTest(previewTest.id);
                  setPreviewTest(null);
                }}
              >
                {selectedTests.includes(previewTest.id) ? '바구니에서 제거' : '바구니에 담기'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TestGenerator;
