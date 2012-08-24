// WindowsList.js - ver. 2012-05-22
//
// Call("Scripts::Main", 1, "WindowsList.js")
//
// Shortcut keys in dialog box:
// F9    - refresh list
// Alt+1 - set focus to windows list box

if (! AkelPad.Include("EnumerateWindows_functions.js"))
  WScript.Quit();

var oSys         = AkelPad.SystemFunction();
var hInstanceDLL = AkelPad.GetInstanceDll();
var sClassName   = "AkelPad::Scripts::" + WScript.ScriptName + "::" + hInstanceDLL;
var sScripName   = "Windows list";
var hGuiFont     = oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
var nWndX        = 220;
var nWndY        = 40;
var nTitle       = 1;
var nVisible     = 1;
var nMinim       = 2;
var nMaxim       = 2;
var nSize        = 1;
var nTopMost     = 2;
var nToolWin     = 2;
var hWndDlg;
var hFocus;
var hFocusChild;
var aListTop;
var aListChild;

var CLASS   = 0;
var HWND    = 1;
var EXSTYLE = 2;
var STYLE   = 3;
var X       = 4;
var Y       = 5;
var W       = 6;
var H       = 7;
var TXT     = 8;

var aWnd        = [];
var IDTITLEG    = 1000;
var IDTITLE0    = 1001;
var IDTITLE1    = 1002;
var IDTITLE2    = 1003;
var IDVISIBLEG  = 1004;
var IDVISIBLE0  = 1005;
var IDVISIBLE1  = 1006;
var IDVISIBLE2  = 1007;
var IDMINIMG    = 1008;
var IDMINIM0    = 1009;
var IDMINIM1    = 1010;
var IDMINIM2    = 1011;
var IDMAXIMG    = 1012;
var IDMAXIM0    = 1013;
var IDMAXIM1    = 1014;
var IDMAXIM2    = 1015;
var IDSIZEG     = 1016;
var IDSIZE0     = 1017;
var IDSIZE1     = 1018;
var IDSIZE2     = 1019;
var IDTOPMOSTG  = 1020;
var IDTOPMOST0  = 1021;
var IDTOPMOST1  = 1022;
var IDTOPMOST2  = 1023;
var IDTOOLWING  = 1024;
var IDTOOLWIN0  = 1025;
var IDTOOLWIN1  = 1026;
var IDTOOLWIN2  = 1027;
var IDPROCESS   = 1028;
var IDWNDTITLE  = 1029;
var IDCOUNT     = 1030;
var IDWNDLB     = 1031;
var IDTITLES    = 1032;
var IDTITLEE    = 1033;
var IDCLASSS    = 1034;
var IDCLASSE    = 1035;
var IDHANDLES   = 1036;
var IDHANDLEE   = 1037;
var IDMENUS     = 1038;
var IDMENUE     = 1039;
var IDVISIBLES  = 1040;
var IDVISIBLEE  = 1041;
var IDMINIMS    = 1042;
var IDMINIME    = 1043;
var IDMAXIMS    = 1044;
var IDMAXIME    = 1045;
var IDLOCATIONS = 1046;
var IDLOCATIONE = 1047;
var IDSIZES     = 1048;
var IDSIZEE     = 1049;
var IDTOPMOSTS  = 1050;
var IDTOPMOSTE  = 1051;
var IDTOOLWINS  = 1052;
var IDTOOLWINE  = 1053;
var IDPIDS      = 1054;
var IDPIDE      = 1055;
var IDTIDS      = 1056;
var IDTIDE      = 1057;
var IDFILES     = 1058;
var IDFILEE     = 1059;
var IDREFRESHB  = 1060;
var IDSWITCHTOB = 1061;
var IDHIDESHOWB = 1062;
var IDMINIMIZEB = 1063;
var IDMAXIMIZEB = 1064;
var IDRESTOREB  = 1065;
var IDCENTERB   = 1066;
var IDTOPMOSTB  = 1067;
var IDCHILDB    = 1068;

