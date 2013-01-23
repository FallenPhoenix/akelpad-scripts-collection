// FindReplaceEx.js - ver. 2013-01-23
//
// "Find/Replace" dialog extended version
//
// Required to include: InputBox_function.js
//
// Usage:
// Call("Scripts::Main", 1, "FindReplaceEx.js")             - "Find" dialog
// Call("Scripts::Main", 1, "FindReplaceEx.js", '-Dlg="R"') - "Replace" dialog
// Call("Scripts::Main", 1, "FindReplaceEx.js", '-Dlg="R" -FR="M+R+S" -RDB="A"')
// - "Replace" dialog, select "Match case" and "Regular expressions",
//   direction "In selection", set default push button to "Replace all",
//
// Arguments:
//   -Dlg - dialog type that is displayed when you run the script:
//     "F" - "Find" (default)
//     "R" - "Replace"
//     "G" - "Go to"
//   -FR - set "Find/Replace" initial parameters:
//     "M+" - select "Match case"
//     "M-" - unselect "Match case"
//     "W+" - select "Whole word"
//     "W-" - unselect "Whole word"
//     "R+" - select "Regular expressions"
//     "R-" - unselect "Regular expressions"
//     "E+" - select "Esc-sequences"
//     "E-" - unselect "Esc-sequences"
//     "D"  - "Down" (direction)
//     "U"  - "Up"
//     "B"  - "Begining"
//     "S"  - "In selection"
//     "A"  - "All files"
//   -RDB - change default push button in "Replace" dialog:
//     "R" - "Replace"
//     "A" - "Replace all"
//   -GT - set "Go to" initial parameter:
//     "L" - "Line:Column"
//     "O" - "Offset"
//
// If you don't want switching "Find/Replace" <-> "Go to", set manually in FindReplaceEx.ini:
// bGoToDlg=false;
//
// In "Find/Replace" dialog:
// F1 - Regular expressions collection
//
// Regular expressions collection is saved in file FindReplaceEx_REC.tsv
//
// Keys and mouse in "Regular expressions collection" dialog:
// Ins       - New
// Ctrl+Ins,
// Shift+Ins - Add form "Find/Replace" dialog
// F2, F4    - Edit
// Del       - Delete
// Enter,
// DblClick  - OK, put to "Find/Replace" dialog

if (! (AkelPad.GetEditWnd() && AkelPad.Include("InputBox_function.js")))
  WScript.Quit();

var DT_UNICODE = 1;
var DT_DWORD   = 3;
var DT_WORD    = 4;

var MLT_FIND    = 3;
var MLT_REPLACE = 4;
var MLT_GOTO    = 5;

var IDCANCEL                  = 2;
var IDC_SEARCH_FIND           = 3052; //Combobox What
var IDC_SEARCH_REPLACE        = 3053; //Combobox With
var IDC_SEARCH_MATCHCASE      = 3054;
var IDC_SEARCH_WHOLEWORD      = 3055;
var IDC_SEARCH_ESCAPESEQ      = 3056;
var IDC_SEARCH_REGEXP         = 3057;
var IDC_SEARCH_BACKWARD       = 3059;
var IDC_SEARCH_FORWARD        = 3060;
var IDC_SEARCH_BEGINNING      = 3061;
var IDC_SEARCH_INSEL          = 3062;
var IDC_SEARCH_ALLFILES       = 3064;
var IDC_SEARCH_REPLACE_BUTTON = 3066;
var IDC_SEARCH_ALL_BUTTON     = 3067;
var IDC_GOTO_LINE             = 3102;
var IDC_GOTO_OFFSET           = 3103;

var IDNAMELV = 9900;
var IDWHATS  = 9901;
var IDWHATE  = 9902;
var IDWITHS  = 9903;
var IDWITHE  = 9904;
var IDNEWB   = 9905;
var IDADDB   = 9906;
var IDEDITB  = 9907;
var IDDELB   = 9908;
var IDOKB    = 9909;
var IDCLOSEB = 9910;

var IDREGEXPL  = 9996;
var IDFINDL    = 9997;
var IDREPLACEL = 9998;
var IDGOTOL    = 9999;

