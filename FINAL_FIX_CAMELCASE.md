# ✅ 최종 수정: Backend는 camelCase 사용

## 문제 해결

**에러 메시지:**
```
1. each value in techStack must be a string
2. techStack must be an array
```

**원인:**
- Backend DTO가 **camelCase**를 사용함
- Frontend가 **snake_case**로 전송했음

---

## 해결 방법

### Frontend Payload 수정

**Before (잘못됨):**
```typescript
payload.thumbnail_url = formData.thumbnailUrl  // ❌
payload.demo_url = formData.demoUrl            // ❌
payload.github_url = formData.githubUrl        // ❌
payload.tech_stack = techStackArray            // ❌
```

**After (올바름):**
```typescript
payload.thumbnailUrl = formData.thumbnailUrl   // ✅
payload.demoUrl = formData.demoUrl             // ✅
payload.githubUrl = formData.githubUrl         // ✅
payload.techStack = techStackArray             // ✅
payload.tags = tagsArray                       // ✅
```

---

## Backend DTO 구조 (추론)

```typescript
export class CreateProjectDto {
  @IsString()
  title: string

  @IsString()
  summary: string

  @IsString()
  description: string

  @IsString()
  @IsOptional()
  thumbnailUrl?: string

  @IsString()
  @IsOptional()
  demoUrl?: string

  @IsString()
  @IsOptional()
  githubUrl?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  techStack?: string[]

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[]

  @IsEnum(['in-progress', 'completed', 'archived'])
  status: string
}
```

---

## 배포

```bash
cd C:\hsm9411\portfolio-frontend
git add .
git commit -m "fix: Backend camelCase에 맞춰 필드명 수정"
git push origin main
```

---

## 테스트 케이스

### 최소 필드만 입력
```json
{
  "title": "test",
  "summary": "test",
  "description": "test",
  "status": "in-progress"
}
```
**예상:** ✅ 201 Created

### 모든 필드 입력
```json
{
  "title": "Portfolio Backend",
  "summary": "NestJS 기반 포트폴리오 백엔드",
  "description": "상세 설명...",
  "thumbnailUrl": "https://example.com/img.png",
  "demoUrl": "https://demo.com",
  "githubUrl": "https://github.com/user/repo",
  "techStack": ["NestJS", "TypeScript", "PostgreSQL"],
  "tags": ["Backend", "API"],
  "status": "completed"
}
```
**예상:** ✅ 201 Created

### 빈 기술 스택/태그
```json
{
  "title": "test",
  "summary": "test",
  "description": "test",
  "status": "in-progress"
  // techStack, tags 필드 없음 (undefined)
}
```
**예상:** ✅ 201 Created

---

## 핵심 교훈

### NestJS는 기본적으로 camelCase를 선호

**이유:**
1. TypeScript/JavaScript 표준 컨벤션
2. class-validator 데코레이터는 camelCase 사용
3. TypeORM 엔티티도 camelCase 선호

**snake_case는 주로:**
- 데이터베이스 컬럼명
- 환경 변수

**API 요청/응답은 camelCase 사용!**

---

작성일: 2026-02-15
최종 수정 완료
