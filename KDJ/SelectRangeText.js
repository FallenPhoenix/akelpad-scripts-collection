// SelectRangeText.js - ver. 2013-08-30 (x86/x64)
//
// Select range of text.
//
// Usage:
// Call("Scripts::Main", 1, "SelectRangeText.js")
//
// Shortcut keys in dialog box:
// Alt+End, Home, PgDn, PgUp - set caret position
// Enter - Apply
// Esc   - Close
// Shift+Alt+C, Right, Left, Down, Up, End, Home, PgDn, PgUp - move dialog box.

var oSys = AkelPad.SystemFunction();

if (oSys.Call("Kernel32::GetUserDefaultLangID") == 0x0415) //Polish
{
  var sTxtCaption = "Zaznacz zakres";
  var sTxtCoordin = "Współrzędne";
  var sTxtLine    = "Wiersz";
  var sTxtColumn  = "Kolumna";
  var sTxtBegin   = "Początek";
  var sTxtEnd     = "Koniec";
  var sTxtCaret   = "Kursor";
  var sTxtOffset1 = "Offset";
  var sTxtOffset2 = "&Offset";
  var sTxtColSel  = "&Zaznaczenie pionowe";
  var sTxtCarPos  = "Pozycja kursora";
  var sTxtCarPos0 = "L.góra";
  var sTxtCarPos1 = "P.góra";
  var sTxtCarPos2 = "P.dół";
  var sTxtCarPos3 = "L.dół";
  var sTxtApply   = "Zastosuj";
  var sTxtClose   = "Zamknij";
}
else
{
  var sTxtCaption = "Select range";
  var sTxtCoordin = "Coordinates";
  var sTxtLine    = "Line";
  var sTxtColumn  = "Column";
  var sTxtBegin   = "Begin";
  var sTxtEnd     = "End";
  var sTxtCaret   = "Caret";
  var sTxtOffset1 = "Offset";
  var sTxtOffset2 = "&Offset";
  var sTxtColSel  = "&Columnar selection";
  var sTxtCarPos  = "Caret position";
  var sTxtCarPos0 = "L.top";
  var sTxtCarPos1 = "R.top";
  var sTxtCarPos2 = "R.bottom";
  var sTxtCarPos3 = "L.bottom";
  var sTxtApply   = "Apply";
  var sTxtClose   = "Close";
}

var DT_DWORD              = 3;
var AEGI_FIRSTSELCHAR     = 3;
var AEM_GETSEL            = 3125;
var AEM_SETSEL            = 3126;
var AEM_GETCOLUMNSEL      = 3127;
var AEM_GETINDEX          = 3130;
var AEM_INDEXUPDATE       = 3132;
var AEM_INDEXCOMPARE      = 3133;
var AEM_INDEXTORICHOFFSET = 3136;
var AEM_RICHOFFSETTOINDEX = 3137;

