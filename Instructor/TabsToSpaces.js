// http://akelpad.sourceforge.net/forum/viewtopic.php?p=7081#7081
// Version v1.2
//
//
//// Convert tabulation to space.

var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var bColumnSel;
var nTabStop;
var nInitColumn=0;
var nColumn;
var nSpaceCount;
var pSelText;
var pResult;
var pSpaces;
var lpSel;
var a;
var b;

if (hMainWnd)
{
  if (lpSel=AkelPad.MemAlloc(_X64?56:28 /*sizeof(AESELECTION)*/))
  {
    if (AkelPad.SendMessage(hWndEdit, 3125 /*AEM_GETSEL*/, 0, lpSel))
      nInitColumn=AkelPad.SendMessage(hWndEdit, 3147 /*AEM_INDEXTOCOLUMN*/, 0, lpSel /*AESELECTION.crSel.ciMin*/);
    else
      AkelPad.SetSel(0, -1);
    bColumnSel=AkelPad.SendMessage(hWndEdit, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0);
    nTabStop=AkelPad.SendMessage(hWndEdit, 3239 /*AEM_GETTABSTOP*/, 0, 0);
    AkelPad.MemFree(lpSel);
  }
  else WScript.Quit();

  //Scan selection
  pSelText=AkelPad.GetSelText();
  pResult="";

  for (a=0, b=0, nColumn=nInitColumn; b < pSelText.length; ++b)
  {
    if (pSelText.charAt(b) == '\t')
    {
      nSpaceCount=nTabStop - nColumn % nTabStop;
      nColumn+=nSpaceCount;
      for (pSpaces=""; nSpaceCount; --nSpaceCount)
        pSpaces=pSpaces + " ";
      pResult+=pSelText.substr(a, b - a) + pSpaces;
      a=b + 1;
    }
    else if (pSelText.charAt(b) == '\r')
      nColumn=bColumnSel?nInitColumn:0;
    else
      ++nColumn;
  }
  pResult+=pSelText.substr(a, b - a);

  //Replace selection
  AkelPad.ReplaceSel(pResult, true);
}
