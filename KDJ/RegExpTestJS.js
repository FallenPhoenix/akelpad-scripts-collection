// RegExpTestJS.js - ver. 2012-10-14
//
// Regular expression tester for JavaScript
//
// Call("Scripts::Main", 1, "RegExpTestJS.js")
//
// Shortcut keys in dialog box:
// Enter - test
// F1 - RegExp help
// Shift+Alt+ Right, Left, Down, Up, End, Home, PgDn, PgUp - move dialog box,
// Alt+ Num-(-), Num+(+) - change opaque/transparency level of dialog box.

var DT_DWORD    = 3;
var BM_GETCHECK = 240;
var BM_SETCHECK = 241;

var hMainWnd     = AkelPad.GetMainWnd();
var hEditWnd     = AkelPad.GetEditWnd();
var oSys         = AkelPad.SystemFunction();
var hGuiFont     = oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
var hInstanceDLL = AkelPad.GetInstanceDll();
var pClassName   = "AkelPad::Scripts::" + WScript.ScriptName + "::" + hInstanceDLL;

var nWndPosX;
var nWndPosY;
var nOpaque = 255;
var pREStr  = "/[a-z]/ig";
var pString = "";
var pWith   = "";
var bIgCase = 1;
var bGlobal = 0;
var bMultiL = 0;
var nNL     = 1;
var nAction = 1;
var oRE     = new RegExp();
var aRECol  = new Array();
var oSel    = {"Source1"  : 0,
               "Source1"  : 0,
               "RE1"      : 0,
               "RE2"      : 0,
               "String1"  : 0,
               "String2"  : 0,
               "With1"    : 0,
               "With2"    : 0,
               "Result1"  : 0,
               "Result2"  : 0,
               "GlobPro1" : 0,
               "GlobPro2" : 0};
var nBufSize = 65536;
var lpBuffer;
var hWndDlg;
var hWndEdHlp;
var hFocus;
var bIsTest;
var bIsReturn;

ReadIni();

if (AkelPad.GetSelStart() != AkelPad.GetSelEnd())
  pString = AkelPad.GetSelText(3 /*"\r\n"*/);

//Main window
var lpWnd       = [];
var IDREGEXP    = 1000;
var IDSOURCE    = 1001;
var IDESCAPE    = 1002;
var IDUNESCAPE  = 1003;
var IDCOPYSOU   = 1004;
var IDEDSOURCE  = 1005;
var IDRE        = 1006;
var IDIGCASE    = 1007;
var IDGLOBAL    = 1008;
var IDMULTIL    = 1009;
var IDCOLLECT   = 1010
var IDCOPYRE    = 1011;
var IDEDRE      = 1012;
var IDSTRING    = 1013;
var IDNEWLINE   = 1014;
var IDNLWIN     = 1015;
var IDNLUNIX    = 1016;
var IDNLMAC     = 1017;
var IDCOPYSTR   = 1018;
var IDEDSTRING  = 1019;
var IDACTION    = 1020;
var IDMETEST    = 1021;
var IDMEEXEC    = 1022;
var IDMESEARCH  = 1023;
var IDMEMATCH   = 1024;
var IDMESPLIT   = 1025;
var IDMEREPLACE = 1026;
var IDEDWITH    = 1027;
var IDRESULT    = 1028;
var IDLASTIND   = 1029;
var IDRESETIND  = 1030;
var IDCOPYRES   = 1031;
var IDEDRESULT  = 1032;
var IDGLOBPRO   = 1033;
var IDEDGLOBPRO = 1034;
var IDTEST      = 1035;
var IDHELP      = 1036;
var IDOPAQMINUS = 1037;
var IDOPAQPLUS  = 1038;
var IDCLOSE     = 1039;

//Collection window
var lpCol      = [];
var IDNAME     = 1000;
var IDLIST     = 1001;
var IDVALUE    = 1002;
var IDREVAL    = 1003;
var IDADD      = 1004;
var IDRENAME   = 1005;
var IDDELETE   = 1006;
var IDOK       = 1007;
var IDCOLCLOSE = 1008;

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
//0x50010080 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_AUTOHSCROLL
//0x50210004 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|WS_VSCROLL|ES_MULTILINE
//0x50310004 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|WS_HSCROLL|WS_VSCROLL|ES_MULTILINE
//0x50310804 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|WS_HSCROLL|WS_VSCROLL|ES_READONLY|ES_MULTILINE
//0x50A10003 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|LBS_STANDARD
//0x50002000 - WS_VISIBLE|WS_CHILD|SS_EDITCONTROL
//Windows              WNDTYPE,WND,WNDEXSTY,     WNDSTY,WNDX,WNDY,WNDW,WNDH, WNDTXT
lpWnd[IDREGEXP   ] = ["BUTTON",  0,       0, 0x50000007,   7,  10, 491, 140, pTxtRegExp];
lpWnd[IDSOURCE   ] = ["STATIC",  0,       0, 0x50000000,  15,  27, 150,  13, pTxtSource];
lpWnd[IDESCAPE   ] = ["BUTTON",  0,       0, 0x50010000, nAX,  23, nAW,  20, pTxtEscape];
lpWnd[IDUNESCAPE ] = ["BUTTON",  0,       0, 0x50010000, nBX,  23, nBW,  20, pTxtUnEscape];
lpWnd[IDCOPYSOU  ] = ["BUTTON",  0,       0, 0x50010000, nCX,  23, nCW,  20, pTxtCopyPaste];
lpWnd[IDEDSOURCE ] = ["EDIT",    0,   0x200, 0x50210004,  15,  45, 475,  35, ""];
lpWnd[IDRE       ] = ["STATIC",  0,       0, 0x50000000,  15,  92,  30,  13, pTxtRE];
lpWnd[IDIGCASE   ] = ["BUTTON",  0,       0, 0x50010003,  50,  92,  70,  16, pTxtIgCase];
lpWnd[IDGLOBAL   ] = ["BUTTON",  0,       0, 0x50010003, 133,  92,  55,  16, pTxtGlobal];
lpWnd[IDMULTIL   ] = ["BUTTON",  0,       0, 0x50010003, 190,  92,  55,  16, pTxtMultiL];
lpWnd[IDCOLLECT  ] = ["BUTTON",  0,       0, 0x50010000, nBX,  88, nBW,  20, pTxtCollect];
lpWnd[IDCOPYRE   ] = ["BUTTON",  0,       0, 0x50010000, nCX,  88, nCW,  20, pTxtCopyPaste];
lpWnd[IDEDRE     ] = ["EDIT",    0,   0x200, 0x50210004,  15, 110, 475,  35, pREStr];
lpWnd[IDSTRING   ] = ["BUTTON",  0,       0, 0x50000007,   7, 160, 491, 145, pTxtString];
lpWnd[IDNEWLINE  ] = ["STATIC",  0,       0, 0x50000000,  50, 177,  70,  13, pTxtNewLine];
lpWnd[IDNLWIN    ] = ["BUTTON",  0,       0, 0x50000009, 120, 177,  70,  16, pTxtNLWin];
lpWnd[IDNLUNIX   ] = ["BUTTON",  0,       0, 0x50000009, 200, 177,  70,  16, pTxtNLUnix];
lpWnd[IDNLMAC    ] = ["BUTTON",  0,       0, 0x50000009, 270, 177,  70,  16, pTxtNLMac];
lpWnd[IDCOPYSTR  ] = ["BUTTON",  0,       0, 0x50010000, nCX, 173, nCW,  20, pTxtCopyPaste];
lpWnd[IDEDSTRING ] = ["EDIT",    0,   0x200, 0x50310004,  15, 195, 475, 105, pString];
lpWnd[IDACTION   ] = ["BUTTON",  0,       0, 0x50000007,   7, 315, 491,  65, pTxtAction];
lpWnd[IDMETEST   ] = ["BUTTON",  0,       0, 0x50000009,  15, 335,  85,  16, pTxtMeTest];
lpWnd[IDMEEXEC   ] = ["BUTTON",  0,       0, 0x50000009, 115, 335,  85,  16, pTxtMeExec];
lpWnd[IDMESEARCH ] = ["BUTTON",  0,       0, 0x50000009, 215, 335,  85,  16, pTxtMeSearch];
lpWnd[IDMEMATCH  ] = ["BUTTON",  0,       0, 0x50000009, 315, 335,  85,  16, pTxtMeMatch];
lpWnd[IDMESPLIT  ] = ["BUTTON",  0,       0, 0x50000009, 415, 335,  75,  16, pTxtMeSplit];
lpWnd[IDMEREPLACE] = ["BUTTON",  0,       0, 0x50000009,  15, 355, 120,  16, pTxtMeReplace];
lpWnd[IDEDWITH   ] = ["EDIT",    0,   0x200, 0x50010080, 135, 355, 355,  20, pWith];
lpWnd[IDRESULT   ] = ["BUTTON",  0,       0, 0x50000007,   7, 390, 491, 145, pTxtResult];
lpWnd[IDLASTIND  ] = ["STATIC",  0,       0, 0x50000000,  50, 407, 130,  13, pTxtLastInd];
lpWnd[IDRESETIND ] = ["BUTTON",  0,       0, 0x50010000, nRX, 403, nRW,  20, pTxtResetInd];
lpWnd[IDCOPYRES  ] = ["BUTTON",  0,       0, 0x50010000, nCX, 403, nCW,  20, pTxtCopy];
lpWnd[IDEDRESULT ] = ["EDIT",    0,   0x200, 0x50310804,  15, 425, 475, 105, ""];
lpWnd[IDGLOBPRO  ] = ["BUTTON",  0,       0, 0x50000007,   7, 545, nPW, 125, pTxtGlobPro];
lpWnd[IDEDGLOBPRO] = ["EDIT",    0,   0x200, 0x50310804,  15, 560, nEW, 105, ""];
lpWnd[IDTEST     ] = ["BUTTON",  0,       0, 0x50010001, nMX, 550, nMW,  23, pTxtTest];
lpWnd[IDHELP     ] = ["BUTTON",  0,       0, 0x50010000, nMX, 575, nMW,  23, pTxtHelp];
lpWnd[IDOPAQMINUS] = ["BUTTON",  0,       0, 0x50010000, nMX, 600, nMW,  23, pTxtOpaqMinus];
lpWnd[IDOPAQPLUS ] = ["BUTTON",  0,       0, 0x50010000, nMX, 625, nMW,  23, pTxtOpaqPlus];
lpWnd[IDCLOSE    ] = ["BUTTON",  0,       0, 0x50010000, nMX, 650, nMW,  23, pTxtClose];

