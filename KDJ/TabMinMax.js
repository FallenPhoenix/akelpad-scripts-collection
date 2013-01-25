// TabMinMax.js - ver. 2013-01-25
//
// Minimize, maximize or restore tab in MDI mode
//
// Usage:
// Call("Scripts::Main", 1, "TabMinMax.js")      - restore tab
// Call("Scripts::Main", 1, "TabMinMax.js", "-") - minimize tab
// Call("Scripts::Main", 1, "TabMinMax.js", "+") - maximize tab

if (AkelPad.GetEditWnd() && (AkelPad.IsMDI() == 1 /*WMD_MDI*/))
{
  var oSys     = AkelPad.SystemFunction();
  var hMainWnd = AkelPad.GetMainWnd();
  var lpFrame  = AkelPad.SendMessage(hMainWnd, 1288 /*AKD_FRAMEFIND*/, 1 /*FWF_CURRENT*/, 0);
  var hWndMdi  = AkelPad.SendMessage(hMainWnd, 1223 /*AKD_GETFRAMEINFO*/, 1 /*FI_WNDEDITPARENT*/, lpFrame);
  var nAction  = 9 /*SW_RESTORE*/;

  if (WScript.Arguments.length)
  {
    if (WScript.Arguments(0) == "-")
      nAction = 2 /*SW_SHOWMINIMIZED*/;
    else if (WScript.Arguments(0) == "+")
      nAction = 3 /*SW_MAXIMIZE*/;
  }

  oSys.Call("User32::ShowWindow", hWndMdi, nAction);

  if (nAction == 3 /*SW_MAXIMIZE*/)
    oSys.Call("User32::SetForegroundWindow", hWndMdi);
}
