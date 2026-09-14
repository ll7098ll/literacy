# [Phase 2] 데이터 스키마 및 파이어베이스 보안 아키텍처 (Data Schema & Firebase Rules)

## 1. Firebase Firestore 연동 아키텍처 개요
본 애플리케이션은 자체 백엔드(Node/Spring)의 유지보수 부담을 없애기 위해, Firebase의 BaaS(Backend as a Service) 구조를 완전 차용합니다. 

데이터는 철저히 **격리(Isolation)** 와 **접근제어(RBAC)** 규칙에 의해 감시받게 됩니다.

## 2. 핵심 Blueprint 설계 명세 (Database Entities)
`firebase-blueprint.json` 을 기반으로 한 실제 애플리케이션의 NoSQL 도큐먼트 스키마 구조입니다.

### Entity 01. `Users` (사용자 프로필 및 메타데이터)
*   **경로**: `/users/{userId}`
*   **용도**: 사용자의 학습 상태, 설정한 대상 학년(Grade) 등의 메타 속성 관리.

### Entity 02. `WordRecords` (어휘장, Vocabulary List)
*   **경로**: `/users/{userId}/vocabulary/{wordId}`
*   **도큐먼트 구조**:
    ```json
    {
      "word": "보수 (string)",
      "meaning": "문맥 기반 설명 (string)",
      "createdAt": "Timestamp (ServerTime)",
      "context": "단어가 추출된 원본 지문 혹은 주변 문장 (string)"
    }
    ```
*   **설계 의도**: 전체 단어장을 통짜 배열(Array)에 담지 않고 Sub-collection 으로 분리한 것은(100개가 넘어가면 Document 용량 1MB 제한 위협이 발생하므로) NoSQL 디자인의 가장 모범적인 설계(Hyper-Waterfall Best Practice)입니다.

## 3. Zero-Trust 보안 규칙 (Firestore Security Rules)
이 프로젝트의 규칙(`firestore.rules`)은 **절대 뚫릴 수 없는 성곽 체계(Fortress Architecture)** 를 지향합니다.

1.  **마스터 인증 게이트 (The Master Gate)**:
    시스템에 접속하려는 자는 누구든 인증을 먼저 거쳐야 합니다. 
    `match /{document=**} { allow read, write: if false; }` 가 기본 정책입니다.
2.  **관계 파생 증명 체계 (Relational Provenance)**:
    어휘 리스트, 학습 기록 등을 읽고(List) 쓸(Write) 때, 절대 자신이 주인이 아닌 것을 접근하지 못합니다.
    ```javascript
    match /users/{userId}/vocabulary/{docId} {
      // 내 UID(request.auth.uid)와 URL 경로 상의 userId가 일치할 때만 열람/수정/삭제 허용
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    ```
3.  **데이터 무결성 검증 (Integrity Inspection)**:
    필드의 타입(Size/String/Boolean)이 강제 검증되어, 클라이언트 시스템이 해킹을 당하더라도 잘못된 타입이나 터무니없는 트래픽 과부하 공격 문자열(1GB string attack)이 DB에 저장되는 것을 원천 차단합니다.

## 4. 데이터 플로우 시퀀스 (Data Flow Sequence)
1.  사용자 단어 저장 클릭 (`VocabularyList.tsx`).
2.  `TakeTest`에서 전역 모듈로 `handleSaveVocabulary` 트리거 발생.
3.  클라이언트 측 인증 토큰 검증.
4.  Firestore로 데이터 쓰기(Write) 요청 라우팅 `setDoc`.
5.  **위 보안 규칙을 통과** 후 실시간 스냅샷 동기화.
