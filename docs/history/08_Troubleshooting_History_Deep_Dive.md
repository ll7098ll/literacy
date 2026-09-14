# [Phase 4] 딥 다이브: 무결점 마크다운/SVG 렌더러 복구기 (Troubleshooting History Deep Dive)

## 1. 서막: 무너진 렌더링 파이프라인
프로젝트 개발 중, "모든 표와 수학적 도식은 SVG로 만들어져야 한다"는 강력한 비즈니스 요구사항(FR)이 존재했습니다. Gemini AI는 지시에 따라 놀랍도록 정교한 SVG 코드를 생성해 냈으나, 프론트엔드의 `React Markdown` 라이브러리는 이 코드를 정상적인 DOM 구조로 소화시키지 못했습니다.

이 섹션은 단일 컴포넌트(`MarkdownRenderer.tsx`)에 대한 5차례 이상의 에스컬레이션과 핫픽스(HotFix)를 적용한 그 치열한 기록입니다.

## 2. 1차 붕괴: 원시 HTML 렌더링 거부
*   **현상**: ` ```xml <svg>...</svg> ``` ` 형태의 코드블럭이 아닌, 마크다운 본문에 `<svg>` 태그가 날것(Raw HTML)으로 들어올 때, 화면에 아예 노출되지 않거나 DOM에서 증발함.
*   **1차 패치 원리**: `rehype-raw` 플러그인 도입. 마크다운 내 HTML 요소를 구문 분석하게 허용.
*   **결과**: 실패. `rehype-raw`가 허용은 했으나, React의 `children` 파싱 방식 때문에 SVG 내부의 수많은 속성들(e.g., `writing-mode`, `viewBox`, `stroke-width`)이 JSX의 카멜케이스(CamelCase) 규칙에 위배된다며 콘솔 에러 폭탄 투하.

## 3. 2차 붕괴: DOM 중첩 규칙 위반 (블록 in 인라인)
*   **현상**: 간간히 SVG가 보이긴 했으나, 화면 레이아웃이 박살남.
*   **추적 (RCA)**:
    1.  마크다운 파서는 일반 텍스트 문단 내부의 코드(` `<svg>` `)를 인라인 컴포넌트로 판단해 `<p>` 태그 안에 집어넣음.
    2.  그러나 SVG 렌더링을 위해 우리가 덮어씌운 래퍼는 `<div className="svg-container">` 였음.
    3.  **HTML5 표준 규칙**: `<p>` 태그 안에는 블록 레벨 요소(`<div>`)가 올 수 없음! 
    4.  브라우저 엔진이 이 구조를 강제로 찢어버리면서, DOM 트리가 박살나고 UI가 완전히 깨져버림.
*   **2차 패치**: 
    모든 `div` 래퍼를 `<span className="svg-container block w-full">` 로 교체. `span` 이라는 껍데기(인라인)를 쓰면서 CSS로 블록처럼 동작하게 하여 브라우저 강제 종료를 회피.

## 4. 3차 붕괴: AST 트리 내 데이터 실종 스캔들
*   **현상**: 사용자가 거듭 "아직도 SVG가 안보여 ㅠㅠ" 라며 치명적 결함(Critical Bug) 리포팅 제기.
*   **추적 (RCA)**:
    1.  React Markdown이 AST(Abstract Syntax Tree)를 파싱할 때, `pre` 와 `code` 오버라이딩 컴포넌트로 전달되는 `node` 객체의 깊이가 상황마다 달랐음.
    2.  어쩔 때는 `node.children[0].value` 에 SVG 텍스트가 있었고, 어쩔 때는 텍스트 대신 하위 자식 노드가 중첩 배열로 존재했음.
    3.  단순한 `String(children)` 치환으로 이를 얻으려 했으나, 컴포넌트 객체가 넘어가며 `[object Object]` 문자열이 토해짐. 결국 정규식 검사가 실패함(Match fail).
*   **최종 해결 아키텍처 (The Absolute Fix)**:
    ```typescript
    // 어떠한 깊이, 어떠한 중첩된 객체가 오더라도 순수 텍스트만을 강제로 긁어오는 괴물 함수 구축
    const getTextContent = (node) => {
      if (!node) return '';
      if (node.type === 'text') return node.value || '';
      if (node.children) {
        return node.children.map(getTextContent).join('');
      }
      return '';
    };
    ```
    이 함수를 `pre`와 `code` 블록 내부 가장 앞단에 배치하여, AI가 어떤 깊이로 트리를 구성해 반환하든 SVG 문자열을 확보 가능하도록 절대적 방어망 구축 완료.

## 5. 4차 붕괴: 모바일 환경 SVG Collapse 제로화 (Zero Collapse)
*   **현상**: 텍스트 추출까지 완벽하게 추출하고 `dangerouslySetInnerHTML`로 주입했으나, 1~5번 선택지(`inline={true}`) 내의 작은 SVG 다이어그램들이 `0x0px`로 찌그러져 렌더링 불가.
*   **추적 (RCA)**: 
    선택지 요소의 크기가 유동적이어서, Width/Height 속성을 달지 않고 날아온 AI SVG 모델은 부모가 너비를 강제해 주지 않으면 스스로 넓이를 찾지 못함.
*   **CSS 강제 패치**:
    ```html
    <style>
      .inline-markdown svg {
        width: 100%;           /* 찌그러짐 방제 핵심코드 1 */
        max-width: 400px;      /* 찌그러짐 방제 핵심코드 2 */
        height: auto;
        display: block;        /* 선택자 옆에 오도록 블록 정렬 */
        margin: 0.5rem auto;
      }
    </style>
    ```

## 6. 결론 (Summary & Lessons Learned)
마크다운 렌더러에 대한 이 길고 혹독했던 트러블슈팅을 통해, **"외부 API(AI) 출력값은 어떠한 경우에도 신뢰할 수 없는 날 것(Raw)의 입력 공격성 페이로드로 간주하고 컴포넌트 최전방에서 모든 엣지 케이스를 강제로 정예화 한 뒤에야 하위 렌더링을 허용한다"** 는 하이퍼 워터폴의 가장 중요한 보안/검증 철학이 탄생했습니다.