//0x50000000 - WS_VISIBLE|WS_CHILD
//0x50000002 - WS_VISIBLE|WS_CHILD|SS_RIGHT
//0x50000007 - WS_VISIBLE|WS_CHILD|BS_GROUPBOX
//0x50000009 - WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
//0x50010000 - WS_VISIBLE|WS_CHILD|WS_TABSTOP
//0x50010880 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_READONLY|ES_AUTOHSCROLL
//0x50A10081 - WS_VISIBLE|WS_CHILD|WS_VSCROLL|WS_BORDER|WS_TABSTOP|LBS_USETABSTOPS|LBS_NOTIFY
//0x50A10083 - WS_VISIBLE|WS_CHILD|WS_VSCROLL|WS_BORDER|WS_TABSTOP|LBS_USETABSTOPS|LBS_NOTIFY|LBS_SORT
//Windows                CLASS,HWND,EXSTYLE,      STYLE,   X,   Y,   W,   H, TXT
aWnd[IDTITLEG    ] = ["BUTTON",   0,      0, 0x50000007,  10,  10,  70,  70, "Title"];
aWnd[IDTITLE0    ] = ["BUTTON",   0,      0, 0x50000009,  25,  30,  40,  16, "No"];
aWnd[IDTITLE1    ] = ["BUTTON",   0,      0, 0x50000009,  25,  45,  40,  16, "Yes"];
aWnd[IDTITLE2    ] = ["BUTTON",   0,      0, 0x50000009,  25,  60,  40,  16, "All"];
aWnd[IDVISIBLEG  ] = ["BUTTON",   0,      0, 0x50000007,  90,  10,  70,  70, "Visible"];
aWnd[IDVISIBLE0  ] = ["BUTTON",   0,      0, 0x50000009, 105,  30,  40,  16, "No"];
aWnd[IDVISIBLE1  ] = ["BUTTON",   0,      0, 0x50000009, 105,  45,  40,  16, "Yes"];
aWnd[IDVISIBLE2  ] = ["BUTTON",   0,      0, 0x50000009, 105,  60,  40,  16, "All"];
aWnd[IDMINIMG    ] = ["BUTTON",   0,      0, 0x50000007, 170,  10,  70,  70, "Minimized"];
aWnd[IDMINIM0    ] = ["BUTTON",   0,      0, 0x50000009, 185,  30,  40,  16, "No"];
aWnd[IDMINIM1    ] = ["BUTTON",   0,      0, 0x50000009, 185,  45,  40,  16, "Yes"];
aWnd[IDMINIM2    ] = ["BUTTON",   0,      0, 0x50000009, 185,  60,  40,  16, "All"];
aWnd[IDMAXIMG    ] = ["BUTTON",   0,      0, 0x50000007, 250,  10,  70,  70, "Maximized"];
aWnd[IDMAXIM0    ] = ["BUTTON",   0,      0, 0x50000009, 265,  30,  40,  16, "No"];
aWnd[IDMAXIM1    ] = ["BUTTON",   0,      0, 0x50000009, 265,  45,  40,  16, "Yes"];
aWnd[IDMAXIM2    ] = ["BUTTON",   0,      0, 0x50000009, 265,  60,  40,  16, "All"];
aWnd[IDSIZEG     ] = ["BUTTON",   0,      0, 0x50000007, 330,  10,  70,  70, "Size"];
aWnd[IDSIZE0     ] = ["BUTTON",   0,      0, 0x50000009, 345,  30,  40,  16, "No"];
aWnd[IDSIZE1     ] = ["BUTTON",   0,      0, 0x50000009, 345,  45,  40,  16, "Yes"];
aWnd[IDSIZE2     ] = ["BUTTON",   0,      0, 0x50000009, 345,  60,  40,  16, "All"];
aWnd[IDTOPMOSTG  ] = ["BUTTON",   0,      0, 0x50000007, 410,  10,  70,  70, "TopMost"];
aWnd[IDTOPMOST0  ] = ["BUTTON",   0,      0, 0x50000009, 425,  30,  40,  16, "No"];
aWnd[IDTOPMOST1  ] = ["BUTTON",   0,      0, 0x50000009, 425,  45,  40,  16, "Yes"];
aWnd[IDTOPMOST2  ] = ["BUTTON",   0,      0, 0x50000009, 425,  60,  40,  16, "All"];
aWnd[IDTOOLWING  ] = ["BUTTON",   0,      0, 0x50000007, 490,  10,  70,  70, "ToolWin"];
aWnd[IDTOOLWIN0  ] = ["BUTTON",   0,      0, 0x50000009, 505,  30,  40,  16, "No"];
aWnd[IDTOOLWIN1  ] = ["BUTTON",   0,      0, 0x50000009, 505,  45,  40,  16, "Yes"];
aWnd[IDTOOLWIN2  ] = ["BUTTON",   0,      0, 0x50000009, 505,  60,  40,  16, "All"];
aWnd[IDPROCESS   ] = ["STATIC",   0,      0, 0x50000000,  10,  95, 100,  13, "Process"];
aWnd[IDWNDTITLE  ] = ["STATIC",   0,      0, 0x50000000, 130,  95, 100,  13, "Window title"];
aWnd[IDCOUNT     ] = ["STATIC",   0,      0, 0x50000002, 500,  95,  60,  13, ""];
aWnd[IDWNDLB     ] = ["LISTBOX",  0,      0, 0x50A10083,  10, 110, 550, 200, ""];
aWnd[IDTITLES    ] = ["STATIC",   0,      0, 0x50000000,  10, 310,  60,  13, "Title:"];
aWnd[IDTITLEE    ] = ["EDIT",     0,  0x200, 0x50010880,  65, 310, 415,  20, ""];
aWnd[IDCLASSS    ] = ["STATIC",   0,      0, 0x50000000,  10, 330,  60,  13, "Class:"];
aWnd[IDCLASSE    ] = ["EDIT",     0,  0x200, 0x50010880,  65, 330, 300,  20, ""];
aWnd[IDHANDLES   ] = ["STATIC",   0,      0, 0x50000000,  10, 350,  60,  13, "WinHandle:"];
aWnd[IDHANDLEE   ] = ["EDIT",     0,  0x200, 0x50010880,  65, 350, 175,  20, ""];
aWnd[IDMENUS     ] = ["STATIC",   0,      0, 0x50000000, 243, 350,  60,  13, "MenuHandle:"];
aWnd[IDMENUE     ] = ["EDIT",     0,  0x200, 0x50010880, 305, 350, 175,  20, "hex=FFFFFFFF,  dec=4294967295"];
aWnd[IDVISIBLES  ] = ["STATIC",   0,      0, 0x50000000,  10, 370,  60,  13, "Visible:"];
aWnd[IDVISIBLEE  ] = ["EDIT",     0,  0x200, 0x50010880,  65, 370,  30,  20, ""];
aWnd[IDMINIMS    ] = ["STATIC",   0,      0, 0x50000000,  10, 390,  60,  13, "Minimized:"];
aWnd[IDMINIME    ] = ["EDIT",     0,  0x200, 0x50010880,  65, 390,  30,  20, ""];
aWnd[IDMAXIMS    ] = ["STATIC",   0,      0, 0x50000000,  10, 410,  60,  13, "Maximized:"];
aWnd[IDMAXIME    ] = ["EDIT",     0,  0x200, 0x50010880,  65, 410,  30,  20, ""];
aWnd[IDLOCATIONS ] = ["STATIC",   0,      0, 0x50000000,  10, 430,  60,  13, "Location:"];
aWnd[IDLOCATIONE ] = ["EDIT",     0,  0x200, 0x50010880,  65, 430, 120,  20, ""];
aWnd[IDSIZES     ] = ["STATIC",   0,      0, 0x50000000, 210, 430,  60,  13, "Size:"];
aWnd[IDSIZEE     ] = ["EDIT",     0,  0x200, 0x50010880, 240, 430, 120,  20, ""];
aWnd[IDTOPMOSTS  ] = ["STATIC",   0,      0, 0x50000000,  10, 450,  60,  13, "TopMost:"];
aWnd[IDTOPMOSTE  ] = ["EDIT",     0,  0x200, 0x50010880,  65, 450,  30,  20, ""];
aWnd[IDTOOLWINS  ] = ["STATIC",   0,      0, 0x50000000,  10, 470,  60,  13, "ToolWin:"];
aWnd[IDTOOLWINE  ] = ["EDIT",     0,  0x200, 0x50010880,  65, 470,  30,  20, ""];
aWnd[IDPIDS      ] = ["STATIC",   0,      0, 0x50000000,  10, 490,  60,  13, "ProcessID:"];
aWnd[IDPIDE      ] = ["EDIT",     0,  0x200, 0x50010880,  65, 490, 175,  20, ""];
aWnd[IDTIDS      ] = ["STATIC",   0,      0, 0x50000000, 250, 490,  60,  13, "ThreadID:"];
aWnd[IDTIDE      ] = ["EDIT",     0,  0x200, 0x50010880, 305, 490, 175,  20, ""];
aWnd[IDFILES     ] = ["STATIC",   0,      0, 0x50000000,  10, 510,  60,  13, "ProcFile:"];
aWnd[IDFILEE     ] = ["EDIT",     0,  0x200, 0x50010880,  65, 510, 415,  20, ""];
aWnd[IDREFRESHB  ] = ["BUTTON",   0,      0, 0x50010000, 490, 310,  70,  23, "Refresh (F9)"];
aWnd[IDSWITCHTOB ] = ["BUTTON",   0,      0, 0x50010000, 490, 335,  70,  23, "&Switch to"];
aWnd[IDHIDESHOWB ] = ["BUTTON",   0,      0, 0x50010000, 490, 360,  70,  23, "&Hide/Show"];
aWnd[IDMINIMIZEB ] = ["BUTTON",   0,      0, 0x50010000, 490, 385,  70,  23, "Mi&nimize"];
aWnd[IDMAXIMIZEB ] = ["BUTTON",   0,      0, 0x50010000, 490, 410,  70,  23, "Ma&ximize"];
aWnd[IDRESTOREB  ] = ["BUTTON",   0,      0, 0x50010000, 490, 435,  70,  23, "&Restore"];
aWnd[IDCENTERB   ] = ["BUTTON",   0,      0, 0x50010000, 490, 460,  70,  23, "&Center"];
aWnd[IDTOPMOSTB  ] = ["BUTTON",   0,      0, 0x50010000, 490, 485,  70,  23, "&TopMost"];
aWnd[IDCHILDB    ] = ["BUTTON",   0,      0, 0x50010000, 490, 510,  70,  23, "Child &Win"];

