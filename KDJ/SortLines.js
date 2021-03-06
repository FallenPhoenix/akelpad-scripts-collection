// Sort lines - 2011-03-07
//
// Call("Scripts::Main", 1, "SortLines.js")
//
// Shortcut keys in dialog box:
// Enter - Sort
// Esc   - Close
// Shift+Alt+ Right, Left, Down, Up, End, Home, PgDn, PgUp - move dialog box.

var oSys = AkelPad.SystemFunction();

if (oSys.Call("kernel32::GetUserDefaultLangID") == 0x0415) //Polish
{
  var pTxtCaption   = "Sortowanie wierszy";
  var pTxtRange     = "Zakres";
  var pTxtFrom      = "Od";
  var pTxtTo        = "Do";
  var pTxtLines     = "Wiersze:";
  var pTxtColumns   = "&Kolumny:";
  var pTxtKeys      = "Klucze sortowania";
  var pTxtKey1      = "Klucz &1 - Długość wiersza";
  var pTxtKey2      = "Klucz &2 - Zawartość wiersza";
  var pTxtEntLine   = "Cały &wiersz";
  var pTxtDesc      = "&Malejąco";
  var pTxtIgCase    = "&Ignoruj wlk. liter";
  var pTxtString    = "&String";
  var pTxtLocale    = "&Alfabetycznie";
  var pTxtNum       = "&Numerycznie";
  var pTxtSortAnd   = "Sortuj, a następnie";
  var pTxtRemoDuKey = "&Usuń wiersze z duplikatami kluczy";
  var pTxtExtrDuKey = "&Zachowaj tylko wiersze z duplikatami kluczy";
  var pTxtExtrUnKey = "Zac&howaj tylko wiersze z unikalnymi kluczami";
  var pTxtNoSort    = "Nie sortuj, ale";
  var pTxtReverse   = "&Odwróć kolejność wierszy";
  var pTxtCopyToCB  = "Wynik kopiuj do schowka, nie zmieniaj &tekstu";
  var pTxtUsePlug   = "Użyj wtyczki &Format";
  var pTxtSort      = "Sortuj";
  var pTxtUndo      = "&Cofnij"; 
  var pTxtRedo      = "&Powtórz";
  var pTxtNoRangeL  = "Brak zakresu wierszy.";
  var pTxtNoKey2    = "Brak zakresu kolumn w drugim kluczu sortowania.";
}
else
{
  var pTxtCaption   = "Sort lines";
  var pTxtRange     = "Range";
  var pTxtFrom      = "From";
  var pTxtTo        = "To";
  var pTxtLines     = "Lines:";
  var pTxtColumns   = "&Columns:";
  var pTxtKeys      = "Keys";
  var pTxtKey1      = "Key &1 - Line length";
  var pTxtKey2      = "Key &2 - Line content";
  var pTxtEntLine   = "&Entire line";
  var pTxtDesc      = "&Descending";
  var pTxtIgCase    = "&Ignore case";
  var pTxtString    = "&String";
  var pTxtLocale    = "&Alphabetically";
  var pTxtNum       = "&Numerically";
  var pTxtSortAnd   = "Sort, and also";
  var pTxtRemoDuKey = "Re&move lines with duplicate keys";
  var pTxtExtrDuKey = "E&xtract lines with duplicate keys";
  var pTxtExtrUnKey = "Extra&ct lines with unique keys";
  var pTxtNoSort    = "No sort, but";
  var pTxtReverse   = "Reverse &order of lines";
  var pTxtCopyToCB  = "Resul&t copy to clipboard, do not replace text";
  var pTxtUsePlug   = "Use &Format plugin";
  var pTxtSort      = "Sort";
  var pTxtUndo      = "&Undo";
  var pTxtRedo      = "&Redo";
  var pTxtNoRangeL  = "There is no range of lines.";
  var pTxtNoKey2    = "There is no range of columns in second key.";
}

var DT_DWORD    = 3;
var BM_SETCHECK = 241;

var hMainWnd     = AkelPad.GetMainWnd();
var hEditWnd     = AkelPad.GetEditWnd();
var hGuiFont     = oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
var pScriptName  = WScript.ScriptName;
var hInstanceDLL = AkelPad.GetInstanceDll();

