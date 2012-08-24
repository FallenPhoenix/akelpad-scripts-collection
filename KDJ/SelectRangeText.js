// Select range of text - 2011-03-07
//
// Call("Scripts::Main", 1, "SelectRangeText.js")
//
// Shortcut keys in dialog box:
// Alt+End, Home, PgDn, PgUp - set caret position
// Enter - Apply
// Esc   - Close
// Shift+Alt+C, Right, Left, Down, Up, End, Home, PgDn, PgUp - move dialog box.

var oSys = AkelPad.SystemFunction();

if (oSys.Call("kernel32::GetUserDefaultLangID") == 0x0415) //Polish
{
  var pTxtCaption = "Zaznacz zakres";
  var pTxtCoordin = "Współrzędne";
  var pTxtLine    = "Wiersz";
  var pTxtColumn  = "Kolumna";
  var pTxtBegin   = "Początek";
  var pTxtEnd     = "Koniec";
  var pTxtCaret   = "Kursor";
  var pTxtOffset1 = "Offset";
  var pTxtOffset2 = "&Offset";
  var pTxtColSel  = "&Zaznaczenie pionowe";
  var pTxtCarPos  = "Pozycja kursora";
  var pTxtCarPos0 = "L.góra";
  var pTxtCarPos1 = "P.góra";
  var pTxtCarPos2 = "P.dół";
  var pTxtCarPos3 = "L.dół";
  var pTxtApply   = "Zastosuj";
  var pTxtClose   = "Zamknij";
}
else
{
  var pTxtCaption = "Select range";
  var pTxtCoordin = "Coordinates";
  var pTxtLine    = "Line";
  var pTxtColumn  = "Column";
  var pTxtBegin   = "Begin";
  var pTxtEnd     = "End";
  var pTxtCaret   = "Caret";
  var pTxtOffset1 = "Offset";
  var pTxtOffset2 = "&Offset";
  var pTxtColSel  = "&Columnar selection";
  var pTxtCarPos  = "Caret position";
  var pTxtCarPos0 = "L.top";
  var pTxtCarPos1 = "R.top";
  var pTxtCarPos2 = "R.bottom";
  var pTxtCarPos3 = "L.bottom";
  var pTxtApply   = "Apply";
  var pTxtClose   = "Close";
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
var hGuiFont     = oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
var pScriptName  = WScript.ScriptName;
var hInstanceDLL = AkelPad.GetInstanceDll();

var bOffset   = 0;
var bColSel   = AkelPad.SendMessage(hEditWnd, AEM_GETCOLUMNSEL, 0, 0);
var lpFirstC  = AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/);
var lpCaret   = AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/);
var lpSelect  = AkelPad.MemAlloc(28 /*sizeof(AESELECTION)*/);
var lpBegSel  = lpSelect;
var lpEndSel  = lpSelect + 12;
var lpSelFlag = lpSelect + 24;
var lpBegL    = lpBegSel;
var lpBegC    = lpBegSel + 8;
var lpEndL    = lpEndSel;
var lpEndC    = lpEndSel + 8;
var lpCarL    = lpCaret;
var lpCarC    = lpCaret + 8;
var nBegOf;
var nEndOf;
var nCarOf;
var hWndDlg;
var lpBuffer;

