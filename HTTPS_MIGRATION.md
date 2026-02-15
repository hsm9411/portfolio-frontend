# 🚀 프론트엔드 HTTPS 연동 완료 가이드

> Backend Nginx HTTPS 구성에 맞춘 Frontend 업데이트

---

## 📋 변경 사항 요약

### Before (Vercel Proxy 사용)
```
Frontend (HTTPS) → /api → Vercel Proxy → Backend (HTTP:3001)
```

### After (HTTPS 직접 연결)
```
Frontend (HTTPS) → Backend (HTTPS:443) ✅
```

**장점:**
- ✅ Vercel Proxy 불필요 (간단한 구조)
- ✅ Mixed Content 문제 완전 해결
- ✅ HTTPS ↔ HTTPS 직접 통신

---

## ✅ 당신이 해야 할 작업 (4단계, 10분)

### 1단계: 로컬 환경 변수 확인 (완료)

**파일:** `C:\hsm9411\portfolio-frontend\.env.local`

```env
# ✅ 이미 수정됨
NEXT_PUBLIC_API_URL=https://158.180.75.205

# Supabase 설정 (변경 없음)
NEXT_PUBLIC_SUPABASE_URL=https://vcegupzlmopajpqxttfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_ADMIN_EMAILS=haeha2e@gmail.com
```

---

### 2단계: Git 커밋 & Push

```bash
cd C:\hsm9411\portfolio-frontend

# 변경사항 확인
git status

# 변경된 파일:
# - .env.local
# - .env.example
# - lib/api/client.ts
# - vercel.json (Proxy 제거)

git add .
git commit -m "feat: HTTPS 직접 연결로 변경 (Nginx HTTPS 지원)"
git push origin main
```

**Vercel이 자동으로 배포 시작!** (3-5분 소요)

---

### 3단계: Vercel 환경 변수 수정

**Vercel Dashboard:** https://vercel.com/[your-project]/settings/environment-variables

#### 수정할 환경 변수:

```env
# 이름: NEXT_PUBLIC_API_URL
# 값: https://158.180.75.205

# 적용 환경: Production, Preview, Development 모두 체크
```

**기존 값:**
- ❌ `/api` (Proxy)
- ❌ `http://158.180.75.205:3001`

**새 값:**
- ✅ `https://158.180.75.205`

#### 저장 후 Redeploy:

1. **Deployments** 탭으로 이동
2. 최신 배포 클릭
3. **"Redeploy"** 버튼 클릭
4. 3-5분 대기

---

### 4단계: 배포 확인

#### 4-1. Vercel 배포 로그 확인

**Deployments 탭:**
- ✅ Build 성공
- ✅ Deployment 완료

#### 4-2. 브라우저 테스트

**URL:** https://[your-project].vercel.app

**확인 사항:**
1. 페이지 정상 로드
2. 브라우저 콘솔 (F12) 열기
3. 다음 로그 확인:

```
🌐 API Client 초기화: {
  baseURL: "https://158.180.75.205",
  isProduction: true
}

[API Request] GET https://158.180.75.205/projects
[API Response] 200 /projects
```

4. **에러 없음 확인:**
   - ❌ Mixed Content 에러 없음
   - ❌ CORS 에러 없음
   - ❌ SSL 에러 없음

#### 4-3. 기능 테스트

1. **홈페이지:** Projects 목록 표시
2. **로그인:** Google/GitHub OAuth 동작
3. **API 호출:** 댓글/좋아요 등 정상 작동

---

## 📂 변경된 파일 상세

### 1. `.env.local` (로컬 개발)

```diff
- NEXT_PUBLIC_API_URL=/api
+ NEXT_PUBLIC_API_URL=https://158.180.75.205
```

### 2. `.env.example` (템플릿)

```diff
- # Vercel 프록시 사용
- NEXT_PUBLIC_API_URL=/api
+ # Backend HTTPS 직접 연결
+ NEXT_PUBLIC_API_URL=https://158.180.75.205
```

### 3. `lib/api/client.ts` (API Client)

```diff
- const getBaseURL = () => {
-   if (typeof window === 'undefined') {
-     return '/api'
-   }
-   return '/api'
- }
+ const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://158.180.75.205'
```

**주요 변경:**
- ✅ 환경 변수에서 직접 읽기
- ✅ HTTPS URL 하드코딩 (폴백)
- ✅ Proxy 로직 제거

### 4. `vercel.json` (Vercel 설정)

```diff
- {
-   "rewrites": [
-     {
-       "source": "/api/:path*",
-       "destination": "http://158.180.75.205:3001/:path*"
-     }
-   ],
-   "headers": [ ... ]
- }
+ {
+   "buildCommand": "npm run build"
+ }
```

**변경:**
- ❌ Proxy (rewrites) 제거
- ❌ CORS 헤더 제거 (Backend에서 처리)

---

## 🔍 로컬 개발 테스트 (선택)

### 로컬에서 테스트하기:

