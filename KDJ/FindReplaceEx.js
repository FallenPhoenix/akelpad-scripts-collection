// FindReplaceEx.js - ver. 2013-02-05
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
// F1 - help for regular expressions (if focus is in edit control)
// F2 - Find/Replace templates
//
// Find/Replace templates is saved in file FindReplaceEx_templates.tsv
//
// Keys and mouse in "Find/Replace templates" dialog:
// Ins       - New
// Ctrl+Ins,
// Shift+Ins - Add (from "Find/Replace" dialog)
// F2, F4    - Edit
// Del       - Delete
// Enter,
// DblClick  - OK (put template in "Find/Replace" dialog)
// F1        - help for regular expressions (if focus is in edit control)

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

var IDNAMELV   = 9900;
var IDWHATS    = 9901;
var IDWITHS    = 9902;
var IDWHATE    = 9903;
var IDWITHE    = 9904;
var IDMATCHC   = 9905;
var IDWHOLEW   = 9906;
var IDREGEXP   = 9907;
var IDESCSEQ   = 9908;
var IDNEWB     = 9909;
var IDADDB     = 9910;
var IDEDITB    = 9911;
var IDDELB     = 9912;
var IDOKB      = 9913;
var IDCLOSEB   = 9914;
var IDHELP1L   = 9915;
var IDHELP2L   = 9916;
var IDFRTL     = 9917;
var IDFINDL    = 9918;
var IDREPLACEL = 9919;
var IDGOTOL    = 9920;

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
var aSubClassFRT = [];
var bContinue    = true;
var bFirstTimeFR = true;
var bFirstTimeGT = true;
var bChangeFRT   = false;
var nWhatSel1    = 0;
var nWhatSel2    = -1;
var nWithSel1    = 0;
var nWithSel2    = -1;
var nDlgType;
var nMatchCase;
var nWholeWord;
var nRegExp;
var nEscSeq;
var nDirection;
var nGoTo;
var sDefButton;
var hDlgWnd;
var hDlgSubClass;
var hDlgWhatE;
var hDlgWithE;
var hDlgCancel;
var hWndFRT;
var hWndFocus;
var sWhatText;
var sWithText;
var i;

//ini settings
var bGoToDlg = 1;
var nFRTW    = 340;
var nFRTH    = 250;
var nFRTSel  = 0;
var nDlgX;
var nDlgY;

ReadIni();

AkelPad.MemCopy(lpLVITEM, 0x0001 /*LVIF_TEXT*/, DT_DWORD);
AkelPad.MemCopy(lpLVITEM + 20, lpBuffer, DT_DWORD);
AkelPad.MemCopy(lpLVITEM + 24, nBufSize, DT_DWORD);

//0x50000000 - WS_VISIBLE|WS_CHILD
//0x50010000 - WS_VISIBLE|WS_CHILD|WS_TABSTOP
//0x50010003 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
//0x50810000 - WS_VISIBLE|WS_CHILD|WS_BORDER|WS_TABSTOP
//0x5081801D - WS_VISIBLE|WS_CHILD|WS_BORDER|WS_TABSTOP|LVS_NOSORTHEADER|LVS_SORTASCENDING|LVS_SHOWSELALWAYS|LVS_SINGLESEL|LVS_REPORT
aWnd[IDNAMELV] = {Class: "SysListView32", Style: 0x5081801D, Text: ""};
aWnd[IDWHATS]  = {Class: "STATIC",        Style: 0x50000000, Text: sTxtFindWhat + ":"};
aWnd[IDWITHS]  = {Class: "STATIC",        Style: 0x50000000, Text: sTxtReplaceWith + ":"};
aWnd[IDWHATE]  = {Class: "AkelEditW",     Style: 0x50810000, Text: ""};
aWnd[IDWITHE]  = {Class: "AkelEditW",     Style: 0x50810000, Text: ""};
aWnd[IDMATCHC] = {Class: "BUTTON",        Style: 0x50010003, Text: sTxtMatchCase};
aWnd[IDWHOLEW] = {Class: "BUTTON",        Style: 0x50010003, Text: sTxtWholeWord};
aWnd[IDREGEXP] = {Class: "BUTTON",        Style: 0x50010003, Text: sTxtRegExp};
aWnd[IDESCSEQ] = {Class: "BUTTON",        Style: 0x50010003, Text: sTxtEscSeq};
aWnd[IDNEWB]   = {Class: "BUTTON",        Style: 0x50010000, Text: sTxtNew};
aWnd[IDADDB]   = {Class: "BUTTON",        Style: 0x50010000, Text: sTxtAdd};
aWnd[IDEDITB]  = {Class: "BUTTON",        Style: 0x50010000, Text: sTxtEdit};
aWnd[IDDELB]   = {Class: "BUTTON",        Style: 0x50010000, Text: sTxtDelete};
aWnd[IDOKB]    = {Class: "BUTTON",        Style: 0x50010000, Text: sTxtOK};
aWnd[IDCLOSEB] = {Class: "BUTTON",        Style: 0x50010000, Text: sTxtClose};
aWnd[IDHELP1L] = {Class: "SysLink",       Style: 0x50000000, Text: "<a>?</a>"};
aWnd[IDHELP2L] = {Class: "SysLink",       Style: 0x50000000, Text: "<a>?</a>"};

aLink[IDHELP1L]   = {Text: "?"};
aLink[IDHELP2L]   = {Text: "?"};
aLink[IDFRTL]     = {Text: sTxtTemplates + " (F2)"};
aLink[IDFINDL]    = {Text: "(Ctrl+F)", DlgID: 2004 /*IDD_FIND*/};
aLink[IDREPLACEL] = {Text: "(Ctrl+R)", DlgID: 2005 /*IDD_REPLACE*/};
aLink[IDGOTOL]    = {Text: "(Ctrl+G)", DlgID: 2006 /*IDD_GOTO*/};

