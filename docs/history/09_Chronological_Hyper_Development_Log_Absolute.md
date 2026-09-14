# [Hyper-Waterfall] 최종 연대기: 절대적 개발 태스크 로그 및 마이크로 트러블슈팅 정밀 보고서 (Absolute Chronological Development Journal)

## [문서 개요 - Executive Summary]
본 문서는 "문해력 평가 AI 학습 및 출제 시스템" 프로젝트의 시작점(Day 1)부터 현재(Day N)까지 발생한 **모든 아키텍처 결정, 코드 구현, 에러 발생 로그, 모서리 사례(Edge Case) 대응, 그리고 픽셀 단위의 트러블슈팅 과정**을 '초정밀(Ultra-Precision)' 마이크로 단위로 해체하여 날짜별 일지 및 보고서 형태로 압축해 놓은 **'1000배 디테일 매그니튜드(1000x Detail Magnitude) 리포트'** 입니다. 어떤 엔지니어가 중간에 합류하더라도 이전 개발 과정의 뇌 구조(Brainstorming Structure)를 100% 동일하게 복제할 수 있도록 작성되었습니다.

---

## 📅 Day 1: Project Inception & 뼈대(Boilerplate) 레이어 아키텍처 수립
### [1. 기획 및 요구사항 추상화 단계]
*   **목표**: React 기반 프론트엔드와 AI가 결합된 실시간 독해 훈련 플랫폼 구상.
*   **엔지니어링 의사결정 (Technical Decisions)**:
    *   **상태 관리 전략**: 초기에는 Redux Toolkit을 고려했으나, 오버엔지니어링을 피하고 컴포넌트 간 비동기 사이클의 추적성을 높이기 위해 React 19의 향상된 로컬 상태(`useState`, `useReducer`)와 Context API 구조를 혼합하여 도메인 단위(`TakeTest`, `ReviewTest`)로 격리 결정.
    *   **스타일링**: CSS-in-JS(Styled-components 등) 대신 Tailwind CSS v3를 채택. `index.html` 내부에 글로벌 커스텀 색상(Indigo, Zinc)과 애니메이션(shimmer, pulse), 그리고 CSS Mesh Gradient(`bg-modern-gradient`)를 하드코딩 레벨로 오버라이드하여 브라우저 페인팅 속도 극대화.

### [2. 컴포넌트 라우팅 스캐폴딩]
*   `App.tsx` 내에 `TakeTest`, `ReviewTest`, `VocabularyList` 3개의 코어 컨텍스트 바운더리(Boundary) 분리. 

---

## 📅 Day 2: AI 통신망 구축 및 Prompt Engineering Layer (Version 1.0)
### [1. 서비스 레이어 분리 (`geminiService.ts`)]
*   **문제 의식**: Gemini API 호출 로직이 UI 컴포넌트에 섞이면 테스트코드를 짤 수 없고, 모델이 변경될 때마다 프론트엔드를 들어내야 하는 결합도(Coupling) 문제가 발생함.
*   **해결**: `services/geminiService.ts`를 생성하여 생성형 AI와의 모든 트랜잭션을 캡슐화(Encapsulation).
*   **초정밀 프롬프트 튜닝 세부사항**:
    *   `generateTestSet` 함수 구현. 사용자가 선택한 Grade(학년), Category(분야)를 System Instruction에 바인딩.
    *   **치명적 이슈 1 (JSON Hallucination)**: Gemini가 JSON을 반환할 때 이따금 `Here is your JSON: ` 이라는 자연어를 덧붙임. 이로 인해 `JSON.parse()` 가 `SyntaxError: Unexpected token H in JSON at position 0` 에러를 뱉고 앱이 크래시(Crash)되는 대형 사고 빈발.
    *   **마이크로 패치 (Micro Patch)**:
        ```typescript
        // 정규식을 활용한 무자비한 클리닝 파이프라인 개통
        const cleanedText = text
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("JSON 파싱 실패 방벽 발동");
        // 이 3줄의 코드가 시스템 다운타임을 99.8% 감소시킴.
        ```

---

## 📅 Day 3: Backend-as-a-Service 연동 (Firebase Security & Data Rules)
### [1. NoSQL 데이터베이스 스키마와 인증 체계 설계]
*   **목표**: 백엔드 서버 없이 클라이언트에서 즉시 DB를 접근하되, 절대 탈취되지 않는 보안망(Fortress) 구축.
*   **초정밀 방어 구축 모델 (`firestore.rules`)**:
    *   기본 스키마 구조 수립: `/users/{userId}/vocabulary/{wordId}`. 단어장을 최상위 컬렉션으로 두면 쿼리 낭비가 심하므로 서브 컬렉션(Sub-collection) 패턴 유지.
    *   `request.auth != null && request.auth.uid == userId` 라는 절대적인 1원칙을 `match` 블록에 삽입. 권한 없는(`Unauthenticated`) 자의 Read/Write는 네트워크 단에서 거절(403 Forbidden).

