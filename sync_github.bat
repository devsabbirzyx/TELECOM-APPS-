@echo off
echo ==========================================
echo    Auto-Sync changes to GitHub
echo ==========================================
cd /d "%~dp0"
git add .
set /p commit_msg="Enter commit message (or press enter for default): "
if "%commit_msg%"=="" set commit_msg="Update project changes"
git commit -m "%commit_msg%"
git push origin main
echo.
echo [DONE] Sync completed!
pause
