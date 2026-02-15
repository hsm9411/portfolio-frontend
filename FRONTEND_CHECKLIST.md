# ✅ Frontend HTTPS 연동 체크리스트

## 📋 당신이 해야 할 작업 (순서대로)

### 1️⃣ Git Push (2분)

```bash
cd C:\hsm9411\portfolio-frontend
git add .
git commit -m "feat: HTTPS 직접 연결로 변경 (Nginx HTTPS 지원)"
git push origin main
```

**Vercel 자동 배포 시작!** (3-5분)

---

### 2️⃣ Vercel 환경 변수 수정 (3분)

**URL:** https://vercel.com/[your-project]/settings/environment-variables

#### 수정:
```
변수명: NEXT_PUBLIC_API_URL

기존 값: /api (또는 http://158.180.75.205:3001)
새 값: https://158.180.75.205

환경: Production, Preview, Development (모두 체크)
```

**저장 후:**
- Deployments → 최신 배포 → "Redeploy" 클릭

---

### 3️⃣ 배포 확인 (3분)

**Vercel Deployments:**
- ✅ Build 성공
- ✅ Deployment 완료

**브라우저:** https://[your-project].vercel.app

**F12 콘솔 확인:**
```
✅ 🌐 API Client 초기화: { baseURL: "https://158.180.75.205" }
✅ [API Request] GET https://158.180.75.205/projects
✅ [API Response] 200 /projects
❌ Mixed Content 에러 없음
```

---

### 4️⃣ 기능 테스트 (2분)

- [ ] 홈페이지 로드
- [ ] Projects 목록 표시
- [ ] Google/GitHub 로그인
- [ ] 댓글/좋아요 기능

---

## 🔧 변경된 파일 (이미 수정됨)

### 로컬 파일:
- ✅ `.env.local` → `https://158.180.75.205`
- ✅ `.env.example` → 템플릿 업데이트
- ✅ `lib/api/client.ts` → Proxy 제거, HTTPS 직접
- ✅ `vercel.json` → rewrites 제거

---

## 🚨 트러블슈팅

### Self-Signed SSL 경고

**브라우저 콘솔:**
```
⚠️ NET::ERR_CERT_AUTHORITY_INVALID
```

**해결:**
- 경고 무시 (기능 정상 작동)
- 또는 Backend에 Let's Encrypt 적용 (나중에)

### CORS 에러

```bash
# Backend .env 확인
ssh ubuntu@158.180.75.205
cat ~/portfolio-backend-dev/.env | grep CORS

# 수정
nano ~/portfolio-backend-dev/.env
# CORS_ORIGINS=*

# 재시작
docker-compose restart
```

---

## ✅ 완료 체크

- [ ] Git Push 완료
- [ ] Vercel 환경 변수 수정
- [ ] Vercel Redeploy 완료
- [ ] 브라우저 테스트 성공
- [ ] Mixed Content 에러 없음

**총 소요 시간:** 약 10분

---

**다음 단계 (선택):**
- [ ] 도메인 구입
- [ ] Let's Encrypt SSL 발급
- [ ] Backend 도메인 적용

**작성일:** 2026-02-15
