// CSVToColumnText.js - ver. 2012-04-14
//
// Converts text in csv format to text in columns.
//
// Call("Scripts::Main", 1, "CSVToColumnText.js")

var oSys = AkelPad.SystemFunction();

if (oSys.Call("kernel32::GetUserDefaultLangID") == 0x0415) //Polish
{
  var pTxtCaption   = "Konwersja tekstu csv";
  var pTxtMDIRO     = "Musi być włączony tryb MDI/PMDI lub wyłączony tryb tylko do odczytu.";
  var pTxtNoSep     = "Musisz wpisać separator.";
  var pTxtBadSep    = "Niewłaściwy separator";
  var pTxtWait      = "Czekaj lub Esc";
  var pTxtCountIn   = "Wiersz w tekście wejściowym:";
  var pTxtCountOut  = "Wiersz w tekście wyjściowym:";
  var pTxtCountMes1 = "Przetworzonych wierszy: ";
  var pTxtCountMes2 = ". Tekst jest dłuższy. Czy kontynuować?";
  var pTxtInput     = "Tekst wejściowy";
  var pTxtInSep     = "Separator";
  var pTxtInSep0    = ", Przecinek";
  var pTxtInSep1    = "; Średnik";
  var pTxtInSep2    = ": Dwukropek";
  var pTxtInSep3    = ". Kropka";
  var pTxtInSep4    = "| Pipe";
  var pTxtInSep5    = "Tab";
  var pTxtInSep6    = "Spacja";
  var pTxtInSep7    = "Inny:";
  var pTxtOutput    = "Tekst wyjściowy";
  var pTxtRCSep     = "Separatory";
  var pTxtCSep      = "Separator kolumn:";
  var pTxtRSep      = "Separator wierszy:";
  var pTxtAdCol     = "Dodaj kolumnę z numerem wiersza";
  var pTxtAdColL    = "z lewej";
  var pTxtAdColR    = "z prawej";
  var pTxtAdColTxt  = "Pierwszy numer:";
  var pTxtAlign     = "Wyrównanie w kolumnach";
  var pTxtAlignL    = "Lewa";
  var pTxtAlignR    = "Prawa";
  var pTxtAlignC    = "Środek";
  var pTxtAction    = "Wykonaj";
  var pTxtAction0   = "Otwórz na nowej karcie (MDI)";
  var pTxtAction1   = "Zamień zaznaczenie";
  var pTxtAction2   = "Wstaw przed zaznaczeniem";
  var pTxtAction3   = "Wstaw po zaznaczeniu";
  var pTxtOK        = "OK";
  var pTxtCancel    = "Anuluj";
}
else
{
  var pTxtCaption   = "CSV to column text";
  var pTxtMDIRO     = "Must be switched on MDI/PMDI mode or switched off read-only mode.";
  var pTxtNoSep     = "You must specify a separator.";
  var pTxtBadSep    = "Unacceptable separator";
  var pTxtWait      = "Wait or Esc";
  var pTxtCountIn   = "Line number at input text:";
  var pTxtCountOut  = "Line number at output text:";
  var pTxtCountMes1 = "Processed lines: ";
  var pTxtCountMes2 = ". The text is longer. Continue?";
  var pTxtInput     = "Input text";
  var pTxtInSep     = "Separator";
  var pTxtInSep0    = ", Comma";
  var pTxtInSep1    = "; Semicolon";
  var pTxtInSep2    = ": Colon";
  var pTxtInSep3    = ". Dot";
  var pTxtInSep4    = "| Pipe";
  var pTxtInSep5    = "Tab";
  var pTxtInSep6    = "Space";
  var pTxtInSep7    = "Other:";
  var pTxtOutput    = "Output text";
  var pTxtRCSep     = "Separators";
  var pTxtCSep      = "Columns separator:";
  var pTxtRSep      = "Rows separator:";
  var pTxtAdCol     = "Add column with row number";
  var pTxtAdColL    = "at left";
  var pTxtAdColR    = "at right";
  var pTxtAdColTxt  = "Initial number:";
  var pTxtAlign     = "Align in columns";
  var pTxtAlignL    = "Left";
  var pTxtAlignR    = "Right";
  var pTxtAlignC    = "Center";
  var pTxtAction    = "Action";
  var pTxtAction0   = "Open in new tab (MDI mode)";
  var pTxtAction1   = "Replace selection";
  var pTxtAction2   = "Insert before selection";
  var pTxtAction3   = "Insert after selection";
  var pTxtOK        = "OK";
  var pTxtCancel    = "Cancel";
}

