// FindReplaceEx.js - ver. 2013-01-06
//
// "Find/Replace" dialog extended version
//
// Usage:
// Call("Scripts::Main", 1, "FindReplaceEx.js")             - "Find" dialog
// Call("Scripts::Main", 1, "FindReplaceEx.js", '-Dlg="R"') - "Replace" dialog
// Arguments:
//   -Dlg
//     "F" - "Find" dialog (default)
//     "R" - "Replace" dialog
//     "G" - "Go to" dialog
//
// If you don't want switching "Find/Replace" <-> "Go to", set manually in FindReplaceEx.ini:
// bGoToDlg=false;

if ((! AkelPad.GetEditWnd()) ||
    AkelPad.ScriptHandle(AkelPad.ScriptHandle(WScript.ScriptName, 3 /*SH_FINDSCRIPT*/), 13 /*SH_GETMESSAGELOOP*/)) /*script already running*/
  WScript.Quit();

var DT_UNICODE = 1;
var DT_DWORD   = 3;
var DT_WORD    = 4;

var MLT_FIND    = 3;
var MLT_REPLACE = 4;
var MLT_GOTO    = 5;

var IDC_SEARCH_FIND    = 3052; //Combobox What
var IDC_SEARCH_REPLACE = 3053; //Combobox With
var IDCANCEL           = 2;

var IDLFIND    = 9997;
var IDLREPLACE = 9998;
var IDLGOTO    = 9999;

var oSys         = AkelPad.SystemFunction();
var hInstanceDLL = AkelPad.GetInstanceDll();
var hMainWnd     = AkelPad.GetMainWnd();
var hGuiFont     = oSys.Call("Gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
var nBufSize     = 1024;
var lpBuffer     = AkelPad.MemAlloc(nBufSize);
var nDlgType     = GetDialogType();
var aLink        = [];
var bContinue    = true;
var hWndDlg;
var hWndWhatE;
var hWndWithE;
var hWndCancel;
var hSubClass;
var sWhatText;
var sWithText;
var i;

//read ini settings
var bGoToDlg = true;
var nDlgX;
var nDlgY;
ReadIni();

aLink[IDLFIND]    = {DlgID: 2004 /*IDD_FIND*/,    Text: "(Ctrl+F)", Visible: false, X: 0, Y: 0, W: 0};
aLink[IDLREPLACE] = {DlgID: 2005 /*IDD_REPLACE*/, Text: "(Ctrl+R)", Visible: false, X: 0, Y: 0, W: 0};
aLink[IDLGOTO]    = {DlgID: 2006 /*IDD_GOTO*/,    Text: "(Ctrl+G)", Visible: false, X: 0, Y: 0, W: 0};

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

  if ((nDlgType == MLT_GOTO) && bGoToDlg)
    ResizeDialog();

  if (hWndWhatE && (typeof sWhatText == "string"))
  {
    oSys.Call("User32::SetWindowTextW", hWndWhatE, sWhatText);
    AkelPad.SendMessage(hWndWhatE, 0x00B1 /*EM_SETSEL*/, 0, -1);
  }

  if (hWndWithE && (typeof sWithText == "string"))
    oSys.Call("User32::SetWindowTextW", hWndWithE, sWithText);

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

function GetDialogType()
{
  var sArg = AkelPad.GetArgValue("Dlg", "F").toUpperCase();

  if (sArg == "R")
    return MLT_REPLACE;
  else if (sArg == "G")
    return MLT_GOTO;
  else
    return MLT_FIND;
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
