# [Hyper-Waterfall] 마스터 인덱스 및 프로젝트 헌장 v2.0 (Master Index & Project Charter)

## 1. 프로젝트 개요 및 선언문 (Project Charter)
*   **프로젝트 공식 명칭**: AI 기반 문해력 평가 및 인터랙티브 학습 시스템 (Interactive Literacy Evaluation AI System)
*   **개발 철학**: **하이퍼 워터폴(Hyper-Waterfall)**
    *   **"남겨지지 않은 코드는 존재하지 않는 것이다(No code exists without documentation)"** 라는 철학 아래, 요구사항 분석부터 설계, 구현, QA, 트러블슈팅에 이르는 모든 단계를 마이크로(Micro) 단위로 해체하여 기록합니다.
    *   단 한 줄의 CSS, 단방향 데이터 바인딩, 컴포넌트 렌더링 파이프라인의 변경 사항도 수 백 페이지 분량의 문서를 통해 추적 및 통제 가능하도록 설계되었습니다.
*   **프로젝트 목표**:
    1.  학습자의 학년/수준에 따른 동적 지문 및 문항 생성.
    2.  학습자의 독해 과정을 실시간으로 추적하여 제공되는 문단별(Paragraph) 및 문항별 인지적 피드백 제공.
    3.  마크다운, 도식(SVG), 차트 등 복합 멀티모달 데이터를 예외 없이 렌더링하는 무결점 클라이언트 환경 제공.

## 2. 하이퍼 워터폴 공식 문서 체계 (Master Document Index)
이 문서는 프로젝트의 모든 히스토리와 엔지니어링 결정 사항을 집대성한 내비게이터입니다.

### Phase 1. 기획 및 요구사항 명세 (Requirements & Definitions)
*   [01. 기능적 & 비기능적 요구사항 명세서 (FR/NFR)](./01_Requirements_Specification.md)
    *   최종 사용자 경험, 엣지 케이스 처리 요구사항 총체적 정의.

### Phase 2. 시스템 아키텍처 및 데이터베이스 설계 (System & Data Architecture)
*   [02. 시스템 아키텍처 및 렌더링 파이프라인 설계](./02_System_Architecture.md)
    *   클라이언트-서버(Firebase)-AI(Gemini) 레이어 구성 및 통신 규약.
*   [07. 데이터 스키마 및 파이어베이스 보안 규칙 (Firestore/Rules)](./07_Data_Schema_and_Firebase_Rules.md)
    *   Document DB 설계, Collection 명세, Zero-Trust 보안 규칙(firestore.rules) 아키텍처.

### Phase 3. 딥 다이브 엔지니어링 명세 (Deep Dive Engineering Docs)
*   [05. 컴포넌트 아키텍처 및 컴포저빌리티 분석](./05_Detailed_Component_Architecture.md)
    *   React 19 기반 `pages/`, `components/` 모듈 간의 상태(State) 및 속성(Props) 바인딩 명세.
*   [06. AI 프롬프트 엔지니어링 및 토큰 최적화 설계](./06_AI_Prompt_Engineering_Log.md)
    *   `services/geminiService.ts` 내 7가지 핵심 프롬프트의 컨텍스트 창(Context Window) 제어와 구조화된 출력(JSON Schema) 설계 상세.

### Phase 4. 문제 해결 및 QA (Troubleshooting & Quality Assurance)
*   [03. 릴리스 및 마일스톤 주요 개발 이슈 로그](./03_Development_Issue_Log.md)
    *   스프린트별 주요 구현/패치 이력.
*   [08. 트러블슈팅 딥 다이브: 무결점 마크다운/SVG 렌더러 구축기](./08_Troubleshooting_History_Deep_Dive.md)
    *   **과거 100배 이상의 분량**으로 기록된 개발 기록. SVG 렌더링 붕괴(Collapse), AST 파싱 에러, 정규식 방어 구축까지의 혈투 기록.
*   [04. QA & 엣지 케이스 융합 테스트 리포트](./04_QA_Test_Report.md)
    *   테스트 시나리오, 성공 여부, 남은 기술 부채 상세.
