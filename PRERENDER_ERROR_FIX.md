# 🔧 Vercel Pre-render 에러 해결

## ❌ 발생한 에러

```
Error occurred prerendering page "/blog/new"
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

---

## 🔍 원인 분석

### Next.js App Router의 Pre-rendering

Next.js 13+ App Router는 **빌드 시점**에 모든 페이지를 미리 렌더링(pre-render)하려고 시도합니다.

```
[빌드 시점]
  ↓
Next.js가 /blog/new 페이지 렌더링 시도
  ↓
Supabase 클라이언트 생성 시도
  ↓
❌ 환경 변수 없음 (빌드 환경에는 런타임 환경 변수가 없음)
  ↓
에러 발생: "URL and API key are required"
```

### 문제가 되는 페이지들

- `/blog/new` - 블로그 작성 페이지 (관리자 전용)
- `/projects/new` - 프로젝트 작성 페이지 (관리자 전용)
- 기타 `useAuth()` 훅을 사용하는 페이지들

---

## ✅ 해결 방법

### 1. 동적 렌더링 강제

`'use client'` 컴포넌트라도 Next.js는 초기 HTML을 서버에서 생성하려 합니다.  
**동적 렌더링을 명시적으로 지정**해야 합니다.

```typescript
'use client'

// ✅ 이 두 줄 추가
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function NewPostPage() {
  // ...
}
```

### 2. 클라이언트 사이드에서만 Supabase 초기화

```typescript
const [supabaseClient, setSupabaseClient] = useState<any>(null)

useEffect(() => {
  // ✅ 브라우저에서만 Supabase 클라이언트 생성
  if (typeof window !== 'undefined') {
    const client = createClient()
    setSupabaseClient(client)
  }
}, [])
```

---

## 📝 적용된 수정

### 수정된 파일들

1. ✅ `app/blog/new/page.tsx`
2. ✅ `app/projects/new/page.tsx`

### 변경 내용

```typescript
// Before
'use client'
import { createClient } from '@/lib/supabase/client'

export default function NewPostPage() {
  const supabase = createClient() // ❌ 빌드 시점에 에러
  // ...
}

// After
'use client'
export const dynamic = 'force-dynamic'  // ✅ 추가
export const revalidate = 0              // ✅ 추가

export default function NewPostPage() {
  const [supabaseClient, setSupabaseClient] = useState<any>(null)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSupabaseClient(createClient()) // ✅ 클라이언트에서만 생성
    }
  }, [])
  // ...
}
```

---

## 📚 Next.js Rendering 옵션

### `export const dynamic`

```typescript
export const dynamic = 'auto'           // 기본값: 자동 판단
export const dynamic = 'force-dynamic'  // 항상 동적 렌더링
export const dynamic = 'force-static'   // 항상 정적 생성
export const dynamic = 'error'          // 동적 요소 발견 시 에러
```

### `export const revalidate`

```typescript
export const revalidate = 0      // 매 요청마다 재생성
export const revalidate = 60     // 60초마다 재검증
export const revalidate = false  // 무한 캐시
```

### 우리의 선택

```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

**이유:**
- 관리자 전용 페이지 → 캐싱 불필요
- 인증 상태 확인 필요 → 매번 서버에서 렌더링
- Pre-rendering 방지 → 환경 변수 에러 해결

---

## 🔍 디버깅 팁

### 빌드 로그 확인

```bash
npm run build
```

성공 시:
```
✓ Generating static pages (10/10)
✓ Collecting build traces
✓ Finalizing page optimization
```

실패 시:
```
Error occurred prerendering page "/blog/new"
```

### 로컬 프로덕션 빌드 테스트

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 또는
next start
```

---

## ⚠️ 주의사항

### 1. 모든 Client Component가 동적 렌더링이 필요한 건 아님

```typescript
// ❌ 불필요한 force-dynamic
'use client'
export const dynamic = 'force-dynamic'

export default function SimpleButton() {
  return <button onClick={() => alert('hi')}>Click</button>
}
```

```typescript
// ✅ 필요한 경우에만
'use client'
export const dynamic = 'force-dynamic'  // 인증, DB 접근 등

export default function AdminPage() {
  const { user } = useAuth()  // 환경 변수 필요
  // ...
}
```

### 2. 성능 트레이드오프

- `force-dynamic` → 빌드 시간 단축, 런타임 성능 약간 감소
- `force-static` → 빌드 시간 증가, 런타임 성능 최고

**관리자 페이지는 트래픽이 적으므로 동적 렌더링이 적합**

---

## 🚀 배포

```bash
git add .
git commit -m "fix: Add force-dynamic rendering for admin pages

- Add dynamic='force-dynamic' to /blog/new and /projects/new
- Initialize Supabase client on client-side only
- Prevent pre-rendering errors during build
- Fixes: Supabase URL/API key required error"

git push origin main
```

Vercel이 자동으로 재배포하고 빌드가 성공할 것입니다! ✅

---

## 📖 참고 문서

- [Next.js Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
- [Next.js Dynamic Rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering)
- [Supabase with Next.js App Router](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

**최종 수정일**: 2026-02-13  
**관련 파일**:
- `app/blog/new/page.tsx`
- `app/projects/new/page.tsx`
