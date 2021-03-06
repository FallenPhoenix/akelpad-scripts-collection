// Sort in columns - 2011-03-07
//
// Call("Scripts::Main", 1, "SortInColumns.js")
//
// To effect was clearly visible, you should use a fixed-width font.
//
// Shortcut keys in dialog box:
// Enter - Sort
// Esc   - Close
// Shift+Alt+ Right, Left, Down, Up, End, Home, PgDn, PgUp - move dialog box.

var oSys = AkelPad.SystemFunction();

if (oSys.Call("kernel32::GetUserDefaultLangID") == 0x0415) //Polish
{
  var pTxtCaption   = "Sortowanie w kolumnach";
  var pTxtSortRange = "Zakres sortowania";
  var pTxtFrom      = "Od";
  var pTxtTo        = "Do";
  var pTxtColumns   = "&Kolumny:";
  var pTxtLines     = "&Wiersze:";
  var pTxtSortKeys  = "Klucze sortowania - kolumny";
  var pTxtKey       = "Klucz";
  var pTxtDesc      = "Malejąco";
  var pTxtIgCase    = "Ignoruj wlk. liter";
  var pTxtString    = "String";
  var pTxtLocale    = "Alfabetycznie";
  var pTxtNum       = "Numerycznie";
  var pTxtAllKeys   = "Wszystkie klucze";
  var pTxtDescAll   = "&Malejąco";
  var pTxtIgCaseAll = "&Ignoruj wlk. liter";
  var pTxtStringAll = "&String";
  var pTxtLocaleAll = "&Alfabetycznie";
  var pTxtNumAll    = "&Numerycznie";
  var pTxtReverse   = "&Odwróć tylko kolejność wierszy";
  var pTxtCopyToCB  = "Wynik kopiuj do schowka, nie zmieniaj &tekstu";
  var pTxtSort      = "Sortuj";
  var pTxtUndo      = "&Cofnij";
  var pTxtRedo      = "&Powtórz";
  var pTxtNoRangeC  = "Brak zakresu kolumn do sortowania.";
  var pTxtNoRangeL  = "Brak zakresu wierszy do sortowania.";
  var pTxtNoKey1    = "Brak zakresu kolumn w pierwszym kluczu.";
}
else
{
  var pTxtCaption   = "Sort in columns";
  var pTxtSortRange = "Sort range";
  var pTxtFrom      = "From";
  var pTxtTo        = "To";
  var pTxtColumns   = "&Columns:";
  var pTxtLines     = "&Lines:";
  var pTxtSortKeys  = "Sort keys - columns";
  var pTxtKey       = "Key";
  var pTxtDesc      = "Descending";
  var pTxtIgCase    = "Ignore case";
  var pTxtString    = "String";
  var pTxtLocale    = "Alphabetically";
  var pTxtNum       = "Numerically";
  var pTxtAllKeys   = "All keys";
  var pTxtDescAll   = "&Descending";
  var pTxtIgCaseAll = "&Ignore case";
  var pTxtStringAll = "&String";
  var pTxtLocaleAll = "&Alphabetically";
  var pTxtNumAll    = "&Numerically";
  var pTxtReverse   = "Reverse &order of lines only";
  var pTxtCopyToCB  = "Resul&t copy to clipboard, do not replace text";
  var pTxtSort      = "Sort";
  var pTxtUndo      = "&Undo";
  var pTxtRedo      = "&Redo";
  var pTxtNoRangeC  = "There is no range of columns to sort.";
  var pTxtNoRangeL  = "There is no range of lines to sort.";
  var pTxtNoKey1    = "There is no range of columns in first sort key.";
}

var DT_DWORD    = 3;
var BM_GETCHECK = 240;
var BM_SETCHECK = 241;

var hMainWnd     = AkelPad.GetMainWnd();
var hEditWnd     = AkelPad.GetEditWnd();
var hGuiFont     = oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
var pScriptName  = WScript.ScriptName;
var hInstanceDLL = AkelPad.GetInstanceDll();

var aDesc      = [0,0,0,0,0];
var aIgCase    = [1,1,1,1,1];
var aString    = [1,1,1,1,1];
var aLocale    = [0,0,0,0,0];
var aNum       = [0,0,0,0,0];
var bDescAll   = 0;
var bIgCaseAll = 1;
var nMethod    = 1;
var bReverse   = 0;
var bCopyToCB  = 0;
var nUndoLimit = 0;
var nRedoLimit = 0;
var nWordWrap;
var nLastLine;
var nLastCol;
var hWndDlg;
var lpBuffer;
var bGetSel;
var bIsReturn;
var hFocus;
var nWndPosX;
var nWndPosY;

ReadWriteIni(0);