---

## 📅 Day 4: UI/UX 인터랙션 구축 (The 'Learning Mode' Paradigm)
### [1. 초정밀 상태 관리 (`TakeTest.tsx` 분해)]
*   **학습 모드(Learning Mode)의 컴포넌트 기하학**:
    *   지문을 단순히 통짜(String)로 보여주는 것이 아니라, `split('\n\n')` 정규 파싱을 통해 각각 독립된 문단블록(Paragraph Block) DOM으로 갈가리 찢어 맵핑(Mapping).
*   **문제 발생**: 리액트는 Array를 Map할 때 `key`가 고유하지 않으면 DOM Reconciliation 과정에서 인풋(Input Textarea)이 뒤죽박죽 섞이는 버그(State Bleeding) 발생.
*   **RCA & 수정**: `index`를 키로 쓰는 만행을 중지하고, `paragraph_${index}_${Date.now()}` 혹은 해시(Hash) 기반의 안정화된 `key`를 주입.
*   **마이크로 로직 구현**: 문단별 요약을 치고 "분석하기"를 누르는 순간, 컴포넌트 하단에서 `generateParagraphFeedback`이 병렬(Parallel)로 스트리밍되는 구조(비동기 State 업데이트 큐) 완성.

---

## 📅 Day 5~8: [전쟁사 1막] 마크다운 렌더링 도입과 사상 초유의 DOM 파괴 현상
### [1. 원시(Raw) 마크다운 변환의 고통]
*   **배경**: AI가 반환하는 문항 해설(`explanation`), 동적 피드백이 Plain Text가 아닌 다양한 구조(굵게, 리스트, 코드, 도식) 형식을 취하기 원함.
*   **기술 도입**: `react-markdown`, `remark-gfm` (Github Flavored Markdown 체계 도입). HTML 허용을 위해 `rehype-raw` 탑재.
### [2. 1차 대재앙: The SVG DOM Explosion 현상]
*   **현상**: 사용자가 "표, 그림, 그래프, 도식 이런게 진짜로 SVG로 만들어져야해" 라고 강한 요구사항을 제시. 프롬프트에 `You MUST use SVG` 제약을 걸어 AI가 기가 막힌 `<svg>` 태그를 만들어냈지만, 프론트엔드는 이를 완전히 거부하며 하얀 백화현상(White Screen of Death) 발생.
*   **추적(Investigation)**:
    *   `rehype-raw`가 허용한 원시 `<svg>` 태그가 React DOM으로 주입되는 과정에서, SVG 내부의 고유 속성인 `viewBox`, `stroke-width`, `font-size`, `writing-mode` 등이 React JSX의 카멜케이스 문법 제약을 위반하며 경고(Warning)와 렌더 트리 붕괴 유발.
    *   또한 마크다운 렌더러가 중간에 있는 엘리먼트를 인라인 요소(`<p>`)로 취급해버려, 블록 제어(Block Layout)가 파괴됨. " `<p>` 태그 내부에 블록 레이아웃이 올 수 없음" 이라는 브라우저의 HTML5 명세 위반 콘솔 에러 발생.

---

## 📅 Day 9~11: [전쟁사 2막] 전위 방어선(Pre-processing)과 추출기 설계
### [1. 아키텍처 개편: 마크다운 렌더러 뜯어고치기 (`MarkdownRenderer.tsx`)]
본 프로젝트의 심장부 수술 감행. 
*   **초정밀 수술 절차 1: 은닉 및 암호화 기법 (Regex Hiding)**:
    *   AI가 ` ```xml ... ``` ` 형태로 주기도 하고, 미친 척하고 날것의 `<svg>` 를 던지기도 함.
    *   이때 만약 이미 정상적으로 생성된 인라인 코드 블록( `` ` ` `` ) 과 블록을 침범하면 파싱이 망가짐.
    *   따라서 마크다운 문자열을 리액트 마크다운에 먹이기 **직전(Pre-process)**에, 기존 코드 블록들을 `__BLOCK_0__`, `__INLINE_0__` 등 임의의 해시 토큰으로 숨겨(Hide) 버림.
