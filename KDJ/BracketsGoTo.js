// Brackets - go to or select between nearest brackets - 2010-11-13
//
// Call("Scripts::Main", 1, "BracketsGoTo.js", "l") - go to left to opening bracket
// Call("Scripts::Main", 1, "BracketsGoTo.js", "r") - go to right to closing bracket
// Call("Scripts::Main", 1, "BracketsGoTo.js", "L") - select between the brackets from left
// Call("Scripts::Main", 1, "BracketsGoTo.js", "R") - select between the brackets from right
//
// Can assign shortcut keys, eg: Ctrl+<, Ctrl+>, Ctrl+Shift+<, Ctrl+Shift+>.
// To change a set of brackets, change the value nABrackets variable.

var nABrackets = 1;
var aOpen;
var aClose;

if (nABrackets == 0)
{
  aOpen  = ["(", "[", "{", "<", "'", "\"", "/"];
  aClose = [")", "]", "}", ">", "'", "\"", "/"];
}
else if (nABrackets == 1)
{
  aOpen  = ["(", "[", "{", "'", "\""];
  aClose = [")", "]", "}", "'", "\""];
}
else if (nABrackets == 2)
{
  aOpen  = ["(", "[", "{"];
  aClose = [")", "]", "}"];
}
else if (nABrackets == 3)
{
  aOpen  = ["'", "\""];
  aClose = ["'", "\""];
}

var hEditWnd = AkelPad.GetEditWnd();
var pAction;

if (! hEditWnd)
  WScript.Quit();
if (WScript.Arguments.length)
  pAction = WScript.Arguments(0);
if (! pAction)
  WScript.Quit();

var nCarPos   = GetOffset(hEditWnd, 5 /*AEGI_CARETCHAR*/);
var nLastChar = GetOffset(hEditWnd, 2 /*AEGI_LASTCHAR*/);
var pTxt      = AkelPad.GetTextRange(0, nLastChar, 1 /*\r*/);
var pCarChar  = AkelPad.GetTextRange(nCarPos, nCarPos + 1);
var bSelAll   = false;
var nPos;
var nBrack;
var nBrackPos;
var nBegSel;
var nEndSel;
var i;

if ((pAction == "l") && (nCarPos > 0))
{
  nBrackPos = -1;
  for (i = 0; i < aOpen.length; ++i)
  {
    nPos = pTxt.lastIndexOf(aOpen[i], nCarPos - 1);
    if (nPos > nBrackPos)
      nBrackPos = nPos;
  }
  if (nBrackPos > -1)
    AkelPad.SetSel(nBrackPos, nBrackPos);
}

else if ((pAction == "r") && (nCarPos < nLastChar - 1))
{
  nBrackPos = nLastChar;
  for (i = 0; i < aClose.length; ++i)
  {
    nPos = pTxt.indexOf(aClose[i], nCarPos + 1);
    if ((nPos > -1) && (nPos < nBrackPos))
      nBrackPos = nPos;
  }
  if (nBrackPos < nLastChar)
    AkelPad.SetSel(nBrackPos, nBrackPos);
}

else if (pAction == "L")
{
  nBrack = ArraySearch(aOpen, pCarChar);

  if (nBrack < 0)
  {
    nBrackPos = -1;
    for (i = 0; i < aOpen.length; ++i)
    {
      nPos = pTxt.lastIndexOf(aOpen[i], nCarPos - 1);
      if (nPos > nBrackPos)
      {
        nBrackPos = nPos;
        nBrack    = i;
      }
    }
    if (nBrackPos > -1)
      nBegSel = nBrackPos + 1;
  }
  else
  {
    nBegSel = nCarPos;
    bSelAll = true;
  }

  if (nBrack > -1)
  {
    nBrackPos = pTxt.indexOf(aClose[nBrack], nCarPos + bSelAll);
    if (nBrackPos > -1)
    {
      if ((nBrackPos == nCarPos) && (! bSelAll))
      {
        --nBegSel;
        bSelAll = true;
      }
      nEndSel = (bSelAll) ? (nBrackPos + 1) : (nBrackPos);
      AkelPad.SetSel(nEndSel, nBegSel);
    }
  }
}

else if ((pAction == "R") && (nCarPos > 0))
{
  nBrack = ArraySearch(aClose, pCarChar);

  if (nBrack < 0)
  {
    nBrackPos = nLastChar;
    for (i = 0; i < aClose.length; ++i)
    {
      nPos = pTxt.indexOf(aClose[i], nCarPos + 1);
      if ((nPos > -1) && (nPos < nBrackPos))
      {
        nBrackPos = nPos;
        nBrack    = i;
      }
    }
    if (nBrackPos < nLastChar)
      nBegSel = nBrackPos;
  }
  else
  {
    nBegSel = nCarPos + 1;
    bSelAll = true;
  }

  if (nBrack > -1)
  {
    nBrackPos = pTxt.lastIndexOf(aOpen[nBrack], nCarPos - bSelAll);
    if (nBrackPos > -1)
    {
      if ((nBrackPos == nCarPos) && (! bSelAll))
      {
        ++nBegSel;
        bSelAll = true;
      }
      nEndSel = (bSelAll) ? (nBrackPos) : (nBrackPos + 1);
      AkelPad.SetSel(nEndSel, nBegSel);
    }
  }
}

/////////////////
function ArraySearch(aArray, Value)
{
  var nPos = -1;
  var i;

  for (i = 0; i < aArray.length; ++i)
  {
    if (aArray[i] == Value)
    {
      nPos = i;
      break;
    }
  }
  return nPos;
}

function GetOffset(hWnd, nFlag)
{
  var nOffset = -1;
  var lpIndex;

  if (lpIndex = AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/))
  {
    AkelPad.SendMessage(hWnd, 3130 /*AEM_GETINDEX*/, nFlag, lpIndex);
    nOffset = AkelPad.SendMessage(hWnd, 3136 /*AEM_INDEXTORICHOFFSET*/, 0, lpIndex);
    AkelPad.MemFree(lpIndex);
  }
  return nOffset;
}
