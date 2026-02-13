# 🔍 로그 확인 및 디버깅 가이드

## 📋 백엔드 로그 확인 (OCI Docker)

### 실시간 로그 모니터링

```bash
# SSH 접속
ssh ubuntu@158.180.75.205

# 실시간 로그 확인 (tail 0 = 새 로그만)
docker logs -f portfolio-backend-dev --tail 0

# 최근 100줄 로그 확인
docker logs portfolio-backend-dev --tail 100

# 특정 시간 이후 로그
docker logs portfolio-backend-dev --since 5m

# 타임스탬프 포함
docker logs -f portfolio-backend-dev --tail 50 -t
```

### 로그가 안 나올 때

**1. 컨테이너 상태 확인**
```bash
docker ps -a | grep portfolio
```

출력 예시:
```
CONTAINER ID   IMAGE                    STATUS         PORTS
abc123def456   portfolio-backend:dev    Up 2 hours     0.0.0.0:3001->3001/tcp
```

**2. NestJS 로깅 레벨 확인**

`portfolio-backend/.env` 파일:
```bash
LOG_LEVEL=debug  # verbose, debug, log, warn, error
```

**3. Docker 컨테이너 재시작**
```bash
# 개발 환경 재시작
cd /home/ubuntu/portfolio-backend
docker-compose -f docker-compose.dev.yml restart

# 또는 특정 서비스만
docker-compose -f docker-compose.dev.yml restart app
```

**4. 애플리케이션 로그 위치 확인**
```bash
# 컨테이너 내부 접속
docker exec -it portfolio-backend-dev sh

# 로그 파일 확인
ls -la /app/logs/
cat /app/logs/application.log

# 나가기
exit
```

### 요청 추적하기

**백엔드에 Logger 추가**

`src/modules/projects/projects.controller.ts`:
```typescript
import { Logger } from '@nestjs/common';

@Controller('projects')
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateProjectDto, @Req() req) {
    this.logger.log('📥 POST /projects 요청 받음');
    this.logger.log(`👤 사용자: ${req.user?.email}`);
    this.logger.log(`📦 Body: ${JSON.stringify(dto)}`);
    
    try {
      const result = await this.projectsService.create(dto, req.user);
      this.logger.log('✅ 프로젝트 생성 성공');
      return result;
    } catch (error) {
      this.logger.error('❌ 프로젝트 생성 실패:', error);
      throw error;
    }
  }
}
```

### JWT 검증 로그 추가

`src/modules/auth/strategies/supabase-jwt.strategy.ts`:
```typescript
async validate(payload: any): Promise<User> {
  console.log('🔐 JWT 검증 시작');
  console.log('📋 Payload:', JSON.stringify(payload, null, 2));
  
  const supabaseUserId = payload.sub;
  const email = payload.email;
  
  console.log(`👤 사용자 조회: ${email} (${supabaseUserId})`);
  
  let user = await this.userRepository.findOne({
    where: { supabaseUserId },
  });
  
  if (user) {
    console.log('✅ 사용자 찾음:', user.email);
  } else {
    console.log('ℹ️ 신규 사용자 생성 중...');
  }
  
  return user;
}
```

---

## 📊 프론트엔드 로그 확인 (Vercel)

### Vercel Dashboard

1. **Vercel Dashboard** → **프로젝트 선택**
2. **Deployments** → **최신 배포** 클릭
3. **Functions** 탭 → **Function Logs**

### 실시간 로그 스트리밍

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 실시간 로그
vercel logs --follow

# 특정 배포의 로그
vercel logs [deployment-url]
```

### 브라우저 Console 로그

**개선된 로그 출력 (이미 적용됨):**

```javascript
console.log('🔍 세션 확인:', { 
  hasSession: !!session, 
  hasToken: !!session?.access_token,
  error: error?.message 
})

