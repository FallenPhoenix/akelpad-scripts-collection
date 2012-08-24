// JS expression calculator - 2011-05-27
//
// Call("Scripts::Main", 1, "CalculatorJS.js")


//Control IDs
var IDC_STATIC    = -1;
var IDC_OUTPUT    = 100;
var IDC_OUTTYPE   = 101;
var IDC_INPUT     = 102;
var IDC_VIEW      = 103;

//Action    IDCACT, WNDACT,            STRACT,        FUNACT
var lpActs = [[200,      0,     "Result to &X", "OutToXYZ(0)",],
              [201,      0,     "Result to &Y", "OutToXYZ(1)",],
              [202,      0,     "Result to &Z", "OutToXYZ(2)",],
              [203,      0,     "Copy &result",   "CopyOut()",],
              [204,      0,      "Copy &expr.",    "CopyIn()",],
              [205,      0,"Expr. to &history",  "InToHist()",],
              [206,      0,       "X to expr.",  "XYZToIn(0)",],
              [207,      0,       "Y to expr.",  "XYZToIn(1)",],
              [208,      0,       "Z to expr.",  "XYZToIn(2)",],
              [209,      0,  "Result &to expr.",   "OutToIn()",],
              [210,      0,     "&Clear expr.",   "ClearIn()",],
              [211,      0,    "Clear history", "ClearHist()",]];
var nBegAct = lpActs[0][0];
var nActs   = lpActs.length;
var IDCACT  = 0;
var WNDACT  = 1;
var STRACT  = 2;
var FUNACT  = 3;

//functions  IDCFUN, WNDFUN,     BUTFUN,       STRFUN
var lpFuncs = [[300,      0,      "min",    "min(, )"],
               [301,      0,      "max",    "max(, )"],
               [302,      0,     "ceil",     "ceil()"],
               [303,      0,     "sqrt",     "sqrt()"],
               [304,      0,   "random",   "random()"],
               [305,      0,  "average","average(, )"],
               [306,      0,      "abs",      "abs()"],
               [307,      0,    "floor",    "floor()"],
               [308,      0,     "root",   "root(, )"],
               [309,      0,"factorial","factorial()"],
               [310,      0,      "sin",      "sin()"],
               [311,      0,     "asin",     "asin()"],
               [312,      0,  "integer",  "integer()"],
               [313,      0,      "exp",      "exp()"],
               [314,      0,   "LoWord",   "LoWord()"],
               [315,      0,      "cos",      "cos()"],
               [316,      0,     "acos",     "acos()"],
               [317,      0,    "round",    "round()"],
               [318,      0,      "pow",    "pow(, )"],
               [319,      0,   "HiWord",   "HiWord()"],
               [320,      0,      "tan",      "tan()"],
               [321,      0,     "atan",     "atan()"],
               [322,      0,   "round2", "round2(, )"],
               [323,      0,      "log",      "log()"],
               [324,      0,   "MkLong",   "MkLong()"],
               [325,      0,      "cot",      "cot()"],
               [326,      0,     "acot",     "acot()"],
               [327,      0,  "bin2dec",  "bin2dec()"],
               [328,      0,       "lg",     "lg(, )"],
               [329,      0,  "1/(...)",    "1/(...)"]];
var nBegFun = lpFuncs[0][0];
var nFuncs  = lpFuncs.length;
var IDCFUN  = 0;
var WNDFUN  = 1;
var BUTFUN  = 2;
var STRFUN  = 3;

//operators  IDCOPE, WNDOPE, BUTOPE, STROPE
var lpOpers = [[400,      0,    "/",    "/"],
               [401,      0,    "*",    "*"],
               [402,      0,    "-",    "-"],
               [403,      0,    "+",    "+"],
               [404,      0,   "!=",   "!="],
               [405,      0,  "!==",  "!=="],
               [406,      0,   "==",   "=="],
               [407,      0,  "===",  "==="],
               [408,      0,    "<",    "<"],
               [409,      0,   "<=",   "<="],
               [410,      0,   ">=",   ">="],
               [411,      0,    ">",    ">"],
               [412,      0,    "!",    "!"],
               [413,      0, "&&&&",   "&&"],
               [414,      0,   "||",   "||"],
               [415,      0,   "?:", "(?:)"],
               [416,      0,    "~",    "~"],
               [417,      0,   "&&",    "&"],
               [418,      0,    "|",    "|"],
               [419,      0,    "^",    "^"],
               [420,      0,   "<<",   "<<"],
               [421,      0,   ">>",   ">>"],
               [422,      0,  ">>>",  ">>>"],
               [423,      0,    "%",    "%"]];
var nBegOpe = lpOpers[0][0];
var nOpers  = lpOpers.length;
var IDCOPE  = 0;
var WNDOPE  = 1;
var BUTOPE  = 2;
var STROPE  = 3;

