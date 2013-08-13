// Translator.js - ver. 2013-08-13 (x86/x64)
//
// On line translator via Google, MS Bing and Yandex.
//
// Usage in AkelPad window:
// Call("Scripts::Main", 1, "Translator.js")
// Call("Scripts::Main", 1, "Translator.js", "en ru") - translates from English to Russian
// Call("Scripts::Main", 1, "Translator.js", "auto pl 1") - autodetect source language, translates to Polish, source text from Clipboard
//
// Usage in command line (required AkelEdit.dll and registration Scripts.dll):
// Wscript.exe Translator.js
//
// Shortcut keys in dialog box:
// Tab          - change edit panel focus source <-> target (double-panel mode)
// Ctrl+Enter,  - double-panel mode - translates entire text from source panel
//              - single-panel mode - translates selected text from AkelPad window or text from Clipboard
// Alt+Enter    - works as Ctrl+Enter, but translated text will be added at the end in target panel
// Shift+Enter  - double-window mode - translates selected text from source panel;
//                if is not selection - translates entire text
//              - single-panel mode - translates selected text from AkelPad window or text from Clipboard
// Ctrl+L       - listen entire text from active edit panel
// Ctrl+Shift+L - listen selected text from active edit panel
// Alt+U        - switch languages
// Shift+Alt+U  - switch languages and texts (double-panel mode only)
// Alt+F1       - choose translator
// Alt+1        - choose from language
// Alt+2        - choose to language
// Ctrl+F       - switch font AkelPad/GUI/other
// Ctrl+U       - switch wordwrap
// Ctrl+W       - source panel on/off
// Alt+S        - settings
// Alt+-+       - change opaque/transparency level of dialog box
// F4           - maximize/restore window
// Right click  - context menu in edit panels

var oFSO     = new ActiveXObject("Scripting.FileSystemObject");
var sIniFile = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";

var aAPIs = [{Name:        "Google",
              APIkey:      "",
              APIkeyP:     "",
              RegistrURL:  "",
              AutoDetect:  1,
              TextLen:     48000},
             {Name:        "MS Bing",
              APIkey:      "49F91281913BE5C04C18F184C4A14ED6097F6AD3",
              APIkeyP:     "",
              RegistrURL:  "http://www.bing.com/developers",
              AutoDetect:  1,
              TextLen:     10000}, //POST method
              //TextLen:     3500}, //GET method
             {Name:        "Yandex",
              APIkey:      "",
              APIkeyP:     "",
              RegistrURL:  "",
              AutoDetect:  0,
              TextLen:     10000}];
var oSelect = {API:      0,
               FromLang: 0,
               ToLang  : 0,
               Source1 : 0,
               Source2 : 0,
               Target1 : 0,
               Target2 : 0};
var oWndMin = {W: 656,
               H: 200};
var oWndPos = {X: 100,
               Y: 120,
               W: oWndMin.W,
               H: oWndMin.H,
               Max: 0};

var nOpacity    = 255;
var bSourceInCB = 0;
var bSourceWnd  = 1;
var bLoadText   = 1;
var bImmediate  = 0;
var bFontAP     = 0;
var bFontGUI    = 0;
var bWordWrap   = 1;
var bSortCode   = 0;
var nDetectLang = -1;
var sSource     = "";
var sTarget     = "";
var sLanguage   = "";
var aLangs      = [];
var aFont;

ReadIni();
ReadInterfaceLang();

if (typeof AkelPad == "undefined")
{
  try
  {
    AkelPad = new ActiveXObject("AkelPad.Document");
    _X64    = AkelPad.Constants._X64;
  }
  catch (oError)
  {
    WScript.Echo(sTxtRegScripts);
    WScript.Quit();
  }
}

var oSys         = AkelPad.SystemFunction();
var hInstanceDLL = AkelPad.GetInstanceDll();
var sClassName   = "AkelPad::Scripts::" + WScript.ScriptName + "::" + hInstanceDLL;
var hWndDlg;

