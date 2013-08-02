// CalculatorBin.js - ver. 2013-08-02 (x86/x64)
//
// Bitwise calculator.
//
// Run in AkelPad window:
//   Call("Scripts::Main", 1, "CalculatorBin.js")
// Run from command line (required registration: regsvr32.exe Scripts.dll):
//   wscript.exe CalculatorBin.js
//
// Hotkeys:
// Alt+(F1,F2,F3) - set focus to binA, hexA, decA
// Alt+(1,2,3) - set focus to binB, hexB, decB
// Ctrl+Alt+(arrows,PgUp,PgDn,Home,End) - move window

if (typeof AkelPad == "undefined")
{
  try
  {
    AkelPad = new ActiveXObject("AkelPad.Document");
  }
  catch (oError)
  {
    WScript.Echo("You need register Scripts.dll");
    WScript.Quit();
  }
}

var oSys       = AkelPad.SystemFunction();
var hInstDLL   = AkelPad.GetInstanceDll();
var sClassName = "AkelPad::Scripts::" + WScript.ScriptName + "::" + hInstDLL;
var hDlg;

if (hDlg = oSys.Call("User32::FindWindowExW", 0, 0, sClassName, 0))
{
  if (! oSys.Call("User32::IsWindowVisible", hDlg))
    oSys.Call("User32::ShowWindow", hDlg, 8 /*SW_SHOWNA*/);
  if (oSys.Call("User32::IsIconic", hDlg))
    oSys.Call("User32::ShowWindow", hDlg, 9 /*SW_RESTORE*/);

  oSys.Call("User32::SetForegroundWindow", hDlg);
}
else
{
  var hIcon = oSys.Call("User32::LoadImageW",
        hInstDLL,   //hinst
        101,        //lpszName
        1,          //uType=IMAGE_ICON
        0,          //cxDesired
        0,          //cyDesired
        0x00000040);//fuLoad=LR_DEFAULTSIZE

  var hMainWnd = AkelPad.GetMainWnd();
  var oFSO     = new ActiveXObject("Scripting.FileSystemObject");
  var aOper    = [["|", "OR"], ["&", "AND"], ["^", "XOR"], ["<<", "LShift"], [">>", "RShift"], [">>>", "URShift"], ["none", ""]];
  var nTextLen = 65;
  var lpText   = AkelPad.MemAlloc(nTextLen * 2);
  var hBitmap  = CreateCaretBitmap();
  var hFocus;
  var hSubClass;
  var bCloseCB;

  //.ini settings
  var nDlgX     = 100;
  var nDlgY     = 120;
  var bOverType = true;
  var bSigned   = true;
  var nBits     = 32;
  var nOper     = 0;
  var bNotA     = false;
  var bNotB     = false;
  var sDecA     = "0";
  var sDecB     = "0";
  ReadIni();

  var aDlg       = [];
  var IDNOT      = 1000;
  var IDHEX      = 1001;
  var IDDEC      = 1002;
  var IDBIN      = 1003;
  var IDNOTA     = 1004;
  var IDBINA     = 1005;
  var IDHEXA     = 1006;
  var IDDECA     = 1007;
  var IDOPER     = 1008;
  var IDOPERS    = 1009;
  var IDOPERNAME = 1010;
  var IDNOTB     = 1011;
  var IDBINB     = 1012;
  var IDHEXB     = 1013;
  var IDDECB     = 1014;
  var IDRESULT   = 1015;
  var IDBINR     = 1016;
  var IDHEXR     = 1017;
  var IDDECR     = 1018;
  var IDBITS     = 1019;
  var IDSIGNED   = 1020;
  var IDBYTES    = 1021;
  var IDQWORD    = 1022;
  var IDDWORD    = 1023;
  var IDWORD     = 1024;
  var IDBYTE     = 1025;
  var IDCLEAR    = 1026;
  var IDCLOSE    = 1027;

  //0x50000000 - WS_VISIBLE|WS_CHILD
  //0x50000002 - WS_VISIBLE|WS_CHILD|SS_RIGHT
  //0x50000007 - WS_VISIBLE|WS_CHILD|BS_GROUPBOX
  //0x50010003 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
  //0x50010003 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|CBS_DROPDOWNLIST
  //0x50010009 = WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTORADIOBUTTON
  //0x5081000A - WS_VISIBLE|WS_CHILD|WS_BORDER|WS_TABSTOP|ES_UPPERCASE|ES_RIGHT
  //0x50810802 - WS_VISIBLE|WS_CHILD|WS_BORDER|WS_TABSTOP|ES_READONLY|ES_RIGHT
  aDlg[IDNOT]      = {Class: 'STATIC',   Style: 0x50000000, X:  10, Y:  14, W:  25, H:  13, Txt: 'NOT'};
  aDlg[IDBIN]      = {Class: 'STATIC',   Style: 0x50000002, X:  40, Y:  14, W: 387, H:  13, Txt: 'bin'};
  aDlg[IDHEX]      = {Class: 'STATIC',   Style: 0x50000002, X: 435, Y:  14, W: 132, H:  13, Txt: 'hex'};
  aDlg[IDDEC]      = {Class: 'STATIC',   Style: 0x50000002, X: 575, Y:  14, W: 127, H:  13, Txt: 'dec'};
  aDlg[IDNOTA]     = {Class: 'BUTTON',   Style: 0x50010003, X:  10, Y:  30, W:  25, H:  16, Txt: '~'};
  aDlg[IDBINA]     = {Class: 'EDIT',     Style: 0x5081000A, X:  40, Y:  30, W: 390, H:  19, Txt: ''};
  aDlg[IDHEXA]     = {Class: 'EDIT',     Style: 0x5081000A, X: 435, Y:  30, W: 135, H:  19, Txt: ''};
  aDlg[IDDECA]     = {Class: 'EDIT',     Style: 0x5081000A, X: 575, Y:  30, W: 130, H:  19, Txt: ''};
  aDlg[IDOPER]     = {Class: 'STATIC',   Style: 0x50000000, X: 715, Y:  25, W:  50, H:  13, Txt: '&Operator:'};
  aDlg[IDOPERS]    = {Class: 'COMBOBOX', Style: 0x50010003, X: 715, Y:  41, W:  50, H: 130, Txt: ''};
  aDlg[IDOPERNAME] = {Class: 'STATIC',   Style: 0x50000000, X: 715, Y:  65, W:  50, H:  13, Txt: ''};
  aDlg[IDNOTB]     = {Class: 'BUTTON',   Style: 0x50010003, X:  10, Y:  53, W:  25, H:  16, Txt: '~'};
  aDlg[IDBINB]     = {Class: 'EDIT',     Style: 0x5081000A, X:  40, Y:  53, W: 390, H:  19, Txt: ''};
  aDlg[IDHEXB]     = {Class: 'EDIT',     Style: 0x5081000A, X: 435, Y:  53, W: 135, H:  19, Txt: ''};
  aDlg[IDDECB]     = {Class: 'EDIT',     Style: 0x5081000A, X: 575, Y:  53, W: 130, H:  19, Txt: ''};
  aDlg[IDRESULT]   = {Class: 'STATIC',   Style: 0x50000000, X:  30, Y:  76, W:  55, H:  16, Txt: '='};
  aDlg[IDBINR]     = {Class: 'EDIT',     Style: 0x50810802, X:  40, Y:  76, W: 390, H:  19, Txt: ''};
  aDlg[IDHEXR]     = {Class: 'EDIT',     Style: 0x50810802, X: 435, Y:  76, W: 135, H:  19, Txt: ''};
  aDlg[IDDECR]     = {Class: 'EDIT',     Style: 0x50810802, X: 575, Y:  76, W: 130, H:  19, Txt: ''};
  aDlg[IDBITS]     = {Class: 'STATIC',   Style: 0x50000002, X:  40, Y:  98, W: 387, H:  13, Txt: ''};
  aDlg[IDSIGNED]   = {Class: 'BUTTON',   Style: 0x50010003, X:  40, Y: 130, W:  50, H:  16, Txt: '&Signed'};
  aDlg[IDBYTES]    = {Class: 'BUTTON',   Style: 0x50000007, X: 100, Y: 117, W: 230, H:  35, Txt: ''};
  aDlg[IDQWORD]    = {Class: 'BUTTON',   Style: 0x50010009, X: 110, Y: 130, W:  50, H:  16, Txt: '&Qword'};
  aDlg[IDDWORD]    = {Class: 'BUTTON',   Style: 0x50010009, X: 170, Y: 130, W:  50, H:  16, Txt: '&Dword'};
  aDlg[IDWORD]     = {Class: 'BUTTON',   Style: 0x50010009, X: 230, Y: 130, W:  50, H:  16, Txt: '&Word'};
  aDlg[IDBYTE]     = {Class: 'BUTTON',   Style: 0x50010009, X: 285, Y: 130, W:  40, H:  16, Txt: '&Byte'};
  aDlg[IDCLEAR]    = {Class: 'BUTTON',   Style: 0x50010000, X: 620, Y: 130, W:  70, H:  23, Txt: '&Clear'};
  aDlg[IDCLOSE]    = {Class: 'BUTTON',   Style: 0x50010000, X: 695, Y: 130, W:  70, H:  23, Txt: 'Close'};

  AkelPad.WindowRegisterClass(sClassName);

  hDlg = oSys.Call("User32::CreateWindowExW",
    0,              //dwExStyle
    sClassName,     //lpClassName
    "CalculatorBin",//lpWindowName
    0x90CA0000,     //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX
    nDlgX,          //x
    nDlgY,          //y
    781,            //nWidth
    194,            //nHeight
    hMainWnd,       //hWndParent
    0,              //ID
    hInstDLL,       //hInstance
    DialogCallback);//Script function callback. To use it class must be registered by WindowRegisterClass.

  AkelPad.ScriptNoMutex();
  AkelPad.WindowGetMessage();

  AkelPad.WindowUnregisterClass(sClassName);
  AkelPad.MemFree(lpText);
  oSys.Call("User32::DestroyIcon", hIcon);
  oSys.Call("Gdi32::DeleteObject", hBitmap);
}

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    var hGuiFont = oSys.Call("Gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
    var i;

    for (i = 1000; i < aDlg.length; ++i)
    {
      aDlg[i].Handle = oSys.Call("User32::CreateWindowExW",
        0,            //dwExStyle
        aDlg[i].Class,//lpClassName
        aDlg[i].Txt,  //lpWindowName
        aDlg[i].Style,//dwStyle
        aDlg[i].X,    //x
        aDlg[i].Y,    //y
        aDlg[i].W,    //nWidth
        aDlg[i].H,    //nHeight
        hWnd,         //hWndParent
        i,            //ID
        hInstDLL,     //hInstance
        0);           //lpParam
      AkelPad.SendMessage(aDlg[i].Handle, 48 /*WM_SETFONT*/, hGuiFont, true);
    }

    AkelPad.SendMessage(hWnd, 0x0080 /*WM_SETICON*/, 0 /*ICON_SMALL*/, hIcon);
    AkelPad.SendMessage(hWnd, 0x0080 /*WM_SETICON*/, 1 /*ICON_BIG*/, hIcon);

    AkelPad.SendMessage(aDlg[IDSIGNED].Handle, 0x00F1 /*BM_SETCHECK*/, bSigned, 0);
    AkelPad.SendMessage(aDlg[IDQWORD].Handle,  0x00F1 /*BM_SETCHECK*/, (nBits == 64), 0);
    AkelPad.SendMessage(aDlg[IDDWORD].Handle,  0x00F1 /*BM_SETCHECK*/, (nBits == 32), 0);
    AkelPad.SendMessage(aDlg[IDWORD].Handle,   0x00F1 /*BM_SETCHECK*/, (nBits == 16), 0);
    AkelPad.SendMessage(aDlg[IDBYTE].Handle,   0x00F1 /*BM_SETCHECK*/, (nBits ==  8), 0);
    AkelPad.SendMessage(aDlg[IDNOTA].Handle,   0x00F1 /*BM_SETCHECK*/, bNotA, 0);
    AkelPad.SendMessage(aDlg[IDNOTB].Handle,   0x00F1 /*BM_SETCHECK*/, bNotB, 0);

    for (i = 0; i < aOper.length; ++i)
      oSys.Call("User32::SendMessageW", aDlg[IDOPERS].Handle, 0x143 /*CB_ADDSTRING*/, 0, aOper[i][0]);
    AkelPad.SendMessage(aDlg[IDOPERS].Handle, 0x14E /*CB_SETCURSEL*/, nOper, 0);

    ShowOperator();
    SetBytes();
    oSys.Call("User32::SetWindowTextW", aDlg[IDDECA].Handle, sDecA);
    oSys.Call("User32::SetWindowTextW", aDlg[IDDECB].Handle, sDecB);
    SetValuesFromID(IDDECA);
    SetValuesFromID(IDDECB);
    Calculate();

    hFocus = aDlg[IDBINA].Handle;
  }

  else if ((uMsg == 6 /*WM_ACTIVATE*/) && (! wParam))
    hFocus = oSys.Call("User32::GetFocus");

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("User32::SetFocus", hFocus);

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if ((wParam >= 0x21 /*VK_PRIOR*/) && (wParam <= 0x28 /*VK_DOWN*/) && Ctrl() && !Shift() && Alt())
      MoveWindow(hWnd, wParam);
    else if ((wParam == 27 /*VK_ESCAPE*/) && (bCloseCB))
      oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 260) //WM_SYSKEYDOWN
  {
    if ((wParam >= 0x70 /*VK_F1*/) && (wParam <= 0x72 /*VK_F3*/))
      oSys.Call("User32::SetFocus", aDlg[IDBINA + wParam - 0x70].Handle);
    else if ((wParam >= 0x31 /*1 key*/) && (wParam <= 0x33 /*3 key*/))
      oSys.Call("User32::SetFocus", aDlg[IDBINB + wParam - 0x31].Handle);
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    var nLowParam = LoWord(wParam);
    var nHiwParam = HiWord(wParam);
    bCloseCB = true;

    if ((nLowParam >= IDBINA) && (nLowParam <= IDDECA) || (nLowParam >= IDBINB) && (nLowParam <= IDDECB) || (nLowParam >= IDBINR) && (nLowParam <= IDDECR))
    {
      if (nHiwParam == 0x0100 /*EN_SETFOCUS*/)
      {
        AkelPad.SendMessage(lParam, 0x00B1 /*EM_SETSEL*/, LoWord(aDlg[nLowParam].Sel), HiWord(aDlg[nLowParam].Sel));
        CreateCaret(lParam);
        hSubClass = AkelPad.WindowSubClass(lParam, EditCallback, 256 /*WM_KEYDOWN*/, 258 /*WM_CHAR*/);
      }
      else if (nHiwParam == 0x0200 /*EN_KILLFOCUS*/)
      {
        aDlg[nLowParam].Sel = AkelPad.SendMessage(lParam, 0x00B0 /*EM_GETSEL*/, 0, 0);
        AkelPad.WindowUnsubClass(lParam);
      }
      else if (nHiwParam == 0x0300 /*EN_CHANGE*/)
      {
        if (oSys.Call("User32::GetFocus") == lParam)
        {
          SetValuesFromID(nLowParam);
          Calculate();
        }
      }
    }
    else if (nLowParam == IDNOTA)
    {
      bNotA = ! bNotA;
      Calculate();
    }
    else if (nLowParam == IDNOTB)
    {
      bNotB = ! bNotB;
      Calculate();
    }
    else if (nLowParam == IDOPERS)
    {
      if (nHiwParam == 1 /*CBN_SELCHANGE*/)
      {
        nOper = AkelPad.SendMessage(lParam, 0x147 /*CB_GETCURSEL*/, 0, 0);
        ShowOperator();
        Calculate();
      }
      else if (nHiwParam == 3 /*CBN_SETFOCUS*/)
        hSubClass = AkelPad.WindowSubClass(lParam, ComboCallback, 256 /*WM_KEYDOWN*/);
      else if (nHiwParam == 4 /*CBN_KILLFOCUS*/)
        AkelPad.WindowUnsubClass(lParam);
      else if (nHiwParam == 8 /*CBN_CLOSEUP*/)
        bCloseCB = false;
    }
    else if (nLowParam == IDSIGNED)
    {
      bSigned = ! bSigned;
      SetBytes();
      SetValuesFromID(IDBINA);
      SetValuesFromID(IDBINB);
      Calculate();
    }
    else if ((nLowParam >= IDQWORD) && (nLowParam <= IDBYTE))
    {
      nBits = Math.pow(2, IDQWORD - nLowParam + 3) * 8;
      SetBytes();
      SetValuesFromID(IDBINA);
      SetValuesFromID(IDBINB);
      Calculate();
    }
    else if (nLowParam == IDCLEAR)
    {
      oSys.Call("User32::SetWindowTextW", aDlg[IDDECA].Handle, "0");
      oSys.Call("User32::SetWindowTextW", aDlg[IDDECB].Handle, "0");
      SetValuesFromID(IDDECA);
      SetValuesFromID(IDDECB);
      Calculate();
    }
    else if (nLowParam == IDCLOSE)
      oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    WriteIni();
    oSys.Call("User32::DestroyWindow", hWnd);
  }

  else if (uMsg == 2) //WM_DESTROY
    oSys.Call("User32::PostQuitMessage", 0);

  return 0;
}