//constants IDCCON, WNDCON, STRCON,
var lpCons = [[500,      0,    "D"],
              [501,      0,    "E"],
              [502,      0,    "F"],
              [503,      0,   "0x"],
              [504,      0,    "A"],
              [505,      0,    "B"],
              [506,      0,    "C"],
              [507,      0,   "PI"],
              [508,      0,    "7"],
              [509,      0,    "8"],
              [510,      0,    "9"],
              [511,      0,    "("],
              [512,      0,    "4"],
              [513,      0,    "5"],
              [514,      0,    "6"],
              [515,      0,    ")"],
              [516,      0,    "1"],
              [517,      0,    "2"],
              [518,      0,    "3"],
              [519,      0,   "()"],
              [520,      0,    "0"],
              [521,      0,    "."],
              [522,      0,    ","],
              [523,      0,"(...)"]];
var nBegCon = lpCons[0][0];
var nCons   = lpCons.length;
var IDCCON  = 0;
var WNDCON  = 1;
var STRCON  = 2;

var WshShell     = new ActiveXObject("WScript.shell");
var hMainWnd     = AkelPad.GetMainWnd();
var hEditWnd     = AkelPad.GetEditWnd();
var oSys         = AkelPad.SystemFunction();
var hInstanceDLL = AkelPad.GetInstanceDll();
var pClassName   = "AkelPad::Scripts::" + WScript.ScriptName + "::" + hInstanceDLL;
var hWndXYZType  = new Array(3);
var hWndXYZ      = new Array(3);
var hWndDlg;
var hWndStrOut;
var hWndOutType;
var hWndStrIn;
var hWndView;

var x         = "", X = "", y = "", Y = "", z = "", Z = "";
var lpXYZType = [1, 1, 1];
var lpOutType = [["hex", 16], ["dec", 10], ["oct", 8], ["bin", 2]];
var nOutType  = 1;
var pStrOut   = "";
var pStrIn    = "";
var nStrsIn   = 20;
var nNumStrIn = 0;
var lpStrsIn  = new Array(nStrsIn);
var bCloseCB1 = 0;
var bCloseCB2 = 1;
var nBegSel   = AkelPad.GetSelStart();
var nEndSel   = AkelPad.GetSelEnd();
var nBegSelIn = 0;
var nEndSelIn = 0;
var nMaxLen   = 1024;

var nViewType     = 2;
var lpDlgXYWH     = [[200,170, 527, 109],
                     [200,170, 527, 163],
                     [200,170, 527, 308]];
var lpOutXYWH     = [[  3,  5, 469,  21],
                     [  3, 30, 469,  21],
                     [  3, 30, 469,  21]];
var lpOutTypeXYWH = [[473,  5,  45,  23],
                     [473, 30,  45,  23],
                     [473, 30,  45,  23]];
var lpInXYWH      = [[  3, 30, 515,  23],
                     [  3, 55, 515,  23],
                     [  3, 55, 515,  23]];
var lpViewXYWH    = [[463, 55,  55,  20],
                     [463, 83,  55,  46],
                     [463, 83,  55,  46]];

var hGuiFont;
var hFocus;
var lpBuffer;
var nLowParam;
var nHiwParam;
var ni;

var pTxtCaption = "CalculatorJS";
var pTxtView    = "&View";


if (hMainWnd)
{
  if (lpBuffer=AkelPad.MemAlloc(nMaxLen * _TSIZE))
  {
    ReadParams();

    if (AkelPad.WindowRegisterClass(pClassName))
    {
      //Create dialog
      AkelPad.MemCopy(lpBuffer, pClassName, _TSTR);
      hWndDlg = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                         0,                      //dwExStyle
                         lpBuffer,               //lpClassName
                         0,                      //lpWindowName
                         0x90CA0000,             //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX
                         lpDlgXYWH[nViewType][0],//x
                         lpDlgXYWH[nViewType][1],//y
                         lpDlgXYWH[nViewType][2],//nWidth
                         lpDlgXYWH[nViewType][3],//nHeight
                         hMainWnd,               //hWndParent
                         0,                      //ID
                         hInstanceDLL,           //hInstance
                         DialogCallback);        //Script function callback. To use it class must be registered by WindowRegisterClass.
      if (hWndDlg)
      {
        //Allow other scripts running
        AkelPad.ScriptNoMutex();

        //Message loop
        AkelPad.WindowGetMessage();
      }
      AkelPad.WindowUnregisterClass(pClassName);
    }
    else if (hWndDlg = oSys.Call("user32::FindWindowEx" + _TCHAR, 0, 0, pClassName, 0))
    {
      AkelPad.SendMessage(hWndDlg, 7 /*WM_SETFOCUS*/, 0, 0);
    }

    AkelPad.MemFree(lpBuffer);
  }
}

