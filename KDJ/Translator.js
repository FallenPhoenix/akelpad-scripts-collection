// Translator.js - ver. 2013-04-07a
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

var sTxtCaption;
var sTxtUse;
var sTxtFromLang;
var sTxtToLang;
var sTxtAutoDetect;
var sTxtTranslate;
var sTxtTranslateP;
var sTxtOptions;
var sTxtSource;
var sTxtTarget;
var sTxtSettings;
var sTxtUndo;
var sTxtRedo;
var sTxtCut;
var sTxtCopyCB;
var sTxtInsertAP;
var sTxtPasteCB;
var sTxtPasteAP;
var sTxtDelete;
var sTxtSelectAll;
var sTxtEntireText;
var sTxtInterface;
var sTxtSourceInCB;
var sTxtSourceWnd;
var sTxtLoadText;
var sTxtImmediate;
var sTxtFontAP;
var sTxtFontGUI;
var sTxtWordWrap;
var sTxtSortLang;
var sTxtSortCode;
var sTxtSortName;
var sTxtOwnKey;
var sTxtRegister;
var sTxtOK;
var sTxtCancel;
var sTxtError;
var sTxtNoText;
var sTxtNoSupport;
var sTxtNoInternet;
var sTxtWait;
var sTxtUndefined;
var sTxtRegScripts;
var sTxtNoLibrary;

var aLangs = [
  ["af"   , "", 1, 0, 0, 1], /*1 - available in Google, 0 - not in Bing, 0 - not in Yandex, 1 - available Google TTS*/
  ["ar"   , "", 1, 1, 0, 1],
  ["be"   , "", 1, 0, 0, 0],
  ["bg"   , "", 1, 1, 1, 0],
  ["ca"   , "", 1, 1, 0, 1],
  ["cs"   , "", 1, 1, 1, 1],
  ["cy"   , "", 1, 0, 0, 1],
  ["da"   , "", 1, 1, 0, 1],
  ["de"   , "", 1, 1, 1, 1],
  ["el"   , "", 1, 1, 0, 1],
  ["en"   , "", 1, 1, 1, 1],
  ["eo"   , "", 1, 0, 0, 1],
  ["es"   , "", 1, 1, 1, 1],
  ["et"   , "", 1, 1, 0, 0],
  ["fa"   , "", 1, 1, 0, 0],
  ["fi"   , "", 1, 1, 0, 1],
  ["fr"   , "", 1, 1, 1, 1],
  ["ga"   , "", 1, 0, 0, 0],
  ["gl"   , "", 1, 0, 0, 0],
  ["hi"   , "", 1, 1, 0, 1],
  ["hr"   , "", 1, 0, 0, 1],
  ["ht"   , "", 1, 1, 0, 1],
  ["hu"   , "", 1, 1, 0, 1],
  ["id"   , "", 1, 1, 0, 1],
  ["is"   , "", 1, 0, 0, 1],
  ["it"   , "", 1, 1, 1, 1],
  ["iw"   , "", 1, 1, 0, 0],
  ["ja"   , "", 1, 1, 0, 1],
  ["ko"   , "", 1, 1, 0, 1],
  ["la"   , "", 1, 0, 0, 1],
  ["lt"   , "", 1, 1, 0, 0],
  ["lv"   , "", 1, 1, 0, 1],
  ["mk"   , "", 1, 0, 0, 1],
  ["ms"   , "", 1, 1, 0, 0],
  ["mt"   , "", 1, 0, 0, 0],
  ["nl"   , "", 1, 1, 0, 1],
  ["no"   , "", 1, 1, 0, 1],
  ["pl"   , "", 1, 1, 1, 1],
  ["pt"   , "", 1, 1, 0, 1],
  ["ro"   , "", 1, 1, 1, 1],
  ["ru"   , "", 1, 1, 1, 1],
  ["sk"   , "", 1, 1, 0, 1],
  ["sl"   , "", 1, 1, 0, 0],
  ["sq"   , "", 1, 0, 0, 1],
  ["sr"   , "", 1, 0, 1, 1],
  ["sv"   , "", 1, 1, 0, 1],
  ["sw"   , "", 1, 0, 0, 1],
  ["th"   , "", 1, 1, 0, 1],
  ["tl"   , "", 1, 0, 0, 0],
  ["tr"   , "", 1, 1, 1, 1],
  ["uk"   , "", 1, 1, 1, 0],
  ["ur"   , "", 1, 1, 0, 0],
  ["vi"   , "", 1, 1, 0, 1],
  ["yi"   , "", 1, 0, 0, 0],
  ["zh"   , "", 1, 0, 0, 1],
  ["zh-CN", "", 1, 1, 0, 1],
  ["zh-TW", "", 1, 1, 0, 1]];

var aAPIs = [{"Name":        "Google",
              "APIkey":      "",
              "APIkeyP":     "",
              "RegistrURL":  "",
              "AutoDetect":  1,
              "TextLen":     48000},
             {"Name":        "MS Bing",
              "APIkey":      "49F91281913BE5C04C18F184C4A14ED6097F6AD3",
              "APIkeyP":     "",
              "RegistrURL":  "http://www.bing.com/developers",
              "AutoDetect":  1,
              "TextLen":     10000}, //POST method
              //"TextLen":     3500}, //GET method
             {"Name":        "Yandex",
              "APIkey":      "",
              "APIkeyP":     "",
              "RegistrURL":  "",
              "AutoDetect":  0,
              "TextLen":     10000}];
var oSelect = {"API":      0,
               "FromLang": 0,
               "ToLang"  : 0,
               "Source1" : 0,
               "Source2" : 0,
               "Target1" : 0,
               "Target2" : 0};
var oWndMin = {"W": 656,
               "H": 200};
var oWndPos = {"X": 100,
               "Y": 120,
               "W": oWndMin.W,
               "H": oWndMin.H,
               "Max": 0};

var nOpaque     = 255;
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
var aFont;