function EditCallback(hWnd, uMsg, wParam, lParam)
{
  var nID = oSys.Call("User32::GetDlgCtrlID", hWnd);

  if (uMsg == 256) //WM_KEYDOWN
  {
    if ((wParam == 0x2D /*VK_INSERT*/) && (! Ctrl()) && (! Shift()))
    {
      bOverType = ! bOverType;
      CreateCaret(hWnd);
    }
    else if ((wParam >= 0x21 /*VK_PRIOR*/) && (wParam <= 0x28 /*VK_DOWN*/) && Ctrl() && !Shift() && Alt())
      AkelPad.WindowNoNextProc(hSubClass);
  }
  else if (uMsg == 258) //WM_CHAR
  {
    if ((wParam == 3 /*Ctrl+C*/) || (wParam == 8 /*BackSpace*/) || (wParam == 22 /*Ctrl+V*/) || (wParam == 24 /*Ctrl+X*/) || (wParam == 26 /*Ctrl+Z*/))
      return 0;

    if (wParam == 1 /*Ctrl+A*/)
    {
      AkelPad.SendMessage(hWnd, 0x00B1 /*EM_SETSEL*/, 0, -1);
      AkelPad.WindowNoNextProc(hSubClass);
      return 0;
    }

    aDlg[nID].Sel = AkelPad.SendMessage(hWnd, 0x00B0 /*EM_GETSEL*/, 0, 0);

    if ((nID == IDBINA) || (nID == IDBINB))
    {
      if ((wParam == 48 /*0*/) || (wParam == 49 /*1*/))
      {
        if (bOverType && (LoWord(aDlg[nID].Sel) == HiWord(aDlg[nID].Sel)))
        {
          AkelPad.SendMessage(hWnd, 0x00B1 /*EM_SETSEL*/, LoWord(aDlg[nID].Sel), LoWord(aDlg[nID].Sel) + 1);
          oSys.Call("User32::SendMessageW", hWnd, 0x00C2 /*EM_REPLACESEL*/, true, String.fromCharCode(wParam));
          AkelPad.WindowNoNextProc(hSubClass);
        }
      }
      else
        AkelPad.WindowNoNextProc(hSubClass);
    }
    else if ((nID == IDHEXA) || (nID == IDHEXB))
    {
      if ((wParam >= 48 /*0*/) && (wParam <= 57 /*9*/) || (wParam >= 65 /*A*/) && (wParam <= 70 /*F*/) || (wParam >= 97 /*a*/) && (wParam <= 102 /*f*/) || (wParam == 45 /*-*/))
      {
        if (bOverType && (LoWord(aDlg[nID].Sel) == HiWord(aDlg[nID].Sel)))
        {
          if ((wParam != 45 /*-*/) || bSigned && (LoWord(aDlg[nID].Sel) == 0))
          {
            AkelPad.SendMessage(hWnd, 0x00B1 /*EM_SETSEL*/, LoWord(aDlg[nID].Sel), LoWord(aDlg[nID].Sel) + 1);
            oSys.Call("User32::SendMessageW", hWnd, 0x00C2 /*EM_REPLACESEL*/, true, String.fromCharCode(wParam));
          }
          AkelPad.WindowNoNextProc(hSubClass);
        }
        else if ((wParam == 45 /*-*/) && ((! bSigned) || (LoWord(aDlg[nID].Sel) > 0) || (HiWord(aDlg[nID].Sel) == 0) && (GetWindowText(hWnd).charAt(0) == "-")))
          AkelPad.WindowNoNextProc(hSubClass);
      }
      else
        AkelPad.WindowNoNextProc(hSubClass);
    }
    else if ((nID == IDDECA) || (nID == IDDECB))
    {
      if ((wParam >= 48 /*0*/) && (wParam <= 57 /*9*/) || (wParam == 45 /*-*/))
      {
        if (bOverType && (LoWord(aDlg[nID].Sel) == HiWord(aDlg[nID].Sel)))
        {
          if ((wParam != 45 /*-*/) || bSigned && (LoWord(aDlg[nID].Sel) == 0))
          {
            AkelPad.SendMessage(hWnd, 0x00B1 /*EM_SETSEL*/, LoWord(aDlg[nID].Sel), LoWord(aDlg[nID].Sel) + 1);
            oSys.Call("User32::SendMessageW", hWnd, 0x00C2 /*EM_REPLACESEL*/, true, String.fromCharCode(wParam));
          }
          AkelPad.WindowNoNextProc(hSubClass);
        }
        else if ((wParam == 45 /*-*/) && ((! bSigned) || (LoWord(aDlg[nID].Sel) > 0) || (HiWord(aDlg[nID].Sel) == 0) && (GetWindowText(hWnd).charAt(0) == "-")))
          AkelPad.WindowNoNextProc(hSubClass);
      }
      else
        AkelPad.WindowNoNextProc(hSubClass);
    }
  }

  return 0;
}

function ComboCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 256) //WM_KEYDOWN
  {
    if ((wParam >= 0x21 /*VK_PRIOR*/) && (wParam <= 0x28 /*VK_DOWN*/) && Ctrl() && !Shift() && Alt())
    {
      AkelPad.SendMessage(hWnd, 0x014F /*CB_SHOWDROPDOWN*/, false, 0);
      AkelPad.WindowNoNextProc(hSubClass);
    }
  }

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

function Alt()
{
  return Boolean(oSys.Call("user32::GetKeyState", 0x12 /*VK_MENU*/) & 0x8000);
}

function LoWord(nDwNum)
{
  return nDwNum & 0xFFFF;
}

function HiWord(nDwNum)
{
  return (nDwNum >> 16) & 0xFFFF;
}

function CreateCaretBitmap()
{
  var hDC     = oSys.Call("Gdi32::CreateCompatibleDC", 0);
  var hBitmap = oSys.Call("Gdi32::CreateBitmap", 6, 14, 1, 1, 0);
  var hBmOld  = oSys.Call("Gdi32::SelectObject", hDC, hBitmap);

  oSys.Call("Gdi32::SelectObject", hDC, oSys.Call("Gdi32::GetStockObject", 0 /*WHITE_BRUSH*/));
  oSys.Call("Gdi32::SelectObject", hDC, oSys.Call("Gdi32::GetStockObject", 6 /*WHITE_PEN*/));
  oSys.Call("Gdi32::Rectangle", hDC, 0, 12, 6, 14);

  oSys.Call("Gdi32::SelectObject", hDC, hBmOld);
  oSys.Call("Gdi32::DeleteDC", hDC);

  return hBitmap;
}