//////////////

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1)  //WM_CREATE
  {
    hGuiFont = oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);

    //Dialog caption
    AkelPad.MemCopy(lpBuffer, pTxtCaption, _TSTR);
    oSys.Call("user32::SetWindowText" + _TCHAR, hWnd, lpBuffer);

    //Create windows static memory XYZ Type
    for (ni = 0; ni < 3; ++ni)
    {
      AkelPad.MemCopy(lpBuffer, "STATIC", _TSTR);
      hWndXYZType[ni] = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                                  0,                 //dwExStyle
                                  lpBuffer,          //lpClassName
                                  0,                 //lpWindowName
                                  0x50000000,        //WS_VISIBLE|WS_CHILD
                                  3 +(30+144)*(ni%3),//x
                                  7,                 //y
                                  27,                //nWidth
                                  21,                //nHeight
                                  hWnd,              //hWndParent
                                  IDC_STATIC,        //ID
                                  hInstanceDLL,      //hInstance
                                  0);                //lpParam
      //Set font and text
      SetWindowFontAndText(hWndXYZType[ni], hGuiFont, ["X","Y","Z"][ni] + lpOutType[lpXYZType[ni]][0]);
    }

    //Create windows static memory XYZ
    for (ni = 0; ni < 3; ++ni)
    {
      AkelPad.MemCopy(lpBuffer, "STATIC", _TSTR);
      hWndXYZ[ni] = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                              0x200,             //WS_EX_CLIENTEDGE
                              lpBuffer,          //lpClassName
                              0,                 //lpWindowName
                              0x50000000,        //WS_VISIBLE|WS_CHILD
                              30+(140+34)*(ni%3),//x
                              5,                 //y
                              140,               //nWidth
                              21,                //nHeight
                              hWnd,              //hWndParent
                              IDC_STATIC,        //ID
                              hInstanceDLL,      //hInstance
                              0);                //lpParam
      //Set font and text
      SetWindowFontAndText(hWndXYZ[ni], hGuiFont, [x, y, z][ni]);
    }

    //Create window edit Output
    AkelPad.MemCopy(lpBuffer, "EDIT", _TSTR);
    hWndStrOut = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                           0x200,                  //WS_EX_CLIENTEDGE
                           lpBuffer,               //lpClassName
                           0,                      //lpWindowName
                           0x50010880,             //WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_AUTOHSCROLL|ES_READONLY
                           lpOutXYWH[nViewType][0],//x
                           lpOutXYWH[nViewType][1],//y
                           lpOutXYWH[nViewType][2],//nWidth
                           lpOutXYWH[nViewType][3],//nHeight
                           hWnd,                   //hWndParent
                           IDC_OUTPUT,             //ID
                           hInstanceDLL,           //hInstance
                           0);                     //lpParam
    //Set font and text
    SetWindowFontAndText(hWndStrOut, hGuiFont, pStrOut);

    //Create window combo Output type
    AkelPad.MemCopy(lpBuffer, "COMBOBOX", _TSTR);
    hWndOutType = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                            0,                          //dwExStyle
                            lpBuffer,                   //lpClassName
                            0,                          //lpWindowName
                            0x50010003,                 //WS_VISIBLE|WS_CHILD|WS_TABSTOP|CBS_DROPDOWNLIST
                            lpOutTypeXYWH[nViewType][0],//x
                            lpOutTypeXYWH[nViewType][1],//y
                            lpOutTypeXYWH[nViewType][2],//nWidth
                            lpOutTypeXYWH[nViewType][3],//nHeight
                            hWnd,                       //hWndParent
                            IDC_OUTTYPE,                //ID
                            hInstanceDLL,               //hInstance
                            0);                         //lpParam
    //Fill combobox
    for (ni = 0; ni < 4; ++ni)
    {
      AkelPad.MemCopy(lpBuffer, lpOutType[ni][0], _TSTR);
      AkelPad.SendMessage(hWndOutType, 0x143 /*CB_ADDSTRING*/, 0, lpBuffer);
    }
    //Set font and text
    SetWindowFontAndText(hWndOutType, hGuiFont, "");
    AkelPad.SendMessage(hWndOutType, 0x14E /*CB_SETCURSEL*/, nOutType, 0);

    //Create window combo Input
    AkelPad.MemCopy(lpBuffer, "COMBOBOX", _TSTR);
    hWndStrIn = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                             0,                     //dwExStyle
                             lpBuffer,              //lpClassName
                             0,                     //lpWindowName
                             0x50210042,            //WS_VISIBLE|WS_CHILD|WS_TABSTOP|WS_VSCROLL|CBS_DROPDOWN|CBS_AUTOHSCROLL
                             lpInXYWH[nViewType][0],//x
                             lpInXYWH[nViewType][1],//y
                             lpInXYWH[nViewType][2],//nWidth
                             lpInXYWH[nViewType][3],//nHeight
                             hWnd,                  //hWndParent
                             IDC_INPUT,             //ID
                             hInstanceDLL,          //hInstance
                             0);                    //lpParam
    //Fill combobox
    for (ni=0; ni < nStrsIn; ++ni)
    {
      AkelPad.MemCopy(lpBuffer, lpStrsIn[ni], _TSTR);
      AkelPad.SendMessage(hWndStrIn, 0x143 /*CB_ADDSTRING*/, 0, lpBuffer);
    }
    //Set font and text
    SetWindowFontAndText(hWndStrIn, hGuiFont, "");
    AkelPad.SendMessage(hWndStrIn, 0x14E /*CB_SETCURSEL*/, nNumStrIn, 0);

    //Create window buttons Action
    for (ni = 0; ni < nActs; ++ni)
    {
      AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
      lpActs[ni][WNDACT] = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                                     0,                 //dwExStyle
                                     lpBuffer,          //lpClassName
                                     0,                 //lpWindowName
                                     0x50010000,        //WS_VISIBLE|WS_CHILD|WS_TABSTOP
                                     3 +(75)*(ni%6),          //x
                                     83+(23)*Math.floor(ni/6),//y
                                     75,                //nWidth
                                     23,                //nHeight
                                     hWnd,              //hWndParent
                                     lpActs[ni][IDCACT],//ID
                                     hInstanceDLL,      //hInstance
                                     0);                //lpParam
      //Set font and text
      SetWindowFontAndText(lpActs[ni][WNDACT], hGuiFont, lpActs[ni][STRACT]);
    }

    //Create window button View
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    hWndView = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                         0,                       //dwExStyle
                         lpBuffer,                //lpClassName
                         0,                       //lpWindowName
                         0x50010000,              //WS_VISIBLE|WS_CHILD|WS_TABSTOP
                         lpViewXYWH[nViewType][0],//x
                         lpViewXYWH[nViewType][0],//y
                         lpViewXYWH[nViewType][0],//nWidth
                         lpViewXYWH[nViewType][0],//nHeight
                         hWnd,                    //hWndParent
                         IDC_VIEW,                //ID
                         hInstanceDLL,            //hInstance
                         0);                      //lpParam
    //Set font and text
    SetWindowFontAndText(hWndView, hGuiFont, pTxtView);

    //Create window buttons Functions
    for (ni = 0; ni < nFuncs; ++ni)
    {
      AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
      lpFuncs[ni][WNDFUN] = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                                      0,                  //dwExStyle
                                      lpBuffer,           //lpClassName
                                      0,                  //lpWindowName
                                      0x50010000,         //WS_VISIBLE|WS_CHILD|WS_TABSTOP
                                      3 +(55)*(ni%5),           //x
                                      136+(23)*Math.floor(ni/5),//y
                                      55,                 //nWidth
                                      23,                 //nHeight
                                      hWnd,               //hWndParent
                                      lpFuncs[ni][IDCFUN],//ID
                                      hInstanceDLL,       //hInstance
                                      0);                 //lpParam
      //Set font and text
      SetWindowFontAndText(lpFuncs[ni][WNDFUN], hGuiFont, lpFuncs[ni][BUTFUN]);
    }

    //Create window buttons Operators
    for (ni = 0; ni < nOpers; ++ni)
    {
      AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
      lpOpers[ni][WNDOPE] = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                                      0,                  //dwExStyle
                                      lpBuffer,           //lpClassName
                                      0,                  //lpWindowName
                                      0x50010000,         //WS_VISIBLE|WS_CHILD|WS_TABSTOP
                                      288 +(30)*(ni%4),         //x
                                      136+(23)*Math.floor(ni/4),//y
                                      30,                 //nWidth
                                      23,                 //nHeight
                                      hWnd,               //hWndParent
                                      lpOpers[ni][IDCOPE],//ID
                                      hInstanceDLL,       //hInstance
                                      0);                 //lpParam
      //Set font and text
      SetWindowFontAndText(lpOpers[ni][WNDOPE], hGuiFont, lpOpers[ni][BUTOPE]);
    }

    //Create window buttons Constant
    for (ni = 0; ni < nCons; ++ni)
    {
      AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
      lpCons[ni][WNDCON] = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                                     0,                 //dwExStyle
                                     lpBuffer,          //lpClassName
                                     0,                 //lpWindowName
                                     0x50010000,        //WS_VISIBLE|WS_CHILD|WS_TABSTOP
                                     418 +(25)*(ni%4),         //x
                                     136+(23)*Math.floor(ni/4),//y
                                     25,                //nWidth
                                     23,                //nHeight
                                     hWnd,              //hWndParent
                                     lpCons[ni][IDCCON],//ID
                                     hInstanceDLL,      //hInstance
                                     0);                //lpParam
      //Set font and text
      SetWindowFontAndText(lpCons[ni][WNDCON], hGuiFont, lpCons[ni][STRCON]);
    }

    EnableDisableWnds();

    //Center dialog
