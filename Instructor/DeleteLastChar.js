// http://akelpad.sourceforge.net/forum/viewtopic.php?p=5464#5464
// Version v1.0
//
//
//// Delete last character in selected lines.

var hWndEdit=AkelPad.GetEditWnd();
var oSys=AkelPad.SystemFunction();
var pSelText;
var pLinesArray;
var nIndex;

if (pSelText=AkelPad.GetSelText())
{
  if (pLinesArray=pSelText.split("\r"))
  {
    for (nIndex=0; nIndex < pLinesArray.length; ++nIndex)
      pLinesArray[nIndex]=pLinesArray[nIndex].substr(0, pLinesArray[nIndex].length - 1);
    pSelText=pLinesArray.join("\r");

    SetRedraw(hWndEdit, false);
    AkelPad.ReplaceSel(pSelText, true);
    SetRedraw(hWndEdit, true);
  }
}

function SetRedraw(hWnd, bRedraw)
{
  AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
  if (bRedraw) oSys.Call("user32::InvalidateRect", hWnd, 0, true);
}