function CreateCaret(hWnd)
{
  oSys.Call("User32::CreateCaret", hWnd, (bOverType ? hBitmap : 0), 1, 13);
  oSys.Call("User32::ShowCaret", hWnd);
}

function GetWindowPos(hWnd, oRect)
{
  var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)

  if (hWnd)
    oSys.Call("User32::GetWindowRect", hWnd, lpRect);
  else
    oSys.Call("User32::SystemParametersInfoW", 0x30 /*SPI_GETWORKAREA*/, 0, lpRect, 0);

  oRect.X = AkelPad.MemRead(lpRect,      3 /*DT_DWORD*/);
  oRect.Y = AkelPad.MemRead(lpRect +  4, 3 /*DT_DWORD*/);
  oRect.W = AkelPad.MemRead(lpRect +  8, 3 /*DT_DWORD*/) - oRect.X;
  oRect.H = AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/) - oRect.Y;

  AkelPad.MemFree(lpRect);
}

function GetWindowText(hWnd)
{
  oSys.Call("User32::GetWindowTextW", hWnd, lpText, nTextLen);
  return AkelPad.MemRead(lpText, 1 /*DT_UNICODE*/);
}

function MoveWindow(hWnd, nKey)
{
  var oRectWA = {};
  var oRect   = {};
  var nStep   = 20;

  GetWindowPos(0, oRectWA);
  GetWindowPos(hWnd, oRect);

  if (nKey == 0x21 /*VK_PRIOR*/)
    oRect.Y = oRectWA.Y;
  else if (nKey == 0x22 /*VK_NEXT*/)
    oRect.Y = oRectWA.Y + oRectWA.H - oRect.H;
  else if (nKey == 0x23 /*VK_END*/)
    oRect.X = oRectWA.X + oRectWA.W - oRect.W;
  else if (nKey == 0x24 /*VK_HOME*/)
    oRect.X = oRectWA.X;
  else if (nKey == 0x25 /*VK_LEFT*/)
  {
    if (oRect.X > oRectWA.X)
      oRect.X = (oRect.X - oRectWA.X > nStep) ? oRect.X - nStep : oRectWA.X;
  }
  else if (nKey == 0x26 /*VK_UP*/)
  {
    if (oRect.Y > oRectWA.Y)
      oRect.Y = (oRect.Y - oRectWA.Y > nStep) ? oRect.Y - nStep : oRectWA.Y;
  }
  else if (nKey == 0x27 /*VK_RIGHT*/)
  {
    if (oRect.X + oRect.W < oRectWA.X + oRectWA.W)
      oRect.X = (oRectWA.X + oRectWA.W - oRect.X - oRect.W > nStep) ? oRect.X + nStep : oRectWA.X + oRectWA.W - oRect.W;
  }
  else if (nKey == 0x28 /*VK_DOWN*/)
  {
    if (oRect.Y + oRect.H < oRectWA.Y + oRectWA.H)
      oRect.Y = (oRectWA.Y + oRectWA.H - oRect.Y - oRect.H > nStep) ? oRect.Y + nStep : oRectWA.Y + oRectWA.H - oRect.H;
  }

  oSys.Call("user32::SetWindowPos", hWnd, 0, oRect.X, oRect.Y, 0, 0, 0x15 /*SWP_NOZORDER|SWP_NOACTIVATE|SWP_NOSIZE*/);
}

