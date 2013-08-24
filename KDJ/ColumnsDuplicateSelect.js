// ColumnsDuplicateSelect.js - var. 2013-08-24 (x86/x64)
//
// Select entire columns or duplicate selected columns.
//
// Usage:
// Call("Scripts::Main", 1, "ColumnsDuplicateSelect.js"[, "Action"])
// Action:
//   0 - select entire columns (default)
//   2 - duplicate columns
//
// Can assign shortcut keys, eg: Ctrl+Shift+C, Ctrl+Shift+D

var hEditWnd = AkelPad.GetEditWnd();
var nAction;

if (! hEditWnd)
  WScript.Quit();
if (WScript.Arguments.length)
  nAction = WScript.Arguments(0);
if (nAction != 2)
  nAction = 0;

var DT_QWORD             = 2;
var DT_DWORD             = 3;
var AEGI_FIRSTSELCHAR    = 3;
var AEGI_LASTSELCHAR     = 4;
var AEGL_LINEUNWRAPCOUNT = 11;
var AESELT_COLUMNON      = 0x1;
var AEM_GETSEL           = 3125;
var AEM_SETSEL           = 3126;
var AEM_GETLINENUMBER    = 3129;
var AEM_GETINDEX         = 3130;
var AEM_INDEXUPDATE      = 3132;
var AEM_GETWORDWRAP      = 3241;
var IDM_VIEW_WORDWRAP    = 4209;

var oSys       = AkelPad.SystemFunction();
var nWordWrap  = SendMessage(hEditWnd, AEM_GETWORDWRAP, 0, 0);
var lpFirstC   = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
var lpLastC    = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
var lpCaret    = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
var lpSelect   = AkelPad.MemAlloc(_X64 ? 56 : 28 /*sizeof(AESELECTION)*/);
var lpSelect1  = AkelPad.MemAlloc(_X64 ? 56 : 28 /*sizeof(AESELECTION)*/);
var lpBegSel   = lpSelect;
var lpEndSel   = lpSelect + (_X64 ? 24 : 12);
var lpSelFlag  = lpSelect + (_X64 ? 48 : 24);
var lpBegSel1  = lpSelect1;
var lpEndSel1  = lpSelect1 + (_X64 ? 24 : 12);
var lpSelFlag1 = lpSelect1 + (_X64 ? 48 : 24);
var nLastLine  = SendMessage(hEditWnd, AEM_GETLINENUMBER, AEGL_LINEUNWRAPCOUNT, 0) - 1;
var sSelTxt;

if (nWordWrap)
  AkelPad.Command(IDM_VIEW_WORDWRAP);

SendMessage(hEditWnd, AEM_GETINDEX, AEGI_FIRSTSELCHAR, lpFirstC);
SendMessage(hEditWnd, AEM_GETINDEX, AEGI_LASTSELCHAR,  lpLastC);
SendMessage(hEditWnd, AEM_GETSEL, lpCaret, lpSelect);

ReplaceCharIndex(lpBegSel, nLastLine, AkelPad.MemRead(lpFirstC + (_X64 ? 16 : 8), DT_DWORD));
ReplaceCharIndex(lpEndSel, 0,         AkelPad.MemRead(lpLastC  + (_X64 ? 16 : 8), DT_DWORD));
CopyCharIndex(lpCaret, lpEndSel);

AkelPad.MemCopy(lpSelFlag, AESELT_COLUMNON, DT_DWORD);

SendMessage(hEditWnd, AEM_SETSEL, lpCaret, lpSelect);

if (nAction == 2)
{
  sSelTxt = AkelPad.GetSelText(1 /*\r*/);

  ReplaceCharIndex(lpBegSel1, 0, AkelPad.MemRead(lpLastC + (_X64 ? 16 : 8), DT_DWORD));
  ReplaceCharIndex(lpEndSel1, 0, AkelPad.MemRead(lpLastC + (_X64 ? 16 : 8), DT_DWORD));
  AkelPad.MemCopy(lpSelFlag1, AESELT_COLUMNON, DT_DWORD);

  SetRedraw(hEditWnd, false);
  SendMessage(hEditWnd, AEM_SETSEL, 0, lpSelect1);
  AkelPad.ReplaceSel(sSelTxt);

  SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpBegSel);
  SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpEndSel);
  SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpCaret);
  SendMessage(hEditWnd, AEM_SETSEL, lpCaret, lpSelect);
  SetRedraw(hEditWnd, true);
}

AkelPad.MemFree(lpFirstC);
AkelPad.MemFree(lpLastC);
AkelPad.MemFree(lpCaret);
AkelPad.MemFree(lpSelect);
AkelPad.MemFree(lpSelect1);

if (nWordWrap)
  AkelPad.Command(IDM_VIEW_WORDWRAP);

function SetRedraw(hWnd, bRedraw)
{
  SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
  bRedraw && oSys.Call("User32::InvalidateRect", hWnd, 0, true);
}

function CopyCharIndex(lpToIndex, lpFromIndex)
{
  AkelPad.MemCopy(lpToIndex, AkelPad.MemRead(lpFromIndex, DT_DWORD), DT_DWORD);
  AkelPad.MemCopy(lpToIndex + (_X64 ?  8 : 4), AkelPad.MemRead(lpFromIndex + (_X64 ?  8 : 4), DT_QWORD), DT_QWORD);
  AkelPad.MemCopy(lpToIndex + (_X64 ? 16 : 8), AkelPad.MemRead(lpFromIndex + (_X64 ? 16 : 8), DT_DWORD), DT_DWORD);
}

function ReplaceCharIndex(lpIndex, nRow, nCol) /*if nRow or nCol == -1, no change*/
{
  if (nRow > -1)
    AkelPad.MemCopy(lpIndex, nRow, DT_DWORD);
  if (nCol > -1)
    AkelPad.MemCopy(lpIndex + (_X64 ? 16 : 8), nCol, DT_DWORD);

  SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpIndex);
}

function SendMessage(hWnd, uMsg, wParam, lParam)
{
  return oSys.Call("User32::SendMessage" + _TCHAR, hWnd, uMsg, wParam, lParam);
}
