// GoToEx.js - ver. 2012-12-26
//
// "Go to" dialog with argument
//
// Usage:
// Call("Scripts::Main", 1, "GoToEx.js")      - standard procedure call
// Call("Scripts::Main", 1, "GoToEx.js", "L") - go to Line:Column
// Call("Scripts::Main", 1, "GoToEx.js", "O") - go to Offset

if (! AkelPad.GetEditWnd())
  WScript.Quit();

var IDC_GOTO_LINE   = 3102;
var IDC_GOTO_OFFSET = 3103;

var oSys     = AkelPad.SystemFunction();
var nLineArg = -1;
var hWndGoTo;
var hWndLine;
var hWndOffset;

if (WScript.Arguments.length)
{
  if (WScript.Arguments(0).toUpperCase() == "L")
    nLineArg = 1;
  else if (WScript.Arguments(0).toUpperCase() == "O")
    nLineArg = 0;
}

AkelPad.Command(4162 /*IDM_EDIT_GOTO*/);

if (nLineArg >= 0)
{
  if (hWndGoTo = GetGoToDialog())
  {
    hWndLine   = oSys.Call("User32::GetDlgItem", hWndGoTo, IDC_GOTO_LINE);
    hWndOffset = oSys.Call("User32::GetDlgItem", hWndGoTo, IDC_GOTO_OFFSET);

    if (hWndLine && hWndOffset)
    {
      AkelPad.SendMessage(hWndLine,   241 /*BM_SETCHECK*/, nLineArg,   0);
      AkelPad.SendMessage(hWndOffset, 241 /*BM_SETCHECK*/, ! nLineArg, 0);

      if (nLineArg)
        AkelPad.SendMessage(hWndGoTo, 273 /*WM_COMMAND*/, IDC_GOTO_LINE, hWndLine);
      else
        AkelPad.SendMessage(hWndGoTo, 273 /*WM_COMMAND*/, IDC_GOTO_OFFSET, hWndOffset);
    }
  }
}

function GetGoToDialog()
{
  var lpMLT = AkelPad.MemAlloc(4);
  var hWnd  = AkelPad.SendMessage(AkelPad.GetMainWnd(), 1275 /*AKD_GETMODELESS*/, 0, lpMLT);
  var hDlg  = 0;

  if (AkelPad.MemRead(lpMLT, 3 /*DT_DWORD*/) == 5 /*MLT_GOTO*/)
    hDlg = hWnd;

  AkelPad.MemFree(lpMLT);

  return hDlg;
}
