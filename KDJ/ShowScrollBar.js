// Show/hide scroll bars in edit window - 2011-08-19
//
// Call("Scripts::Main", 1, "ShowScrollBar.js")       - switch (show/hide) horizontal and vertical scroll bars
// Call("Scripts::Main", 1, "ShowScrollBar.js", "+")  - show horizontal and vertical scroll bars
// Call("Scripts::Main", 1, "ShowScrollBar.js", "-")  - hide horizontal and vertical scroll bars
// Call("Scripts::Main", 1, "ShowScrollBar.js", "H")  - switch (show/hide) horizontal scroll bar
// Call("Scripts::Main", 1, "ShowScrollBar.js", "H+") - show horizontal scroll bar
// Call("Scripts::Main", 1, "ShowScrollBar.js", "H-") - hide horizontal scroll bar
// Call("Scripts::Main", 1, "ShowScrollBar.js", "V")  - switch (show/hide) vertical scroll bar
// Call("Scripts::Main", 1, "ShowScrollBar.js", "V+") - show vertical scroll bar
// Call("Scripts::Main", 1, "ShowScrollBar.js", "V-") - hide vertical scroll bar

var AEM_SHOWSCROLLBAR = 3375;

var SB_HORZ  = 0;
var SB_VERT  = 1;
var SB_BOTH  = 3;
var hEditWnd = AkelPad.GetEditWnd();
var sAction  = "";
var nSB      = SB_BOTH;
var lpPoint;
var bVisible;

if ((hEditWnd) && (lpPoint = AkelPad.MemAlloc(8 /*sizeof(POINT)*/)))
{
  if (WScript.Arguments.length)
  {
  	sAction = WScript.Arguments(0).toUpperCase().replace(/\s+/, "");
  
    if (sAction.charAt(0) == "H")
      nSB = SB_HORZ;
    else if (sAction.charAt(0) == "V")
      nSB = SB_VERT;
  }

  if (sAction.charAt(sAction.length - 1) == "+")
    bVisible = 1;
  else if (sAction.charAt(sAction.length - 1) == "-")
    bVisible = 0;
  else if ((AkelPad.SendMessage(hEditWnd, AEM_SHOWSCROLLBAR, -1, 0) == nSB) ||
           (AkelPad.SendMessage(hEditWnd, AEM_SHOWSCROLLBAR, -1, 0) == SB_BOTH))
    bVisible = 0;
  else
    bVisible = 1;

  AkelPad.SendMessage(hEditWnd, 1245 /*EM_GETSCROLLPOS*/, 0, lpPoint);
  AkelPad.SendMessage(hEditWnd, AEM_SHOWSCROLLBAR, nSB, bVisible);
  AkelPad.SendMessage(hEditWnd, 1246 /*EM_SETSCROLLPOS*/, 0, lpPoint);
  AkelPad.MemFree(lpPoint);
}