console.log('[API Request]', {
  method: config.method?.toUpperCase(),
  url: config.url,
  hasAuth: !!config.headers.Authorization,
  headers: config.headers,
})
```

### Chrome DevTools 필터링

**Network 탭:**
1. Filter: `-is:from-cache` (304 제외)
2. Method: `POST`, `PUT`, `DELETE`만 보기
3. Status: `4xx`, `5xx` 에러만 보기

**Console 탭:**
```javascript
// 필터 사용
🔍  // 세션 관련
✅  // 성공
❌  // 에러
⚠️  // 경고
📤  // 요청
📥  // 응답
```

---

## 🧪 디버깅 시나리오

### 시나리오 1: 401 에러 발생

**프론트엔드 Console:**
```
🔍 세션 확인: { hasSession: true, hasToken: true }
✅ JWT 토큰 추가: eyJhbGciOiJIUzI1NiIsInR5cCI...
[API Request] { method: 'POST', url: '/projects', hasAuth: true }
[API Response Error] { status: 401, hasAuth: true }
```

**백엔드 Docker Logs:**
```bash
docker logs -f portfolio-backend-dev --tail 0
```

기대 출력:
```
🔐 JWT 검증 시작
📋 Payload: { sub: "...", email: "..." }
❌ JWT 검증 실패: Invalid signature
```

**원인:**
- Supabase JWT Secret 불일치
- 토큰 만료
- 토큰 형식 오류

### 시나리오 2: 토큰이 아예 안 붙음

**프론트엔드 Console:**
```
🔍 세션 확인: { hasSession: false, hasToken: false }
⚠️ JWT 토큰 없음 - 세션 없음 또는 만료됨
[API Request] { method: 'POST', url: '/projects', hasAuth: false }
```

**해결:**
```javascript
// Console에서 세션 강제 확인
const { createClient } = await import('@/lib/supabase/client')
const supabase = createClient()
const { data, error } = await supabase.auth.getSession()
console.log('Session:', data.session)
console.log('Error:', error)

// 세션 재생성
await supabase.auth.refreshSession()
```

### 시나리오 3: 백엔드에 요청이 안 도착

**프론트엔드:**
```
[API Request] { method: 'POST', url: '/projects', hasAuth: true }
// 5초 후
❌ Network Error: timeout
```

**백엔드 Docker Logs:**
```
(아무 로그 없음)
```

**원인:**
- Vercel 프록시 타임아웃
- 백엔드 서버 다운
- CORS 문제

**확인:**
```bash
# 백엔드 직접 호출 테스트
curl -X GET http://158.180.75.205:3001/health

# 컨테이너 상태
docker ps -a | grep portfolio

# 네트워크 연결
ping 158.180.75.205
```

---

## 🔧 자주 발생하는 문제

### 1. Docker 로그가 안 나올 때

```bash
# 로그 드라이버 확인
docker inspect portfolio-backend-dev | grep -A 5 "LogConfig"

# stdout/stderr로 로그 출력되는지 확인
docker-compose -f docker-compose.dev.yml config
```

**NestJS에서 console.log 대신 Logger 사용:**
```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('AppName');
logger.log('This will appear in docker logs');
```

### 2. Vercel 로그에서 304만 보일 때

**304 (Not Modified):**
- 캐시된 응답
- 실제 요청은 발생하지 않음
- 새로고침: `Ctrl + Shift + R` (캐시 무시)

**Chrome DevTools:**
```
Network → Disable cache (체크)
```

### 3. 토큰이 있는데도 401 발생

**백엔드 .env 확인:**
```bash
# SSH 접속 후
cat /home/ubuntu/portfolio-backend/.env | grep SUPABASE_JWT_SECRET
```

**Supabase Dashboard에서 Secret 복사:**
```
Settings → API → JWT Settings → JWT Secret
```

두 값이 **정확히 일치**해야 합니다.

---

## 📝 체크리스트

### 프론트엔드
- [ ] Console에 `🔍 세션 확인` 로그 출력되는가?
- [ ] `hasSession: true, hasToken: true` 인가?
- [ ] `✅ JWT 토큰 추가` 로그 출력되는가?
- [ ] Network 탭에서 Authorization 헤더 확인되는가?

### 백엔드
- [ ] Docker 컨테이너가 실행 중인가? (`docker ps`)
- [ ] `docker logs`로 로그가 출력되는가?
- [ ] `SUPABASE_JWT_SECRET` 환경 변수가 설정되어 있는가?
- [ ] CORS 설정에 Vercel URL이 포함되어 있는가?

### 네트워크
- [ ] `curl http://158.180.75.205:3001/health` 응답 정상인가?
- [ ] Vercel에서 백엔드로 연결되는가?
- [ ] 방화벽에서 3001 포트가 열려 있는가?

---

**작성일**: 2026-02-13  
**관련 문서**:
- `AUTH_ERROR_FIX.md`
- `SESSION_MANAGEMENT.md`
