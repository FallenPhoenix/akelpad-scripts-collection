// FindReplaceEx.js - ver. 2012-12-26
//
// "Find/Replace" dialog extended version
//
// Usage:
// Call("Scripts::Main", 1, "FindReplaceEx.js")      - Find dialog
// Call("Scripts::Main", 1, "FindReplaceEx.js", "R") - Replace dialog

if (AkelPad.ScriptHandle(AkelPad.ScriptHandle(WScript.ScriptName, 3 /*SH_FINDSCRIPT*/), 13 /*SH_GETMESSAGELOOP*/) /*script already running*/
   || (! AkelPad.GetEditWnd()))
  WScript.Quit();

var DT_DWORD = 3;
var IDCANCEL = 2;
var IDLINK   = 3099;

var sTxtFind     = "Find";
var sTxtReplace  = "Replace";
var oSys         = AkelPad.SystemFunction();
var hInstanceDLL = AkelPad.GetInstanceDll();
var hGuiFont     = oSys.Call("Gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
var bReplace     = false;
var bContinue    = true;
var hWndFR;
var hWndCancel;
var hSubClass;

if (WScript.Arguments.length && (WScript.Arguments(0).toUpperCase() == "R"))
  bReplace = true;

while (bContinue)
{
  bContinue = false;

  AkelPad.Command(bReplace ? 4161 /*IDM_EDIT_REPLACE*/ : 4158 /*IDM_EDIT_FIND*/);

  if ((! (hWndFR = GetFindReplaceDialog())) || (! (hWndCancel = oSys.Call("User32::GetDlgItem", hWndFR, IDCANCEL))))
    break;

  sLink = bReplace ? sTxtFind + " (Ctrl+F)" : sTxtReplace + " (Ctrl+R)";

  oSys.Call("User32::CreateWindowExW",
            0,                      //dwExStyle
            "SysLink",              //lpClassName
            "<a>" + sLink + "</a>", //lpWindowName
            0x50000000,             //dwStyle=WS_VISIBLE|WS_CHILD
            GetLinkX(),             //x
            GetLinkY(),             //y
            GetLinkW(sLink),        //nWidth
            13,                     //nHeight
            hWndFR,                 //hWndParent
            IDLINK,                 //ID
            hInstanceDLL,           //hInstance
            0);                     //lpParam
  oSys.Call("User32::UpdateWindow", hWndFR);

  hSubClass = AkelPad.WindowSubClass(hWndFR, FindReplaceCallback, 78 /*WM_NOTIFY*/, 256 /*WM_KEYDOWN*/, 2 /*WM_DESTROY*/);

  AkelPad.ScriptNoMutex();
  AkelPad.WindowGetMessage();
  AkelPad.WindowUnsubClass(hWndFR);
}

function FindReplaceCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 78) //WM_NOTIFY
  {
    if ((wParam == IDLINK) && (AkelPad.MemRead(lParam + 8, DT_DWORD) == -2 /*NM_CLICK*/))
      SwitchFindReplace();
  }
  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (Ctrl() && (! Shift()))
    {
      if (((wParam == 0x46 /*F key*/) && (bReplace)) || ((wParam == 0x52 /*R key*/) && (! bReplace)))
        SwitchFindReplace();
    }
  }
  else if (uMsg == 2) //WM_DESTROY
    oSys.Call("User32::PostQuitMessage", 0); //Exit message loop

  return 0;
}

function Ctrl()
{
  return Boolean(oSys.Call("User32::GetKeyState", 0x11 /*VK_CONTROL*/) & 0x8000);
}

function Shift()
{
  return Boolean(oSys.Call("User32::GetKeyState", 0x10 /*VK_SHIFT*/) & 0x8000);
}

function GetLinkX()
{
  var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)
  var nX;

  oSys.Call("User32::GetWindowRect", hWndCancel, lpRect);
  oSys.Call("User32::ScreenToClient", hWndFR, lpRect);
  nX = AkelPad.MemRead(lpRect, DT_DWORD);
  AkelPad.MemFree(lpRect);

  return nX;
}

function GetLinkY()
{
  var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)
  var nY;

  oSys.Call("User32::GetClientRect", hWndFR, lpRect);
  nY = AkelPad.MemRead(lpRect + 12, DT_DWORD) - 28;
  AkelPad.MemFree(lpRect);

  return nY;
}

function GetLinkW(sText)
{
  var hDC    = AkelPad.SystemFunction().Call("User32::GetDC", hWndCancel);
  var lpSize = AkelPad.MemAlloc(8); //sizeof(SIZE)
  var nW;

  AkelPad.SystemFunction().Call("Gdi32::SelectObject", hDC, hGuiFont);

  AkelPad.SystemFunction().Call("Gdi32::SetMapMode", hDC, 1 /*MM_TEXT*/);
  AkelPad.SystemFunction().Call("Gdi32::GetTextExtentPoint32W", hDC, sText, sText.length, lpSize);

  nW = AkelPad.MemRead(lpSize, DT_DWORD);

  AkelPad.SystemFunction().Call("User32::ReleaseDC", hWndCancel, hDC); 
  AkelPad.MemFree(lpSize);

  return nW;
}

function GetFindReplaceDialog()
{
  var lpMLT = AkelPad.MemAlloc(4);
  var hWnd  = AkelPad.SendMessage(AkelPad.GetMainWnd(), 1275 /*AKD_GETMODELESS*/, 0, lpMLT);
  var hDlg  = 0;

  if (AkelPad.MemRead(lpMLT, 3 /*DT_DWORD*/) == 3 /*MLT_FIND*/)
  {
    bReplace = false;
    hDlg     = hWnd;
  }
  else if (AkelPad.MemRead(lpMLT, 3 /*DT_DWORD*/) == 4 /*MLT_REPLACE*/)
  {
    bReplace = true;
    hDlg     = hWnd;
  }

  AkelPad.MemFree(lpMLT);

  return hDlg;
}

function SwitchFindReplace()
{
  bReplace  = ! bReplace;
  bContinue = true;
  AkelPad.SendMessage(hWndFR, 273 /*WM_COMMAND*/, IDCANCEL, hWndCancel);
}
