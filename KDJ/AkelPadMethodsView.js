// AkelPadMethodsView.js - ver. 2013-09-03 (x86/x64)
//
// List of AkelPad methods from Scripts-*.txt files
//
// Usage:
// Call("Scripts::Main", 1, "AkelPadMethodsView.js")
// Required to include: BrowseForFolder_function.js and InputBox_function.js
//
// F1 hotkey - menu

var oSys       = AkelPad.SystemFunction();
var hInstance  = AkelPad.GetInstanceDll();
var sClassName = "AkelPad::Scripts::" + WScript.ScriptName + "::" + hInstance;
var hWndDlg    = oSys.Call("User32::FindWindowExW", 0, 0, sClassName, 0);

if (hWndDlg)
{
  if (! oSys.Call("User32::IsWindowVisible", hWndDlg))
    oSys.Call("User32::ShowWindow", hWndDlg, 8 /*SW_SHOWNA*/);
  if (oSys.Call("User32::IsIconic", hWndDlg))
    oSys.Call("User32::ShowWindow", hWndDlg, 9 /*SW_RESTORE*/);

  oSys.Call("User32::SetForegroundWindow", hWndDlg);
}
else
{
  if (! (AkelPad.Include("BrowseForFolder_function.js") && AkelPad.Include("InputBox_function.js")))
    WScript.Quit();

  var sScriptName = "AkelPad methods view";
  var hMainWnd    = AkelPad.GetMainWnd();
  var hGuiFont    = oSys.Call("Gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
  var oFSO        = new ActiveXObject("Scripting.FileSystemObject");
  var nDlgX       = 230;
  var nDlgY       = 200;
  var nDlgW       = 640;
  var nDlgH       = 300;
  var nDlgMinW    = nDlgW;
  var nDlgMinH    = nDlgH;
  var nAPMSel     = 0;
  var bAPMSort    = true;
  var nAPMLang    = 0;
  var bWordWrap   = false;
  var sFindName   = "";
  var sFindText   = "";
  var sAltDir     = "";
  var aAPM        = [];
  var aIsLang;
  var sHeader;
  var hSubClass;
  var hFocus;

  ReadIni();
  GetArrayAPM(hMainWnd);
  if (! aAPM.length)
    WScript.Quit();

  var nTextMax = 512;
  var lpTextLV = AkelPad.MemAlloc(nTextMax * 2);
  var lpLVITEM = AkelPad.MemAlloc(_X64 ? (72) : (60)); //sizeof(LVITEM)
  AkelPad.MemCopy(lpLVITEM, 0x0001 /*LVIF_TEXT*/, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpLVITEM + (_X64 ? 24 : 20), lpTextLV, 2 /*DT_QWORD*/);
  AkelPad.MemCopy(lpLVITEM + (_X64 ? 32 : 24), nTextMax, 3 /*DT_DWORD*/);

  var aDlg      = [];
  var IDHEADERS = 1000;
  var IDNAMELV  = 1001;
  var IDTEXTAE  = 1002;
  var IDSORTB   = 1003;
  var IDLANG1B  = 1004;
  var IDLANG2B  = 1005;
  var IDMENUB   = 1006;
  var IDOKB     = 1007;
  var IDCLOSEB  = 1008;
  aDlg[IDHEADERS] = {Txt: sHeader,         Class: "STATIC",        Style: 0x50000001 /*WS_VISIBLE|WS_CHILD|SS_CENTER*/};
  aDlg[IDNAMELV ] = {Txt: "",              Class: "SysListView32", Style: 0x5081800D /*WS_VISIBLE|WS_CHILD|WS_BORDER|WS_TABSTOP|LVS_NOSORTHEADER|LVS_SHOWSELALWAYS|LVS_SINGLESEL|LVS_REPORT*/};
  aDlg[IDTEXTAE ] = {Txt: "",              Class: "AkelEditW",     Style: 0x50B10804 /*WS_VISIBLE|WS_CHILD|WS_BORDER|WS_VSCROLL|WS_HSCROLL|ES_READONLY|ES_MULTILINE*/};
  aDlg[IDSORTB  ] = {Txt: "&Sort methods", Class: "BUTTON",        Style: 0x50000003 /*WS_VISIBLE|WS_CHILD|BS_AUTOCHECKBOX*/};
  aDlg[IDLANG1B ] = {Txt: "&English",      Class: "BUTTON",        Style: 0x50000009 /*WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON*/};
  aDlg[IDLANG2B ] = {Txt: "&Russian",      Class: "BUTTON",        Style: 0x50000009 /*WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON*/};
  aDlg[IDMENUB  ] = {Txt: "&Menu",         Class: "BUTTON",        Style: 0x50000000 /*WS_VISIBLE|WS_CHILD*/};
  aDlg[IDOKB    ] = {Txt: "OK",            Class: "BUTTON",        Style: 0x50000001 /*WS_VISIBLE|WS_CHILD|BS_DEFPUSHBUTTON*/};
  aDlg[IDCLOSEB ] = {Txt: "Close",         Class: "BUTTON",        Style: 0x50000000 /*WS_VISIBLE|WS_CHILD*/};

  AkelPad.WindowRegisterClass(sClassName);

  hWndDlg = oSys.Call("User32::CreateWindowExW",
    0,              //dwExStyle
    sClassName,     //lpClassName
    sScriptName,    //lpWindowName
    0x90CE0000,     //dwStyle=WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_SIZEBOX|WS_MINIMIZEBOX
    nDlgX,          //x
    nDlgY,          //y
    nDlgW,          //nWidth
    nDlgH,          //nHeight
    hMainWnd,       //hWndParent
    0,              //ID
    hInstance,      //hInstance
    DialogCallback);//Script function callback. To use it class must be registered by WindowRegisterClass.

  AkelPad.ScriptNoMutex();
  AkelPad.WindowGetMessage();

  AkelPad.WindowUnregisterClass(sClassName);
  AkelPad.MemFree(lpTextLV);
  AkelPad.MemFree(lpLVITEM);
}

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    var i;

    for (i = IDHEADERS; i < aDlg.length; ++i)
    {
      aDlg[i].Handle = oSys.Call("User32::CreateWindowExW",
        0,            //dwExStyle
        aDlg[i].Class,//lpClassName
        aDlg[i].Txt,  //lpWindowName
        aDlg[i].Style,//dwStyle
        0, 0, 0, 0,   //x, y, nWidth, nHeight
        hWnd,         //hWndParent
        i,            //ID
        hInstance,    //hInstance
        0);           //lpParam
      SetWindowFont(aDlg[i].Handle, hGuiFont);
    }

    CheckButtons();

    hSubClass = AkelPad.WindowSubClass(aDlg[IDTEXTAE].Handle, EditCallback, 135 /*WM_GETDLGCODE*/, 256 /*WM_KEYDOWN*/);
    SetOptionsAE();

    InsertColumnLV();
    FillLV(nAPMSel, AkelPad.GetSelText(), true);
    hFocus = aDlg[IDNAMELV].Handle;
  }

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("User32::SetFocus", hFocus);

  else if (uMsg == 36) //WM_GETMINMAXINFO
  {
    AkelPad.MemCopy(lParam + 24, nDlgMinW, 3 /*DT_DWORD*/); //ptMinTrackSize_x
    AkelPad.MemCopy(lParam + 28, nDlgMinH, 3 /*DT_DWORD*/); //ptMinTrackSize_y
  }

  else if (uMsg == 5) //WM_SIZE
    ResizeDlg(LoWord(lParam), HiWord(lParam));

  else if (uMsg == 15) //WM_PAINT
    PaintSizeGrip();

  else if (uMsg == 256) //WM_KEYDOWN
  {
    var nID = oSys.Call("User32::GetDlgCtrlID", oSys.Call("User32::GetFocus"));

    if ((wParam == 9 /*VK_TAB*/) && ((nID == IDLANG1B) || (nID == IDLANG2B)))
      oSys.Call("User32::SetFocus", oSys.Call("User32::GetNextDlgTabItem", hWnd, aDlg[nID].Handle, Shift()));
    else if ((wParam >= 0x21 /*VK_PRIOR*/) && (wParam <= 0x28 /*VK_DOWN*/) && Ctrl() && (!Shift()) && Alt())
      MoveDlg(wParam);
    else if ((wParam == 0x46 /*F key*/) && Ctrl() && (! Alt()))
    {
      if (nID == IDNAMELV)
        FindName(Shift() ? 2 : 0);
      else if (nID == IDTEXTAE)
        FindText(Shift() ? 2 : 0);
    }
    else if ((wParam == 0x70 /*VK_F1*/) && (! Ctrl()) && (! Shift()) && (! Alt()))
      Menu();
    else if ((wParam == 0x72 /*VK_F3*/) && (! Ctrl()) && (! Alt()))
    {
      if (nID == IDNAMELV)
        FindNameNext(Shift() ? 3 : 1);
      else if (nID == IDTEXTAE)
        FindTextNext(Shift() ? 3 : 1);
    }
    else if ((wParam == 0x55 /*U key*/) && Ctrl() && (! Shift()) && (! Alt()))
    {
      bWordWrap = ! bWordWrap;
      SetWordWrapAE();
    }
    else if ((wParam == 13 /*VK_RETURN*/) && (nID < IDMENUB))
      PostMessage(hWnd, 273 /*WM_COMMAND*/, IDOKB, 0);
    else if (wParam == 27 /*VK_ESCAPE*/)
      PostMessage(hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 260) //WM_SYSKEYDOWN
  {
    var nID = oSys.Call("User32::GetDlgCtrlID", oSys.Call("User32::GetFocus"));

    if (wParam == 0x46 /*F key*/)
    {
      if (nID == IDNAMELV)
        FindName(Shift() ? 3 : 1);
      else if (nID == IDTEXTAE)
        FindText(Shift() ? 3 : 1);
    }
  }

  else if ((uMsg == 0x004E /*WM_NOTIFY*/) && (wParam == IDNAMELV))
  {
    switch (AkelPad.MemRead(lParam + (_X64 ? 16 : 8), 3 /*DT_DWORD*/))
    {
      case -101 : //LVN_ITEMCHANGED
        if (AkelPad.MemRead(lParam + (_X64 ? 32 : 20) /*NMLISTVIEW.uNewState*/, 3 /*DT_DWORD*/) & 0x2 /*LVIS_SELECTED*/)
          SetWindowText(aDlg[IDTEXTAE].Handle, aAPM[GetCurSelLV()][1]);
        break;
      case -3 : //NM_DBLCLK
        if (AkelPad.MemRead(lParam + (_X64 ? 24 : 12) /*NMITEMACTIVATE.iItem*/, 3 /*DT_DWORD*/) == -1)
          SetCurSelLV(GetCurFocLV());
        else
          PostMessage(hWnd, 273 /*WM_COMMAND*/, IDOKB, 0);
        break;
      case -2 : //NM_CLICK
      case -5 : //NM_RCLICK
      case -6 : //NM_RDBLCLK
        if (AkelPad.MemRead(lParam + (_X64 ? 24 : 12) /*NMITEMACTIVATE.iItem*/, 3 /*DT_DWORD*/) == -1)
          SetCurSelLV(GetCurFocLV());
        break;
      case -7 : //NM_SETFOCUS
        hFocus = aDlg[IDNAMELV].Handle;
        break;
    }
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    var nLowParam = LoWord(wParam);
    var nHiwParam = HiWord(wParam);
    var sFind;

    if (nLowParam == IDTEXTAE)
    {
      if (nHiwParam == 0x0100 /*EN_SETFOCUS*/)
      {
        if (SendMessage(AkelPad.GetEditWnd(), 3227 /*AEM_GETOPTIONS*/, 0, 0) & 0x00000800 /*AECO_ACTIVELINE*/)
          SendMessage(lParam, 3228 /*AEM_SETOPTIONS*/, 2 /*AECOOP_OR*/, 0x00000800 /*AECO_ACTIVELINE*/);
        hFocus = lParam;
      }
      if (nHiwParam == 0x0200 /*EN_KILLFOCUS*/)
        SendMessage(lParam, 3228 /*AEM_SETOPTIONS*/, 4 /*AECOOP_XOR*/, 0x00000800 /*AECO_ACTIVELINE*/);
    }
    else if ((nLowParam >= IDSORTB) && (nLowParam <= IDLANG2B))
    {
      nAPMSel = GetCurSelLV();
      if (aAPM[nAPMSel][0].charAt(0) != "*")
        sFind = aAPM[nAPMSel][0];

      CheckButtons(nLowParam);
      GetArrayAPM(hWnd);

      if (aAPM.length)
      {
        CheckButtons();
        SetWindowText(aDlg[IDHEADERS].Handle, sHeader);
        FillLV(nAPMSel, sFind, false);
        oSys.Call("User32::SetFocus", hFocus);
      }
      else
        PostMessage(hWnd, 16 /*WM_CLOSE*/, 0, 0);
    }
    else if (nLowParam == IDMENUB)
    {
      oSys.Call("User32::DefDlgProcW", hWnd, 1025 /*DM_SETDEFID*/, IDMENUB, 0);
      oSys.Call("User32::DefDlgProcW", hWnd, 1025 /*DM_SETDEFID*/, IDOKB, 0);
      oSys.Call("User32::SetFocus", hFocus);
      Menu();
    }
    else if (nLowParam == IDOKB)
      PostMessage(hWnd, 16 /*WM_CLOSE*/, 1, 0);
    else if (nLowParam == IDCLOSEB)
      PostMessage(hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    nAPMSel = GetCurSelLV();

    if (wParam && (nAPMSel >= 0) && (aAPM[nAPMSel][0].charAt(0) != "*") && AkelPad.GetEditWnd())
      MethodToEditText();

    WriteIni();
    AkelPad.WindowUnsubClass(aDlg[IDTEXTAE].Handle);
    oSys.Call("User32::DestroyWindow", hWnd);
  }

  else if (uMsg == 2) //WM_DESTROY
    oSys.Call("User32::PostQuitMessage", 0);

  return 0;
}

function EditCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 135) //WM_GETDLGCODE
  {
    AkelPad.WindowNoNextProc(hSubClass);
    return 0x1; //DLGC_WANTARROWS
  }

  if (uMsg == 256) //WM_KEYDOWN
  {
    if ((wParam >= 0x21 /*VK_PRIOR*/) && (wParam <= 0x28 /*VK_DOWN*/) && Ctrl() && (!Shift()) && Alt())
      AkelPad.WindowNoNextProc(hSubClass);
  }

  return 0;
}