var lpWnd       = [];
var IDSORTRANGE = 1000;
var IDFROM      = 1001;
var IDTO        = 1002;
var IDCOLUMNS   = 1003;
var IDBEGCOL    = 1004;
var IDENDCOL    = 1005;
var IDLINES     = 1006;
var IDBEGLINE   = 1007;
var IDENDLINE   = 1008;
var IDSORTK1    = 1009;
var IDSORTK2    = 1010;
var IDSORTK3    = 1011;
var IDSORTK4    = 1012;
var IDSORTK5    = 1013;
var IDSORTK6    = 1014;
var IDFROM1     = 1015;
var IDTO1       = 1016;
var IDALLKEYS   = 1017;
var IDKEY1      = 1018;
var IDBEGCOL1   = 1019;
var IDENDCOL1   = 1020;
var IDDESC1     = 1021;
var IDIGCASE1   = 1022;
var IDSTRING1   = 1023;
var IDLOCALE1   = 1024;
var IDNUM1      = 1025;
var IDKEY2      = 1026;
var IDBEGCOL2   = 1027;
var IDENDCOL2   = 1028;
var IDDESC2     = 1029;
var IDIGCASE2   = 1030;
var IDSTRING2   = 1031;
var IDLOCALE2   = 1032;
var IDNUM2      = 1033;
var IDKEY3      = 1034;
var IDBEGCOL3   = 1035;
var IDENDCOL3   = 1036;
var IDDESC3     = 1037;
var IDIGCASE3   = 1038;
var IDSTRING3   = 1039;
var IDLOCALE3   = 1040;
var IDNUM3      = 1041;
var IDKEY4      = 1042;
var IDBEGCOL4   = 1043;
var IDENDCOL4   = 1044;
var IDDESC4     = 1045;
var IDIGCASE4   = 1046;
var IDSTRING4   = 1047;
var IDLOCALE4   = 1048;
var IDNUM4      = 1049;
var IDKEY5      = 1050;
var IDBEGCOL5   = 1051;
var IDENDCOL5   = 1052;
var IDDESC5     = 1053;
var IDIGCASE5   = 1054;
var IDSTRING5   = 1055;
var IDLOCALE5   = 1056;
var IDNUM5      = 1057;
var IDDESCALL   = 1058;
var IDIGCASEALL = 1059;
var IDSTRINGALL = 1060;
var IDLOCALEALL = 1061;
var IDNUMALL    = 1062;
var IDREVERSE   = 1063;
var IDCOPYTOCB  = 1064;
var IDSORT      = 1065;
var IDUNDO      = 1066;
var IDREDO      = 1067;

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
//0x50010000 - WS_VISIBLE|WS_CHILD|WS_TABSTOP
//0x50010003 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
//0x50012080 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_AUTOHSCROLL|ES_NUMBER
//Windows              WNDTYPE, WND,WNDEXSTY,     WNDSTY,WNDX,WNDY,WNDW,WNDH, WNDTXT
lpWnd[IDSORTRANGE] = ["BUTTON",   0,       0, 0x50000007,  10,  10, 195,  85, pTxtSortRange];
lpWnd[IDFROM     ] = ["STATIC",   0,       0, 0x50000000,  80,  25,  55,  13, pTxtFrom];
lpWnd[IDTO       ] = ["STATIC",   0,       0, 0x50000000, 140,  25,  55,  13, pTxtTo];
lpWnd[IDCOLUMNS  ] = ["STATIC",   0,       0, 0x50000000,  20,  40,  60,  13, pTxtColumns];
lpWnd[IDBEGCOL   ] = ["EDIT",     0,   0x200, 0x50012080,  80,  40,  55,  20, ""];
lpWnd[IDENDCOL   ] = ["EDIT",     0,   0x200, 0x50012080, 140,  40,  55,  20, ""];
lpWnd[IDLINES    ] = ["STATIC",   0,       0, 0x50000000,  20,  65,  60,  13, pTxtLines];
lpWnd[IDBEGLINE  ] = ["EDIT",     0,   0x200, 0x50012080,  80,  65,  55,  20, ""];
lpWnd[IDENDLINE  ] = ["EDIT",     0,   0x200, 0x50012080, 140,  65,  55,  20, ""];
lpWnd[IDSORTK1   ] = ["BUTTON",   0,       0, 0x50000007,  10, 110, 290,  82, pTxtSortKeys];
lpWnd[IDSORTK2   ] = ["BUTTON",   0,       0, 0x50000007,  10, 185, 290,  82, ""];
lpWnd[IDSORTK3   ] = ["BUTTON",   0,       0, 0x50000007,  10, 260, 290,  82, ""];
lpWnd[IDSORTK4   ] = ["BUTTON",   0,       0, 0x50000007,  10, 335, 290,  82, ""];
lpWnd[IDSORTK5   ] = ["BUTTON",   0,       0, 0x50000007,  10, 410, 290,  82, ""];
lpWnd[IDSORTK6   ] = ["BUTTON",   0,       0, 0x50000007,  10, 485, 290,  82, ""];
lpWnd[IDFROM1    ] = ["STATIC",   0,       0, 0x50000000,  80, 125,  55,  13, pTxtFrom];
lpWnd[IDTO1      ] = ["STATIC",   0,       0, 0x50000000, 140, 125,  55,  13, pTxtTo];
lpWnd[IDALLKEYS  ] = ["STATIC",   0,       0, 0x50000000,  20, 515,  90,  13, pTxtAllKeys];
lpWnd[IDKEY1     ] = ["STATIC",   0,       0, 0x50000000,  20, 140,  60,  13, pTxtKey+" &1:"];
lpWnd[IDBEGCOL1  ] = ["EDIT",     0,   0x200, 0x50012080,  80, 140,  55,  20, ""];
lpWnd[IDENDCOL1  ] = ["EDIT",     0,   0x200, 0x50012080, 140, 140,  55,  20, ""];
lpWnd[IDDESC1    ] = ["BUTTON",   0,       0, 0x50010003, 205, 125,  90,  16, pTxtDesc];
lpWnd[IDIGCASE1  ] = ["BUTTON",   0,       0, 0x50010003, 205, 145,  90,  16, pTxtIgCase];
lpWnd[IDSTRING1  ] = ["BUTTON",   0,       0, 0x50010003,  50, 170,  60,  16, pTxtString];
lpWnd[IDLOCALE1  ] = ["BUTTON",   0,       0, 0x50010003, 110, 170,  90,  16, pTxtLocale];
lpWnd[IDNUM1     ] = ["BUTTON",   0,       0, 0x50010003, 205, 170,  90,  16, pTxtNum];
lpWnd[IDKEY2     ] = ["STATIC",   0,       0, 0x50000000,  20, 215,  60,  13, pTxtKey+" &2:"];
lpWnd[IDBEGCOL2  ] = ["EDIT",     0,   0x200, 0x50012080,  80, 215,  55,  20, ""];
lpWnd[IDENDCOL2  ] = ["EDIT",     0,   0x200, 0x50012080, 140, 215,  55,  20, ""];
lpWnd[IDDESC2    ] = ["BUTTON",   0,       0, 0x50010003, 205, 200,  90,  16, pTxtDesc];
lpWnd[IDIGCASE2  ] = ["BUTTON",   0,       0, 0x50010003, 205, 220,  90,  16, pTxtIgCase];
lpWnd[IDSTRING2  ] = ["BUTTON",   0,       0, 0x50010003,  50, 245,  60,  16, pTxtString];
lpWnd[IDLOCALE2  ] = ["BUTTON",   0,       0, 0x50010003, 110, 245,  90,  16, pTxtLocale];
lpWnd[IDNUM2     ] = ["BUTTON",   0,       0, 0x50010003, 205, 245,  90,  16, pTxtNum];
lpWnd[IDKEY3     ] = ["STATIC",   0,       0, 0x50000000,  20, 290,  60,  13, pTxtKey+" &3:"];
lpWnd[IDBEGCOL3  ] = ["EDIT",     0,   0x200, 0x50012080,  80, 290,  55,  20, ""];
lpWnd[IDENDCOL3  ] = ["EDIT",     0,   0x200, 0x50012080, 140, 290,  55,  20, ""];
lpWnd[IDDESC3    ] = ["BUTTON",   0,       0, 0x50010003, 205, 275,  90,  16, pTxtDesc];
lpWnd[IDIGCASE3  ] = ["BUTTON",   0,       0, 0x50010003, 205, 295,  90,  16, pTxtIgCase];
lpWnd[IDSTRING3  ] = ["BUTTON",   0,       0, 0x50010003,  50, 320,  60,  16, pTxtString];
lpWnd[IDLOCALE3  ] = ["BUTTON",   0,       0, 0x50010003, 110, 320,  90,  16, pTxtLocale];
lpWnd[IDNUM3     ] = ["BUTTON",   0,       0, 0x50010003, 205, 320,  90,  16, pTxtNum];
lpWnd[IDKEY4     ] = ["STATIC",   0,       0, 0x50000000,  20, 365,  60,  13, pTxtKey+" &4:"];
lpWnd[IDBEGCOL4  ] = ["EDIT",     0,   0x200, 0x50012080,  80, 365,  55,  20, ""];
lpWnd[IDENDCOL4  ] = ["EDIT",     0,   0x200, 0x50012080, 140, 365,  55,  20, ""];
lpWnd[IDDESC4    ] = ["BUTTON",   0,       0, 0x50010003, 205, 350,  90,  16, pTxtDesc];
lpWnd[IDIGCASE4  ] = ["BUTTON",   0,       0, 0x50010003, 205, 370,  90,  16, pTxtIgCase];
lpWnd[IDSTRING4  ] = ["BUTTON",   0,       0, 0x50010003,  50, 395,  60,  16, pTxtString];
lpWnd[IDLOCALE4  ] = ["BUTTON",   0,       0, 0x50010003, 110, 395,  90,  16, pTxtLocale];
lpWnd[IDNUM4     ] = ["BUTTON",   0,       0, 0x50010003, 205, 395,  90,  16, pTxtNum];
lpWnd[IDKEY5     ] = ["STATIC",   0,       0, 0x50000000,  20, 440,  60,  13, pTxtKey+" &5:"];
lpWnd[IDBEGCOL5  ] = ["EDIT",     0,   0x200, 0x50012080,  80, 440,  55,  20, ""];
lpWnd[IDENDCOL5  ] = ["EDIT",     0,   0x200, 0x50012080, 140, 440,  55,  20, ""];
lpWnd[IDDESC5    ] = ["BUTTON",   0,       0, 0x50010003, 205, 425,  90,  16, pTxtDesc];
lpWnd[IDIGCASE5  ] = ["BUTTON",   0,       0, 0x50010003, 205, 445,  90,  16, pTxtIgCase];
lpWnd[IDSTRING5  ] = ["BUTTON",   0,       0, 0x50010003,  50, 470,  60,  16, pTxtString];
lpWnd[IDLOCALE5  ] = ["BUTTON",   0,       0, 0x50010003, 110, 470,  90,  16, pTxtLocale];
lpWnd[IDNUM5     ] = ["BUTTON",   0,       0, 0x50010003, 205, 470,  90,  16, pTxtNum];
lpWnd[IDDESCALL  ] = ["BUTTON",   0,       0, 0x50010003, 205, 500,  90,  16, pTxtDescAll];
lpWnd[IDIGCASEALL] = ["BUTTON",   0,       0, 0x50010003, 205, 520,  90,  16, pTxtIgCaseAll];
lpWnd[IDSTRINGALL] = ["BUTTON",   0,       0, 0x50010003,  50, 545,  60,  16, pTxtStringAll];
lpWnd[IDLOCALEALL] = ["BUTTON",   0,       0, 0x50010003, 110, 545,  90,  16, pTxtLocaleAll];
lpWnd[IDNUMALL   ] = ["BUTTON",   0,       0, 0x50010003, 205, 545,  90,  16, pTxtNumAll];
lpWnd[IDREVERSE  ] = ["BUTTON",   0,       0, 0x50010003,  20, 575, 170,  16, pTxtReverse];
lpWnd[IDCOPYTOCB ] = ["BUTTON",   0,       0, 0x50010003,  20, 595, 270,  16, pTxtCopyToCB];
lpWnd[IDSORT     ] = ["BUTTON",   0,       0, 0x50010000, 220,  15,  80,  23, pTxtSort];
lpWnd[IDUNDO     ] = ["BUTTON",   0,       0, 0x50010000, 220,  47,  80,  23, pTxtUndo];
lpWnd[IDREDO     ] = ["BUTTON",   0,       0, 0x50010000, 220,  72,  80,  23, pTxtRedo];


