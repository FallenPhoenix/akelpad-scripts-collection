// TextMove.js - ver. 2013-08-24 (x86/x64)
//
// Move left/right/up/down selected text.
//
// Usage:
// Call("Scripts::Main", 1, "TextMove.js", "-1") - move left one character
// Call("Scripts::Main", 1, "TextMove.js", "1")  - move right one character
// Call("Scripts::Main", 1, "TextMove.js", "-2") - move to the begin of the line
// Call("Scripts::Main", 1, "TextMove.js", "2")  - move to the end of the line
// Call("Scripts::Main", 1, "TextMove.js", "-3") - move one line up
// Call("Scripts::Main", 1, "TextMove.js", "3")  - move one line down
//
// Can assign shortcut keys, eg:
// Ctrl+Alt+Left, Ctrl+Alt+Right, Ctrl+Alt+Home, Ctrl+Alt+End, Ctrl+Alt+Up, Ctrl+Alt+Down

var DT_QWORD              = 2;
var DT_DWORD              = 3;
var AEGL_LINECOUNT        = 0;
var AEGL_FIRSTSELLINE     = 1;
var AEGL_LASTSELLINE      = 2;
var AEGI_LASTCHAR         = 2;
var AEGI_FIRSTSELCHAR     = 3;
var AEGI_LASTSELCHAR      = 4;
var AEGI_CARETCHAR        = 5;
var AESELT_COLUMNON       = 0x1;
var AEM_GETSEL            = 3125;
var AEM_SETSEL            = 3126;
var AEM_GETCOLUMNSEL      = 3127;
var AEM_GETLINENUMBER     = 3129;
var AEM_GETINDEX          = 3130;
var AEM_INDEXUPDATE       = 3132;
var AEM_INDEXTORICHOFFSET = 3136;
var AEM_GETWORDWRAP       = 3241;
var IDM_VIEW_WORDWRAP     = 4209;
var EM_LINEINDEX          = 187;
var EM_LINELENGTH         = 193;
var EM_EXLINEFROMCHAR     = 1078;

var hEditWnd = AkelPad.GetEditWnd();
if ((! hEditWnd) || AkelPad.GetEditReadOnly(hEditWnd))
  WScript.Quit();

var nAction;
if (WScript.Arguments.length)
  nAction = WScript.Arguments(0);
if (!((nAction == -1) || (nAction == 1) || (nAction == -2) || (nAction == 2) || (nAction == -3) || (nAction == 3)))
  WScript.Quit();

SetRedraw(hEditWnd, false);

// Word Wrap
var nWordWrap = SendMessage(hEditWnd, AEM_GETWORDWRAP, 0, 0);
if (nWordWrap > 0)
  AkelPad.Command(IDM_VIEW_WORDWRAP);

// SmartSel::NoSelEOL plugin
var sFuncEOL  = "SmartSel::NoSelEOL";
var bNoSelEOL = AkelPad.IsPluginRunning(sFuncEOL);
if (bNoSelEOL)
  AkelPad.Call(sFuncEOL);

var nMove = parseInt(nAction);

if (SendMessage(hEditWnd, AEM_GETCOLUMNSEL, 0, 0))
  TextMoveColumn();
else
  TextMoveNoColumn();

if (nWordWrap > 0)
  AkelPad.Command(IDM_VIEW_WORDWRAP);

if (bNoSelEOL)
  AkelPad.Call(sFuncEOL);

SetRedraw(hEditWnd, true);

