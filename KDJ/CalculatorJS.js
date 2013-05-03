// CalculatorJS.js - ver. 2013-05-03
//
// JScript expressions calculator
//
// Run in AkelPad window:
//   Call("Scripts::Main", 1, "CalculatorJS.js")
// Run from command line (require registration: regsvr32.exe Scripts.dll):
//   wscript.exe CalculatorJS.js
//
// Warning:
// After running the script, immediately will be executed the code from calculator input (selected text in AkelPad window).
// Try this:
// AkelPad.Command(4109 /*IDM_FILE_EXIT*/);

//temporarily
var WM_USER = 1024;

//globals
var E, PI, abs, acos, asin, atan, ceil, cos, exp, floor, log, max, min, pow, random, round, sin, sqrt, tan;
var LoWord;
var HiWord;
var MkLong;
var cot;
var acot;
var average;
var integer;
var round2;
var bin2dec;
var root;
var lg;
var factorial;
var x, X, y, Y, z, Z;
var Calculate = function(){
  if (arguments[0])
  {
    try
    {
      return eval(arguments[0]);
    }
    catch (oError)
    {
      return oError;
    }
  }
  return undefined;
};

//main function
(function(){
if (typeof AkelPad == "undefined")
{
  try
  {
    AkelPad = new ActiveXObject("AkelPad.Document");
  }
  catch (oError)
  {
    WScript.Echo("You need register Scripts.dll");
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
  var sScriptName = "CalculatorJS";
  var hMainWnd    = AkelPad.GetMainWnd();
  var hGuiFont    = oSys.Call("Gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
  var nMaxLen     = 30000;
  var lpBuffer    = AkelPad.MemAlloc(nMaxLen * 2);
  var oFSO        = new ActiveXObject("Scripting.FileSystemObject");
  var aWndMem     = new Array(3);
  var aNumType    = [["hex", 16], ["dec", 10], ["oct", 8], ["bin", 2]];
  var nNumType    = 1;
  var sStrIn      = "";
  var aStrIn      = [];
  var nMaxStrIn   = 20;
  var bCloseCB1   = 0;
  var bCloseCB2   = 1;
  var nBegSelIn   = 0;
  var nEndSelIn   = 0;
  var nWndX       = 200;
  var nWndY       = 170;
  var nView       = 1;
  var hWndStrOut;
  var hWndOutType;
  var hWndNumType;
  var hWndStrIn;
  var hWndView;
  var hFocus;
  var vResult;
  var _X_, _Y_, _Z_, _Calculate_;

  var IDMEMX    = 100;
  var IDMEMY    = 101;
  var IDMEMZ    = 102;
  var IDOUTPUT  = 103;
  var IDOUTTYPE = 104;
  var IDNUMTYPE = 105;
  var IDINPUT   = 106;
  var IDVIEW    = 107;

  var IDWND = 0;
  var HWND  = 1;
  var TXT   = 2;
  var FUN   = 3;
  var ARG   = 4;
  //Actions   IDWND, HWND,                TXT,       FUN, ARG
  var aActs = [[200,    0,     "Result to &X",  OutToMem,   0],
               [201,    0,     "Result to &Y",  OutToMem,   1],
               [202,    0,     "Result to &Z",  OutToMem,   2],
               [203,    0,     "Copy &result",   CopyOut     ],
               [204,    0,      "Copy &expr.",    CopyIn     ],
               [205,    0,"Expr. to &history",  InToHist     ],
               [206,    0,  "X to expr. (&1)",   MemToIn,   0],
               [207,    0,  "Y to expr. (&2)",   MemToIn,   1],
               [208,    0,  "Z to expr. (&3)",   MemToIn,   2],
               [209,    0, "Result &to expr.",   OutToIn     ],
               [210,    0,     "&Clear expr.",   ClearIn     ],
               [211,    0,    "Clear history", ClearHist     ]];
  //Functions  IDWND, HWND,        TXT,          FUN
  var aFuncs = [[300,    0,      "min",    "min(.,)"],
                [301,    0,      "max",    "max(., )"],
                [302,    0,     "ceil",     "ceil(.)"],
                [303,    0,     "sqrt",     "sqrt(.)"],
                [304,    0,   "random",   "random(.)"],
                [305,    0,  "average", "average(.,)"],
                [306,    0,      "abs",      "abs(.)"],
                [307,    0,    "floor",    "floor(.)"],
                [308,    0,     "root",    "root(.,)"],
                [309,    0,"factorial","factorial(.)"],
                [310,    0,      "sin",      "sin(.)"],
                [311,    0,     "asin",     "asin(.)"],
                [312,    0,  "integer",  "integer(.)"],
                [313,    0,      "exp",      "exp(.)"],
                [314,    0,   "LoWord",   "LoWord(.)"],
                [315,    0,      "cos",      "cos(.)"],
                [316,    0,     "acos",     "acos(.)"],
                [317,    0,    "round",    "round(.)"],
                [318,    0,      "pow",     "pow(.,)"],
                [319,    0,   "HiWord",   "HiWord(.)"],
                [320,    0,      "tan",      "tan(.)"],
                [321,    0,     "atan",     "atan(.)"],
                [322,    0,   "round2",  "round2(.,)"],
                [323,    0,      "log",      "log(.)"],
                [324,    0,   "MkLong",  "MkLong(.,)"],
                [325,    0,      "cot",      "cot(.)"],
                [326,    0,     "acot",     "acot(.)"],
                [327,    0,  "bin2dec",  "bin2dec(.)"],
                [328,    0,       "lg",      "lg(.,)"],
                [329,    0,  "1/(...)",      "1/(.)"]];
  //Operators  IDWND, HWND,    TXT,    FUN
  var aOpers = [[400,    0,    "/",    "/"],
                [401,    0,    "*",    "*"],
                [402,    0,    "-",    "-"],
                [403,    0,    "+",    "+"],
                [404,    0,   "!=",   "!="],
                [405,    0,  "!==",  "!=="],
                [406,    0,   "==",   "=="],
                [407,    0,  "===",  "==="],
                [408,    0,    "<",    "<"],
                [409,    0,   "<=",   "<="],
                [410,    0,   ">=",   ">="],
                [411,    0,    ">",    ">"],
                [412,    0,    "!",    "!"],
                [413,    0, "&&&&",   "&&"],
                [414,    0,   "||",   "||"],
                [415,    0,   "?:", "(?:)"],
                [416,    0,    "~",    "~"],
                [417,    0,   "&&",    "&"],
                [418,    0,    "|",    "|"],
                [419,    0,    "^",    "^"],
                [420,    0,   "<<",   "<<"],
                [421,    0,   ">>",   ">>"],
                [422,    0,  ">>>",  ">>>"],
                [423,    0,    "%",    "%"]];
  //Constants IDWND, HWND,     TXT
  var aCons = [[500,    0,     "D"],
               [501,    0,     "E"],
               [502,    0,     "F"],
               [503,    0,    "0x"],
               [504,    0,     "A"],
               [505,    0,     "B"],
               [506,    0,     "C"],
               [507,    0,    "PI"],
               [508,    0,     "7"],
               [509,    0,     "8"],
               [510,    0,     "9"],
               [511,    0, "/.../"],
               [512,    0,     "4"],
               [513,    0,     "5"],
               [514,    0,     "6"],
               [515,    0, "{...}"],
               [516,    0,     "1"],
               [517,    0,     "2"],
               [518,    0,     "3"],
               [519,    0, "[...]"],
               [520,    0,     "0"],
               [521,    0,     "."],
               [522,    0,     ","],
               [523,    0, "(...)"]];
  var hIcon =
    oSys.Call("User32::LoadImageW",
              hInstanceDLL, //hinst
              101,          //lpszName
              1,            //uType=IMAGE_ICON
              0,            //cxDesired
              0,            //cyDesired
              0x00000040);  //fuLoad=LR_DEFAULTSIZE

  ReadIni();
  AkelPad.WindowRegisterClass(sClassName);

  hWndDlg =
    oSys.Call("User32::CreateWindowExW",
              0,               //dwExStyle
              sClassName,      //lpClassName
              sScriptName,     //lpWindowName
              0x90CA0000,      //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX
              nWndX,           //x
              nWndY,           //y
              0,               //nWidth
              0,               //nHeight
              hMainWnd,        //hWndParent
              0,               //ID
              hInstanceDLL,    //hInstance
              DialogCallback); //Script function callback. To use it class must be registered by WindowRegisterClass.

  //Allow other scripts running
  AkelPad.ScriptNoMutex();

  //Message loop
  AkelPad.WindowGetMessage();

  AkelPad.MemFree(lpBuffer);
  oSys.Call("User32::DestroyIcon", hIcon);
  AkelPad.WindowUnregisterClass(sClassName);
}

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    var i;

    //Create EDIT Memory (x,y,z)
    for (i = 0; i < 3; ++i)
    {
      aWndMem[i] =
        oSys.Call("User32::CreateWindowExW",
                  0,             //dwExStyle
                  "EDIT",        //lpClassName
                  0,             //lpWindowName
                  0x50810880,    //WS_VISIBLE|WS_CHILD|WS_BORDER|WS_TABSTOP|ES_AUTOHSCROLL|ES_READONLY
                  3+(172)*(i%3), //x
                  5,             //y
                  171,           //nWidth
                  21,            //nHeight
                  hWnd,          //hWndParent
                  IDMEMX + i,    //ID
                  hInstanceDLL,  //hInstance
                  0);            //lpParam
      SetMem(i);
    }

    //Create EDIT Output
    hWndStrOut =
      oSys.Call("User32::CreateWindowExW",
                0,            //dwExStyle
                "EDIT",       //lpClassName
                0,            //lpWindowName
                0x50810880,   //WS_VISIBLE|WS_CHILD|WS_BORDER|WS_TABSTOP|ES_AUTOHSCROLL|ES_READONLY
                3,            //x
                30,           //y
                376,          //nWidth
                21,           //nHeight
                hWnd,         //hWndParent
                IDOUTPUT,     //ID
                hInstanceDLL, //hInstance
                0);           //lpParam
    SetWindowFontAndText(hWndStrOut, "");

    //Create STATIC Out type
    hWndOutType =
      oSys.Call("User32::CreateWindowExW",
                0,            //dwExStyle
                "STATIC",     //lpClassName
                0,            //lpWindowName
                0x50800001,   //WS_VISIBLE|WS_CHILD|WS_BORDER|SS_CENTER
                380,          //x
                30,           //y
                94,           //nWidth
                21,           //nHeight
                hWnd,         //hWndParent
                IDOUTTYPE,    //ID
                hInstanceDLL, //hInstance
                0);           //lpParam

    //Create COMBOBOX Num types
    hWndNumType =
      oSys.Call("User32::CreateWindowExW",
                0,            //dwExStyle
                "COMBOBOX",   //lpClassName
                0,            //lpWindowName
                0x50010003,   //WS_VISIBLE|WS_CHILD|WS_TABSTOP|CBS_DROPDOWNLIST
                475,          //x
                30,           //y
                43,           //nWidth
                100,          //nHeight
                hWnd,         //hWndParent
                IDNUMTYPE,    //ID
                hInstanceDLL, //hInstance
                0);           //lpParam
    for (i = 0; i < 4; ++i)
      oSys.Call("User32::SendMessageW", hWndNumType, 0x143 /*CB_ADDSTRING*/, 0, aNumType[i][0]);

    SetWindowFontAndText(hWndNumType, "");
    AkelPad.SendMessage(hWndNumType, 0x14E /*CB_SETCURSEL*/, nNumType, 0);

    //Create COMBOBOX Input
    hWndStrIn =
      oSys.Call("User32::CreateWindowExW",
                0,            //dwExStyle
                "COMBOBOX",   //lpClassName
                0,            //lpWindowName
                0x50210042,   //WS_VISIBLE|WS_CHILD|WS_VSCROLL|WS_TABSTOP|CBS_DROPDOWN|CBS_AUTOHSCROLL
                3,            //x
                55,           //y
                515,          //nWidth
                300,          //nHeight
                hWnd,         //hWndParent
                IDINPUT,      //ID
                hInstanceDLL, //hInstance
                0);           //lpParam
    AkelPad.SendMessage(hWndStrIn, 0x0155 /*CB_SETEXTENDEDUI*/, 1, 0);
    SetWindowFontAndText(hWndStrIn, sStrIn);
    for (i = 0; i < aStrIn.length; ++i)
      oSys.Call("User32::SendMessageW", hWndStrIn, 0x143 /*CB_ADDSTRING*/, 0, aStrIn[i]);

    //Create BUTTONs Action
    for (i = 0; i < aActs.length; ++i)
    {
      aActs[i][HWND] =
        oSys.Call("User32::CreateWindowExW",
                  0,                       //dwExStyle
                  "BUTTON",                //lpClassName
                  0,                       //lpWindowName
                  0x50010000,              //WS_VISIBLE|WS_CHILD|WS_TABSTOP
                  3+(75)*(i%6),            //x
                  83+(23)*Math.floor(i/6), //y
                  75,                      //nWidth
                  23,                      //nHeight
                  hWnd,                    //hWndParent
                  aActs[i][IDWND],         //ID
                  hInstanceDLL,            //hInstance
                  0);                      //lpParam
      SetWindowFontAndText(aActs[i][HWND], aActs[i][TXT]);
    }

    //Create BUTTON View
    hWndView =
      oSys.Call("User32::CreateWindowExW",
                0,            //dwExStyle
                "BUTTON",     //lpClassName
                0,            //lpWindowName
                0x50010000,   //WS_VISIBLE|WS_CHILD|WS_TABSTOP
                463,          //x
                83,           //y
                55,           //nWidth
                46,           //nHeight
                hWnd,         //hWndParent
                IDVIEW,       //ID
                hInstanceDLL, //hInstance
                0);           //lpParam
    SetWindowFontAndText(hWndView, "&View");

    //Create BUTTONs Functions
    for (i = 0; i < aFuncs.length; ++i)
    {
      aFuncs[i][HWND] =
        oSys.Call("User32::CreateWindowExW",
                  0,                        //dwExStyle
                  "BUTTON",                 //lpClassName
                  0,                        //lpWindowName
                  0x50010000,               //WS_VISIBLE|WS_CHILD|WS_TABSTOP
                  3+(55)*(i%5),             //x
                  136+(23)*Math.floor(i/5), //y
                  55,                       //nWidth
                  23,                       //nHeight
                  hWnd,                     //hWndParent
                  aFuncs[i][IDWND],         //ID
                  hInstanceDLL,             //hInstance
                  0);                       //lpParam
      SetWindowFontAndText(aFuncs[i][HWND], aFuncs[i][TXT]);
    }

    //Create BUTTONs Operators
    for (i = 0; i < aOpers.length; ++i)
    {
      aOpers[i][HWND] =
        oSys.Call("User32::CreateWindowExW",
                  0,                        //dwExStyle
                  "BUTTON",                 //lpClassName
                  0,                        //lpWindowName
                  0x50010000,               //WS_VISIBLE|WS_CHILD|WS_TABSTOP
                  288+(30)*(i%4),           //x
                  136+(23)*Math.floor(i/4), //y
                  30,                       //nWidth
                  23,                       //nHeight
                  hWnd,                     //hWndParent
                  aOpers[i][IDWND],         //ID
                  hInstanceDLL,             //hInstance
                  0);                       //lpParam
      SetWindowFontAndText(aOpers[i][HWND], aOpers[i][TXT]);
    }

    //Create BUTTONs Constants
    for (i = 0; i < aCons.length; ++i)
    {
      aCons[i][HWND] =
        oSys.Call("User32::CreateWindowExW",
                  0,                        //dwExStyle
                  "BUTTON",                 //lpClassName
                  0,                        //lpWindowName
                  0x50010000,               //WS_VISIBLE|WS_CHILD|WS_TABSTOP
                  418+(25)*(i%4),           //x
                  136+(23)*Math.floor(i/4), //y
                  25,                       //nWidth
                  23,                       //nHeight
                  hWnd,                     //hWndParent
                  aCons[i][IDWND],          //ID
                  hInstanceDLL,             //hInstance
                  0);                       //lpParam
      SetWindowFontAndText(aCons[i][HWND], aCons[i][TXT]);
    }

    SetView(hWnd);
    AkelPad.SendMessage(hWnd, 0x0080 /*WM_SETICON*/, 0 /*ICON_SMALL*/, hIcon);
    oSys.Call("User32::PostMessageW", hWnd, 273 /*WM_COMMAND*/, MkLong(IDINPUT, 5 /*CBN_EDITCHANGE*/), hWndStrIn);

    hFocus = hWndStrIn;
  }

  else if ((uMsg == 6 /*WM_ACTIVATE*/) && (! wParam))
    hFocus = oSys.Call("User32::GetFocus");

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("User32::SetFocus", hFocus);

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if ((wParam == 27 /*VK_ESCAPE*/) && (bCloseCB1) && (bCloseCB2))
      oSys.Call("User32::PostMessageW", hWndDlg, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    var nLowParam = LoWord(wParam);
    var nHiwParam = HiWord(wParam);
    bCloseCB1 = 1;

    if (nLowParam == IDINPUT)
    {
      if (nHiwParam == 3 /*CBN_SETFOCUS*/)
        AkelPad.SendMessage(hWndStrIn, 0x0142 /*CB_SETEDITSEL*/, 0, MkLong(nBegSelIn, nEndSelIn));
      else if (nHiwParam == 10 /*CBN_SELENDCANCEL*/)
      {
        nBegSelIn = LoWord(AkelPad.SendMessage(hWndStrIn, 0x0140 /*CB_GETEDITSEL*/, 0, 0));
        nEndSelIn = HiWord(AkelPad.SendMessage(hWndStrIn, 0x0140 /*CB_GETEDITSEL*/, 0, 0));
      }
      else if (nHiwParam == 5 /*CBN_EDITCHANGE*/)
      {
        sStrIn  = GetWindowText(hWndStrIn);
        vResult = Calculate(sStrIn);
        x = X = _X_;
        y = Y = _Y_;
        z = Z = _Z_;
        Calculate = _Calculate_;
        GetGlobals();
        SetOut();
      }
      else if (nHiwParam == 1 /*CBN_SELCHANGE*/)
        oSys.Call("User32::PostMessageW", hWnd, 273 /*WM_COMMAND*/, MkLong(IDINPUT, 5 /*CBN_EDITCHANGE*/), hWndStrIn);
      else if (nHiwParam == 7 /*CBN_DROPDOWN*/)
        bCloseCB2 = 0;
      else if (nHiwParam == 8 /*CBN_CLOSEUP*/)
        bCloseCB2 = 1;
    }

    else if ((nLowParam >= IDMEMX) && (nLowParam <= IDMEMZ))
      AkelPad.SendMessage(lParam, 0x00B1 /*EM_SETSEL*/, 2, -1);

    else if (nLowParam == IDNUMTYPE)
    {
      if (nHiwParam == 1 /*CBN_SELCHANGE*/)
      {
        nNumType = AkelPad.SendMessage(hWndNumType, 0x147 /*CB_GETCURSEL*/, 0, 0);
        SetOut();
      }
      else if (nHiwParam == 8 /*CBN_CLOSEUP*/)
        bCloseCB1 = 0;
    }

    else if ((nLowParam >= aActs[0][IDWND]) && (nLowParam <= aActs[aActs.length - 1][IDWND]))
    {
      oSys.Call("User32::SetFocus", hWndStrIn);
      aActs[nLowParam - aActs[0][0]][FUN](aActs[nLowParam - aActs[0][0]][ARG]);
    }

    else if ((nLowParam >= aFuncs[0][IDWND]) && (nLowParam <= aFuncs[aFuncs.length - 1][IDWND]))
      FunToIn(aFuncs[nLowParam - aFuncs[0][0]][FUN]);

    else if ((nLowParam >= aOpers[0][IDWND]) && (nLowParam <= aOpers[aOpers.length - 1][IDWND]))
      FunToIn(aOpers[nLowParam - aOpers[0][0]][FUN]);

    else if ((nLowParam >= aCons[0][IDWND]) && (nLowParam <= aCons[aCons.length - 1][IDWND]))
      FunToIn(aCons[nLowParam - aCons[0][0]][TXT]);

    else if (nLowParam == IDVIEW)
    {
      nView = Number(! nView);
      SetView(hWnd);
    }

    oSys.Call("User32::DefDlgProcW", hWnd, 1025 /*DM_SETDEFID*/, nLowParam, 0);
    oSys.Call("User32::DefDlgProcW", hWnd, 1025 /*DM_SETDEFID*/, IDOUTPUT, 0);
  }

  else if (uMsg == 16) //WM_CLOSE
  {
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

function ReadIni()
{
  var sIniFile = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";
  var oFile;
  var i;

  if (oFSO.FileExists(sIniFile))
  {
    oFile = oFSO.OpenTextFile(sIniFile, 1, false, -1);

    try
    {
      eval(oFile.ReadAll());
    }
    catch (oError)
    {}

    oFile.Close();
  }

  _X_ = X = x;
  _Y_ = Y = y;
  _Z_ = Z = z;
  _Calculate_ = Calculate;
  GetGlobals();

  if (AkelPad.GetSelStart() != AkelPad.GetSelEnd())
  {
    sStrIn = AkelPad.GetSelText(1 /*\r*/).substring(0, nMaxLen).replace(/\r/g, " ");
    nBegSelIn = nEndSelIn = 0;
  }
}

function WriteIni()
{
  var oFile  = oFSO.OpenTextFile(WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini", 2, true, -1);
  var lpRect = AkelPad.MemAlloc(16) //sizeof(RECT);
  var sIniTxt;
  var vMem;
  var sStrMem;
  var i;

  oSys.Call("User32::GetWindowRect", hWndDlg, lpRect);
  nWndX = AkelPad.MemRead(lpRect,     3 /*DT_DWORD*/);
  nWndY = AkelPad.MemRead(lpRect + 4, 3 /*DT_DWORD*/);
  AkelPad.MemFree(lpRect);

  oSys.Call("User32::SetFocus", hWndStrIn);

  sIniTxt =
    'nWndX='     + nWndX     + ';\r\n' +
    'nWndY='     + nWndY     + ';\r\n' +
    'nView='     + nView     + ';\r\n' +
    'nNumType='  + nNumType  + ';\r\n' +
    'nBegSelIn=' + nBegSelIn + ';\r\n' +
    'nEndSelIn=' + nEndSelIn + ';\r\n' +
    'sStrIn="'   + EscapeStr(sStrIn) + '";\r\n' +
    'aStrIn=[';

  for (i = 0; i < aStrIn.length; ++i)
    sIniTxt += '"' + EscapeStr(aStrIn[i]) + '"' + ((i < aStrIn.length - 1) ? ',' : '');
  sIniTxt += '];\r\n';

  for (i = 0; i < 3; ++i)
  {
    vMem    = [x, y, z][i];
    sStrMem = ["x=", "y=", "z="][i];

    if ((typeof vMem == "boolean") || (typeof vMem == "number") || (vMem === null))
      sIniTxt += sStrMem + vMem + ';\r\n';
    else if (typeof vMem == "string")
      sIniTxt += sStrMem + '"' + EscapeStr(vMem) + '";\r\n';
  }
	
  oFile.Write(sIniTxt);
  oFile.Close();
}

function EscapeStr(sText)
{
  return sText.replace(/[\\"]/g, '\\$&').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

function SetView(hWnd)
{
  var i;

  for (i = 0; i < aFuncs.length; ++i)
    oSys.Call("User32::EnableWindow", aFuncs[i][HWND], nView);
  for (i = 0; i < aOpers.length; ++i)
    oSys.Call("User32::EnableWindow", aOpers[i][HWND], nView);
  for (i = 0; i < aCons.length; ++i)
    oSys.Call("User32::EnableWindow", aCons[i][HWND], nView);

  oSys.Call("User32::SetWindowPos", hWnd, 0, 0, 0, 527, (nView ? 308 : 163), 0x16 /*SWP_NOZORDER|SWP_NOACTIVATE/SWP_NOMOVE*/);
  oSys.Call("User32::SetFocus", hWndStrIn);
}

function GetWindowText(hWnd)
{
  oSys.Call("User32::GetWindowTextW", hWnd, lpBuffer, nMaxLen);
  return AkelPad.MemRead(lpBuffer, 1 /*DT_UNICODE*/);
}

function SetWindowFontAndText(hWnd, sText)
{
  AkelPad.SendMessage(hWnd, 48 /*WM_SETFONT*/, hGuiFont, true);
  oSys.Call("User32::SetWindowTextW", hWnd, sText);
}

function OutToMem(nMem)
{
  var vMem;

  if ((typeof vResult == "boolean") || (vResult instanceof Boolean) || (typeof vResult == "number") || (vResult instanceof Number) || (typeof vResult == "string") || (vResult instanceof String))
    vMem = vResult.valueOf();
  else if ((typeof vResult == "undefined") || (vResult === null))
    vMem = vResult;
  else
  {
    AkelPad.MessageBox(hWndDlg, "To memory cache (x, y, z), you can assign only values of type:\n- boolean\n- null\n- number\n- string\n- undefined", sScriptName, 0x30 /*MB_ICONWARNING*/);
    return;
  }

  if (nMem == 0)
    x = X = _X_ = vMem;
  else if (nMem == 1)
    y = Y = _Y_ = vMem;
  else
    z = Z = _Z_ = vMem;

  SetMem(nMem);
}

function MemToIn(nMem)
{
  var vMem = [x, y, z][nMem];

  if (typeof vMem != "undefined")
  {
    if (typeof vMem == "string")
      vMem = '"' + EscapeStr(vMem) + '"';
    else
      vMem = "" + vMem;

    sStrIn    = sStrIn.substr(0, nBegSelIn) + vMem + sStrIn.substr(nEndSelIn);
    nBegSelIn = nBegSelIn + vMem.length;
    nEndSelIn = nBegSelIn;

    EditChange();
  }
}

function CopyOut()
{
  var sStrOut = GetWindowText(hWndStrOut);
  if (sStrOut) AkelPad.SetClipboardText(sStrOut);
}

function OutToIn()
{
  var sStrOut = GetWindowText(hWndStrOut);

  if (((typeof vResult == "number") || (vResult instanceof Number)) && (nNumType == 3) && (! /[^01-]/.test(sStrOut)))
    sStrOut = "bin2dec(" + sStrOut + ")";
  else if ((typeof vResult == "string") || (vResult instanceof String))
    sStrOut = '"' + EscapeStr(sStrOut.slice(1, -1)) + '"';

  sStrIn    = sStrIn.substr(0, nBegSelIn) + sStrOut + sStrIn.substr(nEndSelIn);
  nBegSelIn = nBegSelIn + sStrOut.length;
  nEndSelIn = nBegSelIn;

  EditChange();
}

function CopyIn()
{
  if (sStrIn) AkelPad.SetClipboardText(sStrIn);
}

function ClearIn()
{
  sStrIn = "";
  nBegSelIn = nEndSelIn = 0;

  EditChange();
}

function InToHist()
{
  if (sStrIn)
  {
    for (var i = 0; i < aStrIn.length; ++i)
    {
      if (aStrIn[i] == sStrIn)
      {
        aStrIn.splice(i, 1);
        AkelPad.SendMessage(hWndStrIn, 0x144 /*CB_DELETESTRING*/, i, 0);
      }
    }

    if (aStrIn.length == nMaxStrIn)
    {
      aStrIn.pop();
      AkelPad.SendMessage(hWndStrIn, 0x144 /*CB_DELETESTRING*/, nMaxStrIn - 1, 0);
    }

    aStrIn.unshift(sStrIn);
    oSys.Call("User32::SendMessageW", hWndStrIn, 0x14A /*CB_INSERTSTRING*/, 0, sStrIn);
  }
}

function ClearHist()
{
  aStrIn = [];
  AkelPad.SendMessage(hWndStrIn, 0x14B /*CB_RESETCONTENT*/, 0, 0);
}

function FunToIn(sText)
{
  var oRE = /\.+(?=[^\(]*\)|\]|\}|\/)/;

  oSys.Call("User32::SetFocus", hWndStrIn);

  if (oRE.test(sText))
  {
    sText  = sText.replace(oRE, sStrIn.substring(nBegSelIn, nEndSelIn));
    sStrIn = sStrIn.substr(0, nBegSelIn) + sText + sStrIn.substr(nEndSelIn);

    nBegSelIn += RegExp.index;
    nEndSelIn += RegExp.index;
  }
  else
  {
    sStrIn = sStrIn.substr(0, nBegSelIn) + sText + sStrIn.substr(nEndSelIn);
    nBegSelIn = nBegSelIn + ((sText.indexOf("(") >= 0) ? sText.indexOf("(") + 1 : sText.length);
    nEndSelIn = nBegSelIn;
  }

  EditChange();
}

function EditChange()
{
  SetWindowFontAndText(hWndStrIn, sStrIn);
  AkelPad.SendMessage(hWndStrIn, 0x0142 /*CB_SETEDITSEL*/, 0, MkLong(nBegSelIn, nEndSelIn));
  oSys.Call("User32::PostMessageW", hWndDlg, 273 /*WM_COMMAND*/, MkLong(IDINPUT, 5 /*CBN_EDITCHANGE*/), hWndStrIn);
}

function SetMem(nMem)
{
  var sStrMem;
  var vMem;

  if (nMem == 0)
  {
    sStrMem = "x=";
    vMem    = x;
  }
  else if (nMem == 1)
  {
    sStrMem = "y=";
    vMem    = y;
  }
  else
  {
    sStrMem = "z=";
    vMem    = z;
  }

  if ((typeof vMem == "boolean") || (typeof vMem == "number") || (vMem === null))
    sStrMem += vMem;
  else if (typeof vMem == "string")
    sStrMem += '"' + vMem + '"';

  SetWindowFontAndText(aWndMem[nMem], sStrMem);
}

function SetOut()
{
  var sOutType = typeof vResult;
  var sStrOut  = "";

  if (! sStrIn)
    sOutType = "";
  else if ((sOutType == "boolean") || (sOutType == "function") || (sOutType == "number"))
    sStrOut = vResult.toString();
  else if (sOutType == "string")
    sStrOut = '"' + vResult + '"';
  else if (sOutType == "date")
    sStrOut = Date(vResult);
  else if (sOutType == "undefined")
    sStrOut = "";
  else if (sOutType == "object")
  {
    sOutType = "obj ";
    if (vResult === null)
    {
      sStrOut   = "null";
      sOutType += "Null";
    }
    else if (vResult instanceof ActiveXObject)
      sOutType += " ActiveXObject";
    else if (vResult instanceof Array)
    {
      sStrOut   = vResult.toString();
      sOutType += "Array";
    }
    else if (vResult instanceof Boolean)
    {
      sStrOut   = vResult.toString();
      sOutType += "Boolean";
    }
    else if (vResult instanceof Date)
    {
      sStrOut   = vResult.toString();
      sOutType += "Date";
    }
    else if (vResult instanceof Enumerator)
      sOutType += "Enumerator";
    else if (vResult instanceof Error)
    {
      sStrOut  = vResult.name + ": " + vResult.description;
      sOutType = "Error";
    }
    else if (vResult instanceof Number)
    {
      sStrOut   = vResult.toString();
      sOutType += "Number";
    }
    else if (vResult instanceof RegExp)
    {
      sStrOut   = vResult.toString();
      sOutType += "RegExp";
    }
    else if (vResult instanceof String)
    {
      sStrOut   = '"' + vResult + '"';
      sOutType += "String";
    }
    else if (vResult instanceof VBArray)
    {
      sStrOut   = vResult.toArray().toString();
      sOutType += "VBArray";
    }
    else if (vResult instanceof Object)
    {
      sStrOut   = vResult.toString();
      sOutType += "Object";
    }
    else
      sOutType += "unknown";
  }

  if (((sOutType == "number") || (vResult instanceof Number)) && (nNumType != 1) && (vResult % 1 == 0))
  {
    //for a higher value, toString() returns number in an exponential notation
    if (Math.abs(vResult) < 0x1FFFFFFFFFFFFF80)
    {
      sStrOut = Math.abs(vResult).toString(aNumType[nNumType][1]).toUpperCase();

      if (nNumType == 0)
        sStrOut = "0x" + sStrOut;
      else if (nNumType == 2)
        sStrOut = "0" + sStrOut;

      if (vResult < 0)
        sStrOut = "-" + sStrOut;
    }
    else
    {
      nNumType = 1;
      AkelPad.SendMessage(hWndNumType, 0x14E /*CB_SETCURSEL*/, nNumType, 0);
    }
  }

  SetWindowFontAndText(hWndStrOut, sStrOut);
  SetWindowFontAndText(hWndOutType, sOutType);
}

function GetGlobals()
{
  E      = Math.E;
  PI     = Math.PI;
  abs    = Math.abs;
  acos   = Math.acos;
  asin   = Math.asin;
  atan   = Math.atan;
  ceil   = Math.ceil;
  cos    = Math.cos;
  exp    = Math.exp;
  floor  = Math.floor;
  log    = Math.log;
  max    = Math.max;
  min    = Math.min;
  pow    = Math.pow;
  random = Math.random;
  round  = Math.round;
  sin    = Math.sin;
  sqrt   = Math.sqrt;
  tan    = Math.tan;

  LoWord = function(nDwNum){
    return (nDwNum & 0xFFFF);
  };

  HiWord = function(nDwNum){
    return ((nDwNum >> 16) & 0xFFFF);
  };

  MkLong = function(nLoWord, nHiWord){
    return (nLoWord & 0xFFFF) | (nHiWord << 16);
  };

  cot = function(nNum){
    return 1 / Math.tan(nNum);
  };

  acot = function(nNum){
    return Math.PI / 2 - Math.atan(nNum);
  };

  average = function(){
    var nSum = 0;
    for (var i = 0; i < arguments.length; ++i)
      nSum += arguments[i];
    return nSum / arguments.length;
  };

  integer = function(nNum){
    return parseInt(nNum);
  };

  round2 = function(nNum, nDec){
    return Math.round(nNum * Math.pow(10, nDec))/Math.pow(10, nDec);
  };

  bin2dec = function(nNum){
    var nBeg = 0;
    var i;
    if (nNum < 0)
      nBeg = 1;
    for (i = nBeg; i < nNum.toString().length; ++i)
    {
      if ((nNum.toString().charAt(i) != "0") && (nNum.toString().charAt(i) != "1"))
        return NaN;
    }
    return parseInt(nNum, 2);
  };

  root = function(nNum, nDeg){
    return Math.pow(nNum, 1 / nDeg);
  };

  lg = function(nNum, nBase){
    if (nBase == 2)
      return Math.LOG2E * Math.log(nNum);
    if (nBase == 10)
      return Math.LOG10E * Math.log(nNum);
    return Math.log(nNum) / Math.log(nBase);
  };

  factorial = function(nNum){
    var nResult = 1;
    var i;
    if (nNum < 0)
      return NaN;
    for (i = 1; i <= nNum; ++i)
      nResult *= i;
    return nResult;
  };
}
})();