function SendMessage(hWnd, uMsg, wParam, lParam)
{
  return oSys.Call("User32::SendMessageW", hWnd, uMsg, wParam, lParam);
}

function PostMessage(hWnd, uMsg, wParam, lParam)
{
  return oSys.Call("User32::PostMessageW", hWnd, uMsg, wParam, lParam);
}

function LoWord(nDwNum)
{
  return nDwNum & 0xFFFF;
}

function HiWord(nDwNum)
{
  return (nDwNum >> 16) & 0xFFFF;
}

function Ctrl()
{
  return Boolean(oSys.Call("User32::GetKeyState", 0x11 /*VK_CONTROL*/) & 0x8000);
}

function Shift()
{
  return Boolean(oSys.Call("User32::GetKeyState", 0x10 /*VK_SHIFT*/) & 0x8000);
}

function Alt()
{
  return Boolean(oSys.Call("user32::GetKeyState", 0x12 /*VK_MENU*/) & 0x8000);
}

function GetWindowPos(hWnd, oRect)
{
  var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)

  if (hWnd)
    oSys.Call("User32::GetWindowRect", hWnd, lpRect);
  else
    oSys.Call("User32::SystemParametersInfoW", 0x30 /*SPI_GETWORKAREA*/, 0, lpRect, 0);

  oRect.X = AkelPad.MemRead(lpRect,      3 /*DT_DWORD*/);
  oRect.Y = AkelPad.MemRead(lpRect +  4, 3 /*DT_DWORD*/);
  oRect.W = AkelPad.MemRead(lpRect +  8, 3 /*DT_DWORD*/) - oRect.X;
  oRect.H = AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/) - oRect.Y;

  AkelPad.MemFree(lpRect);
}