lpCol[IDNAME     ] = ["BUTTON",  0,       0, 0x50000007,  10,  10, 260,  30, pTxtName];
lpCol[IDLIST     ] = ["LISTBOX", 0,       0, 0x50A10003,  10,  30, 260, 270, ""];
lpCol[IDVALUE    ] = ["BUTTON",  0,       0, 0x50000007, 280,  40, 225, 235, pTxtValue];
lpCol[IDREVAL    ] = ["STATIC",  0,       0, 0x50002000, 285,  60, 215, 210, ""];
lpCol[IDADD      ] = ["BUTTON",  0,       0, 0x50010000,  10, 290,  95,  23, pTxtAdd];
lpCol[IDRENAME   ] = ["BUTTON",  0,       0, 0x50010000, 110, 290,  95,  23, pTxtRename];
lpCol[IDDELETE   ] = ["BUTTON",  0,       0, 0x50010000, 210, 290,  95,  23, pTxtDelete];
lpCol[IDOK       ] = ["BUTTON",  0,       0, 0x50010001, 310, 290,  95,  23, pTxtOK];
lpCol[IDCOLCLOSE ] = ["BUTTON",  0,       0, 0x50010000, 410, 290,  95,  23, pTxtClose];

if (hEditWnd)
{
  if (lpBuffer = AkelPad.MemAlloc(nBufSize * _TSIZE))
  {
    if (AkelPad.WindowRegisterClass(pClassName))
    {
      //Create dialog
      hWndDlg = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                          0,               //dwExStyle
                          pClassName,      //lpClassName
                          pTxtCaption,     //lpWindowName
                          0x90CA0000,      //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX
                          0,               //x
                          0,               //y
                          510,             //nWidth
                          710,             //nHeight
                          hMainWnd,        //hWndParent
                          0,               //ID
                          hInstanceDLL,    //hInstance
                          DialogCallback); //Script function callback. To use it class must be registered by WindowRegisterClass.
      if (hWndDlg)
      {
        //Allow other scripts running
        AkelPad.ScriptNoMutex();

        //Message loop
        AkelPad.WindowGetMessage();
      }
      AkelPad.WindowUnregisterClass(pClassName);
    }
    else if (hWndDlg = oSys.Call("user32::FindWindowEx" + _TCHAR, 0, 0, pClassName, 0))
    {
      AkelPad.SendMessage(hWndDlg, 7 /*WM_SETFOCUS*/, 0, 0);
    }
    AkelPad.MemFree(lpBuffer);
  }
}

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  var i, nLowParam, nHiwParam;

  if (uMsg == 1) //WM_CREATE
  {
    //Create windows
    for (i = 1000; i < lpWnd.length; ++i)
    {
      lpWnd[i][WND] = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                                lpWnd[i][WNDEXSTY],//dwExStyle
                                lpWnd[i][WNDTYPE], //lpClassName
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
      SetWndFontAndText(lpWnd[i][WND], hGuiFont, lpWnd[i][WNDTXT]);
    }

    //Set limit edit text
    AkelPad.SendMessage(lpWnd[IDEDSOURCE ][WND], 197 /*EM_SETLIMITTEXT*/, 256, 0);
    AkelPad.SendMessage(lpWnd[IDEDRE     ][WND], 197 /*EM_SETLIMITTEXT*/, 256, 0);
    AkelPad.SendMessage(lpWnd[IDEDSTRING ][WND], 197 /*EM_SETLIMITTEXT*/, nBufSize - 1, 0);
    AkelPad.SendMessage(lpWnd[IDEDWITH   ][WND], 197 /*EM_SETLIMITTEXT*/, 256, 0);
    AkelPad.SendMessage(lpWnd[IDEDRESULT ][WND], 197 /*EM_SETLIMITTEXT*/, nBufSize - 1, 0);
    AkelPad.SendMessage(lpWnd[IDEDGLOBPRO][WND], 197 /*EM_SETLIMITTEXT*/, nBufSize - 1, 0);
    //Check
    CheckButtons();
    //Set window position
    if ((nWndPosX == undefined) || (nWndPosY == undefined))
      MoveWindow(hMainWnd, hWnd, "RT");
    else
      MoveWindow(hMainWnd, hWnd, [nWndPosX, nWndPosY]);
    //Set opaque
    if (nOpaque < 255)
      SetOpaqueLevel(hWnd, nOpaque);

    hFocus = lpWnd[IDEDSOURCE][WND];

    SetLastIndex();
    SetSource();
  }

  else if ((uMsg == 6) /*WM_ACTIVATE*/ && (! wParam))
    hFocus = oSys.Call("user32::GetFocus");

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("user32::SetFocus", hFocus);

  else if ((uMsg == 256) /*WM_KEYDOWN*/ &&
           (! (oSys.Call("user32::GetAsyncKeyState", 0x11 /*VK_CONTROL*/) & 0x80000000)))
  {
    if (wParam == 27) //VK_ESCAPE
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
    else if (wParam == 13) //VK_RETURN
    {
      if (bIsTest)
        bIsTest = 0;
      else
      {
        hFocus = oSys.Call("user32::GetFocus");
        if ((hFocus != lpWnd[IDESCAPE   ][WND]) && (hFocus != lpWnd[IDUNESCAPE ][WND]) &&
            (hFocus != lpWnd[IDCOPYSOU  ][WND]) && (hFocus != lpWnd[IDCOLLECT  ][WND]) &&
            (hFocus != lpWnd[IDCOPYRE   ][WND]) && (hFocus != lpWnd[IDCOPYSTR  ][WND]) &&
            (hFocus != lpWnd[IDRESETIND ][WND]) && (hFocus != lpWnd[IDCOPYRES  ][WND]) &&
            (hFocus != lpWnd[IDTEST     ][WND]) && (hFocus != lpWnd[IDHELP     ][WND]) &&
            (hFocus != lpWnd[IDOPAQMINUS][WND]) && (hFocus != lpWnd[IDOPAQPLUS ][WND]) &&
            (hFocus != lpWnd[IDCLOSE    ][WND]))
          oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDTEST, 0);
      }
    }
    else if (wParam == 112) //VK_F1
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDHELP, 0);
  }

  else if ((uMsg == 258 /*WM_CHAR*/) && (wParam == 9 /*VK_TAB*/))
    oSys.Call("user32::SetFocus",
                oSys.Call("user32::GetNextDlgTabItem", hWnd, oSys.Call("user32::GetFocus"),
                  oSys.Call("user32::GetAsyncKeyState", 0xA0 /*VK_LSHIFT*/) & 0x80000000));

  else if (uMsg == 260) //WM_SYSKEYDOWN
  {
    if (oSys.Call("user32::GetAsyncKeyState", 0xA0 /*VK_LSHIFT*/) & 0x80000000)
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
    }

    if ((wParam == 109) || (wParam == 189))  //Num- or -
      SetOpaqueLevel(hWnd, -2);
    else if ((wParam == 107) || (wParam == 187))  //Num+ or +
      SetOpaqueLevel(hWnd, -1);
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    nLowParam = LoWord(wParam);
    nHiwParam = HiWord(wParam);

    if (nLowParam == IDEDSOURCE)
    {
      if (nHiwParam == 0x0100 /*EN_SETFOCUS*/)
        AkelPad.SendMessage(lpWnd[IDEDSOURCE][WND], 0x00B1 /*EM_SETSEL*/, oSel.Source1, oSel.Source2);
      else if (nHiwParam == 0x0200 /*EN_KILLFOCUS*/)
      {
        oSel.Source1 = LoWord(AkelPad.SendMessage(lpWnd[IDEDSOURCE][WND], 0x00B0 /*EM_GETSEL*/, 0, 0));
        oSel.Source2 = HiWord(AkelPad.SendMessage(lpWnd[IDEDSOURCE][WND], 0x00B0 /*EM_GETSEL*/, 0, 0));
      }
      else if (nHiwParam == 0x0300 /*EN_CHANGE*/)
      {
        SetLastIndex(0);
        SetRE();
      }
    }
    else if (nLowParam == IDEDRE)
    {
      if (nHiwParam == 0x0100 /*EN_SETFOCUS*/)
        AkelPad.SendMessage(lpWnd[IDEDRE][WND], 0x00B1 /*EM_SETSEL*/, oSel.RE1, oSel.RE2);
      else if (nHiwParam == 0x0200 /*EN_KILLFOCUS*/)
      {
        oSel.RE1 = LoWord(AkelPad.SendMessage(lpWnd[IDEDRE][WND], 0x00B0 /*EM_GETSEL*/, 0, 0));
        oSel.RE2 = HiWord(AkelPad.SendMessage(lpWnd[IDEDRE][WND], 0x00B0 /*EM_GETSEL*/, 0, 0));
        SetRE();
      }
      else if (nHiwParam == 0x0300 /*EN_CHANGE*/)
      {
        SetLastIndex(0);
        SetSource();
      }
    }
    else if (nLowParam == IDEDSTRING)
    {
      if (nHiwParam == 0x0100 /*EN_SETFOCUS*/)
        AkelPad.SendMessage(lpWnd[IDEDSTRING][WND], 0x00B1 /*EM_SETSEL*/, oSel.String1, oSel.String2);
      else if (nHiwParam == 0x0200 /*EN_KILLFOCUS*/)
      {
        oSel.String1 = LoWord(AkelPad.SendMessage(lpWnd[IDEDSTRING][WND], 0x00B0 /*EM_GETSEL*/, 0, 0));
        oSel.String2 = HiWord(AkelPad.SendMessage(lpWnd[IDEDSTRING][WND], 0x00B0 /*EM_GETSEL*/, 0, 0));
      }
      else if (nHiwParam == 0x0300 /*EN_CHANGE*/)
        SetLastIndex(0);
    }
    else if (nLowParam == IDEDWITH)
    {
      if (nHiwParam == 0x0100 /*EN_SETFOCUS*/)
        AkelPad.SendMessage(lpWnd[IDEDWITH][WND], 0x00B1 /*EM_SETSEL*/, oSel.With1, oSel.With2);
      else if (nHiwParam == 0x0200 /*EN_KILLFOCUS*/)
      {
        oSel.With1 = LoWord(AkelPad.SendMessage(lpWnd[IDEDWITH][WND], 0x00B0 /*EM_GETSEL*/, 0, 0));
        oSel.With2 = HiWord(AkelPad.SendMessage(lpWnd[IDEDWITH][WND], 0x00B0 /*EM_GETSEL*/, 0, 0));
      }
      else if (nHiwParam == 0x0300 /*EN_CHANGE*/)
        SetLastIndex(0);
    }
    else if (nLowParam == IDEDRESULT)
    {
      if (nHiwParam == 0x0100 /*EN_SETFOCUS*/)
        AkelPad.SendMessage(lpWnd[IDEDRESULT][WND], 0x00B1 /*EM_SETSEL*/, oSel.Result1, oSel.Result2);
      else if (nHiwParam == 0x0200 /*EN_KILLFOCUS*/)
      {
        oSel.Result1 = LoWord(AkelPad.SendMessage(lpWnd[IDEDRESULT][WND], 0x00B0 /*EM_GETSEL*/, 0, 0));
        oSel.Result2 = HiWord(AkelPad.SendMessage(lpWnd[IDEDRESULT][WND], 0x00B0 /*EM_GETSEL*/, 0, 0));
      }
    }
    else if (nLowParam == IDEDGLOBPRO)
    {
      if (nHiwParam == 0x0100 /*EN_SETFOCUS*/)
        AkelPad.SendMessage(lpWnd[IDEDGLOBPRO][WND], 0x00B1 /*EM_SETSEL*/, oSel.GlobPro1, oSel.GlobPro2);
      else if (nHiwParam == 0x0200 /*EN_KILLFOCUS*/)
      {
        oSel.GlobPro1 = LoWord(AkelPad.SendMessage(lpWnd[IDEDGLOBPRO][WND], 0x00B0 /*EM_GETSEL*/, 0, 0));
        oSel.GlobPro2 = HiWord(AkelPad.SendMessage(lpWnd[IDEDGLOBPRO][WND], 0x00B0 /*EM_GETSEL*/, 0, 0));
      }
    }
    else if ((nLowParam >= IDIGCASE) && (nLowParam <= IDMULTIL))
    {
      CheckButtons(nLowParam);
      SetLastIndex(0);
      SetRE();
    }
    else if (((nLowParam >= IDNLWIN) && (nLowParam <= IDNLMAC)) ||
            ((nLowParam >= IDMETEST) && (nLowParam <= IDMEREPLACE)))
    {
      CheckButtons(nLowParam);
      SetLastIndex(0);
    }
    else if ((nLowParam == IDESCAPE) || (nLowParam == IDUNESCAPE))
    {
      if (EscapeUnescape(nLowParam == IDESCAPE))
      {
        SetLastIndex(0);
        SetRE();
      }
    }
    else if ((nLowParam == IDCOPYSOU) || (nLowParam == IDCOPYRE) ||
             (nLowParam == IDCOPYSTR) || (nLowParam == IDCOPYRES))
    {
      if (CopyPaste(nLowParam))
      {
        SetLastIndex(0);
        if (nLowParam == IDCOPYSOU)
          SetRE();
        else if (nLowParam == IDCOPYRE)
          SetSource();
      }
    }
    else if (nLowParam == IDCOLLECT)
      Collection();
    else if (nLowParam == IDRESETIND)
      SetLastIndex(0);
    else if (nLowParam == IDTEST)
    {
      bIsTest = (oSys.Call("user32::GetFocus") == lpWnd[IDTEST][WND]) ? 1 : 0;
      SetRE();
      TestRE();
    }
    else if (nLowParam == IDHELP)
      Help();
    else if (nLowParam == IDOPAQMINUS)
      SetOpaqueLevel(hWnd, -2);
    else if (nLowParam == IDOPAQPLUS)
      SetOpaqueLevel(hWnd, -1);
    else if (nLowParam == IDCLOSE)
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    WriteIni();
    //Destroy dialog
    oSys.Call("user32::DestroyWindow", hWnd);
  }

  else if (uMsg == 2) //WM_DESTROY
  {
    //Exit message loop
    oSys.Call("user32::PostQuitMessage", 0);
  }

  else
    SetDefID(hWnd);

  return 0;
}

