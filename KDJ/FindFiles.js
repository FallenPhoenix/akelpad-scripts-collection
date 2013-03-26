// FindFiles.js - ver. 2013-03-26
//
// Search files by name and content.
//
// Usage:
// Call("Scripts::Main", 1, "FindFiles.js")
// Required to include: BrowseForFolder_function.js, FileAndStream_functions.js
//
// Keys and mouse:
// Alt+F       - focus to Files list
// Ctrl+A      - select all items on files list
// Ctrl+C      - copy selected items from files list
// Del         - remove selected items from files list (don't delete the files)
// F4          - open all selected files for editing
// DblClick    - open selected file for editing and select the found text (or close file if is currently edited)
// Ctrl+Enter
// Shift+Enter - open focused file for editing and select the found text (or close file if is currently edited)
// F1          - help for regular expressions or wildcards
// Alt+Del     - remove item from history list (Directory, Name of file, Text in file)

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
  if (! (AkelPad.Include("BrowseForFolder_function.js") && AkelPad.Include("FileAndStream_functions.js")))
    WScript.Quit();

  var DT_UNICODE = 1;
  var DT_DWORD   = 3;
  var DT_WORD    = 4;
  var hMainWnd   = AkelPad.GetMainWnd();
  var nBkColorRE = 0xA0FFFF;
  var hBrush     = oSys.Call("Gdi32::CreateSolidBrush", nBkColorRE);
  var nBufSize   = 1024;
  var lpBuffer   = AkelPad.MemAlloc(nBufSize);
  var lpLVITEM   = AkelPad.MemAlloc(15 * 4); //sizeof(LVITEM)

  AkelPad.MemCopy(lpLVITEM, 0x0001 /*LVIF_TEXT*/, DT_DWORD); //mask
  AkelPad.MemCopy(lpLVITEM + 20, lpBuffer, DT_DWORD); //pszText
  AkelPad.MemCopy(lpLVITEM + 24, nBufSize, DT_DWORD); //cchTextMax

  var hWndParent   = hMainWnd;
  var nMaxLenCBE   = 15;
  var nMaxLenCBL   = 27;
  var nNameSel1    = 0;
  var nNameSel2    = -1;
  var nContentSel1 = 0;
  var nContentSel2 = -1;
  var bCloseCBL;
  var hWndNameEdit;
  var hWndNameList;
  var hWndContentEdit;
  var hWndContentList;
  var hWndFocus;

  var oWndMin = {"W": 445,
                 "H": 442};
  var oWndPos = {"X": 240,
                 "Y": 140,
                 "W": oWndMin.W,
                 "H": oWndMin.H,
                 "Max": 0};
  var bSeparateWnd    = 0;
  var bKeepFiles      = 1;
  var bPathShow       = 1;
  var nPathLen        = 0;
  var bSortDesc       = 0;
  var nDirLevel       = -1;
  var bNameRE         = 0;
  var bNotName        = 0;
  var bContentRE      = 0;
  var bMatchCase      = 0;
  var bMultiline      = 0;
  var bNotContain     = 0;
  var bInStreams      = 0;
  var bSkipBinary     = 1;
  var nMaxFileSize    = 0;
  var sDir            = "";
  var sName           = "";
  var sContent        = "";
  var sLastContent    = "";
  var bLastContentRE  = 0;
  var bLastMatchCase  = 0;
  var bLastMultiline  = 0;
  var bLastNotContain = 0;
  var aDirs           = [];
  var aNames          = [];
  var aContents       = [];
  var aFiles          = [];
  var aFilesSel       = [0];
  var nFilesFoc       = 0;

  ReadIni();

  if (bSeparateWnd)
    hWndParent = 0;
  if (oWndPos.H < oWndMin.H)
    oWndPos.H = oWndMin.H;
  if (oWndPos.W < oWndMin.W)
    oWndPos.W = oWndMin.W;
  if (aDirs.length > nMaxLenCBE)
    aDirs.length = nMaxLenCBE;
  if (aNames.length > nMaxLenCBE)
    aNames.length = nMaxLenCBE;
  if (aContents.length > nMaxLenCBE)
    aContents.length = nMaxLenCBE;

  var CLASS = 0;
  var HWND  = 1;
  var STYLE = 2;
  var TXT   = 3;

  var aWnd         = [];
  var IDDIRG       = 2000;
  var IDDIRCB      = 2001;
  var IDCURRENTB   = 2002;
  var IDBROWSEB    = 2003;
  var IDSUBDIRS    = 2004;
  var IDLEVELCB    = 2005;
  var IDNAMEG      = 2006;
  var IDNAMECB     = 2007;
  var IDHELP1B     = 2008;
  var IDNAMERE     = 2009;
  var IDNOTNAME    = 2010;
  var IDCONTENTG   = 2011;
  var IDCONTENTCB  = 2012;
  var IDHELP2B     = 2013;
  var IDMATCHCASE  = 2014;
  var IDCONTENTRE  = 2015;
  var IDMULTILINE  = 2016;
  var IDNOTCONTAIN = 2017;
  var IDINSTREAMS  = 2018;
  var IDSKIPBINARY = 2019;
  var IDSKIPLARGER = 2020;
  var IDMAXSIZE    = 2021;
  var IDBYTESYMBOL = 2022;
  var IDFILELV     = 2023;
  var IDSEARCHB    = 2024;
  var IDEDITB      = 2025;
  var IDCOPYB      = 2026;
  var IDCLEARB     = 2027;
  var IDSETTINGSB  = 2028;
  var IDCLOSEB     = 2029;
  var IDSTATUS     = 2030;

  //0x50000000 - WS_VISIBLE|WS_CHILD
  //0x50000002 - WS_VISIBLE|WS_CHILD|SS_RIGHT
  //0x50000007 - WS_VISIBLE|WS_CHILD|BS_GROUPBOX
  //0x50000100 - WS_VISIBLE|WS_CHILD|SBARS_SIZEGRIP
  //0x50010000 - WS_VISIBLE|WS_CHILD|WS_TABSTOP
  //0x50010042 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|CBS_AUTOHSCROLL|CBS_DROPDOWN
  //0x50010003 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|CBS_DROPDOWNLIST
  //0x50010003 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
  //0x50810009 - WS_VISIBLE|WS_CHILD|WS_BORDER|WS_TABSTOP|LVS_SHOWSELALWAYS|LVS_REPORT
  //0x50812002 - WS_VISIBLE|WS_CHILD|WS_BORDER|WS_TABSTOP|ES_NUMBER|ES_RIGHT
  //Windows           CLASS,             HWND,      STYLE, TXT
  aWnd[IDDIRG      ]=["BUTTON",             0, 0x50000007, sTxtDir];
  aWnd[IDDIRCB     ]=["COMBOBOX",           0, 0x50210042, ""];
  aWnd[IDCURRENTB  ]=["BUTTON",             0, 0x50010000, sTxtCurrent];
  aWnd[IDBROWSEB   ]=["BUTTON",             0, 0x50010000, sTxtBrowse];
  aWnd[IDSUBDIRS   ]=["STATIC",             0, 0x50000002, sTxtSubDirs];
  aWnd[IDLEVELCB   ]=["COMBOBOX",           0, 0x50010003, ""];
  aWnd[IDNAMEG     ]=["BUTTON",             0, 0x50000007, sTxtFileName + (bNameRE ? "" : " " + sTxtWildcards)];
  aWnd[IDNAMECB    ]=["COMBOBOX",           0, 0x50210042, ""];
  aWnd[IDHELP1B    ]=["BUTTON",             0, 0x50010000, "?"];
  aWnd[IDNAMERE    ]=["BUTTON",             0, 0x50010003, sTxtRegExp];
  aWnd[IDNOTNAME   ]=["BUTTON",             0, 0x50010003, sTxtNotName];
  aWnd[IDCONTENTG  ]=["BUTTON",             0, 0x50000007, sTxtTextInFile];
  aWnd[IDCONTENTCB ]=["COMBOBOX",           0, 0x50210042, ""];
  aWnd[IDHELP2B    ]=["BUTTON",             0, 0x50010000, "?"];
  aWnd[IDMATCHCASE ]=["BUTTON",             0, 0x50010003, sTxtMatchCase];
  aWnd[IDCONTENTRE ]=["BUTTON",             0, 0x50010003, sTxtRegExp];
  aWnd[IDMULTILINE ]=["BUTTON",             0, 0x50010003, sTxtMultiline];
  aWnd[IDNOTCONTAIN]=["BUTTON",             0, 0x50010003, sTxtNotContain];
  aWnd[IDINSTREAMS ]=["BUTTON",             0, 0x50010003, sTxtInStreams];
  aWnd[IDSKIPBINARY]=["BUTTON",             0, 0x50010003, sTxtSkipBinary];
  aWnd[IDSKIPLARGER]=["STATIC",             0, 0x50000000, sTxtSkipLarger];
  aWnd[IDMAXSIZE   ]=["EDIT",               0, 0x50812002, (nMaxFileSize > 0) ? nMaxFileSize.toString() : ""];
  aWnd[IDBYTESYMBOL]=["STATIC",             0, 0x50000000, sTxtByteSymbol];
  aWnd[IDFILELV    ]=["SysListView32",      0, 0x50810009, ""];
  aWnd[IDSEARCHB   ]=["BUTTON",             0, 0x50010000, sTxtSearch];
  aWnd[IDEDITB     ]=["BUTTON",             0, 0x50010000, sTxtEdit];
  aWnd[IDCOPYB     ]=["BUTTON",             0, 0x50010000, sTxtCopyList];
  aWnd[IDCLEARB    ]=["BUTTON",             0, 0x50010000, sTxtClearList];
  aWnd[IDSETTINGSB ]=["BUTTON",             0, 0x50010000, sTxtSettings];
  aWnd[IDCLOSEB    ]=["BUTTON",             0, 0x50010000, sTxtClose];
  aWnd[IDSTATUS    ]=["msctls_statusbar32", 0, 0x50000100, ""];

  AkelPad.WindowRegisterClass(sClassName);

  hWndDlg = oSys.Call("User32::CreateWindowExW",
                      0,               //dwExStyle
                      sClassName,      //lpClassName
                      sTxtScriptName,  //lpWindowName
                      0x80CF0000,      //dwStyle=WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_MAXIMIZEBOX|WS_MINIMIZEBOX|WS_SIZEBOX
                      oWndPos.X,       //x
                      oWndPos.Y,       //y
                      oWndPos.W,       //nWidth
                      oWndPos.H,       //nHeight
                      hWndParent,      //hWndParent
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
  AkelPad.MemFree(lpLVITEM);
  oSys.Call("Gdi32::DeleteObject", hBrush);
}

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    var hGuiFont = oSys.Call("Gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
    var i;

    for (i = 2000; i < aWnd.length; ++i)
    {
      aWnd[i][HWND] =
        oSys.Call("User32::CreateWindowExW",
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

      AkelPad.SendMessage(aWnd[i][HWND], 48 /*WM_SETFONT*/, hGuiFont, true);
      SetWindowText(aWnd[i][HWND], aWnd[i][TXT]);
    }

    AkelPad.SendMessage(aWnd[IDNAMERE    ][HWND], 0x00F1 /*BM_SETCHECK*/, bNameRE, 0);
    AkelPad.SendMessage(aWnd[IDNOTNAME   ][HWND], 0x00F1 /*BM_SETCHECK*/, bNotName, 0);
    AkelPad.SendMessage(aWnd[IDMATCHCASE ][HWND], 0x00F1 /*BM_SETCHECK*/, bMatchCase, 0);
    AkelPad.SendMessage(aWnd[IDCONTENTRE ][HWND], 0x00F1 /*BM_SETCHECK*/, bContentRE, 0);
    AkelPad.SendMessage(aWnd[IDMULTILINE ][HWND], 0x00F1 /*BM_SETCHECK*/, bMultiline, 0);
    AkelPad.SendMessage(aWnd[IDNOTCONTAIN][HWND], 0x00F1 /*BM_SETCHECK*/, bNotContain, 0);
    AkelPad.SendMessage(aWnd[IDINSTREAMS ][HWND], 0x00F1 /*BM_SETCHECK*/, bInStreams, 0);
    AkelPad.SendMessage(aWnd[IDSKIPBINARY][HWND], 0x00F1 /*BM_SETCHECK*/, bSkipBinary, 0);
    EnableButtons();

    //Get handles to edit/list in ComboBoxes IDNAMECB and IDCONTENTCB
    AkelPad.MemCopy(lpBuffer, 52 /*sizeof(COMBOBOXINFO)*/, DT_DWORD);
    oSys.Call("User32::GetComboBoxInfo", aWnd[IDNAMECB][HWND], lpBuffer);
    hWndNameEdit = AkelPad.MemRead(lpBuffer + 44 /*hwndItem*/, DT_DWORD);
    hWndNameList = AkelPad.MemRead(lpBuffer + 48 /*hwndList*/, DT_DWORD);
    oSys.Call("User32::GetComboBoxInfo", aWnd[IDCONTENTCB][HWND], lpBuffer);
    hWndContentEdit = AkelPad.MemRead(lpBuffer + 44 /*hwndItem*/, DT_DWORD);
    hWndContentList = AkelPad.MemRead(lpBuffer + 48 /*hwndList*/, DT_DWORD);

    AkelPad.SendMessage(aWnd[IDDIRCB    ][HWND], 0x0141 /*CB_LIMITTEXT*/, 256, 0);
    AkelPad.SendMessage(aWnd[IDNAMECB   ][HWND], 0x0141 /*CB_LIMITTEXT*/, 256, 0);
    AkelPad.SendMessage(aWnd[IDCONTENTCB][HWND], 0x0141 /*CB_LIMITTEXT*/, 256, 0);
    AkelPad.SendMessage(aWnd[IDDIRCB    ][HWND], 0x0155 /*CB_SETEXTENDEDUI*/, 1, 0);
    AkelPad.SendMessage(aWnd[IDNAMECB   ][HWND], 0x0155 /*CB_SETEXTENDEDUI*/, 1, 0);
    AkelPad.SendMessage(aWnd[IDCONTENTCB][HWND], 0x0155 /*CB_SETEXTENDEDUI*/, 1, 0);

    SetWindowText(aWnd[IDDIRCB][HWND], sDir);
    oSys.Call("User32::PostMessageW", hWnd, 0x8000 /*WM_APP*/, 0, 0);
    FillCB();

    SetPartsSB();

    AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x1036 /*LVM_SETEXTENDEDLISTVIEWSTYLE*/, 0x0020 /*LVS_EX_FULLROWSELECT*/, 0x0020);
    SetColumnLV();
    SetHeaderLV();
    FillLV();

    hWndFocus = aWnd[IDDIRCB][HWND];
  }

  else if (uMsg == 0x8000 /*WM_APP*/)
  {
    SetWindowText(aWnd[IDNAMECB][HWND], sName);
    SetWindowText(aWnd[IDCONTENTCB][HWND], sContent);
  }

  else if (uMsg == 0x8001 /*WM_APP+1*/)
    oSys.Call("User32::SetFocus", wParam);

  else if ((uMsg == 6 /*WM_ACTIVATE*/) && (! wParam))
    hWndFocus = oSys.Call("User32::GetFocus");

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("User32::SetFocus", hWndFocus);

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

  else if (uMsg == 0x0133) //WM_CTLCOLOREDIT
  {
    if ((lParam == hWndNameEdit) || (lParam == hWndContentEdit))
    {
      if (((lParam == hWndNameEdit) && (bNameRE)) || ((lParam == hWndContentEdit) && (bContentRE)))
      {
        oSys.Call("Gdi32::SetBkColor", wParam, nBkColorRE);
        return hBrush;
      }
      else
      {
        oSys.Call("Gdi32::SetBkColor", wParam, oSys.Call("User32::GetSysColor", 5 /*COLOR_WINDOW*/));
        return oSys.Call("User32::GetSysColorBrush", 5 /*COLOR_WINDOW*/);
      }
    }
  }

  else if (uMsg == 0x0134) //WM_CTLCOLORLISTBOX
  {
    if ((lParam == hWndNameList) || (lParam == hWndContentList))
    {
      if (((lParam == hWndNameList) && (bNameRE)) || ((lParam == hWndContentList) && (bContentRE)))
      {
        oSys.Call("Gdi32::SetBkColor", wParam, nBkColorRE);
        return hBrush;
      }
      else
      {
        oSys.Call("Gdi32::SetBkColor", wParam, oSys.Call("User32::GetSysColor", 5 /*COLOR_WINDOW*/));
        return oSys.Call("User32::GetSysColorBrush", 5 /*COLOR_WINDOW*/);
      }
    }
  }

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (wParam == 0x0D /*VK_RETURN*/)
    {
      hWndFocus = oSys.Call("User32::GetFocus");
      if (Ctrl() || Shift())
      {
        if (hWndFocus == aWnd[IDFILELV][HWND])
          OpenOrCloseFile(1);
      }
      else
      {
        if (hWndFocus == aWnd[IDFILELV][HWND])
          oSys.Call("User32::PostMessageW", hWnd, 273 /*WM_COMMAND*/, IDEDITB, 0);
        else if (IsCloseCB() &&
                 (hWndFocus != aWnd[IDCURRENTB][HWND]) && (hWndFocus != aWnd[IDBROWSEB][HWND]) && (hWndFocus != aWnd[IDHELP1B   ][HWND]) &&
                 (hWndFocus != aWnd[IDHELP2B  ][HWND]) && (hWndFocus != aWnd[IDSEARCHB][HWND]) && (hWndFocus != aWnd[IDEDITB    ][HWND]) &&
                 (hWndFocus != aWnd[IDCOPYB   ][HWND]) && (hWndFocus != aWnd[IDCLEARB ][HWND]) && (hWndFocus != aWnd[IDSETTINGSB][HWND]))
          oSys.Call("User32::PostMessageW", hWnd, 273 /*WM_COMMAND*/, IDSEARCHB, 0);
      }
    }
    else if (wParam == 0x70 /*VK_F1*/)
    {
      if ((! Ctrl()) && (! Shift()))
      {
        hWndFocus = oSys.Call("User32::GetFocus");
        if (hWndFocus == hWndNameEdit)
        {
          oSys.Call("User32::SetFocus", aWnd[IDHELP1B][HWND]);
          Help(IDHELP1B, 1);
        }
        else if (bContentRE && (hWndFocus == hWndContentEdit))
        {
          oSys.Call("User32::SetFocus", aWnd[IDHELP2B][HWND]);
          Help(IDHELP2B, 1);
        }
      }
    }
    else if (wParam == 0x73 /*VK_F4*/)
    {
      if ((! Ctrl()) && (! Shift()))
        oSys.Call("User32::PostMessageW", hWnd, 273 /*WM_COMMAND*/, IDEDITB, 0);
    }
    else if (wParam == 0x1B /*VK_ESCAPE*/)
    {
      if (IsCloseCB())
        oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
    }
  }

  else if (uMsg == 260) //WM_SYSKEYDOWN
  {
    if ((! Ctrl()) && (! Shift()))
    {
      if (wParam == 0x46 /*F key*/)
          oSys.Call("User32::SetFocus", aWnd[IDFILELV][HWND]);
      else if (wParam == 0x2E /*VK_DELETE*/)
      {
        if (AkelPad.SendMessage(aWnd[IDDIRCB][HWND], 0x0157 /*CB_GETDROPPEDSTATE*/, 0, 0))
          DeleteItemCB(aWnd[IDDIRCB][HWND], aDirs);
        else if (AkelPad.SendMessage(aWnd[IDNAMECB][HWND], 0x0157 /*CB_GETDROPPEDSTATE*/, 0, 0))
          DeleteItemCB(aWnd[IDNAMECB][HWND], aNames);
        else if (AkelPad.SendMessage(aWnd[IDCONTENTCB][HWND], 0x0157 /*CB_GETDROPPEDSTATE*/, 0, 0))
          DeleteItemCB(aWnd[IDCONTENTCB][HWND], aContents);
      }
    }
  }

  else if ((uMsg == 0x004E /*WM_NOTIFY*/) && (wParam == IDFILELV))
  {
    switch (AkelPad.MemRead(lParam + 8, DT_DWORD))
    {
      case -101 : //LVN_ITEMCHANGED
        if (AkelPad.MemRead(lParam + 20 /*uNewState*/, DT_DWORD) & 0x1 /*LVIS_FOCUSED*/)
          SetTextSB(AkelPad.MemRead(lParam + 12 /*NMITEMACTIVATE.iItem*/, DT_DWORD));
        break;

      case -3 : //NM_DBLCLK
        if (AkelPad.MemRead(lParam + 12 /*NMITEMACTIVATE.iItem*/, DT_DWORD) == -1)
          SetSelLV(GetCurFocLV());
        else
          OpenOrCloseFile(1);
        break;

      case -2 : //NM_CLICK
      case -5 : //NM_RCLICK
      case -6 : //NM_RDBLCLK
        if (AkelPad.MemRead(lParam + 12 /*NMITEMACTIVATE.iItem*/, DT_DWORD) == -1)
          SetSelLV(GetCurFocLV());
        break;

      case -155 : //LVN_KEYDOWN
        var nKey = AkelPad.MemRead(lParam + 12, DT_WORD);
        if (nKey == 0x2E /*VK_DELETE*/)
        {
          if ((! Ctrl()) && (! Shift()) && (! Alt()))
            RemoveFromList();
        }
        else if (nKey == 0x41 /*A key*/)
        {
          if (Ctrl() && (! Shift()) && (! Alt()))
            SetSelAllLV();
        }
        else if (nKey == 0x43 /*C key*/)
        {
          if (Ctrl() && (! Shift()) && (! Alt()))
            CopySelected();
        }
        break;

      case -108 : //LVN_COLUMNCLICK
        bSortDesc = ! bSortDesc;
        nFilesFoc = aFiles.length - GetCurFocLV() - 1;

        GetSelArrayLV();
        aFiles.reverse();
        aFilesSel.reverse();

        for (var i = 0; i < aFilesSel.length; ++i)
          aFilesSel[i] = aFiles.length - aFilesSel[i] - 1;

        SetHeaderLV();
        FillLV();
    }
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    var nLowParam = LoWord(wParam);
    var nHiwParam = HiWord(wParam);
    bCloseCBL = 1;

    if (nLowParam == IDNAMECB)
    {
      if (nHiwParam == 3 /*CBN_SETFOCUS*/)
        AkelPad.SendMessage(lParam, 0x0142 /*CB_SETEDITSEL*/, 0, MkLong(nNameSel1, nNameSel2));
      else if (nHiwParam == 10 /*CBN_SELENDCANCEL*/)
      {
        nNameSel1 = LoWord(AkelPad.SendMessage(lParam, 0x0140 /*CB_GETEDITSEL*/, 0, 0));
        nNameSel2 = HiWord(AkelPad.SendMessage(lParam, 0x0140 /*CB_GETEDITSEL*/, 0, 0));
      }
    }
    else if (nLowParam == IDCONTENTCB)
    {
      if (nHiwParam == 3 /*CBN_SETFOCUS*/)
        AkelPad.SendMessage(lParam, 0x0142 /*CB_SETEDITSEL*/, 0, MkLong(nContentSel1, nContentSel2));
      else if (nHiwParam == 10 /*CBN_SELENDCANCEL*/)
      {
        nContentSel1 = LoWord(AkelPad.SendMessage(lParam, 0x0140 /*CB_GETEDITSEL*/, 0, 0));
        nContentSel2 = HiWord(AkelPad.SendMessage(lParam, 0x0140 /*CB_GETEDITSEL*/, 0, 0));
      }
    }
    else if (nLowParam == IDLEVELCB)
    {
      if (nHiwParam == 1 /*CBN_SELCHANGE*/)
      {
        nDirLevel = AkelPad.SendMessage(aWnd[IDLEVELCB][HWND], 0x0147 /*CB_GETCURSEL*/, 0, 0);
        if (nDirLevel == (AkelPad.SendMessage(aWnd[IDLEVELCB][HWND], 0x0146 /*CB_GETCOUNT*/, 0, 0) - 1))
          nDirLevel = -1;
      }
      else if (nHiwParam == 8 /*CBN_CLOSEUP*/)
        bCloseCBL = 0;
    }
    else if (nLowParam == IDCURRENTB)
      CurrentDir();
    else if (nLowParam == IDBROWSEB)
      BrowseDirs();
    else if ((nLowParam == IDHELP1B) || (nLowParam == IDHELP2B))
      Help(nLowParam);
    else if (nLowParam == IDNAMERE)
      {
        bNameRE = ! bNameRE;
        SetWindowText(aWnd[IDNAMEG][HWND], sTxtFileName + (bNameRE ? "" : " " + sTxtWildcards));
        oSys.Call("User32::InvalidateRect", hWndNameEdit, 0, true);
      }
    else if (nLowParam == IDNOTNAME)
      bNotName = ! bNotName;
    else if (nLowParam == IDMATCHCASE)
      bMatchCase = ! bMatchCase;
    else if (nLowParam == IDCONTENTRE)
    {
      bContentRE = ! bContentRE;
      EnableButtons();
      oSys.Call("User32::InvalidateRect", hWndContentEdit, 0, true);
    }
    else if (nLowParam == IDMULTILINE)
      bMultiline = ! bMultiline;
    else if (nLowParam == IDNOTCONTAIN)
      bNotContain = ! bNotContain;
    else if (nLowParam == IDINSTREAMS)
      bInStreams = ! bInStreams;
    else if (nLowParam == IDSKIPBINARY)
      bSkipBinary = ! bSkipBinary;
    else if (nLowParam == IDMAXSIZE)
    {
      if (nHiwParam == 0x0300 /*EN_CHANGE*/)
      {
        nMaxFileSize = parseInt(GetWindowText(lParam), 10);
        if ((! isFinite(nMaxFileSize)) || (nMaxFileSize <= 0))
        {
          nMaxFileSize = 0;
          SetWindowText(lParam, "");
        }
      }
    }
    else if (nLowParam == IDSEARCHB)
      SearchFiles();
    else if (nLowParam == IDEDITB)
      OpenFiles();
    else if (nLowParam == IDCOPYB)
      CopyList();
    else if (nLowParam == IDCLEARB)
      ClearList();
    else if (nLowParam == IDSETTINGSB)
      Settings();
    else if (nLowParam == IDCLOSEB)
      oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    WriteIni();
    oSys.Call("User32::DestroyWindow", hWnd); //Destroy dialog
  }

  else if (uMsg == 2) //WM_DESTROY
    oSys.Call("User32::PostQuitMessage", 0); //Exit message loop

  else
  {
    var nID = oSys.Call("User32::GetDlgCtrlID", oSys.Call("User32::GetFocus"));
    if (nID == IDFILELV)
      nID = IDEDITB;
    else if ((nID != IDCURRENTB) && (nID != IDBROWSEB) && (nID != IDHELP1B) && (nID != IDHELP2B) && (nID < IDSEARCHB))
      nID = IDSEARCHB;
    oSys.Call("User32::DefDlgProcW", hWnd, 1025 /*DM_SETDEFID*/, nID, 0);
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

function Alt()
{
  return Boolean(oSys.Call("User32::GetKeyState", 0x12 /*VK_MENU*/) & 0x8000);
}

function GetWindowPos(hWnd, oRect)
{
  var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)

  oSys.Call("User32::GetWindowRect", hWnd, lpRect);

  oRect.X = AkelPad.MemRead(lpRect,      DT_DWORD);
  oRect.Y = AkelPad.MemRead(lpRect +  4, DT_DWORD);
  oRect.W = AkelPad.MemRead(lpRect +  8, DT_DWORD) - oRect.X;
  oRect.H = AkelPad.MemRead(lpRect + 12, DT_DWORD) - oRect.Y;

  AkelPad.MemFree(lpRect);
}

