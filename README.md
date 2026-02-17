# 🎨 Portfolio Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black)](https://vercel.com/)

> **Next.js 16 App Router** + **Supabase Auth** + **Axios** 기반 포트폴리오 & 블로그 프론트엔드

**🌐 Live Demo:**
- **Production**: https://portfolio-front-ten-gamma.vercel.app
- **Backend API**: http://158.180.75.205:3001

---

## ✨ 주요 기능

### 1. 인증 시스템 (Authentication)
- **Supabase OAuth**: Google, GitHub, Kakao 소셜 로그인
- **세션 관리**: JWT 토큰 자동 갱신 + localStorage 저장
- **자동 인증**: Axios Interceptor를 통한 Authorization 헤더 자동 주입
- **권한 관리**: 관리자 전용 UI (환경변수 기반)

### 2. 포트폴리오 (Projects)
- **목록 조회**: 페이징 + 상태별 필터링
- **상세 보기**: 조회수, 좋아요, 댓글, 기술 스택 표시
- **관리 기능**: 작성/수정/삭제 (관리자 전용)
- **반응형 디자인**: 모바일/태블릿/데스크톱 최적화

### 3. 블로그 (Posts)
- **목록 조회**: 검색 + 페이징
- **Markdown 렌더링**: react-markdown + 코드 하이라이팅
- **실시간 미리보기**: 작성 페이지 (관리자 전용)
- **SEO 최적화**: Slug 기반 URL

### 4. 인터랙션 (Comments & Likes)
- **댓글 시스템**: 로그인 사용자만 작성, 본인 댓글 삭제
- **좋아요 기능**: 실시간 카운트 + 토글 UI
- **사용자 피드백**: Toast 알림 (성공/에러)

### 5. Vercel API Routes (Proxy)
- **Mixed Content 해결**: HTTPS → HTTP 백엔드 프록시
- **보안 강화**: CORS 우회 없이 안전한 통신
- **자동 배포**: main 브랜치 푸시 시 Vercel 자동 배포

---

## 🛠️ 기술 스택

### Framework & Library
- **Next.js**: 16.1.6 (App Router, React Server Components)
- **React**: 19.2.3
- **TypeScript**: 5.x (Type-safe development)

### Styling
- **Tailwind CSS**: 4.x (Utility-first CSS)
- **Dark Mode**: 시스템 테마 자동 감지

### State & Data Management
- **Supabase**: 인증 + 사용자 관리
- **Axios**: HTTP 클라이언트 (Interceptor 패턴)
- **React Hooks**: useState, useEffect, Custom Hooks

### Utilities
- **react-markdown**: Markdown 렌더링
- **date-fns**: 날짜 포맷팅 (상대 시간 표시)

### Deployment
- **Vercel**: 자동 배포 + Edge Functions
- **Environment Variables**: Vercel Dashboard 관리

---

## ⚡ Quick Start

### Prerequisites
```bash
Node.js 22+
npm 또는 pnpm
Supabase 프로젝트 생성 (무료)
```

### 1. Installation
```bash
# 레포지토리 클론
git clone https://github.com/hsm9411/portfolio-frontend.git
cd portfolio-frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local
```

### 2. Environment Variables (.env.local)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vcegupzlmopajpqxttfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API (Vercel Proxy)
NEXT_PUBLIC_API_URL=/api