var bKey1      = 0;
var bDescLen   = 0;
var bKey2      = 1;
var bEntLine   = 0;
var bDesc      = 0;
var bIgCase    = 1;
var nMethod    = 1;
var nSortAnd   = 0;
var nNoSort    = 0;
var bCopyToCB  = 0;
var bUsePlug   = 0;
var nUndoLimit = 0;
var nRedoLimit = 0;
var nWordWrap;
var nLastCol;
var hWndDlg;
var lpBuffer;
var bGetSel;
var lpStrA;
var lpStrB;
var bIsReturn;
var hFocus;
var nWndPosX;
var nWndPosY;

ReadWriteIni(0);

var lpWnd       = [];
var IDRANGE     = 1000;
var IDFROM      = 1001;
var IDTO        = 1002;
var IDLINES     = 1003;
var IDBEGLINE   = 1004;
var IDENDLINE   = 1005;
var IDSORT1     = 1006;
var IDKEY1      = 1007;
var IDDESCLEN   = 1008;
var IDSORT2     = 1009;
var IDKEY2      = 1010;
var IDENTLINE   = 1011;
var IDFROM2     = 1012;
var IDTO2       = 1013;
var IDCOLUMNS   = 1014;
var IDBEGCOL    = 1015;
var IDENDCOL    = 1016;
var IDDESC      = 1017;
var IDIGCASE    = 1018;
var IDSORT3     = 1019;
var IDSTRING    = 1020;
var IDLOCALE    = 1021;
var IDNUM       = 1022;
var IDSORT4     = 1023;
var IDREMODUKEY = 1024;
var IDEXTRDUKEY = 1025;
var IDEXTRUNKEY = 1026;
var IDNOSORT    = 1027;
var IDREVERSE   = 1028;
var IDREMODULIN = 1029;
var IDEXTRDULIN = 1030;
var IDEXTRUNLIN = 1031;
var IDCOPYTOCB  = 1032;
var IDUSEPLUG   = 1033;
var IDSORT      = 1034;
var IDUNDO      = 1035;
var IDREDO      = 1036;

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
//0x50010003 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
//0x50012080 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_AUTOHSCROLL|ES_NUMBER
//Windows              WNDTYPE, WND,WNDEXSTY,     WNDSTY,WNDX,WNDY,WNDW,WNDH, WNDTXT
lpWnd[IDRANGE    ] = ["BUTTON",   0,       0, 0x50000007,  10,  10, 185,  70, pTxtRange];
lpWnd[IDFROM     ] = ["STATIC",   0,       0, 0x50000000,  70,  30,  55,  13, pTxtFrom];
lpWnd[IDTO       ] = ["STATIC",   0,       0, 0x50000000, 130,  30,  55,  13, pTxtTo];
lpWnd[IDLINES    ] = ["STATIC",   0,       0, 0x50000000,  20,  45,  50,  13, pTxtLines];
lpWnd[IDBEGLINE  ] = ["STATIC",   0,   0x200, 0x50000000,  70,  45,  55,  20, ""];
lpWnd[IDENDLINE  ] = ["STATIC",   0,   0x200, 0x50000000, 130,  45,  55,  20, ""];
lpWnd[IDSORT1    ] = ["BUTTON",   0,       0, 0x50000007,  10,  90, 290,  52, pTxtKeys];
lpWnd[IDKEY1     ] = ["BUTTON",   0,       0, 0x50010003,  20, 115, 150,  16, pTxtKey1];
lpWnd[IDDESCLEN  ] = ["BUTTON",   0,       0, 0x50010003, 205, 115,  90,  16, pTxtDesc];
lpWnd[IDSORT2    ] = ["BUTTON",   0,       0, 0x50000007,  10, 135, 290, 130, ""];
lpWnd[IDKEY2     ] = ["BUTTON",   0,       0, 0x50010003,  20, 150, 150,  16, pTxtKey2];
lpWnd[IDENTLINE  ] = ["BUTTON",   0,       0, 0x50010003,  70, 180, 120,  16, pTxtEntLine];
lpWnd[IDFROM2    ] = ["STATIC",   0,       0, 0x50000000,  70, 205,  55,  13, pTxtFrom];
lpWnd[IDTO2      ] = ["STATIC",   0,       0, 0x50000000, 130, 205,  55,  13, pTxtTo];
lpWnd[IDCOLUMNS  ] = ["STATIC",   0,       0, 0x50000000,  20, 220,  50,  13, pTxtColumns];
lpWnd[IDBEGCOL   ] = ["EDIT",     0,   0x200, 0x50012080,  70, 220,  55,  20, ""];
lpWnd[IDENDCOL   ] = ["EDIT",     0,   0x200, 0x50012080, 130, 220,  55,  20, ""];
lpWnd[IDDESC     ] = ["BUTTON",   0,       0, 0x50010003, 205, 150,  90,  16, pTxtDesc];
lpWnd[IDIGCASE   ] = ["BUTTON",   0,       0, 0x50010003, 205, 170,  90,  16, pTxtIgCase];
lpWnd[IDSORT3    ] = ["BUTTON",   0,       0, 0x50000007, 195, 185, 105,  80, ""];
lpWnd[IDSTRING   ] = ["BUTTON",   0,       0, 0x50000009, 205, 200,  90,  16, pTxtString];
lpWnd[IDLOCALE   ] = ["BUTTON",   0,       0, 0x50000009, 205, 220,  90,  16, pTxtLocale];
lpWnd[IDNUM      ] = ["BUTTON",   0,       0, 0x50000009, 205, 240,  90,  16, pTxtNum];
lpWnd[IDSORT4    ] = ["BUTTON",   0,       0, 0x50000007,  10, 275, 290,  85, pTxtSortAnd];
lpWnd[IDREMODUKEY] = ["BUTTON",   0,       0, 0x50010003,  60, 295, 230,  16, pTxtRemoDuKey];
lpWnd[IDEXTRDUKEY] = ["BUTTON",   0,       0, 0x50010003,  60, 315, 230,  16, pTxtExtrDuKey];
lpWnd[IDEXTRUNKEY] = ["BUTTON",   0,       0, 0x50010003,  60, 335, 230,  16, pTxtExtrUnKey];
lpWnd[IDNOSORT   ] = ["BUTTON",   0,       0, 0x50000007,  10, 370, 290, 105, pTxtNoSort];
lpWnd[IDREVERSE  ] = ["BUTTON",   0,       0, 0x50010003,  60, 390, 230,  16, pTxtReverse];
lpWnd[IDREMODULIN] = ["BUTTON",   0,       0, 0x50010003,  60, 410, 230,  16, pTxtRemoDuKey];
lpWnd[IDEXTRDULIN] = ["BUTTON",   0,       0, 0x50010003,  60, 430, 230,  16, pTxtExtrDuKey];
lpWnd[IDEXTRUNLIN] = ["BUTTON",   0,       0, 0x50010003,  60, 450, 230,  16, pTxtExtrUnKey];
lpWnd[IDCOPYTOCB ] = ["BUTTON",   0,       0, 0x50010003,  20, 485, 270,  16, pTxtCopyToCB];
lpWnd[IDUSEPLUG  ] = ["BUTTON",   0,       0, 0x50010003,  20, 505, 270,  16, pTxtUsePlug];
lpWnd[IDSORT     ] = ["BUTTON",   0,       0, 0x50010000, 220,  10,  80,  23, pTxtSort];
lpWnd[IDUNDO     ] = ["BUTTON",   0,       0, 0x50010000, 220,  35,  80,  23, pTxtUndo];
lpWnd[IDREDO     ] = ["BUTTON",   0,       0, 0x50010000, 220,  60,  80,  23, pTxtRedo];

