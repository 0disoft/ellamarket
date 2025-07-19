# 백엔드 Supabase 연동 초기 설정

## 1. 작업 개요

ElysiaJS 백엔드에 Supabase 클라이언트를 연동하고, 관련 의존성을 설치했으며, 환경 변수를 안전하게 관리하도록 설정했습니다.

## 2. 변경된 파일 목록

- `apps/backend/package.json`
- `apps/backend/src/index.ts`
- `apps/backend/.gitignore`
- `apps/backend/.env.example`
- `bun.lock`

## 3. 특이사항 및 참고

- `@yolk-oss/elysia-env` 라이브러리를 사용하여 `.env` 파일에서 환경 변수를 타입 세이프하게 로드하도록 구현했습니다.
- Supabase 클라이언트 인스턴스는 Elysia의 `decorate` 기능을 통해 컨텍스트에 주입되어, 모든 요청 핸들러에서 `ctx.supabase`로 접근할 수 있습니다.