GetDialogWnd();
if (hDlgWnd && hDlgCancel)
  AkelPad.SendMessage(hDlgWnd, 273 /*WM_COMMAND*/, IDCANCEL, hDlgCancel);

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

  if (! (hDlgWnd && hDlgCancel))
    break;

  if ((typeof nDlgX == "number") && (typeof nDlgY == "number"))
    oSys.Call("User32::SetWindowPos", hDlgWnd, 0, nDlgX, nDlgY, 0, 0, 0x0415 /*SWP_NOSENDCHANGING|SWP_NOACTIVATE|SWP_NOZORDER|SWP_NOSIZE*/);

  if (nDlgType == MLT_GOTO)
  {
    if (bFirstTimeGT)
    {
      bFirstTimeGT = false;
      SetParamsGT(nGoTo);
    }

    if (bGoToDlg)
      ResizeDialogGT();
  }
  else
  {
    if (bFirstTimeFR)
    {
      bFirstTimeFR = false;
      SetParamsFR(nMatchCase, nWholeWord, nRegExp, nEscSeq, nDirection);
    }

    if (typeof sWhatText == "string")
    {
      oSys.Call("User32::SetWindowTextW", hDlgWhatE, sWhatText);
      AkelPad.SendMessage(hDlgWhatE, 0x00B1 /*EM_SETSEL*/, 0, -1);
    }

    if (nDlgType == MLT_REPLACE)
    {
      if (typeof sWithText == "string")
        oSys.Call("User32::SetWindowTextW", hDlgWithE, sWithText);

      if (sDefButton)
        AkelPad.SendMessage(hDlgWnd, 0x0401 /*DM_SETDEFID*/, (sDefButton == "R") ? IDC_SEARCH_REPLACE_BUTTON : IDC_SEARCH_ALL_BUTTON, 0);
    }
  }

  GetLinkWidth();
  GetLinkPos();

  for (i = IDHELP1L; i <= IDGOTOL; ++i)
  {
    if (aLink[i].Create)
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
                  hDlgWnd,         //hWndParent
                  i,               //ID
                  hInstanceDLL,    //hInstance
                  0),              //lpParam
        48 /*WM_SETFONT*/, hGuiFont, true);
  }

  if (nDlgType != MLT_GOTO)
    ShowHelpLinksFR();

  oSys.Call("User32::UpdateWindow", hDlgWnd);

  hDlgSubClass = AkelPad.WindowSubClass(hDlgWnd, DialogCallback, 78 /*WM_NOTIFY*/, 256 /*WM_KEYDOWN*/, 273 /*WM_COMMAND*/, 2 /*WM_DESTROY*/);

  AkelPad.WindowGetMessage();
  AkelPad.WindowUnsubClass(hDlgWnd);
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
      if ((wParam == IDHELP1L) || (wParam == IDHELP2L))
        RegExpHelp(wParam, 0);
      else if (wParam == IDFRTL)
      {
        oSys.Call("User32::SetFocus", hDlgWhatE);
        FRTemplates();
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
        if ((wParam == 0x46 /*F key*/) && aLink[IDFINDL].Create)
          SwitchDialog(MLT_FIND);
        else if ((wParam == 0x52 /*R key*/) && aLink[IDREPLACEL].Create)
          SwitchDialog(MLT_REPLACE);
        else if ((wParam == 0x47 /*G key*/) && aLink[IDGOTOL].Create)
          SwitchDialog(MLT_GOTO);
      }
      else
      {
        if (wParam == 0x70 /*VK_F1*/)
        {
          if (aLink[IDHELP1L].Show && (oSys.Call("User32::GetFocus") == hDlgWhatE))
            RegExpHelp(IDHELP1L, 0);
          else if (aLink[IDHELP2L].Show && (oSys.Call("User32::GetFocus") == hDlgWithE))
            RegExpHelp(IDHELP2L, 0);
        }
        else if ((wParam == 0x71 /*VK_F2*/) && aLink[IDFRTL].Create)
          FRTemplates();
      }
    }
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    var nLowParam = LoWord(wParam);
    var nHiwParam = HiWord(wParam);

    if (nLowParam == IDC_SEARCH_FIND)
    {
      if (nHiwParam == 3 /*CBN_SETFOCUS*/)
        AkelPad.SendMessage(lParam, 0x0142 /*CB_SETEDITSEL*/, 0, MkLong(nWhatSel1, nWhatSel2));
      else if (nHiwParam == 10 /*CBN_SELENDCANCEL*/)
      {
        nWhatSel1 = LoWord(AkelPad.SendMessage(lParam, 0x0140 /*CB_GETEDITSEL*/, 0, 0));
        nWhatSel2 = HiWord(AkelPad.SendMessage(lParam, 0x0140 /*CB_GETEDITSEL*/, 0, 0));
      }
    }
    else if (nLowParam == IDC_SEARCH_REPLACE)
    {
      if (nHiwParam == 3 /*CBN_SETFOCUS*/)
        AkelPad.SendMessage(lParam, 0x0142 /*CB_SETEDITSEL*/, 0, MkLong(nWithSel1, nWithSel2));
      else if (nHiwParam == 10 /*CBN_SELENDCANCEL*/)
      {
        nWithSel1 = LoWord(AkelPad.SendMessage(lParam, 0x0140 /*CB_GETEDITSEL*/, 0, 0));
        nWithSel2 = HiWord(AkelPad.SendMessage(lParam, 0x0140 /*CB_GETEDITSEL*/, 0, 0));
      }
    }
    else if ((nLowParam == IDC_SEARCH_REGEXP) || (nLowParam == IDC_SEARCH_ESCAPESEQ))
    {
      AkelPad.WindowNextProc(hDlgSubClass, hWnd, uMsg, wParam, lParam);
      ShowHelpLinksFR();
      oSys.Call("User32::UpdateWindow", hWnd);
    }
  }

  else if (uMsg == 2) //WM_DESTROY
  {
    GetDialogPos();
    GetWhatWithFR();
    oSys.Call("User32::PostQuitMessage", 0); //Exit message loop
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

function MkLong(nLoWord, nHiWord)
{
  return (nLoWord & 0xFFFF) | (nHiWord << 16);
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
    nMatchCase = 1;
  else if (vArg.indexOf("M-") >= 0)
    nMatchCase = 0;
  else
    nMatchCase = 2;

  if (vArg.indexOf("W+") >= 0)
    nWholeWord = 1;
  else if (vArg.indexOf("W-") >= 0)
    nWholeWord = 0;
  else
    nWholeWord = 2;

  if (vArg.indexOf("R+") >= 0)
    nRegExp = 1;
  else if (vArg.indexOf("R-") >= 0)
    nRegExp = 0;
  else
    nRegExp = 2;

  if (vArg.indexOf("E+") >= 0)
    nEscSeq = 1;
  else if (vArg.indexOf("E-") >= 0)
    nEscSeq = 0;
  else
    nEscSeq = 2;

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
    nDirection = 2;

  vArg = AkelPad.GetArgValue("RDB", "").toUpperCase();

  if ((vArg == "R") || (vArg == "A"))
    sDefButton = vArg;
  else
    sDefButton = "";

  vArg = AkelPad.GetArgValue("GT", "").toUpperCase();

  if (vArg.indexOf("L") >= 0)
    nGoTo = IDC_GOTO_LINE;
  else if (vArg.indexOf("O") >= 0)
    nGoTo = IDC_GOTO_OFFSET;
  else
    nGoTo = 2;
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
  var hDC = oSys.Call("User32::GetDC", hDlgCancel);
  var i;

  oSys.Call("Gdi32::SelectObject", hDC, hGuiFont);
  oSys.Call("Gdi32::SetMapMode", hDC, 1 /*MM_TEXT*/);

  for (i = IDHELP1L; i <= IDGOTOL; ++i)
  {
    oSys.Call("Gdi32::GetTextExtentPoint32W", hDC, aLink[i].Text, aLink[i].Text.length, lpBuffer);
    aLink[i].W = AkelPad.MemRead(lpBuffer, DT_DWORD);
  }

  oSys.Call("User32::ReleaseDC", hDlgCancel, hDC); 
}

function GetLinkPos()
{
  var nDlgW, nDlgH;
  var nCancelX, nCancelW;

  oSys.Call("User32::GetClientRect", hDlgWnd, lpBuffer);
  nDlgW = AkelPad.MemRead(lpBuffer +  8, DT_DWORD);
  nDlgH = AkelPad.MemRead(lpBuffer + 12, DT_DWORD);

  oSys.Call("User32::GetWindowRect", hDlgCancel, lpBuffer);
  oSys.Call("User32::ScreenToClient", hDlgWnd, lpBuffer);
  oSys.Call("User32::ScreenToClient", hDlgWnd, lpBuffer + 8);
  nCancelX = AkelPad.MemRead(lpBuffer,     DT_DWORD);
  nCancelW = AkelPad.MemRead(lpBuffer + 8, DT_DWORD) - nCancelX;

  if (nDlgType == MLT_GOTO)
  {
    aLink[IDFINDL].X    = 10;
    aLink[IDFINDL].Y    = nDlgH - 23;
    aLink[IDREPLACEL].X = nDlgW - aLink[IDREPLACEL].W - 10;
    aLink[IDREPLACEL].Y = nDlgH - 23;
    aLink[IDHELP1L].Create   = 0;
    aLink[IDHELP1L].Show     = 0;
    aLink[IDHELP2L].Create   = 0;
    aLink[IDHELP2L].Show     = 0;
    aLink[IDFRTL].Create     = 0;
    aLink[IDFINDL].Create    = bGoToDlg;
    aLink[IDREPLACEL].Create = bGoToDlg;
    aLink[IDGOTOL].Create    = 0;
  }
  else
  {
    aLink[IDHELP1L].X = nCancelX - 12;
    aLink[IDHELP1L].Y = 18;
    aLink[IDFRTL].X   = 30;
    aLink[IDFRTL].Y   = nDlgH - 23;
    aLink[IDGOTOL].X  = nCancelX + (nCancelW - aLink[IDGOTOL].W) / 2;
    aLink[IDGOTOL].Y  = nDlgH - 43;
    aLink[IDHELP1L].Create = 1;
    aLink[IDHELP2L].Create = 1;
    aLink[IDFRTL].Create   = 1;
    aLink[IDGOTOL].Create  = bGoToDlg;

    if (nDlgType == MLT_FIND)
    {
      aLink[IDREPLACEL].X = nCancelX + (nCancelW - aLink[IDREPLACEL].W) / 2;
      aLink[IDREPLACEL].Y = nDlgH - 23;
      aLink[IDFINDL].Create    = 0;
      aLink[IDREPLACEL].Create = 1;
    }
    else
    {
      aLink[IDHELP2L].X = nCancelX - 12;
      aLink[IDHELP2L].Y = 40;
      aLink[IDFINDL].X  = nCancelX + (nCancelW - aLink[IDFINDL].W) / 2;
      aLink[IDFINDL].Y  = nDlgH - 23;
      aLink[IDFINDL].Create    = 1;
      aLink[IDREPLACEL].Create = 0;
    }
  }
}

function ShowHelpLinksFR()
{
  if (AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_REGEXP), 0x00F0 /*BM_GETCHECK*/, 0, 0))
  {
    aLink[IDHELP1L].Show = 1;
    aLink[IDHELP2L].Show = (nDlgType == MLT_REPLACE);
  }
  else
  {
    aLink[IDHELP1L].Show = 0;
    aLink[IDHELP2L].Show = 0;
  }

  oSys.Call("User32::ShowWindow", oSys.Call("User32::GetDlgItem", hDlgWnd, IDHELP1L), aLink[IDHELP1L].Show);
  oSys.Call("User32::ShowWindow", oSys.Call("User32::GetDlgItem", hDlgWnd, IDHELP2L), aLink[IDHELP2L].Show);
}