if (hEditWnd)
{
  nWordWrap = AkelPad.SendMessage(hEditWnd, 3241 /*AEM_GETWORDWRAP*/, 0, 0);
  if (nWordWrap > 0) AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/);

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
                          560,             //nHeight
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

////////
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
    GetSelection();
    SetSelection();
    CheckButtons();
    CheckUndoRedo();

    //Set window position
    if ((nWndPosX == undefined) || (nWndPosY == undefined))
      MoveWindow(hMainWnd, hWnd, "RT");
    else
      MoveWindow(hMainWnd, hWnd, [nWndPosX, nWndPosY]);
  }

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("user32::SetFocus", lpWnd[IDKEY1][WND]);

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (wParam == 27) //VK_ESCAPE
      oSys.Call("user32::PostMessage" + _TCHAR, hWndDlg, 16 /*WM_CLOSE*/, 0, 0);
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

    if ((nLowParam == IDBEGCOL) || (nLowParam == IDENDCOL))
    {
      CheckEditValue(nLowParam);
      if (bGetSel)
        SetSelection();
    }

    else if (((nLowParam >= IDKEY1) && (nLowParam <= IDENTLINE)) ||
             ((nLowParam >= IDDESC) && (nLowParam <= IDUSEPLUG)))
    {
      CheckButtons(nLowParam);
    }

    else if (nLowParam == IDSORT)
    {
      if (SortLines())
      {
        CheckUndoRedo(nLowParam);
        GetSelection();
      }
    }

    else if (nLowParam == IDUNDO)
    {
      bIsReturn = 1;
      CheckUndoRedo(nLowParam);
      GetSelection();
    }

    else if (nLowParam == IDREDO)
    {
      bIsReturn = 1;
      CheckUndoRedo(nLowParam);
      GetSelection();
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

    pTxt = 'nWndPosX='  + rcWnd.left + ';\r\n' +
           'nWndPosY='  + rcWnd.top  + ';\r\n' +
           'bKey1='     + bKey1 + ';\r\n' +
           'bDescLen='  + bDescLen + ';\r\n' +
           'bKey2='     + bKey2 + ';\r\n' +
           'bEntLine='  + bEntLine + ';\r\n' +
           'bDesc='     + bDesc + ';\r\n' +
           'bIgCase='   + bIgCase + ';\r\n' +
           'nMethod='   + nMethod + ';\r\n' +
           'nSortAnd='  + nSortAnd + ';\r\n' +
           'nNoSort='   + nNoSort + ';\r\n' +
           'bCopyToCB=' + bCopyToCB + ';\r\n' +
           'bUsePlug='  + bUsePlug + ';'

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

function CheckButtons(nButton)
{
  if ((nButton == IDKEY1) && ((! bKey1) || (bKey2)))
    bKey1 = ! bKey1;
  else if (nButton == IDDESCLEN)
    bDescLen = ! bDescLen;
  else if ((nButton == IDKEY2) && ((! bKey2) || (bKey1)))
    bKey2 = ! bKey2;
  else if (nButton == IDENTLINE)
    bEntLine = ! bEntLine;
  else if (nButton == IDDESC)
    bDesc = ! bDesc;
  else if (nButton == IDIGCASE)
    bIgCase = ! bIgCase;
  else if ((nButton == IDSTRING) || (nButton == IDLOCALE) || (nButton == IDNUM))
    nMethod = nButton - IDSTRING + 1;
  else if ((nButton == IDREMODUKEY) || (nButton == IDEXTRDUKEY) || (nButton == IDEXTRUNKEY))
  {
    if (nSortAnd == nButton - IDREMODUKEY + 1)
      nSortAnd = 0;
    else
      nSortAnd = nButton - IDREMODUKEY + 1;
  }
  else if ((nButton == IDREVERSE)   || (nButton == IDREMODULIN) ||
           (nButton == IDEXTRDULIN) || (nButton == IDEXTRUNLIN))
  {
    if (nNoSort == nButton - IDREVERSE + 1)
      nNoSort = 0;
    else
      nNoSort = nButton - IDREVERSE + 1;
  }
  else if (nButton == IDCOPYTOCB)
    bCopyToCB = ! bCopyToCB;
  else if (nButton == IDUSEPLUG)
    bUsePlug = ! bUsePlug;

  if ((bUsePlug) && ((nNoSort > 1) || (nMethod == 2)))
    nMethod = 1;

  AkelPad.SendMessage(lpWnd[IDKEY1][WND],      BM_SETCHECK, bKey1,           0);
  AkelPad.SendMessage(lpWnd[IDDESCLEN][WND],   BM_SETCHECK, bDescLen,        0);
  AkelPad.SendMessage(lpWnd[IDKEY2][WND],      BM_SETCHECK, bKey2,           0);
  AkelPad.SendMessage(lpWnd[IDENTLINE][WND],   BM_SETCHECK, bEntLine,        0);
  AkelPad.SendMessage(lpWnd[IDDESC][WND],      BM_SETCHECK, bDesc,           0);
  AkelPad.SendMessage(lpWnd[IDIGCASE][WND],    BM_SETCHECK, bIgCase,         0);
  AkelPad.SendMessage(lpWnd[IDSTRING][WND],    BM_SETCHECK, (nMethod == 1),  0);
  AkelPad.SendMessage(lpWnd[IDLOCALE][WND],    BM_SETCHECK, (nMethod == 2),  0);
  AkelPad.SendMessage(lpWnd[IDNUM][WND],       BM_SETCHECK, (nMethod == 3),  0);
  AkelPad.SendMessage(lpWnd[IDREMODUKEY][WND], BM_SETCHECK, (nSortAnd == 1), 0);
  AkelPad.SendMessage(lpWnd[IDEXTRDUKEY][WND], BM_SETCHECK, (nSortAnd == 2), 0);
  AkelPad.SendMessage(lpWnd[IDEXTRUNKEY][WND], BM_SETCHECK, (nSortAnd == 3), 0);
  AkelPad.SendMessage(lpWnd[IDREVERSE][WND],   BM_SETCHECK, (nNoSort == 1),  0);
  AkelPad.SendMessage(lpWnd[IDREMODULIN][WND], BM_SETCHECK, (nNoSort == 2),  0);
  AkelPad.SendMessage(lpWnd[IDEXTRDULIN][WND], BM_SETCHECK, (nNoSort == 3),  0);
  AkelPad.SendMessage(lpWnd[IDEXTRUNLIN][WND], BM_SETCHECK, (nNoSort == 4),  0);
  AkelPad.SendMessage(lpWnd[IDCOPYTOCB][WND],  BM_SETCHECK, bCopyToCB,       0);
  AkelPad.SendMessage(lpWnd[IDUSEPLUG][WND],   BM_SETCHECK, bUsePlug,        0);

  oSys.Call("user32::EnableWindow", lpWnd[IDKEY1][WND],      (nNoSort != 1) && (! bUsePlug));
  oSys.Call("user32::EnableWindow", lpWnd[IDDESCLEN][WND],   (nNoSort == 0) && bKey1 && (! bUsePlug));
  oSys.Call("user32::EnableWindow", lpWnd[IDKEY2][WND],      (nNoSort != 1));
  oSys.Call("user32::EnableWindow", lpWnd[IDENTLINE][WND],   (nNoSort != 1) && bKey2);
  oSys.Call("user32::EnableWindow", lpWnd[IDFROM2][WND],     (nNoSort != 1) && bKey2 && (! bEntLine));
  oSys.Call("user32::EnableWindow", lpWnd[IDTO2][WND],       (nNoSort != 1) && bKey2 && (! bEntLine));
  oSys.Call("user32::EnableWindow", lpWnd[IDCOLUMNS][WND],   (nNoSort != 1) && bKey2 && (! bEntLine));
  oSys.Call("user32::EnableWindow", lpWnd[IDBEGCOL][WND],    (nNoSort != 1) && bKey2 && (! bEntLine));
  oSys.Call("user32::EnableWindow", lpWnd[IDENDCOL][WND],    (nNoSort != 1) && bKey2 && (! bEntLine));
  oSys.Call("user32::EnableWindow", lpWnd[IDDESC][WND],      (nNoSort == 0) && bKey2);
  oSys.Call("user32::EnableWindow", lpWnd[IDIGCASE][WND],    (nNoSort != 1) && bKey2 && ((nMethod != 3) || bUsePlug));
  oSys.Call("user32::EnableWindow", lpWnd[IDSTRING][WND],    (nNoSort != 1) && bKey2);
  oSys.Call("user32::EnableWindow", lpWnd[IDLOCALE][WND],    (nNoSort != 1) && bKey2 && (! bUsePlug));
  oSys.Call("user32::EnableWindow", lpWnd[IDNUM][WND],       (nNoSort != 1) && bKey2 && (! (bUsePlug && (nNoSort > 1))));
  oSys.Call("user32::EnableWindow", lpWnd[IDREMODUKEY][WND], (nNoSort == 0) && (! bUsePlug));
  oSys.Call("user32::EnableWindow", lpWnd[IDEXTRDUKEY][WND], (nNoSort == 0) && (! bUsePlug));
  oSys.Call("user32::EnableWindow", lpWnd[IDEXTRUNKEY][WND], (nNoSort == 0) && (! bUsePlug));
  oSys.Call("user32::EnableWindow", lpWnd[IDCOPYTOCB][WND],  (! bUsePlug));
}

function CheckUndoRedo(nButton)
{
  var nBegSel  = AkelPad.GetSelStart();
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
    AkelPad.SetSel(nBegSel, AkelPad.GetSelEnd());
  }

  if (nUndoLimit)
    pTxtUndo += " (" + nUndoLimit + ")";
  if (nRedoLimit)
    pTxtRedo += " (" + nRedoLimit + ")";

  if (((oSys.Call("user32::GetFocus") == lpWnd[IDUNDO][WND]) && (nUndoLimit == 0)) ||
      ((oSys.Call("user32::GetFocus") == lpWnd[IDREDO][WND]) && (nRedoLimit == 0)))
    oSys.Call("user32::SetFocus", lpWnd[IDKEY1][WND]);

  SetWindowFontAndText(lpWnd[IDUNDO][WND], hGuiFont, pTxtUndo);
  SetWindowFontAndText(lpWnd[IDREDO][WND], hGuiFont, pTxtRedo);

  oSys.Call("user32::EnableWindow", lpWnd[IDUNDO][WND], nUndoLimit);
  oSys.Call("user32::EnableWindow", lpWnd[IDREDO][WND], nRedoLimit);
}