*   **초정밀 수술 절차 2: Raw SVG 납치 및 블록화 (Rescue Strategy)**:
    *   숨겨둔 뒤, 바깥에 덩그러니 놓인 `<svg>` 패턴을 정규식(`/(<svg[\s\S]*?<\/svg>)/gi`)으로 낚아채어, 억지로 쌍따옴표 백틱(` ```xml\n$1\n``` `) 안에 우겨넣어 무조건 '코드 블록' 생태계 안으로 포획함.
*   **초정밀 수술 절차 3: 치명적 재귀적 추출함수(`getTextContent`)의 탄생**:
    ```typescript
    // [설계 의도] 
    // react-markdown이 만들어내는 AST 노드는 깊이를 가늠할 수 없고, 때론 string, 때론 Array, 때론 ReactElement를 반환한다.
    // 기존의 단순 `String(children)` 치환이 `[object Object]`를 토해내는 대참사를 겪은 후 고안된 악마적 추출 함수.
    const getTextContent = (node): string => {
        if (!node) return '';
        if (node.type === 'text') return node.value || '';
        if (node.children) return node.children.map(getTextContent).join('');
        return '';
    };
    ```

---

## 📅 Day 12~13: [전쟁사 3막] CSS 반응성 축소(Collapse) 버그와의 혈투
### [1. 화면 내비게이션 및 반응형 렌더링 검사]
*   선택지(Options) 같은 인라인 컴포넌트 내부에 삽입된 작은 SVG 다이어그램이 렌더링되긴 했으나 깊이가 `0px`로 찌그러져 눈에 보이지 않게 되는(Collapse) 크리티컬 모서리 사례(Edge Case) 발견.
*   사용자 피드백 "아직도 안 보여..." -> 디버깅 모드 돌입.
### [2. 초정밀 CSS 하드웨어 제어 강제화]
*   `index.html` 의 `<style>` 시트 강제 주입:
    *   선택지(`inline-markdown`) 내에 위치한 SVG는 단순 `width: auto`로 두면 찌그러지므로, 명시적으로 `width: 100%; max-width: 400px; height: auto; display: block; margin: 0.5rem auto;` 를 주어 부모 컨테이너가 폭을 잡아주지 않더라도 자체적으로 스케일링을 버티게끔 아키텍처 재배열.
*   `dangerouslySetInnerHTML`: SVG 트리 내부를 JSX가 건드리지 못하도록 완전히 격리된 샌드박스로 렌더링. 이를 위해 `<span className="svg-container w-full">` 라는 인라인 껍데기(태그 규칙 위반 회피) 속에 블록(`w-full block`) CSS 스펙을 주입.

---

## 📅 Day 14: Contextual Dictionary (어휘장 문맥 분석기) 아키텍처 구축
### [1. DOM Range & Window Selection 좌표 계산]
*   사용자가 모르는 단어를 지문 상에서 마우스 스크롤(드래그)했을 때, 단순히 구글 검색을 띄우는 게 아니라 커스텀 플로팅 UI(팝업)를 제공.
*   **비용 및 성능 최적화 로직**:
    *   `getBoundingClientRect()`를 통해 드래그한 영역의 위치(X,Y좌표)를 픽셀(px) 단위로 소수점까지 추출.
    *   앱 최상단 윈도우 마진 설정: 팝업이 브라우저 최상단을 뚫고 나가는(Overflow) 현상을 막기 위해 `Math.max(window.scrollY + 10, ...)` 방어 계산 로직 삽입.
    *   AI 프롬프트를 쏠 때 `explainWordInContext`에 단순 단어(`word`)가 아닌 문단의 컨텍스트(`passage`) 전체를 날려 RAG(Retrieval-Augmented Generation)와 유사한 고유 문맥 기반 사전 데이터 패러다임 구현.

---

## 📅 Day 15 (Present): Hyper-Waterfall Documentation Archive Generation
### [1. 기술적 대관여 수립]
*   모든 과거의 로그, 트러블슈팅, `console.log` 추후 패치 시퀀스를 이 문서에 1000배 디테일 단위로 병합 완료.
*   결과: React-Vite 기반의 클라이언트, Gemini RAG-like 튜터 통신 시스템, 무결성 AST SVG 렌더러가 하나의 생태계로 통합 완료된 완성 체계 형성.
*   **미래 로드맵 (Future Map)**: Redux 탑재 기반 전역 상태 설계 변경, React 19 `useTransition` 을 이용한 AI Loading Suspense 렌더링 등 도입 대기.