var lpWnd     = [];
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
lpWnd[IDCOORDIN] = ["BUTTON",   0,       0, 0x50000007,  10,  10, 185, 135, pTxtCoordin];
lpWnd[IDTXTBEG ] = ["STATIC",   0,       0, 0x50000000,  20,  45,  50,  13, pTxtBegin];
lpWnd[IDTXTEND ] = ["STATIC",   0,       0, 0x50000000,  20,  70,  50,  13, pTxtEnd];
lpWnd[IDTXTCAR ] = ["STATIC",   0,       0, 0x50000000,  20,  95,  50,  13, pTxtCaret];
lpWnd[IDTXTLIN ] = ["STATIC",   0,       0, 0x50000000,  70,  30,  50,  13, pTxtLine];
lpWnd[IDTXTCOL ] = ["STATIC",   0,       0, 0x50000000, 130,  30,  50,  13, pTxtColumn];
lpWnd[IDBEGL   ] = ["EDIT",     0,   0x200, 0x50012080,  70,  45,  55,  20, ""];
lpWnd[IDBEGC   ] = ["EDIT",     0,   0x200, 0x50012080, 130,  45,  55,  20, ""];
lpWnd[IDENDL   ] = ["EDIT",     0,   0x200, 0x50012080,  70,  70,  55,  20, ""];
lpWnd[IDENDC   ] = ["EDIT",     0,   0x200, 0x50012080, 130,  70,  55,  20, ""];
lpWnd[IDCARL   ] = ["STATIC",   0,   0x200, 0x50000000,  70,  95,  55,  20, ""];
lpWnd[IDCARC   ] = ["STATIC",   0,   0x200, 0x50000000, 130,  95,  55,  20, ""];
lpWnd[IDTXTOF  ] = ["STATIC",   0,       0, 0x50000000,  70,  30,  50,  13, pTxtOffset1];
lpWnd[IDBEGOF  ] = ["EDIT",     0,   0x200, 0x50012080,  70,  45, 115,  20, ""];
lpWnd[IDENDOF  ] = ["EDIT",     0,   0x200, 0x50012080,  70,  70, 115,  20, ""];
lpWnd[IDCAROF  ] = ["STATIC",   0,   0x200, 0x50000000,  70,  95, 115,  20, ""];
lpWnd[IDOFFSET ] = ["BUTTON",   0,       0, 0x50010003,  70, 122, 120,  16, pTxtOffset2];
lpWnd[IDCOLSEL ] = ["BUTTON",   0,       0, 0x50010003, 225,  15, 120,  16, pTxtColSel];
lpWnd[IDCARPOS ] = ["BUTTON",   0,       0, 0x50000007, 205,  45, 140,  65, pTxtCarPos];
lpWnd[IDCARPOSB] = ["BUTTON",   0,       0, 0x50000009, 215,  65,  60,  16, pTxtBegin];
lpWnd[IDCARPOSE] = ["BUTTON",   0,       0, 0x50000009, 280,  85,  60,  16, pTxtEnd];
lpWnd[IDCARPOS0] = ["BUTTON",   0,       0, 0x50000009, 215,  65,  60,  16, pTxtCarPos0];
lpWnd[IDCARPOS1] = ["BUTTON",   0,       0, 0x50000009, 280,  65,  60,  16, pTxtCarPos1];
lpWnd[IDCARPOS2] = ["BUTTON",   0,       0, 0x50000009, 280,  85,  60,  16, pTxtCarPos2];
lpWnd[IDCARPOS3] = ["BUTTON",   0,       0, 0x50000009, 215,  85,  60,  16, pTxtCarPos3];
lpWnd[IDAPPLY  ] = ["BUTTON",   0,       0, 0x50010001, 205, 123,  65,  23, pTxtApply];
lpWnd[IDCLOSE  ] = ["BUTTON",   0,       0, 0x50010000, 280, 123,  65,  23, pTxtClose];

if (hEditWnd)
{
  if (AkelPad.WindowRegisterClass(pScriptName))
  {
    if (lpBuffer = AkelPad.MemAlloc(256 * _TSIZE))
    {
      //Create dialog
      AkelPad.MemCopy(lpBuffer, pScriptName, _TSTR);
      hWndDlg = oSys.Call("user32::CreateWindowEx" + _TCHAR,
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
        oSys.Call("user32::EnableWindow", hMainWnd, false);

        //Message loop
        AkelPad.WindowGetMessage();
      }
      AkelPad.MemFree(lpBuffer);
    }
    AkelPad.WindowUnregisterClass(pScriptName);
  }
}

AkelPad.MemFree(lpFirstC);
AkelPad.MemFree(lpCaret);
AkelPad.MemFree(lpSelect);

