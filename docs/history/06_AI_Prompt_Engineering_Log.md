# [Phase 3] 딥 다이브: AI 프롬프트 엔지니어링 및 토큰 최적화 설계 (AI Prompt Engineering Log)

## 1. 프롬프트 아키텍처 개관 (Prompt Architecture)
문해력 평가 시스템은 규칙 기반(Rule-based)의 코딩보다 **어떠한 형태의 프롬프트를 주입하여 정형화된 JSON을 예측가능하게 뽑아내느냐**에 시스템 가용성이 결정됩니다.

파일 `src/services/geminiService.ts`는 약 **7가지 핵심 프롬프트 엔진**을 탑재하고 있습니다.

## 2. 개별 프롬프트 구조 파해치기 (Micro-Analysis)

### 2-1. `generateTestSet` (시험 생성 엔진)
가장 비싸고, 가장 긴 응답(Tokens)을 차지하며, 환각(Hallucination) 위험이 가장 큰 프롬프트.
*   **System Role**: "You are an expert reading comprehension test creator."
*   **Constraints (최고의 방어기제 제약 조건 삽입)**:
    1.  텍스트는 반드시 JSON 포맷이어야 하며, 시작과 끝에 백틱(```json)을 사용하지 않는다.
    2.  `passage`, `questions`, `options`, `answer`, `explanation` 의 엄격한 TypeScript Interface 구조 제공.
    3.  **다이어그램 지시어(핵심)**: "You MUST include visual diagrams or graphs in the passage using SVG or specific JSON formats." -> 이 프롬프트 한 줄이, 우리가 그동안 고통받았던 SVG 렌더링 파이프라인 존재의 이유를 만들어냅니다.

### 2-2. `explainWordInContext` (문맥 사전 엔진)
*   **입력 변수**: `word` (궁금한 단어), `context` (그 단어가 쓰인 주변 마크다운 문장들)
*   **Prompt Strategy**: "단어 '{word}'의 사전적 의미뿐만 아니라, '{context}' 안에서 어떻게 쓰였는지 초등학생도 이해하기 쉽게 3~4문장으로 풀어서 설명해."
*   **토큰 가치**: 불필요한 장황한 설명을 막고 짧게 끊도록 유도하여 속도 최적화.

### 2-3. `generateParagraphFeedback` (실시간 문단 인터랙션)
*   **동적 처리 (One-Shot Learning 요소)**:
    이전까지 학생이 쓴 요약(`studentSummaries` 베열)과 해당 `targetParagraph` 을 함께 주입하여, "앞서 네가 이렇게 생각했는데, 이 문단에서는 이렇단다" 형태의 **맥락적 연결 고리(Contextual Chain)** 를 형성하는 고난이도 프롬프트 구조 설계.

### 2-4. `askAITutor` (AI 해설 채팅 튜터)
*   채점 후 '왜 틀렸는지' 학생이 대화 형태로 묻는 엔진.
*   **System Prompt**: 사용자의 과거 대화 기록(`chatHistory`)을 `role: 'user'` 와 `role: 'model'` 의 구도로 배열(Array)화하여 Gemini 모델에 주입함으로써 멀티턴(Multi-turn) 대화를 완벽히 구현.

## 3. 프롬프트 포스트 프로세싱 (Fallback & Clean-up)
AI가 어떠한 미사여구를 포함하더라도 JSON 형태만 정확히 파싱하기 위해 시스템 내부적으로 적용된 정형화 스크립트:
```typescript
let cleanedText = text
  .replace(/```json/gi, '')
  .replace(/```/g, '')
  .trim();
```
(개발 일지 상, 이 단순한 코드 세 줄이 초기 시스템의 잦은 500 JSON Parser Error의 99%를 잡아낸 핵심 패치였습니다.)