//    CenterWindow(hMainWnd, hWnd);

    hFocus = hWndStrIn;
  }

  else if ((uMsg == 6 /*WM_ACTIVATE*/) && (! wParam))
    hFocus = oSys.Call("user32::GetFocus");

  else if (uMsg == 7)  //WM_SETFOCUS
    oSys.Call("user32::SetFocus", hFocus);

  else if (uMsg == 256)  //WM_KEYDOWN
  {
    if ((wParam == 27 /*VK_ESCAPE*/) && (bCloseCB1) && (bCloseCB2))
      oSys.Call("user32::PostMessage" + _TCHAR, hWndDlg, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 273)  //WM_COMMAND
  {
    nLowParam = LoWord(wParam);
    nHiwParam = HiWord(wParam);
    bCloseCB1 = 1;

    if (nLowParam == IDC_INPUT)
    {
      if (nHiwParam == 3 /*CBN_SETFOCUS*/)
      {
        SetWindowFontAndText(hWndStrIn, hGuiFont, pStrIn);
        AkelPad.SendMessage(hWndStrIn, 0x0142 /*CB_SETEDITSEL*/, 0, MkLong(nBegSelIn, nEndSelIn));
      }
      else if (nHiwParam == 10 /*CBN_SELENDCANCEL*/)
      {
        nBegSelIn = LoWord(AkelPad.SendMessage(hWndStrIn, 0x140 /*CB_GETEDITSEL*/, 0, 0));
        nEndSelIn = HiWord(AkelPad.SendMessage(hWndStrIn, 0x140 /*CB_GETEDITSEL*/, 0, 0));
      }
      else if (nHiwParam == 5 /*CBN_EDITCHANGE*/)
      {
        nBegSelIn = LoWord(AkelPad.SendMessage(hWndStrIn, 0x140 /*CB_GETEDITSEL*/, 0, 0));
        nEndSelIn = HiWord(AkelPad.SendMessage(hWndStrIn, 0x140 /*CB_GETEDITSEL*/, 0, 0));
        oSys.Call("user32::GetWindowText" + _TCHAR, hWndStrIn, lpBuffer, nMaxLen);
        pStrIn = AkelPad.MemRead(lpBuffer, _TSTR);
      }
      else if (nHiwParam == 1 /*CBN_SELCHANGE*/)
      {
        nNumStrIn = AkelPad.SendMessage(hWndStrIn, 0x147 /*CB_GETCURSEL*/, 0, 0)
        AkelPad.SendMessage(hWndStrIn, 0x148 /*CB_GETLBTEXT*/, nNumStrIn, lpBuffer)
        pStrIn = AkelPad.MemRead(lpBuffer, _TSTR);
      }
      else if (nHiwParam == 7 /*CBN_DROPDOWN*/)
        bCloseCB2 = 0;
      else if (nHiwParam == 8 /*CBN_CLOSEUP*/)
        bCloseCB2 = 1;

      pStrOut = Calculate(pStrIn);
      SetWindowFontAndText(hWndStrOut, hGuiFont, pStrOut);
    }

    else if (nLowParam == IDC_OUTTYPE)
    {
      if (nHiwParam == 1 /*CBN_SELCHANGE*/)
      {
        nOutType = AkelPad.SendMessage(hWndOutType, 0x147 /*CB_GETCURSEL*/, 0, 0);
        pStrOut  = Calculate(pStrIn);
        SetWindowFontAndText(hWndStrOut, hGuiFont, pStrOut);
      }
      else if (nHiwParam == 8 /*CBN_CLOSEUP*/)
        bCloseCB1 = 0;
    }

    else if ((nLowParam >= lpActs[0][IDCACT]) && (nLowParam <= lpActs[nActs - 1][IDCACT]))
    {
      eval(lpActs[nLowParam - nBegAct][FUNACT]);
      oSys.Call("user32::SetFocus", hWndStrIn);
    }

    else if ((nLowParam >= lpFuncs[0][IDCFUN]) && (nLowParam <= lpFuncs[nFuncs - 1][IDCFUN]))
      FunToIn(lpFuncs[nLowParam - nBegFun][STRFUN]);

    else if ((nLowParam >= lpOpers[0][IDCOPE]) && (nLowParam <= lpOpers[nOpers - 1][IDCOPE]))
      FunToIn(lpOpers[nLowParam - nBegOpe][STROPE]);

    else if ((nLowParam >= lpCons[0][IDCCON]) && (nLowParam <= lpCons[nCons - 1][IDCCON]))
      FunToIn(lpCons[nLowParam - nBegCon][STRCON]);

    else if (nLowParam == IDC_VIEW)
    {
      if (nViewType == 2)
        nViewType = 1;
      else if (nViewType == 1)
        nViewType = 0;
      else
        nViewType = 2;

      EnableDisableWnds();
    }
  }

  else if (uMsg == 16)  //WM_CLOSE
  {
    WriteParams();
    //Enable main window
    oSys.Call("user32::EnableWindow", hMainWnd, true);

    //Destroy dialog
    oSys.Call("user32::DestroyWindow", hWnd);
  }

  else if (uMsg == 2)  //WM_DESTROY
  {
    //Exit message loop
    oSys.Call("user32::PostQuitMessage", 0);
  }

  return 0;
}


