
export interface Question {
  id: number;
  text: string;
  options: string[];
  answer: number; // Index 0-4
  type: string; // e.g., "추론", "내용 일치", "어휘"
  explanation: string; // Detailed reason for the answer
  predictedRate?: string; // AI predicted correct answer rate
}

export interface Passage {
  id: number;
  title: string;
  category: string; // e.g., "인문", "사회", "과학", "예술"
  content: string;
  questions: Question[];
}

export interface TestSet {
  title: string;
  gradeLevel: string;
  targetTime: string;
  passages: Passage[];
}

export enum GradeLevel {
  ELEM_1 = "초등학교 1학년",
  ELEM_2 = "초등학교 2학년",
  ELEM_3 = "초등학교 3학년",
  ELEM_4 = "초등학교 4학년",
  ELEM_5 = "초등학교 5학년",
  ELEM_6 = "초등학교 6학년",
  MIDDLE_1 = "중학교 1학년",
  MIDDLE_2 = "중학교 2학년",
  MIDDLE_3 = "중학교 3학년",
  HIGH_1 = "고등학교 1학년",
  HIGH_2 = "고등학교 2학년",
  HIGH_3 = "고등학교 3학년 (수능 대비)",
}

export enum Subject {
  // ==========================================
  // [초등 1~2학년: 기초 적응 및 생활] - 30개
  // ==========================================
  ELEM_12_LIFE_SCHOOL = "초1~2[생활]: 즐거운 학교 생활과 규칙",
  ELEM_12_LIFE_FRIEND = "초1~2[생활]: 친구와 사이좋게 지내기",
  ELEM_12_LIFE_FAMILY = "초1~2[생활]: 우리 가족과 친척",
  ELEM_12_LIFE_NEIGHBOR = "초1~2[생활]: 우리 동네와 이웃",
  ELEM_12_LIFE_SAFETY = "초1~2[생활]: 교통 안전과 생활 안전",
  ELEM_12_LIFE_SEASON_SPRING = "초1~2[통합]: 봄의 날씨와 풍경",
  ELEM_12_LIFE_SEASON_SUMMER = "초1~2[통합]: 여름 방학 풍경",
  ELEM_12_LIFE_SEASON_FALL = "초1~2[통합]: 가을의 곡식과 열매",
  ELEM_12_LIFE_SEASON_WINTER = "초1~2[통합]: 겨울 놀이와 새해",
  ELEM_12_KOR_LETTER = "초1~2[국어]: 마음을 전하는 편지 쓰기",
  ELEM_12_KOR_DIARY = "초1~2[국어]: 그림 일기 쓰기",
  ELEM_12_KOR_RHYME = "초1~2[국어]: 말놀이와 수수께끼",
  ELEM_12_KOR_FAIRY_KR = "초1~2[문학]: 흥미진진 전래 동화",
  ELEM_12_KOR_FAIRY_WORLD = "초1~2[문학]: 세계 명작 동화",
  ELEM_12_KOR_POEM = "초1~2[문학]: 동시 낭송하기",
  ELEM_12_MATH_SHAPE = "초1~2[수학]: 여러 가지 모양(세모/네모)",
  ELEM_12_MATH_CLOCK = "초1~2[수학]: 시계 보기와 규칙 찾기",
  ELEM_12_SCI_ANIMAL = "초1~2[탐구]: 강아지와 고양이 돌보기",
  ELEM_12_SCI_PLANT = "초1~2[탐구]: 나팔꽃과 강낭콩 기르기",
  ELEM_12_ETHICS_MANNERS = "초1~2[바른생활]: 식사 예절과 인사",
  ELEM_12_ETHICS_PUBLIC = "초1~2[바른생활]: 공공 장소 예절",
  ELEM_12_ART_TRADITION = "초1~2[예술]: 우리나라 전통 놀이",
  ELEM_12_ART_MUSIC = "초1~2[예술]: 리듬 악기 연주",
  ELEM_12_JOB_DOCTOR = "초1~2[진로]: 병원과 의사 선생님",
  ELEM_12_JOB_FIRE = "초1~2[진로]: 소방관과 경찰관",