if (hWndDlg = oSys.Call("User32::FindWindowExW", 0, 0, sClassName, 0))
{
  if (! oSys.Call("User32::IsWindowVisible", hWndDlg))
    oSys.Call("User32::ShowWindow", hWndDlg, 8 /*SW_SHOWNA*/);
  if (oSys.Call("User32::IsIconic", hWndDlg))
    oSys.Call("User32::ShowWindow", hWndDlg, 9 /*SW_RESTORE*/);

  oSys.Call("User32::SetForegroundWindow", hWndDlg);
}
else
{
  var DT_UNICODE = 1;
  var DT_QWORD   = 2;
  var DT_DWORD   = 3;
  var DT_BYTE    = 5;

  var CB_ADDSTRING    = 0x143;
  var CB_GETCOUNT     = 0x146;
  var CB_GETCURSEL    = 0x147;
  var CB_SETCURSEL    = 0x14E;
  var CB_SHOWDROPDOWN = 0x14F;
  var CB_GETITEMDATA  = 0x150;
  var CB_SETITEMDATA  = 0x151;
  var CB_RESETCONTENT = 0x14B;
  var CBN_SELCHANGE   = 1;
  var CBN_SETFOCUS    = 3;
  var CBN_CLOSEUP     = 8;

  var hMainWnd     = AkelPad.GetMainWnd();
  var hEditWnd     = AkelPad.GetEditWnd();
  var hGuiFont     = oSys.Call("Gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
  var sEditLibName = "AkelEdit.dll";
  var hEditLib;
  var hFocus;
  var hFocusSet;
  var bCloseCB;
  var nTimerCount;
  var nSpeechLang;
  var sSpeechText;
  var sSpeechPart;
  var uSpeechBody;

  if (bSourceWnd && bLoadText)
  {
    if (bSourceInCB || (! hEditWnd) || ((WScript.Arguments.length > 2) && (WScript.Arguments(2) == "1")))
    {
      if (oSys.Call("User32::IsClipboardFormatAvailable", 13 /*CF_UNICODETEXT*/))
      {
        sSource = AkelPad.GetClipboardText().substr(0, aAPIs[oSelect.API].TextLen);
        oSelect.Source1 = oSelect.Source2 = 0;
      }
    }
    else if (SendMessage(hEditWnd, 3125 /*AEM_GETSEL*/, 0, 0))
    {
      sSource = AkelPad.GetSelText(3 /*"\r\n"*/).substr(0, aAPIs[oSelect.API].TextLen);
      oSelect.Source1 = oSelect.Source2 = 0;
    }
  }

  if (oWndPos.H < oWndMin.H)
    oWndPos.H = oWndMin.H;
  if (oWndPos.W < oWndMin.W)
    oWndPos.W = oWndMin.W;
  if (hEditWnd && bFontAP && bFontGUI)
    bFontGUI = 0;
  if (! aFont)
    aFont = ConvertFontFormat(hGuiFont, 2, 3);

  //Main dialog
  var aSubClassHand = [];
  var aWnd          = [];
  var IDUSE         = 1000;
  var IDAPICB       = 1001;
  var IDDETECTLANG  = 1002;
  var IDFROMLANG    = 1003;
  var IDTOLANG      = 1004;
  var IDFROMLANGCB  = 1005;
  var IDTOLANGCB    = 1006;
  var IDSWITCHLANG  = 1007;
  var IDSWITCHALL   = 1008;
  var IDLISTEN1     = 1009;
  var IDLISTEN2     = 1010;
  var IDOPACMINUS   = 1011;
  var IDOPACPLUS    = 1012;
  var IDTRANSLATE   = 1013;
  var IDOPTIONS     = 1014;
  var IDTXTSOURCE   = 1015;
  var IDTXTTARGET   = 1016;
  var IDTIMER       = 1017;
  var nListenID     = IDLISTEN1;

  //Settings dialog
  var aWndSet       = [];
  var IDINTERFACECB = 1100;
  var IDINTERFACE   = 1101;
  var IDEDITOPTIONS = 1102;
  var IDSOURCEINCB  = 1103;
  var IDSOURCEWND   = 1104;
  var IDLOADTEXT    = 1105;
  var IDIMMEDIATE   = 1106;
  var IDWORDWRAP    = 1107;
  var IDFONTAP      = 1108;
  var IDFONTGUI     = 1109;
  var IDFONT        = 1110;
  var IDSORTLANG    = 1111;
  var IDSORTCODE    = 1112;
  var IDSORTNAME    = 1113;
  var IDAPINAME1    = 1114;
  var IDAPIKEYS1    = 1115;
  var IDAPIKEY1     = 1116;
  var IDREGIST1     = 1117;
  var IDREGURL1     = 1118;
  var IDOK          = 1119;
  var IDCANCEL      = 1120;

  //0x50000000 - WS_VISIBLE|WS_CHILD
  //0x50000007 - WS_VISIBLE|WS_CHILD|BS_GROUPBOX
  //0x50000009 - WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
  //0x50010000 - WS_VISIBLE|WS_CHILD|WS_TABSTOP
  //0x50010001 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_DEFPUSHBUTTON
  //0x50010003 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
  //0x50200003 - WS_VISIBLE|WS_CHILD|WS_VSCROLL|CBS_DROPDOWNLIST
  //0x50200103 - WS_VISIBLE|WS_CHILD|WS_VSCROLL|CBS_SORT|CBS_DROPDOWNLIST
  //0x50210103 - WS_VISIBLE|WS_CHILD|WS_VSCROLL|WS_TABSTOP|CBS_SORT|CBS_DROPDOWNLIST
  //0x50810080 - WS_VISIBLE|WS_CHILD|WS_BORDER|WS_TABSTOP|ES_AUTOHSCROLL
  //0x50810880 - WS_VISIBLE|WS_CHILD|WS_BORDER|WS_TABSTOP|ES_READONLY|ES_AUTOHSCROLL
  //0x50311104 - WS_VISIBLE|WS_CHILD|WS_HSCROLL|WS_VSCROLL|WS_TABSTOP|ES_WANTRETURN|ES_NOHIDESEL|ES_MULTILINE
  //0x50B11104 - WS_VISIBLE|WS_CHILD|WS_BORDER|WS_HSCROLL|WS_VSCROLL|WS_TABSTOP|ES_WANTRETURN|ES_NOHIDESEL|ES_MULTILINE
  aWnd[IDUSE       ] = {Class: "STATIC",    Style: 0x50000000};
  aWnd[IDAPICB     ] = {Class: "COMBOBOX",  Style: 0x50200003, Txt: ""};
  aWnd[IDDETECTLANG] = {Class: "STATIC",    Style: 0x50000000, Txt: ""};
  aWnd[IDFROMLANG  ] = {Class: "STATIC",    Style: 0x50000000};
  aWnd[IDTOLANG    ] = {Class: "STATIC",    Style: 0x50000000};
  aWnd[IDFROMLANGCB] = {Class: "COMBOBOX",  Style: 0x50200103, Txt: ""};
  aWnd[IDTOLANGCB  ] = {Class: "COMBOBOX",  Style: 0x50200103, Txt: ""};
  aWnd[IDSWITCHLANG] = {Class: "BUTTON",    Style: 0x50000000, Txt: "<->"};
  aWnd[IDSWITCHALL ] = {Class: "BUTTON",    Style: 0x50000000, Txt: "<=>"};
  aWnd[IDLISTEN1   ] = {Class: "BUTTON",    Style: 0x50000000, Txt: sTxtListen};
  aWnd[IDLISTEN2   ] = {Class: "BUTTON",    Style: 0x50000000, Txt: sTxtListen};
  aWnd[IDOPACMINUS ] = {Class: "BUTTON",    Style: 0x50000000, Txt: "-"};
  aWnd[IDOPACPLUS  ] = {Class: "BUTTON",    Style: 0x50000000, Txt: "+"};
  aWnd[IDTRANSLATE ] = {Class: "BUTTON",    Style: 0x50000000};
  aWnd[IDOPTIONS   ] = {Class: "BUTTON",    Style: 0x50000000};
  aWnd[IDTXTSOURCE ] = {Class: "AkelEditW", Style: 0x50311104, Txt: sSource};
  aWnd[IDTXTTARGET ] = {Class: "AkelEditW", Style: 0x50311104, Txt: sTarget};

  aWndSet[IDINTERFACECB] = {Class: "COMBOBOX", Style: 0x50210103, X:  10, Y:  10, W: 150, H: 150, Txt: ""};
  aWndSet[IDINTERFACE  ] = {Class: "STATIC",   Style: 0x50000000, X: 165, Y:  13, W: 120, H:  13};
  aWndSet[IDEDITOPTIONS] = {Class: "BUTTON",   Style: 0x50000007, X:  10, Y:  40, W: 285, H: 185, Txt: ""};
  aWndSet[IDSOURCEINCB ] = {Class: "BUTTON",   Style: 0x50010003, X:  20, Y:  55, W: 270, H:  16};
  aWndSet[IDSOURCEWND  ] = {Class: "BUTTON",   Style: 0x50010003, X:  20, Y:  75, W: 270, H:  16};
  aWndSet[IDLOADTEXT   ] = {Class: "BUTTON",   Style: 0x50010003, X:  20, Y:  95, W: 270, H:  16};
  aWndSet[IDIMMEDIATE  ] = {Class: "BUTTON",   Style: 0x50010003, X:  20, Y: 115, W: 270, H:  16};
  aWndSet[IDWORDWRAP   ] = {Class: "BUTTON",   Style: 0x50010003, X:  20, Y: 135, W: 270, H:  16};
  aWndSet[IDFONTAP     ] = {Class: "BUTTON",   Style: 0x50010003, X:  20, Y: 155, W: 270, H:  16};
  aWndSet[IDFONTGUI    ] = {Class: "BUTTON",   Style: 0x50010003, X:  20, Y: 175, W: 270, H:  16};
  aWndSet[IDFONT       ] = {Class: "BUTTON",   Style: 0x50010000, X:  20, Y: 195, W: 170, H:  20, Txt: aFont.toString()};
  aWndSet[IDSORTLANG   ] = {Class: "BUTTON",   Style: 0x50000007, X: 305, Y: 160, W: 120, H:  65};
  aWndSet[IDSORTCODE   ] = {Class: "BUTTON",   Style: 0x50000009, X: 315, Y: 180, W:  90, H:  16};
  aWndSet[IDSORTNAME   ] = {Class: "BUTTON",   Style: 0x50000009, X: 315, Y: 200, W:  90, H:  16};
  aWndSet[IDAPINAME1   ] = {Class: "BUTTON",   Style: 0x50000007, X:  10, Y: 235, W: 415, H:  75};
  aWndSet[IDAPIKEYS1   ] = {Class: "STATIC",   Style: 0x50000000, X:  20, Y: 255, W:  70, H:  13, Txt: "AppID:"};
  aWndSet[IDAPIKEY1    ] = {Class: "EDIT",     Style: 0x50810080, X:  90, Y: 255, W: 325, H:  20, Txt: ""};
  aWndSet[IDREGIST1    ] = {Class: "STATIC",   Style: 0x50000000, X:  20, Y: 280, W:  70, H:  13};
  aWndSet[IDREGURL1    ] = {Class: "EDIT",     Style: 0x50810880, X:  90, Y: 280, W: 325, H:  20, Txt: aAPIs[1].RegistrURL};
  aWndSet[IDOK         ] = {Class: "BUTTON",   Style: 0x50010001, X: 345, Y:  10, W:  80, H:  23};
  aWndSet[IDCANCEL     ] = {Class: "BUTTON",   Style: 0x50010000, X: 345, Y:  35, W:  80, H:  23};

  SetInterfaceLangToWndDef();

  if (! hMainWnd)
  {
    hEditLib = oSys.Call("Kernel32::LoadLibraryW", sEditLibName);
    if (! hEditLib)
    {
      WScript.Echo(sTxtNoLibrary + sEditLibName);
      WScript.Quit();
    }
  }

  var hIcon =
    oSys.Call("User32::LoadImageW",
      hInstanceDLL, //hinst
      101,          //lpszName
      1,            //uType=IMAGE_ICON
      0,            //cxDesired
      0,            //cyDesired
      0x00000040);  //fuLoad=LR_DEFAULTSIZE
  var nBufSize = 0xFFFF;
  var lpBuffer = AkelPad.MemAlloc(nBufSize * 2);

  AkelPad.WindowRegisterClass(sClassName);

  hWndDlg =
    oSys.Call("User32::CreateWindowExW",
      0,               //dwExStyle
      sClassName,      //lpClassName
      sTxtCaption,     //lpWindowName
      0x80CF0000,      //dwStyle=WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_MAXIMIZEBOX|WS_MINIMIZEBOX|WS_THICKFRAME
      oWndPos.X,       //x
      oWndPos.Y,       //y
      oWndPos.W,       //nWidth
      oWndPos.H,       //nHeight
      hMainWnd,        //hWndParent
      0,               //ID
      hInstanceDLL,    //hInstance
      DialogCallback); //Script function callback. To use it class must be registered by WindowRegisterClass.

  oSys.Call("User32::ShowWindow", hWndDlg, oWndPos.Max ? 3 /*SW_MAXIMIZE*/ : 1 /*SW_SHOWNORMAL*/);

  //Allow other scripts running
  AkelPad.ScriptNoMutex();

  //Message loop
  AkelPad.WindowGetMessage();

  AkelPad.WindowUnregisterClass(sClassName);
  AkelPad.MemFree(lpBuffer);
  oSys.Call("User32::DestroyIcon", hIcon);
  if (hEditLib)
    oSys.Call("Kernel32::FreeLibrary", hEditLib);
}

function SetInterfaceLangToWndDef()
{
  aWnd[IDUSE      ].Txt = sTxtUse;
  aWnd[IDFROMLANG ].Txt = sTxtFromLang;
  aWnd[IDTOLANG   ].Txt = sTxtToLang;
  aWnd[IDLISTEN1  ].Txt = sTxtListen;
  aWnd[IDLISTEN2  ].Txt = sTxtListen;
  aWnd[IDTRANSLATE].Txt = sTxtTranslate;
  aWnd[IDOPTIONS  ].Txt = sTxtOptions;

  aWndSet[IDINTERFACE ].Txt = sTxtInterface;
  aWndSet[IDSOURCEINCB].Txt = sTxtSourceInCB;
  aWndSet[IDSOURCEWND ].Txt = sTxtSourceWnd + " (Ctrl+W)";
  aWndSet[IDLOADTEXT  ].Txt = sTxtLoadText;
  aWndSet[IDIMMEDIATE ].Txt = sTxtImmediate;
  aWndSet[IDWORDWRAP  ].Txt = sTxtWordWrap + " (Ctrl+U)";
  aWndSet[IDFONTAP    ].Txt = sTxtFontAP + " (Ctrl+F)";
  aWndSet[IDFONTGUI   ].Txt = sTxtFontGUI + " (Ctrl+F)";
  aWndSet[IDSORTLANG  ].Txt = sTxtSortLang;
  aWndSet[IDSORTCODE  ].Txt = sTxtSortCode;
  aWndSet[IDSORTNAME  ].Txt = sTxtSortName;
  aWndSet[IDAPINAME1  ].Txt = aAPIs[1].Name + " - " + sTxtOwnKey;
  aWndSet[IDREGIST1   ].Txt = sTxtRegister;
  aWndSet[IDOK        ].Txt = sTxtOK;
  aWndSet[IDCANCEL    ].Txt = sTxtCancel;
}

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    var i;

    for (i = IDUSE; i < aWnd.length; ++i)
    {
      aWnd[i].Handle =
        oSys.Call("User32::CreateWindowExW",
          0,             //dwExStyle
          aWnd[i].Class, //lpClassName
          0,             //lpWindowName
          aWnd[i].Style, //dwStyle
          aWnd[i].X,     //x
          aWnd[i].Y,     //y
          aWnd[i].W,     //nWidth
          aWnd[i].H,     //nHeight
          hWnd,          //hWndParent
          i,             //ID
          hInstanceDLL,  //hInstance
          0);            //lpParam
      SetWindowFont(aWnd[i].Handle, hGuiFont);
      SetWindowText(aWnd[i].Handle, aWnd[i].Txt);
    }

    SendMessage(hWnd, 0x0080 /*WM_SETICON*/, 0 /*ICON_SMALL*/, hIcon);
    SendMessage(hWnd, 0x0080 /*WM_SETICON*/, 1 /*ICON_BIG*/, hIcon);

    SetEditWordWrap();
    SetEditFont();

    for (i = IDTXTSOURCE; i <= IDTXTTARGET; ++i)
    {
      SendMessage(aWnd[i].Handle, 1093 /*EM_SETEVENTMASK*/, 0, 0x00080001 /*ENM_CHANGE|ENM_SELCHANGE*/);
      aSubClassHand[i] = AkelPad.WindowSubClass(aWnd[i].Handle, EditCallback, 256 /*WM_KEYDOWN*/, 258 /*WM_CHAR*/);
    }

    SendMessage(aWnd[IDTXTSOURCE].Handle, 197 /*EM_SETLIMITTEXT*/, aAPIs[oSelect.API].TextLen, 0);
    SendMessage(aWnd[IDTXTTARGET].Handle, 197 /*EM_SETLIMITTEXT*/, nBufSize - 1, 0);

    SendMessage(aWnd[IDTXTSOURCE].Handle, 0x00B1 /*EM_SETSEL*/, oSelect.Source1, oSelect.Source2);
    SendMessage(aWnd[IDTXTTARGET].Handle, 0x00B1 /*EM_SETSEL*/, oSelect.Target1, oSelect.Target2);

    //Fill combobox APIs
    for (i = 0; i < aAPIs.length; ++i)
      SendMessage(aWnd[IDAPICB].Handle, CB_ADDSTRING, 0, aAPIs[i].Name);
    SendMessage(aWnd[IDAPICB].Handle, CB_SETCURSEL, oSelect.API, 0);

    FillComboFromLang();
    FillComboToLang();
    ShowDetectLang(true);
    EnableListenWindows();

    if (nOpacity < 255)
      SetOpacityLevel(hWnd, nOpacity);

    ShowSourceWindow();

    if (((! bSourceWnd) || (bSourceWnd && bLoadText)) && (bImmediate))
    {
      try
      {
        new ActiveXObject("htmlfile").parentWindow.setTimeout(function()
              {
                PostMessage(hWnd, 273 /*WM_COMMAND*/, IDTRANSLATE, 0);
              }, 0);
      }
      catch (oError)
      {
        PostMessage(hWnd, 273 /*WM_COMMAND*/, IDTRANSLATE, 0);
      }
    }
  }

  else if (uMsg == 7) //WM_SETFOCUS
  {
    hEditWnd = AkelPad.GetEditWnd();
    oSys.Call("User32::SetFocus", hFocus);
  }

  else if (uMsg == 36) //WM_GETMINMAXINFO
  {
    AkelPad.MemCopy(lParam + 24, oWndMin.W, DT_DWORD); //ptMinTrackSize_x
    AkelPad.MemCopy(lParam + 28, oWndMin.H, DT_DWORD); //ptMinTrackSize_y
  }

  else if (uMsg == 3) //WM_MOVE
  {
    if (! oSys.Call("User32::IsZoomed", hWnd))
      GetWindowPos(hWnd, oWndPos);
  }

  else if (uMsg == 5) //WM_SIZE
  {
    if (wParam != 2) //SIZE_MAXIMIZED
      GetWindowPos(hWnd, oWndPos);

    ResizeWindow(hWnd);
  }

  else if (uMsg == 15) //WM_PAINT
    PaintSizeGrip(hWnd);

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (wParam == 13 /*VK_RETURN*/)
    {
      if ((Ctrl() || Shift()) &&
          ((oSys.Call("User32::GetFocus") == aWnd[IDTXTSOURCE].Handle) ||
           (oSys.Call("User32::GetFocus") == aWnd[IDTXTTARGET].Handle)))
        Translate(Shift());
    }
    else if ((wParam == 0x4C /*L key*/) && Ctrl() && (! Alt()))
      Listen(hFocus, Number(Shift()));
    else if ((wParam == 0x43 /*C key*/) && Ctrl() && Shift())
      InsertTextToAP(hFocus, 0);
    else if ((wParam == 0x56 /*V key*/) && Ctrl() && Shift())
      PasteTextFromAP(hFocus, 0);
    else if ((wParam == 0x46 /*F key*/) && Ctrl())
    {
      if (hEditWnd)
      {
        if (bFontAP)
        {
          bFontAP  = 0;
          bFontGUI = 1;
        }
        else if (bFontGUI)
          bFontGUI = 0;
        else
          bFontAP  = 1;
      }
      else
        bFontGUI = ! bFontGUI;

      SetEditFont();
      oSys.Call("User32::InvalidateRect", hWnd, 0, 0);
    }
    else if ((wParam == 0x55 /*U key*/) && Ctrl())
    {
      bWordWrap = ! bWordWrap;
      SetEditWordWrap();
    }
    else if ((wParam == 0x57 /*W key*/) && Ctrl())
    {
      bSourceWnd = ! bSourceWnd;
      ShowSourceWindow();
    }
    else if (wParam == 0x73 /*VK_F4*/)
      oSys.Call("User32::ShowWindow", hWnd, oSys.Call("User32::IsZoomed", hWnd) ? 9 /*SW_RESTORE*/ : 3 /*SW_MAXIMIZE*/);
    else if ((wParam == 27 /*VK_ESCAPE*/) && bCloseCB)
      PostMessage(hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 260) //WM_SYSKEYDOWN
  {
    if (wParam == 13) //VK_RETURN
    {
      oSys.Call("User32::SetFocus", hFocus);
      Translate(Shift(), 1);
    }
    else if (wParam == 0x58) //X key
    {
      CopyEntireTextToCB(hFocus);
      DeleteEntireText(hFocus);
    }
    else if (wParam == 0x43) //C key
    {
      if (Shift())
        InsertTextToAP(hFocus, 1);
      else
        CopyEntireTextToCB(hFocus);
    }
    else if (wParam == 0x56) //V key
    {
      if (Shift())
        PasteTextFromAP(hFocus, 1);
      else
        PasteEntireTextFromCB(hFocus);
    }
    else if (wParam == 0x2E) //VK_DELETE
      DeleteEntireText(hFocus);
    else if (wParam == 0x55) //U key
    {
      if (Shift())
      {
        if (bSourceWnd)
          PostMessage(hWnd, 273 /*WM_COMMAND*/, IDSWITCHALL, 0);
      }
      else
        PostMessage(hWnd, 273 /*WM_COMMAND*/, IDSWITCHLANG, 0);
    }
    else if (wParam == 0x70) //VK_F1
      oSys.Call("User32::SetFocus", aWnd[IDAPICB].Handle);
    else if (wParam == 0x31) //1 key
      oSys.Call("User32::SetFocus", aWnd[IDFROMLANGCB].Handle);
    else if (wParam == 0x32) //2 key
      oSys.Call("User32::SetFocus", aWnd[IDTOLANGCB].Handle);
    else if ((wParam == 109) || (wParam == 189)) //Num- or -
      PostMessage(hWnd, 273 /*WM_COMMAND*/, IDOPACMINUS, 0);
    else if ((wParam == 107) || (wParam == 187)) //Num+ or +
      PostMessage(hWnd, 273 /*WM_COMMAND*/, IDOPACPLUS, 0);
    else if (wParam == 0x53) //S key
      Settings();
  }

  else if (uMsg == 123) //WM_CONTEXTMENU
  {
    if ((wParam == aWnd[IDTXTSOURCE].Handle) || (wParam == aWnd[IDTXTTARGET].Handle))
      ContextMenu(wParam, lParam);
  }

  else if (uMsg == 0x004E) //WM_NOTIFY
  {
    if (AkelPad.MemRead(lParam + (_X64 ? 16 : 8), DT_DWORD) == 0x0702 /*EN_SELCHANGE*/)
    {
      if (wParam == IDTXTSOURCE)
      {
        oSelect.Source1 = AkelPad.MemRead(lParam + (_X64 ? 24 : 12), DT_DWORD);
        oSelect.Source2 = AkelPad.MemRead(lParam + (_X64 ? 28 : 16), DT_DWORD);
      }
      else if (wParam == IDTXTTARGET)
      {
        oSelect.Target1 = AkelPad.MemRead(lParam + (_X64 ? 24 : 12), DT_DWORD);
        oSelect.Target2 = AkelPad.MemRead(lParam + (_X64 ? 28 : 16), DT_DWORD);
      }
    }
  }

  else if (uMsg == 0x3B9) //MM_MCINOTIFY
  {
    if (wParam == 1 /*MCI_NOTIFY_SUCCESSFUL*/)
    {
      oSys.Call("Winmm::mciSendStringW", "close TTS wait", 0, 0, 0);
      PlayTextToSpeech();
    }
  }

  else if (uMsg == 0x0113) //WM_TIMER
    SetWindowText(aWnd[nListenID].Handle, (nTimerCount++ % 2) ? sTxtListen : "");

  else if (uMsg == 273) //WM_COMMAND
  {
    var nLowParam = LoWord(wParam);
    var nHiwParam = HiWord(wParam);
    bCloseCB = 1;

    if (nLowParam == IDAPICB)
    {
      if (nHiwParam == CBN_SETFOCUS)
        PostMessage(lParam, CB_SHOWDROPDOWN, 1, 0);
      if (nHiwParam == CBN_SELCHANGE)
      {
        var nSel1 = oSelect.Source1;
        var nSel2 = oSelect.Source2;

        oSelect.API = SendMessage(aWnd[IDAPICB].Handle, CB_GETCURSEL, 0, 0);
        SendMessage(aWnd[IDTXTSOURCE].Handle, 197 /*EM_SETLIMITTEXT*/, aAPIs[oSelect.API].TextLen, 0);

        SetWindowText(aWnd[IDTXTSOURCE].Handle, GetWindowText(aWnd[IDTXTSOURCE].Handle).substr(0, aAPIs[oSelect.API].TextLen));
        SendMessage(aWnd[IDTXTSOURCE].Handle, 0x00B1 /*EM_SETSEL*/, nSel1, nSel2);

        FillComboFromLang(SendMessage(aWnd[IDFROMLANGCB].Handle, CB_GETITEMDATA, oSelect.FromLang, 0));
        FillComboToLang(SendMessage(aWnd[IDTOLANGCB].Handle, CB_GETITEMDATA, oSelect.ToLang, 0));

        ShowDetectLang(false);
        EnableListenWindows();
      }
      else if (nHiwParam == CBN_CLOSEUP)
      {
        if (oSys.Call("User32::GetFocus") == lParam)
          oSys.Call("User32::SetFocus", hFocus);

        bCloseCB = 0;
      }
    }
    else if ((nLowParam == IDFROMLANGCB) || (nLowParam == IDTOLANGCB))
    {
      if (nHiwParam == CBN_SETFOCUS)
        PostMessage(lParam, CB_SHOWDROPDOWN, 1, 0);
      else if (nHiwParam == CBN_SELCHANGE)
      {
        if (nLowParam == IDFROMLANGCB)
        {
          oSelect.FromLang = SendMessage(aWnd[IDFROMLANGCB].Handle, CB_GETCURSEL, 0, 0);
          FillComboToLang(SendMessage(aWnd[IDTOLANGCB].Handle, CB_GETITEMDATA, oSelect.ToLang, 0));
        }
        else
          oSelect.ToLang = SendMessage(aWnd[IDTOLANGCB].Handle, CB_GETCURSEL, 0, 0);

        ShowDetectLang(false);
        EnableListenWindows();
      }
      else if (nHiwParam == CBN_CLOSEUP)
      {
        if (oSys.Call("User32::GetFocus") == lParam)
          oSys.Call("User32::SetFocus", hFocus);

        bCloseCB = 0;
      }
    }
    else if (nLowParam == IDTXTSOURCE)
    {
      if (nHiwParam == 0x0100) //EN_SETFOCUS
      {
        hFocus = lParam;
        SetEditStyle(lParam, aWnd[IDTXTTARGET].Handle);
      }
      else if (nHiwParam == 0x0300) //EN_CHANGE
      {
        ShowDetectLang(false);
        EnableListenWindows();
      }
    }
    else if (nLowParam == IDTXTTARGET)
    {
      if (nHiwParam == 0x0100) //EN_SETFOCUS
      {
        hFocus = lParam;
        SetEditStyle(lParam, aWnd[IDTXTSOURCE].Handle);
      }
    }
    else if ((nLowParam >= IDSWITCHLANG) && (nLowParam <= IDOPTIONS))
    {
      oSys.Call("User32::DefDlgProcW", hWnd, 1025 /*DM_SETDEFID*/, nLowParam, 0);
      oSys.Call("User32::DefDlgProcW", hWnd, 1025 /*DM_SETDEFID*/, IDUSE, 0);

      if (nLowParam == IDSWITCHLANG)
        SwitchLang();
      else if (nLowParam == IDSWITCHALL)
        SwitchLang(1);
      else if (nLowParam == IDLISTEN1)
        Listen(aWnd[IDTXTSOURCE].Handle, -1);
      else if (nLowParam == IDLISTEN2)
        Listen(aWnd[IDTXTTARGET].Handle, -1);
      else if (nLowParam == IDOPACMINUS)
      {
        if (nOpacity > 55)
          SetOpacityLevel(hWnd, -2);
      }
      else if (nLowParam == IDOPACPLUS)
      {
        if (nOpacity < 255)
          SetOpacityLevel(hWnd, -1);
      }
      else if (nLowParam == IDTRANSLATE)
        Translate();
      else if (nLowParam == IDOPTIONS)
        ContextMenu(lParam, -2);

      oSys.Call("User32::SetFocus", hFocus);
    }
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    oSys.Call("Winmm::mciSendStringW", "close TTS", 0, 0, 0);
    KillTimer();
    AkelPad.WindowUnsubClass(aWnd[IDTXTSOURCE].Handle);
    AkelPad.WindowUnsubClass(aWnd[IDTXTTARGET].Handle);
    WriteIni();
    //Destroy dialog
    oSys.Call("User32::DestroyWindow", hWnd);
  }

  else if (uMsg == 2) //WM_DESTROY
  {
    //Exit message loop
    oSys.Call("User32::PostQuitMessage", 0);
  }

  return 0;
}

function EditCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 256) //WM_KEYDOWN
  {
    if ((wParam == 0x56 /*V key*/) && Ctrl() && Shift())
    {
      AkelPad.WindowNoNextProc(aSubClassHand[oSys.Call("User32::GetDlgCtrlID", hWnd)]);
      return 1;
    }
  }
  else if (uMsg == 258) //WM_CHAR 
  {
    if ((wParam == 13 /*VK_RETURN*/) && (Ctrl() || Shift()))
    {
      AkelPad.WindowNoNextProc(aSubClassHand[oSys.Call("User32::GetDlgCtrlID", hWnd)]);
      return 1;
    }
  }

  return 0;
}

function LoWord(nParam)
{
  return (nParam & 0xFFFF);
}

function HiWord(nParam)
{
  return ((nParam >> 16) & 0xFFFF);
}

function Shift()
{
  return Boolean(oSys.Call("User32::GetKeyState", 0x10 /*VK_SHIFT*/) & 0x8000);
}

function Ctrl()
{
  return Boolean(oSys.Call("User32::GetKeyState", 0x11 /*VK_CONTROL*/) & 0x8000);
}

function Alt()
{
  return Boolean(oSys.Call("User32::GetKeyState", 0x12 /*VK_MENU*/) & 0x8000);
}

function SendMessage(hWnd, uMsg, wParam, lParam)
{
  return oSys.Call("User32::SendMessageW", hWnd, uMsg, wParam, lParam);
}

function PostMessage(hWnd, uMsg, wParam, lParam)
{
  return oSys.Call("User32::PostMessageW", hWnd, uMsg, wParam, lParam);
}

function SetWindowFont(hWnd, hFont)
{
  SendMessage(hWnd, 48 /*WM_SETFONT*/, hFont, true);
}

function GetWindowText(hWnd)
{
  oSys.Call("User32::GetWindowTextW", hWnd, lpBuffer, nBufSize);
  return AkelPad.MemRead(lpBuffer, DT_UNICODE);
}

function SetWindowText(hWnd, sText)
{
  oSys.Call("User32::SetWindowTextW", hWnd, sText.substr(0, nBufSize - 1).replace(/\r$/, ""));
}

function SetEditFont()
{
  var hFont;

  if (hEditWnd && bFontAP)
    hFont = SendMessage(hEditWnd, 49 /*WM_GETFONT*/, 0, 0);
  else if (bFontGUI)
    hFont = hGuiFont;
  else
    hFont = ConvertFontFormat(aFont, 3, 2);

  SetWindowFont(aWnd[IDTXTSOURCE].Handle, hFont)
  SetWindowFont(aWnd[IDTXTTARGET].Handle, hFont)
}

function GetEditSelText(hWnd)
{
  SendMessage(hWnd, 1086 /*EM_GETSELTEXT*/, 0, lpBuffer);
  return AkelPad.MemRead(lpBuffer, DT_UNICODE);
}

function SetEditWordWrap()
{
  SendMessage(aWnd[IDTXTSOURCE].Handle, 0x0CAA /*AEM_SETWORDWRAP*/, bWordWrap ? 1 /*AEWW_WORD*/ : 0 /*AEWW_NONE*/, 0);
  SendMessage(aWnd[IDTXTTARGET].Handle, 0x0CAA /*AEM_SETWORDWRAP*/, bWordWrap ? 1 /*AEWW_WORD*/ : 0 /*AEWW_NONE*/, 0);
}

function SetEditStyle(hWnd1, hWnd2)
{
  SendMessage(hWndDlg, 11 /*WM_SETREDRAW*/, 0, 0);

  oSys.Call("User32::SetWindowLongW", hWnd1, -20 /*GWL_EXSTYLE*/, 0);
  oSys.Call("User32::SetWindowLongW", hWnd1, -16 /*GWL_STYLE*/, 0x50B11104);
  oSys.Call("User32::SetWindowPos", hWnd1, 0, 0, 0, 0, 0, 0x37 /*SWP_FRAMECHANGED|SWP_NOACTIVATE|SWP_NOZORDER|SWP_NOMOVE|SWP_NOSIZE*/);

  if (bSourceWnd)
  {
    oSys.Call("User32::SetWindowLongW", hWnd2, -20 /*GWL_EXSTYLE*/, 0x20000 /*WS_EX_STATICEDGE*/);
    oSys.Call("User32::SetWindowLongW", hWnd2, -16 /*GWL_STYLE*/, 0x50311104);
    oSys.Call("User32::SetWindowPos", hWnd2, 0, 0, 0, 0, 0, 0x37 /*SWP_FRAMECHANGED|SWP_NOACTIVATE|SWP_NOZORDER|SWP_NOMOVE|SWP_NOSIZE*/);
  }

  SendMessage(hWndDlg, 11 /*WM_SETREDRAW*/, 1, 0);
  oSys.Call("User32::InvalidateRect", hWndDlg, 0, 0);
}

function GetWindowPos(hWnd, oRect)
{
  var lpRect = AkelPad.MemAlloc(16) //sizeof(RECT);

  oSys.Call("User32::GetWindowRect", hWnd, lpRect);

  oRect.X = AkelPad.MemRead(lpRect,      DT_DWORD);
  oRect.Y = AkelPad.MemRead(lpRect +  4, DT_DWORD);
  oRect.W = AkelPad.MemRead(lpRect +  8, DT_DWORD) - oRect.X;
  oRect.H = AkelPad.MemRead(lpRect + 12, DT_DWORD) - oRect.Y;

  AkelPad.MemFree(lpRect);
}

function ResizeWindow(hWnd)
{
  var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)
  var nW, nH, nW2;

  oSys.Call("User32::GetClientRect", hWnd, lpRect);
  nW  = AkelPad.MemRead(lpRect +  8, DT_DWORD);
  nH  = AkelPad.MemRead(lpRect + 12, DT_DWORD);
  nW2 = Math.round(nW / 2);
  AkelPad.MemFree(lpRect);

  oSys.Call("User32::SetWindowPos", aWnd[IDUSE].Handle, 0,
    10,
    10,
    80,
    13,
    0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos", aWnd[IDAPICB].Handle, 0,
    10,
    25,
    80,
    100,
    0x14);
  oSys.Call("User32::SetWindowPos", aWnd[IDDETECTLANG].Handle, 0,
    10,
    60,
    210,
    13,
    0x14);
  oSys.Call("User32::SetWindowPos", aWnd[IDFROMLANG].Handle, 0,
    nW2 - 215,
    10,
    200,
    13,
    0x14);
  oSys.Call("User32::SetWindowPos", aWnd[IDTOLANG].Handle, 0,
    nW2 + 15,
    10,
    200,
    13,
    0x14);
  oSys.Call("User32::SetWindowPos", aWnd[IDFROMLANGCB].Handle, 0,
    nW2 - 215,
    25,
    200,
    420,
    0x14);
  oSys.Call("User32::SetWindowPos", aWnd[IDTOLANGCB].Handle, 0,
    nW2 + 15,
    25,
    200,
    420,
    0x14);
  oSys.Call("User32::SetWindowPos", aWnd[IDSWITCHLANG].Handle, 0,
    nW2 - 15,
    25,
    30,
    21,
    0x14);
  oSys.Call("User32::SetWindowPos", aWnd[IDSWITCHALL].Handle, 0,
    nW2 - 15,
    50,
    30,
    21,
    0x14);
  oSys.Call("User32::SetWindowPos", aWnd[IDLISTEN1].Handle, 0,
    nW2 - 100,
    50,
    80,
    21,
    0x14);
  oSys.Call("User32::SetWindowPos", aWnd[IDLISTEN2].Handle, 0,
    nW2 + 20,
    50,
    80,
    21,
    0x14);
  oSys.Call("User32::SetWindowPos", aWnd[IDOPACMINUS].Handle, 0,
    nW - 32,
    0,
    16,
    16,
    0x14);
  oSys.Call("User32::SetWindowPos", aWnd[IDOPACPLUS].Handle, 0,
    nW - 16,
    0,
    16,
    16,
    0x14);
  oSys.Call("User32::SetWindowPos", aWnd[IDTRANSLATE].Handle, 0,
    nW - 90,
    25,
    80,
    21,
    0x14);
  oSys.Call("User32::SetWindowPos", aWnd[IDOPTIONS].Handle, 0,
    nW - 90,
    50,
    80,
    21,
    0x14);
  oSys.Call("User32::SetWindowPos", aWnd[IDTXTSOURCE].Handle, 0,
    10,
    75,
    nW2 - 15,
    nH - 85,
    0x14);
  oSys.Call("User32::SetWindowPos", aWnd[IDTXTTARGET].Handle, 0,
    bSourceWnd ? nW2 + 5 : 10,
    75,
    bSourceWnd ? nW - nW2 - 15 : nW - 20,
    nH - 85,
    0x14);
}

