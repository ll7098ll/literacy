# 🤝 기여 가이드라인 (Contributing Guidelines)

초등 문해력 스마트 코스웨어 프로젝트에 관심을 가져주셔서 감사합니다! 본 문서는 코드 기여, 버그 리포트, 기능 제안 및 풀 리퀘스트(PR) 절차를 안내합니다.

---

## 1. 행동 강령 (Code of Conduct)

본 프로젝트는 포용적이고 존중하는 협업 환경을 지향합니다. 모든 참여자는 상호 존중과 배려의 자세로 커뮤니케이션해 주시기 바랍니다.

---

## 2. 개발 워크플로우 (Development Workflow)

본 프로젝트는 **GitHub Flow** 브랜치 전략을 따릅니다:

1. **Issue 생성 또는 할당:** 버그 제보나 기능 추가 전 Issue를 먼저 확인하거나 새로 등록합니다.
2. **Fork 및 브랜치 생성:** 메인 저장소를 Fork한 뒤 명확한 목적의 브랜치를 생성합니다:
   ```bash
   git checkout -b feature/vocabulary-audio-tts
   # 또는
   git checkout -b fix/safari-keycap-shadow
   ```
3. **코드 작성 및 테스트:**
   - 일관된 에디토리얼 + 3D 키캡 디자인 토큰을 준수합니다.
   - 불필요한 콘솔 로그(`console.log`)나 미사용 import를 제거합니다.
4. **로컬 검증 실행:**
   ```bash
   npm run lint   # TypeScript 타입 검사 통과 필수
   npm run build  # 빌드 성공 필수
   ```
5. **커밋 및 푸시:** 커밋 컨벤션을 준수하여 커밋합니다.
6. **Pull Request 오픈:** 템플릿에 맞추어 변경 사항 및 테스트 내역을 상세히 기술합니다.

---

## 3. 커밋 메시지 규칙 (Commit Message Convention)

**Conventional Commits** 형식을 엄격히 준수합니다:

```
<type>(<scope>): <subject>
```

| Type | 설명 | 예시 |
| :--- | :--- | :--- |
| `feat` | 새로운 기능 추가 | `feat(vocab): add speech synthesis audio button to flashcard` |
| `fix` | 버그 수정 | `fix(test): correct scoring calculation on multi-passage tests` |
| `style` | 코드 포맷팅, UI 스타일 변경 | `style(ui): unify 3D tactile button shadow tokens` |
| `refactor` | 코드 구조 개선 (기능 변경 없음) | `refactor(auth): simplify role selection redirect logic` |
| `docs` | 문서 추가 및 수정 | `docs: add deployment guide for Vercel and Netlify` |
| `chore` | 빌드 스크립트, 의존성 패키지 변경 | `chore: update vite to 6.2.0` |

---

## 4. 디자인 시스템 준수 원칙

코드를 작성할 때 다음 디자인 원칙을 엄격히 준수해야 합니다:

1. **보라색/인디고 그라데이션 금지:** 인쇄 잉크 및 종이 질감의 딥 로열 네이비(`#0F172A`), 웜 페이퍼(`#FAF8F5`), 앰버, 포레스트 에메랄드를 사용합니다.
2. **3D 물리 피드백 일관성:** 주요 버튼과 선택지에는 `shadow-tactile` 또는 `shadow-tactile-sm` 클래스를 적용하고, 액티브 시 `translate-y-[1.5px]` 피드백을 유지합니다.
3. **타이포그래피 분리:** 지문 본문 및 문항은 `editorial-serif`를 사용하고, 수치 데이터는 `font-mono`를 사용합니다.

---

## 5. 풀 리퀘스트(PR) 가이드

- PR 제목은 커밋 메시지 규칙을 따릅니다.
- UI 변경 사항이 있는 경우, PR 설명에 반드시 **Before / After 스크린샷**을 첨부해 주세요.
- 모든 CI 검사(타입 검사 및 빌드)를 통과해야 코드 리뷰가 진행됩니다.