var aWndChild        = [];
var IDCHILDID        = 1100;
var IDCHILDVISIBLE   = 1101;
var IDCHILDENABLED   = 1102;
var IDCHILDCLASS     = 1103;
var IDCHILDTEXT      = 1104;
var IDCHILDCOUNT     = 1105;
var IDCHILDWNDLB     = 1106;
var IDCHILDHANDLES   = 1107;
var IDCHILDHANDLEE   = 1108;
var IDCHILDSTYLES    = 1109;
var IDCHILDSTYLEE    = 1110;
var IDCHILDEXSTYLES  = 1111;
var IDCHILDEXSTYLEE  = 1112;
var IDCHILDLOCATIONS = 1113;
var IDCHILDLOCATIONE = 1114;
var IDCHILDSIZES     = 1115;
var IDCHILDSIZEE     = 1116;

//Windows                         CLASS,HWND,EXSTYLE,      STYLE,   X,   Y,   W,   H, TXT
aWndChild[IDCHILDID       ] = ["STATIC",   0,      0, 0x50000000,  10,  10, 100,  13, "WinID"];
aWndChild[IDCHILDVISIBLE  ] = ["STATIC",   0,      0, 0x50000000,  64,  10, 100,  13, "Visible"];
aWndChild[IDCHILDENABLED  ] = ["STATIC",   0,      0, 0x50000000, 108,  10, 100,  13, "Enabled"];
aWndChild[IDCHILDCLASS    ] = ["STATIC",   0,      0, 0x50000000, 162,  10, 100,  13, "Class"];
aWndChild[IDCHILDTEXT     ] = ["STATIC",   0,      0, 0x50000000, 340,  10, 100,  13, "Text"];
aWndChild[IDCHILDCOUNT    ] = ["STATIC",   0,      0, 0x50000002, 515,  10,  60,  13, ""];
aWndChild[IDCHILDWNDLB    ] = ["LISTBOX",  0,      0, 0x50A10081,  10,  25, 565, 200, ""];
aWndChild[IDCHILDHANDLES  ] = ["STATIC",   0,      0, 0x50000000,  10, 225,  60,  13, "Handle:"];
aWndChild[IDCHILDHANDLEE  ] = ["EDIT",     0,  0x200, 0x50010880,  60, 225, 180,  20, ""];
aWndChild[IDCHILDSTYLES   ] = ["STATIC",   0,      0, 0x50000000,  10, 245,  60,  13, "Style:"];
aWndChild[IDCHILDSTYLEE   ] = ["EDIT",     0,  0x200, 0x50010880,  60, 245, 180,  20, ""];
aWndChild[IDCHILDEXSTYLES ] = ["STATIC",   0,      0, 0x50000000, 260, 245,  60,  13, "ExStyle:"];
aWndChild[IDCHILDEXSTYLEE ] = ["EDIT",     0,  0x200, 0x50010880, 300, 245, 180,  20, ""];
aWndChild[IDCHILDLOCATIONS] = ["STATIC",   0,      0, 0x50000000,  10, 265,  60,  13, "Location:"];
aWndChild[IDCHILDLOCATIONE] = ["EDIT",     0,  0x200, 0x50010880,  60, 265, 120,  20, ""];
aWndChild[IDCHILDSIZES    ] = ["STATIC",   0,      0, 0x50000000, 260, 265,  60,  13, "Size:"];
aWndChild[IDCHILDSIZEE    ] = ["EDIT",     0,  0x200, 0x50010880, 300, 265, 120,  20, ""];



