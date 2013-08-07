// BrowseForFolder_function.js - ver. 2013-08-07 (x86/x64)
//
// Call in script:
// if (! AkelPad.Include("BrowseForFolder_function.js")) WScript.Quit();
// sDir = BrowseForFolder(hWndOwn, sText, sIniDir, sTitle);
//
// All arguments are optional:
// hWndOwn - handle to the owner window for the dialog box, default is desktop window
// sText   - text that is displayed above the tree view control in the dialog box, default is ""
// sIniDir - folder to be selected, after calling the function, default is ""
// sTitle  - dialog box title, default is standard title
//
// Function returns string - selected folder name or "" if you press Cancel button

function BrowseForFolder(hWndOwn, sText, sIniDir, sTitle)
{
  var oSys     = AkelPad.SystemFunction();
  var hWndDesk = oSys.Call("User32::GetDesktopWindow");

  if (! oSys.Call("User32::IsWindow", hWndOwn))
    hWndOwn = hWndDesk;
  if (typeof sText != "string")
    sText = "";
  if (typeof sIniDir != "string")
    sIniDir = "";

  var lpCallback = oSys.RegisterCallback("", BFFCallback, 4);
  var lpText     = AkelPad.MemAlloc((sText.length + 1) * 2);
  var lpDir      = AkelPad.MemAlloc(260 * 2); //sizeof(MAX_PATH)
  var lpBrowse   = AkelPad.MemAlloc(_X64 ? 64 : 32); //sizeof(BROWSEINFO)
  var sDir       = "";
  var lpIDL;

  AkelPad.MemCopy(lpText, sText, 1 /*DT_UNICODE*/);
  AkelPad.MemCopy(lpDir, sIniDir, 1 /*DT_UNICODE*/);

  AkelPad.MemCopy(lpBrowse,                       hWndOwn, 2 /*DT_QWORD*/); //hWndOwner
  AkelPad.MemCopy(lpBrowse + (_X64 ?  8 :  4),          0, 2 /*DT_QWORD*/); //pidlRoot
  AkelPad.MemCopy(lpBrowse + (_X64 ? 16 :  8),      lpDir, 2 /*DT_QWORD*/); //pszDisplayName
  AkelPad.MemCopy(lpBrowse + (_X64 ? 24 : 12),     lpText, 2 /*DT_QWORD*/); //lpszTitle
  AkelPad.MemCopy(lpBrowse + (_X64 ? 32 : 16), 0x00000041, 3 /*DT_DWORD*/); //ulFlags = BIF_NEWDIALOGSTYLE|BIF_RETURNONLYFSDIRS
  AkelPad.MemCopy(lpBrowse + (_X64 ? 40 : 20), lpCallback, 2 /*DT_QWORD*/); //lpfn
  AkelPad.MemCopy(lpBrowse + (_X64 ? 48 : 24),          0, 2 /*DT_QWORD*/); //lParam = lpData in callback function
  AkelPad.MemCopy(lpBrowse + (_X64 ? 56 : 28),          0, 3 /*DT_DWORD*/); //iImage

  oSys.Call("Ole32::CoInitialize", 0);
  lpIDL = oSys.Call("Shell32::SHBrowseForFolderW", lpBrowse);

  if (lpIDL)
  {
    oSys.Call("Shell32::SHGetPathFromIDListW", lpIDL, lpDir);
    sDir = AkelPad.MemRead(lpDir, 1 /*DT_UNICODE*/);
  }

  oSys.Call("Ole32::CoTaskMemFree", lpIDL);
  oSys.Call("Ole32::CoUninitialize");

  oSys.UnregisterCallback(lpCallback);
  AkelPad.MemFree(lpText);
  AkelPad.MemFree(lpDir);
  AkelPad.MemFree(lpBrowse);

  return sDir;

  function BFFCallback(hWnd, uMsg, lParam, lpData)
  {
    if (uMsg == 1 /*BFFM_INITIALIZED*/)
    {
      var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)
      var hWnd1;
      var hWnd2;
      var nWndX, nWndY, nWndW, nWndH;
      var nOwnX, nOwnY, nOwnW, nOwnH;
      var nDeskW, nDeskH;

      if (typeof sTitle == "string")
        oSys.Call("User32::SetWindowTextW", hWnd, sTitle);

      oSys.Call("User32::SendMessageW", hWnd, 0x0467 /*BFFM_SETSELECTIONW*/, 1, lpDir);

      //set focus to TreeView
      if (hWnd1 = oSys.Call("User32::FindWindowExW", hWnd, 0, "SHBrowseForFolder ShellNameSpace Control", 0))
      {
        if (hWnd2 = oSys.Call("User32::FindWindowExW", hWnd1, 0, "SysTreeView32", 0))
        {
          WScript.Sleep(50);
          oSys.Call("User32::PostMessageW", hWnd, 0x0028 /*WM_NEXTDLGCTL*/, hWnd2, 1);
          oSys.Call("User32::PostMessageW", hWnd2, 0x1114 /*TVM_ENSUREVISIBLE*/, 0, oSys.Call("User32::SendMessageW", hWnd2, 0x110A /*TVM_GETNEXTITEM*/, 0x0009 /*TVGN_CARET*/, 0));
        }
      }

      //center dialog
      oSys.Call("User32::GetWindowRect", hWnd, lpRect);
      nWndX = AkelPad.MemRead(lpRect,      3 /*DT_DWORD*/);
      nWndY = AkelPad.MemRead(lpRect +  4, 3 /*DT_DWORD*/);
      nWndW = AkelPad.MemRead(lpRect +  8, 3 /*DT_DWORD*/) - nWndX;
      nWndH = AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/) - nWndY;

      oSys.Call("User32::GetWindowRect", hWndOwn, lpRect);
      nOwnX = AkelPad.MemRead(lpRect,      3 /*DT_DWORD*/);
      nOwnY = AkelPad.MemRead(lpRect +  4, 3 /*DT_DWORD*/);
      nOwnW = AkelPad.MemRead(lpRect +  8, 3 /*DT_DWORD*/) - nOwnX;
      nOwnH = AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/) - nOwnY;

      oSys.Call("User32::GetWindowRect", hWndDesk, lpRect);
      nDeskW = AkelPad.MemRead(lpRect +  8, 3 /*DT_DWORD*/);
      nDeskH = AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/);
      AkelPad.MemFree(lpRect);

      nWndX = nOwnX + (nOwnW - nWndW) / 2;
      nWndY = nOwnY + (nOwnH - nWndH) / 2;

      if ((nWndX + nWndW) > nDeskW)
        nWndX = nDeskW - nWndW;
      if (nWndX < 0)
        nWndX = 0;
      if ((nWndY + nWndH) > nDeskH)
        nWndY = nDeskH - nWndH;
      if (nWndY < 0)
        nWndY = 0;

      oSys.Call("User32::SetWindowPos", hWnd, 0, nWndX, nWndY, 0, 0, 0x15 /*SWP_NOZORDER|SWP_NOACTIVATE|SWP_NOSIZE*/);
    }

    return 0;
  }
}