function ReadParams()
{
  for (ni=0; ni < nStrsIn; ++ni)
    lpStrsIn[ni] = "";

  try
  {
    x         = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\x");
    X         = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\x");
    y         = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\y");
    Y         = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\y");
    z         = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\z");
    Z         = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\z");
    nOutType  = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\OutType");
    pStrIn    = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\StrIn");
    nNumStrIn = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\NumStrIn");
    nBegSelIn = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\BegSelIn");
    nEndSelIn = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\EndSelIn");
    nViewType = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\ViewType");

    lpDlgXYWH[0][0] = lpDlgXYWH[1][0] = lpDlgXYWH[2][0] = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\PosX");
    lpDlgXYWH[0][1] = lpDlgXYWH[1][1] = lpDlgXYWH[2][1] = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\PosY");

    for (ni=0; ni < 3; ++ni)
      lpXYZType[ni] = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\XYZType" + ni);

    for (ni=0; ni < nStrsIn; ++ni)
      lpStrsIn[ni] = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\Text" + ni);
  }
  catch (nError)
  {
  }

  if (nBegSel == nEndSel)
  {
    if (pStrIn.length == 0)
      pStrIn = lpStrsIn[nNumStrIn];
  }
  else
    pStrIn = AkelPad.GetSelText(1 /*\r*/).substring(0, nMaxLen).replace(/\r/g, " ");

  return;
}

