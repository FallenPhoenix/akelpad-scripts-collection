// ColumnsReplace.js - ver. 2013-08-24 (x86/x64)
//
// Replace text in selected column.
//
// Usage:
// Call("Scripts::Main", 1, "ColumnsReplace.js")
//
// Can assign shortcut key, eg: Shift+Alt+Insert

if (AkelPad.SystemFunction().Call("Kernel32::GetUserDefaultLangID") == 0x0415) //Polish
{
  var sTxtCaption  = 'Zamiana tekstu w kolumnie';
  var sTxtReadOnly = 'Ustawiony jest tryb "Tylko do odczytu".';
  var sTxtNoColSel = 'Brak zaznaczenia kolumnowego.';
  var sTxtLabel    = 'Podaj tekst do zamiany:';
}
else
{
  var sTxtCaption  = 'Replace text in selected column';
  var sTxtReadOnly = '"Read only" mode is set.';
  var sTxtNoColSel = 'There is no columnar selection.';
  var sTxtLabel    = 'Input text to replace:';
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

if (! hEditWnd)
  WScript.Quit();

if (AkelPad.GetEditReadOnly(hEditWnd))
{
  AkelPad.MessageBox(hEditWnd, sTxtReadOnly, sTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
  WScript.Quit();
}

if (! SendMessage(hEditWnd, AEM_GETCOLUMNSEL, 0, 0))
{
  AkelPad.MessageBox(hEditWnd, sTxtNoColSel, sTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
  WScript.Quit();
}

var lpFirstC = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
var lpCaret  = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
var lpSelect = AkelPad.MemAlloc(_X64 ? 56 : 28 /*sizeof(AESELECTION)*/);
var lpBegSel = lpSelect;
var lpEndSel = lpSelect + (_X64 ? 24 : 12);
var nCarPos;
var aSelText;
var sText;
var nShiftCol;
var i;

SendMessage(hEditWnd, AEM_GETINDEX, AEGI_FIRSTSELCHAR, lpFirstC);
SendMessage(hEditWnd, AEM_GETSEL, lpCaret, lpSelect);

//nCarPos   0   1
//          3   2
if (SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpBegSel, lpFirstC) == 0)
{
  if (SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpCaret, lpBegSel) == 0)
    nCarPos = 0;
  else
    nCarPos = 2;
}
else
{
  if (SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpCaret, lpEndSel) == 0)
    nCarPos = 3;
  else
    nCarPos = 1;
}

aSelText = AkelPad.GetSelText(1 /*\r*/).split("\r");

if (nCarPos < 2)
  sText = aSelText[0];
else
  sText = aSelText[aSelText.length - 1];

sText = AkelPad.InputBox(hEditWnd, sTxtCaption, sTxtLabel, sText);

if (sText)
{
  nShiftCol = sText.length - aSelText[0].length;

  for (i = 0; i < aSelText.length; ++i)
    aSelText[i] = sText;

  sText = aSelText.join("\r");
  AkelPad.ReplaceSel(sText);

  if (nCarPos == 0)
    ShiftCharIndex(lpEndSel, nShiftCol);
  else if (nCarPos == 1)
  {
    ShiftCharIndex(lpBegSel, nShiftCol);
    ShiftCharIndex(lpCaret, nShiftCol);
  }
  else if (nCarPos == 2)
  {
    ShiftCharIndex(lpEndSel, nShiftCol);
    ShiftCharIndex(lpCaret, nShiftCol);
  }
  else
    ShiftCharIndex(lpBegSel, nShiftCol);

  SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpBegSel);
  SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpEndSel);
  SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpCaret);

  SendMessage(hEditWnd, AEM_SETSEL, lpCaret, lpSelect);
}

AkelPad.MemFree(lpFirstC);
AkelPad.MemFree(lpCaret);
AkelPad.MemFree(lpSelect);

function ShiftCharIndex(lpIndex, nCol)
{
  AkelPad.MemCopy(lpIndex + (_X64 ? 16 : 8), AkelPad.MemRead(lpIndex + (_X64 ? 16 : 8), DT_DWORD) + nCol, DT_DWORD);
}

function SendMessage(hWnd, uMsg, wParam, lParam)
{
  return AkelPad.SystemFunction().Call("User32::SendMessage" + _TCHAR, hWnd, uMsg, wParam, lParam);
}