ReadIniFile();
ReadInterfaceLang();
GetAkelPadObject();

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
  var hGuiFont     = oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
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
    else if (AkelPad.SendMessage(hEditWnd, 3125 /*AEM_GETSEL*/, 0, 0))
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
  var IDFROMLANGCB  = 1004;
  var IDTOLANG      = 1005;
  var IDTOLANGCB    = 1006;
  var IDSWITCHLANG  = 1007;
  var IDSWITCHALL   = 1008;
  var IDLISTEN1     = 1009;
  var IDLISTEN2     = 1010;
  var IDOPAQMINUS   = 1011;
  var IDOPAQPLUS    = 1012;
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

  var WNDCLASS = 0;
  var WND      = 1;
  var WNDSTY   = 2;
  var WNDX     = 3;
  var WNDY     = 4;
  var WNDW     = 5;
  var WNDH     = 6;
  var WNDTXT   = 7;

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
  //Windows              WNDCLASS,  WND,     WNDSTY,WNDX,WNDY,WNDW,WNDH, WNDTXT
  aWnd[IDUSE        ] = ["STATIC",    0, 0x50000000,  10,  10,  80,  13];
  aWnd[IDAPICB      ] = ["COMBOBOX",  0, 0x50200003,  10,  25,  80,  21, ""];
  aWnd[IDDETECTLANG ] = ["STATIC",    0, 0x50000000,  10,  60, 210,  13, ""];
  aWnd[IDFROMLANG   ] = ["STATIC",    0, 0x50000000, 110,  10, 200,  13];
  aWnd[IDFROMLANGCB ] = ["COMBOBOX",  0, 0x50200103, 110,  25, 200,  21, ""];
  aWnd[IDTOLANG     ] = ["STATIC",    0, 0x50000000, 340,  10, 200,  13];
  aWnd[IDTOLANGCB   ] = ["COMBOBOX",  0, 0x50200103, 340,  25, 200,  21, ""];
  aWnd[IDSWITCHLANG ] = ["BUTTON",    0, 0x50000000, 310,  25,  30,  21, "<->"];
  aWnd[IDSWITCHALL  ] = ["BUTTON",    0, 0x50000000, 310,  50,  30,  21, "<=>"];
  aWnd[IDLISTEN1    ] = ["BUTTON",    0, 0x50000000, 225,  50,  80,  21, sTxtListen];
  aWnd[IDLISTEN2    ] = ["BUTTON",    0, 0x50000000, 345,  50,  80,  21, sTxtListen];
  aWnd[IDOPAQMINUS  ] = ["BUTTON",    0, 0x50000000, 617,   0,  15,  16, "-"];
  aWnd[IDOPAQPLUS   ] = ["BUTTON",    0, 0x50000000, 632,   0,  15,  16, "+"];
  aWnd[IDTRANSLATE  ] = ["BUTTON",    0, 0x50000000, 560,  25,  80,  21];
  aWnd[IDOPTIONS    ] = ["BUTTON",    0, 0x50000000, 560,  50,  80,  21];
  aWnd[IDTXTSOURCE  ] = ["AkelEditW", 0, 0x50311104,  10,  75, 310,  80, sSource];
  aWnd[IDTXTTARGET  ] = ["AkelEditW", 0, 0x50311104, 330,  75, 310,  80, sTarget];

  aWndSet[IDINTERFACECB] = ["COMBOBOX", 0, 0x50210103,  10,  10, 150,  20, ""];
  aWndSet[IDINTERFACE  ] = ["STATIC",   0, 0x50000000, 165,  13, 120,  13];
  aWndSet[IDEDITOPTIONS] = ["BUTTON",   0, 0x50000007,  10,  40, 285, 185, ""];
  aWndSet[IDSOURCEINCB ] = ["BUTTON",   0, 0x50010003,  20,  55, 270,  16];
  aWndSet[IDSOURCEWND  ] = ["BUTTON",   0, 0x50010003,  20,  75, 270,  16];
  aWndSet[IDLOADTEXT   ] = ["BUTTON",   0, 0x50010003,  20,  95, 270,  16];
  aWndSet[IDIMMEDIATE  ] = ["BUTTON",   0, 0x50010003,  20, 115, 270,  16];
  aWndSet[IDWORDWRAP   ] = ["BUTTON",   0, 0x50010003,  20, 135, 270,  16];
  aWndSet[IDFONTAP     ] = ["BUTTON",   0, 0x50010003,  20, 155, 270,  16];
  aWndSet[IDFONTGUI    ] = ["BUTTON",   0, 0x50010003,  20, 175, 270,  16];
  aWndSet[IDFONT       ] = ["BUTTON",   0, 0x50010000,  20, 195, 170,  20, aFont.toString()];
  aWndSet[IDSORTLANG   ] = ["BUTTON",   0, 0x50000007, 305, 160, 120,  65];
  aWndSet[IDSORTCODE   ] = ["BUTTON",   0, 0x50000009, 315, 180,  90,  16];
  aWndSet[IDSORTNAME   ] = ["BUTTON",   0, 0x50000009, 315, 200,  90,  16];
  aWndSet[IDAPINAME1   ] = ["BUTTON",   0, 0x50000007,  10, 235, 415,  75];
  aWndSet[IDAPIKEYS1   ] = ["STATIC",   0, 0x50000000,  20, 255,  70,  13, "AppID:"];
  aWndSet[IDAPIKEY1    ] = ["EDIT",     0, 0x50810080,  90, 255, 325,  20, ""];
  aWndSet[IDREGIST1    ] = ["STATIC",   0, 0x50000000,  20, 280,  70,  13];
  aWndSet[IDREGURL1    ] = ["EDIT",     0, 0x50810880,  90, 280, 325,  20, aAPIs[1].RegistrURL];
  aWndSet[IDOK         ] = ["BUTTON",   0, 0x50010001, 345,  10,  80,  23];
  aWndSet[IDCANCEL     ] = ["BUTTON",   0, 0x50010000, 345,  35,  80,  23];

  SetInterfaceLangToWndDef();

  if (! hMainWnd)
  {
    hEditLib = oSys.Call("kernel32::LoadLibraryW", sEditLibName);
    if (! hEditLib)
    {
      WScript.Echo(sTxtNoLibrary + sEditLibName);
      WScript.Quit();
    }
  }

  var hIcon = oSys.Call("User32::LoadImageW",
                        hInstanceDLL, //hinst
                        101,          //lpszName
                        1,            //uType=IMAGE_ICON
                        0,            //cxDesired
                        0,            //cyDesired
                        0x00000040);  //fuLoad=LR_DEFAULTSIZE
  var nBufSize = 0xFFFF;
  var lpBuffer = AkelPad.MemAlloc(nBufSize * 2);

  AkelPad.WindowRegisterClass(sClassName);

  hWndDlg = oSys.Call("User32::CreateWindowExW",
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
  oSys.Call("user32::DestroyIcon", hIcon);
  if (hEditLib)
    oSys.Call("kernel32::FreeLibrary", hEditLib);
}