function WriteParams()
{
  var lpRect = AkelPad.MemAlloc(16) //sizeof(RECT);

  oSys.Call("user32::GetWindowRect", hWndDlg, lpRect);

  lpDlgXYWH[0][0] = AkelPad.MemRead(lpRect,     3 /*DT_DWORD*/);
  lpDlgXYWH[0][1] = AkelPad.MemRead(lpRect + 4, 3 /*DT_DWORD*/);

  AkelPad.MemFree(lpRect);

  try
  {
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\x", x, "REG_SZ");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\y", y, "REG_SZ");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\z", z, "REG_SZ");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\OutType", nOutType, "REG_DWORD");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\StrIn", pStrIn, "REG_SZ");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\NumStrIn", nNumStrIn, "REG_DWORD");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\BegSelIn", nBegSelIn, "REG_DWORD");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\EndSelIn", nEndSelIn, "REG_DWORD");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\ViewType", nViewType, "REG_DWORD");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\PosX", lpDlgXYWH[0][0], "REG_DWORD");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\PosY", lpDlgXYWH[0][1], "REG_DWORD");

    for (ni=0; ni < 3; ++ni)
      WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\XYZType" + ni, lpXYZType[ni], "REG_DWORD");

    for (ni=0; ni < nStrsIn; ++ni)
      WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\Text" + ni, lpStrsIn[ni], "REG_SZ");
  }
  catch (nError)
  {
  }
  return;
}

function SetWindowFontAndText(hWnd, hFont, pText)
{
  var lpWindowText;

  AkelPad.SendMessage(hWnd, 48 /*WM_SETFONT*/, hFont, true);

  if (lpWindowText=AkelPad.MemAlloc(nMaxLen * _TSIZE))
  {
    AkelPad.MemCopy(lpWindowText, pText.substring(0, nMaxLen), _TSTR);
    oSys.Call("user32::SetWindowText" + _TCHAR, hWnd, lpWindowText);

    AkelPad.MemFree(lpWindowText);
  }
}

function EnableDisableWnds()
{
  var ni;

  if (nViewType == 2)
  {
    for (ni=0; ni < nFuncs; ++ni)
      oSys.Call("user32::EnableWindow", lpFuncs[ni][WNDFUN], true);
    for (ni=0; ni < nOpers; ++ni)
      oSys.Call("user32::EnableWindow", lpOpers[ni][WNDOPE], true);
    for (ni=0; ni < nCons; ++ni)
      oSys.Call("user32::EnableWindow", lpCons[ni][WNDCON], true);
    for (ni=0; ni < nActs; ++ni)
      oSys.Call("user32::EnableWindow", lpActs[ni][WNDACT], true);
    for (ni=0; ni < 3; ++ni)
      oSys.Call("user32::EnableWindow", hWndXYZType[ni], true);
    for (ni=0; ni < 3; ++ni)
      oSys.Call("user32::EnableWindow", hWndXYZ[ni], true);
  }
  else
  {
    for (ni=0; ni < nFuncs; ++ni)
      oSys.Call("user32::EnableWindow", lpFuncs[ni][WNDFUN], false);
    for (ni=0; ni < nOpers; ++ni)
      oSys.Call("user32::EnableWindow", lpOpers[ni][WNDOPE], false);
    for (ni=0; ni < nCons; ++ni)
      oSys.Call("user32::EnableWindow", lpCons[ni][WNDCON], false);

    if (nViewType == 0)
    {
      for (ni=0; ni < nActs; ++ni)
        oSys.Call("user32::EnableWindow", lpActs[ni][WNDACT], false);
      for (ni=0; ni < 3; ++ni)
        oSys.Call("user32::EnableWindow", hWndXYZType[ni], false);
      for (ni=0; ni < 3; ++ni)
        oSys.Call("user32::EnableWindow", hWndXYZ[ni], false);
    }
  }

  SizeWnd(hWndDlg,  lpDlgXYWH[nViewType][2],  lpDlgXYWH[nViewType][3]);
  SizeWnd(hWndView, lpViewXYWH[nViewType][2], lpViewXYWH[nViewType][3]);

  MoveWnd(hWndStrOut,  lpOutXYWH[nViewType][0],     lpOutXYWH[nViewType][1]);
  MoveWnd(hWndOutType, lpOutTypeXYWH[nViewType][0], lpOutTypeXYWH[nViewType][1]);
  MoveWnd(hWndStrIn,   lpInXYWH[nViewType][0],      lpInXYWH[nViewType][1]);
  MoveWnd(hWndView,    lpViewXYWH[nViewType][0],    lpViewXYWH[nViewType][1]);

  oSys.Call("user32::SetFocus", hWndStrIn);
}