function TextMoveColumn()
{
  var sSelText  = AkelPad.GetSelText(1 /*\r*/);
  var nLine1    = SendMessage(hEditWnd, AEM_GETLINENUMBER, AEGL_FIRSTSELLINE, 0);
  var nLine2    = SendMessage(hEditWnd, AEM_GETLINENUMBER, AEGL_LASTSELLINE,  0);
  var nLastLine = SendMessage(hEditWnd, AEM_GETLINENUMBER, AEGL_LINECOUNT,    0) - 1;
  var nLenLine  = SendMessage(hEditWnd, EM_LINELENGTH, GetOffset(hEditWnd, AEGI_CARETCHAR), 0);
  var lpFirstC  = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
  var lpLastC   = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
  var lpCaret   = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
  var lpSelect  = AkelPad.MemAlloc(_X64 ? 56 : 28 /*sizeof(AESELECTION)*/);
  var lpSelect1 = AkelPad.MemAlloc(_X64 ? 56 : 28 /*sizeof(AESELECTION)*/);
  var lpBegSel  = lpSelect;
  var lpEndSel  = lpSelect + (_X64 ? 24 : 12);
  var lpBegSel1 = lpSelect1;
  var lpEndSel1 = lpSelect1 + (_X64 ? 24 : 12);
  var nShiftRow = 0;
  var nShiftCol = 0;
  var nCol1;
  var nCol2;

  SendMessage(hEditWnd, AEM_GETINDEX, AEGI_FIRSTSELCHAR, lpFirstC);
  SendMessage(hEditWnd, AEM_GETINDEX, AEGI_LASTSELCHAR,  lpLastC);
  SendMessage(hEditWnd, AEM_GETSEL, lpCaret, lpSelect);

  nCol1 = AkelPad.MemRead(lpFirstC + (_X64 ? 16 : 8), DT_DWORD);
  nCol2 = AkelPad.MemRead(lpLastC  + (_X64 ? 16 : 8), DT_DWORD);

  if (nMove == 1)
    nShiftCol = 1;
  else if ((nMove == -1) && (nCol1 > 0))
    nShiftCol = -1;
  else if ((nMove == 2) && (nLenLine > nCol2))
    nShiftCol = nLenLine - nCol2;
  else if (nMove == -2)
    nShiftCol = - nCol1;
  else if ((nMove == 3) && (nLine2 < nLastLine))
    nShiftRow = 1;
  else if ((nMove == -3) && (nLine1 > 0))
    nShiftRow = -1;

  if ((nShiftRow != 0) || (nShiftCol != 0))
  {
    AkelPad.ReplaceSel("");

    ShiftCharIndex(lpFirstC, nShiftRow, nShiftCol);
    ShiftCharIndex(lpLastC,  nShiftRow, nShiftCol);

    CopyCharIndex(lpBegSel1, lpFirstC);
    CopyCharIndexRowCol(lpEndSel1, lpLastC, lpFirstC);
    AkelPad.MemCopy(lpSelect1 + (_X64 ? 48 : 24), AESELT_COLUMNON, DT_DWORD);

    SendMessage(hEditWnd, AEM_SETSEL, 0, lpSelect1);
    AkelPad.ReplaceSel(sSelText);

    ShiftCharIndex(lpCaret,  nShiftRow, nShiftCol);
    ShiftCharIndex(lpBegSel, nShiftRow, nShiftCol);
    ShiftCharIndex(lpEndSel, nShiftRow, nShiftCol);

    SendMessage(hEditWnd, AEM_SETSEL, lpCaret, lpSelect);
  }

  AkelPad.MemFree(lpFirstC);
  AkelPad.MemFree(lpLastC);
  AkelPad.MemFree(lpCaret);
  AkelPad.MemFree(lpSelect);
  AkelPad.MemFree(lpSelect1);
}