ReadWriteIni(false);

if (AkelPad.WindowRegisterClass(sClassName))
{
  hWndDlg = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                      0,               //dwExStyle
                      sClassName,      //lpClassName
                      sScripName,      //lpWindowName
                      0x90CA0000,      //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX
                      nWndX,           //x
                      nWndY,           //y
                      575,             //nWidth
                      570,             //nHeight
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

  oSys.Call("user32::SetForegroundWindow", hWndDlg);
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

    //Set TabStops in listbox
    SetTabStopsLB(aWnd[IDWNDLB][HWND], [80]);

    hFocus = aWnd[IDWNDLB][HWND];
  }

  else if ((uMsg == 6 /*WM_ACTIVATE*/) && (wParam == 0 /*WA_INACTIVE*/))
    hFocus = oSys.Call("user32::GetFocus");

  else if (uMsg == 7 /*WM_SETFOCUS*/)
  {
    CheckRadioButtons();
    oSys.Call("user32::SetFocus", hFocus);
  }

  else if (uMsg == 256 /*WM_KEYDOWN*/)
  {
    if (wParam == 0x78 /*VK_F9*/)
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDREFRESHB, 0);
    else if (wParam == 27 /*VK_ESCAPE*/)
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 260) //WM_SYSKEYDOWN
  {
    if (wParam == 0x31) //1 key
      oSys.Call("user32::SetFocus", aWnd[IDWNDLB][HWND]);
  }

  else if (uMsg == 273 /*WM_COMMAND*/)
  {
    var nLowParam = LoWord(wParam);
    var nHiwParam = HiWord(wParam);

    if ((nLowParam >= IDTITLE0) && (nLowParam <= IDTITLE2))
    {
      nTitle = nLowParam - IDTITLE0;
      CheckRadioButtons(IDTITLE0);
    }
    else if ((nLowParam >= IDVISIBLE0) && (nLowParam <= IDVISIBLE2))
    {
      nVisible = nLowParam - IDVISIBLE0;
      CheckRadioButtons(IDVISIBLE0);
    }
    else if ((nLowParam >= IDMINIM0) && (nLowParam <= IDMINIM2))
    {
      nMinim = nLowParam - IDMINIM0;
      CheckRadioButtons(IDMINIM0);
    }
    else if ((nLowParam >= IDMAXIM0) && (nLowParam <= IDMAXIM2))
    {
      nMaxim = nLowParam - IDMAXIM0;
      CheckRadioButtons(IDMAXIM0);
    }
    else if ((nLowParam >= IDSIZE0) && (nLowParam <= IDSIZE2))
    {
      nSize = nLowParam - IDSIZE0;
      CheckRadioButtons(IDSIZE0);
    }
    else if ((nLowParam >= IDTOPMOST0) && (nLowParam <= IDTOPMOST2))
    {
      nTopMost = nLowParam - IDTOPMOST0;
      CheckRadioButtons(IDTOPMOST0);
    }
    else if ((nLowParam >= IDTOOLWIN0) && (nLowParam <= IDTOOLWIN2))
    {
      nToolWin = nLowParam - IDTOOLWIN0;
      CheckRadioButtons(IDTOOLWIN0);
    }
    else if (nLowParam == IDWNDLB)
    {
      if (nHiwParam == 1 /*LBN_SELCHANGE*/)
        ShowWndData();
    }
    else if (nLowParam == IDREFRESHB)
      FillWndLB();
    else if (nLowParam == IDSWITCHTOB)
      ShowWindow(-1);
    else if (nLowParam == IDHIDESHOWB)
      ShowWindow(0 /*SW_HIDE*/);
    else if (nLowParam == IDMINIMIZEB)
      ShowWindow(7 /*SW_SHOWMINNOACTIVE*/);
    else if (nLowParam == IDMAXIMIZEB)
      ShowWindow(3 /*SW_MAXIMIZE*/);
    else if (nLowParam == IDRESTOREB)
      ShowWindow(9 /*SW_RESTORE*/);
    else if (nLowParam == IDCENTERB)
      ShowWindow(-2);
    else if (nLowParam == IDTOPMOSTB)
      ShowWindow(-3);
    else if (nLowParam == IDCHILDB)
    {
      ChildWindows();
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDREFRESHB, 0);
    }
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
    oRect   = GetWindowPos(hWndDlg);
    sIniTxt = "nWndX="    + oRect.X  + ";\r\n" +
              "nWndY="    + oRect.Y  + ";\r\n" +
              "nTitle="   + nTitle   + ";\r\n" +
              "nVisible=" + nVisible + ";\r\n" +
              "nMinim="   + nMinim   + ";\r\n" +
              "nMaxim="   + nMaxim   + ";\r\n" +
              "nSize="    + nSize    + ";\r\n" +
              "nTopMost=" + nTopMost + ";\r\n" +
              "nToolWin=" + nToolWin + ";";

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