if (hEditWnd)
{
  nWordWrap = AkelPad.SendMessage(hEditWnd, 3241 /*AEM_GETWORDWRAP*/, 0, 0);
  if (nWordWrap > 0) AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/);

  if (! AkelPad.SendMessage(hEditWnd, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0))
    AkelPad.SendMessage(hEditWnd, 3128 /*AEM_UPDATESEL*/, 1 /*AESELT_COLUMNON*/, 0);

  nLastLine = AkelPad.SendMessage(hEditWnd, 3129 /*AEM_GETLINENUMBER*/, 0 /*AEGL_LINECOUNT*/, 0);
  nLastCol  = LineMaxLength() + 1;

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
                          315,             //nWidth
                          650,             //nHeight
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

  if (nWordWrap > 0) AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/);
}

//////////////
function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  var i, nLowParam;

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

    //Check
    CheckButtonsAll(0);
    CheckUndoRedo();

    bGetSel = GetSelection();

    //Set window position
    if ((nWndPosX == undefined) || (nWndPosY == undefined))
      MoveWindow(hMainWnd, hWnd, "RT");
    else
      MoveWindow(hMainWnd, hWnd, [nWndPosX, nWndPosY]);
  }

  else if (uMsg == 7) //WM_SETFOCUS
  {
    oSys.Call("user32::SetFocus", lpWnd[IDBEGCOL][WND]);
    AkelPad.SendMessage(lpWnd[IDBEGCOL][WND], 177 /*EM_SETSEL*/, 0, -1);
  }

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (wParam == 9) //VK_TAB
      SetSelection();
    else if (wParam == 27) //VK_ESCAPE
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
    else if (wParam == 13) //VK_RETURN
    {
      if (! bIsReturn)
      {
        hFocus = oSys.Call("user32::GetFocus");
        if ((hFocus != lpWnd[IDSORT][WND]) && (hFocus != lpWnd[IDUNDO][WND]) && (hFocus != lpWnd[IDREDO][WND]))
          oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDSORT, 0);
      }
    }
  }

  else if (uMsg == 257) //WM_KEYUP
    bIsReturn = 0;

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

  else if (uMsg == 273) //WM_COMMAND
  {
    nLowParam = LoWord(wParam);

    if ((nLowParam == IDBEGCOL)  || (nLowParam == IDENDCOL)  ||
        (nLowParam == IDBEGLINE) || (nLowParam == IDENDLINE) ||
        (nLowParam == IDBEGCOL1) || (nLowParam == IDENDCOL1) ||
        (nLowParam == IDBEGCOL2) || (nLowParam == IDENDCOL2) ||
        (nLowParam == IDBEGCOL3) || (nLowParam == IDENDCOL3) ||
        (nLowParam == IDBEGCOL4) || (nLowParam == IDENDCOL4) ||
        (nLowParam == IDBEGCOL5) || (nLowParam == IDENDCOL5))
    {
      CheckEditValue(nLowParam);
      if (bGetSel)
        SetSelection();
    }

    else if (((nLowParam >= IDDESC1) && (nLowParam <= IDNUM1)) ||
             ((nLowParam >= IDDESC2) && (nLowParam <= IDNUM2)) ||
             ((nLowParam >= IDDESC3) && (nLowParam <= IDNUM3)) ||
             ((nLowParam >= IDDESC4) && (nLowParam <= IDNUM4)) ||
             ((nLowParam >= IDDESC5) && (nLowParam <= IDNUM5)))
    {
      CheckButtons1(nLowParam);
      SetSelection();
    }

    else if ((nLowParam >= IDDESCALL) && (nLowParam <= IDCOPYTOCB))
    {
      CheckButtonsAll(nLowParam);
      SetSelection();
    }

    else if (nLowParam == IDSORT)
    {
      oSys.Call("user32::SetFocus", lpWnd[IDBEGCOL][WND]);
      SetSelection();
      if (SortColumns())
      {
        SetSelection();
        CheckUndoRedo(nLowParam);
      }
    }

    else if (nLowParam == IDUNDO)
    {
      bIsReturn = 1;
      CheckUndoRedo(nLowParam);
      oSys.Call("user32::SetFocus", lpWnd[IDBEGCOL][WND]);
    }

    else if (nLowParam == IDREDO)
    {
      bIsReturn = 1;
      CheckUndoRedo(nLowParam);
      oSys.Call("user32::SetFocus", lpWnd[IDBEGCOL][WND]);
    }
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    ReadWriteIni(1);

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
    SetDefID(hWnd);

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

function SetDefID(hWnd)
{
  var nID    = 1000;
  var hFocus = oSys.Call("user32::GetFocus");

  while ((nID < lpWnd.length) && (hFocus != lpWnd[nID][WND]))
    ++nID;

  if ((nID != IDUNDO) && (nID != IDREDO))
    nID = IDSORT;

  oSys.Call("user32::DefDlgProc" + _TCHAR, hWnd, 1025 /*DM_SETDEFID*/, nID, 0);
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

    pTxt = 'nWndPosX='   + rcWnd.left + ';\r\n' +
           'nWndPosY='   + rcWnd.top  + ';\r\n' +
           'aDesc=['     + aDesc + '];\r\n' +
           'aIgCase=['   + aIgCase + '];\r\n' +
           'aString=['   + aString + '];\r\n' +
           'aLocale=['   + aLocale + '];\r\n' +
           'aNum=['      + aNum + '];\r\n' +
           'bDescAll='   + bDescAll + ';\r\n' +
           'bIgCaseAll=' + bIgCaseAll + ';\r\n' +
           'nMethod='    + nMethod + ';\r\n' +
           'bReverse='   + bReverse + ';\r\n' +
           'bCopyToCB='  + bCopyToCB + ';'

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

function CheckButtonsAll(nButton)
{
  var nDif = IDDESC2 - IDDESC1;
  var i;

  if (nButton == IDDESCALL)
  {
    bDescAll = AkelPad.SendMessage(lpWnd[IDDESCALL][WND], BM_GETCHECK, 0, 0);
    aDesc    = [bDescAll, bDescAll, bDescAll, bDescAll, bDescAll];
  }
  else if (nButton == IDIGCASEALL)
  {
    bIgCaseAll = AkelPad.SendMessage(lpWnd[IDIGCASEALL][WND], BM_GETCHECK, 0, 0);
    aIgCase    = [bIgCaseAll, bIgCaseAll, bIgCaseAll, bIgCaseAll, bIgCaseAll];
  }
  else if ((nButton == IDSTRINGALL) || (nButton == IDLOCALEALL) || (nButton == IDNUMALL))
  {
    if (nMethod == nButton - IDSTRINGALL + 1)
      nMethod = 0;
    else
    {
      nMethod = nButton - IDSTRINGALL + 1;
      aString = [0,0,0,0,0];
      aLocale = [0,0,0,0,0];
      aNum    = [0,0,0,0,0];
      if (nMethod == 1)
        aString = [1,1,1,1,1];
      else if (nMethod == 2)
        aLocale = [1,1,1,1,1];
      else if (nMethod == 3)
        aNum = [1,1,1,1,1];
    }
  }
  else if (nButton == IDREVERSE)
    bReverse = AkelPad.SendMessage(lpWnd[IDREVERSE][WND],  BM_GETCHECK, 0, 0);
  else if (nButton == IDCOPYTOCB)
    bCopyToCB  = AkelPad.SendMessage(lpWnd[IDCOPYTOCB][WND],  BM_GETCHECK, 0, 0);

  AkelPad.SendMessage(lpWnd[IDDESCALL][WND],   BM_SETCHECK, bDescAll,       0);
  AkelPad.SendMessage(lpWnd[IDIGCASEALL][WND], BM_SETCHECK, bIgCaseAll,     0);
  AkelPad.SendMessage(lpWnd[IDSTRINGALL][WND], BM_SETCHECK, (nMethod == 1), 0);
  AkelPad.SendMessage(lpWnd[IDLOCALEALL][WND], BM_SETCHECK, (nMethod == 2), 0);
  AkelPad.SendMessage(lpWnd[IDNUMALL][WND],    BM_SETCHECK, (nMethod == 3), 0);
  AkelPad.SendMessage(lpWnd[IDREVERSE][WND],   BM_SETCHECK, bReverse,       0);
  AkelPad.SendMessage(lpWnd[IDCOPYTOCB][WND],  BM_SETCHECK, bCopyToCB,      0);

  for (i = 0; i < 5; ++i)
  {
    AkelPad.SendMessage(lpWnd[IDDESC1   + i * nDif][WND], BM_SETCHECK, aDesc[i],   0);
    AkelPad.SendMessage(lpWnd[IDIGCASE1 + i * nDif][WND], BM_SETCHECK, aIgCase[i], 0);
    AkelPad.SendMessage(lpWnd[IDSTRING1 + i * nDif][WND], BM_SETCHECK, aString[i], 0);
    AkelPad.SendMessage(lpWnd[IDLOCALE1 + i * nDif][WND], BM_SETCHECK, aLocale[i], 0);
    AkelPad.SendMessage(lpWnd[IDNUM1    + i * nDif][WND], BM_SETCHECK, aNum[i],    0);
  }

  for (i = IDSORTK1; i <= IDNUMALL; ++i)
    oSys.Call("user32::EnableWindow", lpWnd[i][WND], ! bReverse);
}

function CheckButtons1(nButton)
{
  var nDif = IDDESC2 - IDDESC1;
  var nKey;
  var i;

  if (((nButton - IDDESC1) % nDif) == 0)
  {
    aDesc[(nButton - IDDESC1) / nDif] = AkelPad.SendMessage(lpWnd[nButton][WND], BM_GETCHECK, 0, 0);
    if (aDesc[0] && aDesc[1] && aDesc[2] && aDesc[3] && aDesc[4])
      bDescAll = 1;
    else
      bDescAll = 0;
    AkelPad.SendMessage(lpWnd[IDDESCALL][WND], BM_SETCHECK, bDescAll, 0);
  }
  else if (((nButton - IDIGCASE1) % nDif) == 0)
  {
    aIgCase[(nButton - IDIGCASE1) / nDif] = AkelPad.SendMessage(lpWnd[nButton][WND], BM_GETCHECK, 0, 0);
    if (aIgCase[0] && aIgCase[1] && aIgCase[2] && aIgCase[3] && aIgCase[4])
      bIgCaseAll = 1;
    else
      bIgCaseAll = 0;
    AkelPad.SendMessage(lpWnd[IDIGCASEALL][WND], BM_SETCHECK, bIgCaseAll, 0);
  }
  else
  {
    nKey = Math.floor((nButton - IDDESC1) / nDif);
    aString[nKey] = 0;
    aLocale[nKey] = 0;
    aNum[nKey]    = 0;

    if (((nButton - IDSTRING1) % nDif) == 0)
      aString[nKey] = 1;
    else if (((nButton - IDLOCALE1) % nDif) == 0)
      aLocale[nKey] = 1;
    else if (((nButton - IDNUM1) % nDif) == 0)
      aNum[nKey] = 1;

    AkelPad.SendMessage(lpWnd[IDSTRING1 + nKey * nDif][WND], BM_SETCHECK, aString[nKey], 0);
    AkelPad.SendMessage(lpWnd[IDLOCALE1 + nKey * nDif][WND], BM_SETCHECK, aLocale[nKey], 0);
    AkelPad.SendMessage(lpWnd[IDNUM1    + nKey * nDif][WND], BM_SETCHECK, aNum[nKey],    0);

    if (aString[0] && aString[1] && aString[2] && aString[3] && aString[4])
      nMethod = 1;
    else if (aLocale[0] && aLocale[1] && aLocale[2] && aLocale[3] && aLocale[4])
      nMethod = 2;
    else if (aNum[0] && aNum[1] && aNum[2] && aNum[3] && aNum[4])
      nMethod = 3;
    else
      nMethod = 0;

    AkelPad.SendMessage(lpWnd[IDSTRINGALL][WND], BM_SETCHECK, (nMethod == 1), 0);
    AkelPad.SendMessage(lpWnd[IDLOCALEALL][WND], BM_SETCHECK, (nMethod == 2), 0);
    AkelPad.SendMessage(lpWnd[IDNUMALL][WND],    BM_SETCHECK, (nMethod == 3), 0);
  }
}

function CheckUndoRedo(nButton)
{
  var pTxtUndo = lpWnd[IDUNDO][WNDTXT];
  var pTxtRedo = lpWnd[IDREDO][WNDTXT];

  if (nButton == IDSORT)
  {
    if (nUndoLimit < AkelPad.SendMessage(hEditWnd, 3084 /*AEM_GETUNDOLIMIT*/, 0, 0))
      ++nUndoLimit;
    nRedoLimit = 0;
  }
  else if ((nButton == IDUNDO) && (nUndoLimit))
  {
    --nUndoLimit;
    ++nRedoLimit;
    AkelPad.SendMessage(hEditWnd, 3077 /*AEM_UNDO*/, 0, 0);
  }
  else if ((nButton == IDREDO) && (nRedoLimit))
  {
    ++nUndoLimit;
    --nRedoLimit;
    AkelPad.SendMessage(hEditWnd, 3078 /*AEM_REDO*/, 0, 0);
  }

  if (nUndoLimit)
    pTxtUndo += " (" + nUndoLimit + ")";
  if (nRedoLimit)
    pTxtRedo += " (" + nRedoLimit + ")";

  SetWindowFontAndText(lpWnd[IDUNDO][WND], hGuiFont, pTxtUndo);
  SetWindowFontAndText(lpWnd[IDREDO][WND], hGuiFont, pTxtRedo);

  oSys.Call("user32::EnableWindow", lpWnd[IDUNDO][WND], nUndoLimit);
  oSys.Call("user32::EnableWindow", lpWnd[IDREDO][WND], nRedoLimit);
}

function CheckEditValue(nIdWnd)
{
  var pEditValue;

  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[nIdWnd][WND], lpBuffer, 256);
  pEditValue = AkelPad.MemRead(lpBuffer, _TSTR);

  if ((nIdWnd == IDBEGLINE) || (nIdWnd == IDENDLINE))
  {
    if (pEditValue == 0)
    {
      SetWindowFontAndText(lpWnd[nIdWnd][WND], hGuiFont, "1");
      AkelPad.SendMessage(lpWnd[nIdWnd][WND], 177 /*EM_SETSEL*/, 0, -1);
    }
    else if (pEditValue > nLastLine)
    {
      SetWindowFontAndText(lpWnd[nIdWnd][WND], hGuiFont, String(nLastLine));
      AkelPad.SendMessage(lpWnd[nIdWnd][WND], 177 /*EM_SETSEL*/, 0, -1);
    }
  }

  else if ((nIdWnd == IDBEGCOL)  || (nIdWnd == IDENDCOL) ||
           (nIdWnd == IDBEGCOL1) || (nIdWnd == IDENDCOL1))
  {
    if (pEditValue == 0)
    {
      SetWindowFontAndText(lpWnd[nIdWnd][WND], hGuiFont, "1");
      AkelPad.SendMessage(lpWnd[nIdWnd][WND], 177 /*EM_SETSEL*/, 0, -1);
    }
    else if (pEditValue > nLastCol)
    {
      SetWindowFontAndText(lpWnd[nIdWnd][WND], hGuiFont, String(nLastCol));
      AkelPad.SendMessage(lpWnd[nIdWnd][WND], 177 /*EM_SETSEL*/, 0, -1);
    }
  }

  else if ((nIdWnd == IDBEGCOL2) || (nIdWnd == IDENDCOL2) ||
           (nIdWnd == IDBEGCOL3) || (nIdWnd == IDENDCOL3) ||
           (nIdWnd == IDBEGCOL4) || (nIdWnd == IDENDCOL4) ||
           (nIdWnd == IDBEGCOL5) || (nIdWnd == IDENDCOL5))
  {
    if (pEditValue == "0")
    {
      SetWindowFontAndText(lpWnd[nIdWnd][WND], hGuiFont, "");
      AkelPad.SendMessage(lpWnd[nIdWnd][WND], 177 /*EM_SETSEL*/, 0, -1);
    }
    else if (pEditValue > nLastCol)
    {
      SetWindowFontAndText(lpWnd[nIdWnd][WND], hGuiFont, String(nLastCol));
      AkelPad.SendMessage(lpWnd[nIdWnd][WND], 177 /*EM_SETSEL*/, 0, -1);
    }
  }
}

function GetSelection()
{
  var lpBegSel = AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/);
  var lpEndSel = AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/);
  var nLine1, nLine2, nCol1, nCol2;

  AkelPad.SendMessage(hEditWnd, 3123 /*AEM_EXGETSEL*/, lpBegSel, lpEndSel);

  nLine1 = AkelPad.MemRead(lpBegSel, DT_DWORD) + 1;
  nLine2 = AkelPad.MemRead(lpEndSel, DT_DWORD) + 1;

  if (AkelPad.MemRead(lpBegSel + 8, DT_DWORD) < AkelPad.MemRead(lpEndSel + 8, DT_DWORD))
  {
    nCol1 = AkelPad.MemRead(lpBegSel + 8, DT_DWORD) + 1;
    nCol2 = AkelPad.MemRead(lpEndSel + 8, DT_DWORD) + 1;
  }
  else
  {
    nCol1 = AkelPad.MemRead(lpEndSel + 8, DT_DWORD) + 1;
    nCol2 = AkelPad.MemRead(lpBegSel + 8, DT_DWORD) + 1;
  }

  SetWindowFontAndText(lpWnd[IDBEGLINE][WND], hGuiFont, String(nLine1));
  SetWindowFontAndText(lpWnd[IDENDLINE][WND], hGuiFont, String(nLine2));
  SetWindowFontAndText(lpWnd[IDBEGCOL][WND],  hGuiFont, String(nCol1));
  SetWindowFontAndText(lpWnd[IDENDCOL][WND],  hGuiFont, String(nCol2));
  SetWindowFontAndText(lpWnd[IDBEGCOL1][WND], hGuiFont, String(nCol1));
  SetWindowFontAndText(lpWnd[IDENDCOL1][WND], hGuiFont, String(nCol2));

  AkelPad.MemFree(lpBegSel);
  AkelPad.MemFree(lpEndSel);
  return 1;
}

