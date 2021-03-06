// MapNetDrive.js - ver. 2012-07-21
//
// Mapping network drives.
//
// Run in AkelPad:
//   Call("Scripts::Main", 1, "MapNetDrive.js")
// Run from command line (after registration: regsvr32.exe Scripts.dll):
//   wscript.exe MapNetDrive.js
//
// Shortcut keys in dialog box:
// Enter     - Map drive
// Del       - Disconnect network drive (Remove)
// Shift+Del - Delete mapping parameter from the list
// Alt+1     - focus to Drives list box
// Alt+2     - focus to Parameters list box

GetAkelPadObject();

var oSys         = AkelPad.SystemFunction();
var hInstanceDLL = AkelPad.GetInstanceDll();
var sClassName   = "AkelPad::Scripts::" + WScript.ScriptName + "::" + hInstanceDLL;
var hWndDlg;

if (hWndDlg = oSys.Call("User32::FindWindowEx" + _TCHAR, 0, 0, sClassName, 0))
{
  if (! oSys.Call("User32::IsWindowVisible", hWndDlg))
    oSys.Call("User32::ShowWindow", hWndDlg, 8 /*SW_SHOWNA*/);
  if (oSys.Call("User32::IsIconic", hWndDlg))
    oSys.Call("User32::ShowWindow", hWndDlg, 9 /*SW_RESTORE*/);

  oSys.Call("User32::SetForegroundWindow", hWndDlg);
}
else
{
  if (oSys.Call("kernel32::GetUserDefaultLangID") == 0x0415) //Polish
  {
    var sTxtCaption    = "Mapowanie dysków sieciowych";
    var sTxtDrive      = "Dysk";
    var sTxtResource   = "Zasób sieciowy";
    var sTxtServer     = "serwer";
    var sTxtShare      = "udział";
    var sTxtUser       = "Użytkownik";
    var sTxtPassword   = "Hasło";
    var sTxtMap        = "&Mapuj";
    var sTxtRemove     = "&Odłącz";
    var sTxtParams     = "Parametry mapowania";
    var sTxtNew        = "&Nowy";
    var sTxtEdit       = "&Edycja";
    var sTxtDelete     = "&Usuń";
    var sTxtWait       = "Czekaj...";
    var sTxtOK         = "OK";
    var sTxtCancel     = "Anuluj";
    var sTxtError      = "Błąd";
    var sTxtNoParams   = "Brak zdefiniowanych parametrów mapowania.";
    var sTxtDisconnect = "Odłączanie dysku sieciowego";
    var sTxtIsDiscon   = "Czy chcesz odłączyć od zasobu sieciowego dysk";
    var sTxtNewParam   = "Nowy parametr";
    var sTxtEditParam  = "Edycja parametru";
    var sTxtNoResource = "Musisz wpisać zasób sieciowy.";
    var sTxtIsDelete   = "Czy chcesz usunąć ten parametr z listy?";
  }
  else
  {
    var sTxtCaption    = "Mapping network drives";
    var sTxtDrive      = "Drive";
    var sTxtResource   = "Network resource";
    var sTxtServer     = "server";
    var sTxtShare      = "share";
    var sTxtUser       = "User";
    var sTxtPassword   = "Password";
    var sTxtMap        = "&Map";
    var sTxtRemove     = "&Remove";
    var sTxtParams     = "Mapping parameters";
    var sTxtNew        = "&New";
    var sTxtEdit       = "&Edit";
    var sTxtDelete     = "&Delete";
    var sTxtWait       = "Wait...";
    var sTxtOK         = "OK";
    var sTxtCancel     = "Cancel";
    var sTxtError      = "Error";
    var sTxtNoParams   = "There are no defined mapping parameters.";
    var sTxtDisconnect = "Disconnect network drive";
    var sTxtIsDiscon   = "Do you want disconnect from network resource drive";
    var sTxtNewParam   = "New parameter";
    var sTxtEditParam  = "Edit parameter";
    var sTxtNoResource = "You must type network resource.";
    var sTxtIsDelete   = "Do you want delete this parameter from the list?";
  }

  var DT_DWORD        = 3;
  var LB_ADDSTRING    = 0x0180;
  var LB_DELETESTRING = 0x0182;
  var LB_RESETCONTENT = 0x0184;
  var LB_SETCURSEL    = 0x0186;
  var LB_GETCURSEL    = 0x0188;
  var LB_GETTEXT      = 0x0189;
  var LB_SETTABSTOPS  = 0x0192;
  var LBN_SELCHANGE   = 1;
  var LBN_DBLCLK      = 2;

  var hIcon = oSys.Call("User32::LoadImage" + _TCHAR,
                        hInstanceDLL, //hinst
                        101,          //lpszName
                        1,            //uType=IMAGE_ICON
                        0,            //cxDesired
                        0,            //cyDesired
                        0x00000040);  //fuLoad=LR_DEFAULTSIZE

  var hGuiFont = oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
  var hMainWnd = AkelPad.GetMainWnd();
  var nBufSize = 260;
  var lpBuffer = AkelPad.MemAlloc(nBufSize * _TSIZE);
  var nWndX    = 250;
  var nWndY    = 80;
  var aParam   = [];
  var hFocus;
  var hFocusEd;
  var bNewParam;

  var CLASS   = 0;
  var HWND    = 1;
  var EXSTYLE = 2;
  var STYLE   = 3;
  var X       = 4;
  var Y       = 5;
  var W       = 6;
  var H       = 7;
  var TXT     = 8;

  var aWnd      = [];
  var IDDRV     = 1000;
  var IDDRVRES  = 1001;
  var IDDRVUSER = 1002;
  var IDDRVLB   = 1003;
  var IDMAP     = 1004;
  var IDREMOVE  = 1005;
  var IDPARAM   = 1006;
  var IDPARRES  = 1007;
  var IDPARUSER = 1008;
  var IDPARLB   = 1009;
  var IDPARNEW  = 1010;
  var IDPAREDIT = 1011;
  var IDPARDEL  = 1012;
  var IDWAIT    = 1013;
  //0x50000000 - WS_VISIBLE|WS_CHILD
  //0x50000007 - WS_VISIBLE|WS_CHILD|BS_GROUPBOX
  //0x50010000 - WS_VISIBLE|WS_CHILD|WS_TABSTOP
  //0x50010080 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_AUTOHSCROLL
  //0x50400001 - WS_VISIBLE|WS_CHILD|WS_DLGFRAME|SS_CENTER
  //0x50A10081 - WS_VISIBLE|WS_CHILD|WS_VSCROLL|WS_BORDER|WS_TABSTOP|LBS_USETABSTOPS|LBS_NOTIFY
  //Windows             CLASS,HWND,EXSTYLE,      STYLE,   X,   Y,   W,   H, TXT
  aWnd[IDDRV    ] = ["STATIC",   0,      0, 0x50000000,  10,  10, 100,  13, sTxtDrive];
  aWnd[IDDRVRES ] = ["STATIC",   0,      0, 0x50000000,  47,  10, 100,  13, sTxtResource];
  aWnd[IDDRVUSER] = ["STATIC",   0,      0, 0x50000000, 330,  10, 100,  13, sTxtUser];
  aWnd[IDDRVLB  ] = ["LISTBOX",  0,      0, 0x50A10081,  10,  25, 470, 200, ""];
  aWnd[IDMAP    ] = ["BUTTON",   0,      0, 0x50010000, 160, 215,  80,  23, sTxtMap];
  aWnd[IDREMOVE ] = ["BUTTON",   0,      0, 0x50010000, 250, 215,  80,  23, sTxtRemove];
  aWnd[IDPARAM  ] = ["BUTTON",   0,      0, 0x50000007,  10, 250, 470, 255, sTxtParams];
  aWnd[IDPARRES ] = ["STATIC",   0,      0, 0x50000000,  20, 270, 100,  13, sTxtResource];
  aWnd[IDPARUSER] = ["STATIC",   0,      0, 0x50000000, 303, 270, 100,  13, sTxtUser];
  aWnd[IDPARLB  ] = ["LISTBOX",  0,      0, 0x50A10081,  20, 285, 450, 200, ""];
  aWnd[IDPARNEW ] = ["BUTTON",   0,      0, 0x50010000, 115, 475,  80,  23, sTxtNew];
  aWnd[IDPAREDIT] = ["BUTTON",   0,      0, 0x50010000, 205, 475,  80,  23, sTxtEdit];
  aWnd[IDPARDEL ] = ["BUTTON",   0,      0, 0x50010000, 295, 475,  80,  23, sTxtDelete];
  aWnd[IDWAIT   ] = ["STATIC",   0,      0, 0x50400001, 130, 100, 240,  80, ""];

  var aWndEd     = [];
  var IDEDRES    = 1100;
  var IDEDRESE   = 1101;
  var IDEDUSER   = 1102;
  var IDEDUSERE  = 1103;
  var IDEDPASS   = 1104;
  var IDEDPASSE  = 1105;
  var IDEDOK     = 1106;
  var IDEDCANCEL = 1107;
  //Windows                CLASS,HWND,EXSTYLE,      STYLE,   X,   Y,   W,   H, TXT
  aWndEd[IDEDRES   ] = ["STATIC",   0,      0, 0x50000000,  10,  10, 200,  13, sTxtResource + " (\\\\" + sTxtServer + "\\" + sTxtShare + ")"];
  aWndEd[IDEDRESE  ] = ["EDIT",     0,  0x200, 0x50010080,  10,  25, 300,  20, ""];
  aWndEd[IDEDUSER  ] = ["STATIC",   0,      0, 0x50000000,  10,  55, 100,  13, sTxtUser];
  aWndEd[IDEDUSERE ] = ["EDIT",     0,  0x200, 0x50010080,  10,  70, 300,  20, ""];
  aWndEd[IDEDPASS  ] = ["STATIC",   0,      0, 0x50000000,  10, 100, 100,  13, sTxtPassword];
  aWndEd[IDEDPASSE ] = ["EDIT",     0,  0x200, 0x50010080,  10, 115, 300,  20, ""];
  aWndEd[IDEDOK    ] = ["BUTTON",   0,      0, 0x50010000,  75, 145,  80,  23, sTxtOK];
  aWndEd[IDEDCANCEL] = ["BUTTON",   0,      0, 0x50010000, 165, 145,  80,  23, sTxtCancel];

  ReadWriteIni(false);
  AkelPad.WindowRegisterClass(sClassName);

  hWndDlg = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                      0,               //dwExStyle
                      sClassName,      //lpClassName
                      sTxtCaption,     //lpWindowName
                      0x90CA0000,      //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX
                      nWndX,           //x
                      nWndY,           //y
                      495,             //nWidth
                      545,             //nHeight
                      hMainWnd,        //hWndParent
                      0,               //ID
                      hInstanceDLL,    //hInstance
                      DialogCallback); //Script function callback. To use it class must be registered by WindowRegisterClass.

  //Allow other scripts running
  AkelPad.ScriptNoMutex();

  //Message loop
  AkelPad.WindowGetMessage();

  AkelPad.WindowUnregisterClass(sClassName);
  AkelPad.MemFree(lpBuffer);
  oSys.Call("user32::DestroyIcon", hIcon);
}

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

    //Hide Wait window
    oSys.Call("user32::ShowWindow", aWnd[IDWAIT][HWND], 0);

    //Set TabStops in listboxes
    AkelPad.MemCopy(lpBuffer,      24, DT_DWORD);
    AkelPad.MemCopy(lpBuffer + 4, 212, DT_DWORD);
    AkelPad.SendMessage(aWnd[IDDRVLB][HWND], LB_SETTABSTOPS, 2, lpBuffer);
    AkelPad.MemCopy(lpBuffer,     190, DT_DWORD);
    AkelPad.SendMessage(aWnd[IDPARLB][HWND], LB_SETTABSTOPS, 1, lpBuffer);

    //Fill listboxes
    FillDrivesLB();
    FillParamLB();
    AkelPad.SendMessage(aWnd[IDDRVLB][HWND], LB_SETCURSEL, 0, 0);
    AkelPad.SendMessage(aWnd[IDPARLB][HWND], LB_SETCURSEL, 0, 0);

    //Check buttons
    CheckMapButtons();
    CheckParamButtons();

    AkelPad.SendMessage(hWnd, 0x0080 /*WM_SETICON*/, 0 /*ICON_SMALL*/, hIcon);

    hFocus = aWnd[IDDRVLB][HWND];
  }

  else if ((uMsg == 6 /*WM_ACTIVATE*/) && (! wParam))
    hFocus = oSys.Call("user32::GetFocus");

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("user32::SetFocus", hFocus);

  else if (uMsg == 256 /*WM_KEYDOWN*/)
  {
    if ((wParam == 13 /*VK_RETURN*/) &&
        oSys.Call("user32::IsWindowEnabled", aWnd[IDMAP][HWND]) &&
        ((oSys.Call("user32::GetFocus") == aWnd[IDDRVLB][HWND]) ||
         (oSys.Call("user32::GetFocus") == aWnd[IDPARLB][HWND])))
    {
      if (! oSys.Call("user32::PeekMessage" + _TCHAR, lpBuffer, hWnd, 0, 0, 0))
        oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDMAP, 0);
    }
    else if (wParam == 0x02E /*VK_DELETE*/)
    {
      if (oSys.Call("user32::GetKeyState", 0x10 /*VK_SHIFT*/) & 0x8000)
        oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDPARDEL, 0);
      else
        oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDREMOVE, 0);
    }
    else if (wParam == 27 /*VK_ESCAPE*/)
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 260) //WM_SYSKEYDOWN
  {
    if (wParam == 0x31) //1 key
      oSys.Call("user32::SetFocus", aWnd[IDDRVLB][HWND]);
    if (wParam == 0x32) //2 key
      oSys.Call("user32::SetFocus", aWnd[IDPARLB][HWND]);
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    var nLowParam = LoWord(wParam);
    var nHiwParam = HiWord(wParam);

    if ((nLowParam == IDDRVLB) && (nHiwParam == LBN_SELCHANGE))
      CheckMapButtons();
    else if ((nLowParam == IDMAP) ||
        ((nLowParam == IDDRVLB) && (nHiwParam == LBN_DBLCLK)))
      MapNetDrive(hWnd);
    else if (nLowParam == IDREMOVE)
      RemoveNetDrive(hWnd);
    else if (nLowParam == IDPARNEW)
    {
      bNewParam = 1;
      EditParamWindow();
    }
    else if ((nLowParam == IDPAREDIT) ||
             ((nLowParam == IDPARLB) && (nHiwParam == LBN_DBLCLK)))
    {
      bNewParam = 0;
      EditParamWindow();
    }
    else if (nLowParam == IDPARDEL)
      DeleteParam(hWnd);
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    ReadWriteIni(true);
    oSys.Call("user32::DestroyWindow", hWnd);
  }

  else if (uMsg == 2) //WM_DESTROY
    //Exit message loop
    oSys.Call("user32::PostQuitMessage", 0);

  else
    oSys.Call("user32::DefDlgProc" + _TCHAR,
              hWnd,
              1025 /*DM_SETDEFID*/,
              oSys.Call("user32::GetDlgCtrlID", oSys.Call("user32::GetFocus")),
              0);

  return 0;
}

