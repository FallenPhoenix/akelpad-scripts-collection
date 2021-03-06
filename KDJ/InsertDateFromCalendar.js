// Inserts date/time from calendar - 2011-04-07
//
// Call("Scripts::Main", 1, "InsertDateFromCalendar.js")
//
// In calendar window, press F1 for help, or press O(S) for options-settings

var oSys = AkelPad.SystemFunction();

if (oSys.Call("kernel32::GetUserDefaultLangID") == 0x0415) //Polish
{
  var pHlpTxt = "	Klawisze skrótów dostępne w kalendarzu:\n" +
                " Left/Right		- poprzedni/następny dzień\n" +
                " Up/Down		- poprzedni/następny tydzień\n" +
                " PgUp/PgDn		- poprzedni/następny miesiąc\n" +
                " Ctrl+PgUp/Ctrl+PgDn	- poprzedni/następny rok\n" +
                " Home/End		- pierwszy/ostatni dzień miesiąca\n" +
                " Ctrl+Home/Ctrl+End	- pierwszy/ostatni widoczny dzień\n" +
                " BackSpace		- przejdź do dnia dzisiejszego\n" +
                "\n" +
                " Shift+Alt+Left/Right	- przesuń kalendarz w lewo/prawo\n" +
                " Shift+Alt+Up/Down	- przesuń kalendarz w górę/dół\n" +
                " Shift+Alt+Home/End	- przesuń do lewej/prawej krawędzi okna\n" +
                " Shift+Alt+PgUp/PgDn	- przesuń do górnej/dolnej krawędzi okna\n" +
                " Shift+Alt+C		- wyśrodkuj kalendarz\n" +
                "\n" +
                " +/-			- dodaj/usun miesiąc z kalendarza\n" +
                " O (S)			- opcje (ustawnienia)\n" +
                "\n" +
                " Enter\n" +
                " Shift+Enter\n" +
                " Ctrl+Enter\n" +
                " Ctrl+Shift+Enter		- wstaw datę/czas do tekstu (patrz opcje)";

  var pHlpTxtDF = " d	- dzień miesiąca, cyfry bez wiodącego zera\n" +
                  " dd	- dzień miesiąca, cyfry z wiodącym zerem\n" +
                  " ddd	- dzień tygodnia, trzy-literowy skrót\n" +
                  " dddd	- dzień tygodnia, pełna nazwa\n" +
                  " M	- miesiąc, cyfry bez wiodącego zera\n" +
                  " MM	- miesiąc, cyfry z wiodącym zerem\n" +
                  " MMM	- miesiąc, trzy-literowy skrót\n" +
                  " MMMM	- miesiąc, pełna nazwa\n" +
                  " y	- rok, dwie cyfry bez wiodącego zera\n" +
                  " yy	- rok, dwie cyfry z wiodącym zerem\n" +
                  " yyyy	- rok, cztery cyfry";

  var pHlpTxtTF = " h	- godziny bez wiodącego zera, zegar 12h\n" +
                  " hh	- godziny z wiodącym zerem, zegar 12h\n" +
                  " H	- godziny bez wiodącego zera, zegar 24h\n" +
                  " HH	- godziny z wiodącym zerem, zegar 24h\n" +
                  " m	- minuty bez wiodącego zera\n" +
                  " mm	- minuty z wiodącym zerem\n" +
                  " s	- sekundy bez wiodącego zera\n" +
                  " ss	- sekundy z wiodącym zerem\n" +
                  " t	- znacznik czasu jednoznakowy, (A/P)\n" +
                  " tt	- znacznik czasu wieloznakowy, (AM/PM)";

  var pTxtHelp     = "Pomoc";
  var pTxtSettings = "Opcje - ustawienia";
  var pTxtFormat   = "Wstaw - format daty/czasu";
  var pTxtSystem   = "System";
  var pTxtLongDate = "Data długa";
  var pTxtDateForm = "Format daty";
  var pTxtTimeForm = "Format czasu";
  var pTxtKeyAssig = "Wstaw - przydzielone klawisze";
  var pTxtDate     = "Data";
  var pTxtTime     = "Czas";
  var pTxtCalendar = "Kalendarz";
  var pTxtMonths   = "Liczba widocznych miesięcy";
  var pTxtColor1   = "Tło kalendarza";
  var pTxtColor2   = "Tekst dni miesiąca";
  var pTxtColor3   = "Tło nagłówka miesiąca";
  var pTxtColor4   = "Tekst nagłówka miesiąca";
  var pTxtColor5   = "Początkowe i końcowe dni";
  var pTxtReset    = "R\n" +
                     "e\n" +
                     "s\n" +
                     "e\n" +
                     "t";
}
else
{
  var pHlpTxt = "	Shortcut keys in calendar:\n" +
                " Left/Right		- previous/next day\n" +
                " Up/Down		- previous/next week\n" +
                " PgUp/PgDn		- previous/next month\n" +
                " Ctrl+PgUp/Ctrl+PgDn	- previous/next year\n" +
                " Home/End		- first/last day of month\n" +
                " Ctrl+Home/Ctrl+End	- first/last day visible in calendar\n" +
                " BackSpace		- go to today\n" +
                "\n" +
                " Shift+Alt+Left/Right	- move calendar left/right\n" +
                " Shift+Alt+Up/Down	- move calendar up/down\n" +
                " Shift+Alt+Home/End	- move to left/right window edge\n" +
                " Shift+Alt+PgUp/PgDn	- move to top/bottom window edge\n" +
                " Shift+Alt+C		- center calendar\n" +
                "\n" +
                " +/-			- add/remove month from calendar\n" +
                " O (S)			- options (settings)\n" +
                "\n" +
                " Enter\n" +
                " Shift+Enter\n" +
                " Ctrl+Enter\n" +
                " Ctrl+Shift+Enter		- insert date/time in text (see options)";

  var pHlpTxtDF = " d	- day of month, digits without leading zero\n" +
                  " dd	- day of month, digits with leading zero\n" +
                  " ddd	- day of week, three-letter abbreviation\n" +
                  " dddd	- day of week, full name\n" +
                  " M	- month, digits without leading zero\n" +
                  " MM	- month, digits with leading zero\n" +
                  " MMM	- month, three-letter abbreviation\n" +
                  " MMMM	- month, full name\n" +
                  " y	- year, two digits without leading zero\n" +
                  " yy	- year, two digits with leading zero\n" +
                  " yyyy	- year, four digits";

  var pHlpTxtTF = " h	- hours without leading zero, 12-hour clock\n" +
                  " hh	- hours with leading zero, 12-hour clock\n" +
                  " H	- hours without leading zero, 24-hour clock\n" +
                  " HH	- hours with leading zero, 24-hour clock\n" +
                  " m	- minutes without leading zero\n" +
                  " mm	- minutes with leading zero\n" +
                  " s	- seconds without leading zero\n" +
                  " ss	- seconds with leading zero\n" +
                  " t	- one char time-marker, such as A or P\n" +
                  " tt	- multichar time-marker, such as AM or PM";

  var pTxtHelp     = "Help";
  var pTxtSettings = "Options - settings";
  var pTxtFormat   = "Insert - date/time format";
  var pTxtSystem   = "System";
  var pTxtLongDate = "Long date";
  var pTxtDateForm = "Date format";
  var pTxtTimeForm = "Time format";
  var pTxtKeyAssig = "Insert - key assignment";
  var pTxtDate     = "Date";
  var pTxtTime     = "Time";
  var pTxtCalendar = "Calendar";
  var pTxtMonths   = "Count of visible months";
  var pTxtColor1   = "Background within a month";
  var pTxtColor2   = "Text within a month";
  var pTxtColor3   = "Background calendar title";
  var pTxtColor4   = "Text calendar title";
  var pTxtColor5   = "Header day and trailing day";
  var pTxtReset    = "R\n" +
                     "e\n" +
                     "s\n" +
                     "e\n" +
                     "t";
}

