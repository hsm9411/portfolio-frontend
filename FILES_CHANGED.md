# 📦 수정된 파일 목록

## ✅ 핵심 수정 파일 (4개)

### 1. `vercel.json` ⭐ 가장 중요
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://158.180.75.205:3001/:path*"
    }
  ]
}
```
**역할**: HTTPS → HTTP 프록시 (Mixed Content 해결)

---

### 2. `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://vcegupzlmopajpqxttfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_API_URL=/api
```
**변경**: `http://158.180.75.205:3001` → `/api`

---

### 3. `lib/api/client.ts`
**추가된 기능**:
- HTTPS 자동 감지
- 로컬 vs 배포 환경 구분
- 요청/응답 로깅

```typescript
const getBaseURL = () => {
  if (window.location.protocol === 'https:') {
    return '/api'  // Vercel Proxy
  }
  return 'http://158.180.75.205:3001'  // Direct
}
```

---

### 4. `app/page.tsx`
**추가된 기능**:
- 백엔드 Health Check
- 디버그 정보 표시
- 더 나은 에러 메시지
- 연결 상태 시각화

---

## 📄 생성된 문서 파일 (3개)

1. `MIXED_CONTENT_FIX.md` - 상세 설명
2. `QUICK_START.md` - 즉시 실행 가이드 ⭐ 이거 보세요
3. `FILES_CHANGED.md` - 이 파일

---

## 🔧 Vercel 환경변수 (확인 필요)

**필수**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**선택** (삭제 가능):
- `NEXT_PUBLIC_API_URL` → 코드가 자동 감지하므로 불필요

---

## 🎯 핵심 동작 원리

### Before (❌ Mixed Content 에러)
```
브라우저 (HTTPS) → http://158.180.75.205:3001
                    ❌ 차단됨
```

### After (✅ 정상 동작)
```
브라우저 (HTTPS) → /api/projects (상대 경로)
                    ↓
Vercel Rewrites → http://158.180.75.205:3001/projects
                    ↓
백엔드 응답 → Vercel → 브라우저
             ✅ 정상
```

---

## 🚀 배포 순서

1. **Git Push**
   ```bash
   git add .
   git commit -m "fix: Mixed Content - Vercel Proxy"
   git push origin main
   ```

2. **Vercel 환경변수 확인**
   - `NEXT_PUBLIC_API_URL` 삭제 또는 `/api`로 변경

3. **배포 완료 대기** (2-3분)

4. **확인**
   ```
   https://portfolio-frontend-green-eight.vercel.app
   ```

---

**다음 단계**: `QUICK_START.md` 파일 참고
