# Portfolio Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black)](https://vercel.com/)

Next.js 16 App Router 기반 포트폴리오 & 기술 블로그 프론트엔드.

**Live:**
- Production: https://portfolio-front-ten-gamma.vercel.app
- Preview (dev): https://portfolio-front-develop.vercel.app

---

## 아키텍처

```
브라우저
  │
  ▼
Vercel (Next.js 16)
  ├─ 서버 컴포넌트 (ISR)   ──fetch──▶  OCI Nginx (HTTPS)
  │    홈, /projects, /blog               │
  │    캐시 태그 기반 갱신                  ▼
  │                                   NestJS (3000)
  └─ 클라이언트 컴포넌트                    │
       LikeButton, CommentSection      Supabase PostgreSQL
       필터, 페이지네이션               Redis (조회수)
```

### 렌더링 전략

| 페이지 | 방식 | 이유 |
|--------|------|------|
| `/` | 서버 컴포넌트 + ISR | 정적 데이터, 빠른 FCP, 뒤로가기 스크롤 복원 |
| `/projects` | 서버(초기) + 클라이언트(필터/페이지) | 첫 진입 SSR, 이후 인터랙션 |
| `/blog` | 서버(초기) + 클라이언트(검색/페이지) | 동일 |
| `/projects/[id]` | 서버 컴포넌트 + ISR | 정적 본문 캐싱 |
| `/blog/[id]` | 서버 컴포넌트 + ISR | 정적 본문 캐싱 |
| LikeButton, CommentSection | 클라이언트 컴포넌트 | 실시간 인터랙션 |

### ISR 캐시 갱신 흐름

```
NestJS (콘텐츠 저장)
  └─▶ POST /api/revalidate  (x-revalidate-secret 헤더)
        └─▶ revalidateTag('projects' | 'posts')
              └─▶ 다음 요청 시 서버에서 NestJS 재호출 → 새 HTML 캐싱
폴백: revalidate: 3600 (웹훅 실패 시 1시간 후 자동 갱신)
```

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16.1.6 (App Router) |
| UI | React 19.2.3, Tailwind CSS 4 |
| Language | TypeScript 5 |
| Auth | Supabase OAuth (Google, GitHub, Kakao) |
| HTTP | Axios (클라이언트), native fetch (서버 ISR) |
| Rendering | react-markdown, remark-gfm |
| Utilities | date-fns, react-icons |
| Deploy | Vercel (main → Production, develop → Preview) |

---

## 프로젝트 구조

```
portfolio-frontend/
├── app/
│   ├── page.tsx                    # 홈 (서버 컴포넌트, ISR)
│   ├── layout.tsx                  # 루트 레이아웃
│   ├── globals.css
│   ├── api/
│   │   └── revalidate/route.ts     # ISR 웹훅 수신 엔드포인트
│   ├── auth/callback/route.ts      # OAuth 콜백
│   ├── login/page.tsx
│   ├── projects/
│   │   ├── page.tsx                # 목록 (서버 컴포넌트)
│   │   ├── ProjectsClient.tsx      # 필터/페이지 클라이언트
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx            # 상세 (서버 컴포넌트, ISR)
│   │       ├── ProjectDetailClient.tsx
│   │       └── edit/page.tsx
│   └── blog/
│       ├── page.tsx                # 목록 (서버 컴포넌트)
│       ├── BlogClient.tsx          # 검색/페이지 클라이언트
│       ├── new/page.tsx
│       └── [id]/
│           ├── page.tsx            # 상세 (서버 컴포넌트, ISR)
│           ├── BlogPostClient.tsx
│           └── edit/page.tsx
├── components/
│   ├── Navbar.tsx
│   ├── AuthButton.tsx
│   ├── ProjectCard.tsx             # 'use client' (onError 핸들러)
│   ├── PostCard.tsx
│   ├── CommentSection.tsx
│   ├── LikeButton.tsx
│   ├── TechStackInput.tsx
│   ├── ThumbnailUploader.tsx
│   ├── Skills.tsx
│   ├── Experience.tsx
│   ├── Education.tsx
│   └── Contact.tsx
├── lib/
│   ├── api/
│   │   ├── server.ts               # 서버 전용 fetch (ISR 태그 포함)
│   │   ├── client.ts               # Axios 인스턴스 (JWT 인터셉터)
│   │   ├── projects.ts             # 클라이언트용 projects API
│   │   ├── posts.ts                # 클라이언트용 posts API
│   │   ├── comments.ts
│   │   └── likes.ts
│   ├── supabase/
│   │   ├── client.ts               # 브라우저용
│   │   └── server.ts               # 서버용
│   └── utils/
│       └── devicon.ts
├── hooks/
│   ├── useAuth.ts
│   └── useTheme.ts
├── public/
├── .env.local                      # 로컬 환경변수 (git 제외)
├── .env.example
├── next.config.ts
├── vercel.json
└── tsconfig.json
```