function GetWindowText(hWnd)
{
  oSys.Call("User32::GetWindowTextW", hWnd, lpBuffer, nBufSize / 2);
  return AkelPad.MemRead(lpBuffer, DT_UNICODE);
}

function SetWindowText(hWnd, sText)
{
  oSys.Call("User32::SetWindowTextW", hWnd, sText);
}

function ResizeWindow(hWnd)
{
  var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)
  var nW, nH, nBW;
  var i;

  oSys.Call("User32::GetClientRect", hWnd, lpRect);
  nW  = AkelPad.MemRead(lpRect +  8, DT_DWORD);
  nH  = AkelPad.MemRead(lpRect + 12, DT_DWORD);
  nBW = (nW - (IDCLOSEB - IDSEARCHB) * 5 - 2 * 5) / (IDCLOSEB - IDSEARCHB + 1);
  AkelPad.MemFree(lpRect);

  oSys.Call("User32::SetWindowPos",
            aWnd[IDDIRG][HWND], 0,
            5,
            5,
            nW - 10,
            70,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDDIRCB][HWND], 0,
            15,
            22,
            nW - 30,
            21,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  for (i = IDCURRENTB; i <= IDBROWSEB; ++i)
  {
    oSys.Call("User32::SetWindowPos",
              aWnd[i][HWND], 0,
              15 + (i - IDCURRENTB) * (80 + 5),
              46,
              80,
              21,
              0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  }
  oSys.Call("User32::SetWindowPos",
            aWnd[IDSUBDIRS][HWND], 0,
            nW - 110 - 5 - 75 - 15,
            51,
            110,
            13,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDLEVELCB][HWND], 0,
            nW - 75 - 15,
            46,
            75,
            21,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDNAMEG][HWND], 0,
            5,
            80,
            nW - 10,
            65,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDNAMECB][HWND], 0,
            15,
            97,
            nW - 50,
            21,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDHELP1B][HWND], 0,
            nW - 35,
            97,
            20,
            21,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  for (i = IDNAMERE; i <= IDNOTNAME; ++i)
  {
    oSys.Call("User32::SetWindowPos",
              aWnd[i][HWND], 0,
              15 + (i - IDNAMERE) * 160,
              122,
              150,
              16,
              0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  }
  oSys.Call("User32::SetWindowPos",
            aWnd[IDCONTENTG][HWND], 0,
            5,
            150,
            nW - 10,
            105,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDCONTENTCB][HWND], 0,
            15,
            167,
            nW - 50,
            21,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDHELP2B][HWND], 0,
            nW - 35,
            167,
            20,
            21,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  for (i = IDMATCHCASE; i <= IDMULTILINE; ++i)
  {
    oSys.Call("User32::SetWindowPos",
              aWnd[i][HWND], 0,
              15,
              192 + (i - IDMATCHCASE) * 20,
              150,
              16,
              0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  }
  for (i = IDNOTCONTAIN; i <= IDSKIPBINARY; ++i)
  {
    oSys.Call("User32::SetWindowPos",
              aWnd[i][HWND], 0,
              175,
              192 + (i - IDNOTCONTAIN) * 20,
              150,
              16,
              0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  }
  oSys.Call("User32::SetWindowPos",
            aWnd[IDSKIPLARGER][HWND], 0,
            335,
            192,
            85,
            26,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDMAXSIZE][HWND], 0,
            335,
            223,
            72,
            20,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDBYTESYMBOL][HWND], 0,
            410,
            225,
            10,
            13,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  oSys.Call("User32::SetWindowPos",
            aWnd[IDFILELV][HWND], 0,
            5,
            265,
            nW - 10,
            nH - 265 - 3 - 21 - 26,
            0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  for (i = IDSEARCHB; i <= IDCLOSEB; ++i)
  {
    oSys.Call("User32::SetWindowPos",
              aWnd[i][HWND], 0,
              5 + (i - IDSEARCHB) * (nBW + 5),
              nH - 21 - 26,
              nBW,
              21,
              0x14 /*SWP_NOACTIVATE|SWP_NOZORDER*/);
  }

  AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x101E /*LVM_SETCOLUMNWIDTH*/, 0, -2 /*LVSCW_AUTOSIZE_USEHEADER*/);
  AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x1013 /*LVM_ENSUREVISIBLE*/, GetCurFocLV(), false);
  AkelPad.SendMessage(aWnd[IDSTATUS][HWND], 5 /*WM_SIZE*/, 0, 0);
}

