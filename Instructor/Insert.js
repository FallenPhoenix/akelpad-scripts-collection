// http://akelpad.sourceforge.net/forum/viewtopic.php?p=13628#13628
// Version v1.2
//
//
//// This script is replacement for the Insert() plugin's method.
//
// Escape-sequences:
//   \\ - \ character;
//   \t - Tabulation;
//   \r\n - New line;
//   \r - New line;
//   \n - New line;
//   \s - Selection;
//   \c - Clipboard;
//   \| - Caret position after insertion;
//   \[ - Selection start position after insertion;
//   \] - Selection end position after insertion.
//
// Usage:
// -"Insert URL" Call("Scripts::Main", 1, "Insert.js", `<a href="\c">\[\s\]</a>`)

var hMainWnd=AkelPad.GetMainWnd();
var pArgLine=AkelPad.GetArgLine(0);
var nInsertPos;
var nSelStart;
var nSelEnd;

pArgLine=pArgLine.replace(/\\\\/g, "\0");
if (pArgLine.search(/\\[^rntsc\\\|\[\]]/g) != -1)
{
  AkelPad.MessageBox(hMainWnd, "Syntax error", WScript.ScriptName, 16 /*MB_ICONERROR*/);
  WScript.Quit();
}
pArgLine=pArgLine.replace(/\\r\\n|\\r|\\n/g, "\n");
pArgLine=pArgLine.replace(/\\t/g, "\t");
if (pArgLine.search(/\\s/g) != -1)
  pArgLine=pArgLine.replace(/\\s/g, AkelPad.GetSelText());
if (pArgLine.search(/\\c/g) != -1)
  pArgLine=pArgLine.replace(/\\c/g, AkelPad.GetClipboardText());

//Selection after insertion
if ((nSelStart=pArgLine.search(/\\\|/g)) != -1)
{
  pArgLine=pArgLine.replace(/\\\|/g, "");
  nSelEnd=nSelStart;
}
else if ((nSelStart=pArgLine.search(/\\\[/g)) != -1)
{
  pArgLine=pArgLine.replace(/\\\[/g, "");
  if ((nSelEnd=pArgLine.search(/\\\]/g)) != -1)
    pArgLine=pArgLine.replace(/\\\]/g, "");
}
pArgLine=pArgLine.replace(/\0/g, "\\");

//Replace selection
nInsertPos=AkelPad.GetSelStart();
AkelPad.ReplaceSel(pArgLine);
if (nSelStart != -1)
  AkelPad.SetSel(nInsertPos + nSelStart, nInsertPos + (nSelEnd != -1?nSelEnd:nSelStart));