  // ==========================================
  // [초등 3~4학년: 탐구 및 사회 확장] - 40개
  // ==========================================
  ELEM_34_SOC_VILLAGE = "초3~4[사회]: 우리 고장의 모습과 유래",
  ELEM_34_SOC_MAP = "초3~4[사회]: 지도 기호와 등고선",
  ELEM_34_SOC_TRANSPORT = "초3~4[사회]: 이동 수단과 의사소통 수단",
  ELEM_34_SOC_CULTURE = "초3~4[사회]: 옛날과 오늘날의 생활 도구",
  ELEM_34_SOC_LOCAL = "초3~4[사회]: 지역 축제와 문화 유산",
  ELEM_34_SOC_PROBLEM = "초3~4[사회]: 우리 지역의 문제 해결",
  ELEM_34_SOC_FAMILY_TYPE = "초3~4[사회]: 다양한 가족의 형태",
  ELEM_34_SCI_MATTER = "초3~4[과학]: 물질의 상태(고체/액체/기체)",
  ELEM_34_SCI_MAGNET = "초3~4[과학]: 자석의 이용",
  ELEM_34_SCI_ANIMAL_CYCLE = "초3~4[과학]: 동물의 한살이(배추흰나비)",
  ELEM_34_SCI_PLANT_CYCLE = "초3~4[과학]: 식물의 한살이와 구조",
  ELEM_34_SCI_GEOLOGY = "초3~4[과학]: 지층과 화석",
  ELEM_34_SCI_EARTH_MOON = "초3~4[과학]: 지구와 달의 모습",
  ELEM_34_SCI_MIXTURE = "초3~4[과학]: 혼합물의 분리",
  ELEM_34_SCI_WATER = "초3~4[과학]: 물의 여행과 상태 변화",
  ELEM_34_SCI_VOLCANO = "초3~4[과학]: 화산과 지진",
  ELEM_34_KOR_FEELING = "초3~4[국어]: 감정을 표현하는 글",
  ELEM_34_KOR_OPINION = "초3~4[국어]: 의견이 드러나는 글",
  ELEM_34_KOR_INTRO = "초3~4[국어]: 대상을 소개하는 글",
  ELEM_34_KOR_BOOK = "초3~4[국어]: 독서 감상문 쓰기",
  ELEM_34_KOR_DICT = "초3~4[국어]: 국어사전 활용하기",
  ELEM_34_KOR_IDIOOM = "초3~4[국어]: 속담과 관용 표현",
  ELEM_34_ETHICS_FRIEND = "초3~4[도덕]: 친구 사이의 예절",
  ELEM_34_ETHICS_INTERNET = "초3~4[도덕]: 올바른 인터넷 사용",
  ELEM_34_ETHICS_LIFE = "초3~4[도덕]: 생명 존중과 자연 사랑",
  ELEM_34_ART_PAINTING = "초3~4[미술]: 수묵화와 채색화",
  ELEM_34_MUSIC_GUGAK = "초3~4[음악]: 우리 가락과 장단",

  // ==========================================
  // [초등 5~6학년: 심화 교과 및 논리] - 50개
  // ==========================================
  ELEM_56_SOC_HISTORY_GORYEO = "초5~6[역사]: 고려의 건국과 문화",
  ELEM_56_SOC_HISTORY_JOSEON = "초5~6[역사]: 조선의 유교 문화와 과학",
  ELEM_56_SOC_HISTORY_WAR = "초5~6[역사]: 임진왜란과 병자호란",
  ELEM_56_SOC_HISTORY_MODERN = "초5~6[역사]: 일제 강점기와 광복",
  ELEM_56_SOC_HISTORY_DEMO = "초5~6[역사]: 6.25 전쟁과 민주주의 발전",
  ELEM_56_SOC_LAW = "초5~6[사회]: 법의 역할과 준법 정신",
  ELEM_56_SOC_ECONOMY = "초5~6[사회]: 우리나라 경제 발전과 무역",
  ELEM_56_SOC_GLOBAL = "초5~6[사회]: 지구촌 갈등과 평화",
  ELEM_56_SOC_ENV = "초5~6[사회]: 지속 가능한 미래와 환경",
  ELEM_56_SOC_MAP_WORLD = "초5~6[사회]: 세계 지도와 대륙별 특징",
  ELEM_56_SCI_TEMP = "초5~6[과학]: 온도와 열",
  ELEM_56_SCI_BODY = "초5~6[과학]: 우리 몸의 구조와 기능",
  ELEM_56_SCI_ECO = "초5~6[과학]: 생태계와 환경",
  ELEM_56_SCI_WEATHER = "초5~6[과학]: 날씨와 우리 생활",
  ELEM_56_SCI_ACID = "초5~6[과학]: 산과 염기",
  ELEM_56_SCI_LENS = "초5~6[과학]: 빛과 렌즈",
  ELEM_56_SCI_SPACE = "초5~6[과학]: 지구의 자전과 공전",
  ELEM_56_SCI_ELECTRIC = "초5~6[과학]: 전기의 이용",
  ELEM_56_SCI_ENERGY = "초5~6[과학]: 에너지와 생활",
  ELEM_56_KOR_ARGUE = "초5~6[국어]: 타당한 근거로 주장하기",
  ELEM_56_KOR_AD = "초5~6[국어]: 광고 읽기와 비판적 사고",
  ELEM_56_KOR_NEWS = "초5~6[국어]: 뉴스 관점 파악하기",
  ELEM_56_KOR_LIT_CONFLICT = "초5~6[문학]: 이야기 속 갈등 해결",
  ELEM_56_KOR_PLAY = "초5~6[문학]: 연극 대본 읽기",
  ELEM_56_PRACTICAL_COOK = "초5~6[실과]: 건강한 식생활과 조리",
  ELEM_56_PRACTICAL_SW = "초5~6[실과]: 소프트웨어와 코딩 기초",
  ELEM_56_PRACTICAL_JOB = "초5~6[실과]: 일과 직업의 세계",

