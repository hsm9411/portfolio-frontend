# portfolio-frontend

Next.js 기반 포트폴리오 & 기술 블로그 프론트엔드.  
Vercel에 배포되며, `portfolio-backend` (NestJS / Oracle Cloud)와 REST API로 통신한다.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Auth | Supabase Auth (`@supabase/ssr`) |
| HTTP | Axios (모듈 레벨 토큰 관리) |
| Markdown | react-markdown + remark-gfm |
| Mail | EmailJS (`@emailjs/browser`) |
| Deploy | Vercel |

---

## 프로젝트 구조

```
app/
├── page.tsx              # 홈 (SSR — 프로젝트·포스트 병렬 fetch)
├── blog/                 # 블로그 목록 / 상세 / 작성 / 수정
├── projects/             # 프로젝트 목록 / 상세 / 작성 / 수정
├── auth/                 # OAuth 콜백 처리
├── login/                # 로그인 페이지
├── debug/                # 개발용 디버그 페이지
└── globals.css           # 전역 스타일 (Tailwind + .markdown-body)

components/
├── Navbar.tsx            # 글로벌 Navbar (sticky, 스크롤 blur, 모바일 사이드 패널)
├── PostCard.tsx          # 블로그 카드 (썸네일 + 메타)
├── ProjectCard.tsx       # 프로젝트 카드 (썸네일 / devicon 플레이스홀더)
├── Skills.tsx            # Skills 섹션
├── Experience.tsx        # 경력 섹션
├── Education.tsx         # 교육 섹션
├── Contact.tsx           # EmailJS 문의 폼
├── AuthButton.tsx        # 로그인/로그아웃 버튼
├── LikeButton.tsx        # 좋아요 버튼 (클라이언트)
├── CommentSection.tsx    # 댓글 섹션 (클라이언트)
└── ...

lib/
├── api/
│   ├── client.ts         # Axios 인스턴스 (모듈 레벨 토큰 store)
│   ├── server.ts         # 서버 컴포넌트용 fetch 함수
│   ├── posts.ts          # 포스트 API
│   ├── projects.ts       # 프로젝트 API
│   ├── comments.ts       # 댓글 API
│   └── likes.ts          # 좋아요 API
├── supabase/             # Supabase 클라이언트 (client / server)
├── types/                # 공통 타입 정의
└── utils/                # 유틸 함수 (devicon 등)

hooks/
├── useAuth.ts            # 인증 상태 + isAdmin 판단
└── useTheme.ts           # 다크모드 토글
```

---

## 인증 흐름

```
브라우저 → Supabase Auth (OAuth: Google / GitHub)
              ↓ session
         onAuthStateChange → setAccessToken(session.access_token)
              ↓ (모듈 레벨 변수)
         Axios interceptor → Authorization: Bearer <token>
              ↓
         portfolio-backend (SupabaseJwtStrategy 검증)
```

- 매 요청마다 `getSession()` 비동기 호출 없이 동기적으로 토큰 참조 (병목 제거)
- 401 응답 + Authorization 헤더가 있었던 경우에만 강제 로그아웃 처리

---

## 렌더링 전략

| 페이지 | 전략 | 이유 |
|--------|------|------|
| `/` (홈) | SSR | 프로젝트·포스트 병렬 fetch, SEO |
| `/blog` | SSR + CSR hybrid | 초기 데이터 SSR, 검색·페이지네이션 CSR |
| `/projects` | SSR + CSR hybrid | 초기 데이터 SSR, 상태 필터 CSR |
| `/blog/[id]` | SSR (서버컴포넌트 fetch) | 본문 SEO, 좋아요·댓글은 클라이언트 |
| `/projects/[id]` | SSR | 동일 |

---

## 환경변수

`.env.local` 기준:

```env
NEXT_PUBLIC_API_URL=https://<backend-domain>
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_EMAILJS_SERVICE_ID=<service-id>
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=<template-id>
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=<public-key>
```

---

## 로컬 실행

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # 프로덕션 빌드 검증
```

---

## 배포 (Vercel)

Git 연동 자동 배포:

| 브랜치 | 배포 대상 |
|--------|-----------|
| `main` | Production (`https://hsm9411.vercel.app` 또는 커스텀 도메인) |
| `develop` | Preview URL (Vercel 자동 생성) |

`vercel.json`:
```json
{
  "buildCommand": "npm run build"
}
```

환경변수는 Vercel 대시보드 → **Settings > Environment Variables** 에서 관리.  
`NEXT_PUBLIC_*` 변수는 Production / Preview / Development 환경에 모두 등록해야 빌드가 정상 동작한다.

---

## 브랜치 전략

```
main        → Production 배포 (Vercel)
develop     → Preview 배포 (Vercel) — 기능 개발 기본 브랜치
feature/*   → 기능 단위 개발 → develop PR
```

---

## 모바일 반응형 기준

Tailwind 브레이크포인트 기준:

| prefix | 범위 | 비고 |
|--------|------|------|
| (없음) | 0px~ | 모바일 기본 |
| `sm:` | 640px~ | 태블릿 세로 |
| `md:` | 768px~ | 태블릿 가로 / 소형 데스크탑 |
| `lg:` | 1024px~ | 데스크탑 |

설계 원칙: **모바일 퍼스트** — 기본값을 모바일 기준으로 작성하고 `sm:` / `md:`로 확장.

주요 적용 지점:
- 섹션 패딩: `py-12 md:py-20`
- 카드 내부 패딩: `p-4 sm:p-6 md:p-8`
- 제목: `text-2xl md:text-3xl` / `text-3xl sm:text-4xl md:text-5xl`
- PostCard 썸네일: `w-[110px] sm:w-[150px] md:w-[170px]`
- `.markdown-body`: 모바일 `0.9375rem`, `sm:` 이상 `1rem`으로 미디어쿼리 분기
