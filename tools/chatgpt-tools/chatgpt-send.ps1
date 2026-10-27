<#
.SYNOPSIS
  สั่งงานแอป ChatGPT (Windows) ผ่าน UI Automation: เลือกแชท วางข้อความ กดส่ง หรือดูว่าแชทไหนกำลังทำงานอยู่
  ไม่ขยับ ไม่ย่อ ไม่ขยาย ไม่ย้ายหน้าต่าง (ไม่เรียก API ที่เปลี่ยนขนาด/ตำแหน่ง ถ้าหน้าต่างถูกย่ออยู่จะหยุดแล้วบอก ไม่กู้ให้เอง)

.EXAMPLE
  # ส่งงานเจนภาพ: ให้ ChatGPT อ่านไฟล์งาน ทำตามโดยไม่ถามกลับ แล้วไปรายงานในแชท Claude ชื่อ 'เกมเสริม'
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\chatgpt-tools\chatgpt-send.ps1 -Chat 'เจนปก' -Job 'C:\...\AI_COVER_JOB_xxx.md' -ReportTo 'เกมเสริม' -Tag 'ปกเสร็จ xxx'

.EXAMPLE
  # ส่งข้อความตรง ๆ
  ... -Chat 'เจนปก' -Message 'ข้อความ'          หรือ  -MessageFile ข้อความ.txt

.EXAMPLE
  # ดูว่าแชทไหนกำลังทำงานอยู่ (Working) / ว่าง
  ... -Status

พารามิเตอร์: -Chat ชื่อแชทในแถบด้านข้าง (ต้องปักหมุดหรือเห็นในแถบ) · -NoSend วางข้อความแต่ยังไม่กดส่ง · -Force ส่งแม้แชทกำลังทำงาน (ปกติจะไม่ส่ง เพราะอาจตัดงานที่ทำอยู่)
ผลลัพธ์: บรรทัด OK/ERR + ขนาดหน้าต่างก่อน/หลัง (ต้องเท่ากัน) · รหัสออก 0 = ส่งแล้ว, 2 = แชทกำลังทำงาน, 3 = หน้าต่างย่ออยู่, 4 = หาแชท/ช่องพิมพ์/ปุ่มส่งไม่เจอ
#>
param(
  [string]$Chat = 'เจนปก',
  [string]$Message,
  [string]$MessageFile,
  [string]$Job,
  [string]$ReportTo = 'เกมเสริม',
  [string]$Tag = 'เสร็จแล้ว',
  [switch]$NoSend,
  [switch]$Force,
  [switch]$Status
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Windows.Forms
Add-Type @'
using System; using System.Runtime.InteropServices;
public static class W32 {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
}
'@
function Out-Utf8($t) { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Write-Output $t }
function Get-Rect($h) { $r = New-Object W32+RECT; [void][W32]::GetWindowRect($h, [ref]$r); return "$($r.L),$($r.T),$($r.R),$($r.B)" }

$p = Get-Process | Where-Object { $_.ProcessName -eq 'ChatGPT' -and $_.MainWindowTitle -eq 'ChatGPT' } | Select-Object -First 1
if (-not $p) { Out-Utf8 'ERR: ไม่พบหน้าต่างแอป ChatGPT (เปิดแอปก่อน)'; exit 4 }
$hwnd = [IntPtr]$p.MainWindowHandle
if ([W32]::IsIconic($hwnd)) { Out-Utf8 'ERR: หน้าต่าง ChatGPT ถูกย่ออยู่ เปิดให้เห็นก่อน (สคริปต์นี้ไม่เปลี่ยนขนาดหน้าต่าง)'; exit 3 }
$rectBefore = Get-Rect $hwnd
$root = [System.Windows.Automation.AutomationElement]::FromHandle($hwnd)
$TS = [System.Windows.Automation.TreeScope]
$CT = [System.Windows.Automation.ControlType]
function Find-All($ct) { $c = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty, $ct); return $root.FindAll($TS::Descendants, $c) }
function Find-ByName($ct, $name, $exact = $true) {
  foreach ($e in (Find-All $ct)) { $n = $e.Current.Name; if (($exact -and $n -eq $name) -or (-not $exact -and $n -like "*$name*")) { return $e } }
  return $null
}
function Is-Working() { foreach ($e in (Find-All $CT::Button)) { if ($e.Current.Name -eq 'Stop' -and $e.Current.BoundingRectangle.Width -gt 0) { return $true } }; return $false }