function SetInterfaceLangToWndDef()
{
  aWnd[IDUSE      ][WNDTXT] = sTxtUse;
  aWnd[IDFROMLANG ][WNDTXT] = sTxtFromLang;
  aWnd[IDTOLANG   ][WNDTXT] = sTxtToLang;
  aWnd[IDLISTEN1  ][WNDTXT] = sTxtListen;
  aWnd[IDLISTEN2  ][WNDTXT] = sTxtListen;
  aWnd[IDTRANSLATE][WNDTXT] = sTxtTranslate;
  aWnd[IDOPTIONS  ][WNDTXT] = sTxtOptions;

  aWndSet[IDINTERFACE ][WNDTXT] = sTxtInterface;
  aWndSet[IDSOURCEINCB][WNDTXT] = sTxtSourceInCB;
  aWndSet[IDSOURCEWND ][WNDTXT] = sTxtSourceWnd + " (Ctrl+W)";
  aWndSet[IDLOADTEXT  ][WNDTXT] = sTxtLoadText;
  aWndSet[IDIMMEDIATE ][WNDTXT] = sTxtImmediate;
  aWndSet[IDWORDWRAP  ][WNDTXT] = sTxtWordWrap + " (Ctrl+U)";
  aWndSet[IDFONTAP    ][WNDTXT] = sTxtFontAP + " (Ctrl+F)";
  aWndSet[IDFONTGUI   ][WNDTXT] = sTxtFontGUI + " (Ctrl+F)";
  aWndSet[IDSORTLANG  ][WNDTXT] = sTxtSortLang;
  aWndSet[IDSORTCODE  ][WNDTXT] = sTxtSortCode;
  aWndSet[IDSORTNAME  ][WNDTXT] = sTxtSortName;
  aWndSet[IDAPINAME1  ][WNDTXT] = aAPIs[1].Name + " - " + sTxtOwnKey;
  aWndSet[IDREGIST1   ][WNDTXT] = sTxtRegister;
  aWndSet[IDOK        ][WNDTXT] = sTxtOK;
  aWndSet[IDCANCEL    ][WNDTXT] = sTxtCancel;
}

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    var oError;
    var i;

    for (i = IDUSE; i < aWnd.length; ++i)
    {
      aWnd[i][WND] = oSys.Call("User32::CreateWindowExW",
                                0,                 //dwExStyle
                                aWnd[i][WNDCLASS], //lpClassName
                                0,                 //lpWindowName
                                aWnd[i][WNDSTY],   //dwStyle
                                aWnd[i][WNDX],     //x
                                aWnd[i][WNDY],     //y
                                aWnd[i][WNDW],     //nWidth
                                aWnd[i][WNDH],     //nHeight
                                hWnd,              //hWndParent
                                i,                 //ID
                                hInstanceDLL,      //hInstance
                                0);                //lpParam
      //Set font and text
      SetWndFontAndText(aWnd[i][WND], hGuiFont, aWnd[i][WNDTXT]);
    }

    AkelPad.SendMessage(hWnd, 0x0080 /*WM_SETICON*/, 0 /*ICON_SMALL*/, hIcon);

    SetEditWordWrap();
    SetEditFont();

    for (i = IDTXTSOURCE; i <= IDTXTTARGET; ++i)
    {
      AkelPad.SendMessage(aWnd[i][WND], 1093 /*EM_SETEVENTMASK*/, 0, 0x00080001 /*ENM_CHANGE|ENM_SELCHANGE*/);
      aSubClassHand[i] = AkelPad.WindowSubClass(aWnd[i][WND], EditCallback, 256 /*WM_KEYDOWN*/, 258 /*WM_CHAR*/);
    }

    AkelPad.SendMessage(aWnd[IDTXTSOURCE][WND], 197 /*EM_SETLIMITTEXT*/, aAPIs[oSelect.API].TextLen, 0);
    AkelPad.SendMessage(aWnd[IDTXTTARGET][WND], 197 /*EM_SETLIMITTEXT*/, nBufSize - 1, 0);

    AkelPad.SendMessage(aWnd[IDTXTSOURCE][WND], 0x00B1 /*EM_SETSEL*/, oSelect.Source1, oSelect.Source2);
    AkelPad.SendMessage(aWnd[IDTXTTARGET][WND], 0x00B1 /*EM_SETSEL*/, oSelect.Target1, oSelect.Target2);

    //Fill combobox APIs
    for (i = 0; i < aAPIs.length; ++i)
    {
      AkelPad.MemCopy(lpBuffer, aAPIs[i].Name, DT_UNICODE);
      AkelPad.SendMessage(aWnd[IDAPICB][WND], CB_ADDSTRING, 0, lpBuffer);
    }
    AkelPad.SendMessage(aWnd[IDAPICB][WND], CB_SETCURSEL, oSelect.API, 0);

    FillComboLangs();
    ShowDetectLang(true);

    if (nOpaque < 255)
      SetOpaqueLevel(hWnd, nOpaque);

    ShowSourceWindow();

    if (((! bSourceWnd) || (bSourceWnd && bLoadText)) && (bImmediate))
    {
      try
      {
        new ActiveXObject("htmlfile").parentWindow.setTimeout(function()
              {
                oSys.Call("User32::PostMessageW", hWnd, 273 /*WM_COMMAND*/, IDTRANSLATE, 0);
              }, 0);
      }
      catch (oError)
      {
        oSys.Call("User32::PostMessageW", hWnd, 273 /*WM_COMMAND*/, IDTRANSLATE, 0);
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
          ((oSys.Call("User32::GetFocus") == aWnd[IDTXTSOURCE][WND]) ||
           (oSys.Call("User32::GetFocus") == aWnd[IDTXTTARGET][WND])))
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
      oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
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
          oSys.Call("User32::PostMessageW", hWnd, 273 /*WM_COMMAND*/, IDSWITCHALL, 0);
      }
      else
        oSys.Call("User32::PostMessageW", hWnd, 273 /*WM_COMMAND*/, IDSWITCHLANG, 0);
    }
    else if (wParam == 0x70) //VK_F1
      oSys.Call("User32::SetFocus", aWnd[IDAPICB][WND]);
    else if (wParam == 0x31) //1 key
      oSys.Call("User32::SetFocus", aWnd[IDFROMLANGCB][WND]);
    else if (wParam == 0x32) //2 key
      oSys.Call("User32::SetFocus", aWnd[IDTOLANGCB][WND]);
    else if ((wParam == 109) || (wParam == 189)) //Num- or -
      oSys.Call("User32::PostMessageW", hWnd, 273 /*WM_COMMAND*/, IDOPAQMINUS, 0);
    else if ((wParam == 107) || (wParam == 187)) //Num+ or +
      oSys.Call("User32::PostMessageW", hWnd, 273 /*WM_COMMAND*/, IDOPAQPLUS, 0);
    else if (wParam == 0x53) //S key
      Settings();
  }

  else if (uMsg == 123) //WM_CONTEXTMENU
  {
    if ((wParam == aWnd[IDTXTSOURCE][WND]) || (wParam == aWnd[IDTXTTARGET][WND]))
      ContextMenu(wParam, lParam);
  }

  else if (uMsg == 0x004E) //WM_NOTIFY
  {
    if (AkelPad.MemRead(lParam + 8, DT_DWORD) == 0x0702 /*EN_SELCHANGE*/)
    {
      if (wParam == IDTXTSOURCE)
      {
        oSelect.Source1 = AkelPad.MemRead(lParam + 12, DT_DWORD);
        oSelect.Source2 = AkelPad.MemRead(lParam + 16, DT_DWORD);
      }
      else if (wParam == IDTXTTARGET)
      {
        oSelect.Target1 = AkelPad.MemRead(lParam + 12, DT_DWORD);
        oSelect.Target2 = AkelPad.MemRead(lParam + 16, DT_DWORD);
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
    SetWndFontAndText(aWnd[nListenID][WND], hGuiFont, (nTimerCount++ % 2) ? sTxtListen : "");

  else if (uMsg == 273) //WM_COMMAND
  {
    var nLowParam = LoWord(wParam);
    var nHiwParam = HiWord(wParam);
    bCloseCB = 1;

    if (nLowParam == IDAPICB)
    {
      if (nHiwParam == CBN_SETFOCUS)
        oSys.Call("User32::PostMessageW", lParam, CB_SHOWDROPDOWN, 1, 0);
      if (nHiwParam == CBN_SELCHANGE)
      {
        var nSel1 = oSelect.Source1;
        var nSel2 = oSelect.Source2;

        oSelect.API = AkelPad.SendMessage(aWnd[IDAPICB][WND], CB_GETCURSEL, 0, 0);
        AkelPad.SendMessage(aWnd[IDTXTSOURCE][WND], 197 /*EM_SETLIMITTEXT*/, aAPIs[oSelect.API].TextLen, 0);

        oSys.Call("User32::GetWindowTextW", aWnd[IDTXTSOURCE][WND], lpBuffer, nBufSize);
        SetWndFontAndText(aWnd[IDTXTSOURCE][WND], 0, AkelPad.MemRead(lpBuffer, DT_UNICODE).substr(0, aAPIs[oSelect.API].TextLen));
        AkelPad.SendMessage(aWnd[IDTXTSOURCE][WND], 0x00B1 /*EM_SETSEL*/, nSel1, nSel2);

        ShowDetectLang(false);

        FillComboLangs(AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_GETITEMDATA, oSelect.FromLang, 0),
                       AkelPad.SendMessage(aWnd[IDTOLANGCB  ][WND], CB_GETITEMDATA, oSelect.ToLang,   0));
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
        oSys.Call("User32::PostMessageW", lParam, CB_SHOWDROPDOWN, 1, 0);
      else if (nHiwParam == CBN_SELCHANGE)
      {
        ShowDetectLang(false);
        if (nLowParam == IDFROMLANGCB)
          oSelect.FromLang = AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_GETCURSEL, 0, 0);
        else
          oSelect.ToLang = AkelPad.SendMessage(aWnd[IDTOLANGCB][WND], CB_GETCURSEL, 0, 0);
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
        SetEditStyle(lParam, aWnd[IDTXTTARGET][WND]);
      }
      else if (nHiwParam == 0x0300) //EN_CHANGE
        ShowDetectLang(false);
    }
    else if (nLowParam == IDTXTTARGET)
    {
      if (nHiwParam == 0x0100) //EN_SETFOCUS
      {
        hFocus = lParam;
        SetEditStyle(lParam, aWnd[IDTXTSOURCE][WND]);
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
        Listen(aWnd[IDTXTSOURCE][WND], -1);
      else if (nLowParam == IDLISTEN2)
        Listen(aWnd[IDTXTTARGET][WND], -1);
      else if (nLowParam == IDOPAQMINUS)
      {
        if (nOpaque > 55)
          SetOpaqueLevel(hWnd, -2);
      }
      else if (nLowParam == IDOPAQPLUS)
      {
        if (nOpaque < 255)
          SetOpaqueLevel(hWnd, -1);
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
    AkelPad.WindowUnsubClass(aWnd[IDTXTSOURCE][WND]);
    AkelPad.WindowUnsubClass(aWnd[IDTXTTARGET][WND]);
    WriteIniFile();
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
  return (nParam & 0xffff);
}

function HiWord(nParam)
{
  return ((nParam >> 16) & 0xffff);
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

function SetWndFontAndText(hWnd, hFont, sText)
{
  if (hFont)
    AkelPad.SendMessage(hWnd, 48 /*WM_SETFONT*/, hFont, true);

  AkelPad.MemCopy(lpBuffer, sText.substr(0, nBufSize - 1).replace(/\r$/, ""), DT_UNICODE);
  oSys.Call("User32::SetWindowTextW", hWnd, lpBuffer);
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
  var oRect = {};

  GetWindowPos(hWnd, oRect);

  for (i = IDFROMLANG; i <= IDLISTEN2; ++i)
    oSys.Call("User32::SetWindowPos", aWnd[i][WND], 0,
                                      aWnd[i][WNDX] + (oRect.W - oWndMin.W) / 2,
                                      aWnd[i][WNDY],
                                      0,
                                      0,
                                      0x15 /*SWP_NOZORDER|SWP_NOACTIVATE|SWP_NOSIZE*/);
  for (i = IDOPAQMINUS; i <= IDOPTIONS; ++i)
    oSys.Call("User32::SetWindowPos", aWnd[i][WND], 0,
                                      aWnd[i][WNDX] + oRect.W - oWndMin.W,
                                      aWnd[i][WNDY],
                                      0,
                                      0,
                                      0x15 /*SWP_NOZORDER|SWP_NOACTIVATE|SWP_NOSIZE*/);
  oSys.Call("User32::SetWindowPos", aWnd[IDTXTSOURCE][WND], 0,
                                    0,
                                    0,
                                    aWnd[IDTXTSOURCE][WNDW] + (oRect.W - oWndMin.W) / 2,
                                    aWnd[IDTXTSOURCE][WNDH] + oRect.H - oWndMin.H,
                                    0x16 /*SWP_NOZORDER|SWP_NOACTIVATE|SWP_NOMOVE*/);
  if (bSourceWnd)
    oSys.Call("User32::SetWindowPos", aWnd[IDTXTTARGET][WND], 0,
                                      aWnd[IDTXTTARGET][WNDX] + (oRect.W - oWndMin.W) / 2,
                                      aWnd[IDTXTTARGET][WNDY],
                                      aWnd[IDTXTTARGET][WNDW] + (oRect.W - oWndMin.W) / 2,
                                      aWnd[IDTXTTARGET][WNDH] + oRect.H - oWndMin.H,
                                      0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
  else
    oSys.Call("User32::SetWindowPos", aWnd[IDTXTTARGET][WND], 0,
                                      aWnd[IDTXTTARGET][WNDX],
                                      aWnd[IDTXTTARGET][WNDY],
                                      aWnd[IDTXTTARGET][WNDW] + oRect.W - oWndMin.W,
                                      aWnd[IDTXTTARGET][WNDH] + oRect.H - oWndMin.H,
                                      0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
}

function PaintSizeGrip(hWnd)
{
  var lpPaint = AkelPad.MemAlloc(64); //sizeof(PAINTSTRUCT)
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

function FillComboLangs(nFromLang, nToLang)
{
  var nPos;
  var i;

  AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_RESETCONTENT, 0, 0);
  AkelPad.SendMessage(aWnd[IDTOLANGCB  ][WND], CB_RESETCONTENT, 0, 0);

  if (aAPIs[oSelect.API].AutoDetect)
  {
    AkelPad.MemCopy(lpBuffer, "   " + sTxtAutoDetect, DT_UNICODE);
    nPos = AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_ADDSTRING, 0, lpBuffer);
    AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_SETITEMDATA, nPos, -1);
  }

  for (i = 0; i < aLangs.length; ++i)
  {
    if (aLangs[i][oSelect.API + 2])
    {
      if (bSortCode) //sort by code
        AkelPad.MemCopy(lpBuffer, aLangs[i][0] + " - "  + aLangs[i][1], DT_UNICODE);
      else //sort by name
        AkelPad.MemCopy(lpBuffer, aLangs[i][1] + " - "  + aLangs[i][0], DT_UNICODE);

      nPos = AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_ADDSTRING, 0, lpBuffer);
      AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_SETITEMDATA, nPos, i);

      nPos = AkelPad.SendMessage(aWnd[IDTOLANGCB][WND], CB_ADDSTRING, 0, lpBuffer);
      AkelPad.SendMessage(aWnd[IDTOLANGCB][WND], CB_SETITEMDATA, nPos, i);
    }
  }

  if ((typeof nFromLang == "undefined") && (typeof nToLang == "undefined"))
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
        for (i = aAPIs[oSelect.API].AutoDetect; i < AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_GETCOUNT, 0, 0); ++i)
        {
          if (WScript.Arguments(0) == aLangs[AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_GETITEMDATA, i, 0)][0])
          {
            oSelect.FromLang = i;
            break;
          }
        }
      }

      if (WScript.Arguments.length > 1)
      {
        for (i = 0; i < AkelPad.SendMessage(aWnd[IDTOLANGCB][WND], CB_GETCOUNT, 0, 0); ++i)
        {
          if (WScript.Arguments(1) == aLangs[AkelPad.SendMessage(aWnd[IDTOLANGCB][WND], CB_GETITEMDATA, i, 0)][0])
          {
            oSelect.ToLang = i;
            break;
          }
        }
      }
    }
  }
  else
  {
    if (typeof nFromLang != "undefined")
    {
      oSelect.FromLang = 0;
      for (i = 0; i < AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_GETCOUNT, 0, 0); ++i)
      {
        if (nFromLang == AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_GETITEMDATA, i, 0))
        {
          oSelect.FromLang = i;
          break;
        }
      }
    }

    if (typeof nToLang != "undefined")
    {
      oSelect.ToLang = 0;
      for (i = 0; i < AkelPad.SendMessage(aWnd[IDTOLANGCB][WND], CB_GETCOUNT, 0, 0); ++i)
      {
        if (nToLang == AkelPad.SendMessage(aWnd[IDTOLANGCB][WND], CB_GETITEMDATA, i, 0))
        {
          oSelect.ToLang = i;
          break;
        }
      }
    }
  }

  AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_SETCURSEL, oSelect.FromLang, 0);
  AkelPad.SendMessage(aWnd[IDTOLANGCB  ][WND], CB_SETCURSEL, oSelect.ToLang,   0);
}