function PaintSizeGrip(hWnd)
{
  var lpPaint = AkelPad.MemAlloc(_X64 ? 72 : 64); //sizeof(PAINTSTRUCT)
  var lpRect  = AkelPad.MemAlloc(16); //sizeof(RECT)
  var hDC;

  if (hDC = oSys.Call("User32::BeginPaint", hWnd, lpPaint))
  {
    oSys.Call("User32::GetClientRect", hWnd, lpRect);

    AkelPad.MemCopy(lpRect,     AkelPad.MemRead(lpRect +  8, DT_DWORD) - oSys.Call("User32::GetSystemMetrics",  2 /*SM_CXVSCROLL*/), DT_DWORD);
    AkelPad.MemCopy(lpRect + 4, AkelPad.MemRead(lpRect + 12, DT_DWORD) - oSys.Call("User32::GetSystemMetrics", 20 /*SM_CYVSCROLL*/), DT_DWORD);

    oSys.Call("User32::DrawFrameControl", hDC, lpRect, 3 /*DFC_SCROLL*/, 0x8 /*DFCS_SCROLLSIZEGRIP*/);
    oSys.Call("User32::EndPaint", hWnd, lpPaint);
  }

  AkelPad.MemFree(lpPaint);
  AkelPad.MemFree(lpRect);
}

function FillComboFromLang(nFromLang)
{
  var nPos;
  var i;

  SendMessage(aWnd[IDFROMLANGCB].Handle, CB_RESETCONTENT, 0, 0);

  if (aAPIs[oSelect.API].AutoDetect)
  {
    nPos = SendMessage(aWnd[IDFROMLANGCB].Handle, CB_ADDSTRING, 0, "   " + sTxtAutoDetect);
    SendMessage(aWnd[IDFROMLANGCB].Handle, CB_SETITEMDATA, nPos, -1);
  }

  for (i = 0; i < aLangs.length; ++i)
  {
    if (aLangs[i][oSelect.API + 3])
    {
      nPos = SendMessage(aWnd[IDFROMLANGCB].Handle, CB_ADDSTRING, 0, aLangs[i][Number(! bSortCode)] + " - "  + aLangs[i][Number(bSortCode)]);
      SendMessage(aWnd[IDFROMLANGCB].Handle, CB_SETITEMDATA, nPos, i);
    }
  }

  if (typeof nFromLang == "undefined")
  {
    if (WScript.Arguments.length > 0)
    {
      if (WScript.Arguments(0).toLowerCase() == "auto")
      {
        if (aAPIs[oSelect.API].AutoDetect)
          oSelect.FromLang = 0;
      }
      else
      {
        for (i = aAPIs[oSelect.API].AutoDetect; i < SendMessage(aWnd[IDFROMLANGCB].Handle, CB_GETCOUNT, 0, 0); ++i)
        {
          if (WScript.Arguments(0) == aLangs[SendMessage(aWnd[IDFROMLANGCB].Handle, CB_GETITEMDATA, i, 0)][0])
          {
            oSelect.FromLang = i;
            break;
          }
        }
      }
    }
  }
  else
  {
    oSelect.FromLang = 0;
    for (i = 0; i < SendMessage(aWnd[IDFROMLANGCB].Handle, CB_GETCOUNT, 0, 0); ++i)
    {
      if (nFromLang == SendMessage(aWnd[IDFROMLANGCB].Handle, CB_GETITEMDATA, i, 0))
      {
        oSelect.FromLang = i;
        break;
      }
    }
  }

  SendMessage(aWnd[IDFROMLANGCB].Handle, CB_SETCURSEL, oSelect.FromLang, 0);
}

function FillComboToLang(nToLang)
{
  var nFromLang = SendMessage(aWnd[IDFROMLANGCB].Handle, CB_GETITEMDATA, oSelect.FromLang, 0);
  var nPos;
  var i;

  SendMessage(aWnd[IDTOLANGCB].Handle, CB_RESETCONTENT, 0, 0);

  if ((nFromLang > -1) && (aLangs[nFromLang][oSelect.API + 3]) instanceof Array)
  {
    for (i = 0; i < aLangs[nFromLang][oSelect.API + 3].length; ++i)
    {
      nPos = SendMessage(aWnd[IDTOLANGCB].Handle, CB_ADDSTRING, 0, aLangs[aLangs[nFromLang][oSelect.API + 3][i]][Number(! bSortCode)] + " - "  + aLangs[aLangs[nFromLang][oSelect.API + 3][i]][Number(bSortCode)]);
      SendMessage(aWnd[IDTOLANGCB].Handle, CB_SETITEMDATA, nPos, aLangs[nFromLang][oSelect.API + 3][i]);
    }
  }
  else
  {
    for (i = 0; i < aLangs.length; ++i)
    {
      if (aLangs[i][oSelect.API + 3])
      {
        nPos = SendMessage(aWnd[IDTOLANGCB].Handle, CB_ADDSTRING, 0, aLangs[i][Number(! bSortCode)] + " - "  + aLangs[i][Number(bSortCode)]);
        SendMessage(aWnd[IDTOLANGCB].Handle, CB_SETITEMDATA, nPos, i);
      }
    }
  }

  if (typeof nToLang == "undefined")
  {
    if (WScript.Arguments.length > 1)
    {
      for (i = 0; i < SendMessage(aWnd[IDTOLANGCB].Handle, CB_GETCOUNT, 0, 0); ++i)
      {
        if (WScript.Arguments(1) == aLangs[SendMessage(aWnd[IDTOLANGCB].Handle, CB_GETITEMDATA, i, 0)][0])
        {
          oSelect.ToLang = i;
          break;
        }
      }
    }
  }
  else
  {
    oSelect.ToLang = 0;
    for (i = 0; i < SendMessage(aWnd[IDTOLANGCB].Handle, CB_GETCOUNT, 0, 0); ++i)
    {
      if (nToLang == SendMessage(aWnd[IDTOLANGCB].Handle, CB_GETITEMDATA, i, 0))
      {
        oSelect.ToLang = i;
        break;
      }
    }
  }

  SendMessage(aWnd[IDTOLANGCB].Handle, CB_SETCURSEL, oSelect.ToLang, 0);
}

function SwitchLang(bSwitchText)
{
  var nFromLang = SendMessage(aWnd[IDFROMLANGCB].Handle, CB_GETITEMDATA, oSelect.FromLang, 0);
  var nToLang   = SendMessage(aWnd[IDTOLANGCB  ].Handle, CB_GETITEMDATA, oSelect.ToLang,   0);
  var nSelTarget;
  var nSelSource;
  var i;

  for (i = 0; i < SendMessage(aWnd[IDFROMLANGCB].Handle, CB_GETCOUNT, 0, 0); ++i)
  {
    if (nToLang == SendMessage(aWnd[IDFROMLANGCB].Handle, CB_GETITEMDATA, i, 0))
    {
      oSelect.FromLang = i;
      break;
    }
  }


  FillComboToLang(0);
  oSelect.ToLang = 0;

  if (nFromLang == -1) //Auto detect
  {
    if (nDetectLang >= 0)
    {
      for (i = 0; i < SendMessage(aWnd[IDTOLANGCB].Handle, CB_GETCOUNT, 0, 0); ++i)
      {
        if (nDetectLang == SendMessage(aWnd[IDTOLANGCB].Handle, CB_GETITEMDATA, i, 0))
        {
          oSelect.ToLang = i;
          break;
        }
      }
    }
  }
  else
  {
    for (i = 0; i < SendMessage(aWnd[IDTOLANGCB].Handle, CB_GETCOUNT, 0, 0); ++i)
    {
      if (nFromLang == SendMessage(aWnd[IDTOLANGCB].Handle, CB_GETITEMDATA, i, 0))
      {
        oSelect.ToLang = i;
        break;
      }
    }
  }

  SendMessage(aWnd[IDFROMLANGCB].Handle, CB_SETCURSEL, oSelect.FromLang, 0);
  SendMessage(aWnd[IDTOLANGCB  ].Handle, CB_SETCURSEL, oSelect.ToLang,   0);

  if (bSwitchText)
  {
    sTarget = GetWindowText(aWnd[IDTXTSOURCE].Handle);
    sSource = GetWindowText(aWnd[IDTXTTARGET].Handle).substr(0, aAPIs[oSelect.API].TextLen);

    nSelTarget = SendMessage(aWnd[IDTXTSOURCE].Handle, 0x00B0 /*EM_GETSEL*/, 0, 0);
    nSelSource = SendMessage(aWnd[IDTXTTARGET].Handle, 0x00B0 /*EM_GETSEL*/, 0, 0);

    SetWindowText(aWnd[IDTXTSOURCE].Handle, sSource);
    SetWindowText(aWnd[IDTXTTARGET].Handle, sTarget);

    SendMessage(aWnd[IDTXTSOURCE].Handle, 0x00B1 /*EM_SETSEL*/, LoWord(nSelSource), HiWord(nSelSource));
    SendMessage(aWnd[IDTXTTARGET].Handle, 0x00B1 /*EM_SETSEL*/, LoWord(nSelTarget), HiWord(nSelTarget));
  }

  ShowDetectLang(false);
  EnableListenWindows();
}

function ShowDetectLang(bShow)
{
 if (bShow)
  {
    if (nDetectLang >= 0)
      SetWindowText(aWnd[IDDETECTLANG].Handle, sTxtAutoDetect + ": " + aLangs[nDetectLang][1]);
  }
  else
  {
    nDetectLang = -1;
    SetWindowText(aWnd[IDDETECTLANG].Handle, "");
  }
}

function EnableListenWindows()
{
  var nFromLang = SendMessage(aWnd[IDFROMLANGCB].Handle, CB_GETITEMDATA, oSelect.FromLang, 0);
  var nToLang   = SendMessage(aWnd[IDTOLANGCB  ].Handle, CB_GETITEMDATA, oSelect.ToLang, 0);

  if (nFromLang < 0)
    nFromLang = nDetectLang;

  if (nFromLang < 0)
    oSys.Call("User32::EnableWindow", aWnd[IDLISTEN1].Handle, 0);
  else
    oSys.Call("User32::EnableWindow", aWnd[IDLISTEN1].Handle, aLangs[nFromLang][2]);

  oSys.Call("User32::EnableWindow", aWnd[IDLISTEN2].Handle, aLangs[nToLang][2]);
}

function ShowSourceWindow()
{
  if (bSourceWnd)
  {
    aWnd[IDTXTTARGET].X = aWnd[IDTXTTARGET].X + aWnd[IDTXTTARGET].W - aWnd[IDTXTSOURCE].W;
    aWnd[IDTXTTARGET].W = aWnd[IDTXTSOURCE].W;
    hFocus = aWnd[IDTXTSOURCE].Handle;
  }
  else
  {
    aWnd[IDTXTTARGET].W = aWnd[IDTXTTARGET].X + aWnd[IDTXTTARGET].W - aWnd[IDTXTSOURCE].X;
    aWnd[IDTXTTARGET].X = aWnd[IDTXTSOURCE].X;
    hFocus = aWnd[IDTXTTARGET].Handle;
  }

  oSys.Call("User32::ShowWindow", aWnd[IDSWITCHALL].Handle, bSourceWnd);
  oSys.Call("User32::ShowWindow", aWnd[IDLISTEN1  ].Handle, bSourceWnd);
  oSys.Call("User32::ShowWindow", aWnd[IDTXTSOURCE].Handle, bSourceWnd);
  oSys.Call("User32::SetFocus", hFocus);
  ResizeWindow(hWndDlg)
}

function SetOpacityLevel(hWnd, nLevel)
{
  var nStyle = oSys.Call("User32::GetWindowLongW", hWnd, -20 /*GWL_EXSTYLE*/);
  var lpAlpha;

  if (! (nStyle & 0x00080000 /*WS_EX_LAYERED*/))
    oSys.Call("User32::SetWindowLongW", hWnd, -20 /*GWL_EXSTYLE*/, nStyle |= 0x00080000 /*WS_EX_LAYERED*/);

  if (nLevel < 0)
  {
    lpAlpha = AkelPad.MemAlloc(1);
    if (oSys.Call("User32::GetLayeredWindowAttributes", hWnd, 0, lpAlpha, 0))
      nOpacity = AkelPad.MemRead(lpAlpha, DT_BYTE);
    else
      nOpacity = 255;
    nOpacity += (nLevel == -1) ? 20 : -20;
    AkelPad.MemFree(lpAlpha);
  }

  if (nOpacity > 255)
    nOpacity = 255;
  else if (nOpacity < 55)
    nOpacity = 55;

  oSys.Call("User32::SetLayeredWindowAttributes", hWnd, 0, nOpacity, 2 /*LWA_ALPHA*/);
}

