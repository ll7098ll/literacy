# [Phase 2] 시스템 설계 및 아키텍처 (System Architecture & Design)

## 1. 하이레벨 아키텍처 (High-Level Architecture)
본 시스템은 Client(React SPA), Backend-as-a-Service(Firebase), 그리고 AI(Gemini API)의 3-Tier에 준하는 구조를 가집니다.

1.  **View Layer (React Components)**: `TakeTest`, `ReviewTest`, `VocabularyList` 등 사용자 경험 담당.
2.  **Service Layer**: `geminiService.ts` 를 통해 Prompting 로직 파편화 방지 및 AI 통신 캡슐화.
3.  **Data Layer**: Firebase Firestore 기반 사용자 응답, 단어장, 피드백 세션 저장.

## 2. 렌더링 파이프라인 구조도 (Rendering Pipeline)
가장 핵심 설계인 **마크다운 동적 렌더링 모듈 (`MarkdownRenderer.tsx`)** 의 구조입니다. AI의 환각(Hallucination) 또는 불특정 포맷 출력에 대응하는 방어적 설계입니다.

```mermaid
[AI 생성 텍스트 (Markdown + SVG + GraphData)] 
   => { Pre-processing 단계 }
        1. 기존 코드 블록 은닉화 (__BLOCK__, __INLINE__)
        2. Raw <svg> 태그 탐색 및 강제 코드 블록화 (```xml ... ```)
        3. 은닉화된 코드 블록 복원
   => { React-Markdown 파싱 AST }
        - remark-gfm (테이블, 삭제선 등 플러그인)
        - rehype-raw (HTML 기반 태그 허용)
   => { Custom Component Mapping }
        [code 컴포넌트]
           -> 자식 노드 순회 (getTextContent)
           -> JSON/GraphData 인지 판별 -> `<GraphRenderer />`로 분기
           -> SVG 인지 판별 -> `dangerouslySetInnerHTML` 기반 `<span>` 으로 분기
        [pre 컴포넌트]
           -> code 컴포넌트가 처리하지 못한 중첩 SVG 직접 분기 렌더링
   => [최종 DOM/UI 렌더링]
```

## 3. UI/UX 디자인 시스템 설계
*   **Color Palette**: 브랜드 컬러(Indigo/Brand), 중립 컬러(Slate 계열) 기반 하이라이팅 설계.
*   **Typography**: `font-sans`(Pretendard) 기반 시스템, 독해 지문의 가독성을 위한 `font-serif`(Noto Serif KR) 혼용 적용.
*   **Layout 컴포넌트화**: Tailwind 기반의 Container, Form, Feedback Bubble 등의 디자인 모듈 식별 및 일관된 간격(Spacing) 활용.
