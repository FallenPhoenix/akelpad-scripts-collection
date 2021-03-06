// SelectionSwitchCaretMove.js - ver. 2013-08-30 (x86/x64)
//
// Switch selection mode (column on/off) or move caret in the selection.
//
// Usage:
// Call("Scripts::Main", 1, "SelectionSwitchCaretMove.js", "0") - switch selection mode
// Call("Scripts::Main", 1, "SelectionSwitchCaretMove.js", "1") - move caret - begin/end of selection
// Call("Scripts::Main", 1, "SelectionSwitchCaretMove.js", "2") - in the columnar selection, sequentially, move caret to the four vertices of the rectangle

var hEditWnd = AkelPad.GetEditWnd();
var nAction;

if (! hEditWnd)
  WScript.Quit();
if (WScript.Arguments.length)
  nAction = WScript.Arguments(0);
if (! ((nAction == 0) || (nAction == 1) || (nAction == 2)))
  WScript.Quit();

var DT_QWORD          = 2;
var DT_DWORD          = 3;
var AEGI_FIRSTSELCHAR = 3;
var AEGI_LASTSELCHAR  = 4;
var AESELT_COLUMNOFF  = 0x0;
var AESELT_COLUMNON   = 0x1;
var AEM_GETSEL        = 3125;
var AEM_SETSEL        = 3126;
var AEM_UPDATESEL     = 3128;
var AEM_GETCOLUMNSEL  = 3127;
var AEM_GETINDEX      = 3130;
var AEM_INDEXUPDATE   = 3132;
var AEM_INDEXCOMPARE  = 3133;

var bColSel   = SendMessage(hEditWnd, AEM_GETCOLUMNSEL, 0, 0);
var lpFirstC  = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
var lpLastC   = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
var lpCaret   = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
var lpSelect  = AkelPad.MemAlloc(_X64 ? 56 : 28 /*sizeof(AESELECTION)*/);
var lpBegSel  = lpSelect;
var lpEndSel  = lpSelect + (_X64 ? 24 : 12);
var lpSelFlag = lpSelect + (_X64 ? 48 : 24);

SendMessage(hEditWnd, AEM_GETINDEX, AEGI_FIRSTSELCHAR, lpFirstC);
SendMessage(hEditWnd, AEM_GETINDEX, AEGI_LASTSELCHAR,  lpLastC);
SendMessage(hEditWnd, AEM_GETSEL, lpCaret, lpSelect);

if (nAction == 0)
{
  if (bColSel)
    SendMessage(hEditWnd, AEM_UPDATESEL, AESELT_COLUMNOFF, 0);

  else
  {
    if (SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpCaret, lpEndSel) == 1)
    {
      CopyCharIndex(lpEndSel, lpCaret);
    }
    else
      if ((SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpCaret, lpBegSel) == 1) &&
          (SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpCaret, lpEndSel) == -1))
      {
        CopyCharIndex(lpBegSel, lpEndSel);
        CopyCharIndex(lpEndSel, lpCaret);
      }

    AkelPad.MemCopy(lpSelFlag, AESELT_COLUMNON, DT_DWORD);
    SendMessage(hEditWnd, AEM_SETSEL, lpCaret, lpSelect);
  }
}

else if (nAction == 1)
{
  if (SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpCaret, lpEndSel) == -1)
    CopyCharIndex(lpCaret, lpEndSel);
  else
    CopyCharIndex(lpCaret, lpBegSel);

  SendMessage(hEditWnd, AEM_SETSEL, lpCaret, lpSelect);
}

else if (bColSel)
{
  if (SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpBegSel, lpFirstC) == 0)
  {
    if (SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpCaret, lpBegSel) == 0)
    {
      CopyCharIndexRowCol(lpBegSel, lpLastC,  lpFirstC);
      CopyCharIndexRowCol(lpEndSel, lpFirstC, lpLastC);
    }
    else
    {
      CopyCharIndexRowCol(lpBegSel, lpFirstC, lpLastC);
      CopyCharIndexRowCol(lpEndSel, lpLastC,  lpFirstC);
    }
    CopyCharIndex(lpCaret, lpEndSel);
  }

  else
  {
    if (SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpCaret, lpBegSel) == 0)
    {
      CopyCharIndex(lpBegSel, lpFirstC);
      CopyCharIndex(lpEndSel, lpLastC);
      CopyCharIndex(lpCaret,  lpEndSel);
    }
    else
    {
      CopyCharIndex(lpBegSel, lpLastC);
      CopyCharIndex(lpEndSel, lpFirstC);
      CopyCharIndex(lpCaret,  lpBegSel);
    }
  }
  SendMessage(hEditWnd, AEM_SETSEL, lpCaret, lpSelect);
}

AkelPad.MemFree(lpFirstC);
AkelPad.MemFree(lpLastC);
AkelPad.MemFree(lpCaret);
AkelPad.MemFree(lpSelect);

function CopyCharIndex(lpToIndex, lpFromIndex)
{
  AkelPad.MemCopy(lpToIndex, AkelPad.MemRead(lpFromIndex, DT_DWORD), DT_DWORD);
  AkelPad.MemCopy(lpToIndex + (_X64 ?  8 : 4), AkelPad.MemRead(lpFromIndex + (_X64 ?  8 : 4), DT_QWORD), DT_QWORD);
  AkelPad.MemCopy(lpToIndex + (_X64 ? 16 : 8), AkelPad.MemRead(lpFromIndex + (_X64 ? 16 : 8), DT_DWORD), DT_DWORD);
}

function CopyCharIndexRowCol(lpToIndex, lpFromIndexRow, lpFromIndexCol)
{
  var nRow = AkelPad.MemRead(lpFromIndexRow, DT_DWORD);
  var nCol = AkelPad.MemRead(lpFromIndexCol + (_X64 ? 16 : 8), DT_DWORD);

  AkelPad.MemCopy(lpToIndex, nRow, DT_DWORD);
  AkelPad.MemCopy(lpToIndex + (_X64 ? 16 : 8), nCol, DT_DWORD);
  SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpToIndex);
}

function SendMessage(hWnd, uMsg, wParam, lParam)
{
  return AkelPad.SystemFunction().Call("User32::SendMessage" + _TCHAR, hWnd, uMsg, wParam, lParam);
}