---

## 환경변수

### 로컬 (.env.local)

```env
# Supabase (OAuth 전용)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API - 클라이언트(브라우저)용
NEXT_PUBLIC_API_URL=https://hsm9411.duckdns.org

# Backend API - 서버(Vercel 서버)용, ISR fetch에 사용
API_URL=https://hsm9411.duckdns.org

# ISR 웹훅 시크릿 (NestJS와 동일한 값)
REVALIDATE_SECRET=your-secret

# 관리자 이메일 (쉼표 구분)
NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com
```

### Vercel 환경변수 설정

| 변수 | Production | Preview |
|------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://hsm9411.duckdns.org` | `https://hsm9411-dev.duckdns.org` |
| `API_URL` | `https://hsm9411.duckdns.org` | `https://hsm9411-dev.duckdns.org` |
| `NEXT_PUBLIC_SUPABASE_URL` | (공통) | (공통) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (공통) | (공통) |
| `REVALIDATE_SECRET` | (공통) | (공통) |
| `NEXT_PUBLIC_ADMIN_EMAILS` | (공통) | (공통) |

`NEXT_PUBLIC_API_URL`과 `API_URL`을 분리하는 이유:
- `NEXT_PUBLIC_*`는 클라이언트 JS 번들에 포함됨 (브라우저 Axios용)
- `API_URL`은 서버에서만 사용 (ISR fetch, 클라이언트 번들 비노출)

---

## 개발 환경 실행

```bash
git clone https://github.com/hsm9411/portfolio-frontend.git
cd portfolio-frontend
npm install
cp .env.example .env.local
# .env.local 값 채우기
npm run dev
```

로컬 개발보다 Vercel Preview 사용 권장 (dev 백엔드 연결 상태 확인 가능).

---

## 배포

### Git 흐름

```
develop 브랜치 작업
  └─▶ git push origin develop
        └─▶ Vercel Preview 자동 배포 (dev 백엔드 연결)
              └─▶ GitHub PR (develop → main)
                    └─▶ 머지 후 Vercel Production 자동 배포
```

main 브랜치는 브랜치 보호 설정으로 직접 push 불가, PR 필수.

### 커밋 컨벤션

```
feat:     새로운 기능
fix:      버그 수정
refactor: 리팩토링
perf:     성능 개선
style:    UI/CSS 변경
chore:    빌드, 설정, 의존성
docs:     문서
```

---

## 주요 설계 결정

**서버/클라이언트 환경변수 분리** — `NEXT_PUBLIC_API_URL`은 브라우저 번들에 포함되어 클라이언트 Axios가 사용. `API_URL`은 서버에서만 실행되는 ISR fetch에서 사용. 동일한 값이어도 용도에 따라 분리.

**URL 기반 상태 동기화** — 필터, 페이지, 검색어를 URL 쿼리스트링(`?page=2&status=completed`)으로 관리. 뒤로가기 시 브라우저가 URL을 복원하면 해당 상태로 재fetch되고 스크롤 위치도 복원됨.

**referrer 기반 뒤로가기** — 상세 페이지에서 `document.referrer`로 진입 경로를 감지. 목록에서 왔으면 `router.back()`(스크롤 위치 복원), 직접 진입이면 `router.push('/projects')`로 목록 이동.

**서버/클라이언트 컴포넌트 분리 기준** — 정적 본문(제목, 내용, 기술스택)은 서버 컴포넌트로 ISR 캐싱. 실시간 인터랙션(좋아요, 댓글)은 클라이언트 컴포넌트로 분리하여 별도 fetch.

---

## Author

**hsm9411** | haeha2e@gmail.com | [@hsm9411](https://github.com/hsm9411)

Last Updated: 2026-02-26