var hMainWnd     = AkelPad.GetMainWnd();
var hEditWnd     = AkelPad.GetEditWnd();
var hGuiFont     = oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
var pScriptName  = WScript.ScriptName;
var hInstanceDLL = AkelPad.GetInstanceDll();
var bIsRO        = AkelPad.GetEditReadOnly(hEditWnd);

var DT_DWORD  = 3;
var nInSep    = 0;
var pOtSepStr = "";
var bCSep     = 1;
var pCSepStr  = "|";
var bRSep     = 0;
var pRSepStr  = "-";
var bAdColL   = 0;
var bAdColR   = 0;
var pAdColNum = "1";
var pAlign    = "L";
var nAction   = 0;
var pSepars   = ",;:.|\t ";
var pInSep;
var pCSep;
var pRSep;
var hWndDlg;
var lpBuffer;
var nLowParam;
var nHiwParam;
var nWndPosX;
var nWndPosY;
var i;

ReadWriteIni(0);

var lpWnd      = [];
var IDINPUT    = 1000;
var IDINSEP    = 1001;
var IDINSEP0   = 1002;
var IDINSEP1   = 1003;
var IDINSEP2   = 1004;
var IDINSEP3   = 1005;
var IDINSEP4   = 1006;
var IDINSEP5   = 1007;
var IDINSEP6   = 1008;
var IDINSEP7   = 1009;
var IDOTSEPSTR = 1010;
var IDOUTPUT   = 1011;
var IDRCSEP    = 1012;
var IDCSEP     = 1013;
var IDCSEPSTR  = 1014;
var IDRSEP     = 1015;
var IDRSEPSTR  = 1016;
var IDADCOL    = 1017;
var IDADCOLL   = 1018;
var IDADCOLR   = 1019;
var IDADCOLTXT = 1020;
var IDADCOLNUM = 1021;
var IDALIGN    = 1022;
var IDALIGNL   = 1023;
var IDALIGNR   = 1024;
var IDALIGNC   = 1025;
var IDACTION   = 1026;
var IDACTION0  = 1027;
var IDACTION1  = 1028;
var IDACTION2  = 1029;
var IDACTION3  = 1030;
var IDCOUNTER  = 1031;
var IDOK       = 1032;
var IDCANCEL   = 1033;

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
//0x50012080 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_AUTOHSCROLL|ES_NUMBER
//Windows             WNDTYPE,WND,WNDEXSTY,     WNDSTY,WNDX,WNDY,WNDW,WNDH, WNDTXT
lpWnd[IDINPUT   ] = ["BUTTON",  0,       0, 0x50000007,  10,  10, 116, 216, pTxtInput];
lpWnd[IDINSEP   ] = ["BUTTON",  0,       0, 0x50000007,  18,  30, 100, 189, pTxtInSep];
lpWnd[IDINSEP0  ] = ["BUTTON",  0,       0, 0x50000009,  28,  50,  85,  16, pTxtInSep0];
lpWnd[IDINSEP1  ] = ["BUTTON",  0,       0, 0x50000009,  28,  70,  85,  16, pTxtInSep1];
lpWnd[IDINSEP2  ] = ["BUTTON",  0,       0, 0x50000009,  28,  90,  85,  16, pTxtInSep2];
lpWnd[IDINSEP3  ] = ["BUTTON",  0,       0, 0x50000009,  28, 110,  85,  16, pTxtInSep3];
lpWnd[IDINSEP4  ] = ["BUTTON",  0,       0, 0x50000009,  28, 130,  85,  16, pTxtInSep4];
lpWnd[IDINSEP5  ] = ["BUTTON",  0,       0, 0x50000009,  28, 150,  85,  16, pTxtInSep5];
lpWnd[IDINSEP6  ] = ["BUTTON",  0,       0, 0x50000009,  28, 170,  85,  16, pTxtInSep6];
lpWnd[IDINSEP7  ] = ["BUTTON",  0,       0, 0x50000009,  28, 190,  50,  16, pTxtInSep7];
lpWnd[IDOTSEPSTR] = ["EDIT",    0,   0x200, 0x50010080,  80, 190,  20,  20, pOtSepStr];
lpWnd[IDOUTPUT  ] = ["BUTTON",  0,       0, 0x50000007, 142,  10, 397, 186, pTxtOutput];
lpWnd[IDRCSEP   ] = ["BUTTON",  0,       0, 0x50000007, 150,  30, 185,  74, pTxtRCSep];
lpWnd[IDCSEP    ] = ["BUTTON",  0,       0, 0x50010003, 160,  50, 110,  16, pTxtCSep];
lpWnd[IDCSEPSTR ] = ["EDIT",    0,   0x200, 0x50010080, 275,  50,  50,  20, pCSepStr];
lpWnd[IDRSEP    ] = ["BUTTON",  0,       0, 0x50010003, 160,  74, 110,  16, pTxtRSep];
lpWnd[IDRSEPSTR ] = ["EDIT",    0,   0x200, 0x50010080, 275,  74,  20,  20, pRSepStr];
lpWnd[IDADCOL   ] = ["BUTTON",  0,       0, 0x50000007, 150, 114, 185,  74, pTxtAdCol];
lpWnd[IDADCOLL  ] = ["BUTTON",  0,       0, 0x50010003, 160, 134,  60,  16, pTxtAdColL];
lpWnd[IDADCOLR  ] = ["BUTTON",  0,       0, 0x50010003, 270, 134,  60,  16, pTxtAdColR];
lpWnd[IDADCOLTXT] = ["STATIC",  0,       0, 0x50000000, 177, 158, 100,  13, pTxtAdColTxt];
lpWnd[IDADCOLNUM] = ["EDIT",    0,   0x200, 0x50012080, 255, 158,  50,  20, pAdColNum];
lpWnd[IDALIGN   ] = ["BUTTON",  0,       0, 0x50000007, 345,  30, 185,  43, pTxtAlign];
lpWnd[IDALIGNL  ] = ["BUTTON",  0,       0, 0x50000009, 355,  50,  50,  16, pTxtAlignL];
lpWnd[IDALIGNR  ] = ["BUTTON",  0,       0, 0x50000009, 412,  50,  50,  16, pTxtAlignR];
lpWnd[IDALIGNC  ] = ["BUTTON",  0,       0, 0x50000009, 469,  50,  50,  16, pTxtAlignC];
lpWnd[IDACTION  ] = ["BUTTON",  0,       0, 0x50000007, 345,  83, 185, 105, pTxtAction];
lpWnd[IDACTION0 ] = ["BUTTON",  0,       0, 0x50000009, 355, 103, 160,  16, pTxtAction0];
lpWnd[IDACTION1 ] = ["BUTTON",  0,       0, 0x50000009, 355, 123, 160,  16, pTxtAction1];
lpWnd[IDACTION2 ] = ["BUTTON",  0,       0, 0x50000009, 355, 143, 160,  16, pTxtAction2];
lpWnd[IDACTION3 ] = ["BUTTON",  0,       0, 0x50000009, 355, 163, 160,  16, pTxtAction3];
lpWnd[IDCOUNTER ] = ["STATIC",  0,       0, 0x50000000, 220, 209, 150,  13, ""];
lpWnd[IDOK      ] = ["BUTTON",  0,       0, 0x50010001, 365, 206,  80,  23, pTxtOK];
lpWnd[IDCANCEL  ] = ["BUTTON",  0,       0, 0x50010000, 460, 206,  80,  23, pTxtCancel];


