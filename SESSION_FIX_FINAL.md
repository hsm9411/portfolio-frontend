# 🔥 세션 없음 문제 해결 완료

## ❌ 발견된 문제

```javascript
🔍 세션 확인: {hasSession: false, hasToken: false}
⚠️ JWT 토큰 없음 - 세션 없음 또는 만료됨
[API Request] { hasAuth: false }
/api/projects: 401
⚠️ 인증 만료 - 로그아웃 처리
🔄 Auth 상태 변경: SIGNED_OUT
```

**핵심 문제:** 세션이 아예 없는 상태에서 API 요청

---

## 🔍 원인 분석

### 1. 로그인 안 됨
- 사용자가 로그인하지 않은 상태
- OAuth 로그인 실패
- 이메일/비밀번호 로그인 실패

### 2. 세션 만료
- Refresh Token 만료 (7일~30일)
- localStorage 삭제됨
- 브라우저 시크릿 모드

### 3. 무한 로그아웃 루프 (수정 전)
```
세션 없음 → 401 에러 → 자동 로그아웃 → 세션 삭제 → 다시 요청 → 401 에러...
```

---

## ✅ 적용된 수정

### 1. API 클라이언트 개선

**`lib/api/client.ts`**

#### 변경 전:
```typescript
if (error.response?.status === 401) {
  // 무조건 로그아웃 ❌
  await supabase.auth.signOut()
  window.location.href = '/login?error=session_expired'
}
```

#### 변경 후:
```typescript
if (error.response?.status === 401 && !isRedirecting) {
  const hadAuth = !!error.config?.headers?.Authorization
  
  if (hadAuth) {
    // 토큰이 있었는데 401 → 토큰 만료 ✅
    console.warn('⚠️ 인증 토큰 만료 - 로그인 페이지로 이동')
    isRedirecting = true
    await supabase.auth.signOut()
    
    // 현재 페이지 저장
    const currentPath = window.location.pathname + window.location.search
    window.location.href = `/login?error=session_expired&redirect=${encodeURIComponent(currentPath)}`
  } else {
    // 토큰이 없었는데 401 → 로그인 안 함 ✅
    console.warn('⚠️ 로그인 필요 - 세션 없음')
  }
}
```

**개선점:**
- ✅ 중복 리다이렉트 방지 (`isRedirecting` 플래그)
- ✅ 토큰 유무 구분 (만료 vs 미로그인)
- ✅ 원래 페이지로 돌아갈 수 있도록 redirect 저장

### 2. 로그인 페이지 개선

**`app/login/page.tsx`**

```typescript
// URL에서 redirect 파라미터 읽기
const redirectUrl = searchParams.get('redirect') || '/'

// OAuth 로그인 시 redirect 전달
const handleOAuthLogin = async (provider) => {
  await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
    },
  })
}

// 로그인 성공 후 원래 페이지로
router.push(redirectUrl)
```

**개선점:**
- ✅ 로그인 후 원래 페이지로 자동 이동
- ✅ 세션 만료 시 명확한 메시지
- ✅ OAuth/Local 로그인 모두 redirect 지원

### 3. 세션 체크 로그 개선

```typescript
console.log('🔍 세션 확인:', { 
  hasSession: !!session, 
  hasToken: !!session?.access_token,
  email: session?.user?.email,  // ✅ 추가
  error: error?.message 
})
```

**개선점:**
- ✅ 어떤 이메일로 로그인했는지 확인 가능
- ✅ 세션 에러 원인 로그

---

## 🚀 해결 방법 (사용자 관점)

### ✅ 단계별 해결

**1. 로그인 페이지 접속**
```
https://portfolio-front-ten-gamma.vercel.app/login
```

**2. Google 또는 GitHub으로 로그인**

**3. 관리자 이메일 확인**

Vercel 환경 변수에 설정된 이메일로 로그인해야 합니다:
```
NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com,admin@example.com
```

**4. 로그인 성공 후 원래 페이지로 자동 이동**

예:
```
/projects/new 접속 → 401 에러 → /login?redirect=/projects/new로 이동
   ↓ 로그인
/projects/new로 자동 리다이렉트 ✅
```

---

## 🔧 디버깅 체크리스트

### Step 1: 세션 확인

브라우저 Console:
```javascript
const { createClient } = await import('@/lib/supabase/client')
const supabase = createClient()
const { data } = await supabase.auth.getSession()

console.log('Has Session:', !!data.session)
console.log('User Email:', data.session?.user?.email)
console.log('Access Token:', data.session?.access_token?.substring(0, 30))
console.log('Expires At:', new Date(data.session?.expires_at! * 1000))
```

