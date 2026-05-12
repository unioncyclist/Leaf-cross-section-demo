$ErrorActionPreference = "Stop"

$port = 8000
$basePath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $basePath

$pythonCmd = $null
try {
  $pythonCmd = (Get-Command python -ErrorAction Stop).Source
} catch {
  try {
    $pythonCmd = (Get-Command py -ErrorAction Stop).Source
  } catch {
    $pythonCmd = $null
  }
}

if (-not $pythonCmd) {
  Write-Host "Python 未找到，请先安装 Python 3.x" -ForegroundColor Yellow
  Write-Host "或使用 VS Code Live Server 打开 index.html"
  exit 1
}

Write-Host "Serving on http://localhost:$port" -ForegroundColor Green
& $pythonCmd -m http.server $port
