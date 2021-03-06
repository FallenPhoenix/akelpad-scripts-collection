// Sum numbers (expressions) in selected column - 2011-03-08
//
// Call("Scripts::Main", 1, "ColumnsSum.js")
// Can assign shortcut key, eg: Shift+Alt+S
// Dialog box can be moved using keys: Shift+Alt+C, Right, Left, Down, Up, End, Home, PgDown, PgUp.

var oSys = AkelPad.SystemFunction();

if (oSys.Call("kernel32::GetUserDefaultLangID") == 0x0415) //Polish
{
  var pTxtCaption   = "Sumowanie w kolumnie";
  var pTxtNoColSel  = "Brak zaznaczenia pionowego.";
  var pTxtBadSep    = "Separator nie moe być literą ani cyfrą.";
  var pTxtEqualSep  = "Separatory nie mogą być takie same.";
  var pTxtBadRound  = "Zaokrąglenie musi być liczbą z zakresu od -9 do 20.";
  var pTxtSum       = "Suma:";
  var pTxtMin       = "Minimum:";
  var pTxtMax       = "Maksimum:";
  var pTxtAve       = "Średnia:";
  var pTxtCountA    = "Licznik razem:";
  var pTxtCountN    = "- liczby:";
  var pTxtCountT    = "- tekst:";
  var pTxtCountE    = "- puste:";
  var pTxtOptions   = "Opcje";
  var pTxtDecSep    = "Separator dziesiętny:";
  var pTxtGroSep    = "Separator tysięcy:";
  var pTxtRound     = "Zaokrąglij do:";
  var pTxtTextAs0   = "Traktuj tekst jak liczbę 0";
  var pTxtEmptyAs0  = "Traktuj puste jak liczbę 0";
  var pTxtCalculate = "Sumuj";
  var pTxtClose     = "Zamknij";
}
else
{
  var pTxtCaption   = "Sum in the column";
  var pTxtNoColSel  = "There is no columnar selection.";
  var pTxtBadSep    = "Separator can not be letter or digit.";
  var pTxtEqualSep  = "Separators can not be the same.";
  var pTxtBadRound  = "Round must be a number in the range from -9 to 20.";
  var pTxtSum       = "Sum:";
  var pTxtMin       = "Minimum:";
  var pTxtMax       = "Maximum:";
  var pTxtAve       = "Average:";
  var pTxtCountA    = "Count all:";
  var pTxtCountN    = "- numbers:";
  var pTxtCountT    = "- text:";
  var pTxtCountE    = "- empty:";
  var pTxtOptions   = "Options";
  var pTxtDecSep    = "Decimal separator:";
  var pTxtGroSep    = "Group separator:";
  var pTxtRound     = "Round to:";
  var pTxtTextAs0   = "Treat text as a zero";
  var pTxtEmptyAs0  = "Treat empty as a zero";
  var pTxtCalculate = "Calculate";
  var pTxtClose     = "Close";
}

var DT_DWORD = 3;

var hMainWnd     = AkelPad.GetMainWnd();
var hEditWnd     = AkelPad.GetEditWnd();
var hGuiFont     = oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
var pScriptName  = WScript.ScriptName;
var hInstanceDLL = AkelPad.GetInstanceDll();
var bColSel      = AkelPad.SendMessage(hEditWnd, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0);

var pDecSep   = ".";
var pGroSep   = "";
var pRound    = "2";
var bTextAs0  = 0;
var bEmptyAs0 = 0;
var pSum;
var pMin;
var pMax;
var pAve;
var pCountA;
var pCountN;
var pCountE;
var pCountT;
var hWndDlg;
var lpBuffer;
var nWndPosX;
var nWndPosY;

ReadWriteIni(0);

