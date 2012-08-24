// http://akelpad.sourceforge.net/forum/viewtopic.php?p=13246#13246
// Version v1.0
//
//
//// Merge contents of all opened documents in one file.

var hMainWnd=AkelPad.GetMainWnd();
var pText="";
var nIndex=0;

if (hMainWnd)
{
  while (lpFrame=AkelPad.SendMessage(hMainWnd, 1288 /*AKD_FRAMEFIND*/, 8 /*FWF_BYTABINDEX*/, nIndex++))
  {
    AkelPad.SendMessage(hMainWnd, 1285 /*AKD_FRAMEACTIVATE*/, 0, lpFrame);
    pText+=AkelPad.GetTextRange(0, -1);
  }
  if (pText)
  {
    AkelPad.Command(4101 /*IDM_FILE_NEW*/);
    AkelPad.ReplaceSel(pText);
    AkelPad.Command(4106 /*IDM_FILE_SAVEAS*/);
  }
}