function InsertTextToAP(hWnd, bEntireText)
{
  if (hEditWnd)
  {
    var sText;

    if (bEntireText)
      sText = GetWindowText(hWnd);
    else
      sText = GetEditSelText(hWnd);

    if (sText) AkelPad.ReplaceSel(sText, 1);
  }
}

function PasteTextFromAP(hWnd, bEntireText)
{
  if (hEditWnd && (AkelPad.GetSelStart() != AkelPad.GetSelEnd()))
  {
    var sText = AkelPad.GetSelText(3 /*"\r\n"*/);

    if (bEntireText) SendMessage(hWnd, 0x00B1 /*EM_SETSEL*/, 0, -1);

    SendMessage(hWnd, 0x00C2 /*EM_REPLACESEL*/, 1, sText);
  }
}

function CopyEntireTextToCB(hWnd)
{
  var sText = GetWindowText(hWnd);

  if (sText) AkelPad.SetClipboardText(sText);
}

function PasteEntireTextFromCB(hWnd)
{
  if (AkelPad.GetClipboardText())
  {
    SendMessage(hWnd, 0x00B1 /*EM_SETSEL*/, 0, -1);
    SendMessage(hWnd, 0x0302 /*WM_PASTE*/, 0, 0);
  }
}

function DeleteEntireText(hWnd)
{
  SendMessage(hWnd, 0x00B1 /*EM_SETSEL*/, 0, -1);
  SendMessage(hWnd, 0x0303 /*WM_CLEAR*/, 0, 0);
}