function SetWindowText(hWnd, sText)
{
  oSys.Call("User32::SetWindowTextW", hWnd, sText);
}

function SetWindowFont(hWnd, hFont)
{
  SendMessage(hWnd, 48 /*WM_SETFONT*/, hFont, true);
}

function GetSelStartAE()
{
  AkelPad.SetEditWnd(aDlg[IDTEXTAE].Handle);
  var nSelStart = AkelPad.GetSelStart();
  AkelPad.SetEditWnd(0);
  return nSelStart;
}

function GetSelEndAE()
{
  AkelPad.SetEditWnd(aDlg[IDTEXTAE].Handle);
  var nSelEnd = AkelPad.GetSelEnd();
  AkelPad.SetEditWnd(0);
  return nSelEnd;
}

function SetSelAE(nSelStart, nSelEnd)
{
  AkelPad.SetEditWnd(aDlg[IDTEXTAE].Handle);
  AkelPad.SetSel(nSelStart, nSelEnd);
  AkelPad.SetEditWnd(0);
}

function GetSelTextAE()
{
  AkelPad.SetEditWnd(aDlg[IDTEXTAE].Handle);
  var sText = AkelPad.GetSelText(0);
  AkelPad.SetEditWnd(0);
  return sText;
}

function SetWordWrapAE()
{
  SendMessage(aDlg[IDTEXTAE].Handle, 0x0CAA /*AEM_SETWORDWRAP*/, bWordWrap ? 1 /*AEWW_WORD*/ : 0 /*AEWW_NONE*/, 0);
}

