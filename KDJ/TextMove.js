// Move left and right or up and down selected text - 2010-10-11
//
// Call("Scripts::Main", 1, "TextMove.js", "-1") - move left one character
// Call("Scripts::Main", 1, "TextMove.js", "1")  - move right one character
// Call("Scripts::Main", 1, "TextMove.js", "-2") - move to the begin of the line
// Call("Scripts::Main", 1, "TextMove.js", "2")  - move to the end of the line
// Call("Scripts::Main", 1, "TextMove.js", "-3") - move one line up
// Call("Scripts::Main", 1, "TextMove.js", "3")  - move one line down
//
// Can assign shortcut keys, eg:
// Ctrl+Alt+Left, Ctrl+Alt+Right, Ctrl+Alt+Home, Ctrl+Alt+End, Ctrl+Alt+Up, Ctrl+Alt+Down

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
var nWordWrap = AkelPad.SendMessage(hEditWnd, AEM_GETWORDWRAP, 0, 0);
if (nWordWrap > 0)
  AkelPad.Command(IDM_VIEW_WORDWRAP);

// SmartSel::NoSelEOL plugin
var pFuncEOL  = "SmartSel::NoSelEOL";
var bNoSelEOL = AkelPad.IsPluginRunning(pFuncEOL);
if (bNoSelEOL)
  AkelPad.Call(pFuncEOL);

var nMove = parseInt(nAction);

if (AkelPad.SendMessage(hEditWnd, AEM_GETCOLUMNSEL, 0, 0))
  TextMoveColumn();
else
  TextMoveNoColumn();

if (nWordWrap > 0)
  AkelPad.Command(IDM_VIEW_WORDWRAP);

if (bNoSelEOL)
  AkelPad.Call(pFuncEOL);

SetRedraw(hEditWnd, true);


///////////////////////////////
function TextMoveColumn()
{
  var pSelTxt   = AkelPad.GetSelText(1 /*\r*/);
  var nLine1    = AkelPad.SendMessage(hEditWnd, AEM_GETLINENUMBER, AEGL_FIRSTSELLINE, 0);
  var nLine2    = AkelPad.SendMessage(hEditWnd, AEM_GETLINENUMBER, AEGL_LASTSELLINE,  0);
  var nLastLine = AkelPad.SendMessage(hEditWnd, AEM_GETLINENUMBER, AEGL_LINECOUNT,    0) - 1;
  var nLenLine  = AkelPad.SendMessage(hEditWnd, EM_LINELENGTH, GetOffset(hEditWnd, AEGI_CARETCHAR), 0);
  var lpFirstC  = AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/);
  var lpLastC   = AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/);
  var lpCaret   = AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/);
  var lpSelect  = AkelPad.MemAlloc(28 /*sizeof(AESELECTION)*/);
  var lpSelect1 = AkelPad.MemAlloc(28 /*sizeof(AESELECTION)*/);
  var lpBegSel  = lpSelect;
  var lpEndSel  = lpSelect + 12;
  var lpBegSel1 = lpSelect1;
  var lpEndSel1 = lpSelect1 + 12;
  var nShiftRow = 0;
  var nShiftCol = 0;
  var nCol1;
  var nCol2;

  if ((! lpFirstC) || (! lpLastC) || (! lpCaret) || (! lpSelect) || (! lpSelect1))
  {
    AkelPad.MemFree(lpFirstC);
    AkelPad.MemFree(lpLastC);
    AkelPad.MemFree(lpCaret);
    AkelPad.MemFree(lpSelect);
    AkelPad.MemFree(lpSelect1);
    return;
  }

  AkelPad.SendMessage(hEditWnd, AEM_GETINDEX, AEGI_FIRSTSELCHAR, lpFirstC);
  AkelPad.SendMessage(hEditWnd, AEM_GETINDEX, AEGI_LASTSELCHAR,  lpLastC);
  AkelPad.SendMessage(hEditWnd, AEM_GETSEL, lpCaret, lpSelect);

  nCol1 = AkelPad.MemRead(lpFirstC + 8, DT_DWORD);
  nCol2 = AkelPad.MemRead(lpLastC  + 8, DT_DWORD);


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
    AkelPad.MemCopy(lpSelect1 + 24, AESELT_COLUMNON, DT_DWORD);

    AkelPad.SendMessage(hEditWnd, AEM_SETSEL, 0, lpSelect1);
    AkelPad.ReplaceSel(pSelTxt);

    ShiftCharIndex(lpCaret,  nShiftRow, nShiftCol);
    ShiftCharIndex(lpBegSel, nShiftRow, nShiftCol);
    ShiftCharIndex(lpEndSel, nShiftRow, nShiftCol);

    AkelPad.SendMessage(hEditWnd, AEM_SETSEL, lpCaret, lpSelect);
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
  var nLine1    = AkelPad.SendMessage(hEditWnd, EM_EXLINEFROMCHAR, 0, nBegSel);
  var nLine2    = AkelPad.SendMessage(hEditWnd, EM_EXLINEFROMCHAR, 0, nEndSel);
  var nLastLine = AkelPad.SendMessage(hEditWnd, EM_EXLINEFROMCHAR, 0, -2);
  var nBegLine;
  var nLenLine;
  var nCol;
  var pSelTxt;
  var pTxt1;
  var pTxt2;


  if ((nBegSel == nEndSel) || ((nMove > 0) && (nMove < 3) && (nEndSel == nLastChar)) || ((nMove > -3) && (nMove < 0) && (nBegSel == 0)) || ((nMove == 3) && (nLine2 == nLastLine)) || ((nMove == -3) && (nLine1 == 0)))
    nMove = 0;
  else if (nMove == 2)
  {
    nBegLine = AkelPad.SendMessage(hEditWnd, EM_LINEINDEX, nLine2, 0);
    nLenLine = AkelPad.SendMessage(hEditWnd, EM_LINELENGTH, nBegLine, 0);
    nMove    = nBegLine + nLenLine - nEndSel;
  }
  else if (nMove == -2)
  {
    nBegLine = AkelPad.SendMessage(hEditWnd, EM_LINEINDEX, nLine1, 0);
    nMove    = nBegLine - nBegSel;
  }
  else if (nMove == 3)
  {
    nBegLine = AkelPad.SendMessage(hEditWnd, EM_LINEINDEX, nLine1, 0);
    nCol     = nBegSel - nBegLine;
    nBegLine = AkelPad.SendMessage(hEditWnd, EM_LINEINDEX, nLine2 + 1, 0);
    nLenLine = AkelPad.SendMessage(hEditWnd, EM_LINELENGTH, nBegLine, 0);
    if (nCol < nLenLine)
      nMove = nBegLine + nCol - nEndSel;
    else
      nMove = nBegLine + nLenLine - nEndSel;
  }
  else if (nMove == -3)
  {
    nBegLine = AkelPad.SendMessage(hEditWnd, EM_LINEINDEX, nLine1, 0);
    nCol     = nBegSel - nBegLine;
    nBegLine = AkelPad.SendMessage(hEditWnd, EM_LINEINDEX, nLine1 - 1, 0);
    nLenLine = AkelPad.SendMessage(hEditWnd, EM_LINELENGTH, nBegLine, 0);
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
  
    pSelTxt = AkelPad.GetSelText(1 /*\r*/);
  
    if (nMove > 0)
    {
      pTxt1 = pSelTxt.substr(0, nEndSel - nBegSel);
      pTxt2 = pSelTxt.substr(nEndSel - nBegSel);
    }
    else
    {
      pTxt1 = pSelTxt.substr(0, -nMove);
      pTxt2 = pSelTxt.substr(-nMove);
    }
  
    nBegSel += nMove;
    nEndSel += nMove;
  
    AkelPad.ReplaceSel(pTxt2 + pTxt1);
  
    if (bCarOnEnd)
      AkelPad.SetSel(nBegSel, nEndSel);
    else
      AkelPad.SetSel(nEndSel, nBegSel);
  }
}


