# 🔧 Vercel 빌드 에러 수정 완료

## ❌ 발생한 에러

```
Error: Turbopack build failed with 2 errors:
Export checkLike doesn't exist in target module
```

---

## ✅ 수정된 파일

### 1. `lib/api/likes.ts`
- ❌ `checkLike` 함수 제거 (존재하지 않음)
- ✅ `getLikeStatus` 함수로 통일

**API 응답 형식:**
```typescript
{
  isLiked: boolean,
  likeCount: number
}
```

### 2. `components/LikeButton.tsx`
**Before:**
```typescript
import { toggleLike, checkLike } from '@/lib/api/likes'
const response = await checkLike(targetType, targetId)
setLiked(response.liked) // ❌ 잘못된 필드명
```

**After:**
```typescript
import { toggleLike, getLikeStatus } from '@/lib/api/likes'
const response = await getLikeStatus(targetType, targetId)
setLiked(response.isLiked) // ✅ 올바른 필드명
setLikeCount(response.likeCount)
```

### 3. `components/CommentSection.tsx`
**Before:**
```typescript
const response = await getComments({ targetType, targetId, limit: 50 })
setComments(response.items)
```

**After:**
```typescript
// 백엔드 API: GET /comments/:targetType/:targetId
const data = await getComments(targetType, targetId)
setComments(data) // Comment[] 배열 직접 반환
```

**Comment 객체 구조 변경:**
```typescript
// Before
comment.authorNickname

// After
comment.user.nickname // ✅ 백엔드 응답 구조와 일치
```

---

## 🚀 재배포 방법

```bash
# 변경사항 커밋
git add .
git commit -m "fix: Update API calls to match backend specification"

# Vercel 재배포
git push origin main
```

---

## 🔍 백엔드 API 스펙 확인

### Likes API
```typescript
// GET /likes/:targetType/:targetId
Response: { isLiked: boolean, likeCount: number }

// POST /likes/:targetType/:targetId (토글)
Response: { isLiked: boolean, likeCount: number }
```

### Comments API
```typescript
// GET /comments/:targetType/:targetId
Response: Comment[] // 배열 직접 반환

interface Comment {
  id: string
  content: string
  user: {
    id: string | null  // 익명이면 null
    nickname: string   // 익명이면 "익명"
    avatarUrl: string | null
  }
  isAnonymous: boolean
  isMine: boolean
  createdAt: string
  updatedAt: string
}
```

---

## ✅ 확인 사항

### 로컬 빌드 테스트
```bash
npm run build
```

에러 없이 빌드되면 성공!

### Vercel 배포 확인
1. https://vercel.com/dashboard
2. 최근 배포 상태 확인
3. Build Logs 확인

---

## 📝 향후 주의사항

1. **API 타입 일치**
   - `lib/types/api.ts`와 백엔드 응답 형식이 일치해야 함
   - 필드명 확인 (camelCase vs snake_case)

2. **Import 경로**
   - `@/lib/api` 통합 export 사용 권장
   - 개별 import 시 타입도 함께 import

3. **에러 처리**
   - `error.response?.data?.message` → `error.message`
   - `getErrorMessage(error)` 헬퍼 사용

---

**수정 완료일**: 2026-02-13  
**배포 URL**: https://portfolio-front-ten-gamma.vercel.app