function SetWndFontAndText(hWnd, hFont, sText)
{
  AkelPad.SendMessage(hWnd, 48 /*WM_SETFONT*/, hFont, true);
  oSys.Call("user32::SetWindowText" + _TCHAR, hWnd, sText);
}

function SetTabStopsLB(hWnd, aTab)
{
  var lpBuffer = AkelPad.MemAlloc(aTab.length * 4);
  var i;

  for (i = 0; i < aTab.length; ++i)
    AkelPad.MemCopy(lpBuffer + i * 4, aTab[i], 3 /*DT_DWORD*/);

  AkelPad.SendMessage(hWnd, 0x0192 /*LB_SETTABSTOPS*/, aTab.length, lpBuffer);

  AkelPad.MemFree(lpBuffer);
}

function LoWord(nParam)
{
  return (nParam & 0xFFFF);
}

function HiWord(nParam)
{
  return ((nParam >> 16) & 0xFFFF);
}

function CheckRadioButtons(nID)
{
  if (nID)
  {
    AkelPad.SendMessage(aWnd[nID    ][HWND], 241 /*BM_SETCHECK*/, 0 /*BST_UNCHECKED*/, 0);
    AkelPad.SendMessage(aWnd[nID + 1][HWND], 241 /*BM_SETCHECK*/, 0 /*BST_UNCHECKED*/, 0);
    AkelPad.SendMessage(aWnd[nID + 2][HWND], 241 /*BM_SETCHECK*/, 0 /*BST_UNCHECKED*/, 0);
  }

  AkelPad.SendMessage(aWnd[IDTITLE0   + nTitle  ][HWND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
  AkelPad.SendMessage(aWnd[IDVISIBLE0 + nVisible][HWND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
  AkelPad.SendMessage(aWnd[IDMINIM0   + nMinim  ][HWND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
  AkelPad.SendMessage(aWnd[IDMAXIM0   + nMaxim  ][HWND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
  AkelPad.SendMessage(aWnd[IDSIZE0    + nSize   ][HWND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
  AkelPad.SendMessage(aWnd[IDTOPMOST0 + nTopMost][HWND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
  AkelPad.SendMessage(aWnd[IDTOOLWIN0 + nToolWin][HWND], 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);

  FillWndLB();
}

function FillWndLB()
{
  var hSelWnd = 0;
  var oInd    = GetSelIndexObject();
  var nPos;
  var i;

  if (oInd.Array >= 0)
    hSelWnd = aListTop[oInd.Array].Handle;

  aListTop = EnumTopLevelWindows(nTitle, nVisible, nMinim, nMaxim, nSize, nTopMost, nToolWin);
  AkelPad.SendMessage(aWnd[IDWNDLB][HWND], 0x0184 /*LB_RESETCONTENT*/, 0, 0);

  for (i = 0; i < aListTop.length; ++i)
  {
    nPos = oSys.Call("user32::SendMessage" + _TCHAR, aWnd[IDWNDLB][HWND], 0x0180 /*LB_ADDSTRING*/, 0,
                     aListTop[i].BaseName + "\t" + aListTop[i].Title);
    AkelPad.SendMessage(aWnd[IDWNDLB][HWND], 0x019A /*LB_SETITEMDATA*/, nPos, i);
  }

  if (hSelWnd)
  {
    nPos = -1;
    for (i = 0; i < AkelPad.SendMessage(aWnd[IDWNDLB][HWND], 0x018B /*LB_GETCOUNT*/, 0, 0); ++i)
    {
      if (hSelWnd == aListTop[AkelPad.SendMessage(aWnd[IDWNDLB][HWND], 0x0199 /*LB_GETITEMDATA*/, i, 0)].Handle)
      {
        nPos = i;
        break;
      }
    }

    if (nPos == -1)
    {
      if (oInd.LB < aListTop.length)
        nPos = oInd.LB;
      else
        nPos = aListTop.length - 1;
    }
  }
  else
    nPos = 0;

  AkelPad.SendMessage(aWnd[IDWNDLB][HWND], 0x0186 /*LB_SETCURSEL*/, nPos, 0);
  ShowWndData();
}

function GetSelIndexObject()
{
  var oInd = new Object();

  oInd.LB = AkelPad.SendMessage(aWnd[IDWNDLB][HWND], 0x0188 /*LB_GETCURSEL*/, 0, 0);

  if (oInd.LB >= 0)
    oInd.Array = AkelPad.SendMessage(aWnd[IDWNDLB][HWND], 0x0199 /*LB_GETITEMDATA*/, oInd.LB, 0);
  else
    oInd.Array = oInd.LB;

  return oInd;
}

function ShowWndData()
{
  var oInd = GetSelIndexObject();

  oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDCOUNT][HWND],
            (oInd.LB + 1).toString() +
            "/" +
            aListTop.length.toString());

  if (oInd.Array >= 0)
  {
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDTITLEE   ][HWND], aListTop[oInd.Array].Title);
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDCLASSE   ][HWND], aListTop[oInd.Array].Class);
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDHANDLEE  ][HWND], HexAndDec(aListTop[oInd.Array].Handle));
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDMENUE    ][HWND], HexAndDec(aListTop[oInd.Array].Menu));
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDVISIBLEE ][HWND], YesOrNo(aListTop[oInd.Array].Visible));
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDMINIME   ][HWND], YesOrNo(aListTop[oInd.Array].Minimized));
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDMAXIME   ][HWND], YesOrNo(aListTop[oInd.Array].Maximized));
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDLOCATIONE][HWND],
              "X=" + aListTop[oInd.Array].X.toString() + ", " +
              "Y=" + aListTop[oInd.Array].Y.toString());
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDSIZEE    ][HWND],
              "W=" + aListTop[oInd.Array].W.toString() + ", " +
              "H=" + aListTop[oInd.Array].H.toString());
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDTOPMOSTE ][HWND], YesOrNo(aListTop[oInd.Array].TopMost));
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDTOOLWINE ][HWND], YesOrNo(aListTop[oInd.Array].ToolWin));
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDPIDE     ][HWND], HexAndDec(aListTop[oInd.Array].PID));
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDFILEE    ][HWND], aListTop[oInd.Array].FileName);
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDTIDE     ][HWND], HexAndDec(aListTop[oInd.Array].TID));
  }
  else
  {
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDTITLEE   ][HWND], "");
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDCLASSE   ][HWND], "");
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDHANDLEE  ][HWND], "");
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDMENUE    ][HWND], "");
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDVISIBLEE ][HWND], "");
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDMINIME   ][HWND], "");
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDMAXIME   ][HWND], "");
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDLOCATIONE][HWND], "");
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDSIZEE    ][HWND], "");
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDTOPMOSTE ][HWND], "");
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDTOOLWINE ][HWND], "");
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDPIDE     ][HWND], "");
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDFILEE    ][HWND], "");
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDTIDE     ][HWND], "");
  }
}