function LoWord(nParam)
{
  return (nParam & 0xffff);
}

function HiWord(nParam)
{
  return ((nParam >> 16) & 0xffff);
}

function GetWindowPos(hWnd, oRect)
{
  var lpRect = AkelPad.MemAlloc(16) //sizeof(RECT);

  oSys.Call("user32::GetWindowRect", hWnd, lpRect);

  oRect.X = AkelPad.MemRead(lpRect,      DT_DWORD);
  oRect.Y = AkelPad.MemRead(lpRect +  4, DT_DWORD);
  oRect.W = AkelPad.MemRead(lpRect +  8, DT_DWORD) - oRect.X;
  oRect.H = AkelPad.MemRead(lpRect + 12, DT_DWORD) - oRect.Y;

  AkelPad.MemFree(lpRect);
}

function SetWndFontAndText(hWnd, hFont, sText)
{
  var lpText;

  AkelPad.SendMessage(hWnd, 48 /*WM_SETFONT*/, hFont, true);

  if (lpText = AkelPad.MemAlloc((sText.length + 1) * _TSIZE))
  {
    AkelPad.MemCopy(lpText, sText, _TSTR);
    oSys.Call("user32::SetWindowText" + _TCHAR, hWnd, lpText);
    AkelPad.MemFree(lpText);
  }
}