function EnableButtons()
{
  oSys.Call("User32::EnableWindow", aWnd[IDHELP2B   ][HWND], bContentRE);
  oSys.Call("User32::EnableWindow", aWnd[IDMULTILINE][HWND], bContentRE);
  oSys.Call("User32::EnableWindow", aWnd[IDEDITB    ][HWND], aFiles.length);
  oSys.Call("User32::EnableWindow", aWnd[IDCOPYB    ][HWND], aFiles.length);
  oSys.Call("User32::EnableWindow", aWnd[IDCLEARB   ][HWND], aFiles.length);
}

function IsCloseCB()
{
  return (! AkelPad.SendMessage(aWnd[IDDIRCB    ][HWND], 0x0157 /*CB_GETDROPPEDSTATE*/, 0, 0)) &&
         (! AkelPad.SendMessage(aWnd[IDNAMECB   ][HWND], 0x0157 /*CB_GETDROPPEDSTATE*/, 0, 0)) &&
         (! AkelPad.SendMessage(aWnd[IDCONTENTCB][HWND], 0x0157 /*CB_GETDROPPEDSTATE*/, 0, 0)) &&
         bCloseCBL;
}

function FillCB()
{
  var nPos;
  var i;

  for (i = 0; i < aDirs.length; ++i)
    oSys.Call("User32::SendMessageW", aWnd[IDDIRCB][HWND], 0x0143 /*CB_ADDSTRING*/, 0, aDirs[i]);

  for (i = 0; i < aNames.length; ++i)
    oSys.Call("User32::SendMessageW", aWnd[IDNAMECB][HWND], 0x0143 /*CB_ADDSTRING*/, 0, aNames[i]);

  for (i = 0; i < aContents.length; ++i)
    oSys.Call("User32::SendMessageW", aWnd[IDCONTENTCB][HWND], 0x0143 /*CB_ADDSTRING*/, 0, aContents[i]);

  for (i = 0; i < nMaxLenCBL - 1; ++i)
    oSys.Call("User32::SendMessageW", aWnd[IDLEVELCB][HWND], 0x0143 /*CB_ADDSTRING*/, 0, i.toString());

  nPos = oSys.Call("User32::SendMessageW", aWnd[IDLEVELCB][HWND], 0x0143 /*CB_ADDSTRING*/, 0, sTxtAll);
  if ((nDirLevel >= 0) && (nDirLevel < nMaxLenCBL))
    nPos = nDirLevel;
  else
    nDirLevel = -1;

  AkelPad.SendMessage(aWnd[IDLEVELCB][HWND], 0x014E /*CB_SETCURSEL*/, nPos, 0);
}