function ContextMenu(hWnd, nPosParam)
{
  var MF_STRING    = 0x0;
  var MF_GRAYED    = 0x1;
  var MF_POPUP     = 0x10;
  var MF_SEPARATOR = 0x800;
  var hMenu  = oSys.Call("User32::CreatePopupMenu");
  var hMenu1 = oSys.Call("User32::CreatePopupMenu");
  var hMenu2 = oSys.Call("User32::CreatePopupMenu");
  var oRect;
  var lpPoint;
  var nPosX;
  var nPosY;
  var nWnd;
  var nCmd;

  //Sub menu source text (Entire text)
  oSys.Call("User32::AppendMenuW", hMenu1,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTSOURCE].Handle) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 21, sTxtCut + "\tAlt+X");
  oSys.Call("User32::AppendMenuW", hMenu1,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTSOURCE].Handle) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 22, sTxtCopyCB + "\tAlt+C");
  oSys.Call("User32::AppendMenuW", hMenu1,
            SendMessage(aWnd[IDTXTSOURCE].Handle, 0x0432 /*EM_CANPASTE*/, 0, 0) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 23, sTxtPasteCB + "\tAlt+V");
  oSys.Call("User32::AppendMenuW", hMenu1,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTSOURCE].Handle) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 24, sTxtDelete + "\tAlt+Del");
  oSys.Call("User32::AppendMenuW", hMenu1, MF_SEPARATOR, 0, 0);
  oSys.Call("User32::AppendMenuW", hMenu1,
            (hEditWnd && oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTSOURCE].Handle)) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 25, sTxtInsertAP + "\tShift+Alt+C");
  oSys.Call("User32::AppendMenuW", hMenu1,
            SendMessage(hEditWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 26, sTxtPasteAP + "\tShift+Alt+V");
  oSys.Call("User32::AppendMenuW", hMenu1, MF_SEPARATOR, 0, 0);
  oSys.Call("User32::AppendMenuW", hMenu1,
            (oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTSOURCE].Handle) && oSys.Call("User32::IsWindowEnabled", aWnd[IDLISTEN1].Handle)) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 27, sTxtListen + "\tCtrl+L");
  oSys.Call("User32::AppendMenuW", hMenu1, MF_SEPARATOR, 0, 0);
  oSys.Call("User32::AppendMenuW", hMenu1,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTSOURCE].Handle) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 28, sTxtTranslate + "\tCtrl+Enter");
  oSys.Call("User32::AppendMenuW", hMenu1,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTSOURCE].Handle) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 29, sTxtTranslateP + "\tAlt+Enter");

  //Sub menu target text (Entire text)
  oSys.Call("User32::AppendMenuW", hMenu2,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTTARGET].Handle) ? MF_STRING : MF_GRAYED,
            (2 << 8) | 21, sTxtCut + "\tAlt+X");
  oSys.Call("User32::AppendMenuW", hMenu2,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTTARGET].Handle) ? MF_STRING : MF_GRAYED,
            (2 << 8) | 22, sTxtCopyCB + "\tAlt+C");
  oSys.Call("User32::AppendMenuW", hMenu2,
            SendMessage(aWnd[IDTXTTARGET].Handle, 0x0432 /*EM_CANPASTE*/, 0, 0) ? MF_STRING : MF_GRAYED,
            (2 << 8) | 23, sTxtPasteCB + "\tAlt+V");
  oSys.Call("User32::AppendMenuW", hMenu2,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTTARGET].Handle) ? MF_STRING : MF_GRAYED,
            (2 << 8) | 24, sTxtDelete + "\tAlt+Del");
  oSys.Call("User32::AppendMenuW", hMenu2, MF_SEPARATOR, 0, 0);
  oSys.Call("User32::AppendMenuW", hMenu2,
            (hEditWnd && oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTTARGET].Handle)) ? MF_STRING : MF_GRAYED,
            (2 << 8) | 25, sTxtInsertAP + "\tShift+Alt+C");
  oSys.Call("User32::AppendMenuW", hMenu2,
            SendMessage(hEditWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
            (2 << 8) | 26, sTxtPasteAP + "\tShift+Alt+V");
  oSys.Call("User32::AppendMenuW", hMenu2, MF_SEPARATOR, 0, 0);
  oSys.Call("User32::AppendMenuW", hMenu2,
            (oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTTARGET].Handle) && oSys.Call("User32::IsWindowEnabled", aWnd[IDLISTEN2].Handle)) ? MF_STRING : MF_GRAYED,
            (2 << 8) | 27, sTxtListen + "\tCtrl+L");

  if (nPosParam == -2) //Context menu for button Options
  {
    oRect = new Object();
    GetWindowPos(hWnd, oRect);
    nPosX = oRect.X + oRect.W;
    nPosY = oRect.Y + oRect.H;

    if (bSourceWnd)
      oSys.Call("User32::AppendMenuW", hMenu, MF_POPUP, hMenu1, sTxtSource);

    oSys.Call("User32::AppendMenuW", hMenu, MF_POPUP, hMenu2, sTxtTarget);
    oSys.Call("User32::AppendMenuW", hMenu, MF_SEPARATOR, 0, 0);
    oSys.Call("User32::AppendMenuW", hMenu, MF_STRING, (1 << 8) | 41, sTxtSettings + "\tAlt+S");
  }
  else
  {
    if (nPosParam == -1) //Context menu from keyboard
    {
      lpPoint = AkelPad.MemAlloc(8); //sizeof(POINT)
      oSys.Call("User32::GetCaretPos", lpPoint);
      oSys.Call("User32::ClientToScreen", hWnd, lpPoint);
      nPosX = AkelPad.MemRead(lpPoint,     DT_DWORD);
      nPosY = AkelPad.MemRead(lpPoint + 4, DT_DWORD) + SendMessage(hWnd, 3188 /*AEM_GETCHARSIZE*/, 0 /*AECS_HEIGHT*/, 0);
      AkelPad.MemFree(lpPoint);
    }
    else //Right click
    {
      nPosX = LoWord(nPosParam);
      nPosY = HiWord(nPosParam);
    }

    nWnd = (hWnd == aWnd[IDTXTSOURCE].Handle) ? 1 : 2;

    oSys.Call("User32::IsWindowEnabled", aWnd[IDLISTEN1 + nWnd - 1].Handle)

    oSys.Call("User32::AppendMenuW", hMenu,
              SendMessage(hWnd, 0x00C6 /*EM_CANUNDO*/, 0, 0) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 1, sTxtUndo + "\tCtrl+Z");
    oSys.Call("User32::AppendMenuW", hMenu,
              SendMessage(hWnd, 0x0455 /*EM_CANREDO*/, 0, 0) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 2, sTxtRedo + "\tCtrl+Shift+Z");
    oSys.Call("User32::AppendMenuW", hMenu, MF_SEPARATOR, 0, 0);
    oSys.Call("User32::AppendMenuW", hMenu,
              SendMessage(hWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 3, sTxtCut + "\tCtrl+X");
    oSys.Call("User32::AppendMenuW", hMenu,
              SendMessage(hWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 4, sTxtCopyCB + "\tCtrl+C");
    oSys.Call("User32::AppendMenuW", hMenu,
              SendMessage(hWnd, 0x0432 /*EM_CANPASTE*/, 0, 0) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 5, sTxtPasteCB + "\tCtrl+V");
    oSys.Call("User32::AppendMenuW", hMenu,
              SendMessage(hWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 6, sTxtDelete + "\tDel");
    oSys.Call("User32::AppendMenuW", hMenu,
              oSys.Call("User32::GetWindowTextLengthW", hWnd) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 7, sTxtSelectAll + "\tCtrl+A");
    oSys.Call("User32::AppendMenuW", hMenu, MF_SEPARATOR, 0, 0);
    oSys.Call("User32::AppendMenuW", hMenu,
              (hEditWnd && SendMessage(hWnd, 3125 /*AEM_GETSEL*/, 0, 0)) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 8, sTxtInsertAP + "\tCtrl+Shift+C");
    oSys.Call("User32::AppendMenuW", hMenu,
              SendMessage(hEditWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 9, sTxtPasteAP + "\tCtrl+Shift+V");
    oSys.Call("User32::AppendMenuW", hMenu, MF_SEPARATOR, 0, 0);
    oSys.Call("User32::AppendMenuW", hMenu,
              (SendMessage(hWnd, 3125 /*AEM_GETSEL*/, 0, 0) && oSys.Call("User32::IsWindowEnabled", aWnd[IDLISTEN1 + nWnd - 1].Handle)) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 10, sTxtListen + "\tCtrl+Shift+L");
    if (nWnd == 1)
    {
      oSys.Call("User32::AppendMenuW", hMenu, MF_SEPARATOR, 0, 0);
      oSys.Call("User32::AppendMenuW", hMenu,
                SendMessage(hWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
                (nWnd << 8) | 11, sTxtTranslate + "\tShift+Enter");
      oSys.Call("User32::AppendMenuW", hMenu,
                SendMessage(hWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
                (nWnd << 8) | 12, sTxtTranslateP + "\tShift+Alt+Enter");
    }
    oSys.Call("User32::AppendMenuW", hMenu, MF_SEPARATOR, 0, 0);
    oSys.Call("User32::AppendMenuW", hMenu, MF_POPUP, (nWnd == 1) ? hMenu1 : hMenu2, sTxtEntireText);
  }

  nCmd = oSys.Call("User32::TrackPopupMenu", hMenu, (nPosParam > -2)
                    ? 0x180 /*TPM_NONOTIFY|TPM_RETURNCMD*/
                    : 0x188 /*TPM_RIGHTALIGN|TPM_NONOTIFY|TPM_RETURNCMD*/,
                    nPosX, nPosY, 0, hWndDlg, 0);

  oSys.Call("User32::DestroyMenu", hMenu);
  oSys.Call("User32::DestroyMenu", hMenu1);
  oSys.Call("User32::DestroyMenu", hMenu2);

  nWnd = nCmd >> 8;
  nCmd = nCmd & 0xFF;
  hWnd = (nWnd == 1) ? aWnd[IDTXTSOURCE].Handle : aWnd[IDTXTTARGET].Handle;

  //Selected text
  if (nCmd == 1)
    SendMessage(hWnd, 0x00C7 /*EM_UNDO*/, 0, 0);
  else if (nCmd == 2)
    SendMessage(hWnd, 0x0454 /*EM_REDO*/, 0, 0);
  else if (nCmd == 3)
    SendMessage(hWnd, 0x0300 /*WM_CUT*/, 0, 0);
  else if (nCmd == 4)
    SendMessage(hWnd, 0x0301 /*WM_COPY*/, 0, 0);
  else if (nCmd == 5)
    SendMessage(hWnd, 0x0302 /*WM_PASTE*/, 0, 0);
  else if (nCmd == 6)
    SendMessage(hWnd, 0x0303 /*WM_CLEAR*/, 0, 0);
  else if (nCmd == 7)
    SendMessage(hWnd, 0x00B1 /*EM_SETSEL*/, 0, -1);
  else if (nCmd == 8)
    InsertTextToAP(hWnd, 0);
  else if (nCmd == 9)
    PasteTextFromAP(hWnd, 0);
  else if (nCmd == 10)
    Listen(hWnd, 1);
  else if (nCmd == 11)
    Translate(1);
  else if (nCmd == 12)
    Translate(1, 1);

  //Entire text
  else if (nCmd == 21)
  {
    CopyEntireTextToCB(hWnd);
    DeleteEntireText(hWnd);
  }
  else if (nCmd == 22)
    CopyEntireTextToCB(hWnd);
  else if (nCmd == 23)
    PasteEntireTextFromCB(hWnd);
  else if (nCmd == 24)
    DeleteEntireText(hWnd);
  else if (nCmd == 25)
    InsertTextToAP(hWnd, 1);
  else if (nCmd == 26)
    PasteTextFromAP(hWnd, 1);
  else if (nCmd == 27)
    Listen(hWnd, 0);
  else if (nCmd == 28)
    Translate();
  else if (nCmd == 29)
    Translate(0, 1);

  //Settings
  else if (nCmd == 41)
    Settings();
}

function Settings()
{
  var oRect = {};
  var nW    = 440;
  var nH    = 350;
  var nX, nY;
  var hWndSet;

  GetWindowPos(hWndDlg, oRect);
  nX = oRect.X + (oRect.W - nW) / 2;
  nY = oRect.Y + (oRect.H - nH) / 2;

  hWndSet = oSys.Call("User32::CreateWindowExW",
                      0,            //dwExStyle
                      sClassName,   //lpClassName
                      sTxtSettings, //lpWindowName
                      0x90C80000,   //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU
                      nX,           //x
                      nY,           //y
                      nW,           //nWidth
                      nH,           //nHeight
                      hWndDlg,      //hWndParent
                      0,            //ID
                      hInstanceDLL, //hInstance
                      SettingsCallback); //lpParam

  if (hWndSet)
  {
    oSys.Call("User32::EnableWindow", hMainWnd, 0);
    oSys.Call("User32::EnableWindow", hWndDlg, 0);
  }
}

function SettingsCallback(hWnd, uMsg, wParam, lParam)
{
  var i;

  if (uMsg == 1) //WM_CREATE
  {
    for (i = 1100; i < aWndSet.length; ++i)
    {
      aWndSet[i].Handle =
        oSys.Call("User32::CreateWindowExW",
          0,                //dwExStyle
          aWndSet[i].Class, //lpClassName
          0,                //lpWindowName
          aWndSet[i].Style, //dwStyle
          aWndSet[i].X,     //x
          aWndSet[i].Y,     //y
          aWndSet[i].W,     //nWidth
          aWndSet[i].H,     //nHeight
          hWnd,             //hWndParent
          i,                //ID
          hInstanceDLL,     //hInstance
          0);               //lpParam
      SetWindowFont(aWndSet[i].Handle, hGuiFont);
      SetWindowText(aWndSet[i].Handle, aWndSet[i].Txt);
    }

    SendMessage(hWnd, 0x0080 /*WM_SETICON*/, 0 /*ICON_SMALL*/, hIcon);

    SendMessage(aWndSet[IDAPIKEY1].Handle, 197 /*EM_SETLIMITTEXT*/, 128, 0);
    SetWindowText(aWndSet[IDAPIKEY1].Handle, aAPIs[1].APIkeyP);

    FillComboInterface();

    //Check buttons
    SendMessage(aWndSet[IDSOURCEINCB].Handle, 241 /*BM_SETCHECK*/, bSourceInCB || (! hEditWnd), 0);
    SendMessage(aWndSet[IDSOURCEWND ].Handle, 241 /*BM_SETCHECK*/, bSourceWnd, 0);
    SendMessage(aWndSet[IDLOADTEXT  ].Handle, 241 /*BM_SETCHECK*/, bLoadText,  0);
    SendMessage(aWndSet[IDIMMEDIATE ].Handle, 241 /*BM_SETCHECK*/, bImmediate, 0);
    SendMessage(aWndSet[IDWORDWRAP  ].Handle, 241 /*BM_SETCHECK*/, bWordWrap,  0);
    SendMessage(aWndSet[IDFONTAP    ].Handle, 241 /*BM_SETCHECK*/, bFontAP && hEditWnd, 0);
    SendMessage(aWndSet[IDFONTGUI   ].Handle, 241 /*BM_SETCHECK*/, bFontGUI,   0);
    SendMessage(aWndSet[IDSORTNAME - bSortCode].Handle, 241 /*BM_SETCHECK*/, 1, 0);
    oSys.Call("User32::EnableWindow", aWndSet[IDSOURCEINCB].Handle, hEditWnd);
    oSys.Call("User32::EnableWindow", aWndSet[IDLOADTEXT  ].Handle, bSourceWnd);
    oSys.Call("User32::EnableWindow", aWndSet[IDIMMEDIATE ].Handle, (! bSourceWnd) || (bSourceWnd && bLoadText));
    oSys.Call("User32::EnableWindow", aWndSet[IDFONTAP    ].Handle, hEditWnd);
    oSys.Call("User32::EnableWindow", aWndSet[IDFONT      ].Handle, ((! bFontAP) || (! hEditWnd)) && (! bFontGUI));

    hFocusSet = aWndSet[IDINTERFACECB].Handle;
  }

  else if ((uMsg == 6 /*WM_ACTIVATE*/) && (! wParam))
    hFocusSet = oSys.Call("User32::GetFocus");

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("User32::SetFocus", hFocusSet);

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (bCloseCB)
    {
      if ((wParam == 13 /*VK_RETURN*/) && (oSys.Call("User32::GetFocus") != aWndSet[IDFONT].Handle))
        PostMessage(hWnd, 273 /*WM_COMMAND*/, IDOK, 0);
      else if (wParam == 27 /*VK_ESCAPE*/)
        PostMessage(hWnd, 16 /*WM_CLOSE*/, 0, 0);
    }
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    var nLowParam = LoWord(wParam);
    var nHiwParam = HiWord(wParam);
    bCloseCB = 1;

    if (nLowParam == IDINTERFACECB)
    {
      if (nHiwParam == CBN_CLOSEUP)
        bCloseCB = 0;
    }
    else if ((nLowParam == IDSOURCEWND) || (nLowParam == IDLOADTEXT))
    {
      oSys.Call("User32::EnableWindow", aWndSet[IDLOADTEXT].Handle,
                SendMessage(aWndSet[IDSOURCEWND].Handle, 240 /*BM_GETCHECK*/, 0, 0));
      oSys.Call("User32::EnableWindow", aWndSet[IDIMMEDIATE].Handle,
                (! SendMessage(aWndSet[IDSOURCEWND].Handle, 240 /*BM_GETCHECK*/, 0, 0)) ||
                (SendMessage(aWndSet[IDSOURCEWND].Handle, 240 /*BM_GETCHECK*/, 0, 0) &&
                 SendMessage(aWndSet[IDLOADTEXT].Handle, 240 /*BM_GETCHECK*/, 0, 0)));
    }
    else if (nLowParam == IDFONTAP)
    {
      if (SendMessage(aWndSet[IDFONTAP].Handle, 240 /*BM_GETCHECK*/, 0, 0))
        SendMessage(aWndSet[IDFONTGUI].Handle, 241 /*BM_SETCHECK*/, 0, 0);

      oSys.Call("User32::EnableWindow", aWndSet[IDFONT].Handle,
                (! SendMessage(aWndSet[IDFONTAP].Handle, 240 /*BM_GETCHECK*/, 0, 0)) &&
                (! SendMessage(aWndSet[IDFONTGUI].Handle, 240 /*BM_GETCHECK*/, 0, 0)));
    }
    else if (nLowParam == IDFONTGUI)
    {
      if (SendMessage(aWndSet[IDFONTGUI].Handle, 240 /*BM_GETCHECK*/, 0, 0) && hEditWnd)
        SendMessage(aWndSet[IDFONTAP].Handle, 241 /*BM_SETCHECK*/, 0, 0);

      oSys.Call("User32::EnableWindow", aWndSet[IDFONT].Handle,
                ((! SendMessage(aWndSet[IDFONTAP].Handle, 240 /*BM_GETCHECK*/, 0, 0)) || (! hEditWnd)) &&
                 (! SendMessage(aWndSet[IDFONTGUI].Handle, 240 /*BM_GETCHECK*/, 0, 0)));
    }
    else if (nLowParam == IDFONT)
    {
      var vCF;
      if (vCF = ChooseFont(hWnd, aFont))
      {
        aFont = vCF;
        oSys.Call("User32::SetWindowTextW", aWndSet[IDFONT].Handle, aWndSet[IDFONT].Txt = aFont.toString());
      }
      oSys.Call("User32::SetFocus", aWndSet[IDFONT].Handle);
    }
    else if (nLowParam == IDOK)
    {
      //Change interface language
      var nCurSel   = SendMessage(aWndSet[IDINTERFACECB].Handle, CB_GETCURSEL, 0, 0);
      var sLangName = "";
      if (SendMessage(aWndSet[IDINTERFACECB].Handle, CB_GETITEMDATA, nCurSel, 0) != -1)
      {
        SendMessage(aWndSet[IDINTERFACECB].Handle, 0x0148 /*CB_GETLBTEXT*/, nCurSel, lpBuffer);
        sLangName = AkelPad.MemRead(lpBuffer, DT_UNICODE);
      }
      if (sLangName.toUpperCase() != sLanguage.toUpperCase())
      {
        sLanguage = sLangName;
        ReadInterfaceLang();
        SetInterfaceLangToWndDef();
        SetWindowText(hWndDlg, sTxtCaption);
        for (i = IDUSE; i <= IDOPTIONS; ++i)
          SetWindowText(aWnd[i].Handle, aWnd[i].Txt);

        ShowDetectLang(true);
      }

      if (hEditWnd)
      {
        bSourceInCB = SendMessage(aWndSet[IDSOURCEINCB].Handle, 240 /*BM_GETCHECK*/, 0, 0);
        bFontAP     = SendMessage(aWndSet[IDFONTAP    ].Handle, 240 /*BM_GETCHECK*/, 0, 0);
      }

      bSourceWnd = SendMessage(aWndSet[IDSOURCEWND].Handle, 240 /*BM_GETCHECK*/, 0, 0);
      bLoadText  = SendMessage(aWndSet[IDLOADTEXT ].Handle, 240 /*BM_GETCHECK*/, 0, 0);
      bImmediate = SendMessage(aWndSet[IDIMMEDIATE].Handle, 240 /*BM_GETCHECK*/, 0, 0);
      bWordWrap  = SendMessage(aWndSet[IDWORDWRAP ].Handle, 240 /*BM_GETCHECK*/, 0, 0);
      bFontGUI   = SendMessage(aWndSet[IDFONTGUI  ].Handle, 240 /*BM_GETCHECK*/, 0, 0);
      bSortCode  = SendMessage(aWndSet[IDSORTCODE ].Handle, 240 /*BM_GETCHECK*/, 0, 0);

      SetEditWordWrap();
      SetEditFont();
      ShowSourceWindow();
      FillComboFromLang(SendMessage(aWnd[IDFROMLANGCB].Handle, CB_GETITEMDATA, oSelect.FromLang, 0));
      FillComboToLang(SendMessage(aWnd[IDTOLANGCB].Handle, CB_GETITEMDATA, oSelect.ToLang, 0));

      aAPIs[1].APIkeyP = GetWindowText(aWndSet[IDAPIKEY1].Handle);

      PostMessage(hWnd, 16 /*WM_CLOSE*/, 0, 0);
    }
    else if (nLowParam == IDCANCEL)
      PostMessage(hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    oSys.Call("User32::EnableWindow", hMainWnd, 1);
    oSys.Call("User32::EnableWindow", hWndDlg, 1);
    oSys.Call("User32::DestroyWindow", hWnd);
  }

  return 0;
}

function FillComboInterface()
{
  var sScriptName = WScript.ScriptName.substring(0, WScript.ScriptName.lastIndexOf(".")) + "_";
  var sTemplate   = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + "_*.lng";
  var hFindFile   = oSys.Call("Kernel32::FindFirstFileW", sTemplate, lpBuffer);
  var sLangFile;
  var sLangName;
  var nPos;

  nPos = SendMessage(aWndSet[IDINTERFACECB].Handle, CB_ADDSTRING, 0, "English (built-in)");
  SendMessage(aWndSet[IDINTERFACECB].Handle, CB_SETITEMDATA, nPos, -1);
  SendMessage(aWndSet[IDINTERFACECB].Handle, CB_SETCURSEL, nPos, 0);

  if (hFindFile != -1) //INVALID_HANDLE_VALUE
  {
    do
    {
      sLangFile = AkelPad.MemRead(lpBuffer + 44 /*WIN32_FIND_DATAW,cFileName*/, DT_UNICODE);
      sLangName = sLangFile.substring(sScriptName.length, sLangFile.lastIndexOf("."));

      if (sLangName)
      {
        nPos = SendMessage(aWndSet[IDINTERFACECB].Handle, CB_ADDSTRING, 0, sLangName);

        if (sLangName.toUpperCase() == sLanguage.toUpperCase())
          SendMessage(aWndSet[IDINTERFACECB].Handle, CB_SETCURSEL, nPos, 0);
      }
    }
    while(oSys.Call("Kernel32::FindNextFileW", hFindFile, lpBuffer));
  }
  oSys.Call("Kernel32::FindClose", hFindFile);
}

function ChooseFont(hWndOwn, aFontIni)
{
  var nCFSize    = _X64 ? 104 : 60; //sizeof(CHOOSEFONT)
  var lpCF       = AkelPad.MemAlloc(nCFSize);
  var lpLF       = ConvertFontFormat(aFontIni, 3, 1);
  var lpCallback = oSys.RegisterCallback(0, CFHookProcCallback, 4);
  var vResult    = 0;

  AkelPad.MemCopy(lpCF,                       nCFSize, DT_DWORD); //lStructSize
  AkelPad.MemCopy(lpCF + (_X64 ?  8 :  4),    hWndOwn, DT_QWORD); //hwndOwner
  AkelPad.MemCopy(lpCF + (_X64 ? 24 : 12),       lpLF, DT_QWORD); //lpLogFont
  AkelPad.MemCopy(lpCF + (_X64 ? 36 : 20), 0x00010049, DT_DWORD); //Flags=CF_ENABLEHOOK|CF_FORCEFONTEXIST|CF_INITTOLOGFONTSTRUCT|CF_SCREENFONTS
  AkelPad.MemCopy(lpCF + (_X64 ? 56 : 32), lpCallback, DT_QWORD); //lpfnHook

  if (oSys.Call("Comdlg32::ChooseFontW", lpCF))
    vResult = ConvertFontFormat(lpLF, 1, 3);

  oSys.UnregisterCallback(lpCallback);
  AkelPad.MemFree(lpCF);
  AkelPad.MemFree(lpLF);

  return vResult;
}

function CFHookProcCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 272 /*WM_INITDIALOG*/)
  {
    var hWndOwn   = AkelPad.MemRead(lParam + (_X64 ? 8 : 4), DT_QWORD);
    var oRectWnd  = {};
    var oRectOwn  = {};
    var oRectDesk = {};

    //center dialog
    GetWindowPos(hWnd, oRectWnd);
    GetWindowPos(hWndOwn, oRectOwn);
    GetWindowPos(oSys.Call("User32::GetDesktopWindow"), oRectDesk);

    oRectWnd.X = oRectOwn.X + (oRectOwn.W - oRectWnd.W) / 2;
    oRectWnd.Y = oRectOwn.Y + (oRectOwn.H - oRectWnd.H) / 2;

    if ((oRectWnd.X + oRectWnd.W) > oRectDesk.W)
      oRectWnd.X = oRectDesk.W - oRectWnd.W;
    if (oRectWnd.X < 0)
      oRectWnd.X = 0;
    if ((oRectWnd.Y + oRectWnd.H) > oRectDesk.H)
      oRectWnd.Y = oRectDesk.H - oRectWnd.H;
    if (oRectWnd.Y < 0)
      oRectWnd.Y = 0;

    oSys.Call("User32::MoveWindow", hWnd, oRectWnd.X, oRectWnd.Y, oRectWnd.W, oRectWnd.H, 0);
  }

  return 0;
}

//---------------------------------------------------
// vFont - pointer to LOGFONTW, font handle, or array
// nInType - vFont type,
// nRetType - vResult type:
//   1 - pointer to LOGFONTW structure
//   2 - handle to font
//   3 - array [sFontName, nFontStyle, nFontSize]
//---------------------------------------------------
function ConvertFontFormat(vFont, nInType, nRetType)
{
  var nLFSize = 28 + 32 * 2; //sizeof(LOGFONTW)
  var lpLF    = AkelPad.MemAlloc(nLFSize);
  var hFont;
  var hDC;
  var nHeight;
  var nWeight;
  var bItalic;
  var vRetVal;
  var i;

  if (nInType == 1)
  {
    for (i = 0; i < nLFSize; ++i)
      AkelPad.MemCopy(lpLF + i, AkelPad.MemRead(vFont + i, DT_BYTE), DT_BYTE);
  }
  else if (nInType == 2)
  {
    if (! vFont)
      vFont = oSys.Call("Gdi32::GetStockObject", 13 /*SYSTEM_FONT*/);

    oSys.Call("Gdi32::GetObjectW", vFont, nLFSize, lpLF);
  }
  else if (nInType == 3)
  {
    hDC     = oSys.Call("User32::GetDC", hMainWnd);
    nHeight = -oSys.Call("Kernel32::MulDiv", vFont[2], oSys.Call("Gdi32::GetDeviceCaps", hDC, 90 /*LOGPIXELSY*/), 72);
    oSys.Call("User32::ReleaseDC", hMainWnd, hDC);

    nWeight = 400;
    bItalic = 0;
    if ((vFont[1] == 2) || (vFont[1] == 4))
      nWeight = 700;
    if (vFont[1] > 2)
      bItalic = 1;

    AkelPad.MemCopy(lpLF     , nHeight,  DT_DWORD); //lfHeight
    AkelPad.MemCopy(lpLF + 16, nWeight,  DT_DWORD); //lfWeight
    AkelPad.MemCopy(lpLF + 20, bItalic,  DT_BYTE);  //lfItalic
    AkelPad.MemCopy(lpLF + 28, vFont[0], DT_UNICODE); //lfFaceName
  }

  if (nRetType == 1)
    vRetVal = lpLF;
  else if (nRetType == 2)
  {
    vRetVal = oSys.Call("Gdi32::CreateFontIndirectW", lpLF);
    AkelPad.MemFree(lpLF);
  }
  else if (nRetType == 3)
  {
    vRetVal    = [];
    vRetVal[0] = AkelPad.MemRead(lpLF + 28, DT_UNICODE); //lfFaceName

    nWeight = AkelPad.MemRead(lpLF + 16, DT_DWORD); //lfWeight
    bItalic = AkelPad.MemRead(lpLF + 20, DT_BYTE);  //lfItalic

    if (nWeight < 600)
      vRetVal[1] = 1;
    else
      vRetVal[1] = 2;

    if (bItalic)
      vRetVal[1] += 2;

    hDC        = oSys.Call("User32::GetDC", hMainWnd);
    nHeight    = AkelPad.MemRead(lpLF, DT_DWORD); //lfHeight
    vRetVal[2] = -oSys.Call("Kernel32::MulDiv", nHeight, 72, oSys.Call("Gdi32::GetDeviceCaps", hDC, 90 /*LOGPIXELSY*/));
    oSys.Call("User32::ReleaseDC", hMainWnd, hDC); 
    AkelPad.MemFree(lpLF);
  }

  return vRetVal;
}

function Translate(bSelection, bAddToTarget)
{
  var sMethod    = "POST";
  var sAPIkey    = aAPIs[oSelect.API].APIkeyP ? aAPIs[oSelect.API].APIkeyP : aAPIs[oSelect.API].APIkey;
  var nFromLang  = SendMessage(aWnd[IDFROMLANGCB].Handle, CB_GETITEMDATA, oSelect.FromLang, 0);
  var sFromLang  = (nFromLang < 0) ? "" : aLangs[nFromLang][0];
  var sToLang    = aLangs[SendMessage(aWnd[IDTOLANGCB].Handle, CB_GETITEMDATA, oSelect.ToLang, 0)][0];
  var nTargetLen = oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTTARGET].Handle)
  var nTargetSel = 0;
  var sLangName;
  var sURL;
  var sSend;
  var oRequest;
  var oResponse;
  var i, n;

  SetWindowText(aWnd[IDDETECTLANG].Handle, sTxtWait);
  nDetectLang = -1;

  try
  {
    oRequest = new ActiveXObject("Microsoft.XMLHTTP");
  }
  catch (oError)
  {
    ErrorBox(sTxtNoSupport);
    return;
  }

  if (bSourceWnd)
  {
    if (bSelection && SendMessage(aWnd[IDTXTSOURCE].Handle, 3125 /*AEM_GETSEL*/, 0, 0))
      sSource = GetEditSelText(aWnd[IDTXTSOURCE].Handle);
    else
      sSource = GetWindowText(aWnd[IDTXTSOURCE].Handle);
  }
  else
  {
    if (bSourceInCB || (! hEditWnd) || ((WScript.Arguments.length > 2) && (WScript.Arguments(2) == "1")))
      sSource = AkelPad.GetClipboardText().substr(0, aAPIs[oSelect.API].TextLen);
    else
      sSource = AkelPad.GetSelText(3 /*"\r\n"*/).substr(0, aAPIs[oSelect.API].TextLen);
  }

  sSource = sSource.replace(/^[ \t\r\n]+|[ \t\r\n]+$/, "");

  if (! sSource)
  {
    ErrorBox(sTxtNoText);
    return;
  }

  if (oSelect.API == 0) //Google
  {
    sURL  = "http://translate.google.com/translate_a/t";
    sSend = "client=qlt&sl=" + (sFromLang || "auto") + "&tl=" + sToLang + "&q=" + encodeURIComponent(sSource);
  }
  else if (oSelect.API == 1) //Bing
//  //Bing GET method
//  {
//    sMethod = "GET";
//
//    if (nFromLang < 0) //Auto detect
//    {
//      sURL = "http://api.microsofttranslator.com/V2/Http.svc/Detect?appId=" + sAPIkey + "&text=" + encodeURIComponent(sSource);
//
//      OpenRequest(oRequest, sMethod, sURL);
//
//      if (! SendRequest(oRequest, null))
//        return;
//
//      if (oRequest.status != 200)
//      {
//        ErrorBox(oRequest.status + " : " + oRequest.statusText);
//        return;
//      }
//      sFromLang = oRequest.responseText.substring(oRequest.responseText.indexOf(">") + 1, oRequest.responseText.lastIndexOf("<"));
//    }
//
//    sURL  = "http://api.microsofttranslator.com/V2/Http.svc/Translate?appId=" + sAPIkey + "&from=" + sFromLang + "&to=" + sToLang + "&text=" + encodeURIComponent(sSource);
//    sSend = null;
//  }
  //Bing POST method
  {
    if (nFromLang < 0) //Auto detect
    {
      sURL = "http://api.microsofttranslator.com/V2/Http.svc/Detect?appId=" + sAPIkey;

      OpenRequest(oRequest, sMethod, sURL);

      if (! SendRequest(oRequest, sSource))
        return;

      if (oRequest.status != 200)
      {
        ErrorBox(oRequest.status + " : " + oRequest.statusText);
        return;
      }
      sFromLang = oRequest.responseText.substring(oRequest.responseText.indexOf(">") + 1, oRequest.responseText.lastIndexOf("<"));
    }

    sURL  = "http://api.microsofttranslator.com/V2/Http.svc/Translate?appId=" + sAPIkey + "&from=" + sFromLang + "&to=" + sToLang;
    sSend = sSource;
  }
  else //Yandex
  {
    sURL  = "http://translate.yandex.ru/tr.json/translate";
    sSend = "lang=" + sFromLang + "-" + sToLang + "&text=" + encodeURIComponent(sSource) + "&srv=tr-text";
  }

  OpenRequest(oRequest, sMethod, sURL);

  if (! SendRequest(oRequest, sSend))
    return;

  if (oRequest.status != 200)
  {
    ErrorBox(oRequest.status + " : " + oRequest.statusText);
    return;
  }

  if (oSelect.API == 0) //Google
  {
    eval("oResponse=" + oRequest.responseText + ";");

    sFromLang = oResponse.src;

    sTarget = "";
    for (i = 0; i < oResponse.sentences.length; ++i)
      sTarget += oResponse.sentences[i].trans;

    if (oResponse.dict)
    {
      for (i = 0; i < oResponse.dict.length; ++i)
      {
        sTarget += "\r\n\r\n" + oResponse.dict[i].pos + ":";
        for (n = 0; n < oResponse.dict[i].terms.length; ++n)
          sTarget += "\r\n" + (n + 1) + ". " + oResponse.dict[i].terms[n];
      }
    }
  }
  else if (oSelect.API == 1) //Bing
  {
    sTarget = oRequest.responseText.substring(oRequest.responseText.indexOf(">") + 1, oRequest.responseText.lastIndexOf("<"));
    sTarget = sTarget.replace(/&#xD;/g, "\r");
    sTarget = sTarget.replace(/&amp;/g, "&");
    sTarget = sTarget.replace(/&lt;/g,  "<");
    sTarget = sTarget.replace(/&gt;/g,  ">");
  }
  else //Yandex
  {
    sTarget = eval(oRequest.responseText);
  }

  if (bAddToTarget && nTargetLen)
    sTarget = "\r\n\r\n" + sTarget;

  SendMessage(aWnd[IDTXTTARGET].Handle, 0x00B1 /*EM_SETSEL*/, bAddToTarget ? -1 : 0, -1);

  if (bAddToTarget && nTargetLen)
    nTargetSel = oSelect.Target1 + 2;

  SendMessage(aWnd[IDTXTTARGET].Handle, 0x00C2 /*EM_REPLACESEL*/, 1, sTarget);
  SendMessage(aWnd[IDTXTTARGET].Handle, 0x00B1 /*EM_SETSEL*/, nTargetSel, nTargetSel);

  if (nFromLang < 0)
  {
    for (i = 0; i < aLangs.length; ++i)
    {
      if (aLangs[i][0] == sFromLang)
      {
        nDetectLang = i;
        sLangName   = aLangs[i][1];
        break;
      }
    }
    if (! sLangName)
      sLangName = sFromLang + " - "  + sTxtUndefined;

    SetWindowText(aWnd[IDDETECTLANG].Handle, sTxtAutoDetect + ": " + sLangName);
  }
  else
    SetWindowText(aWnd[IDDETECTLANG].Handle, "");

  EnableListenWindows();
}

function OpenRequest(oRequest, sMethod, sURL)
{
  oRequest.open(sMethod, sURL, false);
  oRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
}

function SendRequest(oRequest, sSend)
{
  try
  {
    oRequest.send(sSend);
  }
  catch (oError)
  {
    ErrorBox(sTxtNoInternet);
    return false;
  }
  return true;
}

function ErrorBox(sError)
{
  SetWindowText(aWnd[IDDETECTLANG].Handle, "");
  AkelPad.MessageBox(hWndDlg, sError, sTxtError, 48);
}

function Listen(hWnd, nSelection)
{
  var lpReturn = AkelPad.MemAlloc(64 * 2);
  var sMode;

  oSys.Call("Winmm::mciSendStringW", "status TTS mode", lpReturn, 64, 0);
  sMode = AkelPad.MemRead(lpReturn, DT_UNICODE);
  AkelPad.MemFree(lpReturn);

  if (sMode == "playing")
  {
    oSys.Call("Winmm::mciSendStringW", "close TTS", 0, 0, 0);
    KillTimer();
  }
  else
  {
    if (nSelection < 0)
      nSelection = SendMessage(hWnd, 3125 /*AEM_GETSEL*/, 0, 0);

    if (nSelection)
      sSpeechText = GetEditSelText(hWnd);
    else
      sSpeechText = GetWindowText(hWnd);

    sSpeechText = sSpeechText.replace(/([\$\+\*=_#&~])\1{2,}/g, "$1$1").replace(/([\,;.:\?!'])\1+/g, "$1").replace(/\[\(\)\[\]\{\}\^\/\|\\<>%"`-]+/g, " ").replace(/\s+/g, " ").replace(/^ | $/g, "");

    if (hWnd == aWnd[IDTXTSOURCE].Handle)
    {
      nSpeechLang = SendMessage(aWnd[IDFROMLANGCB].Handle, CB_GETITEMDATA, oSelect.FromLang, 0);
      nListenID   = IDLISTEN1;

      if (nSpeechLang < 0)
      {
        nSpeechLang = nDetectLang;
        if (nSpeechLang < 0)
        {
          AkelPad.MessageBox(hWndDlg, sTxtChooseLang, sTxtListen, 48);
          return;
        }
      }
    }
    else
    {
      nSpeechLang = SendMessage(aWnd[IDTOLANGCB].Handle, CB_GETITEMDATA, oSelect.ToLang, 0);
      nListenID   = IDLISTEN2;
    }

    if (! aLangs[nSpeechLang][2])
    {
      AkelPad.MessageBox(hWndDlg, aLangs[nSpeechLang][1] + "\n\n" + sTxtNoSpeech, sTxtListen, 48);
      return;
    }

    GetTextToSpeech();
    nTimerCount = 0;
    oSys.Call("User32::SetTimer", hWndDlg, IDTIMER, 250, 0);
    PlayTextToSpeech();
  }
}

function GetTextToSpeech()
{
  var nPartLen = 100; //Google TTS limit text length
  var oRequest;

  uSpeechBody = null;

  if (sSpeechText.length > nPartLen)
  {
    sSpeechPart = sSpeechText.substr(0, nPartLen + 1);

    if ((/ \S*$/.test(sSpeechPart)) && (RegExp.index > 0))
      nPartLen = RegExp.index;

    sSpeechPart = sSpeechPart.substr(0, nPartLen);
    sSpeechText = sSpeechText.substr(nPartLen).replace(/^ /, "");
  }
  else
  {
    sSpeechPart = sSpeechText;
    sSpeechText = "";
  }

  if (sSpeechPart)
  {
    try
    {
      oRequest = new ActiveXObject("Microsoft.XMLHTTP");
    }
    catch (oError)
    {
      sSpeechPart = "";
      ErrorBox(sTxtNoSupport);
      return;
    }

    OpenRequest(oRequest, "GET", "http://translate.google.com/translate_tts?ie=utf-8&tl=" + aLangs[nSpeechLang][0] + "&q=" + encodeURIComponent(sSpeechPart));

    if (! SendRequest(oRequest, null))
    {
      sSpeechPart = "";
      return;
    }

    if (oRequest.status == 200)
      uSpeechBody = oRequest.responseBody; //array of unsigned bytes, typeof="unknown"
    else
    {
      sSpeechPart = "";
      ErrorBox(oRequest.status + " : " + oRequest.statusText);
    }
  }
}

function PlayTextToSpeech()
{
  if (sSpeechPart)
  {
    var sMp3File = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".mp3";
    var oStream  = new ActiveXObject("ADODB.Stream");
    var nError;

    oStream.Type = 1; // adTypeBinary
    oStream.Open();
    oStream.Write(uSpeechBody);
    oStream.SaveToFile(sMp3File, 2 /*adSaveCreateOverWrite*/);
    oStream.Close();

    nError = oSys.Call("Winmm::mciSendStringW", 'open "' + sMp3File + '" alias TTS', 0, 0, 0);

    if (! nError)
    {
      nError = oSys.Call("Winmm::mciSendStringW", "play TTS notify", 0, 0, hWndDlg);

      if (! nError)
        GetTextToSpeech();
    }

    if (nError)
    {
      KillTimer();
      oSys.Call("Winmm::mciGetErrorStringW", nError, lpBuffer, nBufSize);
      ErrorBox(nError + ": " + AkelPad.MemRead(lpBuffer, DT_UNICODE));
    }
  }
  else
    KillTimer();
}

function KillTimer()
{
  oSys.Call("User32::KillTimer", hWndDlg, IDTIMER);
  SetWindowText(aWnd[nListenID].Handle, sTxtListen);
}

function ReadIni()
{
  var oFile;

  if (oFSO.FileExists(sIniFile))
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

function WriteIni()
{
  var oFile = oFSO.OpenTextFile(sIniFile, 2, true, -1);
  var sIniTxt;
  var i;

  oWndPos.Max = oSys.Call("User32::IsZoomed", hWndDlg);
  sSource     = GetWindowText(aWnd[IDTXTSOURCE].Handle).replace(/[\\"]/g, "\\$&").replace(/\r/g, "\\r").replace(/\n/g, "\\n");
  sTarget     = GetWindowText(aWnd[IDTXTTARGET].Handle).replace(/[\\"]/g, "\\$&").replace(/\r/g, "\\r").replace(/\n/g, "\\n");

  sIniTxt = 'nOpacity='    + nOpacity    + ';\r\n'  +
            'bSourceInCB=' + bSourceInCB + ';\r\n'  +
            'bSourceWnd='  + bSourceWnd  + ';\r\n'  +
            'bLoadText='   + bLoadText   + ';\r\n'  +
            'bImmediate='  + bImmediate  + ';\r\n'  +
            'bWordWrap='   + bWordWrap   + ';\r\n'  +
            'bFontAP='     + bFontAP     + ';\r\n'  +
            'bFontGUI='    + bFontGUI    + ';\r\n'  +
            'aFont=["'     + aFont[0] + '",' + aFont[1] + ',' + aFont[2] + '];\r\n' +
            'bSortCode='   + bSortCode   + ';\r\n'  +
            'nDetectLang=' + nDetectLang + ';\r\n'  +
            'sSource="'    + sSource     + '";\r\n' +
            'sTarget="'    + sTarget     + '";\r\n' +
            'sLanguage="'  + sLanguage   + '";\r\n';

  for (i = 0; i < aAPIs.length; ++i)
    sIniTxt += 'aAPIs[' + i + '].APIkeyP="' + aAPIs[i].APIkeyP.replace(/[\\"]/g, "\\$&") + '";\r\n';

  for (i in oSelect)
    sIniTxt += 'oSelect.' + i + '=' + oSelect[i] + ';\r\n';
  for (i in oWndPos)
    sIniTxt += 'oWndPos.' + i + '=' + oWndPos[i] + ';\r\n';

  oFile.Write(sIniTxt);
  oFile.Close();
}

function ReadInterfaceLang()
{
  BuiltInLang();

  if (sLanguage)
  {
    var sLangFile = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + "_" + sLanguage + ".lng";
    var oFile;

    if (oFSO.FileExists(sLangFile))
    {
      oFile = oFSO.OpenTextFile(sLangFile, 1, false, -2);

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
}

function BuiltInLang()
{
  sTxtCaption    = "Translator";
  sTxtUse        = "Use";
  sTxtFromLang   = "From language";
  sTxtToLang     = "To language";
  sTxtAutoDetect = "Auto detect language";
  sTxtListen     = "Listen";
  sTxtTranslate  = "&Translate";
  sTxtTranslateP = "Translate+";
  sTxtOptions    = "&Options";
  sTxtSource     = "Source text";
  sTxtTarget     = "Translated text";
  sTxtSettings   = "Settings";
  sTxtUndo       = "&Undo";
  sTxtRedo       = "&Redo";
  sTxtCut        = "&Cut";
  sTxtCopyCB     = "C&opy to clipboard";
  sTxtInsertAP   = "&Insert to AkelPad";
  sTxtPasteCB    = "&Paste from clipboard";
  sTxtPasteAP    = "Pa&ste from AkelPad";
  sTxtDelete     = "&Delete";
  sTxtSelectAll  = "Select &all";
  sTxtEntireText = "&Entire text";
  sTxtInterface  = "Interface language";
  sTxtSourceInCB = "Source text from Clipboard";
  sTxtSourceWnd  = "Show panel with source text";
  sTxtLoadText   = "Load source text to panel at start";
  sTxtImmediate  = "Start immediately translate";
  sTxtWordWrap   = "Wrap lines";
  sTxtFontAP     = "Font from AkelPad";
  sTxtFontGUI    = "GUI font";
  sTxtSortLang   = "Languages sort";
  sTxtSortCode   = "By code";
  sTxtSortName   = "By name";
  sTxtOwnKey     = "own key";
  sTxtRegister   = "Registration:";
  sTxtOK         = "OK";
  sTxtCancel     = "Cancel";
  sTxtError      = "Error";
  sTxtNoText     = "There is no text to translate.";
  sTxtNoSupport  = "Your system does not support XMLHttpRequest.";
  sTxtNoInternet = "There was a problem with internet connection.";
  sTxtWait       = "Wait...";
  sTxtUndefined  = "Undefined";
  sTxtChooseLang = "You need to choose the language.";
  sTxtNoSpeech   = "No support for speech in this language.";
  sTxtRegScripts = "You must register library: Scripts.dll";
  sTxtNoLibrary  = "Can not load library: ";

  aLangs[ 0] = ["af",    "Afrikaans",           1, 1, 0, 0]; //TTS, Google, Bing, Yandex
  aLangs[ 1] = ["ar",    "Arabic",              1, 1, 1, 0];
  aLangs[ 2] = ["be",    "Belarusian",          0, 1, 0, [3,6,9,11,13,17,26,38,40,41,45,50]];
  aLangs[ 3] = ["bg",    "Bulgarian",           0, 1, 1, [2,41,51]];
  aLangs[ 4] = ["bs",    "Bosnian",             1, 1, 0, 0];
  aLangs[ 5] = ["ca",    "Catalan",             1, 1, 1, 0];
  aLangs[ 6] = ["cs",    "Czech",               1, 1, 1, [2,11,41,51]];
  aLangs[ 7] = ["cy",    "Welsh",               1, 1, 0, 0];
  aLangs[ 8] = ["da",    "Danish",              1, 1, 1, [11,41]];
  aLangs[ 9] = ["de",    "German",              1, 1, 1, [2,11,13,17,26,41,50,51]];
  aLangs[10] = ["el",    "Greek",               1, 1, 1, 0];
  aLangs[11] = ["en",    "English",             1, 1, 1, [2,6,8,9,13,17,26,36,39,41,46,50,51]];
  aLangs[12] = ["eo",    "Esperanto",           1, 1, 0, 0];
  aLangs[13] = ["es",    "Spanish",             1, 1, 1, [2,9,11,41,51]];
  aLangs[14] = ["et",    "Estonian",            0, 1, 1, 0];
  aLangs[15] = ["fa",    "Persian",             0, 1, 1, 0];
  aLangs[16] = ["fi",    "Finnish",             1, 1, 1, 0];
  aLangs[17] = ["fr",    "French",              1, 1, 1, [2,9,11,41,51]];
  aLangs[18] = ["ga",    "Irish",               0, 1, 0, 0];
  aLangs[19] = ["gl",    "Galician",            0, 1, 0, 0];
  aLangs[20] = ["hi",    "Hindi",               1, 1, 1, 0];
  aLangs[21] = ["hr",    "Croatian",            1, 1, 0, [41]];
  aLangs[22] = ["ht",    "Haitian Creole",      1, 1, 1, 0];
  aLangs[23] = ["hu",    "Hungarian",           1, 1, 1, 0];
  aLangs[24] = ["id",    "Indonesian",          1, 1, 1, 0];
  aLangs[25] = ["is",    "Icelandic",           1, 1, 0, 0];
  aLangs[26] = ["it",    "Italian",             1, 1, 1, [2,9,11,41,51]];
  aLangs[27] = ["iw",    "Hebrew",              0, 1, 1, 0];
  aLangs[28] = ["ja",    "Japanese",            1, 1, 1, 0];
  aLangs[29] = ["ko",    "Korean",              1, 1, 1, 0];
  aLangs[30] = ["la",    "Latin",               1, 1, 0, 0];
  aLangs[31] = ["lt",    "Lithuanian",          0, 1, 1, 0];
  aLangs[32] = ["lv",    "Latvian",             1, 1, 1, 0];
  aLangs[33] = ["mk",    "Macedonian",          1, 1, 0, 0];
  aLangs[34] = ["ms",    "Malay",               0, 1, 1, 0];
  aLangs[35] = ["mt",    "Maltese",             0, 1, 0, 0];
  aLangs[36] = ["nl",    "Dutch",               1, 1, 1, [11,41]];
  aLangs[37] = ["no",    "Norwegian",           1, 1, 1, 0];
  aLangs[38] = ["pl",    "Polish",              1, 1, 1, [2,41,51]];
  aLangs[39] = ["pt",    "Portuguese",          1, 1, 1, [11,41]];
  aLangs[40] = ["ro",    "Romanian",            1, 1, 1, [2,41,51]];
  aLangs[41] = ["ru",    "Russian",             1, 1, 1, [2,3,6,8,9,11,13,17,21,26,36,38,39,40,45,46,50,51]];
  aLangs[42] = ["sk",    "Slovak",              1, 1, 1, 0];
  aLangs[43] = ["sl",    "Slovenian",           0, 1, 1, 0];
  aLangs[44] = ["sq",    "Albanian",            1, 1, 0, 0];
  aLangs[45] = ["sr",    "Serbian",             1, 1, 0, [2,41,51]];
  aLangs[46] = ["sv",    "Swedish",             1, 1, 1, [11,41]];
  aLangs[47] = ["sw",    "Swahili",             1, 1, 0, 0];
  aLangs[48] = ["th",    "Thai",                1, 1, 1, 0];
  aLangs[49] = ["tl",    "Filipino",            0, 1, 0, 0];
  aLangs[50] = ["tr",    "Turkish",             1, 1, 1, [2,9,11,41,51]];
  aLangs[51] = ["uk",    "Ukrainian",           0, 1, 1, [3,6,9,11,13,17,26,38,40,41,45,50]];
  aLangs[52] = ["ur",    "Urdu",                0, 1, 1, 0];
  aLangs[53] = ["vi",    "Vietnamese",          1, 1, 1, 0];
  aLangs[54] = ["yi",    "Yiddish",             0, 1, 0, 0];
  aLangs[55] = ["zh",    "Chinese",             1, 1, 0, 0];
  aLangs[56] = ["zh-CN", "Chinese Simplified",  1, 1, 1, 0];
  aLangs[57] = ["zh-TW", "Chinese Traditional", 1, 1, 1, 0];
}

/**********************
Google v2 response:
{
"sentences": [
  {"trans":"matka","orig":"mother","translit":"","src_translit":""}
  {"trans":"...","orig":"...","translit":"","src_translit":""}
  ...
  {"trans":"matka","orig":"mother","translit":"","src_translit":""}
  ],
"dict": [
  {"pos":"rzeczownik","terms":["matka","mama",...]},
  ...
  {"pos":"czasownik","terms":["matkowac","zrodzic"...]}
  ],
"src": "en",
"server_time": 7
}
-----------------------
Bing API v2 response:
language detect:
<string xmlns="http://schemas.microsoft.com/2003/10/Serialization/">en</string>
translation:
<string xmlns="http://schemas.microsoft.com/2003/10/Serialization/">Edycja</string>
**********************/