if (hEditWnd)
{
  if ((AkelPad.IsMDI() == 0) && bIsRO)
  {
    AkelPad.MessageBox(hMainWnd, pTxtMDIRO, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
    WScript.Quit();
  }
  else if ((AkelPad.IsMDI() == 0) && (nAction == 0))
    nAction = 3;
  else if (bIsRO && (nAction > 0))
    nAction = 0;

  if (AkelPad.WindowRegisterClass(pScriptName))
  {
    if (lpBuffer=AkelPad.MemAlloc(256 * _TSIZE))
    {
      //Create dialog
      AkelPad.MemCopy(lpBuffer, pScriptName, _TSTR);
      hWndDlg=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                        0,               //dwExStyle
                        lpBuffer,        //lpClassName
                        0,               //lpWindowName
                        0x90CA0000,      //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX
                        0,               //x
                        0,               //y
                        554,             //nWidth
                        267,             //nHeight
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

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1)  //WM_CREATE
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
    AkelPad.SendMessage(lpWnd[IDOTSEPSTR][WND], 197 /*EM_LIMITTEXT*/, 1, 0);
    AkelPad.SendMessage(lpWnd[IDRSEPSTR][WND], 197 /*EM_LIMITTEXT*/, 1, 0);

    //Check
    AkelPad.SendMessage(lpWnd[eval("IDINSEP" + nInSep)][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    oSys.Call("user32::EnableWindow", lpWnd[IDOTSEPSTR][WND], (nInSep == 7));

    if (bCSep) AkelPad.SendMessage(lpWnd[IDCSEP][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    if (bRSep) AkelPad.SendMessage(lpWnd[IDRSEP][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    oSys.Call("user32::EnableWindow", lpWnd[IDCSEPSTR][WND], bCSep);
    oSys.Call("user32::EnableWindow", lpWnd[IDRSEPSTR][WND], bRSep);

    if (bAdColL) AkelPad.SendMessage(lpWnd[IDADCOLL][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    if (bAdColR) AkelPad.SendMessage(lpWnd[IDADCOLR][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    oSys.Call("user32::EnableWindow", lpWnd[IDADCOLNUM][WND], ((bAdColL) || (bAdColR)));

    AkelPad.SendMessage(lpWnd[eval("IDALIGN" + pAlign)][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);

    AkelPad.SendMessage(lpWnd[eval("IDACTION" + nAction)][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    oSys.Call("user32::EnableWindow", lpWnd[IDACTION1][WND], (! bIsRO));
    oSys.Call("user32::EnableWindow", lpWnd[IDACTION2][WND], (! bIsRO));
    oSys.Call("user32::EnableWindow", lpWnd[IDACTION3][WND], (! bIsRO));
    if (AkelPad.IsMDI() == 0)
      oSys.Call("user32::EnableWindow", lpWnd[IDACTION0][WND], false);

    //Set window position
    if ((nWndPosX == undefined) || (nWndPosY == undefined))
      MoveWindow(hMainWnd, hWnd, "RT");
    else
      MoveWindow(hMainWnd, hWnd, [nWndPosX, nWndPosY]);
  }

  else if (uMsg == 7)  //WM_SETFOCUS
    oSys.Call("user32::SetFocus", lpWnd[eval("IDINSEP" + nInSep)][WND]);

  else if (uMsg == 256)  //WM_KEYDOWN
  {
    if (wParam == 27)  //VK_ESCAPE
      oSys.Call("user32::PostMessage" + _TCHAR, hWndDlg, 273 /*WM_COMMAND*/, IDCANCEL, 0);
    else if (wParam == 13)  //VK_RETURN
      oSys.Call("user32::PostMessage" + _TCHAR, hWndDlg, 273 /*WM_COMMAND*/, IDOK, 0);
  }

  else if ((uMsg == 260) /*WM_SYSKEYDOWN*/ &&
           (oSys.Call("user32::GetAsyncKeyState", 0xA0 /*VK_LSHIFT*/)))
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

  else if (uMsg == 273)  //WM_COMMAND
  {
    nLowParam = LoWord(wParam);
    nHiwParam = HiWord(wParam);

    if ((nLowParam >= IDINSEP0) && (nLowParam <= IDINSEP7))
    {
      nInSep = nLowParam - IDINSEP0;
      oSys.Call("user32::EnableWindow", lpWnd[IDOTSEPSTR][WND], (nInSep == 7));
      AkelPad.SendMessage(lpWnd[eval("IDALIGN" + pAlign)][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
      AkelPad.SendMessage(lpWnd[eval("IDACTION" + nAction)][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    }

    else if (nLowParam == IDCSEP)
    {
      bCSep = AkelPad.SendMessage(lpWnd[IDCSEP][WND], 240 /*BM_GETCHECK*/, 0, 0);
      oSys.Call("user32::EnableWindow", lpWnd[IDCSEPSTR][WND], bCSep);
    }
    else if (nLowParam == IDRSEP)
    {
      bRSep = AkelPad.SendMessage(lpWnd[IDRSEP][WND], 240 /*BM_GETCHECK*/, 0, 0);
      oSys.Call("user32::EnableWindow", lpWnd[IDRSEPSTR][WND], bRSep);
    }

    else if ((nLowParam == IDADCOLL) || (nLowParam == IDADCOLR))
    {
      if (nLowParam == IDADCOLL)
        bAdColL = AkelPad.SendMessage(lpWnd[IDADCOLL][WND], 240 /*BM_GETCHECK*/, 0, 0);
      else
        bAdColR = AkelPad.SendMessage(lpWnd[IDADCOLR][WND], 240 /*BM_GETCHECK*/, 0, 0);
      oSys.Call("user32::EnableWindow", lpWnd[IDADCOLNUM][WND], ((bAdColL) || (bAdColR)));
    }

    else if ((nLowParam >= IDALIGNL) && (nLowParam <= IDALIGNC))
    {
      pAlign = "LRC".charAt(nLowParam - IDALIGNL);
      AkelPad.SendMessage(lpWnd[eval("IDACTION" + nAction)][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
      AkelPad.SendMessage(lpWnd[eval("IDINSEP" + nInSep)][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    }

    else if ((nLowParam >= IDACTION0) && (nLowParam <= IDACTION3))
    {
      nAction = nLowParam - IDACTION0;
      AkelPad.SendMessage(lpWnd[eval("IDALIGN" + pAlign)][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
      AkelPad.SendMessage(lpWnd[eval("IDINSEP" + nInSep)][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    }

    else if (LoWord(wParam) == IDOK)
    {
      if (nInSep == 7)
      {
        oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDOTSEPSTR][WND], lpBuffer, 256);
        pOtSepStr = AkelPad.MemRead(lpBuffer, _TSTR);
        if (! pOtSepStr)
        {
          AkelPad.MessageBox(hWnd, pTxtNoSep, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
          oSys.Call("user32::SetFocus", lpWnd[IDOTSEPSTR][WND]);
          return;
        }
        else if (pOtSepStr == '"')
        {
          AkelPad.MessageBox(hWnd, pTxtBadSep, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
          oSys.Call("user32::SetFocus", lpWnd[IDOTSEPSTR][WND]);
          return;
        }
      }
      pInSep = (pSepars + pOtSepStr).charAt(nInSep);

      if (bCSep)
      {
        oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDCSEPSTR][WND], lpBuffer, 256);
        pCSepStr = AkelPad.MemRead(lpBuffer, _TSTR);
        pCSep    = pCSepStr;
      }
      else
        pCSep = "";

      if (bRSep)
      {
        oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDRSEPSTR][WND], lpBuffer, 256);
        pRSepStr = AkelPad.MemRead(lpBuffer, _TSTR);
        pRSep    = pRSepStr;
      }
      else
        pRSep = "";

      oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDADCOLNUM][WND], lpBuffer, 256);
      pAdColNum = AkelPad.MemRead(lpBuffer, _TSTR);
      if (! pAdColNum)
        pAdColNum = "0";

      CSVToColTxt();
      oSys.Call("user32::PostMessage" + _TCHAR, hWndDlg, 16 /*WM_CLOSE*/, 0, 0);
    }

    else if (LoWord(wParam) == IDCANCEL)
      oSys.Call("user32::PostMessage" + _TCHAR, hWndDlg, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 16)  //WM_CLOSE
  {
    ReadWriteIni(1);

    //Enable main window
    oSys.Call("user32::EnableWindow", hMainWnd, true);
    //Destroy dialog
    oSys.Call("user32::DestroyWindow", hWnd);
  }

  else if (uMsg == 2)  //WM_DESTROY
  {
    //Exit message loop
    oSys.Call("user32::PostQuitMessage", 0);
  }

  else
  {
    if (oSys.Call("user32::GetFocus") != lpWnd[IDCANCEL][WND])
      oSys.Call("user32::DefDlgProc" + _TCHAR, hWnd, 1025 /*DM_SETDEFID*/, IDOK, 0);
  }

  return 0;
}

function SetWindowFontAndText(hWnd, hFont, pText)
{
  var lpWindowText;

  AkelPad.SendMessage(hWnd, 48 /*WM_SETFONT*/, hFont, true);

  if (lpWindowText=AkelPad.MemAlloc(256 * _TSIZE))
  {
    AkelPad.MemCopy(lpWindowText, pText.substr(0, 255), _TSTR);
    oSys.Call("user32::SetWindowText" + _TCHAR, hWnd, lpWindowText);

    AkelPad.MemFree(lpWindowText);
  }
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

function ReadWriteIni(bWrite)
{
  var oFSO     = new ActiveXObject("Scripting.FileSystemObject");
  var pIniName = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";
  var rcWnd;
  var nError;
  var oFile;
  var pTxt;

  if (bWrite)
  {
    rcWnd = GetWindowPos(hWndDlg);

    oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDOTSEPSTR][WND], lpBuffer, 256);
    pOtSepStr = AkelPad.MemRead(lpBuffer, _TSTR);
    oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDCSEPSTR][WND], lpBuffer, 256);
    pCSepStr = AkelPad.MemRead(lpBuffer, _TSTR);
    oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDCSEPSTR][WND], lpBuffer, 256);
    pCSepStr = AkelPad.MemRead(lpBuffer, _TSTR);
    oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDADCOLNUM][WND], lpBuffer, 256);
    pAdColNum = AkelPad.MemRead(lpBuffer, _TSTR);

    pTxt = 'nWndPosX='   + rcWnd.left + ';\r\n' +
           'nWndPosY='   + rcWnd.top  + ';\r\n' +
           'nInSep='     + nInSep + ';\r\n' +
           'pOtSepStr="' + pOtSepStr.replace(/[\\"]/g, "\\$&") + '";\r\n' +
           'bCSep='      + bCSep + ';\r\n' +
           'pCSepStr="'  + pCSepStr.replace(/[\\"]/g, "\\$&") + '";\r\n' +
           'bRSep='      + bRSep + ';\r\n' +
           'pRSepStr="'  + pRSepStr.replace(/[\\"]/g, "\\$&") + '";\r\n' +
           'bAdColL='    + bAdColL + ';\r\n' +
           'bAdColR='    + bAdColR + ';\r\n' +
           'pAdColNum="' + pAdColNum + '";\r\n' +
           'pAlign="'    + pAlign + '";\r\n' +
           'nAction='    + nAction + ';';

    oFile = oFSO.OpenTextFile(pIniName, 2, true, 0);
    oFile.Write(pTxt);
    oFile.Close();
  }

  else if (oFSO.FileExists(pIniName))
  {
    try
    {
      eval(AkelPad.ReadFile(pIniName));
    }
    catch (nError)
    {
    }
  }
}

function Pad(pString, nLen, pType, pChar)
{
  var i = 0;

  if (! pType) pType = "R";
  if (! pChar) pChar = " ";

  if (pType == "R")
  {
    while (pString.length < nLen)
      pString += pChar;
  }
  else if (pType == "L")
  {
    while (pString.length < nLen)
      pString = pChar + pString;
  }
  else if (pType == "C")
  {
    while (pString.length < nLen)
    {
      if ((i % 2) == 0)
        pString += pChar;
      else
        pString = pChar + pString;
      ++ i;
    }
  }
  return pString;
}

function Replicate(pStrIn, nNum)
{
  var pStrOut = "";
  var i;

  for (i=0; i < nNum; ++i)
    pStrOut += pStrIn;

  return pStrOut;
}

function CSVToColTxt()
{
  var pPad      = pAlign;
  var nAdColNum = parseInt(pAdColNum);
  var nBegSel   = AkelPad.GetSelStart();
  var nEndSel   = AkelPad.GetSelEnd();
  var lpColLen  = [];
  var lpRowNum  = [];
  var lpTxt1    = [];
  var lpTxt2    = [];
  var pRSepLine;
  var pTxt;
  var nNumLen;
  var i, n, v;

  if (pAlign == "L") pPad = "R";
  else if (pAlign == "R") pPad = "L";

  if (nBegSel == nEndSel)
  {
    nBegSel = 0;
    nEndSel = -1;
  }

  SetWindowFontAndText(lpWnd[IDCOUNTER][WND], hGuiFont, pTxtCountIn);
  SetWindowFontAndText(lpWnd[IDCANCEL][WND], hGuiFont, pTxtWait);

  lpTxt1 = CSVToArray(AkelPad.GetTextRange(nBegSel, nEndSel), pInSep);

  if (lpTxt1 == null)
    return;

  for (i=0; i < lpTxt1.length; ++i)
  {
    lpRowNum.push(1);

    while (lpColLen.length < lpTxt1[i].length)
      lpColLen.push(0);

    for (n=0; n < lpTxt1[i].length; ++n)
    {
      lpTxt1[i][n] = lpTxt1[i][n].split("\r");

      if (lpRowNum[i] < lpTxt1[i][n].length)
        lpRowNum[i] = lpTxt1[i][n].length;

      for (v=0; v < lpTxt1[i][n].length; ++v)
      {
        if (lpColLen[n] < lpTxt1[i][n][v].length)
          lpColLen[n] = lpTxt1[i][n][v].length;
      }
    }
  }

  nNumLen = (lpTxt1.length + nAdColNum - 1).toString().length;

  if (bRSep)
  {
    pRSepLine = pCSep;
    for (n=0; n < lpColLen.length; ++n)
      pRSepLine = pRSepLine + Replicate(pRSep, lpColLen[n]) + pCSep;
    if (bAdColL)
      pRSepLine = pCSep + Replicate(pRSep, nNumLen) + pRSepLine;
    if (bAdColR)
      pRSepLine = pRSepLine + Replicate(pRSep, nNumLen) + pCSep;
    lpTxt2.push(pRSepLine);
  }

  SetWindowFontAndText(lpWnd[IDCOUNTER][WND], hGuiFont, pTxtCountOut);

  for (i=0; i < lpTxt1.length; ++i)
  {
    while (lpTxt1[i].length < lpColLen.length)
      lpTxt1[i].push([""]);

    for (n=0; n < lpColLen.length; ++n)
    {
      while (lpTxt1[i][n].length < lpRowNum[i])
        lpTxt1[i][n].push("");
    }

    for (v=0; v < lpRowNum[i]; ++v)
    {
      pTxt = pCSep;
      for (n=0; n < lpColLen.length; ++n)
        pTxt = pTxt + Pad(lpTxt1[i][n][v], lpColLen[n], pPad) + pCSep;
      if (bAdColL)
      {
        if (v == 0)
          pTxt = pCSep + Pad(String(i + nAdColNum), nNumLen, "L") + pTxt;
        else
          pTxt = pCSep + Replicate(" ", nNumLen) + pTxt;
      }
      if (bAdColR)
      {
        if (v == 0)
          pTxt = pTxt + Pad(String(i + nAdColNum), nNumLen, "L") + pCSep;
        else
          pTxt = pTxt + Replicate(" ", nNumLen) + pCSep;
      }

      lpTxt2.push(pTxt);
    }

    if (bRSep)
      lpTxt2.push(pRSepLine);

    SetWindowFontAndText(lpWnd[IDOK][WND], hGuiFont, i.toString());
    if (oSys.Call("User32::GetAsyncKeyState", 0x1B /*VK_ESCAPE*/) < 0)
    {
      if (AkelPad.MessageBox(hWndDlg, pTxtCountMes1 + i + pTxtCountMes2, pTxtCaption,
                             0x00000024 /*MB_ICONQUESTION|MB_YESNO*/) == 7 /*IDNO*/)
        return;
    }
  }

  if (nAction == 0)
    AkelPad.SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4101 /*wParam=MAKEWPARAM(0,IDM_FILE_NEW)*/, 1 /*lParam=TRUE*/);
  else if (nAction == 1)
    AkelPad.SetSel(nBegSel, nEndSel);
  else if (nAction == 2)
  {
    AkelPad.SetSel(nBegSel, nBegSel);
    lpTxt2.push("");
  }
  else if (nAction == 3)
  {
    AkelPad.SetSel(nEndSel, nEndSel);
    lpTxt2.unshift("");
  }

  AkelPad.ReplaceSel(lpTxt2.join("\r"), (nAction > 0));
  return;
}

// Function CSVToArray() by Ben Nadel:
// http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
//
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray(strData, strDelimiter)
{
  // Check to see if the delimiter is defined. If not, then default to comma.
  strDelimiter = (strDelimiter || ",");

  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
  (
  // Delimiters.
  "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
  // Quoted fields.
  "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
  // Standard fields.
  "([^\"\\" + strDelimiter + "\\r\\n]*))"
  ),"gi");

  // Create an array to hold our data. Give the array a default empty first row.
  var arrData = [[]];

  // Create an array to hold our individual pattern matching groups.
  var arrMatches = null;

  // Keep looping over the regular expression matches until we can no longer find a match.
  while (arrMatches = objPattern.exec(strData))
  {
    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[1];

    // Check to see if the given delimiter has a length (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know that this delimiter is a row delimiter.
    if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter))
    {
      // Since we have reached a new row of data, add an empty row to our data array.
      arrData.push([]);
    }

    // Now that we have our delimiter out of the way, let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2])
    {
      // We found a quoted value. When we capture this value, unescape any double quotes.
      var strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g" ), "\"");
    }
    else
    {
      // We found a non-quoted value.
      var strMatchedValue = arrMatches[3];
    }

    // Now that we have our value string, let's add it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);

    // Is no in oryginal function CSVToArray()
    SetWindowFontAndText(lpWnd[IDOK][WND], hGuiFont, arrData.length.toString());
    if (oSys.Call("User32::GetAsyncKeyState", 0x1B /*VK_ESCAPE*/) < 0)
    {
      if (AkelPad.MessageBox(hWndDlg, pTxtCountMes1 + arrData.length + pTxtCountMes2, pTxtCaption,
                             0x00000024 /*MB_ICONQUESTION|MB_YESNO*/) == 7 /*IDNO*/)
        return;
    }
  }

  // Return the parsed data.
  return(arrData);
}
