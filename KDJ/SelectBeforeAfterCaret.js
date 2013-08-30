// SelectBeforeAfterCaret.js - ver. 2013-08-30 (x86/x64)
//
// Select all text before or after the caret.
//
// Usage:
// Call("Scripts::Main", 1, "SelectBeforeAfterCaret.js")
//
// Can assign shortcut key eg: Ctrl+Shift+A

var hEditWnd = AkelPad.GetEditWnd();
if (! hEditWnd)
	WScript.Quit();

var nBegSel   = AkelPad.GetSelStart();
var nEndSel   = AkelPad.GetSelEnd();
var nCarPos   = GetOffset(hEditWnd, 5 /*AEGI_CARETCHAR*/);
var nLastChar = GetOffset(hEditWnd, 2 /*AEGI_LASTCHAR*/);

if (nBegSel == nEndSel)
  if (nBegSel == 0)
    nBegSel = nLastChar;
  else
    nBegSel = 0;
else if (nBegSel == nCarPos)
{
  nBegSel = 0;
  nEndSel = nCarPos;
}
else
{
  nBegSel = nLastChar;
  nEndSel = nCarPos;
}

AkelPad.SetSel(nBegSel, nEndSel);

function GetOffset(hWnd, nFlag)
{
  var nOffset = -1;
  var lpIndex;

  if (lpIndex = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/))
  {
    SendMessage(hWnd, 3130 /*AEM_GETINDEX*/, nFlag, lpIndex);
    nOffset = SendMessage(hWnd, 3136 /*AEM_INDEXTORICHOFFSET*/, 0, lpIndex);
    AkelPad.MemFree(lpIndex);
  }
  return nOffset;
}

function SendMessage(hWnd, uMsg, wParam, lParam)
{
  return AkelPad.SystemFunction().Call("User32::SendMessage" + _TCHAR, hWnd, uMsg, wParam, lParam);
}
