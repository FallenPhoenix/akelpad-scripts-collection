// Inserts folder name using SHBrowseForFolder function - 2011-06-22
//
// Call("Scripts::Main", 1, "InsertFolderName.js")

var hEditWnd = AkelPad.GetEditWnd();
if (! hEditWnd)
  WScript.Quit();

var DT_DWORD   = 3;
var oSys       = AkelPad.SystemFunction();
var sFile      = AkelPad.GetEditFile(0);
var sDir       = "";
var lpCallback = oSys.RegisterCallback("BrowseForFolderCallback");
var lpDir      = AkelPad.MemAlloc(260 * _TSIZE); //sizeof(MAX_PATH)
var lpBrowse   = AkelPad.MemAlloc(32);           //sizeof(BROWSEINFO)
var lpIDL;

if (sFile)
  sDir = sFile.substr(0, sFile.lastIndexOf("\\") + 1);

AkelPad.MemCopy(lpDir, sDir, _TSTR);

AkelPad.MemCopy(lpBrowse     ,   hEditWnd, DT_DWORD); //hwndOwner
AkelPad.MemCopy(lpBrowse +  4,          0, DT_DWORD); //pidlRoot
AkelPad.MemCopy(lpBrowse +  8,      lpDir, DT_DWORD); //pszDisplayName
AkelPad.MemCopy(lpBrowse + 12,          0, DT_DWORD); //lpszTitle
AkelPad.MemCopy(lpBrowse + 16, 0x00000041, DT_DWORD); //ulFlags = BIF_NEWDIALOGSTYLE|BIF_RETURNONLYFSDIRS
AkelPad.MemCopy(lpBrowse + 20, lpCallback, DT_DWORD); //lpfn
AkelPad.MemCopy(lpBrowse + 24,      lpDir, DT_DWORD); //lParam
AkelPad.MemCopy(lpBrowse + 28,          0, DT_DWORD); //iImage

oSys.Call("Ole32::CoInitialize", 0);
lpIDL = oSys.Call("Shell32::SHBrowseForFolder" + _TCHAR, lpBrowse);

if (lpIDL)
{
  oSys.Call("Shell32::SHGetPathFromIDList" + _TCHAR, lpIDL, lpDir);

  sDir = AkelPad.MemRead(lpDir, _TSTR);
  if (sDir && (! /\\$/.test(sDir)))
    sDir += "\\";

  AkelPad.ReplaceSel(sDir, 1);
}

oSys.Call("Ole32::CoTaskMemFree, lpIDL");
oSys.Call("Ole32::CoUninitialize");

AkelPad.MemFree(lpBrowse);
AkelPad.MemFree(lpDir);
oSys.UnregisterCallback(lpCallback);

function BrowseForFolderCallback(hWnd, uMsg, lParam, lpData)
{
  if (uMsg == 1 /*BFFM_INITIALIZED*/)
    AkelPad.SendMessage(hWnd, 0x0467 /*BFFM_SETSELECTIONW*/, 1, lpData);

  return 0;
}
