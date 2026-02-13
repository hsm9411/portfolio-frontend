# 🔧 Vercel 빌드 에러 수정 완료 (v3)

## ❌ 발생한 에러들

### 에러 1: checkLike export 없음
```
Export checkLike doesn't exist in target module
```

### 에러 2: Post 타입 export 없음
```
Type error: Module '"@/lib/api/posts"' declares 'Post' locally, but it is not exported.
```

### 에러 3: readTimeMinutes 필드 없음
```
Type error: Property 'readTimeMinutes' does not exist on type 'Post'.
  - app/blog/[slug]/page.tsx:102
  - components/PostCard.tsx:44
```

---

## ✅ 수정 내역

### 1차 수정: API 함수 및 응답 형식

#### `lib/api/likes.ts`
- ❌ `checkLike` 함수 제거
- ✅ `getLikeStatus` 함수로 통일
- ✅ **타입 re-export 추가**

```typescript
export type { LikeTargetType, LikeStatus }
```

#### `components/LikeButton.tsx`
```typescript
// Before
import { toggleLike, checkLike } from '@/lib/api/likes'
const response = await checkLike(targetType, targetId)
setLiked(response.liked)

// After
import { toggleLike, getLikeStatus } from '@/lib/api/likes'
const response = await getLikeStatus(targetType, targetId)
setLiked(response.isLiked)
setLikeCount(response.likeCount)
```

#### `components/CommentSection.tsx`
```typescript
// Before
const response = await getComments({ targetType, targetId, limit: 50 })
setComments(response.items)
comment.authorNickname

// After
const data = await getComments(targetType, targetId)
setComments(data)
comment.user.nickname
```

### 2차 수정: 타입 Export 누락 문제

모든 API 파일에 타입 re-export 추가:

#### `lib/api/posts.ts`
```typescript
export type { Post, GetPostsRequest, CreatePostRequest, UpdatePostRequest }
```

#### `lib/api/projects.ts`
```typescript
export type { 
  Project, 
  GetProjectsRequest, 
  CreateProjectRequest, 
  UpdateProjectRequest 
}
```

#### `lib/api/comments.ts`
```typescript
export type { 
  Comment, 
  CommentTargetType, 
  CreateCommentRequest, 
  UpdateCommentRequest 
}
```

#### `lib/api/auth.ts`
```typescript
export type { User, AuthResponse, LoginRequest, RegisterRequest }
```

### 3차 수정: readTimeMinutes 자동 계산

백엔드 Post 엔티티에 `readTimeMinutes` 필드가 없으므로, 프론트엔드에서 자동 계산하도록 수정.

#### `app/blog/[slug]/page.tsx`
```typescript
// 읽기 시간 계산 (한국어 기준: 분당 약 500자)
const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 500
  const wordCount = content.length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

export default function BlogPostPage() {
  // ...
  const readTimeMinutes = calculateReadTime(post.content)
  
  // JSX에서 사용
  <span className="flex items-center gap-1">
    📖 {readTimeMinutes}분
  </span>
}
```

#### `components/PostCard.tsx`
```typescript
// 읽기 시간 계산 함수 추가
const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 500
  const wordCount = content.length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

export default function PostCard({ post }: PostCardProps) {
  const readTimeMinutes = calculateReadTime(post.content)
  
  return (
    // ...
    <span className="flex items-center gap-1">
      📖 {readTimeMinutes}분
    </span>
  )
}
```

---

## 📝 타입 Import 방법

### 권장 방법 1: 통합 Import
```typescript
import { getProjects, type Project } from '@/lib/api'
```

### 권장 방법 2: 개별 Import
```typescript
import { getProjects, type Project } from '@/lib/api/projects'
```

### 권장 방법 3: 타입만 Import
```typescript
import type { Project } from '@/lib/types/api'
import { getProjects } from '@/lib/api/projects'
```

---

## 🚀 재배포