var DT_DWORD = 3;
var DT_WORD  = 4;

var hMainWnd     = AkelPad.GetMainWnd();
var hEditWnd     = AkelPad.GetEditWnd();
var hGuiFont     = oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
var hInstanceDLL = AkelPad.GetInstanceDll();
var pClassName   = "AkelPad::Scripts::" + WScript.ScriptName + "::" + hInstanceDLL;

var bSystem     = 1;
var bLongDate   = 0;
var pDateForm   = "yyyy-MM-dd";
var pTimeForm   = "HH:mm:ss";
var aKeyAssign  = [["Enter", 1], ["Shift+Enter", 0], ["Ctrl+Enter", 2], ["Ctrt+Shift+Enter", 3]];
var nMonthCount = 1;
var aColor;

ReadWriteIni(0);

var hWndDlgCal;
var hWndCal;
var lpBuffer;
var lpSysTime;
var hBrushColor;
var bResetColors;
var aWndCalPos;
var aWndSetPos;

var lpWnd        = [];
var IDFORMAT     = 1000;
var IDDATE       = 1001;
var IDTIME       = 1002;
var IDSYSTEM     = 1003;
var IDLONGDATE   = 1004;
var IDDF         = 1005;
var IDDFHLP      = 1006;
var IDDFDESCR    = 1007;
var IDTF         = 1008;
var IDTFHLP      = 1009;
var IDTFDESCR    = 1010;
var IDKEYASSIG   = 1011;
var IDASSIG0     = 1012;
var IDASSIG1     = 1013;
var IDASSIG2     = 1014;
var IDASSIG3     = 1015;
var IDENTER      = 1016;
var IDSHENTER    = 1017;
var IDCTENTER    = 1018;
var IDCTSHENTER  = 1019;
var IDCALENDAR   = 1020;
var IDMONTHCOUNT = 1021;
var IDMONTHDESCR = 1022;
var IDCOLOR1     = 1023;
var IDCOLOR2     = 1024;
var IDCOLOR3     = 1025;
var IDCOLOR4     = 1026;
var IDCOLOR5     = 1027;
var IDCOLOR1BUTT = 1028;
var IDCOLOR2BUTT = 1029;
var IDCOLOR3BUTT = 1030;
var IDCOLOR4BUTT = 1031;
var IDCOLOR5BUTT = 1032;
var IDRESET      = 1033;
var IDDFHLPTXT   = 1034;
var IDTFHLPTXT   = 1035;

var WNDTYPE  = 0;
var WND      = 1;
var WNDEXSTY = 2;
var WNDSTY   = 3;
var WNDX     = 4;
var WNDY     = 5;
var WNDW     = 6;
var WNDH     = 7;
var WNDTXT   = 8;

if (hEditWnd)
{
  if (AkelPad.WindowRegisterClass(pClassName))
  {
    if (lpBuffer = AkelPad.MemAlloc(256 * _TSIZE))
    {
      if (lpSysTime = AkelPad.MemAlloc(16))
      {
        do
        {
          //Create dialog
          hWndDlgCal = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                                 0,               //dwExStyle
                                 pClassName,      //lpClassName
                                 0,               //lpWindowName
                                 0x90000000,      //WS_VISIBLE|WS_POPUP
                                 0,               //x
                                 0,               //y
                                 0,               //nWidth
                                 0,               //nHeight
                                 hMainWnd,        //hWndParent
                                 0,               //ID
                                 hInstanceDLL,    //hInstance
                                 DialogCallback); //Script function callback. To use it class must be registered by WindowRegisterClass.
          if (hWndDlgCal)
          {
            //Disable main window, to make dialog modal
            oSys.Call("user32::EnableWindow", hMainWnd, false);
  
            //Message loop
            AkelPad.WindowGetMessage();
          }
        }
        while (bResetColors);

        AkelPad.MemFree(lpSysTime);
      }
      AkelPad.MemFree(lpBuffer);
    }
    AkelPad.WindowUnregisterClass(pClassName);
  }
}