function InsertToCB()
{
  var aCB = [{Wnd: aWnd[IDDIRCB][HWND],     Array: aDirs,     Text: sDir},
             {Wnd: aWnd[IDNAMECB][HWND],    Array: aNames,    Text: sName},
             {Wnd: aWnd[IDCONTENTCB][HWND], Array: aContents, Text: sContent}];
  var nPos;
  var i;

  for (i = 0; i < aCB.length; ++i)
  {
    if (aCB[i].Text)
    {
      nPos = FindInArray(aCB[i].Array, aCB[i].Text);

      if (nPos == -1)
      {
        if (aCB[i].Array.length == nMaxLenCBE)
        {
          aCB[i].Array.length = nMaxLenCBE - 1;
          AkelPad.SendMessage(aCB[i].Wnd, 0x0144 /*CB_DELETESTRING*/, nMaxLenCBE - 1, 0);
        }

        aCB[i].Array.unshift(aCB[i].Text);
        oSys.Call("User32::SendMessageW", aCB[i].Wnd, 0x014A /*CB_INSERTSTRING*/, 0, aCB[i].Text);
      }
      else if (nPos > 0)
      {
        aCB[i].Array.splice(nPos, 1);
        aCB[i].Array.unshift(aCB[i].Text);
        AkelPad.SendMessage(aCB[i].Wnd, 0x0144 /*CB_DELETESTRING*/, nPos, 0);
        oSys.Call("User32::SendMessageW", aCB[i].Wnd, 0x014A /*CB_INSERTSTRING*/, 0, aCB[i].Text);
        AkelPad.SendMessage(aCB[i].Wnd, 0x014E /*CB_SETCURSEL*/, 0, 0);
      }
    }
  }
}

function FindInArray(aArray, sText)
{
  for (var i = 0; i < aArray.length; ++i)
  {
    if (aArray[i] == sText)
      return i;
  }
  return -1;
}

function DeleteItemCB(hWndCB, aItems)
{
  var nPos = AkelPad.SendMessage(hWndCB, 0x0147 /*CB_GETCURSEL*/, 0, 0);

  aItems.splice(nPos, 1);

  AkelPad.SendMessage(hWndCB, 0x0144 /*CB_DELETESTRING*/, nPos, 0);

  if (nPos > aItems.length - 1)
    nPos = aItems.length - 1;

  AkelPad.SendMessage(hWndCB, 0x014E /*CB_SETCURSEL*/, nPos, 0);
}

function GetCurFocLV()
{
  return AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x100C /*LVM_GETNEXTITEM*/, -1, 0x0001 /*LVNI_FOCUSED*/);
}

function GetNextSelLV(nItem)
{
  return AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x100C /*LVM_GETNEXTITEM*/, nItem, 0x0002 /*LVNI_SELECTED*/);
}

function GetSelArrayLV()
{
  var nItem = -1;
  aFilesSel = [];

  while ((nItem = GetNextSelLV(nItem)) >= 0)
    aFilesSel.push(nItem);

  if (! aFilesSel.length)
    aFilesSel = [GetCurFocLV()];
}

function SetSelLV(nItem)
{
  AkelPad.MemCopy(lpLVITEM + 12, 0x0003 /*LVIS_SELECTED|LVIS_FOCUSED*/, DT_DWORD);
  AkelPad.MemCopy(lpLVITEM + 16, 0x0003 /*LVIS_SELECTED|LVIS_FOCUSED*/, DT_DWORD);

  AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x102B /*LVM_SETITEMSTATE*/, nItem, lpLVITEM);
  AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x1013 /*LVM_ENSUREVISIBLE*/, nItem, true);
}

function SetSelArrayLV()
{
  AkelPad.MemCopy(lpLVITEM + 12, 0x0002 /*LVIS_SELECTED*/, DT_DWORD);
  AkelPad.MemCopy(lpLVITEM + 16, 0x0002 /*LVIS_SELECTED*/, DT_DWORD);

  for (var i = 0; i < aFilesSel.length; ++i)
    AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x102B /*LVM_SETITEMSTATE*/, aFilesSel[i], lpLVITEM);

  AkelPad.MemCopy(lpLVITEM + 12, 0x0001 /*LVIS_FOCUSED*/, DT_DWORD);
  AkelPad.MemCopy(lpLVITEM + 16, 0x0001 /*LVIS_FOCUSED*/, DT_DWORD);

  AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x102B /*LVM_SETITEMSTATE*/, nFilesFoc, lpLVITEM);
  AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x1013 /*LVM_ENSUREVISIBLE*/, nFilesFoc, true);
}

