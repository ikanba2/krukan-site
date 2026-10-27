<#
.SYNOPSIS
  ล้างข้อความในช่องพิมพ์ของ ChatGPT เฉพาะเมื่อข้อความนั้นขึ้นต้นด้วยข้อความที่ระบุใน -StartsWith (กันลบข้อความที่ผู้ใช้พิมพ์ค้างไว้เอง)
  ใช้คู่กับ chatgpt-send.ps1 -NoSend ตอนทดสอบ  ตัวอย่าง: powershell -File chatgpt-clear-draft.ps1 -StartsWith 'ทดสอบสคริปต์'
#>
param([Parameter(Mandatory = $true)][string]$StartsWith)
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$p = Get-Process | Where-Object { $_.ProcessName -eq 'ChatGPT' -and $_.MainWindowTitle -eq 'ChatGPT' } | Select-Object -First 1
if (-not $p) { Write-Output 'ERR: ไม่พบหน้าต่าง ChatGPT'; exit 4 }
$root = [System.Windows.Automation.AutomationElement]::FromHandle([IntPtr]$p.MainWindowHandle)
$c = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty, [System.Windows.Automation.ControlType]::Edit)
$edit = $null; foreach ($e in $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $c)) { if ($e.Current.Name -like '*Work with*') { $edit = $e; break } }
if (-not $edit) { Write-Output 'ERR: ไม่พบช่องพิมพ์'; exit 4 }
$vp = $edit.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
$now = ([string]$vp.Current.Value).Replace('Work with ChatGPT', '').Replace('Work with Codex', '').Trim()
if (-not $now) { Write-Output 'OK: ช่องพิมพ์ว่างอยู่แล้ว'; exit 0 }
if (-not $now.StartsWith($StartsWith)) { Write-Output ('ไม่ล้าง: ข้อความในช่องไม่ได้ขึ้นต้นด้วย ' + $StartsWith + ' (อาจเป็นข้อความของผู้ใช้): ' + $now.Substring(0, [Math]::Min(60, $now.Length))); exit 5 }
$vp.SetValue(''); Start-Sleep -Milliseconds 500
Write-Output 'OK: ล้างข้อความทดสอบแล้ว'
