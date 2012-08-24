// http://akelpad.sourceforge.net/forum/viewtopic.php?p=5163#5163
// Version v1.2
//
//
//// Print all MDI documents.

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
    if (lpFrameCur == lpFrameInit)
    {
      if (!AkelPad.Command(4108 /*IDM_FILE_PRINT*/))
        break;
    }
    else
    {
      if (!AkelPad.Command(4113 /*IDM_FILE_SILENTPRINT*/))
        break;
    }

    //Next MDI frame
    lpFrameCur=AkelPad.Command(4316 /*IDM_WINDOW_FRAMENEXT*/);
    if (!lpFrameCur || lpFrameCur == lpFrameInit)
      break;
  }
}
