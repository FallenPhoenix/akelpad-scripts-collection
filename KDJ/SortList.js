// Sort list by using Format plugin - 2011-03-07
//
// Call("Scripts::Main", 1, "SortList.js")
//
// Note:
// In each line, sorts separately.
// If you do not specify a separator, it will be sorted single characters.
// Shortcut keys in dialog box:
// Enter - Sort
// Esc   - Close
// Shift+Alt+ Right, Left, Down, Up, End, Home, PgDn, PgUp - move dialog box.

var oSys = AkelPad.SystemFunction();

if (oSys.Call("kernel32::GetUserDefaultLangID") == 0x0415) //Polish
{
  var pTxtCaption  = "Sortowanie list w wierszach";
  var pTxtSep      = "Separator:";
  var pTxtTab      = "\\t = Tabulacja";
  var pTxtSortMet  = "Metoda sortowania";
  var pTxtDesc     = "&Malejąco";
  var pTxtIgCase   = "&Ignoruj wlk. liter";
  var pTxtString   = "&String";
  var pTxtNum      = "&Numerycznie";
  var pTxtNoSort   = "Nie sortuj, ale";
  var pTxtReverse  = "&Odwróć kolejność elementów";
  var pTxtRemoDup  = "&Usuń duplikaty elementów";
  var pTxtExtrDup  = "&Zachowaj tylko powielone elementy";
  var pTxtExtrUni  = "Zac&howaj tylko unikalne elementy";
  var pTxtCopyToCB = "Wynik kopiuj do schowka, nie zmieniaj &tekstu";
  var pTxtSort     = "Sortuj";
  var pTxtUndo     = "&Cofnij";
  var pTxtRedo     = "&Powtórz";
  var pTxtNoSep    = "Zaznaczony tekst nie zawiera separatora.";
}
else
{
  var pTxtCaption  = "Sort lists in lines";
  var pTxtSep      = "Separator:";
  var pTxtTab      = "\\t = Tabulation";
  var pTxtSortMet  = "Sort method";
  var pTxtDesc     = "&Descending";
  var pTxtIgCase   = "&Ignore case";
  var pTxtString   = "&String";
  var pTxtNum      = "&Numerically";
  var pTxtNoSort   = "No sort, but";
  var pTxtReverse  = "Reverse &order of elements";
  var pTxtRemoDup  = "Re&move duplicate elements";
  var pTxtExtrDup  = "E&xtract duplicate elements";
  var pTxtExtrUni  = "Extra&ct unique elements";
  var pTxtCopyToCB = "Resul&t copy to clipboard, do not replace text";
  var pTxtSort     = "Sort";
  var pTxtUndo     = "&Undo";
  var pTxtRedo     = "&Redo";
  var pTxtNoSep    = "Selected text not contain separator.";
}

var DT_DWORD    = 3;
var BM_SETCHECK = 241;

var hMainWnd     = AkelPad.GetMainWnd();
var hEditWnd     = AkelPad.GetEditWnd();
var hGuiFont     = oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
var pScriptName  = WScript.ScriptName;
var hInstanceDLL = AkelPad.GetInstanceDll();

var pSep       = ";";
var bTab       = 1;
var bDesc      = 0;
var bIgCase    = 1;
var nMethod    = 1;
var nNoSort    = 0;
var bCopyToCB  = 0;
var nUndoLimit = 0;
var nRedoLimit = 0;
var hWndDlg;
var lpBuffer;
var bIsReturn;
var hFocus;
var nWndPosX;
var nWndPosY;

ReadWriteIni(0);