function FillDrivesLB()
{
  var oDrives     = {};
  var lpDriveName = AkelPad.MemAlloc(3 * _TSIZE);
  var lpName      = AkelPad.MemAlloc(260 * _TSIZE); //sizeof(MAX_PATH)
  var lpNameSize  = AkelPad.MemAlloc(4);
  var nDriveType;
  var sDrive;
  var i;

  for (i = "Z".charCodeAt(0); i >= "A".charCodeAt(0); --i)
  {
    sDrive     = String.fromCharCode(i) + ":";
    nDriveType = oSys.Call("Kernel32::GetDriveType" + _TCHAR, sDrive + "\\");
    if ((nDriveType == 1 /*DRIVE_NO_ROOT_DIR*/) || (nDriveType == 4 /*DRIVE_REMOTE*/))
    {
      oDrives[sDrive] = ["", ""];

      AkelPad.MemCopy(lpDriveName, sDrive, _TSTR);
      AkelPad.MemCopy(lpName, "", _TSTR);
      AkelPad.MemCopy(lpNameSize, 260, DT_DWORD);

      if (oSys.Call("Mpr.dll::WNetGetConnection" + _TCHAR, lpDriveName, lpName, lpNameSize) == 0) //NO_ERROR
        oDrives[sDrive][0] = AkelPad.MemRead(lpName, _TSTR);

      AkelPad.MemCopy(lpName, "", _TSTR);
      AkelPad.MemCopy(lpNameSize, 260, DT_DWORD);

      if (oSys.Call("Mpr.dll::WNetGetUser" + _TCHAR, lpDriveName, lpName, lpNameSize) == 0) //NO_ERROR
        oDrives[sDrive][1] = AkelPad.MemRead(lpName, _TSTR);
    }
  }

  AkelPad.SendMessage(aWnd[IDDRVLB][HWND], LB_RESETCONTENT, 0, 0);
  for (i in oDrives)
  {
    AkelPad.MemCopy(lpBuffer, i  + "\t" + oDrives[i][0] + "\t" + oDrives[i][1], _TSTR);
    AkelPad.SendMessage(aWnd[IDDRVLB][HWND], LB_ADDSTRING, 0, lpBuffer);
  }

  AkelPad.MemFree(lpDriveName);
  AkelPad.MemFree(lpName);
  AkelPad.MemFree(lpNameSize);
}