function CheckEditValue(nID)
{
  var pEditValue;

  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[nID][WND], lpBuffer, 256);
  pEditValue = AkelPad.MemRead(lpBuffer, _TSTR);

  if (pEditValue == 0)
  {
    SetWindowFontAndText(lpWnd[nID][WND], hGuiFont, "1");
    AkelPad.SendMessage(lpWnd[nID][WND], 177 /*EM_SETSEL*/, 0, -1);
  }
  else if (pEditValue > nLastCol)
  {
    SetWindowFontAndText(lpWnd[nID][WND], hGuiFont, String(nLastCol));
    AkelPad.SendMessage(lpWnd[nID][WND], 177 /*EM_SETSEL*/, 0, -1);
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

  if ((nLine1 == nLine2) && (! bGetSel))
  {
    nLine1 = 1;
    nLine2 = AkelPad.SendMessage(hEditWnd, 3129 /*AEM_GETLINENUMBER*/, 0 /*AEGL_LINECOUNT*/, 0);
  }

  nLastCol = LineMaxLength(nLine1, nLine2) + 1;
  SetWindowFontAndText(lpWnd[IDBEGLINE][WND], hGuiFont, String(nLine1));
  SetWindowFontAndText(lpWnd[IDENDLINE][WND], hGuiFont, String(nLine2));

  if (! bGetSel)
  {
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
  
    if (nCol1 > nLastCol)
      nCol1 = nLastCol;
    if (nCol2 > nLastCol)
      nCol2 = nLastCol;

    SetWindowFontAndText(lpWnd[IDBEGCOL][WND],  hGuiFont, String(nCol1));
    SetWindowFontAndText(lpWnd[IDENDCOL][WND],  hGuiFont, String(nCol2));
    bEntLine = ! AkelPad.SendMessage(hEditWnd, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0);
  }

  AkelPad.MemFree(lpBegSel);
  AkelPad.MemFree(lpEndSel);
  bGetSel = 1;
}