function HexAndDec(nArg)
{
  var sHex = nArg.toString(16).toUpperCase();

  while (sHex.length < 8)
    sHex = "0" + sHex;

  return "hex=" + sHex + ",  dec=" + nArg.toString();
}

function YesOrNo(bArg)
{
  return bArg ? "Yes" : "No";
}

function ShowWindow(nCmdShow)
{
  var oInd = GetSelIndexObject();
  var hWndDesk;
  var oRectDesk;
  var oRectWnd;
  var nExStyle;

  if ((oInd.Array >= 0) && (IsWindow(aListTop[oInd.Array].Handle)))
  {
    if (nCmdShow == -1) //Switch to window
    {
      if (! oSys.Call("user32::IsWindowVisible", aListTop[oInd.Array].Handle))
        oSys.Call("user32::ShowWindow", aListTop[oInd.Array].Handle, 8 /*SW_SHOWNA*/);
      if (oSys.Call("user32::IsIconic", aListTop[oInd.Array].Handle))
        oSys.Call("user32::ShowWindow", aListTop[oInd.Array].Handle, 10 /*SW_RESTORE*/);

      oSys.Call("user32::SetForegroundWindow", aListTop[oInd.Array].Handle);
    }

    else if (nCmdShow == -2) //Center window
    {
      if (oSys.Call("user32::IsWindowVisible", aListTop[oInd.Array].Handle) &&
         (! oSys.Call("user32::IsIconic", aListTop[oInd.Array].Handle)) &&
         (! oSys.Call("user32::IsZoomed", aListTop[oInd.Array].Handle)))
      {
        hWndDesk   = oSys.Call("user32::GetDesktopWindow");
        oRectDesk  = GetWindowPos(hWndDesk);
        oRectWnd   = GetWindowPos(aListTop[oInd.Array].Handle);
        oRectWnd.X = oRectDesk.X + (oRectDesk.W - oRectWnd.W) / 2;
        oRectWnd.Y = oRectDesk.Y + (oRectDesk.H - oRectWnd.H) / 2;

        oSys.Call("user32::SetWindowPos", aListTop[oInd.Array].Handle, 0, oRectWnd.X, oRectWnd.Y, 0, 0,
                                          0x0045 /*SWP_SHOWWINDOW|SWP_NOZORDER|SWP_NOSIZE*/);
        oSys.Call("user32::SetForegroundWindow", hWndDlg);
      }
    }

    else if (nCmdShow == -3) //TopMost switch
    {
      nExStyle = oSys.Call("user32::GetWindowLong" + _TCHAR, aListTop[oInd.Array].Handle, -20 /*GWL_EXSTYLE*/);

      if (nExStyle & 0x00000008 /*WS_EX_TOPMOST*/)
        oSys.Call("user32::SetWindowPos", aListTop[oInd.Array].Handle, -2 /*HWND_NOTOPMOST*/, 0, 0, 0, 0,
                                          0x0043 /*SWP_SHOWWINDOW|SWP_NOMOVE|SWP_NOSIZE*/);
      else
      {
        if (oSys.Call("user32::IsIconic", aListTop[oInd.Array].Handle))
          oSys.Call("user32::ShowWindow", aListTop[oInd.Array].Handle, 9 /*SW_RESTORE*/);

        oSys.Call("user32::SetWindowPos", aListTop[oInd.Array].Handle, -1 /*HWND_TOPMOST*/, 0, 0, 0, 0,
                                          0x0043 /*SWP_SHOWWINDOW|SWP_NOMOVE|SWP_NOSIZE*/);
      }
    }

    else
    {
      if ((nCmdShow == 0 /*SW_HIDE*/) &&
          (! oSys.Call("user32::IsWindowVisible", aListTop[oInd.Array].Handle)))
        nCmdShow = 8 /*SW_SHOWNA*/;

      oSys.Call("user32::ShowWindow", aListTop[oInd.Array].Handle, nCmdShow);
      oSys.Call("user32::SetForegroundWindow", hWndDlg);
    }

    aListTop[oInd.Array].Visible   = oSys.Call("user32::IsWindowVisible", aListTop[oInd.Array].Handle);
    aListTop[oInd.Array].Minimized = oSys.Call("user32::IsIconic", aListTop[oInd.Array].Handle);
    aListTop[oInd.Array].Maximized = oSys.Call("user32::IsZoomed", aListTop[oInd.Array].Handle);
    aListTop[oInd.Array].TopMost   = oSys.Call("user32::GetWindowLong" + _TCHAR,
                                               aListTop[oInd.Array].Handle,
                                               -20 /*GWL_EXSTYLE*/) & 0x00000008 /*WS_EX_TOPMOST*/;

    oRectWnd = GetWindowPos(aListTop[oInd.Array].Handle);
    aListTop[oInd.Array].X = oRectWnd.X;
    aListTop[oInd.Array].Y = oRectWnd.Y;
    aListTop[oInd.Array].W = oRectWnd.W;
    aListTop[oInd.Array].H = oRectWnd.H;

    ShowWndData();
  }
}

