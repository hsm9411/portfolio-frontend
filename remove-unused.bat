@echo off
echo Removing unused files from portfolio-frontend...

:: Debug page (production에 노출되면 안 됨)
rmdir /s /q "app\debug" 2>nul && echo Removed: app/debug/

:: Register page (OAuth만 사용, 이메일 회원가입 미사용)
rmdir /s /q "app\register" 2>nul && echo Removed: app/register/

:: Unused components
del /f "components\About.tsx" 2>nul && echo Removed: components/About.tsx
del /f "components\ScrollRestorer.tsx" 2>nul && echo Removed: components/ScrollRestorer.tsx
del /f "components\FormContainer.tsx" 2>nul && echo Removed: components/FormContainer.tsx

:: Unused hooks
del /f "hooks\useUnsavedWarning.ts" 2>nul && echo Removed: hooks/useUnsavedWarning.ts

:: Outdated scripts and docs
del /f "cleanup.ps1" 2>nul && echo Removed: cleanup.ps1
del /f "git-push.ps1" 2>nul && echo Removed: git-push.ps1
del /f "API_SPEC.md" 2>nul && echo Removed: API_SPEC.md
del /f "DEPLOY.md" 2>nul && echo Removed: DEPLOY.md

echo.
echo Done. Now run:
echo   git add -A
echo   git commit -m "chore: remove unused files and outdated docs"
echo   git push origin develop
