$cred = "protocol=https`nhost=github.com`n" | git credential fill
$passLine = $cred | Where-Object { $_ -like "password=*" }
$token = $passLine.Substring(9)

if (-not $token) {
    Write-Error "Não foi possível recuperar o token do Git Credential Manager."
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "User-Agent" = "PowerShell-RegianeGoveia"
    "Accept" = "application/vnd.github+json"
}

$repoName = "regianegoveia-imobiliaria"
$repoBody = @{
    name = $repoName
    description = "Portal Digital Oficial da Regiane Goveia Imobiliária em Ibirité - MG • CRECI 8527 PJ"
    private = $false
} | ConvertTo-Json

try {
    $repo = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Headers $headers -Method Post -Body $repoBody -ContentType "application/json; charset=utf-8"
    Write-Output "Repositório criado no GitHub: $($repo.html_url)"
} catch {
    Write-Output "Repositório pode já existir ou resposta: $($_.Exception.Message)"
}

git init -b main
git add .
git commit -m "feat: portal digital oficial da Regiane Goveia Imobiliária (Ibirité - MG / CRECI 8527 PJ)"

git remote remove origin 2>$null
git remote add origin "https://dev-victor16:$token@github.com/dev-victor16/$repoName.git"
git push -u origin main --force

git remote set-url origin "https://github.com/dev-victor16/$repoName.git"
git remote -v