function SetSelAllLV()
{
  AkelPad.MemCopy(lpLVITEM + 12, 0x0002 /*LVIS_SELECTED*/, DT_DWORD);
  AkelPad.MemCopy(lpLVITEM + 16, 0x0002 /*LVIS_SELECTED*/, DT_DWORD);

  for (var i = 0; i < aFiles.length; ++i)
    AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x102B /*LVM_SETITEMSTATE*/, i, lpLVITEM);
}

function InsertItemLV(nItem, sText)
{
  AkelPad.MemCopy(lpLVITEM + 4, nItem, DT_DWORD); //iItem
  AkelPad.MemCopy(lpLVITEM + 8,     0, DT_DWORD); //iSubItem
  AkelPad.MemCopy(lpBuffer, sText, DT_UNICODE);
  AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x104D /*LVM_INSERTITEMW*/, 0, lpLVITEM);
}

function SetColumnLV()
{
  var lpLVCOLUMN = AkelPad.MemAlloc(40); //sizeof(LVCOLUMN)

  AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x1061 /*LVM_INSERTCOLUMNW*/, 0, lpLVCOLUMN);

  AkelPad.MemFree(lpLVCOLUMN);
}

function SetHeaderLV()
{
  var lpHDITEM = AkelPad.MemAlloc(12 * 4); //sizeof(HDITEM)
  var nFmt     = 0x4000 /*HDF_STRING*/ | (bSortDesc ? 0x0200 /*HDF_SORTDOWN*/ : 0x0400 /*HDF_SORTUP*/);
  var hHeader  = AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x101F /*LVM_GETHEADER*/, 0, 0);

  AkelPad.MemCopy(lpBuffer, sTxtFiles, DT_UNICODE);

  AkelPad.MemCopy(lpHDITEM,      0x06,     DT_DWORD); //mask=HDI_FORMAT|HDI_TEXT
  AkelPad.MemCopy(lpHDITEM +  8, lpBuffer, DT_DWORD); //pszText
  AkelPad.MemCopy(lpHDITEM + 16, nBufSize, DT_DWORD); //cchTextMax
  AkelPad.MemCopy(lpHDITEM + 20, nFmt,     DT_DWORD); //fmt

  AkelPad.SendMessage(hHeader, 0x120C /*HDM_SETITEMW*/, 0, lpHDITEM);

  AkelPad.MemFree(lpHDITEM);
}

function SetPartsSB()
{
  var lpParts = AkelPad.MemAlloc(5 * 4);

  AkelPad.MemCopy(lpParts,       90, DT_DWORD);
  AkelPad.MemCopy(lpParts +  4, 190, DT_DWORD);
  AkelPad.MemCopy(lpParts +  8, 310, DT_DWORD);
  AkelPad.MemCopy(lpParts + 12, 350, DT_DWORD);
  AkelPad.MemCopy(lpParts + 16,  -1, DT_DWORD);

  AkelPad.SendMessage(aWnd[IDSTATUS][HWND], 0x0404 /*SB_SETPARTS*/, 5, lpParts);

  AkelPad.MemFree(lpParts);
}

function SetTextSB(nItem)
{
  var sText0 = "";
  var sText1 = "";
  var sText2 = "";
  var sText3 = "";
  var sText4 = "";
  var hFile;
  var lpFileInfo;
  var lpDecimalSep;
  var lpThousandSep;
  var lpNUMBERFMT;
  var lpLocalFileTime;
  var lpSysTime;
  var nSizeHi;
  var nSizeLo;

  if ((nItem > -1) && aFiles.length)
  {
    sText0 = "\t\t" + (nItem + 1) + "/" + aFiles.length + " ";
    hFile  = oSys.Call("Kernel32::CreateFileW",
                       aFiles[nItem], //lpFileName
                       0,  //dwDesiredAccess
                       3,  //dwShareMode = FILE_SHARE_READ|FILE_SHARE_WRITE
                       0,  //lpSecurityAttributes
                       3,  //dwCreationDisposition = OPEN_EXISTING
                       0,  //dwFlagsAndAttributes
                       0); //hTemplateFile
    lpFileInfo = AkelPad.MemAlloc(52); //sizeof(BY_HANDLE_FILE_INFORMATION)

    if (hFile && oSys.Call("Kernel32::GetFileInformationByHandle", hFile, lpFileInfo))
    {
      //file size
      nSizeHi = AkelPad.MemRead(lpFileInfo + 32, DT_DWORD);
      nSizeLo = AkelPad.MemRead(lpFileInfo + 36, DT_DWORD);
      if (nSizeLo < 0)
        nSizeLo += 0xFFFFFFFF + 1;

      lpDecimalSep  = AkelPad.MemAlloc(4 * 2);
      lpThousandSep = AkelPad.MemAlloc(4 * 2);
      lpNUMBERFMT   = AkelPad.MemAlloc(24); //sizeof(NUMBERFMT)
      AkelPad.MemCopy(lpNUMBERFMT +  8, 3, DT_DWORD); //Grouping
      AkelPad.MemCopy(lpNUMBERFMT + 12, lpDecimalSep,  DT_DWORD);
      AkelPad.MemCopy(lpNUMBERFMT + 16, lpThousandSep, DT_DWORD);

      oSys.Call("Kernel32::GetLocaleInfoW", 0x400 /*LOCALE_USER_DEFAULT*/,  0xE /*LOCALE_SDECIMAL*/,  lpDecimalSep,  4);
      oSys.Call("Kernel32::GetLocaleInfoW", 0x400 /*LOCALE_USER_DEFAULT*/,  0xF /*LOCALE_STHOUSAND*/, lpThousandSep, 4);
      oSys.Call("Kernel32::GetNumberFormatW",
                0x400, //LOCALE_USER_DEFAULT
                0,
                (nSizeHi * (0xFFFFFFFF + 1) + nSizeLo).toString(),
                lpNUMBERFMT,
                lpBuffer,
                nBufSize / 2);

      AkelPad.MemFree(lpDecimalSep);
      AkelPad.MemFree(lpThousandSep);
      AkelPad.MemFree(lpNUMBERFMT);

      sText1 = "\t\t" + AkelPad.MemRead(lpBuffer, DT_UNICODE) + " " + sTxtByteSymbol + " ";

      //file date and time
      lpLocalFileTime = AkelPad.MemAlloc(8);  //FILETIME
      lpSysTime       = AkelPad.MemAlloc(16); //SYSTEMTIME

      oSys.Call("Kernel32::FileTimeToLocalFileTime", lpFileInfo + 20, lpLocalFileTime);
      oSys.Call("Kernel32::FileTimeToSystemTime", lpLocalFileTime, lpSysTime);
      oSys.Call("Kernel32::GetDateFormatW",
                0x400, //LOCALE_USER_DEFAULT
                0x1,   //DATE_SHORTDATE
                lpSysTime,
                0,
                lpBuffer,
                64);
      oSys.Call("Kernel32::GetTimeFormatW",
                0x400, //LOCALE_USER_DEFAULT
                0x8,   //TIME_FORCE24HOURFORMAT
                lpSysTime,
                0,
                lpBuffer + 128,
                64);

      AkelPad.MemFree(lpLocalFileTime);
      AkelPad.MemFree(lpSysTime);

      sText2 = "\t" + AkelPad.MemRead(lpBuffer, DT_UNICODE) + "  " + AkelPad.MemRead(lpBuffer + 128, DT_UNICODE);

      //file attributes
      if (AkelPad.MemRead(lpFileInfo, DT_DWORD) & 32 /*FILE_ATTRIBUTE_ARCHIVE*/)
        sText3 += "A";
      if (AkelPad.MemRead(lpFileInfo, DT_DWORD) & 2 /*FILE_ATTRIBUTE_HIDDEN*/)
        sText3 += "H";
      if (AkelPad.MemRead(lpFileInfo, DT_DWORD) & 1 /*FILE_ATTRIBUTE_READONLY*/)
        sText3 += "R";
      if (AkelPad.MemRead(lpFileInfo, DT_DWORD) & 4 /*FILE_ATTRIBUTE_SYSTEM*/)
        sText3 += "S";

      if (aFiles[nItem].lastIndexOf(":") > 2)
        sText4 = sTxtNTFSStream;
    }

    oSys.Call("Kernel32::CloseHandle", hFile);
    AkelPad.MemFree(lpFileInfo);
  }
  else if (nItem == -2)
    sText0 = "\t" + sTxtWait;

  oSys.Call("User32::SendMessageW", aWnd[IDSTATUS][HWND], 0x040B /*SB_SETTEXTW*/, 0, sText0);
  oSys.Call("User32::SendMessageW", aWnd[IDSTATUS][HWND], 0x040B /*SB_SETTEXTW*/, 1, sText1);
  oSys.Call("User32::SendMessageW", aWnd[IDSTATUS][HWND], 0x040B /*SB_SETTEXTW*/, 2, sText2);
  oSys.Call("User32::SendMessageW", aWnd[IDSTATUS][HWND], 0x040B /*SB_SETTEXTW*/, 3, sText3);
  oSys.Call("User32::SendMessageW", aWnd[IDSTATUS][HWND], 0x040B /*SB_SETTEXTW*/, 4, sText4);
}

