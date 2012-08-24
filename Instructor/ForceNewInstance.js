// http://akelpad.sourceforge.net/forum/viewtopic.php?p=4222#4222
// Version v1.1
//
//
//// Force create new instance.

var hMainWnd=AkelPad.GetMainWnd();
var oSys=AkelPad.SystemFunction();
var lpPluginData;
var hMenuMain=0;
var hNewMainWnd;
var dwState;

if (hMainWnd)
{
  if (hMenuMain=AkelPad.SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 21 /*MI_MENUMAIN*/, 0))
  {
    dwState=oSys.Call("user32::GetMenuState", hMenuMain, 4256 /*IDM_OPTIONS_SINGLEOPEN_PROGRAM*/, 0 /*MF_BYCOMMAND*/);
  
    if (dwState & 0x8 /*MF_CHECKED*/)
    {
      AkelPad.Command(4256 /*IDM_OPTIONS_SINGLEOPEN_PROGRAM*/);
      hNewMainWnd=AkelPad.Command(4102 /*IDM_FILE_CREATENEW*/);
      AkelPad.Command(4256 /*IDM_OPTIONS_SINGLEOPEN_PROGRAM*/);
      AkelPad.SendMessage(hNewMainWnd, 273 /*WM_COMMAND*/, 4256 /*IDM_OPTIONS_SINGLEOPEN_PROGRAM*/, 0);
    }
    else AkelPad.Command(4102 /*IDM_FILE_CREATENEW*/);
  }
}