# ---- โหมดดูสถานะ: แถวแชทที่มีไอคอน Working ----
if ($Status) {
  $items = Find-All $CT::ListItem; $out = @()
  $stat = Find-All $CT::StatusBar
  foreach ($it in $items) {
    $r = $it.Current.BoundingRectangle; $busy = $false
    foreach ($s in $stat) { $sr = $s.Current.BoundingRectangle; if ($s.Current.Name -match 'Working' -and $sr.Y -ge $r.Y -and $sr.Y -le ($r.Y + $r.Height)) { $busy = $true } }
    if ($it.Current.Name.Length -lt 60) { $out += ('{0} : {1}' -f ($(if ($busy) { 'WORKING' } else { 'idle   ' })), $it.Current.Name) }
  }
  Out-Utf8 ($out -join "`n"); exit 0
}

# ---- ข้อความที่จะส่ง ----
if ($Job) {
  $Message = "งานใหม่: ให้อ่านไฟล์งานฉบับเต็มก่อน แล้วทำตามไฟล์นั้นทุกข้อโดยไม่ต้องถามกลับ: $Job ข้อห้ามสำคัญ: ห้ามย่อ ขยาย ย้าย หรือเปลี่ยนขนาดหน้าต่างใด ๆ ทั้งนั้น เมื่อเสร็จให้ไปที่แอป Claude (หน้าต่างอื่นบนจอ) เปิดแชทชื่อ '$ReportTo' แล้วพิมพ์รายงานสั้น ๆ ขึ้นต้นด้วย [$Tag] ตามรูปแบบในไฟล์ แล้วกดส่งเองได้เลย ไม่ต้องถามผู้ใช้"
} elseif ($MessageFile) { $Message = [System.IO.File]::ReadAllText($MessageFile, [System.Text.Encoding]::UTF8) }
if (-not $Message) { Out-Utf8 'ERR: ไม่มีข้อความ (ใช้ -Message / -MessageFile / -Job)'; exit 4 }
$Message = ($Message -replace "\r?\n", ' ')        # ช่องพิมพ์ส่งด้วย Enter จึงรวมเป็นบรรทัดเดียว

# ---- เลือกแชทด้วย Invoke (ไม่ขยับเมาส์) ----
$chatBtn = Find-ByName $CT::Button $Chat $true
if (-not $chatBtn) { Out-Utf8 "ERR: ไม่พบแชทชื่อ '$Chat' ในแถบด้านข้าง (ต้องเห็นอยู่ในรายการที่ปักหมุดหรือล่าสุด)"; exit 4 }
$chatBtn.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke(); Start-Sleep -Milliseconds 2500
if ((Is-Working) -and -not $Force -and -not $NoSend) { Out-Utf8 "ERR: แชท '$Chat' กำลังทำงานอยู่ ไม่ส่งข้อความเพื่อไม่ให้ตัดงาน (ใช้ -Force ถ้าต้องการ)"; exit 2 }

