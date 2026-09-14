# [Hyper-Waterfall Daily Log] Day 04: 상태 머신(State Machine) & 인터랙티브 러닝

## 1. 개요
*   **일자**: Day 04
*   **주요 목표**: 지문을 단순히 읽고 푸는 형태를 넘어선, 문해력 훈련을 위한 실시간 문단 쪼개기(Interactive Learning Mode) UI 구축.

## 2. 상세 작업 내역

### 2-1. 지문 파싱 로직 및 UI 바인딩 (`TakeTest.tsx`)
*   `mode: 'learning' | 'test'` 상태 변수 도입.
*   지문 객체 매핑: `passage.content.split('\n\n')` 를 사용해 긴 문자열의 지문을 각 문단 배열(Array)로 분해, `map`을 돌려 렌더링.

### 2-2. 문단별 피드백 엔진 장착
*   사용자가 각 문단 하단 Input 영역에 자신이 생각한 내용(요약)을 적음.
*   "분석하기"를 트리거 시, `generateParagraphFeedback` 비동기 콜이 날아감.
*   `paragraphFeedbacks`, `paragraphGuides` 라는 형태의 객체 상태(`Record<string, {text: string}>`)에 비동기 결과값을 머지(Merge)하여 UI에 노출.

## 3. 리렌더링 및 배열 탐색 버그 트러블슈팅
*   **이슈 (State Bleeding)**: 위에서 입력 폼 구조를 구축했을 때, 리액트 Reconciliation 과정 중 배열의 순서가 변하거나 값이 바뀔 시 Input 포커스를 잃고 값이 섞이는 State Bleeding 현상 발생. 
*   **조치 (마이크로 패치)**: `map` 함수의 두 번째 인자인 `index` 값을 `key`로 넣는 안티 패턴을 제거. `{pIndex}_{paraIndex}`와 같은 결합 키를 사용하여 DOM의 고유성을 확보. 이로써 무작위 입력 중에도 리액트 상태 동기화가 유지됨.