function SwitchLang(bSwitchText)
{
  var nFromLang = AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_GETITEMDATA, oSelect.FromLang, 0);
  var nToLang   = AkelPad.SendMessage(aWnd[IDTOLANGCB  ][WND], CB_GETITEMDATA, oSelect.ToLang,   0);
  var nSelTarget;
  var nSelSource;
  var i;

  for (i = 0; i < AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_GETCOUNT, 0, 0); ++i)
  {
    if (nToLang == AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_GETITEMDATA, i, 0))
    {
      oSelect.FromLang = i;
      break;
    }
  }

  if (nFromLang == -1) //Auto detect
  {
    oSelect.ToLang = 0;
    if (nDetectLang >= 0)
    {
      for (i = 0; i < AkelPad.SendMessage(aWnd[IDTOLANGCB][WND], CB_GETCOUNT, 0, 0); ++i)
      {
        if (nDetectLang == AkelPad.SendMessage(aWnd[IDTOLANGCB][WND], CB_GETITEMDATA, i, 0))
        {
          oSelect.ToLang = i;
          break;
        }
      }
    }
  }
  else
  {
    for (i = 0; i < AkelPad.SendMessage(aWnd[IDTOLANGCB][WND], CB_GETCOUNT, 0, 0); ++i)
    {
      if (nFromLang == AkelPad.SendMessage(aWnd[IDTOLANGCB][WND], CB_GETITEMDATA, i, 0))
      {
        oSelect.ToLang = i;
        break;
      }
    }
  }

  AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_SETCURSEL, oSelect.FromLang, 0);
  AkelPad.SendMessage(aWnd[IDTOLANGCB  ][WND], CB_SETCURSEL, oSelect.ToLang,   0);

  ShowDetectLang(false);

  if (bSwitchText)
  {
    oSys.Call("User32::GetWindowTextW", aWnd[IDTXTSOURCE][WND], lpBuffer, nBufSize);
    sTarget = AkelPad.MemRead(lpBuffer, DT_UNICODE);
    oSys.Call("User32::GetWindowTextW", aWnd[IDTXTTARGET][WND], lpBuffer, nBufSize);
    sSource = AkelPad.MemRead(lpBuffer, DT_UNICODE).substr(0, aAPIs[oSelect.API].TextLen);

    nSelTarget = AkelPad.SendMessage(aWnd[IDTXTSOURCE][WND], 0x00B0 /*EM_GETSEL*/, 0, 0);
    nSelSource = AkelPad.SendMessage(aWnd[IDTXTTARGET][WND], 0x00B0 /*EM_GETSEL*/, 0, 0);

    SetWndFontAndText(aWnd[IDTXTSOURCE][WND], 0, sSource);
    SetWndFontAndText(aWnd[IDTXTTARGET][WND], 0, sTarget);

    AkelPad.SendMessage(aWnd[IDTXTSOURCE][WND], 0x00B1 /*EM_SETSEL*/, LoWord(nSelSource), HiWord(nSelSource));
    AkelPad.SendMessage(aWnd[IDTXTTARGET][WND], 0x00B1 /*EM_SETSEL*/, LoWord(nSelTarget), HiWord(nSelTarget));
  }
}

function ShowDetectLang(bShow)
{
 if (bShow)
  {
    if (nDetectLang >= 0)
      SetWndFontAndText(aWnd[IDDETECTLANG][WND], 0, sTxtAutoDetect + ": " + aLangs[nDetectLang][1]);
  }
  else
  {
    nDetectLang = -1;
    SetWndFontAndText(aWnd[IDDETECTLANG][WND], 0, "");
  }
}

function SetEditWordWrap()
{
  AkelPad.SendMessage(aWnd[IDTXTSOURCE][WND], 0x0CAA /*AEM_SETWORDWRAP*/, bWordWrap ? 1 /*AEWW_WORD*/ : 0 /*AEWW_NONE*/, 0);
  AkelPad.SendMessage(aWnd[IDTXTTARGET][WND], 0x0CAA /*AEM_SETWORDWRAP*/, bWordWrap ? 1 /*AEWW_WORD*/ : 0 /*AEWW_NONE*/, 0);
}

function SetEditFont()
{
  var hFont;

  if (hEditWnd && bFontAP)
    hFont = AkelPad.SendMessage(hEditWnd, 49 /*WM_GETFONT*/, 0, 0);
  else if (bFontGUI)
    hFont = hGuiFont;
  else
    hFont = ConvertFontFormat(aFont, 3, 2);

  AkelPad.SendMessage(aWnd[IDTXTSOURCE][WND], 48 /*WM_SETFONT*/, hFont, 1);
  AkelPad.SendMessage(aWnd[IDTXTTARGET][WND], 48 /*WM_SETFONT*/, hFont, 1);
}

