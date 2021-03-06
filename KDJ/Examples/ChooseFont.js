// Examples of use ChooseFont function - 2013-08-14 (x86/x64)
//
// Usage:
// Call("Scripts::Main", 1, "ChooseFont_examples.js")
// Required to include: ChooseFont_function.js

if (! AkelPad.Include("ChooseFont_function.js"))
  WScript.Quit();

var oSys = AkelPad.SystemFunction();

WScript.Echo("Example 1\nChange font in AkelPad edit window.\nChooseFont displays only fixed-width fonts.");
Example1();

WScript.Echo("Example 2\nChange font in AkelPad edit window, another method.\nChooseFont displays all fonts.");
Example2();

WScript.Echo("Example 3\nChange font in AkelPad status bar.\nChooseFont displays effects.");
Example3();

WScript.Echo("Example 4\nOpens ContextMenu plugin dialog and change font in edit control.\nChooseFont displays effects.");
Example4();

function Example1()
{
  //Example 1.
  //Change font in AkelPad edit window.
  //ChooseFont displays only fixed-width fonts.

  var hMainWnd  = AkelPad.GetMainWnd();
  var hEditWnd  = AkelPad.GetEditWnd();
  var lpLOGFONT = ChooseFont(hMainWnd, 4, hEditWnd, 0, 1, 1);

  if (lpLOGFONT)
    SendMessage(hMainWnd, 1234 /*AKD_SETFONT*/, 0, lpLOGFONT);

  AkelPad.MemFree(lpLOGFONT);
}

function Example2()
{
  //Example 2.
  //Change font in AkelPad edit window, another method.
  //ChooseFont displays all fonts.

  var hMainWnd = AkelPad.GetMainWnd();
  var hEditWnd = AkelPad.GetEditWnd();
  var aFont    = ChooseFont(hMainWnd, 4, hEditWnd, 0, 0, 3);

  if (aFont)
    AkelPad.Font(aFont[0], aFont[1], aFont[2]);
}

function Example3()
{
  //Example 3.
  //Change font in AkelPad status bar.
  //ChooseFont displays effects.

  var hMainWnd = AkelPad.GetMainWnd();
  var hStatBar = AkelPad.SystemFunction().Call("user32::FindWindowExW", hMainWnd, 0, "msctls_statusbar32" , 0);
  var hFont;

  if (hStatBar)
  {
    if (hFont = ChooseFont(hMainWnd, 4, hStatBar, 1, 0, 2))
      SendMessage(hStatBar, 48 /*WM_SETFONT*/, hFont, true);
  }
}

function Example4()
{
  //Example 4.
  //Opens ContextMenu plugin dialog and change font in edit control.
  //ChooseFont displays effects.

  var sPlugWndName = "ContextMenu ";
  var nStopTime    = new Date().getTime() + 2000;
  var hPlugWnd;
  var hCtrlWnd;
  var hFont;

  if (AkelPad.GetLangId(1 /*LANGID_PRIMARY*/) == 0x19 /*LANG_RUSSIAN*/)
    sPlugWndName += "плагин";
  else
    sPlugWndName += "plugin";

  AkelPad.Call("ContextMenu::Main", 1, 1);

  while(! (hPlugWnd = oSys.Call("user32::FindWindowW", 0, sPlugWndName)) ||
        ! (hCtrlWnd = oSys.Call("user32::FindWindowExW", hPlugWnd, 0, "RichEdit20W", 0)))
  {
    if (new Date().getTime() > nStopTime)
      return;
    WScript.Sleep(5);
  }

  WScript.Sleep(100);

  if (hFont = ChooseFont(hPlugWnd, 4, hCtrlWnd, 1, 0, 2))
    SendMessage(hCtrlWnd, 48 /*WM_SETFONT*/, hFont, true);
}

function SendMessage(hWnd, uMsg, wParam, lParam)
{
  return oSys.Call("User32::SendMessageW", hWnd, uMsg, wParam, lParam);
}
