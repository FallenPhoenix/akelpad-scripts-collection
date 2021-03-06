// SendData.js - ver. 2012-03-02
//
// Sends data and keystrokes from text file or Excel worksheet to another window.
//
// Usage:
// Call("Scripts::Main", 1, "SendData.js")
// or
// AkelPad.exe /Show(0) /Call("Scripts::Main", 2, "SendData.js") /quit
//
// Required to include: FileAndStream_functions.js

if (! AkelPad.Include("FileAndStream_functions.js"))
  WScript.Quit();

if (AkelPad.GetLangId(0 /*LANGID_FULL*/) == 0x0415) //Polish
{
  var sTxtDataSource  = "Źródło danych";
  var sTxtTextSemic   = "Tekst - średnik jako separator ;";
  var sTxtTextPipe    = "Tekst - pipeline jako separator |";
  var sTxtTextTab     = "Tekst - TAB jako separator";
  var sTxtWorksheet   = "Arkusz Excela";
  var sTxtExcelBusy   = "<Excel jest zajęty>";
  var sTxtNoFileName  = "<plik bez nazwy>";
  var sTxtNoOpenFiles = "<brak otwartych plików>";
  var sTxtOpen        = "Otwórz plik";
  var sTxtSave        = "Zapisz plik";
  var sTxtAddSend     = "Dodatkowo wyślij";
  var sTxtBeforeStart = "Na początku:";
  var sTxtAfterField  = "Po polu z danymi:";
  var sTxtAfterRow    = "Po każdym wierszu:";
  var sTxtAfterEnd    = "Po zakończeniu:";
  var sTxtDelay_ms    = "Opóźnienie (milisekundy)";
  var sTxtAfterData   = "Po wysłaniu pola z danymi:";
  var sTxtAfterKeys   = "Po wysłaniu pola z klawiszami:";
  var sTxtTargetWin   = "Okno docelowe";
  var sTxtRefresh     = "Odśwież listę";
  var sTxtSend        = "Wyślij dane";
  var sTxtUnableExec  = "Nie można wykonać, Excel jest zajęty.";
  var sTxtNoWorkbook  = "Nie otwarto żadnego skoroszytu w Excelu.";
  var sTxtNoOpenText  = "Nie otwarto żadnego pliku w edytorze.";
  var sTxtWantSave    = "Czy chcesz zapisać ten plik?";
  var sTxtWinClosed   = "To okno zostało już zamknięte. Czy odświeżyć litę okien?";
  var sTxtNoWorksheet = "Aktywny obiekt w Excelu nie jest arkuszem kalkulacyjnym.";
  var sTxtNoSelection = "Nie zaznaczono danych do wysłania.";
  var sTxtTerminate   = "Zatrzymano. Czy zakończyć wysyłanie?";
  var sTxtPressEsc    = "żeby zatrzymać, wciśnij i przytrzymaj ESC";
  var sTxtCurSent     = "Aktualnie wysyłane: ";
  var sTxtOffset      = "offset: ";
  var sTxtCell        = "komórka: ";
  var sTxtRow         = "wiersz: ";
  var sTxtColumn      = "kolumna: ";
  var sTxtNumRows     = "Liczba wysłanych wierszy:";
  var sTxtNoErrors    = "Brak błędów";
  var sTxtKeysError   = "Błąd w polu klawiszy: ";
  var sTxtEndSend     = "Wysyłanie zakończone.";
}
else
{
  var sTxtDataSource  = "Data source";
  var sTxtTextSemic   = "Text - semicolon as separator ;";
  var sTxtTextPipe    = "Text - pipeline as separator |";
  var sTxtTextTab     = "Text - TAB as separator";
  var sTxtWorksheet   = "Excel worksheet";
  var sTxtExcelBusy   = "<Excel is busy>";
  var sTxtNoFileName  = "<no file name>";
  var sTxtNoOpenFiles = "<no opened files>";
  var sTxtOpen        = "Open file";
  var sTxtSave        = "Save file";
  var sTxtAddSend     = "Additionally send";
  var sTxtBeforeStart = "Before start:";
  var sTxtAfterField  = "After data field:";
  var sTxtAfterRow    = "After each row:";
  var sTxtAfterEnd    = "After end:";
  var sTxtDelay_ms    = "Delay (miliseconds)";
  var sTxtAfterData   = "After sending field with data:";
  var sTxtAfterKeys   = "After sending field with keystrokes:";
  var sTxtTargetWin   = "Target window";
  var sTxtRefresh     = "Refresh list";
  var sTxtSend        = "Send data";
  var sTxtUnableExec  = "Unable to execute, Excel is busy.";
  var sTxtNoWorkbook  = "There is no open workbook in Excel.";
  var sTxtNoOpenText  = "There is no open text file in editor.";
  var sTxtWantSave    = "Do you want to save this file?";
  var sTxtWinClosed   = "This window is already closed. Do you refresh the windows list?";
  var sTxtNoWorksheet = "Active object in Excel is no worksheet.";
  var sTxtNoSelection = "There is no data selection to send.";
  var sTxtTerminate   = "Stopped. Terminate sending?";
  var sTxtPressEsc    = "to stop, press and hold ESC key";
  var sTxtCurSent     = "Currently is sent: ";
  var sTxtOffset      = "offset: ";
  var sTxtCell        = "cell: ";
  var sTxtRow         = "row: ";
  var sTxtColumn      = "kolumn: ";
  var sTxtNumRows     = "Number of sent rows:";
  var sTxtNoErrors    = "No errors";
  var sTxtKeysError   = "Error in keystrokes field: ";
  var sTxtEndSend     = "Sending completed.";
}

var oSys          = AkelPad.SystemFunction();
var oWshShell     = new ActiveXObject("WScript.shell");
var hMainWnd      = AkelPad.GetMainWnd();
var hInstanceDLL  = AkelPad.GetInstanceDll();
var sClassName    = "AkelPad::Scripts::" + WScript.ScriptName + "::" + hInstanceDLL;
var sScriptName   = "SendData";
var hGuiFont      = oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
var sExcelClass   = "XLMAIN";
var nWndX         = 350;
var nWndY         = 120;
var nSource       = 0;
var bBeforeStart  = false;
var bAfterField   = false;
var bAfterRow     = false;
var bAfterEnd     = false;
var bDelayData    = false;
var bDelayKeys    = false;
var sBeforeStart  = "";
var sAfterField   = "";
var sAfterRow     = "";
var sAfterEnd     = "";
var sDelayData    = "";
var sDelayKeys    = "";
var hWndDlg;
var hFocus;
var bExcelWasRunning;
var oExcel;

ReadWriteIni(false);

var CLASS   = 0;
var HWND    = 1;
var EXSTYLE = 2;
var STYLE   = 3;
var X       = 4;
var Y       = 5;
var W       = 6;
var H       = 7;
var TXT     = 8;

var aWnd           = [];
var IDSOURCEG      = 1000;
var IDSOURCELB     = 1001;
var IDSOURCES      = 1002;
var IDOPENB        = 1003;
var IDSAVEB        = 1004;
var IDADDSENDG     = 1005;
var IDBEFORESTARTB = 1006;
var IDBEFORESTARTE = 1007;
var IDKEYSMENUB1   = 1008;
var IDAFTERFIELDB  = 1009;
var IDAFTERFIELDE  = 1010;
var IDKEYSMENUB2   = 1011;
var IDAFTERROWB    = 1012;
var IDAFTERROWE    = 1013;
var IDKEYSMENUB3   = 1014;
var IDAFTERENDB    = 1015;
var IDAFTERENDE    = 1016;
var IDKEYSMENUB4   = 1017;
var IDDELAYG       = 1018;
var IDDELAYDATAB   = 1019;
var IDDELAYDATAE   = 1020;
var IDDELAYKEYSB   = 1021;
var IDDELAYKEYSE   = 1022;
var IDTARGETG      = 1023;
var IDTARGETLB     = 1024;
var IDREFRESHB     = 1025;
var IDSENDB        = 1026;

