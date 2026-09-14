# [Hyper-Waterfall Daily Log] Day 09-11: [마크다운 대전쟁 제2막] AST 파서와의 혈전

## 1. 개요
*   **일자**: Day 09 ~ Day 11
*   **주요 작업**: 지난 주차에 발생한 격리 렌더링 시도를 완성하기 위한 컴포넌트 재작성. `MarkdownRenderer.tsx` 초정밀 수술 집도.

## 2. 초정밀 조치 파이프라인 (The Absolute Fix)

### 2-1. 은닉 및 복구 메커니즘 구축 (Regex Hiding)
*   **이슈**: 마크다운 중간에 덜그러니 떨어진 태그(` <svg> `)를 코드 블록으로 치환시키려 온갖 정규식을 썼더니, 이미 AI가 예쁘게 감싸놓은 백틱(```xml) 인라인 블록까지 헤집어놓아 마크다운 자체가 깨짐.
*   **조치**: 마크다운 렌더링 직전에 '사전 전처리(Pre-processing)' 단계 강제.
    1.  정상적인 인라인 코드와 블록 코드를 찾아내어 `__BLOCK_1__` 이라는 임시 해시로 바꿔치기(은닉).
    2.  이후 바깥에 떠도는 야생의 SVG를 억지로 백틱(```xml) 안에 가둠.
    3.  `__BLOCK_1__` 해시를 다시 원래 스크립트로 환원(복구).

### 2-2. `getTextContent`의 발명 (AST 구원자)
*   **이슈**: `code` 컴포넌트 내부에서 `node.children` 을 문자열로 바꿔 SVG를 추출하려 했으나, 트리 파서가 자식 노드를 배열(Array), 심지어 React 객체 컴포넌트로 뒤죽박죽 넘기는 바람에 정규식 매칭 대상이 `[object Object]`로 변해버리는 끔찍한 버그 발현.
*   **조치**: 재귀 함수 `getTextContent` 도입.
    ```typescript
    const getTextContent = (node): string => {
      if (!node) return '';
      if (node.type === 'text') return node.value || '';
      if (node.children) return node.children.map(getTextContent).join('');
      // 어떠한 깡통, 배열, 객체가 오더라도 문자열만을 기필코 추출해낸다.
      return '';
    };
    ```
    이 함수가 도입된 날, `MarkdownRenderer`는 AI의 어떠한 이상 포맷의 마크다운이라도 불도저처럼 갈아 마시며 추출해낼 수 있는 '무적'에 가까운 내구성을 지니게 되었음.
