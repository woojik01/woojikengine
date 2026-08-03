# Woojik Engine

> 웹 기반 2D/3D 게임 엔진 (2D 주력, 3D 보조 지원)

## 개요

**Woojik Engine**은 브라우저에서 동작하는 고성능 2D 게임 엔진으로, 간단한 3D 렌더링도 지원합니다.

- **2D Core**: Canvas 2D API 기반의 스프라이트, 타일맵, 파티클 시스템
- **3D Support**: WebGL 2.0/1.0 기반의 간단한 3D 오브젝트 렌더링
- **ECS Architecture**: Entity-Component-System 패턴으로 유연한 구조
- **Zero Dependency**: Web API만 사용 (외부 라이브러리 없음)

## 시작하기

### 설치

```bash
npm install woojikengine
```

### 기본 사용법

```typescript
import { Engine, Scene, Entity, Transform2D, Sprite } from 'woojikengine';

// 엔진 초기화
const engine = new Engine({
  canvas: document.getElementById('game-canvas') as HTMLCanvasElement,
  width: 800,
  height: 600
});

// 씬 생성
const scene = new Scene();

// 엔티티 생성
const player = new Entity();
player.addComponent(new Transform2D({ x: 100, y: 100, rotation: 0, scaleX: 1, scaleY: 1 }));
player.addComponent(new Sprite('player.png'));

scene.addEntity(player);
engine.setScene(scene);

// 엔진 시작
engine.start();
```

## 프로젝트 구조

```
woojikengine/
├── src/
│   ├── core/          # 엔진 코어
│   ├── 2d/           # 2D 렌더링
│   ├── 3d/           # 3D 렌더링
│   ├── physics/      # 물리 시스템
│   ├── input/        # 입력 시스템
│   ├── audio/        # 오디오 시스템
│   ├── assets/       # 자산 관리
│   ├── scene/        # 씬 관리
│   ├── ui/           # UI 시스템
│   └── index.ts      # 엔트리 포인트
├── types/           # TypeScript 타입
├── package.json
├── tsconfig.json
└── README.md
```

## 기술 스택

- **언어**: TypeScript 5.x
- **렌더링**: Canvas 2D API (2D), WebGL 2.0/1.0 (3D)
- **아키텍처**: ECS (Entity-Component-System)
- **테스트**: Vitest + Playwright

## 문서

- [아키텍처 설계](docs/ARCHITECTURE.md)
- [API 문서](docs/API.md)
- [예제 게임](examples/)

## 기여

1. 레포지토리 포크
2. 브랜치 생성 (git checkout -b feature/your-feature)
3. 커밋 (git commit -m 'Add your feature')
4. 푸시 (git push origin feature/your-feature)
5. Pull Request 생성

## 라이선스

MIT License
