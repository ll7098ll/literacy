# [Phase 3] 딥 다이브: 컴포넌트 아키텍처 및 컴포저빌리티 분석 (Detailed Component Architecture)

## 1. 컴포넌트 트리 및 상태(State) 생명주기
React 기반 프론트엔드는 도메인별 거대 페이지 패턴(Pages)과 재사용 가능한 컴포넌트 패턴(Components)으로 분리되었습니다. 

### 1-1. `pages/TakeTest.tsx` (평가 및 학습 엔진의 심장)
모든 사용자 인터랙션(문항 풀이, 문단 읽기, 단어 뜻 검색, AI 피드백 스트리밍)을 관장하는 거대 상태 관리 컴포넌트.

*   **핵심 State 설계**:
    *   `answers: Record<string, string>`: 사용자의 선택지 데이터를 저장한다. (고립된 불변성 유지)
    *   `mode: 'learning' | 'test'` : 현재 UI가 단순 텍스트 렌더링 모드인지, 문단별 쪼개기 학습 모드인지 판단한다.
    *   `dictPopup`: 단어 사전 검색 시 뜨는 팝업 UI의 좌표(x, y)와 위치, 그리고 AI 추출 의미(meaning) 상태를 관리한다.
    *   `paragraphFeedbacks`, `paragraphGuides`: AI와의 비동기 통신으로 받아온 지문/문단별 해설 상태.

*   **주요 렌더링 로직 (Conditional Rendering)**:
    *   지문을 순회(`split('\n\n')`)하여, 각 문단을 Map으로 분해한다.
    *   학습 모드(`mode === 'learning'`)일 때만, 각 문단 블록 하단에 **Interactive Input Field**를 주입한다. 
    *   여기서 가장 중요한 `MarkdownRenderer` 에 `content={para}` 를 주입하여, 문단 내 도식이 있을 시 개별 렌더링 가능하도록 처리한다.

### 1-2. `components/MarkdownRenderer.tsx` (렌더링 최전선 방어 체계)
수 백번의 패치(Patch)가 일어났던 단일 컴포넌트이자 프로젝트 아키텍처의 핵심(Core) 모듈입니다.

*   **역할**: 단순 텍스트 -> React-Markdown 파싱 AST 트리 생성 -> Custom Handler 로 렌더링.
*   **메커니즘 (딥 다이브)**:
    1.  **Regex Hiding (은닉 기법)**: 이미 ` ``` ` 로 감싸진 정상 코드 블록과 인라인 코드가 후속 전처리 때문에 훼손되지 않도록 `__BLOCK_0__`, `__INLINE_0__` 이라는 특수 토큰으로 치환하여 맵(blocks)에 저장한다.
    2.  **Raw SVG Rescue (구출 기법)**: 마크다운 중간에 덩그러니 놓인 `<svg>...</svg>` 를 정규식으로 잡아내, 억지로 `\n```xml\n$1\n```\n` 형태로 감싸 코드 블록화시킨다. (rehype-raw의 버그 회피)
    3.  **Restore (복원 기법)**: 다시 저장해 두었던 특수 토큰을 원래 코드로 복원한다.
    4.  **`getTextContent` 재귀 파싱**: 
        ```typescript
        const getTextContent = (node) => {
          if (!node) return '';
          if (node.type === 'text') return node.value || '';
          if (node.children) return node.children.map(getTextContent).join('');
          return '';
        };
        ```
        이 극한의 유틸리티 펑션을 통해 파서가 트리를 어떻게 뒤틀어 놓더라도 문자열 데이터를 찾아낸다.
    5.  **DangerouslySetInnerHTML 방어선**: 최종적으로 파싱된 SVG는 `<span className="svg-container w-full" dangerouslySetInnerHTML={{ __html: svgContent }} />` 형태로 격리되어 XSS를 방어(최소화)하고 DOM 에러를 피한다.

### 1-3. `pages/ReviewTest.tsx` (결과 분석 뷰)
*   틀린 문항만을 모아볼 수 있게 필터링 로직 구현.
*   틀린 문항 하단에는 단순히 해설만 제공하지 않고, 사용자 전용 **AI Tutor 채팅 인터페이스** (Input + Chat Bubble UI)를 마운트하여 실시간 문답을 나눌 수 있도록 함.

## 2. 모듈간 의존성 (Dependencies)
*   `TakeTest.tsx` -> `geminiService.ts` (API 호출 의존성)
*   `TakeTest.tsx` -> `MarkdownRenderer.tsx` (렌더링 의존성)
*   **단방향 데이터 흐름을 철저히 준수하여**, 자식 컴포넌트인 `MarkdownRenderer`는 부모의 상태를 절대 변경하지 않는 Pure Function의 속성을 가집니다.
