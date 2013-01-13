// FindReplaceEx.js - ver. 2013-01-13
//
// "Find/Replace" dialog extended version
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

if (! AkelPad.GetEditWnd())
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

var IDLFIND    = 9997;
var IDLREPLACE = 9998;
var IDLGOTO    = 9999;

var oSys         = AkelPad.SystemFunction();
var hInstanceDLL = AkelPad.GetInstanceDll();
var hMainWnd     = AkelPad.GetMainWnd();
var hGuiFont     = oSys.Call("Gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
var nBufSize     = 1024;
var lpBuffer     = AkelPad.MemAlloc(nBufSize);
var aLink        = [];
var bContinue    = true;
var bFirstTimeFR = true;
var bFirstTimeGT = true;
var nDlgType;
var nMatchC;
var nWholeW;
var nRegExp;
var nEscSeq;
var nDirection;
var nGoTo;
var sDefBut;
var hWndDlg;
var hWndWhatE;
var hWndWithE;
var hWndCancel;
var hSubClass;
var sWhatText;
var sWithText;
var i;

//ini settings
var bGoToDlg = true;
var nDlgX;
var nDlgY;

aLink[IDLFIND]    = {DlgID: 2004 /*IDD_FIND*/,    Text: "(Ctrl+F)", Visible: false, X: 0, Y: 0, W: 0};
aLink[IDLREPLACE] = {DlgID: 2005 /*IDD_REPLACE*/, Text: "(Ctrl+R)", Visible: false, X: 0, Y: 0, W: 0};
aLink[IDLGOTO]    = {DlgID: 2006 /*IDD_GOTO*/,    Text: "(Ctrl+G)", Visible: false, X: 0, Y: 0, W: 0};

GetDialogWnd();
if (hWndDlg && hWndCancel)
  AkelPad.SendMessage(hWndDlg, 273 /*WM_COMMAND*/, IDCANCEL, hWndCancel);

ReadIni();
GetArguments();
GetLinkText();

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
    oSys.Call("User32::SetWindowPos", hWndDlg, 0, nDlgX, nDlgY, 0, 0, 0x15 /*SWP_NOACTIVATE|SWP_NOZORDER|SWP_NOSIZE*/);

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

  for (i = IDLFIND; i <= IDLGOTO; ++i)
  {
    if (aLink[i].Visible)
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
                0);              //lpParam
  }

  oSys.Call("User32::UpdateWindow", hWndDlg);

  hSubClass = AkelPad.WindowSubClass(hWndDlg, DialogCallback, 78 /*WM_NOTIFY*/, 256 /*WM_KEYDOWN*/, 2 /*WM_DESTROY*/);

  AkelPad.ScriptNoMutex();
  AkelPad.WindowGetMessage();
  AkelPad.WindowUnsubClass(hWndDlg);
}

WriteIni();
AkelPad.MemFree(lpBuffer);

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 78) //WM_NOTIFY
  {
    if (AkelPad.MemRead(lParam + 8, DT_DWORD) == -2 /*NM_CLICK*/)
    {
      if (wParam == IDLFIND)
        SwitchDialog(MLT_FIND);
      else if (wParam == IDLREPLACE)
        SwitchDialog(MLT_REPLACE);
      else if (wParam == IDLGOTO)
        SwitchDialog(MLT_GOTO);
    }
  }
  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (Ctrl() && (! Shift()))
    {
      if ((wParam == 0x46 /*F key*/) && ((nDlgType == MLT_REPLACE) || ((nDlgType == MLT_GOTO) && bGoToDlg)))
        SwitchDialog(MLT_FIND);
      else if ((wParam == 0x52 /*R key*/) && ((nDlgType == MLT_FIND) || ((nDlgType == MLT_GOTO) && bGoToDlg)))
        SwitchDialog(MLT_REPLACE);
      else if ((wParam == 0x47 /*G key*/) && ((nDlgType != MLT_GOTO) && bGoToDlg))
        SwitchDialog(MLT_GOTO);
    }
  }
  else if (uMsg == 2) //WM_DESTROY
  {
    GetDialogPos();
    GetEditText();
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

  for (i = IDLFIND; i <= IDLGOTO; ++i)
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

  for (i = IDLFIND; i <= IDLGOTO; ++i)
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
    aLink[IDLREPLACE].X = aLink[IDLGOTO].X = nCancelX;
    aLink[IDLREPLACE].Y = AkelPad.MemRead(lpBuffer + 12, DT_DWORD) - 23;
    aLink[IDLGOTO].Y    = aLink[IDLREPLACE].Y - 20;
    aLink[IDLFIND].Visible    = false;
    aLink[IDLREPLACE].Visible = true;
    aLink[IDLGOTO].Visible    = bGoToDlg;
  }
  else if (nDlgType == MLT_REPLACE)
  {
    aLink[IDLFIND].X = aLink[IDLGOTO].X = nCancelX;
    aLink[IDLFIND].Y = AkelPad.MemRead(lpBuffer + 12, DT_DWORD) - 23;
    aLink[IDLGOTO].Y = aLink[IDLFIND].Y - 20;
    aLink[IDLFIND].Visible    = true;
    aLink[IDLREPLACE].Visible = false;
    aLink[IDLGOTO].Visible    = bGoToDlg;
  }
  else
  {
    aLink[IDLFIND].X    = 10;
    aLink[IDLFIND].Y    = aLink[IDLREPLACE].Y = AkelPad.MemRead(lpBuffer + 12, DT_DWORD) - 23;
    aLink[IDLREPLACE].X = AkelPad.MemRead(lpBuffer + 8, DT_DWORD) - aLink[IDLREPLACE].W - 10;
    aLink[IDLFIND].Visible    = bGoToDlg;
    aLink[IDLREPLACE].Visible = bGoToDlg;
    aLink[IDLGOTO].Visible    = false;
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

function GetEditText()
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

function ReadIni()
{
  var oFSO     = new ActiveXObject("Scripting.FileSystemObject");
  var sIniName = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";
  var oError;

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
  var oFSO  = new ActiveXObject("Scripting.FileSystemObject");
  var oFile = oFSO.OpenTextFile(WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini", 2, true, -1);

  oFile.Write(
    'bGoToDlg=' + bGoToDlg + ';\r\n' +
    'nDlgX='    + nDlgX    + ';\r\n' +
    'nDlgY='    + nDlgY    + ';');
  oFile.Close();
}
