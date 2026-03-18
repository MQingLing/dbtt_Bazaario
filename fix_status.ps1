$f = 'c:\Users\gohsi\Desktop\DBTT\dbtt_Bazaario\src\app\data\pasarMalamData.ts'
(Get-Content $f) | Where-Object { $_ -notmatch "status: '(ongoing|upcoming|completed)'" } | Set-Content $f
Write-Host "Done. Lines remaining: $((Get-Content $f).Count)"
