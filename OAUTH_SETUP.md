# 🔐 Supabase OAuth Provider 설정 가이드

## ❌ 현재 문제

```json
{
  "code": 400,
  "error_code": "validation_failed",
  "msg": "Unsupported provider: provider is not enabled"
}
```

**원인**: Supabase에서 Google/GitHub Provider가 비활성화되어 있음

---

## ✅ 해결 방법

### 1. Supabase Dashboard 접속

```
https://supabase.com/dashboard
→ 프로젝트 선택: vcegupzlmopajpqxttfo
→ Authentication → Providers
```

---

## 🔧 Google OAuth 설정

### Step 1: Google Cloud Console

1. **https://console.cloud.google.com** 접속
2. **프로젝트 선택** (또는 새 프로젝트 생성)
3. **APIs & Services → Credentials**
4. **Create Credentials → OAuth 2.0 Client ID**

### Step 2: OAuth 동의 화면 구성 (처음이면)

```
User Type: External
App name: Portfolio (원하는 이름)
User support email: 본인 이메일
Developer contact: 본인 이메일
→ Save and Continue
```

### Step 3: OAuth 2.0 Client ID 생성

```
Application type: Web application
Name: Portfolio Frontend

Authorized JavaScript origins:
https://portfolio-front-ten-gamma.vercel.app
http://localhost:3000 (로컬 테스트용)

Authorized redirect URIs: ⭐ 중요!
https://vcegupzlmopajpqxttfo.supabase.co/auth/v1/callback
http://localhost:54321/auth/v1/callback (로컬 테스트용)

→ Create
```

### Step 4: Client ID와 Secret 복사

```
Client ID: xxx.apps.googleusercontent.com
Client Secret: GOCSPX-xxx

→ 이 값들을 복사해둡니다
```

### Step 5: Supabase에 입력

```
Supabase Dashboard
→ Authentication → Providers
→ Google 찾기
→ Enable 토글 ON
→ Client ID 입력
→ Client Secret 입력
→ Save
```

---

## 🐙 GitHub OAuth 설정

### Step 1: GitHub Settings

1. **https://github.com/settings/developers** 접속
2. **OAuth Apps → New OAuth App**

### Step 2: OAuth App 등록

```
Application name: Portfolio

Homepage URL:
https://portfolio-front-ten-gamma.vercel.app

Authorization callback URL: ⭐ 중요!
https://vcegupzlmopajpqxttfo.supabase.co/auth/v1/callback

→ Register application
```

### Step 3: Client ID와 Secret 생성

```
Client ID: Iv1.xxx (자동 생성됨)

Client secrets:
→ Generate a new client secret
→ Secret 복사 (한 번만 보여짐!)
```

### Step 4: Supabase에 입력

```
Supabase Dashboard
→ Authentication → Providers
→ GitHub 찾기
→ Enable 토글 ON
→ Client ID 입력
→ Client Secret 입력
→ Save
```

---

## ✅ 설정 완료 확인

### Supabase Dashboard

```
Authentication → Providers

✅ Google: Enabled
✅ GitHub: Enabled
```

---

## 🚀 배포 및 테스트

### Step 1: 코드 배포

```bash
cd C:\hsm9411\portfolio-frontend
git add .
git commit -m "feat: 로그인/회원가입 페이지 추가"
git push origin main
```

### Step 2: 배포 완료 대기 (3분)

### Step 3: 테스트

**로그인 페이지**:
```
https://portfolio-front-ten-gamma.vercel.app/login
```

**회원가입 페이지**:
```
https://portfolio-front-ten-gamma.vercel.app/register
```

**테스트 순서**:
1. [ ] Google로 계속하기 버튼 클릭
2. [ ] Google 로그인 페이지로 이동
3. [ ] 로그인 성공 → 홈으로 리다이렉트
4. [ ] 우측 상단에 프로필 표시
5. [ ] Logout 버튼 클릭
6. [ ] GitHub도 동일하게 테스트

---

## 📋 Redirect URLs 정리

**Supabase Redirect URL** (OAuth Provider 설정에 필요):
```
https://vcegupzlmopajpqxttfo.supabase.co/auth/v1/callback
```

**Frontend Redirect URL** (Supabase Dashboard → Authentication → URL Configuration):
```
Site URL:
https://portfolio-front-ten-gamma.vercel.app

Redirect URLs:
https://portfolio-front-ten-gamma.vercel.app/auth/callback
https://portfolio-front-ten-gamma.vercel.app
```

---

## 🐛 문제 해결

### 여전히 "provider is not enabled" 에러

**확인 사항**:
1. Supabase Providers에서 Enable 토글이 켜져 있는지
2. Client ID, Secret이 정확히 입력되었는지
3. Supabase 저장 버튼을 눌렀는지
4. 브라우저 캐시 삭제 (Ctrl+Shift+R)

### Google 로그인 후 "redirect_uri_mismatch" 에러

**원인**: Google Cloud Console의 Redirect URI 오류

**해결**:
```
Google Cloud Console → Credentials
→ OAuth 2.0 Client ID 수정
→ Authorized redirect URIs 확인:
   https://vcegupzlmopajpqxttfo.supabase.co/auth/v1/callback
```

### GitHub 로그인 실패

**확인**:
```
GitHub OAuth App 설정
→ Authorization callback URL:
   https://vcegupzlmopajpqxttfo.supabase.co/auth/v1/callback
```

---

## 📱 로컬 개발 환경 설정 (선택사항)

로컬에서도 OAuth 테스트하려면:

### Google Cloud Console
```
Authorized redirect URIs에 추가:
http://localhost:54321/auth/v1/callback
```

### GitHub OAuth App
```
Authorization callback URL에 추가:
http://localhost:54321/auth/v1/callback
```

---

## 🎯 최종 체크리스트

설정 완료 후:
- [ ] Google Provider Enabled
- [ ] GitHub Provider Enabled
- [ ] Client ID, Secret 입력 완료
- [ ] Supabase Redirect URLs 설정
- [ ] 코드 배포 완료
- [ ] /login 페이지 접속 가능
- [ ] /register 페이지 접속 가능
- [ ] Google 로그인 동작
- [ ] GitHub 로그인 동작

---

**작성일**: 2026-02-12
**중요**: OAuth Provider 설정은 Supabase Dashboard에서만 가능합니다!