function SetOptionsAE()
{
  var hEditWnd = AkelPad.GetEditWnd();

  SetWindowFont(aDlg[IDTEXTAE].Handle, SendMessage(hMainWnd, 1233 /*AKD_GETFONTW*/, 0, 0));
  SetWordWrapAE();

  var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)
  AkelPad.MemCopy(lpRect,      4, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpRect +  4, 4, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpRect +  8, 4, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpRect + 12, 4, 3 /*DT_DWORD*/);
  SendMessage(aDlg[IDTEXTAE].Handle, 3178 /*AEM_SETRECT*/, 0x03 /*AERC_MARGINS|AERC_UPDATE*/, lpRect);
  AkelPad.MemFree(lpRect);

  if (hEditWnd)
  {
    var lpAECOLORS = AkelPad.MemAlloc(17 * 4);
    AkelPad.MemCopy(lpAECOLORS, 0x0001FFFE /*AECLR_ALL*/, 3 /*DT_DWORD*/);
    SendMessage(hEditWnd, 3231 /*AEM_GETCOLORS*/, 0, lpAECOLORS);
    SendMessage(aDlg[IDTEXTAE].Handle, 3232 /*AEM_SETCOLORS*/, 0, lpAECOLORS);
    AkelPad.MemFree(lpAECOLORS);

    if (SendMessage(hEditWnd, 3227 /*AEM_GETOPTIONS*/, 0, 0) & 0x00001000 /*AECO_ACTIVELINEBORDER*/)
      SendMessage(aDlg[IDTEXTAE].Handle, 3228 /*AEM_SETOPTIONS*/, 2 /*AECOOP_OR*/, 0x00001000 /*AECO_ACTIVELINEBORDER*/);

    var lpPOINT = AkelPad.MemAlloc(8);
    SendMessage(hEditWnd, 3237 /*AEM_GETCARETWIDTH*/, 0, lpPOINT);
    SendMessage(aDlg[IDTEXTAE].Handle, 3238 /*AEM_SETCARETWIDTH*/, 0, lpPOINT);
    AkelPad.MemFree(lpPOINT);

    SendMessage(aDlg[IDTEXTAE].Handle, 3260 /*AEM_SETLINEGAP*/, SendMessage(hEditWnd, 3259 /*AEM_GETLINEGAP*/, 0, 0), 0);
  }
}

function GetItemCountLV()
{
  return SendMessage(aDlg[IDNAMELV].Handle, 0x1004 /*LVM_GETITEMCOUNT*/, 0, 0);
}

function GetCurFocLV()
{
  return SendMessage(aDlg[IDNAMELV].Handle, 0x100C /*LVM_GETNEXTITEM*/, -1, 0x0001 /*LVNI_FOCUSED*/);
}

function GetCurSelLV()
{
  return SendMessage(aDlg[IDNAMELV].Handle, 0x100C /*LVM_GETNEXTITEM*/, -1, 0x0002 /*LVNI_SELECTED*/);
}

function SetCurSelLV(nItem)
{
  AkelPad.MemCopy(lpLVITEM + 12, 0x0003 /*LVIS_SELECTED|LVIS_FOCUSED*/, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpLVITEM + 16, 0x0003 /*LVIS_SELECTED|LVIS_FOCUSED*/, 3 /*DT_DWORD*/);
  SendMessage(aDlg[IDNAMELV].Handle, 0x102B /*LVM_SETITEMSTATE*/, nItem, lpLVITEM);
  SendMessage(aDlg[IDNAMELV].Handle, 0x1013 /*LVM_ENSUREVISIBLE*/, nItem, false);
}

function InsertColumnLV()
{
  var lpLVCOLUMN = AkelPad.MemAlloc(_X64 ? 56 : 44); //sizeof(LVCOLUMN)

  AkelPad.MemCopy(lpLVCOLUMN, 4 /*mask=LVCF_TEXT*/, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpLVCOLUMN + (_X64 ? 16 : 12), lpTextLV, 2 /*DT_QWORD*/);
  AkelPad.MemCopy(lpTextLV, "Name", 1 /*DT_UNICODE*/);

  SendMessage(aDlg[IDNAMELV].Handle, 0x1036 /*LVM_SETEXTENDEDLISTVIEWSTYLE*/, 0x0020 /*LVS_EX_FULLROWSELECT*/, 0x0020);
  SendMessage(aDlg[IDNAMELV].Handle, 0x1061 /*LVM_INSERTCOLUMNW*/, 0, lpLVCOLUMN);
  AkelPad.MemFree(lpLVCOLUMN);
}

