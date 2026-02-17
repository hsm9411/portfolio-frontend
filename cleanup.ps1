# Frontend Cleanup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Portfolio Frontend - File Cleanup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$files = @(
    "AUTH_COMPLETE.md",
    "AUTH_ERROR_FIX.md",
    "BACKEND_JWT_DEBUG.md",
    "COMPLETE.md",
    "DEBUG_GUIDE.md",
    "FIELD_NAME_FIX.md",
    "FILES_CHANGED.md",
    "FINAL_FIX_CAMELCASE.md",
    "FORM_VALIDATION_FIX.md",
    "FRONTEND_CHECKLIST.md",
    "GUIDE.md",
    "HTTPS_MIGRATION.md",
    "IMPROVEMENTS_APPLIED.md",
    "LOGIN_TEST.md",
    "LOGGING_DEBUG_GUIDE.md",
    "MIXED_CONTENT_FIX.md",
    "OAUTH_DEBUG.md",
    "OAUTH_SETUP.md",
    "PRERENDER_ERROR_FIX.md",
    "QUICK_START.md",
    "QUICK_START_NEW.md",
    "SESSION_FIX_FINAL.md",
    "SESSION_MANAGEMENT.md",
    "SUPABASE_FIX.md",
    "TODO.md",
    "TROUBLESHOOT.md",
    "TYPESCRIPT_FIX_COMPLETE.md",
    "TYPESCRIPT_STRICT_FIXED.md",
    "VERCEL_BUILD_FIX.md",
    "DOCS_CLEANUP.md",
    "DEPLOYMENT.md",
    "cleanup.bat"
)

Write-Host "Deleting files..." -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Deleted: $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Not found: $file" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cleanup completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m `"chore: cleanup outdated documentation`"" -ForegroundColor White
Write-Host "  git push origin main" -ForegroundColor White
Write-Host ""
