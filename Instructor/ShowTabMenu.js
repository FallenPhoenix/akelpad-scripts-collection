// http://akelpad.sourceforge.net/forum/viewtopic.php?p=13970#13970
// Version v1.0
//
//
//// Show menu for current tab window.

//Variables
var hMainWnd=AkelPad.GetMainWnd();
var oSys=AkelPad.SystemFunction();
var hWndTab;
var nCurSel;
var lpRect;
var rcRect=[];

if (hWndTab=oSys.Call("user32::GetDlgItem", hMainWnd, 10003 /*ID_TAB*/))
{
  if (oSys.Call("user32::IsWindowVisible", hWndTab))
  {
    nCurSel=AkelPad.SendMessage(hWndTab, 4875 /*TCM_GETCURSEL*/, 0, 0);

    if (lpRect=AkelPad.MemAlloc(16 /*sizeof(RECT)*/))
    {
      if (AkelPad.SendMessage(hWndTab, 4874 /*TCM_GETITEMRECT*/, nCurSel, lpRect))
      {
        //Screen
        oSys.Call("user32::ClientToScreen", hWndTab, lpRect + 0 /*offsetof(RECT, left)*/);
        oSys.Call("user32::ClientToScreen", hWndTab, lpRect + 8 /*offsetof(RECT, right)*/);
        RectToArray(lpRect, rcRect);
        oSys.Call("user32::SetCursorPos", rcRect.left + (rcRect.right - rcRect.left) / 2, rcRect.top + (rcRect.bottom - rcRect.top) / 2);

        //Client
        oSys.Call("user32::GetCursorPos", lpRect + 0 /*offsetof(RECT, left)*/);
        oSys.Call("user32::ScreenToClient", hWndTab, lpRect + 0 /*offsetof(RECT, left)*/);
        RectToArray(lpRect, rcRect);

        //Button down
        oSys.Call("user32::PostMessage" + _TCHAR, hWndTab, 0x0204 /*WM_RBUTTONDOWN*/, 0x2 /*MK_RBUTTON*/, MAKELONG(rcRect.left, rcRect.top));
        oSys.Call("user32::PostMessage" + _TCHAR, hWndTab, 0x0205 /*WM_RBUTTONUP*/, 0, MAKELONG(rcRect.left, rcRect.top));
      }
      AkelPad.MemFree(lpRect);
    }
  }
}

function RectToArray(lpRect, rcRect)
{
  rcRect.left=AkelPad.MemRead(lpRect, 3 /*DT_DWORD*/);
  rcRect.top=AkelPad.MemRead(lpRect + 4, 3 /*DT_DWORD*/);
  rcRect.right=AkelPad.MemRead(lpRect + 8, 3 /*DT_DWORD*/);
  rcRect.bottom=AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/);
  return rcRect;
}

function MAKELONG(a, b)
{
  return (a & 0xffff) | ((b & 0xffff) << 16);
}
