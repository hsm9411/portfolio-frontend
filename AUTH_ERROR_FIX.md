# 🔧 401 Unauthorized 및 Vercel 빌드 에러 해결

## ❌ 발생한 문제들

### 1. POST 요청 시 401 Unauthorized
```
POST https://portfolio-front-ten-gamma.vercel.app/api/projects
Status: 401 (Unauthorized)
```

### 2. Vercel 빌드 에러
```
Error: Invalid revalidate value "function(){...}" on "/blog/new"
```

---

## ✅ 해결 방법

### 1. 401 Unauthorized 해결

#### 문제 원인
- Vercel 프록시를 통해 Authorization 헤더가 전달되지 않거나
- Supabase JWT 토큰이 백엔드에서 제대로 검증되지 않음

#### 적용한 수정

**A. 에러 핸들링 강화 (`app/blog/new/page.tsx`, `app/projects/new/page.tsx`)**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  try {
    console.log('📤 포스트 생성 요청:', payload)
    const response = await api.post('/posts', payload)
    console.log('✅ 포스트 생성 성공:', response.data)
    
    alert('포스트가 작성되었습니다!')
    router.push(`/blog/${response.data.slug}`)
  } catch (err: any) {
    console.error('❌ 포스트 작성 실패:', err)
    
    // ✅ 401 에러 시 명확한 안내
    if (err.statusCode === 401) {
      setError('로그인이 필요합니다. 다시 로그인해주세요.')
      setTimeout(() => router.push('/login'), 2000)
    } 
    // ✅ 403 에러 시 권한 안내
    else if (err.statusCode === 403) {
      setError('권한이 없습니다. 관리자만 포스트를 작성할 수 있습니다.')
    } 
    else {
      setError(err.message || '포스트 작성에 실패했습니다.')
    }
  }
}
```

**B. 디버깅 로그 추가**

프론트엔드와 백엔드 모두에서 로그를 확인할 수 있도록 했습니다:

```typescript
// lib/api/client.ts - Request Interceptor
console.log('[API Request]', config.method?.toUpperCase(), config.url, {
  hasAuth: !!config.headers.Authorization,
})

// Response Error Logging
console.error('[API Response Error]', {
  url: error.config?.url,
  status: error.response?.status,
  message: error.response?.data?.message,
  hasAuth: !!error.config?.headers?.Authorization,
})
```

### 2. Vercel 빌드 에러 해결

#### 문제 원인
```typescript
// ❌ 잘못된 코드
export const dynamic = 'force-dynamic'
export const revalidate = 0  // 함수로 잘못 인식됨
```

#### 해결 방법

**`export const revalidate` 제거**

Next.js App Router에서 `'use client'` 컴포넌트는:
- `export const dynamic = 'force-dynamic'` 불필요 (이미 클라이언트 사이드)
- `export const revalidate` 사용 불가

```typescript
// ✅ 수정된 코드
'use client'

// export const dynamic = 'force-dynamic'  // 제거
// export const revalidate = 0              // 제거

export default function NewPostPage() {
  // ...
}
```

**Client Component는 이미 동적입니다!**
- `'use client'` 디렉티브만으로 충분
- 빌드 시 pre-render되지 않고 클라이언트에서만 실행
- Supabase 클라이언트를 안전하게 사용 가능

---

## 🔍 디버깅 가이드

### 401 에러 발생 시 확인 사항

1. **브라우저 개발자 도구 → Network 탭**
   ```
   Request Headers:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   - Authorization 헤더가 있는지 확인
   - Bearer 토큰이 포함되어 있는지 확인

2. **Console 로그 확인**
   ```
   ✅ JWT 토큰 추가: eyJhbGciOiJIUzI1NiIs...
   [API Request] POST /posts { hasAuth: true }
   ```

3. **세션 확인**
   ```javascript
   // Console에서 실행
   const supabase = createClient()
   const { data } = await supabase.auth.getSession()
   console.log('Session:', data.session)
   console.log('Access Token:', data.session?.access_token)
   ```

