// ScreenView.js - ver. 2013-01-25
//
// Switch between different views of AkelPad screen.
//
// Call("Scripts::Main", 1, "ScreenView.js") - dialog box with settings
// Call("Scripts::Main", 1, "ScreenView.js", '-View="ViewName"')
// Call("Scripts::Main", 1, "ScreenView.js", '-FullScreen=1')
// Call("Scripts::Main", 1, "ScreenView.js", '-View="ViewName" -FullScreen=-1')
// View:
//   name of view to set (default is "Default")
// FullScreen:
//  -1 - switch on/off
//   0 - full screen off
//   1 - full screen on
//   2 - not change (default)
//
// Required to include: ChooseFont_function.js, FileAndStream_functions.js and InputBox_function.js
//
// Some keyboard shortcuts in dialog box:
// TAB      - switch between "View name" and "View settings" windows
// INS      - New
// F2       - Rename
// DEL      - Delete
// Alt+->   - plugin settings
// Ctrl+INS - copy view name to the clipboard
// Pressing the font button with Ctrl or Shift key, displays only monospace fonts.

if (!(AkelPad.Include("ChooseFont_function.js") &&
      AkelPad.Include("FileAndStream_functions.js") &&
      AkelPad.Include("InputBox_function.js")))
  WScript.Quit();

var DT_UNICODE   = 1;
var DT_DWORD     = 3;
var DT_BYTE      = 5;
var oSys         = AkelPad.SystemFunction();
var sScriptName  = "ScreenView";
var sClassName   = "AkelPad::Scripts::" + WScript.ScriptName + "::" + oSys.Call("Kernel32::GetCurrentProcessId");
var hMainWnd     = AkelPad.GetMainWnd();
var hEditWnd     = AkelPad.GetEditWnd();
var nBufSize     = 1024;
var oView        = {};
var aTB          = GetToolBarsArray();
var oPlug        = GetPluginsObject();
var sFullScr     = "FullScreen";
var sFullScrFunc = sFullScr + "::Main";
var nWndMinW     = 330;
var nWndPosX     = 240;
var nWndPosY     = 110;
var nWndPosW     = nWndMinW;
var nWndPosH     = 550 + aTB.length * 20;
var nView        = 0;
var hWndDlg;
var hFocus;
var hFocus1;
var i;

if (! hEditWnd)
  WScript.Quit();

ReadWriteIni(false);
CheckViewObject();

if (WScript.Arguments.length)
{
  if (ApplyView(AkelPad.GetArgValue("View", "Default"), AkelPad.GetArgValue(sFullScr, 2)))
    WScript.Quit();
}

if (nWndPosW < nWndMinW)
  nWndPosW = nWndMinW;

var CLASS = 0;
var HWND  = 1;
var STYLE = 2;
var TXT   = 3;
var LINK  = 4;
var NAME  = 5;

var aWnd             = [];
var IDNAMES          = 2000;
var IDNAMELB         = 2001;
var IDFULLSCREEN     = 2002;
var IDNEW            = 2003;
var IDRENAME         = 2004;
var IDDELETE         = 2005;
var IDAPPLY          = 2006;
var IDOK             = 2007;
var IDTHEMESET       = 2008;
var IDCODERTHEMESET  = 2009;
var IDCLIPBOARDSET   = 2010;
var IDCODEFOLDSET    = 2011;
var IDLINEBOARDSET   = 2012;
var IDLOGSET         = 2013;
var IDMENUSET        = 2014;
var IDSPECCHARSET    = 2015;
var IDVIEWSET        = 2016;
var IDFONT           = 2017;
var IDFONTSET        = 2018;
var IDTHEME          = 2019;
var IDTHEMENAME      = 2020;
var IDCODERTHEME     = 2021;
var IDCODERTHEMENAME = 2022;
var IDCLIPBOARD      = 2023;
var IDCODEFOLD       = 2024;
var IDCODELIST       = 2025;
var IDEXPLORER       = 2026;
var IDHEXSEL         = 2027;
var IDLINEBOARD      = 2028;
var IDLOG            = 2029;
var IDMENU           = 2030;
var IDQSEARCH        = 2031;
var IDSCROLLBARH     = 2032;
var IDSCROLLBARV     = 2033;
var IDSPECCHAR       = 2034;
var IDSPEECH         = 2035;
var IDSTATUSBAR      = 2036;
var IDTABBAR         = 2037;
var IDTABBARTOP      = 2038;
var IDTOOLBAR        = 2039;

//0x50000000 - WS_VISIBLE|WS_CHILD
//0x50000001 - WS_VISIBLE|WS_CHILD|BS_DEFPUSHBUTTON
//0x50000003 - WS_VISIBLE|WS_CHILD|BS_AUTOCHECKBOX
//0x50004000 - WS_VISIBLE|WS_CHILD|BS_NOTIFY
//0x50004003 - WS_VISIBLE|WS_CHILD|BS_NOTIFY|BS_AUTOCHECKBOX
//0x50004006 - WS_VISIBLE|WS_CHILD|BS_NOTIFY|BS_AUTO3STATE
//0x50000007 - WS_VISIBLE|WS_CHILD|BS_GROUPBOX
//0x50800080 - WS_VISIBLE|WS_CHILD|WS_BORDER|ES_AUTOHSCROLL
//0x50A10103 - WS_VISIBLE|WS_CHILD|WS_VSCROLL|WS_BORDER|WS_TABSTOP|LBS_NOINTEGRALHEIGHT|LBS_SORT|LBS_NOTIFY
//Windows               CLASS,    HWND,      STYLE, TXT,               LINK,            NAME (in oView, oPlug)
aWnd[IDNAMES         ]=["STATIC",    0, 0x50000000, "View name",       0];
aWnd[IDNAMELB        ]=["LISTBOX",   0, 0x50A00103, "",                0];
aWnd[IDFULLSCREEN    ]=["BUTTON",    0, 0x50000003, "&" + sFullScr,    0];
aWnd[IDNEW           ]=["BUTTON",    0, 0x50000000, "&New",            0];
aWnd[IDRENAME        ]=["BUTTON",    0, 0x50000000, "&Rename",         0];
aWnd[IDDELETE        ]=["BUTTON",    0, 0x50000000, "&Delete",         0];
aWnd[IDAPPLY         ]=["BUTTON",    0, 0x50000000, "&Apply",          0];
aWnd[IDOK            ]=["BUTTON",    0, 0x50000001, "OK",              0];
aWnd[IDTHEMESET      ]=["BUTTON",    0, 0x50000000, ">",               IDTHEME];
aWnd[IDCODERTHEMESET ]=["BUTTON",    0, 0x50000000, ">",               IDCODERTHEME];
aWnd[IDCLIPBOARDSET  ]=["BUTTON",    0, 0x50000000, ">",               IDCLIPBOARD];
aWnd[IDCODEFOLDSET   ]=["BUTTON",    0, 0x50000000, ">",               IDCODEFOLD];
aWnd[IDLINEBOARDSET  ]=["BUTTON",    0, 0x50000000, ">",               IDLINEBOARD];
aWnd[IDLOGSET        ]=["BUTTON",    0, 0x50000000, ">",               IDLOG];
aWnd[IDMENUSET       ]=["BUTTON",    0, 0x50000000, ">",               IDMENU];
aWnd[IDSPECCHARSET   ]=["BUTTON",    0, 0x50000000, ">",               IDSPECCHAR];
aWnd[IDVIEWSET       ]=["BUTTON",    0, 0x50000007, "View settings",   0];
aWnd[IDFONT          ]=["BUTTON",    0, 0x50004003, "Font",            0,               "Font"];
aWnd[IDFONTSET       ]=["BUTTON",    0, 0x50004000, "",                0,               "FontSet"];
aWnd[IDTHEME         ]=["BUTTON",    0, 0x50004003, "ColorTheme",      IDTHEMESET,      "Theme"];
aWnd[IDTHEMENAME     ]=["BUTTON",    0, 0x50004000, "",                IDTHEMESET,      "ThemeName"];
aWnd[IDCODERTHEME    ]=["BUTTON",    0, 0x50004006, "ColorCoderTheme", IDCODERTHEMESET, "CoderTheme"];
aWnd[IDCODERTHEMENAME]=["BUTTON",    0, 0x50004000, "",                IDCODERTHEMESET, "CoderThemeName"];
aWnd[IDCLIPBOARD     ]=["BUTTON",    0, 0x50004006, "Clipboard",       IDCLIPBOARDSET,  "Clipboard"];
aWnd[IDCODEFOLD      ]=["BUTTON",    0, 0x50004006, "CodeFold",        IDCODEFOLDSET,   "CodeFold"];
aWnd[IDCODELIST      ]=["BUTTON",    0, 0x50004006, "CodeFoldList",    0,               "CodeList"];
aWnd[IDEXPLORER      ]=["BUTTON",    0, 0x50004006, "Explorer",        0,               "Explorer"];
aWnd[IDHEXSEL        ]=["BUTTON",    0, 0x50004006, "HexSel",          0,               "HexSel"];
aWnd[IDLINEBOARD     ]=["BUTTON",    0, 0x50004006, "LineBoard",       IDLINEBOARDSET,  "LineBoard"];
aWnd[IDLOG           ]=["BUTTON",    0, 0x50004006, "Log",             IDLOGSET,        "Log"];
aWnd[IDMENU          ]=["BUTTON",    0, 0x50004006, "MenuMain",        IDMENUSET,       "Menu"];
aWnd[IDQSEARCH       ]=["BUTTON",    0, 0x50004006, "QSearch",         0,               "QSearch"];
aWnd[IDSCROLLBARH    ]=["BUTTON",    0, 0x50004006, "ScrollBarH",      0,               "ScrollBarH"];
aWnd[IDSCROLLBARV    ]=["BUTTON",    0, 0x50004006, "ScrollBarV",      0,               "ScrollBarV"];
aWnd[IDSPECCHAR      ]=["BUTTON",    0, 0x50004006, "SpecialChar",     IDSPECCHARSET,   "SpecChar"];
aWnd[IDSPEECH        ]=["BUTTON",    0, 0x50004006, "Speech",          0,               "Speech"];
aWnd[IDSTATUSBAR     ]=["BUTTON",    0, 0x50004006, "StatusBar",       0,               "StatusBar"];
aWnd[IDTABBAR        ]=["BUTTON",    0, 0x50004006, "TabBar",          0,               "TabBar"];
aWnd[IDTABBARTOP     ]=["BUTTON",    0, 0x50004003, "Top",             0,               "TabBarTop"];

