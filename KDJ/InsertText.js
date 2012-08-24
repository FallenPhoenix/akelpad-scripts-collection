// Insert text at the beginning and at the end of selection - 2010-08-12
//
// Call("Scripts::Main", 1, "InsertText.js", "0") - insert in selection
// Call("Scripts::Main", 1, "InsertText.js", "1") - insert in each of selected lines
// Call("Scripts::Main", 1, "InsertText.js", "2") - insert in each part of columnar selection
//
// Argument "0" is default, can be omitted.


//Control IDs
var IDC_INPUT      = 1001;
var IDC_ESCNEWLINE = 1003;
var IDC_ESCTAB     = 1004;
var IDC_SELECTION  = 1005;
var IDC_LINES      = 1006;
var IDC_COLSEL     = 1007;
var IDC_OK         = 1008;
var IDC_CANCEL     = 1009;
var IDC_STATIC     = -1;

//Variables
var WshShell = new ActiveXObject("WScript.shell");
var hMainWnd = AkelPad.GetMainWnd();
var hEditWnd = AkelPad.GetEditWnd();
var bColSel  = AkelPad.SendMessage(hEditWnd, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0);
var oSys = AkelPad.SystemFunction();
var pScriptName = WScript.ScriptName;
var hInstanceDLL = AkelPad.GetInstanceDll();
var hWndDialog;
var hWndStaticA;
var hWndStaticB;
var hWndStringA;
var hWndStringB;
var hWndEscNewLine;
var hWndEscTab;
var hWndRange;
var hWndSelection;
var hWndLines;
var hWndColSel;
var hWndOK;
var hWndCancel;
var hGuiFont;
var lpBuffer;

var pStringA    = "";
var pStringB    = "";
var bEscNewLine = false;
var bEscTab     = true;
var bCloseCombo = true;
var nStrings    = 10;
var lpStringsA  = new Array(nStrings);
var lpStringsB  = new Array(nStrings);
var nRange      = 0;
var i;

var pTxtJSver      = "JScript version is less than 5.5.";
var pTxtRO         = "Mode is read-only.";
var pTxtInvArg     = "Invalid argument: ";
var pTxtNoColSel   = "There is no columnar selection.";
var pTxtCaption    = "Insert text";
var pTxtStaticA    = ["at the beginning of selection:",
                      "at the beginning of lines:",
                      "at the beginning of columnar selection:"];
var pTxtStaticB    = ["at the end of selection:",
                      "at the end of lines:",
                      "at the end of columnar selection:"];
var pTxtEscNewLine = "\\n = new line";
var pTxtEscTab     = "\\t = tabulation";
var pTxtRange      = "Range";
var pTxtSelection  = "In selection";
var pTxtLines      = "In each of selected lines";
var pTxtColSel     = "In each part of columnar selection";
var pTxtOK         = "OK";
var pTxtCancel     = "Cancel";


