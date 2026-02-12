# 🎨 Portfolio Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

> **Next.js 16** + **Supabase Auth** + **Axios** 기반 포트폴리오 & 블로그 프론트엔드

**🌐 배포 URL:**
- **Production**: https://portfolio-front-ten-gamma.vercel.app
- **Backend API**: http://158.180.75.205:3001

---

## ✨ 주요 기능

### 인증 (Authentication) ✅
- **Supabase OAuth**: Google, GitHub, 카카오톡 소셜 로그인
- **이메일 로그인**: 회원가입 / 로그인
- **세션 관리**: JWT 토큰 자동 갱신
- **관리자 모드**: 환경변수 기반 관리자 권한

### 포트폴리오 (Projects) ✅
- **목록 조회**: 페이징, 필터링 (상태별)
- **상세 보기**: 조회수, 좋아요, 댓글
- **작성/수정/삭제**: 관리자 전용 UI

### 블로그 (Posts) ✅
- **목록 조회**: 검색, 페이징
- **Markdown 렌더링**: react-markdown
- **작성 페이지**: 실시간 미리보기
- **작성/수정/삭제**: 관리자 전용 UI

### 댓글 (Comments) ✅
- **작성**: 로그인 사용자
- **삭제**: 본인 댓글만

### 좋아요 (Likes) ✅
- **토글**: 프로젝트/포스트 좋아요
- **실시간 카운트**: 즉시 반영

---

## 🛠️ 기술 스택

### Framework
- **Next.js**: 16.1.6 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.x

### Styling
- **Tailwind CSS**: 4.x
- **Dark Mode**: 지원

### State & Data
- **Supabase**: 인증, 사용자 관리
- **Axios**: HTTP 클라이언트
- **date-fns**: 날짜 포맷팅

### Deployment
- **Vercel**: 자동 배포 (main 브랜치)
- **Next.js API Routes**: 백엔드 프록시

---

## ⚡ Quick Start

### Prerequisites

```bash
Node.js 22+
npm 또는 pnpm
```

### Installation

```bash
# 1. 레포지토리 클론
git clone https://github.com/hsm9411/portfolio-frontend.git
cd portfolio-frontend

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.local.example .env.local
```

**.env.local 설정:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vcegupzlmopajpqxttfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_API_URL=/api

# 관리자 이메일 (쉼표로 구분)
NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com
```

### Run Development Server

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
│   ├── login/                   # 로그인 페이지
│   ├── register/                # 회원가입 페이지
│   ├── projects/                # 프로젝트 페이지
│   │   ├── page.tsx             # 목록
│   │   ├── [id]/                # 상세
│   │   └── new/                 # 작성 (관리자)
│   ├── blog/                    # 블로그 페이지
│   │   ├── page.tsx             # 목록
│   │   ├── [slug]/              # 상세
│   │   └── new/                 # 작성 (관리자)
│   ├── auth/                    # OAuth 콜백
│   │   └── callback/
│   ├── debug/                   # 디버그 페이지
│   └── api/                     # API Routes (프록시)
│       └── [...path]/
├── components/                  # 재사용 컴포넌트
│   ├── AuthButton.tsx           # 로그인/로그아웃 버튼
│   ├── ProjectCard.tsx          # 프로젝트 카드
│   ├── PostCard.tsx             # 포스트 카드
│   ├── CommentSection.tsx       # 댓글 섹션
│   └── LikeButton.tsx           # 좋아요 버튼
├── lib/                         # 유틸리티
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
├── .env.local                   # 환경 변수 (로컬)
├── next.config.ts               # Next.js 설정
├── tailwind.config.ts           # Tailwind 설정
├── tsconfig.json                # TypeScript 설정
└── README.md                    # 이 파일
```

---

## 🔐 Authentication Flow

### OAuth 로그인 (Google/GitHub/Kakao)

