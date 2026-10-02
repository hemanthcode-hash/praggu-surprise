@echo off
setlocal enabledelayedexpansion
title Optimize Photos for Fast Mobile Loading

echo ========================================================
echo   PRAGGU BIRTHDAY - MOBILE IMAGE OPTIMIZER
echo ========================================================
echo.

REM 1. First sync any new uploaded photos from brain to dist
if exist "C:\Users\Hemanth Pelluru\.gemini\antigravity\brain\e994a276-962b-4bbe-ac65-e1d556465630\.user_uploaded\media_1790960959674.jpg" (
  copy /Y "C:\Users\Hemanth Pelluru\.gemini\antigravity\brain\e994a276-962b-4bbe-ac65-e1d556465630\.user_uploaded\media_1790960959674.jpg" "%~dp0dist\memory-celebration.jpeg" >nul 2>&1
)
if exist "C:\Users\Hemanth Pelluru\.gemini\antigravity\brain\e994a276-962b-4bbe-ac65-e1d556465630\.user_uploaded\media_1790878102678.jpg" (
  copy /Y "C:\Users\Hemanth Pelluru\.gemini\antigravity\brain\e994a276-962b-4bbe-ac65-e1d556465630\.user_uploaded\media_1790878102678.jpg" "%~dp0dist\memory-new-year.jpeg" >nul 2>&1
)

echo [1/2] Syncing uploaded images... Done.
echo [2/2] Optimizing and compressing images for mobile...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$dist = Join-Path $PSScriptRoot 'dist';" ^
  "if (-not (Test-Path $dist)) { $dist = (Get-Item '%~dp0dist').FullName };" ^
  "Add-Type -AssemblyName System.Drawing;" ^
  "$backupDir = Join-Path $dist 'backup_originals';" ^
  "if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null };" ^
  "$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' };" ^
  "$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1);" ^
  "$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]82);" ^
  "$files = Get-ChildItem -Path $dist -File | Where-Object { $_.Extension -match '^\.(jpe?g|png)$' -and $_.Directory.Name -ne 'backup_originals' };" ^
  "$totalOriginal = 0; $totalOptimized = 0;" ^
  "foreach ($file in $files) {" ^
  "  $origSize = $file.Length;" ^
  "  $totalOriginal += $origSize;" ^
  "  $backupPath = Join-Path $backupDir $file.Name;" ^
  "  if (-not (Test-Path $backupPath)) { Copy-Item $file.FullName $backupPath };" ^
  "  try {" ^
  "    $bytes = [System.IO.File]::ReadAllBytes($backupPath);" ^
  "    $ms = New-Object System.IO.MemoryStream(,$bytes);" ^
  "    $img = [System.Drawing.Image]::FromStream($ms);" ^
  "    $maxDim = 1280;" ^
  "    $w = $img.Width; $h = $img.Height;" ^
  "    if ($w -gt $maxDim -or $h -gt $maxDim) {" ^
  "      if ($w -gt $h) { $newW = $maxDim; $newH = [int]($h * ($maxDim / $w)) }" ^
  "      else { $newH = $maxDim; $newW = [int]($w * ($maxDim / $h)) }" ^
  "    } else { $newW = $w; $newH = $h };" ^
  "    $bmp = New-Object System.Drawing.Bitmap($newW, $newH);" ^
  "    $g = [System.Drawing.Graphics]::FromImage($bmp);" ^
  "    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic;" ^
  "    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality;" ^
  "    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality;" ^
  "    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality;" ^
  "    $g.DrawImage($img, 0, 0, $newW, $newH);" ^
  "    $tempOut = [System.IO.Path]::GetTempFileName();" ^
  "    $bmp.Save($tempOut, $jpegEncoder, $encoderParams);" ^
  "    $g.Dispose(); $bmp.Dispose(); $img.Dispose(); $ms.Dispose();" ^
  "    $newSize = (Get-Item $tempOut).Length;" ^
  "    if ($newSize -lt $origSize) {" ^
  "      Move-Item -Path $tempOut -Destination $file.FullName -Force;" ^
  "      $totalOptimized += $newSize;" ^
  "      $origKb = [math]::Round($origSize/1KB, 1);" ^
  "      $newKb = [math]::Round($newSize/1KB, 1);" ^
  "      Write-Host ('  [OPTIMIZED] ' + $file.Name + ' : ' + $origKb + ' KB -> ' + $newKb + ' KB') -ForegroundColor Green;" ^
  "    } else {" ^
  "      Remove-Item $tempOut -Force;" ^
  "      $totalOptimized += $origSize;" ^
  "      Write-Host ('  [KEPT]      ' + $file.Name + ' (Already optimal: ' + [math]::Round($origSize/1KB, 1) + ' KB)') -ForegroundColor Yellow;" ^
  "    }" ^
  "  } catch {" ^
  "    Write-Host ('  [ERROR]     ' + $file.Name + ' : ' + $_.Exception.Message) -ForegroundColor Red;" ^
  "    $totalOptimized += $origSize;" ^
  "  }" ^
  "};" ^
  "$savedMb = [math]::Round(($totalOriginal - $totalOptimized)/1MB, 2);" ^
  "Write-Host '';" ^
  "Write-Host ('========================================================') -ForegroundColor Cyan;" ^
  "Write-Host (' Total size before: ' + [math]::Round($totalOriginal/1MB, 2) + ' MB') -ForegroundColor White;" ^
  "Write-Host (' Total size now:    ' + [math]::Round($totalOptimized/1MB, 2) + ' MB') -ForegroundColor White;" ^
  "Write-Host (' Saved:             ' + $savedMb + ' MB!') -ForegroundColor Green;" ^
  "Write-Host ('========================================================') -ForegroundColor Cyan;"

echo.
echo --------------------------------------------------------
echo All photos are now lightweight & crystal clear for mobile!
echo To deploy to Vercel, run:
echo   git add .
echo   git commit -m "Optimize images for fast mobile loading"
echo   git push
echo --------------------------------------------------------
echo.
pause