function IsWindow(hWnd)
{
  if (oSys.Call("user32::IsWindow", hWnd))
    return true;
  else
  {
    if (AkelPad.MessageBox(hWndDlg,
                           "There is no this window. Is already closed. Do you refresh the windows list?",
                           sScripName,
                           0x00000031 /*MB_DEFBUTTON1|MB_ICONWARNING|MB_OKCANCEL*/) == 1 /*IDOK*/)
      FillWndLB();
    return false;
  }
}

function ChildWindows()
{
  var oInd = GetSelIndexObject();
  var aWndChild;
  var oRect;
  var lpRect;

  if ((oInd.Array >= 0) && (IsWindow(aListTop[oInd.Array].Handle)))
  {
    aListChild = EnumChildWindows(aListTop[oInd.Array].Handle);
    oRect      = GetWindowPos(aWnd[IDWNDLB][HWND]);
    lpRect     = AkelPad.MemAlloc(16); //sizeof(RECT)

    AkelPad.SendMessage(aWnd[IDWNDLB][HWND], 0x0198 /*LB_GETITEMRECT*/, oInd.LB, lpRect);
    oRect.Y = oRect.Y + AkelPad.MemRead(lpRect + 4, 3 /*DT_DWORD*/) + 16;

    AkelPad.MemFree(lpRect);

    oSys.Call("user32::CreateWindowEx" + _TCHAR,
              0,                    //dwExStyle
              sClassName,           //lpClassName
              "Child windows",      //lpWindowName
              0x90C80000,           //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU
              oRect.X - 20,         //x
              oRect.Y,              //y
              oRect.W + 40,         //nWidth
              325,                  //nHeight
              hWndDlg,              //hWndParent
              0,                    //ID
              hInstanceDLL,         //hInstance
              DialogCallbackChild); //lpParam

    oSys.Call("user32::EnableWindow", hWndDlg, 0);
    AkelPad.WindowGetMessage();
  }
}