//////////////
function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  var i;
  var nLowParam;

  if (uMsg == 1) //WM_CREATE
  {
    //Dialog caption
    AkelPad.MemCopy(lpBuffer, pTxtCaption, _TSTR);
    oSys.Call("user32::SetWindowText" + _TCHAR, hWnd, lpBuffer);

    //Create windows
    for (i = 1000; i < lpWnd.length; ++i)
    {
      AkelPad.MemCopy(lpBuffer, lpWnd[i][WNDTYPE], _TSTR);
      lpWnd[i][WND] = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                                lpWnd[i][WNDEXSTY],//dwExStyle
                                lpBuffer,          //lpClassName
                                0,                 //lpWindowName
                                lpWnd[i][WNDSTY],  //dwStyle
                                lpWnd[i][WNDX],    //x
                                lpWnd[i][WNDY],    //y
                                lpWnd[i][WNDW],    //nWidth
                                lpWnd[i][WNDH],    //nHeight
                                hWnd,              //hWndParent
                                i,                 //ID
                                hInstanceDLL,      //hInstance
                                0);                //lpParam
      //Set font and text
      SetWindowFontAndText(lpWnd[i][WND], hGuiFont, lpWnd[i][WNDTXT]);
    }

    //Set limit edit text
    for (i = IDBEGL; i <= IDENDC; ++i)
      AkelPad.SendMessage(lpWnd[i][WND], 197 /*EM_LIMITTEXT*/, 9, 0);
    for (i = IDBEGOF; i <= IDENDOF; ++i)
      AkelPad.SendMessage(lpWnd[i][WND], 197 /*EM_LIMITTEXT*/, 9, 0);

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
      oSys.Call("user32::PostMessage" + _TCHAR, hWndDlg, 273 /*WM_COMMAND*/, IDCLOSE, 0);
    else if (wParam == 13) //VK_RETURN
      oSys.Call("user32::PostMessage" + _TCHAR, hWndDlg, 273 /*WM_COMMAND*/, IDAPPLY, 0);
  }

  else if (uMsg == 260) //WM_SYSKEYDOWN
  {
    if (oSys.Call("user32::GetAsyncKeyState", 0xA0 /*VK_LSHIFT*/))
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
      bOffset = AkelPad.SendMessage(lpWnd[IDOFFSET][WND],  240 /*BM_GETCHECK*/, 0, 0);
      ShowHideWindows();
      AkelPad.SendMessage(lpWnd[bOffset ? IDBEGOF : IDBEGL][WND], 177 /*EM_SETSEL*/, 0, -1);
      oSys.Call("user32::SetFocus", lpWnd[bOffset ? IDBEGOF : IDBEGL][WND]);
    }

    else if (nLowParam == IDCOLSEL)
    {
      bColSel = AkelPad.SendMessage(lpWnd[IDCOLSEL][WND],  240 /*BM_GETCHECK*/, 0, 0);
      ShowHideWindows();
    }

    else if (nLowParam == IDAPPLY)
    {
      SetSelection();
      GetSelection();
    }

    else if (nLowParam == IDCLOSE)
      oSys.Call("user32::PostMessage" + _TCHAR, hWndDlg, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    //Enable main window
    oSys.Call("user32::EnableWindow", hMainWnd, true);

    //Destroy dialog
    oSys.Call("user32::DestroyWindow", hWnd);
  }
  else if (uMsg == 2) //WM_DESTROY
  {
    //Exit message loop
    oSys.Call("user32::PostQuitMessage", 0);
  }

  else
  {
    if (oSys.Call("user32::GetFocus") != lpWnd[IDCLOSE][WND])
      oSys.Call("user32::DefDlgProc" + _TCHAR, hWnd, 1025 /*DM_SETDEFID*/, IDAPPLY, 0);
  }

  return 0;
}

function SetWindowFontAndText(hWnd, hFont, pText)
{
  var lpWindowText;

  AkelPad.SendMessage(hWnd, 48 /*WM_SETFONT*/, hFont, true);

  if (lpWindowText = AkelPad.MemAlloc(256 * _TSIZE))
  {
    AkelPad.MemCopy(lpWindowText, pText.substr(0, 255), _TSTR);
    oSys.Call("user32::SetWindowText" + _TCHAR, hWnd, lpWindowText);

    AkelPad.MemFree(lpWindowText);
  }
}

