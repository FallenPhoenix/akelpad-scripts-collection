// EnumerateWindows_functions.js - ver. 2013-04-07
//
// Contains functions:
// EnumTopLevelWindows()
// EnumChildWindows()
//
// Usage in script:
// if (! AkelPad.Include("EnumerateWindows_functions.js")) WScript.Quit();

//----------------------------------------------------------------------------------------------------
// aWndTop = EnumTopLevelWindows(nTitle, nVisible, nMinimized, nMaximized, nSize, nTopMost, nToolWin);
//
// Arguments:
// nTitle     - determines, whether the window contains the title,
// nVisible   - whether the window is visible,
// nMinimized - whether the window is minimized,
// nMaximized - whether the window is maximized,
// nSize      - whether the window have non zero size.
// nTopMost   - whether the window is top-most.
// nToolWin   - whether the window is tool window.
// Arguments can have the following value:
// 0 - no,
// 1 - yes,
// 2 - all windows, argument is ignored.
//
// Return value:
// Array of objects. Each element of array contains information about a single window:
// aWnd[n].Handle    - handle to window (number),
// aWnd[n].Menu      - handle to menu assigned to the window (number),
// aWnd[n].Title     - title of window (string),
// aWnd[n].Visible   - is window visible (bool),
// aWnd[n].Minimized - is window minimized (bool),
// aWnd[n].Maximized - is window maximized (bool),
// aWnd[n].X         - left-top corner x position (number),
// aWnd[n].Y         - left-top corner y position (number),
// aWnd[n].W         - window width (number),
// aWnd[n].H         - window height (number),
// aWnd[n].TopMost   - is window top-most (bool),
// aWnd[n].ToolWin   - is tool window (bool),
// aWnd[n].Class     - name of the window class (string),
// aWnd[n].PID       - identifier of the process, that created the window (number),
// aWnd[n].TID       - identifier of the thread, that created the window (number),
// aWnd[n].FileName  - full file name (with the path) of the process, that created the window (string),
// aWnd[n].BaseName  - file name of the process, that created the window (string).
//-----------------------------------------------------------------------------------------------
function EnumTopLevelWindows(nTitle, nVisible, nMinimized, nMaximized, nSize, nTopMost, nToolWin)
{
  var oSys       = AkelPad.SystemFunction();
  var lpCallback = oSys.RegisterCallback("", EnumCallback", 2);
  var lpEnum     = AkelPad.MemAlloc(4004);
  var lpInfo     = AkelPad.MemAlloc(260 * _TSIZE);
  var aWnd       = [];
  var hWnd;
  var hMenu;
  var bWndOK;
  var sTitle;
  var bVisible;
  var bMinimized;
  var bMaximized;
  var nX;
  var nY;
  var nW;
  var nH;
  var bTopMost;
  var sClass;
  var nPID;
  var nTID;
  var hProcess;
  var sFileName;
  var sBaseName;
  var i;

  AkelPad.MemCopy(lpEnum, 0, 3 /*DT_DWORD*/);

  oSys.Call("User32::EnumWindows", lpCallback, lpEnum);
  oSys.UnregisterCallback(lpCallback);

  for (i = 0; i < AkelPad.MemRead(lpEnum, 3 /*DT_DWORD*/); ++i)
  {
    hWnd  = AkelPad.MemRead(lpEnum + (i + 1) * 4, 3 /*DT_DWORD*/);
    hMenu = oSys.Call("User32::GetMenu", hWnd);

    AkelPad.SendMessage(hWnd, 0x000D /*WM_GETTEXT*/, 260, lpInfo);
    sTitle = AkelPad.MemRead(lpInfo, _TSTR);

    bVisible   = oSys.Call("User32::IsWindowVisible", hWnd);
    bMinimized = oSys.Call("User32::IsIconic", hWnd);
    bMaximized = oSys.Call("User32::IsZoomed", hWnd);

    oSys.Call("User32::GetWindowRect", hWnd, lpInfo);
    nX = AkelPad.MemRead(lpInfo,      3 /*DT_DWORD*/);
    nY = AkelPad.MemRead(lpInfo +  4, 3 /*DT_DWORD*/);
    nW = AkelPad.MemRead(lpInfo +  8, 3 /*DT_DWORD*/) - nX;
    nH = AkelPad.MemRead(lpInfo + 12, 3 /*DT_DWORD*/) - nY;

    bTopMost = oSys.Call("User32::GetWindowLong" + _TCHAR, hWnd, -20 /*GWL_EXSTYLE*/) & 0x00000008 /*WS_EX_TOPMOST*/;
    bToolWin = oSys.Call("User32::GetWindowLong" + _TCHAR, hWnd, -20 /*GWL_EXSTYLE*/) & 0x00000080 /*WS_EX_TOOLWINDOW*/;

    bWndOK = true;
    if (((nTitle == 0)     && sTitle)     || ((nTitle == 1)     && (! sTitle)) ||
        ((nVisible == 0)   && bVisible)   || ((nVisible == 1)   && (! bVisible)) ||
        ((nMinimized == 0) && bMinimized) || ((nMinimized == 1) && (! bMinimized)) ||
        ((nMaximized == 0) && bMaximized) || ((nMaximized == 1) && (! bMaximized)) ||
        ((nSize == 0)      && (nW + nH))  || ((nSize == 1)      && (! (nW + nH))) ||
        ((nTopMost == 0)   && bTopMost)   || ((nTopMost == 1)   && (! bTopMost)) ||
        ((nToolWin == 0)   && bToolWin)   || ((nToolWin == 1)   && (! bToolWin)))
      bWndOK = false;

    if (bWndOK)
    {
      oSys.Call("User32::GetClassName" + _TCHAR, hWnd, lpInfo, 260);
      sClass = AkelPad.MemRead(lpInfo, _TSTR);

      nTID = oSys.Call("User32::GetWindowThreadProcessId", hWnd, lpInfo);
      nPID = AkelPad.MemRead(lpInfo, 3 /*DT_DWORD*/);

      hProcess = oSys.Call("Kernel32::OpenProcess", 0x0410 /*PROCESS_QUERY_INFORMATION|PROCESS_VM_READ*/, 0, nPID);
      oSys.Call("Psapi::GetModuleFileNameEx" + _TCHAR, hProcess, 0, lpInfo, 260);
      sFileName = AkelPad.MemRead(lpInfo, _TSTR);
      oSys.Call("Psapi::GetModuleBaseName" + _TCHAR, hProcess, 0, lpInfo, 260);
      sBaseName = AkelPad.MemRead(lpInfo, _TSTR);
      oSys.Call("Kernel32::CloseHandle", hProcess);

      aWnd[aWnd.length] = {Handle    : hWnd,
                           Menu      : hMenu,
                           Title     : sTitle,
                           Visible   : bVisible,
                           Minimized : bMinimized,
                           Maximized : bMaximized,
                           X         : nX,
                           Y         : nY,
                           W         : nW,
                           H         : nH,
                           TopMost   : bTopMost,
                           ToolWin   : bToolWin,
                           Class     : sClass,
                           PID       : nPID,
                           TID       : nTID,
                           FileName  : sFileName,
                           BaseName  : sBaseName};
    }
  }

  AkelPad.MemFree(lpEnum);
  AkelPad.MemFree(lpInfo);

  return aWnd;

  function EnumCallback(hWnd, lParam)
  {
    AkelPad.MemCopy(lParam, AkelPad.MemRead(lParam, 3 /*DT_DWORD*/) + 1, 3 /*DT_DWORD*/);
    AkelPad.MemCopy(lParam + AkelPad.MemRead(lParam, 3 /*DT_DWORD*/) * 4, hWnd, 3 /*DT_DWORD*/);

    if (AkelPad.MemRead(lParam, 3 /*DT_DWORD*/) < 4000)
      return true;
    else
      return false;
  }
}

//------------------------------------------
// aWndChild = EnumChildWindows(hWndParent);
//
// Argument:
// hWndParent - handle to the parent window whose child windows are to be enumerated.
//
// Return value:
// Array of objects. Each element of array contains information about a single window:
// aWnd[n].Handle  - handle to window (number),
// aWnd[n].Text    - window text (string),
// aWnd[n].Visible - is window visible (bool),
// aWnd[n].Enabled - is window enabled (bool),
// aWnd[n].X       - left-top corner x position (number),
// aWnd[n].Y       - left-top corner y position (number),
// aWnd[n].W       - window width (number),
// aWnd[n].H       - window height (number),
// aWnd[n].Class   - name of the window class (string),
// aWnd[n].Style   - window style (number),
// aWnd[n].ExStyle - window exstyle (number).
// aWnd[n].ID      - window identifier (number).
//-----------------------------------
function EnumChildWindows(hWndParent)
{
  var oSys       = AkelPad.SystemFunction();
  var lpCallback = oSys.RegisterCallback("", EnumTopLevelWindows.EnumCallback", 2);
  var lpEnum     = AkelPad.MemAlloc(4004);
  var lpInfo     = AkelPad.MemAlloc(260 * _TSIZE);
  var aWnd       = [];
  var hWnd;
  var sText;
  var nX;
  var nY;
  var nW;
  var nH;
  var sClass;
  var i;

  AkelPad.MemCopy(lpEnum, 0, 3 /*DT_DWORD*/);

  oSys.Call("User32::EnumChildWindows", hWndParent, lpCallback, lpEnum);
  oSys.UnregisterCallback(lpCallback);

  for (i = 0; i < AkelPad.MemRead(lpEnum, 3 /*DT_DWORD*/); ++i)
  {
    hWnd = AkelPad.MemRead(lpEnum + (i + 1) * 4, 3 /*DT_DWORD*/);

    AkelPad.SendMessage(hWnd, 0x000D /*WM_GETTEXT*/, 260, lpInfo);
    sText = AkelPad.MemRead(lpInfo, _TSTR);

    oSys.Call("User32::GetWindowRect", hWnd, lpInfo);
    nX = AkelPad.MemRead(lpInfo,      3 /*DT_DWORD*/);
    nY = AkelPad.MemRead(lpInfo +  4, 3 /*DT_DWORD*/);
    nW = AkelPad.MemRead(lpInfo +  8, 3 /*DT_DWORD*/) - nX;
    nH = AkelPad.MemRead(lpInfo + 12, 3 /*DT_DWORD*/) - nY;

    oSys.Call("User32::GetClassName" + _TCHAR, hWnd, lpInfo, 260);
    sClass = AkelPad.MemRead(lpInfo, _TSTR);

    aWnd[aWnd.length] = {Handle  : hWnd,
                         Text    : sText,
                         Visible : oSys.Call("User32::IsWindowVisible", hWnd),
                         Enabled : oSys.Call("User32::IsWindowEnabled", hWnd),
                         X       : nX,
                         Y       : nY,
                         W       : nW,
                         H       : nH,
                         Class   : sClass,
                         Style   : oSys.Call("User32::GetWindowLong" + _TCHAR, hWnd, -16 /*GWL_STYLE*/),
                         ExStyle : oSys.Call("User32::GetWindowLong" + _TCHAR, hWnd, -20 /*GWL_EXSTYLE*/),
                         ID      : oSys.Call("User32::GetWindowLong" + _TCHAR, hWnd, -12 /*GWL_ID*/)};
  }

  AkelPad.MemFree(lpEnum);
  AkelPad.MemFree(lpInfo);

  return aWnd;
}