////////
function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    hWndCal = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                        0,               //dwExStyle
                        "SysMonthCal32", //lpClassName
                        0,               //lpWindowName
                        0x50800004,      //WS_VISIBLE|WS_CHILD|WS_BORDER|MCS_WEEKNUMBERS
                        0,               //x
                        0,               //y
                        0,               //nWidth
                        0,               //nHeight
                        hWnd,            //hWndParent
                        0,               //ID
                        hInstanceDLL,    //hInstance
                        0);              //lpParam

    AkelPad.SendMessage(hWndCal, 0x1014 /*MCM_SETMONTHDELTA*/, 1, 0);

    //Set window size and position
    SetWindowSize(hWnd);
    MoveWindow(hMainWnd, hWnd, (bResetColors ? aWndCalPos : 0));

    if (aColor)
    {
      for (var i = 1; i < 6; ++i)
        AkelPad.SendMessage(hWndCal, 0x100A /*MCM_SETCOLOR*/, i, aColor[i]);
    }
  }

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("user32::SetFocus", hWndCal);

  else if (uMsg == 0x0F) //WM_PAINT
  {
    if (bResetColors)
    {
      AkelPad.SendMessage(hWndCal, 0x1002 /*MCM_SETCURSEL*/, 0, lpSysTime);
      AkelPad.SendMessage(hWnd, 256 /*WM_KEYDOWN*/, 0x4F /*O*/, 0);
    }
  }

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (wParam == 0x25) //VK_LEFT
      SetDate(-1);
    if (wParam == 0x27) //VK_RIGHT
      SetDate(1);
    if (wParam == 0x26) //VK_UP
      SetDate(-7);
    if (wParam == 0x28) //VK_DOWN
      SetDate(7);
    if (wParam == 0x08) //VK_BACK - today
      SetDate(0);
    else if (wParam == 13) //VK_RETURN
    {
      if ((oSys.Call("user32::GetAsyncKeyState", 0xA0 /*VK_LSHIFT*/)) &&
          (oSys.Call("user32::GetAsyncKeyState", 0x11 /*VK_CONTROL*/)))
        InsertDateTime(aKeyAssign[3][1]);
      else if (oSys.Call("user32::GetAsyncKeyState", 0xA0 /*VK_LSHIFT*/))
        InsertDateTime(aKeyAssign[1][1]);
      else if (oSys.Call("user32::GetAsyncKeyState", 0x11 /*VK_CONTROL*/))
        InsertDateTime(aKeyAssign[2][1]);
      else
        InsertDateTime(aKeyAssign[0][1]);
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
    }
    else if (wParam == 27) //VK_ESCAPE
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
    else if ((wParam == 109) || (wParam == 189))  //Num- or -
    {
      if (nMonthCount > 1)
      {
        --nMonthCount;
        SetWindowSize(hWnd);
        MoveWindow(hMainWnd, hWnd, "CV");
      }
    }
    else if ((wParam == 107) || (wParam == 187))  //Num+ or +
    {
      if (nMonthCount < 5)
      {
        ++nMonthCount;
        SetWindowSize(hWnd);
        MoveWindow(hMainWnd, hWnd, "CV");
      }
    }
    else if (wParam == 112) //VK_F1
      Help();
    else if ((wParam == 0x4F) || (wParam == 0x53)) //O or S
    {
      Settings();
      if (bResetColors)
        oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
    }
  }

  else if (uMsg == 260) //WM_SYSKEYDOWN
  {
    if (oSys.Call("user32::GetAsyncKeyState", 0xA0 /*VK_LSHIFT*/))
    {
      if (wParam == 0x27) //VK_RIGHT
        MoveWindow(0, hWnd, "R");
      else if (wParam == 0x25) //VK_LEFT
        MoveWindow(0, hWnd, "L");
      else if (wParam == 0x28) //VK_DOWN
        MoveWindow(0, hWnd, "D");
      else if (wParam == 0x26) //VK_UP
        MoveWindow(0, hWnd, "U");
      else if (wParam == 0x23) //VK_END
        MoveWindow(0, hWnd, "E");
      else if (wParam == 0x24) //VK_HOME
        MoveWindow(0, hWnd, "H");
      else if (wParam == 0x22) //VK_NEXT
        MoveWindow(0, hWnd, "B");
      else if (wParam == 0x21) //VK_PRIOR
        MoveWindow(0, hWnd, "T");
      else if (wParam == 0x43) //C
        MoveWindow(hEditWnd, hWnd, "C");
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

  return 0;
}

function SetWndFontAndText(hWnd, hFont, pText)
{
  var lpWndTxt;

  AkelPad.SendMessage(hWnd, 48 /*WM_SETFONT*/, hFont, true);

  if (lpWndTxt = AkelPad.MemAlloc((pText.length + 1) * _TSIZE))
  {
    AkelPad.MemCopy(lpWndTxt, pText, _TSTR);
    oSys.Call("user32::SetWindowText" + _TCHAR, hWnd, lpWndTxt);
    AkelPad.MemFree(lpWndTxt);
  }
}

function SetWindowSize(hWnd)
{
  var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)
  var nW, nH, nW1;

  AkelPad.SendMessage(hWndCal, 0x1009 /*MCM_GETMINREQRECT*/, 0, lpRect);

  nW  = AkelPad.MemRead(lpRect +  8, DT_DWORD);
  nH  = AkelPad.MemRead(lpRect + 12, DT_DWORD);
  nW1 = AkelPad.SendMessage(hWndCal, 0x1015 /*MCM_GETMAXTODAYWIDTH*/, 0, 0);

  if (nW1 > nW)
    nW = nW1;

  oSys.Call("user32::SetWindowPos", hWnd,    0, 0, 0, nW, nH * nMonthCount - 13 * (nMonthCount - 1),
                                    0x16 /*SWP_NOZORDER|SWP_NOACTIVATE|SWP_NOMOVE*/);
  oSys.Call("user32::SetWindowPos", hWndCal, 0, 0, 0, nW, nH * nMonthCount - 13 * (nMonthCount - 1),
                                    0x16 /*SWP_NOZORDER|SWP_NOACTIVATE|SWP_NOMOVE*/);

  AkelPad.MemFree(lpRect);
}