function FillLV(nSel, sFind, bFindOnStart)
{
  var i;

  SendMessage(aDlg[IDNAMELV].Handle, 0x000B /*WM_SETREDRAW*/, false, 0);
  SendMessage(aDlg[IDNAMELV].Handle, 0x1009 /*LVM_DELETEALLITEMS*/, 0, 0);

  for (i = 0; i < aAPM.length; ++i)
  {
    AkelPad.MemCopy(lpLVITEM + 4, i, 3 /*DT_DWORD*/);
    AkelPad.MemCopy(lpTextLV, aAPM[i][0].replace(/^AkelPad\./, ""), 1 /*DT_UNICODE*/);
    SendMessage(aDlg[IDNAMELV].Handle, 0x104D /*LVM_INSERTITEMW*/, 0, lpLVITEM);

    if (sFind)
    {
      if ((bFindOnStart && (aAPM[i][0].indexOf(sFind) > -1)) || ((! bFindOnStart) && (aAPM[i][0] == sFind)))
      {
        if (bFindOnStart)
          sFindName = sFind;

        nSel  = i;
        sFind = "";
      }
    }
  }

  if (nSel >= GetItemCountLV())
    nSel = GetItemCountLV() - 1;
  if (nSel < 0)
    nSel = 0;

  SetCurSelLV(nSel);
  SendMessage(aDlg[IDNAMELV].Handle, 0x000B /*WM_SETREDRAW*/, true, 0);
}

function GetArrayAPM(hWnd)
{
  var sDocsDir = AkelPad.GetAkelDir(2 /*ADTYPE_DOCS*/) + "\\";
  var aDocFile = ["Scripts-Eng.txt", "Scripts-Rus.txt"];
  var sText;
  var lpTextA;
  var lpTextW;
  var nTextWLen;
  var aExec;
  var oRE;
  var i;

  aIsLang     = [false, false];
  sHeader     = "";
  aAPM.length = 0;

  while (! (aIsLang[0] || aIsLang[1]))
  {
    if (sAltDir)
    {
      for (i = 0; i < 2; ++i)
        aIsLang[i] = oFSO.FileExists(sAltDir + aDocFile[i]);
    }

    if (aIsLang[0] || aIsLang[1])
      sDocsDir = sAltDir;
    else
    {
      for (i = 0; i < 2; ++i)
        aIsLang[i] = oFSO.FileExists(sDocsDir + aDocFile[i]);

      if (! (aIsLang[0] || aIsLang[1]))
      {
        AkelPad.MessageBox(hWnd, "Files not found:\n" + ((sAltDir && (sAltDir.toUpperCase() != sDocsDir.toUpperCase())) ? (sAltDir + aDocFile[0] + "\n" + sAltDir + aDocFile[1] + "\n") : "") + sDocsDir + aDocFile[0] + "\n" + sDocsDir + aDocFile[1], sScriptName, 0x30 /*MB_ICONWARNING*/);

        if (! sAltDir)
          sAltDir = AkelPad.GetAkelDir(1 /*ADTYPE_AKELFILES*/) + "\\";

        sAltDir = BrowseForFolder(hWnd, "Choose directory with documentation of Scripts plugin:", sAltDir);

        if (! sAltDir)
          return;
        else if (sAltDir.slice(-1) != "\\")
          sAltDir += "\\";
      }
    }
  }

  if (! aIsLang[nAPMLang])
    nAPMLang = Number(! nAPMLang);

  oFile = oFSO.OpenTextFile(sDocsDir + aDocFile[nAPMLang], 1, false, 0 /*ASCII*/);
  sText = oFile.ReadAll().replace(/\r\n/g, "\n");
  oFile.Close();

  //convert ANSII to UTF-16LE
  lpTextA = AkelPad.MemAlloc(sText.length + 1);
  AkelPad.MemCopy(lpTextA, sText, 0 /*DT_ANSI*/);
  if (nTextWLen = oSys.Call("Kernel32::MultiByteToWideChar", 1251 /*CodePage*/, 0, lpTextA, -1, 0, 0))
  {
    lpTextW = AkelPad.MemAlloc(nTextWLen * 2);
    oSys.Call("Kernel32::MultiByteToWideChar", 1251, 0, lpTextA, -1, lpTextW, nTextWLen);
    sText = AkelPad.MemRead(lpTextW, 1 /*DT_UNICODE*/);
    AkelPad.MemFree(lpTextW);
  }
  AkelPad.MemFree(lpTextA);

  //methods and constants
  oRE = /^(([\w.()]+)\n_+\n+[\s\S]+?\n)\n*(?=[\w.()]+\n_+)|^(([\w.()]+)\n_+\n+[\s\S]+?\n)\n*(?=\*{3} \S.+\S \*{3}\n)/gm
  while (aExec = oRE.exec(sText))
  {
    if (aExec[1])
      aAPM.push([aExec[2], aExec[1]]);
    else if (aExec[3])
      aAPM.push([aExec[4], aExec[3]]);
  }

  if (bAPMSort)
    aAPM.sort(
      function(a1, a2)
      {
        if (a1[0] < a2[0])
          return -1;
        else if (a1[0] > a2[0])
          return 1;
        else
          return 0;
      });

  //Scripts-*.txt
  //first char in Name must be "*"
  if (aExec = /(^\*{4,}\n\*{3} +(\S.+\S) +\*{3}\n\*{4,}\n+[\s\S]+?\n)/m.exec(sText))
  {
    sHeader = aExec[2];
    aAPM.push(["*** " + aDocFile[nAPMLang] + " ***", aExec[1]]);
  }

  oRE = /^((\*{3} \S.+\S \*{3})\n+[\s\S]+?\n)\n*(?=\*{3} \S.+\S \*{3}\n)|(^(\*{3} \S.+\S \*{3})\n+[\s\S]+)/gm;
  while (aExec = oRE.exec(sText))
  {
    if (aExec[1])
      aAPM.push([aExec[2].replace(/ \(.+\)/, ""), aExec[1]]);
    else if (aExec[3])
      aAPM.push([aExec[4].replace(/ \(.+\)/, ""), aExec[3]]);
  }
}

