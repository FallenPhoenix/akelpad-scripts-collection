// http://akelpad.sourceforge.net/forum/viewtopic.php?p=5727#5727
// Version v1.1
//
//
//// Active column show/hide.
//
// How to use:
// Add button to Toolbar plugin:
//
// -"Active column" Call("Scripts::Main", 1, "ActiveColumnSwitch.js", `"%m" "%i"`) Icon(0)
// -"Local active column" Call("Scripts::Main", 1, "ActiveColumnSwitch.js", `"%m" "%i" -Local=true`)
//
/// Включить/выключить активный столбец.
//
// Как использовать:
// Добавляем кнопку в Toolbar плагин:
//
// -"Активный столбец" Call("Scripts::Main", 1, "ActiveColumnSwitch.js", `"%m" "%i"`) Icon(0)
// -"Активный столбец локально" Call("Scripts::Main", 1, "ActiveColumnSwitch.js", `"%m" "%i" -Local=true`)


//Arguments
var hToolbarHandle=0;
var nToolbarItemID=0;
if (WScript.Arguments.length >= 2)
{
  hToolbarHandle=parseInt(WScript.Arguments(0));
  nToolbarItemID=parseInt(WScript.Arguments(1));
}
var bLocal=AkelPad.GetArgValue("Local", false);

//Variables
var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var dwOptions;
var bCheckButton=true;

if (hWndEdit)
{
  if (bLocal)
  {
    dwOptions=AkelPad.SendMessage(hWndEdit, 3227 /*AEM_GETOPTIONS*/, 0, 0);
    if (dwOptions & 0x400 /*AECO_ACTIVECOLUMN*/)
    {
      AkelPad.SendMessage(hWndEdit, 3228 /*AEM_SETOPTIONS*/, 4 /*AECOOP_XOR*/, 0x400 /*AECO_ACTIVECOLUMN*/);
      bCheckButton=false;
    }
    else AkelPad.SendMessage(hWndEdit, 3228 /*AEM_SETOPTIONS*/, 2 /*AECOOP_OR*/, 0x400 /*AECO_ACTIVECOLUMN*/);
  }
  else
  {
    dwOptions=AkelPad.SendMessage(hMainWnd, 1223 /*AKD_GETFRAMEINFO*/, 69 /*FI_CARETOPTIONS*/, 0);
    if (dwOptions & 0x2 /*CO_CARETVERTLINE*/)
    {
      dwOptions&=~0x2 /*CO_CARETVERTLINE*/;
      bCheckButton=false;
    }
    else dwOptions|=0x2 /*CO_CARETVERTLINE*/;

    AkelPad.SetFrameInfo(0, 17 /*FIS_CARETOPTIONS*/, dwOptions);
  }

  if (hToolbarHandle && nToolbarItemID)
    AkelPad.SendMessage(hToolbarHandle, 1026 /*TB_CHECKBUTTON*/, nToolbarItemID, bCheckButton);
}