function MoveWindow(hWndParent, hWnd, Action)
{
  var rcWndParent;
  var rcWnd;
  var lpPoint;
  var nX;
  var nY;
  var nWndWidth;
  var nWndHeight;
  var nCharHeight;

  if (! hWndParent)
    hWndParent = oSys.Call("user32::GetDesktopWindow");

  rcWndParent = GetWindowPos(hWndParent);
  rcWnd       = GetWindowPos(hWnd);

  nX = rcWnd.left;
  nY = rcWnd.top;

  if (! Action) //to caret
  {
    if (lpPoint = AkelPad.MemAlloc(8)) //sizeof(POINT)
    {
      AkelPad.SendMessage(hEditWnd, 3190 /*AEM_GETCARETPOS*/, lpPoint, 0);
      oSys.Call("user32::ClientToScreen", hEditWnd, lpPoint);
      nX = AkelPad.MemRead(lpPoint,     DT_DWORD);
      nY = AkelPad.MemRead(lpPoint + 4, DT_DWORD);

      nWndWidth   = rcWnd.right - rcWnd.left;
      nWndHeight  = rcWnd.bottom - rcWnd.top;
      nCharHeight = AkelPad.SendMessage(hEditWnd, 3188 /*AEM_GETCHARSIZE*/, 0 /*AECS_HEIGHT*/, 0);

      if ((nX + nWndWidth) > rcWndParent.right)
        nX = rcWndParent.right - nWndWidth - 10;

      if ((nY + nCharHeight + nWndHeight) < rcWndParent.bottom)
        nY = nY + nCharHeight;
      else if ((nY - nWndHeight) > rcWndParent.top)
        nY = nY - nWndHeight;
      else
        nY = rcWndParent.top  + ((rcWndParent.bottom - rcWndParent.top) / 2 - (rcWnd.bottom - rcWnd.top) / 2);

      AkelPad.MemFree(lpPoint);
    }
  }
  else if (Action == "R") //Move right
    nX = rcWnd.left + ((rcWnd.right < rcWndParent.right) ? 10: 0);
  else if (Action == "L") //Move left
    nX = rcWnd.left - ((rcWnd.left > rcWndParent.left) ? 10: 0);
  else if (Action == "D") //Move down
    nY = rcWnd.top + ((rcWnd.bottom < rcWndParent.bottom) ? 10: 0);
  else if (Action == "U") //Move up
    nY = rcWnd.top - ((rcWnd.top > rcWndParent.top) ? 10: 0);
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
  else if (Action == "CV") //Center vertically
  {
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
    nX = Action.left;
    nY = Action.top;
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
  var nError;
  var oFile;
  var pTxtIni;
  var i;

  if (bWrite)
  {
    pTxtIni = 'bSystem='          + bSystem     + ';\r\n' +
              'bLongDate='        + bLongDate   + ';\r\n' +
              'pDateForm="'       + pDateForm.replace(/[\\"]/g, "\\$&") + '";\r\n' +
              'pTimeForm="'       + pTimeForm.replace(/[\\"]/g, "\\$&") + '";\r\n' +
              'aKeyAssign[0][1]=' + aKeyAssign[0][1] + ';\r\n' +
              'aKeyAssign[1][1]=' + aKeyAssign[1][1] + ';\r\n' +
              'aKeyAssign[2][1]=' + aKeyAssign[2][1] + ';\r\n' +
              'aKeyAssign[3][1]=' + aKeyAssign[3][1] + ';\r\n' +
              'nMonthCount='      + nMonthCount + ';\r\n' +
              'aColor='

    if (aColor)
      pTxtIni += '[' + aColor + ']';
    else
      pTxtIni += aColor;

    pTxtIni += ';';

    oFile = oFSO.OpenTextFile(pIniName, 2, true, 0);
    oFile.Write(pTxtIni);
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

function SetDate(nShift)
{
  var nYear, nMonth, nDay, dDate;

  if (nShift)
  {
    AkelPad.SendMessage(hWndCal, 0x1001 /*MCM_GETCURSEL*/, 0, lpSysTime);

    nYear  = AkelPad.MemRead(lpSysTime,     DT_WORD);
    nMonth = AkelPad.MemRead(lpSysTime + 2, DT_WORD) - 1;
    nDay   = AkelPad.MemRead(lpSysTime + 6, DT_WORD);
    dDate  = new Date(nYear, nMonth, nDay);

    dDate.setDate(nDay + nShift);

    nYear  = dDate.getFullYear();
    nMonth = dDate.getMonth() + 1;
    nDay   = dDate.getDate();

    AkelPad.MemCopy(lpSysTime,     nYear,  DT_WORD);
    AkelPad.MemCopy(lpSysTime + 2, nMonth, DT_WORD);
    AkelPad.MemCopy(lpSysTime + 6, nDay,   DT_WORD);
  }
  else
    AkelPad.SendMessage(hWndCal, 0x100D /*MCM_GETTODAY*/, 0, lpSysTime);

  AkelPad.SendMessage(hWndCal, 0x1002 /*MCM_SETCURSEL*/, 0, lpSysTime);
}

function GetDate()
{
  var lpString = AkelPad.MemAlloc(256 * _TSIZE);
  var lpFormat = AkelPad.MemAlloc(256 * _TSIZE);
  var nFlag;
  var pDate;

  AkelPad.SendMessage(hWndCal, 0x1001 /*MCM_GETCURSEL*/, 0, lpSysTime);

  if (bSystem)
  {
    if (bLongDate)
      nFlag = 0x2; //DATE_LONGDATE
    else
      nFlag = 0x1; //DATE_SHORTDATE
  }
  else
  {
    nFlag = 0;
    AkelPad.MemCopy(lpFormat, pDateForm, _TSTR);
  }

  oSys.Call("kernel32::GetDateFormat" + _TCHAR,
            0x400, //LOCALE_USER_DEFAULT
            nFlag,
            lpSysTime,
            (bSystem ? 0 : lpFormat),
            lpString,
            256);
  pDate = AkelPad.MemRead(lpString, _TSTR);

  AkelPad.MemFree(lpString);
  AkelPad.MemFree(lpFormat);

  return pDate;
}

function GetTime()
{
  var lpString = AkelPad.MemAlloc(256 * _TSIZE);
  var lpFormat = AkelPad.MemAlloc(256 * _TSIZE);
  var dDate    = new Date();
  var pTime;

  AkelPad.MemCopy(lpSysTime +  8, dDate.getHours(),        DT_WORD);
  AkelPad.MemCopy(lpSysTime + 10, dDate.getMinutes(),      DT_WORD);
  AkelPad.MemCopy(lpSysTime + 12, dDate.getSeconds(),      DT_WORD);
  AkelPad.MemCopy(lpSysTime + 14, dDate.getMilliseconds(), DT_WORD);

  if (! bSystem)
    AkelPad.MemCopy(lpFormat, pTimeForm, _TSTR);

  oSys.Call("kernel32::GetTimeFormat" + _TCHAR,
            0x007F, //LOCALE_INVARIANT
            0,
            lpSysTime,
            (bSystem ? 0 : lpFormat),
            lpString,
            256);
  pTime = AkelPad.MemRead(lpString, _TSTR);

  AkelPad.MemFree(lpString);
  AkelPad.MemFree(lpFormat);

  return pTime;
}

function InsertDateTime(What)
{
  var bColSel = AkelPad.SendMessage(hEditWnd, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0);
  var pDateTime;
  var nLines;
  var aTxt;
  var i;

  if (What == 0)
    pDateTime = GetDate();
  else if (What == 1)
    pDateTime = GetDate() + " " + GetTime();
  else if (What == 2)
    pDateTime = GetTime();
  else
    pDateTime = GetTime() + " " + GetDate();

  if (bColSel)
  {
    nLines = AkelPad.SendMessage(hEditWnd, 3129 /*AEM_GETLINENUMBER*/, 2 /*AEGL_LASTSELLINE*/, 0) -
             AkelPad.SendMessage(hEditWnd, 3129 /*AEM_GETLINENUMBER*/, 1 /*AEGL_FIRSTSELLINE*/, 0) + 1;
    aTxt   = new Array(nLines);

    for (i = 0; i < nLines; ++i)
      aTxt[i] = pDateTime;

    pDateTime = aTxt.join("\r");
  }

  AkelPad.ReplaceSel(pDateTime, AkelPad.GetSelStart() != AkelPad.GetSelEnd());
  AkelPad.SendMessage(hEditWnd, 3128 /*AEM_UPDATESEL*/, bColSel, 0);
}

function Help()
{
  var rcWndDesk = GetWindowPos(oSys.Call("user32::GetDesktopWindow"));
  var rcWnd     = GetWindowPos(hWndDlgCal);
  var nWidth    = 350;
  var nHeight   = 350;
  var nX        = rcWnd.right;
  var nY        = rcWnd.top;
  var hWndDlgHlp;

  if ((nX + nWidth) > rcWndDesk.right)
    nX = rcWnd.left - nWidth;
  if ((nY + nHeight) > rcWndDesk.bottom)
    nY = rcWnd.bottom - nHeight;

  hWndDlgHlp = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                         0,              //dwExStyle
                         pClassName,     //lpClassName
                         pTxtHelp,       //lpWindowName
                         0x90C80000,     //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU
                         nX,             //x
                         nY,             //y
                         nWidth,         //nWidth
                         nHeight,        //nHeight
                         hWndDlgCal,     //hWndParent
                         0,              //ID
                         hInstanceDLL,   //hInstance
                         DialogCallbackHlp); //Script function callback

  if (hWndDlgHlp)
  {
    oSys.Call("user32::EnableWindow", hWndDlgCal, 0);
    AkelPad.WindowGetMessage();
  }
}

function DialogCallbackHlp(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    hWndHlp = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                        0x000,        //dwExStyle
                        "STATIC",       //lpClassName
                        0,            //lpWindowName
                        0x50400000,   //WS_VISIBLE|WS_CHILD|WS_DLGFRAME
                        10,           //x
                        10,           //y
                        325,          //nWidth
                        300,          //nHeight
                        hWnd,         //hWndParent
                        0,            //ID
                        hInstanceDLL, //hInstance
                        0);           //lpParam
    SetWndFontAndText(hWndHlp, hGuiFont, pHlpTxt);
  }

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if ((wParam == 27 /*VK_ESCAPE*/) || (wParam == 112 /*VK_F1*/))
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    oSys.Call("user32::EnableWindow", hWndDlgCal, 1);
    oSys.Call("user32::DestroyWindow", hWnd);
  }

  else if (uMsg == 2) //WM_DESTROY
    oSys.Call("user32::PostQuitMessage", 0);

  return 0;
}

function Settings()
{
  var nWidth  = 265
  var nHeight = 465;
  var rcWndDesk;
  var rcWnd;
  var nX;
  var nY;
  var hWndDlgSet;
  var i;

  if (bResetColors)
  {
    nX = aWndSetPos.left;
    nY = aWndSetPos.top;
  }
  else
  {
    rcWndDesk = GetWindowPos(oSys.Call("user32::GetDesktopWindow"));
    rcWnd     = GetWindowPos(hWndDlgCal);
    nX        = rcWnd.right;
    nY        = rcWnd.top;

    if ((nX + nWidth) > rcWndDesk.right)
      nX = rcWnd.left - nWidth;
    if ((nY + nHeight) > rcWndDesk.bottom)
      nY = rcWnd.bottom - nHeight;
  }

  if (! aColor)
  {
    //i=0 - MCSC_BACKGROUND (not used)
    //i=4 - MCSC_MONTHBK
    //i=1 - MCSC_TEXT
    //i=2 - MCSC_TITLEBK
    //i=3 - MCSC_TITLETEXT
    //i=5 - MCSC_TRAILINGTEXT
    aColor = [];
    for (i = 1; i < 6; ++i)
      aColor[i] = AkelPad.SendMessage(hWndCal, 0x100B /*MCM_GETCOLOR*/, i, 0);
  }

  //0x40400000 - WS_CHILD|WS_DLGFRAME (no visible)
  //0x50000000 - WS_VISIBLE|WS_CHILD
  //0x50000007 - WS_VISIBLE|WS_CHILD|BS_GROUPBOX
  //0x50010000 - WS_VISIBLE|WS_CHILD|WS_TABSTOP
  //0x50012000 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_MULTILINE
  //0x50010003 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
  //0x50010003 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|CBS_DROPDOWNLIST
  //0x50010080 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_AUTOHSCROLL
  //0x50800000 - WS_VISIBLE|WS_CHILD|WS_BORDER
  //Windows               WNDTYPE, WND,WNDEXSTY,     WNDSTY,WNDX,WNDY,WNDW,WNDH, WNDTXT
  lpWnd[IDFORMAT    ] = ["BUTTON",   0,       0, 0x50000007,  10,  10, 240, 130, pTxtFormat];
  lpWnd[IDDATE      ] = ["STATIC",   0,       0, 0x50000000,  20,  30, 220,  13, ""];
  lpWnd[IDTIME      ] = ["STATIC",   0,       0, 0x50000000,  20,  50, 220,  13, ""];
  lpWnd[IDSYSTEM    ] = ["BUTTON",   0,       0, 0x50010003,  20,  70,  80,  16, pTxtSystem];
  lpWnd[IDLONGDATE  ] = ["BUTTON",   0,       0, 0x50010003, 120,  70,  80,  16, pTxtLongDate];
  lpWnd[IDDF        ] = ["EDIT",     0,   0x200, 0x50010080,  20,  90, 135,  20, pDateForm];
  lpWnd[IDDFHLP     ] = ["BUTTON",   0,       0, 0x50010000, 155,  90,  15,  20, "?"];
  lpWnd[IDDFDESCR   ] = ["STATIC",   0,       0, 0x50000000, 175,  90,  70,  13, pTxtDateForm];
  lpWnd[IDTF        ] = ["EDIT",     0,   0x200, 0x50010080,  20, 110, 135,  20, pTimeForm];
  lpWnd[IDTFHLP     ] = ["BUTTON",   0,       0, 0x50010000, 155, 110,  15,  20, "?"];
  lpWnd[IDTFDESCR   ] = ["STATIC",   0,       0, 0x50000000, 175, 110,  70,  13, pTxtTimeForm];
  lpWnd[IDKEYASSIG  ] = ["BUTTON",   0,       0, 0x50000007,  10, 150, 240, 110, pTxtKeyAssig];
  lpWnd[IDASSIG0    ] = ["COMBOBOX", 0,       0, 0x50010003,  20, 170, 100,  20, ""];
  lpWnd[IDASSIG1    ] = ["COMBOBOX", 0,       0, 0x50010003,  20, 190, 100,  20, ""];
  lpWnd[IDASSIG2    ] = ["COMBOBOX", 0,       0, 0x50010003,  20, 210, 100,  20, ""];
  lpWnd[IDASSIG3    ] = ["COMBOBOX", 0,       0, 0x50010003,  20, 230, 100,  20, ""];
  lpWnd[IDENTER     ] = ["STATIC",   0,       0, 0x50000000, 125, 170,  80,  13, aKeyAssign[0][0]];
  lpWnd[IDSHENTER   ] = ["STATIC",   0,       0, 0x50000000, 125, 190,  80,  13, aKeyAssign[1][0]];
  lpWnd[IDCTENTER   ] = ["STATIC",   0,       0, 0x50000000, 125, 210,  80,  13, aKeyAssign[2][0]];
  lpWnd[IDCTSHENTER ] = ["STATIC",   0,       0, 0x50000000, 125, 230,  80,  13, aKeyAssign[3][0]];
  lpWnd[IDCALENDAR  ] = ["BUTTON",   0,       0, 0x50000007,  10, 270, 240, 155, pTxtCalendar];
  lpWnd[IDMONTHCOUNT] = ["COMBOBOX", 0,       0, 0x50010003,  20, 290,  40,  20, ""];
  lpWnd[IDMONTHDESCR] = ["STATIC",   0,       0, 0x50000000,  65, 290, 180,  13, pTxtMonths];
  lpWnd[IDCOLOR1    ] = ["STATIC",   0,       0, 0x50800000,  20, 320,  18,  18, ""];
  lpWnd[IDCOLOR2    ] = ["STATIC",   0,       0, 0x50800000,  20, 340,  18,  18, ""];
  lpWnd[IDCOLOR3    ] = ["STATIC",   0,       0, 0x50800000,  20, 360,  18,  18, ""];
  lpWnd[IDCOLOR4    ] = ["STATIC",   0,       0, 0x50800000,  20, 380,  18,  18, ""];
  lpWnd[IDCOLOR5    ] = ["STATIC",   0,       0, 0x50800000,  20, 400,  18,  18, ""];
  lpWnd[IDCOLOR1BUTT] = ["BUTTON",   0,       0, 0x50010000,  45, 320, 170,  20, pTxtColor1];
  lpWnd[IDCOLOR2BUTT] = ["BUTTON",   0,       0, 0x50010000,  45, 340, 170,  20, pTxtColor2];
  lpWnd[IDCOLOR3BUTT] = ["BUTTON",   0,       0, 0x50010000,  45, 360, 170,  20, pTxtColor3];
  lpWnd[IDCOLOR4BUTT] = ["BUTTON",   0,       0, 0x50010000,  45, 380, 170,  20, pTxtColor4];
  lpWnd[IDCOLOR5BUTT] = ["BUTTON",   0,       0, 0x50010000,  45, 400, 170,  20, pTxtColor5];
  lpWnd[IDRESET     ] = ["BUTTON",   0,       0, 0x50012000, 220, 320,  20, 100, pTxtReset];
  lpWnd[IDDFHLPTXT  ] = ["STATIC",   0,       0, 0x40400000,   0, 110, 255, 155, pHlpTxtDF];
  lpWnd[IDTFHLPTXT  ] = ["STATIC",   0,       0, 0x40400000,   0, 130, 255, 140, pHlpTxtTF];

  hWndDlgSet = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                         0,              //dwExStyle
                         pClassName,     //lpClassName
                         pTxtSettings,   //lpWindowName
                         0x90C80000,     //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU
                         nX,             //x
                         nY,             //y
                         nWidth,         //nWidth
                         nHeight,        //nHeight
                         hWndDlgCal,     //hWndParent
                         0,              //ID
                         hInstanceDLL,   //hInstance
                         DialogCallbackSet); //Script function callback

  if (hWndDlgSet)
  {
    oSys.Call("user32::EnableWindow", hWndDlgCal, 0);
    AkelPad.WindowGetMessage();
    oSys.Call("gdi32::DeleteObject", hBrushColor);
  }
}

function DialogCallbackSet(hWnd, uMsg, wParam, lParam)
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
    AkelPad.SendMessage(lpWnd[IDDF][WND], 197 /*EM_SETLIMITTEXT*/, 24, 0);
    AkelPad.SendMessage(lpWnd[IDTF][WND], 197 /*EM_SETLIMITTEXT*/, 24, 0);

    //Fill comboboxes
    for (i = 0; i < 4; ++i)
    {
      AkelPad.MemCopy(lpBuffer, pTxtDate, _TSTR);
      AkelPad.SendMessage(lpWnd[eval("IDASSIG" + i)][WND], 0x143 /*CB_ADDSTRING*/, 0, lpBuffer);
      AkelPad.MemCopy(lpBuffer, pTxtDate + " " + pTxtTime, _TSTR);
      AkelPad.SendMessage(lpWnd[eval("IDASSIG" + i)][WND], 0x143 /*CB_ADDSTRING*/, 0, lpBuffer);
      AkelPad.MemCopy(lpBuffer, pTxtTime, _TSTR);
      AkelPad.SendMessage(lpWnd[eval("IDASSIG" + i)][WND], 0x143 /*CB_ADDSTRING*/, 0, lpBuffer);
      AkelPad.MemCopy(lpBuffer, pTxtTime + " " + pTxtDate, _TSTR);
      AkelPad.SendMessage(lpWnd[eval("IDASSIG" + i)][WND], 0x143 /*CB_ADDSTRING*/, 0, lpBuffer);
      AkelPad.SendMessage(lpWnd[eval("IDASSIG" + i)][WND], 0x14E /*CB_SETCURSEL*/, aKeyAssign[i][1], 0);
    }
    for (i = 1; i < 6; ++i)
    {
      AkelPad.MemCopy(lpBuffer, " " + i + " ", _TSTR);
      AkelPad.SendMessage(lpWnd[IDMONTHCOUNT][WND], 0x143 /*CB_ADDSTRING*/, 0, lpBuffer);
    }
    AkelPad.SendMessage(lpWnd[IDMONTHCOUNT][WND], 0x14E /*CB_SETCURSEL*/, nMonthCount - 1, 0);

    //Check
    CheckButtons();
  }

  else if (uMsg == 7) //WM_SETFOCUS
  {
    if (bResetColors)
    {
      bResetColors = false;
      oSys.Call("user32::SetFocus", lpWnd[IDRESET][WND]);
      oSys.Call("user32::DefDlgProc" + _TCHAR, hWnd, 1025 /*DM_SETDEFID*/, IDRESET, 0);
    }
    else
      oSys.Call("user32::SetFocus", lpWnd[IDSYSTEM][WND]);
  }

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (wParam == 112) //VK_F1
    {
      if (oSys.Call("user32::GetFocus") == lpWnd[IDDF][WND])
        oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDDFHLP, 0);
      else if (oSys.Call("user32::GetFocus") == lpWnd[IDTF][WND])
        oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDTFHLP, 0);
    }
    else if ((wParam == 9 /*VK_TAB*/) || (wParam == 27 /*VK_ESCAPE*/))
    {
      if (oSys.Call("user32::IsWindowVisible", lpWnd[IDDFHLPTXT][WND]))
        ShowFormatHelp(hWnd, lpWnd[IDDFHLPTXT][WND], 0);
      else if (oSys.Call("user32::IsWindowVisible", lpWnd[IDTFHLPTXT][WND]))
        ShowFormatHelp(hWnd, lpWnd[IDTFHLPTXT][WND], 0);
      else if (wParam == 27 /*VK_ESCAPE*/)
        oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
    }
  }

  else if ((uMsg == 0x0201 /*WM_LBUTTONDOWN*/) || (uMsg == 0x0204 /*WM_RBUTTONDOWN*/) ||
           (uMsg == 0x0207 /*WM_MBUTTONDOWN*/) || (uMsg == 0x020b /*WM_XBUTTONDOWN*/))
  {
    if (oSys.Call("user32::IsWindowVisible", lpWnd[IDDFHLPTXT][WND]))
      ShowFormatHelp(hWnd, lpWnd[IDDFHLPTXT][WND], 0);
    else if (oSys.Call("user32::IsWindowVisible", lpWnd[IDTFHLPTXT][WND]))
      ShowFormatHelp(hWnd, lpWnd[IDTFHLPTXT][WND], 0);
  }

  else if (uMsg == 0x0138) //WM_CTLCOLORSTATIC
  {
    if ((lParam == lpWnd[IDDFHLPTXT][WND]) || (lParam == lpWnd[IDTFHLPTXT][WND]))
    {
      oSys.Call("gdi32::DeleteObject", hBrushColor);
      oSys.Call("gdi32::SetTextColor", wParam, 0x006000);
      oSys.Call("gdi32::SetBkColor", wParam, 0xFFFFFF);
      hBrushColor = oSys.Call("gdi32::CreateSolidBrush", 0xFFFFFF);
      return hBrushColor;
    }
    if (lParam == lpWnd[IDCOLOR1][WND])
    {
      oSys.Call("gdi32::DeleteObject", hBrushColor);
      hBrushColor = oSys.Call("gdi32::CreateSolidBrush", aColor[4]);
      return hBrushColor;
    }
    if (lParam == lpWnd[IDCOLOR2][WND])
    {
      oSys.Call("gdi32::DeleteObject", hBrushColor);
      hBrushColor = oSys.Call("gdi32::CreateSolidBrush", aColor[1]);
      return hBrushColor;
    }
    if (lParam == lpWnd[IDCOLOR3][WND])
    {
      oSys.Call("gdi32::DeleteObject", hBrushColor);
      hBrushColor = oSys.Call("gdi32::CreateSolidBrush", aColor[2]);
      return hBrushColor;
    }
    if (lParam == lpWnd[IDCOLOR4][WND])
    {
      oSys.Call("gdi32::DeleteObject", hBrushColor);
      hBrushColor = oSys.Call("gdi32::CreateSolidBrush", aColor[3]);
      return hBrushColor;
    }
    if (lParam == lpWnd[IDCOLOR5][WND])
    {
      oSys.Call("gdi32::DeleteObject", hBrushColor);
      hBrushColor = oSys.Call("gdi32::CreateSolidBrush", aColor[5]);
      return hBrushColor;
    }
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    nLowParam = LoWord(wParam);
    nHiwParam = HiWord(wParam);

    if ((nLowParam == IDSYSTEM) || (nLowParam == IDLONGDATE))
    {
      CheckButtons(nLowParam);
    }
    else if ((nLowParam == IDDF) && (nHiwParam == 0x300 /*EN_CHANGE*/))
    {
      oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDDF][WND], lpBuffer, 256);
      pDateForm = AkelPad.MemRead(lpBuffer, _TSTR);
      SetWndFontAndText(lpWnd[IDDATE][WND], hGuiFont, GetDate());
    }
    else if ((nLowParam == IDTF) && (nHiwParam == 0x300 /*EN_CHANGE*/))
    {
      oSys.Call("user32::GetWindowText" + _TCHAR, lpWnd[IDTF][WND], lpBuffer, 256);
      pTimeForm = AkelPad.MemRead(lpBuffer, _TSTR);
      SetWndFontAndText(lpWnd[IDTIME][WND], hGuiFont, GetTime());
    }
    else if (nLowParam == IDDFHLP)
      ShowFormatHelp(hWnd, lpWnd[IDDFHLPTXT][WND],
                       ! oSys.Call("user32::IsWindowVisible", lpWnd[IDDFHLPTXT][WND]));
    else if (nLowParam == IDTFHLP)
      ShowFormatHelp(hWnd, lpWnd[IDTFHLPTXT][WND],
                       ! oSys.Call("user32::IsWindowVisible", lpWnd[IDTFHLPTXT][WND]));
    else if ((nLowParam >= IDASSIG0) && (nLowParam <= IDASSIG3) && (nHiwParam == 1 /*CBN_SELCHANGE*/))
      aKeyAssign[nLowParam - IDASSIG0][1] = AkelPad.SendMessage(lpWnd[nLowParam][WND], 0x147 /*CB_GETCURSEL*/, 0, 0);
    else if ((nLowParam == IDMONTHCOUNT) && (nHiwParam == 1 /*CBN_SELCHANGE*/))
    {
      nMonthCount = AkelPad.SendMessage(lpWnd[IDMONTHCOUNT][WND], 0x147 /*CB_GETCURSEL*/, 0, 0) + 1;
      SetWindowSize(hWndDlgCal);
      MoveWindow(hMainWnd, hWndDlgCal, "CV");
    }
    else if ((nLowParam >= IDCOLOR1BUTT) && (nLowParam <= IDCOLOR5BUTT))
      ChangeColor(hWnd, nLowParam);
    else if (nLowParam == IDRESET)
    {
      bResetColors = true;
      aColor       = undefined;
      aWndCalPos   = GetWindowPos(hWndCal);
      aWndSetPos   = GetWindowPos(hWnd);
      AkelPad.SendMessage(hWndCal, 0x1001 /*MCM_GETCURSEL*/, 0, lpSysTime);
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
    }
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    oSys.Call("user32::EnableWindow", hWndDlgCal, 1);
    oSys.Call("user32::DestroyWindow", hWnd);
  }

  else if (uMsg == 2) //WM_DESTROY
    oSys.Call("user32::PostQuitMessage", 0);

  return 0;
}