function LineMaxLength(nLine1, nLine2)
{
  var nMaxLenL = 0;
  var nBegLine;
  var nLenLine;
  var i;

  for (i = nLine1 - 1; i < nLine2; ++i)
  {
    nBegLine = AkelPad.SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/, i, 0);
    nLenLine = AkelPad.SendMessage(hEditWnd, 193 /*EM_LINELENGTH*/, nBegLine, 0);
    if (nLenLine > nMaxLenL)
      nMaxLenL = nLenLine;
  }

  return nMaxLenL;
}

function SetSelection()
{
  var hWndFocus = oSys.Call("user32::GetFocus");
  var lpSelect  = AkelPad.MemAlloc(28 /*sizeof(AESELECTION)*/);
  var lpBegSel  = lpSelect;
  var lpEndSel  = lpSelect + 12;
  var lpSelFlag = lpSelect + 24;
  var nColSel   = 1;
  var nLine1, nLine2, nCol1, nCol2;

  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDBEGLINE][WND], lpBuffer, 256);
  nLine1 = Number(AkelPad.MemRead(lpBuffer, _TSTR)) - 1;
  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDENDLINE][WND], lpBuffer, 256);
  nLine2 = Number(AkelPad.MemRead(lpBuffer, _TSTR)) - 1;

  if ((hWndFocus == lpWnd[IDBEGCOL][WND]) || (hWndFocus == lpWnd[IDENDCOL][WND]))
  {
    oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDBEGCOL][WND], lpBuffer, 256);
    nCol1 = Number(AkelPad.MemRead(lpBuffer, _TSTR)) - 1;
    oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDENDCOL][WND], lpBuffer, 256);
    nCol2 = Number(AkelPad.MemRead(lpBuffer, _TSTR)) - 1;
  }
  else
  {
    nCol1   = 0;
    nCol2   = AkelPad.SendMessage(hEditWnd, 193 /*EM_LINELENGTH*/, AkelPad.SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/, nLine2, 0), 0);
    nColSel = 0;
  }

  AkelPad.MemCopy(lpBegSel,     nLine1,  DT_DWORD);
  AkelPad.MemCopy(lpBegSel + 8, nCol1,   DT_DWORD);
  AkelPad.MemCopy(lpEndSel,     nLine2,  DT_DWORD);
  AkelPad.MemCopy(lpEndSel + 8, nCol2,   DT_DWORD);
  AkelPad.MemCopy(lpSelFlag,    nColSel, DT_DWORD);

  AkelPad.SendMessage(hEditWnd, 3132 /*AEM_INDEXUPDATE*/, 0, lpBegSel);
  AkelPad.SendMessage(hEditWnd, 3132 /*AEM_INDEXUPDATE*/, 0, lpEndSel);

  AkelPad.SendMessage(hEditWnd, 3126 /*AEM_SETSEL*/, 0, lpSelect);

  AkelPad.MemFree(lpSelect);
}