4. **백엔드 로그 확인**
   ```bash
   # SSH로 OCI 서버 접속
   ssh ubuntu@158.180.75.205
   
   # PM2 로그 확인
   pm2 logs portfolio-backend
   ```

### 백엔드에서 확인할 사항

```typescript
// portfolio-backend/src/modules/auth/strategies/supabase-jwt.strategy.ts
async validate(payload: any): Promise<User> {
  console.log('🔐 Supabase JWT Payload:', payload)
  
  const supabaseUserId = payload.sub
  const email = payload.email
  
  console.log('👤 사용자 조회:', { supabaseUserId, email })
  
  // ...
}
```

---

## 📝 수정된 파일 목록

1. ✅ `app/blog/new/page.tsx` - revalidate 제거, 에러 핸들링 강화
2. ✅ `app/projects/new/page.tsx` - revalidate 제거, 에러 핸들링 강화
3. ✅ `lib/api/client.ts` - 이미 정상 (JWT 자동 추가 로직 있음)
4. ✅ `vercel.json` - 이미 정상 (Authorization 헤더 허용)

---

## 🚀 배포

```bash
git add .
git commit -m "fix: Remove invalid revalidate export and improve auth error handling

- Remove 'export const revalidate' from client components
- Add detailed error messages for 401/403 errors  
- Add debugging logs for API requests
- Auto-redirect to login on 401 errors"

git push origin main
```

---

## 🔧 추가 조치 (필요시)

### A. 백엔드 CORS 설정 확인

백엔드 `.env` 파일에 프론트엔드 도메인이 있는지 확인:

```bash
# portfolio-backend/.env
CORS_ORIGINS=https://portfolio-front-ten-gamma.vercel.app,http://localhost:3000
```

### B. Supabase Dashboard 설정 확인

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Site URL**: `https://portfolio-front-ten-gamma.vercel.app`
3. **Redirect URLs** 추가:
   ```
   https://portfolio-front-ten-gamma.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```

### C. 환경 변수 확인

**Vercel Dashboard** → **Settings** → **Environment Variables**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com
```

---

## 📖 테스트 시나리오

### 1. 로그인 → 포스트 작성 플로우

```
1. /login 접속
2. Google/GitHub OAuth 로그인
3. 홈으로 리다이렉트
4. /blog/new 접속
5. 포스트 작성
   ↓
Console: ✅ JWT 토큰 추가
Console: 📤 포스트 생성 요청
Console: ✅ 포스트 생성 성공
   ↓
/blog/{slug}로 리다이렉트 ✅
```

### 2. 401 에러 발생 시

```
1. 세션 만료 상태에서 /blog/new 접속
2. 포스트 작성 시도
   ↓
Console: ❌ 포스트 작성 실패: { statusCode: 401 }
화면: "로그인이 필요합니다. 다시 로그인해주세요."
   ↓
2초 후 /login으로 자동 리다이렉트 ✅
```

### 3. 403 에러 발생 시 (관리자 아닌 사용자)

```
1. 일반 사용자로 로그인
2. /blog/new 접속 (URL 직접 입력)
   ↓
Alert: "관리자만 접근할 수 있습니다."
/blog로 리다이렉트 ✅
```

---

## ⚠️ 주의사항

1. **Client Component는 `export const revalidate` 사용 불가**
   - `'use client'`는 이미 동적 렌더링
   - Server Component에서만 revalidate 사용 가능

2. **401 vs 403 차이**
   - 401: 인증 안 됨 (토큰 없음/만료)
   - 403: 인증은 되었지만 권한 없음

3. **Vercel 프록시 제한**
   - Vercel Rewrites는 10초 타임아웃
   - 긴 요청은 백엔드 직접 호출 고려

---

**최종 수정일**: 2026-02-13  
**배포 URL**: https://portfolio-front-ten-gamma.vercel.app  
**백엔드 URL**: http://158.180.75.205:3001
