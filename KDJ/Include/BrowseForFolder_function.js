// BrowseForFolder function - 2012-10-24
//
// Call in script:
// AkelPad.Include("BrowseForFolder_function.js");
// sDir = BrowseForFolder(hWndOwn, sTitle, sIniDir);
//
// hWndOwn - handle to the owner window for the dialog box
// sTitle  - string that is displayed above the tree view control in the dialog box, can be ""
// sIniDir - folder to be selected, after calling the function, can be ""
//
// Function returns string - selected folder name or "" if you press Cancel button

function BrowseForFolder(hWndOwn, sTitle, sIniDir)
{
  var lpCallback = oSys.RegisterCallback("BrowseForFolderCallback");
  var lpTitle    = AkelPad.MemAlloc((sTitle.length + 1) * _TSIZE);
  var lpData     = AkelPad.MemAlloc(4 + 260 * _TSIZE); //4+sizeof(MAX_PATH)
  var lpDir      = lpData + 4;
  var lpBrowse   = AkelPad.MemAlloc(32); //sizeof(BROWSEINFO)
  var sDir       = "";
  var lpIDL;

  AkelPad.MemCopy(lpTitle, sTitle, _TSTR);
  AkelPad.MemCopy(lpData, hWndOwn, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpDir,  sIniDir, _TSTR);

  AkelPad.MemCopy(lpBrowse     ,    hWndOwn, 3 /*DT_DWORD*/); //hWndOwner
  AkelPad.MemCopy(lpBrowse +  4,          0, 3 /*DT_DWORD*/); //pidlRoot
  AkelPad.MemCopy(lpBrowse +  8,      lpDir, 3 /*DT_DWORD*/); //pszDisplayName
  AkelPad.MemCopy(lpBrowse + 12,    lpTitle, 3 /*DT_DWORD*/); //lpszTitle
  AkelPad.MemCopy(lpBrowse + 16, 0x00000041, 3 /*DT_DWORD*/); //ulFlags = BIF_NEWDIALOGSTYLE|BIF_RETURNONLYFSDIRS
  AkelPad.MemCopy(lpBrowse + 20, lpCallback, 3 /*DT_DWORD*/); //lpfn
  AkelPad.MemCopy(lpBrowse + 24,     lpData, 3 /*DT_DWORD*/); //lParam
  AkelPad.MemCopy(lpBrowse + 28,          0, 3 /*DT_DWORD*/); //iImage

  AkelPad.SystemFunction().Call("Ole32::CoInitialize", 0);
  lpIDL = AkelPad.SystemFunction().Call("Shell32::SHBrowseForFolder" + _TCHAR, lpBrowse);

  if (lpIDL)
  {
    AkelPad.SystemFunction().Call("Shell32::SHGetPathFromIDList" + _TCHAR, lpIDL, lpDir);
    sDir = AkelPad.MemRead(lpDir, _TSTR);
  }

  AkelPad.SystemFunction().Call("Ole32::CoTaskMemFree, lpIDL");
  AkelPad.SystemFunction().Call("Ole32::CoUninitialize");

  AkelPad.MemFree(lpBrowse);
  AkelPad.MemFree(lpData);
  AkelPad.MemFree(lpTitle);
  AkelPad.SystemFunction().UnregisterCallback(lpCallback);

  return sDir;
}

function BrowseForFolderCallback(hWnd, uMsg, lParam, lpData)
{
  if (uMsg == 1 /*BFFM_INITIALIZED*/)
  {
    var lpRect  = AkelPad.MemAlloc(16); //sizeof(RECT)
    var hWndOwn = AkelPad.MemRead(lpData, 3 /*DT_DWORD*/) || AkelPad.SystemFunction().Call("user32::GetDesktopWindow");
    var nWndX, nWndY, nWndW, nWndH;
    var nOwnX, nOwnY, nOwnW, nOwnH;
    var nDeskW, nDeskH;

    AkelPad.SendMessage(hWnd, 0x0467 /*BFFM_SETSELECTIONW*/, 1, lpData + 4);

    //set focus to TreeView
    oSys.Call("User32::PostMessageW", hWnd, 0x0028 /*WM_NEXTDLGCTL*/, 0, 0);
    oSys.Call("User32::PostMessageW", hWnd, 0x0028 /*WM_NEXTDLGCTL*/, 0, 0);

    //center dialog
    AkelPad.SystemFunction().Call("User32::GetWindowRect", hWnd, lpRect);
    nWndX = AkelPad.MemRead(lpRect,      3 /*DT_DWORD*/);
    nWndY = AkelPad.MemRead(lpRect +  4, 3 /*DT_DWORD*/);
    nWndW = AkelPad.MemRead(lpRect +  8, 3 /*DT_DWORD*/) - nWndX;
    nWndH = AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/) - nWndY;

    AkelPad.SystemFunction().Call("User32::GetWindowRect", hWndOwn, lpRect);
    nOwnX = AkelPad.MemRead(lpRect,      3 /*DT_DWORD*/);
    nOwnY = AkelPad.MemRead(lpRect +  4, 3 /*DT_DWORD*/);
    nOwnW = AkelPad.MemRead(lpRect +  8, 3 /*DT_DWORD*/) - nOwnX;
    nOwnH = AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/) - nOwnY;

    AkelPad.SystemFunction().Call("User32::GetWindowRect", AkelPad.SystemFunction().Call("User32::GetDesktopWindow"), lpRect);
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

    AkelPad.SystemFunction().Call("User32::MoveWindow", hWnd, nWndX, nWndY, nWndW, nWndH, 0);
  }

  return 0;
}