function SetWndFontAndText(hWnd, hFont, pText)
{
  AkelPad.SendMessage(hWnd, 48 /*WM_SETFONT*/, hFont, true);

  AkelPad.MemCopy(lpBuffer, pText.substr(0, nBufSize - 1), _TSTR);
  oSys.Call("user32::SetWindowText" + _TCHAR, hWnd, lpBuffer);
}

function MoveWindow(hWndParent, hWnd, Action)
{
  var rcWndParent;
  var rcWnd;
  var nX;
  var nY;

  if (! hWndParent)
    hWndParent=oSys.Call("user32::GetDesktopWindow");

  rcWndParent = GetWindowPos(hWndParent);
  rcWnd       = GetWindowPos(hWnd);

  nX = rcWnd.left;
  nY = rcWnd.top;

  if (Action == "R") //Move right
    nX = rcWnd.left + ((rcWnd.left < rcWndParent.right - 50) ? 20: 0);
  else if (Action == "L") //Move left
    nX = rcWnd.left - ((rcWnd.right > rcWndParent.left + 50) ? 20: 0);
  else if (Action == "D") //Move down
    nY = rcWnd.top + ((rcWnd.top < rcWndParent.bottom - 50) ? 20: 0);
  else if (Action == "U") //Move up
    nY = rcWnd.top - ((rcWnd.bottom > rcWndParent.top + 50) ? 20: 0);
  else if (Action == "E") //Move end (right)
    nX = rcWnd.left + (rcWndParent.right - rcWnd.right);
  else if (Action == "H") //Move home (left)
    nX = rcWnd.left + (rcWndParent.left - rcWnd.left);
  else if (Action == "B") //Move bottom
    nY = rcWnd.top + (rcWndParent.bottom - rcWnd.bottom);
  else if (Action == "T") //Move top
    nY = rcWnd.top + (rcWndParent.top - rcWnd.top);
  else if (Action == "C") //Center window
  {
    nX = rcWndParent.left + ((rcWndParent.right  - rcWndParent.left) / 2 - (rcWnd.right  - rcWnd.left) / 2);
    nY = rcWndParent.top  + ((rcWndParent.bottom - rcWndParent.top)  / 2 - (rcWnd.bottom - rcWnd.top)  / 2);
  }
  else if (Action == "LT") //Move left top
  {
    nX = rcWndParent.left;
    nY = rcWndParent.top;
  }
  else if (Action == "RT") //Move right top
  {
    nX = rcWnd.left + (rcWndParent.right - rcWnd.right);
    nY = rcWndParent.top;
  }
  else if (Action == "LB") //Move left bottom
  {
    nX = rcWndParent.left;
    nY = rcWnd.top + (rcWndParent.bottom - rcWnd.bottom);
  }
  else if (Action == "RB") //Move right bottom
  {
    nX = rcWnd.left + (rcWndParent.right - rcWnd.right);
    nY = rcWnd.top + (rcWndParent.bottom - rcWnd.bottom);
  }
  else
  {
    nX = Action[0];
    nY = Action[1];
  }

  oSys.Call("user32::SetWindowPos", hWnd, 0, nX, nY, 0, 0, 0x15 /*SWP_NOZORDER|SWP_NOACTIVATE|SWP_NOSIZE*/);
}

