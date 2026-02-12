# 🚨 연결 실패 해결 가이드

## 현재 상황
- **배포 주소**: https://portfolio-front-ten-gamma.vercel.app
- **상태**: ❌ 연결 실패
- **API Base**: /api (정상)

---

## 🔍 1단계: 브라우저 콘솔 확인 (필수!)

**F12 → Console 탭 확인**

다음 중 어떤 에러가 나오는지 확인:

### A. 404 Not Found
```
GET https://portfolio-front-ten-gamma.vercel.app/api/projects 404
```
**원인**: Vercel rewrites가 작동 안 함
**해결**: 아래 2단계 진행

### B. CORS 에러
```
Access to XMLHttpRequest at '/api/projects' has been blocked by CORS policy
```
**원인**: 백엔드 CORS 설정
**해결**: 아래 3단계 진행

### C. 500 Internal Server Error
```
GET /api/projects 500
```
**원인**: 백엔드 서버 에러
**해결**: 백엔드 로그 확인 필요

### D. Network Error
```
[API Response Error] Network Error
```
**원인**: 백엔드 서버 다운
**해결**: 아래 4단계 진행

---

## 🔧 2단계: Vercel Rewrites 확인

**현재 설정 (vercel.json)**:
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

**확인 방법**:
1. Git에 푸시했는지 확인
2. Vercel 배포 완료 확인

**재배포 필요 시**:
```bash
cd C:\hsm9411\portfolio-frontend
git add vercel.json
git commit -m "fix: vercel rewrites 재설정"
git push origin main
```

---

## 🔧 3단계: 백엔드 CORS 설정 (중요!)

**Oracle Cloud 서버 접속**:
```bash
ssh ubuntu@158.180.75.205
cd ~/portfolio-backend-dev
```

**현재 CORS 확인**:
```bash
cat .env | grep CORS
```

**새 배포 주소로 수정**:
```bash
nano .env

# 찾아서 수정:
CORS_ORIGINS=https://portfolio-front-ten-gamma.vercel.app

# 또는 모든 도메인 허용:
CORS_ORIGINS=*
```

**저장 및 재시작**:
```bash
# Ctrl+O, Enter, Ctrl+X (저장)
docker-compose restart
docker-compose logs -f app | grep -i cors
```

---

## 🔧 4단계: 백엔드 서버 상태 확인

**서버 접속**:
```bash
ssh ubuntu@158.180.75.205
```

**Docker 컨테이너 확인**:
```bash
cd ~/portfolio-backend-dev
docker-compose ps
```

**정상 출력**:
```
NAME                STATUS
portfolio-backend   Up X minutes
portfolio-redis     Up X minutes
```

**서버 다운 시**:
```bash
docker-compose up -d
docker-compose logs -f app
```

**직접 API 테스트**:
```bash
curl http://158.180.75.205:3001/projects
```

**정상 응답 예시**:
```json
{
  "data": [...],
  "total": 0,
  "page": 1,
  "limit": 10,
  "total_pages": 0
}
```

---

## 🔧 5단계: 프론트엔드 재배포

**코드 수정 완료 후**:
```bash
cd C:\hsm9411\portfolio-frontend
git add .
git commit -m "fix: /health 제거, /projects로 직접 테스트"
git push origin main
```

**배포 대기** (2-3분)

**재접속**:
```
https://portfolio-front-ten-gamma.vercel.app
```

---

## ✅ 예상 결과

### 성공 시
```
Backend API: /api (Vercel Proxy)
✅ 연결 성공
X개 프로젝트 로드 성공
```

### 여전히 실패 시
**브라우저 콘솔 전체 로그 복사해서 공유**:
```
F12 → Console 탭 → 우클릭 → Save as...
또는
전체 복사해서 텍스트로 전달
```

---

## 🎯 체크리스트

배포 후 확인:
- [ ] Git 푸시 완료
- [ ] Vercel 배포 완료 (Ready 상태)
- [ ] 백엔드 CORS 수정 및 재시작
- [ ] 브라우저 강력 새로고침 (Ctrl+Shift+R)
- [ ] F12 콘솔 에러 확인
- [ ] 연결 상태 확인

---

**다음 정보 공유 필요**:
1. 브라우저 콘솔 에러 메시지 (전체)
2. 백엔드 CORS_ORIGINS 현재 값
3. `docker-compose ps` 출력
4. `curl http://158.180.75.205:3001/projects` 응답
