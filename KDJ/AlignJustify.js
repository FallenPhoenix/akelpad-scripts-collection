// Align selected lines to the left, right, center or justify - 2010-09-12
//
// Call("Scripts::Main", 1, "AlignJustify.js", "L") - left
// Call("Scripts::Main", 1, "AlignJustify.js", "R") - right
// Call("Scripts::Main", 1, "AlignJustify.js", "C") - center
// Call("Scripts::Main", 1, "AlignJustify.js", "J") - justify
//
// To effect was clearly visible, you should use a fixed-width font.


var hMainWnd  = AkelPad.GetMainWnd();
var hEditWnd  = AkelPad.GetEditWnd();
var nWordWrap = AkelPad.SendMessage(hEditWnd, 3241 /*AEM_GETWORDWRAP*/, 0, 0);
var bColSel   = AkelPad.SendMessage(hEditWnd, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0);
var pAction;

if (! hEditWnd)
  WScript.Quit();
if (WScript.Arguments.length)
  pAction = WScript.Arguments(0);
if ((! pAction) || ("LRCJ".indexOf(pAction) < 0))
  WScript.Quit();

SetRedraw(hEditWnd, false);
if (nWordWrap > 0) AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/);

if ((! bColSel) && (! LinesSelect(hEditWnd)))
{
  if (nWordWrap > 0) AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/);
  SetRedraw(hEditWnd, true);
  WScript.Quit();
}


var pTxt     = AkelPad.GetSelText(1 /*\r*/).replace(/\t/gm, " "); //Replace tabs to spaces
var lpLines  = pTxt.split("\r");
var nLines   = lpLines.length;
var nLenLine = 0;
var nLenLine1;
var lpWords;
var lpSpaces;
var pPad;
var i;
var n;

for (i = 0; i < nLines; ++i)
{
  if (nLenLine < lpLines[i].length)
    nLenLine = lpLines[i].length;

  lpLines[i] = lpLines[i].replace(/(^ +)|( +$)/g, ""); //Delete leading and trailing spaces
}

if (pAction == "J")
{
  for (i = 0; i < nLines; ++i)
  {
    lpWords   = lpLines[i].split(/ +/);

    if (lpWords.length > 1)
    {
      nLenLine1 = lpLines[i].replace(/ +/g, "").length;
      lpSpaces  = [];

      for (n = 0; n < lpWords.length - 1; ++n)
        lpSpaces.push(Replicate(" ", Math.floor((nLenLine - nLenLine1) / (lpWords.length - 1))));

      for (n = 0; n < (nLenLine - nLenLine1) % (lpWords.length - 1); ++n)
        lpSpaces[n] += " ";

      lpLines[i] = lpWords[0];
      for (n = 0; n < lpSpaces.length; ++n)
        lpLines[i] = lpLines[i] + lpSpaces[n] + lpWords[n + 1];
    }
    else
      lpLines[i] = Pad(lpWords[0], nLenLine, "R");
  }
}

else
{
  pPad = pAction;

  if (pAction == "L")
    pPad = "R";
  else if (pAction == "R")
    pPad = "L";

  for (i = 0; i < nLines; ++i)
    lpLines[i] = Pad(lpLines[i], nLenLine, pPad);
}

AkelPad.ReplaceSel(lpLines.join("\r"), true);

if (nWordWrap > 0) AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/);
if (bColSel) AkelPad.SendMessage(hEditWnd, 3128 /*AEM_UPDATESEL*/, 0x1 /*AESELT_COLUMNON*/, 0);

SetRedraw(hEditWnd, true);


////////////////////
function Pad(pString, nLen, pType, pChar)
{
  var i = 0;

  if (! pType) pType = "R";
  if (! pChar) pChar = " ";

  if (pType == "R")
  {
    while (pString.length < nLen)
      pString += pChar;
  }
  else if (pType == "L")
  {
    while (pString.length < nLen)
      pString = pChar + pString;
  }
  else if (pType == "C")
  {
    while (pString.length < nLen)
    {
      if ((i % 2) == 0)
        pString += pChar;
      else
        pString = pChar + pString;
      ++ i;
    }
  }
  return pString;
}

function Replicate(pStrIn, nNum)
{
  var pStrOut = "";
  var i;

  for (i=0; i < nNum; ++i)
    pStrOut += pStrIn;

  return pStrOut;
}

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