function GetWindowPos(hWnd)
{
  var lpRect = AkelPad.MemAlloc(16) //sizeof(RECT);
  var rcRect = [];

  oSys.Call("user32::GetWindowRect", hWnd, lpRect);

  rcRect.left   = AkelPad.MemRead(lpRect,     DT_DWORD);
  rcRect.top    = AkelPad.MemRead(lpRect + 4, DT_DWORD);
  rcRect.right  = AkelPad.MemRead(lpRect + 8, DT_DWORD);
  rcRect.bottom = AkelPad.MemRead(lpRect +12, DT_DWORD);
  AkelPad.MemFree(lpRect);

  return rcRect;
}

function LoWord(nParam)
{
  return (nParam & 0xffff);
}

function HiWord(nParam)
{
  return ((nParam >> 16) & 0xffff);
}

function SetOpaqueLevel(hWnd, nLevel)
{
  var lpBuf;
  var nStyle;

  if (nLevel < 0)
  {
    lpBuf  = AkelPad.MemAlloc(1);
    if (oSys.Call("user32::GetLayeredWindowAttributes", hWnd, 0, lpBuf, 0))
    {
      nOpaque = AkelPad.MemRead(lpBuf, 5 /*DT_BYTE*/);
      nOpaque += (nLevel == -1) ? 20 : -20;
    }
    AkelPad.MemFree(lpBuf);
  }

  if (nOpaque > 255)
    nOpaque = 255;
  else if (nOpaque < 55)
    nOpaque = 55;

  //WS_EX_LAYERED style
  nStyle = oSys.Call("User32::GetWindowLong" + _TCHAR, hWnd, -20 /*GWL_EXSTYLE*/);

  if (! (nStyle & 0x00080000 /*WS_EX_LAYERED*/))
  {
    nStyle |= 0x00080000 /*WS_EX_LAYERED*/;
    oSys.Call("User32::SetWindowLongW", hWnd, -20 /*GWL_EXSTYLE*/, nStyle);
  }

  oSys.Call("user32::SetLayeredWindowAttributes", hWnd, 0, nOpaque, 2 /*LWA_ALPHA*/);
}

function SetDefID(hWnd)
{
  var nID    = 1000;
  var hFocus = oSys.Call("user32::GetFocus");

  while ((nID < lpWnd.length) && (hFocus != lpWnd[nID][WND]))
    ++nID;

  if ((nID != IDESCAPE) && (nID != IDUNESCAPE)  && (nID != IDCOPYSOU)  && (nID != IDCOLLECT) &&
      (nID != IDCOPYRE) && (nID != IDCOPYSTR)   && (nID != IDCOPYRES)  && (nID != IDRESETIND) &&
      (nID != IDHELP)   && (nID != IDOPAQMINUS) && (nID != IDOPAQPLUS) && (nID != IDCLOSE))
    nID = IDTEST;

  oSys.Call("user32::DefDlgProc" + _TCHAR, hWnd, 1025 /*DM_SETDEFID*/, nID, 0);
}

function CheckButtons(nButton)
{
  var nID;

  if (nButton)
  {
    bIgCase = AkelPad.SendMessage(lpWnd[IDIGCASE][WND], BM_GETCHECK, 0, 0);
    bGlobal = AkelPad.SendMessage(lpWnd[IDGLOBAL][WND], BM_GETCHECK, 0, 0);
    bMultiL = AkelPad.SendMessage(lpWnd[IDMULTIL][WND], BM_GETCHECK, 0, 0);

    for (nID = IDNLWIN; nID <= IDNLMAC; ++nID)
    {
      if (AkelPad.SendMessage(lpWnd[nID][WND], BM_GETCHECK, 0, 0))
      {
        nNL = nID - IDNLWIN + 1;
        break;
      }
    }

    for (nID = IDMETEST; nID <= IDMEREPLACE; ++nID)
    {
      if (AkelPad.SendMessage(lpWnd[nID][WND], BM_GETCHECK, 0, 0))
      {
        nAction = nID - IDMETEST + 1;
        break;
      }
    }
  }

  AkelPad.SendMessage(lpWnd[IDIGCASE   ][WND], BM_SETCHECK, bIgCase       , 0);
  AkelPad.SendMessage(lpWnd[IDGLOBAL   ][WND], BM_SETCHECK, bGlobal       , 0);
  AkelPad.SendMessage(lpWnd[IDMULTIL   ][WND], BM_SETCHECK, bMultiL       , 0);
  AkelPad.SendMessage(lpWnd[IDNLWIN    ][WND], BM_SETCHECK, (nNL == 1)    , 0);
  AkelPad.SendMessage(lpWnd[IDNLUNIX   ][WND], BM_SETCHECK, (nNL == 2)    , 0);
  AkelPad.SendMessage(lpWnd[IDNLMAC    ][WND], BM_SETCHECK, (nNL == 3)    , 0);
  AkelPad.SendMessage(lpWnd[IDMETEST   ][WND], BM_SETCHECK, (nAction == 1), 0);
  AkelPad.SendMessage(lpWnd[IDMEEXEC   ][WND], BM_SETCHECK, (nAction == 2), 0);
  AkelPad.SendMessage(lpWnd[IDMESEARCH ][WND], BM_SETCHECK, (nAction == 3), 0);
  AkelPad.SendMessage(lpWnd[IDMEMATCH  ][WND], BM_SETCHECK, (nAction == 4), 0);
  AkelPad.SendMessage(lpWnd[IDMESPLIT  ][WND], BM_SETCHECK, (nAction == 5), 0);
  AkelPad.SendMessage(lpWnd[IDMEREPLACE][WND], BM_SETCHECK, (nAction == 6), 0);

  oSys.Call("user32::EnableWindow", lpWnd[IDEDWITH][WND], (nAction == 6));
  oSys.Call("user32::EnableWindow", lpWnd[IDCOLLECT][WND], (typeof Collection == "function"));
}