function SetSelection()
{
  var hWndFocus = oSys.Call("user32::GetFocus");
  var lpSelect  = AkelPad.MemAlloc(28 /*sizeof(AESELECTION)*/);
  var lpBegSel  = lpSelect;
  var lpEndSel  = lpSelect + 12;
  var lpSelFlag = lpSelect + 24;
  var nLine1, nLine2, nCol1, nCol2, i;

  for (i = 1000; i < lpWnd.length; ++i)
  {
    if (lpWnd[i][WND] == hWndFocus)
      break;
  }

  if ((i >= IDBEGCOL1) && (i <= IDNUM1))
    i = IDBEGCOL1;
  else if ((i >= IDBEGCOL2) && (i <= IDNUM2))
    i = IDBEGCOL2;
  else if ((i >= IDBEGCOL3) && (i <= IDNUM3))
    i = IDBEGCOL3;
  else if ((i >= IDBEGCOL4) && (i <= IDNUM4))
    i = IDBEGCOL4;
  else if ((i >= IDBEGCOL5) && (i <= IDNUM5))
    i = IDBEGCOL5;
  else
    i = IDBEGCOL;

  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDBEGLINE][WND], lpBuffer, 256);
  nLine1 = Number(AkelPad.MemRead(lpBuffer, _TSTR)) - 1;
  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDENDLINE][WND], lpBuffer, 256);
  nLine2 = Number(AkelPad.MemRead(lpBuffer, _TSTR)) - 1;
  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[i][WND], lpBuffer, 256);
  nCol1 = Number(AkelPad.MemRead(lpBuffer, _TSTR)) - 1;
  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[i + 1][WND], lpBuffer, 256);
  nCol2 = Number(AkelPad.MemRead(lpBuffer, _TSTR)) - 1;

  if ((nCol1 < 0) || (nCol2 < 0))
    nCol1 = nCol2 = 0;

  AkelPad.MemCopy(lpBegSel,     nLine1, DT_DWORD);
  AkelPad.MemCopy(lpBegSel + 8, nCol1,  DT_DWORD);
  AkelPad.MemCopy(lpEndSel,     nLine2, DT_DWORD);
  AkelPad.MemCopy(lpEndSel + 8, nCol2,  DT_DWORD);
  AkelPad.MemCopy(lpSelFlag,    1,      DT_DWORD);

  AkelPad.SendMessage(hEditWnd, 3132 /*AEM_INDEXUPDATE*/, 0, lpBegSel);
  AkelPad.SendMessage(hEditWnd, 3132 /*AEM_INDEXUPDATE*/, 0, lpEndSel);

  AkelPad.SendMessage(hEditWnd, 3126 /*AEM_SETSEL*/, 0, lpSelect);

  AkelPad.MemFree(lpSelect);
}