# 관리자 이메일 (쉼표로 구분)
NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com,admin@example.com
```

### 3. Run Development Server
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 📂 프로젝트 구조

```
portfolio-frontend/
├── app/                         # Next.js App Router
│   ├── page.tsx                 # 홈 페이지
│   ├── layout.tsx               # 루트 레이아웃
│   ├── globals.css              # Tailwind CSS
│   ├── login/                   # 로그인 페이지
│   │   └── page.tsx
│   ├── register/                # 회원가입 페이지
│   │   └── page.tsx
│   ├── projects/                # 프로젝트 페이지
│   │   ├── page.tsx             # 목록
│   │   ├── [id]/                # 상세
│   │   │   └── page.tsx
│   │   └── new/                 # 작성 (관리자)
│   │       └── page.tsx
│   ├── blog/                    # 블로그 페이지
│   │   ├── page.tsx             # 목록
│   │   ├── [slug]/              # 상세 (SEO 친화적)
│   │   │   └── page.tsx
│   │   └── new/                 # 작성 (관리자)
│   │       └── page.tsx
│   ├── auth/                    # OAuth 콜백
│   │   └── callback/
│   │       └── route.ts
│   └── api/                     # API Routes (Vercel Proxy)
│       └── [...path]/
│           └── route.ts
├── components/                  # 재사용 컴포넌트
│   ├── AuthButton.tsx           # 로그인/로그아웃 버튼
│   ├── ProjectCard.tsx          # 프로젝트 카드
│   ├── PostCard.tsx             # 포스트 카드
│   ├── CommentSection.tsx       # 댓글 섹션
│   └── LikeButton.tsx           # 좋아요 버튼
├── lib/                         # 유틸리티 & API
│   ├── api/                     # API 클라이언트
│   │   ├── client.ts            # Axios 인스턴스
│   │   ├── projects.ts          # Projects API
│   │   ├── posts.ts             # Posts API
│   │   ├── comments.ts          # Comments API
│   │   ├── likes.ts             # Likes API
│   │   └── auth.ts              # Auth API
│   └── supabase/                # Supabase 클라이언트
│       ├── client.ts            # 브라우저용
│       └── server.ts            # 서버용
├── hooks/                       # Custom Hooks
│   └── useAuth.ts               # 인증 상태 관리
├── public/                      # 정적 파일
│   ├── favicon.ico
│   └── images/
├── .env.local.example           # 환경 변수 템플릿
├── next.config.ts               # Next.js 설정
├── tailwind.config.ts           # Tailwind CSS 설정
├── tsconfig.json                # TypeScript 설정
├── vercel.json                  # Vercel 배포 설정
├── API_SPEC.md                  # API 명세 문서
├── DEPLOY.md                    # 배포 가이드
└── README.md                    # 이 파일
```

---

## 🔐 Authentication Flow

### OAuth 로그인 (Google/GitHub/Kakao)
```
1. 사용자 → "Google로 계속하기" 클릭
2. Supabase OAuth → Google 로그인 페이지
3. 사용자 인증 완료 → Supabase JWT 발급
4. /auth/callback → Session 저장
5. 홈으로 리다이렉트 → "닉네임님" 표시
```

### API 호출 시 JWT 자동 주입
```typescript
// lib/api/client.ts
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
    console.log('✅ JWT 토큰 추가됨');
  }
  return config;
});
```

### Vercel API Proxy (Mixed Content 해결)
```typescript
// app/api/[...path]/route.ts
export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname.replace('/api', '');
  const backendUrl = `http://158.180.75.205:3001${path}`;
  
  const response = await fetch(backendUrl, {
    headers: {
      Authorization: request.headers.get('Authorization') || '',
    },
  });
  
  return response;
}
```

**장점:**
- HTTPS → HTTP 안전한 통신
- CORS 문제 완전 해결
- JWT 토큰 자동 전달

---

## 🎨 주요 페이지

### 홈 (`/`)
- **Recent Projects**: 최신 프로젝트 6개 카드 표시
- **Recent Posts**: 최신 블로그 포스트 3개 카드 표시
- **AuthButton**: 로그인/로그아웃 버튼 (우측 상단)
- **전체보기 링크**: Projects/Blog 전체 목록으로 이동

### Projects 목록 (`/projects`)
- **필터링**: 전체/진행중/완료 버튼
- **페이징**: 9개씩 표시 + 이전/다음 버튼
- **관리자 UI**: "+ 프로젝트 작성" 버튼 (관리자만)
- **반응형**: Grid 레이아웃 (1~3 columns)

### Project 상세 (`/projects/[id]`)
- **프로젝트 정보**: 제목, 요약, 설명 (Markdown), 썸네일
- **기술 스택**: 태그 형태로 표시
- **링크 버튼**: 데모 보기, GitHub 링크
- **좋아요 버튼**: 로그인 시 토글 가능
- **댓글 섹션**: 로그인 시 작성 가능, 본인 댓글 삭제

### Blog 목록 (`/blog`)
- **검색 기능**: 제목/내용 검색
- **페이징**: 10개씩 표시
- **태그 표시**: 각 포스트의 태그 목록
- **관리자 UI**: "+ 포스트 작성" 버튼

### Blog Post 상세 (`/blog/[slug]`)
- **Markdown 렌더링**: react-markdown
- **메타 정보**: 작성자, 작성일, 조회수, 읽기 시간
- **좋아요 버튼**: 실시간 카운트
- **댓글 섹션**: 댓글 목록 + 작성 폼

### 관리자 페이지 (`/projects/new`, `/blog/new`)
- **권한 체크**: `NEXT_PUBLIC_ADMIN_EMAILS` 확인
- **폼 검증**: 필수 필드 + 에러 메시지
- **실시간 미리보기**: Markdown 에디터 (Blog)

---

## 🚀 Deployment

### Vercel 자동 배포
```bash
# main 브랜치 푸시 → 자동 배포
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main

