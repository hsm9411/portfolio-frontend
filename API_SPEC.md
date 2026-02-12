# 📋 백엔드 API 명세 (Swagger 기반)

**Swagger URL**: http://158.180.75.205:3001/api

---

## 🔐 인증

### Headers
```
Authorization: Bearer {JWT_TOKEN}
```

---

## 📁 Projects API

### GET /projects
**목록 조회 (페이징, 검색, 필터링)**

**Query Parameters**:
```typescript
{
  page?: number          // 페이지 번호 (기본: 1)
  limit?: number         // 페이지당 항목 수 (기본: 10, 최대: 100)
  search?: string        // 검색어 (제목, 설명)
  status?: 'in-progress' | 'completed' | 'archived'  // 상태 필터
  sortBy?: 'created_at' | 'view_count' | 'like_count'  // 정렬 기준 (camelCase!)
  order?: 'ASC' | 'DESC' // 정렬 방향 (기본: DESC)
}
```

**Response**:
```typescript
{
  data: Project[],
  total: number,
  page: number,
  limit: number,
  total_pages: number
}
```

---

### GET /projects/:id
**상세 조회 (조회수 자동 증가)**

**Response**: `Project`

---

### POST /projects
**생성 (관리자만, JWT 필요)**

**Headers**: `Authorization: Bearer {token}`

**Body**:
```typescript
{
  title: string,
  summary: string,
  description: string,
  thumbnail_url?: string,
  demo_url?: string,
  github_url?: string,
  tech_stack: string[],
  tags: string[],
  status: 'in-progress' | 'completed' | 'archived'
}
```

---

### PATCH /projects/:id
**수정 (작성자/관리자, JWT 필요)**

**Headers**: `Authorization: Bearer {token}`

**Body**: Partial<CreateProjectDto>

---

### DELETE /projects/:id
**삭제 (작성자/관리자, JWT 필요)**

**Headers**: `Authorization: Bearer {token}`

**Response**: `{ message: string }`

---

## 📝 Posts API

### GET /posts
**목록 조회 (페이징, 검색, 태그)**

**Query Parameters**:
```typescript
{
  page?: number          // 페이지 번호 (기본: 1)
  limit?: number         // 페이지당 항목 수 (기본: 10, 최대: 100)
  search?: string        // 검색어
  tags?: string[]        // 태그 배열 (예: ['NestJS', 'TypeScript'])
}
```

**Response**:
```typescript
{
  data: Post[],
  total: number,
  page: number,
  limit: number,
  total_pages: number
}
```

---

### GET /posts/:slug
**Slug로 조회 (SEO 친화적, 조회수 자동 증가)**

**Response**: `Post`

---

### POST /posts
**작성 (로그인 필수, JWT 필요)**

**Headers**: `Authorization: Bearer {token}`

**Body**:
```typescript
{
  title: string,
  content: string,       // Markdown
  summary: string,
  tags: string[]
}
```

**Note**: `slug`는 자동 생성됨 (title 기반)

---

### PUT /posts/:id
**수정 (작성자만, JWT 필요)**

**Headers**: `Authorization: Bearer {token}`

**Body**: Partial<CreatePostDto>

---

### DELETE /posts/:id
**삭제 (작성자만, JWT 필요)**

**Headers**: `Authorization: Bearer {token}`

**Response**: `{ message: string }`

---

## 💬 Comments API

### GET /comments
**목록 조회 (target 필터링)**

**Query Parameters**:
```typescript
{
  targetType: 'project' | 'post',  // 필수!
  targetId: string,                // 필수!
  page?: number,
  limit?: number
}
```

---

### GET /comments/:id
**단일 조회**

**Response**: `Comment`

---

### POST /comments
**댓글 작성 (로그인/익명 가능)**

**Headers**: `Authorization: Bearer {token}` (선택)

**Body**:
```typescript
{
  targetType: 'project' | 'post',
  targetId: string,
  content: string,
  parentId?: string,      // 대댓글인 경우
  isAnonymous?: boolean   // 익명 댓글 (로그인 상태에서)
}
```

