# 🔐 세션 및 인증 문제 해결 가이드

## ❌ 발생한 문제

### 1. 세션 만료 문제
- 페이지 접근 시 `session_expired` 에러
- 로그인 후 얼마 지나면 자동 로그아웃
- "관리자만 접근 가능" 메시지 후 리다이렉트

### 2. OAuth 에러
- 로그인 페이지에서 `❌ OAuth 에러: session_expired` 표시

---

## 📚 Supabase 세션 동작 방식

### 세션 유지 기간

1. **Access Token (기본 1시간)**
   - API 요청에 사용되는 단기 토큰
   - 1시간 후 자동 만료

2. **Refresh Token (7일~30일)**
   - Access Token 갱신에 사용
   - 브라우저 localStorage에 저장
   - 설정에 따라 7일, 30일 등

3. **자동 갱신**
   - Supabase는 자동으로 Access Token을 갱신
   - Refresh Token이 유효한 동안 세션 유지
   - `onAuthStateChange`에서 `TOKEN_REFRESHED` 이벤트 발생

### 왜 어제 로그인하고 오늘도 로그인 상태인가?

```
[Day 1] 로그인
  ↓
Access Token 발급 (1시간 유효)
Refresh Token 발급 (7일 유효)
  ↓
localStorage에 저장
  ↓
[Day 2] 페이지 방문
  ↓
localStorage에서 토큰 읽기
  ↓
Access Token 만료됨
  ↓
Refresh Token으로 자동 갱신 ✅
  ↓
새로운 Access Token 발급
  ↓
계속 로그인 상태 유지
```

---

## ✅ 적용된 수정사항

### 1. `hooks/useAuth.ts` 개선

#### 추가된 기능:
- ✅ **에러 핸들링 강화**: 세션 확인 실패 시 적절한 처리
- ✅ **자동 갱신 로깅**: 토큰 갱신 이벤트 로그
- ✅ **5분마다 세션 체크**: 백그라운드에서 주기적 검증
- ✅ **Admin 체크 로깅**: 디버깅용 로그 추가

```typescript
// 세션 변경 리스너
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('🔄 Auth 상태 변경:', event, session?.user?.email)
  
  if (event === 'TOKEN_REFRESHED') {
    console.log('✅ 토큰 자동 갱신됨')
  } else if (event === 'SIGNED_OUT') {
    console.log('⚠️ 로그아웃됨')
  }
  
  setUser(session?.user ?? null)
  checkAdmin(session?.user?.email)
})

// 5분마다 세션 유효성 체크
setInterval(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    console.log('🔄 세션 유효성 체크 완료')
  }
}, 5 * 60 * 1000)
```

### 2. `app/blog/new/page.tsx` 개선

#### 추가된 기능:
- ✅ **세션 재확인**: 페이지 진입 시 세션 다시 체크
- ✅ **명확한 에러 메시지**: 왜 접근이 거부되었는지 표시
- ✅ **로딩 상태 개선**: 권한 체크 중 로딩 화면

```typescript
useEffect(() => {
  const checkAuthAndAdmin = async () => {
    if (loading) return
    
    // 세션 재확인
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    // 관리자 권한 확인
    if (!isAdmin) {
      console.log('❌ 관리자 권한 없음:', session.user.email)
      alert('관리자만 접근할 수 있습니다.')
      router.push('/blog')
      return
    }

    setAuthChecked(true)
  }

  checkAuthAndAdmin()
}, [loading, isAdmin, router])
```

---

## 🔧 Supabase 대시보드 설정 (선택)

### Refresh Token 유효기간 연장

1. **Supabase Dashboard** → **Authentication** → **Settings**
2. **JWT expiry (seconds)** 확인/수정
   - Access Token: 기본 3600초 (1시간)
   - Refresh Token: 기본 604800초 (7일)

3. **Refresh Token Reuse Interval** 설정
   - 토큰 재사용 방지 간격
   - 보안과 UX 균형 고려

### 권장 설정:
```
Access Token: 3600 (1시간) - 그대로 유지
Refresh Token: 2592000 (30일) - 더 긴 세션 원하면 증가
```

---

## 🐛 디버깅 방법

### 1. 브라우저 개발자 도구

```javascript
// Console에서 실행
// 현재 세션 확인
const { data, error } = await supabase.auth.getSession()
console.log('세션:', data.session)
console.log('사용자:', data.session?.user)

// localStorage 확인
console.log('저장된 토큰:', localStorage.getItem('sb-<project-ref>-auth-token'))
```

### 2. 로그 확인

페이지 새로고침 시 콘솔에서 확인:
```
🔄 Auth 상태 변경: INITIAL_SESSION user@example.com
🔑 Admin 체크: { email: 'user@example.com', isAdmin: true, adminEmails: [...] }
```

세션 갱신 시:
```
🔄 Auth 상태 변경: TOKEN_REFRESHED user@example.com
✅ 토큰 자동 갱신됨
```

---

## ⚠️ 주의사항

### 1. 환경 변수 확인
```bash
# .env.local
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com,admin@example.com
```

### 2. Supabase 설정 확인
- OAuth Providers 활성화 확인
- Redirect URLs 설정 확인
  - `https://portfolio-front-ten-gamma.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`

### 3. 일반적인 에러 원인

#### `session_expired`
- Refresh Token 만료
- localStorage 삭제됨
- 브라우저 시크릿 모드 사용

#### `관리자만 접근 가능`
- 이메일이 `NEXT_PUBLIC_ADMIN_EMAILS`에 없음
- 환경 변수 설정 안 됨
- 세션 만료 후 isAdmin=false

---

## 🚀 배포 후 확인사항

```bash
# 변경사항 커밋
git add .
git commit -m "fix: Improve session management and auth flow

- Add automatic token refresh monitoring
- Enhance admin permission check with session revalidation
- Add 5-minute session health check interval
- Improve error handling in authentication flow
- Add detailed logging for debugging"

git push origin main
```

### Vercel 환경 변수 확인
1. Vercel Dashboard → Settings → Environment Variables
2. `NEXT_PUBLIC_ADMIN_EMAILS` 설정 확인
3. Redeploy if needed

---

## 📝 FAQ

### Q1: 로그인 후 얼마나 세션이 유지되나요?
**A:** 기본적으로 7일간 유지됩니다. Refresh Token이 만료되기 전까지 자동 갱신됩니다.

### Q2: 브라우저를 닫으면 로그아웃되나요?
**A:** 아니요. localStorage에 토큰이 저장되어 있어서 브라우저를 다시 열어도 로그인 상태가 유지됩니다.

### Q3: 페이지를 오래 열어두면 어떻게 되나요?
**A:** Supabase가 자동으로 토큰을 갱신합니다. 추가로 5분마다 세션 유효성을 체크하도록 수정했습니다.

### Q4: OAuth 로그인과 이메일 로그인 차이는?
**A:** 세션 관리 방식은 동일합니다. 둘 다 Supabase의 JWT 토큰을 사용합니다.

---

**최종 수정일**: 2026-02-13  
**관련 파일**:
- `hooks/useAuth.ts`
- `app/blog/new/page.tsx`
- `app/login/page.tsx`
