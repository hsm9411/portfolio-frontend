@echo off
echo ========================================
echo Portfolio Frontend - File Cleanup Script
echo ========================================
echo.

echo Deleting outdated documentation files...

del /F /Q AUTH_COMPLETE.md 2>nul
del /F /Q AUTH_ERROR_FIX.md 2>nul
del /F /Q BACKEND_JWT_DEBUG.md 2>nul
del /F /Q COMPLETE.md 2>nul
del /F /Q DEBUG_GUIDE.md 2>nul
del /F /Q FIELD_NAME_FIX.md 2>nul
del /F /Q FILES_CHANGED.md 2>nul
del /F /Q FINAL_FIX_CAMELCASE.md 2>nul
del /F /Q FORM_VALIDATION_FIX.md 2>nul
del /F /Q FRONTEND_CHECKLIST.md 2>nul
del /F /Q GUIDE.md 2>nul
del /F /Q HTTPS_MIGRATION.md 2>nul
del /F /Q IMPROVEMENTS_APPLIED.md 2>nul
del /F /Q LOGIN_TEST.md 2>nul
del /F /Q LOGGING_DEBUG_GUIDE.md 2>nul
del /F /Q MIXED_CONTENT_FIX.md 2>nul
del /F /Q OAUTH_DEBUG.md 2>nul
del /F /Q OAUTH_SETUP.md 2>nul
del /F /Q PRERENDER_ERROR_FIX.md 2>nul
del /F /Q QUICK_START.md 2>nul
del /F /Q QUICK_START_NEW.md 2>nul
del /F /Q SESSION_FIX_FINAL.md 2>nul
del /F /Q SESSION_MANAGEMENT.md 2>nul
del /F /Q SUPABASE_FIX.md 2>nul
del /F /Q TODO.md 2>nul
del /F /Q TROUBLESHOOT.md 2>nul
del /F /Q TYPESCRIPT_FIX_COMPLETE.md 2>nul
del /F /Q TYPESCRIPT_STRICT_FIXED.md 2>nul
del /F /Q VERCEL_BUILD_FIX.md 2>nul
del /F /Q DOCS_CLEANUP.md 2>nul
del /F /Q DEPLOYMENT.md 2>nul

echo.
echo ========================================
echo Cleanup completed!
echo ========================================
echo.
echo Remaining documents:
echo - README.md (main documentation)
echo - API_SPEC.md (API specification)
echo - DEPLOY.md (deployment guide)
echo - .env.local.example (environment template)
echo.
pause
