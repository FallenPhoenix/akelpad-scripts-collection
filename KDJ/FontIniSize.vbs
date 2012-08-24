' Set the initial font size from AkelPad.ini or registry - 2011-01-08
'
' Call("Scripts::Main", 1, "FontIniSize.vbs")
'
' Can assign shortcut key, eg: Ctrl+Num/ or Ctrl+Num*

Option Explicit
On Error Resume Next

Const LOGPIXELSY = 90

Dim hEditWnd
Dim oSys
Dim pIniFile
Dim WshShell
Dim pTxtIni
Dim pTxtSaveSet
Dim pTxt
Dim lfHeight
Dim hDC
Dim nDevCap
Dim nFontSize
Dim i

hEditWnd = AkelPad.GetEditWnd()

If (hEditWnd = 0) Then
  WScript.Quit
End If

set oSys     = AkelPad.SystemFunction()
set WshShell = CreateObject("WScript.shell")

pIniFile    = (AkelPad.GetAkelDir & "\AkelPad.ini")
pTxtIni     = AkelPad.ReadFile(pIniFile)
pTxtSaveSet = Mid(pTxtIni, InStr(pTxtIni, "SaveSettings=") + 13, 1)
pTxt        = ""

'settings in .ini file
If pTxtSaveSet = "2" Then
  For i = 6 To 0 Step -2
    pTxt = pTxt & Mid(pTxtIni, InStr(pTxtIni, "Font=") + 5 + i, 2)
  Next

'settings in registry
Else
  pTxtIni = WshShell.RegRead("HKCU\Software\Akelsoft\AkelPad\Options\Font")

  If Err.Number Then
    WScript.Quit
  End If

  If IsArray(pTxtIni) Then
    For i = 3 To 0 Step -1
      pTxt = pTxt & PadL0(Hex(pTxtIni(i)))
    Next
  Else
    WScript.Quit
  End If
End If

lfHeight = Eval("&H" + pTxt)

If (lfHeight < 0) Then
  lfHeight = lfHeight + 4294967296
End If

hDC       = oSys.Call("user32::GetDC", hEditWnd)
nDevCap   = oSys.Call("gdi32::GetDeviceCaps", hDC, LOGPIXELSY)
nFontSize = -oSys.Call("kernel32::MulDiv", lfHeight, 72, nDevCap)
oSys.Call "user32::ReleaseDC", hEditWnd, hDC

If nFontSize > 0 Then
  AkelPad.Font "", 0, nFontSize
End If

''''''''''''''''''''
Function PadL0(pTxt)
  Do While len(pTxt) < 2
    pTxt = "0" & pTxt
  Loop 

  PadL0 = pTxt
End Function
