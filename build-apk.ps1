# Cozy Solitaire 3.0 - single Windows script for APK/AAB (local) and iOS (Expo EAS)
# Usage: .\build-apk.ps1 -Platform apk|aab|ios [-SkipPull] [-SkipInstall] [-OutputPath 'C:\...']
[CmdletBinding()]
param(
    [ValidateSet('apk', 'aab', 'ios')]
    [string]$Platform = 'apk',
    [switch]$SkipPull,
    [switch]$SkipInstall,
    [string]$OutputPath = ''
)

$ErrorActionPreference = 'Stop'
$repoRoot = $PSScriptRoot
$mobileDir = Join-Path $repoRoot 'mobile'

function Assert-Command([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Mangler '$Name'. Installer værktøjet og prøv igen."
    }
}

function Invoke-Step([string]$Description, [string]$Command, [string[]]$Arguments) {
    Write-Host "`n==> $Description" -ForegroundColor Cyan
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Description fejlede (exit code $LASTEXITCODE)."
    }
}

if (-not (Test-Path (Join-Path $mobileDir 'package-lock.json'))) {
    throw "Fandt ikke Cozy-projektet i $mobileDir. Klon repository først: git clone https://github.com/gudlever-lgtm/cozy.git E:\cozy"
}

Assert-Command 'node'
Assert-Command 'npm.cmd'
Assert-Command 'npx.cmd'

if ($Platform -ne 'ios') {
    Assert-Command 'java'
    if (-not $OutputPath) {
        $OutputPath = Join-Path (Join-Path ([Environment]::GetFolderPath('UserProfile')) 'Downloads') "cozy.$Platform"
    }
    $OutputPath = [System.IO.Path]::GetFullPath($OutputPath)

    $sdkRoot = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } elseif ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT } else {
        Join-Path $env:LOCALAPPDATA 'Android\Sdk'
    }
    if (-not (Test-Path $sdkRoot)) {
        throw "Android SDK blev ikke fundet ($sdkRoot). Installer Android Studio/SDK eller angiv ANDROID_HOME."
    }
    if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = $sdkRoot }
    Write-Host "Android SDK: $sdkRoot"
    Write-Host "Lokal $($Platform.ToUpper()) destination: $OutputPath"
} elseif ($OutputPath) {
    throw '-OutputPath kan ikke bruges med iOS. Expo EAS leverer linket til iOS-builden.'
}

Write-Host "Cozy repository: $repoRoot" -ForegroundColor Green

Push-Location $repoRoot
try {
    if (-not $SkipPull) {
        Assert-Command 'git'
        if (-not (Test-Path (Join-Path $repoRoot '.git'))) {
            throw "Mappen er ikke et Git-repository. Klon det til en tom mappe: git clone https://github.com/gudlever-lgtm/cozy.git E:\cozy"
        }
        $changes = & git status --porcelain
        if ($LASTEXITCODE -ne 0) { throw 'Kunne ikke kontrollere Git-status.' }
        if ($changes) {
            throw 'Lokale ændringer fundet. Gem/commit ændringerne, eller brug -SkipPull for at bygge din aktuelle kode. Intet overskrives.'
        }
        Invoke-Step 'Henter seneste kode' 'git' @('pull', '--ff-only', 'origin', 'main')
    }

    Push-Location $mobileDir
    try {
        if (-not $SkipInstall) {
            Invoke-Step 'Installerer fastlåste npm-pakker' 'npm.cmd' @('ci')
        } elseif (-not (Test-Path 'node_modules')) {
            throw 'node_modules mangler. Fjern -SkipInstall og prøv igen.'
        }

        Invoke-Step 'Kontrollerer TypeScript' 'npm.cmd' @('run', 'typecheck')
        if ($Platform -eq 'ios') {
            Write-Host 'iOS bygges i Expo EAS. Første kørsel kan kræve Expo-login, Apple-konto og signeringsopsætning.'
            Invoke-Step 'Starter iOS-build i Expo EAS' 'npx.cmd' @('--yes', 'eas-cli@latest', 'build', '--platform', 'ios', '--profile', 'production')
            Write-Host 'Expo EAS viser build-link og status. Der oprettes ingen lokal IPA på Windows.' -ForegroundColor Green
            return
        }
        Invoke-Step 'Genererer Android-projektet' 'npx.cmd' @('--no-install', 'expo', 'prebuild', '--platform', 'android', '--no-install')

        $androidDir = Join-Path $mobileDir 'android'
        $gradle = Join-Path $androidDir 'gradlew.bat'
        if (-not (Test-Path $gradle)) { throw 'Gradle wrapper blev ikke genereret.' }

        Push-Location $androidDir
        try {
            $gradleTask = if ($Platform -eq 'apk') { ':app:assembleRelease' } else { ':app:bundleRelease' }
            Invoke-Step "Bygger Android $($Platform.ToUpper()) lokalt" $gradle @($gradleTask, '--no-daemon')
        } finally { Pop-Location }

        $artifactSource = if ($Platform -eq 'apk') {
            Join-Path $androidDir 'app\build\outputs\apk\release\app-release.apk'
        } else {
            Join-Path $androidDir 'app\build\outputs\bundle\release\app-release.aab'
        }
        if (-not (Test-Path $artifactSource)) { throw "Gradle afsluttede uden forventet fil: $artifactSource" }

        $destinationDir = Split-Path -Parent $OutputPath
        if (-not (Test-Path $destinationDir)) {
            New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
        }
        Copy-Item -LiteralPath $artifactSource -Destination $OutputPath -Force
        $artifact = Get-Item -LiteralPath $OutputPath
        Write-Host "`n$($Platform.ToUpper()) bygget lokalt: $($artifact.FullName) ($([math]::Round($artifact.Length / 1MB, 1)) MB)" -ForegroundColor Green
        Write-Host 'Bemærk: Lokal testbuild. Produktionssignering til Play Store skal konfigureres separat.'
    } finally { Pop-Location }
} finally { Pop-Location }
