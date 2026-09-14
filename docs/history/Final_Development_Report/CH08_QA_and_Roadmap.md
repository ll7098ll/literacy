# [제8장] 품질 보증(QA) 및 향후 로드맵 (QA & Roadmap)

## 1. 품질 보증 시나리오 (QA Test Cases & Results)
현재 시스템의 견고함(Robustness)을 판단하기 위한 핵심 단위 통합 테스트 세트입니다.

*   **TC01: JSON 훼손 내성 테스트 (Resilience Test)**
    *   상황: Gemini API가 `Here is json \n \`\`\` { ... }` 같이 훼손된 포맷을 반환함.
    *   기대 결과: 내부 정규식이 오염을 차단하고 500 에러를 방지함.
    *   결과: **✅ PASS** (99% 파싱 오류 통제)
*   **TC02: 다크 모드/모바일 뷰 반응성 테스트 (Responsive UI)**
    *   상황: 모바일 뷰(width: 390px) 환경에서 문제 내의 SVG 차트 렌더링 확인.
    *   기대 결과: 선택지 영역 밖으로 이미지가 탈출하지 않으며 적절한 비율 축소 유지.
    *   결과: **✅ PASS** (max-width CSS Control)
*   **TC03: 보안 고립(Isolation) 테스트**
    *   상황: 인위적으로 Client Token의 UID 속여 다른 유저의 단어장(`/vocabulary`) Endpoint 호출.
    *   기대 결과: Firebase Firestore단에서 403 Permission Denied 강제 발생.
    *   결과: **✅ PASS** (Firebase Rules Validation)

## 2. 해결되지 않은 기술적 부채 (Technical Debt)
1.  **동기적 콜백 지연(Synchronous Latency Waiting)**
    전체 지문이나 문항 생성 시 API 콜 대기 시간이 5~8초 소요. 추후 Streaming(Web Socket 기반 Chunk 처리) 데이터 바인딩 로직을 도입하여 로딩 중에도 첫 줄부터 읽어나갈 수 있는 UX 개편 선점이 요구됨.
2.  **모놀리식 상태 컨테이너 (Monolithic State)**
    `TakeTest` 컴포넌트가 너무 많은 비즈니스 로직(채점, 상태전환, 사전팝업제어)을 껴안고 있어 컴포넌트 라이프사이클 비대화 발생 중성.

## 3. 차기 버전 (v2.0) 마일스톤
1.  **Redux Toolkit (RTK) 또는 Zustand 도입**: 전역 스토어를 도입해 어휘장 상태 비동기 관리 및 UI/API 결합도 리팩토링.
2.  **React Suspense + Error Boundary 체계**: Spinner 의존도를 낮추고 React 19의 Concurrent 모드로 랜더링 우선순위(Priority) 스케줄링.
3.  **사용자 통계 대시보드 강화**: 사용자가 지금까지 틀렸던 문항들만 추출한 'RAG 기반 AI 재구성 테스트(Re-Test)' 프롬프트 서비스 신설.
