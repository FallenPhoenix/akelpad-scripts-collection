// http://akelpad.sourceforge.net/forum/viewtopic.php?p=10810#10810
// Version v1.1
//
//
//// Delete record from recent files.
//
// Example via ContextMenu plugin:
// Call("Scripts::Main", 1, "DeleteRecentFile.js", `'%f'`)

var hMainWnd=AkelPad.GetMainWnd();

if (WScript.Arguments.length)
  DeleteRecentFile(WScript.Arguments(0));

function DeleteRecentFile(pFileToDelete)
{
  var nIndex;

  if ((nIndex=AkelPad.SendMessage(hMainWnd, 1238 /*AKD_RECENTFILES*/, 7 /*RF_FINDINDEX*/, AkelPad.MemStrPtr(pFileToDelete))) >= 0)
  {
    if (AkelPad.SendMessage(hMainWnd, 1238 /*AKD_RECENTFILES*/, 8 /*RF_DELETEINDEX*/, nIndex))
      AkelPad.SendMessage(hMainWnd, 1238 /*AKD_RECENTFILES*/, 4 /*RF_SAVE*/, 0);
  }
}
