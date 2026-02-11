# ✅ 프론트엔드 연동 작업 체크리스트

## 📝 수행해야 할 작업 (순서대로)

### ✅ Step 1: Git 커밋 및 푸시
```bash
cd C:\hsm9411\portfolio-frontend
git add .
git commit -m "feat: 백엔드 API 및 Supabase OAuth 연동"
git push origin main
```

---

### ✅ Step 2: Vercel 환경변수 설정

**Vercel Dashboard**: https://vercel.com/dashboard

1. **프로젝트 선택**: `portfolio-frontend`
2. **Settings → Environment Variables**
3. **다음 3개 변수 추가**:

```env
NEXT_PUBLIC_SUPABASE_URL
값: https://vcegupzlmopajpqxttfo.supabase.co
환경: Production, Preview, Development 모두 체크

NEXT_PUBLIC_SUPABASE_ANON_KEY  
값: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZWd1cHpsbW9wYWpwcXh0dGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjA2MDgsImV4cCI6MjA4NjAzNjYwOH0.DN4uU1h3SpegOyQfWa6eDMN0P2FzNm2hUiLUiXVDmII
환경: Production, Preview, Development 모두 체크

NEXT_PUBLIC_API_URL
값: http://158.180.75.205:3001
환경: Production, Preview, Development 모두 체크
```

4. **Save** 클릭

---

### ✅ Step 3: Supabase OAuth Redirect URL 설정

**Supabase Dashboard**: https://supabase.com/dashboard

1. **프로젝트 선택**: vcegupzlmopajpqxttfo
2. **Authentication → URL Configuration**
3. **Site URL 설정**:
   ```
   https://portfolio-frontend-green-eight.vercel.app
   ```

4. **Redirect URLs 추가** (줄바꿈으로 구분):
   ```
   https://portfolio-frontend-green-eight.vercel.app/auth/callback
   https://portfolio-frontend-green-eight.vercel.app
   ```

5. **Save** 클릭

---

### ✅ Step 4: 백엔드 CORS 설정

**Oracle Cloud 서버 접속**:

```bash
ssh ubuntu@158.180.75.205
cd ~/portfolio-backend-dev
nano .env
```

**수정할 내용**:
```bash
# 기존:
CORS_ORIGINS=*
FRONTEND_URL=http://localhost:5173

# 변경:
CORS_ORIGINS=https://portfolio-frontend-green-eight.vercel.app
FRONTEND_URL=https://portfolio-frontend-green-eight.vercel.app
```

**저장 및 재시작**:
```bash
# 저장: Ctrl+O, Enter, Ctrl+X
docker-compose restart
docker-compose logs -f app
```

---

### ✅ Step 5: 배포 확인

**1. Vercel 자동 배포 대기** (3-5분)
   - https://vercel.com/dashboard
   - Deployments 탭에서 진행 상황 확인

**2. 배포 완료 후 접속**:
   ```
   https://portfolio-frontend-green-eight.vercel.app
   ```

**3. 확인 사항**:
   - [ ] 페이지 로딩됨
   - [ ] "Backend API: ✅ 연결 성공" (녹색)
   - [ ] "Supabase Auth: ✅ 설정 완료" (녹색)
   - [ ] Projects 카드 표시 (있을 경우)
   - [ ] Google 로그인 버튼 클릭 → Google 로그인 페이지
   - [ ] 로그인 성공 → 우측 상단에 프로필 표시
   - [ ] Logout 버튼 동작

---

## 🎯 최종 확인

### 성공 화면
```
┌───────────────────────────────────────────────┐
│ Portfolio Backend Test                        │
│ 백엔드 API 및 Supabase 연결 테스트             │
│                           [Google] [GitHub]   │
└───────────────────────────────────────────────┘

🔌 연결 상태
┌─────────────────────┬─────────────────────┐
│ Backend API         │ Supabase Auth       │
│ http://158.180...   │ https://vcegup...   │
│ ✅ 연결 성공         │ ✅ 설정 완료         │
└─────────────────────┴─────────────────────┘

📁 Projects
[프로젝트 카드들이 표시됨]
```

### 로그인 후
```
우측 상단: [😊 사용자이름] [Logout]
```

---

## 🐛 문제 발생 시

### Backend API 연결 실패 (빨간색)
```bash
# 백엔드 서버 상태 확인
ssh ubuntu@158.180.75.205
docker-compose ps
docker-compose logs app

# CORS 설정 확인
cat ~/portfolio-backend-dev/.env | grep CORS
```

### Projects 목록 안 보임
```
F12 → Console 탭 → 에러 확인
→ CORS 에러면 백엔드 CORS_ORIGINS 재확인
```

### OAuth 로그인 실패
```
Supabase Dashboard
→ Authentication → URL Configuration
→ Redirect URLs 재확인
```

---

## 📞 확인 완료 후 알려주세요!

다음 정보 공유:
1. ✅ 배포 성공 여부
2. ✅ Backend API 연결 상태 (녹색/빨간색)
3. ✅ Projects 개수
4. ✅ OAuth 로그인 테스트 결과
5. ❌ 발생한 에러 (있다면)

---

**작성일**: 2026-02-11