var hMainWnd     = AkelPad.GetMainWnd();
var hEditWnd     = AkelPad.GetEditWnd();
var hGuiFont     = oSys.Call("Gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
var sScriptName  = WScript.ScriptName;
var hInstanceDLL = AkelPad.GetInstanceDll();

var bOffset   = 0;
var bColSel   = SendMessage(hEditWnd, AEM_GETCOLUMNSEL, 0, 0);
var lpFirstC  = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
var lpCaret   = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
var lpSelect  = AkelPad.MemAlloc(_X64 ? 56 : 28 /*sizeof(AESELECTION)*/);
var lpBegSel  = lpSelect;
var lpEndSel  = lpSelect + (_X64 ? 24 : 12);
var lpSelFlag = lpSelect + (_X64 ? 48 : 24);
var lpBegL    = lpBegSel;
var lpBegC    = lpBegSel + (_X64 ? 16 : 8);
var lpEndL    = lpEndSel;
var lpEndC    = lpEndSel + (_X64 ? 16 : 8);
var lpCarL    = lpCaret;
var lpCarC    = lpCaret + (_X64 ? 16 : 8);
var nBegOf;
var nEndOf;
var nCarOf;
var hWndDlg;
var lpBuffer;

var aWnd      = [];
var IDCOORDIN = 1000;
var IDTXTBEG  = 1001;
var IDTXTEND  = 1002;
var IDTXTCAR  = 1003;
var IDTXTLIN  = 1004;
var IDTXTCOL  = 1005;
var IDBEGL    = 1006;
var IDBEGC    = 1007;
var IDENDL    = 1008;
var IDENDC    = 1009;
var IDCARL    = 1010;
var IDCARC    = 1011;
var IDTXTOF   = 1012;
var IDBEGOF   = 1013;
var IDENDOF   = 1014;
var IDCAROF   = 1015;
var IDOFFSET  = 1016;
var IDCOLSEL  = 1017;
var IDCARPOS  = 1018;
var IDCARPOSB = 1019;
var IDCARPOSE = 1020;
var IDCARPOS0 = 1021;
var IDCARPOS1 = 1022;
var IDCARPOS2 = 1023;
var IDCARPOS3 = 1024;
var IDAPPLY   = 1025;
var IDCLOSE   = 1026;

var WNDTYPE  = 0;
var WND      = 1;
var WNDEXSTY = 2;
var WNDSTY   = 3;
var WNDX     = 4;
var WNDY     = 5;
var WNDW     = 6;
var WNDH     = 7;
var WNDTXT   = 8;

//0x50000000 - WS_VISIBLE|WS_CHILD
//0x50000007 - WS_VISIBLE|WS_CHILD|BS_GROUPBOX
//0x50000009 - WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
//0x50010000 - WS_VISIBLE|WS_CHILD|WS_TABSTOP
//0x50010001 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_DEFPUSHBUTTON
//0x50010003 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
//0x50012080 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_AUTOHSCROLL|ES_NUMBER
//Windows            WNDTYPE, WND,WNDEXSTY,     WNDSTY,WNDX,WNDY,WNDW,WNDH, WNDTXT
aWnd[IDCOORDIN] = ["BUTTON",   0,       0, 0x50000007,  10,  10, 185, 135, sTxtCoordin];
aWnd[IDTXTBEG ] = ["STATIC",   0,       0, 0x50000000,  20,  45,  50,  13, sTxtBegin];
aWnd[IDTXTEND ] = ["STATIC",   0,       0, 0x50000000,  20,  70,  50,  13, sTxtEnd];
aWnd[IDTXTCAR ] = ["STATIC",   0,       0, 0x50000000,  20,  95,  50,  13, sTxtCaret];
aWnd[IDTXTLIN ] = ["STATIC",   0,       0, 0x50000000,  70,  30,  50,  13, sTxtLine];
aWnd[IDTXTCOL ] = ["STATIC",   0,       0, 0x50000000, 130,  30,  50,  13, sTxtColumn];
aWnd[IDBEGL   ] = ["EDIT",     0,   0x200, 0x50012080,  70,  45,  55,  20, ""];
aWnd[IDBEGC   ] = ["EDIT",     0,   0x200, 0x50012080, 130,  45,  55,  20, ""];
aWnd[IDENDL   ] = ["EDIT",     0,   0x200, 0x50012080,  70,  70,  55,  20, ""];
aWnd[IDENDC   ] = ["EDIT",     0,   0x200, 0x50012080, 130,  70,  55,  20, ""];
aWnd[IDCARL   ] = ["STATIC",   0,   0x200, 0x50000000,  70,  95,  55,  20, ""];
aWnd[IDCARC   ] = ["STATIC",   0,   0x200, 0x50000000, 130,  95,  55,  20, ""];
aWnd[IDTXTOF  ] = ["STATIC",   0,       0, 0x50000000,  70,  30,  50,  13, sTxtOffset1];
aWnd[IDBEGOF  ] = ["EDIT",     0,   0x200, 0x50012080,  70,  45, 115,  20, ""];
aWnd[IDENDOF  ] = ["EDIT",     0,   0x200, 0x50012080,  70,  70, 115,  20, ""];
aWnd[IDCAROF  ] = ["STATIC",   0,   0x200, 0x50000000,  70,  95, 115,  20, ""];
aWnd[IDOFFSET ] = ["BUTTON",   0,       0, 0x50010003,  70, 122, 120,  16, sTxtOffset2];
aWnd[IDCOLSEL ] = ["BUTTON",   0,       0, 0x50010003, 225,  15, 120,  16, sTxtColSel];
aWnd[IDCARPOS ] = ["BUTTON",   0,       0, 0x50000007, 205,  45, 140,  65, sTxtCarPos];
aWnd[IDCARPOSB] = ["BUTTON",   0,       0, 0x50000009, 215,  65,  60,  16, sTxtBegin];
aWnd[IDCARPOSE] = ["BUTTON",   0,       0, 0x50000009, 280,  85,  60,  16, sTxtEnd];
aWnd[IDCARPOS0] = ["BUTTON",   0,       0, 0x50000009, 215,  65,  60,  16, sTxtCarPos0];
aWnd[IDCARPOS1] = ["BUTTON",   0,       0, 0x50000009, 280,  65,  60,  16, sTxtCarPos1];
aWnd[IDCARPOS2] = ["BUTTON",   0,       0, 0x50000009, 280,  85,  60,  16, sTxtCarPos2];
aWnd[IDCARPOS3] = ["BUTTON",   0,       0, 0x50000009, 215,  85,  60,  16, sTxtCarPos3];
aWnd[IDAPPLY  ] = ["BUTTON",   0,       0, 0x50010001, 205, 123,  65,  23, sTxtApply];
aWnd[IDCLOSE  ] = ["BUTTON",   0,       0, 0x50010000, 280, 123,  65,  23, sTxtClose];

if (hEditWnd)
{
  if (AkelPad.WindowRegisterClass(sScriptName))
  {
    if (lpBuffer = AkelPad.MemAlloc(256 * _TSIZE))
    {
      //Create dialog
      AkelPad.MemCopy(lpBuffer, sScriptName, _TSTR);
      hWndDlg = oSys.Call("User32::CreateWindowEx" + _TCHAR,
                          0,               //dwExStyle
                          lpBuffer,        //lpClassName
                          0,               //lpWindowName
                          0x90CA0000,      //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX
                          0,               //x
                          0,               //y
                          360,             //nWidth
                          187,             //nHeight
                          hMainWnd,        //hWndParent
                          0,               //ID
                          hInstanceDLL,    //hInstance
                          DialogCallback); //Script function callback. To use it class must be registered by WindowRegisterClass.
      if (hWndDlg)
      {
        //Disable main window, to make dialog modal
        oSys.Call("User32::EnableWindow", hMainWnd, false);

        //Message loop
        AkelPad.WindowGetMessage();
      }
      AkelPad.MemFree(lpBuffer);
    }
    AkelPad.WindowUnregisterClass(sScriptName);
  }
}

AkelPad.MemFree(lpFirstC);
AkelPad.MemFree(lpCaret);
AkelPad.MemFree(lpSelect);

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  var i;
  var nLowParam;

  if (uMsg == 1) //WM_CREATE
  {
    //Dialog caption
    AkelPad.MemCopy(lpBuffer, sTxtCaption, _TSTR);
    oSys.Call("User32::SetWindowText" + _TCHAR, hWnd, lpBuffer);

    //Create windows
    for (i = 1000; i < aWnd.length; ++i)
    {
      AkelPad.MemCopy(lpBuffer, aWnd[i][WNDTYPE], _TSTR);
      aWnd[i][WND] = oSys.Call("User32::CreateWindowEx" + _TCHAR,
                               aWnd[i][WNDEXSTY],//dwExStyle
                               lpBuffer,         //lpClassName
                               0,                //lpWindowName
                               aWnd[i][WNDSTY],  //dwStyle
                               aWnd[i][WNDX],    //x
                               aWnd[i][WNDY],    //y
                               aWnd[i][WNDW],    //nWidth
                               aWnd[i][WNDH],    //nHeight
                               hWnd,             //hWndParent
                               i,                //ID
                               hInstanceDLL,     //hInstance
                               0);               //lpParam
      //Set font and text
      SetWindowFontAndText(aWnd[i][WND], hGuiFont, aWnd[i][WNDTXT]);
    }

    //Set limit edit text
    for (i = IDBEGL; i <= IDENDC; ++i)
      SendMessage(aWnd[i][WND], 197 /*EM_LIMITTEXT*/, 9, 0);
    for (i = IDBEGOF; i <= IDENDOF; ++i)
      SendMessage(aWnd[i][WND], 197 /*EM_LIMITTEXT*/, 9, 0);

    //Get selection and set text to coordinates
    GetSelection();

    //Check
    CheckButtons();
    ShowHideWindows();

    //Set window position
    MoveWindow(hMainWnd, hWnd, "RT");
  }

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (wParam == 27) //VK_ESCAPE
      PostMessage(hWndDlg, 273 /*WM_COMMAND*/, IDCLOSE, 0);
    else if (wParam == 13) //VK_RETURN
      PostMessage(hWndDlg, 273 /*WM_COMMAND*/, IDAPPLY, 0);
  }

  else if (uMsg == 260) //WM_SYSKEYDOWN
  {
    if (oSys.Call("User32::GetAsyncKeyState", 0xA0 /*VK_LSHIFT*/))
    {
      if (wParam == 0x27) //VK_RIGHT
        MoveWindow(hMainWnd, hWnd, "R");
      else if (wParam == 0x25) //VK_LEFT
        MoveWindow(hMainWnd, hWnd, "L");
      else if (wParam == 0x28) //VK_DOWN
        MoveWindow(hMainWnd, hWnd, "D");
      else if (wParam == 0x26) //VK_UP
        MoveWindow(hMainWnd, hWnd, "U");
      else if (wParam == 0x23) //VK_END
        MoveWindow(hMainWnd, hWnd, "E");
      else if (wParam == 0x24) //VK_HOME
        MoveWindow(hMainWnd, hWnd, "H");
      else if (wParam == 0x22) //VK_NEXT
        MoveWindow(hMainWnd, hWnd, "B");
      else if (wParam == 0x21) //VK_PRIOR
        MoveWindow(hMainWnd, hWnd, "T");
      else if (wParam == 0x43) //C
        MoveWindow(hMainWnd, hWnd, "C");
    }
    else
    {
      if (wParam == 0x24) //VK_HOME
        SetRadiobutton(0);
      else if (wParam == 0x21) //VK_PRIOR
        SetRadiobutton(bColSel ? 1 : 0);
      else if (wParam == 0x22) //VK_NEXT
        SetRadiobutton(bColSel ? 2 : 1);
      else if (wParam == 0x23) //VK_END
        SetRadiobutton(bColSel ? 3 : 1);
    }
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    nLowParam = LoWord(wParam);

    if (nLowParam == IDOFFSET)
    {
      bOffset = SendMessage(aWnd[IDOFFSET][WND],  240 /*BM_GETCHECK*/, 0, 0);
      ShowHideWindows();
      SendMessage(aWnd[bOffset ? IDBEGOF : IDBEGL][WND], 177 /*EM_SETSEL*/, 0, -1);
      oSys.Call("User32::SetFocus", aWnd[bOffset ? IDBEGOF : IDBEGL][WND]);
    }

    else if (nLowParam == IDCOLSEL)
    {
      bColSel = SendMessage(aWnd[IDCOLSEL][WND],  240 /*BM_GETCHECK*/, 0, 0);
      ShowHideWindows();
    }

    else if (nLowParam == IDAPPLY)
    {
      SetSelection();
      GetSelection();
    }

    else if (nLowParam == IDCLOSE)
      PostMessage(hWndDlg, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    //Enable main window
    oSys.Call("User32::EnableWindow", hMainWnd, true);

    //Destroy dialog
    oSys.Call("User32::DestroyWindow", hWnd);
  }
  else if (uMsg == 2) //WM_DESTROY
  {
    //Exit message loop
    oSys.Call("User32::PostQuitMessage", 0);
  }

  else
  {
    if (oSys.Call("User32::GetFocus") != aWnd[IDCLOSE][WND])
      oSys.Call("User32::DefDlgProc" + _TCHAR, hWnd, 1025 /*DM_SETDEFID*/, IDAPPLY, 0);
  }

  return 0;
}

