# ============================================================
# Frontend UI/UX 개선 전체 Push
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Frontend UI/UX 개선 Push" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$branch = git rev-parse --abbrev-ref HEAD
Write-Host "현재 브랜치: $branch" -ForegroundColor Yellow
Write-Host ""

Write-Host "[1/3] git add ..." -ForegroundColor Green
git add `
  hooks/useUnsavedWarning.ts `
  components/Navbar.tsx `
  components/ProjectCard.tsx `
  components/PostCard.tsx `
  components/CommentSection.tsx `
  components/LikeButton.tsx `
  app/page.tsx `
  app/projects/page.tsx `
  app/projects/new/page.tsx `
  "app/projects/[id]/page.tsx" `
  "app/projects/[id]/edit/page.tsx" `
  app/blog/page.tsx `
  app/blog/new/page.tsx `
  "app/blog/[id]/page.tsx" `
  "app/blog/[id]/edit/page.tsx"

Write-Host "  staged 완료" -ForegroundColor DarkGreen
Write-Host ""

Write-Host "--- Staged 파일 목록 ---" -ForegroundColor DarkGray
git diff --cached --name-only
Write-Host ""

$msg = "feat(ui): comprehensive UX/UI improvements

- Navbar: mobile slide panel with backdrop overlay
- Detail pages: sticky sub-navbar with back button and admin actions
- Detail pages: delete confirmation modal (replaces confirm())
- Edit/New pages: sticky save bar always visible while scrolling
- Edit/New pages: beforeunload warning for unsaved changes
- Edit/New pages: segmented edit/preview toggle button
- blog/new: remove redundant supabase auth check (useAuth is enough)
- ProjectCard: hover lift, thumbnail placeholder, status badge with ring
- PostCard: category badge, likeCount, consistent design
- CommentSection: inline textarea form, avatar initials, empty state illustration
- LikeButton: optimistic update, SVG heart icon, scale animation
- projects/page: rounded pagination arrows, consistent filter pills
- blog/page: search icon inside input, clear button improvements
- Home: hero section with CTA, improved section headers"

Write-Host "[2/3] git commit ..." -ForegroundColor Green
git commit -m $msg
Write-Host "  커밋 완료" -ForegroundColor DarkGreen
Write-Host ""

Write-Host "[3/3] git push origin $branch ..." -ForegroundColor Green
git push origin $branch
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Push 완료! Vercel 자동 배포 시작됨" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
