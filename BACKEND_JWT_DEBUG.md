# 🔥 백엔드 JWT 검증 실패 문제

## 📋 현재 상황

### 프론트엔드 (성공)
```javascript
✅ JWT 토큰 추가: eyJhbGciOiJFUzI1NiIsImtpZCI6Im...
[API Request] { method: 'POST', url: '/projects', hasAuth: true }
```

### 백엔드 (실패)
```
401 Unauthorized
```

**결론:** 토큰은 전달되었지만 백엔드에서 검증 실패!

---

## 🔍 원인 분석

### 1. Supabase JWT Secret 불일치

**가장 가능성 높은 원인**

백엔드 `.env`의 `SUPABASE_JWT_SECRET`이 실제 Supabase JWT Secret과 다릅니다.

### 2. JWT 알고리즘 문제

로그를 보면 `eyJhbGciOiJFUzI1NiI...` → **ES256 알고리즘**을 사용합니다.

Supabase는 **ES256 (ECDSA)** 또는 **HS256 (HMAC)** 를 사용하는데,
백엔드가 잘못된 알고리즘으로 검증하고 있을 수 있습니다.

### 3. 사용자가 DB에 없음

JWT는 유효하지만 `portfolio.users` 테이블에 해당 사용자가 없을 수 있습니다.

---

## ✅ 해결 방법

### Step 1: 백엔드 로그 확인

```bash
# SSH 접속
ssh ubuntu@158.180.75.205

# Docker 로그 확인
docker logs portfolio-backend-dev --tail 100

# 또는 실시간
docker logs -f portfolio-backend-dev
```

**찾아야 할 로그:**
```
🔐 JWT 검증 시작
📋 Payload: { ... }
❌ JWT 검증 실패: Invalid signature
```

또는

```
❌ UnauthorizedException: Invalid token
```

### Step 2: Supabase JWT Secret 확인

**A. Supabase Dashboard에서 Secret 복사**

1. https://supabase.com/dashboard
2. 프로젝트 선택
3. **Settings** → **API**
4. **JWT Settings** 섹션
5. **JWT Secret** 복사

**B. 백엔드 .env 파일 확인**

```bash
# SSH 접속 후
cat /home/ubuntu/portfolio-backend/.env | grep SUPABASE_JWT_SECRET
```

**두 값이 정확히 일치해야 합니다!**

### Step 3: JWT Secret 업데이트 (불일치 시)

```bash
# SSH 접속
ssh ubuntu@158.180.75.205

# .env 파일 수정
cd /home/ubuntu/portfolio-backend
nano .env

# SUPABASE_JWT_SECRET 값을 Supabase Dashboard에서 복사한 값으로 변경
# Ctrl+X → Y → Enter로 저장

# Docker 컨테이너 재시작
docker-compose -f docker-compose.dev.yml restart

# 로그 확인
docker logs -f portfolio-backend-dev --tail 50
```

### Step 4: JWT Strategy 코드 확인

**백엔드 JWT Strategy에 로그 추가**

`portfolio-backend/src/modules/auth/strategies/supabase-jwt.strategy.ts`:

```typescript
async validate(payload: any): Promise<User> {
  // ✅ 로그 추가
  console.log('🔐 Supabase JWT 검증 시작');
  console.log('📋 Payload:', JSON.stringify(payload, null, 2));
  
  const supabaseUserId = payload.sub;
  const email = payload.email;
  
  console.log(`👤 사용자 조회: ${email} (${supabaseUserId})`);
  
  let user = await this.userRepository.findOne({
    where: { supabaseUserId },
  });
  
  if (!user) {
    console.log('ℹ️ 신규 사용자 생성 중...');
    user = this.userRepository.create({
      supabaseUserId,
      email,
      nickname: payload.user_metadata?.full_name || email.split('@')[0],
      avatarUrl: payload.user_metadata?.avatar_url,
      provider: payload.app_metadata?.provider || 'email',
      providerId: payload.user_metadata?.provider_id,
    });
    
    await this.userRepository.save(user);
    console.log('✅ 신규 사용자 생성 완료:', user.email);
  } else {
    console.log('✅ 기존 사용자 찾음:', user.email);
  }

  return user;
}
```

그리고 `@Injectable()` 위에:

```typescript
constructor(
  private readonly configService: ConfigService,
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,
) {
  const secret = configService.get<string>('SUPABASE_JWT_SECRET');
  console.log('🔑 JWT Secret 설정됨:', secret ? `${secret.substring(0, 20)}...` : 'MISSING!');
  
  super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: secret || 'fallback-secret',
  });
}
```

**코드 수정 후:**

```bash
cd /home/ubuntu/portfolio-backend
git pull  # 또는 코드 직접 수정
docker-compose -f docker-compose.dev.yml restart
```

---

## 🧪 테스트 시나리오

### 시나리오 1: JWT Secret 불일치

**백엔드 로그:**
```
🔑 JWT Secret 설정됨: abc123def456...
🔐 JWT 검증 시작
❌ JsonWebTokenError: invalid signature
```

**해결:** Step 3에서 Secret 업데이트

### 시나리오 2: 알고리즘 불일치

**백엔드 로그:**
```
🔐 JWT 검증 시작
❌ JsonWebTokenError: invalid algorithm
```

**해결:**

`supabase-jwt.strategy.ts`의 `super()` 호출 부분에 알고리즘 명시:

```typescript
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: secret,
  algorithms: ['HS256', 'ES256'],  // ✅ 추가
});
```

### 시나리오 3: 사용자 DB 없음

**백엔드 로그:**
```
🔐 JWT 검증 시작
📋 Payload: { sub: "...", email: "haeha2e@gmail.com" }
👤 사용자 조회: haeha2e@gmail.com (...)
ℹ️ 신규 사용자 생성 중...
✅ 신규 사용자 생성 완료: haeha2e@gmail.com
```

**해결:** 자동으로 사용자 생성됨 (정상)

### 시나리오 4: CORS 문제

**백엔드 로그:**
```
(로그 없음)
```

**프론트엔드 Network 탭:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**해결:**

`.env`:
```bash
CORS_ORIGINS=https://portfolio-front-ten-gamma.vercel.app,http://localhost:3000
```

---

## 🔧 즉시 시도할 것

### 1. 백엔드 로그 확인

```bash
ssh ubuntu@158.180.75.205
docker logs portfolio-backend-dev --tail 100 | grep -A 10 "JWT\|401\|Unauthorized"
```

### 2. JWT Secret 비교

**Supabase:**
- Dashboard → Settings → API → JWT Secret

**백엔드:**
```bash
cat /home/ubuntu/portfolio-backend/.env | grep SUPABASE_JWT_SECRET
```

### 3. 두 값이 다르면 즉시 수정

```bash
nano /home/ubuntu/portfolio-backend/.env
# SUPABASE_JWT_SECRET 값 수정
# 저장

docker-compose -f docker-compose.dev.yml restart
```

### 4. 재테스트

프론트엔드에서 다시 프로젝트 생성 시도

---

## 📝 체크리스트

백엔드 확인:
- [ ] Docker 컨테이너 실행 중 (`docker ps`)
- [ ] 로그에 JWT 관련 메시지 있음
- [ ] SUPABASE_JWT_SECRET 환경 변수 설정됨
- [ ] Secret이 Supabase Dashboard와 일치함
- [ ] CORS 설정에 Vercel URL 포함됨

프론트엔드 확인:
- [ ] 토큰이 요청에 포함됨 (`hasAuth: true`)
- [ ] 이메일이 `haeha2e@gmail.com`으로 로그인됨
- [ ] Admin 체크 로그 정상

네트워크 확인:
- [ ] Network 탭에서 Authorization 헤더 확인
- [ ] 401 응답의 Response 탭 확인
- [ ] CORS 에러 없음

---

## 🎯 다음 단계

**즉시 실행:**

```bash
# 1. SSH 접속
ssh ubuntu@158.180.75.205

# 2. 로그 확인 (JWT 에러 찾기)
docker logs portfolio-backend-dev --tail 200 | grep -i "jwt\|unauthorized\|401"

# 3. Secret 확인
cat /home/ubuntu/portfolio-backend/.env | grep SUPABASE

# 4. 실시간 로그 모니터링하면서 프론트에서 재시도
docker logs -f portfolio-backend-dev --tail 0
```

**그리고 프론트엔드에서 다시 프로젝트 생성 시도**

백엔드 로그에 무엇이 나오는지 확인 후 공유해주세요!

---

**작성일**: 2026-02-13  
**핵심 문제**: 백엔드 JWT 검증 실패  
**가능 원인**: JWT Secret 불일치, 알고리즘 문제, 사용자 DB 없음