function EscapeUnescape(bEscape)
{
  var bIsChange = 0;
  var pSource;

  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDEDSOURCE][WND], lpBuffer, nBufSize);
  pSource = AkelPad.MemRead(lpBuffer, _TSTR);

  if (bEscape)
    pSource = pSource.replace(/[\\\/.^$+*?|()\[\]{}]/g, "\\$&");
  else
    pSource = pSource.replace(/\\([\\\/.^$+*?|()\[\]{}])/g, "$1");

  if (pSource != AkelPad.MemRead(lpBuffer, _TSTR))
  {
    SetWndFontAndText(lpWnd[IDEDSOURCE][WND], hGuiFont, pSource);
    bIsChange = 1;
  }
  return bIsChange;
}

function CopyPaste(nID)
{
  var bIsChange = 0;
  var rcWnd;
  var hMenu;
  var nCmd;
  var nIDED;

  if (nID == IDCOPYSOU)
    nIDED = IDEDSOURCE;
  else if (nID == IDCOPYRE)
    nIDED = IDEDRE;
  else if (nID == IDCOPYSTR)
    nIDED = IDEDSTRING;
  else if (nID == IDCOPYRES)
    nIDED = IDEDRESULT;

  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[nIDED][WND], lpBuffer, nBufSize);

  rcWnd = GetWindowPos(lpWnd[nID][WND]);
  hMenu = oSys.Call("user32::CreatePopupMenu");

  oSys.Call("user32::AppendMenu" + _TCHAR, hMenu,
              AkelPad.MemRead(lpBuffer, _TSTR) ? 0x0 /*MF_STRING*/ : 0x1 /*MF_GRAYED*/, 1, pTxtCopyCB);
  oSys.Call("user32::AppendMenu" + _TCHAR, hMenu,
              AkelPad.MemRead(lpBuffer, _TSTR) ? 0x0 /*MF_STRING*/ : 0x1 /*MF_GRAYED*/, 2, pTxtCopyAP);

  if ((nID == IDCOPYSOU) || (nID == IDCOPYRE) || (nID == IDCOPYSTR))
  {
    oSys.Call("user32::AppendMenu" + _TCHAR, hMenu, 0x800 /*MF_SEPARATOR*/, 0, 0);
    oSys.Call("user32::AppendMenu" + _TCHAR, hMenu,
                AkelPad.GetClipboardText() ? 0x0 /*MF_STRING*/ : 0x1 /*MF_GRAYED*/, 3, pTxtPasteCB);
    oSys.Call("user32::AppendMenu" + _TCHAR, hMenu,
                AkelPad.GetSelText() ? 0x0 /*MF_STRING*/ : 0x1 /*MF_GRAYED*/, 4, pTxtPasteAP);
  }

  nCmd = oSys.Call("user32::TrackPopupMenu", hMenu, 0x188 /*TPM_RIGHTALIGN|TPM_NONOTIFY|TPM_RETURNCMD*/,
                    rcWnd.right, rcWnd.bottom, 0, hWndDlg, 0);
  oSys.Call("user32::DestroyMenu", hMenu);

  if (nCmd == 1)
    AkelPad.SetClipboardText(AkelPad.MemRead(lpBuffer, _TSTR));
  else if (nCmd == 2)
    AkelPad.ReplaceSel(AkelPad.MemRead(lpBuffer, _TSTR), 1);
  else if (nCmd == 3)
  {
    if (AkelPad.GetClipboardText() != AkelPad.MemRead(lpBuffer, _TSTR))
    {
      SetWndFontAndText(lpWnd[nIDED][WND], hGuiFont, AkelPad.GetClipboardText());
      bIsChange = 1;
    }
  }
  else if (nCmd == 4)
  {
    if (AkelPad.GetSelText(3 /*\r\n*/) != AkelPad.MemRead(lpBuffer, _TSTR))
    {
      SetWndFontAndText(lpWnd[nIDED][WND], hGuiFont, AkelPad.GetSelText(3 /*\r\n*/));
      bIsChange = 1;
    }
  }

  return bIsChange;
}

function SetLastIndex(nInd)
{
  if (nInd == undefined)
    nInd = oRE.lastIndex;
  else
    oRE.lastIndex = nInd;

  SetWndFontAndText(lpWnd[IDLASTIND][WND], hGuiFont, pTxtLastInd + nInd);
}

function SetRE()
{
  var pModyf = "";
  var pSource;
  var oError;

  if (bIgCase) pModyf += "i";
  if (bGlobal) pModyf += "g";
  if (bMultiL) pModyf += "m";

  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDEDSOURCE][WND], lpBuffer, nBufSize);
  pSource = AkelPad.MemRead(lpBuffer, _TSTR);

  try
  {
    pREStr = String(RegExp(pSource, pModyf));
    if (pREStr.length > AkelPad.SendMessage(lpWnd[IDEDRE][WND], 213 /*EM_GETLIMITTEXT*/, 0, 0))
      pREStr = "";
  }
  catch (oError)
  {
    pREStr = "";
  }

  SetWndFontAndText(lpWnd[IDEDRE][WND], hGuiFont, pREStr);
}

function SetSource()
{
  var pSource = "";
  var nPos;
  var pModyf;
  var oError;

  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDEDRE][WND], lpBuffer, nBufSize);
  pREStr = AkelPad.MemRead(lpBuffer, _TSTR).replace(/(^[ \t]+)|([ \t]+$)/g, "");

  if ((pREStr.charAt(0) == "/") && ((nPos = pREStr.lastIndexOf("/")) > 0))
  {
    pModyf = pREStr.substring(nPos + 1);
    if (! (pModyf && /[^igm]/.test(pModyf)))
    {
      pSource = pREStr.substring(1, nPos);

      if (pSource.length > AkelPad.SendMessage(lpWnd[IDEDSOURCE][WND], 213 /*EM_GETLIMITTEXT*/, 0, 0))
        pSource = "";
      else
      {
        bIgCase = (pModyf.indexOf("i") < 0) ? 0 : 1;
        bGlobal = (pModyf.indexOf("g") < 0) ? 0 : 1;
        bMultiL = (pModyf.indexOf("m") < 0) ? 0 : 1;
        CheckButtons();
      }
    }
  }

  SetWndFontAndText(lpWnd[IDEDSOURCE][WND], hGuiFont, pSource);
}