//0x50000000 - WS_VISIBLE|WS_CHILD
//0x50000007 - WS_VISIBLE|WS_CHILD|BS_GROUPBOX
//0x50000009 - WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
//0x50010000 - WS_VISIBLE|WS_CHILD|WS_TABSTOP
//0x50010080 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_AUTOHSCROLL
//0x50012002 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_NUMBER|ES_RIGHT
//0x50010003 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
//0x50810001 - WS_VISIBLE|WS_CHILD|WS_BORDER|WS_TABSTOP|LBS_NOTIFY
//0x50A10001 - WS_VISIBLE|WS_CHILD|WS_VSCROLL|WS_BORDER|WS_TABSTOP|LBS_NOTIFY
//Windows             CLASS,            HWND,EXSTYLE,      STYLE,   X,   Y,   W,   H, TXT
aWnd[IDSOURCEG     ]=["BUTTON",            0,      0, 0x50000007,  10,  10, 280, 100, sTxtDataSource];
aWnd[IDSOURCELB    ]=["LISTBOX",           0,      0, 0x50810001,  20,  30, 170,  70, ""];
aWnd[IDSOURCES     ]=["STATIC",            0,      0, 0x50000000,  20,  90, 260,  13, ""];
aWnd[IDOPENB       ]=["BUTTON",            0,      0, 0x50010000, 200,  30,  80,  23, sTxtOpen];
aWnd[IDSAVEB       ]=["BUTTON",            0,      0, 0x50010000, 200,  60,  80,  23, sTxtSave];
aWnd[IDADDSENDG    ]=["BUTTON",            0,      0, 0x50000007,  10, 120, 280, 110, sTxtAddSend];
aWnd[IDBEFORESTARTB]=["BUTTON",            0,      0, 0x50010003,  20, 140, 110,  16, sTxtBeforeStart];
aWnd[IDBEFORESTARTE]=["RichEdit20"+_TCHAR, 0,  0x200, 0x50010080, 130, 140, 135,  20, ""];
aWnd[IDKEYSMENUB1  ]=["BUTTON",            0,      0, 0x50010000, 265, 140,  15,  21, "..."];
aWnd[IDAFTERFIELDB ]=["BUTTON",            0,      0, 0x50010003,  20, 160, 110,  16, sTxtAfterField];
aWnd[IDAFTERFIELDE ]=["RichEdit20"+_TCHAR, 0,  0x200, 0x50010080, 130, 160, 135,  20, ""];
aWnd[IDKEYSMENUB2  ]=["BUTTON",            0,      0, 0x50010000, 265, 160,  15,  21, "..."];
aWnd[IDAFTERROWB   ]=["BUTTON",            0,      0, 0x50010003,  20, 180, 110,  16, sTxtAfterRow];
aWnd[IDAFTERROWE   ]=["RichEdit20"+_TCHAR, 0,  0x200, 0x50010080, 130, 180, 135,  20, ""];
aWnd[IDKEYSMENUB3  ]=["BUTTON",            0,      0, 0x50010000, 265, 180,  15,  21, "..."];
aWnd[IDAFTERENDB   ]=["BUTTON",            0,      0, 0x50010003,  20, 200, 110,  16, sTxtAfterEnd];
aWnd[IDAFTERENDE   ]=["RichEdit20"+_TCHAR, 0,  0x200, 0x50010080, 130, 200, 135,  20, ""];
aWnd[IDKEYSMENUB4  ]=["BUTTON",            0,      0, 0x50010000, 265, 200,  15,  21, "..."];
aWnd[IDDELAYG      ]=["BUTTON",            0,      0, 0x50000007,  10, 240, 280,  70, sTxtDelay_ms];
aWnd[IDDELAYDATAB  ]=["BUTTON",            0,      0, 0x50010003,  35, 260, 180,  13, sTxtAfterData];
aWnd[IDDELAYDATAE  ]=["EDIT",              0,  0x001, 0x50012002, 225, 260,  40,  20, ""];
aWnd[IDDELAYKEYSB  ]=["BUTTON",            0,      0, 0x50010003,  35, 280, 180,  13, sTxtAfterKeys];
aWnd[IDDELAYKEYSE  ]=["EDIT",              0,  0x001, 0x50012002, 225, 280,  40,  20, ""];
aWnd[IDTARGETG     ]=["BUTTON",            0,      0, 0x50000007,  10, 320, 280, 110, sTxtTargetWin];
aWnd[IDTARGETLB    ]=["LISTBOX",           0,      0, 0x50A10001,  20, 340, 260,  70, ""];
aWnd[IDREFRESHB    ]=["BUTTON",            0,      0, 0x50010000,  20, 400,  80,  23, sTxtRefresh];
aWnd[IDSENDB       ]=["BUTTON",            0,      0, 0x50010000, 200, 400,  80,  23, sTxtSend];

if (AkelPad.WindowRegisterClass(sClassName))
{
  hWndDlg = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                      0x00000008,      //dwExStyle=WS_EX_TOPMOST
                      sClassName,      //lpClassName
                      sScriptName,     //lpWindowName
                      0x90CA0000,      //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX
                      nWndX,           //x
                      nWndY,           //y
                      305,             //nWidth
                      470,             //nHeight
                      0,               //hWndParent
                      0,               //ID
                      hInstanceDLL,    //hInstance
                      DialogCallback); //Script function callback. To use it class must be registered by WindowRegisterClass.

  //Allow other scripts running
  AkelPad.ScriptNoMutex();

  //Message loop
  AkelPad.WindowGetMessage();

  AkelPad.WindowUnregisterClass(sClassName);
}
else if (hWndDlg = oSys.Call("user32::FindWindowEx" + _TCHAR, 0, 0, sClassName, 0))
{
  if (! oSys.Call("user32::IsWindowVisible", hWndDlg))
    oSys.Call("user32::ShowWindow", hWndDlg, 8 /*SW_SHOWNA*/);
  if (oSys.Call("user32::IsIconic", hWndDlg))
    oSys.Call("user32::ShowWindow", hWndDlg, 9 /*SW_RESTORE*/);

  SetForegroundWindow(hWndDlg);
}