function MoveWindow(hWndParent, hWnd, pAction)
{
  var rcWndParent = [];
  var rcWnd = [];
  var lpRect;
  var nX;
  var nY;

  if (lpRect=AkelPad.MemAlloc(16))  //sizeof(RECT)
  {
    if (! hWndParent)
      hWndParent=oSys.Call("user32::GetDesktopWindow");

    oSys.Call("user32::GetWindowRect", hWndParent, lpRect);
    RectToArray(lpRect, rcWndParent);

    oSys.Call("user32::GetWindowRect", hWnd, lpRect);
    RectToArray(lpRect, rcWnd);

    nX = rcWnd.left;
    nY = rcWnd.top;

    if (pAction == "R") //Move right
      nX = rcWnd.left + ((rcWnd.right < rcWndParent.right) ? 10: 0);
    else if (pAction == "L") //Move left
      nX = rcWnd.left - ((rcWnd.left > rcWndParent.left) ? 10: 0);
    else if (pAction == "D") //Move down
      nY = rcWnd.top + ((rcWnd.bottom < rcWndParent.bottom) ? 10: 0);
    else if (pAction == "U") //Move up
      nY = rcWnd.top - ((rcWnd.top > rcWndParent.top) ? 10: 0);
    else if (pAction == "E") //Move end (right)
      nX = rcWnd.left + (rcWndParent.right - rcWnd.right);
    else if (pAction == "H") //Move home (left)
      nX = rcWnd.left + (rcWndParent.left - rcWnd.left);
    else if (pAction == "B") //Move bottom
      nY = rcWnd.top + (rcWndParent.bottom - rcWnd.bottom);
    else if (pAction == "T") //Move top
      nY = rcWnd.top + (rcWndParent.top - rcWnd.top);
    else if (pAction == "C") //Center window
    {
      nX = rcWndParent.left + ((rcWndParent.right  - rcWndParent.left) / 2 - (rcWnd.right  - rcWnd.left) / 2);
      nY = rcWndParent.top  + ((rcWndParent.bottom - rcWndParent.top)  / 2 - (rcWnd.bottom - rcWnd.top)  / 2);
    }
    else if (pAction == "LT") //Move left top
    {
      nX = rcWndParent.left;
      nY = rcWndParent.top;
    }
    else if (pAction == "RT") //Move right top
    {
      nX = rcWnd.left + (rcWndParent.right - rcWnd.right);
      nY = rcWndParent.top;
    }
    else if (pAction == "LB") //Move left bottom
    {
      nX = rcWndParent.left;
      nY = rcWnd.top + (rcWndParent.bottom - rcWnd.bottom);
    }
    else if (pAction == "RB") //Move right bottom
    {
      nX = rcWnd.left + (rcWndParent.right - rcWnd.right);
      nY = rcWnd.top + (rcWndParent.bottom - rcWnd.bottom);
    }

    oSys.Call("user32::SetWindowPos", hWnd, 0, nX, nY, 0, 0, 0x15 /*SWP_NOZORDER|SWP_NOACTIVATE|SWP_NOSIZE*/);
    AkelPad.MemFree(lpRect);
  }
}

function RectToArray(lpRect, rcRect)
{
  rcRect.left   = AkelPad.MemRead(lpRect,     DT_DWORD);
  rcRect.top    = AkelPad.MemRead(lpRect + 4, DT_DWORD);
  rcRect.right  = AkelPad.MemRead(lpRect + 8, DT_DWORD);
  rcRect.bottom = AkelPad.MemRead(lpRect +12, DT_DWORD);
}

function LoWord(nParam)
{
  return (nParam & 0xffff);
}