var oFSO         = new ActiveXObject("Scripting.FileSystemObject");
var oSys         = AkelPad.SystemFunction();
var hInstanceDLL = AkelPad.GetInstanceDll();
var hMainWnd     = AkelPad.GetMainWnd();
var hGuiFont     = oSys.Call("Gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
var sClassName   = "AkelPad::Scripts::" + WScript.ScriptName + "::" + oSys.Call("kernel32::GetCurrentProcessId");
var nBufSize     = 1024;
var lpBuffer     = AkelPad.MemAlloc(nBufSize);
var lpLVITEM     = AkelPad.MemAlloc(15 * 4); //sizeof(LVITEM)
var aWnd         = [];
var aLink        = [];
var bContinue    = true;
var bFirstTimeFR = true;
var bFirstTimeGT = true;
var bChangeREC   = false;
var nDlgType;
var nMatchC;
var nWholeW;
var nRegExp;
var nEscSeq;
var nDirection;
var nGoTo;
var sDefBut;
var hWndREC;
var hWndDlg;
var hWndWhatE;
var hWndWithE;
var hWndCancel;
var hWndFocus;
var hSubClass;
var sWhatText;
var sWithText;
var i;

//ini settings
var bGoToDlg = true;
var nRECW    = 300;
var nRECH    = 195;
var nRECSel  = 0;
var nDlgX;
var nDlgY;

ReadIni();

AkelPad.MemCopy(lpLVITEM, 0x0001 /*LVIF_TEXT*/, DT_DWORD);
AkelPad.MemCopy(lpLVITEM + 20, lpBuffer, DT_DWORD);
AkelPad.MemCopy(lpLVITEM + 24, nBufSize, DT_DWORD);

//0x50000000 - WS_VISIBLE|WS_CHILD
//0x50010000 - WS_VISIBLE|WS_CHILD|WS_TABSTOP
//0x50800800 - WS_VISIBLE|WS_CHILD|WS_BORDER|ES_READONLY
//0x5081801D - WS_VISIBLE|WS_CHILD|WS_BORDER|WS_TABSTOP|LVS_NOSORTHEADER|LVS_SORTASCENDING|LVS_SHOWSELALWAYS|LVS_SINGLESEL|LVS_REPORT
aWnd[IDNAMELV] = {Class: "SysListView32", Style: 0x5081801D, Text: ""};
aWnd[IDWHATS]  = {Class: "STATIC",        Style: 0x50000000, Text: sTxtFindWhat + ":"};
aWnd[IDWHATE]  = {Class: "AkelEditW",     Style: 0x50800800, Text: ""};
aWnd[IDWITHS]  = {Class: "STATIC",        Style: 0x50000000, Text: sTxtReplaceWith + ":"};
aWnd[IDWITHE]  = {Class: "AkelEditW",     Style: 0x50800800, Text: ""};
aWnd[IDNEWB]   = {Class: "BUTTON",        Style: 0x50010000, Text: sTxtNew};
aWnd[IDADDB]   = {Class: "BUTTON",        Style: 0x50010000, Text: sTxtAdd};
aWnd[IDEDITB]  = {Class: "BUTTON",        Style: 0x50010000, Text: sTxtEdit};
aWnd[IDDELB]   = {Class: "BUTTON",        Style: 0x50010000, Text: sTxtDelete};
aWnd[IDOKB]    = {Class: "BUTTON",        Style: 0x50010000, Text: sTxtOK};
aWnd[IDCLOSEB] = {Class: "BUTTON",        Style: 0x50010000, Text: sTxtClose};

aLink[IDREGEXPL]  = {Text: "»"};
aLink[IDFINDL]    = {Text: "(Ctrl+F)", DlgID: 2004 /*IDD_FIND*/};
aLink[IDREPLACEL] = {Text: "(Ctrl+R)", DlgID: 2005 /*IDD_REPLACE*/};
aLink[IDGOTOL]    = {Text: "(Ctrl+G)", DlgID: 2006 /*IDD_GOTO*/};

GetDialogWnd();
if (hWndDlg && hWndCancel)
  AkelPad.SendMessage(hWndDlg, 273 /*WM_COMMAND*/, IDCANCEL, hWndCancel);

GetArguments();
GetLinkText();

AkelPad.ScriptNoMutex();
AkelPad.WindowRegisterClass(sClassName);

while (bContinue)
{
  bContinue = false;

  if (nDlgType == MLT_FIND)
    AkelPad.Command(4158 /*IDM_EDIT_FIND*/);
  else if (nDlgType == MLT_REPLACE)
    AkelPad.Command(4161 /*IDM_EDIT_REPLACE*/);
  else
    AkelPad.Command(4162 /*IDM_EDIT_GOTO*/);

  GetDialogWnd();

  if (! (hWndDlg && hWndCancel))
    break;

  if ((typeof nDlgX == "number") && (typeof nDlgY == "number"))
    oSys.Call("User32::SetWindowPos", hWndDlg, 0, nDlgX, nDlgY, 0, 0, 0x0415 /*SWP_NOSENDCHANGING|SWP_NOACTIVATE|SWP_NOZORDER|SWP_NOSIZE*/);

  if (nDlgType == MLT_GOTO)
  {
    if (bFirstTimeGT)
    {
      bFirstTimeGT = false;

      if (nGoTo >= 0)
      {
        AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hWndDlg, IDC_GOTO_LINE),   0x00F1 /*BM_SETCHECK*/, 0, 0);
        AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hWndDlg, IDC_GOTO_OFFSET), 0x00F1 /*BM_SETCHECK*/, 0, 0);
        AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hWndDlg, nGoTo),           0x00F1 /*BM_SETCHECK*/, 1, 0);
        AkelPad.SendMessage(hWndDlg, 273 /*WM_COMMAND*/, nGoTo, oSys.Call("User32::GetDlgItem", hWndDlg, nGoTo));
      }
    }

    if (bGoToDlg)
      ResizeDialog();
  }
  else
  {
    if (typeof sWhatText == "string")
    {
      oSys.Call("User32::SetWindowTextW", hWndWhatE, sWhatText);
      AkelPad.SendMessage(hWndWhatE, 0x00B1 /*EM_SETSEL*/, 0, -1);
    }

    if (bFirstTimeFR)
    {
      bFirstTimeFR = false;

      if (nMatchC >= 0)
      {
        AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hWndDlg, IDC_SEARCH_MATCHCASE), 0x00F1 /*BM_SETCHECK*/, nMatchC, 0);
        AkelPad.SendMessage(hWndDlg, 273 /*WM_COMMAND*/, IDC_SEARCH_MATCHCASE, oSys.Call("User32::GetDlgItem", hWndDlg, IDC_SEARCH_MATCHCASE));
      }
      if (nWholeW >= 0)
      {
        AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hWndDlg, IDC_SEARCH_WHOLEWORD), 0x00F1 /*BM_SETCHECK*/, nWholeW, 0);
        AkelPad.SendMessage(hWndDlg, 273 /*WM_COMMAND*/, IDC_SEARCH_WHOLEWORD, oSys.Call("User32::GetDlgItem", hWndDlg, IDC_SEARCH_WHOLEWORD));
      }
      if (nRegExp >= 0)
      {
        AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hWndDlg, IDC_SEARCH_REGEXP), 0x00F1 /*BM_SETCHECK*/, nRegExp, 0);
        AkelPad.SendMessage(hWndDlg, 273 /*WM_COMMAND*/, IDC_SEARCH_REGEXP, oSys.Call("User32::GetDlgItem", hWndDlg, IDC_SEARCH_REGEXP));
      }
      if (nEscSeq >= 0)
      {
        AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hWndDlg, IDC_SEARCH_ESCAPESEQ), 0x00F1 /*BM_SETCHECK*/, nEscSeq, 0);
        AkelPad.SendMessage(hWndDlg, 273 /*WM_COMMAND*/, IDC_SEARCH_ESCAPESEQ, oSys.Call("User32::GetDlgItem", hWndDlg, IDC_SEARCH_ESCAPESEQ));
      }
      if (nDirection >= 0)
      {
        AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hWndDlg, IDC_SEARCH_BACKWARD),  0x00F1 /*BM_SETCHECK*/, 0, 0);
        AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hWndDlg, IDC_SEARCH_FORWARD),   0x00F1 /*BM_SETCHECK*/, 0, 0);
        AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hWndDlg, IDC_SEARCH_BEGINNING), 0x00F1 /*BM_SETCHECK*/, 0, 0);
        AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hWndDlg, IDC_SEARCH_INSEL),     0x00F1 /*BM_SETCHECK*/, 0, 0);
        AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hWndDlg, IDC_SEARCH_ALLFILES),  0x00F1 /*BM_SETCHECK*/, 0, 0);
        AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hWndDlg, nDirection),           0x00F1 /*BM_SETCHECK*/, 1, 0);
        AkelPad.SendMessage(hWndDlg, 273 /*WM_COMMAND*/, nDirection, oSys.Call("User32::GetDlgItem", hWndDlg, nDirection));
      }
    }

    if (nDlgType == MLT_REPLACE)
    {
      if (typeof sWithText == "string")
        oSys.Call("User32::SetWindowTextW", hWndWithE, sWithText);

      if (sDefBut)
        AkelPad.SendMessage(hWndDlg, 0x0401 /*DM_SETDEFID*/, (sDefBut == "R") ? IDC_SEARCH_REPLACE_BUTTON : IDC_SEARCH_ALL_BUTTON, 0);
    }
  }

  GetLinkWidth();
  GetLinkPos();

  for (i = IDREGEXPL; i <= IDGOTOL; ++i)
  {
    if (aLink[i].Visible)
      AkelPad.SendMessage(
        oSys.Call("User32::CreateWindowExW",
                  0,               //dwExStyle
                  "SysLink",       //lpClassName
                  "<a>" + aLink[i].Text + "</a>", //lpWindowName
                  0x50000000,      //dwStyle=WS_VISIBLE|WS_CHILD
                  aLink[i].X,      //x
                  aLink[i].Y,      //y
                  aLink[i].W,      //nWidth
                  13,              //nHeight
                  hWndDlg,         //hWndParent
                  i,               //ID
                  hInstanceDLL,    //hInstance
                  0),              //lpParam
        48 /*WM_SETFONT*/, hGuiFont, true);
  }

  oSys.Call("User32::UpdateWindow", hWndDlg);

  hSubClass = AkelPad.WindowSubClass(hWndDlg, DialogCallback, 78 /*WM_NOTIFY*/, 256 /*WM_KEYDOWN*/, 2 /*WM_DESTROY*/);

  AkelPad.WindowGetMessage();
  AkelPad.WindowUnsubClass(hWndDlg);
}

