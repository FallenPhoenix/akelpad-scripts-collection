// http://akelpad.sourceforge.net/forum/viewtopic.php?p=3751#3751
// Version v1.0
//
//
//// Select next word

var hMainWnd=AkelPad.GetMainWnd();

if (hMainWnd)
{
  if (AkelPad.IsAkelEdit())
  {
    AkelPad.SendMessage(AkelPad.GetEditWnd(), 3044 /*AEM_KEYDOWN*/, 0x27 /*VK_RIGHT*/, 0x02|0x04 /*AEMOD_SHIFT|AEMOD_CONTROL*/);
  }
  else
  {
    var WshShell=new ActiveXObject("WScript.Shell");

    //Wait for release all virtual keys
    AkelPad.SendMessage(hMainWnd, 1312 /*AKD_WAITKEYBOARD*/, 0, 0);

    WshShell.SendKeys("^+{RIGHT}");
  }
}
