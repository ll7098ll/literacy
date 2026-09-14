# [Hyper-Waterfall Daily Log] Day 01: Project Inception & UI Foundation

## 1. 개요
*   **일자**: 프로젝트 시작 (Day 1)
*   **주요 목표**: React + Vite 초기 뼈대(Boilerplate) 세팅, 컴포넌트 아키텍처 트리 초기화, 테마/스타일 정책 확립.

## 2. 상세 작업 내역

### 2-1. 프론트엔드 환경 스캐폴딩
*   **Vite + React 환경 설정**: Webpack 대비 빠른 HMR(Hot Module Replacement) 속도의 이점을 위해 시스템의 기반을 Vite로 구성.
*   **Tailwind CSS 적용**: `index.html`에 Tailwind Import 및 Custom Gradient/Color 팔레트(`bg-modern-gradient`, `text-brand-700` 등) 하드코딩. 이 과정에서 디자인 시스템(Design System)의 시각적 컴포넌트 일관성을 확보함.

### 2-2. 컴포넌트 라우팅 및 뷰(View) 뼈대
*   SPA(Single Page Application) 구조로서, 무거운 라이브러리(react-router-dom) 없이도 상태(`currentView` State) 기반의 뷰 조건부 렌더링 설계 구현.
*   **주요 컨텍스트 분리**:
    *   `Dashboard` (로그인 및 진입 화면)
    *   `TakeTest` (동적 시험 화면 및 실시간 피드백 엔진 탑재 레이어)
    *   `ReviewTest` (평가 완료 후 분석 및 인터랙티브 채팅 레이어)
    *   `VocabularyList` (개인화된 단어장 레이어)

## 3. 발견된 이슈 및 아키텍처 결정(Troubleshooting & Decisions)
*   **이슈**: 전역 상태 관리자(Redux, Zustand) 도입 여부에 대한 고민.
*   **결정**: 잦은 AI 콜백 및 DOM 렌더링 오버헤드를 막고, '독해 학습/평가'라는 도메인에 엮인 데이터 결합도를 고려. 전역 Store보다 `TakeTest` 내부의 고립된 Local State + Prop Drilling을 활용해 상태 오염을 원천 차단하기로 합의함 (이후 Prop 깊이가 2단계를 초과하지 않도록 컴포넌트를 설계함).