if ((oExcel) && (! bExcelWasRunning) && (! IsExcelBusy()))
  oExcel.Quit();

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    var i;

    for (i = 1000; i < aWnd.length; ++i)
    {
      aWnd[i][HWND] =
        oSys.Call("user32::CreateWindowEx" + _TCHAR,
                  aWnd[i][EXSTYLE], //dwExStyle
                  aWnd[i][CLASS],   //lpClassName
                  0,                //lpWindowName
                  aWnd[i][STYLE],   //dwStyle
                  aWnd[i][X],       //x
                  aWnd[i][Y],       //y
                  aWnd[i][W],       //nWidth
                  aWnd[i][H],       //nHeight
                  hWnd,             //hWndParent
                  i,                //ID
                  hInstanceDLL,     //hInstance
                  0);               //lpParam

      //Set font and text
      SetWndFontAndText(aWnd[i][HWND], hGuiFont, aWnd[i][TXT]);
    }

    AkelPad.SendMessage(aWnd[IDBEFORESTARTE][HWND], 197 /*EM_SETLIMITTEXT*/, 64, 0);
    AkelPad.SendMessage(aWnd[IDAFTERFIELDE ][HWND], 197 /*EM_SETLIMITTEXT*/, 64, 0);
    AkelPad.SendMessage(aWnd[IDAFTERROWE   ][HWND], 197 /*EM_SETLIMITTEXT*/, 64, 0);
    AkelPad.SendMessage(aWnd[IDAFTERENDE   ][HWND], 197 /*EM_SETLIMITTEXT*/, 64, 0);
    AkelPad.SendMessage(aWnd[IDDELAYDATAE  ][HWND], 197 /*EM_SETLIMITTEXT*/,  5, 0);
    AkelPad.SendMessage(aWnd[IDDELAYKEYSE  ][HWND], 197 /*EM_SETLIMITTEXT*/,  5, 0);

    //Fill Listbox
    FillSourceLB();

    //Special message for ShowSourceWindow()
    oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 0x8000, 0, 0);

    hFocus = aWnd[IDSOURCELB][HWND];
  }

  else if ((uMsg == 6 /*WM_ACTIVATE*/) && (wParam == 0 /*WA_INACTIVE*/))
    hFocus = oSys.Call("user32::GetFocus");

  else if (uMsg == 7 /*WM_SETFOCUS*/)
  {
    {
      CheckExcel();
      GetParametersSourceFile();
      AkelPad.SendMessage(aWnd[IDSOURCELB][HWND], 0x0186 /*LB_SETCURSEL*/, nSource, 0);
      ShowSourceName();
      CheckButtons();
      SetEditTexts();
      FillTargetLB();
      oSys.Call("user32::SetFocus", hFocus);
    }
  }

  else if (uMsg == 0x8000)
    ShowSourceWindow();

  else if (uMsg == 256 /*WM_KEYDOWN*/)
  {
    if (wParam == 27 /*VK_ESCAPE*/)
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if ((uMsg == 260) /*WM_SYSKEYDOWN*/ &&
           (oSys.Call("user32::GetKeyState", 0x10 /*VK_SHIFT*/) & 0x8000))
  {
    if (wParam == 0x27) //VK_RIGHT
      MoveWindow("R");
    else if (wParam == 0x25) //VK_LEFT
      MoveWindow("L");
    else if (wParam == 0x28) //VK_DOWN
      MoveWindow("D");
    else if (wParam == 0x26) //VK_UP
      MoveWindow("U");
    else if (wParam == 0x23) //VK_END
      MoveWindow("E");
    else if (wParam == 0x24) //VK_HOME
      MoveWindow("H");
    else if (wParam == 0x22) //VK_NEXT
      MoveWindow("B");
    else if (wParam == 0x21) //VK_PRIOR
      MoveWindow("T");
    else if (wParam == 0x43) //C key
      MoveWindow("C");
  }

  else if (uMsg == 273 /*WM_COMMAND*/)
  {
    var nLowParam = LoWord(wParam);
    var nHiwParam = HiWord(wParam);

    if (nLowParam == IDSOURCELB)
    {
      if (nHiwParam == 1 /*LBN_SELCHANGE*/)
      {
        nSource = AkelPad.SendMessage(lParam, 0x0188 /*LB_GETCURSEL*/, 0, 0);
        CheckExcel();
        ShowSourceWindow();
        ShowSourceName();
        FillTargetLB();
      }
    }
    else if (nLowParam == IDOPENB)
      OpenFile();
    else if (nLowParam == IDSAVEB)
      SaveFile();
    else if ((nLowParam == IDBEFORESTARTB) ||
             (nLowParam == IDAFTERFIELDB) ||
             (nLowParam == IDAFTERROWB) ||
             (nLowParam == IDAFTERENDB) ||
             (nLowParam == IDDELAYDATAB) ||
             (nLowParam == IDDELAYKEYSB))
      CheckButtons(nLowParam);
    else if ((nLowParam == IDBEFORESTARTE) ||
             (nLowParam == IDAFTERFIELDE) ||
             (nLowParam == IDAFTERROWE) ||
             (nLowParam == IDAFTERENDE) ||
             (nLowParam == IDDELAYDATAE) ||
             (nLowParam == IDDELAYKEYSE))
    {
      if (nHiwParam == 0x0200 /*EN_KILLFOCUS*/)
        GetEditTexts();
    }
    else if ((nLowParam == IDKEYSMENUB1) || (nLowParam == IDKEYSMENUB2) ||
             (nLowParam == IDKEYSMENUB3) || (nLowParam == IDKEYSMENUB4))
      MenuKeys(nLowParam);
    else if (nLowParam == IDTARGETLB)
    {
      if (nHiwParam == 1 /*LBN_SELCHANGE*/)
        ShowTargetWindow(true);
    }
    else if (nLowParam == IDREFRESHB)
    {
      FillTargetLB();
      ShowTargetWindow(true);
    }
    else if (nLowParam == IDSENDB)
      SendData();
  }

  else if (uMsg == 16 /*WM_CLOSE*/)
  {
    ReadWriteIni(true);
    oSys.Call("user32::DestroyWindow", hWnd); //Destroy dialog
  }

  else if (uMsg == 2 /*WM_DESTROY*/)
    oSys.Call("user32::PostQuitMessage", 0); //Exit message loop

  return 0;
}

