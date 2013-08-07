// InsertFolderName_alternative.js - ver. 2013-08-07 (x86/x64)
//
// Inserts folder name using SHBrowseForFolder function.
// Alternative version with AkelPad.Include("BrowseForFolder_function.js").
// Script BrowseForFolder_function.js must be placed in directory ...\AkelPad\AkelFiles\Plugs\Scripts\Include\
//
// Usage:
// Call("Scripts::Main", 1, "InsertFolderName_alternative.js")

var hEditWnd = AkelPad.GetEditWnd();
var sFile    = AkelPad.GetEditFile(0);
var sText    = "Choose folder:";
var sDir     = "";
var sTitle   = "Insert folder name";

if ((hEditWnd) && AkelPad.Include("BrowseForFolder_function.js"))
{
  if (sFile)
    sDir = sFile.substr(0, sFile.lastIndexOf("\\") + 1);

  sDir = BrowseForFolder(hEditWnd, sText, sDir, sTitle);

  if (sDir)
    AkelPad.ReplaceSel(sDir, 1);
}
