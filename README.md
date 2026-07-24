# WoojikEngine (우직엔진)

> **웹 기반 2D 게임 엔진** | Web-based 2D Game Engine

WoojikEngine은 브라우저에서 실행되는 현대적인 2D 게임 엔진입니다. 설치 없이 사용 가능하며, 모바일과 PWA를 지원합니다.

---

## ✨ 특징

- 🌐 **브라우저 기반**: 설치 없이 웹 브라우저에서 즉시 사용 가능
- 📱 **모바일 지원**: 터치 이벤트 및 모바일 최적화
- 📦 **PWA 지원**: 오프라인에서 사용 가능
- 💾 **프로젝트 저장**: IndexedDB, OPFS, JSON/ZIP 내보내기
- 🔗 **GitHub 연동**: Clone, Commit, Push, Pull 지원
- ⚡ **고성능**: PixiJS 기반 렌더링 및 Matter.js 기반 물리 시뮬레이션
- 🛠️ **확장성**: 모듈식 아키텍처로 유지보수 용이

---

## 🚀 시작하기

### 전제 조건

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 설치

```bash
# 레포지터리 클론
git clone https://github.com/woojik01/woojikengine.git
cd woojikengine

# 의존성 설치
pnpm install

# 개발 서버 실행 (에디터)
pnpm --filter editor dev

# 빌드
pnpm build

# 테스트
pnpm test
```

---

## 📂 프로젝트 구조

```
woojikengine/
├── apps/
│   ├── editor/          # 에디터 애플리케이션 (Next.js + React + Monaco)
│   ├── runtime/         # 게임 런타임 (PixiJS + TypeScript)
│   └── website/         # 공식 웹사이트 (Next.js)
├── packages/
│   ├── renderer/        # PixiJS 기반 렌더러
│   ├── physics/         # 2D 물리 엔진 (Matter.js)
│   ├── ui/              # 공통 UI 컴포넌트 (Zustand + React)
│   ├── compiler/        # TypeScript 스크립트 컴파일러
│   ├── storage/         # IndexedDB/OPFS 저장 시스템
│   ├── assets/          # 에셋 관리 시스템
│   └── common/          # 공통 유틸리티 및 타입
├── docs/
├── tests/
└── scripts/
```

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| 언어 | TypeScript |
| 프론트엔드 | React, Next.js |
| 렌더링 | PixiJS |
| 물리 | Matter.js |
| 상태 관리 | Zustand |
| 저장 | IndexedDB, OPFS |
| 코드 에디터 | Monaco Editor |
| 빌드 | pnpm, Vite, Next.js |
| PWA | Service Worker |
| 데스크톱 | Tauri (Windows EXE) |
| 모바일 | Capacitor (Android APK/AAB) |

---

## 📖 문서

- [API 문서](./docs/api)
- [사용자 가이드](./docs/guide)
- [기여 가이드](CONTRIBUTING.md)

---

## 🤝 기여하기

기여를 환영합니다! [CONTRIBUTING.md](CONTRIBUTING.md)를 참조하세요.

---

## 📜 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE)로 배포됩니다.
