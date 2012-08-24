// PluginText.js - ver. 2012-08-20
//
// Operations on the text from plugins: Coder, ContextMenu, Hotkeys and ToolBar.
// The text is read from plugin settings (.ini file or registry).
//
// Usage:
// Call("Scripts::Main", 1, "PluginText.js")
// Required to include: FileAndStream_functions.js
//
// For the syntax highlighting uses akelmenu.coder by Infocatcher:
// http://infocatcher.ucoz.net/akelpad/coder/_akelmenu.coder
//
// Some keyboard shortcuts:
// F8 (Del) - move text file to the Recycle Bin,
// Shift+F8 (Shift+Del) - remove text file from disk,
// Ctrl+A - select all items on list.

if (! AkelPad.Include("FileAndStream_functions.js"))
  WScript.Quit();

var sTxtNoTexts      = "There are no any texts in plugins settings.";
var sTxtSetInReg     = "Settings stored in registry";
var sTxtSetInIni     = "Settings stored in file AkelPad.ini";
var sTxtDir          = "Directory for text files: ";
var sTxtPlugin       = "Plugin";
var sTxtKeyTextName  = "Key - text name";
var sTxtTextFile     = "Text file associated with the key";
var sTxtEditText     = "Edit plugin text";
var sTxtSaveTextFile = "Save plugin text in text file";
var sTxtEditIniFile  = "Edit .ini file";
var sTxtOpenRegEdit  = "Open in RegEdit";
var sTxtEditTextFile = "Edit text file";
var sTxtLoadText     = "Load text file to plugin key";
var sTxtRenameFile   = "Rename text file";
var sTxtDeleteFile   = "Delete text file";
var sTxtChangeDir    = "Change directory for text files";
var sTxtSaved        = "Saved:";
var sTxtNoSaved      = "No saved:";
var sTxtNoFiles      = "No file(s):";
var sTxtWantSave     = "Do you want to extract selected plugin keys and save in text files?";
var sTxtWantLoad     = "Do you want to load selected text files to plugin keys?";
var sTxtNewName      = "new name:";
var sTxtBadName      = "Illegal name.";
var sTxtBadChar      = "Illegal character in the name.";
var sTxtWantDelete   = "Do you want to delete selected text files?";
var sTxtDeleted      = "Deleted:";
var sTxtNoDeleted    = "No deleted:";
var sTxtEnvVar       = "environment variable";
var sTxtAkelDir      = "AkelPad directory";
var sTxtPlugDir      = "plugins directory";
var sTxtDirNoExists  = "This directory does not exist. Do you want to create it?";
var sTxtDirCreFail   = "Failed to create this directory.";

var DT_UNICODE   = 1;
var DT_DWORD     = 3;
var DT_WORD      = 4;
var DT_BYTE      = 5;
var oSys         = AkelPad.SystemFunction();
var hInstanceDLL = AkelPad.GetInstanceDll();
var sClassName   = "AkelPad::Scripts::" + WScript.ScriptName + "::" + hInstanceDLL;
var sScriptName  = "Plugin Text";
var bSetInReg    = IsSettingsInRegistry();
var nBufSize     = 1024;
var lpBuffer     = AkelPad.MemAlloc(nBufSize);
var lpLVITEM     = AkelPad.MemAlloc(15 * 4); //sizeof(LVITEM)

AkelPad.MemCopy(lpLVITEM,      0x0001 /*LVIF_TEXT*/, DT_DWORD);
AkelPad.MemCopy(lpLVITEM + 20, lpBuffer, DT_DWORD);
AkelPad.MemCopy(lpLVITEM + 24, nBufSize, DT_DWORD);

var nWndPosX  = 240;
var nWndPosY  = 160;
var nWndPosW  = 460;
var nWndPosH  = 340;
var oPlugText = {};
var sTextDirS;
var hWndDlg;
var hSubClass;

ReadWriteIni(false);

if ((! sTextDirS) || (! IsDirExists(ExpandDirName(sTextDirS))))
  sTextDirS = AkelPad.GetAkelDir(4 /*ADTYPE_PLUGS*/) + "\\";
else if (sTextDirS.slice(-1) != "\\")
  sTextDirS += "\\";

var CLASS = 0;
var HWND  = 1;
var STYLE = 2;
var TXT   = 3;

var aWnd     = [];
var IDINFOS  = 2000;
var IDDIRS   = 2001;
var IDPLUGLV = 2002;
var IDF1B    = 2003;
var IDF2B    = 2004;
var IDF3B    = 2005;
var IDF4B    = 2006;
var IDF5B    = 2007;
var IDF7B    = 2008;
var IDF8B    = 2009;
var IDF9B    = 2010;

//0x50000000 - WS_VISIBLE|WS_CHILD
//0x50000080 - WS_VISIBLE|WS_CHILD|SS_NOPREFIX
//0x50808009 - WS_VISIBLE|WS_CHILD|WS_BORDER|LVS_NOSORTHEADER|LVS_SHOWSELALWAYS|LVS_REPORT
//Windows       CLASS,          HWND,      STYLE, TXT
aWnd[IDINFOS ]=["STATIC",          0, 0x50000080, bSetInReg ? sTxtSetInReg : sTxtSetInIni];
aWnd[IDDIRS  ]=["STATIC",          0, 0x50000080, sTxtDir + ExpandDirName(sTextDirS)];
aWnd[IDPLUGLV]=["SysListView32",   0, 0x50808009, ""];
aWnd[IDF1B   ]=["BUTTON",          0, 0x50000000, sTxtEditText     + " (F1)"];
aWnd[IDF2B   ]=["BUTTON",          0, 0x50000000, sTxtSaveTextFile + " (F2)"];
aWnd[IDF3B   ]=["BUTTON",          0, 0x50000000, (bSetInReg ? sTxtOpenRegEdit : sTxtEditIniFile) + " (F3)"];
aWnd[IDF4B   ]=["BUTTON",          0, 0x50000000, sTxtEditTextFile + " (F4)"];
aWnd[IDF5B   ]=["BUTTON",          0, 0x50000000, sTxtLoadText     + " (F5)"];
aWnd[IDF7B   ]=["BUTTON",          0, 0x50000000, sTxtRenameFile   + " (F7)"];
aWnd[IDF8B   ]=["BUTTON",          0, 0x50000000, sTxtDeleteFile   + " (F8)"];
aWnd[IDF9B   ]=["BUTTON",          0, 0x50000000, sTxtChangeDir    + " (F9)"];

