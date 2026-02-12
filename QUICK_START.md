# ✅ Mixed Content 해결 - 즉시 실행 체크리스트

## 🚀 1단계: Git 푸시 (1분)

```bash
cd C:\hsm9411\portfolio-frontend
git add .
git commit -m "fix: Mixed Content 해결 - Vercel Proxy 사용"
git push origin main
```

---

## 🚀 2단계: Vercel 환경변수 확인 (2분)

**https://vercel.com/dashboard** → `portfolio-frontend` → Settings → Environment Variables

**확인할 변수 3개**:
```
✅ NEXT_PUBLIC_SUPABASE_URL
   https://vcegupzlmopajpqxttfo.supabase.co

✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
   eyJhbG... (긴 토큰)

⚠️ NEXT_PUBLIC_API_URL (있으면 삭제 또는 /api로 변경)
```

**NEXT_PUBLIC_API_URL 처리**:
- **Option 1 (추천)**: 완전히 삭제 (코드가 자동 감지)
- **Option 2**: 값을 `/api`로 변경

---

## 🚀 3단계: 백엔드 CORS 확인 (선택사항)

**백엔드가 CORS_ORIGINS=* 이면 건너뛰기**

확인:
```bash
ssh ubuntu@158.180.75.205
cat ~/portfolio-backend-dev/.env | grep CORS
```

**만약 특정 도메인만 허용 중이면**:
```bash
nano ~/portfolio-backend-dev/.env

# 수정:
CORS_ORIGINS=https://portfolio-frontend-green-eight.vercel.app

# 저장 후:
docker-compose restart
```

---

## 🚀 4단계: 배포 확인 (3분)

**배포 완료 대기**:
- Vercel Dashboard → Deployments 탭
- "Building" → "Ready" 될 때까지 대기 (2-3분)

**접속**:
```
https://portfolio-frontend-green-eight.vercel.app
```

**확인 사항**:
```
✅ Backend API: /api (Vercel Proxy) → ✅ 연결 성공 (녹색)
✅ Supabase Auth: https://vceg... → ✅ 설정 완료 (녹색)
✅ Projects 목록 표시 (있으면)
```

**브라우저 콘솔 (F12) 확인**:
```
✅ [API Request] GET /api/health
✅ [API Response] 200 /api/health
✅ [API Request] GET /api/projects
✅ [API Response] 200 /api/projects

❌ Mixed Content 에러 → 없어야 함!
```

---

## 🎯 예상 결과

### 성공 시

**화면**:
```
🔌 연결 상태
┌─────────────────────────┬─────────────────────────┐
│ Backend API             │ Supabase Auth           │
│ /api (Vercel Proxy)     │ https://vcegupzlmopaj...│
│ ✅ 연결 성공             │ ✅ 설정 완료             │
└─────────────────────────┴─────────────────────────┘

🔍 디버그 정보 (펼쳐보기)
Protocol: https:
Host: portfolio-frontend-green-eight.vercel.app
API Base: /api
Environment: production

📁 Projects
[프로젝트 카드들]
```

**콘솔**:
```javascript
[API Request] GET /api/projects?limit=6&sort_by=created_at&order=DESC
[API Response] 200 /api/projects
Backend health check: {status: "ok", ...}
```

### 실패 시

**404 에러**:
```
원인: vercel.json rewrites 오류
해결: vercel.json 확인 → Git 푸시 다시
```

**CORS 에러**:
```
Access to XMLHttpRequest at '/api/projects' from origin 'https://...' has been blocked by CORS policy
원인: 백엔드 CORS 설정
해결: 백엔드 CORS_ORIGINS=* 설정
```

**Mixed Content (여전히 발생)**:
```
원인: 브라우저 캐시
해결: Ctrl+Shift+R (강력 새로고침)
```

---

## 📞 결과 공유

작업 완료 후 다음 정보 알려주세요:

1. **배포 상태**: 성공/실패
2. **연결 상태**: Backend API (녹색/빨간색/노란색)
3. **콘솔 에러**: 있으면 전체 복사
4. **스크린샷**: 연결 상태 섹션

---

**핵심 변경사항**:
- `vercel.json`: `/api/:path*` → 백엔드 프록시
- `.env.local`: `NEXT_PUBLIC_API_URL=/api`
- `lib/api/client.ts`: HTTPS 자동 감지
- `app/page.tsx`: 디버그 정보 표시