function FillLV()
{
  var nNameBegin = 0;
  var i;

  AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x000B /*WM_SETREDRAW*/, 0, 0);
  AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x1009 /*LVM_DELETEALLITEMS*/, 0, 0);

  if (aFiles.length)
  {
    if (! bPathShow)
      nNameBegin = nPathLen;

    for (i = 0; i < aFiles.length; ++i)
      InsertItemLV(i, aFiles[i].substr(nNameBegin));

    SetSelArrayLV();
  }
  else
    InsertItemLV(0, sTxtNoFiles);

  if (GetNextSelLV(-1) < 0)
    SetSelLV(0);

  AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x101E /*LVM_SETCOLUMNWIDTH*/, 0, -2 /*LVSCW_AUTOSIZE_USEHEADER*/);
  AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x000B /*WM_SETREDRAW*/, 1, 0);
}

function CurrentDir()
{
  sDir = AkelPad.GetEditFile(0);

  if (sDir)
    sDir = sDir.replace(/\\[^\\]+$/, "");
  else
    sDir = AkelPad.GetAkelDir();

  SetWindowText(aWnd[IDDIRCB][HWND], sDir);
  AkelPad.SendMessage(aWnd[IDDIRCB][HWND], 0x0142 /*CB_SETEDITSEL*/, 0, MkLong(0, -1));
}

function BrowseDirs()
{
  var sSelDir = BrowseForFolder(hWndDlg, sTxtChooseDir, GetWindowText(aWnd[IDDIRCB][HWND]).replace(/(^ +)|( +$)/g, ""));

  if (sSelDir)
  {
    SetWindowText(aWnd[IDDIRCB][HWND], sSelDir);
    AkelPad.SendMessage(aWnd[IDDIRCB][HWND], 0x0142 /*CB_SETEDITSEL*/, 0, MkLong(0, -1));
  }
}

function Help(nID, bKeyF1)
{
  var nString = 0x0000; //MF_STRING
  var nBreak  = 0x0060; //MF_MENUBREAK|MF_MENUBARBREAK
  var nSepar  = 0x0800; //MF_SEPARATOR
  var hMenu   = oSys.Call("User32::CreatePopupMenu");
  var oRect   = {};
  var aMenu;
  var nCmd;

  GetWindowPos(aWnd[nID][HWND], oRect);

  if ((nID == IDHELP1B) && (! bNameRE))
    aMenu = [
      [nString, "?",   sHlpAnyChar],
      [nString, "*",   sHlpAnyString],
      [nString, '";"', sHlpSemicolQuot],
      [nSepar,  0, 0],
      [nString, ";",   sHlpListSepar]];
  else
    aMenu = [
      [nString, ".",       sHlpAnyChar_NL],
      [nString, "\\d",     sHlpDigit],
      [nString, "\\D",     sHlpNonDigit],
      [nString, "\\s",     sHlpWhiteSp],
      [nString, "\\S",     sHlpNonWhiteSp],
      [nString, "\\w",     sHlpWordChar],
      [nString, "\\W",     sHlpNonWordChar],
      [nString, "\\0",     sHlpNULL],
      [nString, "\\f",     sHlpFF],
      [nString, "\\n",     sHlpNL],
      [nString, "\\r",     sHlpCR],
      [nString, "\\t",     sHlpTab],
      [nString, "\\v",     sHlpVTab],
      [nString, "\\xFF",   sHlpCharHex],
      [nString, "\\u00FF", sHlpUniCharHex],
      [nSepar,  0, 0],
      [nString, "^",       sHlpBegin],
      [nString, "$",       sHlpEnd],
      [nString, "\\b",     sHlpWordBoun],
      [nString, "\\B",     sHlpNonWordBoun],
      [nBreak,  "ab|xy",   sHlpAlternative],
      [nString, "[abc]",   sHlpCharSet],
      [nString, "[^abc]",  sHlpNegCharSet],
      [nString, "[a-z]",   sHlpRange],
      [nString, "[^a-z]",  sHlpNegRange],
      [nSepar,  0, 0],
      [nString, "(ab)",    sHlpCapture],
      [nString, "(?:ab)",  sHlpNotCapture],
      [nString, "(?=ab)",  sHlpFollow],
      [nString, "(?!ab)",  sHlpNotFollow],
      [nString, "\\9",     sHlpBackrefer],
      [nString, "\\99",    sHlpBackrefer],
      [nSepar,  0, 0],
      [nString, "?",       sHlpZeroOrOne],
      [nString, "*",       sHlpZeroOrMore],
      [nString, "+",       sHlpOneOrMore],
      [nString, "{3}",     sHlpexactly],
      [nString, "{3,}",    sHlpAtLeast],
      [nString, "{3,7}",   sHlpFromTo],
      [nSepar,  0, 0],
      [nString, "\\(",     sHlpSpecChars]];

  for (i = 0; i < aMenu.length; ++i)
    oSys.Call("User32::AppendMenuW", hMenu, aMenu[i][0], i + 1, aMenu[i][1] + "\t" + aMenu[i][2]);

  nCmd = oSys.Call("User32::TrackPopupMenu", hMenu, 0x0188 /*TPM_NONOTIFY|TPM_RETURNCMD|TPM_TOPALIGN|TPM_RIGHTALIGN*/, oRect.X + oRect.W, oRect.Y + oRect.H, 0, hWndDlg, 0);

  oSys.Call("User32::DestroyMenu", hMenu);

  --nID;

  if (nCmd)
  {
    if (nID == IDNAMECB)
    {
      AkelPad.SendMessage(aWnd[nID][HWND], 0x0142 /*CB_SETEDITSEL*/, 0, MkLong(nNameSel1, nNameSel2));
      oSys.Call("User32::SendMessageW", hWndNameEdit, 0x00C2 /*EM_REPLACESEL*/, 1, aMenu[nCmd - 1][1]);
      nNameSel1 += aMenu[nCmd - 1][1].length;
      nNameSel2  = nNameSel1;
    }
    else if (nID == IDCONTENTCB)
    {
      AkelPad.SendMessage(aWnd[nID][HWND], 0x0142 /*CB_SETEDITSEL*/, 0, MkLong(nContentSel1, nContentSel2));
      oSys.Call("User32::SendMessageW", hWndContentEdit, 0x00C2 /*EM_REPLACESEL*/, 1, aMenu[nCmd - 1][1]);
      nContentSel1 += aMenu[nCmd - 1][1].length;
      nContentSel2  = nContentSel1;
    }
  }

  if (nCmd || bKeyF1)
    oSys.Call("User32::PostMessageW", hWndDlg, 0x8001 /*WM_APP+1*/, aWnd[nID][HWND], 0);
}

