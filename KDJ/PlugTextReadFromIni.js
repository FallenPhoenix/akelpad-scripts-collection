// PlugTextReadFromIni.js - ver. 2012-04-14
//
// Opens text of ContextMenu/ToolBar plugin in AkelPad edit window.
// The text is read from plugin .ini file or registry.
//
// Usage:
// Call("Scripts::Main", 1, "PlugTextReadFromIni.js")
//
// For the syntax highlighting uses akelmenu.coder by Infocatcher:
// http://infocatcher.ucoz.net/akelpad/coder/_akelmenu.coder

var oSys         = AkelPad.SystemFunction();
var hMainWnd     = AkelPad.GetMainWnd();
var hInstanceDLL = AkelPad.GetInstanceDll();
var sClassName   = "AkelPad::Scripts::" + WScript.ScriptName + "::" + hInstanceDLL;
var aPlugs       = [];
var bSetInReg;
var oRect;
var hWndLB;
var hWndOpen;

GetPlugArray(aPlugs);

if (aPlugs.length)
{
  bSetInReg = IsSettingsInReg();
  oRect     = new Object();

  GetWndPos(hMainWnd, oRect);

  AkelPad.WindowRegisterClass(sClassName);

  oSys.Call("user32::CreateWindowExW",
            0,                  //dwExStyle
            sClassName,         //lpClassName
            WScript.ScriptName, //lpWindowName
            0x90C80000,         //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU
            oRect.X2 - 215,     //x
            oRect.Y2 - 220,     //y
            215,                //nWidth
            195,                //nHeight
            hMainWnd,           //hWndParent
            0,                  //ID
            hInstanceDLL,       //hInstance
            DialogCallback);    //Script function callback. To use it class must be registered by WindowRegisterClass.

  AkelPad.ScriptNoMutex();

  //Message loop
  AkelPad.WindowGetMessage();

  AkelPad.WindowUnregisterClass(sClassName);
}
else
{
  AkelPad.MessageBox(hMainWnd, "There is no files ContextMenu.dll and ToolBar.dll", WScript.ScriptName, 48);
}

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    var i;

    hWndLB = oSys.Call("user32::CreateWindowExW",
             0,            //dwExStyle
             "LISTBOX",    //lpClassName
             0,            //lpWindowName
             0x50A10000,   //dwStyle = WS_VISIBLE|WS_CHILD|WS_VSCROLL|WS_BORDER|WS_TABSTOP
             15,           //x
             15,           //y
             180,          //nWidth
             120,          //nHeight
             hWnd,         //hWndParent
             0,            //ID
             hInstanceDLL, //hInstance
             0);           //lpParam

    hWndOpen = oSys.Call("user32::CreateWindowExW",
               0,            //dwExStyle
               "BUTTON",     //lpClassName
               0,            //lpWindowName
               0x50010001,   //dwStyle = WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_DEFPUSHBUTTON
               65,           //x
               130,          //y
               85,           //nWidth
               25,           //nHeight
               hWnd,         //hWndParent
               0,            //ID
               hInstanceDLL, //hInstance
               0);           //lpParam

    for (i = 0; i < aPlugs.length; ++i)
      oSys.Call("user32::SendMessageW", hWndLB, 0x0180 /*LB_ADDSTRING*/, 0, aPlugs[i].Display);

    AkelPad.SendMessage(hWndLB, 48 /*WM_SETFONT*/, oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/), true);
    AkelPad.SendMessage(hWndLB, 0x0186 /*LB_SETCURSEL*/, 0, 0);

    SetWndText(hWndOpen, "Open");
  }

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("user32::SetFocus", hWndLB);

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (wParam == 13) //VK_RETURN
      oSys.Call("user32::PostMessageW", hWnd, 273 /*WM_COMMAND*/, 0, hWndOpen);
    else if (wParam == 27) //VK_ESCAPE
      oSys.Call("user32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    if (lParam == hWndOpen)
      OpenText();
  }

  else if (uMsg == 16) //WM_CLOSE
    oSys.Call("user32::DestroyWindow", hWnd);

  else if (uMsg == 2) //WM_DESTROY
    //Exit message loop
    oSys.Call("user32::PostQuitMessage", 0);

  return 0;
}

function GetWndPos(hWnd, oRect)
{
  var lpRect = AkelPad.MemAlloc(16) //sizeof(RECT);

  oSys.Call("user32::GetWindowRect", hWnd, lpRect);

  oRect.X1 = AkelPad.MemRead(lpRect,      3 /*DT_DWORD*/);
  oRect.Y1 = AkelPad.MemRead(lpRect +  4, 3 /*DT_DWORD*/);
  oRect.X2 = AkelPad.MemRead(lpRect +  8, 3 /*DT_DWORD*/);
  oRect.Y2 = AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/);

  AkelPad.MemFree(lpRect);
}

function SetWndText(hWnd, sText)
{
  AkelPad.SendMessage(hWnd, 48 /*WM_SETFONT*/, oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/), true);
  oSys.Call("user32::SetWindowTextW", hWnd, sText);
}

