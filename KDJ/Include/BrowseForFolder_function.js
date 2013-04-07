// BrowseForFolder_function.js - ver. 2013-04-07
//
// Call in script:
// if (! AkelPad.Include("BrowseForFolder_function.js")) WScript.Quit();
// sDir = BrowseForFolder(hWndOwn, sTitle, sIniDir, sDlgTitle);
//
// All arguments are optional:
// hWndOwn   - handle to the owner window for the dialog box, default is desktop window
// sTitle    - string that is displayed above the tree view control in the dialog box, default is ""
// sIniDir   - folder to be selected, after calling the function, default is ""
// sDlgTitle - dialog box title, default is standard title
//
// Function returns string - selected folder name or "" if you press Cancel button

function BrowseForFolder(hWndOwn, sTitle, sIniDir, sDlgTitle)
{
  var DT_UNICODE = 1;
  var DT_DWORD   = 3;
  var oSys       = AkelPad.SystemFunction();
  var hWndDesk   = oSys.Call("User32::GetDesktopWindow");

  if (! oSys.Call("User32::IsWindow", hWndOwn))
    hWndOwn = hWndDesk;
  if (typeof sTitle != "string")
    sTitle = "";
  if (typeof sIniDir != "string")
    sIniDir = "";

  var lpCallback = oSys.RegisterCallback("", BFFCallback, 4);
  var lpTitle    = AkelPad.MemAlloc((sTitle.length + 1) * 2);
  var lpDir      = AkelPad.MemAlloc(260 * 2); //sizeof(MAX_PATH)
  var lpBrowse   = AkelPad.MemAlloc(32); //sizeof(BROWSEINFO)
  var sDir       = "";
  var lpIDL;

  AkelPad.MemCopy(lpTitle, sTitle, DT_UNICODE);
  AkelPad.MemCopy(lpDir,  sIniDir, DT_UNICODE);

  AkelPad.MemCopy(lpBrowse     ,    hWndOwn, DT_DWORD); //hWndOwner
  AkelPad.MemCopy(lpBrowse +  4,          0, DT_DWORD); //pidlRoot
  AkelPad.MemCopy(lpBrowse +  8,      lpDir, DT_DWORD); //pszDisplayName
  AkelPad.MemCopy(lpBrowse + 12,    lpTitle, DT_DWORD); //lpszTitle
  AkelPad.MemCopy(lpBrowse + 16, 0x00000041, DT_DWORD); //ulFlags = BIF_NEWDIALOGSTYLE|BIF_RETURNONLYFSDIRS
  AkelPad.MemCopy(lpBrowse + 20, lpCallback, DT_DWORD); //lpfn
  AkelPad.MemCopy(lpBrowse + 24,          0, DT_DWORD); //lParam = lpData in callback function
  AkelPad.MemCopy(lpBrowse + 28,          0, DT_DWORD); //iImage

  oSys.Call("Ole32::CoInitialize", 0);
  lpIDL = oSys.Call("Shell32::SHBrowseForFolderW", lpBrowse);

  if (lpIDL)
  {
    oSys.Call("Shell32::SHGetPathFromIDListW", lpIDL, lpDir);
    sDir = AkelPad.MemRead(lpDir, DT_UNICODE);
  }

  oSys.Call("Ole32::CoTaskMemFree", lpIDL);
  oSys.Call("Ole32::CoUninitialize");

  AkelPad.MemFree(lpBrowse);
  AkelPad.MemFree(lpTitle);
  oSys.UnregisterCallback(lpCallback);

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

      if (typeof sDlgTitle == "string")
        oSys.Call("User32::SetWindowTextW", hWnd, sDlgTitle);

      AkelPad.SendMessage(hWnd, 0x0467 /*BFFM_SETSELECTIONW*/, 1, lpDir);

      //set focus to TreeView
      if (hWnd1 = oSys.Call("User32::FindWindowExW", hWnd, 0, "SHBrowseForFolder ShellNameSpace Control", 0))
      {
        if (hWnd2 = oSys.Call("User32::FindWindowExW", hWnd1, 0, "SysTreeView32", 0))
          oSys.Call("User32::PostMessageW", hWnd, 0x0028 /*WM_NEXTDLGCTL*/, hWnd2, 1);
      }

      //center dialog
      oSys.Call("User32::GetWindowRect", hWnd, lpRect);
      nWndX = AkelPad.MemRead(lpRect,      DT_DWORD);
      nWndY = AkelPad.MemRead(lpRect +  4, DT_DWORD);
      nWndW = AkelPad.MemRead(lpRect +  8, DT_DWORD) - nWndX;
      nWndH = AkelPad.MemRead(lpRect + 12, DT_DWORD) - nWndY;

      oSys.Call("User32::GetWindowRect", hWndOwn, lpRect);
      nOwnX = AkelPad.MemRead(lpRect,      DT_DWORD);
      nOwnY = AkelPad.MemRead(lpRect +  4, DT_DWORD);
      nOwnW = AkelPad.MemRead(lpRect +  8, DT_DWORD) - nOwnX;
      nOwnH = AkelPad.MemRead(lpRect + 12, DT_DWORD) - nOwnY;

      oSys.Call("User32::GetWindowRect", hWndDesk, lpRect);
      nDeskW = AkelPad.MemRead(lpRect +  8, DT_DWORD);
      nDeskH = AkelPad.MemRead(lpRect + 12, DT_DWORD);
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

      oSys.Call("User32::MoveWindow", hWnd, nWndX, nWndY, nWndW, nWndH, 0);
    }

    return 0;
  }
}
