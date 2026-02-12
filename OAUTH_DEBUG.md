# 🔍 OAuth 문제 해결 가이드

## ❌ 현재 증상

OAuth 버튼(Google/GitHub) 클릭 시:
- 바로 메인페이지로 돌아감
- 로그인 창이 안 뜸

---

## 🧪 즉시 확인 방법

### Step 1: 디버그 페이지 접속
```
https://portfolio-front-ten-gamma.vercel.app/debug
```

**확인 사항**:
1. **로그인 상태**: ✅ 로그인됨 / ❌ 로그인 안 됨
2. **OAuth 테스트 버튼 클릭**
   - "Google OAuth 테스트" 클릭
   - 에러 메시지 확인

### Step 2: 이미 로그인되어 있는지 확인

**증상**: 이미 로그인되어 있으면 /login 접속 시 자동으로 홈으로 리다이렉트

**확인**:
```
/debug 페이지에서 확인
→ "✅ 로그인됨" 표시되면 이미 로그인 상태
→ [로그아웃] 클릭
```

### Step 3: 로그아웃 후 재시도

```
1. /debug → [로그아웃] 클릭
2. /login 접속
3. Google 버튼 클릭
4. 에러 메시지 확인
```

---

## 🔧 예상 원인 및 해결

### 원인 1: 이미 로그인되어 있음 ✅ 가능성 높음

**증상**:
```
/login 접속 → "이미 로그인되어 있습니다" 메시지
→ 자동으로 홈으로 이동
```

**해결**:
```
/debug → [로그아웃] → 다시 로그인 시도
```

---

### 원인 2: OAuth Provider 미설정 ⚠️

**증상**:
```
OAuth 버튼 클릭 → 에러 메시지:
"Google 로그인이 활성화되지 않았습니다"
```

**해결**:
```
OAUTH_SETUP.md 참고
→ Supabase Dashboard
→ Authentication → Providers
→ Google/GitHub Enable
```

---

### 원인 3: 브라우저 캐시

**해결**:
```
Ctrl+Shift+R (강력 새로고침)
또는
F12 → Application → Cookies → 삭제
```

---

## 📊 디버그 페이지 활용

### /debug 페이지에서 확인할 수 있는 것

1. **로그인 상태**
   - ✅ 로그인됨 / ❌ 로그인 안 됨

2. **사용자 정보**
   - Email
   - Provider (email / google / github)
   - Email Confirmed

3. **User Metadata**
   - nickname
   - avatar_url
   - full_name

4. **OAuth 테스트**
   - Google OAuth 테스트 버튼
   - GitHub OAuth 테스트 버튼
   - 에러 메시지 즉시 표시

5. **환경변수**
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

---

## 🎯 체크리스트

배포 후 순서대로 확인:

### ✅ Step 1: 현재 상태 확인
```
[ ] /debug 접속
[ ] 로그인 상태 확인
[ ] 이미 로그인되어 있으면 로그아웃
```

### ✅ Step 2: 이메일 로그인 테스트
```
[ ] /login 접속
[ ] 이메일/비밀번호 입력
[ ] 로그인 성공 확인
[ ] 우측 상단 "닉네임님" 표시 확인
[ ] 로그아웃
```

### ✅ Step 3: OAuth 테스트
```
[ ] /debug 접속
[ ] "Google OAuth 테스트" 클릭
[ ] 에러 메시지 확인
   → "provider is not enabled" → Provider 설정 필요
   → Google 로그인 페이지로 이동 → 정상
```

---

## 🚀 배포

```bash
cd C:\hsm9411\portfolio-frontend
git add .
git commit -m "feat: 디버그 페이지 추가, OAuth 에러 개선"
git push origin main
```

**배포 후 테스트**:
```
1. /debug 접속
2. 로그인 상태 확인
3. OAuth 테스트 버튼 클릭
4. 콘솔 에러 메시지 확인 (F12)
```

---

## 📞 결과 공유 요청

배포 후 다음 정보를 알려주세요:

1. **/debug 페이지 로그인 상태**
   - ✅ 로그인됨 / ❌ 로그인 안 됨

2. **OAuth 테스트 결과**
   - Google 버튼 클릭 시 어떤 일이 발생하는지
   - 에러 메시지가 있다면 전체 내용

3. **브라우저 콘솔 (F12 → Console)**
   - 🔵 로그 메시지
   - ❌ 에러 메시지

---

**작성일**: 2026-02-12
**목적**: OAuth 문제 진단 및 해결
