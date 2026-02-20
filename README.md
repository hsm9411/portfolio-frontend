# 🎨 Portfolio Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black)](https://vercel.com/)

> **Next.js 16 App Router** + **Supabase Auth** + **Axios** 기반 포트폴리오 & 블로그 프론트엔드

**🌐 Live Demo:**
- **Production**: https://portfolio-front-ten-gamma.vercel.app
- **Backend API**: https://158.180.75.205 (Nginx HTTPS)

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
- **ID 기반 URL**: `/blog/{id}` (간단하고 명확한 라우팅)
- **카테고리 시스템**: 튜토리얼, 에세이, 리뷰, 뉴스
- **목록 조회**: 검색 + 페이징
- **Markdown 렌더링**: react-markdown + 코드 하이라이팅
- **실시간 미리보기**: 작성/수정 페이지 (관리자 전용)
- **읽기 시간**: 자동 계산된 예상 읽기 시간 표시

### 4. 인터랙션 (Comments & Likes)
- **댓글 시스템**: 로그인 사용자만 작성, 본인 댓글 삭제
- **좋아요 기능**: 실시간 카운트 + 토글 UI
- **사용자 피드백**: Toast 알림 (성공/에러)

---

## 🏗️ 아키텍처

### 전체 통신 흐름

```
사용자 브라우저
    ↓ HTTPS
Vercel (Next.js Frontend)
    ↓ HTTPS (No Mixed Content!)
OCI Server - Nginx (443)
    ↓ HTTP (내부 통신)
NestJS Backend (3000)
    ↓
Supabase PostgreSQL (portfolio schema) + Redis
```

**핵심:**
- ✅ **HTTPS → HTTPS**: Vercel → Nginx (443)
- ✅ **No Mixed Content**: 완전한 HTTPS 체인
- ✅ **No Vercel Proxy**: 직접 Backend HTTPS 호출
- ✅ **Nginx Reverse Proxy**: HTTPS 종료 + NestJS 프록시

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
- **Supabase**: 인증 전용 (OAuth)
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
git clone https://github.com/hsm9411/portfolio-frontend.git
cd portfolio-frontend
npm install
```

### 2. Environment Variables (.env.local)
```env
# Supabase (OAuth 전용)
NEXT_PUBLIC_SUPABASE_URL=https://vcegupzlmopajpqxttfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API (Direct HTTPS - No Proxy!)
NEXT_PUBLIC_API_URL=https://158.180.75.205

# 관리자 이메일 (쉼표로 구분)
NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com,admin@example.com
```

**중요:**
- `NEXT_PUBLIC_API_URL`은 **HTTPS URL**
- Vercel API Routes 프록시 사용 안 함
- Backend Nginx가 HTTPS 처리
- Supabase는 인증(OAuth)만 담당, 데이터는 Backend API 사용

### 3. Run Development Server

**로컬 개발 안 함** - Vercel Preview 또는 Production에서만 테스트

```bash
# 로컬 실행 (테스트용)
npm run dev

