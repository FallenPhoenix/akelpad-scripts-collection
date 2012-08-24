// Maximum line length - 2010-11-06
//
// Call("Scripts::Main", 1, "LineMaxLength.js")

var hEditWnd = AkelPad.GetEditWnd();
var nMaxLenL = 0;
var nWordWrap;
var nLines;
var nBegLine;
var nLenLine;
var i;

if (! hEditWnd) WScript.Quit();

nWordWrap = AkelPad.SendMessage(hEditWnd, 3241 /*AEM_GETWORDWRAP*/, 0, 0);
if (nWordWrap > 0) AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/);

nLines = AkelPad.SendMessage(hEditWnd, 3129 /*AEM_GETLINENUMBER*/, 0 /*AEGL_LINECOUNT*/, 0);

for (i = 0; i < nLines; ++i)
{
  nBegLine = AkelPad.SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/, i, 0);
  nLenLine = AkelPad.SendMessage(hEditWnd, 193 /*EM_LINELENGTH*/, nBegLine, 0);
  if (nLenLine > nMaxLenL)
    nMaxLenL = nLenLine;
}

if (nWordWrap > 0) AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/);

AkelPad.MessageBox(hEditWnd, "Maximum line length = " + nMaxLenL, "Line length", 64 /*MB_ICONINFORMATION*/);
