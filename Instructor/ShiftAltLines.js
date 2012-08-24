// http://akelpad.sourceforge.net/forum/viewtopic.php?p=9209#9209
// Version v1.0
//
//
//// Change alternating lines size.
//
// How to use:
//
// -"Increase alt line" Call("Scripts::Main", 1, "ShiftAltLines.js", `+1`)
// -"Decrease alt line" Call("Scripts::Main", 1, "ShiftAltLines.js", `-1`)
// -"Set alt line to 3" Call("Scripts::Main", 1, "ShiftAltLines.js", `3`)
// -"Set alt line to 3 locally" Call("Scripts::Main", 1, "ShiftAltLines.js", `3 -Local=true`)
//
//
//// Изменить размер зебры на указанную величину.
//
// Как использовать:
//
// -"Увеличить зебру" Call("Scripts::Main", 1, "ShiftAltLines.js", `+1`)
// -"Уменьшить зебру" Call("Scripts::Main", 1, "ShiftAltLines.js", `-1`)
// -"Установить 3 строки в зебре" Call("Scripts::Main", 1, "ShiftAltLines.js", `3`)
// -"Установить 3 строки в зебре локально" Call("Scripts::Main", 1, "ShiftAltLines.js", `3 -Local=true`)


//Arguments
var chSign="";
var nMove=0;
var bLocal=AkelPad.GetArgValue("Local", false);
if (WScript.Arguments.length >= 1)
{
  chSign=WScript.Arguments(0).substr(0, 1);
  nMove=parseInt(WScript.Arguments(0));
}
else WScript.Quit();

//Variables
var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var dwAltLineSkip;

if (hMainWnd)
{
  if (bLocal)
  {
    if (chSign == '+' || chSign == '-')
      dwAltLineSkip=LOWORD(AkelPad.SendMessage(hWndEdit, 3264 /*AEM_GETALTLINE*/, 0, 0)) + nMove;
    else
      dwAltLineSkip=nMove;

    if (dwAltLineSkip >= 0)
      AkelPad.SendMessage(hWndEdit, 3265 /*AEM_SETALTLINE*/, MAKELONG(dwAltLineSkip, dwAltLineSkip), 0);
  }
  else
  {
    if (chSign == '+' || chSign == '-')
      dwAltLineSkip=AkelPad.SendMessage(hMainWnd, 1223 /*AKD_GETFRAMEINFO*/, 73 /*FI_ALTLINEFILL*/, 0) + nMove;
    else
      dwAltLineSkip=nMove;

    if (dwAltLineSkip >= 0)
      AkelPad.SetFrameInfo(0, 21 /*FIS_ALTLINES*/, MAKELONG(dwAltLineSkip, dwAltLineSkip));
  }
}

function LOWORD(dwNumber)
{
  return (dwNumber & 0xffff);
}

function HIWORD(dwNumber)
{
  return (dwNumber >> 16);
}

function MAKELONG(a, b)
{
  return (a & 0xffff) | ((b & 0xffff) << 16);
}