function SetRadiobutton(nButton)
{
  var i;

  if (bColSel)
  {
    for (i = IDCARPOS0; i <= IDCARPOS3; ++i)
      AkelPad.SendMessage(lpWnd[i][WND], 241 /*BM_SETCHECK*/, 0 /*BST_UNCHECKED*/, 0);
    AkelPad.SendMessage(lpWnd[IDCARPOS0 + nButton][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
  }
  else
  {
    for (i = IDCARPOSB; i <= IDCARPOSE; ++i)
      AkelPad.SendMessage(lpWnd[i][WND], 241 /*BM_SETCHECK*/, 0 /*BST_UNCHECKED*/, 0);
    AkelPad.SendMessage(lpWnd[IDCARPOSB + nButton][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
  }
}

function CheckButtons()
{
  var i;

  AkelPad.SendMessage(lpWnd[IDOFFSET][WND],  241 /*BM_SETCHECK*/, bOffset, 0);
  AkelPad.SendMessage(lpWnd[IDCOLSEL][WND],  241 /*BM_SETCHECK*/, bColSel, 0);

  for (i = IDCARPOSB; i <= IDCARPOS3; ++i)
    AkelPad.SendMessage(lpWnd[i][WND], 241 /*BM_SETCHECK*/, 0 /*BST_UNCHECKED*/, 0);

  if (AkelPad.SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpCaret, lpEndSel) == -1)
  {
    AkelPad.SendMessage(lpWnd[IDCARPOSB][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    if (AkelPad.SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpBegSel, lpFirstC) == 0)
      AkelPad.SendMessage(lpWnd[IDCARPOS0][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    else
      AkelPad.SendMessage(lpWnd[IDCARPOS1][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
  }
  else
  {
    AkelPad.SendMessage(lpWnd[IDCARPOSE][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    if (AkelPad.SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpBegSel, lpFirstC) == 0)
      AkelPad.SendMessage(lpWnd[IDCARPOS2][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    else
      AkelPad.SendMessage(lpWnd[IDCARPOS3][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
  }
}

function ShowHideWindows()
{
  var i;

  if (bOffset)
  {
    for (i = IDTXTLIN; i <= IDCARC; ++i)
      oSys.Call("user32::ShowWindow", lpWnd[i][WND], 0 /*SW_HIDE*/);
    for (i = IDTXTOF; i <= IDCAROF; ++i)
      oSys.Call("user32::ShowWindow", lpWnd[i][WND], 5 /*SW_SHOW*/);
  }
  else
  {
    for (i = IDTXTOF; i <= IDCAROF; ++i)
      oSys.Call("user32::ShowWindow", lpWnd[i][WND], 0 /*SW_HIDE*/);
    for (i = IDTXTLIN; i <= IDCARC; ++i)
      oSys.Call("user32::ShowWindow", lpWnd[i][WND], 5 /*SW_SHOW*/);
  }

  if (bColSel)
  {
    oSys.Call("user32::ShowWindow", lpWnd[IDCARPOSB][WND], 0 /*SW_HIDE*/);
    oSys.Call("user32::ShowWindow", lpWnd[IDCARPOSE][WND], 0 /*SW_HIDE*/);
    for (i = IDCARPOS0; i <= IDCARPOS3; ++i)
      oSys.Call("user32::ShowWindow", lpWnd[i][WND], 5 /*SW_SHOW*/);
  }
  else
  {
    for (i = IDCARPOS0; i <= IDCARPOS3; ++i)
      oSys.Call("user32::ShowWindow", lpWnd[i][WND], 0 /*SW_HIDE*/);
    oSys.Call("user32::ShowWindow", lpWnd[IDCARPOSB][WND], 5 /*SW_SHOW*/);
    oSys.Call("user32::ShowWindow", lpWnd[IDCARPOSE][WND], 5 /*SW_SHOW*/);
  }
}

function GetSelection()
{
  AkelPad.SendMessage(hEditWnd, AEM_GETINDEX, AEGI_FIRSTSELCHAR, lpFirstC);
  AkelPad.SendMessage(hEditWnd, AEM_GETSEL, lpCaret, lpSelect);

  nBegOf = AkelPad.SendMessage(hEditWnd, AEM_INDEXTORICHOFFSET, 0, lpBegSel);
  nEndOf = AkelPad.SendMessage(hEditWnd, AEM_INDEXTORICHOFFSET, 0, lpEndSel);
  nCarOf = AkelPad.SendMessage(hEditWnd, AEM_INDEXTORICHOFFSET, 0, lpEndSel);

  SetWindowFontAndText(lpWnd[IDBEGL][WND], hGuiFont, String(AkelPad.MemRead(lpBegL, DT_DWORD) + 1));
  SetWindowFontAndText(lpWnd[IDBEGC][WND], hGuiFont, String(AkelPad.MemRead(lpBegC, DT_DWORD) + 1));
  SetWindowFontAndText(lpWnd[IDENDL][WND], hGuiFont, String(AkelPad.MemRead(lpEndL, DT_DWORD) + 1));
  SetWindowFontAndText(lpWnd[IDENDC][WND], hGuiFont, String(AkelPad.MemRead(lpEndC, DT_DWORD) + 1));
  SetWindowFontAndText(lpWnd[IDCARL][WND], hGuiFont, String(AkelPad.MemRead(lpCarL, DT_DWORD) + 1));
  SetWindowFontAndText(lpWnd[IDCARC][WND], hGuiFont, String(AkelPad.MemRead(lpCarC, DT_DWORD) + 1));

  SetWindowFontAndText(lpWnd[IDBEGOF][WND], hGuiFont, String(nBegOf));
  SetWindowFontAndText(lpWnd[IDENDOF][WND], hGuiFont, String(nEndOf));
  SetWindowFontAndText(lpWnd[IDCAROF][WND], hGuiFont, String(nCarOf));

  AkelPad.SendMessage(lpWnd[bOffset ? IDBEGOF : IDBEGL][WND], 177 /*EM_SETSEL*/, 0, -1);
  oSys.Call("user32::SetFocus", lpWnd[bOffset ? IDBEGOF : IDBEGL][WND]);
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
    lpIndex = AkelPad.MemAlloc(12);
    for (i = 0; i < 2; ++i)
    {
      oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[i + IDBEGOF][WND], lpBuffer, 256);
      nOffset = parseInt(AkelPad.MemRead(lpBuffer, _TSTR));
      AkelPad.SendMessage(hEditWnd, AEM_RICHOFFSETTOINDEX, nOffset, lpIndex);
      aCoord[i*2]   = AkelPad.MemRead(lpIndex,     DT_DWORD);
      aCoord[i*2+1] = AkelPad.MemRead(lpIndex + 8, DT_DWORD);
    }
    AkelPad.MemFree(lpIndex);
  }
  else
  {
    for (i = 0; i < 4; ++i)
    {
      oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[i + IDBEGL][WND], lpBuffer, 256);
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
    if (AkelPad.SendMessage(lpWnd[IDCARPOS0][WND], 240 /*BM_GETCHECK*/, 0, 0))
    {
      if (nBegC < nEndC)
        CopyCoordinatesToIndex(nBegL, nBegC, nEndL, nEndC, nBegL, nBegC);
      else
        CopyCoordinatesToIndex(nBegL, nEndC, nEndL, nBegC, nBegL, nEndC);
    }
    else if (AkelPad.SendMessage(lpWnd[IDCARPOS1][WND], 240 /*BM_GETCHECK*/, 0, 0))
    {
      if (nBegC < nEndC)
        CopyCoordinatesToIndex(nBegL, nEndC, nEndL, nBegC, nBegL, nEndC);
      else
        CopyCoordinatesToIndex(nBegL, nBegC, nEndL, nEndC, nBegL, nBegC);
    }
    else if (AkelPad.SendMessage(lpWnd[IDCARPOS2][WND], 240 /*BM_GETCHECK*/, 0, 0))
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
    if (AkelPad.SendMessage(lpWnd[IDCARPOSB][WND], 240 /*BM_GETCHECK*/, 0, 0))
      CopyCoordinatesToIndex(nBegL, nBegC, nEndL, nEndC, nBegL, nBegC);
    else
      CopyCoordinatesToIndex(nBegL, nBegC, nEndL, nEndC, nEndL, nEndC);
  }

  AkelPad.SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpBegSel);
  AkelPad.SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpEndSel);
  AkelPad.SendMessage(hEditWnd, AEM_INDEXUPDATE, 0, lpCaret);

  AkelPad.MemCopy(lpSelFlag, bColSel, DT_DWORD);
  AkelPad.SendMessage(hEditWnd, AEM_SETSEL, lpCaret, lpSelect);

  oSys.Call("user32::InvalidateRect", hEditWnd, 0, true);
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