function CheckButtons(nButton)
{
  if (nButton == IDSYSTEM)
    bSystem = ! bSystem;
  else if (nButton == IDLONGDATE)
    bLongDate = ! bLongDate;

  AkelPad.SendMessage(lpWnd[IDSYSTEM][WND],   241 /*BM_SETCHECK*/, bSystem,   0);
  AkelPad.SendMessage(lpWnd[IDLONGDATE][WND], 241 /*BM_SETCHECK*/, bLongDate, 0);

  oSys.Call("user32::EnableWindow", lpWnd[IDLONGDATE][WND], bSystem);
  oSys.Call("user32::EnableWindow", lpWnd[IDDF][WND], ! bSystem);
  oSys.Call("user32::EnableWindow", lpWnd[IDTF][WND], ! bSystem);
  oSys.Call("user32::EnableWindow", lpWnd[IDDFHLP][WND], ! bSystem);
  oSys.Call("user32::EnableWindow", lpWnd[IDTFHLP][WND], ! bSystem);

  SetWndFontAndText(lpWnd[IDDATE][WND], hGuiFont, GetDate());
  SetWndFontAndText(lpWnd[IDTIME][WND], hGuiFont, GetTime());
}

function ShowFormatHelp(hWndDlg, hWndHlp, bShow)
{
  if (bShow)
    oSys.Call("user32::SetCapture", hWndDlg);
  else
    oSys.Call("user32::ReleaseCapture");

  oSys.Call("user32::ShowWindow", hWndHlp, bShow);
}