WriteIni();
AkelPad.WindowUnregisterClass(sClassName);
AkelPad.MemFree(lpBuffer);
AkelPad.MemFree(lpLVITEM);

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 78) //WM_NOTIFY
  {
    if (AkelPad.MemRead(lParam + 8, DT_DWORD) == -2 /*NM_CLICK*/)
    {
      if (wParam == IDREGEXPL)
      {
        oSys.Call("User32::SetFocus", hWndWhatE);
        RegExpCollection();
      }
      else if (wParam == IDFINDL)
        SwitchDialog(MLT_FIND);
      else if (wParam == IDREPLACEL)
        SwitchDialog(MLT_REPLACE);
      else if (wParam == IDGOTOL)
        SwitchDialog(MLT_GOTO);
    }
  }
  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (! Shift())
    {
      if (Ctrl())
      {
        if ((wParam == 0x46 /*F key*/) && ((nDlgType == MLT_REPLACE) || ((nDlgType == MLT_GOTO) && bGoToDlg)))
          SwitchDialog(MLT_FIND);
        else if ((wParam == 0x52 /*R key*/) && ((nDlgType == MLT_FIND) || ((nDlgType == MLT_GOTO) && bGoToDlg)))
          SwitchDialog(MLT_REPLACE);
        else if ((wParam == 0x47 /*G key*/) && ((nDlgType != MLT_GOTO) && bGoToDlg))
          SwitchDialog(MLT_GOTO);
      }
      else
      {
        if ((wParam == 0x70 /*VK_F1*/) && (nDlgType != MLT_GOTO))
          RegExpCollection();
      }
    }
  }
  else if (uMsg == 2) //WM_DESTROY
  {
    GetDialogPos();
    GetEditTextFR();
    oSys.Call("User32::PostQuitMessage", 0); //Exit message loop
  }

  return 0;
}

function Ctrl()
{
  return Boolean(oSys.Call("User32::GetKeyState", 0x11 /*VK_CONTROL*/) & 0x8000);
}

function Shift()
{
  return Boolean(oSys.Call("User32::GetKeyState", 0x10 /*VK_SHIFT*/) & 0x8000);
}

function GetArguments()
{
  var vArg = AkelPad.GetArgValue("Dlg", "F").toUpperCase();

  if (vArg == "R")
    nDlgType = MLT_REPLACE;
  else if (vArg == "G")
    nDlgType = MLT_GOTO;
  else
    nDlgType = MLT_FIND;

  vArg = AkelPad.GetArgValue("FR", "").toUpperCase();

  if (vArg.indexOf("M+") >= 0)
    nMatchC = 1;
  else if (vArg.indexOf("M-") >= 0)
    nMatchC = 0;
  else
    nMatchC = -1;

  if (vArg.indexOf("W+") >= 0)
    nWholeW = 1;
  else if (vArg.indexOf("W-") >= 0)
    nWholeW = 0;
  else
    nWholeW = -1;

  if (vArg.indexOf("R+") >= 0)
    nRegExp = 1;
  else if (vArg.indexOf("R-") >= 0)
    nRegExp = 0;
  else
    nRegExp = -1;

  if (vArg.indexOf("E+") >= 0)
    nEscSeq = 1;
  else if (vArg.indexOf("E-") >= 0)
    nEscSeq = 0;
  else
    nEscSeq = -1;

  if (vArg.indexOf("D") >= 0)
    nDirection = IDC_SEARCH_FORWARD;
  else if (vArg.indexOf("U") >= 0)
    nDirection = IDC_SEARCH_BACKWARD;
  else if (vArg.indexOf("B") >= 0)
    nDirection = IDC_SEARCH_BEGINNING;
  else if (vArg.indexOf("S") >= 0)
    nDirection = IDC_SEARCH_INSEL;
  else if (vArg.indexOf("A") >= 0)
    nDirection = IDC_SEARCH_ALLFILES;
  else
    nDirection = -1;

  vArg = AkelPad.GetArgValue("RDB", "").toUpperCase();

  if ((vArg == "R") || (vArg == "A"))
    sDefBut = vArg;
  else
    sDefBut = "";

  vArg = AkelPad.GetArgValue("GT", "").toUpperCase();

  if (vArg.indexOf("L") >= 0)
    nGoTo = IDC_GOTO_LINE;
  else if (vArg.indexOf("O") >= 0)
    nGoTo = IDC_GOTO_OFFSET;
  else
    nGoTo = -1;
}

