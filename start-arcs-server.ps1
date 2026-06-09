$node = "C:\Users\blueb\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$appDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Test-Path $node)) {
  Write-Host "Node runtime was not found:"
  Write-Host $node
  Read-Host "Press Enter to close"
  exit 1
}

Set-Location $appDir
Write-Host "Starting ARCS! at http://127.0.0.1:4177"
Write-Host "Keep this window open while using Komga sync."
Start-Process "http://127.0.0.1:4177"
& $node (Join-Path $appDir "server.js")
Write-Host ""
Write-Host "ARCS! server stopped."
Read-Host "Press Enter to close"