function ReadWriteIni(bWrite)
{
  var oFSO     = new ActiveXObject("Scripting.FileSystemObject");
  var sIniFile = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";
  var sIniTxt;
  var oFile;
  var oRect;
  var oError;
  var i;

  if (bWrite)
  {
    GetEditTexts();
    oRect   = GetWindowPos(hWndDlg);
    sIniTxt =
      'nWndX='         + oRect.X      + ';\r\n' +
      'nWndY='         + oRect.Y      + ';\r\n' +
      'nSource='       + nSource      + ';\r\n' +
      'bBeforeStart='  + bBeforeStart + ';\r\n' +
      'bAfterField='   + bAfterField  + ';\r\n' +
      'bAfterRow='     + bAfterRow    + ';\r\n' +
      'bAfterEnd='     + bAfterEnd    + ';\r\n' +
      'bDelayData='    + bDelayData   + ';\r\n' +
      'bDelayKeys='    + bDelayKeys   + ';\r\n' +
      'sBeforeStart="' + sBeforeStart.replace(/[\\"]/g, "\\$&") + '";\r\n' +
      'sAfterField="'  + sAfterField.replace(/[\\"]/g, "\\$&")  + '";\r\n' +
      'sAfterRow="'    + sAfterRow.replace(/[\\"]/g, "\\$&")    + '";\r\n' +
      'sAfterEnd="'    + sAfterEnd.replace(/[\\"]/g, "\\$&")    + '";\r\n' +
      'sDelayData="'   + sDelayData   + '";\r\n' +
      'sDelayKeys="'   + sDelayKeys   + '";';

    oFile = oFSO.OpenTextFile(sIniFile, 2, true, -1);
    oFile.Write(sIniTxt);
    oFile.Close();
  }

  else if (oFSO.FileExists(sIniFile))
  {
    try
    {
      eval(AkelPad.ReadFile(sIniFile));
    }
    catch (oError)
    {
    }
  }
}

function GetWindowPos(hWnd)
{
  var oRect  = new Object();
  var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)

  oSys.Call("user32::GetWindowRect", hWnd, lpRect);

  oRect.X = AkelPad.MemRead(lpRect,      3 /*DT_DWORD*/);
  oRect.Y = AkelPad.MemRead(lpRect +  4, 3 /*DT_DWORD*/);
  oRect.W = AkelPad.MemRead(lpRect +  8, 3 /*DT_DWORD*/) - oRect.X;
  oRect.H = AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/) - oRect.Y;

  AkelPad.MemFree(lpRect);
  return oRect;
}

function MoveWindow(sAction)
{
  var oRectDesk = GetWindowPos(oSys.Call("user32::GetDesktopWindow"));
  var oRect     = GetWindowPos(hWndDlg);

  if (sAction == "R") //Right
    oRect.X = oRect.X + ((oRect.X < oRectDesk.X + oRectDesk.W - 50) ? 20 : 0);
  else if (sAction == "L") //Left
    oRect.X = oRect.X - ((oRect.X + oRect.W > oRectDesk.X + 50) ? 20 : 0);
  else if (sAction == "D") //Down
    oRect.Y = oRect.Y + ((oRect.Y < oRectDesk.Y + oRectDesk.H - 50) ? 20 : 0);
  else if (sAction == "U") //Up
    oRect.Y = oRect.Y - ((oRect.Y + oRect.H > oRectDesk.Y + 50) ? 20 : 0);
  else if (sAction == "E") //End (to right edge)
    oRect.X = oRectDesk.X + oRectDesk.W - oRect.W;
  else if (sAction == "H") //Home (to left edge)
    oRect.X = oRectDesk.X;
  else if (sAction == "B") //Bottom edge
    oRect.Y = oRectDesk.Y + oRectDesk.H - oRect.H;
  else if (sAction == "T") //Top edge
    oRect.Y = oRectDesk.Y;
  else if (sAction == "C") //Center
  {
    oRect.X = oRectDesk.X + oRectDesk.W / 2 - oRect.W / 2;
    oRect.Y = oRectDesk.Y + oRectDesk.H / 2 - oRect.H / 2;
  }

  oSys.Call("user32::SetWindowPos", hWndDlg, 0, oRect.X, oRect.Y, 0, 0, 0x15 /*SWP_NOZORDER|SWP_NOACTIVATE|SWP_NOSIZE*/);
}

function SetWndFontAndText(hWnd, hFont, sText)
{
  AkelPad.SendMessage(hWnd, 48 /*WM_SETFONT*/, hFont, true);
  oSys.Call("user32::SetWindowText" + _TCHAR, hWnd, sText);
}

function LoWord(nParam)
{
  return (nParam & 0xFFFF);
}

function HiWord(nParam)
{
  return ((nParam >> 16) & 0xFFFF);
}

function FillSourceLB()
{
  var oError;

  oSys.Call("user32::SendMessage" + _TCHAR, aWnd[IDSOURCELB][HWND], 0x0180 /*LB_ADDSTRING*/, 0, sTxtTextSemic);
  oSys.Call("user32::SendMessage" + _TCHAR, aWnd[IDSOURCELB][HWND], 0x0180 /*LB_ADDSTRING*/, 0, sTxtTextPipe);
  oSys.Call("user32::SendMessage" + _TCHAR, aWnd[IDSOURCELB][HWND], 0x0180 /*LB_ADDSTRING*/, 0, sTxtTextTab);

  try
  {
    if (oSys.Call("user32::FindWindow" + _TCHAR, sExcelClass, 0))
    {
      oExcel = GetObject("", "Excel.Application");
      bExcelWasRunning = true;
    }
    else
      oExcel = new ActiveXObject("Excel.Application");

    oSys.Call("user32::ShowWindow", oSys.Call("user32::FindWindow" + _TCHAR, sExcelClass, 0), 5 /*SW_SHOW*/);
    oSys.Call("user32::SendMessage" + _TCHAR, aWnd[IDSOURCELB][HWND], 0x0180 /*LB_ADDSTRING*/, 0, sTxtWorksheet);
  }
  catch (oError)
  {
    if (nSource == 3)
      --nSource;
  }

  AkelPad.SendMessage(aWnd[IDSOURCELB][HWND], 0x0186 /*LB_SETCURSEL*/, nSource, 0);
}

function ShowSourceWindow()
{
  var hWndSource = GetSourceWnd();

  if (! oSys.Call("user32::IsWindowVisible", hWndSource))
  {
    oSys.Call("user32::ShowWindow", hWndSource, 5 /*SW_SHOW*/);

    if (hWndSource == hMainWnd)
      AkelPad.SendMessage(hMainWnd, 1277 /*AKD_RESIZE*/, 0, 0);
  }

  if (oSys.Call("user32::IsIconic", hWndSource))
    oSys.Call("user32::ShowWindow", hWndSource, 9 /*SW_RESTORE*/);

  SetForegroundWindow(hWndSource);
  SetForegroundWindow(hWndDlg);
}

function GetSourceWnd()
{
  if (nSource == 3) //Excel
    return oSys.Call("user32::FindWindow" + _TCHAR, sExcelClass, 0);
  else
    return hMainWnd;
}

function SetForegroundWindow(hWndSet)
{
  var nStopTime = new Date().getTime() + 2000;

  oSys.Call("user32::SetForegroundWindow", hWndSet);

  while ((oSys.Call("user32::GetForegroundWindow", 0) != hWndSet) &&
         (new Date().getTime() < nStopTime))
    WScript.Sleep(5);
}

function ShowSourceName()
{
  var sSource;

  if (nSource == 3) //Excel
  {
    if (IsExcelBusy())
      sSource = sTxtExcelBusy;
    else
    {
      if (oExcel.Workbooks.Count)
        sSource = oExcel.ActiveWorkbook.Name + ":" + oExcel.ActiveSheet.Name;
      else
        sSource = sTxtNoOpenFiles;
    }
  }
  else
  {
    if (AkelPad.GetEditWnd())
    {
      sSource = AkelPad.GetEditFile(0).substr(AkelPad.GetEditFile(0).lastIndexOf("\\") + 1);
      if (! sSource)
        sSource = sTxtNoFileName;
    }
    else
      sSource = sTxtNoOpenFiles;
  }

  SetWndFontAndText(aWnd[IDSOURCES][HWND], hGuiFont, sSource);
}

function CheckExcel()
{
  if (nSource == 3)
  {
    var hWndExcel = oSys.Call("user32::FindWindow" + _TCHAR, sExcelClass, 0);

    if (! oSys.Call("user32::IsWindowVisible", hWndExcel))
    {
      oExcel.Quit();
      oExcel = new ActiveXObject("Excel.Application");

      hWndExcel = oSys.Call("user32::FindWindow" + _TCHAR, sExcelClass, 0);
      oSys.Call("user32::ShowWindow", hWndExcel, 5 /*SW_SHOW*/);
      if (oSys.Call("user32::IsIconic", hWndExcel))
        oSys.Call("user32::ShowWindow", hWndExcel, 9 /*SW_RESTORE*/);
    }
  }
}

function IsExcelBusy()
{
  var oError;

  try
  {
    oExcel.Workbooks.Count;
  }
  catch (oError)
  {
    return true;
  }

  return false;
}

function CheckButtons(nButton)
{
  if (nButton == IDBEFORESTARTB)
    bBeforeStart = ! bBeforeStart;
  else if (nButton == IDAFTERFIELDB)
    bAfterField = ! bAfterField;
  else if (nButton == IDAFTERROWB)
    bAfterRow = ! bAfterRow;
  else if (nButton == IDAFTERENDB)
    bAfterEnd = ! bAfterEnd;
  else if (nButton == IDDELAYDATAB)
    bDelayData = ! bDelayData;
  else if (nButton == IDDELAYKEYSB)
    bDelayKeys = ! bDelayKeys;

  AkelPad.SendMessage(aWnd[IDBEFORESTARTB][HWND], 241 /*BM_SETCHECK*/, bBeforeStart, 0);
  AkelPad.SendMessage(aWnd[IDAFTERFIELDB ][HWND], 241 /*BM_SETCHECK*/, bAfterField,  0);
  AkelPad.SendMessage(aWnd[IDAFTERROWB   ][HWND], 241 /*BM_SETCHECK*/, bAfterRow,    0);
  AkelPad.SendMessage(aWnd[IDAFTERENDB   ][HWND], 241 /*BM_SETCHECK*/, bAfterEnd,    0);
  AkelPad.SendMessage(aWnd[IDDELAYDATAB  ][HWND], 241 /*BM_SETCHECK*/, bDelayData,   0);
  AkelPad.SendMessage(aWnd[IDDELAYKEYSB  ][HWND], 241 /*BM_SETCHECK*/, bDelayKeys,   0);
}

function GetEditTexts()
{
  var nBufSize = 65;
  var lpBuffer = AkelPad.MemAlloc(nBufSize * _TSIZE);

  oSys.Call("user32::GetWindowText" + _TCHAR, aWnd[IDBEFORESTARTE][HWND], lpBuffer, nBufSize);
  sBeforeStart = AkelPad.MemRead(lpBuffer, _TSTR);
  oSys.Call("user32::GetWindowText" + _TCHAR, aWnd[IDAFTERFIELDE][HWND], lpBuffer, nBufSize);
  sAfterField = AkelPad.MemRead(lpBuffer, _TSTR);
  oSys.Call("user32::GetWindowText" + _TCHAR, aWnd[IDAFTERROWE][HWND], lpBuffer, nBufSize);
  sAfterRow = AkelPad.MemRead(lpBuffer, _TSTR);
  oSys.Call("user32::GetWindowText" + _TCHAR, aWnd[IDAFTERENDE][HWND], lpBuffer, nBufSize);
  sAfterEnd = AkelPad.MemRead(lpBuffer, _TSTR);
  oSys.Call("user32::GetWindowText" + _TCHAR, aWnd[IDDELAYDATAE][HWND], lpBuffer, nBufSize);
  sDelayData = AkelPad.MemRead(lpBuffer, _TSTR);
  oSys.Call("user32::GetWindowText" + _TCHAR, aWnd[IDDELAYKEYSE][HWND], lpBuffer, nBufSize);
  sDelayKeys = AkelPad.MemRead(lpBuffer, _TSTR);

  AkelPad.MemFree(lpBuffer);
}

function SetEditTexts()
{
  SetWndFontAndText(aWnd[IDBEFORESTARTE][HWND], hGuiFont, sBeforeStart);
  SetWndFontAndText(aWnd[IDAFTERFIELDE ][HWND], hGuiFont, sAfterField);
  SetWndFontAndText(aWnd[IDAFTERROWE   ][HWND], hGuiFont, sAfterRow);
  SetWndFontAndText(aWnd[IDAFTERENDE   ][HWND], hGuiFont, sAfterEnd);
  SetWndFontAndText(aWnd[IDDELAYDATAE  ][HWND], hGuiFont, sDelayData);
  SetWndFontAndText(aWnd[IDDELAYKEYSE  ][HWND], hGuiFont, sDelayKeys);
}

function MenuKeys(nID)
{
  var aKey =
      [["Ctrl"       , "*CTRL"],
       ["Shift"      , "*SH"],
       ["Alt"        , "*ALT"],
       ["Enter"      , "*ENT"],
       ["Esc"        , "*ESC"],
       ["Insert"     , "*INS"],
       ["Delete"     , "*DEL"],
       ["BackSpace"  , "*BS"],
       ["Tab"        , "*TAB"],
       ["Down"       , "*DN"],
       ["Up"         , "*UP"],
       ["Right"      , "*RT"],
       ["Left"       , "*LT"],
       ["Page Down"  , "*PGDN"],
       ["Page Up"    , "*PGUP"],
       ["End"        , "*END"],
       ["Home"       , "*HOME"],
       ["F1"         , "*F1"],
       ["F2"         , "*F2"],
       ["F3"         , "*F3"],
       ["F4"         , "*F4"],
       ["F5"         , "*F5"],
       ["F6"         , "*F6"],
       ["F7"         , "*F7"],
       ["F8"         , "*F8"],
       ["F9"         , "*F9"],
       ["F10"        , "*F10"],
       ["F11"        , "*F11"],
       ["F12"        , "*F12"],
       ["+"          , "*+"],
       ["^"          , "*^"],
       ["%"          , "*%"],
       ["~"          , "*~"],
       ["("          , "*("],
       [")"          , "*)"],
       ["["          , "*["],
       ["]"          , "*]"],
       ["{"          , "*{"],
       ["}"          , "*}"],
       ["delay (ms)" , "*100"]];
  var oRect = GetWindowPos(aWnd[nID][HWND]);
  var hMenu = oSys.Call("user32::CreatePopupMenu");
  var nFlag;
  var nCmd;
  var i;

  for (i = 0; i < aKey.length; ++i)
  {
    if (i == Math.ceil(aKey.length / 2))
      nFlag = 0x60; //MF_MENUBREAK|MF_MENUBARBREAK|MF_STRING
    else
      nFlag = 0x00; //MF_STRING

    oSys.Call("user32::AppendMenu" + _TCHAR, hMenu, nFlag, i + 1, aKey[i][0] + "\t" + aKey[i][1]);
  }

  nCmd = oSys.Call("user32::TrackPopupMenu", hMenu, 0x188 /*TPM_RETURNCMD|TPM_NONOTIFY|TPM_RIGHTALIGN*/,
                   oRect.X + oRect.W, oRect.Y + oRect.H, 0, hWndDlg, 0);
  oSys.Call("user32::DestroyMenu", hMenu);

  if (nCmd)
    oSys.Call("user32::SendMessage" + _TCHAR,
              aWnd[nID - 1][HWND], 0x00C2 /*EM_REPLACESEL*/, 1, aKey[nCmd - 1][1]);
}

function GetParametersSourceFile()
{
  var oRE = GetParametersRegExp();
  var aString;
  var sFile;
  var sStream;
  var oError;

  if (nSource == 3) //Excel
  {
    if (! IsExcelBusy())
    {
      if (oExcel.Workbooks.Count &&
          ActiveSheetIsWorksheet() &&
          oExcel.ActiveSheet.Range("A1").Comment)
        aString = oRE.exec(oExcel.ActiveSheet.Range("A1").Comment.Text());
    }
  }
  else
  {
    sFile   = AkelPad.GetEditFile(0);
    sStream = sScriptName + "Paramaters";

    if (IsSupportStreams(sFile.substr(0, 3)))
    {
      if (IsStreamExists(sFile, sStream))
        aString = oRE.exec(AkelPad.ReadFile(sFile + ":" + sStream));
    }
  }

  try
  {
    eval(aString[0]);
  }
  catch (oError)
  {
  }
}

function ActiveSheetIsWorksheet(bMessage)
{
  if (oExcel.ActiveSheet.Type == -4167 /*xlWorksheet*/)
    return true;
  else
  {
    if (bMessage)
      AkelPad.MessageBox(hWndDlg, sTxtNoWorksheet, sScriptName, 0x00000030 /*MB_ICONWARNING*/);
    return false;
  }
}

function GetParametersRegExp()
{
  var oMarker = GetParametersMarker();

  return new RegExp(Escape(oMarker.Begin) + "[\\s\\S]*" + Escape(oMarker.End));
}

function GetParametersMarker()
{
  return {Begin : "/*Begin SendData parameters block*/",
          End   : "/*End SendData parameters block*/"};
}

function Escape(sText)
{
  return sText.replace(/[\\\/.^$+*?|()\[\]{}]/g, "\\$&");
}

function OpenFile()
{
  var hWndSource = GetSourceWnd();

  SetForegroundWindow(hWndSource);
  WScript.Sleep(10);

  if (nSource == 3) //Excel
  {
    if (IsExcelBusy())
      AkelPad.MessageBox(hWndSource, sTxtUnableExec, sScriptName, 0x00000030 /*MB_ICONWARNING*/);
    else
      oWshShell.SendKeys("^o");
  }
  else
    AkelPad.Command(4103); //IDM_FILE_OPEN
}

function SaveFile()
{
  var hWndSource = GetSourceWnd();
  var oRE        = GetParametersRegExp();
  var oMarker    = GetParametersMarker();
  var sText      =
        oMarker.Begin + "\n" +
        'bBeforeStart='  + bBeforeStart + ';\n' +
        'bAfterField='   + bAfterField  + ';\n' +
        'bAfterRow='     + bAfterRow    + ';\n' +
        'bAfterEnd='     + bAfterEnd    + ';\n' +
        'bDelayData='    + bDelayData   + ';\n' +
        'bDelayKeys='    + bDelayKeys   + ';\n' +
        'sBeforeStart="' + sBeforeStart.replace(/[\\"]/g, "\\$&") + '";\n' +
        'sAfterField="'  + sAfterField.replace(/[\\"]/g, "\\$&")  + '";\n' +
        'sAfterRow="'    + sAfterRow.replace(/[\\"]/g, "\\$&")    + '";\n' +
        'sAfterEnd="'    + sAfterEnd.replace(/[\\"]/g, "\\$&")    + '";\n' +
        'sDelayData="'   + sDelayData   + '";\n' +
        'sDelayKeys="'   + sDelayKeys   + '";\n' +
        oMarker.End;
  var sFile;
  var sStream;
  var sOldText;
  var hMenuMain;
  var nWatchState;

  if (nSource == 3) //Excel
  {
    if (IsExcelBusy())
    {
      SetForegroundWindow(hWndSource);
      AkelPad.MessageBox(hWndSource, sTxtUnableExec, sScriptName, 0x00000030 /*MB_ICONWARNING*/);
    }
    else if ((oExcel.Workbooks.Count) && (ActiveSheetIsWorksheet(1)) && (WantSave()))
    {
      SetForegroundWindow(hWndSource);

      if (oExcel.ActiveSheet.Range("A1").Comment)
      {
        sOldText = oExcel.ActiveSheet.Range("A1").Comment.Text();
        if (oRE.test(sOldText))
          sText = sOldText.replace(oRE, sText);
        else if (sOldText)
          sText = sOldText + "\n" + sText;

        oExcel.ActiveSheet.Range("A1").Comment.Text(sText);
      }
      else
        oExcel.ActiveSheet.Range("A1").AddComment(sText);

      oExcel.ActiveSheet.Range("A1").Comment.Visible = false;
      oExcel.ActiveWorkbook.Save();

      SetForegroundWindow(hWndDlg);
    }
  }

  else if (AkelPad.GetEditWnd() && (WantSave()))
  {
    SetForegroundWindow(hWndSource);

    sFile        = AkelPad.GetEditFile(0);
    sStream      = sScriptName + "Paramaters";
    nWatchState  = 0;

    if (IsSupportStreams(sFile.substr(0, 3)))
    {
      hMenuMain   = AkelPad.SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 21 /*MI_MENUMAIN*/, 0);
      nWatchState = oSys.Call("user32::GetMenuState", hMenuMain, 4253 /*IDM_OPTIONS_WATCHFILE*/, 0 /*MF_BYCOMMAND*/);

      if (nWatchState & 0x8 /*MF_CHECKED*/)
        AkelPad.Command(4253 /*IDM_OPTIONS_WATCHFILE*/);

      if (IsStreamExists(sFile, sStream))
      {
        sOldText = AkelPad.ReadFile(sFile + ":" + sStream);
        if (oRE.test(sOldText))
          sText = sOldText.replace(oRE, sText);
        else if (sOldText)
          sText = sOldText + "\n" + sText;
      }
      else
        CreateFile(sFile, sStream);

      WriteFile(sFile, sStream, sText, 1);
    }

    AkelPad.Command(4105); //IDM_FILE_SAVE
    AkelPad.Command(4104); //IDM_FILE_REOPEN

    if (nWatchState & 0x8 /*MF_CHECKED*/)
      AkelPad.Command(4253 /*IDM_OPTIONS_WATCHFILE*/);

    SetForegroundWindow(hWndDlg);
  }
}

function WantSave()
{
  var sFileName;

  if (nSource == 3) //Excel
     sFileName = oExcel.ActiveWorkbook.Name;
  else
  {
    sFileName = AkelPad.GetEditFile(0).substr(AkelPad.GetEditFile(0).lastIndexOf("\\") + 1);
    if (! sFileName)
      sFileName = sTxtNoFileName;
  }

  if (AkelPad.MessageBox(hWndDlg, sTxtWantSave + "\n" + sFileName, sScriptName,
                         0x00000021 /*MB_DEFBUTTON1|MB_ICONQUESTION|MB_OKCANCEL*/) == 1 /*IDOK*/)
    return true;
  else
    return false;
}

function FillTargetLB()
{
  var nPosSel  = AkelPad.SendMessage(aWnd[IDTARGETLB][HWND], 0x0188 /*LB_GETCURSEL*/, 0, 0);
  var hWndSel  = GetTargetWnd();
  var aListWnd = EnumWindows();
  var nPos;
  var i;

  aListWnd.sort(
    function(oWndA, oWndB)
    {
      return oSys.Call("kernel32::lstrcmpi" + _TCHAR,
                       oWndA.Title + "  " + oWndA.Handle,
                       oWndB.Title + "  " + oWndB.Handle);
    });

  AkelPad.SendMessage(aWnd[IDTARGETLB][HWND], 0x0184 /*LB_RESETCONTENT*/, 0, 0);

  for (i = 0; i < aListWnd.length; ++i)
  {
    nPos = oSys.Call("user32::SendMessage" + _TCHAR, aWnd[IDTARGETLB][HWND], 0x0180 /*LB_ADDSTRING*/, 0, aListWnd[i].Title);
    AkelPad.SendMessage(aWnd[IDTARGETLB][HWND], 0x019A /*LB_SETITEMDATA*/, nPos, aListWnd[i].Handle);
  }

  if (nPosSel >= 0)
  {
    nPos = -1;
    for (i = 0; i < aListWnd.length; ++i)
    {
      if (hWndSel == aListWnd[i].Handle)
      {
        nPos = i;
        break;
      }
    }

    if (nPos == -1)
    {
      if (nPosSel < aListWnd.length)
        nPos = nPosSel;
      else
        nPos = aListWnd.length - 1;
    }
  }
  else
    nPos = 0;

  AkelPad.SendMessage(aWnd[IDTARGETLB][HWND], 0x0186 /*LB_SETCURSEL*/, nPos, 0);
}

function EnumWindows()
{
  var hWndSource = GetSourceWnd();
  var lpEnum     = AkelPad.MemAlloc(4004);
  var lpInfo     = AkelPad.MemAlloc(260 * _TSIZE);
  var aWnd       = [];
  var lpEnumCallback;
  var hWnd;
  var sTitle;
  var bVisible;
  var bToolWin;
  var nX1;
  var nX2;
  var nY1;
  var nY2;
  var sClass;
  var hProcess;
  var sBaseName;
  var i;

  lpEnumCallback = oSys.RegisterCallback("EnumWindowsProc");
  oSys.Call("user32::EnumWindows", lpEnumCallback, lpEnum);
  oSys.UnregisterCallback(lpEnumCallback);

  for (i = 0; i < AkelPad.MemRead(lpEnum, 3 /*DT_DWORD*/); ++i)
  {
    hWnd = AkelPad.MemRead(lpEnum + (i + 1) * 4, 3 /*DT_DWORD*/);

    AkelPad.SendMessage(hWnd, 0x000D /*WM_GETTEXT*/, 260, lpInfo);
    sTitle   = AkelPad.MemRead(lpInfo, _TSTR);
    bVisible = oSys.Call("user32::IsWindowVisible", hWnd);
    bToolWin = oSys.Call("user32::GetWindowLong" + _TCHAR, hWnd, -20 /*GWL_EXSTYLE*/) & 0x00000080 /*WS_EX_TOOLWINDOW*/;

    oSys.Call("user32::GetWindowRect", hWnd, lpInfo);
    nX1 = AkelPad.MemRead(lpInfo,      3 /*DT_DWORD*/);
    nY1 = AkelPad.MemRead(lpInfo +  4, 3 /*DT_DWORD*/);
    nX2 = AkelPad.MemRead(lpInfo +  8, 3 /*DT_DWORD*/);
    nY2 = AkelPad.MemRead(lpInfo + 12, 3 /*DT_DWORD*/);

    oSys.Call("user32::GetClassName" + _TCHAR, hWnd, lpInfo, 260);
    sClass = AkelPad.MemRead(lpInfo, _TSTR);

    oSys.Call("user32::GetWindowThreadProcessId", hWnd, lpInfo);
    hProcess = oSys.Call("Kernel32::OpenProcess",
                         0x0410 /*PROCESS_QUERY_INFORMATION|PROCESS_VM_READ*/,
                         0,
                         AkelPad.MemRead(lpInfo, 3 /*DT_DWORD*/) /*==PID*/);
    oSys.Call("Psapi::GetModuleBaseName" + _TCHAR, hProcess, 0, lpInfo, 260);
    sBaseName = AkelPad.MemRead(lpInfo, _TSTR).toUpperCase();
    oSys.Call("Kernel32::CloseHandle", hProcess);

    if (sTitle && bVisible && (nX2 - nX1) && (nY2 - nY1) && (! bToolWin) &&
        (hWnd != hWndDlg) && (hWnd != hWndSource) &&
        (((sBaseName == "EXCEL.EXE") && (sClass == sExcelClass)) || (sBaseName != "EXCEL.EXE")))
      aWnd[aWnd.length] = {Handle : hWnd,
                           Title  : sTitle};
  }

  AkelPad.MemFree(lpEnum);
  AkelPad.MemFree(lpInfo);
  return aWnd;
}

function EnumWindowsProc(hWnd, lParam)
{
  AkelPad.MemCopy(lParam, AkelPad.MemRead(lParam, 3 /*DT_DWORD*/) + 1, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lParam + AkelPad.MemRead(lParam, 3 /*DT_DWORD*/) * 4, hWnd, 3 /*DT_DWORD*/);

  if (AkelPad.MemRead(lParam, 3 /*DT_DWORD*/) < 4000)
    return true;
  else
    return false;
}

function ShowTargetWindow(bRestoreDialog)
{
  var hWndTarget = GetTargetWnd();

  if ((hWndTarget) && (IsWindow(hWndTarget)))
  {
    oSys.Call("user32::ShowWindow", hWndTarget, 5 /*SW_SHOW*/);

    if (oSys.Call("user32::IsIconic", hWndTarget))
      oSys.Call("user32::ShowWindow", hWndTarget, 9 /*SW_RESTORE*/);

    SetForegroundWindow(hWndTarget);

    if (bRestoreDialog)
      SetForegroundWindow(hWndDlg);

    return true;
  }
  else
    return false;
}

function GetTargetWnd()
{
  var nPos = AkelPad.SendMessage(aWnd[IDTARGETLB][HWND], 0x0188 /*LB_GETCURSEL*/, 0, 0);

  if (nPos >= 0)
    return AkelPad.SendMessage(aWnd[IDTARGETLB][HWND], 0x0199 /*LB_GETITEMDATA*/, nPos, 0);
  else
    return 0;
}

function IsWindow(hWnd)
{
  if (oSys.Call("user32::IsWindow", hWnd))
    return true;
  else
  {
    if (AkelPad.MessageBox(hWndDlg, sTxtWinClosed, sScriptName,
                           0x00000031 /*MB_DEFBUTTON1|MB_ICONWARNING|MB_OKCANCEL*/) == 1 /*IDOK*/)
      FillTargetLB();
    return false;
  }
}

function SendData()
{
  var bTerminate = false;
  var nSentRows  = 0;
  var nTotalRows = 0;
  var oSheet;
  var nR1;
  var nC1;
  var nR2;
  var nC2;
  var sSep;
  var nBegSel;
  var aField;
  var oHwnd;
  var nFieldType;
  var r, c;

  if ((! IsDataToSend()) || (! ShowTargetWindow(false)))
    return;

  oSys.Call("user32::ShowWindow", hWndDlg, 7 /*SW_SHOWMINNOACTIVE*/);

  oHwnd = CreateSendStatusWindow();

  if (bBeforeStart)
    SendKeys(sBeforeStart, oHwnd);

  if (nSource == 3) //Excel
  {
    oSheet = oExcel.ActiveSheet;
    nR1    = oExcel.Selection.Row;
    nC1    = oExcel.Selection.Column;
    nR2    = nR1 + oExcel.Selection.Rows.Count - 1;
    nC2    = nC1 + oExcel.Selection.Columns.Count - 1;

    for (r = nR1; r <= nR2; ++r)
    {
      if (! oSheet.Rows(r).Hidden)
        ++nTotalRows;
    }

    SetWndFontAndText(oHwnd.SentRows, hGuiFont, sTxtNumRows + " 0/" + nTotalRows);

    for (r = nR1; r <= nR2; ++r)
    {
      if (! oSheet.Rows(r).Hidden)
      {
        for (c = nC1; c <= nC2; ++c)
        {
          if (! oSheet.Columns(c).Hidden)
          {
            SetWndFontAndText(oHwnd.CurCell, hGuiFont,
                              sTxtRow + r + "         "  + sTxtColumn + c + "        " +
                              sTxtCell + oSheet.Cells(r, c).AddressLocal(0 /*RowAbsolute*/, 0 /*ColumnAbsolute*/));

            nFieldType = SendKeys(oSheet.Cells(r, c).Text, oHwnd);

            if ((c < nC2) && (bAfterField) && (nFieldType == 0))
              SendKeys(sAfterField, oHwnd);

            if (bTerminate = TerminateSend())
              break;
          }
        }

        if (bTerminate)
          break;

        SetWndFontAndText(oHwnd.SentRows, hGuiFont, sTxtNumRows + " " + (++nSentRows) + "/" + nTotalRows);

        if ((r < nR2) && (bAfterRow))
          SendKeys(sAfterRow, oHwnd);
      }
    }

    if (bTerminate)
    {
      oSheet.Range(oSheet.Cells(r, nC1), oSheet.Cells(nR2, nC2)).Select();
      oSheet.Cells(r, c).Activate();
    }
    else
      oSheet.Cells(nR2, nC2).Select();
  }

  else
  {
    if (nSource == 0)
      sSep = ";";
    else if (nSource == 1)
      sSep = "|";
    else
      sSep = "\t";

    nBegSel = AkelPad.GetSelStart();
    aField  = AkelPad.GetSelText().split("\r");

    SetWndFontAndText(oHwnd.SentRows, hGuiFont, sTxtNumRows + " 0/" + aField.length);

    for (r = 0; r < aField.length; ++r)
    {
      aField[r] = aField[r].split(sSep);

      for (c = 0; c < aField[r].length; ++c)
      {
        SetWndFontAndText(oHwnd.CurCell, hGuiFont,
                          sTxtRow + (r + 1) + "         "  + sTxtColumn + (c + 1) + "        " +
                          sTxtOffset + nBegSel);

        nFieldType = SendKeys(aField[r][c], oHwnd);
        nBegSel   += aField[r][c].length + 1;

        if ((c < aField[r].length - 1) && (bAfterField) && (nFieldType == 0))
          SendKeys(sAfterField, oHwnd);

        if (bTerminate = TerminateSend())
          break;
      }

      if (bTerminate)
        break;

      SetWndFontAndText(oHwnd.SentRows, hGuiFont, sTxtNumRows + " " + (++nSentRows) + "/" + aField.length);

      if ((r < aField.length - 1) && (bAfterRow))
        SendKeys(sAfterRow, oHwnd);
    }

    if (nBegSel > AkelPad.GetSelEnd())
      nBegSel = AkelPad.GetSelEnd();

    AkelPad.SetSel(AkelPad.GetSelEnd(), nBegSel);
  }

  if (bAfterEnd && (! bTerminate))
    SendKeys(sAfterEnd, oHwnd);

  if (! bTerminate)
    AkelPad.MessageBox(GetTargetWnd(), sTxtEndSend, sScriptName, 0x00000040 /*MB_ICONINFORMATION*/);

  oSys.Call("user32::DestroyWindow", oHwnd.Main);
  oSys.Call("user32::ShowWindow", hWndDlg, 1 /*SW_SHOWNORMAL*/);

}

function IsDataToSend()
{
  var bIsData = false;

  if (nSource == 3) //Excel
  {
    if (IsExcelBusy())
      AkelPad.MessageBox(hWndDlg, sTxtUnableExec, sScriptName, 0x00000030 /*MB_ICONWARNING*/);
    else if (! oExcel.Workbooks.Count)
      AkelPad.MessageBox(hWndDlg, sTxtNoWorkbook, sScriptName, 0x00000030 /*MB_ICONWARNING*/);
    else if (ActiveSheetIsWorksheet(1))
    {
      if ((oExcel.Selection.Areas(1).Rows.Count == 1) &&
          (oExcel.Selection.Areas(1).Columns.Count == 1))
        AkelPad.MessageBox(hWndDlg, sTxtNoSelection, sScriptName, 0x00000030 /*MB_ICONWARNING*/);
      else
        bIsData = true;
    }
  }
  else
  {
    if (! AkelPad.GetEditWnd())
      AkelPad.MessageBox(hWndDlg, sTxtNoOpenText, sScriptName, 0x00000030 /*MB_ICONWARNING*/);
    else if (AkelPad.GetSelStart() == AkelPad.GetSelEnd())
      AkelPad.MessageBox(hWndDlg, sTxtNoSelection, sScriptName, 0x00000030 /*MB_ICONWARNING*/);
    else
      bIsData = true;
  }

  return bIsData;
}

function SendKeys(sField, oHwnd)
{
  var nFieldType;
  var aKeys;
  var aDelay;
  var oError;
  var i;

  SetWndFontAndText(oHwnd.CurSent, hGuiFont, sTxtCurSent + sField);

  //Keys and delay field
  if ((sField.length > 1) && (sField.charAt(0) == "\\") && (sField.charAt(1) != "\\"))
  {
    nFieldType = 1;
    aKeys      = sField.substr(1).split(/\*\d+/);
    aDelay     = sField.substr(1).match(/\*\d+/g);

    if (aKeys.length)
    {
      for (i = 0; i < aKeys.length; ++i)
      {
        if (aKeys[i])
        {
          aKeys[i] = GetStringKeys(aKeys[i]);

          try
          {
            oWshShell.SendKeys(aKeys[i]);
          }
          catch (oError)
          {
            SetWndFontAndText(oHwnd.Error, hGuiFont, sTxtKeysError + sField);
          }
        }

        if (aDelay && (i < aDelay.length))
          WScript.Sleep(Number(aDelay[i].substr(1)));
      }
    }
    else if(aDelay && aDelay.length)
    {
      for (i = 0; i < aDelay.length; ++i)
        WScript.Sleep(Number(aDelay[i].substr(1)));
    }

    if (bDelayKeys)
      WScript.Sleep(Number(sDelayKeys));
  }

  //Data field
  else
  {
    nFieldType = 0;
    sField     = sField.replace(/[\{\}\[\]\(\)\+\^%~]/g, "{$&}");

    if ((sField.length > 1) && (sField.charAt(0) == "\\"))
      sField = sField.substr(1);

    if (sField)
    {
      oWshShell.SendKeys(sField);

      if (bDelayKeys)
        WScript.Sleep(Number(sDelayData));
    }
  }

  return nFieldType;
}

function GetStringKeys(sKeys)
{
  var oKey =
      {"*CTRL"  : "^",
       "*SH"    : "+",
       "*ALT"   : "%",
       "*ENT"   : "~",
       "*ESC"   : "{ESC}",
       "*INS"   : "{INS}",
       "*DEL"   : "{DEL}",
       "*BS"    : "{BS}",
       "*TAB"   : "{TAB}",
       "*DN"    : "{DOWN}",
       "*UP"    : "{UP}",
       "*RT"    : "{RIGHT}",
       "*LT"    : "{LEFT}",
       "*PGDN"  : "{PGDN}",
       "*PGUP"  : "{PGUP}",
       "*END"   : "{END}",
       "*HOME"  : "{HOME}",
       "*F12"   : "{F12}",
       "*F11"   : "{F11}",
       "*F10"   : "{F10}",
       "*F9"    : "{F9}",
       "*F8"    : "{F8}",
       "*F7"    : "{F7}",
       "*F6"    : "{F6}",
       "*F5"    : "{F5}",
       "*F4"    : "{F4}",
       "*F3"    : "{F3}",
       "*F2"    : "{F2}",
       "*F1"    : "{F1}",
       "*+"     : "{+}",
       "*^"     : "{^}",
       "*%"     : "{%}",
       "*~"     : "{~}",
       "*("     : "{(}",
       "*)"     : "{)}",
       "*["     : "{[}",
       "*]"     : "{]}",
       "*{"     : "{{}",
       "*}"     : "{}}"};
  var sPattern = "";
  var n;

  for (n in oKey)
    sPattern += "(" + Escape(n) + ")|";

  sPattern = sPattern.slice(0, -1);

  sKeys = sKeys.replace(new RegExp(sPattern, "g"),
                        function(sSubKey)
                        {
                          return oKey[sSubKey];
                        } );
  return sKeys;
}

function TerminateSend()
{
  if (oSys.Call("User32::GetAsyncKeyState", 0x1B /*VK_ESCAPE*/) < 0)
  {
    if (AkelPad.MessageBox(GetTargetWnd(), sTxtTerminate, sScriptName,
                           0x00000024 /*MB_DEFBUTTON1|MB_ICONQUESTION|MB_YESNO*/) == 6 /*IDYES*/)
      return true;
  }

  return false;
}

function CreateSendStatusWindow()
{
//                              X,  Y,   W
  var aWndStat = [["CurSent",  10, 10, 999],
                  ["CurCell",  50, 30, 300],
                  ["SentRows", 10, 50, 330],
                  ["Error",    10, 70, 999]];
  var oHwnd  = {};
  var sTitle = sScriptName +": " + sTxtPressEsc;
  var oRect  = GetWindowPos(oSys.Call("user32::GetDesktopWindow"));
  var nW     = 350;
  var nH     = 120;
  var i;

  oHwnd.Main =
    oSys.Call("user32::CreateWindowEx" + _TCHAR,
              0x00000008,   //WS_EX_TOPMOST
              sClassName,   //lpClassName
              sTitle,       //lpWindowName
              0x90C00000,   //WS_VISIBLE|WS_POPUP|WS_CAPTION
              oRect.W - nW, //x
              0,            //y
              nW,           //nWidth
              nH,           //nHeight
              hWndDlg,      //hWndParent
              0,            //ID
              hInstanceDLL, //hInstance
              0);           //lpParam

  for (i = 0; i < aWndStat.length; ++i)
  {
    oHwnd[aWndStat[i][0]] =
      oSys.Call("user32::CreateWindowEx" + _TCHAR,
                0x00000000,     //dwExStyle
                "STATIC",       //lpClassName
                0,              //lpWindowName
                0x50000000,     //dwStyle
                aWndStat[i][1], //x
                aWndStat[i][2], //y
                aWndStat[i][3], //nWidth
                13,             //nHeight
                oHwnd.Main,     //hWndParent
                0,              //ID
                hInstanceDLL,   //hInstance
                0);             //lpParam
  }

  SetWndFontAndText(oHwnd.Error, hGuiFont, sTxtNoErrors);
  return oHwnd;
}