function GetLinkText()
{
  var nLangID = AkelPad.GetLangId();
  var hLangLib;
  var hRes;
  var hResData;
  var lpPointer;
  var nSize;
  var i;

  if (AkelPad.SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 52 /*MI_LANGMODULEW*/, lpBuffer))
    hLangLib = oSys.Call("Kernel32::GetModuleHandleW", AkelPad.GetAkelDir(3 /*ADTYPE_LANGS*/) + "\\" + AkelPad.MemRead(lpBuffer, DT_UNICODE));
  else //internal language
    hLangLib = AkelPad.GetInstanceExe();

  for (i = IDFINDL; i <= IDGOTOL; ++i)
  {
    hRes      = oSys.Call("Kernel32::FindResourceExW", hLangLib, 5 /*RT_DIALOG*/, aLink[i].DlgID, nLangID);
    hResData  = oSys.Call("Kernel32::LoadResource", hLangLib, hRes);
    lpPointer = oSys.Call("Kernel32::LockResource", hResData);
    nSize     = oSys.Call("Kernel32::SizeofResource", hLangLib, hRes);

    if (nSize)
    {
      //pointer to menu
      if (AkelPad.MemRead(lpPointer + 2, DT_WORD) == 0xFFFF) //DLGTEMPLATEEX
        lpPointer += 26;
      else //DLGTEMPLATE
        lpPointer += 18;

      //pointer to windowClass
      if (AkelPad.MemRead(lpPointer, DT_WORD) == 0xFFFF)
        lpPointer += 4;
      else
        lpPointer += AkelPad.MemRead(lpPointer, DT_UNICODE).length + 2;

      //pointer to title
      if (AkelPad.MemRead(lpPointer, DT_WORD) == 0xFFFF)
        lpPointer += 4;
      else
        lpPointer += AkelPad.MemRead(lpPointer, DT_UNICODE).length + 2;

      aLink[i].Text = AkelPad.MemRead(lpPointer, DT_UNICODE) + " " + aLink[i].Text;
    }
  }
}

function GetLinkWidth()
{
  var hDC = oSys.Call("User32::GetDC", hWndCancel);
  var i;

  oSys.Call("Gdi32::SelectObject", hDC, hGuiFont);
  oSys.Call("Gdi32::SetMapMode", hDC, 1 /*MM_TEXT*/);

  for (i = IDREGEXPL; i <= IDGOTOL; ++i)
  {
    oSys.Call("Gdi32::GetTextExtentPoint32W", hDC, aLink[i].Text, aLink[i].Text.length, lpBuffer);
    aLink[i].W = AkelPad.MemRead(lpBuffer, DT_DWORD);
  }

  oSys.Call("User32::ReleaseDC", hWndCancel, hDC); 
}

function GetLinkPos()
{
  var nCancelX;

  oSys.Call("User32::GetWindowRect", hWndCancel, lpBuffer);
  oSys.Call("User32::ScreenToClient", hWndDlg, lpBuffer);
  nCancelX = AkelPad.MemRead(lpBuffer, DT_DWORD);

  oSys.Call("User32::GetClientRect", hWndDlg, lpBuffer);

  if (nDlgType == MLT_FIND)
  {
    aLink[IDREGEXPL].X  = nCancelX - 11;
    aLink[IDREGEXPL].Y  = 17;
    aLink[IDREPLACEL].X = aLink[IDGOTOL].X = nCancelX;
    aLink[IDREPLACEL].Y = AkelPad.MemRead(lpBuffer + 12, DT_DWORD) - 23;
    aLink[IDGOTOL].Y    = aLink[IDREPLACEL].Y - 20;
    aLink[IDREGEXPL].Visible  = true;
    aLink[IDFINDL].Visible    = false;
    aLink[IDREPLACEL].Visible = true;
    aLink[IDGOTOL].Visible    = bGoToDlg;
  }
  else if (nDlgType == MLT_REPLACE)
  {
    aLink[IDREGEXPL].X  = nCancelX - 11;
    aLink[IDREGEXPL].Y  = 28;
    aLink[IDFINDL].X = aLink[IDGOTOL].X = nCancelX;
    aLink[IDFINDL].Y = AkelPad.MemRead(lpBuffer + 12, DT_DWORD) - 23;
    aLink[IDGOTOL].Y = aLink[IDFINDL].Y - 20;
    aLink[IDREGEXPL].Visible  = true;
    aLink[IDFINDL].Visible    = true;
    aLink[IDREPLACEL].Visible = false;
    aLink[IDGOTOL].Visible    = bGoToDlg;
  }
  else
  {
    aLink[IDFINDL].X    = 10;
    aLink[IDFINDL].Y    = aLink[IDREPLACEL].Y = AkelPad.MemRead(lpBuffer + 12, DT_DWORD) - 23;
    aLink[IDREPLACEL].X = AkelPad.MemRead(lpBuffer + 8, DT_DWORD) - aLink[IDREPLACEL].W - 10;
    aLink[IDREGEXPL].Visible  = false;
    aLink[IDFINDL].Visible    = bGoToDlg;
    aLink[IDREPLACEL].Visible = bGoToDlg;
    aLink[IDGOTOL].Visible    = false;
  }
}