function GetPlugArray(aPlugs)
{
  var lpBuf     = AkelPad.MemAlloc(44 + 260 * _TSIZE + 14 * _TSIZE); //sizeof(WIN32_FIND_DATA)
  var sPlugDir  = AkelPad.GetAkelDir(4 /*ADTYPE_PLUGS*/);
  var sPlugName = "ContextMenu";
  var sTemplate = sPlugDir + "\\" + sPlugName + ".dll";
  var hFindFile = oSys.Call("kernel32::FindFirstFileW", sTemplate, lpBuf);

  if (hFindFile != -1) //INVALID_HANDLE_VALUE
  {
    aPlugs.push({Display: sPlugName + ": Show menu",         PlugName: sPlugName, ValName: "ManualMenuText"});
    aPlugs.push({Display: sPlugName + ": Main menu",         PlugName: sPlugName, ValName: "MainMenuText"});
    aPlugs.push({Display: sPlugName + ": Edit menu",         PlugName: sPlugName, ValName: "EditMenuText"});
    aPlugs.push({Display: sPlugName + ": Tab menu",          PlugName: sPlugName, ValName: "TabMenuText"});
    aPlugs.push({Display: sPlugName + ": URL menu",          PlugName: sPlugName, ValName: "UrlMenuText"});
    aPlugs.push({Display: sPlugName + ": Recent files menu", PlugName: sPlugName, ValName: "RecentFilesMenuText"});
    oSys.Call("kernel32::FindClose", hFindFile);
  }

  sTemplate = sPlugDir + "\\ToolBar*.dll";
  hFindFile = oSys.Call("kernel32::FindFirstFileW", sTemplate, lpBuf);

  if (hFindFile != -1) //INVALID_HANDLE_VALUE
  {
    do
    {
      sPlugName = AkelPad.MemRead(lpBuf + 44 /*offsetof(WIN32_FIND_DATAW, cFileName)*/, _TSTR);
      sPlugName = sPlugName.substring(sPlugName.lastIndexOf("\\") + 1, sPlugName.lastIndexOf("."));
      aPlugs.push({Display: sPlugName, PlugName: sPlugName, ValName: "ToolBarText"});
    }
    while (oSys.Call("kernel32::FindNextFileW", hFindFile, lpBuf));

    oSys.Call("kernel32::FindClose", hFindFile);
  }

  AkelPad.MemFree(lpBuf);
}

function IsSettingsInReg()
{
  var oFSO      = new ActiveXObject("Scripting.FileSystemObject");
  var sFile     = AkelPad.GetAkelDir(0 /*ADTYPE_ROOT*/) + "\\AkelPad.ini";
  var bSetInReg = true;
  var sText;

  if (oFSO.FileExists(sFile))
  {
    sText = AkelPad.ReadFile(sFile);
    sText = sText.substr(sText.indexOf("SaveSettings=") + 13, 1);

    if (sText == "2")
      bSetInReg = false;
  }

  return bSetInReg;
}

function OpenText()
{
  var nPos = AkelPad.SendMessage(hWndLB, 0x0188 /*LB_GETCURSEL*/, 0, 0);
  var aKeyVal;
  var sKeyVal;
  var sPlugDir;
  var sFile;
  var oShell;
  var oFSO;
  var oRE;
  var lpBuf;
  var oError;
  var i;

  AkelPad.SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4101 /*wParam=MAKEWPARAM(0,IDM_FILE_NEW)*/, 1 /*lParam=TRUE*/);
  AkelPad.Command(4125); //Reopen as UTF-16LE

  if (AkelPad.IsPluginRunning("Coder::HighLight"))
    AkelPad.Call("Coder::Settings", 1, "akelmenu");

  //Settings in registry
  if (bSetInReg)
  {
    oShell = new ActiveXObject("WScript.shell");
    try
    {
      aKeyVal = oShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\" + aPlugs[nPos].PlugName + "\\" + aPlugs[nPos].ValName);
      aKeyVal = aKeyVal.toArray(); //VBArray to JScript Array

      if (aKeyVal.length)
      {
        lpBuf = AkelPad.MemAlloc(aKeyVal.length);

        for (i = 0; i < aKeyVal.length; ++i)
          AkelPad.MemCopy(lpBuf + i, aKeyVal[i], 5 /*DT_BYTE*/);

        oSys.Call("user32::SetWindowTextW", AkelPad.GetEditWnd(), lpBuf);
        AkelPad.MemFree(lpBuf);
      }
    }
    catch (oError)
    {
    }
  }

  //Settings in .ini file
  else
  {
    oFSO     = new ActiveXObject("Scripting.FileSystemObject");
    sPlugDir = AkelPad.GetAkelDir(4 /*ADTYPE_PLUGS*/);
    sFile    = sPlugDir + "\\" + aPlugs[nPos].PlugName + ".ini";

    if (oFSO.FileExists(sFile))
    {
      oRE = new RegExp(aPlugs[nPos].ValName + "=([\\dA-F]*)");
      if (oRE.test(AkelPad.ReadFile(sFile)))
        sKeyVal = RegExp.$1;

      if (sKeyVal)
      {
        lpBuf = AkelPad.MemAlloc(sKeyVal.length / 2);

        for (i = 0; i < sKeyVal.length; i += 2)
          AkelPad.MemCopy(lpBuf + i / 2, parseInt(sKeyVal.substr(i, 2), 16), 5 /*DT_BYTE*/);

        oSys.Call("user32::SetWindowTextW", AkelPad.GetEditWnd(), lpBuf);
        AkelPad.MemFree(lpBuf);
      }
    }
  }
}