function FillParamLB()
{
  var i;

  AkelPad.SendMessage(aWnd[IDPARLB][HWND], LB_RESETCONTENT, 0, 0);

  for (i = 0; i < aParam.length; ++i)
  {
    AkelPad.MemCopy(lpBuffer, aParam[i][0] + "\t" + aParam[i][1], _TSTR);
    AkelPad.SendMessage(aWnd[IDPARLB][HWND], LB_ADDSTRING, 0, lpBuffer);
  }
}

function CheckMapButtons()
{
  var nDrvPos = AkelPad.SendMessage(aWnd[IDDRVLB][HWND], LB_GETCURSEL, 0, 0);
  var sResource;

  AkelPad.SendMessage(aWnd[IDDRVLB][HWND], LB_GETTEXT, nDrvPos, lpBuffer);
  sResource = AkelPad.MemRead(lpBuffer, _TSTR).substring(3, AkelPad.MemRead(lpBuffer, _TSTR).lastIndexOf("\t"));

  oSys.Call("user32::EnableWindow", aWnd[IDMAP   ][HWND], (sResource) ? 0 : 1);
  oSys.Call("user32::EnableWindow", aWnd[IDREMOVE][HWND], (sResource) ? 1 : 0);

  if (! oSys.Call("user32::IsWindowEnabled", oSys.Call("user32::GetFocus")))
    oSys.Call("user32::SetFocus", aWnd[IDDRVLB][HWND]);
}

