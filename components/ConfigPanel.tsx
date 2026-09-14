
import React, { useEffect, useState } from 'react';
import { Difficulty, GenerationConfig, GradeLevel, QuestionType, Subject, TargetCorrectRate, TextType, VocabularyLevel, QuestionBlueprint } from '../types';
import { Sparkles, Layers, GraduationCap, Clock, FileText, Check, ChevronRight, Hash, AlignLeft, RefreshCw, CheckSquare, BrainCircuit, Type, Target, Plus, Trash2, ArrowRight, ArrowLeft, BookOpen, PenTool, AlertCircle } from 'lucide-react';
import Spinner from './Spinner';

interface ConfigPanelProps {
  config: GenerationConfig;
  setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>;
  onGenerate: () => void;
  isGenerating: boolean;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, setConfig, onGenerate, isGenerating }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [estimatedTime, setEstimatedTime] = useState<number>(20);
  const [activeBlueprintTab, setActiveBlueprintTab] = useState<string>("");
  const [activeTextTypeTab, setActiveTextTypeTab] = useState<string>("");

  useEffect(() => {
    // 1. 학년별 기본 읽기 속도 (분당 글자 수)
    let readingSpeed = 400; // 중등 기본
    if (config.gradeLevel.includes('초등')) readingSpeed = 300;
    else if (config.gradeLevel.includes('고등')) readingSpeed = 500;

    // 2. 난이도에 따른 읽기 속도 보정
    if (config.difficulty === Difficulty.HIGH || config.difficulty === Difficulty.CSAT) readingSpeed *= 0.8; // 어려운 글은 천천히
    else if (config.difficulty === Difficulty.LOW) readingSpeed *= 1.2; // 쉬운 글은 빠르게

    // 3. 지문당 읽는 시간
    const readingTime = (config.textLengthCount / readingSpeed); 

    // 4. 난이도별 문항당 풀이 시간 (분)
    let solvingTimePerQuestion = 1.5; // 중등/중 난이도 기본
    if (config.difficulty === Difficulty.HIGH || config.difficulty === Difficulty.CSAT) solvingTimePerQuestion = 2.0;
    else if (config.difficulty === Difficulty.LOW) solvingTimePerQuestion = 1.0;

    // 5. 총 문항 풀이 시간
    let totalQuestions = 0;
    if (config.subjects.length > 0) {
      config.subjects.forEach(subj => {
        totalQuestions += (config.subjectBlueprints[subj] || []).length;
      });
    } else {
      totalQuestions = config.questionsPerPassage * config.passageCount;
    }
    const totalSolvingTime = totalQuestions * solvingTimePerQuestion;
    
    // 6. 지문 간 전환 및 검토 여유 시간 (지문당 1분)
    const totalBufferTime = config.passageCount * 1;

    // 7. 총 예상 시간 계산
    const totalReadingTime = readingTime * config.passageCount;
    const totalEstimatedTime = totalReadingTime + totalSolvingTime + totalBufferTime;

    // 최소 1분 보장 및 반올림
    setEstimatedTime(Math.max(1, Math.round(totalEstimatedTime)));
  }, [config.textLengthCount, config.passageCount, config.questionsPerPassage, config.gradeLevel, config.difficulty, config.subjects, config.subjectBlueprints]);

  // 학년 변경 시 주제 초기화
  useEffect(() => {
    const groups = getSubjectGroups(config.gradeLevel);
    const availableSubjects = Object.values(groups).flat();
    const hasInvalidSubjects = config.subjects.some(s => !availableSubjects.includes(s));
    
    if ((hasInvalidSubjects || config.subjects.length === 0) && !isGenerating) {
        // Reset subjects
        setConfig(prev => ({ ...prev, subjects: [] }));
    }
    
    // Set first text type as active tab
    const textTypes = Object.keys(groups);
    if (textTypes.length > 0) {
      setActiveTextTypeTab(textTypes[0]);
    }
  }, [config.gradeLevel]);

  // Step 3 진입 시 또는 주제 변경 시 Blueprint 초기화 및 탭 설정
  useEffect(() => {
    const selectedSubjects = config.subjects;
    if (selectedSubjects.length > 0 && !activeBlueprintTab) {
      setActiveBlueprintTab(selectedSubjects[0]);
    } else if (selectedSubjects.length > 0 && !selectedSubjects.includes(activeBlueprintTab as Subject)) {
      setActiveBlueprintTab(selectedSubjects[0]);
    }
    
    // Sync textTypes based on selected subjects
    const groups = getSubjectGroups(config.gradeLevel);
    const newTextTypes = new Set<TextType>();
    selectedSubjects.forEach(subj => {
      for (const [textType, subjects] of Object.entries(groups)) {
        if (subjects.includes(subj)) {
          newTextTypes.add(textType as TextType);
          break;
        }
      }
    });
    
    setConfig(prev => {
      const newBlueprints = { ...prev.subjectBlueprints };
      let hasChanges = false;
      
      selectedSubjects.forEach(subj => {
        if (!newBlueprints[subj]) {
           // Default blueprint for new subject
           newBlueprints[subj] = [
             { type: QuestionType.DETAIL, difficulty: Difficulty.LOW },
             { type: QuestionType.INFERENCE, difficulty: Difficulty.HIGH },
             { type: QuestionType.CRITIQUE, difficulty: Difficulty.CSAT },
             { type: QuestionType.VOCABULARY, difficulty: Difficulty.MEDIUM }
           ];
           hasChanges = true;
        }
      });
      
      const textTypesArray = Array.from(newTextTypes);
      const textTypesChanged = JSON.stringify(prev.textTypes) !== JSON.stringify(textTypesArray);
      
      if (hasChanges || textTypesChanged) {
        return { ...prev, subjectBlueprints: newBlueprints, textTypes: textTypesArray };
      }
      return prev;
    });
  }, [config.subjects, config.gradeLevel]);


  const handleInputChange = (field: keyof GenerationConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handlePassageCountChange = (val: number) => {
    const newCount = Math.max(1, Math.min(10, val));
    setConfig(prev => ({
      ...prev,
      passageCount: newCount,
      // If we reduced the count, trim the selected subjects to match
      subjects: prev.subjects.slice(0, newCount)
    }));
  };

  const handleSubjectToggle = (subj: Subject) => {
    setConfig(prev => {
      const isSelected = prev.subjects.includes(subj);
      if (isSelected) {
        return { ...prev, subjects: prev.subjects.filter(s => s !== subj) };
      } else {
        if (prev.subjects.length >= prev.passageCount) return prev; // Limit reached
        return { ...prev, subjects: [...prev.subjects, subj] };
      }
    });
  };

  // --- Blueprint Handlers (Per Subject) ---
  const addBlueprintItem = (subject: string) => {
    const currentBlueprint = config.subjectBlueprints[subject] || [];
    if (currentBlueprint.length >= 10) return;
    
    const newItem: QuestionBlueprint = { type: QuestionType.DETAIL, difficulty: Difficulty.MEDIUM };
    const newBlueprint = [...currentBlueprint, newItem];
    
    setConfig(prev => ({
      ...prev,
      subjectBlueprints: {
        ...prev.subjectBlueprints,
        [subject]: newBlueprint
      }
    }));
  };

  const removeBlueprintItem = (subject: string, index: number) => {
    const currentBlueprint = config.subjectBlueprints[subject] || [];
    if (currentBlueprint.length <= 1) return;
    
    const newBlueprint = currentBlueprint.filter((_, i) => i !== index);
    
    setConfig(prev => ({
      ...prev,
      subjectBlueprints: {
        ...prev.subjectBlueprints,
        [subject]: newBlueprint
      }
    }));
  };

  const updateBlueprintItem = (subject: string, index: number, field: keyof QuestionBlueprint, value: any) => {
    const currentBlueprint = config.subjectBlueprints[subject] || [];
    const newBlueprint = [...currentBlueprint];
    newBlueprint[index] = { ...newBlueprint[index], [field]: value };
    
    setConfig(prev => ({
      ...prev,
      subjectBlueprints: {
        ...prev.subjectBlueprints,
        [subject]: newBlueprint
      }
    }));
  };

  // Calculate average questions per passage across all selected subjects
  useEffect(() => {
    if (config.subjects.length === 0) return;
    let totalQuestions = 0;
    config.subjects.forEach(subj => {
      totalQuestions += (config.subjectBlueprints[subj] || []).length;
    });
    const avgQuestions = Math.round(totalQuestions / config.subjects.length);
    
    if (config.questionsPerPassage !== avgQuestions) {
      setConfig(prev => ({ ...prev, questionsPerPassage: avgQuestions }));
    }
  }, [config.subjectBlueprints, config.subjects]);

  const getSubjectGroups = (grade: GradeLevel): Record<string, Subject[]> => {
    if (grade === GradeLevel.ELEM_1 || grade === GradeLevel.ELEM_2) {
      return {
        [TextType.ELEM_STORY]: [Subject.ELEM_12_KOR_FAIRY_KR, Subject.ELEM_12_KOR_FAIRY_WORLD],
        [TextType.ELEM_DIARY]: [Subject.ELEM_12_KOR_DIARY, Subject.ELEM_12_KOR_LETTER],
        [TextType.ELEM_INFO]: [Subject.ELEM_12_LIFE_SCHOOL, Subject.ELEM_12_LIFE_FRIEND, Subject.ELEM_12_LIFE_FAMILY, Subject.ELEM_12_LIFE_NEIGHBOR, Subject.ELEM_12_LIFE_SAFETY, Subject.ELEM_12_JOB_DOCTOR, Subject.ELEM_12_JOB_FIRE, Subject.ELEM_12_SCI_ANIMAL, Subject.ELEM_12_SCI_PLANT, Subject.ELEM_12_MATH_SHAPE, Subject.ELEM_12_MATH_CLOCK],
        [TextType.ELEM_POEM]: [Subject.ELEM_12_KOR_POEM, Subject.ELEM_12_KOR_RHYME],
        [TextType.ELEM_OPINION]: [Subject.ELEM_12_ETHICS_MANNERS, Subject.ELEM_12_ETHICS_PUBLIC, Subject.ELEM_12_ART_TRADITION, Subject.ELEM_12_ART_MUSIC]
      };
    } else if (grade === GradeLevel.ELEM_3 || grade === GradeLevel.ELEM_4) {
      return {
        [TextType.ELEM_STORY]: [Subject.ELEM_34_KOR_BOOK, Subject.ELEM_34_KOR_IDIOOM],
        [TextType.ELEM_INFO]: [Subject.ELEM_34_SOC_VILLAGE, Subject.ELEM_34_SOC_MAP, Subject.ELEM_34_SOC_TRANSPORT, Subject.ELEM_34_SOC_CULTURE, Subject.ELEM_34_SOC_LOCAL, Subject.ELEM_34_SOC_FAMILY_TYPE, Subject.ELEM_34_SCI_MATTER, Subject.ELEM_34_SCI_MAGNET, Subject.ELEM_34_SCI_ANIMAL_CYCLE, Subject.ELEM_34_SCI_PLANT_CYCLE, Subject.ELEM_34_SCI_GEOLOGY, Subject.ELEM_34_SCI_EARTH_MOON, Subject.ELEM_34_SCI_MIXTURE, Subject.ELEM_34_SCI_WATER, Subject.ELEM_34_SCI_VOLCANO, Subject.ELEM_34_KOR_DICT, Subject.ELEM_34_ART_PAINTING, Subject.ELEM_34_MUSIC_GUGAK],
        [TextType.ELEM_POEM]: [Subject.ELEM_34_KOR_FEELING],
        [TextType.ELEM_OPINION]: [Subject.ELEM_34_KOR_OPINION, Subject.ELEM_34_KOR_INTRO, Subject.ELEM_34_SOC_PROBLEM, Subject.ELEM_34_ETHICS_FRIEND, Subject.ELEM_34_ETHICS_INTERNET, Subject.ELEM_34_ETHICS_LIFE]
      };
    } else if (grade === GradeLevel.ELEM_5 || grade === GradeLevel.ELEM_6) {
      return {
        [TextType.ELEM_STORY]: [Subject.ELEM_56_KOR_LIT_CONFLICT],
        [TextType.ELEM_INFO]: [Subject.ELEM_56_SOC_HISTORY_GORYEO, Subject.ELEM_56_SOC_HISTORY_JOSEON, Subject.ELEM_56_SOC_HISTORY_WAR, Subject.ELEM_56_SOC_HISTORY_MODERN, Subject.ELEM_56_SOC_HISTORY_DEMO, Subject.ELEM_56_SOC_LAW, Subject.ELEM_56_SOC_ECONOMY, Subject.ELEM_56_SOC_GLOBAL, Subject.ELEM_56_SOC_ENV, Subject.ELEM_56_SOC_MAP_WORLD, Subject.ELEM_56_SCI_TEMP, Subject.ELEM_56_SCI_BODY, Subject.ELEM_56_SCI_ECO, Subject.ELEM_56_SCI_WEATHER, Subject.ELEM_56_SCI_ACID, Subject.ELEM_56_SCI_LENS, Subject.ELEM_56_SCI_SPACE, Subject.ELEM_56_SCI_ELECTRIC, Subject.ELEM_56_SCI_ENERGY, Subject.ELEM_56_KOR_NEWS, Subject.ELEM_56_PRACTICAL_COOK, Subject.ELEM_56_PRACTICAL_SW, Subject.ELEM_56_PRACTICAL_JOB],
        [TextType.ELEM_PLAY]: [Subject.ELEM_56_KOR_PLAY],
        [TextType.ELEM_OPINION]: [Subject.ELEM_56_KOR_ARGUE, Subject.ELEM_56_KOR_AD]
      };
    } else if (grade === GradeLevel.MIDDLE_1 || grade === GradeLevel.MIDDLE_2 || grade === GradeLevel.MIDDLE_3) {
      return {
        [TextType.MID_NOVEL]: [Subject.MID_LIT_MODERN_NOVEL_GROWTH, Subject.MID_LIT_MODERN_NOVEL_SOC, Subject.MID_LIT_CLASSIC_NOVEL_HERO, Subject.MID_LIT_CLASSIC_NOVEL_SATIRE, Subject.MID_LIT_MODERN_POEM_SENSE, Subject.MID_LIT_MODERN_POEM_SYMBOL, Subject.MID_LIT_CLASSIC_POEM_SIJO, Subject.MID_LIT_ESSAY_LIFE, Subject.MID_LIT_ESSAY_CRITIC, Subject.MID_LIT_SCRIPT],
        [TextType.MID_EXPOSITORY]: [Subject.MID_GRAMMAR_PHONOLOGY, Subject.MID_GRAMMAR_WORD, Subject.MID_GRAMMAR_SENTENCE, Subject.MID_NONLIT_EXPOS_STRUC, Subject.MID_SOC_LAW_CONST, Subject.MID_SOC_LAW_CIVIL, Subject.MID_SOC_ECON_MARKET, Subject.MID_SOC_ECON_GDP, Subject.MID_SOC_POLITICS_ELECT, Subject.MID_SOC_GEO_CLIMATE, Subject.MID_SOC_GEO_POP, Subject.MID_HIST_KOR_ANCIENT, Subject.MID_HIST_KOR_MODERN, Subject.MID_HIST_WORLD_CIVIL, Subject.MID_HIST_WORLD_REVOL, Subject.MID_SCI_PHY_FORCE, Subject.MID_SCI_PHY_LIGHT, Subject.MID_SCI_PHY_ELEC, Subject.MID_SCI_CHEM_GAS, Subject.MID_SCI_CHEM_ATOM, Subject.MID_SCI_CHEM_REACTION, Subject.MID_SCI_BIO_CELL, Subject.MID_SCI_BIO_PLANT, Subject.MID_SCI_BIO_GENE, Subject.MID_SCI_EARTH_STAR, Subject.MID_SCI_EARTH_ATMOS, Subject.MID_TECH_AI, Subject.MID_TECH_DATA, Subject.MID_ART_WESTERN, Subject.MID_MUSIC_HISTORY],
        [TextType.MID_ARGUMENTATIVE]: [Subject.MID_NONLIT_ARG_STRUC]
      };
    } else {
      return {
        [TextType.HIGH_HUMANITIES]: [Subject.HIGH_HUM_EPISTEMOLOGY, Subject.HIGH_HUM_LOGIC_PROP, Subject.HIGH_HUM_LOGIC_INDUCT, Subject.HIGH_HUM_ETHICS_META, Subject.HIGH_HUM_ETHICS_EAST, Subject.HIGH_HUM_HISTORY_VIEW, Subject.HIGH_HUM_LINGUISTICS, Subject.HIGH_HUM_PSYCH_COGN, Subject.HIGH_HUM_PSYCH_BEHAV],
        [TextType.HIGH_SOCIAL]: [Subject.HIGH_SOC_LAW_ADMIN, Subject.HIGH_SOC_LAW_CRIMINAL, Subject.HIGH_SOC_LAW_CIVIL_CONT, Subject.HIGH_SOC_ECON_MICRO, Subject.HIGH_SOC_ECON_GAME, Subject.HIGH_SOC_ECON_MACRO, Subject.HIGH_SOC_ECON_TRADE, Subject.HIGH_SOC_POLITICS_INT, Subject.HIGH_SOC_POLITICS_DOM, Subject.HIGH_SOC_SOC_FUNC, Subject.HIGH_SOC_MEDIA],
        [TextType.HIGH_SCIENCE]: [Subject.HIGH_SCI_PHY_NEWTON, Subject.HIGH_SCI_PHY_RELATIVITY, Subject.HIGH_SCI_PHY_FLUID, Subject.HIGH_SCI_PHY_THERMO, Subject.HIGH_SCI_PHY_QUANTUM, Subject.HIGH_SCI_CHEM_ORBITAL, Subject.HIGH_SCI_CHEM_BOND, Subject.HIGH_SCI_CHEM_REACTION, Subject.HIGH_SCI_CHEM_ELECTRO, Subject.HIGH_SCI_BIO_DNA, Subject.HIGH_SCI_BIO_TECH, Subject.HIGH_SCI_BIO_IMMUNE, Subject.HIGH_SCI_BIO_NERVE, Subject.HIGH_SCI_EARTH_PLATE, Subject.HIGH_SCI_EARTH_ATMOS, Subject.HIGH_SCI_EARTH_STAR, Subject.HIGH_SCI_EARTH_COSMOS],
        [TextType.HIGH_TECH]: [Subject.HIGH_TECH_AI_DEEP, Subject.HIGH_TECH_BLOCKCHAIN, Subject.HIGH_TECH_NETWORK, Subject.HIGH_TECH_DISPLAY, Subject.HIGH_TECH_SEMI],
        [TextType.HIGH_ART]: [Subject.HIGH_ART_AESTHETICS, Subject.HIGH_ART_MODERN, Subject.HIGH_ART_ARCHI, Subject.HIGH_ART_MUSIC_THEORY],
        [TextType.HIGH_LIT_CLASSIC]: [Subject.HIGH_LIT_CLASSIC_POEM, Subject.HIGH_LIT_CLASSIC_NOVEL],
        [TextType.HIGH_LIT_MODERN]: [Subject.HIGH_LIT_MODERN_POEM, Subject.HIGH_LIT_MODERN_NOVEL],
        [TextType.HIGH_CONVERGENCE]: [Subject.HIGH_CONV_SCI_PHIL, Subject.HIGH_CONV_TECH_ART, Subject.HIGH_CONV_BIO_ETHICS, Subject.HIGH_CONV_DATA_SOC]
      };
    }
  };

  const currentSubjectGroups = getSubjectGroups(config.gradeLevel);
  const selectedSubjects = config.subjects;

  // Helper to get short name of subject for tab
  const getSubjectShortName = (subj: string) => {
      // Remove bracket parts like [인문], [사회] etc.
      const parts = subj.split(':');
      if (parts.length > 1) {
          return parts[1].trim().split(' (')[0];
      }
      return subj;
  };

  // Stepper Logic
  const steps = [
    { id: 1, label: "기본 정보", desc: "Basic Info", icon: GraduationCap },
    { id: 2, label: "지문 구성", desc: "Configuration", icon: Layers },
    { id: 3, label: "문항 설계", desc: "Blueprint", icon: BrainCircuit },
  ];

  const goNext = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const goPrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Check valid for step 2
  const isStep2Valid = config.subjects.length === config.passageCount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print pb-20">
      
      {/* MAIN COLUMN (8 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-8">
        
        {/* Stepper Header */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex items-center justify-between">
          {steps.map((step, index) => {
             const isActive = currentStep === step.id;
             const isCompleted = currentStep > step.id;
             const Icon = step.icon;
             return (
               <div key={step.id} className="flex items-center flex-1 last:flex-none">
                 <div className={`flex items-center gap-3 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                       isActive ? 'bg-brand-50 border-brand-500 text-brand-600' : 
                       isCompleted ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-300'
                    }`}>
                       {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="hidden md:block">
                       <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-brand-600' : 'text-slate-400'}`}>Step {step.id}</p>
                       <p className={`font-bold text-sm ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{step.label}</p>
                    </div>
                 </div>
                 {index < steps.length - 1 && (
                    <div className="flex-grow mx-4 h-0.5 bg-slate-100 relative hidden md:block">
                      <div className={`absolute left-0 top-0 h-full bg-brand-500 transition-all duration-500`} style={{ width: isCompleted ? '100%' : '0%' }}></div>
                    </div>
                 )}
               </div>
             )
          })}
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-white/60 ring-1 ring-slate-100 relative min-h-[500px]">
          
          {/* STEP 1: BASIC INFO */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-fade-in-up">
               <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-6 bg-slate-900 rounded-full"></span>
                    기본 정보 설정
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide ml-1">시험지 제목</label>
                      <input
                        type="text"
                        value={config.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full text-lg font-bold bg-slate-50 border-0 ring-1 ring-slate-200 rounded-xl py-4 px-5 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-300"
                        placeholder="예: 2026학년도 수능 대비 모의평가"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide ml-1">대상 학년</label>
                        <div className="relative">
                          <select 
                            value={config.gradeLevel}
                            onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                            className="w-full appearance-none bg-white ring-1 ring-slate-200 text-slate-700 font-bold rounded-xl p-4 pr-10 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer"
                          >
                            {Object.values(GradeLevel).map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                      
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide ml-1">전체 난이도 (Baseline)</label>
                         <div className="grid grid-cols-4 bg-slate-100 p-1.5 rounded-xl gap-1">
                           {Object.values(Difficulty).map(d => {
                              const label = d.split(' ')[0];
                              const isActive = config.difficulty === d;
                              return (
                                <button
                                  key={d}
                                  onClick={() => handleInputChange('difficulty', d)}
                                  className={`
                                    py-2.5 text-xs font-bold rounded-lg transition-all shadow-sm
                                    ${isActive 
                                      ? 'bg-white text-brand-600 ring-1 ring-black/5 shadow-sm' 
                                      : 'bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 shadow-none'}
                                  `}
                                >
                                  {label}
                                </button>
                              )
                           })}
                         </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* STEP 2: PASSAGE CONFIG */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-fade-in-up">
              <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                    지문 구성 및 영역 선택
                  </h3>

                  {/* 1. Passage Count Control */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between mb-8">
                     <div>
                        <label className="text-sm font-bold text-slate-700 block mb-1">총 지문 개수</label>
                        <p className="text-xs text-slate-400">생성할 지문의 수를 먼저 결정하세요.</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <button onClick={() => handlePassageCountChange(config.passageCount - 1)} className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 shadow-sm active:scale-95 transition-all text-xl font-bold text-slate-500">-</button>
                        <span className="text-4xl font-black text-slate-900 min-w-[3ch] text-center">{config.passageCount}</span>
                        <button onClick={() => handlePassageCountChange(config.passageCount + 1)} className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 shadow-sm active:scale-95 transition-all text-xl font-bold text-slate-500">+</button>
                     </div>
                  </div>
                  
                  {/* 2. Subject Selection */}
                  <div>
                     <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                           <label className="text-sm font-bold text-slate-700">평가 영역 선택</label>
                           <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${config.subjects.length === config.passageCount ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'}`}>
                              {config.subjects.length} / {config.passageCount} 선택됨
                           </span>
                        </div>
                        <button 
                           onClick={() => setConfig(prev => ({ ...prev, subjects: [] }))}
                           className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                           <RefreshCw className="w-3.5 h-3.5" />
                           초기화
                        </button>
                     </div>

                     {config.subjects.length < config.passageCount && (
                       <div className="mb-4 flex items-center gap-2 text-sm text-brand-600 font-bold bg-brand-50 p-3 rounded-xl border border-brand-100 animate-pulse">
                          <AlertCircle className="w-4 h-4" />
                          <span>지문 개수에 맞춰 {config.passageCount - config.subjects.length}개의 영역을 더 선택해주세요.</span>
                       </div>
                     )}

                     <div className="flex flex-col md:flex-row gap-4 mb-8">
                        {/* Left Pane: Text Types */}
                        <div className="w-full md:w-1/3 flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                           {Object.entries(currentSubjectGroups).map(([groupName, groupSubjects]) => {
                              const selectedCount = groupSubjects.filter(s => config.subjects.includes(s)).length;
                              const isActive = activeTextTypeTab === groupName;
                              return (
                                <button
                                  key={groupName}
                                  onClick={() => setActiveTextTypeTab(groupName)}
                                  className={`
                                    text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between
                                    ${isActive 
                                      ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500 shadow-sm' 
                                      : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:bg-slate-50'}
                                  `}
                                >
                                  <span className="text-sm font-bold">{groupName.split(': ')[1] || groupName}</span>
                                  {selectedCount > 0 && (
                                    <span className="text-[10px] bg-brand-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                                      {selectedCount}
                                    </span>
                                  )}
                                </button>
                              )
                           })}
                        </div>

                        {/* Right Pane: Subjects */}
                        <div className="w-full md:w-2/3 bg-slate-50/50 p-4 rounded-xl border border-slate-100 max-h-[300px] overflow-y-auto custom-scrollbar">
                           {activeTextTypeTab && currentSubjectGroups[activeTextTypeTab] ? (
                             <div className="flex flex-wrap gap-2 content-start">
                                {currentSubjectGroups[activeTextTypeTab].map(subj => {
                                   const isSelected = config.subjects.includes(subj);
                                   const label = subj.split(/]: /)[1] || subj.split(': ')[1] || subj;
                                   const isMaxReached = config.subjects.length >= config.passageCount;
                                   
                                   return (
                                     <button
                                       key={subj}
                                       onClick={() => handleSubjectToggle(subj)}
                                       disabled={!isSelected && isMaxReached}
                                       className={`
                                         flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-xs font-bold border
                                         ${isSelected 
                                           ? 'bg-slate-800 text-white border-slate-800 shadow-sm' 
                                           : isMaxReached 
                                             ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                             : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600 shadow-sm'}
                                       `}
                                     >
                                       {label}
                                       {isSelected && <Check className="w-3 h-3 text-green-400" strokeWidth={3} />}
                                     </button>
                                   )
                                })}
                             </div>
                           ) : (
                             <div className="flex items-center justify-center h-full text-slate-400 text-sm font-bold">
                               글 유형을 선택해주세요.
                             </div>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* 3. Text Specs */}
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4 pt-4 border-t border-slate-100">
                    <span className="w-1.5 h-5 bg-slate-300 rounded-full"></span>
                    지문 스펙 상세
                  </h3>

                  <div className="grid grid-cols-1 gap-6">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                           <div className="flex justify-between items-end mb-4">
                              <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                 <AlignLeft className="w-4 h-4" /> 지문 길이 (글자 수)
                              </label>
                              <span className="text-brand-600 font-black bg-white px-2 py-1 rounded border border-brand-100 shadow-sm">{config.textLengthCount}자</span>
                           </div>
                           <input 
                              type="range" min="300" max="2500" step="100" 
                              value={config.textLengthCount}
                              onChange={(e) => handleInputChange('textLengthCount', parseInt(e.target.value))}
                              className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-brand-600"
                           />
                           <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2 uppercase">
                              <span>Short (300)</span>
                              <span>Long (2500)</span>
                           </div>
                        </div>
                    </div>
              </div>
            </div>
          )}

          {/* STEP 3: BLUEPRINT (Tabbed by Selected Subject) */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-fade-in-up">
              <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                    영역별 문항 설계 (Blueprint)
                  </h3>
                  
                  {selectedSubjects.length === 0 ? (
                    <div className="text-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                       <p className="font-bold">선택된 영역이 없습니다.</p>
                       <p className="text-sm mt-2">이전 단계에서 평가 영역을 선택해주세요.</p>
                       <button onClick={goPrev} className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100">돌아가기</button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-slate-500 mb-6 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 leading-relaxed">
                         이전 단계에서 선택한 <strong>{selectedSubjects.length}개의 구체적인 주제</strong>별로 문항을 각각 설계할 수 있습니다.<br/>
                         예: '{getSubjectShortName(selectedSubjects[0])}' 탭을 눌러 해당 주제의 문제 유형을 설정하세요.
                      </p>

                      {/* Tabs (Selected Subjects) */}
                      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
                        {selectedSubjects.map((subject, index) => (
                          <button
                            key={subject}
                            onClick={() => setActiveBlueprintTab(subject)}
                            className={`
                               px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2
                               ${activeBlueprintTab === subject 
                                 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' 
                                 : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}
                            `}
                          >
                            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">{index + 1}</span>
                            {getSubjectShortName(subject)}
                          </button>
                        ))}
                      </div>

                      {/* Blueprint Builder for Active Tab */}
                      {activeBlueprintTab && config.subjectBlueprints[activeBlueprintTab] && (
                        <div className="space-y-3 mb-6 bg-white p-1 rounded-2xl">
                          <div className="px-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                             {getSubjectShortName(activeBlueprintTab)} 문항 구성
                          </div>
                          
                          {config.subjectBlueprints[activeBlueprintTab].map((item, index) => (
                            <div key={index} className="flex items-center gap-2 sm:gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm group hover:border-indigo-300 transition-all">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-sm shrink-0">
                                Q{index + 1}
                              </div>
                              
                              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 min-w-0">
                                <div className="min-w-0">
                                  <select
                                    value={item.type}
                                    onChange={(e) => updateBlueprintItem(activeBlueprintTab, index, 'type', e.target.value)}
                                    className="w-full text-xs sm:text-sm font-bold bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer hover:border-indigo-300 truncate"
                                  >
                                    {Object.values(QuestionType).map(t => (
                                      <option key={t} value={t}>{t}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="min-w-0">
                                  <select
                                    value={item.difficulty}
                                    onChange={(e) => updateBlueprintItem(activeBlueprintTab, index, 'difficulty', e.target.value)}
                                    className="w-full text-xs sm:text-sm font-bold bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer hover:border-indigo-300 truncate"
                                  >
                                    {Object.values(Difficulty).map(d => (
                                      <option key={d} value={d}>{d}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <button 
                                onClick={() => removeBlueprintItem(activeBlueprintTab, index)}
                                disabled={config.subjectBlueprints[activeBlueprintTab].length <= 1}
                                className="p-2 shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                          
                          <button
                            onClick={() => addBlueprintItem(activeBlueprintTab)}
                            disabled={config.subjectBlueprints[activeBlueprintTab].length >= 10}
                            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all mt-4"
                          >
                            <Plus className="w-4 h-4" />
                            문항 추가하기 ({getSubjectShortName(activeBlueprintTab)})
                          </button>
                        </div>
                      )}
                    </>
                  )}
              </div>
            </div>
          )}

          {/* Controls Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-8 pt-0 bg-gradient-to-t from-white via-white to-transparent h-24 pointer-events-none rounded-b-[2rem]"></div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between items-center px-4">
           {currentStep > 1 ? (
             <button onClick={goPrev} className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2">
               <ArrowLeft className="w-4 h-4" /> 이전 단계
             </button>
           ) : <div></div>}

           {currentStep < 3 ? (
             <button 
               onClick={goNext} 
               disabled={currentStep === 2 && !isStep2Valid}
               className={`
                  px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg
                  ${currentStep === 2 && !isStep2Valid 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'}
               `}
             >
               다음 단계 <ArrowRight className="w-4 h-4" />
             </button>
           ) : (
             <button 
                onClick={onGenerate}
                disabled={isGenerating || config.subjects.length === 0}
                className={`
                  px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all
                  ${isGenerating 
                     ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                     : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/30'}
                `}
             >
                {isGenerating ? <Spinner size="sm" /> : <Sparkles className="w-4 h-4" />}
                시험지 생성하기
             </button>
           )}
        </div>

      </div>

      {/* RIGHT COLUMN: Summary & Preview (4 cols) - Sticky */}
      <div className="lg:col-span-4">
        <div className="sticky top-24 space-y-6">
           <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] ring-1 ring-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                    <BookOpen className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-lg text-slate-900">설정 요약</h3>
              </div>

              <div className="space-y-4 text-sm">
                 <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-400">대상 학년</span>
                    <span className="font-bold text-slate-700">{config.gradeLevel.split(' ')[0]}</span>
                 </div>
                 <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-400">지문 구성</span>
                    <span className="font-bold text-slate-700">{config.passageCount}개 지문</span>
                 </div>
                 <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-400">선택 영역</span>
                     <span className={`font-bold ${config.subjects.length === config.passageCount ? 'text-green-600' : 'text-red-500'}`}>
                       {config.subjects.length} / {config.passageCount}
                    </span>
                 </div>
                 <div className="flex justify-between py-2 pt-4">
                    <span className="text-slate-500 font-bold">총 예상 문항</span>
                    {/* Approximation based on active tab or 4 */}
                    <span className="font-black text-2xl text-slate-900">
                      {config.subjects.reduce((acc, subj) => acc + (config.subjectBlueprints[subj]?.length || 4), 0)}
                    </span>
                 </div>
              </div>

              <div className="mt-8 bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Time</span>
                 </div>
                 <span className="font-bold text-slate-700">{estimatedTime}분 소요</span>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
};

export default ConfigPanel;