function TestRE()
{
  var pResult = "";
  var pModyf  = "";
  var pNLWin  = "\r\n";
  var pSource;
  var aTestRes;
  var i;

  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDEDRE][WND], lpBuffer, nBufSize);
  pREStr = AkelPad.MemRead(lpBuffer, _TSTR);
  if (! pREStr)
  {
    AkelPad.MessageBox(hWndDlg, pTxtNoRE, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
    oSys.Call("user32::SetFocus", lpWnd[IDEDRE][WND]);
    return;
  }

  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDEDSTRING][WND], lpBuffer, nBufSize);
  pString = AkelPad.MemRead(lpBuffer, _TSTR);
  if (! pString)
  {
    AkelPad.MessageBox(hWndDlg, pTxtNoStr, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
    oSys.Call("user32::SetFocus", lpWnd[IDEDSTRING][WND]);
    return;
  }

  if (nNL == 2)
    pString = pString.replace(/\r\n/g, "\n");
  else if (nNL == 3)
    pString = pString.replace(/\r\n/g, "\r");

  if (oRE.lastIndex == 0)
  {
    oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDEDSOURCE][WND], lpBuffer, nBufSize);
    pSource = AkelPad.MemRead(lpBuffer, _TSTR);
    if (bIgCase) pModyf += "i";
    if (bGlobal) pModyf += "g";
    if (bMultiL) pModyf += "m";
    oRE = new RegExp(pSource, pModyf);
  }

  if (nAction == 1) //.test
    pResult = oRE.test(pString).toString();

  else if (nAction == 2) //.exec
  {
    aTestRes = oRE.exec(pString);
    if (aTestRes)
    {
      for (i = 0; i < aTestRes.length; ++i)
        pResult += pTxtArray + "[" + i + "]=" + aTestRes[i] + ((i == aTestRes.length - 1) ? "" : pNLWin);
    }
    else
      pResult = String(aTestRes);
  }

  else if (nAction == 3) //.search
    pResult = pString.search(oRE).toString();

  else if (nAction == 4) //.match
  {
    aTestRes = pString.match(oRE);
    if (aTestRes)
    {
      for (i = 0; i < aTestRes.length; ++i)
        pResult += pTxtArray + "[" + i + "]=" + aTestRes[i] + ((i == aTestRes.length - 1) ? "" : pNLWin);
    }
    else
      pResult = String(aTestRes);
  }

  else if (nAction == 5) //.split
  {
    aTestRes = pString.split(oRE);
    if (aTestRes.length)
    {
      for (i = 0; i < aTestRes.length; ++i)
        pResult += pTxtArray + "[" + i + "]=" + aTestRes[i] + ((i == aTestRes.length - 1) ? "" : pNLWin);
    }
    else
      pResult = pTxtEmpArray;
  }

  else if (nAction == 6) //.replace
  {
    oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDEDWITH][WND], lpBuffer, nBufSize);
    pWith   = AkelPad.MemRead(lpBuffer, _TSTR);
    pResult = pString.replace(oRE, pWith);
  }

  SetWndFontAndText(lpWnd[IDEDRESULT][WND], hGuiFont, pResult);
  SetLastIndex();

  pResult  = "RegExp.$1=" + RegExp.$1 + pNLWin;
  pResult += "RegExp.$2=" + RegExp.$2 + pNLWin;
  pResult += "RegExp.$3=" + RegExp.$3 + pNLWin;
  pResult += "RegExp.$4=" + RegExp.$4 + pNLWin;
  pResult += "RegExp.$5=" + RegExp.$5 + pNLWin;
  pResult += "RegExp.$6=" + RegExp.$6 + pNLWin;
  pResult += "RegExp.$7=" + RegExp.$7 + pNLWin;
  pResult += "RegExp.$8=" + RegExp.$8 + pNLWin;
  pResult += "RegExp.$9=" + RegExp.$9 + pNLWin;
  pResult += "RegExp.index=" + RegExp.index + pNLWin;
  pResult += "RegExp.lastIndex=" + RegExp.lastIndex + pNLWin;
  pResult += "RegExp.lastMatch=" + RegExp.lastMatch + pNLWin;
  pResult += "RegExp.lastParen=" + RegExp.lastParen + pNLWin;
  pResult += "RegExp.leftContext=" + RegExp.leftContext + pNLWin;
  pResult += "RegExp.rightContext=" + RegExp.rightContext;

  SetWndFontAndText(lpWnd[IDEDGLOBPRO][WND], hGuiFont, pResult);

  oSys.Call("user32::SetFocus", lpWnd[IDEDRESULT][WND]);
}

function Help()
{
  var rcWnd   = GetWindowPos(hWndDlg);
  var hWndHlp = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                          0,              //dwExStyle
                          pClassName,     //lpClassName
                          pTxtREHelp,     //lpWindowName
                          0x90C80000,     //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU
                          rcWnd.left+15,  //x
                          rcWnd.top+40,   //y
                          425,            //nWidth
                          500,            //nHeight
                          hWndDlg,        //hWndParent
                          0,              //ID
                          hInstanceDLL,   //hInstance
                          DialogCallbackHelp); //lpParam

  if (hWndHlp)
  {
    oSys.Call("user32::EnableWindow", hMainWnd, 0);
    oSys.Call("user32::EnableWindow", hWndDlg, 0);
    AkelPad.WindowGetMessage();
  }
}

function DialogCallbackHelp(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    hWndEdHlp = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                          0x200,        //dwExStyle
                          "EDIT",       //lpClassName
                          0,            //lpWindowName
                          0x50200804,   //WS_VISIBLE|WS_CHILD|WS_VSCROLL|ES_READONLY|ES_MULTILINE
                          10,           //x
                          10,           //y
                          400,          //nWidth
                          450,          //nHeight
                          hWnd,         //hWndParent
                          0,            //ID
                          hInstanceDLL, //hInstance
                          0);           //lpParam
    SetWndFontAndText(hWndEdHlp, hGuiFont, pTxtHelpText);
  }

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("user32::SetFocus", hWndEdHlp);

  else if (uMsg == 256 /*WM_KEYDOWN*/)
  {
    if ((wParam == 27 /*VK_ESCAPE*/) || (wParam == 112 /*VK_F1*/))
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    oSys.Call("user32::EnableWindow", hMainWnd, 1);
    oSys.Call("user32::EnableWindow", hWndDlg, 1);
    oSys.Call("user32::DestroyWindow", hWnd);
  }

  else if (uMsg == 2) //WM_DESTROY
    oSys.Call("user32::PostQuitMessage", 0);

  return 0;
}

function Collection()
{
  var rcWnd   = GetWindowPos(hWndDlg);
  var hWndCol = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                          0,              //dwExStyle
                          pClassName,     //lpClassName
                          pTxtRECollect,  //lpWindowName
                          0x90C80000,     //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU
                          rcWnd.left-4,   //x
                          rcWnd.top+180,  //y
                          520,            //nWidth
                          350,            //nHeight
                          hWndDlg,        //hWndParent
                          0,              //ID
                          hInstanceDLL,   //hInstance
                          DialogCallbackCol); //lpParam

  if (hWndCol)
  {
    oSys.Call("user32::EnableWindow", hMainWnd, 0);
    oSys.Call("user32::EnableWindow", hWndDlg, 0);
    AkelPad.WindowGetMessage();
  }
}

function DialogCallbackCol(hWnd, uMsg, wParam, lParam)
{
  var i, nPos, nLowParam, nHiwParam;

  if (uMsg == 1) //WM_CREATE
  {
    for (i = 1000; i < lpCol.length; ++i)
    {
      lpCol[i][WND] = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                                lpCol[i][WNDEXSTY],//dwExStyle
                                lpCol[i][WNDTYPE], //lpClassName
                                0,                 //lpWindowName
                                lpCol[i][WNDSTY],  //dwStyle
                                lpCol[i][WNDX],    //x
                                lpCol[i][WNDY],    //y
                                lpCol[i][WNDW],    //nWidth
                                lpCol[i][WNDH],    //nHeight
                                hWnd,              //hWndParent
                                i,                 //ID
                                hInstanceDLL,      //hInstance
                                0);                //lpParam
      SetWndFontAndText(lpCol[i][WND], hGuiFont, lpCol[i][WNDTXT]);
    }

    //Fill listbox
    for (i = 0; i < aRECol.length; ++i)
    {
      AkelPad.MemCopy(lpBuffer, aRECol[i][0], _TSTR);
      nPos = AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0180 /*LB_ADDSTRING*/, 0, lpBuffer);
      if (nPos >= 0)
      {
        AkelPad.SendMessage(lpCol[IDLIST][WND], 0x019A /*LB_SETITEMDATA*/, nPos, i);
        if (aRECol[i][1] == pREStr)
          AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0186 /*LB_SETCURSEL*/, nPos, 0);
      }
    }

    CheckButtonsCollection();
  }

  else if (uMsg == 7) //WM_SETFOCUS
  {
    oSys.Call("user32::SetFocus", lpCol[IDLIST][WND]);
    SetSelRE();
  }

  else if (uMsg == 256 /*WM_KEYDOWN*/)
  {
    if (wParam == 27 /*VK_ESCAPE*/)
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
    else if (wParam == 13 /*VK_RETURN*/)
    {
      if (! bIsReturn)
        oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDOK, 0);
    }
    else if (wParam == 45 /*VK_INSERT*/)
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDADD, 0);
    else if (wParam == 46 /*VK_DELETE*/)
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDDELETE, 0);
    else if (wParam == 113 /*VK_F2*/)
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDRENAME, 0);
  }

  else if (uMsg == 257 /*WM_KEYUP*/)
    bIsReturn = 0;

  else if (uMsg == 258 /*WM_CHAR*/)
    FindRE(wParam);

  else if (uMsg == 273) //WM_COMMAND
  {
    nLowParam = LoWord(wParam);
    nHiwParam = HiWord(wParam);

    if (nLowParam == IDLIST)
    {
      if (nHiwParam == 1 /*LBN_SELCHANGE*/)
        SetSelRE();
      else if (nHiwParam == 2 /*LBN_DBLCLK*/)
        oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDOK, 0);
    }
    else if (nLowParam == IDADD)
    {
      bIsReturn = 1;
      AddRE(hWnd);
    }
    else if (nLowParam == IDRENAME)
    {
      bIsReturn = 1;
      RenameRE(hWnd);
    }
    else if (nLowParam == IDDELETE)
    {
      bIsReturn = 1;
      DeleteRE();
    }
    else if (nLowParam == IDOK)
    {
      nPos = AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0188 /*LB_GETCURSEL*/, 0, 0);
      if (nPos >= 0)
      {
        i = AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0199 /*LB_GETITEMDATA*/, nPos, 0);
        SetWndFontAndText(lpWnd[IDEDRE][WND], hGuiFont, aRECol[i][1]);
        SetLastIndex(0);
        SetSource();
      }
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
    }
    else if (nLowParam == IDCOLCLOSE)
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    for (i = aRECol.length - 1; i >= 0; --i)
    {
      if (! aRECol[i][0])
        aRECol.splice(i, 1);
    }
    oSys.Call("user32::EnableWindow", hMainWnd, 1);
    oSys.Call("user32::EnableWindow", hWndDlg, 1);
    oSys.Call("user32::DestroyWindow", hWnd);
  }

  else if (uMsg == 2) //WM_DESTROY
    oSys.Call("user32::PostQuitMessage", 0);

  else
    SetDefIDCollection(hWnd);

  return 0;
}