function CheckParamButtons()
{
  oSys.Call("user32::EnableWindow", aWnd[IDPAREDIT][HWND], (aParam.length) ? 1 : 0);
  oSys.Call("user32::EnableWindow", aWnd[IDPARDEL ][HWND], (aParam.length) ? 1 : 0);

  if (! oSys.Call("user32::IsWindowEnabled", oSys.Call("user32::GetFocus")))
    oSys.Call("user32::SetFocus", aWnd[IDPARLB][HWND]);
}

function MapNetDrive(hWnd)
{
  var WshNetwork = new ActiveXObject("WScript.Network");
  var nDrvPos    = AkelPad.SendMessage(aWnd[IDDRVLB][HWND], LB_GETCURSEL, 0, 0);
  var nParPos    = AkelPad.SendMessage(aWnd[IDPARLB][HWND], LB_GETCURSEL, 0, 0);
  var sDrive;
  var oError;

  if (nParPos < 0)
  {
    AkelPad.MessageBox(hWnd, sTxtNoParams, sTxtError, 48);
    return;
  }

  oSys.Call("user32::ShowWindow", aWnd[IDWAIT][HWND], 1);
  SetWndFontAndText(aWnd[IDWAIT][HWND], hGuiFont, "\n\n" + sTxtWait);

  AkelPad.SendMessage(aWnd[IDDRVLB][HWND], LB_GETTEXT, nDrvPos, lpBuffer);
  sDrive = AkelPad.MemRead(lpBuffer, _TSTR).substring(0, 2);

  try
  {
    WshNetwork.RemoveNetworkDrive(sDrive, 1 /*bForce*/, 1 /*bUpdateProfile*/);
  }
  catch (oError)
  {
  }

  try
  {
    WshNetwork.MapNetworkDrive(sDrive, aParam[nParPos][0], 1 /*bUpdateProfile*/, aParam[nParPos][1], aParam[nParPos][2]);
  }
  catch (oError)
  {
    oSys.Call("user32::ShowWindow", aWnd[IDWAIT][HWND], 0);
    AkelPad.MessageBox(hWnd,
                       oError.description + ((oError.description != oError.message) ? "\n" + oError.message : ""),
                       sTxtError, 48);
  }

  oSys.Call("user32::ShowWindow", aWnd[IDWAIT][HWND], 0);
  FillDrivesLB();
  AkelPad.SendMessage(aWnd[IDDRVLB][HWND], LB_SETCURSEL, nDrvPos, 0);
  CheckMapButtons();
}

