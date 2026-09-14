# 🏗️ 시스템 아키텍처 및 데이터베이스 스키마 명세서

본 문서는 **초등 문해력 스마트 코스웨어 (Smart Literacy LMS)**의 전체 시스템 구조, 클라이언트 라우팅 흐름, 컴포넌트 계층 및 Firebase Firestore 데이터베이스 스키마를 기술합니다.

---

## 1. 전체 시스템 아키텍처 개요

본 애플리케이션은 **React 19 + TypeScript + Vite** 기반의 Single Page Application(SPA) 구조로 클라이언트를 구성하고, **Firebase Authentication**과 **Cloud Firestore**를 백엔드 서비스(BaaS)로 활용하여 완전한 서버리스 아키텍처를 구현하였습니다.

```mermaid
graph TB
    subgraph Client [웹 브라우저 클라이언트]
        UI[에디토리얼 + 3D 키캡 인터페이스]
        Router[React Router v7]
        AuthContext[인증 및 역할 상태 Context]
        ServiceLayer[Content & Analytics Service]
    end

    subgraph Firebase [Firebase BaaS 인프라]
        Auth[Firebase Authentication (Google OAuth)]
        Firestore[(Cloud Firestore NoSQL)]
        Rules[Firestore Security Rules]
    end

    subgraph StaticData [정적 지문 라이브러리]
        Library[300편 초등 교과 지문 & 1,200개 퀴즈]
        FAQData[오답 요인별 AI FAQ 템플릿]
    end

    UI <--> Router
    UI <--> AuthContext
    UI <--> ServiceLayer
    AuthContext <--> Auth
    ServiceLayer <--> Firestore
    Firestore <--> Rules
    ServiceLayer <--> StaticData
```

---

## 2. 클라이언트 라우팅 맵 (Routing Architecture)

애플리케이션은 사용자 인증 상태 및 역할(선생님/학생)에 따라 자동 리다이렉션되며, 다음과 같은 라우트 구성을 가집니다:

| 경로 (Path) | 컴포넌트 | 접근 권한 | 설명 |
| :--- | :--- | :---: | :--- |
| `/` | `App.tsx` | 전체 | 사용자 인증 및 역할 여부에 따라 `/teacher` 또는 `/student`로 자동 분기 |
| `/login` | `Login.tsx` | 미인증 | 웜 페이퍼 질감의 서비스 소개 및 Google 로그인 |
| `/select-role` | `RoleSelection.tsx` | 인증 완료 | 최초 로그인 시 선생님 / 학생 역할 선택 및 학급 PIN 입력 |
| `/student/*` | `StudentDashboard.tsx` | 학생 | 학생 전용 퀘스트 허브 대시보드 (하위 탭 4개) |
| ├─ `/student` | `StudentOverview.tsx` | 학생 | 일일 과제 스트릭, 맞춤 퀘스트, 최근 성취도 |
| ├─ `/student/daily` | `DailyLearning.tsx` | 학생 | 오늘의 매일 문해력 훈련 (하루 1지문 3분 훈련) |
| ├─ `/student/tests` | `AvailableTests.tsx` | 학생 | 응시 대기 중인 배정 과제 및 추천 모의고사 |
| ├─ `/student/history`| `TestHistory.tsx` | 학생 | 완료한 과제 점수 확인 및 오답노트 복습 링크 |
| └─ `/student/vocab` | `VocabularyList.tsx` | 학생 | 나만의 독서 어휘 수첩 (3D 플래시카드 뒤집기) |
| `/teacher/*` | `TeacherDashboard.tsx` | 교사 | 교사 전용 학급 관리 허브 (하위 탭 5개) |
| ├─ `/teacher` | `TeacherOverview.tsx` | 교사 | Tremor 스타일 KPI 4대 지표 및 학급 성취도 매트릭스 |
| ├─ `/teacher/generator` | `TestGenerator.tsx` | 교사 | 300편 지문 라이브러리 & 1-Click 추천 번들 출제 마법사 |
| ├─ `/teacher/students` | `StudentManagement.tsx` | 교사 | 원클릭 학급 코드 안내 및 소속 학생 명단 |
| ├─ `/teacher/students/:id` | `StudentDetail.tsx` | 교사 | 개별 학생 6대 역량 방사형 차트 및 제출 이력 |
| ├─ `/teacher/analytics` | `Analytics.tsx` | 교사 | 학급 취약 영역 분석 및 보완 과제 자동 출제 |
| └─ `/teacher/submissions` | `SubmissionsList.tsx` | 교사 | 전체 제출 답안 실시간 그리드 테이블 |
| `/test/:id` | `TakeTest.tsx` | 학생 | 2단계 순차 독해 시험 응시 (1단계: 정독 뷰 / 2단계: 3D 키캡 시험 뷰) |
| `/review/:id` | `ReviewTest.tsx` | 공통 | 오답 복습, 지문 근거 문단 하이라이트 및 AI 1:1 해설 튜터 |

