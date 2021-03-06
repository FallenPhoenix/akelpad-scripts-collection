// Sort words - 2011-03-07
//
// Call("Scripts::Main", 1, "SortWords.js")
//
// Shortcut keys in dialog box:
// Enter - Sort
// Esc   - Close
// Shift+Alt+ Right, Left, Down, Up, End, Home, PgDn, PgUp - move dialog box.

var oSys = AkelPad.SystemFunction();

if (oSys.Call("kernel32::GetUserDefaultLangID") == 0x0415) //Polish
{
  var pTxtCaption  = "Sortowanie słów";
  var pTxtSep      = "Separator";
  var pTxtSepWord  = "Dowolny separator słów";
  var pTxtSepNo    = "Brak separatora - sortowanie znaków";
  var pTxtSepAny   = "Dowolny z:";
  var pTxtSepStr   = "String:";
  var pTxtTab      = "\\t = Tabulacja";
  var pTxtSortMet  = "Metoda sortowania";
  var pTxtDesc     = "&Malejąco";
  var pTxtIgCase   = "&Ignoruj wlk. liter";
  var pTxtString   = "&String";
  var pTxtLocale   = "&Alfabetycznie";
  var pTxtNum      = "&Numerycznie";
  var pTxtNoSort   = "Nie sortuj, ale";
  var pTxtReverse  = "&Odwróć kolejność słów";
  var pTxtRemoDup  = "&Usuń duplikaty słów";
  var pTxtExtrDup  = "&Zachowaj tylko powielone słowa";
  var pTxtExtrUni  = "Zac&howaj tylko unikalne słowa";
  var pTxtInLine   = "&W każdym wierszu sortuj oddzielnie";
  var pTxtCopyToCB = "Wynik kopiuj do schowka, nie zmieniaj &tekstu";
  var pTxtSort     = "Sortuj";
  var pTxtUndo     = "&Cofnij";
  var pTxtRedo     = "&Powtórz";
}
else
{
  var pTxtCaption  = "Sort words";
  var pTxtSep      = "Separator";
  var pTxtSepWord  = "Any words separator";
  var pTxtSepNo    = "No separator - sorts single chars";
  var pTxtSepAny   = "Any of:";
  var pTxtSepStr   = "String:";
  var pTxtTab      = "\\t = Tabulation";
  var pTxtSortMet  = "Sort method";
  var pTxtDesc     = "&Descending";
  var pTxtIgCase   = "&Ignore case";
  var pTxtString   = "&String";
  var pTxtLocale   = "&Alphabetically";
  var pTxtNum      = "&Numerically";
  var pTxtNoSort   = "No sort, but";
  var pTxtReverse  = "Reverse &order of words";
  var pTxtRemoDup  = "Re&move duplicate words";
  var pTxtExtrDup  = "E&xtract duplicate words";
  var pTxtExtrUni  = "Extra&ct unique words";
  var pTxtInLine   = "In each &line, sort separately";
  var pTxtCopyToCB = "Resul&t copy to clipboard, do not replace text";
  var pTxtSort     = "Sort";
  var pTxtUndo     = "&Undo";
  var pTxtRedo     = "&Redo";
}

var DT_DWORD    = 3;
var BM_SETCHECK = 241;

var hMainWnd     = AkelPad.GetMainWnd();
var hEditWnd     = AkelPad.GetEditWnd();
var hGuiFont     = oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
var pScriptName  = WScript.ScriptName;
var hInstanceDLL = AkelPad.GetInstanceDll();

var nSep       = 0;
var pSep       = ";";
var bTabSep    = 1;
var bIgCaseSep = 1;
var bDesc      = 0;
var bIgCase    = 1;
var nMethod    = 1;
var nNoSort    = 0;
var bInLine    = 1;
var bCopyToCB  = 0;
var nUndoLimit = 0;
var nRedoLimit = 0;
var lpStrA;
var lpStrB;
var hWndDlg;
var lpBuffer;
var bColSel;
var bIsReturn;
var hFocus;
var nWndPosX;
var nWndPosY;

ReadWriteIni(0);

var lpWnd       = [];
var IDGROUP1    = 1000;
var IDSEPWORD   = 1001;
var IDSEPNO     = 1002;
var IDSEPANY    = 1003;
var IDSEPSTR    = 1004;
var IDGROUP2    = 1005;
var IDSEP       = 1006;
var IDTABSEP    = 1007;
var IDIGCASESEP = 1008;
var IDGROUP3    = 1009;
var IDDESC      = 1010;
var IDIGCASE    = 1011;
var IDGROUP4    = 1012;
var IDSTRING    = 1013;
var IDLOCALE    = 1014;
var IDNUM       = 1015;
var IDGROUP5    = 1016;
var IDREVERSE   = 1017;
var IDREMODUP   = 1018;
var IDEXTRDUP   = 1019;
var IDEXTRUNI   = 1020;
var IDINLINE    = 1021;
var IDCOPYTOCB  = 1022;
var IDSORT      = 1023;
var IDUNDO      = 1024;
var IDREDO      = 1025;

