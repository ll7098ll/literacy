# 🚀 범용 웹 애플리케이션 프레임워크: 코어 개발 가이드라인 및 엔지니어링 원칙
(Universal Development Guidelines, Skills, and Principles for Future Apps)

본 문서는 "문해력 평가 AI 플랫폼"의 극한의 트러블슈팅과 아키텍처 수립 경험을 바탕으로, **향후 진행될 모든 웹/앱(AI 기반 시스템 포함) 개발 프로젝트에 범용적으로 적용할 수 있는 '표준(Standard) 개발 지침서'** 입니다. 
어플리케이션의 기획 단계부터 기술 스택 적용, 구현, 보안, 그리고 문서화에 이르는 전 과정에서 본 지침을 준수하면 더욱 효과적이고 확장성 높은(Scalable) 개발이 가능해집니다.

---

## 🏗️ Phase 1: 기술 스택 선정 및 표준 아키텍처 (Tech Stack & Foundation)

새로운 앱을 개발할 때, 생산성과 런타임 성능을 극대화하기 위해 다음의 **표준 스택(Standard Stack)** 모델을 지향합니다.

1. **프론트엔드 엔진: React 18+ & Vite**
   * **적용 지침**: 무거운 Webpack(CRA 등)을 배제하고 즉각적인 HMR(Hot Module Replacement)을 지원하는 Vite를 기본 빌드 툴로 사용합니다.
   * **아키텍처 효과**: 컴포넌트 주도 개발(CDD)을 가속화하며, 초기 렌더링 및 번들링 최적화를 달성합니다.
2. **스타일링 프레임워크: Tailwind CSS v3+**
   * **적용 지침**: 런타임 오버헤드를 발생시키는 CSS-in-JS(Styled-components 등) 대신 유틸리티 퍼스트 디자인(Tailwind CSS)을 채택합니다.
   * **아키텍처 효과**: CSS 클래스 이름 짓는 시간을 없애고(Naming Cost Zero), 컴포넌트와 스타일을 단일 계층에 두어 유지보수를 용이하게 합니다.
3. **인프라 및 클라우드(BaaS): Firebase 연계**
   * **적용 지침**: 앱이 '독단적 프론트엔드'로 끝나지 않고 유저 데이터를 저장해야 한다면, 무서버(Serverless) 트렌드에 따라 Firebase(Firestore, Auth)를 채택해 백엔드 유지보수 코스트를 제로(0)에 가깝게 만듭니다.
4. **AI 및 외부 API 통합: 캡슐화(Encapsulation)**
   * **적용 지침**: LLM(Gemini, OpenAI 등) 모델과의 통신은 절대 UI 컴포넌트 안에서 직접 `fetch` 하지 않습니다. 반드시 `src/services/` 내부의 전용 서비스 워커(Singleton 객체 등)로 분리합니다.

---

## 🎯 Phase 2: 기획 및 아키텍처 단계 (Planning & Architecture)

개발을 시작하기 전 뼈대를 구축할 때 반드시 고려해야 할 원칙입니다.

1. **상태 관리의 계층화 (State Stratification)**
   * **고려 사항**: "모든 데이터를 전역 상태(Redux, Zustand)에 담을 것인가?"
   * **지침**: 글로벌 스토어는 '테마(Dark/Light)', '로그인 유저 세션', '다국어' 처럼 앱 전체를 아우르는 것에만 한정합니다. 특정 페이지 안에서만 도는 비즈니스 로직(예: 시험 풀이, 채팅)은 해당 페이지를 관장하는 최고 부모 컴포넌트의 Local State(Context) 로 제한하여 **State Bleeding(상태 오염)**을 철저히 차단합니다.
2. **단방향 데이터 흐름 고수 (One-way Data Binding)**
   * 자식 컴포넌트(UI 표시용)는 절대 부모의 상태를 변이(Mutate)할 권한을 갖지 못하게 하위 렌더링 전용 **순수 함수(Pure Function)** 형태로 작성합니다.

---

## 🛡️ Phase 3: 데이터 통신 및 방어적 프로그래밍 (Defensive Programming)

외부(사용자 입력, AI 응답, 웹 스크래핑 데이터)에서 들어오는 데이터는 언제나 형체를 알 수 없는 리스크를 내포합니다.

