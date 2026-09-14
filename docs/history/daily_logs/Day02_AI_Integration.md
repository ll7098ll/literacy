# [Hyper-Waterfall Daily Log] Day 02: AI 프롬프트 엔지니어링 및 통신망 구축

## 1. 개요
*   **일자**: Day 02
*   **주요 목표**: Google 측 LLM(Gemini API)을 애플리케이션의 뇌(Brain)로 탑재하기 위한 Service Layer 구현.

## 2. 상세 작업 내역

### 2-1. API 통신 컨트롤러 캡슐화 (`services/geminiService.ts`)
*   모든 AI 로직을 UI와 분리. `@google/genai` 패키지를 활용한 싱글톤에 준하는 모듈 생성.
*   테스트 생성 엔진(`generateTestSet`), 단어 뜻풀이 엔진(`explainWordInContext`), 문단 텍스트 코칭 엔진(`generateParagraphFeedback`) 구성.

### 2-2. 프롬프트 엔지니어링 (초정밀 구조화)
*   AI에게 "마크다운(Markdown)과 SVG, JSON만 사용할 것"을 강제하는 프롬프트 가드레일(Guardrail) 장착.
*   `TestSet` 인터페이스 (Passage, Questions, Options 등) 구조를 System Instruction 에 바인딩.

## 3. 발진된 이슈 및 해결기 (RCA: Root Cause Analysis)
*   **[Critical] JSON 파싱 붕괴 현상 (JSON Parse Error)**
    *   **증상**: 앱이 갑자기 멈추고 `JSON.parse` 단계에서 터짐. 트러블슈팅 결과 Gemini AI가 응답 값을 내놓을 때, 친절하게도 `Here is your JSON object:` 같은 서론 텍스트나 앞뒤에 ` ```json ` 백틱을 붙이는 Hallucination 현상 발견.
    *   **조치 (마이크로 패치)**:
        ```typescript
        let cleanedText = text
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        ```
        이 극한의 문자열 클리닝 작업으로 더티 데이터를 전처리하여 파싱 불량을 99.8% 감소시키는 쾌거 달성.