if (AkelPad.WindowRegisterClass(sClassName))
{
  hWndDlg = oSys.Call("user32::CreateWindowEx" + _TCHAR,
                      0,                    //dwExStyle
                      sClassName,           //lpClassName
                      sScriptName,          //lpWindowName
                      0x90CC0000,           //WS_POPUP|WS_VISIBLE|WS_CAPTION|WS_SYSMENU|WS_SIZEBOX
                      nWndPosX,             //x
                      nWndPosY,             //y
                      nWndPosW,             //nWidth
                      nWndPosH,             //nHeight
                      AkelPad.GetMainWnd(), //hWndParent
                      0,                    //ID
                      hInstanceDLL,         //hInstance
                      DialogCallback);      //Script function callback. To use it class must be registered by WindowRegisterClass.

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

AkelPad.MemFree(lpBuffer);
AkelPad.MemFree(lpLVITEM);

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    var hGuiFont = oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
    var i;

    for (i = 2000; i < aWnd.length; ++i)
    {
      aWnd[i][HWND] =
        oSys.Call("user32::CreateWindowEx" + _TCHAR,
                  0,              //dwExStyle
                  aWnd[i][CLASS], //lpClassName
                  0,              //lpWindowName
                  aWnd[i][STYLE], //dwStyle
                  0,              //x
                  0,              //y
                  0,              //nWidth
                  0,              //nHeight
                  hWnd,           //hWndParent
                  i,              //ID
                  hInstanceDLL,   //hInstance
                  0);             //lpParam

      //Set font and text
      AkelPad.SendMessage(aWnd[i][HWND], 48 /*WM_SETFONT*/, hGuiFont, true);
      oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[i][HWND], aWnd[i][TXT]);
    }

    //To capture NM_RETURN and LVN_KEYDOWN in ListView
    hSubClass = AkelPad.WindowSubClass(aWnd[IDPLUGLV][HWND], ListCallback, 0x87 /*WM_GETDLGCODE*/, 256 /*WM_KEYDOWN*/);

    //Insert columns and set extended style to ListView
    InsertColumnsLV();

    FillPlugList();
    if (! GetItemCountLV())
    {
      AkelPad.MessageBox(hWnd, sTxtNoTexts, sScriptName, 0x00000030 /*MB_ICONWARNING*/);
      AkelPad.SendMessage(hWnd, 16 /*WM_CLOSE*/, 0, 0);
    }
  }

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("user32::SetFocus", aWnd[IDPLUGLV][HWND]);

  else if (uMsg == 36) //WM_GETMINMAXINFO
  {
    var oRect = {};
    GetWindowPos(oSys.Call("user32::GetDesktopWindow"), oRect);
    AkelPad.MemCopy(lParam + 24, 350,          DT_DWORD); //ptMinTrackSize_x
    AkelPad.MemCopy(lParam + 28, 271,          DT_DWORD); //ptMinTrackSize_y
    AkelPad.MemCopy(lParam + 32, oRect.W - 30, DT_DWORD); //ptMaxTrackSize_x
    AkelPad.MemCopy(lParam + 36, oRect.H - 30, DT_DWORD); //ptMaxTrackSize_y
  }

  else if (uMsg == 5) //WM_SIZE
    ResizeWindow(hWnd);

  else if (uMsg == 15) //WM_PAINT
    PaintSizeGrip(hWnd);

  else if ((uMsg == 0x004E /*WM_NOTIFY*/) && (wParam == IDPLUGLV))
  {
    if (AkelPad.MemRead(lParam + 8, DT_DWORD) == -155 /*LVN_KEYDOWN*/)
    {
      switch (AkelPad.MemRead(lParam + 12, DT_WORD))
      {
        case 0x70 /*VK_F1*/ :
          if ((! Ctrl()) && (! Shift()) && (! Alt()))
            EditText();
          break;
        case 0x71 /*VK_F2*/ :
          if ((! Ctrl()) && (! Shift()) && (! Alt()))
            EditText(1);
          break;
        case 0x72 /*VK_F3*/ :
          if ((! Ctrl()) && (! Shift()) && (! Alt()))
            bSetInReg ? OpenInRegEdit() : EditIniFile();
          break;
        case 0x73 /*VK_F4*/ :
          if ((! Ctrl()) && (! Shift()) && (! Alt()))
            EditTextFile();
          break;
        case 0x74 /*VK_F5*/ :
          if ((! Ctrl()) && (! Shift()) && (! Alt()))
            LoadTextFileToPlugin();
          break;
        case 0x76 /*VK_F7*/ :
          if ((! Ctrl()) && (! Shift()) && (! Alt()))
            RenameTextFile();
          break;
        case 0x77 /*VK_F8*/ :
        case 0x2E /*VK_DELETE*/ :
          if ((! Ctrl()) && (! Alt()))
            DeleteTextFile(! Shift());
          break;
        case 0x78 /*VK_F9*/ :
          if ((! Ctrl()) && (! Shift()) && (! Alt()))
            ChangeTextsDir();
          break;
        case 0x41 /*A key*/ :
          if (Ctrl() && (! Shift()) && (! Alt()))
          {
            for (var i = 0; i < GetItemCountLV(); ++i)
               SetSelLV(i);
          }
          break;
        case 0x1B /*VK_ESCAPE*/ :
          if ((! Ctrl()) && (! Shift()) && (! Alt()))
            oSys.Call("user32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
      }
    }
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    var nLowParam = wParam & 0xFFFF;

    if ((nLowParam >= IDF1B) && (nLowParam <= IDF9B))
    {
      AkelPad.SendMessage(lParam, 0x00F4 /*BM_SETSTYLE*/, 0 /*BS_PUSHBUTTON*/, 0);

      if (nLowParam == IDF1B)
        EditText();
      else if (nLowParam == IDF2B)
        EditText(1);
      else if (nLowParam == IDF3B)
        bSetInReg ? OpenInRegEdit() : EditIniFile();
      else if (nLowParam == IDF4B)
        EditTextFile();
      else if (nLowParam == IDF5B)
        LoadTextFileToPlugin();
      else if (nLowParam == IDF7B)
        RenameTextFile();
      else if (nLowParam == IDF8B)
        DeleteTextFile();
      else if (nLowParam == IDF9B)
        ChangeTextsDir();

      oSys.Call("user32::SetFocus", aWnd[IDPLUGLV][HWND]);
    }
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    AkelPad.WindowUnsubClass(aWnd[IDPLUGLV][HWND]);
    ReadWriteIni(true);
    oSys.Call("user32::DestroyWindow", hWnd); //Destroy dialog
  }

  else if (uMsg == 2) //WM_DESTROY
    oSys.Call("user32::PostQuitMessage", 0); //Exit message loop

  return 0;
}

function ListCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 0x87) //WM_GETDLGCODE
  {
    AkelPad.WindowNoNextProc(hSubClass);
    return 0x4; //DLGC_WANTALLKEYS
  }

  return 0;
}

function Shift()
{
  return Boolean(oSys.Call("user32::GetKeyState", 0x10 /*VK_SHIFT*/) & 0x8000);
}

function Ctrl()
{
  return Boolean(oSys.Call("user32::GetKeyState", 0x11 /*VK_CONTROL*/) & 0x8000);
}