  // ==========================================
  // [중등: 본격적 학문 탐구] - 50개
  // ==========================================
  MID_LIT_MODERN_NOVEL_GROWTH = "중등[문학]: 현대 소설 (성장과 자아)",
  MID_LIT_MODERN_NOVEL_SOC = "중등[문학]: 현대 소설 (사회 비판)",
  MID_LIT_CLASSIC_NOVEL_HERO = "중등[문학]: 고전 소설 (영웅 군담)",
  MID_LIT_CLASSIC_NOVEL_SATIRE = "중등[문학]: 고전 소설 (풍자와 해학)",
  MID_LIT_MODERN_POEM_SENSE = "중등[문학]: 현대시 (감각적 이미지)",
  MID_LIT_MODERN_POEM_SYMBOL = "중등[문학]: 현대시 (상징과 비유)",
  MID_LIT_CLASSIC_POEM_SIJO = "중등[문학]: 평시조와 사설시조",
  MID_LIT_ESSAY_LIFE = "중등[문학]: 경수필 (생활 속 깨달음)",
  MID_LIT_ESSAY_CRITIC = "중등[문학]: 중수필 (사회적 논평)",
  MID_LIT_SCRIPT = "중등[문학]: 희곡과 시나리오 구조",
  MID_GRAMMAR_PHONOLOGY = "중등[문법]: 음운의 변동",
  MID_GRAMMAR_WORD = "중등[문법]: 품사와 단어의 형성",
  MID_GRAMMAR_SENTENCE = "중등[문법]: 문장의 성분과 구조",
  MID_NONLIT_EXPOS_STRUC = "중등[비문학]: 설명문의 구조 분석",
  MID_NONLIT_ARG_STRUC = "중등[비문학]: 논설문의 논증 방식",
  MID_SOC_LAW_CONST = "중등[사회]: 헌법의 기본 원리",
  MID_SOC_LAW_CIVIL = "중등[사회]: 개인 생활과 민법",
  MID_SOC_ECON_MARKET = "중등[사회]: 시장 가격의 결정",
  MID_SOC_ECON_GDP = "중등[사회]: 국민 경제와 GDP",
  MID_SOC_POLITICS_ELECT = "중등[사회]: 선거와 민주 정치",
  MID_SOC_GEO_CLIMATE = "중등[사회]: 기후 구분과 주민 생활",
  MID_SOC_GEO_POP = "중등[사회]: 인구 문제와 도시화",
  MID_HIST_KOR_ANCIENT = "중등[역사]: 삼국의 성립과 발전",
  MID_HIST_KOR_MODERN = "중등[역사]: 개항과 근대 국가 수립",
  MID_HIST_WORLD_CIVIL = "중등[역사]: 세계 4대 문명",
  MID_HIST_WORLD_REVOL = "중등[역사]: 시민 혁명과 산업 혁명",
  MID_SCI_PHY_FORCE = "중등[물리]: 힘과 운동의 법칙",
  MID_SCI_PHY_LIGHT = "중등[물리]: 빛과 파동",
  MID_SCI_PHY_ELEC = "중등[물리]: 전기와 자기",
  MID_SCI_CHEM_GAS = "중등[화학]: 기체 법칙 (보일/샤를)",
  MID_SCI_CHEM_ATOM = "중등[화학]: 원자와 이온",
  MID_SCI_CHEM_REACTION = "중등[화학]: 화학 반응과 에너지",
  MID_SCI_BIO_CELL = "중등[생명]: 세포와 생명의 연속성",
  MID_SCI_BIO_PLANT = "중등[생명]: 광합성과 호흡",
  MID_SCI_BIO_GENE = "중등[생명]: 유전과 진화",
  MID_SCI_EARTH_STAR = "중등[지구]: 별과 우주",
  MID_SCI_EARTH_ATMOS = "중등[지구]: 대기와 해양",
  MID_TECH_AI = "중등[기술]: 인공지능 기초 원리",
  MID_TECH_DATA = "중등[기술]: 빅데이터와 정보 보호",
  MID_ART_WESTERN = "중등[미술]: 서양 미술사의 흐름",
  MID_MUSIC_HISTORY = "중등[음악]: 서양 음악사 (바로크~낭만)",

