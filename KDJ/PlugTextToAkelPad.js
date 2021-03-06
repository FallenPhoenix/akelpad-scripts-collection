// PlugTextToAkelPad.js - ver. 2012-04-14
//
// Copy text from edit window of ContextMenu/ToolBar plugin to AkelPad or vice versa.
//
// Usage:
// Required to include: EnumerateWindows_functions.js
// First, display dialog box of ContextMenu/ToolBar plugin and then
// Call("Scripts::Main", 1, "PlugTextToAkelPad.js")
//
// For the syntax highlighting uses akelmenu.coder by Infocatcher:
// http://infocatcher.ucoz.net/akelpad/coder/_akelmenu.coder

if (! AkelPad.Include("EnumerateWindows_functions.js"))
  WScript.Quit();

var oSys         = AkelPad.SystemFunction();
var hInstanceDLL = AkelPad.GetInstanceDll();
var sClassName   = "AkelPad::Scripts::" + WScript.ScriptName + "::" + hInstanceDLL;
var sTxtCaption  = "Text: AkelPad <-> Plugin";
var hPlugWnd;
var hCtrlWnd;
var hWndDlg;
var hWndToAkel;
var hWndToPlug;
var oRect;

if ((hPlugWnd = GetPluginWnd()) &&
    (hCtrlWnd = oSys.Call("user32::FindWindowEx" + _TCHAR, hPlugWnd, 0, "RichEdit20" + _TCHAR, 0)))
{
  oRect = new Object();
  GetWndPos(hPlugWnd, oRect);

  AkelPad.WindowRegisterClass(sClassName);

  hWndDlg = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                      0,               //dwExStyle
                      sClassName,      //lpClassName
                      sTxtCaption,     //lpWindowName
                      0x90C80000,      //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU
                      oRect.X,         //x
                      oRect.Y + 30,    //y
                      215,             //nWidth
                      75,              //nHeight
                      hPlugWnd,        //hWndParent
                      0,               //ID
                      hInstanceDLL,    //hInstance
                      DialogCallback); //Script function callback. To use it class must be registered by WindowRegisterClass.

  AkelPad.ScriptNoMutex();

  //Message loop
  AkelPad.WindowGetMessage();

  AkelPad.WindowUnregisterClass(sClassName);
}
else
{
  WScript.Echo("You must first open dialog box of ContextMenu/ToolBar plugin.");
}

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    hWndToAkel = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                 0,            //dwExStyle
                 "BUTTON",     //lpClassName
                 0,            //lpWindowName
                 0x50010001,   //dwStyle = WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_DEFPUSHBUTTON
                 20,           //x
                 10,           //y
                 80,           //nWidth
                 25,           //nHeight
                 hWnd,         //hWndParent
                 0,            //ID
                 hInstanceDLL, //hInstance
                 0);           //lpParam

    hWndToPlug = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                 0,            //dwExStyle
                 "BUTTON",     //lpClassName
                 0,            //lpWindowName
                 0x50010000,   //dwStyle = WS_VISIBLE|WS_CHILD|WS_TABSTOP
                 110,          //x
                 10,           //y
                 80,           //nWidth
                 25,           //nHeight
                 hWnd,         //hWndParent
                 0,            //ID
                 hInstanceDLL, //hInstance
                 0);           //lpParam

    SetWndText(hWndToAkel, "AkelPad <-");
    SetWndText(hWndToPlug, "-> Plugin");
  }

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("user32::SetFocus", hWndToAkel);

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (wParam == 27) //VK_ESCAPE
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    if (lParam == hWndToAkel)
      TextToAkelPad();
    else if (lParam == hWndToPlug)
      TextToPlugin();
  }

  else if (uMsg == 16) //WM_CLOSE
    oSys.Call("user32::DestroyWindow", hWnd);

  else if (uMsg == 2) //WM_DESTROY
    //Exit message loop
    oSys.Call("user32::PostQuitMessage", 0);

  else if (! oSys.Call("user32::FindWindowEx" + _TCHAR, hPlugWnd, 0, "RichEdit20" + _TCHAR, 0))
    oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);

  return 0;
}