function PostMessage(hWnd, uMsg, wParam, lParam)
{
  return oSys.Call("User32::PostMessage" + _TCHAR, hWnd, uMsg, wParam, lParam);
}

function SendMessage(hWnd, uMsg, wParam, lParam)
{
  return oSys.Call("User32::SendMessage" + _TCHAR, hWnd, uMsg, wParam, lParam);
}

function LoWord(nParam)
{
  return nParam & 0xFFFF;
}

function SetWindowFontAndText(hWnd, hFont, pText)
{
  var lpWindowText;

  SendMessage(hWnd, 48 /*WM_SETFONT*/, hFont, true);

  if (lpWindowText = AkelPad.MemAlloc(256 * _TSIZE))
  {
    AkelPad.MemCopy(lpWindowText, pText.substr(0, 255), _TSTR);
    oSys.Call("User32::SetWindowText" + _TCHAR, hWnd, lpWindowText);

    AkelPad.MemFree(lpWindowText);
  }
}

function MoveWindow(hWndParent, hWnd, sAction)
{
  var oRectParent = {};
  var oRectWnd    = {};
  var lpRect;
  var nX;
  var nY;

  if (lpRect=AkelPad.MemAlloc(16)) //sizeof(RECT)
  {
    if (! hWndParent)
      hWndParent=oSys.Call("User32::GetDesktopWindow");

    oSys.Call("User32::GetWindowRect", hWndParent, lpRect);
    RectToObject(lpRect, oRectParent);

    oSys.Call("User32::GetWindowRect", hWnd, lpRect);
    RectToObject(lpRect, oRectWnd);

    nX = oRectWnd.left;
    nY = oRectWnd.top;

    if (sAction == "R") //Move right
      nX = oRectWnd.left + ((oRectWnd.right < oRectParent.right) ? 10: 0);
    else if (sAction == "L") //Move left
      nX = oRectWnd.left - ((oRectWnd.left > oRectParent.left) ? 10: 0);
    else if (sAction == "D") //Move down
      nY = oRectWnd.top + ((oRectWnd.bottom < oRectParent.bottom) ? 10: 0);
    else if (sAction == "U") //Move up
      nY = oRectWnd.top - ((oRectWnd.top > oRectParent.top) ? 10: 0);
    else if (sAction == "E") //Move end (right)
      nX = oRectWnd.left + (oRectParent.right - oRectWnd.right);
    else if (sAction == "H") //Move home (left)
      nX = oRectWnd.left + (oRectParent.left - oRectWnd.left);
    else if (sAction == "B") //Move bottom
      nY = oRectWnd.top + (oRectParent.bottom - oRectWnd.bottom);
    else if (sAction == "T") //Move top
      nY = oRectWnd.top + (oRectParent.top - oRectWnd.top);
    else if (sAction == "C") //Center window
    {
      nX = oRectParent.left + ((oRectParent.right  - oRectParent.left) / 2 - (oRectWnd.right  - oRectWnd.left) / 2);
      nY = oRectParent.top  + ((oRectParent.bottom - oRectParent.top)  / 2 - (oRectWnd.bottom - oRectWnd.top)  / 2);
    }
    else if (sAction == "LT") //Move left top
    {
      nX = oRectParent.left;
      nY = oRectParent.top;
    }
    else if (sAction == "RT") //Move right top
    {
      nX = oRectWnd.left + (oRectParent.right - oRectWnd.right);
      nY = oRectParent.top;
    }
    else if (sAction == "LB") //Move left bottom
    {
      nX = oRectParent.left;
      nY = oRectWnd.top + (oRectParent.bottom - oRectWnd.bottom);
    }
    else if (sAction == "RB") //Move right bottom
    {
      nX = oRectWnd.left + (oRectParent.right - oRectWnd.right);
      nY = oRectWnd.top + (oRectParent.bottom - oRectWnd.bottom);
    }

    oSys.Call("User32::SetWindowPos", hWnd, 0, nX, nY, 0, 0, 0x15 /*SWP_NOZORDER|SWP_NOACTIVATE|SWP_NOSIZE*/);
    AkelPad.MemFree(lpRect);
  }
}