  // ==========================================
  // [고등: 수능형 심화 학술] - 60개
  // ==========================================
  HIGH_HUM_EPISTEMOLOGY = "고등[인문]: 인식론 (합리론 vs 경험론)",
  HIGH_HUM_LOGIC_PROP = "고등[인문]: 명제 논리와 기호 논리학",
  HIGH_HUM_LOGIC_INDUCT = "고등[인문]: 귀납 추론과 베이즈 정리",
  HIGH_HUM_ETHICS_META = "고등[인문]: 메타 윤리학과 규범 윤리학",
  HIGH_HUM_ETHICS_EAST = "고등[인문]: 동양 철학 (유가/도가/묵가)",
  HIGH_HUM_HISTORY_VIEW = "고등[인문]: 역사 발전론과 사관",
  HIGH_HUM_LINGUISTICS = "고등[인문]: 구조주의 언어학",
  HIGH_HUM_PSYCH_COGN = "고등[인문]: 인지 심리학과 뇌과학",
  HIGH_HUM_PSYCH_BEHAV = "고등[인문]: 행동주의와 게슈탈트 심리학",
  HIGH_SOC_LAW_ADMIN = "고등[사회]: 행정법과 행정 구제",
  HIGH_SOC_LAW_CRIMINAL = "고등[사회]: 형법의 성립 요건 (범죄론)",
  HIGH_SOC_LAW_CIVIL_CONT = "고등[사회]: 민법상 계약과 채권",
  HIGH_SOC_ECON_MICRO = "고등[사회]: 미시 경제 (탄력성과 효용)",
  HIGH_SOC_ECON_GAME = "고등[사회]: 게임 이론과 과점 시장",
  HIGH_SOC_ECON_MACRO = "고등[사회]: 거시 경제 (통화 정책과 금리)",
  HIGH_SOC_ECON_TRADE = "고등[사회]: 환율과 국제 수지",
  HIGH_SOC_POLITICS_INT = "고등[사회]: 국제 정치 이론 (현실/자유)",
  HIGH_SOC_POLITICS_DOM = "고등[사회]: 선거 제도와 투표 행태",
  HIGH_SOC_SOC_FUNC = "고등[사회]: 기능론과 갈등론",
  HIGH_SOC_MEDIA = "고등[사회]: 뉴미디어와 정보 격차",
  HIGH_SCI_PHY_NEWTON = "고등[물리]: 고전 역학 (뉴턴 운동 법칙)",
  HIGH_SCI_PHY_RELATIVITY = "고등[물리]: 특수/일반 상대성 이론",
  HIGH_SCI_PHY_FLUID = "고등[물리]: 유체 역학 (베르누이 정리)",
  HIGH_SCI_PHY_THERMO = "고등[물리]: 열역학 법칙과 엔트로피",
  HIGH_SCI_PHY_QUANTUM = "고등[물리]: 양자 역학 (파동 함수)",
  HIGH_SCI_CHEM_ORBITAL = "고등[화학]: 오비탈과 전자 배치",
  HIGH_SCI_CHEM_BOND = "고등[화학]: 화학 결합과 분자 구조",
  HIGH_SCI_CHEM_REACTION = "고등[화학]: 화학 평형과 반응 속도",
  HIGH_SCI_CHEM_ELECTRO = "고등[화학]: 산화 환원과 전기 화학",
  HIGH_SCI_BIO_DNA = "고등[생명]: DNA 복제와 단백질 합성",
  HIGH_SCI_BIO_TECH = "고등[생명]: 생명 공학 (PCR/CRISPR)",
  HIGH_SCI_BIO_IMMUNE = "고등[생명]: 면역계 (항원 항체 반응)",
  HIGH_SCI_BIO_NERVE = "고등[생명]: 신경계와 호르몬 전도",
  HIGH_SCI_EARTH_PLATE = "고등[지구]: 판 구조론과 지질 시대",
  HIGH_SCI_EARTH_ATMOS = "고등[지구]: 대기 대순환과 기후 변화",
  HIGH_SCI_EARTH_STAR = "고등[지구]: 별의 진화와 HR도",
  HIGH_SCI_EARTH_COSMOS = "고등[지구]: 우주 팽창과 암흑 물질",
  HIGH_TECH_AI_DEEP = "고등[기술]: 딥러닝과 신경망 알고리즘",
  HIGH_TECH_BLOCKCHAIN = "고등[기술]: 블록체인과 분산 원장",
  HIGH_TECH_NETWORK = "고등[기술]: 데이터 통신과 프로토콜",
  HIGH_TECH_DISPLAY = "고등[기술]: 디스플레이 기술 (OLED/LCD)",
  HIGH_TECH_SEMI = "고등[기술]: 반도체 공정과 트랜지스터",
  HIGH_ART_AESTHETICS = "고등[예술]: 미학 이론 (칸트/헤겔)",
  HIGH_ART_MODERN = "고등[예술]: 현대 미술과 아방가르드",
  HIGH_ART_ARCHI = "고등[예술]: 건축 양식과 공학적 원리",
  HIGH_ART_MUSIC_THEORY = "고등[예술]: 화성학과 음악 분석",
  HIGH_LIT_CLASSIC_POEM = "고등[문학]: 고전 시가",
  HIGH_LIT_CLASSIC_NOVEL = "고등[문학]: 고전 소설",
  HIGH_LIT_MODERN_POEM = "고등[문학]: 현대시",
  HIGH_LIT_MODERN_NOVEL = "고등[문학]: 현대 소설",
  HIGH_CONV_SCI_PHIL = "고등[융합]: 과학 철학 (패러다임)",
  HIGH_CONV_TECH_ART = "고등[융합]: 기술 복제 시대의 예술",
  HIGH_CONV_BIO_ETHICS = "고등[융합]: 생명 윤리와 법",
  HIGH_CONV_DATA_SOC = "고등[융합]: 데이터 감시 사회",
}

