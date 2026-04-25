$files = Get-ChildItem -Path 'd:\INTERNTECH\INTERNTECH\client\src' -Recurse -Include *.js,*.jsx
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'InternTech') {
        $newContent = $content -replace 'InternTech', 'Interntex'
        Set-Content $file.FullName -Value $newContent -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

$serverFiles = Get-ChildItem -Path 'd:\INTERNTECH\INTERNTECH\server' -Recurse -Include *.js
foreach ($file in $serverFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'InternTech') {
        $newContent = $content -replace 'InternTech', 'Interntex'
        Set-Content $file.FullName -Value $newContent -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "DONE - All InternTech replaced with Interntex"
