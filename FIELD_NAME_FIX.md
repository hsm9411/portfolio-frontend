# ✅ API 필드명 불일치 수정 (camelCase vs snake_case)

## 문제

```
POST https://158.180.75.205/projects 400 (Bad Request)
{message: Array(2), statusCode: 400, error: 'Bad Request'}
```

---

## 원인

**Frontend와 Backend의 필드명 규칙이 다름:**

| Frontend (보내는 것) | Backend (기대하는 것) | 상태 |
|---------------------|---------------------|------|
| `thumbnailUrl` | `thumbnail_url` | ❌ |
| `demoUrl` | `demo_url` | ❌ |
| `githubUrl` | `github_url` | ❌ |
| `techStack` | `tech_stack` | ❌ |
| `tags` | `tags` | ✅ |
| `title` | `title` | ✅ |

**NestJS는 기본적으로 snake_case를 선호합니다.**

---

## 해결 방법

### Frontend에서 snake_case로 변환

```typescript
// ❌ Before (camelCase)
const payload = {
  thumbnailUrl: formData.thumbnailUrl,
  demoUrl: formData.demoUrl,
  githubUrl: formData.githubUrl,
  techStack: techStackArray
}

// ✅ After (snake_case)
const payload: Record<string, any> = {
  title: formData.title,
  summary: formData.summary,
  description: formData.description,
  status: formData.status
}

if (formData.thumbnailUrl) {
  payload.thumbnail_url = formData.thumbnailUrl
}
if (formData.demoUrl) {
  payload.demo_url = formData.demoUrl
}
if (formData.githubUrl) {
  payload.github_url = formData.githubUrl
}
if (techStackArray.length > 0) {
  payload.tech_stack = techStackArray
}
```

---

## 수정된 파일

1. ✅ `app/projects/new/page.tsx`

---

## 추가 개선

### 에러 메시지 처리

Backend가 검증 에러 배열을 반환할 수 있으므로:

```typescript
const error = err as { 
  statusCode?: number; 
  message?: string | string[]  // 배열도 허용
}

// 배열 처리
const errorMessage = Array.isArray(error.message) 
  ? error.message.join(', ') 
  : error.message || '기본 메시지'
```

---

## 테스트

### 정상 케이스

```json
{
  "title": "test",
  "summary": "test",
  "description": "test",
  "thumbnail_url": "https://example.com/img.png",
  "demo_url": "https://demo.com",
  "github_url": "https://github.com/user/repo",
  "tech_stack": ["NestJS", "TypeScript"],
  "tags": ["Backend"],
  "status": "in-progress"
}
```

**결과:** ✅ 201 Created

---

## 배포

```bash
cd C:\hsm9411\portfolio-frontend
git add .
git commit -m "fix: API 필드명을 snake_case로 변경"
git push origin main
```

---

## 향후 방지책

### 옵션 1: Backend에서 camelCase 허용

```typescript
// Backend DTO에 @Transform 추가
@Transform(({ value }) => value)
@IsOptional()
thumbnailUrl?: string
```

### 옵션 2: Frontend에서 자동 변환 유틸

```typescript
function toSnakeCase(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
      value
    ])
  )
}
```

**현재는 명시적 변환 방식 채택** (더 안전함)

---

작성일: 2026-02-15
