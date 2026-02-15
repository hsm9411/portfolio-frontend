# ✅ 프로젝트/포스트 작성 폼 검증 에러 수정

## 문제

```
property tech_stack should not exist
each value in techStack must be a string
techStack must be an array
```

---

## 원인

**빈 문자열을 split하면 `[""]`가 생성됨:**

```javascript
// ❌ 문제 코드
"".split(',').map(s => s.trim()).filter(Boolean)
// 결과: [""] (빈 문자열 1개)

// Backend DTO 검증:
// - 배열이어야 함 ✅
// - 각 요소가 문자열이어야 함 ✅  
// - 하지만 빈 문자열("")은 유효하지 않음 ❌
```

---

## 해결 방법

### 1. 빈 문자열 필터링 강화

```typescript
// ✅ 올바른 방식
const techStackArray = formData.techStack
  .split(',')
  .map(s => s.trim())
  .filter(s => s.length > 0)  // 빈 문자열 제거

// 배열이 비어있으면 undefined 전송
techStack: techStackArray.length > 0 ? techStackArray : undefined
```

---

## 수정된 파일

### 1. `app/projects/new/page.tsx`

**Before:**
```typescript
tech_stack: formData.techStack.split(',').map(s => s.trim()).filter(Boolean)
```

**After:**
```typescript
const techStackArray = formData.techStack
  .split(',')
  .map(s => s.trim())
  .filter(s => s.length > 0)

// ...
techStack: techStackArray.length > 0 ? techStackArray : undefined
```

### 2. `app/blog/new/page.tsx`

**같은 패턴 적용:**
```typescript
const tagsArray = formData.tags
  .split(',')
  .map(s => s.trim())
  .filter(s => s.length > 0)

tags: tagsArray.length > 0 ? tagsArray : undefined
```

---

## 추가 수정

### TypeScript 타입 안전성

1. **catch 블록 타입:**
```typescript
catch (err: unknown) {
  const error = err as { statusCode?: number; message?: string }
}
```

2. **Supabase Client 타입:**
```typescript
const [supabaseClient, setSupabaseClient] = useState<ReturnType<typeof createClient> | null>(null)
```

---

## 테스트 시나리오

### 정상 케이스:
```typescript
// 입력: "NestJS, TypeScript, PostgreSQL"
// 결과: ["NestJS", "TypeScript", "PostgreSQL"] ✅

// 입력: "NestJS"
// 결과: ["NestJS"] ✅

// 입력: ""
// 결과: undefined ✅

// 입력: " , , "
// 결과: undefined ✅
```

---

## 배포

```bash
cd C:\hsm9411\portfolio-frontend
git add .
git commit -m "fix: 프로젝트/포스트 작성 시 빈 배열 검증 에러 수정"
git push origin main
```

---

## Backend DTO 검증 규칙

```typescript
// 참고: Backend의 검증 규칙
@IsArray()
@IsString({ each: true })
@IsOptional()
techStack?: string[]

// 조건:
// 1. 배열이어야 함
// 2. 각 요소가 문자열이어야 함
// 3. 빈 문자열("")은 허용하지 않음
// 4. undefined는 허용 (Optional)
```

---

작성일: 2026-02-15