function SetEditStyle(hWnd1, hWnd2)
{
  AkelPad.SendMessage(hWndDlg, 11 /*WM_SETREDRAW*/, 0, 0);

  oSys.Call("User32::SetWindowLongW", hWnd1, -20 /*GWL_EXSTYLE*/, 0);
  oSys.Call("User32::SetWindowLongW", hWnd1, -16 /*GWL_STYLE*/, 0x50B11104);
  oSys.Call("User32::SetWindowPos", hWnd1, 0, 0, 0, 0, 0, 0x37 /*SWP_FRAMECHANGED|SWP_NOACTIVATE|SWP_NOZORDER|SWP_NOMOVE|SWP_NOSIZE*/);

  if (bSourceWnd)
  {
    oSys.Call("User32::SetWindowLongW", hWnd2, -20 /*GWL_EXSTYLE*/, 0x20000 /*WS_EX_STATICEDGE*/);
    oSys.Call("User32::SetWindowLongW", hWnd2, -16 /*GWL_STYLE*/, 0x50311104);
    oSys.Call("User32::SetWindowPos", hWnd2, 0, 0, 0, 0, 0, 0x37 /*SWP_FRAMECHANGED|SWP_NOACTIVATE|SWP_NOZORDER|SWP_NOMOVE|SWP_NOSIZE*/);
  }

  AkelPad.SendMessage(hWndDlg, 11 /*WM_SETREDRAW*/, 1, 0);

  oSys.Call("User32::InvalidateRect", hWndDlg, 0, 0);
}

function ShowSourceWindow()
{
  if (bSourceWnd)
  {
    aWnd[IDTXTTARGET][WNDX] = aWnd[IDTXTTARGET][WNDX] + aWnd[IDTXTTARGET][WNDW] - aWnd[IDTXTSOURCE][WNDW];
    aWnd[IDTXTTARGET][WNDW] = aWnd[IDTXTSOURCE][WNDW];
    hFocus = aWnd[IDTXTSOURCE][WND];
  }
  else
  {
    aWnd[IDTXTTARGET][WNDW] = aWnd[IDTXTTARGET][WNDX] + aWnd[IDTXTTARGET][WNDW] - aWnd[IDTXTSOURCE][WNDX];
    aWnd[IDTXTTARGET][WNDX] = aWnd[IDTXTSOURCE][WNDX];
    hFocus = aWnd[IDTXTTARGET][WND];
  }

  oSys.Call("User32::ShowWindow", aWnd[IDSWITCHALL][WND], bSourceWnd);
  oSys.Call("User32::ShowWindow", aWnd[IDLISTEN1  ][WND], bSourceWnd);
  oSys.Call("User32::ShowWindow", aWnd[IDTXTSOURCE][WND], bSourceWnd);
  oSys.Call("User32::SetFocus", hFocus);
  ResizeWindow(hWndDlg)
}

function SetOpaqueLevel(hWnd, nLevel)
{
  var lpBuf;
  var nStyle;

  if (nLevel < 0)
  {
    lpBuf = AkelPad.MemAlloc(1);
    if (oSys.Call("User32::GetLayeredWindowAttributes", hWnd, 0, lpBuf, 0))
      nOpaque = AkelPad.MemRead(lpBuf, DT_BYTE);
    else
      nOpaque = 255;
    nOpaque += (nLevel == -1) ? 20 : -20;
    AkelPad.MemFree(lpBuf);
  }

  if (nOpaque > 255)
    nOpaque = 255;
  else if (nOpaque < 55)
    nOpaque = 55;

  //WS_EX_LAYERED style
  nStyle = oSys.Call("User32::GetWindowLongW", hWnd, -20 /*GWL_EXSTYLE*/);

  if (! (nStyle & 0x00080000 /*WS_EX_LAYERED*/))
  {
    nStyle |= 0x00080000 /*WS_EX_LAYERED*/;
    oSys.Call("User32::SetWindowLongW", hWnd, -20 /*GWL_EXSTYLE*/, nStyle);
  }

  oSys.Call("User32::SetLayeredWindowAttributes", hWnd, 0, nOpaque, 2 /*LWA_ALPHA*/);
}

function InsertTextToAP(hWnd, bEntireText)
{
  if (hEditWnd)
  {
    var nTextLen;

    if (bEntireText)
      nTextLen = oSys.Call("User32::GetWindowTextW", hWnd, lpBuffer, nBufSize);
    else
      nTextLen = AkelPad.SendMessage(hWnd, 0x043E /*EM_GETSELTEXT*/, 0, lpBuffer);

    if (nTextLen)
      AkelPad.ReplaceSel(AkelPad.MemRead(lpBuffer, DT_UNICODE), 1);
  }
}

function PasteTextFromAP(hWnd, bEntireText)
{
  if (hEditWnd && (AkelPad.GetSelStart() != AkelPad.GetSelEnd()))
  {
    AkelPad.MemCopy(lpBuffer, AkelPad.GetSelText(3 /*"\r\n"*/).substr(0, nBufSize - 1).replace(/\r$/, ""), DT_UNICODE);

    if (bEntireText)
      AkelPad.SendMessage(hWnd, 0x00B1 /*EM_SETSEL*/, 0, -1);

    AkelPad.SendMessage(hWnd, 0x00C2 /*EM_REPLACESEL*/, 1, lpBuffer);
  }
}

function CopyEntireTextToCB(hWnd)
{
  if (oSys.Call("User32::GetWindowTextW", hWnd, lpBuffer, nBufSize))
    AkelPad.SetClipboardText(AkelPad.MemRead(lpBuffer, DT_UNICODE));
}

function PasteEntireTextFromCB(hWnd)
{
  if (AkelPad.GetClipboardText())
  {
    AkelPad.SendMessage(hWnd, 0x00B1 /*EM_SETSEL*/, 0, -1);
    AkelPad.SendMessage(hWnd, 0x0302 /*WM_PASTE*/, 0, 0);
  }
}

