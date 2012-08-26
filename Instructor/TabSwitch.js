// Switch between tabs.
// Version v2.8
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=4368#4368
//
// Arguments:
// -Next=true      -Forward switch (default is false).
// -CtrlTab=false  -No Ctrl+Tab hotkey is assigned to TabSwitch.js (default is true).
// -MinTabs=2      -Minimum number of tabs before switch window appeared (default is 2).
// -TabIndex=0     -Activate tab by specified index. If used, all other arguments ignored.
//
// Examples:
// -"Normal switch (Ctrl+Tab)" Call("Scripts::Main", 1, "TabSwitch.js")
// -"Forward switch (Ctrl+Shift+Tab)" Call("Scripts::Main", 1, "TabSwitch.js", `-Next=true`)
// -"Normal switch (no Ctrl+Tab hotkey)" Call("Scripts::Main", 1, "TabSwitch.js", `-CtrlTab=false`)
// -"Tab1 (Alt+1)" Call("Scripts::Main", 1, "TabSwitch.js", `-TabIndex=0`)
// -"Tab2 (Alt+2)" Call("Scripts::Main", 1, "TabSwitch.js", `-TabIndex=1`)

//Arguments
var bNext=AkelPad.GetArgValue("Next", false);
var bCtrlTab=AkelPad.GetArgValue("CtrlTab", true);
var nMinTabs=AkelPad.GetArgValue("MinTabs", 2);
var nTabIndex=AkelPad.GetArgValue("TabIndex", -1);

//Variables
var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var oSys=AkelPad.SystemFunction();
var hInstanceDLL=AkelPad.GetInstanceDll();
var pClassName="AkelPad::Scripts::" + WScript.ScriptName + "::" + hInstanceDLL;
var hWndContainer=0;
var hWndListBox=0;
var hSubClass;
var hDC;
var hBrushHollow;
var hFontEdit;
var lpFrameList=[];
var rcMain=[];
var nItemHeight=0;
var nControlHeight=0;
var nWidth;
var nMaxWidth=0;
var nIconSize=16;
var nIconGap=2;
var i;