function ShowOperator()
{
  oSys.Call("User32::SetWindowTextW", aDlg[IDOPERNAME].Handle, aOper[nOper][1]);

  for (var i = IDNOTB; i <= IDDECB; ++i)
    oSys.Call("User32::ShowWindow", aDlg[i].Handle, (nOper != 6));
}

function SetBytes()
{
  var nHexLen = nBits / 4 + bSigned;
  var nDecLen = parseInt(("FFFFFFFFFFFFFFFF").substr(0, nBits / 4), 16).toString().length + bSigned;
  var aBinVal = [GetWindowText(aDlg[IDBINA].Handle), GetWindowText(aDlg[IDBINB].Handle)];
  var i;

  AkelPad.SendMessage(aDlg[IDBINA].Handle, 0x00C5 /*EM_LIMITTEXT*/, nBits, 0);
  AkelPad.SendMessage(aDlg[IDBINB].Handle, 0x00C5 /*EM_LIMITTEXT*/, nBits, 0);
  AkelPad.SendMessage(aDlg[IDHEXA].Handle, 0x00C5 /*EM_LIMITTEXT*/, nHexLen, 0);
  AkelPad.SendMessage(aDlg[IDHEXB].Handle, 0x00C5 /*EM_LIMITTEXT*/, nHexLen, 0);
  AkelPad.SendMessage(aDlg[IDDECA].Handle, 0x00C5 /*EM_LIMITTEXT*/, nDecLen, 0);
  AkelPad.SendMessage(aDlg[IDDECB].Handle, 0x00C5 /*EM_LIMITTEXT*/, nDecLen, 0);

  for (i = 0; i < 2; ++i)
  {
    if (aBinVal[i].length < nBits)
    {
      if (bSigned && (aBinVal[i].charAt(0) == "1"))
        aBinVal[i] = Pad(aBinVal[i], nBits, "L", "1");
      else
        aBinVal[i] = Pad(aBinVal[i], nBits, "L", "0");
    }
    else
      aBinVal[i] = aBinVal[i].slice(-nBits);

    oSys.Call("User32::SetWindowTextW", aDlg[(i == 0) ? IDBINA : IDBINB].Handle, aBinVal[i]);
  }

  oSys.Call("User32::SetWindowTextW", aDlg[IDBITS].Handle, ("7654321076543210765432107654321076543210765432107654321076543210").substr(0, nBits));
}

