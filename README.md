# portfolio-frontend

개인 포트폴리오 & 기술 블로그 프론트엔드.  
Next.js App Router 기반으로 구성되어 있으며, Vercel에 배포됩니다.  
백엔드(`portfolio-backend` — NestJS / Oracle Cloud)와 REST API로 통신합니다.

---

## 주요 기능

### 블로그
- 게시글 목록 — 카테고리 필터, 키워드 검색(debounce), 정렬(최신순·조회수·좋아요순)
- 게시글 상세 — Markdown 렌더링(코드 하이라이팅), 읽기 진행바, 목차(TOC, sticky)
- 좋아요 / 댓글 CRUD (페이지네이션 더보기)
- 공유 버튼 (URL 복사 / Web Share API)
- 관리자 전용 작성·수정·삭제

### 프로젝트
- 프로젝트 목록 — 상태 필터(전체·진행중·완료·보관), 기술 스택 태그 클릭 필터, 키워드 검색, 정렬
- 프로젝트 상세 — 이미지 갤러리(라이트박스), Changelog 타임라인, 좋아요 / 댓글
- devicon 기반 썸네일 플레이스홀더 (이미지 없을 때 기술 스택 아이콘 자동 표시)
- 관리자 전용 작성·수정·삭제

### 홈
- 히어로 섹션, 프로젝트 미리보기, 블로그 미리보기
- Skills / Experience / Education / Contact(EmailJS) 섹션

### 공통
- Supabase OAuth 인증 (Google · GitHub · Kakao)
- 다크모드 지원
- 동적 `sitemap.xml` + `robots.txt` (Next.js Metadata API)
- SEO — 페이지별 메타데이터, OG/Twitter Card
- Vercel Analytics
- 스켈레톤 로딩 UI
- Toast 알림 / ConfirmDialog

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Auth | Supabase Auth (`@supabase/ssr`) — Google / GitHub / Kakao OAuth |
| HTTP | Axios (모듈 레벨 토큰 관리) |
| Markdown | react-markdown + remark-gfm + rehype-highlight |
| Date | date-fns |
| Mail | EmailJS (`@emailjs/browser`) |
| Analytics | @vercel/analytics |
| Deploy | Vercel |
| CI | GitHub Actions (PR 시 lint + build) |

---

## 디렉토리 구조

```
app/
├── page.tsx                  # 홈 (SSR — 프로젝트·포스트 병렬 fetch)
├── layout.tsx                # 루트 레이아웃 (Navbar, 테마 Provider)
├── error.tsx                 # 루트 Error Boundary
├── not-found.tsx             # 404 페이지
├── sitemap.ts                # 동적 sitemap.xml (ISR 1h)
├── robots.ts                 # robots.txt
├── blog/
│   ├── page.tsx              # 블로그 목록 (SSR + CSR)
│   ├── BlogClient.tsx        # 검색·필터·정렬 CSR 클라이언트
│   ├── [id]/                 # 블로그 상세 (SSR + 클라이언트 컴포넌트)
│   └── new/                  # 게시글 작성 (관리자)
├── projects/
│   ├── page.tsx              # 프로젝트 목록 (SSR + CSR)
│   ├── ProjectsClient.tsx    # 검색·필터·정렬 CSR 클라이언트
│   ├── [id]/                 # 프로젝트 상세 (SSR + 클라이언트 컴포넌트)
│   └── new/                  # 프로젝트 작성 (관리자)
├── auth/callback/            # Supabase OAuth 콜백
├── login/                    # 로그인 페이지
├── api/[...path]/            # 백엔드 API 프록시 라우트
├── api/revalidate/           # ISR 수동 재검증 엔드포인트
└── debug/                    # 개발 전용 디버그 페이지

components/
├── Navbar.tsx                # 글로벌 Navbar (sticky, 스크롤 blur, 모바일 사이드 패널)
├── PostCard.tsx              # 블로그 카드
├── ProjectCard.tsx           # 프로젝트 카드 (썸네일 / devicon 플레이스홀더, 기술 스택 클릭 필터)
├── CommentSection.tsx        # 댓글 섹션 (CRUD + 페이지네이션)
├── LikeButton.tsx            # 좋아요 버튼
├── UpdateTimeline.tsx        # 프로젝트 Changelog 타임라인
├── ImageGallery.tsx          # 이미지 갤러리 + 라이트박스
├── ImageGalleryUploader.tsx  # 이미지 업로드 UI
├── EditorBar.tsx             # 게시글·프로젝트 에디터 공통 sticky 바
├── TechStackInput.tsx        # 기술 스택 태그 입력
├── ThumbnailUploader.tsx     # 썸네일 업로드
├── Skills.tsx                # 기술 스택 섹션
├── Experience.tsx            # 경력 섹션
├── Education.tsx             # 교육 섹션
├── Contact.tsx               # EmailJS 문의 폼
├── AuthButton.tsx            # 로그인/로그아웃 버튼
└── ui/
    ├── FormField.tsx         # label 래퍼 (required 지원)
    ├── Spinner.tsx           # 전체화면 로딩 스피너
    ├── ErrorAlert.tsx        # 에러 알림 박스
    ├── Toast.tsx             # 토스트 알림
    ├── ConfirmDialog.tsx     # 삭제 확인 다이얼로그
    ├── PostCardSkeleton.tsx  # 블로그 카드 스켈레톤
    └── ProjectCardSkeleton.tsx  # 프로젝트 카드 스켈레톤

lib/
├── api/
│   ├── client.ts            # Axios 인스턴스 (모듈 레벨 토큰 store)
│   ├── server.ts            # 서버 컴포넌트용 fetch 유틸
│   ├── posts.ts             # 블로그 포스트 API
│   ├── projects.ts          # 프로젝트 API
│   ├── comments.ts          # 댓글 API
│   ├── likes.ts             # 좋아요 API
│   └── updates.ts           # 프로젝트 Changelog API
├── data/
│   ├── skills.ts            # 기술 스택 정적 데이터
│   ├── experience.ts        # 경력 정적 데이터
│   └── education.ts         # 교육 정적 데이터
├── supabase/
│   ├── client.ts            # 브라우저용 Supabase 클라이언트
│   └── server.ts            # 서버용 Supabase 클라이언트
├── styles/
│   └── form.ts              # inputClass 공통 Tailwind 클래스
├── types/
│   └── api.ts               # 공용 타입 정의
└── utils/
    └── devicon.ts           # 기술 스택 → devicon URL 매핑

hooks/
├── useAuth.ts               # Supabase 세션 구독 + isAdmin 판단
├── useTheme.ts              # 다크/라이트 모드 토글
├── useDebounce.ts           # 검색 debounce
├── useToast.ts              # 토스트 알림 상태 관리
└── useUnsavedWarning.ts     # 폼 이탈 방지 경고
```