function SizeWnd(hWnd, nW, nH)
{
  oSys.Call("user32::SetWindowPos", hWnd, 0, 0, 0, nW, nH, 0x16 /*SWP_NOZORDER|SWP_NOACTIVATE/SWP_NOMOVE*/);
}

function MoveWnd(hWnd, nX, nY)
{
  oSys.Call("user32::SetWindowPos", hWnd, 0, nX, nY, 0, 0, 0x15 /*SWP_NOZORDER|SWP_NOACTIVATE/SWP_NOSIZE*/);
}

function InsertInArray(lpArray, lpItem, nPos)
{
  var i;

  if (nPos < 0) nPos=lpArray.length + nPos + 1;
  if (nPos < 0) nPos=0;
  if (nPos > lpArray.length) nPos=lpArray.length;

  for (i=lpArray.length; i >= 0; --i)
  {
    if (i == nPos)
    {
      lpArray[i]=lpItem;
      break;
    }
    lpArray[i]=lpArray[i - 1];
  }
}

function DeleteFromArray(lpArray, nPos, nCount)
{
  var i;

  if (nPos < 0) nPos=lpArray.length + nPos;
  if (nPos < 0 || nPos >= lpArray.length) return;
  if (nPos + nCount >= lpArray.length) nCount=lpArray.length - nPos;

  for (i=nPos; i + nCount < lpArray.length; ++i)
  {
    lpArray[i]=lpArray[i + nCount];
  }
  lpArray.length-=nCount;
}

function LoWord(nParam)
{
  return (nParam & 0xffff);
}

function HiWord(nParam)
{
  return ((nParam >> 16) & 0xffff);
}

function MkLong(nLoWord, nHiWord)
{
  return (nHiWord << 16) | (nLoWord & 0xffff);
}

function OutToXYZ(nXYZ)
{
  if (nXYZ == 0)
  {
    x = pStrOut;
    X = x;
  }
  else if (nXYZ == 1)
  {
    y = pStrOut;
    Y = z;
  }
  else
  {
    z = pStrOut;
    Z = z;
  }

  lpXYZType[nXYZ] = nOutType;
  SetWindowFontAndText(hWndXYZType[nXYZ], hGuiFont, ["X","Y","Z"][nXYZ] + lpOutType[nOutType][0]);
  SetWindowFontAndText(hWndXYZ[nXYZ], hGuiFont, [x, y, z][nXYZ]);
}

function XYZToIn(nXYZ)
{
  pStrIn    = pStrIn.substr(0, nBegSelIn) + [x, y, z][nXYZ] + pStrIn.substr(nEndSelIn);
  nBegSelIn = nBegSelIn + [x, y, z][nXYZ].length;
  nEndSelIn = nBegSelIn;
}

function CopyOut()
{
  AkelPad.SetClipboardText(pStrOut);
}

function OutToIn()
{
  pStrIn    = pStrIn.substr(0, nBegSelIn) + pStrOut + pStrIn.substr(nEndSelIn);
  nBegSelIn = nBegSelIn + pStrOut.length;
  nEndSelIn = nBegSelIn;
}

function CopyIn()
{
  AkelPad.SetClipboardText(pStrIn);
}

function ClearIn()
{
  pStrIn = "";
}