function SortLines()
{
  var aTxt  = [];
  var pText = "";
  var nLine1;
  var nLine2;
  var nCol1;
  var nCol2;

  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDBEGLINE][WND], lpBuffer, 256);
  nLine1 = Number(AkelPad.MemRead(lpBuffer, _TSTR)) - 1;
  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDENDLINE][WND], lpBuffer, 256);
  nLine2 = Number(AkelPad.MemRead(lpBuffer, _TSTR)) - 1;
  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDBEGCOL][WND], lpBuffer, 256);
  nCol1 = Number(AkelPad.MemRead(lpBuffer, _TSTR)) - 1;
  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDENDCOL][WND], lpBuffer, 256);
  nCol2 = Number(AkelPad.MemRead(lpBuffer, _TSTR)) - 1;

  if (nLine1 == nLine2)
  {
    AkelPad.MessageBox(hWndDlg, pTxtNoRangeL, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
    return 0;
  }

  if ((nCol1 == nCol2) && bKey2 && (! bEntLine) && (nNoSort != 1))
  {
    AkelPad.MessageBox(hWndDlg, pTxtNoKey2, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
    oSys.Call("user32::SetFocus", lpWnd[IDENDCOL][WND]);
    AkelPad.SendMessage(lpWnd[IDENDCOL][WND], 177 /*EM_SETSEL*/, 0, -1);
    return 0;
  }

  if (bUsePlug)
  {
    if (! bEntLine)
    {
      oSys.Call("user32::SetFocus", lpWnd[IDENDCOL][WND]);
      SetSelection();
    }
    SortByPlugin();
    oSys.Call("user32::SetFocus", lpWnd[IDSORT][WND]);
    return 1;
  }

  else
  {
    if (nNoSort == 1)
    {
      aTxt  = AkelPad.GetSelText(1 /*\r*/).split("\r");
      pText = aTxt.reverse().join("\r");
    }

    else
    {
      aTxt.length = 2;
      aTxt[0] = AkelPad.GetSelText(1 /*\r*/).split("\r");
      if (bEntLine)
        aTxt[1] = AkelPad.GetSelText(1 /*\r*/).split("\r");
      else
      {
        aTxt[1] = GetTextRangeColumn([nLine1, nCol1], [nLine2, nCol2]);
      }

      aTxt = ArrayTransp(aTxt);

      ArraySort(aTxt);

      for (i = 0; i < aTxt.length; ++i)
      {
        pText += aTxt[i][0] + "\r";
      }
      pText = pText.slice(0, -1);
    }

    if (bCopyToCB)
    {
      AkelPad.SetClipboardText(pText);
      return 0;
    }
    else
    {
      AkelPad.ReplaceSel(pText, 1);
      return 1;
    }
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
function ArraySort(aTxt)
{
  lpStrA = AkelPad.MemAlloc(nLastCol * _TSIZE);
  lpStrB = AkelPad.MemAlloc(nLastCol * _TSIZE);

  if (nNoSort == 0)
  {
    aTxt.sort(CompareValue);
    RemoveFromArray(aTxt);
  }
  else
    NoSort(aTxt);

  AkelPad.MemFree(lpStrA);
  AkelPad.MemFree(lpStrB);
}

////////
function CompareValue(ValA, ValB)
{
  var nResult = 0;

  if (bKey1)
    if (ValA[0].length > ValB[0].length)
      nResult = bDescLen ? -1 : 1;
    else if (ValA[0].length < ValB[0].length)
      nResult = bDescLen ? 1 : -1;

  if ((bKey2) && (nResult == 0))
  {
    if (nMethod == 1)
    {
      if (bIgCase)
      {
        ValA[1] = ValA[1].toUpperCase();
        ValB[1] = ValB[1].toUpperCase();
      }
      if (ValA[1] > ValB[1])
        nResult = bDesc ? -1 : 1;
      else if (ValA[1] < ValB[1])
        nResult = bDesc ? 1 : -1;
    }
    else if (nMethod == 2)
    {
      AkelPad.MemCopy(lpStrA, ValA[1], _TSTR);
      AkelPad.MemCopy(lpStrB, ValB[1], _TSTR);
      nResult = oSys.Call("kernel32::lstrcmp" + (bIgCase ? "i" : "") + _TCHAR, lpStrA, lpStrB);
      if (bDesc)
        nResult = -nResult;
    }
    else
    {
      var oRegExp = /(-?\d+\.?\d*)|(-?\.\d+)/;
  
      ValA[1] = oRegExp.exec(ValA[1]);
      ValB[1] = oRegExp.exec(ValB[1]);
      ValA[1] = ValA[1] ? parseFloat(ValA[1][0]) : 0;
      ValB[1] = ValB[1] ? parseFloat(ValB[1][0]) : 0;
      nResult = bDesc ? (ValB[1] - ValA[1]) : (ValA[1] - ValB[1]);
    }
  }

  return nResult;
}

////////
function RemoveFromArray(aTxt)
{
  var i;

  if (nSortAnd == 1)
  {
    for (i = aTxt.length - 1; i > 0; --i)
    {
      if (CompareValue(aTxt[i], aTxt[i - 1]) == 0)
        aTxt.splice(i, 1);
    }
  }

  else if (nSortAnd == 2)
  {
    for (i = aTxt.length - 2; i > 0; --i)
    {
      if ((CompareValue(aTxt[i], aTxt[i + 1]) != 0) && (CompareValue(aTxt[i], aTxt[i - 1]) != 0))
        aTxt.splice(i, 1);
    }
    if ((aTxt.length > 1) && (CompareValue(aTxt[aTxt.length - 1], aTxt[aTxt.length - 2]) != 0))
      aTxt.splice(aTxt.length - 1, 1);
    if ((aTxt.length > 1) && (CompareValue(aTxt[0], aTxt[1]) != 0))
      aTxt.splice(0, 1);
    if (aTxt.length == 1)
      aTxt.splice(0, 1);
  }

  else if (nSortAnd == 3)
  {
    i = aTxt.length - 1;
    while (i > 0)
    {
      if (CompareValue(aTxt[i], aTxt[i - 1]) == 0)
      {
        aTxt.splice(i - 1, 2);
        i -= 2;
      }
      else
        --i;
    }
  }
}

////////
function NoSort(aTxt)
{
  var i, n, bIsDup;

  if (nNoSort == 2)
  {
    for (n = 0; n < aTxt.length; ++n)
    {
      i = n + 1;
      while (i < aTxt.length)
      {
        if (CompareValue(aTxt[i], aTxt[n]) == 0)
          aTxt.splice(i, 1);
        else
          ++i;
      }
    }
  }

  else if (nNoSort == 3)
  {
    n = 0;
    while (n < aTxt.length)
    {
      bIsDup = false;
      for (i = 0; i < aTxt.length; ++i)
      {
        if ((CompareValue(aTxt[i], aTxt[n]) == 0) && (i != n))
        {
          bIsDup = true;
          break;
        }
      }
      if (bIsDup)
        ++n;
      else
        aTxt.splice(n, 1);
    }
  }

  else if (nNoSort == 4)
  {
    n = 0;
    while (n < aTxt.length)
    {
      bIsDup = false;
      i = n + 1;
      while (i < aTxt.length)
      {
        if (CompareValue(aTxt[i], aTxt[n]) == 0)
        {
          bIsDup = true;
          aTxt.splice(i, 1);
        }
        else
          ++i;
      }
      if (bIsDup)
        aTxt.splice(n, 1);
      else
        ++n;
    }
  }
}

function SortByPlugin()
{
  var pAscDesc = bDesc ? "Desc" : "Asc";

  if (nNoSort == 1)
    AkelPad.Call("Format::LineReverse");
  else if (nNoSort == 2)
    AkelPad.Call("Format::LineRemoveDuplicates", ! bIgCase);
  else if (nNoSort == 3)
    AkelPad.Call("Format::LineGetDuplicates", ! bIgCase);
  else if (nNoSort == 4)
    AkelPad.Call("Format::LineGetUnique", ! bIgCase);
  else if (nMethod == 1)
    AkelPad.Call("Format::LineSortStr" + pAscDesc, ! bIgCase);
  else if (nMethod == 3)
    AkelPad.Call("Format::LineSortInt" + pAscDesc, ! bIgCase);
}