if (hMainWnd)
{
  if (nTabIndex >= 0)
  {
    var hWndTab;
    var lpFrame;

    hWndTab=oSys.Call("user32::GetDlgItem", hMainWnd, 10003 /*ID_TAB*/);
    if (lpFrame=AkelPad.SendMessage(hMainWnd, 1288 /*AKD_FRAMEFIND*/, 8 /*FWF_BYTABINDEX*/, nTabIndex))
      oSys.Call("user32::PostMessage" + _TCHAR, hMainWnd, 1285 /*AKD_FRAMEACTIVATE*/, 0, lpFrame);
    WScript.Quit();
  }

  //Get list of documents
  GetFrameList(lpFrameList);

  if (lpFrameList.length >= nMinTabs && lpFrameList.length > 0)
  {
    if (bCtrlTab)
    {
      if (!(oSys.Call("user32::GetKeyState", 0x11 /*VK_CONTROL*/) & 0x8000))
      {
        //Ctrl already released
        if (lpFrameList.length >= 2)
        {
          i=bNext?lpFrameList.length - 1:1;
          oSys.Call("user32::PostMessage" + _TCHAR, hMainWnd, 1285 /*AKD_FRAMEACTIVATE*/, 0, lpFrameList[i][1]);
        }
        WScript.Quit();
      }
    }

    //Get maximum string width
    hFontEdit=AkelPad.SendMessage(hWndEdit, 0x31 /*WM_GETFONT*/, 0, 0);

    if (lpSize=AkelPad.MemAlloc(8 /*sizeof(SIZE)*/))
    {
      if (hDC=oSys.Call("user32::GetDC", hWndEdit))
      {
        oSys.Call("gdi32::SelectObject", hDC, hFontEdit);

        for (i=0; i < lpFrameList.length; ++i)
        {
          if (oSys.Call("gdi32::GetTextExtentPoint32" + _TCHAR, hDC, lpFrameList[i][0], lpFrameList[i][0].length, lpSize))
          {
            nWidth=AkelPad.MemRead(lpSize /*SIZE.cx*/, 3 /*DT_DWORD*/);
            if (nWidth > nMaxWidth) nMaxWidth=nWidth;
          }
        }

        oSys.Call("user32::ReleaseDC", hWndEdit, hDC);
      }
      nMaxWidth+=nIconSize + nIconGap + 16;

      AkelPad.MemFree(lpSize);
    }

    //Create dialog
    if (AkelPad.WindowRegisterClass(pClassName))
    {
      if (hWndContainer=oSys.Call("user32::CreateWindowEx" + _TCHAR, 0, pClassName, 0, bCtrlTab?0x40000000 /*WS_CHILD*/:0x80000000 /*WS_POPUP*/, 0, 0, 0, 0, hMainWnd, 0, hInstanceDLL, DialogCallback))
      {
        if (hWndListBox=oSys.Call("user32::CreateWindowEx" + _TCHAR, 0, "LISTBOX", 0, 0x50400010 /*WS_VISIBLE|WS_CHILD|WS_DLGFRAME|LBS_OWNERDRAWFIXED*/, 0, 0, 0, 0, hWndContainer, 0, hInstanceDLL, 0))
        {
          //Make hWndContainer invisible
          hBrushHollow=oSys.Call("gdi32::GetStockObject", 5 /*HOLLOW_BRUSH*/);
          oSys.Call("user32::SetClassLong" + _TCHAR, hWndContainer, -10 /*GCL_HBRBACKGROUND*/, hBrushHollow);

          oSys.Call("user32::SetFocus", hWndListBox);
          AkelPad.SendMessage(hWndListBox, 48 /*WM_SETFONT*/, hFontEdit, 1);
          nItemHeight=AkelPad.SendMessage(hWndEdit, 3188 /*AEM_GETCHARSIZE*/, 0 /*AECS_HEIGHT*/, 0) - AkelPad.SendMessage(hWndEdit, 3259 /*AEM_GETLINEGAP*/, 0, 0);
          i=AkelPad.SendMessage(hWndListBox, 0x1A1 /*LB_GETITEMHEIGHT*/, 0, 0);
          if (nItemHeight < i)
            nItemHeight=i;
          else
            AkelPad.SendMessage(hWndListBox, 0x1A0 /*LB_SETITEMHEIGHT*/, 0, nItemHeight);
          nControlHeight=lpFrameList.length * nItemHeight + oSys.Call("user32::GetSystemMetrics", 8 /*SM_CYDLGFRAME*/) * 2;

          //Fill listbox
          for (i=0; i < lpFrameList.length; ++i)
          {
            oSys.Call("user32::SendMessage" + _TCHAR, hWndListBox, 0x180 /*LB_ADDSTRING*/, 0, lpFrameList[i][0]);
          }
          if (lpFrameList.length >= 2)
            i=bNext?lpFrameList.length - 1:1;
          else
            i=0;
          AkelPad.SendMessage(hWndListBox, 0x186 /*LB_SETCURSEL*/, i, 0);

          GetWindowPos(hMainWnd, 0, rcMain);
          rcMain.left=rcMain.right / 2 - nMaxWidth / 2;
          if (rcMain.left < 0) rcMain.left=0;
          rcMain.top=rcMain.bottom / 2 - nControlHeight / 2;
          if (rcMain.top < 0) rcMain.top=0;
          oSys.Call("user32::SetWindowPos", hWndContainer, 0, rcMain.left, rcMain.top, nMaxWidth, nControlHeight, 0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
          oSys.Call("user32::SetWindowPos", hWndListBox, 0, 0, 0, nMaxWidth, nControlHeight, 0x16 /*SWP_NOMOVE|SWP_NOZORDER|SWP_NOACTIVATE*/);
          oSys.Call("user32::ShowWindow", hWndContainer, 5 /*SW_SHOW*/);
          oSys.Call("user32::UpdateWindow", hMainWnd);

          if (hSubClass=AkelPad.WindowSubClass(hWndListBox, ListBoxCallback, 0x87 /*WM_GETDLGCODE*/, 0x100 /*WM_KEYDOWN*/, 0x101 /*WM_KEYUP*/, 0x203 /*WM_LBUTTONDBLCLK*/, 0x8 /*WM_KILLFOCUS*/))
          {
            //Message loop
            AkelPad.WindowGetMessage();

            AkelPad.WindowUnsubClass(hWndListBox);
          }

          i=AkelPad.SendMessage(hWndListBox, 0x188 /*LB_GETCURSEL*/, 0, 0);
          oSys.Call("user32::PostMessage" + _TCHAR, hMainWnd, 1285 /*AKD_FRAMEACTIVATE*/, 0, lpFrameList[i][1]);

          //oSys.Call("user32::DestroyWindow", hWndListBox);
        }
        oSys.Call("user32::DestroyWindow", hWndContainer);
      }
      AkelPad.WindowUnregisterClass(pClassName);
    }
  }
}

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 0x2B)  //WM_DRAWITEM
  {
    var hDC;
    var hIcon;
    var nItemID;
    var nItemState;
    var lpItem;
    var rcItem=[];
    var crText;
    var crBk;
    var hBrushBk;
    var nModeBkOld;

    hDC=AkelPad.MemRead(lParam + (_X64?32:24) /*offsetof(DRAWITEMSTRUCT, hDC)*/, 2 /*DT_QWORD*/);
    nItemID=AkelPad.MemRead(lParam + (_X64?8:8) /*offsetof(DRAWITEMSTRUCT, itemID)*/, 3 /*DT_DWORD*/);
    nItemState=AkelPad.MemRead(lParam + (_X64?16:16) /*offsetof(DRAWITEMSTRUCT, itemState)*/, 3 /*DT_DWORD*/);
    lpItem=lParam + (_X64?40:28) /*offsetof(DRAWITEMSTRUCT, rcItem)*/;
    RectToArray(lpItem, rcItem);

    //Set background
    if (nItemState & 0x1 /*ODS_SELECTED*/)
    {
      crText=oSys.Call("user32::GetSysColor", 14 /*COLOR_HIGHLIGHTTEXT*/);
      crBk=oSys.Call("user32::GetSysColor", 13 /*COLOR_HIGHLIGHT*/);
      hBrushBk=oSys.Call("user32::GetSysColorBrush", 13 /*COLOR_HIGHLIGHT*/);
    }
    else
    {
      crText=oSys.Call("user32::GetSysColor", 8 /*COLOR_WINDOWTEXT*/);
      crBk=oSys.Call("user32::GetSysColor", 5 /*COLOR_WINDOW*/);
      hBrushBk=oSys.Call("user32::GetSysColorBrush", 5 /*COLOR_WINDOW*/);
    }
    oSys.Call("user32::FillRect", hDC, lpItem, hBrushBk);
    nModeBkOld=oSys.Call("gdi32::SetBkMode", hDC, 1 /*TRANSPARENT*/);

    //Draw icon
    hIcon=AkelPad.MemRead(lpFrameList[nItemID][1] + (_X64?944:876) /*offsetof(FRAMEDATA, hIcon)*/, 2 /*DT_QWORD*/);
    oSys.Call("user32::DrawIconEx", hDC, rcItem.left, rcItem.top + (rcItem.bottom - rcItem.top) / 2 - nIconSize / 2, hIcon, nIconSize, nIconSize, 0, 0, 0x3 /*DI_NORMAL*/);

    //Draw text
    oSys.Call("gdi32::SetTextColor", hDC, crText);
    oSys.Call("gdi32::SetBkColor", hDC, crBk);
    oSys.Call("gdi32::TextOut" + _TCHAR, hDC, rcItem.left + nIconSize + nIconGap, rcItem.top, lpFrameList[nItemID][0], lpFrameList[nItemID][0].length);

    oSys.Call("gdi32::SetBkMode", hDC, nModeBkOld);
  }
  return 0;
}

function ListBoxCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 0x87) //WM_GETDLGCODE
  {
    AkelPad.WindowNoNextProc(hSubClass);
    return 0x4 /*DLGC_WANTALLKEYS*/;
  }
  else if (uMsg == 0x100) //WM_KEYDOWN
  {
    if (wParam == 0x43 /*c*/)
    {
      if (bCtrlTab || (oSys.Call("user32::GetKeyState", 0x11 /*VK_CONTROL*/) & 0x8000))
      {
        i=AkelPad.SendMessage(hWndListBox, 0x188 /*LB_GETCURSEL*/, 0, 0);
        AkelPad.SetClipboardText(lpFrameList[i][0]);
      }
    }
    else if (wParam == 0x9 /*VK_TAB*/)
    {
      var nCount;

      nCount=AkelPad.SendMessage(hWndListBox, 0x18B /*LB_GETCOUNT*/, 0, 0);
      i=AkelPad.SendMessage(hWndListBox, 0x188 /*LB_GETCURSEL*/, 0, 0);

      if (!(oSys.Call("user32::GetKeyState", 0x10 /*VK_SHIFT*/) & 0x8000))
      {
        if (i + 1 >= nCount)
          i=0;
        else
          ++i;
      }
      else
      {
        if (i - 1 < 0)
          i=nCount - 1;
        else
          --i;
      }
      AkelPad.SendMessage(hWndListBox, 0x186 /*LB_SETCURSEL*/, i, 0);
    }
    else if (wParam == 0xD /*VK_RETURN*/)
    {
      //Exit message loop
      oSys.Call("user32::PostQuitMessage", 0);
    }
    else if (wParam == 0x1B /*VK_ESCAPE*/)
    {
      //Restore to current file
      AkelPad.SendMessage(hWndListBox, 0x186 /*LB_SETCURSEL*/, 0, 0);

      //Exit message loop
      oSys.Call("user32::PostQuitMessage", 0);
    }
  }
  else if (uMsg == 0x101) //WM_KEYUP
  {
    if (wParam == 0x11 /*VK_CONTROL*/)
    {
      if (bCtrlTab)
      {
        //Exit message loop
        oSys.Call("user32::PostQuitMessage", 0);
      }
    }
  }
  else if (uMsg == 0x203) //WM_LBUTTONDBLCLK
  {
    var lResult=AkelPad.SendMessage(hWndListBox, 0x01A9 /*LB_ITEMFROMPOINT*/, 0, lParam);

    if (HIWORD(lResult) == 0)
      AkelPad.SendMessage(hWndListBox, 0x186 /*LB_SETCURSEL*/, LOWORD(lResult), 0);

    //Exit message loop
    oSys.Call("user32::PostQuitMessage", 0);
  }
  else if (uMsg == 0x8)  //WM_KILLFOCUS
  {
    //Restore to current file
    AkelPad.SendMessage(hWndListBox, 0x186 /*LB_SETCURSEL*/, 0, 0);

    //Exit message loop
    oSys.Call("user32::PostQuitMessage", 0);
  }
}

