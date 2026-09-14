# [Hyper-Waterfall Daily Log] Day 12-14: CSS 강제 반응화 및 플로팅 사전 구축

## 1. 개요
*   **일자**: Day 12 ~ Day 14
*   **임무 1**: 마크다운/SVG 전쟁에서 살아남은 SVG 태그가 화면 밖으로 이탈하거나 소멸(Collapse)하는 레이아웃 붕괴 처리.
*   **임무 2**: 문맥 기반의 단어장 뜻풀이 플로팅 UI(팝업) 구축.

## 2. 모바일 반응형 찌그러짐(Collapse) 사건 방어
### 2-1. 원인 파악 (RCA)
*   완벽하게 추출한 SVG를 렌더링 했음에도 사용자가 "아직도 안 보인다, 선택지 1번 2번에 들어가면 안보여" 라고 리포트!
*   디버그 결과: SVG 컨테이너를 React 에러 방어를 위해 억지로 `div` 대신 `span` (인라인 요소)로 감쌌기 때문. 인라인 내부에 존재하는 폭(Width) 없는 SVG는 0x0 픽셀로 접혀 버리는 브라우저 랜더링 법칙.

### 2-2. 마이크로 CSS 패치 주입 (`index.html`)
*   어떠한 경우에도 도식이 부모 구조에 맞춰 스케일을 찾도록 강압적으로 속성을 메김.
    ```css
    .inline-markdown svg {
        width: 100%;       /* 붕괴 방어선 1 */
        max-width: 400px;  /* 과잉 팽창 방어선 2 */
        height: auto;
        display: block;    /* span 내부에서 강제 블록화 */
        margin: 0.5rem auto;
    }
    ```

## 3. 문맥 사전(Contextual Dictionary) 모달 팝업 구조화
*   **이벤트 바인딩**: `window.getSelection()` API를 활용해 드래그된 단어 인식.
*   **플로팅 좌표 연산**: `selection` 객체의 `getRangeAt(0).getBoundingClientRect()` 을 활용하여 x, y 픽셀 포인트를 추출, 뷰포트 내 특정 위치에 모달창 상태(`dictPopup` State)를 절대좌표(Absolute)로 주입.
*   **엣지 케이스 처리**: 허공을 찍었을 때 버그를 지우기 위해 `useRef` 기반의 Out-click (외부 영역 클릭 시 창 닫힘) 리스너 탑재.
