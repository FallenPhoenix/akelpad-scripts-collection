' FontIniRestore.vbs - 2011-09-24
'
' Restores initial settings of font face, style and size from AkelPad.ini or registry.
'
' Call("Scripts::Main", 1, "FontIniRestore.vbs")
' Can assign shortcut key, eg. Ctrl+Num*

Option Explicit
On Error Resume Next

Const ADTYPE_ROOT = 0
Const DT_UNICODE  = 1
Const DT_BYTE     = 5
Const AKD_SETFONT = 1234

Dim lpLOGFONT
Dim hMainWnd
Dim oFSO
Dim bSetInReg
Dim sIniName
Dim sIniText
Dim nPos
Dim oShell
Dim oRE
Dim oMatches
Dim aFontVal
Dim sFontVal
Dim sFaceVal
Dim i

lpLOGFONT = AkelPad.MemAlloc(28 + 32 * 2) 'sizeof(LOGFONT)
hMainWnd  = AkelPad.GetMainWnd
set oFSO  = CreateObject("Scripting.FileSystemObject")
bSetInReg = True
sIniName  = AkelPad.GetAkelDir(ADTYPE_ROOT) & "\AkelPad.ini"

If oFSO.FileExists(sIniName) Then
  sIniText = AkelPad.ReadFile(sIniName)
  nPos     = InStr(sIniText, "SaveSettings=")

  If (nPos > 0) And (Mid(sIniText, nPos + 13, 1) = "2") Then
    bSetInReg = False
  End If
End If

'Settings in registry
If bSetInReg Then
  set oShell = CreateObject("WScript.shell")

  aFontVal = oShell.RegRead("HKCU\Software\Akelsoft\AkelPad\Options\Font")
  sFaceVal = oShell.RegRead("HKCU\Software\Akelsoft\AkelPad\Options\FontFace")

  If ((Not IsEmpty(aFontVal)) And (Not IsEmpty(sFaceVal))) Then
    For i = 0 To UBound(aFontVal) - 1 Step 1
      AkelPad.MemCopy lpLOGFONT + i, aFontVal(i), DT_BYTE
    Next

    AkelPad.MemCopy lpLOGFONT + 28, sFaceVal, DT_UNICODE
    AkelPad.SendMessage hMainWnd, AKD_SETFONT, 0, lpLOGFONT
  End If

'Settings in .ini file
Else
  Set oRE        = New RegExp
  oRE.Pattern    = "Font=[\dA-F]*"
  oRE.IgnoreCase = True   
  Set oMatches   = oRE.Execute(sIniText)

  If Not IsEmpty(oMatches) Then
    sFontVal = Mid(oMatches(0), 6)
  End If

  Set oRE      = New RegExp
  oRE.Pattern  = "FontFace=[^\r\n]*"
  Set oMatches = oRE.Execute(sIniText)

  If Not IsEmpty(oMatches) Then
    sFaceVal = Mid(oMatches(0), 10)
  End If

  If ((Not IsEmpty(sFontVal)) And (Not IsEmpty(sFaceVal))) Then
    For i = 0 To Len(sFontVal) - 1 Step 2
      AkelPad.MemCopy lpLOGFONT + i / 2, Eval("&H" + Mid(sFontVal, i + 1, 2)), DT_BYTE
    Next

    AkelPad.MemCopy lpLOGFONT + 28, sFaceVal, DT_UNICODE
    AkelPad.SendMessage hMainWnd, AKD_SETFONT, 0, lpLOGFONT
  End If
End If

AkelPad.MemFree lpLOGFONT