function GetDialogWnd()
{
  var hWnd = AkelPad.SendMessage(hMainWnd, 1275 /*AKD_GETMODELESS*/, 0, lpBuffer);
  var nMLT = AkelPad.MemRead(lpBuffer, DT_DWORD);

  hDlgWhatE = 0;
  hDlgWithE = 0;

  if ((nMLT == MLT_FIND) || (nMLT == MLT_REPLACE) || (nMLT == MLT_GOTO))
  {
    nDlgType   = nMLT;
    hDlgWnd    = hWnd;
    hDlgCancel = oSys.Call("User32::GetDlgItem", hDlgWnd, IDCANCEL);

    if (nMLT != MLT_GOTO)
    {
      AkelPad.MemCopy(lpBuffer, 52 /*sizeof(COMBOBOXINFO)*/, DT_DWORD);
      oSys.Call("User32::GetComboBoxInfo", oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_FIND), lpBuffer);
      hDlgWhatE = AkelPad.MemRead(lpBuffer + 44 /*hwndItem*/, DT_DWORD);

      if (nMLT == MLT_REPLACE)
      {
        oSys.Call("User32::GetComboBoxInfo", oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_REPLACE), lpBuffer);
        hDlgWithE = AkelPad.MemRead(lpBuffer + 44 /*hwndItem*/, DT_DWORD);
      }
    }
  }
  else
    hDlgWnd = 0;
}

function GetDialogPos()
{
  oSys.Call("User32::GetWindowRect", hDlgWnd, lpBuffer);

  nDlgX = AkelPad.MemRead(lpBuffer,     DT_DWORD);
  nDlgY = AkelPad.MemRead(lpBuffer + 4, DT_DWORD);
}

function SwitchDialog(nMLT)
{
  bContinue = true;
  nDlgType  = nMLT;
  AkelPad.SendMessage(hDlgWnd, 273 /*WM_COMMAND*/, IDCANCEL, hDlgCancel);
}

function ResizeDialogGT()
{
  var nW, nH;

  oSys.Call("User32::GetWindowRect", hDlgWnd, lpBuffer);
  nW = AkelPad.MemRead(lpBuffer +  8, DT_DWORD) - AkelPad.MemRead(lpBuffer,     DT_DWORD);
  nH = AkelPad.MemRead(lpBuffer + 12, DT_DWORD) - AkelPad.MemRead(lpBuffer + 4, DT_DWORD) + 30;

  oSys.Call("User32::SetWindowPos", hDlgWnd, 0, 0, 0, nW, nH, 0x16 /*SWP_NOACTIVATE|SWP_NOZORDER|SWP_NOMOVE*/);
}