---

## 렌더링 전략

| 페이지 | 전략 | 비고 |
|--------|------|------|
| `/` (홈) | SSR | 프로젝트·포스트 병렬 fetch, SEO |
| `/blog` | SSR + CSR hybrid | 초기 데이터 SSR, 검색·필터·정렬 CSR |
| `/projects` | SSR + CSR hybrid | 초기 데이터 SSR, 필터·정렬 CSR |
| `/blog/[id]` | SSR | 본문 SEO, 좋아요·댓글은 클라이언트 컴포넌트 |
| `/projects/[id]` | SSR | 동일 |
| `/sitemap.xml` | ISR (1h) | 동적 생성, 블로그·프로젝트 URL 포함 |

---

## 인증 흐름

```
브라우저 → Supabase Auth (OAuth: Google / GitHub / Kakao)
              ↓ session
         onAuthStateChange → setAccessToken(session.access_token)
              ↓ (모듈 레벨 변수)
         Axios interceptor → Authorization: Bearer <token>
              ↓
         portfolio-backend (SupabaseJwtStrategy 검증)
```

- 매 요청마다 `getSession()` 비동기 호출 없이 동기적으로 토큰 참조 (병목 제거)
- 401 응답 + Authorization 헤더가 있었던 경우에만 강제 로그아웃 처리
- 관리자 판단: 세션 이메일이 `NEXT_PUBLIC_ADMIN_EMAILS` 목록에 포함된 경우

---

## 환경변수

`.env.local` 기준:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

NEXT_PUBLIC_API_URL=https://<prod-backend-domain>
NEXT_PUBLIC_API_URL_DEV=https://<dev-backend-domain>

NEXT_PUBLIC_ADMIN_EMAILS=email1@example.com,email2@example.com

NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>

NEXT_PUBLIC_EMAILJS_SERVICE_ID=<service-id>
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=<template-id>
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=<public-key>

REVALIDATE_SECRET=<secret>  # ISR 수동 재검증용 (서버 전용, NEXT_PUBLIC_ 아님)
```

---

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # 환경변수 설정
npm run dev                   # http://localhost:3000
npm run build                 # 프로덕션 빌드 검증
npm run lint                  # ESLint
```

---

## 배포 (Vercel)

Git 연동 자동 배포:

| 브랜치 | 배포 대상 |
|--------|-----------|
| `main` | Production |
| `develop` | Preview URL (Vercel 자동 생성) |

환경변수는 Vercel 대시보드 → **Settings > Environment Variables** 에서 관리.  
`REVALIDATE_SECRET`은 Vercel에서 **Sensitive** 타입으로 등록 (값 노출 방지).

---

## 브랜치 전략

```
main        → Production 배포
  └── develop     → Preview 배포, 통합 브랜치
        └── FRONT-N-이슈설명   → 기능·수정·리팩토링 단위 작업 브랜치
```

- feature → develop: **squash merge**
- develop → main: **regular merge** (릴리즈 단위)

---

## 모바일 반응형

Tailwind 브레이크포인트 기준 **모바일 퍼스트** 설계:

| prefix | 범위 | 비고 |
|--------|------|------|
| (없음) | 0px~ | 모바일 기본 |
| `sm:` | 640px~ | 태블릿 세로 |
| `md:` | 768px~ | 태블릿 가로 / 소형 데스크탑 |
| `lg:` | 1024px~ | 데스크탑 |