function GetDialogWnd()
{
  var hWnd = AkelPad.SendMessage(hMainWnd, 1275 /*AKD_GETMODELESS*/, 0, lpBuffer);
  var nMLT = AkelPad.MemRead(lpBuffer, DT_DWORD);

  hWndWhatE = 0;
  hWndWithE = 0;

  if ((nMLT == MLT_FIND) || (nMLT == MLT_REPLACE) || (nMLT == MLT_GOTO))
  {
    nDlgType   = nMLT;
    hWndDlg    = hWnd;
    hWndCancel = oSys.Call("User32::GetDlgItem", hWndDlg, IDCANCEL);

    if (nMLT != MLT_GOTO)
    {
      AkelPad.MemCopy(lpBuffer, 52 /*sizeof(COMBOBOXINFO)*/, DT_DWORD);
      oSys.Call("User32::GetComboBoxInfo", oSys.Call("User32::GetDlgItem", hWndDlg, IDC_SEARCH_FIND), lpBuffer);
      hWndWhatE = AkelPad.MemRead(lpBuffer + 44 /*hwndItem*/, DT_DWORD);

      if (nMLT == MLT_REPLACE)
      {
        oSys.Call("User32::GetComboBoxInfo", oSys.Call("User32::GetDlgItem", hWndDlg, IDC_SEARCH_REPLACE), lpBuffer);
        hWndWithE = AkelPad.MemRead(lpBuffer + 44 /*hwndItem*/, DT_DWORD);
      }
    }
  }
  else
    hWndDlg = 0;
}

function GetDialogPos()
{
  oSys.Call("User32::GetWindowRect", hWndDlg, lpBuffer);

  nDlgX = AkelPad.MemRead(lpBuffer,     DT_DWORD);
  nDlgY = AkelPad.MemRead(lpBuffer + 4, DT_DWORD);
}

function SwitchDialog(nMLT)
{
  bContinue = true;
  nDlgType  = nMLT;
  AkelPad.SendMessage(hWndDlg, 273 /*WM_COMMAND*/, IDCANCEL, hWndCancel);
}

function ResizeDialog()
{
  var nW, nH;

  oSys.Call("User32::GetWindowRect", hWndDlg, lpBuffer);
  nW = AkelPad.MemRead(lpBuffer +  8, DT_DWORD) - AkelPad.MemRead(lpBuffer,     DT_DWORD);
  nH = AkelPad.MemRead(lpBuffer + 12, DT_DWORD) - AkelPad.MemRead(lpBuffer + 4, DT_DWORD) + 30;

  oSys.Call("User32::SetWindowPos", hWndDlg, 0, 0, 0, nW, nH, 0x16 /*SWP_NOACTIVATE|SWP_NOZORDER|SWP_NOMOVE*/);
}

function GetEditTextFR()
{
  if (hWndWhatE)
  {
    oSys.Call("User32::GetWindowTextW", hWndWhatE, lpBuffer, nBufSize / 2);
    sWhatText = AkelPad.MemRead(lpBuffer, DT_UNICODE);
  }

  if (hWndWithE)
  {
    oSys.Call("User32::GetWindowTextW", hWndWithE, lpBuffer, nBufSize / 2);
    sWithText = AkelPad.MemRead(lpBuffer, DT_UNICODE);
  }
}

function SetEditTextFR()
{
  var nSel = GetCurSelLV();

  if (nSel > -1)
  {
    oSys.Call("User32::SetWindowTextW", hWndWhatE, GetTextLV(nSel, 1));

    if (hWndWithE)
      oSys.Call("User32::SetWindowTextW", hWndWithE, GetTextLV(nSel, 2));
  }
}

function RegExpCollection()
{
  var nDeskW, nDeskH, nRECX, nRECY;

  oSys.Call("User32::GetWindowRect", oSys.Call("user32::GetDesktopWindow"), lpBuffer);
  nDeskW = AkelPad.MemRead(lpBuffer +  8, DT_DWORD);
  nDeskH = AkelPad.MemRead(lpBuffer + 12, DT_DWORD);

  oSys.Call("User32::GetWindowRect", hWndWhatE, lpBuffer);
  nRECX = AkelPad.MemRead(lpBuffer + 8, DT_DWORD);
  nRECY = AkelPad.MemRead(lpBuffer + 4, DT_DWORD) - 10;

  if (nRECX + nRECW > nDeskW)
    nRECX = AkelPad.MemRead(lpBuffer, DT_DWORD) - nRECW;
  if (nRECX < 0)
    nRECX = 0;
  if (nRECY + nRECH > nDeskH)
    nRECY = nDeskH - nRECH;

  oSys.Call("User32::EnableWindow", hWndDlg, 0);

  hWndREC = oSys.Call("user32::CreateWindowExW",
                      0,            //dwExStyle
                      sClassName,   //lpClassName
                      sTxtREC,      //lpWindowName
                      0x90CC0000,   //dwStyle=WS_POPUP|WS_VISIBLE|WS_CAPTION|WS_SYSMENU|WS_SIZEBOX
                      nRECX,        //x
                      nRECY,        //y
                      nRECW,        //nWidth
                      nRECH,        //nHeight
                      hWndDlg,      //hWndParent
                      0,            //ID
                      hInstanceDLL, //hInstance
                      RECCallback); //Script function callback. To use it class must be registered by WindowRegisterClass.
}

function RECCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    var i;

    for (i = IDNAMELV; i <= IDCLOSEB; ++i)
    {
      aWnd[i].Handle =
        oSys.Call("User32::CreateWindowExW",
                  0,             //dwExStyle
                  aWnd[i].Class, //lpClassName
                  aWnd[i].Text,  //lpWindowName
                  aWnd[i].Style, //dwStyle
                  0,             //x
                  0,             //y
                  0,             //nWidth
                  0,             //nHeight
                  hWnd,          //hWndParent
                  i,             //ID
                  hInstanceDLL,  //hInstance
                  0);            //lpParam
      AkelPad.SendMessage(aWnd[i].Handle, 48 /*WM_SETFONT*/, hGuiFont, true);
    }

    InsertColumnsLV();
    FillLV();
    CheckButtons();

    hWndFocus = aWnd[IDNAMELV].Handle;
  }

  else if ((uMsg == 6 /*WM_ACTIVATE*/) && (! wParam))
    hWndFocus = oSys.Call("User32::GetFocus");

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("User32::SetFocus", hWndFocus);

  else if (uMsg == 36) //WM_GETMINMAXINFO
  {
    AkelPad.MemCopy(lParam + 24, 300, DT_DWORD); //ptMinTrackSize_x
    AkelPad.MemCopy(lParam + 28, 195, DT_DWORD); //ptMinTrackSize_y
    AkelPad.MemCopy(lParam + 32, 800, DT_DWORD); //ptMaxTrackSize_x
    AkelPad.MemCopy(lParam + 36, 600, DT_DWORD); //ptMaxTrackSize_y
  }

  else if (uMsg == 5) //WM_SIZE
    ResizeREC(hWnd);

  else if (uMsg == 15) //WM_PAINT
    PaintSizeGrip(hWnd);

  else if (uMsg == 256 /*WM_KEYDOWN*/)
  {
    if (wParam == 0x2D /*VK_INSERT*/)
    {
      if (Ctrl() || Shift())
        EditREC(1);
      else
        EditREC(0);
    }
    if ((wParam == 0x71 /*VK_F2*/) || (wParam == 0x73 /*VK_F4*/))
    {
      if ((! Ctrl()) && (! Shift()))
        EditREC(2);
    }
    else if (wParam == 0x2E /*VK_DELETE*/)
    {
      if ((! Ctrl()) && (! Shift()))
        DeleteREC();
    }
    else if (wParam == 0x0D /*VK_RETURN*/)
    {
      if ((! Ctrl()) && (! Shift()))
      {
        hWndFocus = oSys.Call("User32::GetFocus");
        if ((hWndFocus == aWnd[IDNAMELV].Handle) || (hWndFocus == aWnd[IDWHATE].Handle) || (hWndFocus == aWnd[IDWITHE].Handle))
        {
          SetEditTextFR();
          oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
        }
      }
    }
    else if (wParam == 0x1B /*VK_ESCAPE*/)
      oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if ((uMsg == 0x004E /*WM_NOTIFY*/) && (wParam == IDNAMELV))
  {
    switch (AkelPad.MemRead(lParam + 8, DT_DWORD))
    {
      case -101 : //LVN_ITEMCHANGED
        if (AkelPad.MemRead(lParam + 20 /*NMLISTVIEW.uNewState*/, DT_DWORD) & 0x2 /*LVIS_SELECTED*/)
          ViewWhatWith(AkelPad.MemRead(lParam + 12 /*NMLISTVIEW.iItem*/, DT_DWORD));
        break;
      case -3 : //NM_DBLCLK
        if (AkelPad.MemRead(lParam + 12 /*NMITEMACTIVATE.iItem*/, DT_DWORD) == -1)
          SetCurSelLV(GetCurFocLV());
        else
        {
          SetEditTextFR();
          oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
        }
        break;

      case -2 : //NM_CLICK
      case -5 : //NM_RCLICK
      case -6 : //NM_RDBLCLK
        if (AkelPad.MemRead(lParam + 12 /*NMITEMACTIVATE.iItem*/, DT_DWORD) == -1)
          SetCurSelLV(GetCurFocLV());
        break;
    }
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    switch (wParam & 0xFFFF)
    {
      case IDNEWB :
        EditREC(0);
        break;
      case IDADDB :
        EditREC(1);
        break;
      case IDEDITB :
        EditREC(2);
        break;
      case IDDELB :
        DeleteREC();
        break;
      case IDOKB :
        SetEditTextFR();
      case IDCLOSEB :
        oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
        break;
    }
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    oSys.Call("User32::GetWindowRect", hWnd, lpBuffer);
    nRECW   = AkelPad.MemRead(lpBuffer +  8, DT_DWORD) - AkelPad.MemRead(lpBuffer,      DT_DWORD);
    nRECH   = AkelPad.MemRead(lpBuffer + 12, DT_DWORD) - AkelPad.MemRead(lpBuffer +  4, DT_DWORD);
    nRECSel = GetCurSelLV();

    WriteREC();
    oSys.Call("User32::EnableWindow", hWndDlg, 1);
    oSys.Call("User32::DestroyWindow", hWnd);
  }

  else
  {
    var nID = oSys.Call("User32::GetDlgCtrlID", oSys.Call("User32::GetFocus"));
    if ((nID >= IDNAMELV) && (nID < IDNEWB))
      oSys.Call("User32::DefDlgProcW", hWnd, 1025 /*DM_SETDEFID*/, IDOKB, 0);
  }

  return 0;
}

function PaintSizeGrip(hWnd)
{
  var lpPaint = AkelPad.MemAlloc(64); //sizeof(PAINTSTRUCT)
  var hDC;

  if (hDC = oSys.Call("User32::BeginPaint", hWnd, lpPaint))
  {
    oSys.Call("User32::GetClientRect", hWnd, lpBuffer);

    AkelPad.MemCopy(lpBuffer,     AkelPad.MemRead(lpBuffer +  8, DT_DWORD) - oSys.Call("User32::GetSystemMetrics",  2 /*SM_CXVSCROLL*/), DT_DWORD);
    AkelPad.MemCopy(lpBuffer + 4, AkelPad.MemRead(lpBuffer + 12, DT_DWORD) - oSys.Call("User32::GetSystemMetrics", 20 /*SM_CYVSCROLL*/), DT_DWORD);

    oSys.Call("User32::DrawFrameControl", hDC, lpBuffer, 3 /*DFC_SCROLL*/, 0x8 /*DFCS_SCROLLSIZEGRIP*/);
    oSys.Call("User32::EndPaint", hWnd, lpPaint);
  }

  AkelPad.MemFree(lpPaint);
}