function SetValuesFromID(nID)
{
  var sValue = GetWindowText(aDlg[nID].Handle);
  var sBin;

  switch (nID)
  {
    case IDBINA:
    case IDBINB:
      oSys.Call("User32::SetWindowTextW", aDlg[nID + 1].Handle, BinToHex(sValue));
      oSys.Call("User32::SetWindowTextW", aDlg[nID + 2].Handle, BinToDec(sValue));
      break;
    case IDHEXA:
    case IDHEXB:
      sBin = HexToBin(sValue);
      oSys.Call("User32::SetWindowTextW", aDlg[nID - 1].Handle, sBin);
      oSys.Call("User32::SetWindowTextW", aDlg[nID + 1].Handle, BinToDec(sBin));
      break;
    case IDDECA:
    case IDDECB:
      sBin = DecToBin(sValue);
      oSys.Call("User32::SetWindowTextW", aDlg[nID - 2].Handle, sBin);
      oSys.Call("User32::SetWindowTextW", aDlg[nID - 1].Handle, BinToHex(sBin));
      break;
  }
}

function NotBin(sBin)
{
  return sBin.replace(/./g, function(sChar) {return (sChar == "0") ? "1": "0";});
}

function OppositeBin(sBin)
{
  sBin = NotBin(sBin);
  return Pad(sBin.substr(0, sBin.lastIndexOf("0")) + "1", sBin.length, "R", "0");
}

