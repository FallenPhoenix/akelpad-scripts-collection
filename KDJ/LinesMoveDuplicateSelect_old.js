// Move up/down, duplicate selected lines or only select whole lines - 2010-10-12
// If there is no selection, it selects, moves or duplicates the current line.
//
// Call("Scripts::Main", 1, "LinesMoveDuplicateSelect.js", "0")  - only select whole lines
// Call("Scripts::Main", 1, "LinesMoveDuplicateSelect.js", "-1") - move up
// Call("Scripts::Main", 1, "LinesMoveDuplicateSelect.js", "1")  - move down
// Call("Scripts::Main", 1, "LinesMoveDuplicateSelect.js", "2")  - duplicate
//
// Can assign shortcut keys, eg: Ctrl+Shift+L, Ctrl+Shift+Up, Ctrl+Shift+Down, Ctrl+Shift+Y.


var hEditWnd = AkelPad.GetEditWnd();
if (! hEditWnd)
	WScript.Quit();

var nAction;
if (WScript.Arguments.length)
	nAction = WScript.Arguments(0);
if (!((nAction == -1) || (nAction == 1)  || (nAction == 0)  || (nAction == 2)))
	WScript.Quit();


SetRedraw(hEditWnd, false);

// Word Wrap
var nWordWrap = AkelPad.SendMessage(hEditWnd, 3241 /*AEM_GETWORDWRAP*/, 0, 0);
if (nWordWrap > 0) AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/);

if (! LinesSelect(hEditWnd) || (nAction == 0) || AkelPad.GetEditReadOnly(hEditWnd))
{
	if (nWordWrap > 0) AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/);
	SetRedraw(hEditWnd, true);
	WScript.Quit();
}

// SmartSel::NoSelEOL plugin
var pFuncEOL  = "SmartSel::NoSelEOL";
var bNoSelEOL = AkelPad.IsPluginRunning(pFuncEOL);
if (bNoSelEOL)
   AkelPad.Call(pFuncEOL);

var nBegSel   = AkelPad.GetSelStart();
var nEndSel   = AkelPad.GetSelEnd();
var nLine1    = AkelPad.SendMessage(hEditWnd, 1078 /*EM_EXLINEFROMCHAR*/, 0, nBegSel);
var nLine2    = AkelPad.SendMessage(hEditWnd, 1078 /*EM_EXLINEFROMCHAR*/, 0, nEndSel);
var nLastLine = AkelPad.SendMessage(hEditWnd, 1078 /*EM_EXLINEFROMCHAR*/, 0, -2);
var pEOL      = "\r";

var nBegLine1;
var nBegLine2;
var nLenLine2;
var nSel1;
var nSel2;
var pSelTxt;
var pTxt1;
var pTxt2;

if (((nAction == 1) && (nLine2 < nLastLine) || (nAction == -1) && (nLine1 > 0)))
{
	if (nAction == 1)
		++ nLine2;
	else
		-- nLine1;

	nBegLine1 = AkelPad.SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/, nLine1, 0);
	nBegLine2 = AkelPad.SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/, nLine2, 0);
	nLenLine2 = AkelPad.SendMessage(hEditWnd, 193 /*EM_LINELENGTH*/, nBegLine2, 0);
	nSel1 = nBegLine1;
	nSel2 = nBegLine2 + nLenLine2;

	AkelPad.SetSel(nSel1, nSel2);
	pSelTxt = AkelPad.GetSelText(1 /*\r*/);

	if (nAction == 1)
	{
		pTxt1 = pSelTxt.substr(0, pSelTxt.lastIndexOf(pEOL));
		pTxt2 = pSelTxt.substr(pSelTxt.lastIndexOf(pEOL) + 1) + pEOL;
		nBegSel += pTxt2.length;
		nEndSel += pTxt2.length;
	}
	else
	{
		pTxt1 = pSelTxt.substr(0, pSelTxt.indexOf(pEOL));
		pTxt2 = pSelTxt.substr(pSelTxt.indexOf(pEOL) + 1) + pEOL;
		nBegSel -= (pTxt1.length + 1);
		nEndSel -= (pTxt1.length + 1);
	}

	AkelPad.ReplaceSel(pTxt2 + pTxt1);

	if (nAction == 1)
		AkelPad.SetSel(nBegSel, nEndSel);
	else
		AkelPad.SetSel(nEndSel, nBegSel);
}
else if (nAction == 2)
{
	pSelTxt = pEOL + AkelPad.GetSelText(1 /*\r*/);
	AkelPad.SetSel(nEndSel, nEndSel);
	AkelPad.ReplaceSel(pSelTxt);
	AkelPad.SetSel(nBegSel, nEndSel);
}

if (nWordWrap > 0)
	AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/);

if (bNoSelEOL)
	AkelPad.Call(pFuncEOL);

SetRedraw(hEditWnd, true);


///////////////////////////////

function LinesSelect(hWnd)
{
	var bSelLine;
	var nBegSel = AkelPad.GetSelStart();
	var nEndSel = AkelPad.GetSelEnd();
	var nLine1  = AkelPad.SendMessage(hWnd, 1078 /*EM_EXLINEFROMCHAR*/, 0, nBegSel);
	var nLine2  = AkelPad.SendMessage(hWnd, 1078 /*EM_EXLINEFROMCHAR*/, 0, nEndSel);

	nBegSel = AkelPad.SendMessage(hWnd, 187 /*EM_LINEINDEX*/, nLine1, 0);
	nEndSel = AkelPad.SendMessage(hWnd, 187 /*EM_LINEINDEX*/, nLine2, 0) + AkelPad.SendMessage(hWnd, 193 /*EM_LINELENGTH*/, nEndSel, 0);

	if (nBegSel < nEndSel)
	{
		AkelPad.SetSel(nBegSel, nEndSel);
		bSelLine = true;
	}
	return bSelLine;
}


function SetRedraw(hWnd, bRedraw)
{
	var oSys = AkelPad.SystemFunction();
	AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
	bRedraw && oSys.Call("user32::InvalidateRect", hWnd, 0, true);
}