if (hEditWnd)
{
  if (ScriptEngineMajorVersion() <= 5 && ScriptEngineMinorVersion() < 5)
  {
    AkelPad.MessageBox(hMainWnd, pTxtJSver, pScriptName, 48 /*MB_ICONEXCLAMATION*/);
    WScript.Quit();
  }

   if (AkelPad.GetEditReadOnly(hEditWnd))
  {
    AkelPad.MessageBox(hEditWnd, pTxtRO, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
    WScript.Quit();
  }

  if (WScript.Arguments.length)
    nRange = WScript.Arguments(0);
  if (!((nRange == 0) || (nRange == 1) || (nRange == 2)))
  {
    AkelPad.MessageBox(hEditWnd, pTxtInvArg + nRange, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
    WScript.Quit();
  }
  if ((nRange == 2) && (! bColSel))
  {
    AkelPad.MessageBox(hEditWnd, pTxtNoColSel, pTxtCaption, 48 /*MB_ICONEXCLAMATION*/);
    WScript.Quit();
  }


  if (AkelPad.WindowRegisterClass(pScriptName))
  {
    if (lpBuffer=AkelPad.MemAlloc(256 * _TSIZE))
    {
      //Create dialog
      AkelPad.MemCopy(lpBuffer, pScriptName, _TSTR);
      hWndDialog=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                           0,               //dwExStyle
                           lpBuffer,        //lpClassName
                           0,               //lpWindowName
                           0x90CA0000,      //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX
                           0,               //x
                           0,               //y
                           354,             //nWidth
                           255,             //nHeight
                           hMainWnd,        //hWndParent
                           0,               //ID
                           hInstanceDLL,    //hInstance
                           DialogCallback); //Script function callback. To use it class must be registered by WindowRegisterClass.
      if (hWndDialog)
      {
        //Disable main window, to make dialog modal
        oSys.Call("user32::EnableWindow", hMainWnd, false);

        //Message loop
        AkelPad.WindowGetMessage();
      }
      AkelPad.MemFree(lpBuffer);
    }
    AkelPad.WindowUnregisterClass(pScriptName);
  }
}

//////////////

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1)  //WM_CREATE
  {
    try
    {
      for (i=0; i < nStrings; ++i)
        lpStringsA[i]=WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\InsertText\\TextA" + i);
    }
    catch (nError)
    {
    }
    pSringA = lpStringsA[0];

    try
    {
      for (i=0; i < nStrings; ++i)
        lpStringsB[i]=WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\InsertText\\TextB" + i);
    }
    catch (nError)
    {
    }
    pSringB = lpStringsB[0];

    try
    {
      bEscNewLine=WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\InsertText\\EscNewLine");
      bEscTab    =WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\InsertText\\EscTab");
    }
    catch (nError)
    {
    }

    hGuiFont=oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);

    //Dialog caption
    AkelPad.MemCopy(lpBuffer, pTxtCaption, _TSTR);
    oSys.Call("user32::SetWindowText" + _TCHAR, hWnd, lpBuffer);

    //Create window static A
    AkelPad.MemCopy(lpBuffer, "STATIC", _TSTR);
    hWndStaticA=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                          0,            //dwExStyle
                          lpBuffer,     //lpClassName
                          0,            //lpWindowName
                          0x50000000,   //WS_VISIBLE|WS_CHILD
                          11,           //x
                          13,           //y
                          305,          //nWidth
                          13,           //nHeight
                          hWnd,         //hWndParent
                          IDC_STATIC,   //ID
                          hInstanceDLL, //hInstance
                          0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndStaticA, hGuiFont, pTxtStaticA[nRange]);

    //Create window static B
    AkelPad.MemCopy(lpBuffer, "STATIC", _TSTR);
    hWndStaticB=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                          0,            //dwExStyle
                          lpBuffer,     //lpClassName
                          0,            //lpWindowName
                          0x50000000,   //WS_VISIBLE|WS_CHILD
                          11,           //x
                          61,           //y
                          305,          //nWidth
                          13,           //nHeight
                          hWnd,         //hWndParent
                          IDC_STATIC,   //ID
                          hInstanceDLL, //hInstance
                          0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndStaticB, hGuiFont, pTxtStaticB[nRange]);

    //Create window edit A
    AkelPad.MemCopy(lpBuffer, "COMBOBOX", _TSTR);
    hWndStringA=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                          0,            //dwExStyle
                          lpBuffer,     //lpClassName
                          0,            //lpWindowName
                          0x50210042,   //WS_VISIBLE|WS_CHILD|WS_TABSTOP|WS_VSCROLL|CBS_DROPDOWN|CBS_AUTOHSCROLL
                          11,           //x
                          31,           //y
                          323,          //nWidth
                          23,           //nHeight
                          hWnd,         //hWndParent
                          IDC_INPUT,    //ID
                          hInstanceDLL, //hInstance
                          0);           //lpParam
    //Fill combobox
    for (i=0; i < nStrings; ++i)
    {
      AkelPad.MemCopy(lpBuffer, lpStringsA[i], _TSTR);
      AkelPad.SendMessage(hWndStringA, 0x143 /*CB_ADDSTRING*/, 0, lpBuffer);
    }
    //Set font and text
    SetWindowFontAndText(hWndStringA, hGuiFont, "");
    AkelPad.SendMessage(hWndStringA, 0x14E /*CB_SETCURSEL*/, 0, 0);

    //Create window edit B
    AkelPad.MemCopy(lpBuffer, "COMBOBOX", _TSTR);
    hWndStringB=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                          0,            //dwExStyle
                          lpBuffer,     //lpClassName
                          0,            //lpWindowName
                          0x50210042,   //WS_VISIBLE|WS_CHILD|WS_TABSTOP|WS_VSCROLL|CBS_DROPDOWN|CBS_AUTOHSCROLL
                          11,           //x
                          79,           //y
                          323,          //nWidth
                          23,           //nHeight
                          hWnd,         //hWndParent
                          IDC_INPUT,    //ID
                          hInstanceDLL, //hInstance
                          0);           //lpParam
    //Fill combobox
    for (i=0; i < nStrings; ++i)
    {
      AkelPad.MemCopy(lpBuffer, lpStringsB[i], _TSTR);
      AkelPad.SendMessage(hWndStringB, 0x143 /*CB_ADDSTRING*/, 0, lpBuffer);
    }
    //Set font and text
    SetWindowFontAndText(hWndStringB, hGuiFont, "");
    AkelPad.SendMessage(hWndStringB, 0x14E /*CB_SETCURSEL*/, 0, 0);

    //Create window GroupBox Range
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    hWndRange=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                         0,            //dwExStyle
                         lpBuffer,     //lpClassName
                         0,            //lpWindowName
                         0x50000007,   //WS_VISIBLE|WS_CHILD|BS_GROUPBOX
                         11,           //x
                         113,          //y
                         200,          //nWidth
                         82,           //nHeight
                         hWnd,         //hWndParent
                         IDC_STATIC,   //ID
                         hInstanceDLL, //hInstance
                         0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndRange, hGuiFont, pTxtRange);

    //Create window Radiobutton Selection
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    hWndSelection=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                            0,             //dwExStyle
                            lpBuffer,      //lpClassName
                            0,             //lpWindowName
                            0x50000009,    //WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
                            18,            //x
                            131,           //y
                            190,           //nWidth
                            16,            //nHeight
                            hWnd,          //hWndParent
                            IDC_SELECTION, //ID
                            hInstanceDLL,  //hInstance
                            0);            //lpParam
    //Set font and text
    SetWindowFontAndText(hWndSelection, hGuiFont, pTxtSelection);

    //Create window Radiobutton Lines
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    hWndLines=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                        0,            //dwExStyle
                        lpBuffer,     //lpClassName
                        0,            //lpWindowName
                        0x50000009,   //WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
                        18,           //x
                        151,          //y
                        190,          //nWidth
                        16,           //nHeight
                        hWnd,         //hWndParent
                        IDC_LINES,    //ID
                        hInstanceDLL, //hInstance
                        0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndLines, hGuiFont, pTxtLines);

    //Create window Radiobutton Columnar Selection
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    hWndColSel=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                         0,            //dwExStyle
                         lpBuffer,     //lpClassName
                         0,            //lpWindowName
                         0x50000009,   //WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
                         18,           //x
                         171,          //y
                         190,          //nWidth
                         16,           //nHeight
                         hWnd,         //hWndParent
                         IDC_COLSEL,   //ID
                         hInstanceDLL, //hInstance
                         0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndColSel, hGuiFont, pTxtColSel);
    //Check
    if (nRange == 0)
      AkelPad.SendMessage(hWndSelection, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    else if (nRange == 1)
      AkelPad.SendMessage(hWndLines, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    else
      AkelPad.SendMessage(hWndColSel, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    if (! bColSel)
      oSys.Call("user32::EnableWindow", hWndColSel, false);

    //Create window checkbox EscNewLine
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    hWndEscNewLine=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                             0,              //dwExStyle
                             lpBuffer,       //lpClassName
                             0,              //lpWindowName
                             0x50010003,     //WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
                             240,            //x
                             113,            //y
                             120,            //nWidth
                             16,             //nHeight
                             hWnd,           //hWndParent
                             IDC_ESCNEWLINE, //ID
                             hInstanceDLL,   //hInstance
                             0);             //lpParam
    //Set font and text
    SetWindowFontAndText(hWndEscNewLine, hGuiFont, pTxtEscNewLine);
    //Check
    if (bEscNewLine) AkelPad.SendMessage(hWndEscNewLine, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
 
    //Create window checkbox EscTab
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    hWndEscTab=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                         0,            //dwExStyle
                         lpBuffer,     //lpClassName
                         0,            //lpWindowName
                         0x50010003,   //WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
                         240,          //x
                         134,          //y
                         120,          //nWidth
                         16,           //nHeight
                         hWnd,         //hWndParent
                         IDC_ESCTAB,   //ID
                         hInstanceDLL, //hInstance
                         0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndEscTab, hGuiFont, pTxtEscTab);
    //Check
    if (bEscTab) AkelPad.SendMessage(hWndEscTab, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);

    //Create window OK button
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    hWndOK=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                     0,            //dwExStyle
                     lpBuffer,     //lpClassName
                     0,            //lpWindowName
                     0x50010001,   //WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_DEFPUSHBUTTON
                     260,          //x
                     160,          //y
                     75,           //nWidth
                     23,           //nHeight
                     hWnd,         //hWndParent
                     IDC_OK,       //ID
                     hInstanceDLL, //hInstance
                     0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndOK, hGuiFont, pTxtOK);

    //Create window Cancel button
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    hWndCancel=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                         0,            //dwExStyle
                         lpBuffer,     //lpClassName
                         0,            //lpWindowName
                         0x50010000,   //WS_VISIBLE|WS_CHILD|WS_TABSTOP
                         260,          //x
                         190,          //y
                         75,           //nWidth
                         23,           //nHeight
                         hWnd,         //hWndParent
                         IDC_CANCEL,   //ID
                         hInstanceDLL, //hInstance
                         0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndCancel, hGuiFont, pTxtCancel);

    //Center dialog
    CenterWindow(hEditWnd, hWnd);
  }

  else if (uMsg == 7)  //WM_SETFOCUS
    oSys.Call("user32::SetFocus", hWndStringA);
  else if (uMsg == 256)  //WM_KEYDOWN
  {
    if (bCloseCombo)
    {
      if (wParam == 27)  //VK_ESCAPE
        //Escape key pushes Cancel button
        oSys.Call("user32::PostMessage" + _TCHAR, hWndDialog, 273 /*WM_COMMAND*/, IDC_CANCEL, 0);
      else if (wParam == 13)  //VK_RETURN
        //Return key pushes OK button
        oSys.Call("user32::PostMessage" + _TCHAR, hWndDialog, 273 /*WM_COMMAND*/, IDC_OK, 0);
    }
  }
  else if (uMsg == 273)  //WM_COMMAND
  {
    if (LoWord(wParam) == IDC_INPUT)
    {
      if (HiWord(wParam) == 7 /*CBN_DROPDOWN*/)
        bCloseCombo = false;
      else if (HiWord(wParam) == 8 /*CBN_CLOSEUP*/)
        bCloseCombo = true;
    }

    if (LoWord(wParam) == IDC_ESCNEWLINE)
      bEscNewLine=AkelPad.SendMessage(hWndEscNewLine, 240 /*BM_GETCHECK*/, 0, 0);

    else if (LoWord(wParam) == IDC_ESCTAB)
      bEscTab=AkelPad.SendMessage(hWndEscTab, 240 /*BM_GETCHECK*/, 0, 0);

    else if (LoWord(wParam) == IDC_SELECTION)
    {
      nRange = 0;
      SetWindowFontAndText(hWndStaticA, hGuiFont, pTxtStaticA[nRange]);
      SetWindowFontAndText(hWndStaticB, hGuiFont, pTxtStaticB[nRange]);
    }

    else if (LoWord(wParam) == IDC_LINES)
    {
      nRange = 1;
      SetWindowFontAndText(hWndStaticA, hGuiFont, pTxtStaticA[nRange]);
      SetWindowFontAndText(hWndStaticB, hGuiFont, pTxtStaticB[nRange]);
    }

    else if (LoWord(wParam) == IDC_COLSEL)
    {
      nRange = 2;
      SetWindowFontAndText(hWndStaticA, hGuiFont, pTxtStaticA[nRange]);
      SetWindowFontAndText(hWndStaticB, hGuiFont, pTxtStaticB[nRange]);
    }

    else if (LoWord(wParam) == IDC_OK)
    {
      //pStringA
      oSys.Call("user32::GetWindowText" + _TCHAR, hWndStringA, lpBuffer, 256);
      pStringA = AkelPad.MemRead(lpBuffer, _TSTR);
      for (i=0; i < nStrings; ++i)
      {
        if (lpStringsA[i] == pStringA)
        {
          AkelPad.SendMessage(hWndStringA, 0x144 /*CB_DELETESTRING*/, i, 0);
          DeleteFromArray(lpStringsA, i, 1);
        }
      }
      InsertInArray(lpStringsA, pStringA, 0);
      if (lpStringsA.length > nStrings)
        DeleteFromArray(lpStringsA, -1, 1);
      AkelPad.MemCopy(lpBuffer, pStringA, _TSTR);
      AkelPad.SendMessage(hWndStringA, 0x14A /*CB_INSERTSTRING*/, 0, lpBuffer);
      AkelPad.SendMessage(hWndStringA, 0x14E /*CB_SETCURSEL*/, 0, 0);

      //pStringB
      oSys.Call("user32::GetWindowText" + _TCHAR, hWndStringB, lpBuffer, 256);
      pStringB = AkelPad.MemRead(lpBuffer, _TSTR);
      for (i=0; i < nStrings; ++i)
      {
        if (lpStringsB[i] == pStringB)
        {
          AkelPad.SendMessage(hWndStringB, 0x144 /*CB_DELETESTRING*/, i, 0);
          DeleteFromArray(lpStringsB, i, 1);
        }
      }
      InsertInArray(lpStringsB, pStringB, 0);
      if (lpStringsB.length > nStrings)
        DeleteFromArray(lpStringsB, -1, 1);
      AkelPad.MemCopy(lpBuffer, pStringB, _TSTR);
      AkelPad.SendMessage(hWndStringB, 0x14A /*CB_INSERTSTRING*/, 0, lpBuffer);
      AkelPad.SendMessage(hWndStringB, 0x14E /*CB_SETCURSEL*/, 0, 0);

      InsertText();

      oSys.Call("user32::PostMessage" + _TCHAR, hWndDialog, 16 /*WM_CLOSE*/, 0, 0);
    }

    else if (LoWord(wParam) == IDC_CANCEL)
    {
      oSys.Call("user32::PostMessage" + _TCHAR, hWndDialog, 16 /*WM_CLOSE*/, 0, 0);
    }
  }
  else if (uMsg == 16)  //WM_CLOSE
  {
    //Enable main window
    oSys.Call("user32::EnableWindow", hMainWnd, true);

    for (i=0; i < nStrings; ++i)
      WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\InsertText\\TextA" + i, lpStringsA[i], "REG_SZ");
    for (i=0; i < nStrings; ++i)
      WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\InsertText\\TextB" + i, lpStringsB[i], "REG_SZ");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\InsertText\\EscNewLine", bEscNewLine, "REG_DWORD");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\InsertText\\EscTab", bEscTab, "REG_DWORD");

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