function SetParamsFR(nMatchCase, nWholeWord, nRegExp, nEscSeq, nDirection)
{
  if (nMatchCase != 2)
  {
    AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_MATCHCASE), 0x00F1 /*BM_SETCHECK*/, nMatchCase, 0);
    AkelPad.SendMessage(hDlgWnd, 273 /*WM_COMMAND*/, IDC_SEARCH_MATCHCASE, oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_MATCHCASE));
  }
  if (nWholeWord != 2)
  {
    AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_WHOLEWORD), 0x00F1 /*BM_SETCHECK*/, nWholeWord, 0);
    AkelPad.SendMessage(hDlgWnd, 273 /*WM_COMMAND*/, IDC_SEARCH_WHOLEWORD, oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_WHOLEWORD));
  }
  if (nRegExp != 2)
  {
    AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_REGEXP), 0x00F1 /*BM_SETCHECK*/, nRegExp, 0);
    AkelPad.SendMessage(hDlgWnd, 273 /*WM_COMMAND*/, IDC_SEARCH_REGEXP, oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_REGEXP));
  }
  if (nEscSeq != 2)
  {
    AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_ESCAPESEQ), 0x00F1 /*BM_SETCHECK*/, nEscSeq, 0);
    AkelPad.SendMessage(hDlgWnd, 273 /*WM_COMMAND*/, IDC_SEARCH_ESCAPESEQ, oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_ESCAPESEQ));
  }
  if (nDirection != 2)
  {
    AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_BACKWARD),  0x00F1 /*BM_SETCHECK*/, 0, 0);
    AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_FORWARD),   0x00F1 /*BM_SETCHECK*/, 0, 0);
    AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_BEGINNING), 0x00F1 /*BM_SETCHECK*/, 0, 0);
    AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_INSEL),     0x00F1 /*BM_SETCHECK*/, 0, 0);
    AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_ALLFILES),  0x00F1 /*BM_SETCHECK*/, 0, 0);
    AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, nDirection),           0x00F1 /*BM_SETCHECK*/, 1, 0);
    AkelPad.SendMessage(hDlgWnd, 273 /*WM_COMMAND*/, nDirection, oSys.Call("User32::GetDlgItem", hDlgWnd, nDirection));
  }
}

function SetParamsGT(nGoTo)
{
  if (nGoTo != 2)
  {
    AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_GOTO_LINE),   0x00F1 /*BM_SETCHECK*/, 0, 0);
    AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_GOTO_OFFSET), 0x00F1 /*BM_SETCHECK*/, 0, 0);
    AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, nGoTo),           0x00F1 /*BM_SETCHECK*/, 1, 0);
    AkelPad.SendMessage(hDlgWnd, 273 /*WM_COMMAND*/, nGoTo, oSys.Call("User32::GetDlgItem", hDlgWnd, nGoTo));
  }
}

function GetWhatWithFR()
{
  if (hDlgWhatE)
  {
    oSys.Call("User32::GetWindowTextW", hDlgWhatE, lpBuffer, nBufSize / 2);
    sWhatText = AkelPad.MemRead(lpBuffer, DT_UNICODE);
  }

  if (hDlgWithE)
  {
    oSys.Call("User32::GetWindowTextW", hDlgWithE, lpBuffer, nBufSize / 2);
    sWithText = AkelPad.MemRead(lpBuffer, DT_UNICODE);
  }
}

function SetFRTtoFR()
{
  var nItem = GetCurSelLV();
  var sParams;
  var nMatchCase;
  var nWholeWord;
  var nRegExp;
  var nEscSeq;

  if (nItem > -1)
  {
    nWhatSel1 = 0;
    nWhatSel2 = -1;
    oSys.Call("User32::SetWindowTextW", hDlgWhatE, GetTextLV(nItem, 1));

    if (hDlgWithE)
    {
      nWithSel1 = 0;
      nWithSel2 = -1;
      oSys.Call("User32::SetWindowTextW", hDlgWithE, GetTextLV(nItem, 2));
    }

    sParams    = GetTextLV(nItem, 3);
    nMatchCase = parseInt(sParams.substr(0, 1));
    nWholeWord = parseInt(sParams.substr(1, 1));
    nRegExp    = parseInt(sParams.substr(2, 1));
    nEscSeq    = parseInt(sParams.substr(3, 1));

    SetParamsFR(nMatchCase, nWholeWord, nRegExp, nEscSeq, 2);
  }

  oSys.Call("User32::PostMessageW", hWndFRT, 16 /*WM_CLOSE*/, 0, 0);
}

function FRTemplates()
{
  var nDeskW, nDeskH, nFRTX, nFRTY;

  oSys.Call("User32::GetWindowRect", oSys.Call("user32::GetDesktopWindow"), lpBuffer);
  nDeskW = AkelPad.MemRead(lpBuffer +  8, DT_DWORD);
  nDeskH = AkelPad.MemRead(lpBuffer + 12, DT_DWORD);

  oSys.Call("User32::GetWindowRect", hDlgWhatE, lpBuffer);
  nFRTX = AkelPad.MemRead(lpBuffer + 8, DT_DWORD);
  nFRTY = AkelPad.MemRead(lpBuffer + 4, DT_DWORD) - 35;

  if (nFRTX + nFRTW > nDeskW)
    nFRTX = AkelPad.MemRead(lpBuffer, DT_DWORD) - nFRTW;
  if (nFRTX < 0)
    nFRTX = 0;
  if (nFRTY + nFRTH > nDeskH)
    nFRTY = nDeskH - nFRTH;

  oSys.Call("User32::EnableWindow", hDlgWnd, 0);

  hWndFRT = oSys.Call("user32::CreateWindowExW",
                      0,            //dwExStyle
                      sClassName,   //lpClassName
                      sTxtFRTempl,  //lpWindowName
                      0x90CC0000,   //dwStyle=WS_POPUP|WS_VISIBLE|WS_CAPTION|WS_SYSMENU|WS_SIZEBOX
                      nFRTX,        //x
                      nFRTY,        //y
                      nFRTW,        //nWidth
                      nFRTH,        //nHeight
                      hDlgWnd,      //hWndParent
                      0,            //ID
                      hInstanceDLL, //hInstance
                      CallbackFRT); //Script function callback. To use it class must be registered by WindowRegisterClass.
}

