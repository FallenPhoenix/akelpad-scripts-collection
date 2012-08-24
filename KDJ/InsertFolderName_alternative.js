// Inserts folder name using SHBrowseForFolder function - 2011-06-22
//
// Alternative version with AkelPad.Include("BrowseForFolder_function.js")
// Script BrowseForFolder_function.js must be placed in directory ...\Scripts\Include
// Call("Scripts::Main", 1, "InsertFolderName_alternative.js")

var hEditWnd = AkelPad.GetEditWnd();
var sFile    = AkelPad.GetEditFile(0);
var sTitle   = "Choose folder for inserting to text:";
var sDir     = "";

if ((hEditWnd) && AkelPad.Include("BrowseForFolder_function.js"))
{
  if (sFile)
    sDir = sFile.substr(0, sFile.lastIndexOf("\\") + 1);

  sDir = BrowseForFolder(hEditWnd, sTitle, sDir);

  if (sDir)
    AkelPad.ReplaceSel(sDir, 1);
}