var lpWnd       = [];
var IDRESULT    = 1000;
var IDTXTSUM    = 1001;
var IDTXTMIN    = 1002;
var IDTXTMAX    = 1003;
var IDTXTAVE    = 1004;
var IDTXTCOUNTA = 1005;
var IDTXTCOUNTN = 1006;
var IDTXTCOUNTT = 1007;
var IDTXTCOUNTE = 1008;
var IDSUM       = 1009;
var IDMIN       = 1010;
var IDMAX       = 1011;
var IDAVE       = 1012;
var IDCOUNTA    = 1013;
var IDCOUNTN    = 1014;
var IDCOUNTT    = 1015;
var IDCOUNTE    = 1016;
var IDOPTIONS   = 1017;
var IDTXTDECSEP = 1018;
var IDTXTGROSEP = 1019;
var IDTXTROUND  = 1020;
var IDDECSEP    = 1021;
var IDGROSEP    = 1022;
var IDROUND     = 1023;
var IDTEXTAS0   = 1024;
var IDEMPTYAS0  = 1025;
var IDCALCULATE = 1026;
var IDCLOSE     = 1027;

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
//0x50010001 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_DEFPUSHBUTTON
//0x50010003 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
//0x50010080 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_AUTOHSCROLL
//0x50010880 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_AUTOHSCROLL|ES_READONLY
//Windows              WNDTYPE, WND,WNDEXSTY,     WNDSTY,WNDX,WNDY,WNDW,WNDH, WNDTXT
lpWnd[IDRESULT   ] = ["BUTTON",   0,       0, 0x50000007,  10,   5, 200, 220, ""];
lpWnd[IDTXTSUM   ] = ["STATIC",   0,       0, 0x50000000,  20,  20, 100,  13, pTxtSum];
lpWnd[IDTXTMIN   ] = ["STATIC",   0,       0, 0x50000000,  20,  45, 100,  13, pTxtMin];
lpWnd[IDTXTMAX   ] = ["STATIC",   0,       0, 0x50000000,  20,  70, 100,  13, pTxtMax];
lpWnd[IDTXTAVE   ] = ["STATIC",   0,       0, 0x50000000,  20,  95, 100,  13, pTxtAve];
lpWnd[IDTXTCOUNTA] = ["STATIC",   0,       0, 0x50000000,  20, 120, 100,  13, pTxtCountA];
lpWnd[IDTXTCOUNTN] = ["STATIC",   0,       0, 0x50000000,  40, 145, 100,  13, pTxtCountN];
lpWnd[IDTXTCOUNTT] = ["STATIC",   0,       0, 0x50000000,  40, 170, 100,  13, pTxtCountT];
lpWnd[IDTXTCOUNTE] = ["STATIC",   0,       0, 0x50000000,  40, 195, 100,  13, pTxtCountE];
lpWnd[IDSUM      ] = ["EDIT",     0,   0x200, 0x50010880,  90,  20, 110,  20, ""];
lpWnd[IDMIN      ] = ["EDIT",     0,   0x200, 0x50010880,  90,  45, 110,  20, ""];
lpWnd[IDMAX      ] = ["EDIT",     0,   0x200, 0x50010880,  90,  70, 110,  20, ""];
lpWnd[IDAVE      ] = ["EDIT",     0,   0x200, 0x50010880,  90,  95, 110,  20, ""];
lpWnd[IDCOUNTA   ] = ["EDIT",     0,   0x200, 0x50010880,  90, 120,  80,  20, ""];
lpWnd[IDCOUNTN   ] = ["EDIT",     0,   0x200, 0x50010880, 100, 145,  80,  20, ""];
lpWnd[IDCOUNTT   ] = ["EDIT",     0,   0x200, 0x50010880, 100, 170,  80,  20, ""];
lpWnd[IDCOUNTE   ] = ["EDIT",     0,   0x200, 0x50010880, 100, 195,  80,  20, ""];
lpWnd[IDOPTIONS  ] = ["BUTTON",   0,       0, 0x50000007, 220,  30, 153, 165, pTxtOptions];
lpWnd[IDTXTDECSEP] = ["STATIC",   0,       0, 0x50000000, 230,  50, 100,  13, pTxtDecSep];
lpWnd[IDTXTGROSEP] = ["STATIC",   0,       0, 0x50000000, 230,  75, 100,  13, pTxtGroSep];
lpWnd[IDTXTROUND ] = ["STATIC",   0,       0, 0x50000000, 230, 100, 100,  13, pTxtRound];
lpWnd[IDDECSEP   ] = ["EDIT",     0,   0x200, 0x50010080, 342,  50,  20,  20, pDecSep];
lpWnd[IDGROSEP   ] = ["EDIT",     0,   0x200, 0x50010080, 342,  75,  20,  20, pGroSep];
lpWnd[IDROUND    ] = ["EDIT",     0,   0x200, 0x50010080, 342, 100,  20,  20, pRound];
lpWnd[IDTEXTAS0  ] = ["BUTTON",   0,       0, 0x50010003, 230, 145, 140,  16, pTxtTextAs0];
lpWnd[IDEMPTYAS0 ] = ["BUTTON",   0,       0, 0x50010003, 230, 170, 140,  16, pTxtEmptyAs0];
lpWnd[IDCALCULATE] = ["BUTTON",   0,       0, 0x50010001, 220, 205,  70,  23, pTxtCalculate];
lpWnd[IDCLOSE    ] = ["BUTTON",   0,       0, 0x50010000, 305, 205,  70,  23, pTxtClose];