function CallbackFRT(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    var i;

    for (i = IDNAMELV; i <= IDHELP2L; ++i)
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

    for (i = IDWHATE; i <= IDWITHE; ++i)
    {
      AkelPad.SendMessage(aWnd[i].Handle, 3262 /*AEM_SETTEXTLIMIT*/, 511, 0);
      AkelPad.SendMessage(aWnd[i].Handle, 1093 /*EM_SETEVENTMASK*/, 0, 0x1 /*ENM_CHANGE*/);
      aSubClassFRT[i] = AkelPad.WindowSubClass(aWnd[i].Handle, EditCallbackFRT, 256 /*WM_KEYDOWN*/);
    }

    InsertColumnsLV();
    FillLV();
    RefreshViewFRT();

    hWndFocus = aWnd[IDNAMELV].Handle;
  }

  else if ((uMsg == 6 /*WM_ACTIVATE*/) && (! wParam))
    hWndFocus = oSys.Call("User32::GetFocus");

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("User32::SetFocus", hWndFocus);

  else if (uMsg == 36) //WM_GETMINMAXINFO
  {
    AkelPad.MemCopy(lParam + 24,  340, DT_DWORD); //ptMinTrackSize_x
    AkelPad.MemCopy(lParam + 28,  250, DT_DWORD); //ptMinTrackSize_y
    AkelPad.MemCopy(lParam + 32, 1200, DT_DWORD); //ptMaxTrackSize_x
    AkelPad.MemCopy(lParam + 36,  800, DT_DWORD); //ptMaxTrackSize_y
  }

  else if (uMsg == 5) //WM_SIZE
    ResizeFRT(hWnd);

  else if (uMsg == 15) //WM_PAINT
    PaintSizeGrip(hWnd);

  else if (uMsg == 256 /*WM_KEYDOWN*/)
  {
    hWndFocus = oSys.Call("User32::GetFocus");

    if (wParam == 0x2D /*VK_INSERT*/)
    {
      if ((hWndFocus != aWnd[IDWHATE].Handle) && (hWndFocus != aWnd[IDWITHE].Handle))
      {
        if (Ctrl() || Shift())
          EditFRT(1);
        else
          EditFRT(0);
      }
    }
    else if (wParam == 0x2E /*VK_DELETE*/)
    {
      if ((hWndFocus != aWnd[IDWHATE].Handle) && (hWndFocus != aWnd[IDWITHE].Handle))
      {
        if ((! Ctrl()) && (! Shift()))
          DeleteFRT();
      }
    }
    else if (wParam == 0x70 /*VK_F1*/)
    {
      if ((! Ctrl()) && (! Shift()) && AkelPad.SendMessage(aWnd[IDREGEXP].Handle, 0x00F0 /*BM_GETCHECK*/, 0, 0))
      {
        if (hWndFocus == aWnd[IDWHATE].Handle)
          RegExpHelp(IDHELP1L, 1);
        else if (hWndFocus == aWnd[IDWITHE].Handle)
          RegExpHelp(IDHELP2L, 1);
      }
    }
    else if ((wParam == 0x71 /*VK_F2*/) || (wParam == 0x73 /*VK_F4*/))
    {
      if ((! Ctrl()) && (! Shift()))
        EditFRT(2);
    }
    else if (wParam == 0x0D /*VK_RETURN*/)
    {
      if ((! Ctrl()) && (! Shift()))
      {
        if (oSys.Call("User32::GetDlgCtrlID", hWndFocus) < IDNEWB)
          SetFRTtoFR();
      }
    }
    else if (wParam == 0x1B /*VK_ESCAPE*/)
      oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 0x004E /*WM_NOTIFY*/)
  {
    if (wParam == IDNAMELV)
    {
      switch (AkelPad.MemRead(lParam + 8, DT_DWORD))
      {
        case -101 : //LVN_ITEMCHANGED
          if (AkelPad.MemRead(lParam + 20 /*NMLISTVIEW.uNewState*/, DT_DWORD) & 0x2 /*LVIS_SELECTED*/)
            RefreshViewFRT();
          break;
        case -3 : //NM_DBLCLK
          if (AkelPad.MemRead(lParam + 12 /*NMITEMACTIVATE.iItem*/, DT_DWORD) == -1)
            SetCurSelLV(GetCurFocLV());
          else
            SetFRTtoFR();
          break;
        case -2 : //NM_CLICK
        case -5 : //NM_RCLICK
        case -6 : //NM_RDBLCLK
          if (AkelPad.MemRead(lParam + 12 /*NMITEMACTIVATE.iItem*/, DT_DWORD) == -1)
            SetCurSelLV(GetCurFocLV());
          break;
      }
    }
    else if ((wParam == IDHELP1L) || (wParam == IDHELP2L))
    {
      if (AkelPad.MemRead(lParam + 8, DT_DWORD) == -2 /*NM_CLICK*/)
        RegExpHelp(wParam, 1);
    }
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    var nLowParam = LoWord(wParam);
    var nHiwParam = HiWord(wParam);

    if ((nLowParam == IDWHATE) || (nLowParam == IDWITHE))
    {
      if ((nHiwParam == 0x0300 /*EN_CHANGE*/) && (oSys.Call("User32::GetFocus") == lParam))
        SetEditTextToLV(nLowParam, lParam);
    }
    else if ((nLowParam >= IDMATCHC) && (nLowParam <= IDESCSEQ))
      CheckButtonsFRT(nLowParam);
    else if ((nLowParam >= IDNEWB) && (nLowParam <= IDEDITB))
      EditFRT(nLowParam - IDNEWB);
    else if (nLowParam == IDDELB)
      DeleteFRT();
    else if (nLowParam == IDOKB)
      SetFRTtoFR();
    else if (nLowParam == IDCLOSEB)
      oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    AkelPad.WindowUnsubClass(aWnd[IDWHATE].Handle);
    AkelPad.WindowUnsubClass(aWnd[IDWITHE].Handle);

    oSys.Call("User32::GetWindowRect", hWnd, lpBuffer);
    nFRTW   = AkelPad.MemRead(lpBuffer +  8, DT_DWORD) - AkelPad.MemRead(lpBuffer,      DT_DWORD);
    nFRTH   = AkelPad.MemRead(lpBuffer + 12, DT_DWORD) - AkelPad.MemRead(lpBuffer +  4, DT_DWORD);
    nFRTSel = GetCurSelLV();

    WriteFRT();
    oSys.Call("User32::EnableWindow", hDlgWnd, 1);
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

function EditCallbackFRT(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 256) //WM_KEYDOWN
  {
    if ((wParam == 9 /*VK_TAB*/) && Ctrl())
      AkelPad.WindowNoNextProc(aSubClassFRT[oSys.Call("User32::GetDlgCtrlID", hWnd)]);
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

function ResizeFRT(hWnd)
{
  var nSBW = 0;
  var nW, nH, nEW, nEH, nBW;
  var i;

  oSys.Call("User32::GetClientRect", hWnd, lpBuffer);
  nW  = AkelPad.MemRead(lpBuffer +  8, DT_DWORD);
  nH  = AkelPad.MemRead(lpBuffer + 12, DT_DWORD);
  nEW = Math.round((nW - 30) / 2);
  nEH = Math.round((nH - 160 - 21) / 2);
  nBW = (nW - (IDCLOSEB - IDNEWB) * 5 - 2 * 10) / (IDCLOSEB - IDNEWB + 1);

  oSys.Call("User32::SetWindowPos",
            aWnd[IDNAMELV].Handle, 0,
            10,
            10,
            nEW,
            nH - 30 - 21,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDWHATS].Handle, 0,
            nW - nEW - 10,
            10,
            nEW,
            13,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDWITHS].Handle, 0,
            nW - nEW - 10,
            nH - 125 - 21 - nEH,
            nEW,
            13,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDHELP1L].Handle, 0,
            nW - aLink[IDHELP1L].W - 10,
            10,
            aLink[IDHELP1L].W,
            13,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDHELP2L].Handle, 0,
            nW - aLink[IDHELP2L].W - 10,
            nH - 125 - 21 - nEH,
            aLink[IDHELP2L].W,
            13,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDWHATE].Handle, 0,
            nW - nEW - 10,
            25,
            nEW,
            nEH,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDWITHE].Handle, 0,
            nW - nEW - 10,
            nH - 110 - 21 - nEH,
            nEW,
            nEH,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  for (i = IDMATCHC; i <= IDESCSEQ; ++i)
  {
    oSys.Call("User32::SetWindowPos",
              aWnd[i].Handle, 0,
              nW - nEW - 10,
              nH - 100 - 21 + 20 * (i - IDMATCHC),
              nEW,
              16,
              0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  }
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

  AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x101E /*LVM_SETCOLUMNWIDTH*/, 0, nEW - nSBW);
  AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x1013 /*LVM_ENSUREVISIBLE*/, GetCurSelLV(), false);

  AkelPad.SendMessage(aWnd[IDWHATE].Handle, 3242 /*AEM_SETWORDWRAP*/, 0x2 /*AEWW_SYMBOL*/, 0);
  AkelPad.SendMessage(aWnd[IDWITHE].Handle, 3242 /*AEM_SETWORDWRAP*/, 0x2 /*AEWW_SYMBOL*/, 0);
}

