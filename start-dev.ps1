# Load environment variables from backend/.env
Get-Content .\backend\.env | ForEach-Object {
  if ($_ -match '^\s*([^=]+)=(.*)$') {
    $name = $matches[1].Trim()
    $value = $matches[2].Trim()
    Set-Item -Path Env:\$name -Value $value
    Write-Host "Loaded: $name" -ForegroundColor Green
  }
}

Write-Host "`nStarting Next.js dev server..." -ForegroundColor Cyan
npm run dev