function BinToDec(sBin)
{
  var sSign = "";
  var sDec  = "";
  var i, n;

  if ((sBin.length == nBits) && (! /[^01]/.test(sBin)))
  {
    if (bSigned && (sBin.charAt(0) == "1"))
    {
      sSign = "-";
      sBin  = OppositeBin(sBin);
    }

    //Horner scheme
    sDec = "0";
    for (i = 0; i < sBin.length; ++i)
    {
      sDec = MultiplyBy2(sDec);
      if (sBin.charAt(i) == "1")
      {
        n = sDec.search(/[^9]9*$/);
        if (n >= 0)
          sDec = Pad(sDec.substr(0, n) + (parseInt(sDec.charAt(n), 10) + 1).toString(10), sDec.length, "R", "0");
        else
          sDec = Pad("1", sDec.length + 1, "R", "0");
      }
    }
  }

  return sSign + sDec;
}

function MultiplyBy2(sDec)
{
  var sOut   = "";
  var nCarry = 0;
  var nSum;
  var i;

  for (i = sDec.length - 1; i >= 0; --i)
  {
    nSum   = parseInt(sDec.charAt(i), 10) * 2 + nCarry;
    nCarry = Math.floor(nSum / 10);
    sOut   = nSum.toString(10).slice(-1) + sOut;
  }

  if (nCarry) sOut = "1" + sOut;

  return sOut;
}

function DecToBin(sDec)
{
  var sBin = "";
  var nRem;
  var sDiv;
  var nDiv;
  var bSign;
  var sMax;
  var i;

  if (bSigned && /^-?\d+$/.test(sDec) || /^\d+$/.test(sDec))
  {
    if (sDec.charAt(0) == "-")
    {
      if (/[^0]/.test(sDec.substr(1)))
      {
        sDec  = sDec.substr(1);
        bSign = true;
      }
      else
        sDec = "0";
    }

    do
    {
      nRem = 0;
      sDiv = "";
      for (i = 0; i < sDec.length; ++i)
      {
        nDiv = nRem * 10 + parseInt(sDec.charAt(i), 10);
        nRem = nDiv % 2;
        sDiv += Math.floor(nDiv / 2).toString(10);
      }

      if ((sDiv.charAt(0) == "0") && (sDiv.length > 1))
        sDiv = sDiv.substr(1);

      sDec = sDiv;
      sBin = nRem.toString(10) + sBin;
    }
    while (sDiv != "0");

    if (sBin.length > nBits)
      sBin = "";
    else
      sBin = Pad(sBin, nBits, "L", "0");

    if (bSigned && sBin)
    {
      sMax = Pad("1", nBits, "R", "0");
      if (bSign)
      {
        if (sBin > sMax)
          sBin = "";
        else
          sBin = OppositeBin(sBin);
      }
      else if (sBin >= sMax)
        sBin = "";
    }
  }

  return sBin;
}

function BinToHex(sBin)
{
  var sSign = "";
  var sHex  = "";
  var i;

  if ((sBin.length == nBits) && (! /[^01]/.test(sBin)))
  {
    if (bSigned && (sBin.charAt(0) == "1"))
    {
      sSign = "-";
      sBin  = OppositeBin(sBin);
    }

    i = sBin.indexOf("1");
    if (i >= 0)
    {
      i -= (i % 4);
      for (i; i < sBin.length; i += 4)
        sHex += parseInt(sBin.substr(i, 4), 2).toString(16).toUpperCase();
    }
    else
      sHex = "0";
  }

  return sSign + sHex;
}

