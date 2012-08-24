// http://akelpad.sourceforge.net/forum/viewtopic.php?p=3370#3370
// Version v1.2
//
//
//// Delete trailing whitespaces in all MDI documents.

var hMainWnd=AkelPad.GetMainWnd();
var lpFrameInit;
var lpFrameCur;

if (hMainWnd)
{
  //Initial MDI frame
  lpFrameInit=AkelPad.SendMessage(hMainWnd, 1288 /*AKD_FRAMEFIND*/, 1 /*FWF_CURRENT*/, 0);
  lpFrameCur=lpFrameInit;

  for (;;)
  {
    AkelPad.Command(4174 /*IDM_EDIT_DELETE_TRAILING_WHITESPACES*/);
  
    //Next MDI frame
    lpFrameCur=AkelPad.Command(4316 /*IDM_WINDOW_FRAMENEXT*/);
    if (!lpFrameCur || lpFrameCur == lpFrameInit)
      break;
  }
}
