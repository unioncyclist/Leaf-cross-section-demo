@echo off
setlocal
set PORT=8000
set BASE=%~dp0
cd /d "%BASE%"

where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server %PORT%
  goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server %PORT%
  goto :eof
)

echo Python 未找到，请先安装 Python 3.x
echo 或使用 VS Code Live Server 打开 index.html
exit /b 1