export enum TextType {
  // 초등 (Elementary)
  ELEM_STORY = "초등: 이야기/동화",
  ELEM_DIARY = "초등: 일기/편지",
  ELEM_INFO = "초등: 정보 전달 글",
  ELEM_POEM = "초등: 동시/시",
  ELEM_PLAY = "초등: 연극 대본",
  ELEM_OPINION = "초등: 의견을 나타내는 글",
  
  // 중등 (Middle School)
  MID_EXPOSITORY = "중등: 설명문 (정보 전달)",
  MID_ARGUMENTATIVE = "중등: 논설문 (주장과 근거)",
  MID_NOVEL = "중등: 소설/수필",
  MID_NEWS = "중등: 기사/보도문",
  MID_PRACTICAL = "중등: 실용문/안내문",
  MID_SPEECH = "중등: 연설문/강연",
  MID_BIOGRAPHY = "중등: 전기문/위인전",
  
  // 고등 (High School)
  HIGH_HUMANITIES = "고등: 인문학 지문 (철학/역사)",
  HIGH_SOCIAL = "고등: 사회과학 지문 (경제/법/정치)",
  HIGH_SCIENCE = "고등: 자연과학 지문 (물리/화학/생명/지구)",
  HIGH_TECH = "고등: 기술/공학 지문",
  HIGH_ART = "고등: 예술 지문 (미술/음악/건축)",
  HIGH_LIT_CLASSIC = "고등: 고전 문학 (시조/가사/고전소설)",
  HIGH_LIT_MODERN = "고등: 현대 문학 (현대시/현대소설)",
  HIGH_CONVERGENCE = "고등: 융합 지문 (인문+과학 등)",
  HIGH_DEBATE = "고등: 토론/토의",
  
  // 일반/공통 (General)
  GEN_INTERVIEW = "공통: 인터뷰/대담",
  GEN_ESSAY = "공통: 에세이/칼럼",
  GEN_CRITIQUE = "공통: 비평/평론",
  GEN_MANUAL = "공통: 매뉴얼/설명서",
  GEN_GRAPH = "공통: 도표/그래프 해석",
  GEN_AD = "공통: 광고/홍보문"
}