```bash
cd C:\hsm9411\portfolio-frontend

# 개발 서버 시작
npm run dev
```

**브라우저:** http://localhost:3000

**확인:**
```
🌐 API Client 초기화: {
  baseURL: "https://158.180.75.205",
  isProduction: false
}

[API Request] GET https://158.180.75.205/projects
```

**Self-Signed SSL 경고:**
- 브라우저에서 "안전하지 않음" 경고 → "계속 진행"
- 또는 localhost에서는 무시됨 (브라우저 설정에 따라)

---

## 🚨 트러블슈팅

### 1. "NET::ERR_CERT_AUTHORITY_INVALID" (Self-Signed SSL)

**원인:** Self-Signed 인증서를 브라우저가 신뢰하지 않음

**해결:**
1. **개발 환경 (로컬):**
   - Chrome: "고급" → "계속 진행"
   - 또는 무시 (기능 정상)

2. **Production (Vercel):**
   - Vercel은 Backend HTTPS를 그대로 통과
   - Self-Signed SSL도 정상 작동
   - 브라우저 콘솔 경고만 표시 (기능 정상)

3. **근본 해결:**
   - Let's Encrypt 인증서 발급 (Backend)
   - 도메인 구입 후 적용

---

### 2. CORS 에러

**에러 메시지:**
```
Access to XMLHttpRequest at 'https://158.180.75.205/projects' 
has been blocked by CORS policy
```

**해결:**

```bash
# Backend 서버 SSH 접속
ssh -i /c/Users/hasun/Desktop/portfolio/ssh-key-2026-02-07.key ubuntu@158.180.75.205

# .env 파일 확인
cat ~/portfolio-backend-dev/.env | grep CORS

# CORS_ORIGINS 수정
nano ~/portfolio-backend-dev/.env
```

**추가할 설정:**
```env
# 모든 도메인 허용 (개발용)
CORS_ORIGINS=*

# 또는 특정 도메인만 허용 (프로덕션)
CORS_ORIGINS=https://[your-project].vercel.app,https://yourdomain.com
```

**적용:**
```bash
cd ~/portfolio-backend-dev
docker-compose restart
```

---

### 3. "Mixed Content" 여전히 발생

**확인:**
1. Vercel 환경 변수가 `https://`로 시작하는지 확인
2. 브라우저 캐시 삭제 (Ctrl+Shift+R)
3. Incognito 모드에서 테스트

**코드 확인:**
```typescript
// lib/api/client.ts
console.log('🌐 API Client 초기화:', {
  baseURL: API_BASE_URL, // https://158.180.75.205 이어야 함
})
```

---

### 4. API 호출 실패 (404/500)

**원인 1: Backend가 중지됨**

```bash
# 서버 접속
ssh ubuntu@158.180.75.205

# 컨테이너 확인
docker ps | grep portfolio

# Nginx 로그 확인
docker logs portfolio-nginx-dev --tail=50
```

**원인 2: Nginx 설정 오류**

```bash
# Nginx 설정 확인
cat ~/portfolio-backend-dev/nginx/nginx-selfsigned.conf

# proxy_pass가 올바른지 확인
# proxy_pass http://portfolio-backend-dev:3000;
```

---

## 📊 최종 아키텍처

```
┌─────────────────────────────────┐
│   Vercel (Frontend)             │
│   https://[project].vercel.app  │
└────────┬────────────────────────┘
         │ HTTPS 직접 연결
         │ https://158.180.75.205
         ▼
┌─────────────────────────────────┐
│   OCI Server                    │
│   158.180.75.205                │
│                                 │
│   ┌───────────────────────┐    │
│   │ Nginx (HTTPS:443)     │    │
│   │ - Self-Signed SSL     │    │
│   └─────┬─────────────────┘    │
│         │ HTTP (Docker)         │
│         ▼                       │
│   ┌───────────────────────┐    │
│   │ NestJS Backend (:3000)│    │
│   └───────────────────────┘    │
└─────────────────────────────────┘
```

---

## ✅ 최종 체크리스트

### 로컬 작업:
- [x] `.env.local` 수정 (`https://158.180.75.205`)
- [x] `lib/api/client.ts` 업데이트
- [x] `vercel.json` 간소화 (Proxy 제거)
- [ ] Git Push

### Vercel 설정:
- [ ] 환경 변수 수정 (`NEXT_PUBLIC_API_URL`)
- [ ] Redeploy

### 배포 확인:
- [ ] 브라우저 콘솔 에러 없음
- [ ] API 호출 성공 (200 OK)
- [ ] Projects 목록 표시
- [ ] Google/GitHub 로그인 동작

---

## 🎯 요약

1. **Git Push** → Vercel 자동 배포
2. **Vercel 환경 변수** → `https://158.180.75.205`
3. **Redeploy** → 3-5분 대기
4. **테스트** → Mixed Content 에러 없음!

**총 소요 시간:** 약 10분

---

**작성일:** 2026-02-15  
**변경 사항:** Vercel Proxy → HTTPS 직접 연결