function HexToBin(sHex)
{
  var sBin = "";
  var bSign;
  var sMax;
  var i;

  if (bSigned && /^-?[\dA-F]+$/i.test(sHex) || /^[\dA-F]+$/i.test(sHex))
  {
    if (sHex.charAt(0) == "-")
    {
      if (/[^0]/.test(sHex.substr(1)))
      {
        sHex  = sHex.substr(1);
        bSign = true;
      }
      else
        sHex = "0";
    }

    for (i = sHex.length - 1; i >= 0; --i)
      sBin = Pad(parseInt(sHex.charAt(i), 16).toString(2), 4, "L", "0") + sBin;

    if (sBin.length > nBits)
      sBin = sBin.replace(/^0+/, "");

    if (sBin.length > nBits)
      sBin = "";
    else
      sBin = Pad(sBin, nBits, "L", "0");

    if (bSigned && sBin)
    {
      sMax = Pad("1", nBits, "R", "0");
      if (bSign)
      {
        if (sBin > sMax)
          sBin = "";
        else
          sBin = OppositeBin(sBin);
      }
      else if (sBin >= sMax)
        sBin = "";
    }
  }

  return sBin;
}

function Pad(sStr, nLen, sType, sChar)
{
  if (sType == "R")
  {
    while (sStr.length < nLen)
      sStr += sChar;
  }
  else if (sType == "L")
  {
    while (sStr.length < nLen)
      sStr = sChar + sStr;
  }

  return sStr;
}

function Calculate()
{
  var sBinA = GetWindowText(aDlg[IDBINA].Handle);
  var sBinB = GetWindowText(aDlg[IDBINB].Handle);
  var sBinR = "";
  var sSignB;
  var nShift;
  var i;

  sDecA = GetWindowText(aDlg[IDDECA].Handle);
  sDecB = GetWindowText(aDlg[IDDECB].Handle);

  if (sBinA && sDecA && ((nOper == 6) || sBinB && sDecB))
  {
    if (bNotA) sBinA = NotBin(sBinA);
    if (bNotB) sBinB = NotBin(sBinB);

    if (nOper == 6)
      sBinR = sBinA;
    else
    {
      if (nOper == 0) //OR |
      {
        for (i = 0; i < nBits; ++i)
          sBinR += ((sBinA.charAt(i) == "1") || (sBinB.charAt(i) == "1")) ? "1" : "0";
      }
      else if (nOper == 1) //AND &
      {
        for (i = 0; i < nBits; ++i)
          sBinR += ((sBinA.charAt(i) == "1") && (sBinB.charAt(i) == "1")) ? "1" : "0";
      }
      else if (nOper == 2) //XOR ^
      {
        for (i = 0; i < nBits; ++i)
          sBinR += (sBinA.charAt(i) != sBinB.charAt(i)) ? "1" : "0";
      }
      else
      {
        if (sDecB.charAt(0) == "-")
        {
          sSignB = "-";
          sDecB  = sDecB.substr(1);
        }
        else
          sSignB = "";

        sDecB  = sSignB + sDecB.slice(-Math.round(Math.LOG2E * Math.log(nBits)));
        nShift = (parseInt(sDecB, 10) % nBits + nBits) % nBits;

        if (nOper == 3) //LShift <<
          sBinR = Pad(sBinA.substr(nShift), nBits, "R", "0");
        else if (nOper == 4) //RShift >>
          sBinR = Pad(sBinA.substr(0, nBits - nShift), nBits, "L", sBinA.charAt(0));
        else if (nOper == 5) //URShift >>>
          sBinR = Pad(sBinA.substr(0, nBits - nShift), nBits, "L", "0");
      }
    }
  }

  oSys.Call("User32::SetWindowTextW", aDlg[IDBINR].Handle, sBinR);
  oSys.Call("User32::SetWindowTextW", aDlg[IDHEXR].Handle, BinToHex(sBinR));
  oSys.Call("User32::SetWindowTextW", aDlg[IDDECR].Handle, BinToDec(sBinR));
}

function ReadIni()
{
  var sIniFile = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";
  var oFile;

  if (oFSO.FileExists(sIniFile))
  {
    oFile = oFSO.OpenTextFile(sIniFile, 1, false, -1);
    try
    {
      eval(oFile.ReadAll());
    }
    catch (oError)
    {}
    oFile.Close();
  }
}

function WriteIni()
{
  var oFile = oFSO.OpenTextFile(WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini", 2, true, -1);
  var oRect = {};
  var sIniTxt;

  GetWindowPos(hDlg, oRect);
  sDecA = GetWindowText(aDlg[IDDECA].Handle);
  sDecB = GetWindowText(aDlg[IDDECB].Handle);

  sIniTxt =
    'nDlgX='     + oRect.X + ';\r\n' +
    'nDlgY='     + oRect.Y + ';\r\n' +
    'bOverType=' + bOverType + ';\r\n' +
    'bSigned='   + bSigned + ';\r\n' +
    'nBits='     + nBits + ';\r\n' +
    'nOper='     + nOper + ';\r\n' +
    'bNotA='     + bNotA + ';\r\n' +
    'bNotB='     + bNotB + ';\r\n' +
    'sDecA="'    + sDecA + '";\r\n' +
    'sDecB="'    + sDecB + '";\r\n';

  oFile.Write(sIniTxt);
  oFile.Close();
}