var lpWnd      = [];
var IDGROUP1   = 1000;
var IDSTATSEP  = 1001;
var IDSEP      = 1002;
var IDTAB      = 1003;
var IDGROUP2   = 1004;
var IDDESC     = 1005;
var IDIGCASE   = 1006;
var IDGROUP3   = 1007;
var IDSTRING   = 1008;
var IDNUM      = 1009;
var IDGROUP4   = 1010;
var IDREVERSE  = 1011;
var IDREMODUP  = 1012;
var IDEXTRDUP  = 1013;
var IDEXTRUNI  = 1014;
var IDCOPYTOCB = 1015;
var IDSORT     = 1016;
var IDUNDO     = 1017;
var IDREDO     = 1018;

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
//0x50010080 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_AUTOHSCROLL
//Windows             WNDTYPE, WND,WNDEXSTY,     WNDSTY,WNDX,WNDY,WNDW,WNDH, WNDTXT
lpWnd[IDGROUP1  ] = ["BUTTON",   0,       0, 0x50000007,  10,  10, 170,  75, ""];
lpWnd[IDSTATSEP ] = ["STATIC",   0,       0, 0x50000000,  20,  30,  60,  13, pTxtSep];
lpWnd[IDSEP     ] = ["EDIT",     0,   0x200, 0x50010080,  80,  30,  90,  20, pSep];
lpWnd[IDTAB     ] = ["BUTTON",   0,       0, 0x50010003,  80,  60,  90,  16, pTxtTab];
lpWnd[IDGROUP2  ] = ["BUTTON",   0,       0, 0x50000007,  10,  95, 260,  65, pTxtSortMet];
lpWnd[IDDESC    ] = ["BUTTON",   0,       0, 0x50010003,  40, 115,  90,  16, pTxtDesc];
lpWnd[IDIGCASE  ] = ["BUTTON",   0,       0, 0x50010003,  40, 135,  90,  16, pTxtIgCase];
lpWnd[IDGROUP3  ] = ["BUTTON",   0,       0, 0x50000007, 150,  95, 120,  65, ""];
lpWnd[IDSTRING  ] = ["BUTTON",   0,       0, 0x50000009, 175, 115,  90,  16, pTxtString];
lpWnd[IDNUM     ] = ["BUTTON",   0,       0, 0x50000009, 175, 135,  90,  16, pTxtNum];
lpWnd[IDGROUP4  ] = ["BUTTON",   0,       0, 0x50000007,  10, 170, 260, 105, pTxtNoSort];
lpWnd[IDREVERSE ] = ["BUTTON",   0,       0, 0x50010003,  60, 190, 200,  16, pTxtReverse];
lpWnd[IDREMODUP ] = ["BUTTON",   0,       0, 0x50010003,  60, 210, 200,  16, pTxtRemoDup];
lpWnd[IDEXTRDUP ] = ["BUTTON",   0,       0, 0x50010003,  60, 230, 200,  16, pTxtExtrDup];
lpWnd[IDEXTRUNI ] = ["BUTTON",   0,       0, 0x50010003,  60, 250, 200,  16, pTxtExtrUni];
lpWnd[IDCOPYTOCB] = ["BUTTON",   0,       0, 0x50010003,  20, 285, 240,  16, pTxtCopyToCB];
lpWnd[IDSORT    ] = ["BUTTON",   0,       0, 0x50010000, 190,  14,  80,  23, pTxtSort];
lpWnd[IDUNDO    ] = ["BUTTON",   0,       0, 0x50010000, 190,  39,  80,  23, pTxtUndo];
lpWnd[IDREDO    ] = ["BUTTON",   0,       0, 0x50010000, 190,  64,  80,  23, pTxtRedo];

