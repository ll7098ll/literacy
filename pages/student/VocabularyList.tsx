import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../utils/firestoreError';
import { BookA, Trash2, Eye, EyeOff, BookOpen, RotateCw, Search } from 'lucide-react';
import MarkdownRenderer from '../../src/components/MarkdownRenderer';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

const VocabularyList: React.FC = () => {
  const { user } = useAuth();
  const [vocabList, setVocabList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [flippedIds, setFlippedIds] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [memorizeMode, setMemorizeMode] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/vocabulary`),
      orderBy('savedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVocabList(list);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/vocabulary`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (!window.confirm('이 단어를 어휘장에서 삭제할까요?')) return;
    
    try {
      await deleteDoc(doc(db, `users/${user.uid}/vocabulary`, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/vocabulary/${id}`);
    }
  };

  const toggleFlip = (id: string) => {
    setFlippedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMemorizeMode = () => {
    const next = !memorizeMode;
    setMemorizeMode(next);
    const newFlips: Record<string, boolean> = {};
    vocabList.forEach(item => {
      newFlips[item.id] = false;
    });
    setFlippedIds(newFlips);
  };

  const filteredVocab = useMemo(() => {
    if (!searchQuery.trim()) return vocabList;
    const q = searchQuery.toLowerCase();
    return vocabList.filter(item => 
      (item.word && item.word.toLowerCase().includes(q)) ||
      (item.meaning && item.meaning.toLowerCase().includes(q))
    );
  }, [vocabList, searchQuery]);

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-bold">어휘 수첩을 불러오는 중...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Editorial Flashcard Notebook Header */}
      <Card variant="paper" padding="lg" className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-tactile-sm border-2 border-slate-900">
            <BookA className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="editorial-serif text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                나만의 독서 어휘 수첩
              </h2>
              <Badge variant="stamp" size="sm">{vocabList.length}단어 보관</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              지문을 정독하며 수집한 핵심 개념어와 한자어를 플래시카드로 복습하세요.
            </p>
          </div>
        </div>
        
        {/* Actions & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="단어 또는 뜻 검색..."
              className="pl-9 pr-3 py-2 rounded-xl text-xs border-2 border-slate-300 focus:border-slate-900 outline-none w-44 sm:w-56 font-bold bg-white shadow-inner transition-all"
            />
          </div>

          <Button
            variant={memorizeMode ? 'tactile-amber' : 'tactile'}
            size="sm"
            onClick={toggleMemorizeMode}
            icon={memorizeMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          >
            {memorizeMode ? '암기 테스트 ON' : '암기 모드'}
          </Button>
        </div>
      </Card>

      {/* Flashcards Grid */}
      {filteredVocab.length === 0 ? (
        <Card variant="paper" padding="lg" className="text-center py-20">
          <div className="w-16 h-16 rounded-xl bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center mx-auto mb-4 shadow-tactile-sm">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="editorial-serif text-lg font-black text-slate-900 mb-1">
            {searchQuery ? '검색된 단어가 없습니다' : '아직 보관된 단어가 없습니다'}
          </h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            {searchQuery 
              ? '다른 검색어로 다시 검색해 보세요.' 
              : '독해 지문 학습 중 모르는 단어를 클릭하여 어휘 수첩에 추가해 보세요.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVocab.map((item) => {
            const isFlipped = flippedIds[item.id] || false;

            return (
              <div
                key={item.id}
                onClick={() => toggleFlip(item.id)}
                className="group h-64 perspective-1000 cursor-pointer"
              >
                <div className={`w-full h-full relative transition-all duration-300 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}>
                  
                  {/* Front Side: Word & Context (Warm Paper Card with 3D Shadow) */}
                  <div className="absolute inset-0 backface-hidden bg-[#FAF8F5] rounded-xl border-2 border-slate-900 shadow-tactile p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="stamp" size="sm">어휘 카드</Badge>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-center my-auto space-y-1.5">
                      <h4 className="editorial-serif text-2xl font-black text-slate-900 tracking-tight">
                        {item.word}
                      </h4>
                      {item.hanja && (
                        <p className="text-xs font-mono font-bold text-slate-500">
                          {item.hanja}
                        </p>
                      )}
                    </div>

                    <div className="pt-2.5 border-t-2 border-slate-200 flex items-center justify-between text-xs text-slate-500 font-bold">
                      <span className="truncate max-w-[170px] text-slate-600">
                        {item.example ? `"${item.example}"` : '카드를 눌러 뜻 확인'}
                      </span>
                      <span className="flex items-center gap-1 text-slate-900 font-black">
                        <RotateCw className="w-3 h-3" /> 뒤집기
                      </span>
                    </div>
                  </div>

                  {/* Back Side: Meaning & Etymology (Dark Ink Card with Amber Accent) */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#0F172A] text-white rounded-xl border-2 border-slate-900 shadow-tactile p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 font-mono">
                        단어 뜻풀이
                      </span>
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <RotateCw className="w-3 h-3" /> 다시 뒤집기
                      </span>
                    </div>

                    <div className="my-auto space-y-2">
                      <div className="editorial-serif text-lg font-black tracking-tight text-white">
                        {item.word}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                        <MarkdownRenderer content={item.meaning} inline />
                      </div>
                    </div>

                    {item.savedAt && (
                      <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono font-bold">
                        수집일: {new Date(item.savedAt).toLocaleDateString('ko-KR')}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default VocabularyList;
