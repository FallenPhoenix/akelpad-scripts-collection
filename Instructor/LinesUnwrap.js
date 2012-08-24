// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1908#1908
// Version v1.1
//
//
//// Lines unwrap.

var hMainWnd=AkelPad.GetMainWnd();

if (hMainWnd)
{
  if (AkelPad.GetSelStart() == AkelPad.GetSelEnd())
    AkelPad.SetSel(0, -1);
  pSelText=AkelPad.GetSelText(2 /*\n*/);

  //Trim leading and trailing spaces
  pSelText=pSelText.replace(/[ \t]+$/gm, "");

  //Unwrap lines
  pSelText=pSelText.replace(/([^.?!:;\n])\n[ \t]*([^\n])/g, "$1 $2");

  AkelPad.ReplaceSel(pSelText, true);
}
