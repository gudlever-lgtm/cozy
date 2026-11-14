# Cozy Solitaire — same Node-driven build entrypoint as 3isacrowd.
# Examples: .\build-apk.ps1 -Platform apk | aab | ios
# Fast repeat builds reuse npm, native Android and Gradle caches.
[CmdletBinding()]
param(
    [ValidateSet('apk', 'aab', 'ios')]
    [string]$Platform = 'apk',
    [switch]$SkipPull,
    [switch]$SkipInstall,
    [switch]$FreshInstall,
    [switch]$ForcePrebuild,
    [string]$OutputPath = ''
)

$ErrorActionPreference = 'Stop'
$scriptPath = Join-Path $PSScriptRoot 'scripts\build-apk.mjs'
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Build-scriptet mangler: $scriptPath"
}
if (-not (Get-Command 'node' -ErrorAction SilentlyContinue)) {
    throw 'Node.js mangler. Installer Node.js og prøv igen.'
}

$buildArgs = @($scriptPath, '--platform', $Platform)
if ($SkipPull) { $buildArgs += '--skip-pull' }
if ($SkipInstall) { $buildArgs += '--skip-install' }
if ($FreshInstall) { $buildArgs += '--fresh-install' }
if ($ForcePrebuild) { $buildArgs += '--force-prebuild' }
if ($OutputPath) { $buildArgs += @('--output', $OutputPath) }

& node @buildArgs
if ($LASTEXITCODE -ne 0) {
    throw "Cozy-build fejlede (exit code $LASTEXITCODE)."
}