function RemoveNetDrive(hWnd)
{
  var WshNetwork = new ActiveXObject("WScript.Network");
  var nDrvPos    = AkelPad.SendMessage(aWnd[IDDRVLB][HWND], LB_GETCURSEL, 0, 0);
  var sDrive;
  var oError;

  if (oSys.Call("user32::IsWindowEnabled", aWnd[IDREMOVE][HWND]))
  {
    AkelPad.SendMessage(aWnd[IDDRVLB][HWND], LB_GETTEXT, nDrvPos, lpBuffer);
    sDrive = AkelPad.MemRead(lpBuffer, _TSTR).substring(0, 2);

    if (AkelPad.MessageBox(hWnd,
                           sTxtIsDiscon + " " + sDrive + " ?",
                           sTxtDisconnect,
                           0x00000023 /*MB_DEFBUTTON1|MB_ICONQUESTION|MB_YESNOCANCEL*/) == 6 /*IDYES*/)
    {
      try
      {
        WshNetwork.RemoveNetworkDrive(sDrive, 1 /*bForce*/, 1 /*bUpdateProfile*/);
      }
      catch (oError)
      {
      }

      FillDrivesLB();
      AkelPad.SendMessage(aWnd[IDDRVLB][HWND], LB_SETCURSEL, nDrvPos, 0);
      CheckMapButtons();
    }
  }
}

function DeleteParam(hWnd)
{
  var nParPos = AkelPad.SendMessage(aWnd[IDPARLB][HWND], LB_GETCURSEL, 0, 0);

  if ((nParPos > -1) &&
      (AkelPad.MessageBox(hWnd,
                          sTxtResource + ": " + aParam[nParPos][0] + "\n" +
                          sTxtUser + ": " + aParam[nParPos][1] + "\n\n" +
                          sTxtIsDelete,
                          sTxtDelete.replace(/&/, ""),
                          0x00000023 /*MB_DEFBUTTON1|MB_ICONQUESTION|MB_YESNOCANCEL*/) == 6 /*IDYES*/))
  {
    aParam.splice(nParPos, 1);
    AkelPad.SendMessage(aWnd[IDPARLB][HWND], LB_DELETESTRING, nParPos, 0);

    if (nParPos == aParam.length)
      --nParPos;

    AkelPad.SendMessage(aWnd[IDPARLB][HWND], LB_SETCURSEL, nParPos, 0);
    CheckParamButtons();
  }
}