```bash
# 변경사항 커밋
git add .
git commit -m "fix: Calculate readTimeMinutes from content length

- Add calculateReadTime function to compute reading time
- Remove readTimeMinutes from Post type (not in backend)
- Apply to app/blog/[slug]/page.tsx and PostCard component
- Use 500 chars/min for Korean content"

# Vercel 자동 재배포
git push origin main
```

---

## ✅ 로컬 빌드 테스트

```bash
# TypeScript 타입 체크
npm run build
```

**성공 시 출력:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
```

---

## 🔍 수정된 파일 목록

1. ✅ `lib/api/auth.ts` - User, AuthResponse 등 타입 export
2. ✅ `lib/api/projects.ts` - Project 타입 export
3. ✅ `lib/api/posts.ts` - Post 타입 export
4. ✅ `lib/api/comments.ts` - Comment 타입 export
5. ✅ `lib/api/likes.ts` - LikeStatus 타입 export + getLikeStatus 추가
6. ✅ `components/LikeButton.tsx` - API 호출 수정
7. ✅ `components/CommentSection.tsx` - API 호출 및 응답 구조 수정
8. ✅ `app/blog/[slug]/page.tsx` - readTimeMinutes 자동 계산
9. ✅ `components/PostCard.tsx` - readTimeMinutes 자동 계산

---

## 📚 백엔드 API 스펙

### Post Entity
```typescript
// backend: src/entities/post/post.entity.ts
interface Post {
  id: string
  slug: string
  title: string
  content: string
  summary: string
  tags: string[]
  viewCount: number
  likeCount: number
  authorId: string
  authorNickname: string
  authorAvatarUrl: string | null
  createdAt: Date
  updatedAt: Date
  // ❌ readTimeMinutes 필드 없음 (프론트엔드에서 계산)
}
```

### Comments API
```typescript
// GET /comments/:targetType/:targetId
Response: Comment[]

interface Comment {
  id: string
  content: string
  user: {
    id: string | null
    nickname: string
    avatarUrl: string | null
  }
  isAnonymous: boolean
  isMine: boolean
  createdAt: string
  updatedAt: string
}
```

### Likes API
```typescript
// GET /likes/:targetType/:targetId
// POST /likes/:targetType/:targetId
Response: { isLiked: boolean, likeCount: number }
```

---

## ⚠️ 향후 주의사항

1. **타입 Export**
   - API 파일에서 사용하는 모든 타입을 `export type { ... }` 해야 함
   - import만 하고 re-export 안 하면 다른 파일에서 사용 불가

2. **Import 방식**
   ```typescript
   // ✅ 좋음
   import { getProjects, type Project } from '@/lib/api/projects'
   
   // ✅ 좋음
   import type { Project } from '@/lib/types/api'
   import { getProjects } from '@/lib/api/projects'
   
   // ❌ 나쁨 (타입이 export 안 되어 있으면 에러)
   import { getProjects, Project } from '@/lib/api/projects'
   ```

3. **API 응답 구조**
   - 백엔드 응답과 프론트엔드 타입이 일치해야 함
   - `lib/types/api.ts` 참고

4. **계산된 필드**
   - 백엔드에 없는 필드는 프론트엔드에서 계산
   - `readTimeMinutes`는 `content.length / 500` 으로 자동 계산

---

## 💡 ReadTime 계산 로직

```typescript
/**
 * 한국어 텍스트 읽기 시간 계산
 * - 기준: 분당 500자 (한국어 평균)
 * - 최소값: 1분
 */
const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 500
  const wordCount = content.length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}
```

영어는 분당 200-250 단어가 평균이지만, 한국어는 글자 수 기준으로 계산합니다.

---

**최종 수정일**: 2026-02-13  
**배포 URL**: https://portfolio-front-ten-gamma.vercel.app  
**상태**: ✅ 빌드 에러 모두 수정 완료