export enum Difficulty {
  LOW = "하 (기초적 사실 확인)",
  MEDIUM = "중 (핵심 내용 및 적용)",
  HIGH = "상 (복합 추론 및 비판)",
  CSAT = "최상 (수능형 고난도 킬러)"
}

export enum TargetCorrectRate {
  VERY_HIGH = "90% 이상 (매우 쉬움)",
  HIGH = "70~80% (쉬움)",
  MEDIUM = "50~60% (보통)",
  LOW = "30~40% (어려움)",
  KILLER = "10~20% (최상위 변별력/킬러)"
}

export enum VocabularyLevel {
  EASY = "쉬움 (학년 평균보다 쉽게)",
  NORMAL = "보통 (교과서 수준)",
  ADVANCED = "어려움 (상위 학년 어휘 포함)"
}

export enum QuestionType {
  DETAIL = "내용 일치 (사실 확인)",
  INFERENCE = "추론 (숨은 의도/결과 예측)",
  VOCABULARY = "어휘 (문맥적 의미)",
  STRUCTURE = "구조/전개 (서술 방식)",
  CRITIQUE = "비판/적용 (타당성 평가)",
  KEYWORD = "핵심어/주제 찾기",
  ANALOGY = "유추/비유 (사례 적용)",
  CAUSE_EFFECT = "인과 관계 (원인과 결과)",
  SEQUENCING = "글의 순서 (전개 흐름)",
  FACT_OPINION = "사실/의견 (객관성 구분)",
  AUTHOR_PURPOSE = "집필 의도 (글의 목적)",
  VISUAL = "시각 자료 (도표/그래프 해석)"
}

export interface QuestionBlueprint {
  type: QuestionType;
  difficulty: Difficulty;
}

export interface SubmissionStats {
  totalQuestions: number;
  correctCount: number;
  score: number;
  typeStats: Record<string, { total: number; correct: number }>;
  subjectStats: Record<string, { total: number; correct: number }>;
}

export interface GenerationConfig {
  title: string;
  gradeLevel: GradeLevel;
  subjects: Subject[]; 
  textTypes: TextType[];
  vocabularyLevel: VocabularyLevel; 
  difficulty: Difficulty; // Global difficulty baseline
  targetCorrectRate: TargetCorrectRate;
  passageCount: number;
  questionsPerPassage: number; // Avg questions per passage
  // Replaced categoryBlueprints with subjectBlueprints (key is specific subject string)
  subjectBlueprints: Record<string, QuestionBlueprint[]>;
  textLengthCount: number; 
}

// ============================================
// Pre-Generated Content Types
// ============================================

export interface FAQ {
  question: string;
  answer: string;
}

export interface PreGeneratedQuestion extends Question {
  correctFeedback: string;           // Feedback when student answers correctly
  incorrectFeedback: string;         // Feedback when student answers incorrectly
  strategyFeedback: Record<string, string>; // Feedback per reading strategy
  faq: FAQ[];                        // Pre-generated FAQ for AI tutor replacement
}

export interface PreGeneratedPassage extends Passage {
  paragraphGuides: string[];         // Pre-reading guide per paragraph
  paragraphKeywords: string[][];     // Key terms per paragraph for matching
  paragraphModelSummary: string[];   // Model summary per paragraph
  questions: PreGeneratedQuestion[];
}

export interface PreGeneratedTestSet extends TestSet {
  id: string;                        // Unique test set ID
  grade: GradeLevel;                 // Grade level enum value
  difficulty: Difficulty;            // Difficulty level
  subject: string;                   // Primary subject
  vocabulary: Record<string, string>; // { word: contextual meaning }
  passages: PreGeneratedPassage[];
}

export interface TestSetIndex {
  id: string;
  title: string;
  grade: GradeLevel;
  difficulty: Difficulty;
  subject: string;
  passageCount: number;
  questionCount: number;
}

export interface ReadingHabitFeedbackTemplate {
  scoreRange: [number, number];      // [min, max] score range
  strategyLevel: 'low' | 'medium' | 'high'; // How many strategies checked
  feedback: string;
}

export interface AssignmentBundle {
  id: string;              // 과제 고유 ID
  title: string;           // 과제 제목 (예: "7월 10일 일일 독해 과제")
  assignedDate: string;    // 배정 날짜 (YYYY-MM-DD)
  testSetIds: string[];    // 포함된 300세트 내 시험 ID 리스트
  teacherUid: string;      // 배정한 교사 ID
  createdAt: string;       // 생성 일시
}