function SetWindowFontAndText(hWnd, hFont, pText)
{
  var lpWindowText;

  AkelPad.SendMessage(hWnd, 48 /*WM_SETFONT*/, hFont, true);

  if (lpWindowText=AkelPad.MemAlloc(256 * _TSIZE))
  {
    AkelPad.MemCopy(lpWindowText, pText.substr(0, 255), _TSTR);
    oSys.Call("user32::SetWindowText" + _TCHAR, hWnd, lpWindowText);

    AkelPad.MemFree(lpWindowText);
  }
}


function CenterWindow(hWndParent, hWnd)
{
  var lpRect;
  var rcWndParent=[];
  var rcWnd=[];
  var X;
  var Y;

  if (lpRect=AkelPad.MemAlloc(16))  //sizeof(RECT)
  {
    if (!hWndParent)
      hWndParent=oSys.Call("user32::GetDesktopWindow");

    oSys.Call("user32::GetWindowRect", hWndParent, lpRect);
    RectToArray(lpRect, rcWndParent);

    oSys.Call("user32::GetWindowRect", hWnd, lpRect);
    RectToArray(lpRect, rcWnd);

    //Center window
    X=rcWndParent.left + ((rcWndParent.right - rcWndParent.left) / 2 - (rcWnd.right - rcWnd.left) / 2);
    Y=rcWndParent.top + ((rcWndParent.bottom - rcWndParent.top) / 2 - (rcWnd.bottom - rcWnd.top) / 2);

    oSys.Call("user32::SetWindowPos", hWnd, 0, X, Y, 0, 0, 0x15 /*SWP_NOZORDER|SWP_NOACTIVATE|SWP_NOSIZE*/);

    AkelPad.MemFree(lpRect);
  }
}