function ResizeREC(hWnd)
{
  var nSBW = 0;
  var nW, nH, nBW, nEH;
  var i;

  oSys.Call("User32::GetClientRect", hWnd, lpBuffer);
  nW  = AkelPad.MemRead(lpBuffer +  8, DT_DWORD);
  nH  = AkelPad.MemRead(lpBuffer + 12, DT_DWORD);
  nBW = (nW - (IDCLOSEB - IDNEWB) * 5 - 2 * 10) / (IDCLOSEB - IDNEWB + 1);
  nEH = Math.round((nH - 80 - 21) / 2);

  oSys.Call("User32::SetWindowPos",
            aWnd[IDNAMELV].Handle, 0,
            10,
            10,
            nW - 30 - 170,
            nH - 30 - 21,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDWHATS].Handle, 0,
            nW - 10 - 170,
            15,
            170,
            13,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDWHATE].Handle, 0,
            nW - 10 - 170,
            30,
            170,
            nEH,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDWITHS].Handle, 0,
            nW - 10 - 170,
            nH - 35 - 21 - nEH,
            170,
            13,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDWITHE].Handle, 0,
            nW - 10 - 170,
            nH - 20 - 21 - nEH,
            170,
            nEH,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  for (i = IDNEWB; i <= IDCLOSEB; ++i)
  {
    oSys.Call("User32::SetWindowPos",
              aWnd[i].Handle, 0,
              10 + (i - IDNEWB) * (nBW + 5),
              nH - 21 - 10,
              nBW,
              21,
              0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  }

  if (GetItemCountLV() > AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x1028 /*LVM_GETCOUNTPERPAGE*/, 0, 0))
    nSBW = oSys.Call("User32::GetSystemMetrics",  2 /*SM_CXVSCROLL*/);

  AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x101E /*LVM_SETCOLUMNWIDTH*/, 0, nW - 30 - 170 - nSBW);
  AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x1013 /*LVM_ENSUREVISIBLE*/, GetCurSelLV(), false);

  AkelPad.SendMessage(aWnd[IDWHATE].Handle, 0x0CAA /*AEM_SETWORDWRAP*/, 0x102 /*AEWW_LIMITPIXEL|AEWW_SYMBOL*/, 170);
  AkelPad.SendMessage(aWnd[IDWITHE].Handle, 0x0CAA /*AEM_SETWORDWRAP*/, 0x102 /*AEWW_LIMITPIXEL|AEWW_SYMBOL*/, 170);
}

function ViewWhatWith(nItem)
{
  oSys.Call("User32::SetWindowTextW", aWnd[IDWHATE].Handle, GetTextLV(nItem, 1));
  oSys.Call("User32::SetWindowTextW", aWnd[IDWITHE].Handle, GetTextLV(nItem, 2));
}

function CheckButtons()
{
  var bEnable = (GetCurSelLV() > -1) ? true : false;

  oSys.Call("User32::EnableWindow", aWnd[IDEDITB].Handle, bEnable);
  oSys.Call("User32::EnableWindow", aWnd[IDDELB].Handle,  bEnable);
}

function GetItemCountLV()
{
  return AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x1004 /*LVM_GETITEMCOUNT*/, 0, 0);
}

function GetCurFocLV()
{
  return AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x100C /*LVM_GETNEXTITEM*/, -1, 0x0001 /*LVNI_FOCUSED*/);
}

function GetCurSelLV()
{
  return AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x100C /*LVM_GETNEXTITEM*/, -1, 0x0002 /*LVNI_SELECTED*/);
}

function SetCurSelLV(nItem)
{
  AkelPad.MemCopy(lpLVITEM + 12, 0x0003 /*LVIS_SELECTED|LVIS_FOCUSED*/, DT_DWORD);
  AkelPad.MemCopy(lpLVITEM + 16, 0x0003 /*LVIS_SELECTED|LVIS_FOCUSED*/, DT_DWORD);
  AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x102B /*LVM_SETITEMSTATE*/, nItem, lpLVITEM);
  AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x1013 /*LVM_ENSUREVISIBLE*/, nItem, false);
}

function GetTextLV(nItem, nSubItem)
{
  AkelPad.MemCopy(lpLVITEM + 8, nSubItem, DT_DWORD);
  AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x1073 /*LVM_GETITEMTEXTW*/, nItem, lpLVITEM);
  return AkelPad.MemRead(lpBuffer, DT_UNICODE);
}

function InsertItemLV(aField)
{
  var nItem;
  var i;

  AkelPad.MemCopy(lpLVITEM + 8, 0, DT_DWORD);
  AkelPad.MemCopy(lpBuffer, aField[0], DT_UNICODE);
  nItem = AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x104D /*LVM_INSERTITEMW*/, 0, lpLVITEM);

  for (i = 1; i < 3; ++i)
  {
    AkelPad.MemCopy(lpLVITEM + 8, i, DT_DWORD);
    AkelPad.MemCopy(lpBuffer, aField[i], DT_UNICODE);
    AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x1074 /*LVM_SETITEMTEXTW*/, nItem, lpLVITEM);
  }

  return nItem;
}

function DeleteItemLV(nItem)
{
  AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x1008 /*LVM_DELETEITEM*/, nItem, 0);
}

function InsertColumnsLV()
{
  var lpLVCOLUMN = AkelPad.MemAlloc(40) //sizeof(LVCOLUMN)
  var aText      = [sTxtName, sTxtFindWhat, sTxtReplaceWith];
  var i;

  AkelPad.MemCopy(lpLVCOLUMN, 6 /*mask=LVCF_WIDTH|LVCF_TEXT*/, DT_DWORD);
  AkelPad.MemCopy(lpLVCOLUMN + 12, lpBuffer, DT_DWORD);

  for (i = 0; i < 3; ++i)
  {
    AkelPad.MemCopy(lpBuffer, aText[i], DT_UNICODE);
    AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x1061 /*LVM_INSERTCOLUMNW*/, i, lpLVCOLUMN);
  }

  AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x1036 /*LVM_SETEXTENDEDLISTVIEWSTYLE*/, 0x0020 /*LVS_EX_FULLROWSELECT*/, 0x0020);
  AkelPad.MemFree(lpLVCOLUMN);
}

