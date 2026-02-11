# 🚀 포트폴리오 프론트엔드 배포 가이드

## ✅ 완료된 작업

### 1. 코드 구현
- ✅ Supabase 클라이언트 설정
- ✅ API 클라이언트 설정
- ✅ Google/GitHub OAuth 로그인 버튼
- ✅ Projects 목록 표시
- ✅ 연결 상태 표시
- ✅ OAuth 콜백 처리

### 2. 환경변수 설정
- ✅ `.env.local` 파일 생성 (로컬용)
- ⏳ Vercel 환경변수 추가 필요

---

## 📝 배포 절차

### Step 1: Git 커밋 및 푸시

```bash
cd C:\hsm9411\portfolio-frontend

git add .
git commit -m "feat: 백엔드 API 및 Supabase OAuth 연동"
git push origin main
```

### Step 2: Vercel 환경변수 설정

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard
   - `portfolio-frontend` 프로젝트 선택

2. **Settings → Environment Variables 메뉴**

3. **다음 환경변수 추가:**

```
NEXT_PUBLIC_SUPABASE_URL
→ https://vcegupzlmopajpqxttfo.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
→ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZWd1cHpsbW9wYWpwcXh0dGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjA2MDgsImV4cCI6MjA4NjAzNjYwOH0.DN4uU1h3SpegOyQfWa6eDMN0P2FzNm2hUiLUiXVDmII

NEXT_PUBLIC_API_URL
→ http://158.180.75.205:3001
```

4. **Environment**: `Production`, `Preview`, `Development` 모두 체크
5. **Save** 클릭

### Step 3: 재배포 트리거

환경변수 추가 후 자동으로 재배포되거나, 수동으로 재배포:

1. **Deployments** 탭
2. **최신 deployment 우측 `...` 클릭**
3. **Redeploy** 선택

---

## 🔧 Supabase OAuth Redirect URL 설정

### Supabase Dashboard에서 설정

1. **Supabase Dashboard**: https://supabase.com/dashboard
2. **프로젝트 선택**: vcegupzlmopajpqxttfo
3. **Authentication → URL Configuration**

4. **추가할 URL:**

```
Site URL:
https://portfolio-frontend-green-eight.vercel.app

Redirect URLs (줄바꿈으로 구분):
https://portfolio-frontend-green-eight.vercel.app/auth/callback
https://portfolio-frontend-green-eight.vercel.app
http://localhost:3000/auth/callback
http://localhost:3000
```

5. **Save** 클릭

---

## 🔧 백엔드 CORS 설정

### Oracle Cloud 서버에서 설정

```bash
# 1. 서버 접속
ssh ubuntu@158.180.75.205

# 2. 프로젝트 디렉토리
cd ~/portfolio-backend-dev

# 3. .env 파일 수정
nano .env

# 4. 다음 줄 수정:
# CORS_ORIGINS=*
# →
CORS_ORIGINS=https://portfolio-frontend-green-eight.vercel.app

# FRONTEND_URL=http://localhost:5173
# →
FRONTEND_URL=https://portfolio-frontend-green-eight.vercel.app

# 5. 저장 (Ctrl+O, Enter, Ctrl+X)

# 6. Docker 재시작
docker-compose restart

# 7. 로그 확인
docker-compose logs -f app
```

---

## ✅ 배포 후 테스트

### 1. 페이지 접속
```
https://portfolio-frontend-green-eight.vercel.app
```

### 2. 확인 사항

**연결 상태 확인:**
- [ ] Backend API: ✅ 연결 성공 (녹색)
- [ ] Supabase Auth: ✅ 설정 완료 (녹색)

**Projects 목록:**
- [ ] 프로젝트 카드 표시됨
- [ ] 프로젝트가 없으면 "프로젝트가 없습니다" 메시지
- [ ] 에러 발생 시 빨간 에러 메시지

**OAuth 로그인:**
- [ ] Google 버튼 클릭 → Google 로그인 페이지
- [ ] 로그인 성공 → 프로필 표시
- [ ] Logout 버튼 동작

---

## 🐛 문제 해결

### Projects 목록이 안 보이는 경우

**원인 1: CORS 에러**
```
브라우저 콘솔 (F12)
→ "CORS policy" 에러 확인
→ 백엔드 CORS_ORIGINS 설정 확인
```

**원인 2: 백엔드 서버 다운**
```bash
ssh ubuntu@158.180.75.205
docker-compose ps
docker-compose logs app
```

**원인 3: 환경변수 오타**
```
Vercel Dashboard
→ Settings → Environment Variables
→ NEXT_PUBLIC_API_URL 확인
```

### OAuth 로그인 실패

**원인 1: Redirect URL 미등록**
```
Supabase Dashboard
→ Authentication → URL Configuration
→ Redirect URLs 확인
```

**원인 2: Provider 미활성화**
```
Supabase Dashboard
→ Authentication → Providers
→ Google/GitHub Enable 확인
```

---

## 📊 예상 결과

### 성공 시 화면

```
┌─────────────────────────────────────────┐
│  Portfolio Backend Test                 │
│  백엔드 API 및 Supabase 연결 테스트       │
│                          [Google][GitHub]│
└─────────────────────────────────────────┘

🔌 연결 상태
┌─────────────────┬─────────────────┐
│ Backend API     │ Supabase Auth   │
│ http://158...   │ https://vceg... │
│ ✅ 연결 성공     │ ✅ 설정 완료     │
└─────────────────┴─────────────────┘

📁 Projects (총 X개)
┌─────────┬─────────┬─────────┐
│ Project │ Project │ Project │
│  Card   │  Card   │  Card   │
└─────────┴─────────┴─────────┘
```

### 로그인 후 화면

```
┌─────────────────────────────────────────┐
│  Portfolio Backend Test                 │
│                  [😊 홍길동] [Logout]    │
└─────────────────────────────────────────┘
```

---

## 🎯 다음 단계

배포 성공 후:

1. **기능 추가**
   - 프로젝트 상세 페이지
   - 블로그 포스트 목록
   - 댓글 기능
   - 좋아요 버튼

2. **UI/UX 개선**
   - 로딩 애니메이션
   - 에러 토스트
   - 반응형 디자인

3. **성능 최적화**
   - ISR (Incremental Static Regeneration)
   - 이미지 최적화
   - 코드 스플리팅

---

**작성일**: 2026-02-11
**배포 URL**: https://portfolio-frontend-green-eight.vercel.app
**백엔드 API**: http://158.180.75.205:3001