function SearchFiles()
{
  var aPath = [];
  var sPattern;
  var rName;
  var rContent;
  var oError;
  var nMaxLevel;
  var bLevelOK;
  var hFindFile;
  var sFileName;
  var sFullName;
  var nReadFlag;
  var lpFile;
  var lpDetectFile;
  var nDetectFile;
  var nSizeHi;
  var nSizeLo;
  var nSize;
  var nMaxSize;
  var bNTFS;
  var aStreams;
  var i, n;

  sDir     = GetWindowText(aWnd[IDDIRCB][HWND]).replace(/(^ +)|( +$)/g, "");
  sName    = GetWindowText(aWnd[IDNAMECB][HWND]).replace(/(^[ ;]+)|([ ;]+$)/g, "");
  sContent = GetWindowText(aWnd[IDCONTENTCB][HWND]);

  SetWindowText(aWnd[IDDIRCB][HWND], sDir);
  SetWindowText(aWnd[IDNAMECB][HWND], sName);
  if (! sDir)
    CurrentDir();

  if (! IsDirExists(sDir))
  {
    WarningBox(sDir + "\n\n" + sTxtDirNoExist);
    oSys.Call("User32::PostMessageW", aWnd[IDDIRCB][HWND], 0x0007 /*WM_SETFOCUS*/, 0, 0);
    return;
  }

  if (sName && bNameRE)
  {
    try
    {
      rName = new RegExp(sName, "i");
    }
    catch (oError)
    {
      WarningBox(sName + "\n\n" + sTxtErrorRE);
      oSys.Call("User32::PostMessageW", aWnd[IDNAMECB][HWND], 0x0007 /*WM_SETFOCUS*/, 0, 0);
      return;
    }
  }

  if (sContent && bContentRE)
  {
    try
    {
      rContent = new RegExp(sContent, (bMatchCase ? "" : "i") + (bMultiline ? "m" : ""));
    }
    catch (oError)
    {
      WarningBox(sContent + "\n\n" + sTxtErrorRE);
      oSys.Call("User32::PostMessageW", aWnd[IDCONTENTCB][HWND], 0x0007 /*WM_SETFOCUS*/, 0, 0);
      return;
    }
  }

  SetTextSB(-2);
  InsertToCB();

  aFiles          = [];
  aFilesSel       = [0];
  nFilesFoc       = 0;
  aPath[0]        = sDir + ((sDir.slice(-1) != "\\") ? "\\" : "");
  nPathLen        = aPath[0].length;
  nMaxLevel       = (nDirLevel < 0) ? Infinity : nDirLevel;
  nMaxSize        = (nMaxFileSize <= 0) ? Infinity : nMaxFileSize;
  nReadFlag       = 0xC /*OD_ADT_DETECT_CODEPAGE|OD_ADT_DETECT_BOM*/;
  bNTFS           = IsSupportStreams(sDir.substr(0, 3));
  sLastContent    = sContent;
  bLastContentRE  = bContentRE;
  bLastMatchCase  = bMatchCase;
  bLastMultiline  = bMultiline;
  bLastNotContain = bNotContain;
  lpFile          = AkelPad.MemAlloc((260 + 260 + 36) * 2);
  lpDetectFile    = AkelPad.MemAlloc(20); //sizeof(DETECTFILEW)

  AkelPad.MemCopy(lpDetectFile,     lpFile, DT_DWORD);
  AkelPad.MemCopy(lpDetectFile + 4,   1024, DT_DWORD); //dwBytesToCheck
  AkelPad.MemCopy(lpDetectFile + 8,   0x1D, DT_DWORD); //dwFlags=ADT_NOMESSAGES|ADT_DETECT_BOM|ADT_DETECT_CODEPAGE|ADT_BINARY_ERROR

  if (sName && (! bNameRE))
  {
    sPattern = sName.replace(/"(([^;"]*;+[^;"]*)+)"/g, function(){return arguments[1].replace(/;/g, "\0");});
    sPattern = sPattern.replace(/[\\\/.^$+|()\[\]{}]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".").replace(/ *; */g, "|").replace(/\0/g, ";");
    rName    = new RegExp("^(" + sPattern + ")$", "i");
  }

  if (sContent && (! bContentRE))
    rContent = new RegExp(sContent.replace(/[\\\/.^$+*?|()\[\]{}]/g, "\\$&"), (bMatchCase ? "" : "i"));

  for (i = 0; i < aPath.length; ++i)
  {
    hFindFile = oSys.Call("Kernel32::FindFirstFileW", aPath[i] + "*.*", lpBuffer);

    if (hFindFile != -1) //INVALID_HANDLE_VALUE
    {
      bLevelOK = ((aPath[i].match(/\\/g).length - aPath[0].match(/\\/g).length) < nMaxLevel);

      do
      {
        sFileName = AkelPad.MemRead(lpBuffer + 44 /*offsetof(WIN32_FIND_DATAW, cFileName)*/, DT_UNICODE);
        sFullName = aPath[i] + sFileName;

        //files  
        if (! (AkelPad.MemRead(lpBuffer, DT_DWORD) & 16 /*FILE_ATTRIBUTE_DIRECTORY*/))
        {
          if ((! sName) || ((! bNotName) && rName.test(sFileName)) || (bNotName && (! rName.test(sFileName))))
          {
            if (bInStreams && bNTFS)
            {
              aStreams = EnumStreams(sFullName);

              for (n = 0; n < aStreams.length; ++n)
              {
                sFullName = aPath[i] + sFileName + (aStreams[n][0] ? ":" + aStreams[n][0] : "");

                if (sContent)
                {
                  AkelPad.MemCopy(lpFile, sFullName, DT_UNICODE);
                  nDetectFile = AkelPad.SendMessage(hMainWnd, 1177 /*AKD_DETECTFILEW*/, 0, lpDetectFile);

                  if (((nDetectFile == 0 /*EDT_SUCCESS*/) || ((nDetectFile == -4 /*EDT_BINARY*/) && (! bSkipBinary))) && (aStreams[n][1] <= nMaxSize))
                  {
                    if (rContent.test(AkelPad.ReadFile(sFullName, nReadFlag)))
                    {
                      if (! bNotContain)
                        aFiles.push(sFullName);
                    }
                    else
                    {
                      if (bNotContain)
                        aFiles.push(sFullName);
                    }
                  }
                }
                else
                  aFiles.push(sFullName);
              }
            }
            else
            {
              if (sContent)
              {
                AkelPad.MemCopy(lpFile, sFullName, DT_UNICODE);
                nDetectFile = AkelPad.SendMessage(hMainWnd, 1177 /*AKD_DETECTFILEW*/, 0, lpDetectFile);

                nSizeHi = AkelPad.MemRead(lpBuffer + 28 /*offsetof(WIN32_FIND_DATAW, nFileSizeHigh)*/, DT_DWORD);
                nSizeLo = AkelPad.MemRead(lpBuffer + 32 /*offsetof(WIN32_FIND_DATAW, nFileSizeLow)*/,  DT_DWORD);
                if (nSizeLo < 0)
                  nSizeLo += 0xFFFFFFFF + 1;
                nSize = nSizeHi * (0xFFFFFFFF + 1) + nSizeLo;

                if (((nDetectFile == 0 /*EDT_SUCCESS*/) || ((nDetectFile == -4 /*EDT_BINARY*/) && (! bSkipBinary))) && (nSize <= nMaxSize))
                {
                  if (rContent.test(AkelPad.ReadFile(sFullName, nReadFlag)))
                  {
                    if (! bNotContain)
                      aFiles.push(sFullName);
                  }
                  else
                  {
                    if (bNotContain)
                      aFiles.push(sFullName);
                  }
                }
              }
              else
                aFiles.push(sFullName);
            }
          }
        }
        //directories
        else if (bLevelOK && (sFileName != ".") && (sFileName != ".."))
        {
          aPath.push(sFullName + "\\");
        }
      }
      while (oSys.Call("kernel32::FindNextFileW", hFindFile, lpBuffer));

      oSys.Call("Kernel32::FindClose", hFindFile);
    }
  }

  AkelPad.MemFree(lpFile);
  AkelPad.MemFree(lpDetectFile);

  SortFiles();
  FillLV();
  EnableButtons();

  oSys.Call("User32::PostMessageW", hWndDlg, 0x8001 /*WM_APP+1*/, aWnd[IDFILELV][HWND], 0);
}

function SortFiles()
{
  var nSort = bSortDesc ? -1 : 1;
  var nCompare;

  aFiles.sort(
    function(sName1, sName2)
    {
      nCompare = nSort * oSys.Call("Kernel32::lstrcmpiW", sName1.substr(0, sName1.lastIndexOf("\\")), sName2.substr(0, sName2.lastIndexOf("\\")));

      if (nCompare == 0)
        return nSort * oSys.Call("Kernel32::lstrcmpiW", sName1, sName2);
      else
        return nCompare;
    });
}

function OpenFiles()
{
  if (aFiles.length)
  {
    var sFiles = "";
    var i;

    GetSelArrayLV();

    if (! aFilesSel.length)
      aFilesSel = [GetCurFocLV()];
  
    for (i = 0; i < aFilesSel.length; ++i)
    {
      if (IsFileExists(aFiles[aFilesSel[i]]))
      {
        AkelPad.OpenFile(aFiles[aFilesSel[i]]);

        if (! AkelPad.IsMDI())
          break;
      }
      else
        sFiles += aFiles[aFilesSel[i]] + "\n";
    }

    if (sFiles)
      WarningBox(sFiles + "\n" + sTxtFileNoExist);
  }
}

function OpenOrCloseFile(bSelect)
{
  if (aFiles.length)
  {
    var nItem = GetCurFocLV();
    var rContent;

    if (nItem >= 0)
    {
      if (aFiles[nItem].toUpperCase() == AkelPad.GetEditFile(0).toUpperCase())
      {
        if (AkelPad.IsMDI())
          AkelPad.Command(4318 /*IDM_WINDOW_FRAMECLOSE*/);
        else
          AkelPad.Command(4324 /*IDM_WINDOW_FILECLOSE*/);
      }
      else
      {
        if (IsFileExists(aFiles[nItem]))
        {
          if ((AkelPad.OpenFile(aFiles[nItem]) == 0 /*EOD_SUCCESS*/) && bSelect && sLastContent && (! bLastNotContain))
          {
            if (bLastContentRE)
            {
              rContent = new RegExp(sLastContent, (bLastMatchCase ? "" : "i") + (bLastMultiline ? "m" : ""));
              if (rContent.test(AkelPad.GetTextRange(0, -1, 0 /*new line as is*/)))
                AkelPad.SetSel(ByteOffsetToRichOffset(RegExp.index), ByteOffsetToRichOffset(RegExp.lastIndex));
            }
            else
              AkelPad.TextFind(0, sLastContent, 0x00200001 /*FRF_BEGINNING|FRF_DOWN*/ | (bLastMatchCase ? 0x00000004 /*FRF_MATCHCASE*/ : 0));
          }
        }
        else
          WarningBox(aFiles[nItem] + "\n\n" + sTxtFileNoExist);
      }
    }
  }
}

function ByteOffsetToRichOffset(nByteOffset)
{
  var hEditWnd      = AkelPad.GetEditWnd();
  var lpIndexOffset = AkelPad.MemAlloc(16 /*sizeof(AEINDEXOFFSET)*/);
  var lpCharIndex1  = AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/);
  var lpCharIndex2  = AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/);
  var nRichOffset;

  AkelPad.MemCopy(lpIndexOffset,      lpCharIndex1,    DT_DWORD);
  AkelPad.MemCopy(lpIndexOffset +  4, lpCharIndex2,    DT_DWORD);
  AkelPad.MemCopy(lpIndexOffset +  8, nByteOffset,     DT_DWORD);
  AkelPad.MemCopy(lpIndexOffset + 12, 3 /*AELB_ASIS*/, DT_DWORD);

  AkelPad.SendMessage(hEditWnd, 3130 /*AEM_GETINDEX*/, 1 /*AEGI_FIRSTCHAR*/, lpCharIndex1);
  AkelPad.SendMessage(hEditWnd, 3135 /*AEM_INDEXOFFSET*/, 0, lpIndexOffset);

  nRichOffset = AkelPad.SendMessage(hEditWnd, 3136 /*AEM_INDEXTORICHOFFSET*/, 0, lpCharIndex2);

  AkelPad.MemFree(lpIndexOffset);
  AkelPad.MemFree(lpCharIndex1);
  AkelPad.MemFree(lpCharIndex2);

  return nRichOffset;
}

function CopyList()
{
  if (aFiles.length)
    AkelPad.SetClipboardText(aFiles.join("\r\n"));
}

function CopySelected()
{
  if (aFiles.length)
  {
    var sText = "";

    GetSelArrayLV();

    if (! aFilesSel.length)
      aFilesSel = [GetCurFocLV()];

    for (i = 0; i < aFilesSel.length; ++i)
      sText += aFiles[aFilesSel[i]] + "\r\n";

    AkelPad.SetClipboardText(sText);
  }
}

function ClearList()
{
  if (aFiles.length)
  {
    aFiles    = [];
    aFilesSel = [0];

    FillLV();
    EnableButtons();
    oSys.Call("User32::SetFocus", aWnd[IDFILELV][HWND]);
  }
}

