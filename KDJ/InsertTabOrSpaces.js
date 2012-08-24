// InsertTabOrSpaces.js - 2011-12-05
//
// Inserts tab or spaces, inversely to setting bTabStopAsSpaces.
//
// Call("Scripts::Main", 1, "InsertTabOrSpaces.js")
//
// Can assign shortcut key, eg: Ctrl+Alt+Tab

var hMainWnd = AkelPad.GetMainWnd();
var hEditWnd = AkelPad.GetEditWnd();
var bTabStopAsSpaces;

if (hMainWnd && hEditWnd)
{
  bTabStopAsSpaces = AkelPad.SendMessage(hMainWnd, 1223 /*AKD_GETFRAMEINFO*/, 53 /*FI_TABSTOPASSPACES*/, 0);

  AkelPad.SetFrameInfo(0, 2 /*FIS_TABSTOPASSPACES*/, (! bTabStopAsSpaces));

  AkelPad.Command(4164 /*IDM_EDIT_INSERT_TAB*/);

  AkelPad.SetFrameInfo(0, 2 /*FIS_TABSTOPASSPACES*/, bTabStopAsSpaces);
}
