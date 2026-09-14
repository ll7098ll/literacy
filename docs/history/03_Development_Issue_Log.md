# [Phase 3] 릴리스 및 마일스톤 개발 로그 (Development Issue Log - Extended)

## 1. 개요
본 문서는 단순한 기록을 넘어, 프로젝트의 생명 주기를 스프린트 단위로 세분화하고 각 단계별로 어떤 치열한 로직 수정이 있었는지 상세히 추적합니다.

## 2. Spring 1: 기반 아키텍처 및 평가 엔진 설계
*   **목표**: React Vite 기반의 SPA 설정 및 Gemini API 연동 모듈화.
*   **주요 작업**:
    *   `src/services/geminiService.ts` 기초 생성. 싱글톤 패턴이 아닌 비동기 함수 모음 집합으로 구성.
    *   `src/types.ts`에서 시스템 전반의 타입 정의 (`Question`, `Passage`, `TestSet`).
*   **이슈 및 해결**:
    *   Gemini API 속도 지연 문제 발생. 비동기 호출 시 UI가 멈추어 보이는 현상을 막기 위해 전역 로딩 스피너(`components/Spinner.tsx`) 개발 선행.

## 3. Sprint 2: 인터랙티브 학습 뷰 통합 (`TakeTest.tsx`)
*   **목표**: 단순히 문제를 주고 받는 화면을 넘어, '문단별 쪼개기(Learning Mode)' 등 고도의 상태 관리를 요하는 UI 구축.
*   **주요 작업**:
    *   `mode: 'learning' | 'test'` 상태 전환 토글 구현.
    *   지문 텍스트 내에서 개행(`\n\n`)을 인식하여 독립된 문단 컴포넌트로 분리 렌더링.
    *   문단 하단에 `<textarea>`를 배치, `handleParagraphSummary` 함수 바인딩.
*   **이슈 및 해결**:
    *   **의존성/리렌더링 문제 (Re-render Hell)**: 문단 입력창에 글자를 칠 때마다 전체 지문이 리렌더링되는 문제 발생.
    *   해결: React의 하위 컴포넌트 분리 및 `useState`의 로컬화 진행 (혹은 상단 `Record` 객체를 통한 안전한 `onChange` 핸들링 수립).

## 4. Sprint 3: 사전 & 어휘장 통합 (Contextual Dictionary)
*   **목표**: 모르는 단어를 클릭했을 때 문맥 맞춤형 뜻이 노출되는 모달 구현.
*   **주요 작업**:
    *   `window.getSelection()`을 감지하여 `onMouseUp` 이벤트에 드래그된 단어를 추출하는 이벤트 리스너 구성.
    *   마우스 위치(x, y)를 추출하여 팝업이 드래그된 텍스트 바로 아래 뜨도록 **Floating UI** 로직 구현.
*   **이슈 및 해결 (Edge Cases)**:
    *   **드래그 취소 인식 버그**: 허공을 클릭해 `getSelection().toString()`이 비어있음에도 팝업이 계속 유지되는 버그.
    *   해결: `useEffect` 이벤트 리스너에서 클릭 대상이 팝업 `ref` 바깥일 경우 상태(`dictPopup`)를 명시적으로 초기화하도록 `handleClickOutside` 방어 코드 삽입.

## 5. Sprint 4: 대테러 방어 - 무결점 마크다운 렌더링 구축 (The Markdown War)
*   프로젝트 개발 기간 중 **가장 길고 험난했던 트러블슈팅** 구간.
*   **문제 요약**: AI가 생성한 표, 그림, 차트(SVG)가 문자열로만 파싱되거나, CSS가 깨지며 DOM 트리를 파괴하는 대재앙 발생.
*   *(상세한 전개 과정 및 코드 단위 분석은 `08_Troubleshooting_History_Deep_Dive.md` 문서로 분리하여 집중 서술함)*.

## 6. 결언
현재 버전은 모든 마일스톤이 통합 완료되었으나, 기능의 복잡도 팽창으로 컴포넌트 생명주기가 무거워진 상황입니다. 차기 마일스톤에서는 Redux 또는 Zustand를 활용한 전역 상태 분리와 메모이제이션(`useMemo`, `useCallback`) 최적화가 필수적입니다.
