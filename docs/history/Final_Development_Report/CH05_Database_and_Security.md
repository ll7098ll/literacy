# [제5장] 데이터베이스 구조 및 보안 설계 (Database & Security)

## 1. Firebase BaaS (Backend-as-a-Service) 적용 기조
서버 운영 및 DB 런타임 유지보수 코스트를 타개하기 위해 Firestore 및 Firebase Auth를 전면 채택했습니다. 

## 2. NoSQL 스키마 아키텍처 (Firestore Schema)
관계형 데이터베이스의 제약을 벗어난 NoSQL 특화 도큐먼트 디자인입니다. ('배열 내 엄청난 양의 저장'을 지양)

### [엔티티: WordRecords (어휘장)]
*   **Path**: `/users/{userId}/vocabulary/{wordId}`
*   **필드 정의 (Schema)**:
    ```typescript
    {
      word: string;        // 검색한 단어
      meaning: string;     // AI가 반환한 문맥 맞춤 뜻
      context: string;     // 당시 지문의 원형 데이터 (추후 오답 노트 확장에 유용)
      createdAt: Timestamp;// 서버 생성 시간
    }
    ```
*   **아키텍처 패턴**: `vocabulary` 배열(Array)에 밀어넣지 않고 **Sub-collection** 으로 분해한 이유는, 단어가 수백 개 넘어갔을 때 발생하는 1MB 도큐먼트 리미트 초과 방지 및 부분 쿼리(Pagination) 대응을 위함입니다.

## 3. Zero-Trust Architecture: 보안 규칙 (Security Rules)
사용자의 인증 토큰과 DB의 소유권을 일치시키는 절대 방어선(`firestore.rules`) 구축 명세입니다.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1원칙: 화이트리스트 접근 (모든 포트 기본 차단)
    match /{document=**} {
      allow read, write: if false; 
    }
    
    // 2원칙: 오너십 검증 (UID 일치)
    match /users/{userId}/vocabulary/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // 악의적인 payload 방지를 위한 룰 확장 가능 지점 제언: 
      // (request.resource.data.keys().hasOnly(['word', 'meaning', ...]))
    }
  }
}
```
프론트엔드 코드(React)가 뚫려서 악의적 사용자가 `userId`를 변조하려 해도, 구글 서버(Firestore) 레벨의 이 방어벽에 가로막혀 403 에러를 띄우게 됩니다.