function InToHist()
{
  oSys.Call("user32::GetWindowText" + _TCHAR, hWndStrIn, lpBuffer, nMaxLen);
  pStrIn = AkelPad.MemRead(lpBuffer, _TSTR);
  for (ni=0; ni < nStrsIn; ++ni)
  {
    if (lpStrsIn[ni] == pStrIn)
    {
      AkelPad.SendMessage(hWndStrIn, 0x144 /*CB_DELETESTRING*/, ni, 0);
      DeleteFromArray(lpStrsIn, ni, 1);
    }
  }
  InsertInArray(lpStrsIn, pStrIn, 0);
  if (lpStrsIn.length > nStrsIn)
    DeleteFromArray(lpStrsIn, -1, 1);
  AkelPad.MemCopy(lpBuffer, pStrIn, _TSTR);
  AkelPad.SendMessage(hWndStrIn, 0x14A /*CB_INSERTSTRING*/, 0, lpBuffer);
  AkelPad.SendMessage(hWndStrIn, 0x14E /*CB_SETCURSEL*/, 0, 0);
}

function ClearHist()
{
  try
  {
    WshShell.RegDelete("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\Calculator\\");
  }
  catch (nError)
  {
  }

  for (ni=0; ni < nStrsIn; ++ni)
  {
    lpStrsIn[ni] = "";
    AkelPad.MemCopy(lpBuffer, lpStrsIn[ni], _TSTR);
    AkelPad.SendMessage(hWndStrIn, 0x144 /*CB_DELETESTRING*/, ni, 0);
    AkelPad.SendMessage(hWndStrIn, 0x14A /*CB_INSERTSTRING*/, 0, lpBuffer);
  }
}

function FunToIn(pTxt)
{
  if (pTxt.indexOf("(...)") > -1)
  {
    pTxt   = pTxt.replace("...", pStrIn.substring(nBegSelIn, nEndSelIn));
    pStrIn = pStrIn.substr(0, nBegSelIn) + pTxt + pStrIn.substr(nEndSelIn);
    if (nBegSelIn == nEndSelIn)
    {
      nBegSelIn = nBegSelIn + pTxt.length - 1;
      nEndSelIn = nBegSelIn;
    }
    else
    {
      nBegSelIn = nBegSelIn + pTxt.indexOf("(") + 1;
      nEndSelIn = nEndSelIn + pTxt.indexOf("(") + 1;
    }
  }
  else if (pTxt.indexOf("(") > -1)
  {
    pStrIn = pStrIn.substr(0, nBegSelIn) + pTxt + pStrIn.substr(nEndSelIn);
    nBegSelIn = nBegSelIn + pTxt.indexOf("(") + 1;
    nEndSelIn = nBegSelIn;
  }
  else
  {
    pStrIn = pStrIn.substr(0, nBegSelIn) + pTxt + pStrIn.substr(nEndSelIn);
    nBegSelIn = nBegSelIn + pTxt.length;
    nEndSelIn = nBegSelIn;
  }

  oSys.Call("user32::SetFocus", hWndStrIn);
}


function Calculate(pTxt)
{
  var pSign   = "";
  var pResult = "";
  var nResult;

  if (pTxt != "")
  {
    try
    {
      with (Math)
      {
        nResult = eval(pTxt);
        if (nResult < 0)
        {
          nResult = abs(nResult);
          pSign   = "-";
        }
        pResult = nResult.toString(lpOutType[nOutType][1]);
        if (nOutType == 0)
          pResult = "0x" + pResult.toUpperCase()
        else if (nOutType == 2)
          pResult = "0" + pResult

        pResult = pSign + pResult;
      }
    }
    catch (nError)
    {
      pResult = nError.description;
    }
  }

  return pResult;
}


///////////////////// Here you can define your own functions
function average()
{
  var nArgs = average.arguments.length;
  var nSum  = 0;
  var ni;

  for (ni = 0; ni < nArgs; ++ni)
    nSum += average.arguments[ni];

  return (nSum/nArgs);
}

function cot(nNum)
{
  return 1 / Math.tan(nNum);
}

function acot(nNum)
{
  return Math.PI / 2 - Math.atan(nNum);
}

function integer(nNum)
{
  return parseInt(nNum);
}

function round2(nNum, nDec)
{
  return Math.round(nNum * Math.pow(10, nDec))/Math.pow(10, nDec);
}

function bin2dec(nNum)
{
  var nBeg = 0;
  var ni;

  if (nNum < 0)
    nBeg = 1;

  for (ni = nBeg; ni < nNum.toString().length; ++ni)
  {
     if ((nNum.toString().charAt(ni) != "0") && (nNum.toString().charAt(ni) != "1"))
        return NaN;
  }
  return parseInt(nNum, 2);
}

function root(nNum, nDeg)
{
  return Math.pow(nNum, 1 / nDeg);
}

function lg(nNum, nBase)
{
  if (nBase == 2)
    return Math.LOG2E * Math.log(nNum);
 
  if (nBase == 10)
    return Math.LOG10E * Math.log(nNum);
 
  return Math.log(nNum) / Math.log(nBase);
}

function factorial(nNum)
{
  var nResult = 1;
  var ni;

  if (nNum < 0)
    return NaN;

  for (ni = 1; ni <= nNum; ++ni)
    nResult *= ni;

  return nResult;
}