function Alt()
{
  return Boolean(oSys.Call("user32::GetKeyState", 0x12 /*VK_MENU*/) & 0x8000);
}

function GetWindowPos(hWnd, oRect)
{
  var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)

  oSys.Call("user32::GetWindowRect", hWnd, lpRect);

  oRect.X = AkelPad.MemRead(lpRect,      DT_DWORD);
  oRect.Y = AkelPad.MemRead(lpRect +  4, DT_DWORD);
  oRect.W = AkelPad.MemRead(lpRect +  8, DT_DWORD) - oRect.X;
  oRect.H = AkelPad.MemRead(lpRect + 12, DT_DWORD) - oRect.Y;

  AkelPad.MemFree(lpRect);
}

function ResizeWindow(hWnd)
{
  var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)
  var nW, nH, nBW;
  var i;

  oSys.Call("user32::GetClientRect", hWnd, lpRect);
  nW  = AkelPad.MemRead(lpRect +  8, DT_DWORD);
  nH  = AkelPad.MemRead(lpRect + 12, DT_DWORD);
  nBW = Math.round((nW - 3 * 8) / 2);
  AkelPad.MemFree(lpRect);

  for (i = 0; i < 2; ++i)
  {
    oSys.Call("user32::SetWindowPos",
              aWnd[IDINFOS + i][HWND], 0,
              8,
              10 + 15 * i,
              nW - 2 * 8,
              13,
              0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
  }

  oSys.Call("user32::SetWindowPos",
            aWnd[IDPLUGLV][HWND], 0,
            8,
            45,
            nW - 2 * 8,
            nH - 4 * 23 - 3 * 2 - 2 * 8 - 45,
            0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);

  for (i = 0; i < 4; ++i)
  {
    oSys.Call("user32::SetWindowPos",
              aWnd[IDF1B + i][HWND], 0,
              8,
              nH - 4 * 23 - 3 * 2 - 8 + 25 * i,
              nBW,
              23,
              0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);

    oSys.Call("user32::SetWindowPos",
              aWnd[IDF5B + i][HWND], 0,
              nW - nBW - 8,
              nH - 4 * 23 - 3 * 2 - 8 + 25 * i,
              nBW,
              23,
              0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
  }

  for (i = 0; i < 3; ++i)
    AkelPad.SendMessage(aWnd[IDPLUGLV][HWND], 0x101E /*LVM_SETCOLUMNWIDTH*/, i, -2 /*LVSCW_AUTOSIZE_USEHEADER*/);

  AkelPad.SendMessage(aWnd[IDPLUGLV][HWND], 0x1013 /*LVM_ENSUREVISIBLE*/, GetNextSelLV(-1), false);
}

function PaintSizeGrip(hWnd)
{
  var lpPaint = AkelPad.MemAlloc(64); //sizeof(PAINTSTRUCT)
  var lpRect  = AkelPad.MemAlloc(16); //sizeof(RECT)
  var hDC;

  if (hDC = oSys.Call("user32::BeginPaint", hWnd, lpPaint))
  {
    oSys.Call("user32::GetClientRect", hWnd, lpRect);

    AkelPad.MemCopy(lpRect,     AkelPad.MemRead(lpRect +  8, DT_DWORD) - oSys.Call("user32::GetSystemMetrics",  2 /*SM_CXVSCROLL*/), DT_DWORD);
    AkelPad.MemCopy(lpRect + 4, AkelPad.MemRead(lpRect + 12, DT_DWORD) - oSys.Call("user32::GetSystemMetrics", 20 /*SM_CYVSCROLL*/), DT_DWORD);

    oSys.Call("user32::DrawFrameControl", hDC, lpRect, 3 /*DFC_SCROLL*/, 0x8 /*DFCS_SCROLLSIZEGRIP*/);
    oSys.Call("user32::EndPaint", hWnd, lpPaint);
  }

  AkelPad.MemFree(lpPaint);
  AkelPad.MemFree(lpRect);
}

function IsSettingsInRegistry()
{
  if  (AkelPad.SendMessage(AkelPad.GetMainWnd(), 1222 /*AKD_GETMAININFO*/, 5 /*MI_SAVESETTINGS*/, 0) == 2 /*SS_INI*/)
    return false;

  return true;
}

function GetItemCountLV()
{
  return AkelPad.SendMessage(aWnd[IDPLUGLV][HWND], 0x1004 /*LVM_GETITEMCOUNT*/, 0, 0);
}

function GetItemTextLV(nItem, nSubItem)
{
  AkelPad.MemCopy(lpLVITEM + 8, nSubItem, DT_DWORD);
  AkelPad.SendMessage(aWnd[IDPLUGLV][HWND], 0x1073 /*LVM_GETITEMTEXTW*/, nItem, lpLVITEM);
  return AkelPad.MemRead(lpBuffer, _TSTR);
}

function SetItemTextLV(nItem, nSubItem, sText)
{
  AkelPad.MemCopy(lpLVITEM + 4, nItem,    DT_DWORD);
  AkelPad.MemCopy(lpLVITEM + 8, nSubItem, DT_DWORD);
  AkelPad.MemCopy(lpBuffer, sText, _TSTR);

  AkelPad.SendMessage(aWnd[IDPLUGLV][HWND], 0x1074 /*LVM_SETITEMTEXTW*/, nItem, lpLVITEM);
}

function GetNextSelLV(nItem)
{
  return AkelPad.SendMessage(aWnd[IDPLUGLV][HWND], 0x100C /*LVM_GETNEXTITEM*/, nItem, 0x0002 /*LVNI_SELECTED*/);
}

function GetSelArrayLV()
{
  var aSel  = [];
  var nItem = -1;

  while (true)
  {
    nItem = GetNextSelLV(nItem);

    if (nItem < 0)
      break;

    aSel.push(nItem);
  }

  return aSel;
}

function SetSelLV(nItem)
{
  AkelPad.MemCopy(lpLVITEM + 12, 0x0003 /*LVIS_SELECTED|LVIS_FOCUSED*/, DT_DWORD);
  AkelPad.MemCopy(lpLVITEM + 16, 0x0003 /*LVIS_SELECTED|LVIS_FOCUSED*/, DT_DWORD);
  AkelPad.SendMessage(aWnd[IDPLUGLV][HWND], 0x102B /*LVM_SETITEMSTATE*/, nItem, lpLVITEM);
  AkelPad.SendMessage(aWnd[IDPLUGLV][HWND], 0x1013 /*LVM_ENSUREVISIBLE*/, nItem, false);
}

function IsItemSel(nItem)
{
  return Boolean(AkelPad.SendMessage(aWnd[IDPLUGLV][HWND], 0x102C /*LVM_GETITEMSTATE*/, nItem, 0x0002 /*LVIS_SELECTED*/));
}

function InsertItemLV(nItem, aItems)
{
  var i;

  AkelPad.MemCopy(lpLVITEM + 4, nItem, DT_DWORD);
  AkelPad.MemCopy(lpLVITEM + 8,     0, DT_DWORD);
  AkelPad.MemCopy(lpBuffer, aItems[0], _TSTR);
  AkelPad.SendMessage(aWnd[IDPLUGLV][HWND], 0x104D /*LVM_INSERTITEMW*/, 0, lpLVITEM);

  for (i = 1; i < aItems.length; ++i)
  {
    AkelPad.MemCopy(lpLVITEM + 8, i, DT_DWORD);
    AkelPad.MemCopy(lpBuffer, aItems[i], _TSTR);
    AkelPad.SendMessage(aWnd[IDPLUGLV][HWND], 0x1074 /*LVM_SETITEMTEXTW*/, nItem, lpLVITEM);
  }
}

function InsertColumnsLV()
{
  var lpLVCOLUMN = AkelPad.MemAlloc(40); //sizeof(LVCOLUMN)
  var nMask      = 5; //LVCF_FMT|LVCF_TEXT
  var aFmt       = [0 /*LVCFMT_LEFT*/, 0, 0]; //Alignment of the column header
  var aText      = [AkelPad.MemStrPtr(sTxtPlugin), AkelPad.MemStrPtr(sTxtKeyTextName), AkelPad.MemStrPtr(sTxtTextFile)];
  var i;

  AkelPad.MemCopy(lpLVCOLUMN, nMask,  DT_DWORD);

  AkelPad.SendMessage(aWnd[IDPLUGLV][HWND], 0x1036 /*LVM_SETEXTENDEDLISTVIEWSTYLE*/, 0x0020 /*LVS_EX_FULLROWSELECT*/, 0x0020);

  for (i = 0; i < aFmt.length; ++i)
  {
    AkelPad.MemCopy(lpLVCOLUMN +  4, aFmt[i],   DT_DWORD);
    AkelPad.MemCopy(lpLVCOLUMN + 12, aText[i],  DT_DWORD);

    AkelPad.SendMessage(aWnd[IDPLUGLV][HWND], 0x1061 /*LVM_INSERTCOLUMNW*/, i, lpLVCOLUMN);
  }

  AkelPad.MemFree(lpLVCOLUMN);
}

function FillPlugList()
{
  var aPlugList = [];
  var i;

  if (bSetInReg)
    GetPluginsFromReg(aPlugList);
  else
    GetPluginsFromIni(aPlugList);

  for (i = 0; i < aPlugList.length; ++i)
  {
    if (oPlugText[aPlugList[i][0]] &&
        oPlugText[aPlugList[i][0]][aPlugList[i][1]] &&
        oPlugText[aPlugList[i][0]][aPlugList[i][1]].File)
      aPlugList[i].push(oPlugText[aPlugList[i][0]][aPlugList[i][1]].File);
    else
      aPlugList[i].push(aPlugList[i][0] + "." + aPlugList[i][1].replace(/[<>:"/\\|?*]/g, "_") + ".akelmenu");

    InsertItemLV(i, aPlugList[i]);

    if (oPlugText[aPlugList[i][0]] &&
        oPlugText[aPlugList[i][0]][aPlugList[i][1]] &&
        oPlugText[aPlugList[i][0]][aPlugList[i][1]].Sel)
      SetSelLV(i);
  }

  if (GetNextSelLV(-1) < 0)
    SetSelLV(0);
}

function GetPluginsFromIni(aPlugList)
{
  var oRE1      = /^\/.+(?==)/gm;
  var oRE2      = /^.+Text(?==)/gm;
  var aPlugName = [["Coder", oRE1], ["ContextMenu", oRE2], ["Hotkeys", oRE2]];
  var sPlugDir  = AkelPad.GetAkelDir(4 /*ADTYPE_PLUGS*/) + "\\";
  var hFindFile = oSys.Call("kernel32::FindFirstFileW", sPlugDir + "ToolBar*.ini", lpBuffer);
  var sToolBarName;
  var aText;
  var i, n;

  if (hFindFile != -1) //INVALID_HANDLE_VALUE
  {
    do
    {
      if (! (AkelPad.MemRead(lpBuffer, DT_DWORD) & 16 /*FILE_ATTRIBUTE_DIRECTORY*/))
      {
        sToolBarName = AkelPad.MemRead(lpBuffer + 44 /*offsetof(WIN32_FIND_DATAW, cFileName)*/, _TSTR);
        sToolBarName = sToolBarName.substring(sToolBarName.lastIndexOf("\\") + 1, sToolBarName.lastIndexOf("."));
        aPlugName.push([sToolBarName, oRE2]);
      }
    }
    while (oSys.Call("kernel32::FindNextFileW", hFindFile, lpBuffer));

    oSys.Call("kernel32::FindClose", hFindFile);
  }

  for (i = 0; i < aPlugName.length; ++i)
  {
    if ((IsFileExists(sPlugDir + aPlugName[i][0] + ".ini")) &&
        (aText = AkelPad.ReadFile(sPlugDir + aPlugName[i][0] + ".ini").match(aPlugName[i][1])))
    {
      for (n = 0; n < aText.length; ++n)
        aPlugList.push([aPlugName[i][0], aText[n]]);
    }
  }
}

function GetPluginsFromReg(aPlugList)
{
  var oRE1       = /^\/.+/;
  var oRE2       = /.+Text$/;
  var aPlugName  = [["Coder", oRE1], ["ContextMenu", oRE2], ["Hotkeys", oRE2]];
  var sPlugKey   = "Software\\Akelsoft\\AkelPad\\Plugs";
  var hKey       = GetRegKeyHandle(0x80000001 /*HKEY_CURRENT_USER*/, sPlugKey, 0x0009 /*KEY_ENUMERATE_SUB_KEYS|KEY_QUERY_VALUE*/);
  var lpCount    = AkelPad.MemAlloc(4);
  var lpNameLen  = AkelPad.MemAlloc(4);
  var lpType     = AkelPad.MemAlloc(4);
  var lpName;
  var nNameLen;
  var sToolBarName;
  var sValueName;
  var i;

  if (hKey)
  {
    if (! oSys.Call("advapi32::RegQueryInfoKey" + _TCHAR,
                    hKey,      //hKey
                    0,         //lpClass
                    0,         //lpcClass
                    0,         //lpReserved
                    lpCount,   //lpcSubKeys
                    lpNameLen, //lpcMaxSubKeyLen
                    0,         //lpcMaxClassLen
                    0,         //lpcValues
                    0,         //lpcMaxValueNameLen
                    0,         //lpcMaxValueLen
                    0,         //lpcbSecurityDescri
                    0))        //lpftLastWriteTime
    {
      nNameLen = AkelPad.MemRead(lpNameLen, DT_DWORD) + 1;
      lpName   = AkelPad.MemAlloc(nNameLen * 2);

      for (i = 0; i < AkelPad.MemRead(lpCount, DT_DWORD); ++i)
      {
        AkelPad.MemCopy(lpNameLen, nNameLen, DT_DWORD);
        if (! oSys.Call("advapi32::RegEnumKeyEx" + _TCHAR,
                        hKey,      //hKey
                        i,         //dwIndex
                        lpName,    //lpName
                        lpNameLen, //lpcName
                        0,         //lpReserved
                        0,         //lpClass
                        0,         //lpcClass
                        0))        //lpftLastWriteTime
        {
          sToolBarName = AkelPad.MemRead(lpName, DT_UNICODE);
          if (sToolBarName.indexOf("ToolBar") == 0)
            aPlugName.push([sToolBarName, oRE2]);
        }
      }
      AkelPad.MemFree(lpName);
    }
    oSys.Call("advapi32::RegCloseKey", hKey);
  }

  for (i = 0; i < aPlugName.length; ++i)
  {
    hKey = GetRegKeyHandle(0x80000001 /*HKEY_CURRENT_USER*/, sPlugKey + "\\" + aPlugName[i][0], 0x0001 /*KEY_QUERY_VALUE*/);
    if (hKey)
    {
      if (! oSys.Call("advapi32::RegQueryInfoKey" + _TCHAR,
                      hKey,      //hKey
                      0,         //lpClass
                      0,         //lpcClass
                      0,         //lpReserved
                      0,         //lpcSubKeys
                      0,         //lpcMaxSubKeyLen
                      0,         //lpcMaxClassLen
                      lpCount,   //lpcValues
                      lpNameLen, //lpcMaxValueNameLen
                      0,         //lpcMaxValueLen
                      0,         //lpcbSecurityDescri
                      0))        //lpftLastWriteTime
      {
        nNameLen = AkelPad.MemRead(lpNameLen, DT_DWORD) + 1;
        lpName   = AkelPad.MemAlloc(nNameLen * 2);

        for (n = 0; n < AkelPad.MemRead(lpCount, DT_DWORD); ++n)
        {
          AkelPad.MemCopy(lpNameLen, nNameLen, DT_DWORD);
          if (! oSys.Call("advapi32::RegEnumValue" + _TCHAR,
                          hKey,      //hKey
                          n,         //dwIndex
                          lpName,    //lpValueName
                          lpNameLen, //lpcchValueName
                          0,         //lpReserved
                          lpType,    //lpType
                          0,         //lpData
                          0))        //lpcbData
          {
            sValueName = AkelPad.MemRead(lpName, DT_UNICODE);
            if (aPlugName[i][1].test(sValueName) && (AkelPad.MemRead(lpType, DT_DWORD) == 3 /*REG_BINARY*/))
              aPlugList.push([aPlugName[i][0], sValueName]);
          }
        }
        AkelPad.MemFree(lpName);
      }
      oSys.Call("advapi32::RegCloseKey", hKey);
    }
  }

  AkelPad.MemFree(lpCount);
  AkelPad.MemFree(lpNameLen);
  AkelPad.MemFree(lpType);
}

function GetRegKeyHandle(hParentKey, sSubKey, nAccess)
{
  var lpKey  = AkelPad.MemAlloc(4);
  var hKey   = 0;
  var nError = oSys.Call("advapi32::RegOpenKeyEx" + _TCHAR,
                         hParentKey, //hKey
                         sSubKey,    //lpSubKey
                         0,          //ulOptions
                         nAccess,    //samDesired
                         lpKey);     //phkResult

  if (! nError)
    hKey = AkelPad.MemRead(lpKey, DT_DWORD);

  AkelPad.MemFree(lpKey);

  return hKey;
}

function EditText(bSave)
{
  var sTextDir = ExpandDirName(sTextDirS);
  var sPlugDir = AkelPad.GetAkelDir(4 /*ADTYPE_PLUGS*/) + "\\";
  var aSel     = GetSelArrayLV();
  var aSaved   = [];
  var aNoSaved = [];
  var sMessage = "";
  var hKey;
  var lpType;
  var lpData;
  var lpDataLen;
  var sIniFile;
  var oRE;
  var bWasSaved;
  var i, n;

  if (bSave &&
      (AkelPad.MessageBox(hWndDlg, sTxtWantSave, sScriptName,
                          0x00000023 /*MB_DEFBUTTON1|MB_ICONQUESTION|MB_YESNOCANCEL*/) != 6 /*IDYES*/))
    return;

  if (bSetInReg)
  {
    lpType    = AkelPad.MemAlloc(4);
    lpDataLen = AkelPad.MemAlloc(4);

    for (i = 0; i < aSel.length; ++i)
    {
      bWasSaved = false;
      hKey      = GetRegKeyHandle(0x80000001 /*HKEY_CURRENT_USER*/, "Software\\Akelsoft\\AkelPad\\Plugs" + "\\" + GetItemTextLV(aSel[i], 0), 0x0001 /*KEY_QUERY_VALUE*/);

      if (hKey)
      {
        oSys.Call("advapi32::RegQueryInfoKey" + _TCHAR,
                  hKey,      //hKey
                  0,         //lpClass
                  0,         //lpcClass
                  0,         //lpReserved
                  0,         //lpcSubKeys
                  0,         //lpcMaxSubKeyLen
                  0,         //lpcMaxClassLen
                  0,         //lpcValues
                  0,         //lpcMaxValueNameLen
                  lpDataLen, //lpcMaxValueLen
                  0,         //lpcbSecurityDescri
                  0);        //lpftLastWriteTime

        lpData = AkelPad.MemAlloc(lpDataLen);

        if ((! oSys.Call("advapi32::RegQueryValueEx" + _TCHAR,
                         hKey,                      //hKey
                         GetItemTextLV(aSel[i], 1), //lpValueName
                         0,                         //lpReserved
                         lpType,                    //lpType
                         lpData,                    //lpData
                         lpDataLen))                //lpcbData
            && (AkelPad.MemRead(lpType, DT_DWORD) == 3 /*REG_BINARY*/))
        {
          if (bSave)
          {
            if (WriteFile(sTextDir + GetItemTextLV(aSel[i], 2), null, AkelPad.MemRead(lpData, DT_UNICODE), 1))
            {
              aSaved.push(aSel[i]);
              bWasSaved = true;
            }
          }
          else
            OpenText(lpData);
        }

        oSys.Call("advapi32::RegCloseKey", hKey);
        AkelPad.MemFree(lpData);
      }

      if (bSave && (! bWasSaved))
        aNoSaved.push(aSel[i]);
    }

    AkelPad.MemFree(lpType);
    AkelPad.MemFree(lpDataLen);
  }

  else
  {
    for (i = 0; i < aSel.length; ++i)
    {
      bWasSaved = false;
      sIniFile  = sPlugDir + GetItemTextLV(aSel[i], 0) + ".ini";

      if (IsFileExists(sIniFile))
      {
        oRE = new RegExp(escapeRegExp(GetItemTextLV(aSel[i], 1)) + "=([\\dA-F]*)");

        if (oRE.test(AkelPad.ReadFile(sIniFile)))
        {
          lpData = AkelPad.MemAlloc(RegExp.$1.length / 2);

          for (n = 0; n < RegExp.$1.length; n += 2)
            AkelPad.MemCopy(lpData + n / 2, parseInt(RegExp.$1.substr(n, 2), 16), DT_BYTE);

          if (bSave)
          {
            if (WriteFile(sTextDir + GetItemTextLV(aSel[i], 2), null, AkelPad.MemRead(lpData, DT_UNICODE), 1))
            {
              aSaved.push(aSel[i]);
              bWasSaved = true;
            }
          }
          else
            OpenText(lpData);

          AkelPad.MemFree(lpData);
        }
      }

      if (bSave && (! bWasSaved))
        aNoSaved.push(aSel[i]);
    }
  }

  if (bSave)
  {
    if (aSaved.length)
    {
      sMessage += sTxtSaved + "\n";
      for (i = 0; i < aSaved.length; ++i)
        sMessage += sTextDir + GetItemTextLV(aSaved[i], 2) + "\n";
    }

    if (aNoSaved.length)
    {
      sMessage += "\n" + sTxtNoSaved + "\n";
      for (i = 0; i < aNoSaved.length; ++i)
        sMessage += sTextDir + GetItemTextLV(aNoSaved[i], 2) + "\n";
    }

    AkelPad.MessageBox(hWndDlg, sMessage, sScriptName, 0x00000040 /*MB_ICONINFORMATION*/);
  }
}

function OpenText(lpData)
{
  AkelPad.SendMessage(AkelPad.GetMainWnd(), 273 /*WM_COMMAND*/, 4101 /*wParam=MAKEWPARAM(0,IDM_FILE_NEW)*/, 1 /*lParam=TRUE*/);
  AkelPad.Command(4125); //Reopen as UTF-16LE
  oSys.Call("user32::SetWindowTextW", AkelPad.GetEditWnd(), lpData);

  if (AkelPad.IsPluginRunning("Coder::HighLight"))
    AkelPad.Call("Coder::Settings", 1, "akelmenu");
}

function EditIniFile()
{
  var sPlugDir = AkelPad.GetAkelDir(4 /*ADTYPE_PLUGS*/) + "\\";
  var aSel     = GetSelArrayLV();
  var aNoFile  = [];
  var sIniFile;
  var nSelStart;
  var sMessage;
  var i;

  for (i = 0; i < aSel.length; ++i)
  {
    sIniFile = sPlugDir + GetItemTextLV(aSel[i], 0) + ".ini";

    if (IsFileExists(sIniFile))
    {
      if (AkelPad.OpenFile(sIniFile) == 0 /*EOD_SUCCESS*/)
      {
        nSelStart = AkelPad.TextFind(AkelPad.GetEditWnd(), GetItemTextLV(aSel[i], 1), 0x00200001 /*FR_DOWN|FR_BEGINNING*/);
        if (nSelStart > -1)
          AkelPad.SetSel(nSelStart, nSelStart + GetItemTextLV(aSel[i], 1).length);
      }
    }
    else
      aNoFile.push(aSel[i]);
  }

  if (aNoFile.length)
  {
    sMessage = sTxtNoFiles + "\n";
    for (i = 0; i < aNoFile.length; ++i)
      sMessage += sPlugDir + GetItemTextLV(aSel[i], 0) + ".ini" + "\n";

    AkelPad.MessageBox(hWndDlg, sMessage, sScriptName, 0x00000030 /*MB_ICONWARNING*/);
  }
}

function OpenInRegEdit()
{
  var aSel     = GetSelArrayLV();
  var hKey     = GetRegKeyHandle(0x80000001 /*HKEY_CURRENT_USER*/, "Software\\Microsoft\\Windows\\CurrentVersion\\Applets\\Regedit", 0x0002 /*KEY_SET_VALUE*/);
  var sValue   = "HKEY_CURRENT_USER\\Software\\Akelsoft\\AkelPad\\Plugs" + "\\" + GetItemTextLV(aSel[0], 0);
  var nSize    = (sValue.length + 1) * 2;
  var lpData   = AkelPad.MemAlloc(nSize);
  var sProcess = "regedit.exe";

  TerminateProcess(sProcess);

  AkelPad.MemCopy(lpData, sValue, DT_UNICODE);

  oSys.Call("advapi32::RegSetValueEx" + _TCHAR,
            hKey,      //hKey
            "LastKey", //lpValueName
            0,         //Reserved
            1,         //dwType = REG_SZ
            lpData,    //lpData
            nSize);    //cbData
  
  oSys.Call("advapi32::RegCloseKey", hKey);
  AkelPad.MemFree(lpData);

  AkelPad.Exec(sProcess);
}

function TerminateProcess(sProcess)
{
  var lpPIDs     = AkelPad.MemAlloc(4000);
  var lpBytes    = AkelPad.MemAlloc(4);
  var lpName     = AkelPad.MemAlloc(260 * _TSIZE);
  var hProcess;
  var i;

  sProcess = sProcess.toUpperCase();

  oSys.Call("Psapi::EnumProcesses", lpPIDs, 4000, lpBytes);

  for (i = 0; i < AkelPad.MemRead(lpBytes, DT_DWORD) / 4; ++i)
  {
    if (hProcess = oSys.Call("Kernel32::OpenProcess",
                             0x0411 /*PROCESS_QUERY_INFORMATION|PROCESS_VM_READ|PROCESS_TERMINATE*/,
                             0,
                             AkelPad.MemRead(lpPIDs + i * 4, DT_DWORD)))
    {
      oSys.Call("Psapi::GetModuleBaseName" + _TCHAR, hProcess, 0, lpName, 260);

      if (AkelPad.MemRead(lpName, _TSTR).toUpperCase() == sProcess)
        oSys.Call("Kernel32::TerminateProcess", hProcess, 0);

      oSys.Call("Kernel32::CloseHandle", hProcess);
    }
  }

  AkelPad.MemFree(lpPIDs);
  AkelPad.MemFree(lpBytes);
  AkelPad.MemFree(lpName);
}

function EditTextFile()
{
  var sTextDir = ExpandDirName(sTextDirS);
  var aSel     = GetSelArrayLV();
  var aNoFile  = [];
  var sTextFile;
  var i;

  for (i = 0; i < aSel.length; ++i)
  {
    sTextFile = sTextDir + GetItemTextLV(aSel[i], 2);

    if (IsFileExists(sTextFile))
      AkelPad.OpenFile(sTextFile);
    else
      aNoFile.push(aSel[i]);
  }

  if (aNoFile.length)
  {
    sMessage = sTxtNoFiles + "\n";
    for (i = 0; i < aNoFile.length; ++i)
      sMessage += sTextDir + GetItemTextLV(aNoFile[i], 2) + "\n";

    AkelPad.MessageBox(hWndDlg, sMessage, sScriptName, 0x00000030 /*MB_ICONWARNING*/);
  }
}

function LoadTextFileToPlugin()
{
  var sTextDir  = ExpandDirName(sTextDirS);
  var sPlugDir  = AkelPad.GetAkelDir(4 /*ADTYPE_PLUGS*/) + "\\";
  var aSel      = GetSelArrayLV();
  var aSaved    = [];
  var aNoSaved  = [];
  var sMessage  = "";
  var sPrevPlug = "";
  var hKey;
  var lpType;
  var sTextFile;
  var sRegFile;
  var sIniBack;
  var sIniFile;
  var sText;
  var sIniText;
  var nSize;
  var lpData;
  var oRE;
  var bWasSaved;
  var i, n;

  if (AkelPad.MessageBox(hWndDlg, sTxtWantLoad, sScriptName,
                         0x00000023 /*MB_DEFBUTTON1|MB_ICONQUESTION|MB_YESNOCANCEL*/) != 6 /*IDYES*/)
    return;

  if (bSetInReg)
  {
    lpType = AkelPad.MemAlloc(4);

    for (i = 0; i < aSel.length; ++i)
    {
      bWasSaved = false;
      sTextFile = sTextDir + GetItemTextLV(aSel[i], 2);
      sRegFile  = sTextDir + GetItemTextLV(aSel[i], 0) + ".reg.bak";
      hKey      = GetRegKeyHandle(0x80000001 /*HKEY_CURRENT_USER*/, "Software\\Akelsoft\\AkelPad\\Plugs" + "\\" + GetItemTextLV(aSel[i], 0), 0x0003 /*KEY_SET_VALUE|KEY_QUERY_VALUE*/);

      if (hKey
          && (! oSys.Call("advapi32::RegQueryValueEx" + _TCHAR,
                          hKey,                      //hKey
                          GetItemTextLV(aSel[i], 1), //lpValueName
                          0,                         //lpReserved
                          lpType,                    //lpType
                          0,                         //lpData
                          0))                        //lpcbData
          && (AkelPad.MemRead(lpType, DT_DWORD) == 3 /*REG_BINARY*/)
          && IsFileExists(sTextFile)
          && (sText = AkelPad.ReadFile(sTextFile)))
      {
        //create registry key backup file
        if (GetItemTextLV(aSel[i], 0) != sPrevPlug)
        {
          DeleteFile(sRegFile);
          AkelPad.Exec("regedit.exe" + " /e " + sRegFile + " HKEY_CURRENT_USER\\Software\\Akelsoft\\AkelPad\\Plugs\\" + GetItemTextLV(aSel[i], 0));
          sPrevPlug = GetItemTextLV(aSel[i], 0);
        }

        nSize  = (sText.length + 1) * 2;
        lpData = AkelPad.MemAlloc(nSize);
        AkelPad.MemCopy(lpData, sText, DT_UNICODE);

        if ((! oSys.Call("advapi32::RegSetValueEx" + _TCHAR,
                         hKey,                      //hKey
                         GetItemTextLV(aSel[i], 1), //lpValueName
                         0,                         //Reserved
                         3,                         //dwType = REG_BINARY
                         lpData,                    //lpData
                         nSize)))                   //cbData
        {
          aSaved.push(aSel[i]);
          bWasSaved = true;
        }

        AkelPad.MemFree(lpData);
      }

      oSys.Call("advapi32::RegCloseKey", hKey);
      if (! bWasSaved)
        aNoSaved.push(aSel[i]);
    }

    AkelPad.MemFree(lpType);
  }

  else
  {
    for (i = 0; i < aSel.length; ++i)
    {
      bWasSaved = false;
      sTextFile = sTextDir + GetItemTextLV(aSel[i], 2);
      sIniBack  = sTextDir + GetItemTextLV(aSel[i], 0) + ".ini.bak";
      sIniFile  = sPlugDir + GetItemTextLV(aSel[i], 0) + ".ini";

      if (IsFileExists(sIniFile) && IsFileExists(sTextFile) && (sText = AkelPad.ReadFile(sTextFile)))
      {
        oRE      = new RegExp(escapeRegExp(GetItemTextLV(aSel[i], 1)) + "=[\\dA-F]*");
        sIniText = AkelPad.ReadFile(sIniFile);
        nSize    = (sText.length + 1) * 2;
        lpData   = AkelPad.MemAlloc(nSize);

        AkelPad.MemCopy(lpData, sText, DT_UNICODE);
        sText = "";
        for (n = 0; n < nSize; ++n)
          sText += PadL0(AkelPad.MemRead(lpData + n, DT_BYTE).toString(16).toUpperCase());
        AkelPad.MemFree(lpData);

        if (sText && oRE.test(sIniText))
        {
          //create backup .ini file
          if (GetItemTextLV(aSel[i], 0) != sPrevPlug)
          {
            CopyFile(sIniFile, null, sIniBack);
            sPrevPlug = GetItemTextLV(aSel[i], 0);
          }

          if (WriteFile(sIniFile, null, sIniText.replace(oRE, GetItemTextLV(aSel[i], 1) + "=" + sText), 1))
          {
            aSaved.push(aSel[i]);
            bWasSaved = true;
          }
        }
      }

      if (! bWasSaved)
        aNoSaved.push(aSel[i]);
    }
  }

  if (aSaved.length)
  {
    sMessage += sTxtSaved + "\n";
    for (i = 0; i < aSaved.length; ++i)
      sMessage += GetItemTextLV(aSaved[i], 0) + ": " + GetItemTextLV(aSaved[i], 1) + "\n";
  }

  if (aNoSaved.length)
  {
    sMessage += "\n" + sTxtNoSaved + "\n";
    for (i = 0; i < aNoSaved.length; ++i)
      sMessage += GetItemTextLV(aNoSaved[i], 0) + ": " + GetItemTextLV(aNoSaved[i], 1) + "\n";
  }

  AkelPad.MessageBox(hWndDlg, sMessage, sScriptName, 0x00000040 /*MB_ICONINFORMATION*/);
}

function PadL0(sString)
{
  if (sString.length == 1)
    return "0" + sString;

  return sString;
}

function RenameTextFile()
{
  var aSel = GetSelArrayLV();
  var sOldName;
  var sNewName;

  for (i = 0; i < aSel.length; ++i)
  {
    sOldName = GetItemTextLV(aSel[i], 2);
    sNewName = GetFileName(sTxtRenameFile, sOldName + "\n\n" + sTxtNewName, sOldName);

    if (sNewName)
    {
      if (sNewName != sOldName)
      {
        SetItemTextLV(aSel[i], 2, sNewName);
        RenameFile(ExpandDirName(sTextDirS) + sOldName, 0, sNewName);
      }
    }
    else
      break;
  }
}

function GetFileName(sCaption, sLabel, sName)
{
  while (true)
  {
    sName = AkelPad.InputBox(hWndDlg, sCaption, sLabel, sName);

    if (sName)
    {
      sName = sName.replace(/[ .]+$/, "");

      if (/^(CON|PRN|AUX|NUL|COM1|COM2|COM3|COM4|COM5|COM6|COM7|COM8|COM9|LPT1|LPT2|LPT3|LPT4|LPT5|LPT6|LPT7|LPT8|LPT9)$/i.test(sName))
        AkelPad.MessageBox(hWndDlg, sName + "\n\n" + sTxtBadName, sCaption, 0x00000030 /*MB_ICONWARNING*/);
      else if (/[<>:"/\\|?*]/.test(sName))
        AkelPad.MessageBox(hWndDlg, sName + "\n\n" + sTxtBadChar, sCaption, 0x00000030 /*MB_ICONWARNING*/);
      else
        break;
    }
    else
      break;
  }

  return sName;
}

function DeleteTextFile(bRecBin)
{
  var sTextDir   = ExpandDirName(sTextDirS);
  var aSel       = GetSelArrayLV();
  var aDeleted   = [];
  var aNoDeleted = [];
  var sMessage   = "";

  if (AkelPad.MessageBox(hWndDlg, sTxtWantDelete, sScriptName,
                         0x00000023 /*MB_DEFBUTTON1|MB_ICONQUESTION|MB_YESNOCANCEL*/) == 6 /*IDYES*/)
  {
    for (i = 0; i < aSel.length; ++i)
    {
      if (DeleteFile(sTextDir + GetItemTextLV(aSel[i], 2), null, bRecBin))
        aDeleted.push(aSel[i]);
      else
        aNoDeleted.push(aSel[i]);
    }

    if (aDeleted.length)
    {
      sMessage += sTxtDeleted + "\n";
      for (i = 0; i < aDeleted.length; ++i)
        sMessage += sTextDir + GetItemTextLV(aDeleted[i], 2) + "\n";
    }

    if (aNoDeleted.length)
    {
      sMessage += "\n" + sTxtNoDeleted + "\n";
      for (i = 0; i < aNoDeleted.length; ++i)
        sMessage += sTextDir + GetItemTextLV(aNoDeleted[i], 2) + "\n";
    }

    AkelPad.MessageBox(hWndDlg, sMessage, sScriptName, 0x00000040 /*MB_ICONINFORMATION*/);
  }
}

//function written by Infocatcher
function escapeRegExp(str)
{
  return str.replace(/[\\\/.^$+*?|()\[\]{}]/g, "\\$&");
}

function ChangeTextsDir()
{
  var sLabel  = "%a - " + sTxtAkelDir + "\n%p - " + sTxtPlugDir + "\n%variable% - " + sTxtEnvVar;
  var sDirS   = sTextDirS;
  var bChange = 0;
  var sDirE;

  while (true)
  {
    sDirS = AkelPad.InputBox(hWndDlg, sTxtChangeDir, sLabel, sDirS);

    if (sDirS)
    {
      if (sDirS.slice(-1) != "\\")
        sDirS += "\\";

      sDirE = ExpandDirName(sDirS);

      if (IsDirExists(sDirE))
      {
        bChange = 1;
        break;
      }
      else if (AkelPad.MessageBox(hWndDlg, sDirE + "\n\n" + sTxtDirNoExists, sScriptName,
                                  0x00000023 /*MB_DEFBUTTON1|MB_ICONQUESTION|MB_YESNOCANCEL*/) == 6 /*IDYES*/)
      {
        if (oSys.Call("kernel32::CreateDirectory" + _TCHAR, sDirE, 0))
        {
          bChange = 1;
          break;
        }
        else
          AkelPad.MessageBox(hWndDlg, sDirE + "\n\n" + sTxtDirCreFail, sScriptName, 0x00000030 /*MB_ICONWARNING*/);
      }
    }
    else
      break;
  }

  if (bChange)
  {
    sTextDirS = sDirS;
    oSys.Call("user32::SetWindowText" + _TCHAR, aWnd[IDDIRS][HWND], sTxtDir + sDirE);
  }
}

function ExpandDirName(sDir)
{
  sDir = sDir.replace(/%a\\/g, AkelPad.GetAkelDir() + "\\");
  sDir = sDir.replace(/%p\\/g, AkelPad.GetAkelDir(4 /*ADTYPE_PLUGS*/) + "\\");
  sDir = sDir.replace(/%.+?%/g, ExpandEnvironmentString);

  if (oSys.Call("Kernel32::GetFullPathNameW", sDir, nBufSize / 2, lpBuffer, 0))
    sDir = AkelPad.MemRead(lpBuffer, _TSTR);

  return sDir;
}

function ExpandEnvironmentString(sEnvironmentStr)
{
  if (oSys.Call("Kernel32::ExpandEnvironmentStringsW", sEnvironmentStr, lpBuffer, nBufSize / 2))
    sEnvironmentStr = AkelPad.MemRead(lpBuffer, _TSTR);

  return sEnvironmentStr;
}

function ReadWriteIni(bWrite)
{
  var sIniFile = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";
  var oRect;
  var sPlug;
  var sText;
  var sIniText;
  var oError;
  var i, n;

  if (bWrite)
  {
    GetWindowPos(hWndDlg, oRect = {});

    oPlugText = {};
    for (i = 0; i < GetItemCountLV(); ++i)
    {
      sPlug = GetItemTextLV(i, 0);
      sText = GetItemTextLV(i, 1);

      if (! oPlugText[sPlug])
        oPlugText[sPlug] = {};

      if (! oPlugText[sPlug][sText])
        oPlugText[sPlug][sText] = {Sel: IsItemSel(i), File: GetItemTextLV(i, 2)};
    }

    sIniText = 'nWndPosX='  + oRect.X + ';\r\n' +
               'nWndPosY='  + oRect.Y + ';\r\n' +
               'nWndPosW='  + oRect.W + ';\r\n' +
               'nWndPosH='  + oRect.H + ';\r\n' +
               'sTextDirS=' + '"' + sTextDirS.replace(/[\\"]/g, "\\$&") + '";\r\noPlugText={';

    for (i in oPlugText)
    {
      sIniText += '"' + i + '":{';
      for (n in oPlugText[i])
      {
        sIniText += '"' + n + '":{Sel:' + oPlugText[i][n].Sel + ',File:"' + oPlugText[i][n].File + '"},';
      }
      if (sIniText.slice(-1) == ",")
        sIniText = sIniText.slice(0, -1);
      sIniText += '},';
    }
    if (sIniText.slice(-1) == ",")
      sIniText = sIniText.slice(0, -1);
    sIniText += '};';

    WriteFile(sIniFile, null, sIniText, 1);
  }

  else if (IsFileExists(sIniFile))
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