function LineMaxLength()
{
  var nMaxLenL = 0;
  var nBegLine;
  var nLenLine;
  var i;

  for (i = 0; i < nLastLine; ++i)
  {
    nBegLine = AkelPad.SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/, i, 0);
    nLenLine = AkelPad.SendMessage(hEditWnd, 193 /*EM_LINELENGTH*/, nBegLine, 0);
    if (nLenLine > nMaxLenL)
      nMaxLenL = nLenLine;
  }

  return nMaxLenL;
}

////////
function SortColumns()
{
  var aDesc   = new Array(5);
  var aIgCase = new Array(5);
  var aString = new Array(5);
  var aLocale = new Array(5);
  var aNum    = new Array(5);
  var aCol    = [[], [], [], [], [], []];
  var aTxt    = [];
  var pText   = "";
  var nDif    = IDBEGCOL2 - IDBEGCOL1;
  var nLine1;
  var nLine2;
  var i;

  for (i = 0; i < 5; ++i)
  {
    aDesc[i]   = AkelPad.SendMessage(lpWnd[IDDESC1   + i * nDif][WND], BM_GETCHECK, 0, 0);
    aIgCase[i] = AkelPad.SendMessage(lpWnd[IDIGCASE1 + i * nDif][WND], BM_GETCHECK, 0, 0);
    aString[i] = AkelPad.SendMessage(lpWnd[IDSTRING1 + i * nDif][WND], BM_GETCHECK, 0, 0);
    aLocale[i] = AkelPad.SendMessage(lpWnd[IDLOCALE1 + i * nDif][WND], BM_GETCHECK, 0, 0);
    aNum[i]    = AkelPad.SendMessage(lpWnd[IDNUM1    + i * nDif][WND], BM_GETCHECK, 0, 0);
  }

  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDBEGCOL][WND], lpBuffer, 256);
  aCol[0][0] = Number(AkelPad.MemRead(lpBuffer, _TSTR));
  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDENDCOL][WND], lpBuffer, 256);
  aCol[0][1] = Number(AkelPad.MemRead(lpBuffer, _TSTR));
  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDBEGLINE][WND], lpBuffer, 256);
  nLine1 = Number(AkelPad.MemRead(lpBuffer, _TSTR));
  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDENDLINE][WND], lpBuffer, 256);
  nLine2 = Number(AkelPad.MemRead(lpBuffer, _TSTR));
  for (i = 1; i < 6; ++i)
  {
    oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDBEGCOL1 + (i - 1) * nDif][WND], lpBuffer, 256);
    aCol[i][0] = Number(AkelPad.MemRead(lpBuffer, _TSTR));
    oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDENDCOL1 + (i - 1) * nDif][WND], lpBuffer, 256);
    aCol[i][1] = Number(AkelPad.MemRead(lpBuffer, _TSTR));
    if ((aCol[i][0] == 0) || (aCol[i][1] == 0) || (aCol[i][0] == aCol[i][1]))
    {
      aCol[i][0] = aCol[i][1] = 0;
      SetWindowFontAndText(lpWnd[IDBEGCOL1 + (i - 1) * nDif][WND], hGuiFont, String(aCol[i][0]));
      SetWindowFontAndText(lpWnd[IDENDCOL1 + (i - 1) * nDif][WND], hGuiFont, String(aCol[i][1]));
    }
  }

  if (aCol[0][0] == aCol[0][1])
  {
    AkelPad.MessageBox(hWndDlg, pTxtNoRangeC, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
    oSys.Call("user32::SetFocus", lpWnd[IDENDCOL][WND]);
    AkelPad.SendMessage(lpWnd[IDENDCOL][WND], 177 /*EM_SETSEL*/, 0, -1);
    return 0;
  }

  if (nLine1 == nLine2)
  {
    AkelPad.MessageBox(hWndDlg, pTxtNoRangeL, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
    oSys.Call("user32::SetFocus", lpWnd[IDENDLINE][WND]);
    AkelPad.SendMessage(lpWnd[IDENDLINE][WND], 177 /*EM_SETSEL*/, 0, -1);
    return 0;
  }

  if ((aCol[1][0] == aCol[1][1]) && (! bReverse))
  {
    AkelPad.MessageBox(hWndDlg, pTxtNoKey1, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
    oSys.Call("user32::SetFocus", lpWnd[IDENDCOL1][WND]);
    AkelPad.SendMessage(lpWnd[IDENDCOL1][WND], 177 /*EM_SETSEL*/, 0, -1);
    return 0;
  }

  for (i = 5; i >= 0; --i)
  {
    if (aCol[i][0] == 0)
    {
      aCol.splice(i, 1);
      aDesc.splice(i - 1, 1);
      aIgCase.splice(i - 1, 1);
      aString.splice(i - 1, 1);
      aLocale.splice(i - 1, 1);
      aNum.splice(i - 1, 1);
    }
    else
    {
      --aCol[i][0];
      --aCol[i][1];
    }
  }
  --nLine1;
  --nLine2;

  if (bReverse)
  {
    aTxt  = GetTextRangeColumn([nLine1, aCol[0][0]], [nLine2, aCol[0][1]]);
    pText = aTxt.reverse().join("\r");
  }
  else
  {
    aTxt.length = aCol.length;
    for (i = 0; i < aTxt.length; ++i)
      aTxt[i] = GetTextRangeColumn([nLine1, aCol[i][0]], [nLine2, aCol[i][1]]);

    aTxt = ArrayTransp(aTxt);

    ArraySort(aTxt, aDesc, aIgCase, aString, aLocale, aNum);

    for (i = 0; i < aTxt.length; ++i)
    {
      pText += aTxt[i][0] + "\r";
    }
    pText = pText.slice(0, -1);
  }

  AkelPad.SendMessage(lpWnd[IDBEGCOL][WND], 177 /*EM_SETSEL*/, 0, -1);

  if (bCopyToCB)
  {
    AkelPad.SetClipboardText(pText);
    return 0;
  }
  else
  {
    AkelPad.ReplaceSel(pText);
    return 1;
  }
}

////////
function GetTextRangeColumn(aBeg, aEnd, bReturnText, nNewLine, bFillSpaces)
{
  var nBegLine1;
  var nBegLine2;
  var nLenLine2;
  var nLine1;
  var nLine2;
  var nCol1;
  var nCol2;
  var aLines;
  var nWidth;
  var i;

  if (aBeg[0] < aEnd[0])
  {
    nLine1 = aBeg[0];
    nLine2 = aEnd[0];
  }
  else
  {
    nLine1 = aEnd[0];
    nLine2 = aBeg[0];
  }

  if (aBeg[1] < aEnd[1])
  {
    nCol1 = aBeg[1];
    nCol2 = aEnd[1];
  }
  else
  {
    nCol1 = aEnd[1];
    nCol2 = aBeg[1];
  }

	nBegLine1 = AkelPad.SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/, nLine1, 0);
	nBegLine2 = AkelPad.SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/, nLine2, 0);
	nLenLine2 = AkelPad.SendMessage(hEditWnd, 193 /*EM_LINELENGTH*/, nBegLine2, 0);
  aLines    = AkelPad.GetTextRange(nBegLine1, nBegLine2 + nLenLine2, 1 /*"\r"*/).split("\r");
  nWidth    = nCol2 - nCol1;

  for (i = 0; i < aLines.length; ++i)
  {
    aLines[i] = aLines[i].substring(nCol1, nCol2);
    if (bFillSpaces)
      while (aLines[i].length < nWidth)
        aLines[i] += " ";
  }

  if (bReturnText)
  {
    if ((! nNewLine) || (nNewLine == 1))
      pNewLine = "\r";
    else if (nNewLine == 2)
      pNewLine = "\n";
    else
      pNewLine = "\r\n";

    return aLines.join(pNewLine);
  }
  else
    return aLines;
}