---

## 3. Cloud Firestore 데이터 모델 스키마

NoSQL 문서 지향 데이터베이스인 Firestore의 컬렉션 구조는 다음과 같습니다:

### (1) `users` 컬렉션
사용자 프로필, 역할 및 학급 연동 정보 저장:
```typescript
interface UserDocument {
  uid: string;                 // Firebase Auth UID
  email: string;               // 사용자 이메일
  displayName: string;         // 사용자 이름
  photoURL?: string;           // 프로필 이미지 URL
  role: 'teacher' | 'student'; // 역할
  classCode?: string;          // 교사: 생성된 6자리 학급 코드 / 학생: 소속 학급 코드
  teacherCode?: string;        // 학생인 경우 소속된 선생님의 UID
  createdAt: string;           // ISO 8601 생성 일시
  lastLoginAt: string;         // ISO 8601 최근 로그인
}
```

### (2) `assignments` 컬렉션
교사가 학생들에게 출제한 과제 묶음:
```typescript
interface AssignmentDocument {
  id: string;                  // 과제 고유 ID (예: assign_1710384920)
  title: string;               // 과제 제목 (예: "3월 2주차 문해력 과제")
  assignedDate: string;        // 배정 일자 (YYYY-MM-DD)
  testSetIds: string[];        // 배정된 지문 세트 ID 배열 (최대 5개)
  teacherUid: string;          // 출제한 교사의 UID
  createdAt: string;           // ISO 8601 생성 일시
}
```

### (3) `submissions` 컬렉션
학생이 시험을 풀고 제출한 결과 및 분석 데이터:
```typescript
interface SubmissionDocument {
  id: string;                  // 제출 고유 ID
  testId: string;              // 응시한 시험/지문 세트 ID
  studentUid: string;          // 학생 UID
  teacherUid?: string;         // 소속 교사 UID
  answers: Record<string, number>; // 문제 UID별 학생이 고른 보기 번호 (0~4)
  score: number;               // 총점 (100점 만점 환산)
  mode: 'learning' | 'exam';   // 'learning'(일일 학습) | 'exam'(과제/모의고사)
  submittedAt: string;         // ISO 8601 제출 일시
  feedback?: string;           // AI 문해력 종합 처방 소견
  stats?: string;              // JSON 직렬화된 유형별 정답률 통계 데이터
}
```

### (4) `users/{uid}/vocabulary` 서브컬렉션
학생 개인이 지문을 읽으며 스크랩한 단어 수첩:
```typescript
interface VocabularyItem {
  id: string;                  // 단어 고유 ID
  word: string;                // 어휘 표제어 (예: "형언(形言)")
  hanja?: string;              // 한자 표기 (예: "形 (모양 형), 言 (말씀 언)")
  meaning: string;             // 사전적 의미 및 문맥적 뜻풀이
  example?: string;            // 지문 속 실제 쓰임 예문
  sourceTestId?: string;       // 수집한 출처 지문 ID
  savedAt: string;             // ISO 8601 저장 일시
}
```

---

## 4. Firestore 보안 규칙 (`firestore.rules`) 설계

- **사용자 정보 (`users`):** 인증된 사용자 본인의 문서는 직접 수정 가능하며, 교사는 자신의 `teacherCode`로 묶인 학생의 프로필을 열람할 수 있습니다.
- **과제 (`assignments`):** 교사 역할을 가진 사용자만 생성/수정할 수 있으며, 해당 학급에 소속된 학생은 읽기 권한을 가집니다.
- **제출 답안 (`submissions`):** 학생 본인은 자신의 제출 답안을 생성하고 조회할 수 있으며, 교사는 자신의 `teacherUid`로 등록된 학급 학생들의 제출물을 전수 조회할 수 있습니다.
- **어휘 수첩 (`vocabulary`):** 오직 해당 사용자 본인(`request.auth.uid == uid`)만 읽기/쓰기/삭제가 가능한 엄격한 서브컬렉션 보안이 적용됩니다.

---

## 5. 실시간 상태 관리 및 동기화 전략

1. **Firestore `onSnapshot` 기반 반응형 스트림:**
   - 교사 대시보드는 학생 가입 및 과제 제출을 실시간 리스너로 수신하여 브라우저 새로고침 없이도 즉시 통계가 갱신됩니다.
2. **Context API (`AuthContext`):**
   - 인증 세션(`firebaseUser`), 사용자 프로필 문서(`user`), 로딩 상태(`loading`)를 전역 제공하여 깜빡임 없는 라우트 가딩(Route Guard)을 실현합니다.
