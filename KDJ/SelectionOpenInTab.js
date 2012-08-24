// SelectionOpenInTab.js - ver. 2012-04-14
//
// Open selected text in new tab.
//
// Call("Scripts::Main", 1, "SelectionOpenInTab.js")
// Can assign shortcut key, eg: Shift+Alt+N

var pSelTxt;
if (AkelPad.GetEditWnd() && (AkelPad.IsMDI() > 0) && (pSelTxt = AkelPad.GetSelText()))
{
  AkelPad.SendMessage(AkelPad.GetMainWnd(), 273 /*WM_COMMAND*/, 4101 /*wParam=MAKEWPARAM(0,IDM_FILE_NEW)*/, 1 /*lParam=TRUE*/);
  AkelPad.ReplaceSel(pSelTxt);
}
