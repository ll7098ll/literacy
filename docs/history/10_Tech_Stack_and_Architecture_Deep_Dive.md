# 10. 기술 스택 및 아키텍처 딥 다이브 (Tech Stack & Architecture Deep Dive)

## 1. 기술 스택 명세서 (Tech Stack Specification)

본 시스템은 최신 프론트엔드 생태계와 서버리스 아키텍처를 결합하여 구성되었습니다.

### 1-1. 코어 엔진 (Core Engine)
*   **프레임워크**: React (Functional Component, Hooks 중심) + TypeScript
*   **빌드 도구**: Vite (HMR 및 압도적인 번들링 속도 최적화)
*   **패키지 매니저**: npm

### 1-2. UI/UX 및 시각화 (UI & Visualization)
*   **스타일링**: Tailwind CSS v3 (유틸리티 퍼스트 기반, 무거운 CSS-in-JS 배제)
*   **아이콘 시스템**: Lucide React (가벼운 벡터 아이콘 채택)
*   **데이터 차트**: Recharts (막대, 원형 등 AI 모델이 반환하는 JSON 형태의 GraphData 렌더링)
*   **컴포넌트 동작**: 자체 제작된 Tooltip, Modal, Floating UI

### 1-3. 마크다운 렌더링 파이프라인 (Markdown/Content Rendering)
*   **코어 파서**: `react-markdown` (마크다운 기반 텍스트 DOM 스캐폴딩)
*   **서브 플러그인**: 
    *   `remark-gfm`: GitHub Flavored Markdown (표, 취소선, URL 자동 변환)
    *   `rehype-raw`: 원시 HTML(SVG 구문)을 React AST(Abstract Syntax Tree)로 허용

### 1-4. 백엔드 및 인프라 (Backend & Infrastructure)
*   **Authentication**: Firebase Auth (Google OAuth 2.0 팝업 로그인)
*   **Database**: Firebase Firestore Enterprise (NoSQL, 실시간 스냅샷 및 보안 규칙 적용)
*   **AI Engine**: Google Gemini API (`@google/genai` SDK 패키지)

---

## 2. 하이레벨 동작 구조도 (How It Works)

전체 시스템이 어떻게 유기적으로 동작하는지 나타내는 아키텍처 티어(Tier)별 역할 및 흐름입니다.

### [Step 1: Client & State Management (View Layer)]
*   **사용자 인터랙션 발생**: 사용자가 학년/난이도를 선택하고 "시험 시작" 클릭 (`TakeTest.tsx`)
*   **지연 렌더링 방어**: React 상태(`loading`, `loadingStep`)가 업데이트되며 `Spinner`가 렌더링되어 사용자의 이탈을 방어함.

### [Step 2: Business Logic & External Service (Service Layer)]
*   **AI 호출 파이프라인**: 
    *   `src/services/geminiService.ts` 의 `generateTestSet` 함수 호출.
    *   입력된 파라미터가 시스템 프롬프트(System Instruction)에 주입되어 구글 클라우드의 Gemini 서버로 전송.
*   **데이터 멸균 (Data Sterilization)**: 
    *   Gemini가 반환한 Response 중 순수 JSON만을 추출하는 정규식 파이프라인(Clean-up) 통과.
    *   TypeScript 인터페이스(`TestSet`, `Passage`, `Question` 등) 타입 캐스팅.

### [Step 3: Rendering Pipeline (AST & DOM Layer)]
*   **콘텐츠 매핑**: 받아온 데이터가 다시 `TakeTest.tsx`의 상태(`passage`, `questions`)에 꽂힘.
*   **렌더러 방어막 가동 (`MarkdownRenderer.tsx`)**:
    *   전처리: 날 것의 `<svg>` 태그 등을 찾아 코드 블록으로 치환.
    *   AST 파싱: React Markdown이 노드 트리를 만들 때, `getTextContent` 함수가 재귀적으로 호출되며 HTML 오류를 자체 수복함.
*   **화면 송출**: 완벽하게 다듬어진 UI와 도식(SVG)이 React Virtual DOM을 거쳐 브라우저에 페인팅됨.

### [Step 4: Persistence & Database (Storage Layer)]
*   **상태 저장**: 사용자가 모르는 단어를 클릭하여 문맥 사전을 보고, "저장" 버튼 클릭.
*   **Zero-Trust DB 검증**: Firebase SDK 커넥터가 Firestore로 접근. `firestore.rules` (보안 규칙)가 이 사용자의 UID와 저장하려는 Collections 경로(`/users/{uid}/vocabulary`)가 일치하는지, 데이터 타입이 안전한지 검사한 뒤 최종 저장 승인.
