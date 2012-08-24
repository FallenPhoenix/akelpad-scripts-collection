// Replace text in selected column - 2011-03-07
//
// Call("Scripts::Main", 1, "ColumnsReplace.js")
// Can assign shortcut key, eg: Shift+Alt+Insert

if (AkelPad.SystemFunction().Call("kernel32::GetUserDefaultLangID") == 0x0415) //Polish
{
  var pTxtCaption  = "Zamiana tekstu w kolumnie";
  var pTxtNoColSel = "Brak zaznaczenia kolumnowego.";
  var pTxtLabel    = "Podaj tekst do zamiany:";
}
else
{
  var pTxtCaption  = "Replace text in selected column";
  var pTxtNoColSel = "There is no columnar selection.";
  var pTxtLabel    = "Input text to replace:";
}

var DT_DWORD          = 3;
var AEGI_FIRSTSELCHAR = 3;
var AEGI_LASTSELCHAR  = 4;
var AEM_GETSEL        = 3125;
var AEM_SETSEL        = 3126;
var AEM_GETCOLUMNSEL  = 3127;
var AEM_GETINDEX      = 3130;
var AEM_INDEXUPDATE   = 3132;
var AEM_INDEXCOMPARE  = 3133;

var hEditWnd = AkelPad.GetEditWnd();
var bColSel  = AkelPad.SendMessage(hEditWnd, AEM_GETCOLUMNSEL, 0, 0);
var lpFirstC;
var lpCaret;
var lpSelect;
var lpBegSel;
var lpEndSel;
var nCarPos;
var lpSelTxt;
var pTxt;
var nShiftCol;
var i;

if ((! hEditWnd) || AkelPad.GetEditReadOnly(hEditWnd))
  WScript.Quit();

if (! bColSel)
{
  AkelPad.MessageBox(hEditWnd, pTxtNoColSel, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
  WScript.Quit();
}

lpFirstC = AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/);
lpCaret  = AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/);
lpSelect = AkelPad.MemAlloc(28 /*sizeof(AESELECTION)*/);
lpBegSel = lpSelect;
lpEndSel = lpSelect + 12;
if ((! lpFirstC) || (! lpCaret) || (! lpSelect))
{
  AkelPad.MemFree(lpFirstC);
  AkelPad.MemFree(lpCaret);
  AkelPad.MemFree(lpSelect);
  WScript.Quit();
}

AkelPad.SendMessage(hEditWnd, AEM_GETINDEX, AEGI_FIRSTSELCHAR, lpFirstC);
AkelPad.SendMessage(hEditWnd, AEM_GETSEL, lpCaret, lpSelect);

//nCarPos   0   1
//          3   2
if (AkelPad.SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpBegSel, lpFirstC) == 0)
{
  if (AkelPad.SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpCaret, lpBegSel) == 0)
    nCarPos = 0;
  else
    nCarPos = 2;
}
else
{
  if (AkelPad.SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpCaret, lpEndSel) == 0)
    nCarPos = 3;
  else
    nCarPos = 1;
}

lpSelTxt = AkelPad.GetSelText(1 /*\r*/).split("\r");

if (nCarPos < 2)
  pTxt = lpSelTxt[0];
else
  pTxt = lpSelTxt[lpSelTxt.length - 1];

pTxt = AkelPad.InputBox(hEditWnd, pTxtCaption, pTxtLabel, pTxt);

if (pTxt)
{
  nShiftCol = pTxt.length - lpSelTxt[0].length;

  for (i = 0; i < lpSelTxt.length; ++i)
    lpSelTxt[i] = pTxt;

  pTxt = lpSelTxt.join("\r");
  AkelPad.ReplaceSel(pTxt);

  if (nCarPos == 0)
    ShiftCharIndex(lpEndSel, 0, nShiftCol);
  else if (nCarPos == 1)
  {
    ShiftCharIndex(lpBegSel, 0, nShiftCol);
    ShiftCharIndex(lpCaret,  0, nShiftCol);
  }
  else if (nCarPos == 2)
  {
    ShiftCharIndex(lpEndSel, 0, nShiftCol);
    ShiftCharIndex(lpCaret,  0, nShiftCol);
  }
  else
    ShiftCharIndex(lpBegSel, 0, nShiftCol);

  AkelPad.SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpBegSel);
  AkelPad.SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpEndSel);
  AkelPad.SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpCaret);

  AkelPad.SendMessage(hEditWnd, AEM_SETSEL, lpCaret, lpSelect);
}

AkelPad.MemFree(lpFirstC);
AkelPad.MemFree(lpCaret);
AkelPad.MemFree(lpSelect);

////////////
function ShiftCharIndex(lpIndex, nShiftRow, nShiftCol)
{
  AkelPad.MemCopy(lpIndex    , AkelPad.MemRead(lpIndex    , DT_DWORD) + nShiftRow, DT_DWORD);
  AkelPad.MemCopy(lpIndex + 8, AkelPad.MemRead(lpIndex + 8, DT_DWORD) + nShiftCol, DT_DWORD);
}
