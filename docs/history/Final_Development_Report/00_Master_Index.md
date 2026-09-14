# 문해력 평가 AI 플랫폼 통합 개발 보고서 (Final Development Report)
## 📋 마스터 목차 (Master Table of Contents)

본 통합 개발 보고서는 '하이퍼 워터폴(Hyper-Waterfall)' 테마 아래 파편화되어 있던 모든 개발 문서와 일지, 엔지니어링 기록을 전면 재검토 및 재구성하여, 완벽한 체계를 갖춘 **[최종 개발 보고서]** 형태로 재집필한 마스터 인덱스입니다.

전체 보고서는 아래와 같이 논리적 흐름에 따라 8개의 챕터(Chapter) 파일로 분리되어 `docs/Final_Development_Report/` 디렉토리에 구축되었습니다.

---

### 📂 제1장. 프로젝트 개요 및 방법론 (Chapter 01)
*   **파일**: `CH01_Project_Overview.md`
*   **내용**: 프로젝트 공식 헌장, 하이퍼 워터폴 방법론 정의, 핵심 개발 철학.

### 📂 제2장. 요구사항 명세서 (Chapter 02)
*   **파일**: `CH02_Requirements_Spec.md`
*   **내용**: 극대화된 통합 요구사항. 기능적(FR) 및 비기능적(NFR) 요구조건 트래킹 상세.

### 📂 제3장. 시스템 아키텍처 및 프론트엔드 설계 (Chapter 03)
*   **파일**: `CH03_System_Architecture.md`
*   **내용**: React-Vite 기반의 레이어 아키텍처, 컴포저빌리티 분석, HMR 빌드 채택 이유와 렌더링 파이프라인.

### 📂 제4장. AI 인텔리전스 및 프롬프트 엔지니어링 (Chapter 04)
*   **파일**: `CH04_AI_and_Prompt_Engineering.md`
*   **내용**: Gemini API 연동 구조, 7가지 핵심 프롬프트 패턴, JSON Hallucination 방어 및 더티 데이터 멸균 로직.

### 📂 제5장. 데이터베이스 구조 및 보안 설계 (Chapter 05)
*   **파일**: `CH05_Database_and_Security.md`
*   **내용**: Firebase NoSQL 서브컬렉션 스키마, Zero-Trust Architecture 기반의 `firestore.rules` 보안 정책.

### 📂 제6장. 핵심 트러블슈팅: 마크다운 렌더링 딥 다이브 (Chapter 06)
*   **파일**: `CH06_Troubleshooting_Deep_Dive.md`
*   **내용**: 본 시스템구축 최대의 난제였던 SVG 스케일링 붕괴, AST 노드 에러, HTML5 위반 이슈에 대한 원인 분석 및 해결 파이프라인(`getTextContent`).

### 📂 제7장. 일자별 통합 개발 로그 (Chapter 07)
*   **파일**: `CH07_Daily_Development_Logs.md`
*   **내용**: Day 1부터 Day 15까지 흩어져 있던 초단위/마이크로 단위의 개발 일지를 시간순 서사로 묶어낸 통사(History).

### 📂 제8장. 품질 보증(QA) 및 향후 로드맵 (Chapter 08)
*   **파일**: `CH08_QA_and_Roadmap.md`
*   **내용**: 단위 테스트, 엣지 케이스 검증 시나리오 및 차기 버전 마일스톤(Redux 도입, Suspense 최적화) 정의.