function RectToArray(lpRect, rcRect)
{
  rcRect.left=AkelPad.MemRead(lpRect, 3 /*DT_DWORD*/);
  rcRect.top=AkelPad.MemRead(lpRect + 4, 3 /*DT_DWORD*/);
  rcRect.right=AkelPad.MemRead(lpRect + 8, 3 /*DT_DWORD*/);
  rcRect.bottom=AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/);
  return rcRect;
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


function GetOffset(hWnd, nFlag)
{
  var lpIndex;
  var nOffset=-1;

  if (lpIndex=AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/))
  {
    AkelPad.SendMessage(hWnd, 3130 /*AEM_GETINDEX*/, nFlag, lpIndex);
    nOffset=AkelPad.SendMessage(hWnd, 3136 /*AEM_INDEXTORICHOFFSET*/, 0, lpIndex);
    AkelPad.MemFree(lpIndex);
  }
  return nOffset;
}


function SetRedraw(hWnd, bRedraw)
{
   var oSys = AkelPad.SystemFunction();
   AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
   bRedraw && oSys.Call("user32::InvalidateRect", hWnd, 0, true);
}


function InsertText()
{
  var nWordWrap;
  var nBegSel;
  var nEndSel;
   var nLine1;
   var nLine2;
  var pSelTxt;

  if (bEscNewLine)
  {
    pStringA = pStringA.replace(/\\n/g, "\r");
    pStringB = pStringB.replace(/\\n/g, "\r");
  }
  if (bEscTab)
  {
    pStringA = pStringA.replace(/\\t/g, "\t");
    pStringB = pStringB.replace(/\\t/g, "\t");
  }

  // insert in selection
  if (nRange == 0)
  {
    pSelTxt = AkelPad.GetSelText(1 /*\r*/);
    AkelPad.ReplaceSel(pStringA + pSelTxt + pStringB, true);

    if (bColSel)
      AkelPad.SendMessage(hEditWnd, 3128 /*AEM_UPDATESEL*/, 0x1 /*AESELT_COLUMNON*/, 0);
  }

  // insert in each of selected lines and columnar selection
  else
  {
    SetRedraw(hEditWnd, false);
    nWordWrap = AkelPad.SendMessage(hEditWnd, 3241 /*AEM_GETWORDWRAP*/, 0, 0);
    if (nWordWrap > 0)
      AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/);

    if (nRange == 1)
    {
      nBegSel = AkelPad.GetSelStart();
      nEndSel = AkelPad.GetSelEnd();
      nLine1  = AkelPad.SendMessage(hEditWnd, 1078 /*EM_EXLINEFROMCHAR*/, 0, nBegSel);
      nLine2  = AkelPad.SendMessage(hEditWnd, 1078 /*EM_EXLINEFROMCHAR*/, 0, nEndSel);
      nBegSel = AkelPad.SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/, nLine1, 0);
      nEndSel = AkelPad.SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/, nLine2, 0) + AkelPad.SendMessage(hEditWnd, 193 /*EM_LINELENGTH*/, nEndSel, 0);

      AkelPad.SetSel(nBegSel, nEndSel);
    }

    pSelTxt = AkelPad.GetSelText(1 /*\r*/);
    pSelTxt = pSelTxt.replace(/\r/g, pStringB + "\r" + pStringA);
    pSelTxt = pStringA + pSelTxt + pStringB;

    AkelPad.ReplaceSel(pSelTxt, true);

    if (nRange == 2)
      AkelPad.SendMessage(hEditWnd, 3128 /*AEM_UPDATESEL*/, 0x1 /*AESELT_COLUMNON*/, 0);

    if (nWordWrap > 0)
      AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/);
    SetRedraw(hEditWnd, true);
  }
}