function ChangeColor(hWnd, nButton)
{
  var nCo     = nButton - IDCOLOR1BUTT;
  var lpChoCo = AkelPad.MemAlloc(4 * 9); //sizeof(CHOOSECOLOR)
  var lpCusCo = AkelPad.MemAlloc(4 * 16); //sizeof(COLORREF) * 16
  var hFocus  = oSys.Call("user32::GetFocus");
  var i;

  if (nButton == IDCOLOR1BUTT)
    nCo = 4;
  else if (nButton == IDCOLOR5BUTT)
    nCo = 5;

  for(i = 0; i < 16; ++i)
    AkelPad.MemCopy(lpCusCo + i * 4, 0, DT_DWORD);

  AkelPad.MemCopy(lpChoCo     , (4 * 9),     DT_DWORD); //lStructSize
  AkelPad.MemCopy(lpChoCo +  4, hWnd,        DT_DWORD); //hWndOwner
  AkelPad.MemCopy(lpChoCo +  8, 0,           DT_DWORD); //hInstance
  AkelPad.MemCopy(lpChoCo + 12, aColor[nCo], DT_DWORD); //rgbResult
  AkelPad.MemCopy(lpChoCo + 16, lpCusCo,     DT_DWORD); //lpCustColors
  AkelPad.MemCopy(lpChoCo + 20, 0x103,       DT_DWORD); //Flags - CC_ANYCOLOR|CC_FULLOPEN|CC_RGBINIT
  AkelPad.MemCopy(lpChoCo + 24, 0,           DT_DWORD); //lCustData
  AkelPad.MemCopy(lpChoCo + 28, 0,           DT_DWORD); //lpfnHook
  AkelPad.MemCopy(lpChoCo + 32, 0,           DT_DWORD); //lpTemplateName

  if (oSys.Call("comdlg32::ChooseColor" + _TCHAR, lpChoCo))
  {
    aColor[nCo] = AkelPad.MemRead(lpChoCo + 12, DT_DWORD);
    SetWndFontAndText(lpWnd[nButton - 5][WND], hGuiFont, lpWnd[nButton - 5][WNDTXT]);
    AkelPad.SendMessage(hWndCal, 0x100A /*MCM_SETCOLOR*/, nCo, aColor[nCo]);
  }

  AkelPad.MemFree(lpChoCo);
  AkelPad.MemFree(lpCusCo);
  oSys.Call("user32::SetFocus", hFocus);
}