function EditParamWindow()
{
  var oRect = new Object();
  var sWndName;
  var nParPos;

  GetWindowPos(hWndDlg, oRect);

  if (bNewParam)
  {
    sWndName = sTxtNewParam;
    aWndEd[IDEDRESE ][TXT] = "";
    aWndEd[IDEDUSERE][TXT] = "";
    aWndEd[IDEDPASSE][TXT] = "";
  }
  else
  {
    sWndName = sTxtEditParam;
    nParPos  = AkelPad.SendMessage(aWnd[IDPARLB][HWND], LB_GETCURSEL, 0, 0);
    aWndEd[IDEDRESE ][TXT] = aParam[nParPos][0];
    aWndEd[IDEDUSERE][TXT] = aParam[nParPos][1];
    aWndEd[IDEDPASSE][TXT] = aParam[nParPos][2];
  }

  oSys.Call("user32::CreateWindowEx" + _TCHAR,
            0,                 //dwExStyle
            sClassName,        //lpClassName
            sWndName,          //lpWindowName
            0x90CA0000,        //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX
            oRect.X + 90,      //x
            oRect.Y + 310,     //y
            325,               //nWidth
            210,               //nHeight
            hWndDlg,           //hWndParent
            0,                 //ID
            hInstanceDLL,      //hInstance
            DialogCallbackEd); //lpParam
        
  oSys.Call("user32::EnableWindow", hMainWnd, 0);
  oSys.Call("user32::EnableWindow", hWndDlg, 0);
}

function DialogCallbackEd(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    var i;

    for (i = 1100; i < aWndEd.length; ++i)
    {
      aWndEd[i][HWND] =
        oSys.Call("user32::CreateWindowEx" + _TCHAR,
                  aWndEd[i][EXSTYLE], //dwExStyle
                  aWndEd[i][CLASS],   //lpClassName
                  0,                  //lpWindowName
                  aWndEd[i][STYLE],   //dwStyle
                  aWndEd[i][X],       //x
                  aWndEd[i][Y],       //y
                  aWndEd[i][W],       //nWidth
                  aWndEd[i][H],       //nHeight
                  hWnd,               //hWndParent
                  i,                  //ID
                  hInstanceDLL,       //hInstance
                  0);                 //lpParam
      //Set font and text
      SetWndFontAndText(aWndEd[i][HWND], hGuiFont, aWndEd[i][TXT]);
    }

    AkelPad.SendMessage(aWndEd[IDEDRESE ][HWND], 197 /*EM_SETLIMITTEXT*/, 128, 0);
    AkelPad.SendMessage(aWndEd[IDEDUSERE][HWND], 197 /*EM_SETLIMITTEXT*/, 128, 0);
    AkelPad.SendMessage(aWndEd[IDEDPASSE][HWND], 197 /*EM_SETLIMITTEXT*/, 128, 0);
    AkelPad.SendMessage(aWndEd[IDEDRESE ][HWND], 177 /*EM_SETSEL*/, 0, -1);

    AkelPad.SendMessage(hWnd, 0x0080 /*WM_SETICON*/, 0 /*ICON_SMALL*/, hIcon);

    hFocusEd = aWndEd[IDEDRESE][HWND];
  }

  else if ((uMsg == 6 /*WM_ACTIVATE*/) && (! wParam))
    hFocusEd = oSys.Call("user32::GetFocus");

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("user32::SetFocus", hFocusEd);

  else if (uMsg == 256 /*WM_KEYDOWN*/)
  {
    if ((wParam == 13 /*VK_RETURN*/) &&
        (oSys.Call("user32::GetFocus") != aWndEd[IDEDOK][HWND]))
    {
      if (! oSys.Call("user32::PeekMessage" + _TCHAR, lpBuffer, hWnd, 0, 0, 0))
        oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDEDOK, 0);
    }
    else if (wParam == 27 /*VK_ESCAPE*/)
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    var nLowParam = LoWord(wParam);

    if (nLowParam == IDEDOK)
    {
      if (InsertChangeParam(hWnd))
        oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
    }
    else if (nLowParam == IDEDCANCEL)
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    oSys.Call("user32::EnableWindow", hMainWnd, 1);
    oSys.Call("user32::EnableWindow", hWndDlg, 1);
    oSys.Call("user32::DestroyWindow", hWnd);
  }

  else
    oSys.Call("user32::DefDlgProc" + _TCHAR,
              hWnd,
              1025 /*DM_SETDEFID*/,
              oSys.Call("user32::GetDlgCtrlID", oSys.Call("user32::GetFocus")),
              0);

  return 0;
}