```
1. 사용자 → "Google로 계속하기" 클릭
2. Supabase OAuth → Google 로그인 페이지
3. 사용자 인증 → Supabase가 JWT 발급
4. /auth/callback → 세션 저장
5. 홈으로 리다이렉트 → "닉네임님" 표시
```

### 이메일 로그인

```
1. 사용자 → 이메일/비밀번호 입력
2. Supabase Auth → 검증
3. JWT 발급 → 로컬 저장
4. 홈으로 리다이렉트
```

### API 호출 시 JWT 전달

```typescript
// lib/api/client.ts
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})
```

---

## 🎨 주요 페이지

### 홈 (`/`)
- Recent Projects (최근 6개)
- Recent Posts (최근 3개)
- AuthButton (로그인/로그아웃)

### 프로젝트 목록 (`/projects`)
- 필터링: 전체/진행중/완료
- 페이징: 9개씩
- 관리자: "+ 프로젝트 작성" 버튼

### 프로젝트 작성 (`/projects/new`)
- 관리자 전용
- 폼: 제목, 요약, 설명, 링크, 기술스택, 태그, 상태

### 블로그 목록 (`/blog`)
- 검색: 제목/내용
- 페이징: 10개씩
- 관리자: "+ 포스트 작성" 버튼

### 블로그 작성 (`/blog/new`)
- 관리자 전용
- Markdown 에디터
- 실시간 미리보기

### 로그인 (`/login`)
- OAuth: Google, GitHub, 카카오톡
- 이메일: 이메일/비밀번호

### 회원가입 (`/register`)
- OAuth: Google, GitHub, 카카오톡
- 이메일: 닉네임, 이메일, 비밀번호

---

## 🚀 Deployment

### Vercel 자동 배포

```bash
# main 브랜치 푸시 → 자동 배포
git push origin main

# Vercel Dashboard에서 배포 상태 확인
# https://vercel.com/dashboard
```

### 환경 변수 (Vercel)

**필수 설정:**
```
NEXT_PUBLIC_SUPABASE_URL=https://vcegupzlmopajpqxttfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com
```

**설정 방법:**
1. Vercel Dashboard → 프로젝트 선택
2. Settings → Environment Variables
3. 각 변수 추가
4. Save → Redeploy

---

## 🧪 Development Commands

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 프로덕션 서버
npm run start

# 린트
npm run lint
```

---

## 📚 주요 라이브러리

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| Next.js | 16.1.6 | 프레임워크 |
| React | 19.2.3 | UI 라이브러리 |
| Supabase | 2.95.3 | 인증, DB |
| Axios | 1.13.5 | HTTP 클라이언트 |
| Tailwind CSS | 4.x | 스타일링 |
| react-markdown | 10.1.0 | Markdown 렌더링 |
| date-fns | 4.1.0 | 날짜 포맷팅 |

---

## 🐛 Troubleshooting

### 1. OAuth 로그인 시 홈으로 리다이렉트되지 않음

**원인**: OAuth 콜백 처리 문제

**해결**:
```typescript
// app/auth/callback/route.ts 확인
// exchangeCodeForSession 정상 작동 확인
```

### 2. API 요청 시 401 Unauthorized

**원인**: JWT 토큰이 백엔드로 전달되지 않음

**해결**:
```bash
# 브라우저 콘솔 확인
# "✅ JWT 토큰 추가됨" 로그 확인
# Authorization 헤더 확인
```

### 3. 관리자 기능이 보이지 않음

**원인**: NEXT_PUBLIC_ADMIN_EMAILS 미설정

**해결**:
```bash
# Vercel 환경 변수 추가
NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com

# Redeploy
```

---

## 📖 관련 문서

| 문서 | 설명 |
|------|------|
| `DEPLOY.md` | 배포 가이드 |
| `API_SPEC.md` | API 명세 |

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
style:    코드 포맷팅
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

**Last Updated**: 2026-02-12  
**Tech Stack**: Next.js 16 | React 19 | Supabase | Tailwind CSS 4 | Vercel