function RectToObject(lpRect, oRect)
{
  oRect.left   = AkelPad.MemRead(lpRect,     DT_DWORD);
  oRect.top    = AkelPad.MemRead(lpRect + 4, DT_DWORD);
  oRect.right  = AkelPad.MemRead(lpRect + 8, DT_DWORD);
  oRect.bottom = AkelPad.MemRead(lpRect +12, DT_DWORD);
}

function SetRadiobutton(nButton)
{
  var i;

  if (bColSel)
  {
    for (i = IDCARPOS0; i <= IDCARPOS3; ++i)
      SendMessage(aWnd[i][WND], 241 /*BM_SETCHECK*/, 0 /*BST_UNCHECKED*/, 0);
    SendMessage(aWnd[IDCARPOS0 + nButton][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
  }
  else
  {
    for (i = IDCARPOSB; i <= IDCARPOSE; ++i)
      SendMessage(aWnd[i][WND], 241 /*BM_SETCHECK*/, 0 /*BST_UNCHECKED*/, 0);
    SendMessage(aWnd[IDCARPOSB + nButton][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
  }
}

function CheckButtons()
{
  var i;

  SendMessage(aWnd[IDOFFSET][WND],  241 /*BM_SETCHECK*/, bOffset, 0);
  SendMessage(aWnd[IDCOLSEL][WND],  241 /*BM_SETCHECK*/, bColSel, 0);

  for (i = IDCARPOSB; i <= IDCARPOS3; ++i)
    SendMessage(aWnd[i][WND], 241 /*BM_SETCHECK*/, 0 /*BST_UNCHECKED*/, 0);

  if (SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpCaret, lpEndSel) == -1)
  {
    SendMessage(aWnd[IDCARPOSB][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    if (SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpBegSel, lpFirstC) == 0)
      SendMessage(aWnd[IDCARPOS0][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    else
      SendMessage(aWnd[IDCARPOS1][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
  }
  else
  {
    SendMessage(aWnd[IDCARPOSE][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    if (SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpBegSel, lpFirstC) == 0)
      SendMessage(aWnd[IDCARPOS2][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    else
      SendMessage(aWnd[IDCARPOS3][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
  }
}

function ShowHideWindows()
{
  var i;

  if (bOffset)
  {
    for (i = IDTXTLIN; i <= IDCARC; ++i)
      oSys.Call("User32::ShowWindow", aWnd[i][WND], 0 /*SW_HIDE*/);
    for (i = IDTXTOF; i <= IDCAROF; ++i)
      oSys.Call("User32::ShowWindow", aWnd[i][WND], 5 /*SW_SHOW*/);
  }
  else
  {
    for (i = IDTXTOF; i <= IDCAROF; ++i)
      oSys.Call("User32::ShowWindow", aWnd[i][WND], 0 /*SW_HIDE*/);
    for (i = IDTXTLIN; i <= IDCARC; ++i)
      oSys.Call("User32::ShowWindow", aWnd[i][WND], 5 /*SW_SHOW*/);
  }

  if (bColSel)
  {
    oSys.Call("User32::ShowWindow", aWnd[IDCARPOSB][WND], 0 /*SW_HIDE*/);
    oSys.Call("User32::ShowWindow", aWnd[IDCARPOSE][WND], 0 /*SW_HIDE*/);
    for (i = IDCARPOS0; i <= IDCARPOS3; ++i)
      oSys.Call("User32::ShowWindow", aWnd[i][WND], 5 /*SW_SHOW*/);
  }
  else
  {
    for (i = IDCARPOS0; i <= IDCARPOS3; ++i)
      oSys.Call("User32::ShowWindow", aWnd[i][WND], 0 /*SW_HIDE*/);
    oSys.Call("User32::ShowWindow", aWnd[IDCARPOSB][WND], 5 /*SW_SHOW*/);
    oSys.Call("User32::ShowWindow", aWnd[IDCARPOSE][WND], 5 /*SW_SHOW*/);
  }
}

function GetSelection()
{
  SendMessage(hEditWnd, AEM_GETINDEX, AEGI_FIRSTSELCHAR, lpFirstC);
  SendMessage(hEditWnd, AEM_GETSEL, lpCaret, lpSelect);

  nBegOf = SendMessage(hEditWnd, AEM_INDEXTORICHOFFSET, 0, lpBegSel);
  nEndOf = SendMessage(hEditWnd, AEM_INDEXTORICHOFFSET, 0, lpEndSel);
  nCarOf = SendMessage(hEditWnd, AEM_INDEXTORICHOFFSET, 0, lpEndSel);

  SetWindowFontAndText(aWnd[IDBEGL][WND], hGuiFont, String(AkelPad.MemRead(lpBegL, DT_DWORD) + 1));
  SetWindowFontAndText(aWnd[IDBEGC][WND], hGuiFont, String(AkelPad.MemRead(lpBegC, DT_DWORD) + 1));
  SetWindowFontAndText(aWnd[IDENDL][WND], hGuiFont, String(AkelPad.MemRead(lpEndL, DT_DWORD) + 1));
  SetWindowFontAndText(aWnd[IDENDC][WND], hGuiFont, String(AkelPad.MemRead(lpEndC, DT_DWORD) + 1));
  SetWindowFontAndText(aWnd[IDCARL][WND], hGuiFont, String(AkelPad.MemRead(lpCarL, DT_DWORD) + 1));
  SetWindowFontAndText(aWnd[IDCARC][WND], hGuiFont, String(AkelPad.MemRead(lpCarC, DT_DWORD) + 1));

  SetWindowFontAndText(aWnd[IDBEGOF][WND], hGuiFont, String(nBegOf));
  SetWindowFontAndText(aWnd[IDENDOF][WND], hGuiFont, String(nEndOf));
  SetWindowFontAndText(aWnd[IDCAROF][WND], hGuiFont, String(nCarOf));

  SendMessage(aWnd[bOffset ? IDBEGOF : IDBEGL][WND], 177 /*EM_SETSEL*/, 0, -1);
  oSys.Call("User32::SetFocus", aWnd[bOffset ? IDBEGOF : IDBEGL][WND]);
}

function SetSelection()
{
  var aCoord = new Array(4);
  var nBegL;
  var nBegC;
  var nEndL;
  var nEndC;
  var nOffset;
  var lpIndex;
  var i;

  if (bOffset)
  {
    lpIndex = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
    for (i = 0; i < 2; ++i)
    {
      oSys.Call("User32::GetWindowText" + _TCHAR, aWnd[i + IDBEGOF][WND], lpBuffer, 256);
      nOffset = parseInt(AkelPad.MemRead(lpBuffer, _TSTR));
      SendMessage(hEditWnd, AEM_RICHOFFSETTOINDEX, nOffset, lpIndex);
      aCoord[i*2]   = AkelPad.MemRead(lpIndex, DT_DWORD);
      aCoord[i*2+1] = AkelPad.MemRead(lpIndex + (_X64 ? 16 : 8), DT_DWORD);
    }
    AkelPad.MemFree(lpIndex);
  }
  else
  {
    for (i = 0; i < 4; ++i)
    {
      oSys.Call("User32::GetWindowText" + _TCHAR, aWnd[i + IDBEGL][WND], lpBuffer, 256);
      aCoord[i] = parseInt(AkelPad.MemRead(lpBuffer, _TSTR));
      if (aCoord[i] > 0) --aCoord[i];
    }
  }

  if ((aCoord[0] > aCoord[2]) || ((aCoord[0] == aCoord[2]) && (aCoord[1] > aCoord[3])))
  {
    nBegL = aCoord[2];
    nBegC = aCoord[3];
    nEndL = aCoord[0];
    nEndC = aCoord[1];
  }
  else
  {
    nBegL = aCoord[0];
    nBegC = aCoord[1];
    nEndL = aCoord[2];
    nEndC = aCoord[3];
  }

  if (bColSel)
  {
    if (SendMessage(aWnd[IDCARPOS0][WND], 240 /*BM_GETCHECK*/, 0, 0))
    {
      if (nBegC < nEndC)
        CopyCoordinatesToIndex(nBegL, nBegC, nEndL, nEndC, nBegL, nBegC);
      else
        CopyCoordinatesToIndex(nBegL, nEndC, nEndL, nBegC, nBegL, nEndC);
    }
    else if (SendMessage(aWnd[IDCARPOS1][WND], 240 /*BM_GETCHECK*/, 0, 0))
    {
      if (nBegC < nEndC)
        CopyCoordinatesToIndex(nBegL, nEndC, nEndL, nBegC, nBegL, nEndC);
      else
        CopyCoordinatesToIndex(nBegL, nBegC, nEndL, nEndC, nBegL, nBegC);
    }
    else if (SendMessage(aWnd[IDCARPOS2][WND], 240 /*BM_GETCHECK*/, 0, 0))
    {
      if (nBegC < nEndC)
        CopyCoordinatesToIndex(nBegL, nBegC, nEndL, nEndC, nEndL, nEndC);
      else
        CopyCoordinatesToIndex(nBegL, nEndC, nEndL, nBegC, nEndL, nBegC);
    }
    else
    {
      if (nBegC < nEndC)
        CopyCoordinatesToIndex(nBegL, nEndC, nEndL, nBegC, nEndL, nBegC);
      else
        CopyCoordinatesToIndex(nBegL, nBegC, nEndL, nEndC, nEndL, nEndC);
    }
  }
  else
  {
    if (SendMessage(aWnd[IDCARPOSB][WND], 240 /*BM_GETCHECK*/, 0, 0))
      CopyCoordinatesToIndex(nBegL, nBegC, nEndL, nEndC, nBegL, nBegC);
    else
      CopyCoordinatesToIndex(nBegL, nBegC, nEndL, nEndC, nEndL, nEndC);
  }

  SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpBegSel);
  SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpEndSel);
  SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpCaret);

  AkelPad.MemCopy(lpSelFlag, bColSel, DT_DWORD);
  SendMessage(hEditWnd, AEM_SETSEL, lpCaret, lpSelect);

  oSys.Call("User32::InvalidateRect", hEditWnd, 0, true);
}

function CopyCoordinatesToIndex(n1, n2, n3, n4, n5, n6)
{
  AkelPad.MemCopy(lpBegL, n1, DT_DWORD);
  AkelPad.MemCopy(lpBegC, n2, DT_DWORD);
  AkelPad.MemCopy(lpEndL, n3, DT_DWORD);
  AkelPad.MemCopy(lpEndC, n4, DT_DWORD);
  AkelPad.MemCopy(lpCarL, n5, DT_DWORD);
  AkelPad.MemCopy(lpCarC, n6, DT_DWORD);
}