if (hEditWnd)
{
  if (! bColSel)
  {
    AkelPad.MessageBox(hEditWnd, pTxtNoColSel, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
    WScript.Quit();
  }

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
                          390,             //nWidth
                          268,             //nHeight
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

    //Check
    if (bTextAs0)
      AkelPad.SendMessage(lpWnd[IDTEXTAS0][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    if (bEmptyAs0)
      AkelPad.SendMessage(lpWnd[IDEMPTYAS0][WND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);

    //Set limit edit text
    AkelPad.SendMessage(lpWnd[IDDECSEP][WND], 197 /*EM_LIMITTEXT*/, 1, 0);
    AkelPad.SendMessage(lpWnd[IDGROSEP][WND], 197 /*EM_LIMITTEXT*/, 1, 0);
    AkelPad.SendMessage(lpWnd[IDROUND][WND],  197 /*EM_LIMITTEXT*/, 2, 0);

    Calculate();

    //Select text
    AkelPad.SendMessage(lpWnd[IDSUM][WND], 177 /*EM_SETSEL*/, 0, -1);

    //Set window position
    if ((nWndPosX == undefined) || (nWndPosY == undefined))
      MoveWindow(hMainWnd, hWnd, "RT");
    else
      MoveWindow(hMainWnd, hWnd, [nWndPosX, nWndPosY]);
  }

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("user32::SetFocus", lpWnd[IDSUM][WND]);

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (wParam == 13)  //VK_RETURN
      oSys.Call("user32::PostMessage" + _TCHAR, hWndDlg, 273 /*WM_COMMAND*/, IDCALCULATE, 0);
    else if (wParam == 27)  //VK_ESCAPE
      oSys.Call("user32::PostMessage" + _TCHAR, hWndDlg, 273 /*WM_COMMAND*/, IDCLOSE, 0);
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

  else if (uMsg == 273) //WM_COMMAND
  {
    nLowParam = LoWord(wParam);

    if (nLowParam == IDTEXTAS0)
      bTextAs0 = AkelPad.SendMessage(lpWnd[IDTEXTAS0][WND],  240 /*BM_GETCHECK*/, 0, 0);

    else if (nLowParam == IDEMPTYAS0)
      bEmptyAs0 = AkelPad.SendMessage(lpWnd[IDEMPTYAS0][WND], 240 /*BM_GETCHECK*/, 0, 0);

    else if (nLowParam == IDCALCULATE)
    {
      //pDecSep
      oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDDECSEP][WND], lpBuffer, 256);
      pDecSep = AkelPad.MemRead(lpBuffer, _TSTR);
      if (! pDecSep)
      {
        pDecSep = ".";
        SetWindowFontAndText(lpWnd[IDDECSEP][WND], hGuiFont, pDecSep);
      }

      //pGroSep
      oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDGROSEP][WND], lpBuffer, 256);
      pGroSep = AkelPad.MemRead(lpBuffer, _TSTR);

      //pRound
      oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDROUND][WND], lpBuffer, 256);
      pRound = AkelPad.MemRead(lpBuffer, _TSTR);

      if (/[0-9a-zA-Z]/.test(pDecSep))
      {
        AkelPad.MessageBox(hWnd, pTxtBadSep, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
        oSys.Call("user32::SetFocus", lpWnd[IDDECSEP][WND]);
      }
      else if (/[0-9a-zA-Z]/.test(pGroSep))
      {
        AkelPad.MessageBox(hWnd, pTxtBadSep, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
        oSys.Call("user32::SetFocus", lpWnd[IDGROSEP][WND]);
      }
      else if (pDecSep && (pDecSep == pGroSep))
      {
        AkelPad.MessageBox(hWnd, pTxtEqualSep, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
        oSys.Call("user32::SetFocus", lpWnd[IDDECSEP][WND]);
      }
      else if (pRound && (isNaN(pRound) || (pRound > 20)))
      {
        AkelPad.MessageBox(hWnd, pTxtBadRound, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
        oSys.Call("user32::SetFocus", lpWnd[IDROUND][WND]);
      }
      else
        Calculate();
    }

    else if (nLowParam == IDCLOSE)
      oSys.Call("user32::PostMessage" + _TCHAR, hWndDlg, 16 /*WM_CLOSE*/, 0, 0);

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
  {
    if (oSys.Call("user32::GetFocus") != lpWnd[IDCLOSE][WND])
      oSys.Call("user32::DefDlgProc" + _TCHAR, hWnd, 1025 /*DM_SETDEFID*/, IDCALCULATE, 0);
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

    oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDDECSEP][WND], lpBuffer, 256);
    pDecSep = AkelPad.MemRead(lpBuffer, _TSTR);
    oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDGROSEP][WND], lpBuffer, 256);
    pGroSep = AkelPad.MemRead(lpBuffer, _TSTR);
    oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDROUND][WND], lpBuffer, 256);
    pRound = AkelPad.MemRead(lpBuffer, _TSTR);

    pTxt = 'nWndPosX='  + rcWnd.left + ';\r\n' +
           'nWndPosY='  + rcWnd.top  + ';\r\n' +
           'pDecSep="'  + pDecSep.replace(/[\\"]/g, "\\$&") + '";\r\n' + 
           'pGroSep="'  + pGroSep.replace(/[\\"]/g, "\\$&") + '";\r\n' +
           'pRound="'   + pRound    + '";\r\n' +
           'bTextAs0='  + bTextAs0  + ';\r\n' + 
           'bEmptyAs0=' + bEmptyAs0 + ';';

    oFile = oFSO.OpenTextFile(pIniName, 2, true, 0);
    oFile.Write(pTxt);
    oFile.Close();
  }

  else if ((! bWrite) && (oFSO.FileExists(pIniName)))
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

function Calculate()
{
  var pSelTxt   = AkelPad.GetSelText(1 /*\r*/);
  var nCountN   = 0;
  var nCountE   = 0;
  var nCountT   = 0;
  var nSum      = 0;
  var nMin      = "";
  var nMax      = "";
  var nAve      = "";
  var nNum;
  var oPattern;
  var lpTxt;
  var nCountA;
  var nCount;
  var nRound;
  var nError;
  var i;

  if (pGroSep)
  {
    oPattern = new RegExp("\\" + pGroSep, "gm");
    pSelTxt  = pSelTxt.replace(oPattern, "");
  }

  oPattern = new RegExp("\\" + pDecSep, "gm");
  pSelTxt  = pSelTxt.replace(oPattern, ".");

  lpTxt   = pSelTxt.split("\r");
  nCountA = lpTxt.length;

  for (i = 0; i < nCountA; ++i)
  {
    if (/[^ \t]/.test(lpTxt[i])) /*no empty*/
    {
      try
      {
        with (Math)
        {
          nNum = eval(lpTxt[i]);
          if (isFinite(nNum))
          {
            ++ nCountN;
            if (nMin === "")
            {
              nMin = nNum;
              nMax = nNum;
            }
            else if (nNum < nMin)
              nMin = nNum;
            else if (nNum > nMax)
              nMax = nNum;
          }
          else
          {
            ++ nCountT;
            nNum = 0;
            if (bTextAs0)
            {
              if (nMin === "")
              {
                nMin = nNum;
                nMax = nNum;
              }
              else if (nNum < nMin)
                nMin = nNum;
              else if (nNum > nMax)
                nMax = nNum;
            }
          }
        }
      }
      catch (nError)
      {
        ++ nCountT;
        nNum = 0;
        if (bTextAs0)
        {
          if (nMin === "")
          {
            nMin = nNum;
            nMax = nNum;
          }
          else if (nNum < nMin)
            nMin = nNum;
          else if (nNum > nMax)
            nMax = nNum;
        }
      }
    }
    else
    {
      ++ nCountE;
      nNum = 0;
      if (bEmptyAs0)
      {
        if (nMin === "")
        {
          nMin = nNum;
          nMax = nNum;
        }
        else if (nNum < nMin)
          nMin = nNum;
        else if (nNum > nMax)
          nMax = nNum;
      }
    }
    nSum += nNum;
  }

  if ((nCountN == 0) && (! bTextAs0) && (! bEmptyAs0))
    nSum = "";

  if (nSum !== "")
  {
    nCount = nCountN;
    if (bTextAs0)
      nCount += nCountT;
    if (bEmptyAs0)
      nCount += nCountE;

    nAve = nSum / nCount;
  }

  if ((nSum !== "") && (pRound))
  {
    nRound = parseInt(pRound);  
    nSum   = round2(nSum, nRound);
    nMin   = round2(nMin, nRound);
    nMax   = round2(nMax, nRound);
    nAve   = round2(nAve, nRound);

    if (nRound >= 0)
    {
      nSum = nSum.toFixed(nRound);
      nMin = nMin.toFixed(nRound);
      nMax = nMax.toFixed(nRound);
      nAve = nAve.toFixed(nRound);
    }
  }

  nSum    = nSum.toString().replace(".", pDecSep);
  nMin    = nMin.toString().replace(".", pDecSep);
  nMax    = nMax.toString().replace(".", pDecSep);
  nAve    = nAve.toString().replace(".", pDecSep);
  nCountA = nCountA.toString();
  nCountN = nCountN.toString();
  nCountT = nCountT.toString();
  nCountE = nCountE.toString();

  if (pGroSep)
  {
    nSum    = InsertGroSep(nSum,    pGroSep, pDecSep);
    nMin    = InsertGroSep(nMin,    pGroSep, pDecSep);
    nMax    = InsertGroSep(nMax,    pGroSep, pDecSep);
    nAve    = InsertGroSep(nAve,    pGroSep, pDecSep);
    nCountA = InsertGroSep(nCountA, pGroSep, pDecSep);
    nCountN = InsertGroSep(nCountN, pGroSep, pDecSep);
    nCountT = InsertGroSep(nCountT, pGroSep, pDecSep);
    nCountE = InsertGroSep(nCountE, pGroSep, pDecSep);
  }

  SetWindowFontAndText(lpWnd[IDSUM][WND],    hGuiFont, nSum);
  SetWindowFontAndText(lpWnd[IDMIN][WND],    hGuiFont, nMin);
  SetWindowFontAndText(lpWnd[IDMAX][WND],    hGuiFont, nMax);
  SetWindowFontAndText(lpWnd[IDAVE][WND],    hGuiFont, nAve);
  SetWindowFontAndText(lpWnd[IDCOUNTA][WND], hGuiFont, nCountA);
  SetWindowFontAndText(lpWnd[IDCOUNTN][WND], hGuiFont, nCountN);
  SetWindowFontAndText(lpWnd[IDCOUNTT][WND], hGuiFont, nCountT);
  SetWindowFontAndText(lpWnd[IDCOUNTE][WND], hGuiFont, nCountE);

  oSys.Call("user32::SetFocus", lpWnd[IDSUM][WND]);
}

function round2(nNum, nDec)
{
  return Math.round(nNum * Math.pow(10, nDec))/Math.pow(10, nDec);
}

function InsertGroSep(pNum, pGroSep, pDecSep)
{
  var nInd = pNum.indexOf(pDecSep);
  var pStr = "";
  var pNum1;
  var pNum2;
  var nInt;
  var nRest;
  var i;

  if (nInd == -1)
  {
    pNum1 = pNum;
    pNum2 = "";
  }
  else
  {
    pNum1 = pNum.substr(0, nInd);
    pNum2 = pNum.substr(nInd);
  }

  if (pNum1.length > 3)
  {
    nInt  = Math.floor(pNum1.length / 3);
    nRest = pNum1.length % 3;

    if (nRest > 0)
      pStr = pNum1.substr(0, nRest) + pGroSep;

    for (i = 0; i < nInt; ++i)
      pStr = pStr + pNum1.substr(nRest + i * 3, 3) + (i < nInt - 1 ? pGroSep : "");

    pNum1 = pStr;
  }

  return pNum1 + pNum2;
}
