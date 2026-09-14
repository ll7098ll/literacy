# [제4장] AI 인텔리전스 및 프롬프트 엔지니어링 (AI & Prompt Engineering)

## 1. 아키텍처 개관 (Architecture Overview)
Firebase, React와 완전히 디커플링된 형태로 `src/services/geminiService.ts` 안에 AI 관련 통신 모듈을 집중화(Centric) 시켰습니다. 생성형 모델 통신 간에 일어날 수 있는 '환각(Hallucination)'을 방어하는 것이 최우선 과제였습니다.

## 2. 핵심 프롬프트 엔진 명세 (Core Prompt Engines)

### 2-1. 마스터 생성 팩토리 (`generateTestSet`)
*   **엔지니어링 코어**: `You are an expert reading comprehension test creator.` 시스템 프롬프트 부여.
*   **환각 통제(Constraint)**: 응답으로 JSON만 내뱉을 것. JSON 시작/끝에 어떠한 텍스트나 포맷 지정자(```json 등)도 붙이지 말 것을 강제함. (다만 이를 어길 경우를 대비한 Clean-up 정규식 병행).
*   **구조적 출력(Structured Output)**: 단순히 본문을 쓰는 것이 아니라 `passage`, `questions`, `options` 등의 엄격한 구조를 지키도록 인터페이스(`TestSet`) 요구.

### 2-2. 컨텍스트 인식 사전 (`explainWordInContext`)
*   사용자가 클릭한 단어만 LLM에 넘기면 다의어 처리가 불가능합니다(예: '보수' 가 수리인지 집단인지).
*   **전략 (RAG 모방형)**: 사용자가 드래그한 좌표에서 문단을 긁어와 `word`와 `context`를 세트로 주입. "이 문맥에서 쓰인 {word}를 분석해"라는 프롬프트를 쏘아 스마트 사전 기능 완성.

### 2-3. 다이내믹 AI 코칭 튜터 (`askAITutor`)
*   채점이 완료된 후, "왜 이게 정답이야?"를 묻기 위한 **멀티턴(Multi-turn)** 구현.
*   기존 대화 내역(`chatHistory`)을 배열에 담아, Model과 User의 역할(Role) 구분을 주입. 역사적 텍스트를 인지하는 연속 프롬프팅(Sequential Prompting) 확보.

## 3. 데이터 멸균 パ이프라인 (Data Sterilization Pipeline)
Gemini가 지시를 어기고 던지는 더티 데이터에 대한 마이크로 방어 로직 (이 3줄이 앱의 생명줄이 되었습니다):
```typescript
let cleanedText = text
  .replace(/```json/gi, "")
  .replace(/```/g, "")
  .trim();
const jsonMatch = cleanedText.match(/\{[\s\S]*\}/); // 객체만 강제 도출
```
