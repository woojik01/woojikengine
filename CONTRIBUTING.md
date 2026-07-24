# Contributing to WoojikEngine

WoojikEngine에 기여해주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

---

## 📌 코드 작성 규칙

### TypeScript

- **Strict Mode** 사용 (모든 `tsconfig.json`에서 `strict: true`)
- **명확한 타입** 정의 (any 타입 사용 금지)
- **인터페이스**를 통해 데이터 구조 정의

### 코드 스타일

- **ESLint** 및 **Prettier** 사용
- **2공백** 들여쓰기
- **단일 인용부호** 사용
- **세미콜론** 사용

### 함수 및 클래스

- **단일 책임 원칙**: 함수는 하나의 역할만 수행
- **순수 함수** 우선 (부작용 최소화)
- **클래스**는 필요한 경우에만 사용

### 주석

- **JSDoc** 형식으로 함수/클래스 문서화
- **복잡한 로직**에는 인라인 주석 추가
- **TODO** 및 **FIXME**를 통해 미완성 작업 표시

---

## 🔄 개발 워크플로우

### 1. 이슈 생성

- 새로운 기능 또는 버그 수정을 위해 **이슈**를 먼저 생성
- 이슈에는 **명확한 설명**과 **재현 단계** 포함
- **레이블**을 적절히 사용 (예: `feat`, `fix`, `docs`, `refactor`)

### 2. 브랜치 생성

- `main` 브랜치에서 **새로운 브랜치** 생성
- 브랜치 이름 규칙:
  - `feat/[이슈번호]-기능이름` (예: `feat/1-add-renderer`)
  - `fix/[이슈번호]-버그설명` (예: `fix/2-fix-physics-collision`)
  - `docs/[이슈번호]-문서이름` (예: `docs/3-add-api-docs`)

### 3. 개발

- **작은 단위**로 커밋 (atomic commits)
- **Conventional Commits** 형식 사용:
  - `feat: 새로운 기능 추가`
  - `fix: 버그 수정`
  - `refactor: 코드 리팩터링`
  - `docs: 문서 업데이트`
  - `test: 테스트 코드 추가`
  - `chore: 기타 변경 사항`

### 4. 테스트

- **단위 테스트** (Jest) 작성
- **통합 테스트** 작성
- **수동 테스트** 수행

### 5. Pull Request (PR)

- **PR 제목**: Conventional Commits 형식
- **PR 설명**: 변경 사항, 테스트 결과, 스크린샷 등 포함
- **리뷰어** 지정 (1인 이상)
- **CI/CD** 통과 확인

### 6. 리뷰 및 병합

- **리뷰어**의 피드백 반영
- **모든 테스트** 통과 확인
- **Squash Merge** 사용 (필요한 경우)

---

## 📂 폴더 구조

```
woojikengine/
├── apps/
│   ├── editor/          # 에디터 애플리케이션
│   ├── runtime/         # 게임 런타임
│   └── website/         # 공식 웹사이트
├── packages/
│   ├── renderer/        # 렌더러 모듈
│   ├── physics/         # 물리 모듈
│   ├── ui/              # UI 모듈
│   ├── compiler/        # 컴파일러 모듈
│   ├── storage/         # 저장 모듈
│   ├── assets/          # 에셋 모듈
│   └── common/          # 공통 모듈
├── docs/                # 문서
├── tests/               # 테스트 코드
└── scripts/             # 스크립트
```

---

## 🧪 테스트

### 단위 테스트

- **Jest** 사용
- 각 모듈의 `__tests__` 폴더에 테스트 파일 작성
- 예시:
  ```typescript
  // packages/renderer/__tests__/Renderer.test.ts
  import { Renderer } from "../src/Renderer";

  describe("Renderer", () => {
    it("should initialize with correct width/height", () => {
      const renderer = new Renderer(800, 600);
      expect(renderer.width).toBe(800);
      expect(renderer.height).toBe(600);
    });
  });
  ```

### 통합 테스트

- **에디터 + 런타임** 통합 테스트
- **E2E 테스트** (Cypress 또는 Playwright)

---

## 📦 빌드 및 배포

### 로컬 빌드

```bash
pnpm build
```

### 데모 배포

- `apps/website`을 GitHub Pages로 배포
- `pnpm --filter website build`로 빌드

---

## 🤝 커뮤니케이션

- **이슈**를 통해 질문 및 논의
- **PR**을 통해 코드 리뷰
- **Discussions**를 통해 아이디어 공유

---

## 📜 라이선스

이 프로젝트는 **MIT 라이선스**를 따릅니다. 기여하시는 모든 코드는 동일 라이선스로 배포됩니다.
