# 🚀 빠른 시작 가이드

## ✅ 개선사항 적용 완료!

다음 개선사항이 적용되었습니다:
- ✅ API 타입 정의 (`lib/types/api.ts`)
- ✅ API 클라이언트 개선 (Timeout 25초, 에러 처리)
- ✅ Vercel 프록시 설정 (`vercel.json`)
- ✅ 모든 API 함수 타입 안전성 강화

자세한 내용은 `IMPROVEMENTS_APPLIED.md`를 참고하세요.

---

## 🏃 로컬 개발 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

---

## 🔧 환경변수 설정

`.env.local` 파일이 이미 설정되어 있습니다. 
새 프로젝트에서 시작하려면 `.env.example`을 참고하세요.

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

---

## 📦 API 사용법

### Import 방식

```typescript
// 통합 Import (권장)
import { getProjects, type Project, type PaginatedResponse } from '@/lib/api'

// 개별 Import
import { getProjects } from '@/lib/api/projects'
import type { Project } from '@/lib/types/api'
```

### 타입 안전한 API 호출

```typescript
// Projects
const projects = await getProjects({ 
  page: 1, 
  limit: 10,
  status: 'completed' 
})
// projects: PaginatedResponse<Project>

// Posts
const posts = await getPosts({ 
  tags: ['NestJS', 'TypeScript'] 
})
// posts: PaginatedResponse<Post>

// Comments
const comments = await getComments('project', projectId)
// comments: Comment[]

// Likes
const status = await toggleLike('post', postId)
// status: LikeStatus { isLiked: boolean, likeCount: number }
```

### 에러 처리

```typescript
import { getErrorMessage } from '@/lib/api'

try {
  const project = await getProject(id)
  console.log(project.title)
} catch (error) {
  const message = getErrorMessage(error)
  alert(message) // "프로젝트를 찾을 수 없습니다."
}
```

---

## 🚀 배포

### Vercel 배포

```bash
# Vercel CLI 설치 (선택)
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### Git Push로 자동 배포

```bash
git add .
git commit -m "feat: Apply API improvements"
git push origin main
```

Vercel이 자동으로 감지하고 배포합니다.

---

## 🔍 배포 후 확인사항

### 1. Vercel 프록시 작동 확인

브라우저 개발자 도구 Network 탭에서:
```
Request URL: https://yourapp.vercel.app/api/projects
Status: 200 OK
```

### 2. 백엔드 CORS 설정

백엔드 서버 `.env` 파일:
```env
CORS_ORIGINS=https://yourapp.vercel.app,http://localhost:3000
```

### 3. Supabase OAuth 설정

- Supabase Dashboard → Authentication → URL Configuration
- Site URL: `https://yourapp.vercel.app`
- Redirect URLs: `https://yourapp.vercel.app/auth/callback`

---

## 📚 주요 파일 위치

| 파일 | 설명 |
|------|------|
| `lib/types/api.ts` | 모든 API 타입 정의 |
| `lib/api/client.ts` | Axios 클라이언트 설정 |
| `lib/api/*.ts` | API 함수들 (auth, projects, posts, comments, likes) |
| `lib/api/index.ts` | 통합 Export |
| `vercel.json` | Vercel 프록시 설정 |
| `.env.local` | 환경변수 |

---

## 🎯 다음 단계 (선택)

### React Query 설치 (권장)

```bash
npm install @tanstack/react-query
```

Custom Hooks 작성:
```typescript
// hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query'
import { getProjects } from '@/lib/api'

export function useProjects(params?) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getProjects(params),
  })
}

// 사용
const { data, isLoading } = useProjects({ page: 1 })
```

자세한 내용은 `IMPROVEMENTS_APPLIED.md`를 참고하세요.

---

## 🐛 문제 해결

### API 호출 실패

```bash
# 1. Vercel 프록시 확인
cat vercel.json

# 2. 백엔드 서버 상태 확인
curl http://158.180.75.205:3001/projects

# 3. 로컬에서 직접 연결 테스트
NEXT_PUBLIC_API_URL=http://158.180.75.205:3001 npm run dev
```

### 타입 에러

```bash
# TypeScript 타입 체크
npm run build

# 타입 정의 확인
cat lib/types/api.ts
```

---

## 📞 참고 자료

- [IMPROVEMENTS_APPLIED.md](./IMPROVEMENTS_APPLIED.md) - 적용된 개선사항 상세
- [API_SPEC.md](./API_SPEC.md) - API 명세
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 배포 가이드

---

**작성일**: 2026-02-13  
**버전**: v1.0 (개선사항 적용 완료)