function RemoveFromList()
{
  if (aFiles.length)
  {
    AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x000B /*WM_SETREDRAW*/, 0, 0);
    GetSelArrayLV();

    if (! aFilesSel.length)
      aFilesSel = [GetCurFocLV()];

    for (i = aFilesSel.length - 1; i >= 0; --i)
    {
      aFiles.splice(aFilesSel[i], 1);
      AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x1008 /*LVM_DELETEITEM*/, aFilesSel[i], 0);
    }

    AkelPad.SendMessage(aWnd[IDFILELV][HWND], 0x000B /*WM_SETREDRAW*/, 1, 0);

    if (aFiles.length)
    {
      SetSelLV(aFilesSel[aFilesSel.length - 1] - aFilesSel.length + 1);
      if (GetNextSelLV(-1) < 0)
        SetSelLV(aFiles.length - 1);
    }
    else
    {
      FillLV();
      EnableButtons();
    }
  }
}

function Settings()
{
  var MF_STRING  = 0x0000;
  var MF_CHECKED = 0x0008;
  var hMenu = oSys.Call("User32::CreatePopupMenu");
  var oRect = {};
  var nCmd;

  GetWindowPos(aWnd[IDSETTINGSB][HWND], oRect);

  oSys.Call("User32::AppendMenuW", hMenu, (bSeparateWnd ? MF_CHECKED : MF_STRING), 1, sTxtSeparateWnd);
  oSys.Call("User32::AppendMenuW", hMenu, (bKeepFiles   ? MF_CHECKED : MF_STRING), 2, sTxtKeepFiles);
  oSys.Call("User32::AppendMenuW", hMenu, (bPathShow    ? MF_CHECKED : MF_STRING), 3, sTxtPathShow);

  nCmd = oSys.Call("User32::TrackPopupMenu", hMenu, 0x01A4 /*TPM_NONOTIFY|TPM_RETURNCMD|TPM_BOTTOMALIGN|TPM_CENTERALIGN*/, oRect.X + oRect.W / 2, oRect.Y, 0, hWndDlg, 0);

  oSys.Call("User32::DestroyMenu", hMenu);

  if (nCmd == 1)
    bSeparateWnd = ! bSeparateWnd;
  else if (nCmd == 2)
    bKeepFiles = ! bKeepFiles;
  else if (nCmd == 3)
  {
    bPathShow = ! bPathShow;
    nFilesFoc = GetCurFocLV();
    GetSelArrayLV();
    FillLV();
  }
}

function WarningBox(sText)
{
  AkelPad.MessageBox(hWndDlg, sText, sTxtScriptName, 0x00000030 /*MB_ICONWARNING*/);
}

function ReadIni()
{
  var sIniFile = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";
  var sLngFile = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + "_" + AkelPad.GetLangId(0 /*LANGID_FULL*/).toString() + ".lng";
  var oError;

  if (IsFileExists(sLngFile))
  {
    try
    {
      eval(AkelPad.ReadFile(sLngFile));
    }
    catch (oError)
    {
    }
  }
  else
  {
    sTxtScriptName  = "Find Files";
    sTxtDir         = "&Directory";
    sTxtCurrent     = "&Current";
    sTxtBrowse      = "&Browse...";
    sTxtSubDirs     = "Subdirectories &level:";
    sTxtAll         = "All";
    sTxtFileName    = "&Name of file";
    sTxtWildcards   = "(wildcards can use: *?)";
    sTxtRegExp      = "&Regular expression";
    sTxtTextInFile  = "&Text in file";
    sTxtNotName     = "Not matching names";
    sTxtMatchCase   = "Match case";
    sTxtMultiline   = "Multiline";
    sTxtNotContain  = "Not contain text";
    sTxtInStreams   = "Include NTFS streams";
    sTxtSkipBinary  = "Don't search in binary files";
    sTxtSkipLarger  = "Don't search\nin larger than:";
    sTxtFiles       = "Files";
    sTxtSearch      = "Search";
    sTxtEdit        = "Edit";
    sTxtCopyList    = "Copy list";
    sTxtClearList   = "Clear list";
    sTxtSettings    = "Settings";
    sTxtClose       = "Close";
    sTxtChooseDir   = "Choose directory:";
    sTxtNoFiles     = "<no files>";
    sTxtSeparateWnd = "Run in separate window";
    sTxtKeepFiles   = "Keep files list";
    sTxtPathShow    = "Show full path on files list";
    sTxtDirNoExist  = "Directory does not exists.";
    sTxtFileNoExist = "File(s) does not exists.";
    sTxtErrorRE     = "Error in regular expression.";
    sTxtByteSymbol  = "B";
    sTxtNTFSStream  = "NTFS stream";
    sTxtWait        = "Wait...";
    sHlpAnyChar     = "any single character";
    sHlpAnyString   = "any string of characters";
    sHlpSemicolQuot = "semicolon must be in double quotes";
    sHlpListSepar   = "list separator (semicolon)";
    sHlpAnyChar_NL  = "any character, except \\n";
    sHlpDigit       = "digit [0-9]";
    sHlpNonDigit    = "non-digit [^0-9]";
    sHlpWhiteSp     = "whitespace [ \\f\\n\\r\\t\\v]";
    sHlpNonWhiteSp  = "non-whitespace";
    sHlpWordChar    = "word character [A-Za-z0-9_]";
    sHlpNonWordChar = "non-word character";
    sHlpNULL        = "NULL character";
    sHlpFF          = "form feed \\x0C";
    sHlpNL          = "new line \\x0A";
    sHlpCR          = "carriage return \\x0D";
    sHlpTab         = "tab \\x09";
    sHlpVTab        = "vertical tab \\x0B";
    sHlpCharHex     = "character hex code FF";
    sHlpUniCharHex  = "Unicode char hex code 00FF";
    sHlpBegin       = "beginning of string/line";
    sHlpEnd         = "end of string/line";
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
    sHlpBackrefer   = "backreference";
    sHlpZeroOrOne   = "zero or one times";
    sHlpZeroOrMore  = "zero or more times";
    sHlpOneOrMore   = "one or more times";
    sHlpexactly     = "exactly 3 times";
    sHlpAtLeast     = "at least 3 times";
    sHlpFromTo      = "from 3 to 7 times";
    sHlpSpecChars   = "()[]{}^$.?+*|\\ special chars";
  }

  if (IsFileExists(sIniFile))
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

function WriteIni()
{
  var sIniFile = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";
  var sIniTxt  = "";
  var i;

  oWndPos.Max = oSys.Call("User32::IsZoomed", hWndDlg);
  sDir        = GetWindowText(aWnd[IDDIRCB][HWND]);
  sName       = GetWindowText(aWnd[IDNAMECB][HWND]);
  sContent    = GetWindowText(aWnd[IDCONTENTCB][HWND]);

  if (bKeepFiles)
  {
    GetSelArrayLV();
    nFilesFoc = GetCurFocLV();
  }
  else
  {
    aFiles    = [];
    aFilesSel = [0];
    nFilesFoc = 0;
  }

  for (i in oWndPos)
    sIniTxt += 'oWndPos.' + i + '=' + oWndPos[i] + ';\r\n';

  sIniTxt += 'bSeparateWnd='    + bSeparateWnd + ';\r\n' +
             'bKeepFiles='      + bKeepFiles + ';\r\n' +
             'bPathShow='       + bPathShow + ';\r\n' +
             'nPathLen='        + nPathLen + ';\r\n' +
             'bSortDesc='       + bSortDesc + ';\r\n' +
             'nDirLevel='       + nDirLevel + ';\r\n' +
             'bNameRE='         + bNameRE + ';\r\n' +
             'bNotName='        + bNotName + ';\r\n' +
             'bContentRE='      + bContentRE + ';\r\n' +
             'bMatchCase='      + bMatchCase + ';\r\n' +
             'bMultiline='      + bMultiline + ';\r\n' +
             'bNotContain='     + bNotContain + ';\r\n' +
             'bInStreams='      + bInStreams + ';\r\n' +
             'bSkipBinary='     + bSkipBinary + ';\r\n' +
             'nMaxFileSize='    + nMaxFileSize + ';\r\n' +
             'sDir="'           + sDir.replace(/[\\"]/g, '\\$&') + '";\r\n' +
             'sName="'          + sName.replace(/[\\"]/g, '\\$&') + '";\r\n' +
             'sContent="'       + sContent.replace(/[\\"]/g, '\\$&') + '";\r\n' +
             'sLastContent="'   + sLastContent.replace(/[\\"]/g, '\\$&') + '";\r\n' +
             'bLastContentRE='  + bLastContentRE + ';\r\n' +
             'bLastMatchCase='  + bLastMatchCase + ';\r\n' +
             'bLastMultiline='  + bLastMultiline + ';\r\n' +
             'bLastNotContain=' + bLastNotContain + ';\r\n' +
             'aDirs=['          + aDirs.join('\t').replace(/[\\"]/g, '\\$&').replace(/\t/g, '","').replace(/.+/, '"$&"') +'];\r\n' +
             'aNames=['         + aNames.join('\t').replace(/[\\"]/g, '\\$&').replace(/\t/g, '","').replace(/.+/, '"$&"') +'];\r\n' +
             'aContents=['      + aContents.join('\t').replace(/[\\"]/g, '\\$&').replace(/\t/g, '","').replace(/.+/, '"$&"') +'];\r\n' +
             'aFiles=['         + aFiles.join('\t').replace(/[\\"]/g, '\\$&').replace(/\t/g, '","').replace(/.+/, '"$&"') +'];\r\n' +
             'aFilesSel=['      + aFilesSel +'];\r\n' +
             'nFilesFoc='       + nFilesFoc +';';
  WriteFile(sIniFile, null, sIniTxt, 1);
}
