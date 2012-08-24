// BrowseForFolder function - 2011-06-22
//
// Call in script:
// AkelPad.Include("BrowseForFolder_function.js");
// BrowseForFolder(hwndOwner, sTitle, sDir);
//
// hwndOwner - handle to the owner window for the dialog box
// sTitle    - string that is displayed above the tree view control in the dialog box, can be ""
// sDir      - folder to be selected, after calling the function, can be ""
//
// Function returns string - selected folder name or "" if you press Cancel button

function BrowseForFolder(hwndOwner, sTitle, sDir)
{
  var DT_DWORD   = 3;
  var oSys       = AkelPad.SystemFunction();
  var lpCallback = oSys.RegisterCallback("BrowseForFolderCallback");
  var lpTitle    = AkelPad.MemAlloc((sTitle.length + 1) * _TSIZE);
  var lpDir      = AkelPad.MemAlloc(260 * _TSIZE); //sizeof(MAX_PATH)
  var lpBrowse   = AkelPad.MemAlloc(32);           //sizeof(BROWSEINFO)
  var lpIDL;

  AkelPad.MemCopy(lpTitle, sTitle, _TSTR);
  AkelPad.MemCopy(lpDir,   sDir,   _TSTR);

  AkelPad.MemCopy(lpBrowse     ,  hwndOwner, DT_DWORD); //hwndOwner
  AkelPad.MemCopy(lpBrowse +  4,          0, DT_DWORD); //pidlRoot
  AkelPad.MemCopy(lpBrowse +  8,      lpDir, DT_DWORD); //pszDisplayName
  AkelPad.MemCopy(lpBrowse + 12,    lpTitle, DT_DWORD); //lpszTitle
  AkelPad.MemCopy(lpBrowse + 16, 0x00000041, DT_DWORD); //ulFlags = BIF_NEWDIALOGSTYLE|BIF_RETURNONLYFSDIRS
  AkelPad.MemCopy(lpBrowse + 20, lpCallback, DT_DWORD); //lpfn
  AkelPad.MemCopy(lpBrowse + 24,      lpDir, DT_DWORD); //lParam
  AkelPad.MemCopy(lpBrowse + 28,          0, DT_DWORD); //iImage

  oSys.Call("Ole32::CoInitialize", 0);
  lpIDL = oSys.Call("Shell32::SHBrowseForFolder" + _TCHAR, lpBrowse);

  sDir = "";

  if (lpIDL)
  {
    oSys.Call("Shell32::SHGetPathFromIDList" + _TCHAR, lpIDL, lpDir);

    sDir = AkelPad.MemRead(lpDir, _TSTR);
    if (sDir && (! /\\$/.test(sDir)))
      sDir += "\\";
  }

  oSys.Call("Ole32::CoTaskMemFree, lpIDL");
  oSys.Call("Ole32::CoUninitialize");

  AkelPad.MemFree(lpBrowse);
  AkelPad.MemFree(lpDir);
  AkelPad.MemFree(lpTitle);
  oSys.UnregisterCallback(lpCallback);

  return sDir;
}

function BrowseForFolderCallback(hWnd, uMsg, lParam, lpData)
{
  if (uMsg == 1 /*BFFM_INITIALIZED*/)
    AkelPad.SendMessage(hWnd, 0x0467 /*BFFM_SETSELECTIONW*/, 1, lpData);

  return 0;
}
