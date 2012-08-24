// Change margins in edit window - 2011-08-24
//
// Call("Scripts::Main", 1, "MarginsChange.js", "-2 35 8 20") - decrease left margin of 2 pixels
//                                                              increase top margin of 35 pixels
//                                                              increase right margin of 8 pixels
//                                                              increase bottom margin of 20 pixels

var DT_DWORD = 3;
var hEditWnd = AkelPad.GetEditWnd();
var oRect    = new Object();

if (hEditWnd)
{
  GetMargins(hEditWnd, oRect);

  if ((WScript.Arguments.length >= 1) && isFinite(WScript.Arguments(0)))
    oRect.L += Number(WScript.Arguments(0));

  if ((WScript.Arguments.length >= 2) && isFinite(WScript.Arguments(1)))
    oRect.T += Number(WScript.Arguments(1));

  if ((WScript.Arguments.length >= 3) && isFinite(WScript.Arguments(2)))
    oRect.R -= Number(WScript.Arguments(2));

  if ((WScript.Arguments.length >= 4) && isFinite(WScript.Arguments(3)))
    oRect.B -= Number(WScript.Arguments(3));

  SetMargins(hEditWnd, oRect);
}

function GetMargins(hWnd, oRect, bSet)
{
  var lpRect = AkelPad.MemAlloc(16) //sizeof(RECT);

  AkelPad.SendMessage(hWnd, 3177 /*AEM_GETRECT*/, 0, lpRect);

  oRect.L = AkelPad.MemRead(lpRect,      DT_DWORD);
  oRect.T = AkelPad.MemRead(lpRect +  4, DT_DWORD);
  oRect.R = AkelPad.MemRead(lpRect +  8, DT_DWORD);
  oRect.B = AkelPad.MemRead(lpRect + 12, DT_DWORD);

  AkelPad.MemFree(lpRect);
}

function SetMargins(hWnd, oRect)
{
  var lpRect = AkelPad.MemAlloc(16) //sizeof(RECT);

  AkelPad.MemCopy(lpRect,      oRect.L, DT_DWORD);
  AkelPad.MemCopy(lpRect +  4, oRect.T, DT_DWORD);
  AkelPad.MemCopy(lpRect +  8, oRect.R, DT_DWORD);
  AkelPad.MemCopy(lpRect + 12, oRect.B, DT_DWORD);

  AkelPad.SendMessage(hWnd, 3178 /*AEM_SETRECT*/, 1, lpRect);

  AkelPad.MemFree(lpRect);
}
