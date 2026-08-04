$ErrorActionPreference = 'Stop'

$rutaEntorno = Join-Path $PSScriptRoot '.env'
if (-not (Test-Path -LiteralPath $rutaEntorno)) {
    throw 'No existe el archivo .env del backend.'
}

Get-Content -LiteralPath $rutaEntorno | ForEach-Object {
    $linea = $_.Trim()
    if ($linea -and -not $linea.StartsWith('#')) {
        $partes = $linea.Split('=', 2)
        if ($partes.Count -eq 2) {
            [Environment]::SetEnvironmentVariable($partes[0].Trim(), $partes[1].Trim(), 'Process')
        }
    }
}

$variablesObligatorias = @('BD_URL', 'BD_USUARIO', 'BD_CONTRASENA', 'SECRETO_HMAC_CANCELACION', 'TURNSTILE_SECRET_KEY')
foreach ($variable in $variablesObligatorias) {
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($variable, 'Process'))) {
        throw "Falta completar $variable en .env."
    }
}

Set-Location -LiteralPath $PSScriptRoot
mvn spring-boot:run