# Vercel 배포 (권장)
git push origin main  # 자동 배포
```

접속: http://localhost:3000

---

## 📂 프로젝트 구조

```
portfolio-frontend/
├── app/                         # Next.js App Router
│   ├── page.tsx                 # 홈 페이지 (Projects + Posts 미리보기)
│   ├── layout.tsx               # 루트 레이아웃 (전역 Navigation)
│   ├── globals.css              # Tailwind CSS
│   ├── login/                   # 로그인 페이지 (OAuth 버튼)
│   │   └── page.tsx
│   ├── projects/                # 프로젝트 페이지
│   │   ├── page.tsx             # 목록 (필터링, 페이징)
│   │   ├── [id]/                # 상세 (ID 기반)
│   │   │   └── page.tsx
│   │   └── new/                 # 작성 (관리자)
│   │       └── page.tsx
│   ├── blog/                    # 블로그 페이지
│   │   ├── page.tsx             # 목록 (검색, 페이징)
│   │   ├── [id]/                # 상세 (ID 기반) ✅ slug에서 변경
│   │   │   ├── page.tsx
│   │   │   └── edit/            # 수정 (관리자)
│   │   │       └── page.tsx
│   │   └── new/                 # 작성 (관리자, 카테고리 선택)
│   │       └── page.tsx
│   └── auth/                    # OAuth 콜백
│       └── callback/
│           └── route.ts
├── components/                  # 재사용 컴포넌트
│   ├── Navigation.tsx           # 전역 네비게이션 바
│   ├── AuthButton.tsx           # 로그인/로그아웃 버튼
│   ├── ProjectCard.tsx          # 프로젝트 카드
│   ├── PostCard.tsx             # 포스트 카드
│   ├── CommentSection.tsx       # 댓글 섹션
│   ├── LikeButton.tsx           # 좋아요 버튼
│   └── TechStackInput.tsx       # 태그 입력 컴포넌트
├── lib/                         # 유틸리티 & API
│   ├── api/                     # API 클라이언트
│   │   ├── client.ts            # Axios 인스턴스 (Interceptor)
│   │   ├── projects.ts          # Projects API
│   │   ├── posts.ts             # Posts API (ID 기반)
│   │   ├── comments.ts          # Comments API
│   │   ├── likes.ts             # Likes API
│   │   └── auth.ts              # Auth API
│   ├── types/                   # TypeScript 타입
│   │   └── api.ts               # Backend DTO 타입 정의
│   └── supabase/                # Supabase 클라이언트
│       ├── client.ts            # 브라우저용
│       └── server.ts            # 서버용
├── hooks/                       # Custom Hooks
│   └── useAuth.ts               # 인증 상태 관리
├── public/                      # 정적 파일
├── .env.local.example           # 환경 변수 템플릿
├── next.config.ts               # Next.js 설정
├── tailwind.config.ts           # Tailwind CSS 설정
├── tsconfig.json                # TypeScript 설정
├── vercel.json                  # Vercel 배포 설정
└── README.md                    # 이 파일
```

---

## 🔐 Authentication Flow

### OAuth 로그인 (Google/GitHub/Kakao)
```
1. 사용자 → "Google로 계속하기" 클릭
2. Supabase OAuth → Google 로그인 페이지
3. 사용자 인증 완료 → Supabase JWT 발급 (ES256)
4. /auth/callback → Session 저장 (localStorage)
5. 홈으로 리다이렉트 → "닉네임님" 표시
```

### API 호출 시 JWT 자동 주입
```typescript
// lib/api/client.ts
import axios from 'axios';
import { createClient } from '@/lib/supabase/client';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // https://158.180.75.205
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: JWT 토큰 자동 추가
api.interceptors.request.use(async (config) => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});

export default api;
```

### 통신 흐름

```
Frontend (Vercel HTTPS)
    ↓
axios.get('https://158.180.75.205/posts')
Header: Authorization: Bearer {Supabase JWT}
    ↓
Backend Nginx (443 HTTPS)
    ↓
NestJS (3000 HTTP)
    ├─ SupabaseJwtStrategy (jwks-rsa)
    ├─ JWT 검증 (ES256 비대칭키)
    ├─ portfolio.users 조회/생성
    └─ req.user 주입
    ↓
Response → Frontend
```

**장점:**
- ✅ 완전한 HTTPS 체인
- ✅ Mixed Content 문제 없음
- ✅ 직접 통신 (프록시 불필요)
- ✅ Nginx가 SSL/TLS 처리

---

## 🎨 주요 페이지

### 홈 (`/`)
- **Recent Projects**: 최신 프로젝트 6개 카드 표시
- **Recent Posts**: 최신 블로그 포스트 3개 카드 표시
- **Navigation Bar**: 전역 네비게이션 (Home, Projects, Blog, Login)
- **전체보기 링크**: `/projects`, `/blog`로 이동

### Projects 목록 (`/projects`)
- **필터링**: 전체/진행중/완료/보관 버튼
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
- **카테고리**: 튜토리얼, 에세이, 리뷰, 뉴스
- **관리자 UI**: "+ 포스트 작성" 버튼

### Blog Post 상세 (`/blog/[id]`)
- **ID 기반 URL**: `/blog/{uuid}` (slug 제거)
- **Markdown 렌더링**: react-markdown
- **메타 정보**: 작성자, 작성일, 조회수, 읽기 시간, 카테고리
- **좋아요 버튼**: 실시간 카운트
- **댓글 섹션**: 댓글 목록 + 작성 폼
- **관리자 액션**: 수정/삭제 버튼 (관리자만)

### 관리자 페이지 (`/projects/new`, `/blog/new`)
- **권한 체크**: `NEXT_PUBLIC_ADMIN_EMAILS` 확인
- **카테고리 선택**: 드롭다운 (튜토리얼/에세이/리뷰/뉴스)
- **폼 검증**: 필수 필드 (제목, 요약, 본문, 카테고리) + 에러 메시지
- **실시간 미리보기**: Markdown 에디터 토글 (편집 모드 ↔ 미리보기)
- **태그 입력**: TechStackInput 컴포넌트 (자동완성)

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
NEXT_PUBLIC_API_URL=https://158.180.75.205
NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com
```