var WNDTYPE  = 0;
var WND      = 1;
var WNDEXSTY = 2;
var WNDSTY   = 3;
var WNDX     = 4;
var WNDY     = 5;
var WNDW     = 6;
var WNDH     = 7;
var WNDTXT   = 8;

//0x50000007 - WS_VISIBLE|WS_CHILD|BS_GROUPBOX
//0x50000009 - WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
//0x50010000 - WS_VISIBLE|WS_CHILD|WS_TABSTOP
//0x50010001 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_DEFPUSHBUTTON
//0x50010003 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
//0x50010080 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_AUTOHSCROLL
//Windows              WNDTYPE, WND,WNDEXSTY,     WNDSTY,WNDX,WNDY,WNDW,WNDH, WNDTXT
lpWnd[IDGROUP1   ] = ["BUTTON",   0,       0, 0x50000007,  10,  10, 230, 135, pTxtSep];
lpWnd[IDSEPWORD  ] = ["BUTTON",   0,       0, 0x50000009,  20,  30, 200,  16, pTxtSepWord];
lpWnd[IDSEPNO    ] = ["BUTTON",   0,       0, 0x50000009,  20,  50, 200,  16, pTxtSepNo];
lpWnd[IDSEPANY   ] = ["BUTTON",   0,       0, 0x50000009,  30,  75,  70,  16, pTxtSepAny];
lpWnd[IDSEPSTR   ] = ["BUTTON",   0,       0, 0x50000009,  30,  95,  70,  16, pTxtSepStr];
lpWnd[IDGROUP2   ] = ["BUTTON",   0,       0, 0x50000007, 100,  63, 140,  82, ""];
lpWnd[IDSEP      ] = ["EDIT",     0,   0x200, 0x50010080, 110,  80, 120,  20, pSep];
lpWnd[IDTABSEP   ] = ["BUTTON",   0,       0, 0x50010003, 125, 105,  90,  16, pTxtTab];
lpWnd[IDIGCASESEP] = ["BUTTON",   0,       0, 0x50010003, 125, 125,  90,  16, pTxtIgCase];
lpWnd[IDGROUP3   ] = ["BUTTON",   0,       0, 0x50000007,  10, 155, 230,  80, pTxtSortMet];
lpWnd[IDDESC     ] = ["BUTTON",   0,       0, 0x50010003,  35, 180,  90,  16, pTxtDesc];
lpWnd[IDIGCASE   ] = ["BUTTON",   0,       0, 0x50010003,  35, 200,  90,  16, pTxtIgCase];
lpWnd[IDGROUP4   ] = ["BUTTON",   0,       0, 0x50000007, 130, 155, 110,  80, ""];
lpWnd[IDSTRING   ] = ["BUTTON",   0,       0, 0x50000009, 145, 170,  90,  16, pTxtString];
lpWnd[IDLOCALE   ] = ["BUTTON",   0,       0, 0x50000009, 145, 190,  90,  16, pTxtLocale];
lpWnd[IDNUM      ] = ["BUTTON",   0,       0, 0x50000009, 145, 210,  90,  16, pTxtNum];
lpWnd[IDGROUP5   ] = ["BUTTON",   0,       0, 0x50000007,  10, 245, 230, 105, pTxtNoSort];
lpWnd[IDREVERSE  ] = ["BUTTON",   0,       0, 0x50010003,  50, 265, 180,  16, pTxtReverse];
lpWnd[IDREMODUP  ] = ["BUTTON",   0,       0, 0x50010003,  50, 285, 180,  16, pTxtRemoDup];
lpWnd[IDEXTRDUP  ] = ["BUTTON",   0,       0, 0x50010003,  50, 305, 180,  16, pTxtExtrDup];
lpWnd[IDEXTRUNI  ] = ["BUTTON",   0,       0, 0x50010003,  50, 325, 180,  16, pTxtExtrUni];
lpWnd[IDINLINE   ] = ["BUTTON",   0,       0, 0x50010003,  10, 360, 230,  16, pTxtInLine];
lpWnd[IDCOPYTOCB ] = ["BUTTON",   0,       0, 0x50010003,  10, 380, 230,  16, pTxtCopyToCB];
lpWnd[IDSORT     ] = ["BUTTON",   0,       0, 0x50010001,  10, 405,  70,  23, pTxtSort];
lpWnd[IDUNDO     ] = ["BUTTON",   0,       0, 0x50010000,  90, 405,  70,  23, pTxtUndo];
lpWnd[IDREDO     ] = ["BUTTON",   0,       0, 0x50010000, 170, 405,  70,  23, pTxtRedo];

