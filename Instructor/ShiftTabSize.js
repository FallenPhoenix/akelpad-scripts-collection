// http://akelpad.sourceforge.net/forum/viewtopic.php?p=9209#9209
// Version v1.7
//
//
//// Shift tabulation size at specified offset.
//
// How to use:
//
// -"Increase tab" Call("Scripts::Main", 1, "ShiftTabSize.js", `+2`)
// -"Decrease tab" Call("Scripts::Main", 1, "ShiftTabSize.js", `-2`)
// -"Set tab to 8" Call("Scripts::Main", 1, "ShiftTabSize.js", `8`)
// -"Set tab to 8 locally" Call("Scripts::Main", 1, "ShiftTabSize.js", `8 -Local=true`)
//
//
//// Изменить размер табуляции на указанную величину.
//
// Как использовать:
//
// -"Увеличить таб" Call("Scripts::Main", 1, "ShiftTabSize.js", `+2`)
// -"Уменьшить таб" Call("Scripts::Main", 1, "ShiftTabSize.js", `-2`)
// -"Установить таб размером 8" Call("Scripts::Main", 1, "ShiftTabSize.js", `8`)
// -"Установить таб размером 8 локально" Call("Scripts::Main", 1, "ShiftTabSize.js", `8 -Local=true`)


//Arguments
var chSign="";
var nTabMove=0;
var bLocal=AkelPad.GetArgValue("Local", false);
if (WScript.Arguments.length >= 1)
{
  chSign=WScript.Arguments(0).substr(0, 1);
  nTabMove=parseInt(WScript.Arguments(0));
}
else WScript.Quit();

//Variables
var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var nTabSize;

if (hMainWnd)
{
  if (bLocal)
  {
    if (chSign == '+' || chSign == '-')
      nTabSize=AkelPad.SendMessage(hWndEdit, 3239 /*AEM_GETTABSTOP*/, 0, 0) + nTabMove;
    else
      nTabSize=nTabMove;
    if (nTabSize > 0)
      AkelPad.SendMessage(hWndEdit, 3240 /*AEM_SETTABSTOP*/, nTabSize, 0);
  }
  else
  {
    if (chSign == '+' || chSign == '-')
      nTabSize=AkelPad.SendMessage(hMainWnd, 1223 /*AKD_GETFRAMEINFO*/, 52 /*FI_TABSTOPSIZE*/, 0) + nTabMove;
    else
      nTabSize=nTabMove;
    if (nTabSize > 0)
      AkelPad.SetFrameInfo(0, 1 /*FIS_TABSTOPSIZE*/, nTabSize);
  }
}
