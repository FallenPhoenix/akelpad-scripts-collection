///Move the text vertically
///Перемещение выделенного текста вверх или вниз, в зависимости от переданного аргумента
// Call("Scripts::Main", 1, "ShiftVerticaly.js", "-1")	- Up
// Call("Scripts::Main", 1, "ShiftVerticaly.js", "1")	- Down
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=8255#8255
// Version: 2.2 (2012.06.26)

var nMoveDirection = AkelPad.GetArgLine();
if (!nMoveDirection) WScript.Quit();

var hWndEdit = AkelPad.GetEditWnd();
var oSys = AkelPad.SystemFunction();
var bSelEOL = 1;
var pBreak = "\r";
var nStartCorrect = 0;
var nEndCorrect = 0;
var nMinSel = AkelPad.GetSelStart();
var nMaxSel = AkelPad.GetSelEnd();
var nLastLine = AkelPad.SendMessage(hWndEdit, 1078 /*EM_EXLINEFROMCHAR*/, 0, -2);			//Последняя строка файла!
var nMinLine = AkelPad.SendMessage(hWndEdit, 1078 /*EM_EXLINEFROMCHAR*/, 0, nMinSel);
if (nMoveDirection < 0)
{
	if (nMinLine == 0) WScript.Quit();
	nMinLine -= 1;
}
var nMaxLine = AkelPad.SendMessage(hWndEdit, 1078 /*EM_EXLINEFROMCHAR*/, 0, nMaxSel) + 1;
if (nMoveDirection > 0)
{
	if (nMaxLine -1 == nLastLine) WScript.Quit();
	nMaxLine += 1;
}
nMinLineIndex = AkelPad.SendMessage(hWndEdit, 187 /*EM_LINEINDEX*/, nMinLine, 0);
nMaxLineIndex = AkelPad.SendMessage(hWndEdit, 187 /*EM_LINEINDEX*/, nMaxLine, 0) - bSelEOL;

setRedraw(hWndEdit, false);

AkelPad.SetSel(nMinLineIndex, nMaxLineIndex);

var pSelText = AkelPad.GetSelText();

if (nMoveDirection < 0) nSep = pSelText.indexOf(pBreak); else nSep = pSelText.lastIndexOf(pBreak);

var partFirst = pSelText.substr(0, nSep);
var partRest = pSelText.substr(nSep + 1);

if (nMoveDirection < 0)
{
	nEndCorrect = nEndCorrect + partFirst.length + bSelEOL;
}
else
{
	nStartCorrect = partRest.length + 1;
	nEndCorrect = nEndCorrect - 1 + bSelEOL;
}
AkelPad.ReplaceSel(partRest + pBreak + partFirst, true);
AkelPad.SetSel(AkelPad.GetSelStart() + nStartCorrect, AkelPad.GetSelEnd() - nEndCorrect);

setRedraw(hWndEdit, true);


function setRedraw(hWnd, bRedraw)
{
	AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
	bRedraw && oSys.Call("user32::InvalidateRect", hWnd, 0, true);
}