for (i = 0; i < aTB.length; ++i)
{
  aWnd[IDTOOLBAR + i                 ]=["BUTTON", 0, 0x50004006, aTB[i], 0, aTB[i]];
  aWnd[IDTOOLBAR + aTB.length + i    ]=["EDIT",   0, 0x50800080, "",     0, aTB[i] + "Rows"];
  aWnd[IDTOOLBAR + aTB.length * 2 + i]=["STATIC", 0, 0x50000000, "Rows", 0];
}

if (AkelPad.WindowRegisterClass(sClassName))
{
  hWndDlg = oSys.Call("User32::CreateWindowExW",
                      0,           //dwExStyle
                      sClassName,  //lpClassName
                      sScriptName, //lpWindowName
                      0x90CE0000,  //WS_POPUP|WS_VISIBLE|WS_CAPTION|WS_SYSMENU|WS_SIZEBOX|WS_MINIMIZEBOX
                      nWndPosX,    //x
                      nWndPosY,    //y
                      nWndPosW,    //nWidth
                      nWndPosH,    //nHeight
                      hMainWnd,    //hWndParent
                      0,           //ID
                      AkelPad.GetInstanceDll(), //hInstance
                      DialogCallback); //Script function callback. To use it class must be registered by WindowRegisterClass.

  //Allow other scripts running
  AkelPad.ScriptNoMutex();

  //Message loop
  AkelPad.WindowGetMessage();

  AkelPad.WindowUnregisterClass(sClassName);
}
else if (hWndDlg = oSys.Call("User32::FindWindowExW", 0, 0, sClassName, 0))
{
  if (! oSys.Call("User32::IsWindowVisible", hWndDlg))
    oSys.Call("User32::ShowWindow", hWndDlg, 8 /*SW_SHOWNA*/);
  if (oSys.Call("User32::IsIconic", hWndDlg))
    oSys.Call("User32::ShowWindow", hWndDlg, 9 /*SW_RESTORE*/);

  oSys.Call("User32::SetForegroundWindow", hWndDlg);
}

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    var hGuiFont = oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
    var i;

    for (i = 2000; i < aWnd.length; ++i)
    {
      aWnd[i][HWND] =
        oSys.Call("User32::CreateWindowExW",
                  0,              //dwExStyle
                  aWnd[i][CLASS], //lpClassName
                  0,              //lpWindowName
                  aWnd[i][STYLE], //dwStyle
                  0,              //x
                  0,              //y
                  0,              //nWidth
                  0,              //nHeight
                  hWnd,           //hWndParent
                  i,              //ID
                  AkelPad.GetInstanceDll(), //hInstance
                  0);             //lpParam

      //Set font and text
      AkelPad.SendMessage(aWnd[i][HWND], 48 /*WM_SETFONT*/, hGuiFont, true);
      oSys.Call("User32::SetWindowTextW", aWnd[i][HWND], aWnd[i][TXT]);
    }

    for (i = 0; i < aTB.length; ++i)
      AkelPad.SendMessage(aWnd[IDTOOLBAR + aTB.length + i][HWND], 0x00C5 /*EM_SETLIMITTEXT*/, 23, 0);

    //fill list box
    for (i in oView)
      oSys.Call("User32::SendMessageW", aWnd[IDNAMELB][HWND], 0x0180 /*LB_ADDSTRING*/, 0, i);

    if (nView >= GetCountLB())
      nView = GetCountLB() - 1;

    SetCurSelLB(nView);
    AkelPad.SendMessage(aWnd[IDNAMELB][HWND], 0x0197 /*LB_SETTOPINDEX*/, nView, 0);

    hFocus  = aWnd[IDNAMELB][HWND];
    hFocus1 = aWnd[IDFONT][HWND];
  }

  else if (uMsg == 7) //WM_SETFOCUS
  {
    EnablePluginButtons();
    CheckButtons();
    AkelPad.SendMessage(aWnd[IDFULLSCREEN][HWND], 0x00F1 /*BM_SETCHECK*/, IsFullScreen(), 0);
    oSys.Call("User32::SetFocus", hFocus);
  }

  else if (uMsg == 36) //WM_GETMINMAXINFO
  {
    var oRect = {};
    GetWindowPos(oSys.Call("User32::GetDesktopWindow"), oRect);
    AkelPad.MemCopy(lParam + 24, nWndMinW,     DT_DWORD); //ptMinTrackSize_x
    AkelPad.MemCopy(lParam + 28, nWndPosH,     DT_DWORD); //ptMinTrackSize_y
    AkelPad.MemCopy(lParam + 32, oRect.W - 30, DT_DWORD); //ptMaxTrackSize_x
    AkelPad.MemCopy(lParam + 36, nWndPosH,     DT_DWORD); //ptMaxTrackSize_y
  }

  else if (uMsg == 5) //WM_SIZE
    ResizeWindow(hWnd);

  else if (uMsg == 15) //WM_PAINT
    PaintSizeGrip(hWnd);

  else if (uMsg == 256 /*WM_KEYDOWN*/)
  {
    if (wParam == 0x09 /*VK_TAB*/)
    {
      if (hFocus == aWnd[IDNAMELB][HWND])
      {
        while (! oSys.Call("User32::IsWindowEnabled", hFocus1))
          hFocus1 = aWnd[oSys.Call("User32::GetDlgCtrlID", hFocus1) - 1][HWND];

        oSys.Call("User32::SetFocus", hFocus1);
      }
      else
      {
        var nID = oSys.Call("User32::GetDlgCtrlID", hFocus);
        if (nID < IDTOOLBAR)
          oSys.Call("User32::SetFocus", aWnd[IDNAMELB][HWND]);
        else if (nID < IDTOOLBAR + aTB.length)
          oSys.Call("User32::SetFocus", aWnd[nID + aTB.length][HWND]);
        else
          oSys.Call("User32::SetFocus", aWnd[IDNAMELB][HWND]);
      }
    }
    else if (wParam == 0x2D /*VK_INSERT*/)
    {
      if ((! Ctrl()) && (! Shift()))
        NewView();
      else if (Ctrl() && (! Shift()))
        AkelPad.SetClipboardText(GetCurTextLB());
    }
    else if (wParam == 0x71 /*VK_F2*/)
    {
      if ((! Ctrl()) && (! Shift()))
        RenameView();
    }
    else if (wParam == 0x2E /*VK_DELETE*/)
    {
      if ((! Ctrl()) && (! Shift()) && (oSys.Call("User32::GetDlgCtrlID", hFocus) < IDTOOLBAR + aTB.length))
        DeleteView();
    }
    else if (wParam == 0x0D /*VK_RETURN*/)
    {
      if ((! Ctrl()) && (! Shift()))
      {
        if ((hFocus != aWnd[IDFONTSET][HWND]) && (hFocus != aWnd[IDTHEMENAME][HWND]) && (hFocus != aWnd[IDCODERTHEMENAME][HWND]))
          oSys.Call("User32::PostMessageW", hWnd, 273 /*WM_COMMAND*/, IDOK, 0);
      }
    }
    else if (wParam == 0x7A /*VK_F11*/)
    {
      if ((! Ctrl()) && (! Shift()))
        oSys.Call("User32::PostMessageW", hWnd, 273 /*WM_COMMAND*/, IDFULLSCREEN, 0);
    }
    else if (wParam == 0x1B /*VK_ESCAPE*/)
      oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 260) //WM_SYSKEYDOWN
  {
    if (wParam == 0x27 /*VK_RIGHT*/)
    {
      var nID = oSys.Call("User32::GetDlgCtrlID", hFocus);

      if (aWnd[nID][LINK] && oSys.Call("User32::IsWindowEnabled", aWnd[aWnd[nID][LINK]][HWND]))
        oSys.Call("User32::PostMessageW", hWnd, 273 /*WM_COMMAND*/, aWnd[nID][LINK], 0);
    }
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    var nLowParam = LoWord(wParam);
    var nHiwParam = HiWord(wParam);

    if (nLowParam == IDNAMELB)
    {
      if (nHiwParam == 1 /*LBN_SELCHANGE*/)
        CheckButtons();
      else if (nHiwParam == 4 /*LBN_SETFOCUS*/)
        hFocus = lParam;
    }
    else if (nLowParam == IDFULLSCREEN)
    {
      FullScreenSwitch();
      oSys.Call("User32::SetFocus", hFocus);
    }
    else if ((nLowParam >= IDNEW) && (nLowParam <= IDSPECCHARSET))
    {
      oSys.Call("User32::PostMessageW", lParam, 0x00F4 /*BM_SETSTYLE*/, 0 /*BS_PUSHBUTTON*/, 1);
      oSys.Call("User32::PostMessageW", aWnd[IDOK][HWND], 0x00F4 /*BM_SETSTYLE*/, 1 /*BS_DEFPUSHBUTTON*/, 1);

      if (nLowParam == IDNEW)
        NewView();
      else if (nLowParam == IDRENAME)
        RenameView();
      else if (nLowParam == IDDELETE)
        DeleteView();
      else if (nLowParam == IDAPPLY)
        ApplyView(GetCurTextLB(), 2);
      else if (nLowParam == IDOK)
      {
        ApplyView(GetCurTextLB(), 2);
        oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
      }
      else
      {
        oSys.Call("User32::ShowWindow", hWnd, 0 /*SW_HIDE*/);

        if (nLowParam == IDTHEMESET)
          AkelPad.Command(4202);
        else
          oPlug[aWnd[aWnd[nLowParam][LINK]][NAME]].Settings();

        oSys.Call("User32::ShowWindow", hWnd, 9 /*SW_RESTORE*/);
      }

      oSys.Call("User32::SetFocus", hFocus);
    }
    else if (nLowParam >= IDFONT)
    {
      if (nHiwParam == 6 /*BN_SETFOCUS*/)
      {
        hFocus  = lParam;
        hFocus1 = lParam;
        if ((nLowParam == IDFONTSET) || (nLowParam == IDTHEMENAME) || (nLowParam == IDCODERTHEMENAME))
        {
          oSys.Call("User32::PostMessageW", lParam, 0x00F4 /*BM_SETSTYLE*/, 1 /*BS_DEFPUSHBUTTON*/, 1);
          oSys.Call("User32::PostMessageW", aWnd[IDOK][HWND], 0x00F4 /*BM_SETSTYLE*/, 0 /*BS_PUSHBUTTON*/, 1);
        }
      }
      else if (nHiwParam == 7 /*BN_KILLFOCUS*/)
      {
        if ((nLowParam == IDFONTSET) || (nLowParam == IDTHEMENAME) || (nLowParam == IDCODERTHEMENAME))
        {
          oSys.Call("User32::PostMessageW", lParam, 0x00F4 /*BM_SETSTYLE*/, 0 /*BS_PUSHBUTTON*/, 1);
          oSys.Call("User32::PostMessageW", aWnd[IDOK][HWND], 0x00F4 /*BM_SETSTYLE*/, 1 /*BS_DEFPUSHBUTTON*/, 1);
        }
      }
      else if (nHiwParam == 0x0100 /*EN_SETFOCUS*/)
      {
        hFocus  = lParam;
        hFocus1 = aWnd[nLowParam - aTB.length][HWND];
      }
      else
        GetButtonState(nLowParam);
    }
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    ReadWriteIni(true);
    oSys.Call("User32::DestroyWindow", hWnd); //Destroy dialog
  }

  else if (uMsg == 2) //WM_DESTROY
    oSys.Call("User32::PostQuitMessage", 0); //Exit message loop

  return 0;
}

