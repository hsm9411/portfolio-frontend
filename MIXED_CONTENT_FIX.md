# 🔧 Mixed Content 문제 해결 완료

## ❌ 문제

**Mixed Content Error**: HTTPS(Vercel) → HTTP(백엔드) 직접 호출 불가

```
portfolio-frontend-green-eight.vercel.app (HTTPS)
  ↓ ❌ 차단됨
http://158.180.75.205:3001 (HTTP)
```

---

## ✅ 해결 방법: Vercel Proxy

**Vercel rewrites**를 사용해서 HTTPS → HTTP 프록시:

```
브라우저 → /api/projects (HTTPS)
  ↓ Vercel 내부 프록시
백엔드 → http://158.180.75.205:3001/projects (HTTP)
```

---

## 📝 수정된 파일

### 1. `vercel.json`
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

**설명**:
- `/api/projects` 요청 → `http://158.180.75.205:3001/projects`
- `/api/posts` 요청 → `http://158.180.75.205:3001/posts`
- 모든 `/api/*` 경로를 백엔드로 프록시

### 2. `.env.local`
```env
NEXT_PUBLIC_API_URL=/api
```

**변경**:
- ❌ 이전: `http://158.180.75.205:3001`
- ✅ 현재: `/api` (상대 경로, Vercel rewrites 사용)

### 3. `lib/api/client.ts`
**자동 감지 로직 추가**:
```typescript
const getBaseURL = () => {
  // HTTPS 환경 (Vercel 배포) → /api 프록시 사용
  if (window.location.protocol === 'https:') {
    return '/api'
  }
  
  // HTTP 환경 (로컬) → 직접 백엔드 호출
  return 'http://158.180.75.205:3001'
}
```

### 4. `app/page.tsx`
**디버그 정보 추가**:
- 현재 프로토콜 표시
- API Base URL 표시
- Health check 엔드포인트 호출

---

## 🚀 배포 절차

### Step 1: Git 푸시
```bash
cd C:\hsm9411\portfolio-frontend
git add .
git commit -m "fix: Mixed Content 해결 - Vercel Proxy 사용"
git push origin main
```

### Step 2: Vercel 환경변수 확인
**Vercel Dashboard → Settings → Environment Variables**

```
NEXT_PUBLIC_SUPABASE_URL
→ https://vcegupzlmopajpqxttfo.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
→ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZWd1cHpsbW9wYWpwcXh0dGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjA2MDgsImV4cCI6MjA4NjAzNjYwOH0.DN4uU1h3SpegOyQfWa6eDMN0P2FzNm2hUiLUiXVDmII

NEXT_PUBLIC_API_URL (삭제 가능 - 코드에서 자동 감지)
→ /api (또는 설정 안 해도 됨)
```

### Step 3: 백엔드 CORS 확인
**Oracle Cloud 서버**:
```bash
ssh ubuntu@158.180.75.205
cd ~/portfolio-backend-dev
cat .env | grep CORS
```

**필요한 설정**:
```bash
CORS_ORIGINS=https://portfolio-frontend-green-eight.vercel.app
```

**CORS_ORIGINS=*** 이면 그대로 둬도 됨 (모든 도메인 허용)

### Step 4: 백엔드 Health Check 엔드포인트 확인
백엔드에 `/health` 엔드포인트가 있는지 확인:

```bash
curl http://158.180.75.205:3001/health
```

**응답 예시**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T..."
}
```

**없으면 추가 필요** (선택사항 - 프론트는 `/projects`로 테스트)

---

## ✅ 배포 후 확인

### 1. 페이지 접속
```
https://portfolio-frontend-green-eight.vercel.app
```

### 2. 연결 상태 확인
**🔌 연결 상태 섹션**:
- Backend API: `/api (Vercel Proxy)` → ✅ 연결 성공 (녹색)
- Supabase Auth: `https://vceg...` → ✅ 설정 완료 (녹색)

### 3. 디버그 정보 확인
**🔍 디버그 정보 (펼치기)**:
```
Protocol: https:
Host: portfolio-frontend-green-eight.vercel.app
API Base: /api
Environment: production
```

### 4. 브라우저 콘솔 확인 (F12)
**정상 로그**:
```
[API Request] GET /api/health
[API Response] 200 /api/health
[API Request] GET /api/projects?limit=6&sort_by=created_at&order=DESC
[API Response] 200 /api/projects
```

**에러 확인**:
- ❌ Mixed Content 에러 → 없어야 함
- ❌ CORS 에러 → 백엔드 CORS_ORIGINS 확인
- ❌ 404/400 에러 → vercel.json rewrites 확인

---

## 🐛 문제 해결

### 여전히 Mixed Content 에러
```
원인: 브라우저 캐시
해결: Ctrl+Shift+R (강력 새로고침)
```

### 404 에러 (Not Found)
```
원인 1: vercel.json rewrites 오타
→ vercel.json 확인: "source": "/api/:path*"

원인 2: 백엔드 엔드포인트 경로 오류
→ 백엔드에서 /projects 엔드포인트 확인
→ curl http://158.180.75.205:3001/projects
```

### 400 에러 (Bad Request)
```
원인: 요청 파라미터 오류
→ 브라우저 콘솔에서 요청 URL 확인
→ lib/api/projects.ts의 파라미터 확인
```

### CORS 에러
```
원인: 백엔드 CORS 설정
해결:
1. ssh ubuntu@158.180.75.205
2. cd ~/portfolio-backend-dev
3. nano .env
4. CORS_ORIGINS=* (모든 도메인 허용)
   또는
   CORS_ORIGINS=https://portfolio-frontend-green-eight.vercel.app
5. docker-compose restart
```

---

## 📊 동작 흐름

### HTTPS 환경 (Vercel 배포)
```
1. 브라우저: https://portfolio-frontend.vercel.app
2. API 호출: /api/projects (상대 경로)
3. Vercel: rewrites 규칙 적용
4. 프록시: http://158.180.75.205:3001/projects
5. 백엔드: 응답
6. Vercel: HTTPS로 응답 전달
7. 브라우저: 정상 수신 ✅
```

### HTTP 환경 (로컬 개발)
```
1. 브라우저: http://localhost:3000
2. API 호출: http://158.180.75.205:3001/projects (절대 경로)
3. 백엔드: 직접 응답
4. 브라우저: 정상 수신 ✅
```

---

## 🎯 최종 확인 사항

배포 완료 후:
- [ ] Mixed Content 에러 없음
- [ ] Backend API: ✅ 연결 성공 (녹색)
- [ ] Projects 목록 표시됨
- [ ] Google 로그인 동작
- [ ] 브라우저 콘솔 에러 없음

---

**작성일**: 2026-02-11
**해결 방법**: Vercel Proxy (rewrites)