1. **방어적 프로그래밍 (Defensive Programming by Default)**
   * **원칙**: 외부 입력값(특히 AI 생성 데이터)은 '절대 신뢰할 수 없는 위험한 페이로드'로 취급합니다.
   * **적용 사례 (JSON 멸균)**: LLM이 데이터를 반환할 때 설명문을 붙이거나 포맷을 깨뜨릴 수 있습니다. 데이터를 `JSON.parse` 하기 전에, 시스템 에러를 방어하는 정규식 추출 파이프라인을 의무적으로 구축하십시오.
   ```typescript
   // [필수 방어 스택] JSON 안전 파싱 추출기
   const sanitizeAIResponse = (text: string) => {
     const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
     const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/); 
     if(!match) throw new Error("데이터 포맷 누락 예외 반환");
     return JSON.parse(match[0]);
   }
   ```
2. **비동기 통신 UX 핸들링 (Concurrency & Latency)**
   * **지침**: 외부 API, DB 저장 콜백이 0.5초 이상 지연될 확률이 있다면, 반드시 Spinner, Skeleton UI, 진행률 표시기(Progress) 중 하나를 배치하여 사용자가 "앱이 죽었다"고 생각하고 새로고침을 누르지 않도록 방어해야 합니다.

---

## 🔒 Phase 4: 데이터베이스 및 보안 모델링 (DB Modeling & Security)

NoSQL 데이터베이스(Firestore 등) 활용 시 필수 고려 사항입니다.

1. **안티 패턴 철폐: 배열(Array) 폭주 방지**
   * **원칙**: 사용자의 로그, 댓글, 채팅, 단어장 등 **리미트를 알 수 없는 데이터 집합(Unbounded lists)**을 배열에 `push` 하는 행위는 NoSQL 구조에서 문서 용량 1MB을 초과시켜 전체 DB를 마비시키는 가장 큰 요인입니다.
   * **올바른 적용**: 반드시 상위 문서 밑에 별도의 하위 서브 컬렉션(Sub-collection)을 만들어 개별 문서로 삽입하여 페이지네이션(Pagination) 쿼리를 구현하십시오.
2. **Zero-Trust 아키텍처**
   * **원칙**: 모든 클라이언트 네트워크 코드는 변조될 수 있습니다.
   * **적용 단계**: 프론트엔드 단에서의 `user.uid` 체크로 끝내지 마십시오. 클라우드 방화벽 단계(예: `firestore.rules`)에서 DB 접근을 시도하는 Request의 Auth 토큰과 타겟 리소스의 Owner ID가 일치하는지를 검사하는 2중 체계를 구현하십시오.

---

## 🎨 Phase 5: 렌더링 무결성 및 엣지 케이스 (Rendering Resilience)

마크다운, 에디터, SVG 차트 등 복합 요소를 렌더링하는 앱을 만들 때의 지침입니다.

1. **DOM 트리의 캡슐화 (Avoid DOM Explosion)**
   * **원칙**: 표준 HTML5 규약 위반(인라인 요소 태그 내부에 블록 요소를 집어넣는 행위)은 브라우저에 따라 렌더링 붕괴(Crash)를 발생시킵니다.
   * **적용**: 외부 HTML 덩어리를 `dangerouslySetInnerHTML` 등으로 삽입할 경우, 래퍼(Wrapper) 껍데기를 `<span className="block">` 등으로 교묘하게 감싸 트리 파괴를 방지하는 우회 기법을 고려하십시오.
2. **스케일링 붕괴 방어 (CSS Anti-Collapse)**
   * **현상 대비**: 픽셀 사이즈(width/height)가 유동적인 미디어, SVG, 차트를 렌더링할 때는 부모 공간을 잡지 못해 "0x0 px" 로 찌그러져 소멸되는 현상이 자주 발생합니다.
   * **적용**: 전역 스타일을 통해 이러한 미디어 컴포넌트에 `width: 100%; max-width: 100%; height: auto; display: block;` 속성을 반드시 주입하여 반응성을 강제로 유지시키십시오.

---

## 📜 Phase 6: 협업 및 유지보수를 위한 문서화 (Hyper-Waterfall Documentation)

1. **코드 변경의 당위성 기록 (`Why` 중심의 일지)**
   * **원칙**: 코드가 "무엇(What)"을 하는지는 주석이나 함수명으로 알 수 있지만, "왜(Why)" 이 아키텍처를 선택했는지는 오로지 개발 기록 문서에만 남습니다.
   * **적용 지침**: 심각한 버그를 고쳤거나 시스템 레이어를 변경했을 경우, 커밋이나 PR에 끝내지 말고 반드시 프로젝트 문서(Docs) 내부에 **"현상 분석(RCA) - 극복 과정 - 얻은 레슨"**을 서사 형식으로 기록하여 향후 투입될 엔지니어의 시행착오를 제로화해야 합니다.