function LoWord(nParam)
{
  return (nParam & 0xFFFF);
}

function HiWord(nParam)
{
  return ((nParam >> 16) & 0xFFFF);
}

function Ctrl()
{
  return Boolean(oSys.Call("User32::GetKeyState", 0x11 /*VK_CONTROL*/) & 0x8000);
}

function Shift()
{
  return Boolean(oSys.Call("User32::GetKeyState", 0x10 /*VK_SHIFT*/) & 0x8000);
}

function GetWindowPos(hWnd, oRect)
{
  var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)

  oSys.Call("User32::GetWindowRect", hWnd, lpRect);

  oRect.X = AkelPad.MemRead(lpRect,      DT_DWORD);
  oRect.Y = AkelPad.MemRead(lpRect +  4, DT_DWORD);
  oRect.W = AkelPad.MemRead(lpRect +  8, DT_DWORD) - oRect.X;
  oRect.H = AkelPad.MemRead(lpRect + 12, DT_DWORD) - oRect.Y;

  AkelPad.MemFree(lpRect);
}

function GetCurSelLB()
{
  return AkelPad.SendMessage(aWnd[IDNAMELB][HWND], 0x0188 /*LB_GETCURSEL*/, 0, 0);
}

function SetCurSelLB(nPos)
{
  AkelPad.SendMessage(aWnd[IDNAMELB][HWND], 0x0186 /*LB_SETCURSEL*/, nPos, 0);
}

function GetCurTextLB()
{
  var lpText = AkelPad.MemAlloc(1024);
  var sText;

  AkelPad.SendMessage(aWnd[IDNAMELB][HWND], 0x0189 /*LB_GETTEXT*/, GetCurSelLB(), lpText);
  sText = AkelPad.MemRead(lpText, DT_UNICODE);
  AkelPad.MemFree(lpText);

  return sText;
}

function GetCountLB()
{
  return AkelPad.SendMessage(aWnd[IDNAMELB][HWND], 0x018B /*LB_GETCOUNT*/, 0, 0);
}

