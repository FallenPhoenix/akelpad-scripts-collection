// CaretOptionsSwitch.js - ver. 2012-09-02
//
// Switching four caret options.
//
// How to use:
//   Directly call:
//     Call("Scripts::Main", 1, "CaretOptionsSwitch.js", "Option")
//   Add button to Toolbar plugin:
//     -"Caret option switch" Call("Scripts::Main", 1, "CaretOptionsSwitch.js", "Option %m %i") Icon(0)
//   Add item to ContextMenu plugin:
//     -"Caret option switch" Call("Scripts::Main", 1, "CaretOptionsSwitch.js", "Option %m %i")
//
// Option argument can have value:
//   0 - Caret after end of line (default)
//   1 - Show active column
//   2 - Show active line
//   3 - Show active line border
//
// Example for Active line show/hide:
//   -"Active line switch" Call("Scripts::Main", 1, "CaretOptionsSwitch.js", "2 %m %i") Icon(0)

var hMainWnd = AkelPad.GetMainWnd();
var hEditWnd = AkelPad.GetEditWnd();
var oSys     = AkelPad.SystemFunction();
var nAction  = 0;
var nHandle  = 0;
var nItemID  = 0;
var nSetOptions;
var nCaretOptions;
var nAECO_flag;
var nCO_flag;

if (hMainWnd && hEditWnd)
{
  //Arguments
  if (WScript.Arguments.length > 0)
  {
    nAction = parseInt(WScript.Arguments(0));
    if ((nAction < 0) || (nAction > 3))
      nAction = 0;
  }
  if (WScript.Arguments.length > 2)
  {
    nHandle = parseInt(WScript.Arguments(1));
    nItemID = parseInt(WScript.Arguments(2));
  }

  if (nAction == 0) //Allow caret moving out of the line edge
  {
    nAECO_flag = 0x00000200; //AECO_CARETOUTEDGE
    nCO_flag   = 0x00000001; //CO_CARETOUTEDGE
  }
  else if (nAction == 1) //Draw caret vertical line
  {
    nAECO_flag = 0x00000400; //AECO_ACTIVECOLUMN
    nCO_flag   = 0x00000002; //CO_CARETVERTLINE
  }
  else if (nAction == 2) //Draw active line
  {
    nAECO_flag = 0x00000800; //AECO_ACTIVELINE
    nCO_flag   = 0x00000004; //CO_CARETACTIVELINE
  }
  else //Draw active line border
  {
    nAECO_flag = 0x00001000; //AECO_ACTIVELINEBORDER
    nCO_flag   = 0x00000008; //CO_CARETACTIVELINEBORDER
  }

  nSetOptions   = AkelPad.SendMessage(hEditWnd, 3227 /*AEM_GETOPTIONS*/, 0, 0);
  nCaretOptions = AkelPad.SendMessage(hMainWnd, 1223 /*AKD_GETFRAMEINFO*/, 69 /*FI_CARETOPTIONS*/, 0);

  if (nSetOptions & nAECO_flag)
  {
    AkelPad.SendMessage(hEditWnd, 3228 /*AEM_SETOPTIONS*/, 4 /*AECOOP_XOR*/, nAECO_flag);

    if (nCaretOptions & nCO_flag)
      nCaretOptions = nCaretOptions ^ nCO_flag;

    if (oSys.Call("User32::IsMenu", nHandle))
      oSys.Call("User32::CheckMenuItem", nHandle, nItemID, 0x0 /*MF_BYCOMMAND|MF_UNCHECKED*/);
    else
      AkelPad.SendMessage(nHandle, 1026 /*TB_CHECKBUTTON*/, nItemID, false);
  }
  else
  {
    AkelPad.SendMessage(hEditWnd, 3228 /*AEM_SETOPTIONS*/, 2 /*AECOOP_OR*/, nAECO_flag);

    if (! (nCaretOptions & nCO_flag))
      nCaretOptions = nCaretOptions | nCO_flag;

    if (oSys.Call("User32::IsMenu", nHandle))
      oSys.Call("User32::CheckMenuItem", nHandle, nItemID, 0x8 /*MF_BYCOMMAND|MF_CHECKED*/);
    else
      AkelPad.SendMessage(nHandle, 1026 /*TB_CHECKBUTTON*/, nItemID, true);
  }

  AkelPad.SetFrameInfo(0, 17 /*FIS_CARETOPTIONS*/, nCaretOptions);
}
