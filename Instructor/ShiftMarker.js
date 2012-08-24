// http://akelpad.sourceforge.net/forum/viewtopic.php?p=9209#9209
// Version v1.6
//
//
//// Shift marker position at specified offset.
//
// How to use:
//
// -"Increase marker" Call("Scripts::Main", 1, "ShiftMarker.js", `+10`)
// -"Decrease marker" Call("Scripts::Main", 1, "ShiftMarker.js", `-10`)
// -"Set marker to 80" Call("Scripts::Main", 1, "ShiftMarker.js", `80`)
// -"Set marker to 80 locally" Call("Scripts::Main", 1, "ShiftMarker.js", `80 -Local=true`)
//
//
//// Сместить позицию маркера на указанную величину.
//
// Как использовать:
//
// -"Увеличить маркер" Call("Scripts::Main", 1, "ShiftMarker.js", `+10`)
// -"Уменьшить маркер" Call("Scripts::Main", 1, "ShiftMarker.js", `-10`)
// -"Установить маркер на позиции 80" Call("Scripts::Main", 1, "ShiftMarker.js", `80`)
// -"Установить маркер на позиции 80 локально" Call("Scripts::Main", 1, "ShiftMarker.js", `80 -Local=true`)


//Arguments
var chSign="";
var nMarkerMove=0;
var bLocal=AkelPad.GetArgValue("Local", false);
if (WScript.Arguments.length >= 1)
{
  chSign=WScript.Arguments(0).substr(0, 1);
  nMarkerMove=parseInt(WScript.Arguments(0));
}
else WScript.Quit();

//Variables
var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var nMarkerPos;

if (hMainWnd)
{
  if (bLocal)
  {
    if (chSign == '+' || chSign == '-')
      nMarkerPos=AkelPad.SendMessage(hWndEdit, 3257 /*AEM_GETMARKER*/, 0, 0) + nMarkerMove;
    else
      nMarkerPos=nMarkerMove;
    AkelPad.SendMessage(hWndEdit, 3258 /*AEM_SETMARKER*/, 1 /*AEMT_SYMBOL*/, nMarkerPos);
  }
  else
  {
    if (chSign == '+' || chSign == '-')
      nMarkerPos=AkelPad.SendMessage(hMainWnd, 1223 /*AKD_GETFRAMEINFO*/, 64 /*FI_MARKER*/, 0) + nMarkerMove;
    else
      nMarkerPos=nMarkerMove;
    AkelPad.SetFrameInfo(0, 12 /*FIS_MARKER*/, nMarkerPos);
  }
}
