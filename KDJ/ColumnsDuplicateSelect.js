// Select entire columns or duplicate selected columns - 2010-10-13
//
// Call("Scripts::Main", 1, "ColumnsDuplicateSelect.js", "0")  - select entire columns
// Call("Scripts::Main", 1, "ColumnsDuplicateSelect.js", "2")  - duplicate columns
//
// Can assign shortcut keys, eg: Ctrl+Shift+C, Ctrl+Shift+D

var DT_DWORD          = 3;
var AEGL_LINECOUNT    = 0;
var AEGI_FIRSTSELCHAR = 3;
var AEGI_LASTSELCHAR  = 4;
var AESELT_COLUMNON   = 0x1;
var AEM_GETSEL        = 3125;
var AEM_SETSEL        = 3126;
var AEM_GETLINENUMBER = 3129;
var AEM_GETINDEX      = 3130;
var AEM_INDEXUPDATE   = 3132;
var AEM_GETWORDWRAP   = 3241;
var IDM_VIEW_WORDWRAP = 4209;

var nWordWrap;
var lpFirstC;
var lpLastC;
var lpCaret;
var lpSelect;
var lpBegSel;
var lpEndSel;
var lpSelFlag;
var lpSelect1;
var lpBegSel1;
var lpEndSel1;
var lpSelFlag1;
var nLastLine;
var pSelTxt;

var hEditWnd = AkelPad.GetEditWnd();
var nAction;

if (! hEditWnd)
  WScript.Quit();
if (WScript.Arguments.length)
  nAction = WScript.Arguments(0);
if (! ((nAction == 0) || (nAction == 2)))
  WScript.Quit();


lpFirstC  = AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/);
lpLastC   = AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/);
lpCaret   = AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/);
lpSelect  = AkelPad.MemAlloc(28 /*sizeof(AESELECTION)*/);
lpSelect1 = AkelPad.MemAlloc(28 /*sizeof(AESELECTION)*/);

if ((! lpFirstC) || (! lpLastC) || (! lpCaret) || (! lpSelect) || (! lpSelect1))
{
  AkelPad.MemFree(lpFirstC);
  AkelPad.MemFree(lpLastC);
  AkelPad.MemFree(lpCaret);
  AkelPad.MemFree(lpSelect);
  AkelPad.MemFree(lpSelect1);
  WScript.Quit();
}

// Word Wrap
nWordWrap = AkelPad.SendMessage(hEditWnd, AEM_GETWORDWRAP, 0, 0);
if (nWordWrap > 0)
  AkelPad.Command(IDM_VIEW_WORDWRAP);

AkelPad.SendMessage(hEditWnd, AEM_GETINDEX, AEGI_FIRSTSELCHAR, lpFirstC);
AkelPad.SendMessage(hEditWnd, AEM_GETINDEX, AEGI_LASTSELCHAR,  lpLastC);
AkelPad.SendMessage(hEditWnd, AEM_GETSEL, lpCaret, lpSelect);

lpBegSel  = lpSelect;
lpEndSel  = lpSelect + 12;
lpSelFlag = lpSelect + 24;
nLastLine = AkelPad.SendMessage(hEditWnd, AEM_GETLINENUMBER, AEGL_LINECOUNT, 0) - 1;

ReplaceCharIndex(lpBegSel, nLastLine, AkelPad.MemRead(lpFirstC + 8, DT_DWORD));
ReplaceCharIndex(lpEndSel, 0,         AkelPad.MemRead(lpLastC  + 8, DT_DWORD));
CopyCharIndex(lpCaret, lpEndSel);

AkelPad.MemCopy(lpSelFlag, AESELT_COLUMNON, DT_DWORD);

AkelPad.SendMessage(hEditWnd, AEM_SETSEL, lpCaret, lpSelect);


if (nAction == 2)
{
  pSelTxt    = AkelPad.GetSelText(1 /*\r*/);
  lpBegSel1  = lpSelect1;
  lpEndSel1  = lpSelect1 + 12;
  lpSelFlag1 = lpSelect1 + 24;

  ReplaceCharIndex(lpBegSel1, 0, AkelPad.MemRead(lpLastC + 8, DT_DWORD));
  ReplaceCharIndex(lpEndSel1, 0, AkelPad.MemRead(lpLastC + 8, DT_DWORD));
  AkelPad.MemCopy(lpSelFlag1, AESELT_COLUMNON, DT_DWORD);

  SetRedraw(hEditWnd, false);
  AkelPad.SendMessage(hEditWnd, AEM_SETSEL, 0, lpSelect1);
  AkelPad.ReplaceSel(pSelTxt);

  AkelPad.SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpBegSel);
  AkelPad.SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpEndSel);
  AkelPad.SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpCaret);
  AkelPad.SendMessage(hEditWnd, AEM_SETSEL, lpCaret, lpSelect);
  SetRedraw(hEditWnd, true);
}

AkelPad.MemFree(lpFirstC);
AkelPad.MemFree(lpLastC);
AkelPad.MemFree(lpCaret);
AkelPad.MemFree(lpSelect);
AkelPad.MemFree(lpSelect1);

if (nWordWrap > 0)
  AkelPad.Command(IDM_VIEW_WORDWRAP);


////////////////////
function SetRedraw(hWnd, bRedraw)
{
  var oSys = AkelPad.SystemFunction();
  AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
  bRedraw && oSys.Call("user32::InvalidateRect", hWnd, 0, true);
}


function CopyCharIndex(lpToIndex, lpFromIndex)
{
  AkelPad.MemCopy(lpToIndex,     AkelPad.MemRead(lpFromIndex,     DT_DWORD), DT_DWORD);
  AkelPad.MemCopy(lpToIndex + 4, AkelPad.MemRead(lpFromIndex + 4, DT_DWORD), DT_DWORD);
  AkelPad.MemCopy(lpToIndex + 8, AkelPad.MemRead(lpFromIndex + 8, DT_DWORD), DT_DWORD);
}


function ReplaceCharIndex(lpIndex, nRow, nCol)  /*if nRow or nCol == -1, no change*/
{
  if (nRow > -1)
    AkelPad.MemCopy(lpIndex,     nRow, DT_DWORD);
  if (nCol > -1)
    AkelPad.MemCopy(lpIndex + 8, nCol, DT_DWORD);

  AkelPad.SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpIndex);
}
