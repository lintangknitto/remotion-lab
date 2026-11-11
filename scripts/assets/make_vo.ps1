<#
Generates the demo voiceover plus per-word timings.

  powershell -ExecutionPolicy Bypass -File scripts/assets/make_vo.ps1

Output:
  public/library/vo/vo.podcast.demo-01.wav
  src/data/podcast-demo.generated.json   (words with startMs/endMs + durationMs)

SpeakProgress exposes both CharacterPosition and AudioPosition, so word timings
come straight from the synthesizer - no speech-to-text and no stopwatch.
#>
param(
    [string]$TextFile = '',
    [string]$OutWav = 'public\library\vo\vo.podcast.demo-01.wav',
    [string]$OutJson = 'src\data\podcast-demo.generated.json'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech

function Get-WavDurationMs([string]$path) {
    $b = [IO.File]::ReadAllBytes($path)
    $byteRate = 0; $dataSize = 0; $i = 12
    while ($i + 8 -le $b.Length) {
        $id = [Text.Encoding]::ASCII.GetString($b, $i, 4)
        $size = [BitConverter]::ToUInt32($b, $i + 4)
        if ($id -eq 'fmt ') { $byteRate = [BitConverter]::ToUInt32($b, $i + 16) }
        if ($id -eq 'data') { $dataSize = $size; break }
        $i += 8 + $size + ($size % 2)
    }
    if ($byteRate -gt 0) { return [int](1000.0 * $dataSize / $byteRate) }
    return 0
}

$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$wavRel = $OutWav
$wavAbs = Join-Path $root $wavRel
$jsonAbs = Join-Path $root $OutJson
$audioId = [IO.Path]::GetFileNameWithoutExtension($wavAbs)

New-Item -ItemType Directory -Force (Split-Path $wavAbs) | Out-Null
New-Item -ItemType Directory -Force (Split-Path $jsonAbs) | Out-Null

if ($TextFile) {
    $text = Get-Content -Raw -Encoding utf8 (Join-Path $root $TextFile)
} else {
    $text = @'
Okay, here is the thing about clipping. You do not need a fancy editor. You need a transcript, one strong hook, and a caption style that matches the beat. That is the whole workflow.
'@
}
$text = $text -replace '\s+', ' '

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice('Microsoft David Desktop')
$synth.Rate = -1

$script:marks = New-Object System.Collections.ArrayList

$handler = {
    param($sender, $e)
    [void]$script:marks.Add([pscustomobject]@{
        pos = $e.CharacterPosition
        len = $e.CharacterCount
        ms  = [int]$e.AudioPosition.TotalMilliseconds
    })
}
$synth.add_SpeakProgress($handler)

$synth.SetOutputToWaveFile($wavAbs)
$synth.Speak($text)
$synth.Dispose()

if ($script:marks.Count -lt 3) {
    throw "SpeakProgress produced only $($script:marks.Count) marks - cannot build timings."
}

# word table: text + character offset
$words = New-Object System.Collections.ArrayList
$offset = 0
foreach ($w in ($text -split ' ')) {
    if ($w.Trim().Length -eq 0) { $offset++; continue }
    [void]$words.Add([pscustomobject]@{ text = $w; charStart = $offset })
    $offset += $w.Length + 1
}

# map each mark to the word containing its character offset
$markByWord = @{}
foreach ($m in $script:marks) {
    $idx = -1
    for ($i = 0; $i -lt $words.Count; $i++) {
        if ($words[$i].charStart -le $m.pos) { $idx = $i } else { break }
    }
    if ($idx -ge 0 -and -not $markByWord.ContainsKey($idx)) { $markByWord[$idx] = $m.ms }
}

$out = New-Object System.Collections.ArrayList
for ($i = 0; $i -lt $words.Count; $i++) {
    $start = if ($markByWord.ContainsKey($i)) { $markByWord[$i] } else { $null }
    if ($null -eq $start) {
        $prev = $i - 1; while ($prev -ge 0 -and -not $markByWord.ContainsKey($prev)) { $prev-- }
        $next = $i + 1; while ($next -lt $words.Count -and -not $markByWord.ContainsKey($next)) { $next++ }
        $prevMs = if ($prev -ge 0) { $markByWord[$prev] } else { 0 }
        $nextMs = if ($next -lt $words.Count) { $markByWord[$next] } else { $prevMs + 240 }
        $start = [int](($prevMs + $nextMs) / 2)
    }
    [void]$out.Add([pscustomobject]@{ text = $words[$i].text; startMs = [int]$start })
}

$lastMs = ($out | Measure-Object -Property startMs -Maximum).Maximum
$durationMs = [int]$lastMs + 650

# SAPI's AudioPosition drifts against the written WAV (different internal rate),
# so rescale every timing to the real file duration before writing.
$trueMs = Get-WavDurationMs $wavAbs
if ($trueMs -gt 0) {
    $scale = $trueMs / $durationMs
    foreach ($w in $out) { $w.startMs = [int]($w.startMs * $scale) }
    $durationMs = $trueMs
    Write-Host ("rescaled timings by {0:N4} to match {1} ms of audio" -f $scale, $trueMs)
}

for ($i = 0; $i -lt $out.Count; $i++) {
    $end = if ($i + 1 -lt $out.Count) { $out[$i + 1].startMs } else { $durationMs }
    $out[$i] | Add-Member -NotePropertyName endMs -NotePropertyValue ([int]$end) -Force
}

$payload = [pscustomobject]@{
    id         = ([IO.Path]::GetFileNameWithoutExtension($OutJson) -replace '\.generated$', '')
    text       = $text.Trim()
    audio      = $audioId
    durationMs = $durationMs
    words      = $out
}
$payload | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 $jsonAbs

Write-Host ("voice: {0} words, {1:N1}s" -f $out.Count, ($durationMs / 1000))
Write-Host ("wrote {0}" -f $wavRel)
Write-Host ("wrote " + $OutJson)
