# 📘 Portfolio Frontend 가이드

> 이 문서는 프론트엔드 개발, 배포, 문제 해결을 위한 통합 가이드입니다.

---

## 🚀 빠른 시작

### 1. 개발 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local

# 개발 서버 시작
npm run dev
```

### 2. 환경 변수 (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vcegupzlmopajpqxttfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_API_URL=/api

# 관리자
NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com
```

---

## 🔐 인증 시스템

### OAuth 설정 (Google/GitHub/Kakao)

**Supabase Dashboard**:
```
1. Authentication → Providers
2. Google/GitHub/Kakao 활성화
3. Client ID, Secret 입력
4. Redirect URLs:
   - https://vcegupzlmopajpqxttfo.supabase.co/auth/v1/callback
   - https://your-domain.vercel.app/auth/callback
```

### 이메일 인증 비활성화 (테스트용)

```
Authentication → Providers → Email
→ "Confirm email" 토글 OFF
→ Save
```

---

## 🛠️ API 연동

### Axios 설정

**자동 JWT 토큰 추가**:
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

### Next.js API Routes 프록시

**백엔드 호출 경로**:
```
Frontend: /api/projects
  ↓
Next.js API Route: app/api/[...path]/route.ts
  ↓
Backend: http://158.180.75.205:3001/projects
```

**장점**:
- CORS 문제 해결
- Authorization 헤더 안전하게 전달
- Vercel 환경에서 안정적 작동

---

## 👑 관리자 기능

### 관리자 판별

**환경 변수**:
```env
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,admin2@example.com
```

**useAuth 훅**:
```typescript
const { user, isAdmin } = useAuth()

if (isAdmin) {
  // 관리자 전용 UI 표시
}
```

### 관리자 전용 페이지

- `/projects/new` - 프로젝트 작성
- `/blog/new` - 포스트 작성
- 프로젝트/포스트 수정/삭제 버튼

---

## 🚀 배포

### Vercel 자동 배포

```bash
# main 브랜치 푸시
git push origin main

# Vercel에서 자동 빌드 및 배포
```

### 환경 변수 설정 (Vercel)

```
1. Vercel Dashboard → Settings → Environment Variables
2. 추가:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_API_URL=/api
   - NEXT_PUBLIC_ADMIN_EMAILS
3. Save → Redeploy
```

---

## 🐛 문제 해결

### 1. OAuth 로그인 시 홈으로 안 가는 문제

**증상**: Google 로그인 후 그대로 로그인 페이지에 남음

**원인**: `/auth/callback` 처리 문제

**해결**:
```typescript
// app/auth/callback/route.ts
const { data, error } = await supabase.auth.exchangeCodeForSession(code)
if (error) {
  return NextResponse.redirect(`${origin}/login?error=${error.message}`)
}
return NextResponse.redirect(origin)
```

### 2. API 401 Unauthorized

**증상**: 프로젝트 작성 시 401 에러

**원인**: JWT 토큰이 백엔드로 전달 안 됨

**확인**:
```javascript
// 브라우저 콘솔
✅ JWT 토큰 추가됨: eyJhbGc...
[API Request] POST /projects { hasAuth: true }
```

**해결**:
- Next.js API Routes 프록시 사용 (app/api/[...path]/route.ts)
- Authorization 헤더 명시적 전달

### 3. 관리자 버튼이 안 보임

**증상**: 로그인했는데 "+ 프로젝트 작성" 버튼 없음

**원인**: `NEXT_PUBLIC_ADMIN_EMAILS` 미설정

**해결**:
```bash
# Vercel 환경 변수 추가
NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com

# Redeploy
```

### 4. Posts 500 에러

**증상**: 블로그 목록 500 에러

**원인**: 백엔드 Entity 컬럼명 매핑 문제

**해결**: 백엔드에서 Post Entity 수정 필요
```typescript
@Column({ name: 'view_count', default: 0 })
viewCount: number;
```

---

## 📊 디버그 페이지

### /debug 접속

**확인 사항**:
- 로그인 상태
- 사용자 정보 (ID, Email, Provider)
- OAuth 테스트 버튼
- 환경변수 확인

**활용**:
- 로그인 문제 진단
- JWT 토큰 확인
- OAuth Provider 설정 확인

---

## 🎨 커스터마이징

### Tailwind CSS

**다크모드**:
```tsx
<div className="bg-white dark:bg-gray-800">
  <h1 className="text-gray-900 dark:text-white">제목</h1>
</div>
```

### 컴포넌트 재사용

**AuthButton**:
```tsx
import AuthButton from '@/components/AuthButton'

<AuthButton />
```

**LikeButton**:
```tsx
<LikeButton 
  targetType="project" 
  targetId={projectId} 
  initialLikeCount={likeCount} 
/>
```

---

## 📝 코딩 규칙

### TypeScript

- 모든 컴포넌트 타입 정의
- API 응답 타입 정의
- any 사용 최소화

### 컴포넌트

- Client Component: `'use client'` 명시
- Server Component: 기본값
- Props 인터페이스 정의

### API 호출

```typescript
// ✅ Good
const response = await api.get<Project>('/projects/123')
const project = response.data

// ❌ Bad
const response = await api.get('/projects/123')
const project = response.data // 타입 불명확
```

---

## 🔗 참고 링크

- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Vercel 배포 가이드](https://vercel.com/docs)

---

**Last Updated**: 2026-02-12
