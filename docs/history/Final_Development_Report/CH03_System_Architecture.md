# [제3장] 시스템 아키텍처 및 프론트엔드 설계 (System Architecture)

## 1. 하이레벨 스택 레이어 (High-Level Stack Layer)
*   **Core**: React 19 (Functional Components) + TypeScript
*   **Builder**: Vite v6 (초고속 HMR 및 압축 번들링)
*   **CSS Engine**: Tailwind CSS v3 (Utility-first, CSS Mesh Gradient 활용)

## 2. 프론트엔드 컴포저빌리티 구조 (Component Architecture)
상태 오염(State Pollution)을 막기 위해 Redux 등 전역 스토어를 강제 배제하고, 철저한 도메인(Pages) 단위 캡슐화를 채택했습니다.

### 2-1. 거대 상태 관리자: `pages/TakeTest.tsx`
*   **상태 정의**: `answers`(사용자 풀이 맵), `mode` (학습/평가 토글), `dictPopup` (단어 사전 좌표계), `paragraphFeedbacks` (AI 문단 평가 스트림 상태).
*   **단방향 바인딩 원칙**: 하위 컴포넌트인 `MarkdownRenderer`나 `QuestionCard` 에는 상태 변경 권한을 주지 않는 순수 함수(Pure Function) 형태로 속성을 주입.

### 2-2. 렌더링 방패: `components/MarkdownRenderer.tsx`
*   단순 파서를 넘어선 최전방 방어막.
*   **의존성 플러그인**: `react-markdown`, `remark-gfm` (표/위젯 지원용), `rehype-raw` (원시 HTML 노드 허용용).
*   **구조적 특징**: AST(추상 구문 트리)가 생성될 때 넘겨받는 Node 객체를 갈가리 찢어, 우리가 허용한 Custom 요소(`pre`, `code` 오버라이딩) 내부에서만 `dangerouslySetInnerHTML` 이 가동되도록 억제하는 모듈.

## 3. 디자인 시스템 (Design System)
*   **색채 규칙**: 주조색 (Brand Indigo 600~700), 배경 (Slate & Zinc의 미니멀리즘 조합).
*   **폰트 시스템**: 가독성을 위한 산세리프체(기본 UI) 및 독해 몰입을 위한 세리프체(지문 본문)의 병행 구조 적용.
