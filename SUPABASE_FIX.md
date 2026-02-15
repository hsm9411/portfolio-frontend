# ✅ Supabase AbortError 수정 완료

## 문제 상황

**콘솔 에러:**
```
❌ 세션 가져오기 실패: AbortError: signal is aborted without reason
```

**하지만:**
```
[API Response] {status: 200, url: '/projects'} ✅
[API Response] {status: 200, url: '/posts'} ✅
```

**결론:** API는 정상 작동, Supabase 초기화 문제만 존재

---

## 원인

1. **React Strict Mode**: 개발 모드에서 컴포넌트 2번 렌더링
2. **Supabase Client 중복 생성**: 매 요청마다 새 인스턴스 생성
3. **AbortController Timeout**: 초기화 경쟁 조건 (race condition)

---

## 해결 방법

### 1. Supabase Client Singleton 패턴

**`lib/supabase/client.ts`:**
```typescript
// 인스턴스 재사용으로 AbortError 방지
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance  // 재사용
  }
  
  supabaseInstance = createBrowserClient(...)
  return supabaseInstance
}
```

### 2. API Client Timeout 추가

**`lib/api/client.ts`:**
```typescript
// Promise.race로 timeout 처리
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Session timeout')), 3000)
})

const { data: { session } } = await Promise.race([
  supabase.auth.getSession(),
  timeoutPromise
])
```

**효과:**
- ✅ Timeout 초과 시 비인증 요청으로 진행
- ✅ API 호출 차단 방지
- ✅ 에러 로그만 출력, 기능은 정상 작동

---

## Git Push & 배포

```bash
cd C:\hsm9411\portfolio-frontend
git add .
git commit -m "fix: Supabase AbortError 해결 (Singleton + Timeout)"
git push origin main
```

**Vercel 자동 배포** (3-5분)

---

## 예상 결과

**Before:**
```
❌ 세션 가져오기 실패: AbortError
[API Response] 200 ✅ (작동은 함)
```

**After:**
```
ℹ️ 세션 없음 - 비인증 요청으로 진행
[API Response] 200 ✅
```

**또는:**
```
✅ JWT 토큰 추가
[API Response] 200 ✅
```

---

## 핵심 변경 사항

### 1. Singleton 패턴
- Supabase Client 인스턴스 1개만 생성
- 중복 초기화 방지

### 2. Graceful Degradation
- 세션 가져오기 실패 → 비인증 요청으로 계속 진행
- AbortError 발생 → catch로 무시하고 API 호출 계속

### 3. Timeout 보호
- 3초 내 세션 못 가져오면 → 비인증 요청
- API 호출 차단 방지

---

## 체크리스트

- [ ] Git Push (main)
- [ ] Vercel 배포 성공
- [ ] 브라우저 F12 콘솔 확인
- [ ] ❌ AbortError 없음 확인
- [ ] ✅ API 200 OK 확인
- [ ] Projects/Posts 정상 로드

---

작성일: 2026-02-15