function GetWndPos(hWnd, oRect)
{
  var lpRect = AkelPad.MemAlloc(16) //sizeof(RECT);

  oSys.Call("user32::GetWindowRect", hWnd, lpRect);

  oRect.X = AkelPad.MemRead(lpRect,     3 /*DT_DWORD*/);
  oRect.Y = AkelPad.MemRead(lpRect + 4, 3 /*DT_DWORD*/);

  AkelPad.MemFree(lpRect);
}

function SetWndText(hWnd, sText)
{
  AkelPad.SendMessage(hWnd, 48 /*WM_SETFONT*/, oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/), true);
  oSys.Call("user32::SetWindowText" + _TCHAR, hWnd, sText);
}

function TextToAkelPad()
{
  var nTxtLen    = oSys.Call("user32::GetWindowTextLength" + _TCHAR, hCtrlWnd);
  var hEditWnd;
  var lpTxtBuf;
  var lpSelBuf;

  if (nTxtLen)
  {
    AkelPad.SendMessage(AkelPad.GetMainWnd(), 273 /*WM_COMMAND*/, 4101 /*wParam=MAKEWPARAM(0,IDM_FILE_NEW)*/, 1 /*lParam=TRUE*/);
    AkelPad.Command(4125); //Reopen as UTF-16LE

    if (AkelPad.IsPluginRunning("Coder::HighLight"))
      AkelPad.Call("Coder::Settings", 1, "akelmenu");

    hEditWnd = AkelPad.GetEditWnd();
    lpTxtBuf = AkelPad.MemAlloc((nTxtLen + 1) * _TSIZE);
    lpSelBuf = AkelPad.MemAlloc(8 /*sizeof(CHARRANGE)*/);

    oSys.Call("user32::GetWindowText" + _TCHAR, hCtrlWnd, lpTxtBuf, nTxtLen + 1);
    oSys.Call("user32::SetWindowText" + _TCHAR, hEditWnd, lpTxtBuf);

    AkelPad.SendMessage(hCtrlWnd, 1076 /*EM_EXGETSEL*/, 0, lpSelBuf);
    AkelPad.SendMessage(hEditWnd, 1079 /*EM_EXSETSEL*/, 0, lpSelBuf);

    AkelPad.MemFree(lpTxtBuf);
    AkelPad.MemFree(lpSelBuf);
  }
}

function TextToPlugin()
{
  var hEditWnd = AkelPad.GetEditWnd();
  var nTxtLen  = oSys.Call("user32::GetWindowTextLength" + _TCHAR, hEditWnd);
  var lpTxtBuf;
  var lpSelBuf;

  if (nTxtLen)
  {
    lpTxtBuf = AkelPad.MemAlloc((nTxtLen + 1) * _TSIZE);
    lpSelBuf = AkelPad.MemAlloc(8 /*sizeof(CHARRANGE)*/);

    oSys.Call("user32::GetWindowText" + _TCHAR, hEditWnd, lpTxtBuf, nTxtLen + 1);
    oSys.Call("user32::SetWindowText" + _TCHAR, hCtrlWnd, lpTxtBuf);

    AkelPad.SendMessage(hCtrlWnd, 185 /*EM_SETMODIFY*/, true, 0);
    AkelPad.SendMessage(hEditWnd, 1076 /*EM_EXGETSEL*/, 0, lpSelBuf);
    AkelPad.SendMessage(hCtrlWnd, 1079 /*EM_EXSETSEL*/, 0, lpSelBuf);

    AkelPad.MemFree(lpTxtBuf);
    AkelPad.MemFree(lpSelBuf);
  }
}

function GetPluginWnd()
{
  var hPlugWnd = 0;
  var sEndName;
  var aWndList;
  var oRE;
  var i;

  if (AkelPad.GetLangId(1 /*LANGID_PRIMARY*/) == 0x19 /*LANG_RUSSIAN*/)
    sEndName = "плагин";
  else
    sEndName = "plugin";

  oRE = new RegExp("(ContextMenu)|(ToolBar.*)" + " " + sEndName);

  aWndList = EnumTopLevelWindows(1, 1, 2, 2, 1, 2, 0);

  for (i = 0; i < aWndList.length; ++i)
  {
    if (oRE.test(aWndList[i].Title))
    {
      hPlugWnd = aWndList[i].Handle;
      break;
    }
  }

  return hPlugWnd;
}