function RefreshViewFRT()
{
  var nItem   = GetCurSelLV();
  var bIsItem = (nItem > -1);
  var sParams = bIsItem ? GetTextLV(nItem, 3) : "";
  var i;

  for (i = IDWHATE; i <= IDWITHE; ++i)
  {
    oSys.Call("User32::SetWindowTextW", aWnd[i].Handle, bIsItem ? GetTextLV(nItem, i - IDWHATE + 1) : "");
    oSys.Call("User32::EnableWindow", aWnd[i].Handle, bIsItem);
  }

  for (i = IDMATCHC; i <= IDESCSEQ; ++i)
  {
    AkelPad.SendMessage(aWnd[i].Handle, 0x00F1 /*BM_SETCHECK*/, parseInt(sParams.substr(i - IDMATCHC, 1)), 0);
    oSys.Call("User32::EnableWindow", aWnd[i].Handle, bIsItem);
  }

  for (i = IDEDITB; i <= IDDELB; ++i)
    oSys.Call("User32::EnableWindow", aWnd[i].Handle, bIsItem);

  ShowHelpLinksFRT();
}

function SetEditTextToLV(nID, hWnd)
{
  oSys.Call("User32::GetWindowTextW", hWnd, lpBuffer, nBufSize / 2);
  SetTextLV(GetCurSelLV(), nID - IDWHATE + 1, AkelPad.MemRead(lpBuffer, DT_UNICODE).replace(/[\r\n\t]/g, ""));
  bChangeFRT = true;
}

function CheckButtonsFRT(nID)
{
  var sParams = "";
  var i;

  if ((nID == IDREGEXP) && AkelPad.SendMessage(aWnd[IDREGEXP].Handle, 0x00F0 /*BM_GETCHECK*/, 0, 0))
    AkelPad.SendMessage(aWnd[IDESCSEQ].Handle, 0x00F1 /*BM_SETCHECK*/, 0, 0);
  else if ((nID == IDESCSEQ) && AkelPad.SendMessage(aWnd[IDESCSEQ].Handle, 0x00F0 /*BM_GETCHECK*/, 0, 0))
    AkelPad.SendMessage(aWnd[IDREGEXP].Handle, 0x00F1 /*BM_SETCHECK*/, 0, 0);

  ShowHelpLinksFRT();

  for (i = IDMATCHC; i <= IDESCSEQ; ++i)
    sParams += AkelPad.SendMessage(aWnd[i].Handle, 0x00F0 /*BM_GETCHECK*/, 0, 0).toString();

  SetTextLV(GetCurSelLV(), 3, sParams);

  bChangeFRT = true;
}

function ShowHelpLinksFRT()
{
  bShow = AkelPad.SendMessage(aWnd[IDREGEXP].Handle, 0x00F0 /*BM_GETCHECK*/, 0, 0);

  oSys.Call("User32::ShowWindow", aWnd[IDHELP1L].Handle, bShow);
  oSys.Call("User32::ShowWindow", aWnd[IDHELP2L].Handle, bShow);
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

function SetTextLV(nItem, nSubItem, sText)
{
  AkelPad.MemCopy(lpLVITEM + 8, nSubItem, DT_DWORD);
  AkelPad.MemCopy(lpBuffer, sText, DT_UNICODE);
  AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x1074 /*LVM_SETITEMTEXTW*/, nItem, lpLVITEM);
}

function InsertItemLV(aField)
{
  var nItem;
  var i;

  AkelPad.MemCopy(lpLVITEM + 8, 0, DT_DWORD);
  AkelPad.MemCopy(lpBuffer, aField[0], DT_UNICODE);
  nItem = AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x104D /*LVM_INSERTITEMW*/, 0, lpLVITEM);

  for (i = 1; i < 4; ++i)
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
  var aText      = [sTxtName, sTxtFindWhat, sTxtReplaceWith, ""];
  var i;

  AkelPad.MemCopy(lpLVCOLUMN, 6 /*mask=LVCF_WIDTH|LVCF_TEXT*/, DT_DWORD);
  AkelPad.MemCopy(lpLVCOLUMN + 12, lpBuffer, DT_DWORD);

  for (i = 0; i < 4; ++i)
  {
    AkelPad.MemCopy(lpBuffer, aText[i], DT_UNICODE);
    AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x1061 /*LVM_INSERTCOLUMNW*/, i, lpLVCOLUMN);
  }

  AkelPad.SendMessage(aWnd[IDNAMELV].Handle, 0x1036 /*LVM_SETEXTENDEDLISTVIEWSTYLE*/, 0x0020 /*LVS_EX_FULLROWSELECT*/, 0x0020);
  AkelPad.MemFree(lpLVCOLUMN);
}

