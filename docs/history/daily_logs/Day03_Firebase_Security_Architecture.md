# [Hyper-Waterfall Daily Log] Day 03: Firebase BaaS & Zero-Trust 보안 아키텍처

## 1. 개요
*   **일자**: Day 03
*   **주요 목표**: 서버리스(Serverless) 통신 기반의 데이터 저장소 할당 및 클라이언트 SDK 연동. 사용자 인증 기능 탑재.

## 2. 상세 작업 내역

### 2-1. Firebase Auth 통합
*   구글 팝업 인증(`signInWithPopup`) 기능 탑재 완료.
*   앱 최상단에서 `onAuthStateChanged` 옵저버 패턴을 활용, 세션 복원이 이뤄지기 전까지 'Loading' 상태를 띄워 비인가 우회 접근을 원천 봉쇄.

### 2-2. NoSQL (Firestore) 스키마 모델링
*   사용자의 개인화된 단어장(Vocabulary)과 과거 오답 노트를 저장할 구조 설계 완료.
*   `/users/{userId}/vocabulary/{wordId}` 형태로 쪼개지는 서브 컬렉션 패턴. JSON 통짜 저장의 단점(문서 크기 제한 및 동시성 에러) 회피.

## 3. Firebase Rules 설정 (보안 이슈 해결)
*   **이슈 설정**: 초기 개발 과정 중 Cloud Firestore가 테스트 모드(`allow read, write: if true;`)로 설정될 뻔한 위험 요소 지적.
*   **조치**: 프로덕션 수준의 Firebase Security Rule 구축 실시.
    ```javascript
    match /users/{userId}/vocabulary/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    ```
    오직 자신의 토큰에 적힌 UID와 경로상의 UID가 일치해야만 API 콜을 수용하도록 하여, Zero-Trust Architecture(ZTA) 실현.