function InsertChangeParam(hWnd)
{
  var sResource;
  var sUser;
  var sPassword;
  var nParPos;
  var i;

  oSys.Call("user32::GetWindowText" + _TCHAR, aWndEd[IDEDRESE][HWND], lpBuffer, nBufSize);
  sResource = AkelPad.MemRead(lpBuffer, _TSTR);
  oSys.Call("user32::GetWindowText" + _TCHAR, aWndEd[IDEDUSERE][HWND], lpBuffer, nBufSize);
  sUser = AkelPad.MemRead(lpBuffer, _TSTR);
  oSys.Call("user32::GetWindowText" + _TCHAR, aWndEd[IDEDPASSE][HWND], lpBuffer, nBufSize);
  sPassword = AkelPad.MemRead(lpBuffer, _TSTR);

  if (! sResource)
  {
    AkelPad.MessageBox(hWnd, sTxtNoResource, sTxtError, 48);
    oSys.Call("user32::SetFocus", aWndEd[IDEDRESE][HWND]);
    return 0;
  }

  if (bNewParam)
    nParPos = aParam.push([]) - 1;
  else
    nParPos = AkelPad.SendMessage(aWnd[IDPARLB][HWND], LB_GETCURSEL, 0, 0);

  aParam[nParPos][0] = sResource;
  aParam[nParPos][1] = sUser;
  aParam[nParPos][2] = sPassword;

  aParam.sort(function(a, b)
    {
      if (a[0] < b[0])
        return -1;
      else if (a[0] > b[0])
        return  1;
      else if (a[1] < b[1])
        return -1;
      else if (a[1] > b[1])
        return 1;
      else
        return 0;
    });

  //Find in Param array
  for (i = 0; i < aParam.length; ++i)
  {
    if ((aParam[i][0] == sResource) && (aParam[i][1] == sUser) && (aParam[i][2] == sPassword))
    {
      nParPos = i;
      break;
    }
  }

  FillParamLB();
  AkelPad.SendMessage(aWnd[IDPARLB][HWND], LB_SETCURSEL, nParPos, 0);
  CheckParamButtons();

  return 1;
}

function GetAkelPadObject()
{
  if (typeof AkelPad == "undefined")
  {
    var oError;

    try
    {
      AkelPad = new ActiveXObject("AkelPad.Document");
      _TCHAR  = AkelPad.Constants._TCHAR;
      _TSTR   = AkelPad.Constants._TSTR;
      _TSIZE  = AkelPad.Constants._TSIZE;
    }
    catch (oError)
    {
      WScript.Echo("You need register Scripts.dll");
      WScript.Quit();
    }
  }
}

function ReadWriteIni(bWrite)
{
  var oRect    = new Object();
  var oFSO     = new ActiveXObject("Scripting.FileSystemObject");
  var sIniFile = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";
  var sIniTxt;
  var oFile;
  var oError;
  var i;

  if (bWrite)
  {
    GetWindowPos(hWndDlg, oRect);

    sIniTxt = 'nWndX=' + oRect.X + ';\r\n' +
              'nWndY=' + oRect.Y + ';\r\n' +
              'aParam=[';

    for (i = 0; i < aParam.length; ++i)
      sIniTxt += '["' +
                 aParam[i][0].replace(/[\\"]/g, '\\$&') + '","' +
                 aParam[i][1].replace(/[\\"]/g, '\\$&') + '","' +
                 aParam[i][2].replace(/[\\"]/g, '\\$&') + '"]' +
                 ((i == aParam.length - 1) ? '' : ',');

    sIniTxt += '];';

    oFile = oFSO.OpenTextFile(sIniFile, 2, true, -1);
    oFile.Write(sIniTxt);
    oFile.Close();
  }

  else if (oFSO.FileExists(sIniFile))
  {
    oFile = oFSO.OpenTextFile(sIniFile, 1, false, -1);

    try
    {
      eval(oFile.ReadAll());
    }
    catch (oError)
    {
    }

    oFile.Close();
  }
}