function GetFrameList(lpFrameList)
{
  var lpInitFrame;
  var lpFrame;
  var i;

  lpInitFrame=AkelPad.SendMessage(hMainWnd, 1288 /*AKD_FRAMEFIND*/, 1 /*FWF_CURRENT*/, 0);
  lpFrame=lpInitFrame;

  for (i=0; lpFrame; ++i)
  {
    lpFrameList[i]=[0, 0];
    lpFrameList[i][0]=AkelPad.MemRead(lpFrame + (_X64?420:352) /*offsetof(FRAMEDATA, wszFile)*/, 1 /*DT_UNICODE*/);
    lpFrameList[i][1]=lpFrame;

    lpFrame=AkelPad.SendMessage(hMainWnd, 1288 /*AKD_FRAMEFIND*/, 3 /*FWF_PREV*/, lpFrame);
    if (lpFrame == lpInitFrame) break;
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

function GetWindowPos(hWnd, hWndOwner, rcRect)
{
  var lpRect;
  var bResult=false;

  //Get rect
  if (lpRect=AkelPad.MemAlloc(16 /*sizeof(RECT)*/))
  {
    if (oSys.Call("user32::GetWindowRect", hWnd, lpRect))
    {
      RectToArray(lpRect, rcRect);
      rcRect.right-=rcRect.left;
      rcRect.bottom-=rcRect.top;

      if (hWndOwner)
        bResult=oSys.Call("user32::ScreenToClient", hWndOwner, lpRect);
      else
        bResult=true;
      rcRect.left=AkelPad.MemRead(lpRect, 3 /*DT_DWORD*/);
      rcRect.top=AkelPad.MemRead(lpRect + 4, 3 /*DT_DWORD*/);
    }
    AkelPad.MemFree(lpRect);
  }
  return bResult;
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
