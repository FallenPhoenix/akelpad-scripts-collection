// http://akelpad.sourceforge.net/forum/viewtopic.php?p=5727#5727
// Version v1.0
//
//
//// Active column show/hide.
//
// How to use:
// Add button to Toolbar plugin:
//
// -"Active column" Call("Scripts::Main", 1, "ActiveColumnSwitch.js", `"%m" "%i"`) Icon(0)
//
/// Включить/выключить активный столбец.
//
// Как использовать:
// Добавляем кнопку в Toolbar плагин:
//
// -"Активный столбец" Call("Scripts::Main", 1, "ActiveColumnSwitch.js", `"%m" "%i"`) Icon(0)

//Arguments
var nToolbarHandle=0;
var nItemID=0;
if (WScript.Arguments.length >= 2)
{
  nToolbarHandle=parseInt(WScript.Arguments(0));
  nItemID=parseInt(WScript.Arguments(1));
}

var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var dwOptions;

if (hMainWnd && hWndEdit)
{
  dwOptions=AkelPad.SendMessage(hWndEdit, 3227 /*AEM_GETOPTIONS*/, 0, 0);

  if (dwOptions & 0x400 /*AECO_ACTIVECOLUMN*/)
  {
    AkelPad.SendMessage(hWndEdit, 3228 /*AEM_SETOPTIONS*/, 4 /*AECOOP_XOR*/, 0x400 /*AECO_ACTIVECOLUMN*/);
    AkelPad.SendMessage(nToolbarHandle, 1026 /*TB_CHECKBUTTON*/, nItemID, false);
  }
  else
  {
    AkelPad.SendMessage(hWndEdit, 3228 /*AEM_SETOPTIONS*/, 2 /*AECOOP_OR*/, 0x400 /*AECO_ACTIVECOLUMN*/);
    AkelPad.SendMessage(nToolbarHandle, 1026 /*TB_CHECKBUTTON*/, nItemID, true);
  }
}