function SetDefIDCollection(hWnd)
{
  var nID    = 1000;
  var hFocus = oSys.Call("user32::GetFocus");

  while ((nID < lpCol.length) && (hFocus != lpCol[nID][WND]))
    ++nID;

  if (nID == IDLIST)
    nID = IDOK;

  oSys.Call("user32::DefDlgProc" + _TCHAR, hWnd, 1025 /*DM_SETDEFID*/, nID, 0);
}

function CheckButtonsCollection()
{
  var bEnable;

  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDEDRE][WND], lpBuffer, nBufSize);
  if (AkelPad.MemRead(lpBuffer, _TSTR))
    bEnable = 1;
  else
    bEnable = 0;
  oSys.Call("user32::EnableWindow", lpCol[IDADD][WND], bEnable);

  if (AkelPad.SendMessage(lpCol[IDLIST][WND], 0x018B /*LB_GETCOUNT*/, 0, 0) > 0)
    bEnable = 1;
  else
  {
    bEnable = 0;
    oSys.Call("user32::SetFocus", lpCol[IDLIST][WND]);
  }

  oSys.Call("user32::EnableWindow", lpCol[IDRENAME][WND], bEnable);
  oSys.Call("user32::EnableWindow", lpCol[IDDELETE][WND], bEnable);
  oSys.Call("user32::EnableWindow", lpCol[IDOK    ][WND], bEnable);
}

function SetSelRE(nPos)
{
  var pVal = "";
  var i;

  if (nPos == undefined)
    nPos = AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0188 /*LB_GETCURSEL*/, 0, 0);
  if (nPos < 0)
    nPos = 0;

  nPos = AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0186 /*LB_SETCURSEL*/, nPos, 0);

  if (nPos >= 0)
  {
    i    = AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0199 /*LB_GETITEMDATA*/, nPos, 0);
    pVal = aRECol[i][1];
  }

  SetWndFontAndText(lpCol[IDREVAL][WND], hGuiFont, pVal);
}

function AddRE(hWnd)
{
  var bNameExist = 1;
  var pName = "";
  var nPos;
  var i;

  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDEDRE][WND], lpBuffer, nBufSize);
  pREStr = AkelPad.MemRead(lpBuffer, _TSTR);

  if (pREStr)
  {
    for (i = 0; i < aRECol.length; ++i)
    {
      if (aRECol[i][1] == pREStr)
      {
        for (nPos = 0; nPos < AkelPad.SendMessage(lpCol[IDLIST][WND], 0x018B /*LB_GETCOUNT*/, 0, 0); ++nPos)
        {
          if (AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0199 /*LB_GETITEMDATA*/, nPos, 0) == i)
            break;
        }
        SetSelRE(nPos);
        AkelPad.MessageBox(hWnd, pTxtREExist + aRECol[i][0], pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
        return;
      }
    }

    nPos = AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0188 /*LB_GETCURSEL*/, 0, 0);
    if (nPos >= 0)
    {
      i = AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0199 /*LB_GETITEMDATA*/, nPos, 0);
      pName = aRECol[i][0];
    }

    while (bNameExist)
    {
      bNameExist = 0;
      pName = AkelPad.InputBox(hWnd, pTxtAddRE, pTxtName, pName);

      if (pName != undefined)
        pName = pName.replace(/ +$/, "");
  
      if (pName)
      {
        for (i = 0; i < aRECol.length; ++i)
        {
          if (aRECol[i][0] == pName)
          {
            for (nPos = 0; nPos < AkelPad.SendMessage(lpCol[IDLIST][WND], 0x018B /*LB_GETCOUNT*/, 0, 0); ++nPos)
            {
              if (AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0199 /*LB_GETITEMDATA*/, nPos, 0) == i)
                break;
            }
            SetSelRE(nPos);
            AkelPad.MessageBox(hWnd, pTxtNameExist + pName, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
            bNameExist = 1;
            break;
          }
        }

        if (! bNameExist)
        {
          AkelPad.MemCopy(lpBuffer, pName, _TSTR);
          nPos = AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0180 /*LB_ADDSTRING*/, 0, lpBuffer);
          if (nPos >= 0)
          {
            i = aRECol.push([pName, pREStr]) - 1;
            AkelPad.SendMessage(lpCol[IDLIST][WND], 0x019A /*LB_SETITEMDATA*/, nPos, i);
            SetSelRE(nPos);
            CheckButtonsCollection();
          }
        }
      }
    }
  }
  else
    AkelPad.MessageBox(hWnd, pTxtNoRE, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
}

function RenameRE(hWnd)
{
  var nPos = AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0188 /*LB_GETCURSEL*/, 0, 0);
  var bNameExist = 1;
  var nPos1;
  var i;
  var n;
  var pName;

  if (nPos >= 0)
  {
    n = AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0199 /*LB_GETITEMDATA*/, nPos, 0);
    pName = aRECol[n][0];

    while (bNameExist)
    {
      bNameExist = 0;
      pName = AkelPad.InputBox(hWnd, pTxtRenRE, pTxtNewName, pName);

      if (pName != undefined)
        pName = pName.replace(/ +$/, "");
  
      if (pName)
      {
        for (i = 0; i < aRECol.length; ++i)
        {
          if ((aRECol[i][0] == pName) && (i != n))
          {
            for (nPos1 = 0; nPos1 < AkelPad.SendMessage(lpCol[IDLIST][WND], 0x018B /*LB_GETCOUNT*/, 0, 0); ++nPos1)
            {
              if (AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0199 /*LB_GETITEMDATA*/, nPos1, 0) == i)
                break;
            }
            SetSelRE(nPos1);
            AkelPad.MessageBox(hWnd, pTxtNameExist + pName, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
            SetSelRE(nPos);
            bNameExist = 1;
            break;
          }
        }

        if (! bNameExist)
        {
          aRECol[n][0] = pName;
          AkelPad.MemCopy(lpBuffer, pName, _TSTR);
          AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0182 /*LB_DELETESTRING*/, nPos, lpBuffer);
          nPos = AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0180 /*LB_ADDSTRING*/, 0, lpBuffer);
          AkelPad.SendMessage(lpCol[IDLIST][WND], 0x019A /*LB_SETITEMDATA*/, nPos, n);
          SetSelRE(nPos);
        }
      }
    }
  }
}

function DeleteRE()
{
  var nPos = AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0188 /*LB_GETCURSEL*/, 0, 0);
  var i;

  if (nPos >= 0)
  {
    i = AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0199 /*LB_GETITEMDATA*/, nPos, 0);
    aRECol[i] = ["", ""];

    if (nPos == AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0182 /*LB_DELETESTRING*/, nPos, 0))
      --nPos;

    SetSelRE(nPos);
    CheckButtonsCollection();
  }
}

function FindRE(nChar)
{
  var pChar = String.fromCharCode(nChar).toUpperCase();
  var nPos;

  for (nPos = 0; nPos < AkelPad.SendMessage(lpCol[IDLIST][WND], 0x018B /*LB_GETCOUNT*/, 0, 0); ++nPos)
  {
    AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0189 /*LB_GETTEXT*/, nPos, lpBuffer);
    pName = AkelPad.MemRead(lpBuffer, _TSTR);
    if (pChar == pName.charAt(0).toUpperCase())
    {
      AkelPad.SendMessage(lpCol[IDLIST][WND], 0x0186 /*LB_SETCURSEL*/, nPos, 0);
      SetSelRE(nPos);
      break;
    }
  }
}

