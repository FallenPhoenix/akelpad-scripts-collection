// CaretOptionsSwitch.js - 2011-12-05
//
// Switching four caret options.
//
// How to use:
// Add button to Toolbar plugin:
// -"Caret option" Call("Scripts::Main", 1, "CaretOptionsSwitch.js", "Option %m %i") Icon(0)
// Option argument can have value:
//   0 - Caret after end of line
//   1 - Show active column
//   2 - Show active line
//   3 - Show active line border
//
// Example for Active line show/hide:
// -"Active line switch" Call("Scripts::Main", 1, "CaretOptionsSwitch.js", "2 %m %i") Icon(0)

var hMainWnd  = AkelPad.GetMainWnd();
var hEditWnd  = AkelPad.GetEditWnd();
var nAction   = 0;
var hToolbar  = 0;
var nButtonID = 0;
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
    hToolbar  = parseInt(WScript.Arguments(1));
    nButtonID = parseInt(WScript.Arguments(2));
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
    AkelPad.SendMessage(hToolbar, 1026 /*TB_CHECKBUTTON*/, nButtonID, false);

    if (nCaretOptions & nCO_flag)
      nCaretOptions = nCaretOptions ^ nCO_flag;
  }
  else
  {
    AkelPad.SendMessage(hEditWnd, 3228 /*AEM_SETOPTIONS*/, 2 /*AECOOP_OR*/, nAECO_flag);
    AkelPad.SendMessage(hToolbar, 1026 /*TB_CHECKBUTTON*/, nButtonID, true);

    if (! (nCaretOptions & nCO_flag))
      nCaretOptions = nCaretOptions | nCO_flag;
  }

  AkelPad.SetFrameInfo(0, 17 /*FIS_CARETOPTIONS*/, nCaretOptions);
}
