// http://akelpad.sourceforge.net/forum/viewtopic.php?p=4050#4050
// Version v1.0
//
//
//// Undo all changes

var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var oSys=AkelPad.SystemFunction();

if (hMainWnd && hWndEdit)
{
  if (AkelPad.SendMessage(hWndEdit, 3086 /*AEM_GETMODIFY*/, 0, 0))
  {
    SetRedraw(hWndEdit, false);
    AkelPad.SendMessage(hWndEdit, 3185 /*AEM_LOCKSCROLL*/, 3 /*SB_BOTH*/, true);
  
    while (AkelPad.SendMessage(hWndEdit, 3075 /*AEM_CANUNDO*/, 0, 0))
    {
      if (!AkelPad.SendMessage(hWndEdit, 3086 /*AEM_GETMODIFY*/, 0, 0))
        break;
      AkelPad.SendMessage(hWndEdit, 3077 /*AEM_UNDO*/, 0, 0);
    }
    AkelPad.SendMessage(hWndEdit, 3185 /*AEM_LOCKSCROLL*/, 3 /*SB_BOTH*/, false);
    SetRedraw(hWndEdit, true);
  }
}

function SetRedraw(hWnd, bRedraw)
{
  AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
  if (bRedraw) oSys.Call("user32::InvalidateRect", hWnd, 0, true);
}