function CheckButtons(nButton)
{
  if (nButton == IDSORTB)
    bAPMSort = ! bAPMSort;
  else if ((nButton == IDLANG1B) || (nButton == IDLANG2B))
    nAPMLang = nButton - IDLANG1B;

  SendMessage(aDlg[IDSORTB ].Handle, 241 /*BM_SETCHECK*/, bAPMSort, 0);
  SendMessage(aDlg[IDLANG1B].Handle, 241 /*BM_SETCHECK*/, (nAPMLang == 0), 0);
  SendMessage(aDlg[IDLANG2B].Handle, 241 /*BM_SETCHECK*/, (nAPMLang == 1), 0);

  oSys.Call("User32::EnableWindow", aDlg[IDLANG1B].Handle, aIsLang[0]);
  oSys.Call("User32::EnableWindow", aDlg[IDLANG2B].Handle, aIsLang[1]);
}

function PaintSizeGrip()
{
  var lpPaint = AkelPad.MemAlloc(_X64 ? 72 : 64); //sizeof(PAINTSTRUCT)
  var lpRect  = AkelPad.MemAlloc(16); //sizeof(RECT)
  var hDC;

  if (hDC = oSys.Call("User32::BeginPaint", hWndDlg, lpPaint))
  {
    oSys.Call("User32::GetClientRect", hWndDlg, lpRect);

    AkelPad.MemCopy(lpRect,     AkelPad.MemRead(lpRect +  8, 3 /*DT_DWORD*/) - oSys.Call("User32::GetSystemMetrics",  2 /*SM_CXVSCROLL*/), 3 /*DT_DWORD*/);
    AkelPad.MemCopy(lpRect + 4, AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/) - oSys.Call("User32::GetSystemMetrics", 20 /*SM_CYVSCROLL*/), 3 /*DT_DWORD*/);

    oSys.Call("User32::DrawFrameControl", hDC, lpRect, 3 /*DFC_SCROLL*/, 0x8 /*DFCS_SCROLLSIZEGRIP*/);
    oSys.Call("User32::EndPaint", hWndDlg, lpPaint);
  }

  AkelPad.MemFree(lpPaint);
  AkelPad.MemFree(lpRect);
}

function ResizeDlg(nW, nH)
{
  var nFlags = 0x14; //SWP_NOACTIVATE|SWP_NOZORDER
  var nLVW   = 205;
  var nAEW   = nW - nLVW - 30;
  var i;

  oSys.Call("User32::SetWindowPos",
    aDlg[IDHEADERS].Handle, 0,
    nW - nAEW - 10,
    13,
    nAEW,
    13,
    nFlags);
  oSys.Call("User32::SetWindowPos",
    aDlg[IDNAMELV].Handle, 0,
    10,
    10,
    nLVW,
    nH - 53,
    nFlags);
  oSys.Call("User32::SetWindowPos",
    aDlg[IDTEXTAE].Handle, 0,
    nW - nAEW - 10,
    30,
    nAEW,
    nH - 73,
    nFlags);
  oSys.Call("User32::SetWindowPos",
    aDlg[IDSORTB].Handle, 0,
    10,
    nH - 30,
    100,
    16,
    nFlags);
  for (i = IDLANG1B; i <= IDLANG2B; ++i)
  {
    oSys.Call("User32::SetWindowPos",
      aDlg[i].Handle, 0,
      20 + nLVW + 75 * (i - IDLANG1B),
      nH - 30,
      70,
      16,
      nFlags);
  }
  for (i = IDMENUB; i <= IDCLOSEB; ++i)
  {
    oSys.Call("User32::SetWindowPos",
      aDlg[i].Handle, 0,
      nW - (70 + 10) * (IDCLOSEB - i + 1),
      nH - 33,
      70,
      23,
      nFlags);
  }

  SendMessage(aDlg[IDNAMELV].Handle, 0x101E /*LVM_SETCOLUMNWIDTH*/, 0, -2 /*LVSCW_AUTOSIZE_USEHEADER*/);
  SendMessage(aDlg[IDNAMELV].Handle, 0x1013 /*LVM_ENSUREVISIBLE*/, GetCurSelLV(), false);
}

function MoveDlg(nKey)
{
  var oRectWA = {};
  var oRect   = {};

  GetWindowPos(0, oRectWA);
  GetWindowPos(hWndDlg, oRect);

  if (nKey == 0x21 /*VK_PRIOR*/)
    oRect.Y = oRectWA.Y;
  else if (nKey == 0x22 /*VK_NEXT*/)
    oRect.Y = oRectWA.Y + oRectWA.H - oRect.H;
  else if (nKey == 0x23 /*VK_END*/)
    oRect.X = oRectWA.X + oRectWA.W - oRect.W;
  else if (nKey == 0x24 /*VK_HOME*/)
    oRect.X = oRectWA.X;
  else if (nKey == 0x25 /*VK_LEFT*/)
  {
    if (oRect.X > oRectWA.X)
      oRect.X = (oRect.X - oRectWA.X > 20) ? oRect.X - 20 : oRectWA.X;
  }
  else if (nKey == 0x26 /*VK_UP*/)
  {
    if (oRect.Y > oRectWA.Y)
      oRect.Y = (oRect.Y - oRectWA.Y > 20) ? oRect.Y - 20 : oRectWA.Y;
  }
  else if (nKey == 0x27 /*VK_RIGHT*/)
  {
    if (oRect.X + oRect.W < oRectWA.X + oRectWA.W)
      oRect.X = (oRectWA.X + oRectWA.W - oRect.X - oRect.W > 20) ? oRect.X + 20 : oRectWA.X + oRectWA.W - oRect.W;
  }
  else if (nKey == 0x28 /*VK_DOWN*/)
  {
    if (oRect.Y + oRect.H < oRectWA.Y + oRectWA.H)
      oRect.Y = (oRectWA.Y + oRectWA.H - oRect.Y - oRect.H > 20) ? oRect.Y + 20 : oRectWA.Y + oRectWA.H - oRect.H;
  }

  oSys.Call("user32::SetWindowPos", hWndDlg, 0, oRect.X, oRect.Y, 0, 0, 0x15 /*SWP_NOZORDER|SWP_NOACTIVATE|SWP_NOSIZE*/);
}