function DeleteEntireText(hWnd)
{
  AkelPad.SendMessage(hWnd, 0x00B1 /*EM_SETSEL*/, 0, -1);
  AkelPad.SendMessage(hWnd, 0x0303 /*WM_CLEAR*/, 0, 0);
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
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTSOURCE][WND]) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 21, sTxtCut + "\tAlt+X");
  oSys.Call("User32::AppendMenuW", hMenu1,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTSOURCE][WND]) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 22, sTxtCopyCB + "\tAlt+C");
  oSys.Call("User32::AppendMenuW", hMenu1,
            AkelPad.SendMessage(aWnd[IDTXTSOURCE][WND], 0x0432 /*EM_CANPASTE*/, 0, 0) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 23, sTxtPasteCB + "\tAlt+V");
  oSys.Call("User32::AppendMenuW", hMenu1,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTSOURCE][WND]) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 24, sTxtDelete + "\tAlt+Del");
  oSys.Call("User32::AppendMenuW", hMenu1, MF_SEPARATOR, 0, 0);
  oSys.Call("User32::AppendMenuW", hMenu1,
            (hEditWnd && oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTSOURCE][WND])) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 25, sTxtInsertAP + "\tShift+Alt+C");
  oSys.Call("User32::AppendMenuW", hMenu1,
            AkelPad.SendMessage(hEditWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 26, sTxtPasteAP + "\tShift+Alt+V");
  oSys.Call("User32::AppendMenuW", hMenu1, MF_SEPARATOR, 0, 0);
  oSys.Call("User32::AppendMenuW", hMenu1,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTSOURCE][WND]) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 27, sTxtListen + "\tCtrl+L");
  oSys.Call("User32::AppendMenuW", hMenu1, MF_SEPARATOR, 0, 0);
  oSys.Call("User32::AppendMenuW", hMenu1,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTSOURCE][WND]) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 28, sTxtTranslate + "\tCtrl+Enter");
  oSys.Call("User32::AppendMenuW", hMenu1,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTSOURCE][WND]) ? MF_STRING : MF_GRAYED,
            (1 << 8) | 29, sTxtTranslateP + "\tAlt+Enter");

  //Sub menu target text (Entire text)
  oSys.Call("User32::AppendMenuW", hMenu2,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTTARGET][WND]) ? MF_STRING : MF_GRAYED,
            (2 << 8) | 21, sTxtCut + "\tAlt+X");
  oSys.Call("User32::AppendMenuW", hMenu2,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTTARGET][WND]) ? MF_STRING : MF_GRAYED,
            (2 << 8) | 22, sTxtCopyCB + "\tAlt+C");
  oSys.Call("User32::AppendMenuW", hMenu2,
            AkelPad.SendMessage(aWnd[IDTXTTARGET][WND], 0x0432 /*EM_CANPASTE*/, 0, 0) ? MF_STRING : MF_GRAYED,
            (2 << 8) | 23, sTxtPasteCB + "\tAlt+V");
  oSys.Call("User32::AppendMenuW", hMenu2,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTTARGET][WND]) ? MF_STRING : MF_GRAYED,
            (2 << 8) | 24, sTxtDelete + "\tAlt+Del");
  oSys.Call("User32::AppendMenuW", hMenu2, MF_SEPARATOR, 0, 0);
  oSys.Call("User32::AppendMenuW", hMenu2,
            (hEditWnd && oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTTARGET][WND])) ? MF_STRING : MF_GRAYED,
            (2 << 8) | 25, sTxtInsertAP + "\tShift+Alt+C");
  oSys.Call("User32::AppendMenuW", hMenu2,
            AkelPad.SendMessage(hEditWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
            (2 << 8) | 26, sTxtPasteAP + "\tShift+Alt+V");
  oSys.Call("User32::AppendMenuW", hMenu2, MF_SEPARATOR, 0, 0);
  oSys.Call("User32::AppendMenuW", hMenu2,
            oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTTARGET][WND]) ? MF_STRING : MF_GRAYED,
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
      nPosY = AkelPad.MemRead(lpPoint + 4, DT_DWORD) + AkelPad.SendMessage(hWnd, 3188 /*AEM_GETCHARSIZE*/, 0 /*AECS_HEIGHT*/, 0);
      AkelPad.MemFree(lpPoint);
    }
    else //Right click
    {
      nPosX = LoWord(nPosParam);
      nPosY = HiWord(nPosParam);
    }

    nWnd = (hWnd == aWnd[IDTXTSOURCE][WND]) ? 1 : 2;

    oSys.Call("User32::AppendMenuW", hMenu,
              AkelPad.SendMessage(hWnd, 0x00C6 /*EM_CANUNDO*/, 0, 0) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 1, sTxtUndo + "\tCtrl+Z");
    oSys.Call("User32::AppendMenuW", hMenu,
              AkelPad.SendMessage(hWnd, 0x0455 /*EM_CANREDO*/, 0, 0) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 2, sTxtRedo + "\tCtrl+Shift+Z");
    oSys.Call("User32::AppendMenuW", hMenu, MF_SEPARATOR, 0, 0);
    oSys.Call("User32::AppendMenuW", hMenu,
              AkelPad.SendMessage(hWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 3, sTxtCut + "\tCtrl+X");
    oSys.Call("User32::AppendMenuW", hMenu,
              AkelPad.SendMessage(hWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 4, sTxtCopyCB + "\tCtrl+C");
    oSys.Call("User32::AppendMenuW", hMenu,
              AkelPad.SendMessage(hWnd, 0x0432 /*EM_CANPASTE*/, 0, 0) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 5, sTxtPasteCB + "\tCtrl+V");
    oSys.Call("User32::AppendMenuW", hMenu,
              AkelPad.SendMessage(hWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 6, sTxtDelete + "\tDel");
    oSys.Call("User32::AppendMenuW", hMenu,
              oSys.Call("User32::GetWindowTextLengthW", hWnd) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 7, sTxtSelectAll + "\tCtrl+A");
    oSys.Call("User32::AppendMenuW", hMenu, MF_SEPARATOR, 0, 0);
    oSys.Call("User32::AppendMenuW", hMenu,
              (hEditWnd && AkelPad.SendMessage(hWnd, 3125 /*AEM_GETSEL*/, 0, 0)) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 8, sTxtInsertAP + "\tCtrl+Shift+C");
    oSys.Call("User32::AppendMenuW", hMenu,
              AkelPad.SendMessage(hEditWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 9, sTxtPasteAP + "\tCtrl+Shift+V");
    oSys.Call("User32::AppendMenuW", hMenu, MF_SEPARATOR, 0, 0);
    oSys.Call("User32::AppendMenuW", hMenu,
              AkelPad.SendMessage(hWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
              (nWnd << 8) | 10, sTxtListen + "\tCtrl+Shift+L");
    if (nWnd == 1)
    {
      oSys.Call("User32::AppendMenuW", hMenu, MF_SEPARATOR, 0, 0);
      oSys.Call("User32::AppendMenuW", hMenu,
                AkelPad.SendMessage(hWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
                (nWnd << 8) | 11, sTxtTranslate + "\tShift+Enter");
      oSys.Call("User32::AppendMenuW", hMenu,
                AkelPad.SendMessage(hWnd, 3125 /*AEM_GETSEL*/, 0, 0) ? MF_STRING : MF_GRAYED,
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
  hWnd = (nWnd == 1) ? aWnd[IDTXTSOURCE][WND] : aWnd[IDTXTTARGET][WND];

  //Selected text
  if (nCmd == 1)
    AkelPad.SendMessage(hWnd, 0x00C7 /*EM_UNDO*/, 0, 0);
  else if (nCmd == 2)
    AkelPad.SendMessage(hWnd, 0x0454 /*EM_REDO*/, 0, 0);
  else if (nCmd == 3)
    AkelPad.SendMessage(hWnd, 0x0300 /*WM_CUT*/, 0, 0);
  else if (nCmd == 4)
    AkelPad.SendMessage(hWnd, 0x0301 /*WM_COPY*/, 0, 0);
  else if (nCmd == 5)
    AkelPad.SendMessage(hWnd, 0x0302 /*WM_PASTE*/, 0, 0);
  else if (nCmd == 6)
    AkelPad.SendMessage(hWnd, 0x0303 /*WM_CLEAR*/, 0, 0);
  else if (nCmd == 7)
    AkelPad.SendMessage(hWnd, 0x00B1 /*EM_SETSEL*/, 0, -1);
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
                      DialogCallbackSet); //lpParam

  if (hWndSet)
  {
    oSys.Call("User32::EnableWindow", hMainWnd, 0);
    oSys.Call("User32::EnableWindow", hWndDlg, 0);
  }
}

function DialogCallbackSet(hWnd, uMsg, wParam, lParam)
{
  var i;

  if (uMsg == 1) //WM_CREATE
  {
    for (i = 1100; i < aWndSet.length; ++i)
    {
      aWndSet[i][WND] = oSys.Call("User32::CreateWindowExW",
                                   0,                    //dwExStyle
                                   aWndSet[i][WNDCLASS], //lpClassName
                                   0,                    //lpWindowName
                                   aWndSet[i][WNDSTY],   //dwStyle
                                   aWndSet[i][WNDX],     //x
                                   aWndSet[i][WNDY],     //y
                                   aWndSet[i][WNDW],     //nWidth
                                   aWndSet[i][WNDH],     //nHeight
                                   hWnd,                 //hWndParent
                                   i,                    //ID
                                   hInstanceDLL,         //hInstance
                                   0);                   //lpParam
      SetWndFontAndText(aWndSet[i][WND], hGuiFont, aWndSet[i][WNDTXT]);
    }

    AkelPad.SendMessage(hWnd, 0x0080 /*WM_SETICON*/, 0 /*ICON_SMALL*/, hIcon);

    AkelPad.SendMessage(aWndSet[IDAPIKEY1][WND], 197 /*EM_SETLIMITTEXT*/, 128, 0);
    SetWndFontAndText(aWndSet[IDAPIKEY1][WND], 0, aAPIs[1].APIkeyP);

    FillComboInterface();

    //Check buttons
    AkelPad.SendMessage(aWndSet[IDSOURCEINCB][WND], 241 /*BM_SETCHECK*/, bSourceInCB || (! hEditWnd), 0);
    AkelPad.SendMessage(aWndSet[IDSOURCEWND ][WND], 241 /*BM_SETCHECK*/, bSourceWnd, 0);
    AkelPad.SendMessage(aWndSet[IDLOADTEXT  ][WND], 241 /*BM_SETCHECK*/, bLoadText,  0);
    AkelPad.SendMessage(aWndSet[IDIMMEDIATE ][WND], 241 /*BM_SETCHECK*/, bImmediate, 0);
    AkelPad.SendMessage(aWndSet[IDWORDWRAP  ][WND], 241 /*BM_SETCHECK*/, bWordWrap,  0);
    AkelPad.SendMessage(aWndSet[IDFONTAP    ][WND], 241 /*BM_SETCHECK*/, bFontAP && hEditWnd, 0);
    AkelPad.SendMessage(aWndSet[IDFONTGUI   ][WND], 241 /*BM_SETCHECK*/, bFontGUI,   0);
    AkelPad.SendMessage(aWndSet[IDSORTNAME - bSortCode][WND], 241 /*BM_SETCHECK*/, 1, 0);
    oSys.Call("User32::EnableWindow", aWndSet[IDSOURCEINCB][WND], hEditWnd);
    oSys.Call("User32::EnableWindow", aWndSet[IDLOADTEXT  ][WND], bSourceWnd);
    oSys.Call("User32::EnableWindow", aWndSet[IDIMMEDIATE ][WND], (! bSourceWnd) || (bSourceWnd && bLoadText));
    oSys.Call("User32::EnableWindow", aWndSet[IDFONTAP    ][WND], hEditWnd);
    oSys.Call("User32::EnableWindow", aWndSet[IDFONT      ][WND], ((! bFontAP) || (! hEditWnd)) && (! bFontGUI));

    hFocusSet = aWndSet[IDINTERFACECB][WND];
  }

  else if ((uMsg == 6 /*WM_ACTIVATE*/) && (! wParam))
    hFocusSet = oSys.Call("User32::GetFocus");

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("User32::SetFocus", hFocusSet);

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (bCloseCB)
    {
      if ((wParam == 13 /*VK_RETURN*/) && (oSys.Call("User32::GetFocus") != aWndSet[IDFONT][WND]))
        oSys.Call("User32::PostMessageW", hWnd, 273 /*WM_COMMAND*/, IDOK, 0);
      else if (wParam == 27 /*VK_ESCAPE*/)
        oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
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
      oSys.Call("User32::EnableWindow", aWndSet[IDLOADTEXT][WND],
                AkelPad.SendMessage(aWndSet[IDSOURCEWND][WND], 240 /*BM_GETCHECK*/, 0, 0));
      oSys.Call("User32::EnableWindow", aWndSet[IDIMMEDIATE][WND],
                (! AkelPad.SendMessage(aWndSet[IDSOURCEWND][WND], 240 /*BM_GETCHECK*/, 0, 0)) ||
                (AkelPad.SendMessage(aWndSet[IDSOURCEWND][WND], 240 /*BM_GETCHECK*/, 0, 0) &&
                 AkelPad.SendMessage(aWndSet[IDLOADTEXT][WND], 240 /*BM_GETCHECK*/, 0, 0)));
    }
    else if (nLowParam == IDFONTAP)
    {
      if (AkelPad.SendMessage(aWndSet[IDFONTAP][WND], 240 /*BM_GETCHECK*/, 0, 0))
        AkelPad.SendMessage(aWndSet[IDFONTGUI][WND], 241 /*BM_SETCHECK*/, 0, 0);

      oSys.Call("User32::EnableWindow", aWndSet[IDFONT][WND],
                (! AkelPad.SendMessage(aWndSet[IDFONTAP][WND], 240 /*BM_GETCHECK*/, 0, 0)) &&
                (! AkelPad.SendMessage(aWndSet[IDFONTGUI][WND], 240 /*BM_GETCHECK*/, 0, 0)));
    }
    else if (nLowParam == IDFONTGUI)
    {
      if (AkelPad.SendMessage(aWndSet[IDFONTGUI][WND], 240 /*BM_GETCHECK*/, 0, 0) && hEditWnd)
        AkelPad.SendMessage(aWndSet[IDFONTAP][WND], 241 /*BM_SETCHECK*/, 0, 0);

      oSys.Call("User32::EnableWindow", aWndSet[IDFONT][WND],
                ((! AkelPad.SendMessage(aWndSet[IDFONTAP][WND], 240 /*BM_GETCHECK*/, 0, 0)) || (! hEditWnd)) &&
                 (! AkelPad.SendMessage(aWndSet[IDFONTGUI][WND], 240 /*BM_GETCHECK*/, 0, 0)));
    }
    else if (nLowParam == IDFONT)
    {
      var vCF;
      if (vCF = ChooseFont(hWnd, aFont))
      {
        aFont = vCF;
        oSys.Call("User32::SetWindowTextW", aWndSet[IDFONT][WND], aWndSet[IDFONT][WNDTXT] = aFont.toString());
      }
      oSys.Call("User32::SetFocus", aWndSet[IDFONT][WND]);
    }
    else if (nLowParam == IDOK)
    {
      //Change interface language
      var nCurSel   = AkelPad.SendMessage(aWndSet[IDINTERFACECB][WND], CB_GETCURSEL, 0, 0);
      var sLangName = "";
      if (AkelPad.SendMessage(aWndSet[IDINTERFACECB][WND], CB_GETITEMDATA, nCurSel, 0) != -1)
      {
        AkelPad.SendMessage(aWndSet[IDINTERFACECB][WND], 0x0148 /*CB_GETLBTEXT*/, nCurSel, lpBuffer);
        sLangName = AkelPad.MemRead(lpBuffer, DT_UNICODE);
      }
      if (sLangName.toUpperCase() != sLanguage.toUpperCase())
      {
        sLanguage = sLangName;
        ReadInterfaceLang();
        SetInterfaceLangToWndDef();
        SetWndFontAndText(hWndDlg, hGuiFont, sTxtCaption);
        for (i = IDUSE; i <= IDOPTIONS; ++i)
          SetWndFontAndText(aWnd[i][WND], hGuiFont, aWnd[i][WNDTXT]);

        ShowDetectLang(true);
      }

      if (hEditWnd)
      {
        bSourceInCB = AkelPad.SendMessage(aWndSet[IDSOURCEINCB][WND], 240 /*BM_GETCHECK*/, 0, 0);
        bFontAP     = AkelPad.SendMessage(aWndSet[IDFONTAP    ][WND], 240 /*BM_GETCHECK*/, 0, 0);
      }

      bSourceWnd = AkelPad.SendMessage(aWndSet[IDSOURCEWND][WND], 240 /*BM_GETCHECK*/, 0, 0);
      bLoadText  = AkelPad.SendMessage(aWndSet[IDLOADTEXT ][WND], 240 /*BM_GETCHECK*/, 0, 0);
      bImmediate = AkelPad.SendMessage(aWndSet[IDIMMEDIATE][WND], 240 /*BM_GETCHECK*/, 0, 0);
      bWordWrap  = AkelPad.SendMessage(aWndSet[IDWORDWRAP ][WND], 240 /*BM_GETCHECK*/, 0, 0);
      bFontGUI   = AkelPad.SendMessage(aWndSet[IDFONTGUI  ][WND], 240 /*BM_GETCHECK*/, 0, 0);
      bSortCode  = AkelPad.SendMessage(aWndSet[IDSORTCODE ][WND], 240 /*BM_GETCHECK*/, 0, 0);

      SetEditWordWrap();
      SetEditFont();
      ShowSourceWindow();
      FillComboLangs(AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_GETITEMDATA, oSelect.FromLang, 0),
                     AkelPad.SendMessage(aWnd[IDTOLANGCB  ][WND], CB_GETITEMDATA, oSelect.ToLang,   0));

      oSys.Call("User32::GetWindowTextW", aWndSet[IDAPIKEY1][WND], lpBuffer, nBufSize);
      aAPIs[1].APIkeyP = AkelPad.MemRead(lpBuffer, DT_UNICODE);

      oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
    }
    else if (nLowParam == IDCANCEL)
      oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
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
  var hFindFile   = oSys.Call("kernel32::FindFirstFileW", sTemplate, lpBuffer);
  var sLangFile;
  var sLangName;
  var nPos;

  AkelPad.MemCopy(lpBuffer, "English (built-in)", DT_UNICODE);
  nPos = AkelPad.SendMessage(aWndSet[IDINTERFACECB][WND], CB_ADDSTRING, 0, lpBuffer);
  AkelPad.SendMessage(aWndSet[IDINTERFACECB][WND], CB_SETITEMDATA, nPos, -1);
  AkelPad.SendMessage(aWndSet[IDINTERFACECB][WND], CB_SETCURSEL, nPos, 0);

  if (hFindFile != -1) //INVALID_HANDLE_VALUE
  {
    do
    {
      sLangFile = AkelPad.MemRead(lpBuffer + 44 /*offsetof(WIN32_FIND_DATAW, cFileName)*/, DT_UNICODE);
      sLangName = sLangFile.substring(sScriptName.length, sLangFile.lastIndexOf("."));

      if (sLangName)
      {
        AkelPad.MemCopy(lpBuffer, sLangName, DT_UNICODE);
        nPos = AkelPad.SendMessage(aWndSet[IDINTERFACECB][WND], CB_ADDSTRING, 0, lpBuffer);

        if (sLangName.toUpperCase() == sLanguage.toUpperCase())
          AkelPad.SendMessage(aWndSet[IDINTERFACECB][WND], CB_SETCURSEL, nPos, 0);
      }
    }
    while(oSys.Call("kernel32::FindNextFileW", hFindFile, lpBuffer));
  }
  oSys.Call("kernel32::FindClose", hFindFile);
}

function ChooseFont(hWndOwn, aFontIni)
{
  var nCFSize    = 60; //sizeof(CHOOSEFONT)
  var lpCF       = AkelPad.MemAlloc(nCFSize);
  var lpLF       = ConvertFontFormat(aFontIni, 3, 1);
  var lpCallback = oSys.RegisterCallback(0, CFHookProcCallback, 4);
  var vResult    = 0;

  AkelPad.MemCopy(lpCF     ,    nCFSize, DT_DWORD); //lStructSize
  AkelPad.MemCopy(lpCF +  4,    hWndOwn, DT_DWORD); //hwndOwner
  AkelPad.MemCopy(lpCF + 12,       lpLF, DT_DWORD); //lpLogFont
  AkelPad.MemCopy(lpCF + 20, 0x00010049, DT_DWORD); //Flags=CF_ENABLEHOOK|CF_FORCEFONTEXIST|CF_INITTOLOGFONTSTRUCT|CF_SCREENFONTS
  AkelPad.MemCopy(lpCF + 32, lpCallback, DT_DWORD); //lpfnHook

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
    var hWndOwn   = AkelPad.MemRead(lParam + 4, DT_DWORD);
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

function GetAkelPadObject()
{
  if (typeof AkelPad == "undefined")
  {
    var oError;

    try
    {
      AkelPad = new ActiveXObject("AkelPad.Document");
    }
    catch (oError)
    {
      WScript.Echo(sTxtRegScripts);
      WScript.Quit();
    }
  }
}

function ReadIniFile()
{
  var oFile;
  var oError;

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

function WriteIniFile()
{
  var oFile = oFSO.OpenTextFile(sIniFile, 2, true, -1);
  var sIniTxt;
  var i;

  oWndPos.Max = oSys.Call("User32::IsZoomed", hWndDlg);
  oSys.Call("User32::GetWindowTextW", aWnd[IDTXTSOURCE][WND], lpBuffer, nBufSize);
  sSource = AkelPad.MemRead(lpBuffer, DT_UNICODE).replace(/[\\"]/g, "\\$&").replace(/\r/g, "\\r").replace(/\n/g, "\\n");
  oSys.Call("User32::GetWindowTextW", aWnd[IDTXTTARGET][WND], lpBuffer, nBufSize);
  sTarget = AkelPad.MemRead(lpBuffer, DT_UNICODE).replace(/[\\"]/g, "\\$&").replace(/\r/g, "\\r").replace(/\n/g, "\\n");

  sIniTxt = 'nOpaque='     + nOpaque     + ';\r\n'  +
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
    sIniTxt += 'aAPIs[' + i + '].APIkeyP="' + aAPIs[i].APIkeyP + '";\r\n';

  for (i in oSelect)
    sIniTxt += 'oSelect.' + i + '=' + oSelect[i] + ';\r\n';
  for (i in oWndPos)
    sIniTxt += 'oWndPos.' + i + '=' + oWndPos[i] + ';\r\n';

  oFile.Write(sIniTxt);
  oFile.Close();
}

function ReadInterfaceLang()
{
  if (sLanguage)
  {
    var sLangFile = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + "_" + sLanguage + ".lng";
    var oFile;
    var oError;

    if (oFSO.FileExists(sLangFile))
    {
      oFile = oFSO.OpenTextFile(sLangFile, 1, false, -2);

      try
      {
        eval(oFile.ReadAll());
      }
      catch (oError)
      {
        BuiltInLang();
      }

      oFile.Close();
    }
    else
      BuiltInLang();
  }
  else
    BuiltInLang();
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

  aLangs[ 0][1] = "Afrikaans";
  aLangs[ 1][1] = "Arabic";
  aLangs[ 2][1] = "Belarusian";
  aLangs[ 3][1] = "Bulgarian";
  aLangs[ 4][1] = "Catalan";
  aLangs[ 5][1] = "Czech";
  aLangs[ 6][1] = "Welsh";
  aLangs[ 7][1] = "Danish";
  aLangs[ 8][1] = "German";
  aLangs[ 9][1] = "Greek";
  aLangs[10][1] = "English";
  aLangs[11][1] = "Esperanto";
  aLangs[12][1] = "Spanish";
  aLangs[13][1] = "Estonian";
  aLangs[14][1] = "Persian";
  aLangs[15][1] = "Finnish";
  aLangs[16][1] = "French";
  aLangs[17][1] = "Irish";
  aLangs[18][1] = "Galician";
  aLangs[19][1] = "Hindi";
  aLangs[20][1] = "Croatian";
  aLangs[21][1] = "Haitian Creole";
  aLangs[22][1] = "Hungarian";
  aLangs[23][1] = "Indonesian";
  aLangs[24][1] = "Icelandic";
  aLangs[25][1] = "Italian";
  aLangs[26][1] = "Hebrew";
  aLangs[27][1] = "Japanese";
  aLangs[28][1] = "Korean";
  aLangs[29][1] = "Latin";
  aLangs[30][1] = "Lithuanian";
  aLangs[31][1] = "Latvian";
  aLangs[32][1] = "Macedonian";
  aLangs[33][1] = "Malay";
  aLangs[34][1] = "Maltese";
  aLangs[35][1] = "Dutch";
  aLangs[36][1] = "Norwegian";
  aLangs[37][1] = "Polish";
  aLangs[38][1] = "Portuguese";
  aLangs[39][1] = "Romanian";
  aLangs[40][1] = "Russian";
  aLangs[41][1] = "Slovak";
  aLangs[42][1] = "Slovenian";
  aLangs[43][1] = "Albanian";
  aLangs[44][1] = "Serbian";
  aLangs[45][1] = "Swedish";
  aLangs[46][1] = "Swahili";
  aLangs[47][1] = "Thai";
  aLangs[48][1] = "Filipino";
  aLangs[49][1] = "Turkish";
  aLangs[50][1] = "Ukrainian";
  aLangs[51][1] = "Urdu";
  aLangs[52][1] = "Vietnamese";
  aLangs[53][1] = "Yiddish";
  aLangs[54][1] = "Chinese";
  aLangs[55][1] = "Chinese Simplified";
  aLangs[56][1] = "Chinese Traditional";
}

function Translate(bSelection, bAddToTarget)
{
  var sMethod    = "POST";
  var sAPIkey    = aAPIs[oSelect.API].APIkeyP ? aAPIs[oSelect.API].APIkeyP : aAPIs[oSelect.API].APIkey;
  var nLang      = AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_GETITEMDATA, oSelect.FromLang, 0);
  var sFromLang  = (nLang < 0) ? "" : aLangs[nLang][0];
  var sToLang    = aLangs[AkelPad.SendMessage(aWnd[IDTOLANGCB][WND], CB_GETITEMDATA, oSelect.ToLang, 0)][0];
  var nTargetLen = oSys.Call("User32::GetWindowTextLengthW", aWnd[IDTXTTARGET][WND])
  var nTargetSel = 0;
  var sLangName;
  var sURL;
  var sSend;
  var oRequest;
  var oResponse;
  var oError;
  var i, n;

  SetWndFontAndText(aWnd[IDDETECTLANG][WND], 0, sTxtWait);
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
    if (bSelection && AkelPad.SendMessage(aWnd[IDTXTSOURCE][WND], 3125 /*AEM_GETSEL*/, 0, 0))
      AkelPad.SendMessage(aWnd[IDTXTSOURCE][WND], 1086 /*EM_GETSELTEXT*/, 0, lpBuffer);
    else
      oSys.Call("User32::GetWindowTextW", aWnd[IDTXTSOURCE][WND], lpBuffer, nBufSize);

    sSource = AkelPad.MemRead(lpBuffer, DT_UNICODE);
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
//    if (nLang < 0) //Auto detect
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
    if (nLang < 0) //Auto detect
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
    sSend = "lang=" + sFromLang + "-" + sToLang + "&text=" + encodeURIComponent(sSource);
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

  AkelPad.MemCopy(lpBuffer, sTarget, DT_UNICODE);
  AkelPad.SendMessage(aWnd[IDTXTTARGET][WND], 0x00B1 /*EM_SETSEL*/, bAddToTarget ? -1 : 0, -1);

  if (bAddToTarget && nTargetLen)
    nTargetSel = oSelect.Target1 + 2;

  AkelPad.SendMessage(aWnd[IDTXTTARGET][WND], 0x00C2 /*EM_REPLACESEL*/, 1, lpBuffer);
  AkelPad.SendMessage(aWnd[IDTXTTARGET][WND], 0x00B1 /*EM_SETSEL*/, nTargetSel, nTargetSel);

  if (nLang < 0)
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

    SetWndFontAndText(aWnd[IDDETECTLANG][WND], 0, sTxtAutoDetect + ": " + sLangName);
  }
  else
    SetWndFontAndText(aWnd[IDDETECTLANG][WND], 0, "");
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
  SetWndFontAndText(aWnd[IDDETECTLANG][WND], 0, "");
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
      nSelection = AkelPad.SendMessage(hWnd, 3125 /*AEM_GETSEL*/, 0, 0);

    if (nSelection)
      AkelPad.SendMessage(hWnd, 1086 /*EM_GETSELTEXT*/, 0, lpBuffer);
    else
      oSys.Call("User32::GetWindowTextW", hWnd, lpBuffer, nBufSize);

    sSpeechText = AkelPad.MemRead(lpBuffer, DT_UNICODE).replace(/([\$\+\*=_#&~])\1{2,}/g, "$1$1").replace(/([\,;.:\?!'])\1+/g, "$1").replace(/\[\(\)\[\]\{\}\^\/\|\\<>%"`-]+/g, " ").replace(/\s+/g, " ").replace(/^ | $/g, "");

    if (hWnd == aWnd[IDTXTSOURCE][WND])
    {
      nSpeechLang = AkelPad.SendMessage(aWnd[IDFROMLANGCB][WND], CB_GETITEMDATA, oSelect.FromLang, 0);
      nListenID   = IDLISTEN1;

      if (nSpeechLang < 0)
      {
        AkelPad.MessageBox(hWndDlg, sTxtChooseLang, sTxtListen, 48);
        return;
      }
    }
    else
    {
      nSpeechLang = AkelPad.SendMessage(aWnd[IDTOLANGCB][WND], CB_GETITEMDATA, oSelect.ToLang, 0);
      nListenID   = IDLISTEN2;
    }

    if (! aLangs[nSpeechLang][5])
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
  var oError;

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
  SetWndFontAndText(aWnd[nListenID][WND], hGuiFont, sTxtListen);
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
