# 🌐 배포 완벽 가이드 (Deployment Guide)

본 문서는 **초등 문해력 스마트 코스웨어 (Smart Literacy LMS)**를 다양한 정적 호스팅 플랫폼(Netlify, Vercel, Firebase Hosting)에 안정적으로 배포하는 절차와 환경 변수 구성 방법을 안내합니다.

---

## 1. 사전 준비 사항 (Prerequisites)

- Node.js 18.0.0 이상 및 npm 설치
- Firebase 콘솔 프로젝트 생성 (Authentication 및 Cloud Firestore 활성화)
- 배포 대상 호스팅 계정 (Netlify, Vercel 또는 Firebase CLI)

---

## 2. 프로덕션 빌드 검증

로컬에서 먼저 타입 검사와 빌드가 무결하게 완료되는지 확인합니다:

```bash
# 1. TypeScript 타입 무결성 검증
npm run lint

# 2. Vite 프로덕션 정적 번들 빌드
npm run build
```
빌드가 완료되면 프로젝트 루트에 `dist/` (또는 설정된 출력 폴더) 디렉터리가 생성됩니다.

---

## 3. 플랫폼별 배포 방법

### 옵션 A: Netlify 배포 (권장 - 1초 배포)

본 프로젝트는 Netlify의 SPA 라우팅을 위한 `public/_redirects`와 `netlify.toml`이 이미 내장되어 있습니다.

#### 방법 1: Netlify Web UI (GitHub 연동)
1. [Netlify Console](https://app.netlify.com/)에 로그인하고 **[Add new site] → [Import an existing project]**를 선택합니다.
2. GitHub 저장소를 연결하고 본 프로젝트를 선택합니다.
3. 빌드 설정을 확인합니다:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. **[Environment variables]** 메뉴에서 아래 환경 변수들을 등록합니다:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `VITE_FIREBASE_FIRESTORE_DATABASE_ID` : `(default)`
5. **[Deploy site]**를 누르면 자동으로 빌드 및 HTTPS 배포가 완료됩니다.

---

### 옵션 B: Vercel 배포

Vercel은 Vite SPA 프로젝트를 자동으로 감지하여 최적화된 설정을 제공합니다.

#### 1. `vercel.json` SPA 라우팅 설정 (루트에 생성 시)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 2. Vercel CLI 배포
```bash
npm install -g vercel
vercel
```
Vercel 대시보드 프로젝트 설정의 **Environment Variables** 탭에서 Firebase 환경 변수들을 등록합니다.

---

### 옵션 C: Firebase Hosting 배포

Firebase 생태계에서 올인원으로 호스팅하고자 할 때 적합합니다.

#### 1. Firebase CLI 로그인 및 초기화
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```
- **What do you want to use as your public directory?** `dist`
- **Configure as a single-page app (rewrite all urls to /index.html)?** `Yes`
- **Set up automatic builds and deploys with GitHub?** `No` (또는 선택)

#### 2. 빌드 및 배포
```bash
npm run build
firebase deploy --only hosting
```

---

## 4. Firebase Firestore 보안 규칙 배포

프로덕션 배포 전, Firestore 데이터 무단 접근을 차단하기 위해 보안 규칙을 배포합니다:

```bash
firebase deploy --only firestore:rules
```

---

## 5. 프로덕션 보안 체크리스트 (Security Checklist)

1. **Google Cloud Console API 키 도메인 제한:**
   - Google Cloud Console의 **[API 및 서비스] → [사용자 인증 정보]**로 이동합니다.
   - `Browser key (auto created by Firebase)`를 선택하고, **웹사이트 제한사항**에 배포된 실제 도메인(예: `https://your-site.netlify.app/*`)을 등록합니다.
2. **Firebase Auth 승인 도메인 등록:**
   - Firebase 콘솔의 **[Authentication] → [Settings] → [Authorized domains]**로 이동합니다.
   - 배포된 Netlify / Vercel 도메인을 승인 목록에 추가해야 Google 로그인이 정상 작동합니다.
3. **`.env` 파일 Git 커밋 금지:**
   - 실제 시크릿이 담긴 `.env` 파일은 `.gitignore`에 의해 제외되어 있는지 항상 확인하세요.