function TextMoveNoColumn()
{
  var nBegSel   = AkelPad.GetSelStart();
  var nEndSel   = AkelPad.GetSelEnd();
  var nCarChar  = GetOffset(hEditWnd, AEGI_CARETCHAR);
  var bCarOnEnd = (nCarChar == nBegSel) ? false : true;
  var nLastChar = GetOffset(hEditWnd, AEGI_LASTCHAR);
  var nLine1    = SendMessage(hEditWnd, EM_EXLINEFROMCHAR, 0, nBegSel);
  var nLine2    = SendMessage(hEditWnd, EM_EXLINEFROMCHAR, 0, nEndSel);
  var nLastLine = SendMessage(hEditWnd, EM_EXLINEFROMCHAR, 0, -2);
  var nBegLine;
  var nLenLine;
  var nCol;
  var sSelText;
  var sText1;
  var sText2;

  if ((nBegSel == nEndSel) || ((nMove > 0) && (nMove < 3) && (nEndSel == nLastChar)) || ((nMove > -3) && (nMove < 0) && (nBegSel == 0)) || ((nMove == 3) && (nLine2 == nLastLine)) || ((nMove == -3) && (nLine1 == 0)))
    nMove = 0;
  else if (nMove == 2)
  {
    nBegLine = SendMessage(hEditWnd, EM_LINEINDEX, nLine2, 0);
    nLenLine = SendMessage(hEditWnd, EM_LINELENGTH, nBegLine, 0);
    nMove    = nBegLine + nLenLine - nEndSel;
  }
  else if (nMove == -2)
  {
    nBegLine = SendMessage(hEditWnd, EM_LINEINDEX, nLine1, 0);
    nMove    = nBegLine - nBegSel;
  }
  else if (nMove == 3)
  {
    nBegLine = SendMessage(hEditWnd, EM_LINEINDEX, nLine1, 0);
    nCol     = nBegSel - nBegLine;
    nBegLine = SendMessage(hEditWnd, EM_LINEINDEX, nLine2 + 1, 0);
    nLenLine = SendMessage(hEditWnd, EM_LINELENGTH, nBegLine, 0);
    if (nCol < nLenLine)
      nMove = nBegLine + nCol - nEndSel;
    else
      nMove = nBegLine + nLenLine - nEndSel;
  }
  else if (nMove == -3)
  {
    nBegLine = SendMessage(hEditWnd, EM_LINEINDEX, nLine1, 0);
    nCol     = nBegSel - nBegLine;
    nBegLine = SendMessage(hEditWnd, EM_LINEINDEX, nLine1 - 1, 0);
    nLenLine = SendMessage(hEditWnd, EM_LINELENGTH, nBegLine, 0);
    if (nCol < nLenLine)
      nMove = - nLenLine - 1;
    else
      nMove = - nCol - 1;
  }

  if (nMove != 0)
  {
    if (nMove > 0)
      AkelPad.SetSel(nBegSel, nEndSel + nMove);
    else
      AkelPad.SetSel(nBegSel + nMove, nEndSel);
  
    sSelText = AkelPad.GetSelText(1 /*\r*/);
  
    if (nMove > 0)
    {
      sText1 = sSelText.substr(0, nEndSel - nBegSel);
      sText2 = sSelText.substr(nEndSel - nBegSel);
    }
    else
    {
      sText1 = sSelText.substr(0, -nMove);
      sText2 = sSelText.substr(-nMove);
    }
  
    nBegSel += nMove;
    nEndSel += nMove;
  
    AkelPad.ReplaceSel(sText2 + sText1);
  
    if (bCarOnEnd)
      AkelPad.SetSel(nBegSel, nEndSel);
    else
      AkelPad.SetSel(nEndSel, nBegSel);
  }
}

function SetRedraw(hWnd, bRedraw)
{
  SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
  bRedraw && AkelPad.SystemFunction().Call("User32::InvalidateRect", hWnd, 0, true);
}

function GetOffset(hWnd, nFlag)
{
  var lpIndex = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
  var nOffset;

  SendMessage(hWnd, AEM_GETINDEX, nFlag, lpIndex);
  nOffset = SendMessage(hWnd, AEM_INDEXTORICHOFFSET, 0, lpIndex);
  AkelPad.MemFree(lpIndex);

  return nOffset;
}

function ShiftCharIndex(lpIndex, nShiftRow, nShiftCol)
{
  AkelPad.MemCopy(lpIndex, AkelPad.MemRead(lpIndex, DT_DWORD) + nShiftRow, DT_DWORD);
  AkelPad.MemCopy(lpIndex + (_X64 ? 16 : 8), AkelPad.MemRead(lpIndex + (_X64 ? 16 : 8), DT_DWORD) + nShiftCol, DT_DWORD);
  SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpIndex);
}

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