if (hEditWnd)
{
  if (AkelPad.GetSelStart() == AkelPad.GetSelEnd())
    AkelPad.SetSel(0, -1);

  if (AkelPad.GetSelStart() == AkelPad.GetSelEnd())
    WScript.Quit();

  if (bColSel = AkelPad.SendMessage(hEditWnd, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0))
    bInLine = 1;

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
                          255,             //nWidth
                          465,             //nHeight
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

    //Set limit edit text
    AkelPad.SendMessage(lpWnd[IDSEP][WND], 197 /*EM_LIMITTEXT*/, 24, 0);

    //Check
    CheckButtons();
    CheckUndoRedo();

    //Set window position
    if ((nWndPosX == undefined) || (nWndPosY == undefined))
      MoveWindow(hMainWnd, hWnd, "RT");
    else
      MoveWindow(hMainWnd, hWnd, [nWndPosX, nWndPosY]);
  }

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("user32::SetFocus", lpWnd[IDSEPWORD + nSep][WND]);

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (wParam == 27) //VK_ESCAPE
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

    if ((nLowParam >= IDSEPWORD) && (nLowParam <= IDCOPYTOCB) && (nLowParam != IDSEP))
      CheckButtons(nLowParam);
    else if (nLowParam == IDSORT)
    {
      if (SortWords())
        CheckUndoRedo(nLowParam);
    }
    else if (nLowParam == IDUNDO)
    {
      bIsReturn = 1;
      CheckUndoRedo(nLowParam);
    }
    else if (nLowParam == IDREDO)
    {
      bIsReturn = 1;
      CheckUndoRedo(nLowParam);
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

    oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDSEP][WND], lpBuffer, 256);
    pSep = AkelPad.MemRead(lpBuffer, _TSTR);

    pTxt = 'nWndPosX='   + rcWnd.left + ';\r\n' +
           'nWndPosY='   + rcWnd.top  + ';\r\n' +
           'nSep='       + nSep + ';\r\n' + 
           'pSep="'      + pSep.replace(/[\\"]/g, "\\$&") + '";\r\n' +
           'bTabSep='    + bTabSep + ';\r\n' +
           'bIgCaseSep=' + bIgCaseSep + ';\r\n' +
           'bDesc='      + bDesc + ';\r\n' +
           'bIgCase='    + bIgCase + ';\r\n' +
           'nMethod='    + nMethod + ';\r\n' +
           'nNoSort='    + nNoSort + ';\r\n' +
           'bInLine='    + bInLine + ';\r\n' +
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

function CheckButtons(nButton)
{
  if ((nButton == IDSEPWORD) || (nButton == IDSEPNO) || (nButton == IDSEPANY) || (nButton == IDSEPSTR))
    nSep = nButton - IDSEPWORD;
  else if (nButton == IDTABSEP)
    bTabSep = ! bTabSep;
  else if (nButton == IDIGCASESEP)
    bIgCaseSep = ! bIgCaseSep;
  else if (nButton == IDDESC)
    bDesc = ! bDesc;
  else if (nButton == IDIGCASE)
    bIgCase = ! bIgCase;
  else if ((nButton == IDSTRING) || (nButton == IDLOCALE) || (nButton == IDNUM))
    nMethod = nButton - IDSTRING + 1;
  else if ((nButton == IDREVERSE) || (nButton == IDREMODUP) ||
           (nButton == IDEXTRDUP) || (nButton == IDEXTRUNI))
  {
    if (nNoSort == nButton - IDREVERSE + 1)
      nNoSort = 0;
    else
      nNoSort = nButton - IDREVERSE + 1;
  }
  else if (nButton == IDINLINE)
    bInLine = ! bInLine;
  else if (nButton == IDCOPYTOCB)
    bCopyToCB = ! bCopyToCB;

  AkelPad.SendMessage(lpWnd[IDSEPWORD][WND],   BM_SETCHECK, (nSep == 0),    0);
  AkelPad.SendMessage(lpWnd[IDSEPNO][WND],     BM_SETCHECK, (nSep == 1),    0);
  AkelPad.SendMessage(lpWnd[IDSEPANY][WND],    BM_SETCHECK, (nSep == 2),    0);
  AkelPad.SendMessage(lpWnd[IDSEPSTR][WND],    BM_SETCHECK, (nSep == 3),    0);
  AkelPad.SendMessage(lpWnd[IDTABSEP][WND],    BM_SETCHECK, bTabSep,        0);
  AkelPad.SendMessage(lpWnd[IDIGCASESEP][WND], BM_SETCHECK, bIgCaseSep,     0);
  AkelPad.SendMessage(lpWnd[IDDESC][WND],      BM_SETCHECK, bDesc,          0);
  AkelPad.SendMessage(lpWnd[IDIGCASE][WND],    BM_SETCHECK, bIgCase,        0);
  AkelPad.SendMessage(lpWnd[IDSTRING][WND],    BM_SETCHECK, (nMethod == 1), 0);
  AkelPad.SendMessage(lpWnd[IDLOCALE][WND],    BM_SETCHECK, (nMethod == 2), 0);
  AkelPad.SendMessage(lpWnd[IDNUM][WND],       BM_SETCHECK, (nMethod == 3), 0);
  AkelPad.SendMessage(lpWnd[IDREVERSE][WND],   BM_SETCHECK, (nNoSort == 1), 0);
  AkelPad.SendMessage(lpWnd[IDREMODUP][WND],   BM_SETCHECK, (nNoSort == 2), 0);
  AkelPad.SendMessage(lpWnd[IDEXTRDUP][WND],   BM_SETCHECK, (nNoSort == 3), 0);
  AkelPad.SendMessage(lpWnd[IDEXTRUNI][WND],   BM_SETCHECK, (nNoSort == 4), 0);
  AkelPad.SendMessage(lpWnd[IDINLINE][WND],    BM_SETCHECK, bInLine,        0);
  AkelPad.SendMessage(lpWnd[IDCOPYTOCB][WND],  BM_SETCHECK, bCopyToCB,      0);

  oSys.Call("user32::EnableWindow", lpWnd[IDSEP][WND],       (nSep > 1));
  oSys.Call("user32::EnableWindow", lpWnd[IDTABSEP][WND],    (nSep > 1));
  oSys.Call("user32::EnableWindow", lpWnd[IDIGCASESEP][WND], (nSep > 1));
  oSys.Call("user32::EnableWindow", lpWnd[IDDESC][WND],      (nNoSort == 0));
  oSys.Call("user32::EnableWindow", lpWnd[IDIGCASE][WND],    (nNoSort != 1) && (nMethod != 3));
  oSys.Call("user32::EnableWindow", lpWnd[IDSTRING][WND],    (nNoSort != 1));
  oSys.Call("user32::EnableWindow", lpWnd[IDLOCALE][WND],    (nNoSort != 1));
  oSys.Call("user32::EnableWindow", lpWnd[IDNUM][WND],       (nNoSort != 1));
  oSys.Call("user32::EnableWindow", lpWnd[IDINLINE][WND],    ! bColSel);
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
    if ((! nUndoLimit) && (oSys.Call("user32::GetFocus") == lpWnd[IDUNDO][WND]))
      oSys.Call("user32::SetFocus", lpWnd[IDSORT][WND]);
  }
  else if ((nButton == IDREDO) && (nRedoLimit))
  {
    ++nUndoLimit;
    --nRedoLimit;
    AkelPad.SendMessage(hEditWnd, 3078 /*AEM_REDO*/, 0, 0);
    AkelPad.SetSel(nBegSel, AkelPad.GetSelEnd());
    AkelPad.SendMessage(hEditWnd, 3128 /*AEM_UPDATESEL*/, bColSel, 0);
    if ((! nRedoLimit) && (oSys.Call("user32::GetFocus") == lpWnd[IDREDO][WND]))
      oSys.Call("user32::SetFocus", lpWnd[IDSORT][WND]);
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

function SortWords()
{
  var pText = AkelPad.GetSelText();
  var aTxt  = [];
  var pSep  = "";
  var pMod  = "g";
  var rSep;
  var aWord;
  var aSep;
  var i, n;

  lpStrA = AkelPad.MemAlloc(pText.length * _TSIZE);
  lpStrB = AkelPad.MemAlloc(pText.length * _TSIZE);

  if (bInLine)
    aTxt = pText.split("\r");
  else
    aTxt[0] = pText;

  if (nSep == 0)
    pSep = " \t'`\"\\|[](){}<>,.;:+-=~!@#$%^&*/?";
  else if (nSep > 1)
  {
    oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDSEP][WND], lpBuffer, 256);
    pSep = AkelPad.MemRead(lpBuffer, _TSTR);
    if (bTabSep)
      pSep = pSep.replace(/\\t/g, "\t");
  }

  if (pSep)
  {
    pSep = pSep.replace(/[\\\/.^$+*?|()\[\]{}-]/g, "\\$&");

    if ((nSep == 0) || (nSep == 2))
      pSep = "[" + pSep + "\r]+";
    else if (nSep == 3)
      pSep = "((" + pSep + ")|\r)+";

    if ((nSep > 1) && bIgCaseSep)
      pMod += "i";
  }

  rSep = new RegExp(pSep, pMod);

  for (i = 0; i < aTxt.length; ++i)
  {
    aWord = aTxt[i].split(rSep);
    aSep  = aTxt[i].match(rSep);

    if ((! pSep) && (! bInLine))
    {
      n = 0;
      while (n < aWord.length)
      {
        if (aWord[n] == "\r")
        {
          aWord.splice(n, 1);
          aSep.splice(n, 2, "\r");
        }
        else
          ++n;
      }
    }

    if (aWord.length > 1)
    {
      if (! RegExp("^" + pSep, pMod).test(aTxt[i]))
        aSep.unshift("");
      if (! RegExp(pSep + "$", pMod).test(aTxt[i]))
        aSep.push("");

      if (nNoSort == 1)
        aWord.reverse();
      else if (nNoSort > 1)
        NoSort(aWord);
      else
        aWord.sort(CompareValue);

      aTxt[i] = aSep[0];

      for (n = 0; n < aWord.length; ++n)
        aTxt[i] += aWord[n] + aSep[n + 1];
    }
  }

  pText = aTxt.join("\r");

  if (bCopyToCB)
    AkelPad.SetClipboardText(pText);
  else
    AkelPad.ReplaceSel(pText, 1);

  AkelPad.MemFree(lpStrA);
  AkelPad.MemFree(lpStrB);

  return (! bCopyToCB);
}

function CompareValue(ValA, ValB)
{
  var nResult = 0;

  if (nMethod == 1)
  {
    if (bIgCase)
    {
      if (ValA.toUpperCase() > ValB.toUpperCase())
        nResult = bDesc ? -1 : 1;
      else if (ValA.toUpperCase() < ValB.toUpperCase())
        nResult = bDesc ? 1 : -1;
    }
    else
    {
      if (ValA > ValB)
        nResult = bDesc ? -1 : 1;
      else if (ValA < ValB)
        nResult = bDesc ? 1 : -1;
    }
  }
  else if (nMethod == 2)
  {
    AkelPad.MemCopy(lpStrA, ValA, _TSTR);
    AkelPad.MemCopy(lpStrB, ValB, _TSTR);
    nResult = oSys.Call("kernel32::lstrcmp" + (bIgCase ? "i" : "") + _TCHAR, lpStrA, lpStrB);
    if (bDesc)
      nResult = -nResult;
  }
  else
  {
    var rNumber = /(-?\d+\.?\d*)|(-?\.\d+)/;
    ValA    = rNumber.exec(ValA);
    ValB    = rNumber.exec(ValB);
    ValA    = ValA ? parseFloat(ValA[0]) : 0;
    ValB    = ValB ? parseFloat(ValB[0]) : 0;
    nResult = bDesc ? (ValB - ValA) : (ValA - ValB);
  }

  return nResult;
}

function NoSort(aWord)
{
  var i, n, bIsDup;

  if (nNoSort == 2)
  {
    for (n = 0; n < aWord.length; ++n)
    {
      for (i = n + 1; i < aWord.length; ++i)
      {
        if (CompareValue(aWord[i], aWord[n]) == 0)
          aWord[i] = "";
      }
    }
  }
  else if (nNoSort == 3)
  {
    for (n = 0; n < aWord.length; ++n)
    {
      bIsDup = false;
      for (i = 0; i < aWord.length; ++i)
      {
        if ((CompareValue(aWord[i], aWord[n]) == 0) && (i != n))
        {
          bIsDup = true;
          break;
        }
      }
      if (! bIsDup)
        aWord[n] = "";
    }
  }
  else
  {
    for (n = 0; n < aWord.length; ++n)
    {
      bIsDup = false;
      for (i = n + 1; i < aWord.length; ++i)
      {
        if (CompareValue(aWord[i], aWord[n]) == 0)
        {
          bIsDup = true;
          aWord[i] = "";
        }
      }
      if (bIsDup)
        aWord[n] = "";
    }
  }
}