function FindName(nDirection)
{
  InputBox(aDlg[IDNAMELV].Handle, "Find name " + ["down from beginning", "down from current position", "up from end", "up from current position"][nDirection], "Name:", sFindName, 0, CheckFindName, nDirection);
}

function CheckFindName(hWnd, aName, nDirection)
{
  if (aName[0])
  {
    sFindName = aName[0];
    if (! FindNameNext(nDirection))
    {
      AkelPad.MessageBox(hWnd, "Not found.", sScriptName, 0x30 /*MB_ICONWARNING*/);
      return 0;
    }
  }

  return -1;
}

function FindNameNext(nDirection)
{
  var bFound = false;
  var nStart;
  var i;

  if (nDirection < 2)
  {
    if (nDirection == 0)
      nStart = 0;
    else
      nStart = GetCurSelLV() + 1;

    for (i = nStart; i < aAPM.length; ++i)
    {
      if (aAPM[i][0].indexOf(sFindName) > -1)
      {
        SetCurSelLV(i);
        bFound = true;
        break;
      }
    }
  }
  else
  {
    if (nDirection == 2)
      nStart = GetItemCountLV() - 1;
    else
      nStart = GetCurSelLV() - 1;

    for (i = nStart; i >= 0; --i)
    {
      if (aAPM[i][0].indexOf(sFindName) > -1)
      {
        SetCurSelLV(i);
        bFound = true;
        break;
      }
    }
  }

  return bFound;
}

function FindText(nDirection)
{
  var sText = GetSelTextAE();

  if (! sText)
    sText = sFindText;

  InputBox(aDlg[IDTEXTAE].Handle, "Find text " + ["down from beginning", "down from current position", "up from end", "up from current position"][nDirection], "Text:", sText, 0, CheckFindText, nDirection);
}

function CheckFindText(hWnd, aText, nDirection)
{
  if (aText[0])
  {
    sFindText = aText[0];
    if (! FindTextNext(nDirection))
    {
      AkelPad.MessageBox(hWnd, "Not found.", sScriptName, 0x30 /*MB_ICONWARNING*/);
      return 0;
    }
  }

  return -1;
}

function FindTextNext(nDirection)
{
  var bFound = false;
  var nNameStart;
  var nTextStart;
  var nSel;
  var i;

  if (nDirection < 2)
  {
    if (nDirection == 0)
    {
      nNameStart = 0;
      nTextStart = 0;
    }
    else
    {
      nNameStart = GetCurSelLV();
      nTextStart = GetSelEndAE();
    }

    for (i = nNameStart; i < aAPM.length; ++i)
    {
      nSel = aAPM[i][1].indexOf(sFindText, (i == nNameStart) ? nTextStart : 0);

      if (nSel > -1)
      {
        SetCurSelLV(i);
        SetSelAE(nSel, nSel + sFindText.length);
        bFound = true;
        break;
      }
    }
  }
  else
  {
    if (nDirection == 2)
    {
      nNameStart = GetItemCountLV() - 1;
      nTextStart = aAPM[nNameStart][1].length;
    }
    else
    {
      nNameStart = GetCurSelLV();
      nTextStart = GetSelStartAE() - 1;
    }

    for (i = nNameStart; i >= 0; --i)
    {
      nSel = aAPM[i][1].lastIndexOf(sFindText, (i == nNameStart) ? nTextStart : aAPM[i][1].length);

      if (nSel > -1)
      {
        SetCurSelLV(i);
        SetSelAE(nSel, nSel + sFindText.length);
        bFound = true;
        break;
      }
    }
  }

  return bFound;
}

function MethodToEditText()
{
  if (aAPM[nAPMSel][0].charAt(0) == "A")
  {
    var sSelText = AkelPad.GetSelText(0);
    AkelPad.ReplaceSel(aAPM[nAPMSel][0] + "(" + sSelText + ")");
    AkelPad.SetSel(AkelPad.GetSelEnd() - sSelText.length - 1, AkelPad.GetSelEnd() - 1);
  }
  else
    AkelPad.ReplaceSel(aAPM[nAPMSel][0], true);
}