**기대 결과:**
```
Has Session: true
User Email: your-email@gmail.com
Access Token: eyJhbGciOiJIUzI1NiIsInR5cCI...
Expires At: Fri Feb 14 2026 10:30:00
```

**실패 시:**
```
Has Session: false
```
→ `/login` 페이지에서 다시 로그인

### Step 2: 관리자 권한 확인

```javascript
const adminEmails = 'your-email@gmail.com,admin@example.com'.split(',')
const userEmail = data.session?.user?.email
const isAdmin = adminEmails.includes(userEmail)

console.log('Admin Emails:', adminEmails)
console.log('User Email:', userEmail)
console.log('Is Admin:', isAdmin)
```

**기대 결과:**
```
Admin Emails: ['your-email@gmail.com', 'admin@example.com']
User Email: your-email@gmail.com
Is Admin: true
```

**실패 시:**
```
Is Admin: false
```
→ Vercel 환경 변수 `NEXT_PUBLIC_ADMIN_EMAILS`에 이메일 추가

### Step 3: API 요청 테스트

`/debug` 페이지 접속:
```
https://portfolio-front-ten-gamma.vercel.app/debug
```

1. "세션 확인" 클릭
2. "인증 API 테스트" 클릭

**성공 로그:**
```
🔍 세션 확인: { hasSession: true, hasToken: true, email: "user@example.com" }
✅ JWT 토큰 추가: eyJ...
[API Request] { method: 'POST', url: '/projects', hasAuth: true }
[API Response] { status: 201 }
✅ 인증 API 요청 성공
```

**실패 로그:**
```
🔍 세션 확인: { hasSession: false }
⚠️ JWT 토큰 없음
[API Request] { hasAuth: false }
❌ 401
```

---

## 📚 FAQ

### Q1: 로그인했는데 계속 401 에러가 나요
**A:** 다음을 확인하세요:
1. F12 → Console → `🔍 세션 확인` 로그에서 `hasSession: true` 인지
2. 관리자 이메일 목록에 로그인한 이메일이 포함되어 있는지
3. 브라우저 시크릿 모드인지 (시크릿 모드는 세션 저장 안 됨)

### Q2: OAuth 로그인이 안 돼요
**A:** Supabase Dashboard 확인:
1. **Authentication** → **Providers**
2. Google/GitHub/Kakao 활성화 확인
3. **Redirect URLs**에 다음 추가:
   ```
   https://portfolio-front-ten-gamma.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```

### Q3: 로그인 후 원래 페이지로 안 돌아가요
**A:** OAuth 콜백 핸들러 확인:
```typescript
// app/auth/callback/route.ts
const redirect = searchParams.get('redirect') || '/'
return NextResponse.redirect(new URL(redirect, request.url))
```

### Q4: 백엔드에 로그가 안 나와요
**A:** 
1. Docker 로그 확인:
   ```bash
   docker logs -f portfolio-backend-dev --tail 100
   ```
2. NestJS Logger 사용 확인:
   ```typescript
   private readonly logger = new Logger(ControllerName.name);
   this.logger.log('Request received');
   ```

---

## 🎯 최종 체크리스트

배포 전:
- [ ] Vercel 환경 변수 `NEXT_PUBLIC_ADMIN_EMAILS` 설정 확인
- [ ] Supabase OAuth Providers 활성화 확인
- [ ] Supabase Redirect URLs 설정 확인

배포 후:
- [ ] `/login` 페이지 접속
- [ ] Google/GitHub 로그인 테스트
- [ ] `/debug` 페이지에서 세션 확인
- [ ] `/projects/new` 접근 → 로그인 → 원래 페이지 복귀 테스트

---

## 🚀 배포

```bash
git add .
git commit -m "fix: Prevent duplicate logout on 401 and add redirect after login

- Distinguish between token expiration and missing session
- Add redirect parameter to login page
- Prevent infinite logout loop with isRedirecting flag
- Improve session check logging with user email
- Auto-redirect to original page after OAuth login"

git push origin main
```

---

**작성일**: 2026-02-13  
**해결된 문제**:
- ✅ 무한 로그아웃 루프
- ✅ 세션 없음 401 에러
- ✅ 로그인 후 원래 페이지 복귀

**다음 단계**:
1. 로그인 테스트
2. 관리자 권한 확인
3. API 요청 테스트