if (hEditWnd)
{
  AkelPad.SendMessage(hEditWnd, 3128 /*AEM_UPDATESEL*/, 0 /*AESELT_COLUMNOFF*/, 0);
  if (AkelPad.GetSelStart() == AkelPad.GetSelEnd())
    AkelPad.SetSel(0, -1);

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
                          285,             //nWidth
                          340,             //nHeight
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
    AkelPad.SendMessage(lpWnd[IDSEP][WND], 197 /*EM_LIMITTEXT*/, 20, 0);

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
  {
    oSys.Call("user32::SetFocus", lpWnd[IDSEP][WND]);
    AkelPad.SendMessage(lpWnd[IDSEP][WND], 177 /*EM_SETSEL*/, 0, -1);
  }

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

    if ((nLowParam >= IDTAB) && (nLowParam <= IDCOPYTOCB))
    {
      CheckButtons(nLowParam);
    }

    else if (nLowParam == IDSORT)
    {
      if (SortList())
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

    pTxt = 'nWndPosX='  + rcWnd.left + ';\r\n' +
           'nWndPosY='  + rcWnd.top  + ';\r\n' +
           'pSep="'     + pSep.replace(/[\\"]/g, "\\$&") + '";\r\n' +
           'bTab='      + bTab + ';\r\n' +
           'bDesc='     + bDesc + ';\r\n' +
           'bIgCase='   + bIgCase + ';\r\n' +
           'nMethod='   + nMethod + ';\r\n' +
           'nNoSort='   + nNoSort + ';\r\n' +
           'bCopyToCB=' + bCopyToCB + ';'

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
  if (nButton == IDTAB)
    bTab = ! bTab;
  else if (nButton == IDDESC)
    bDesc = ! bDesc;
  else if (nButton == IDIGCASE)
    bIgCase = ! bIgCase;
  else if ((nButton == IDSTRING) || (nButton == IDNUM))
    nMethod = nButton - IDSTRING + 1;
  else if ((nButton == IDREVERSE) || (nButton == IDREMODUP) ||
           (nButton == IDEXTRDUP) || (nButton == IDEXTRUNI))
  {
    if (nNoSort == nButton - IDREVERSE + 1)
      nNoSort = 0;
    else
      nNoSort = nButton - IDREVERSE + 1;
  }
  else if (nButton == IDCOPYTOCB)
    bCopyToCB = ! bCopyToCB;

  if (nNoSort > 1)
    nMethod = 1;

  AkelPad.SendMessage(lpWnd[IDTAB][WND],      BM_SETCHECK, bTab,           0);
  AkelPad.SendMessage(lpWnd[IDDESC][WND],     BM_SETCHECK, bDesc,          0);
  AkelPad.SendMessage(lpWnd[IDIGCASE][WND],   BM_SETCHECK, bIgCase,        0);
  AkelPad.SendMessage(lpWnd[IDSTRING][WND],   BM_SETCHECK, (nMethod == 1), 0);
  AkelPad.SendMessage(lpWnd[IDNUM][WND],      BM_SETCHECK, (nMethod == 2), 0);
  AkelPad.SendMessage(lpWnd[IDREVERSE][WND],  BM_SETCHECK, (nNoSort == 1), 0);
  AkelPad.SendMessage(lpWnd[IDREMODUP][WND],  BM_SETCHECK, (nNoSort == 2), 0);
  AkelPad.SendMessage(lpWnd[IDEXTRDUP][WND],  BM_SETCHECK, (nNoSort == 3), 0);
  AkelPad.SendMessage(lpWnd[IDEXTRUNI][WND],  BM_SETCHECK, (nNoSort == 4), 0);
  AkelPad.SendMessage(lpWnd[IDCOPYTOCB][WND], BM_SETCHECK, bCopyToCB,      0);

  oSys.Call("user32::EnableWindow", lpWnd[IDDESC][WND],   (nNoSort == 0));
  oSys.Call("user32::EnableWindow", lpWnd[IDIGCASE][WND], (nNoSort != 1));
  oSys.Call("user32::EnableWindow", lpWnd[IDSTRING][WND], (nNoSort != 1));
  oSys.Call("user32::EnableWindow", lpWnd[IDNUM][WND],    (nNoSort == 0));
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
    oSys.Call("user32::SetFocus", lpWnd[IDSEP][WND]);

  SetWindowFontAndText(lpWnd[IDUNDO][WND], hGuiFont, pTxtUndo);
  SetWindowFontAndText(lpWnd[IDREDO][WND], hGuiFont, pTxtRedo);

  oSys.Call("user32::EnableWindow", lpWnd[IDUNDO][WND], nUndoLimit);
  oSys.Call("user32::EnableWindow", lpWnd[IDREDO][WND], nRedoLimit);
}

function SortList()
{
  var nBegSel  = AkelPad.GetSelStart();
  var nEndSel  = AkelPad.GetSelEnd();
  var pText    = AkelPad.GetSelText();
  var nLine1   = AkelPad.SendMessage(hEditWnd, 1078 /*EM_EXLINEFROMCHAR*/, 0, nBegSel);
  var nLine2   = AkelPad.SendMessage(hEditWnd, 1078 /*EM_EXLINEFROMCHAR*/, 0, nEndSel);
  var nBegLen  = TextLen();
  var nBegLine;
  var nEndLine;
  var bSepEnd;
  var reSep;
  var reSep_g;
  var reSepEnd;
  var i;

  oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDSEP][WND], lpBuffer, 256);
  pSep = AkelPad.MemRead(lpBuffer, _TSTR);

  if (bTab) pSep = pSep.replace(/\\t/g, "\t");

  reSep    = new RegExp(escapeRegExp(pSep));
  reSep_g  = new RegExp(escapeRegExp(pSep), "g");
  reSepEnd = new RegExp(escapeRegExp(pSep) + "$");

  if (! reSep.test(pText))
  {
    AkelPad.MessageBox(hWndDlg, pTxtNoSep, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
    return 0;
  }

  SetRedraw(hEditWnd, false);
  AkelPad.SendMessage(hEditWnd, 3080 /*AEM_STOPGROUPTYPING*/, 0, 0);
  AkelPad.SendMessage(hEditWnd, 3081 /*AEM_BEGINUNDOACTION*/, 0, 0);
  AkelPad.ReplaceSel(pText, 1);

  for (i = nLine1; i <= nLine2; ++i)
  {
    if (nLine1 < nLine2)
    {
       nBegLine = AkelPad.SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/, i, 0);
       nEndLine = AkelPad.SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/, i, 0) +
                    AkelPad.SendMessage(hEditWnd, 193 /*EM_LINELENGTH*/, nBegLine, 0);
      if (i == nLine1)
        AkelPad.SetSel(nBegSel, nEndLine);
      else if (i == nLine2)
        AkelPad.SetSel(nBegLine, nEndSel - nBegLen + TextLen());
      else
        AkelPad.SetSel(nBegLine, nEndLine);

      pText = AkelPad.GetSelText();
    }

    if (reSep.test(pText))
    {
      bSepEnd = reSepEnd.test(pText);
      pText   = pText.replace(reSep_g, "\r");
      AkelPad.ReplaceSel("\r" + pText + "\r", 1);
      AkelPad.SetSel(AkelPad.GetSelStart() + 1, AkelPad.GetSelEnd() - 1);
      SortByPlugin();
      pText = AkelPad.GetTextRange(AkelPad.GetSelStart(), AkelPad.GetSelEnd() - 1 + bSepEnd).replace(/\r/g, pSep);
      AkelPad.SetSel(AkelPad.GetSelStart() - 1, AkelPad.GetSelEnd() + bSepEnd);
      AkelPad.ReplaceSel(pText, 1);
    }
  }

  AkelPad.SetSel(nBegSel, AkelPad.GetSelEnd());
  AkelPad.SendMessage(hEditWnd, 3082 /*AEM_ENDUNDOACTION*/, 0, 0);
  AkelPad.SendMessage(hEditWnd, 3080 /*AEM_STOPGROUPTYPING*/, 0, 0);

  if (bCopyToCB)
  {
    AkelPad.SetClipboardText(AkelPad.GetSelText());
    AkelPad.SendMessage(hEditWnd, 3077 /*AEM_UNDO*/, 0, 0);
  }

  SetRedraw(hEditWnd, true);
  return ! bCopyToCB;
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
  else if (nMethod == 2)
    AkelPad.Call("Format::LineSortInt" + pAscDesc, ! bIgCase);
}

function escapeRegExp(str)
{
  return str.replace(/[\\\/.^$+*?|()\[\]{}]/g, "\\$&");
}

function SetRedraw(hWnd, bRedraw)
{
  var oSys = AkelPad.SystemFunction();
  AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
  bRedraw && oSys.Call("user32::InvalidateRect", hWnd, 0, true);
}

function TextLen()
{
  var nOffset = -1;
  var lpIndex;

  if (lpIndex = AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/))
  {
    AkelPad.SendMessage(hEditWnd, 3130 /*AEM_GETINDEX*/, 2 /*AEGI_LASTCHAR*/, lpIndex);
    nOffset = AkelPad.SendMessage(hEditWnd, 3136 /*AEM_INDEXTORICHOFFSET*/, 0, lpIndex);
    AkelPad.MemFree(lpIndex);
  }
  return nOffset;
}
