// InsertFileNamePath.js - 2011-10-02
//
// Inserts file name/path or copy to clipboard.
//
// Call("Scripts::Main", 1, "InsertFileNamePath.js" [, "Arg1 Arg2"])
//
// Arguments are optional. If not specified, a menu will appear.
// Arg1 = 1 - file name
// Arg1 = 2 - full file name with path
// Arg1 = 3 - path without file name
// Arg1 = 4 - file name without extension
// Arg2 = 0 - insert into the text, not copy to the clipboard (default value, can be omitted),
// Arg2 = 1 - insert into the text and copy to the clipboard,
// Arg2 = 2 - copy to the clipboard, do not insert into the text.
//
// Can assign shortcut keys, eg: Ctrl+Shift+F, Ctrl+Shift+Alt+F, Shift+Alt+F.

var oSys = AkelPad.SystemFunction();

if (oSys.Call("kernel32::GetUserDefaultLangID") == 0x0415) //Polish
{
  var aTxtMenu1 = ["Nazwa pliku",
                   "Pełna nazwa pliku ze ścieżką",
                   "Ścieżka bez nazwy pliku",
                   "Nazwa pliku bez rozszerzenia"];
  var aTxtMenu2 = ["Wstaw do tekstu",
                   "Wstaw i kopiuj",
                   "Kopiuj do schowka"];
}
else
{
  var aTxtMenu1 = ["File name",
                   "Full file name with path",
                   "Path without file name",
                   "File name without extension"];
  var aTxtMenu2 = ["Insert into text",
                   "Insert and copy",
                   "Copy to clipboard"];
}

var hEditWnd = AkelPad.GetEditWnd();
var sFile;
var nArg1;
var nArg2;
var hWndHid;
var hMenu1;
var ahMenu2;
var nCmd;
var lpPoint;
var nX;
var nY;
var nSep;
var bColSel;
var nLines;
var aTxt;
var i, n;

if (! hEditWnd)
  WScript.Quit();

sFile = AkelPad.GetEditFile(hEditWnd);
if (! sFile.length)
  WScript.Quit();

if (WScript.Arguments.length)
  nArg1 = parseInt(WScript.Arguments(0));
if ((! isFinite(nArg1)) || (nArg1 < 1) || (nArg1 > 4))
  nArg1 = 0;

if (nArg1)
{
  if (WScript.Arguments.length > 1)
    nArg2 = parseInt(WScript.Arguments(1));
  if ((! isFinite(nArg2)) || (nArg2 < 1) || (nArg2 > 2))
    nArg2 = 0;
}

else
{
  lpPoint = AkelPad.MemAlloc(8); //sizeof(POINT)
  AkelPad.SendMessage(hEditWnd, 3190 /*AEM_GETCARETPOS*/, lpPoint, 0);
  oSys.Call("user32::ClientToScreen", hEditWnd, lpPoint);
  nX = AkelPad.MemRead(lpPoint,     3 /*DT_DWORD*/);
  nY = AkelPad.MemRead(lpPoint + 4, 3 /*DT_DWORD*/) +
       AkelPad.SendMessage(hEditWnd, 3188 /*AEM_GETCHARSIZE*/, 0 /*AECS_HEIGHT*/, 0);

  hWndHid = oSys.Call("user32::CreateWindowEx" + _TCHAR, 0, "STATIC", 0, 0x50000000 /*WS_VISIBLE|WS_CHILD*/,
                       0, 0, 0, 0, hEditWnd, 0, AkelPad.GetInstanceDll(), 0);
  oSys.Call("user32::SetFocus", hWndHid);

  ahMenu2 = [];
  for (i = 0; i < 4; ++i)
  {
    ahMenu2[i] = oSys.Call("user32::CreatePopupMenu");
    for (n = 0; n < 3; ++n)
      oSys.Call("user32::AppendMenu" + _TCHAR, ahMenu2[i], 0x00 /*MF_STRING*/, ((i + 1) << 4) | n, aTxtMenu2[n]);
  }

  hMenu1  = oSys.Call("user32::CreatePopupMenu");
  for (i = 0; i < 4; ++i)
    oSys.Call("user32::AppendMenu" + _TCHAR, hMenu1, 0x10 /*MF_POPUP|MF_STRING*/, ahMenu2[i], aTxtMenu1[i]);


  nCmd = oSys.Call("user32::TrackPopupMenu", hMenu1, 0x0180 /*TPM_RETURNCMD|TPM_NONOTIFY*/,
                    nX, nY, 0, hWndHid, 0);

  for (i = 0; i < 4; ++i)
    oSys.Call("user32::DestroyMenu", ahMenu2[i]);
  oSys.Call("user32::DestroyMenu", hMenu1);
  oSys.Call("user32::DestroyWindow", hWndHid);
  AkelPad.MemFree(lpPoint);

  if (! nCmd)
    WScript.Quit();

  nArg1 = (nCmd >> 4) & 0xF;
  nArg2 = nCmd & 0xF;
}

nSep = sFile.lastIndexOf("\\");

if (nArg1 == 1)
  sFile = sFile.substr(nSep + 1);
else if (nArg1 == 3)
  sFile = sFile.substr(0, nSep + 1);
else if (nArg1 == 4)
  sFile = sFile.substr(nSep + 1).replace(/\.[^.]+$/, "");

if ((nArg2 < 2))
{
  bColSel = AkelPad.SendMessage(hEditWnd, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0);

  if (bColSel)
  {
    nLines = AkelPad.SendMessage(hEditWnd, 3129 /*AEM_GETLINENUMBER*/, 2 /*AEGL_LASTSELLINE*/, 0) -
             AkelPad.SendMessage(hEditWnd, 3129 /*AEM_GETLINENUMBER*/, 1 /*AEGL_FIRSTSELLINE*/, 0) + 1;
    aTxt   = new Array(nLines);

    for (i = 0; i < nLines; ++i)
      aTxt[i] = sFile;

    sFile = aTxt.join("\r");
  }

  AkelPad.ReplaceSel(sFile, AkelPad.GetSelStart() != AkelPad.GetSelEnd());
  AkelPad.SendMessage(hEditWnd, 3128 /*AEM_UPDATESEL*/, bColSel, 0);
}

if (nArg2 > 0)
  AkelPad.SetClipboardText(sFile);