////////
function ArrayTransp(aArr)
{
  var nLen1 = aArr.length;
  var nLen2 = aArr[0].length;
  var aArr2 = [];
  var i, n;

  aArr2.length = nLen2;

  for (n = 0; n < nLen2; ++n)
  {
    aArr2[n] = [];
    for (i = 0; i < nLen1; ++i)
    {
      aArr2[n].push(aArr[i][n]);
    }
  }
  return aArr2;
}

////////
function ArraySort(aTxt, aDesc, aIgCase, aString, aLocale, aNum)
{
  var lpStrA = AkelPad.MemAlloc(nLastCol * _TSIZE);
  var lpStrB = AkelPad.MemAlloc(nLastCol * _TSIZE);
  var nComp;
  var i;

  aTxt.sort(function(a, b) {
    for (i = 0; i < aDesc.length; ++i)
    {
      nComp = CompareValue(a[i + 1], b[i + 1], lpStrA, lpStrB, aDesc[i], aIgCase[i], aString[i], aLocale[i], aNum[i]);
      if (nComp != 0)
        return nComp;
    }
    return 0; });

  AkelPad.MemFree(lpStrA);
  AkelPad.MemFree(lpStrB);
}

////////
function CompareValue(ValA, ValB, lpStrA, lpStrB, bDesc, bIgCase, bString, bLocale, bNum)
{
  var nResult;

  if (bString)
  {
    if (bIgCase)
    {
      ValA = ValA.toUpperCase();
      ValB = ValB.toUpperCase();
    }
    if (ValA > ValB)
      nResult = bDesc ? -1 : 1;
    else if (ValA < ValB)
      nResult = bDesc ? 1 : -1;
    else
      nResult = 0;
  }
  else if (bLocale)
  {
    AkelPad.MemCopy(lpStrA, ValA, _TSTR);
    AkelPad.MemCopy(lpStrB, ValB, _TSTR);
    nResult = oSys.Call("kernel32::lstrcmp" + (bIgCase ? "i" : "") + _TCHAR, lpStrA, lpStrB);
    if (bDesc)
      nResult = -nResult;
  }
  else
  {
    var oRegExp = /(-?\d+\.?\d*)|(-?\.\d+)/;

    ValA    = oRegExp.exec(ValA);
    ValB    = oRegExp.exec(ValB);
    ValA    = ValA ? parseFloat(ValA[0]) : 0;
    ValB    = ValB ? parseFloat(ValB[0]) : 0;
    nResult = bDesc ? (ValB - ValA) : (ValA - ValB);
  }

  return nResult;
}