function SetRedraw(hWnd, bRedraw)
{
  var oSys = AkelPad.SystemFunction();
  AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
  bRedraw && oSys.Call("user32::InvalidateRect", hWnd, 0, true);
}


function GetOffset(hWnd, nFlag)
{
  var nOffset = -1;
  var lpIndex;

  if (lpIndex=AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/))
  {
    AkelPad.SendMessage(hWnd, AEM_GETINDEX, nFlag, lpIndex);
    nOffset=AkelPad.SendMessage(hWnd, AEM_INDEXTORICHOFFSET, 0, lpIndex);
    AkelPad.MemFree(lpIndex);
  }
  return nOffset;
}


function ShiftCharIndex(lpIndex, nShiftRow, nShiftCol)
{
  AkelPad.MemCopy(lpIndex    , AkelPad.MemRead(lpIndex    , DT_DWORD) + nShiftRow, DT_DWORD);
  AkelPad.MemCopy(lpIndex + 8, AkelPad.MemRead(lpIndex + 8, DT_DWORD) + nShiftCol, DT_DWORD);
  AkelPad.SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpIndex);
}


function CopyCharIndex(lpToIndex, lpFromIndex)
{
  AkelPad.MemCopy(lpToIndex    , AkelPad.MemRead(lpFromIndex,     DT_DWORD), DT_DWORD);
  AkelPad.MemCopy(lpToIndex + 4, AkelPad.MemRead(lpFromIndex + 4, DT_DWORD), DT_DWORD);
  AkelPad.MemCopy(lpToIndex + 8, AkelPad.MemRead(lpFromIndex + 8, DT_DWORD), DT_DWORD);
}


function CopyCharIndexRowCol(lpToIndex, lpFromIndexRow, lpFromIndexCol)
{
  var nRow = AkelPad.MemRead(lpFromIndexRow    , DT_DWORD);
  var nCol = AkelPad.MemRead(lpFromIndexCol + 8, DT_DWORD);
  AkelPad.MemCopy(lpToIndex    , nRow, DT_DWORD);
  AkelPad.MemCopy(lpToIndex + 8, nCol, DT_DWORD);
  AkelPad.SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpToIndex);
}