function FillLV()
{
  var sFRTName = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + "_templates.tsv";
  var aRecord;
  var aField;
  var i;

  if (oFSO.FileExists(sFRTName))
    aRecord = AkelPad.ReadFile(sFRTName).split("\r\n");
  else
  {
    aRecord    = ["Empty lines\t^[ \\t]*$\\n*\t\t0010"];
    bChangeFRT = true;
  }

  for (i = 0; i < aRecord.length; ++i)
  {
    aField = aRecord[i].split("\t");

    if (aField[0])
    {
      while (aField.length < 4)
        aField[aField.length] = "";

      while (aField[3].length < 4)
        aField[3] += "0";

      aField[3] = aField[3].replace(/[^1]/g, "0");

      InsertItemLV(aField);
    }
  }

  if (nFRTSel > GetItemCountLV() - 1)
    nFRTSel = GetItemCountLV() - 1;
  if (nFRTSel < 0)
    nFRTSel = 0;

  SetCurSelLV(nFRTSel);
}

function WriteFRT()
{
  if (bChangeFRT)
  {
    var oFile  = oFSO.OpenTextFile(WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + "_templates.tsv", 2, true, -1);
    var nItems = GetItemCountLV();
    var sText  = "";
    var i;

    bChangeFRT = false;

    for (i = 0; i < nItems; ++i)
      sText += GetTextLV(i, 0) + "\t" + GetTextLV(i, 1) + "\t" + GetTextLV(i, 2) + "\t" + GetTextLV(i, 3) + "\r\n";

    oFile.Write(sText);
    oFile.Close();
  }
}

function EditFRT(nType)
{
  var nItem   = GetCurSelLV();
  var aField  = [];
  var sParams = "";
  var sCaption;
  var i;

  if (nType == 1) //Add
  {
    GetWhatWithFR();
    sCaption = sTxtAdd;
    aField = [
      "",
      sWhatText,
      (nDlgType == MLT_REPLACE) ? sWithText : "",
      AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_MATCHCASE), 0x00F0 /*BM_GETCHECK*/, 0, 0).toString(),
      AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_WHOLEWORD), 0x00F0 /*BM_GETCHECK*/, 0, 0).toString(),
      AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_REGEXP),    0x00F0 /*BM_GETCHECK*/, 0, 0).toString(),
      AkelPad.SendMessage(oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_ESCAPESEQ), 0x00F0 /*BM_GETCHECK*/, 0, 0).toString()];
  }
  else
  {
    if (nType == 0) //New
      sCaption = sTxtNew;
    else //Edit
    {
      if (nItem < 0)
        return;
      sCaption = sTxtEdit;
    }

    for (i = 0; i < 3; ++i)
      aField[i] = (nItem < 0) ? "" : GetTextLV(nItem, i);

    if (nItem > -1)
      sParams = GetTextLV(nItem, 3);

    for (i = 3; i < 7; ++i)
      aField[i] = sParams.substr(i - 3, 1);
  }

  aField = InputBox(hWndFRT, sCaption, [sTxtName + ":", sTxtFindWhat + ":", sTxtReplaceWith + ":", sTxtMatchCase + " " + sTxt1Yes0No + ":", sTxtWholeWord + ":", sTxtRegExp + ":", sTxtEscSeq + ":"], aField, 0, "CheckInputFRT", nType);

  if (aField)
  {
    if (nType == 2) //Edit
      DeleteItemLV(nItem)

    for (i = 0; i < 3; ++i)
      aField[i] = aField[i].replace(/[\r\n\t]/g, "");

    for (i = 3; i < 7; ++i)
    {
      if (aField[i] != "1")
        aField[i] = "0";
    }

    if ((aField[5] == "1") && (aField[6] == "1"))
      aField[5] = "0";

    aField[3] += aField[4] + aField[5] + aField[6]
    aField.splice(4, 3);

    SetCurSelLV(InsertItemLV(aField));
    bChangeFRT = true;
  }
}

function CheckInputFRT(hWnd, aField, nType)
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

