# ✅ API 에러 로깅 개선 및 디버깅 가이드

## 수정 사항

### 1. API Client 로깅 강화

**Request 로깅에 payload 추가:**
```typescript
console.log('[API Request]', {
  method: config.method?.toUpperCase(),
  url: config.url,
  fullURL: `${config.baseURL}${config.url}`,
  hasAuth: !!config.headers.Authorization,
  data: config.data, // ✅ payload 출력 추가
})
```

**400 Bad Request 상세 로깅:**
```typescript
if (error.response?.status === 400) {
  const errorData = error.response.data
  console.error('❌ 400 Bad Request 상세:', {
    message: errorData?.message,
    error: errorData?.error,
    statusCode: errorData?.statusCode,
  })
  
  // 배열 메시지 처리
  if (Array.isArray(errorData?.message)) {
    console.error('📋 검증 에러 목록:')
    errorData.message.forEach((msg: string, index: number) => {
      console.error(`  ${index + 1}. ${msg}`)
    })
  }
}
```

---

## 디버깅 절차

### 1. 배포
```bash
cd C:\hsm9411\portfolio-frontend
git add .
git commit -m "fix: API 에러 로깅 개선"
git push origin main
```

### 2. 브라우저 Hard Refresh
- **Chrome**: `Ctrl + Shift + R` 또는 `Ctrl + F5`
- **개발자 도구**: F12 → Network 탭 → "Disable cache" 체크

### 3. 에러 확인

**개발자 콘솔에서 확인할 내용:**
```
[API Request] {
  method: "POST",
  url: "/projects",
  hasAuth: true,
  data: {
    title: "test",
    summary: "test",
    description: "test",
    status: "in-progress"
    // ✅ snake_case 필드 확인
    // thumbnail_url, demo_url, github_url, tech_stack, tags
  }
}

❌ 400 Bad Request 상세: {
  message: ["에러 메시지 1", "에러 메시지 2"],
  error: "Bad Request",
  statusCode: 400
}

📋 검증 에러 목록:
  1. 에러 메시지 1
  2. 에러 메시지 2
```

---

## 예상 에러 케이스

### Case 1: snake_case 누락
```
에러: property thumbnailUrl should not exist
원인: camelCase 전송
해결: thumbnail_url 사용
```

### Case 2: 빈 배열 문제
```
에러: tech_stack must contain at least 1 element
원인: 빈 배열 [] 전송
해결: undefined 전송
```

### Case 3: 타입 불일치
```
에러: each value in tech_stack must be a string
원인: [""] 전송
해결: 빈 문자열 필터링
```

---

## 체크리스트

### Backend DTO 확인 필요
```typescript
// 백엔드가 기대하는 필드명
{
  title: string
  summary: string
  description: string
  thumbnail_url?: string     // Optional
  demo_url?: string          // Optional
  github_url?: string        // Optional
  tech_stack?: string[]      // Optional
  tags?: string[]            // Optional
  status: 'in-progress' | 'completed' | 'archived'
}
```

### Frontend payload 확인
```typescript
// 현재 코드 (올바름)
const payload: Record<string, any> = {
  title: formData.title,
  summary: formData.summary,
  description: formData.description,
  status: formData.status
}

if (formData.thumbnailUrl) {
  payload.thumbnail_url = formData.thumbnailUrl // ✅ snake_case
}
```

---

## 배포 후 확인

1. ✅ Hard refresh (Ctrl + Shift + R)
2. ✅ 개발자 도구 콘솔 열기 (F12)
3. ✅ 프로젝트 작성 시도
4. ✅ 콘솔에서 정확한 에러 메시지 확인
5. ✅ 에러 메시지를 여기에 공유

---

작성일: 2026-02-15