function Menu()
{
  var MF_STRING    = 0x0000;
  var MF_CHECKED   = 0x0008;
  var MF_POPUP     = 0x0010;
  var MF_SEPARATOR = 0x0800;
  var hMenu1 = oSys.Call("User32::CreatePopupMenu");
  var hMenu2 = oSys.Call("User32::CreatePopupMenu");
  var hMenu3 = oSys.Call("User32::CreatePopupMenu");
  var hMenu  = oSys.Call("User32::CreatePopupMenu");
  var aMenu  = [hMenu1, hMenu2];
  var oRect  = {};
  var nCmd;
  var nCmd1;
  var i;

  for (i = 1; i <= 2; ++i)
  {
    oSys.Call("User32::AppendMenuW", aMenu[i - 1], MF_STRING, 0x0000 | i, "Down form beginning\tCtrl+F");
    oSys.Call("User32::AppendMenuW", aMenu[i - 1], MF_STRING, 0x0200 | i, "Up from end\tCtrl+Shift+F");
    oSys.Call("user32::AppendMenuW", aMenu[i - 1], MF_SEPARATOR, 0);
    oSys.Call("User32::AppendMenuW", aMenu[i - 1], MF_STRING, 0x0100 | i, "Down from current position\tAlt+F");
    oSys.Call("User32::AppendMenuW", aMenu[i - 1], MF_STRING, 0x0300 | i, "Up from current position\tShift+Alt+F");
    oSys.Call("user32::AppendMenuW", aMenu[i - 1], MF_SEPARATOR, 0);
    oSys.Call("User32::AppendMenuW", aMenu[i - 1], MF_STRING, 0x0400 | i, "Next\tF3");
    oSys.Call("User32::AppendMenuW", aMenu[i - 1], MF_STRING, 0x0500 | i, "Previous\tShift+F3");
  }

  oSys.Call("User32::AppendMenuW", hMenu3, MF_STRING, 0x2503 /*VK_LEFT*/,  "Move left\tCtrl+Alt+Left");
  oSys.Call("User32::AppendMenuW", hMenu3, MF_STRING, 0x2703 /*VK_RIGHT*/, "Move right\tCtrl+Alt+Right");
  oSys.Call("User32::AppendMenuW", hMenu3, MF_STRING, 0x2603 /*VK_UP*/,    "Move up\tCtrl+Alt+Up");
  oSys.Call("User32::AppendMenuW", hMenu3, MF_STRING, 0x2803 /*VK_DOWN*/,  "Move down\tCtrl+Alt+Down");
  oSys.Call("user32::AppendMenuW", hMenu3, MF_SEPARATOR, 0);
  oSys.Call("User32::AppendMenuW", hMenu3, MF_STRING, 0x2403 /*VK_HOME*/,  "To left edge\tCtrl+Alt+Home");
  oSys.Call("User32::AppendMenuW", hMenu3, MF_STRING, 0x2303 /*VK_END*/,   "To right edge\tCtrl+Alt+End");
  oSys.Call("User32::AppendMenuW", hMenu3, MF_STRING, 0x2103 /*VK_PRIOR*/, "To top edge\tCtrl+Alt+PgUp");
  oSys.Call("User32::AppendMenuW", hMenu3, MF_STRING, 0x2203 /*VK_NEXT*/,  "To bottom edge\tCtrl+Alt+PgDn");

  oSys.Call("User32::AppendMenuW", hMenu, MF_POPUP,  hMenu1, "Find name");
  oSys.Call("User32::AppendMenuW", hMenu, MF_POPUP,  hMenu2, "Find text");
  oSys.Call("User32::AppendMenuW", hMenu, MF_POPUP,  hMenu3, "Window");
  oSys.Call("User32::AppendMenuW", hMenu, (bWordWrap ? MF_CHECKED : MF_STRING), 0x0004, "Wrap lines\tCtrl+U");

  GetWindowPos(aDlg[IDMENUB].Handle, oRect);

  nCmd = oSys.Call("User32::TrackPopupMenu", hMenu, 0x01A8 /*TPM_NONOTIFY|TPM_RETURNCMD|TPM_BOTTOMALIGN|TPM_RIGHTALIGN*/, oRect.X + oRect.W, oRect.Y, 0, hWndDlg, 0);

  oSys.Call("User32::DestroyMenu", hMenu1);
  oSys.Call("User32::DestroyMenu", hMenu2);
  oSys.Call("User32::DestroyMenu", hMenu3);
  oSys.Call("User32::DestroyMenu", hMenu);

  nCmd1 = (nCmd >> 8) & 0xFF;
  nCmd  = nCmd & 0xFF;

  if (nCmd == 1)
  {
    oSys.Call("User32::SetFocus", aDlg[IDNAMELV].Handle);
    if (nCmd1 < 4)
      FindName(nCmd1);
    else if (nCmd1 == 4)
      FindNameNext(1);
    else if (nCmd1 == 5)
      FindNameNext(3);
  }
  if (nCmd == 2)
  {
    oSys.Call("User32::SetFocus", aDlg[IDTEXTAE].Handle);
    if (nCmd1 < 4)
      FindText(nCmd1);
    else if (nCmd1 == 4)
      FindTextNext(1);
    else if (nCmd1 == 5)
      FindTextNext(3);
  }
  if (nCmd == 3)
    MoveDlg(nCmd1);
  else if (nCmd == 4)
  {
    bWordWrap = ! bWordWrap;
    SetWordWrapAE();
  }
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

  if (nDlgW < nDlgMinW) nDlgW = nDlgMinW;
  if (nDlgH < nDlgMinH) nDlgH = nDlgMinH;
}

function WriteIni()
{
  var oFile = oFSO.OpenTextFile(WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini", 2, true, -1);
  var oRect = {};
  var sIniTxt;

  GetWindowPos(hWndDlg, oRect);

  sIniTxt =
    'nDlgX='      + oRect.X + ';\r\n' +
    'nDlgY='      + oRect.Y + ';\r\n' +
    'nDlgW='      + oRect.W + ';\r\n' +
    'nDlgH='      + oRect.H + ';\r\n' +
    'nAPMSel='    + nAPMSel + ';\r\n' +
    'bAPMSort='   + bAPMSort + ';\r\n' +
    'nAPMLang='   + nAPMLang + ';\r\n' +
    'bWordWrap='  + bWordWrap + ';\r\n' +
    'sFindName="' + EscapeStr(sFindName) + '";\r\n' +
    'sFindText="' + EscapeStr(sFindText) + '";\r\n' +
    'sAltDir="'   + EscapeStr(sAltDir) + '";'
	
  oFile.Write(sIniTxt);
  oFile.Close();
}

function EscapeStr(sText)
{
  return sText.replace(/[\\"]/g, '\\$&').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}