# Vercel Dashboard에서 배포 상태 확인
# https://vercel.com/dashboard
```

### Environment Variables (Vercel)
**Vercel Dashboard → 프로젝트 → Settings → Environment Variables**

필수 설정:
```
NEXT_PUBLIC_SUPABASE_URL=https://vcegupzlmopajpqxttfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com
```

설정 후 **Redeploy** 필수!

---

## 🧪 Development Commands

```bash
# 개발 서버 (Hot Reload)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 (ESLint)
npm run lint

# 타입 체크
npx tsc --noEmit
```

---

## 📚 주요 라이브러리

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| Next.js | 16.1.6 | React 프레임워크 (App Router) |
| React | 19.2.3 | UI 라이브러리 |
| TypeScript | 5.x | 타입 안전성 |
| Tailwind CSS | 4.x | 유틸리티 CSS |
| Supabase | 2.95.3 | 인증 + DB |
| Axios | 1.13.5 | HTTP 클라이언트 |
| react-markdown | 10.1.0 | Markdown 렌더링 |
| date-fns | 4.1.0 | 날짜 포맷팅 |

---

## 🐛 Troubleshooting

### 1. OAuth 로그인 시 홈으로 리다이렉트 안 됨
**원인**: OAuth 콜백 처리 실패

**해결**:
```typescript
// app/auth/callback/route.ts 확인
// exchangeCodeForSession이 정상 동작하는지 확인
```

### 2. API 요청 시 401 Unauthorized
**원인**: JWT 토큰이 백엔드로 전달되지 않음

**해결**:
```bash
# 브라우저 콘솔 확인 (F12)
# "✅ JWT 토큰 추가됨" 로그 확인
# Network 탭에서 Authorization 헤더 확인
```

### 3. 관리자 기능이 보이지 않음
**원인**: `NEXT_PUBLIC_ADMIN_EMAILS` 미설정

**해결**:
```bash
# Vercel 환경 변수 추가
NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com

# Redeploy 후 확인
```

### 4. 빌드 에러 (TypeScript)
**원인**: 타입 불일치

**해결**:
```bash
# 타입 체크
npx tsc --noEmit

# 에러 메시지 확인 후 수정
```

### 5. Tailwind CSS 스타일 적용 안 됨
**원인**: Tailwind 설정 오류

**해결**:
```bash
# tailwind.config.ts 확인
# content 경로가 올바른지 확인

# 개발 서버 재시작
npm run dev
```

---

## 📖 관련 문서

| 문서 | 설명 |
|------|------|
| `DEPLOY.md` | 배포 가이드 (테스트 체크리스트 포함) |
| `API_SPEC.md` | 백엔드 API 명세 (Swagger 기반) |
| `.env.local.example` | 환경 변수 템플릿 |

---

## 🤝 Contributing

### Git Workflow
```bash
# Feature 개발
git checkout -b feature/new-feature
git commit -m "feat: 새로운 기능 추가"
git push origin feature/new-feature

# Pull Request → main 브랜치
```

### Commit Convention
```
feat:     새로운 기능 추가
fix:      버그 수정
docs:     문서 수정
style:    코드 포맷팅 (기능 변경 없음)
refactor: 코드 리팩토링
test:     테스트 추가
chore:    빌드/설정 변경
```

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**hsm9411**
- Email: haeha2e@gmail.com
- GitHub: [@hsm9411](https://github.com/hsm9411)

---

**Last Updated**: 2026-02-17  
**Status**: Production Ready ✅  
**Tech Stack**: Next.js 16 | React 19 | Supabase | Tailwind CSS 4 | Vercel
