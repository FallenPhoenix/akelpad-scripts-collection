// Changing selection mode (column on/off) - simple version - 2010-10-02
//
// Call("Scripts::Main", 1, "SelectionSwitch.js")


var hEditWnd = AkelPad.GetEditWnd();
if (! hEditWnd)
  WScript.Quit();


var bColSel = AkelPad.SendMessage(hEditWnd, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0);

if (bColSel)
  AkelPad.SendMessage(hEditWnd, 3128 /*AEM_UPDATESEL*/, 0x0 /*column off*/, 0);
else
  AkelPad.SendMessage(hEditWnd, 3128 /*AEM_UPDATESEL*/, 0x1 /*AESELT_COLUMNON*/, 0);
