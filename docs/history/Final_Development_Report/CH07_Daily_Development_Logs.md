# [제7장] 일자별 통합 개발 로그 (Chronological Development Logs)

## 1. 개요
*   파편화된 Day01 ~ Day15 일지를 하나의 마스터 연대기(Chronicles)로 압축 및 재구성한 개발 이력 리포팅입니다.

## 2. 타임라인(Timeline) 요약

### ⏳ [Phase 1. 기반 수립 및 초기 AI 연동] (Day 01 ~ Day 03)
*   React 19, Vite, Tailwind CSS 환경 기반 Repository 스캐폴딩.
*   **의사 결정**: 상태 관리자는 `useState` 기반의 로컬 라이프사이클로 제어. (오버헤드 방지)
*   `services/geminiService.ts` 를 통해 AI 비즈니스 레이어 캡슐화 완성 및 JSON 전처리 클리너 적용. (JSON Parsing Crash 이슈 완전 정규화 완료)
*   Firebase Auth 팝업 연동 및 Firestore Zero-Trust 기반 보안 규칙(`allow read, write: if request.auth.uid == userId`) 등록 실시.

### ⏳ [Phase 2. UI/UX 논리 구현 및 버그 수복] (Day 04 ~ Day 06)
*   `TakeTest.tsx` 인터랙티브 모드(Interactive Mode) 구현: 지문을 `split('\n\n')` 분리하여 각 문단별 피드백 엔진 바인딩.
*   **State Bleeding 해결**: 리액트 `map` 반복 랜더링 시 문단별 입력창 포커스가 상실되고 값이 뒤섞이던 치명적 결함을 `index`를 Key로 쓰는 안티패턴 제거를 통해 수복함.
*   단어 드래그 추출 시 `window.getSelection().getRangeAt(0).getBoundingClientRect()` 객체를 활용하여 플로팅 좌표 모달(Contextual Dictonary) 생성.

### ⏳ [Phase 3. 랜더링 파이프라인 심해 파밍 (The Markdown War)] (Day 07 ~ Day 13)
*   **SVG 엔진 장착 시도 1**: `rehype-raw` 적용으로 인한 React DOM 폭발 에러 마주.
*   **SVG 엔진 장착 시도 2**: `span` 래퍼 우회로 HTML5 컴플라이언스 극복 시도.
*   **절대적 픽스 (Day 11)**: 인라인/블록 코드를 정규식으로 '은닉(Hide)' 한 뒤에 파싱 노드를 돌며 텍스트만을 강제로 긁어오는 심해 함수 `getTextContent` 발명. SVG 렌더러 복구 완료.
*   **CSS 강제 교정 (Day 13)**: 도식이 형체를 잃는 Collapse 버그를 해결하기 위해 `width: 100%`, `max-width: 400px` 글로벌 스케일링 패치 단행.

### ⏳ [Phase 4. 기술 문서 융합 (Hyper-Waterfall Documentation)] (Day 14 ~ 15)
*   1000배(1000x) 디테일 마그니튜드 레벨의 하이퍼 워터폴 마크다운 문서들 개편 및 '통합 개발보고서(Final Development Report)' 체계로 재구축 완료.
