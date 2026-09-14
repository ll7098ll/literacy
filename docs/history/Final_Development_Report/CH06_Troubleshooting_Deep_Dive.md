# [제6장] 핵심 트러블슈팅: 마크다운 렌더링 딥 다이브 (Troubleshooting Deep Dive)

## 1. 챕터 개관: 가장 혹독했던 "마크다운/SVG 전쟁 (The Markdown War)"
본 챕터는 프로젝트의 가용성을 무너뜨렸던 최대 기술 장벽인 'SVG 렌더링 붕괴 파동'에 대한 다중(Multiple) 핫픽스와 RCA(근본 원인 분석)의 기록입니다. 이 시스템(`MarkdownRenderer.tsx`)의 복구 기록은 향후 본 프레임워크 유지보수의 성서(Charter) 역할을 합니다.

## 2. RCA-1. 원시 HTML 거부 현상 (`rehype-raw` 도입)
*   **증상**: AI가 만들어낸 아름다운 SVG 도식이 단순히 마크다운 내에서 실종(Blank)됨.
*   **수복 과정**: `react-markdown`이 기본적으로 HTML 요소를 무시하기 때문임을 판단, `rehype-raw`를 장착함. 허가 후 일차적으로 SVG 요소가 DOM 트리에 접근 시도함.

## 3. RCA-2. The DOM Explosion (블록 in 인라인 에러)
*   **증상**: `rehype-raw` 로 인해 태그가 통과하자, React 브라우저 렌더러가 미친듯이 콘솔 에러를 뱉으며 앱을 파괴. 레이아웃 붕괴.
*   **근본 원인**: `react-markdown` 내부 파싱 로직에서, 일반 줄글 안의 HTML(SVG)을 `p` 태그(인라인 요소)로 감싸버림. HTML5 표준 규칙상 인라인 태그 내부에 블록 레이아웃(div 등)이 들어가는 것은 금기되며 이를 브라우저 트리가 스스로 찢어버린 것임.
*   **수복 과정**: 렌더링 래퍼를 `div` 대신 `<span className="block">` 형태로 교채. 인라인 요소라는 명분을 유지하되 블록처럼 동작하게 해 HTML5 컴플라이언스를 우회 방어.

## 4. RCA-3. AST 파싱 노드 미아 상태 (The Recursion Patch)
*   **증상**: 정형화된 처리를 위해 SVG를 코드블록(`code`, `pre`)으로 가로챘으나, 정작 SVG 텍스트 데이터 추출 단계에서 `[object Object]` 라는 괴이한 문자열로 치환됨.
*   **근본 원인**: `children` 노드 객체가, AI가 얼마나 복잡하게 마크다운을 만드냐에 따라 string으로, Array로, 심지어 React 객체 컴포넌트로 변화무쌍하게(Dynamic) 전달되고 있었음.
*   **수복 과정 (Absolute Fix)**: 
    ```typescript
    // 지옥의 어떤 중첩된 트리가 오더라도 바닥선까지 내려가서 문자열 조각들을 발굴해내는 추출 합수
    const getTextContent = (node): string => {
      if (!node) return '';
      if (node.type === 'text') return node.value || '';
      if (node.children) return node.children.map(getTextContent).join('');
      return '';
    };
    ```

## 5. RCA-4. Scale Collapse (모바일 CSS 찌그러짐 현상 극복기)
*   **증상**: 고난을 뚫고 렌더링을 성공시켰으나, 객관식 선택지 내부 등 '좁은 영역(인라인)'에 삽입된 SVG 구조들이 허공에 떠서 `0x0px`로 공간을 잃어버리는 현상. 폭(Width)을 할당받지 못한 빈 SVG 태그.
*   **수복 과정**: 하드웨어 가속 및 형상 복원(Scaling Factor Recovery) CSS 강제 패치 도입 (`index.html`).
    ```css
    .inline-markdown svg {
        width: 100%;       /* 형체 복원 */
        max-width: 400px;  /* 모바일/PC 폭주시 디멘션 락업 방어 */
        height: auto;
    }
    ```