function FillLV()
{
  var sRECName = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + "_REC.tsv";
  var aRecord;
  var aField;
  var i;

  if (oFSO.FileExists(sRECName))
    aRecord = AkelPad.ReadFile(sRECName).split("\r\n");
  else
  {
    aRecord    = ["Delete empty lines\t^[ \\t]*$\\n*\t"];
    bChangeREC = true;
  }

  for (i = 0; i < aRecord.length; ++i)
  {
    aField = aRecord[i].split("\t");

    if (aField[0])
    {
      while (aField.length < 3)
        aField[aField.length] = "";

      InsertItemLV(aField);
    }
  }

  if (nRECSel > GetItemCountLV() - 1)
    nRECSel = GetItemCountLV() - 1;
  if (nRECSel < 0)
    nRECSel = 0;

  SetCurSelLV(nRECSel);
}

function WriteREC()
{
  if (bChangeREC)
  {
    var oFile  = oFSO.OpenTextFile(WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + "_REC.tsv", 2, true, -1);
    var nItems = GetItemCountLV();
    var sText  = "";
    var i;

    bChangeREC = false;

    for (i = 0; i < nItems; ++i)
      sText += GetTextLV(i, 0) + "\t" + GetTextLV(i, 1) + "\t" + GetTextLV(i, 2) + "\r\n";

    oFile.Write(sText);
    oFile.Close();
  }
}

function EditREC(nType)
{
  var nSel   = GetCurSelLV();
  var aField = [];
  var sCaption;
  var i;

  if (nType == 1) //Add
  {
    GetEditTextFR();
    sCaption = sTxtAdd;
    aField   = ["", sWhatText, sWithText];
  }
  else
  {
    if (nType == 0) //New
      sCaption = sTxtNew;
    else //Edit
    {
      if (nSel < 0)
        return;
      sCaption = sTxtEdit;
    }

    for (i = 0; i < 3; ++i)
      aField[i] = (nSel < 0) ? "" : GetTextLV(nSel, i);
  }

  aField = InputBox(hWndREC, sCaption, [sTxtName + ":", sTxtFindWhat + ":", sTxtReplaceWith + ":"], aField, 0, "CheckInputREC", nType);

  if (aField)
  {
    if (nType == 2) //Edit
      DeleteItemLV(nSel)

    SetCurSelLV(InsertItemLV(aField));
    CheckButtons();
    bChangeREC = true;
  }
}

function CheckInputREC(hWnd, aField, nType)
{
  var sCaption;
  var lpLVFINDINFO;
  var nSelItem;
  var nFindItem;

  if (nType == 0)
    sCaption = sTxtNew;
  else if (nType == 1)
    sCaption = sTxtAdd;
  else if (nType == 2)
    sCaption = sTxtEdit;

  if (aField[0])
  {
    lpLVFINDINFO = AkelPad.MemAlloc(24); //sizeof(LVFINDINFO)
    AkelPad.MemCopy(lpLVFINDINFO, 0x02 /*LVFI_STRING*/, DT_DWORD);
    AkelPad.MemCopy(lpLVFINDINFO + 4, lpBuffer, DT_DWORD);
    AkelPad.MemCopy(lpBuffer, aField[0], DT_UNICODE);

    nSelItem  = GetCurSelLV();
    nFindItem = AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x1053 /*LVM_FINDITEMW*/, -1, lpLVFINDINFO);

    AkelPad.MemFree(lpLVFINDINFO);

    if (nFindItem > -1)
    {
      if ((nType < 2) || (nFindItem != nSelItem))
      {
        WarningBox(hWnd, sTxtNameExists, sCaption);
        return 0;
      }
    }
  }
  else
  {
    WarningBox(hWnd, sTxtNoName, sCaption);
    return 0;
  }

  if (! aField[1])
  {
    WarningBox(hWnd, sTxtNoFindWhat, sCaption);
    return 1;
  }

  return -1;
}

function DeleteREC()
{
  var nSel = GetCurSelLV();

  if (nSel > -1)
  {
    if (QuestionBox(hWndREC, '"' + GetTextLV(nSel, 0) + '"\n\n' + sTxtWantRemove, sTxtDelete))
    {
      DeleteItemLV(nSel);

      if (nSel == GetItemCountLV())
        --nSel;

      SetCurSelLV(nSel);
      CheckButtons();
      bChangeREC = true;

      if (! GetItemCountLV())
      {
        oSys.Call("User32::SetWindowTextW", aWnd[IDWHATE].Handle, "");
        oSys.Call("User32::SetWindowTextW", aWnd[IDWITHE].Handle, "");
      }
    }
  }
}

function WarningBox(hWnd, sText, sCaption)
{
  AkelPad.MessageBox(hWnd, sText, sCaption, 0x30 /*MB_ICONWARNING*/);
}

function QuestionBox(hWnd, sText, sCaption)
{
  return (AkelPad.MessageBox(hWnd, sText, sCaption, 0x23 /*MB_ICONQUESTION|MB_YESNOCANCEL*/) == 6 /*IDYES*/);
}

function ReadIni()
{
  var sIniName = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";
  var oError;

  sTxtREC         = "Regular expressions collection";
  sTxtName        = "Name";
  sTxtFindWhat    = "Find - What";
  sTxtReplaceWith = "Replace - With";
  sTxtNew         = "New";
  sTxtAdd         = "Add";
  sTxtEdit        = "Edit";
  sTxtDelete      = "Delete";
  sTxtOK          = "OK";
  sTxtClose       = "Close";
  sTxtNameExists  = "Name already exists.";
  sTxtNoName      = "Name is required.";
  sTxtNoFindWhat  = "Find - What is required.";
  sTxtWantRemove  = "Do you want to remove it?";

  if (oFSO.FileExists(sIniName))
  {
    try
    {
      eval(AkelPad.ReadFile(sIniName));
    }
    catch (oError)
    {
    }
  }
}

function WriteIni()
{
  var oFile = oFSO.OpenTextFile(WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini", 2, true, -1);

  oFile.Write(
    'bGoToDlg=' + bGoToDlg + ';\r\n' +
    'nDlgX='    + nDlgX    + ';\r\n' +
    'nDlgY='    + nDlgY    + ';\r\n' +
    'nRECW='    + nRECW    + ';\r\n' +
    'nRECH='    + nRECH    + ';\r\n' +
    'nRECSel='  + nRECSel  + ';');
  oFile.Close();
}