function ReadIni()
{
  var oFSO     = new ActiveXObject("Scripting.FileSystemObject");
  var pIniName = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";
  var pLngName = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + "_" + AkelPad.GetLangId(0 /*LANGID_FULL*/).toString() + ".lng";
  var oError;

  if (oFSO.FileExists(pLngName))
  {
    try
    {
      eval(AkelPad.ReadFile(pLngName));
    }
    catch (oError)
    {
    }
  }
  else
  {
    nAX = 205, nAW = 90;
    nBX = 300, nBW = 90;
    nCX = 400, nCW = 90;
    nRX = 205, nRW = 100;
               nPW = 391;
    nMX = 405, nMW = 90;
  
    pTxtCaption   = "Regular Expressions Tester for JavaScript";
    pTxtRegExp    = "Regular Expression (RE)";
    pTxtSource    = "RE.source";
    pTxtEscape    = "&Escape";
    pTxtUnEscape  = "&UnEscape";
    pTxtRE        = "RE";
    pTxtIgCase    = "&ignoreCase";
    pTxtGlobal    = "&global";
    pTxtMultiL    = "&multiline";
    pTxtNewLine   = "New line:";
    pTxtCollect   = "&Collection";
    pTxtNLWin     = "Win (\\r\\n)";
    pTxtNLUnix    = "Unix (\\n)";
    pTxtNLMac     = "Mac (\\r)";
    pTxtString    = "String to test (Str)";
    pTxtAction    = "Action";
    pTxtMeTest    = "RE.test(Str)";
    pTxtMeExec    = "RE.exec(Str)";
    pTxtMeSearch  = "Str.search(RE)";
    pTxtMeMatch   = "Str.match(RE)";
    pTxtMeSplit   = "Str.split(RE)";
    pTxtMeReplace = "Str.replace(RE,With):";
    pTxtResult    = "Result";
    pTxtLastInd   = "RE.lastIndex=";
    pTxtResetInd  = "&Reset lastIndex";
    pTxtArray     = "Array";
    pTxtEmpArray  = "empty Array";
    pTxtGlobPro   = "Global RegExp object properties";
    pTxtTest      = "Test";
    pTxtHelp      = "Help";
    pTxtOpaqMinus = "Opaque-";
    pTxtOpaqPlus  = "Opaque+";
    pTxtClose     = "Close";
    pTxtCopyPaste = "Copy/Paste";
    pTxtCopy      = "Copy";
    pTxtCopyCB    = "Copy to clipboard";
    pTxtCopyAP    = "Copy to AkelPad";
    pTxtPasteCB   = "Paste from clipboard";
    pTxtPasteAP   = "Paste from AkelPad";
    pTxtNoRE      = "There is no Regular Expression."
    pTxtNoStr     = "There is no string to test.";
    pTxtRECollect = "Collection of Regular Expressions";
    pTxtName      = "Name";
    pTxtValue     = "Value";
    pTxtAdd       = "Add (Ins)";
    pTxtRename    = "Rename (F2)";
    pTxtDelete    = "Delete (Del)";
    pTxtOK        = "OK (Enter)";
    pTxtAddRE     = "Add Regular Expression";
    pTxtRenRE     = "Rename Regular Expression";
    pTxtNewName   = "New name";
    pTxtREExist   = "This Regular Expression already exists under name: ";
    pTxtNameExist = "This name already exists: ";
    pTxtREHelp    = "Help for Regular Expressions";
    pTxtHelpText  = "	Modifiers\r\nModifiers are used to perform case-insensitive and global searches:\r\nModifier	Description\r\ni	Perform case-insensitive matching\r\ng	Perform a global match (find all matches rather than stopping after the\r\n	first match)\r\nm	Perform multiline matching\r\n\r\n	Brackets\r\nBrackets are used to find a range of characters:\r\nExpression	Description\r\n[abc]		Find any character between the brackets\r\n[^abc]		Find any character not between the brackets\r\n[0-9]		Find any digit from 0 to 9\r\n[A-Z]		Find any character from uppercase A to uppercase Z\r\n[a-z]		Find any character from lowercase a to lowercase z\r\n[A-z]		Find any character from uppercase A to lowercase z\r\n[adgk]		Find any character in the given set\r\n[^adgk]		Find any character outside the given set\r\n(red|blue|green)	Find any of the alternatives specified\r\n\r\n	Metacharacters\r\nMetacharacters are characters with a special meaning:\r\nMetachar	Description\r\n.	Find a single character, except newline or line terminator\r\n\\w	Find a word character\r\n\\W	Find a non-word character\r\n\\d	Find a digit\r\n\\D	Find a non-digit character\r\n\\s	Find a whitespace character\r\n\\S	Find a non-whitespace character\r\n\\b	Find a match at the beginning/end of a word\r\n\\B	Find a match not at the beginning/end of a word\r\n\\0	Find a NUL character\r\n\\n	Find a new line character\r\n\\f	Find a form feed character\r\n\\r	Find a carriage return character\r\n\\t	Find a tab character\r\n\\v	Find a vertical tab character\r\n\\xxx	Find the character specified by an octal number xxx\r\n\\xdd	Find the character specified by a hexadecimal number dd\r\n\\uxxxx	Find the Unicode character specified by a hexadecimal number xxxx\r\n\r\n	Quantifiers\r\nQuantifier	Description\r\nn+	Matches any string that contains at least one n\r\nn*	Matches any string that contains zero or more occurrences of n\r\nn?	Matches any string that contains zero or one occurrences of n\r\nn{X}	Matches any string that contains a sequence of X n's\r\nn{X,Y}	Matches any string that contains a sequence of X or Y n's\r\nn{X,}	Matches any string that contains a sequence of at least X n's\r\nn$	Matches any string with n at the end of it\r\n^n	Matches any string with n at the beginning of it\r\n?=n	Matches any string that is followed by a specific string n\r\n?!n	Matches any string that is not followed by a specific string n\r\n\r\n	RegExp Object Properties\r\nProperty		Description\r\nglobal		Specifies if the \"g\" modifier is set\r\nignoreCase	Specifies if the \"i\" modifier is set\r\nlastIndex		The index at which to start the next match\r\nmultiline		Specifies if the \"m\" modifier is set\r\nsource		The text of the RegExp pattern\r\n\r\n	RegExp Object Methods\r\nMethod	Description\r\ncompile()	Compiles a regular expression\r\nexec()	Tests for a match in a string. Returns the first match\r\ntest()	Tests for a match in a string. Returns true or false\r\n\r\n				_____________________________\r\n				Source: http://www.w3schools.com";
  }
  
  nEW = nPW - 16;
  
  if (oFSO.FileExists(pIniName))
  {
    try
    {
      eval(AkelPad.ReadFile(pIniName));
    }
    catch (oError)
    {
    }
  }
}

function WriteIni()
{
  var oFSO = new ActiveXObject("Scripting.FileSystemObject");
  var rcWnd;
  var oFile;
  var pTxtIni;
  var i;

  rcWnd = GetWindowPos(hWndDlg);

  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDEDRE][WND], lpBuffer, nBufSize);
  pREStr = AkelPad.MemRead(lpBuffer, _TSTR).replace(/[\\"]/g, "\\$&");
  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDEDSTRING][WND], lpBuffer, nBufSize);
  pString = AkelPad.MemRead(lpBuffer, _TSTR).replace(/[\\"]/g, "\\$&").replace(/\r\n/g, "\\r\\n");
  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDEDWITH][WND], lpBuffer, nBufSize);
  pWith = AkelPad.MemRead(lpBuffer, _TSTR).replace(/[\\"]/g, "\\$&");

  pTxtIni = 'nWndPosX=' + rcWnd.left + ';\r\n'  +
            'nWndPosY=' + rcWnd.top  + ';\r\n'  +
            'nOpaque='  + nOpaque    + ';\r\n'  +
            'nNL='      + nNL        + ';\r\n'  +
            'nAction='  + nAction    + ';\r\n'  +
            'pREStr="'  + pREStr     + '";\r\n' +
            'pString="' + pString    + '";\r\n' +
            'pWith="'   + pWith      + '";\r\n';

  pTxtIni += 'aRECol=[\r\n';
  for (i = 0; i < aRECol.length; ++i)
  {
    pTxtIni += '["' + 
                aRECol[i][0].replace(/[\\"]/g, "\\$&") + '","' + 
                aRECol[i][1].replace(/[\\"]/g, "\\$&") + '"]' +
                ((i < aRECol.length - 1) ? ',' : '') + '\r\n';
  }
  pTxtIni += '];';

  oFile = oFSO.OpenTextFile(WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini", 2, true, -1);
  oFile.Write(pTxtIni);
  oFile.Close();
}