function DialogCallbackChild(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    var i;

    for (i = 1100; i < aWndChild.length; ++i)
    {
      aWndChild[i][HWND] =
        oSys.Call("user32::CreateWindowEx" + _TCHAR,
                  aWndChild[i][EXSTYLE], //dwExStyle
                  aWndChild[i][CLASS],   //lpClassName
                  0,                     //lpWindowName
                  aWndChild[i][STYLE],   //dwStyle
                  aWndChild[i][X],       //x
                  aWndChild[i][Y],       //y
                  aWndChild[i][W],       //nWidth
                  aWndChild[i][H],       //nHeight
                  hWnd,                  //hWndParent
                  i,                     //ID
                  hInstanceDLL,          //hInstance
                  0);                    //lpParam
      //Set font and text
      SetWndFontAndText(aWndChild[i][HWND], hGuiFont, aWndChild[i][TXT]);
    }

    //Set TabStops in listbox
    SetTabStopsLB(aWndChild[IDCHILDWNDLB][HWND], [40, 70, 100, 220]);

    //Fill listbox
    for (i = 0; i < aListChild.length; ++i)
      oSys.Call("user32::SendMessage" + _TCHAR, aWndChild[IDCHILDWNDLB][HWND], 0x0180 /*LB_ADDSTRING*/, 0,
                aListChild[i].ID + "\t" +
                YesOrNo(aListChild[i].Visible) + "\t" +
                YesOrNo(aListChild[i].Enabled) + "\t" +
                aListChild[i].Class + "\t" +
                aListChild[i].Text.replace(/[\r\n]/g, " "));
    AkelPad.SendMessage(aWndChild[IDCHILDWNDLB][HWND], 0x0186 /*LB_SETCURSEL*/, 0, 0);
    ShowChildWndData();

    hFocusChild = aWndChild[IDCHILDWNDLB][HWND];
  }

  else if ((uMsg == 6 /*WM_ACTIVATE*/) && (wParam == 0 /*WA_INACTIVE*/))
    hFocusChild = oSys.Call("user32::GetFocus");

  else if (uMsg == 7 /*WM_SETFOCUS*/)
    oSys.Call("user32::SetFocus", hFocusChild);

  else if (uMsg == 256 /*WM_KEYDOWN*/)
  {
    if (wParam == 27 /*VK_ESCAPE*/)
      oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 260) //WM_SYSKEYDOWN
  {
    if (wParam == 0x31) //1 key
      oSys.Call("user32::SetFocus", aWndChild[IDCHILDWNDLB][HWND]);
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    if (LoWord(wParam) == IDCHILDWNDLB)
    {
      if (HiWord(wParam) == 1 /*LBN_SELCHANGE*/)
        ShowChildWndData();
    }
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    oSys.Call("user32::EnableWindow", hWndDlg, 1);
    oSys.Call("user32::DestroyWindow", hWnd);
  }

  else if (uMsg == 2) //WM_DESTROY
    oSys.Call("user32::PostQuitMessage", 0);

  return 0;
}

function ShowChildWndData()
{
  var nInd = AkelPad.SendMessage(aWndChild[IDCHILDWNDLB][HWND], 0x0188 /*LB_GETCURSEL*/, 0, 0);

  oSys.Call("user32::SetWindowText" + _TCHAR, aWndChild[IDCHILDCOUNT][HWND],
            (nInd + 1).toString() +
            "/" +
            aListChild.length.toString());

  if (nInd >= 0)
  {
    oSys.Call("user32::SetWindowText" + _TCHAR, aWndChild[IDCHILDHANDLEE  ][HWND], HexAndDec(aListChild[nInd].Handle));
    oSys.Call("user32::SetWindowText" + _TCHAR, aWndChild[IDCHILDSTYLEE   ][HWND], HexAndDec(aListChild[nInd].Style));
    oSys.Call("user32::SetWindowText" + _TCHAR, aWndChild[IDCHILDEXSTYLEE ][HWND], HexAndDec(aListChild[nInd].ExStyle));
    oSys.Call("user32::SetWindowText" + _TCHAR, aWndChild[IDCHILDLOCATIONE][HWND],
              "X=" + aListChild[nInd].X.toString() + ", " +
              "Y=" + aListChild[nInd].Y.toString());
    oSys.Call("user32::SetWindowText" + _TCHAR, aWndChild[IDCHILDSIZEE    ][HWND],
              "W=" + aListChild[nInd].W.toString() + ", " +
              "H=" + aListChild[nInd].H.toString());
  }
}