# ---- วางข้อความผ่านคลิปบอร์ด แล้วกดส่ง ----
$edit = Find-ByName $CT::Edit 'Work with ChatGPT' $false
if (-not $edit) { $edit = Find-ByName $CT::Edit 'Work with Codex' $false }   # แอปอัปเดต 26 ต.ค. 2569 เปลี่ยนชื่อช่องพิมพ์
if (-not $edit) { Out-Utf8 'ERR: ไม่พบช่องพิมพ์ Work with ChatGPT/Codex'; exit 4 }
function Get-EditText($e) { $vp = $null; try { if ($e.TryGetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern, [ref]$vp)) { return ([string]$vp.Current.Value).Replace('Work with ChatGPT', '').Replace('Work with Codex', '').Trim() } } catch { }; return $null }
# ห้ามทับข้อความที่ผู้ใช้พิมพ์ค้างไว้ในช่องพิมพ์ (เคยมีกรณีผู้ใช้พิมพ์โน้ตค้างไว้) ถ้ามีข้อความค้างจะหยุดแล้วบอก
$draft = Get-EditText $edit
if ($draft -and -not $Force) { Out-Utf8 ('ERR: มีข้อความค้างอยู่ในช่องพิมพ์ ไม่ส่งทับ (ใช้ -Force ถ้าต้องการ): ' + $draft.Substring(0, [Math]::Min(80, $draft.Length))); exit 5 }
# ตั้งค่าข้อความในช่องพิมพ์ผ่าน UI Automation (ValuePattern) ไม่ใช้คลิปบอร์ด/Ctrl+V และไม่ต้องดึงหน้าต่างมาหน้าสุด (ลองแล้ว: Ctrl+V ไม่ลงช่อง ChatGPT ถ้าไม่คลิกเมาส์ก่อน)
try { $edit.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern).SetValue($Message) } catch { Out-Utf8 ('ERR: ตั้งค่าข้อความในช่องพิมพ์ไม่ได้: ' + $_.Exception.Message); exit 6 }
# ตรวจว่าข้อความอยู่ในช่องพิมพ์จริง (ช่องอัปเดตช้าได้ถึงหลายวินาที จึงรอวนดูสูงสุด 8 วินาที) ไม่งั้นไม่กดส่ง
$probe = $Message.Substring(0, [Math]::Min(12, $Message.Length)); $now = $null
for ($k = 0; $k -lt 16; $k++) { Start-Sleep -Milliseconds 500; $now = Get-EditText $edit; if ($now -and $now.Contains($probe)) { break } }
if (-not $now -or -not $now.Contains($probe)) { Out-Utf8 'ERR: วางข้อความไม่สำเร็จ (ช่องพิมพ์ไม่มีข้อความที่ตั้ง) ยังไม่ส่ง'; exit 6 }
if ($NoSend) { Out-Utf8 'OK: วางข้อความแล้ว (ยังไม่ส่ง)'; }
else {
  $send = $null
  foreach ($b in (Find-All $CT::Button)) { if ($b.Current.Name -match '^(Send|Send message|Submit)' -and $b.Current.BoundingRectangle.Width -gt 0) { $send = $b; break } }
  if ($send) { $send.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke() } else { Out-Utf8 'ERR: ไม่พบปุ่มส่ง ข้อความค้างอยู่ในช่องพิมพ์ (ยังไม่ส่ง)'; exit 4 }
  # ส่งแล้วช่องพิมพ์ต้องว่าง (รอดูสูงสุด 8 วินาที) ถ้ายังมีข้อความค้างแปลว่ายังไม่ได้ส่ง
  $left = $null; for ($k = 0; $k -lt 16; $k++) { Start-Sleep -Milliseconds 500; $left = Get-EditText $edit; if (-not $left) { break } }
  if ($left) { Out-Utf8 'ERR: กดส่งแล้วแต่ข้อความยังค้างในช่องพิมพ์ (อาจยังไม่ส่ง) ตรวจดูหน้าต่าง ChatGPT'; exit 7 }
  Out-Utf8 ("OK: ส่งข้อความไปที่แชท '$Chat' แล้ว (กดปุ่มส่ง ช่องพิมพ์ว่างแล้ว)")
}
$rectAfter = Get-Rect $hwnd
Out-Utf8 ("ขนาดหน้าต่าง ก่อน=$rectBefore หลัง=$rectAfter " + $(if ($rectBefore -eq $rectAfter) { '(ไม่เปลี่ยน)' } else { '(เปลี่ยน!)' }))
exit 0