---

### PATCH /comments/:id
**수정 (작성자만, JWT 필요)**

**Headers**: `Authorization: Bearer {token}`

**Body**: `{ content: string }`

---

### DELETE /comments/:id
**삭제 (작성자만, JWT 필요)**

**Headers**: `Authorization: Bearer {token}`

---

## ❤️ Likes API

### POST /likes/toggle
**좋아요 토글 (JWT 필요)**

**Headers**: `Authorization: Bearer {token}`

**Body**:
```typescript
{
  targetType: 'project' | 'post',
  targetId: string
}
```

**Response**:
```typescript
{
  liked: boolean,        // true: 좋아요 추가, false: 좋아요 취소
  likeCount: number      // 현재 좋아요 수
}
```

---

### GET /likes/check
**좋아요 여부 확인 (JWT 필요)**

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
```typescript
{
  targetType: 'project' | 'post',
  targetId: string
}
```

**Response**:
```typescript
{
  liked: boolean
}
```

---

## 🔐 Auth API

### POST /auth/register
**회원가입 (Local)**

**Body**:
```typescript
{
  email: string,
  password: string,
  nickname: string
}
```

---

### POST /auth/login
**로그인 (Local)**

**Body**:
```typescript
{
  email: string,
  password: string
}
```

**Response**:
```typescript
{
  access_token: string,
  user: User
}
```

---

### GET /auth/me
**현재 사용자 정보 (JWT 필요)**

**Headers**: `Authorization: Bearer {token}`

**Response**: `User`

---

### POST /auth/sync-oauth-user
**OAuth 사용자 동기화 (선택)**

**Headers**: `Authorization: Bearer {supabase_token}`

**Body**:
```typescript
{
  email: string,
  nickname?: string,
  avatar_url?: string,
  provider: 'google' | 'github',
  provider_id: string
}
```

---

## 📊 타입 정의

### Project
```typescript
{
  id: string,
  title: string,
  summary: string,
  description: string,
  thumbnail_url?: string,
  demo_url?: string,
  github_url?: string,
  tech_stack: string[],
  tags: string[],
  status: 'in-progress' | 'completed' | 'archived',
  view_count: number,
  like_count: number,
  author_id: string,
  author_nickname: string,
  author_avatar_url?: string,
  created_at: string,
  updated_at: string
}
```

### Post
```typescript
{
  id: string,
  slug: string,           // SEO 친화적 URL
  title: string,
  content: string,        // Markdown
  summary: string,
  tags: string[],
  read_time_minutes: number,
  view_count: number,
  like_count: number,
  author_id: string,
  author_nickname: string,
  author_avatar_url?: string,
  created_at: string,
  updated_at: string
}
```

### Comment
```typescript
{
  id: string,
  targetType: 'project' | 'post',
  targetId: string,
  parentId?: string,
  content: string,
  isAnonymous: boolean,
  authorId?: string,
  authorNickname: string,
  authorEmail?: string,
  ipAddress?: string,
  created_at: string,
  updated_at: string
}
```

---

## ⚠️ 중요 사항

### 1. 파라미터 이름
- ✅ **camelCase**: `sortBy`, `targetType`, `targetId`
- ❌ **snake_case**: `sort_by`, `target_type` (사용 안 함!)

### 2. JWT 토큰
- **Supabase JWT**: Supabase에서 발급한 토큰 (OAuth)
- **Local JWT**: 백엔드에서 발급한 토큰 (email/password)
- 둘 다 사용 가능 (SupabaseJwtStrategy + JwtStrategy)

### 3. Redis 조회수
- IP 기반 중복 방지 (24시간 TTL)
- 매일 자정 DB 동기화
- GET 요청만으로 자동 증가 (별도 API 없음)

---

**작성 기준**: Swagger 문서 및 실제 백엔드 코드
**작성일**: 2026-02-11
