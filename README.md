# Portfolio Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Auth-Supabase-3ecf8e)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000)](https://vercel.com/)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088ff)](.github/workflows/ci.yml)

Next.js 16 (App Router) + TypeScript 5 + Tailwind CSS 4 기반 개인 포트폴리오 & 기술 블로그 프론트엔드.
Supabase OAuth 인증, axios 모듈 토큰 관리, Vercel ISR/Edge 활용. 백엔드(`portfolio-backend` — NestJS / Oracle Cloud)와 REST API로 통신한다.

**Live**
- Production : (Vercel `main` 자동 배포)
- Preview    : `develop` push 시 Vercel Preview URL 자동 생성
- Backend    : https://hsm9411.duckdns.org · Swagger https://hsm9411.duckdns.org/api

---

## 목차

1. [아키텍처](#아키텍처)
2. [기술 스택](#기술-스택)
3. [핵심 기능](#핵심-기능)
4. [프로젝트 구조](#프로젝트-구조)
5. [렌더링 전략](#렌더링-전략)
6. [인증 흐름](#인증-흐름)
7. [환경 변수](#환경-변수)
8. [로컬 개발](#로컬-개발)
9. [배포 (CI/CD)](#배포-cicd)
10. [모바일 반응형](#모바일-반응형)
11. [디자인 시스템](#디자인-시스템)
12. [프로젝트 운영 규칙](#프로젝트-운영-규칙-요약)

---

## 아키텍처

```
┌───────── Browser ─────────┐
│  Next.js App Router       │
│  • SSR (목록·상세)         │
│  • CSR (검색·필터·정렬)    │
│  • ISR (sitemap.xml 1h)   │
└───┬────────────────┬──────┘
    │ Supabase OAuth │ REST (Bearer JWT)
    ▼                ▼
┌──────────┐   ┌─────────────────────────────────────┐
│ Supabase │   │ /api/[...path]  Next.js 프록시       │
│  Auth    │   │   ├─► NEXT_PUBLIC_API_URL (prod)    │
│  (JWT)   │   │   └─► NEXT_PUBLIC_API_URL_DEV (dev) │
└──────────┘   └────────────┬────────────────────────┘
                            ▼
                ┌──────────────────────────┐
                │ portfolio-backend        │
                │  (NestJS · Oracle Cloud) │
                │  hsm9411.duckdns.org     │
                └──────────────────────────┘
                            ▲
                            │ POST /api/revalidate (REVALIDATE_SECRET)
                            └── 백엔드가 글 발행/수정 시 ISR 재검증 트리거
```

- **API 호출 경로**: 클라이언트는 axios로 `NEXT_PUBLIC_API_URL`에 직접 호출. `app/api/[...path]/route.ts`는 SSR/서버 액션에서 사용하는 프록시.
- **토큰 관리**: 모듈 레벨 `_accessToken` 변수에 Supabase 세션 토큰을 저장 → axios interceptor가 동기적으로 참조. 매 요청마다 `getSession()` 호출하지 않음.
- **ISR**: 블로그/프로젝트 상세는 SSR + revalidate. 백엔드가 글 저장/발행 시 `/api/revalidate` 웹훅으로 캐시 무효화.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router · Turbopack) |
| Runtime | React 19, Node.js 20 (CI 기준) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + `@tailwindcss/typography` |
| Auth | Supabase SSR (`@supabase/ssr`) — Google · GitHub · Kakao OAuth |
| HTTP | Axios (모듈 레벨 토큰 store, 401 자동 로그아웃) |
| Markdown | `react-markdown` + `remark-gfm` + `rehype-highlight` |
| Date | `date-fns` |
| Mail | EmailJS (`@emailjs/browser`) — 문의 폼 |
| Icons | `react-icons` + devicon CDN |
| Analytics | `@vercel/analytics` |
| Deploy | Vercel (Git 연동 자동 배포) |
| CI | GitHub Actions — PR 시 lint + build (브랜치별 API URL 분기) |

---

## 핵심 기능

### 블로그 (`/blog`)
- 목록 — **카테고리 필터**, 키워드 검색(`useDebounce`), 정렬(최신순/조회수/좋아요순)
- 상세 — Markdown 렌더링 + 코드 하이라이팅, **읽기 진행바**, **목차(TOC, sticky)**, 모바일 TOC 플로팅 버튼 + 바텀시트
- 좋아요 / 댓글 CRUD — 페이지네이션 더보기, 익명 댓글 옵션, 인라인 수정
- 공유 버튼 — URL 복사 / Web Share API
- 관리자 전용 작성·수정·삭제 (`EditorBar` sticky 공통 UI)

### 프로젝트 (`/projects`)
- 목록 — **상태 필터**(전체·진행중·완료·보관), **기술 스택 태그 클릭 필터**, 키워드 검색, 정렬
- 상세 — `ImageGallery`(라이트박스 + 키보드/스와이프), `UpdateTimeline`(Changelog 타임라인), 좋아요 / 댓글
- 썸네일 — 이미지 없을 때 **devicon 기반 플레이스홀더** 자동 표시
- 관리자 전용 작성·수정·삭제

### 홈 (`/`)
- 히어로 섹션 — 모바일 96px 원형 사진 + tagline + indigo 액센트 타이포 위계
- 프로젝트 / 블로그 미리보기 (병렬 fetch)
- Skills · Experience · Education · Contact(EmailJS) 섹션

### 공통
- Supabase OAuth (Google / GitHub / Kakao), 401 시 자동 로그아웃 + `?redirect=` 보존
- 다크모드 (`useTheme`, CSS 변수)
- 동적 `sitemap.xml` (ISR 1h) + `robots.txt`
- SEO — 페이지별 메타데이터 + OG/Twitter Card
- 스켈레톤 로딩 UI, Toast 알림, ConfirmDialog

---

## 프로젝트 구조

```
portfolio-frontend/
├── .github/workflows/ci.yml         # PR 시 lint + build (브랜치별 API URL 분기)
├── .ai_docs/                        # 진행 현황·아키텍처 노트 (gitignore)
│
├── app/                             # Next.js App Router
│   ├── layout.tsx                   # 루트 레이아웃 (Navbar, Analytics, Toast Provider)
│   ├── page.tsx                     # 홈 (SSR + 정적 데이터)
│   ├── error.tsx · not-found.tsx
│   ├── sitemap.ts · robots.ts       # 동적 SEO 산출물
│   ├── globals.css                  # Tailwind base + CSS 변수 (--navbar-h, --nav-r/g/b)
│   │
│   ├── login/                       # OAuth 전용 로그인
│   ├── auth/callback/               # Supabase OAuth 콜백
│   ├── blog/
│   │   ├── page.tsx · BlogClient.tsx        # 목록 (SSR + CSR)
│   │   ├── [id]/page.tsx · BlogPostClient.tsx
│   │   ├── [id]/edit/ · new/        # 에디터 (관리자)
│   │   └── error.tsx
│   ├── projects/
│   │   ├── page.tsx · ProjectsClient.tsx
│   │   ├── [id]/page.tsx · ProjectDetailClient.tsx
│   │   ├── [id]/edit/ · new/
│   │   └── error.tsx
│   ├── api/
│   │   ├── [...path]/route.ts       # 백엔드 프록시 (서버 컴포넌트용)
│   │   └── revalidate/route.ts      # ISR 재검증 (REVALIDATE_SECRET 검증)
│   └── debug/                       # 개발 전용
│
├── components/
│   ├── Navbar.tsx                   # sticky, 스크롤 blur, 모바일 사이드 패널
│   ├── PostCard.tsx                 # 항상 가로 레이아웃 (96px 우측 썸네일)
│   ├── ProjectCard.tsx              # devicon 플레이스홀더 + 기술 스택 클릭 필터
│   ├── CommentSection.tsx           # 댓글 CRUD + isMine/isAdmin 분기 + 페이지네이션
│   ├── LikeButton.tsx
│   ├── UpdateTimeline.tsx           # 프로젝트 Changelog (관리자 인라인 CRUD)
│   ├── ImageGallery.tsx             # 라이트박스 + 썸네일 스트립 (스와이프/키보드)
│   ├── ImageGalleryUploader.tsx · ThumbnailUploader.tsx · TechStackInput.tsx
│   ├── EditorBar.tsx                # 에디터 공통 sticky bar (top: var(--navbar-h))
│   ├── Skills.tsx · Experience.tsx · Education.tsx · Contact.tsx
│   ├── AuthButton.tsx
│   └── ui/
│       ├── FormField.tsx · Spinner.tsx · ErrorAlert.tsx
│       ├── Toast.tsx                # Context 기반 ToastProvider
│       ├── ConfirmDialog.tsx
│       └── PostCardSkeleton.tsx · ProjectCardSkeleton.tsx
│
├── lib/
│   ├── api/
│   │   ├── client.ts                # axios + 모듈 레벨 토큰 store + 401 핸들러
│   │   ├── server.ts                # 서버 컴포넌트용 fetch 유틸
│   │   ├── posts.ts · projects.ts · comments.ts · likes.ts · updates.ts · auth.ts
│   │   └── index.ts
│   ├── data/                        # 정적 콘텐츠
│   │   └── skills.ts · experience.ts · education.ts
│   ├── supabase/
│   │   └── client.ts · server.ts    # 브라우저용 / 서버용 Supabase 클라이언트
│   ├── styles/form.ts               # inputClass 공통 Tailwind 클래스
│   ├── types/api.ts                 # User · Project · Post · Comment · ProjectUpdate 등
│   └── utils/devicon.ts             # 기술 스택 → devicon URL 매핑
│
└── hooks/
    ├── useAuth.ts                   # Supabase 세션 구독 + isAdmin 판단
    ├── useTheme.ts                  # 다크/라이트 모드 토글
    ├── useDebounce.ts               # 제네릭 debounce (검색 입력)
    ├── useToast.ts                  # ToastProvider Context hook
    └── useUnsavedWarning.ts         # 폼 이탈 방지 경고
```

---

## 렌더링 전략

| 페이지 | 전략 | 비고 |
|--------|------|------|
| `/` (홈) | SSR | 프로젝트·포스트 병렬 fetch, SEO |
| `/blog` | SSR + CSR hybrid | 초기 데이터 SSR, 검색·필터·정렬 CSR |
| `/projects` | SSR + CSR hybrid | 초기 데이터 SSR, 필터·정렬 CSR |
| `/blog/[id]` | SSR (revalidate) | 본문 SEO, 좋아요·댓글은 클라이언트 컴포넌트 |
| `/projects/[id]` | SSR (revalidate) | 동일 |
| `/sitemap.xml` | ISR (1h) | 동적 생성, 블로그·프로젝트 URL 포함 |
| `/api/revalidate` | Route Handler | 백엔드 웹훅 → `revalidatePath()` 트리거 |

---

## 인증 흐름

```
브라우저 ─► Supabase OAuth (Google · GitHub · Kakao)
                │
                ▼ session
       onAuthStateChange ─► setAccessToken(session.access_token)
                │
                ▼ (모듈 레벨 변수)
       Axios request interceptor ─► Authorization: Bearer <token>
                │
                ▼
       portfolio-backend (SupabaseJwtStrategy ES256 검증)
                │
                ▼ (401 + Authorization 헤더 있었던 경우)
       setAccessToken(null) → supabase.auth.signOut()
       → /login?error=session_expired&redirect=<원래 경로>
```

- 매 요청마다 `getSession()` 비동기 호출 없이 동기적으로 토큰 참조 (병목 제거).
- 401 응답 + Authorization 헤더가 있었던 경우에만 강제 로그아웃 (미인증 호출의 401은 무시).
- 관리자 판단: 세션 이메일이 `NEXT_PUBLIC_ADMIN_EMAILS` 목록에 포함된 경우 (`useAuth().isAdmin`).

---

## 환경 변수

`.env.local` 기준:

```env
# ── Supabase ───────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# ── Backend API ────────────────────────────────────────────
NEXT_PUBLIC_API_URL=https://hsm9411.duckdns.org           # prod 백엔드
NEXT_PUBLIC_API_URL_DEV=https://hsm9411-dev.duckdns.org   # dev 백엔드

# ── Admin ──────────────────────────────────────────────────
NEXT_PUBLIC_ADMIN_EMAILS=email1@example.com,email2@example.com

# ── Site / SEO ─────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>

# ── EmailJS (Contact 폼) ───────────────────────────────────
NEXT_PUBLIC_EMAILJS_SERVICE_ID=<service-id>
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=<template-id>
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=<public-key>

# ── ISR Webhook (서버 전용, NEXT_PUBLIC_ 아님) ─────────────
REVALIDATE_SECRET=<shared-with-backend>
```

> **GitHub Secrets** (CI용): 위 항목 동일 + `NEXT_PUBLIC_API_URL_DEV`. CI는 `github.base_ref`로 prod/dev URL 분기.
> **Vercel**: `REVALIDATE_SECRET`은 **Sensitive** 타입으로 등록 (값 노출 방지).

---

## 로컬 개발

```bash
# 1. 의존성
npm install

# 2. 환경변수 설정
cp .env.example .env.local         # 본인 Supabase / 백엔드 URL / ADMIN_EMAILS 채우기

# 3. 개발 서버 (Turbopack HMR)
npm run dev                        # http://localhost:3000

# 4. 프로덕션 빌드 검증
npm run build

# 5. Lint
npm run lint                       # ESLint flat config (eslint-config-next)
```

> **커밋 전 반드시 `npm run lint`와 `npm run build` 양쪽 통과 확인** — CI에서 동일 체크 수행.

---

## 배포 (CI/CD)

### Vercel — Git 연동 자동 배포

| 브랜치 | 배포 대상 |
|--------|-----------|
| `main` | Production |
| `develop` | Preview URL (Vercel 자동 생성) |
| feature 브랜치 | PR Preview |

환경변수는 Vercel 대시보드 → **Settings > Environment Variables** 에서 관리.

### GitHub Actions — `.github/workflows/ci.yml`

```
PR 오픈/업데이트 ─► Lint ─► Build (NEXT_PUBLIC_API_URL은 base_ref 따라 분기)
                         ├── base=main    → NEXT_PUBLIC_API_URL (prod 백엔드)
                         └── base=develop → NEXT_PUBLIC_API_URL_DEV (dev 백엔드)
```

- Node 20 + npm cache로 가속.
- `develop` / `main` 양쪽 브랜치 PR에서 실행. 실패 시 머지 차단(Branch Protection).

---

## 모바일 반응형

Tailwind 브레이크포인트 기준 **모바일 퍼스트** 설계:

| prefix | 범위 | 용도 |
|--------|------|------|
| (없음) | 0px~ | 모바일 기본 |
| `sm:` | 640px~ | 태블릿 세로 |
| `md:` | 768px~ | 태블릿 가로 / 소형 데스크탑 |
| `lg:` | 1024px~ | 데스크탑 |

**모바일 전용 패턴**
- 히어로: 96px 원형 사진 + tagline + 본문 압축 (데스크탑은 풀 본문)
- TOC: sticky 사이드바 → 모바일은 플로팅 버튼 + 바텀시트
- PostCard: 항상 가로 레이아웃, 우측 96px 썸네일 고정
- 필터 pills: 가로 스크롤 (`scrollbar-hide`)
- CTA 버튼: 모바일 전용(`sm:hidden`) 아웃라인 스타일

---

## 디자인 시스템

| 토큰 | 값 | 비고 |
|------|----|------|
| 액센트 | `indigo-600` | 링크·버튼·강조 (이전 `blue-600` 전체 교체) |
| 배경 라이트 | `zinc-50` (#fafafa) | 중립 grayscale (이전 `gray-*`에서 교체) |
| 배경 다크 | `zinc-900` (#18181b) | navbar CSS 변수: `--nav-r:24 --nav-g:24 --nav-b:27` |
| 카드/컴포넌트 | `zinc-100` / `zinc-700` / `zinc-800` | |
| Navbar 높이 | CSS 변수 `--navbar-h` (72→56px) | 에디터 sticky bar `top` 기준값 |
| 타이포 | `@tailwindcss/typography` (`prose`) | 블로그 본문 |

---

## 브랜치 전략

```
main        → Production 배포 (Vercel)
  └── develop     → Preview 배포, 통합 브랜치
        └── FRONT-N-이슈설명   → 기능·수정·리팩토링 단위 작업 브랜치
```

- feature → develop: **squash merge** (커밋 정리)
- develop → main: **regular merge** (릴리즈 단위, SHA 보존으로 충돌 방지)
- squash merge 후 같은 브랜치 재사용 금지 → 항상 새 브랜치 생성

---

## 프로젝트 운영 규칙 (요약)

- 새 작업 → Jira `FRONT-N` 이슈 + GitHub Issue 병행 생성 → `FRONT-N-이슈설명` 브랜치.
- 커밋 메시지: `FRONT-N: type: 설명` (type ∈ `feat` / `fix` / `chore` / `refactor`).
- 마지막 줄에 `closes #N`(GitHub 이슈) 포함, 한국어 메시지.
- `develop`에 직접 커밋 금지. 머지된 브랜치에 추가 커밋 금지 — 항상 새 브랜치.
- PR 템플릿: `.github/PULL_REQUEST_TEMPLATE/feature.md` (feature/fix/refactor/chore 공용) / `release.md` (develop → main).
- Jira description은 **ADF JSON 포맷 필수** (markdown + `\n`은 깨짐).

---

## Author

**hsm9411** · haeha2e@gmail.com · [@hsm9411](https://github.com/hsm9411)

Last Updated: 2026-05-08 (FRONT-57까지 develop 반영)