function DeleteFRT()
{
  var nItem = GetCurSelLV();

  if (nItem > -1)
  {
    if (QuestionBox(hWndFRT, '"' + GetTextLV(nItem, 0) + '"\n\n' + sTxtWantRemove, sTxtDelete))
    {
      DeleteItemLV(nItem);

      if (nItem == GetItemCountLV())
        --nItem;

      SetCurSelLV(nItem);
      RefreshViewFRT();
      bChangeFRT = true;

      if (! oSys.Call("User32::IsWindowEnabled", oSys.Call("User32::GetFocus")))
        oSys.Call("User32::SetFocus", aWnd[IDNAMELV].Handle);
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

function RegExpHelp(nHelpID, bFRT)
{
  var hMenu    = oSys.Call("User32::CreatePopupMenu");
  var nString  = 0x0000; //MF_STRING
  var nDisable = 0x0002; //MF_DISABLED
  var nBreak   = 0x0060; //MF_MENUBREAK|MF_MENUBARBREAK
  var nSepar   = 0x0800; //MF_SEPARATOR
  var hFromPos;
  var hEdit;
  var hWndOwn;
  var aMenu;
  var nMenuX;
  var nMenuY;
  var nCmd;
  var i;

  if (nHelpID == IDHELP1L)
  {
    if (bFRT)
    {
      hFromPos = aWnd[IDWHATE].Handle;
      hEdit    = aWnd[IDWHATE].Handle;
    }
    else
    {
      hFromPos = oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_FIND);
      hEdit    = hDlgWhatE;
    }

    aMenu = [
      [nString,  "\\(",     sHlpSpecChars],
      [nString,  "\\f",     sHlpFF],
      [nString,  "\\n",     sHlpAnyNL],
      [nString,  "\\r",     sHlpAnyNL],
      [nString,  "\\t",     sHlpTab],
      [nString,  "\\v",     sHlpVTab],
      [nString,  "\\xFF",   sHlpCharHex],
      [nString,  "\\uFFFF", sHlpUniCharHex],
      [nString,  ".",       sHlpAnyChar],
      [nString,  "\\d",     sHlpDigit],
      [nString,  "\\D",     sHlpNonDigit],
      [nString,  "\\s",     sHlpWhiteSp],
      [nString,  "\\S",     sHlpNonWhiteSp],
      [nString,  "\\w",     sHlpWordChar],
      [nString,  "\\W",     sHlpNonWordChar],
      [nSepar,   0, 0],
      [nString,  "^",       sHlpBeginLine],
      [nString,  "$",       sHlpEndLine],
      [nString,  "\\b",     sHlpWordBoun],
      [nString,  "\\B",     sHlpNonWordBoun],
      [nBreak,   "ab|xy",   sHlpAlternative],
      [nString,  "[abc]",   sHlpCharSet],
      [nString,  "[^abc]",  sHlpNegCharSet],
      [nString,  "[a-z]",   sHlpRange],
      [nString,  "[^a-z]",  sHlpNegRange],
      [nSepar,   0, 0],
      [nString,  "(ab)",    sHlpCapture],
      [nString,  "(?:ab)",  sHlpNotCapture],
      [nString,  "(?=ab)",  sHlpFollow],
      [nString,  "(?!ab)",  sHlpNotFollow],
      [nString,  "\\9",     sHlpBackrefer9],
      [nString,  "\\99",    sHlpBackrefer99],
      [nSepar,   0, 0],
      [nString,  "?",       sHlpZeroOrOne],
      [nString,  "*",       sHlpZeroOrMore],
      [nString,  "+",       sHlpOneOrMore],
      [nString,  "{3}",     sHlpexactly],
      [nString,  "{3,}",    sHlpAtLeast],
      [nString,  "{3,7}",   sHlpFromTo],
      [nDisable, "",        sHlpNonGreedy]];
  }
  else
  {
    if (bFRT)
    {
      hFromPos = aWnd[IDWITHE].Handle;
      hEdit    = aWnd[IDWITHE].Handle;
    }
    else
    {
      hFromPos = oSys.Call("User32::GetDlgItem", hDlgWnd, IDC_SEARCH_REPLACE);
      hEdit    = hDlgWithE;
    }

    aMenu = [
      [nString, "\\\\",    sHlpBackslash],
      [nString, "\\f",     sHlpFF],
      [nString, "\\n",     sHlpNL],
      [nString, "\\r",     sHlpNL],
      [nString, "\\t",     sHlpTab],
      [nString, "\\v",     sHlpVTab],
      [nString, "\\xFF",   sHlpCharHex],
      [nString, "\\uFFFF", sHlpUniCharHex],
      [nSepar,  0, 0],
      [nString, "\\0",     sHlpEntireStr],
      [nString, "\\9",     sHlpSubmatch9],
      [nString, "\\99",    sHlpSubmatch99]];
  }

  oSys.Call("User32::GetWindowRect", hFromPos, lpBuffer);
  nMenuX = AkelPad.MemRead(lpBuffer +  0, DT_DWORD);
  nMenuY = AkelPad.MemRead(lpBuffer + 12, DT_DWORD);

  if (bFRT)
  {
    hWndOwn = hWndFRT;
    oSys.Call("User32::SetFocus", hEdit);
  }
  else
    hWndOwn = oSys.Call("User32::CreateWindowExW", 0, "STATIC", 0, 0x90000000 /*WS_POPUP|WS_VISIBLE*/, 0, 0, 0, 0, hDlgWnd, 0, hInstanceDLL, 0);

  for (i = 0; i < aMenu.length; ++i)
    oSys.Call("User32::AppendMenuW", hMenu, aMenu[i][0], i + 1, aMenu[i][1] + "\t" + aMenu[i][2]);

  nCmd = oSys.Call("User32::TrackPopupMenu", hMenu, 0x0180 /*TPM_RETURNCMD|TPM_NONOTIFY*/, nMenuX, nMenuY, 0, hWndOwn, 0);

  oSys.Call("User32::DestroyMenu", hMenu);

  if (! bFRT)
    oSys.Call("User32::DestroyWindow", hWndOwn);

  oSys.Call("User32::SetFocus", hEdit);

  if (nCmd)
    oSys.Call("User32::SendMessageW", hEdit, 0x00C2 /*EM_REPLACESEL*/, 1, aMenu[nCmd - 1][1]);
}

function ReadIni()
{
  var sIniName = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";
  var oError;

  sTxtFRTempl     = "Find/Replace templates";
  sTxtTemplates   = "Templates";
  sTxtName        = "Name";
  sTxtFindWhat    = "Find - What";
  sTxtReplaceWith = "Replace - With";
  sTxtMatchCase   = "Match case";
  sTxtWholeWord   = "Whole word";
  sTxtRegExp      = "Regular expressions";
  sTxtEscSeq      = "Esc sequences";
  sTxt1Yes0No     = "(1 = Yes, 0 = No)";
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
  sHlpSpecChars   = "()[]{}^$.?+*|\\ special chars";
  sHlpFF          = "form feed \\x0C";
  sHlpAnyNL       = "any new line";
  sHlpTab         = "tab \\x09";
  sHlpVTab        = "vertical tab \\x0B";
  sHlpCharHex     = "character hex code FF";
  sHlpUniCharHex  = "Unicode char hex code FFFF";
  sHlpAnyChar     = "any character (dot)";
  sHlpDigit       = "digit [0-9]";
  sHlpNonDigit    = "non-digit [^0-9]";
  sHlpWhiteSp     = "whitespace [ \\f\\n\\r\\t\\v]";
  sHlpNonWhiteSp  = "non-whitespace";
  sHlpWordChar    = "word character [A-Za-z0-9_]";
  sHlpNonWordChar = "non-word character";
  sHlpBeginLine   = "beginning of line";
  sHlpEndLine     = "end of line";
  sHlpWordBoun    = "word boundary";
  sHlpNonWordBoun = "non-word boundary";
  sHlpAlternative = "alternative ab or xy";
  sHlpCharSet     = "character set, any specified";
  sHlpNegCharSet  = "negative character set";
  sHlpRange       = "range of chars from a to z";
  sHlpNegRange    = "negative range of chars";
  sHlpCapture     = "capture";
  sHlpNotCapture  = "not capture";
  sHlpFollow      = "followed by ab";
  sHlpNotFollow   = "not followed by ab";
  sHlpBackrefer9  = "backreference, range 1-9";
  sHlpBackrefer99 = "backreference, range 01-99";
  sHlpZeroOrOne   = "zero or one times";
  sHlpZeroOrMore  = "zero or more times";
  sHlpOneOrMore   = "one or more times";
  sHlpexactly     = "exactly 3 times";
  sHlpAtLeast     = "at least 3 times";
  sHlpFromTo      = "from 3 to 7 times";
  sHlpBackslash   = "backslash";
  sHlpNL          = "new line";
  sHlpEntireStr   = "entire string matched";
  sHlpSubmatch9   = "9th captured submatch, range 1-9";
  sHlpSubmatch99  = "99th captured submatch, range 01-99";
  sHlpNonGreedy   = "Quantifiers *+{} are non-greedy";

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
    'nFRTW='    + nFRTW    + ';\r\n' +
    'nFRTH='    + nFRTH    + ';\r\n' +
    'nFRTSel='  + nFRTSel  + ';');
  oFile.Close();
}