**중요:**
- `NEXT_PUBLIC_API_URL`은 반드시 **HTTPS**
- Nginx가 443 포트에서 HTTPS 제공
- 설정 후 **Redeploy** 필수!

---

## 🧪 Development Commands

```bash
# 개발 서버 (테스트용)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행 (로컬)
npm run start

# 린트 (ESLint)
npm run lint

# 타입 체크
npx tsc --noEmit
```

**권장:** 로컬 개발 대신 Vercel Preview 사용

---

## 📚 주요 라이브러리

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| Next.js | 16.1.6 | React 프레임워크 (App Router) |
| React | 19.2.3 | UI 라이브러리 |
| TypeScript | 5.x | 타입 안전성 |
| Tailwind CSS | 4.x | 유틸리티 CSS |
| Supabase | 2.95.3 | OAuth 인증 전용 |
| Axios | 1.13.5 | HTTP 클라이언트 (Interceptor) |
| react-markdown | 10.1.0 | Markdown 렌더링 |
| date-fns | 4.1.0 | 날짜 포맷팅 |

---

## 🐛 Troubleshooting

### 1. API 요청 시 401 Unauthorized
**원인**: JWT 토큰이 백엔드로 전달되지 않음

**해결**:
```bash
# 브라우저 콘솔 확인 (F12)
# Network 탭에서 Authorization 헤더 확인
# Supabase Session 확인
```

### 2. CORS 에러 (발생하지 않아야 함)
**원인**: Backend CORS 설정 문제

**해결**:
```bash
# Backend .env 확인
CORS_ORIGINS=https://portfolio-front-ten-gamma.vercel.app

# Nginx 재시작
docker-compose restart nginx
```

### 3. 관리자 기능이 보이지 않음
**원인**: `NEXT_PUBLIC_ADMIN_EMAILS` 미설정

**해결**:
```bash
# Vercel 환경 변수 추가
NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com

# Redeploy
```

### 4. 다른 기기에서 글이 안 보임
**증상**: 본인 컴퓨터는 정상, 다른 컴퓨터는 빈 화면

**원인**: Backend Supabase RLS 설정 문제

**해결** (Backend에서):
```sql
-- RLS 비활성화
ALTER TABLE portfolio.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.projects DISABLE ROW LEVEL SECURITY;
```

**확인:**
```
1. F12 → Network 탭
2. /posts 요청 확인
3. Response에 데이터가 있는지 확인
4. Status Code 200인지 확인
```

### 5. SSL 인증서 오류 (Self-Signed)
**원인**: Backend가 Self-Signed 인증서 사용

**해결**:
```
브라우저에서 "안전하지 않음" 경고
→ 고급 → 계속 진행 클릭
(Dev 환경은 Self-Signed 인증서 사용)
```

### 6. Mixed Content 경고
**발생하지 않아야 함!**
- Vercel (HTTPS) → Backend (HTTPS)
- 만약 발생하면 `NEXT_PUBLIC_API_URL` 확인
  - ✅ `https://158.180.75.205`
  - ❌ `http://158.180.75.205`

---

## 📝 주요 변경 이력

### 2026-02-20
- ✅ Post URL을 slug 기반에서 **ID 기반**으로 변경
  - `/blog/[slug]` → `/blog/[id]`
  - SEO보다 단순성과 일관성 우선
- ✅ Post 작성/수정 페이지에 **카테고리 선택** 추가
  - 튜토리얼, 에세이, 리뷰, 뉴스
  - 드롭다운 UI 구현
- ✅ API 타입 정의 업데이트
  - `Post` 타입에서 `slug` 제거, `category` 추가
  - `is_published`, `reading_time` 등 필드 추가
- ✅ 전역 Navigation Bar 추가
  - 모든 페이지에서 일관된 네비게이션
- ✅ 다른 기기 접근 문제 해결
  - Backend RLS 비활성화로 해결

### 2026-02-17
- ✅ Supabase OAuth 전환 (Local 제거)
- ✅ Axios Interceptor 기반 JWT 자동 주입
- ✅ 환경변수 기반 관리자 권한

---

## 📖 관련 문서

| 문서 | 설명 |
|------|------|
| `DEPLOY.md` | 배포 가이드 (테스트 체크리스트 포함) |
| `.env.local.example` | 환경 변수 템플릿 |
| Backend README | Backend API 명세 및 구조 |

---

## 🤝 Contributing

### Git Workflow
```bash
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

**Last Updated**: 2026-02-20  
**Status**: Production Ready ✅  
**Tech Stack**: Next.js 16 | React 19 | Supabase OAuth | Tailwind CSS 4 | Vercel  
**Backend**: Nginx HTTPS (443) → NestJS (3000) → Supabase (portfolio schema)