function PaintSizeGrip(hWnd)
{
  var lpPaint = AkelPad.MemAlloc(64); //sizeof(PAINTSTRUCT)
  var lpRect  = AkelPad.MemAlloc(16); //sizeof(RECT)
  var hDC;

  if (hDC = oSys.Call("User32::BeginPaint", hWnd, lpPaint))
  {
    oSys.Call("User32::GetClientRect", hWnd, lpRect);

    AkelPad.MemCopy(lpRect,     AkelPad.MemRead(lpRect +  8, DT_DWORD) - oSys.Call("User32::GetSystemMetrics",  2 /*SM_CXVSCROLL*/), DT_DWORD);
    AkelPad.MemCopy(lpRect + 4, AkelPad.MemRead(lpRect + 12, DT_DWORD) - oSys.Call("User32::GetSystemMetrics", 20 /*SM_CYVSCROLL*/), DT_DWORD);

    oSys.Call("User32::DrawFrameControl", hDC, lpRect, 3 /*DFC_SCROLL*/, 0x8 /*DFCS_SCROLLSIZEGRIP*/);
    oSys.Call("User32::EndPaint", hWnd, lpPaint);
  }

  AkelPad.MemFree(lpPaint);
  AkelPad.MemFree(lpRect);
}

function ResizeWindow(hWnd)
{
  var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)
  var nW, nH, nBW;
  var i;

  oSys.Call("User32::GetClientRect", hWnd, lpRect);
  nW  = AkelPad.MemRead(lpRect +  8, DT_DWORD);
  nH  = AkelPad.MemRead(lpRect + 12, DT_DWORD);
  nBW = (nW - 20 - (IDOK - IDNEW) * 3) / (IDOK - IDNEW + 1);
  AkelPad.MemFree(lpRect);

  oSys.Call("User32::SetWindowPos", aWnd[IDNAMES][HWND], 0,
            10,
            10,
            100,
            13,
            0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
  oSys.Call("User32::SetWindowPos", aWnd[IDNAMELB][HWND], 0,
            10,
            30,
            nW - 200 - 30,
            nH - 30 - 23 - 20,
            0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
  oSys.Call("User32::SetWindowPos", aWnd[IDFULLSCREEN][HWND], 0,
            nW - 80,
            10,
            70,
            16,
            0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
  for (i = IDNEW; i <= IDOK; ++i)
    oSys.Call("User32::SetWindowPos", aWnd[i][HWND], 0,
              10 + (i - IDNEW) * (nBW + 3),
              nH - 23 - 10,
              nBW,
              23,
              0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
  for (i = IDTHEMESET; i <= IDSPECCHARSET; ++i)
    oSys.Call("User32::SetWindowPos", aWnd[i][HWND], 0,
              nW - 35,
              90 + (aWnd[i][LINK] - IDTHEME) * 20,
              15,
              20,
              0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
  oSys.Call("User32::SetWindowPos", aWnd[IDVIEWSET][HWND], 0,
            nW - 210,
            30,
            200,
            nH - 30 - 23 - 20,
            0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
  for (i = IDFONT; i <= IDCODERTHEME; i += 2)
  {
    oSys.Call("User32::SetWindowPos", aWnd[i][HWND], 0,
              nW - 200,
              50 + (i - IDFONT) * 20,
              100,
              20,
              0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
    oSys.Call("User32::SetWindowPos", aWnd[i + 1][HWND], 0,
              nW - 190,
              70 + (i - IDFONT) * 20,
              170,
              20,
              0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
  }
  for (i = IDCLIPBOARD; i <= IDTABBAR; ++i)
    oSys.Call("User32::SetWindowPos", aWnd[i][HWND], 0,
              nW - 200,
              170 + (i - IDCLIPBOARD) * 20,
              100,
              20,
              0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
  oSys.Call("User32::SetWindowPos", aWnd[IDTABBARTOP][HWND], 0,
            nW - 100,
            170 + (IDTABBAR - IDCLIPBOARD) * 20,
            50,
            20,
            0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
  for (i = 0; i < aTB.length; ++i)
  {
    oSys.Call("User32::SetWindowPos", aWnd[IDTOOLBAR + i][HWND], 0,
              nW - 200,
              470 + i * 20,
              100,
              20,
              0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
    oSys.Call("User32::SetWindowPos", aWnd[IDTOOLBAR + aTB.length + i][HWND], 0,
              nW - 100,
              470 + i * 20,
              50,
              18,
              0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
    oSys.Call("User32::SetWindowPos", aWnd[IDTOOLBAR + aTB.length * 2 + i][HWND], 0,
              nW - 47,
              470 + i * 20,
              30,
              13,
              0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
  }
}

function GetToolBarsArray()
{
  var sToolBar  = "ToolBar";
  var lpFind    = AkelPad.MemAlloc(44 + (260 + 14) * 2); //sizeof(WIN32_FIND_DATA)
  var hFindFile = oSys.Call("kernel32::FindFirstFileW", AkelPad.GetAkelDir(4 /*ADTYPE_PLUGS*/) + "\\" + sToolBar + "*.dll", lpFind);
  var aTB       = [];
  var sPlugName;

  if (hFindFile != -1) //INVALID_HANDLE_VALUE
  {
    do
    {
      sPlugName = AkelPad.MemRead(lpFind + 44 /*offsetof(WIN32_FIND_DATAW, cFileName)*/, DT_UNICODE);
      aTB.push(sPlugName.substring(sPlugName.lastIndexOf("\\") + 1, sPlugName.lastIndexOf(".")));
    }
    while (oSys.Call("kernel32::FindNextFileW", hFindFile, lpFind));

    oSys.Call("kernel32::FindClose", hFindFile);
  }

  if (aTB.length)
    aTB.sort(
      function(sA, sB)
      {
        return oSys.Call("kernel32::lstrcmpiW", sA, sB);
      });
  else
    aTB.push(sToolBar);

  AkelPad.MemFree(lpFind);
  return aTB;
}

function GetPluginsObject()
{
  var oPlug = {
    Clipboard:  {Name: "Clipboard",   State:  0, IsRunning: function(){return AkelPad.IsPluginRunning(this.Name + "::Capture");},   Switch: function(){AkelPad.CallEx(0x14, this.Name + "::Capture");},   Settings: function(){AkelPad.Call(this.Name + "::Settings");}},
    CodeFold:   {Name: "Coder",       State:  2, IsRunning: function(){return AkelPad.IsPluginRunning(this.Name + "::CodeFold");},  Switch: function(){AkelPad.CallEx(0x14, this.Name + "::CodeFold");},  Settings: function(){AkelPad.Call(this.Name + "::Settings", 3, 2);}},
    CoderTheme: {Name: "Coder",       State: -1, IsRunning: function(){return AkelPad.IsPluginRunning(this.Name + "::HighLight");}, Switch: function(){AkelPad.CallEx(0x14, this.Name + "::HighLight");}, Settings: function(){AkelPad.Call(this.Name + "::Settings", 3, 0);}},
    Explorer:   {Name: "Explorer",    State:  0, IsRunning: function(){return AkelPad.IsPluginRunning(this.Name + "::Main");},      Switch: function(){AkelPad.CallEx(0x14, this.Name + "::Main");}},
    HexSel:     {Name: "HexSel",      State:  0, IsRunning: function(){return AkelPad.IsPluginRunning(this.Name + "::Main");},      Switch: function(){AkelPad.CallEx(0x14, this.Name + "::Main");}},
    LineBoard:  {Name: "LineBoard",   State:  2, IsRunning: function(){return AkelPad.IsPluginRunning(this.Name + "::Main");},      Switch: function(){AkelPad.CallEx(0x14, this.Name + "::Main", 1);},   Settings: function(){AkelPad.Call(this.Name + "::Settings");}},
    Log:        {Name: "Log",         State:  0, IsRunning: function(){return AkelPad.IsPluginRunning(this.Name + "::Output");},    Switch: function(){AkelPad.CallEx(0x14, this.Name + "::Output");},    Settings: function(){AkelPad.Call(this.Name + "::Settings");}},
    Menu:       {Name: "ContextMenu", State: -1, IsRunning: function(){return AkelPad.IsPluginRunning(this.Name + "::Main");},      Switch: function(){AkelPad.CallEx(0x14, this.Name + "::Main", 10);},  Settings: function(){AkelPad.Call(this.Name + "::Main", 1, 1);}},
    QSearch:    {Name: "QSearch",     State:  0, IsRunning: function(){return AkelPad.IsPluginRunning(this.Name + "::QSearch");},   Switch: function(){AkelPad.CallEx(0x14, this.Name + "::QSearch");}},
    SpecChar:   {Name: "SpecialChar", State:  2, IsRunning: function(){return AkelPad.IsPluginRunning(this.Name + "::Main");},      Switch: function(){AkelPad.CallEx(0x14, this.Name + "::Main");},      Settings: function(){AkelPad.Call(this.Name + "::Settings");}},
    Speech:     {Name: "Speech",      State:  0, IsRunning: function(){return AkelPad.IsPluginRunning(this.Name + "::Main");},      Switch: function(){AkelPad.CallEx(0x14, this.Name + "::Main");}}
    };

  for (var i = 0; i < aTB.length; ++i)
    oPlug[aTB[i]] = {State: 0, Name: aTB[i], IsRunning: function(){return AkelPad.IsPluginRunning(this.Name + "::Main");}};

  return oPlug;
}

function CheckViewObject()
{
  var sDefault = "Default";
  var aFont    = ConvertFontFormat(AkelPad.SendMessage(hEditWnd, 0x0031 /*WM_GETFONT*/, 0, 0), 2, 3);
  var oTemp = {
    Font:           0,
    FontName:       aFont[0],
    FontStyle:      aFont[1],
    FontSize:       aFont[2],
    Theme:          0,
    ThemeName:      "<Standard>",
    CoderThemeName: "Default",
    CodeList:       2,
    ScrollBarH:     2,
    ScrollBarV:     2,
    StatusBar:      2,
    TabBar:         2,
    TabBarTop:      1};
  var i, n;

  for (i in oPlug)
    oTemp[i] = 2;

  oTemp.CoderTheme = 2;

  for (i = 0; i < aTB.length; ++i)
    oTemp[aTB[i] + "Rows"] = "";

  for (i in oView)
  {
    for (n in oView[i])
    {
      if (! (n in oTemp))
        delete oView[i][n];
    }
  }

  for (n in oTemp)
  {
    for (i in oView)
    {
      if (! (n in oView[i]))
        oView[i][n] = oTemp[n];
    }
  }

  if (! (sDefault in oView))
  {
    oView[sDefault] = {};
    for (n in oTemp)
      oView[sDefault][n] = oTemp[n];
  }
}

function EnablePluginButtons()
{
  var i;

  oSys.Call("User32::EnableWindow", aWnd[IDFULLSCREEN][HWND], IsPluginExists(sFullScr));
  oSys.Call("User32::EnableWindow", aWnd[IDCODERTHEME][HWND], IsPluginExists(oPlug.CoderTheme.Name));

  for (i = IDCLIPBOARD; i < IDTOOLBAR + aTB.length; ++i)
  {
    if ((aWnd[i][NAME] in oPlug) && (oPlug[aWnd[i][NAME]].State >= 0))
      oSys.Call("User32::EnableWindow", aWnd[i][HWND], IsPluginExists(oPlug[aWnd[i][NAME]].Name));
  }

  for (i = 0; i < aTB.length; ++i)
  {
    oSys.Call("User32::EnableWindow", aWnd[IDTOOLBAR + aTB.length + i    ][HWND], IsPluginExists(oPlug[aWnd[IDTOOLBAR + i][NAME]].Name));
    oSys.Call("User32::EnableWindow", aWnd[IDTOOLBAR + aTB.length * 2 + i][HWND], IsPluginExists(oPlug[aWnd[IDTOOLBAR + i][NAME]].Name));
  }

  for (i = IDCODERTHEMESET; i <= IDSPECCHARSET; ++i)
    oSys.Call("User32::EnableWindow", aWnd[i][HWND], IsPluginExists(oPlug[aWnd[aWnd[i][LINK]][NAME]].Name));
}

function CheckButtons()
{
  var sName = GetCurTextLB();
  var i;

  AkelPad.SendMessage(aWnd[IDFONT][HWND], 0x00F1 /*BM_SETCHECK*/, oView[sName].Font, 0);
  oSys.Call("User32::EnableWindow", aWnd[IDFONTSET][HWND], oView[sName].Font);
  oSys.Call("User32::SetWindowTextW", aWnd[IDFONTSET][HWND], oView[sName].FontName + "," + oView[sName].FontStyle + "," + oView[sName].FontSize);

  AkelPad.SendMessage(aWnd[IDTHEME][HWND], 0x00F1 /*BM_SETCHECK*/, oView[sName].Theme, 0);
  oSys.Call("User32::EnableWindow", aWnd[IDTHEMENAME][HWND], oView[sName].Theme);
  oSys.Call("User32::SetWindowTextW", aWnd[IDTHEMENAME][HWND], oView[sName].ThemeName);

  AkelPad.SendMessage(aWnd[IDCODERTHEME][HWND], 0x00F1 /*BM_SETCHECK*/, oView[sName].CoderTheme, 0);
  oSys.Call("User32::EnableWindow", aWnd[IDCODERTHEMENAME][HWND], (oView[sName].CoderTheme == 1) && oSys.Call("User32::IsWindowEnabled", aWnd[IDCODERTHEME][HWND]));
  oSys.Call("User32::SetWindowTextW", aWnd[IDCODERTHEMENAME][HWND], oView[sName].CoderThemeName);

  for (i = IDCLIPBOARD; i < IDTOOLBAR + aTB.length; ++i)
    AkelPad.SendMessage(aWnd[i][HWND], 0x00F1 /*BM_SETCHECK*/, oView[sName][aWnd[i][NAME]], 0);

  for (i = 0; i < aTB.length; ++i)
    oSys.Call("User32::SetWindowTextW", aWnd[IDTOOLBAR + aTB.length + i][HWND], oView[sName][aWnd[IDTOOLBAR + aTB.length + i][NAME]]);

  oSys.Call("User32::EnableWindow", aWnd[IDCODELIST ][HWND], oView[sName].CodeFold && oSys.Call("User32::IsWindowEnabled", aWnd[IDCODEFOLD][HWND]));
  oSys.Call("User32::EnableWindow", aWnd[IDTABBAR   ][HWND], AkelPad.IsMDI());
  oSys.Call("User32::EnableWindow", aWnd[IDTABBARTOP][HWND], (oView[sName].TabBar == 1) && AkelPad.IsMDI());
  oSys.Call("User32::EnableWindow", aWnd[IDRENAME   ][HWND], sName != "Default");
  oSys.Call("User32::EnableWindow", aWnd[IDDELETE   ][HWND], sName != "Default");
}

function GetButtonState(nID)
{
  var sName = GetCurTextLB();
  var lpText;

  if (! sName)
    return;

  if (nID == IDFONTSET)
  {
    var aFont = ChooseFont(hWndDlg, 3, [oView[sName].FontName, oView[sName].FontStyle, oView[sName].FontSize], 0, (Ctrl() || Shift()), 3);
    if (aFont)
    {
      oView[sName].FontName  = aFont[0];
      oView[sName].FontStyle = aFont[1];
      oView[sName].FontSize  = aFont[2];
      oSys.Call("User32::SetWindowTextW", aWnd[IDFONTSET][HWND], oView[sName].FontName + "," + oView[sName].FontStyle + "," + oView[sName].FontSize);
    }
  }
  else if (nID == IDTHEMENAME)
    SetThemeName(sName);
  else if (nID == IDCODERTHEMENAME)
    SetCoderThemeName(sName);
  else if ((nID >= IDTOOLBAR + aTB.length) && (nID < IDTOOLBAR + aTB.length * 2))
  {
    lpText = AkelPad.MemAlloc(48);
    oSys.Call("User32::GetWindowTextW", aWnd[nID][HWND], lpText, 24);
    oView[sName][aWnd[nID][NAME]] = AkelPad.MemRead(lpText, DT_UNICODE);
    AkelPad.MemFree(lpText);
  }
  else
  {
    oView[sName][aWnd[nID][NAME]] = AkelPad.SendMessage(aWnd[nID][HWND], 0x00F0 /*BM_GETCHECK*/, 0, 0);

    if (nID == IDTHEME)
    {
      if (oView[sName].Theme)
      {
        oView[sName].CoderTheme = 0;
        AkelPad.SendMessage(aWnd[IDCODERTHEME][HWND], 0x00F1 /*BM_SETCHECK*/, oView[sName].CoderTheme, 0);
      }
    }
    else if (nID == IDCODERTHEME)
    {
      if (oView[sName].CoderTheme)
      {
        oView[sName].Theme = 0;
        AkelPad.SendMessage(aWnd[IDTHEME][HWND], 0x00F1 /*BM_SETCHECK*/, oView[sName].Theme, 0);
      }
    }

    oSys.Call("User32::EnableWindow", aWnd[IDFONTSET       ][HWND], oView[sName].Font);
    oSys.Call("User32::EnableWindow", aWnd[IDTHEMENAME     ][HWND], oView[sName].Theme);
    oSys.Call("User32::EnableWindow", aWnd[IDCODERTHEMENAME][HWND], (oView[sName].CoderTheme == 1) && oSys.Call("User32::IsWindowEnabled", aWnd[IDCODERTHEME][HWND]));
    oSys.Call("User32::EnableWindow", aWnd[IDCODELIST      ][HWND], oView[sName].CodeFold && oSys.Call("User32::IsWindowEnabled", aWnd[IDCODEFOLD][HWND]));
    oSys.Call("User32::EnableWindow", aWnd[IDTABBARTOP     ][HWND], oView[sName].TabBar == 1);
  }
}

function IsPluginExists(sPlugName)
{
  return IsFileExists(AkelPad.GetAkelDir(4 /*ADTYPE_PLUGS*/) + "\\" + sPlugName + ".dll");
}

function IsFullScreen()
{
  return AkelPad.IsPluginRunning(sFullScrFunc);
}

function IsSettingsInRegistry()
{
  return (AkelPad.SendMessage(AkelPad.GetMainWnd(), 1222 /*AKD_GETMAININFO*/, 5 /*MI_SAVESETTINGS*/, 0) == 1 /*SS_REGISTRY*/);
}

function NewView()
{
  var sCurName = GetCurTextLB();
  var sNewName = InputBox(hWndDlg, "New view", "Input name:", sCurName, 0, "CheckInputName");
  var nPos;
  var n;

  if ((sNewName) && (sNewName = sNewName.replace(/\s+$/, "")))
  {
    oView[sNewName] = {};

    for (n in oView[sCurName])
      oView[sNewName][n] = oView[sCurName][n];

    nPos = oSys.Call("User32::SendMessageW", aWnd[IDNAMELB][HWND], 0x0180 /*LB_ADDSTRING*/, 0, sNewName);
    SetCurSelLB(nPos);
  }
}

function CheckInputName(hWnd, aNames)
{
  aNames[0] = aNames[0].replace(/\s+$/, "");

  if (aNames[0] in oView)
  {
    WarningBox(hWnd, '"' + aNames[0] + '" already exists.');
    return 0;
  }

  return -1;
}

function RenameView()
{
  var nPos     = GetCurSelLB();
  var sCurName = GetCurTextLB();
  var sNewName;
  var n;

  if (sCurName != "Default")
  {
    sNewName = InputBox(hWndDlg, "Rename view", "Input name:", sCurName, 0, "CheckInputRename", sCurName);

    if ((sNewName) && (sNewName = sNewName.replace(/\s+$/, "")) && (sNewName != sCurName))
    {
      oView[sNewName] = {};

      for (n in oView[sCurName])
        oView[sNewName][n] = oView[sCurName][n];

      delete oView[sCurName];
      AkelPad.SendMessage(aWnd[IDNAMELB][HWND], 0x0182 /*LB_DELETESTRING*/, nPos, 0);

      nPos = oSys.Call("User32::SendMessageW", aWnd[IDNAMELB][HWND], 0x0180 /*LB_ADDSTRING*/, 0, sNewName);
      SetCurSelLB(nPos);
    }
  }
}

function CheckInputRename(hWnd, aNames, sCurName)
{
  aNames[0] = aNames[0].replace(/\s+$/, "");

  if ((aNames[0] != sCurName) && (aNames[0] in oView))
  {
    WarningBox(hWnd, '"' + aNames[0] + '" already exists.');
    return 0;
  }

  return -1;
}

function DeleteView()
{
  var nPos  = GetCurSelLB();
  var sName = GetCurTextLB();

  if (sName != "Default")
  {
    if (AkelPad.MessageBox(hWndDlg, 'Do you want to delete "' + sName + '"?', sScriptName, 0x00000023 /*MB_ICONQUESTION|MB_YESNOCANCEL*/) == 6 /*IDYES*/)
    {
      delete oView[sName];
      AkelPad.SendMessage(aWnd[IDNAMELB][HWND], 0x0182 /*LB_DELETESTRING*/, nPos, 0);

      if (nPos == GetCountLB())
        --nPos;

      SetCurSelLB(nPos);
      CheckButtons();
    }
  }
}

function ApplyView(sViewName, nFullScrAction)
{
  if (! (sViewName in oView))
  {
    WarningBox(hMainWnd, '"' + sViewName + '" does not exists.');
    return 0;
  }

  var hMenu = oSys.Call("User32::GetMenu", hMainWnd);
  var bCodeList;
  var bStatBar;
  var i;

  for (i = 0; i < aTB.length; ++i)
    oPlug[aTB[i]].Switch = function(){
      if (this.IsRunning())
        AkelPad.CallEx(0x14, this.Name + "::Main");
      else
        AkelPad.CallEx(0x14, this.Name + "::Main", 1, oView[sViewName][this.Name + "Rows"]);
      };

  //full screen
  if (IsPluginExists(sFullScr) &&
      ((nFullScrAction == 1) ||
       ((nFullScrAction == -1) && (! IsFullScreen())) ||
       ((nFullScrAction == 2) && IsFullScreen())))
  {
    bCodeList = ShowCodeList(0);
    bStatBar  = ShowStatusBar(0);

    for (i in oPlug)
    {
      if ((oPlug[i].State == 0) || (oPlug[i].State == 1))
      {
        if (oPlug[i].State = oPlug[i].IsRunning())
          oPlug[i].Switch();
      }
    }
  }
  //not full screen
  else
  {
    bCodeList = ShowCodeList(2);
    bStatBar  = ShowStatusBar(2);

    for (i in oPlug)
    {
      if ((oPlug[i].State == 0) || (oPlug[i].State == 1))
        oPlug[i].State = oPlug[i].IsRunning();
    }

    for (i = 0; i < aTB.length; ++i)
    {
      if (oPlug[aTB[i]].State == 1)
        oPlug[aTB[i]].Switch();
    }
  }

  if (IsPluginExists(sFullScr) && (nFullScrAction < 2) && (nFullScrAction != IsFullScreen()))
  {
    AkelPad.Call(sFullScrFunc);
    WScript.Sleep(80);
  }

  for (i in oPlug)
  {
    if ((oPlug[i].State >= 0) && IsPluginExists(oPlug[i].Name))
    {
      if (((oView[sViewName][i] == 0) && oPlug[i].IsRunning()) ||
          ((oView[sViewName][i] == 1) && (! oPlug[i].IsRunning())) ||
          ((oView[sViewName][i] == 2) && (oPlug[i].State < 2) && (oPlug[i].State != oPlug[i].IsRunning())))
        oPlug[i].Switch();
    }
  }

  ShowMenu(oView[sViewName].Menu, hMenu);
  ShowCodeList((oView[sViewName].CodeList == 2) ? bCodeList : oView[sViewName].CodeList);
  ShowStatusBar((oView[sViewName].StatusBar == 2) ? bStatBar : oView[sViewName].StatusBar);

  ShowScrollBar(oView[sViewName].ScrollBarH, oView[sViewName].ScrollBarV);
  ShowTabBar(oView[sViewName].TabBar, oView[sViewName].TabBarTop);
  ChangeFont(sViewName);
  ChangeTheme(sViewName);
  ChangeCoderTheme(sViewName);

  return 1;
}

function FullScreenSwitch()
{
  if (IsPluginExists(sFullScr))
  {
    var hMenu     = oSys.Call("User32::GetMenu", hMainWnd);
    var bCodeList = ShowCodeList(0);
    var bStatBar  = ShowStatusBar(0);
    var i;

    for (i = 0; i < aTB.length; ++i)
      oPlug[aTB[i]].Switch = function(){AkelPad.CallEx(0x14, this.Name + "::Main");};

    for (i in oPlug)
    {
      if ((oPlug[i].State == 0) || (oPlug[i].State == 1))
      {
        if (oPlug[i].State = oPlug[i].IsRunning())
          oPlug[i].Switch();
      }
    }

    AkelPad.Call(sFullScrFunc);
    WScript.Sleep(80);

    for (i in oPlug)
    {
      if (oPlug[i].State == 1)
        oPlug[i].Switch();
    }

    oSys.Call("User32::SetMenu", hMainWnd, hMenu);
    ShowCodeList(bCodeList);
    ShowStatusBar(bStatBar);

    ShowTabBar(2);
  }
}

function ShowCodeList(nShow)
{
  var bState  = 0;
  var lpState;

  if (oPlug.CodeFold.IsRunning())
  {
    lpState = AkelPad.MemAlloc(4);
    AkelPad.Call(oPlug.CodeFold.Name + "::CodeFold", 1, lpState);

    bState = AkelPad.MemRead(lpState, 3 /*DT_DWORD*/);
    AkelPad.MemFree(lpState);

    if ((nShow < 2) && (nShow != bState))
      AkelPad.Call(oPlug.CodeFold.Name + "::CodeFold", 1);
  }

  return bState;
}

function ShowMenu(nShow, hMenu)
{
  var hMainMenu = AkelPad.SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 21 /*MI_MENUMAIN*/, 0);
  var hCurMenu  = oSys.Call("User32::GetMenu", hMainWnd);

  if (nShow == 2)
    oSys.Call("User32::SetMenu", hMainWnd, hMenu);
  else if (((nShow == 0) && hCurMenu) || ((nShow == 1) && (! hCurMenu)))
  {
    if (IsPluginExists(oPlug.Menu.Name))
    {
      if (nShow)
      {
        if (oPlug.Menu.IsRunning())
        {
          oPlug.Menu.Switch();
          oPlug.Menu.Switch();
        }

        if (! oSys.Call("User32::GetMenu", hMainWnd))
          oSys.Call("User32::SetMenu", hMainWnd, hMainMenu);
      }
      else
        oSys.Call("User32::SetMenu", hMainWnd, 0);
    }
    else
      oSys.Call("User32::SetMenu", hMainWnd, nShow ? hMainMenu : 0);
  }
}

function ShowScrollBar(nShowH, nShowV)
{
  if ((nShowH < 2) || (nShowV < 2))
  {
    var lpPOINT = AkelPad.MemAlloc(8);

    AkelPad.SendMessage(hEditWnd, 1245 /*EM_GETSCROLLPOS*/, 0, lpPOINT);

    if (nShowH < 2)
      AkelPad.SendMessage(hEditWnd, 3375 /*AEM_SHOWSCROLLBAR*/, 0 /*SB_HORZ*/, nShowH);

    if (nShowV < 2)
      AkelPad.SendMessage(hEditWnd, 3375 /*AEM_SHOWSCROLLBAR*/, 1 /*SB_VERT*/, nShowV);

    AkelPad.SendMessage(hEditWnd, 1246 /*EM_SETSCROLLPOS*/, 0, lpPOINT);
    AkelPad.MemFree(lpPOINT);
  }
}

function ShowStatusBar(nShow)
{
  var bState = AkelPad.SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 142 /*MI_STATUSBAR*/, 0);

  if ((nShow < 2) && (nShow != bState))
    AkelPad.Command(4211 /*IDM_VIEW_SHOW_STATUSBAR*/);

  return bState;
}

function ShowTabBar(nShow, bTop)
{
  var IDM_WINDOW_TABVIEW_NONE   = 4303;
  var IDM_WINDOW_TABVIEW_TOP    = 4301;
  var IDM_WINDOW_TABVIEW_BOTTOM = 4302;
  var TAB_VIEW_NONE   = 1;
  var TAB_VIEW_TOP    = 2;
  var TAB_VIEW_BOTTOM = 4;
  var nState = AkelPad.SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 157 /*MI_TABOPTIONSMDI*/, 0);

  AkelPad.Command(IDM_WINDOW_TABVIEW_NONE);

  if (nShow == 1)
  {
    if (bTop)
      AkelPad.Command(IDM_WINDOW_TABVIEW_TOP);
    else
      AkelPad.Command(IDM_WINDOW_TABVIEW_BOTTOM);
  }
  else if ((nShow == 2) && (! (nState & TAB_VIEW_NONE)))
  {
    if (nState & TAB_VIEW_TOP)
      AkelPad.Command(IDM_WINDOW_TABVIEW_TOP);
    else
      AkelPad.Command(IDM_WINDOW_TABVIEW_BOTTOM);
  }
}

function ChangeFont(sViewName)
{
  if (oView[sViewName].Font)
    AkelPad.Font(oView[sViewName].FontName, oView[sViewName].FontStyle, oView[sViewName].FontSize);
}

function ChangeTheme(sViewName)
{
  if (! oView[sViewName].Theme)
    return;

  var nColorsSize = 17 * 4; //sizeof(AECOLORS)
  var lpColors    = AkelPad.MemAlloc(nColorsSize);

  if (oView[sViewName].ThemeName == "<Standard>")
    AkelPad.MemCopy(lpColors, 0x0001FFFF /*AECLR_DEFAULT|AECLR_ALL*/, DT_DWORD);

  else
  {
    if (IsSettingsInRegistry())
    {
      var hKey       = GetRegKeyHandle(0x80000001 /*HKEY_CURRENT_USER*/, "Software\\Akelsoft\\AkelPad\\Themes", 0x0001 /*KEY_QUERY_VALUE*/);
      var lpDataSize = AkelPad.MemAlloc(4);

      if (hKey)
      {
        AkelPad.MemCopy(lpDataSize, nColorsSize, DT_DWORD);

        if (oSys.Call("Advapi32::RegQueryValueExW", hKey, oView[sViewName].ThemeName, 0, 0, lpColors, lpDataSize) == 0 /*ERROR_SUCCESS*/)
          AkelPad.MemCopy(lpColors, 0x0001FFFE /*AECLR_ALL*/, DT_DWORD);

        oSys.Call("Advapi32::RegCloseKey", hKey);
      }

      AkelPad.MemFree(lpDataSize);
    }
    else
    {
      var nBufSize = (nColorsSize * 2 + 1) * 2;
      var lpBuffer = AkelPad.MemAlloc(nBufSize);
      var sThemeData;
      var i;

      oSys.Call("Kernel32::GetPrivateProfileStringW", "Themes", oView[sViewName].ThemeName, 0, lpBuffer, nBufSize / 2, AkelPad.GetAkelDir(0 /*ADTYPE_ROOT*/) + "\\AkelPad.ini");

      if (sThemeData = AkelPad.MemRead(lpBuffer, DT_UNICODE))
      {
        sThemeData = "FEFF0100" + sThemeData.substr(8); //0x0001FFFE = AECLR_ALL (AEM_SETCOLORS flags)

        for (i = 0; i < sThemeData.length; i += 2)
          AkelPad.MemCopy(lpColors + i / 2, parseInt("0x" + sThemeData.substr(i, 2)), DT_BYTE);
      }

      AkelPad.MemFree(lpBuffer);
    }
  }

  if (oPlug.CoderTheme.IsRunning())
    AkelPad.Call("Coder::Settings", 5, "Default");

  AkelPad.SetFrameInfo(0, 72 /*FIS_COLORS*/, lpColors);
  AkelPad.MemFree(lpColors);
}

function ChangeCoderTheme(sViewName)
{
  if ((oView[sViewName].CoderTheme < 2) && IsPluginExists(oPlug.CoderTheme.Name))
  {
    if (oView[sViewName].CoderTheme == 1)
    {
      if (! oPlug.CoderTheme.IsRunning())
        oPlug.CoderTheme.Switch();

      AkelPad.Call("Coder::Settings", 5, oView[sViewName].CoderThemeName);
    }
    else
    {
      if (oPlug.CoderTheme.IsRunning())
        oPlug.CoderTheme.Switch();
    }
  }
}

function SetThemeName(sName)
{
  var aTheme = ["<Standard>"];
  var oRect  = {};
  var hMenu  = oSys.Call("User32::CreatePopupMenu");
  var nCmd;
  var nX, nY;
  var i;

  FillThemeArray(aTheme);

  GetWindowPos(aWnd[IDTHEMENAME][HWND], oRect);

  for (i = 0; i < aTheme.length; ++i)
    oSys.Call("User32::AppendMenuW", hMenu, 0 /*MF_STRING*/, i + 1, aTheme[i]);

  nCmd = oSys.Call("User32::TrackPopupMenu", hMenu, 0x0184 /*TPM_NONOTIFY|TPM_RETURNCMD|TPM_CENTERALIGN*/, oRect.X + oRect.W / 2, oRect.Y + oRect.H, 0, hWndDlg, 0);

  oSys.Call("User32::DestroyMenu", hMenu);

  if (nCmd)
  {
    oView[sName].ThemeName = aTheme[nCmd - 1];
    oSys.Call("User32::SetWindowTextW", aWnd[IDTHEMENAME][HWND], oView[sName].ThemeName);
  }
}

function FillThemeArray(aTheme)
{
  if (IsSettingsInRegistry())
  {
    var nNameMaxLen = 16383;
    var lpNameLen   = AkelPad.MemAlloc(4);
    var lpName      = AkelPad.MemAlloc((nNameMaxLen + 1) * 2);
    var hKey        = GetRegKeyHandle(0x80000001 /*HKEY_CURRENT_USER*/, "Software\\Akelsoft\\AkelPad\\Themes", 0x0001 /*KEY_QUERY_VALUE*/);
    var nIndex      = 0;
    var sValueName;

    if (hKey)
    {
      AkelPad.MemCopy(lpNameLen, nNameMaxLen, DT_DWORD);

      while (oSys.Call("Advapi32::RegEnumValueW", hKey, nIndex, lpName, lpNameLen, 0, 0, 0, 0) == 0 /*ERROR_SUCCESS*/)
      {
        if (sValueName = AkelPad.MemRead(lpName, DT_UNICODE))
          aTheme.push(sValueName);

        AkelPad.MemCopy(lpNameLen, nNameMaxLen, DT_DWORD);
        ++nIndex;
      }

      oSys.Call("Advapi32::RegCloseKey", hKey);
    }

    AkelPad.MemFree(lpNameLen);
    AkelPad.MemFree(lpName);
  }
  else
  {
    var nBufSize = 32767 * 2;
    var lpBuffer = AkelPad.MemAlloc(nBufSize);
    var lpKey    = lpBuffer;
    var sKey;

    if (oSys.Call("Kernel32::GetPrivateProfileSectionW", "Themes", lpBuffer, nBufSize / 2, AkelPad.GetAkelDir(0 /*ADTYPE_ROOT*/) + "\\AkelPad.ini"))
    {
      do
      {
        if (sKey = AkelPad.MemRead(lpKey, DT_UNICODE))
        {
          lpKey += (sKey.length + 1) * 2;
          if (sKey = sKey.substr(0, sKey.indexOf("=")))
            aTheme.push(sKey);
        }
      }
      while (sKey);
    }

    AkelPad.MemFree(lpBuffer);
  }
}

function SetCoderThemeName(sName)
{
  var aTheme = [
    "Default",
    "Active4D",
    "Bespin",
    "Cobalt",
    "Dawn",
    "Earth",
    "iPlastic",
    "Lazy",
    "Mac Classic",
    "Monokai",
    "Solarized Light",
    "Solarized Dark",
    "SpaceCadet",
    "Sunburst",
    "Twilight",
    "Zenburn"];
  var oRect = {};
  var hMenu = oSys.Call("User32::CreatePopupMenu");
  var nCmd;
  var nX, nY;
  var i;

  FillCoderThemeArray(aTheme);

  GetWindowPos(aWnd[IDCODERTHEMENAME][HWND], oRect);

  for (i = 0; i < aTheme.length; ++i)
  {
    if (aTheme[i])
      oSys.Call("User32::AppendMenuW", hMenu, 0 /*MF_STRING*/, i + 1, aTheme[i]);
    else
      oSys.Call("User32::AppendMenuW", hMenu, 0x0800 /*MF_SEPARATOR*/, 0);
  }

  nCmd = oSys.Call("User32::TrackPopupMenu", hMenu, 0x0184 /*TPM_NONOTIFY|TPM_RETURNCMD|TPM_CENTERALIGN*/, oRect.X + oRect.W / 2, oRect.Y + oRect.H, 0, hWndDlg, 0);

  oSys.Call("User32::DestroyMenu", hMenu);

  if (nCmd)
  {
    oView[sName].CoderThemeName = aTheme[nCmd - 1];
    oSys.Call("User32::SetWindowTextW", aWnd[IDCODERTHEMENAME][HWND], oView[sName].CoderThemeName);
  }
}

function FillCoderThemeArray(aTheme)
{
  var nBufSize = 4096;
  var lpBuffer = AkelPad.MemAlloc(nBufSize);
  var lpDataSize;
  var hKey;
  var sThemes;
  var aTemp;
  var i;

  if (IsSettingsInRegistry())
  {
    if (hKey = GetRegKeyHandle(0x80000001 /*HKEY_CURRENT_USER*/, "Software\\Akelsoft\\AkelPad\\Plugs\\Coder", 0x0001 /*KEY_QUERY_VALUE*/))
    {
      lpDataSize = AkelPad.MemAlloc(4);
      AkelPad.MemCopy(lpDataSize, nBufSize, DT_DWORD);

      oSys.Call("Advapi32::RegQueryValueExW", hKey, "VarThemeList", 0, 0, lpBuffer, lpDataSize);

      oSys.Call("Advapi32::RegCloseKey", hKey);
      AkelPad.MemFree(lpDataSize);
    }
  }
  else
    oSys.Call("Kernel32::GetPrivateProfileStringW", "Options", "VarThemeList", 0, lpBuffer, nBufSize / 2, AkelPad.GetAkelDir(4 /*ADTYPE_PLUGS*/) + "\\Coder.ini");

  if (sThemes = AkelPad.MemRead(lpBuffer, DT_UNICODE))
  {
    aTemp = sThemes.split("|");
    aTheme.push("");
    for (i = 0; i < aTemp.length; ++i)
      aTheme.push(aTemp[i]);
  }

  AkelPad.MemFree(lpBuffer);
}

function GetRegKeyHandle(hParentKey, sSubKey, nAccess)
{
  var hKey   = 0;
  var lpKey  = AkelPad.MemAlloc(4);
  var nError = oSys.Call("Advapi32::RegOpenKeyExW",
                         hParentKey, //hKey
                         sSubKey,    //lpSubKey
                         0,          //ulOptions
                         nAccess,    //samDesired
                         lpKey);     //phkResult

  if (! nError)
    hKey = AkelPad.MemRead(lpKey, DT_DWORD);

  AkelPad.MemFree(lpKey);

  return hKey;
}

function WarningBox(hWnd, sText)
{
  AkelPad.MessageBox(hWnd, sText, sScriptName, 0x00000030 /*MB_ICONWARNING*/);
}

function ReadWriteIni(bWrite)
{
  var sIniFile = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";
  var oRect;
  var sIniTxt;
  var oError;
  var i, n;

  if (bWrite)
  {
    GetWindowPos(hWndDlg, oRect = {});

    sIniTxt = 'nWndPosX=' + oRect.X + ';\r\n' +
              'nWndPosY=' + oRect.Y + ';\r\n' +
              'nWndPosW=' + oRect.W + ';\r\n' +
              'nView='    + GetCurSelLB() + ';\r\n';

    for (i in oView)
    {
      sIniTxt += 'oView["' + i.replace(/[\\"]/g, "\\$&") + '"]={';
      for (n in oView[i])
        sIniTxt += '"' + n + '":' + ((typeof oView[i][n] == 'string') ? '"' : '') + oView[i][n] + ((typeof oView[i][n] == 'string') ? '"' : '') + ',';

      if (sIniTxt.slice(-1) == ",")
        sIniTxt = sIniTxt.slice(0, -1);

      sIniTxt += '};\r\n';
    }

    WriteFile(sIniFile, null, sIniTxt, 1);
  }

  else if (IsFileExists(sIniFile))
  {
    try
    {
      eval(AkelPad.ReadFile(sIniFile));
    }
    catch (oError)
    {
    }
  }
}
