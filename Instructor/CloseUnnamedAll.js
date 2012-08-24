// http://akelpad.sourceforge.net/forum/viewtopic.php?p=3370#3370
// Version v1.3
//
//
//// Close all unnamed or unexisted MDI documents.
//
// Arguments:
// -CloseUnnamed=false   -Close document without name (default is true).
// -CloseUnexisted=true  -Close document if file is deleted (default is false).
//
// Example:
// -"Close only unexisted" Call("Scripts::Main", 1, "CloseUnnamedAll.js", `-CloseUnnamed=false -CloseUnexisted=true`)

//Arguments
var bCloseUnnamed=AkelPad.GetArgValue("CloseUnnamed", true);
var bCloseUnexisted=AkelPad.GetArgValue("CloseUnexisted", false);

//Variables
var hMainWnd=AkelPad.GetMainWnd();
var oSys=AkelPad.SystemFunction();
var lpFrameInit=0;
var lpFrameCur=0;
var bFrameClose=false;
var pFile;
var dwState=0;

if (AkelPad.IsMDI())
{
  //Turn off watch file
  if (hMenuMain=AkelPad.SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 21 /*MI_MENUMAIN*/, 0))
  {
    dwState=oSys.Call("user32::GetMenuState", hMenuMain, 4253 /*IDM_OPTIONS_WATCHFILE*/, 0 /*MF_BYCOMMAND*/);
    if (dwState & 0x8 /*MF_CHECKED*/)
      AkelPad.Command(4253 /*IDM_OPTIONS_WATCHFILE*/);
  }

  for (;;)
  {
    if (!lpFrameCur) lpFrameCur=AkelPad.SendMessage(hMainWnd, 1288 /*AKD_FRAMEFIND*/, 1 /*FWF_CURRENT*/, 0);
    if (!lpFrameInit) lpFrameInit=lpFrameCur;

    //Is frame must be closed
    pFile=AkelPad.GetEditFile(0);
    if ((bCloseUnnamed && !pFile) ||
        (bCloseUnexisted && oSys.Call("kernel32::GetFileAttributes" + _TCHAR, pFile) == -1))
    {
      bFrameClose=true;
    }

    if (bFrameClose)
    {
      //Close MDI frame
      if (AkelPad.GetEditModified(0))
        AkelPad.SendMessage(hMainWnd, 1229 /*AKD_SETMODIFY*/, 0, false);
      if (!AkelPad.Command(4318 /*IDM_WINDOW_FRAMECLOSE*/))
        break;
      if (lpFrameInit == lpFrameCur)
        lpFrameInit=0;
      lpFrameCur=0;
      bFrameClose=false;
    }
    else
    {
      //Next MDI frame
      lpFrameCur=AkelPad.Command(4316 /*IDM_WINDOW_FRAMENEXT*/);
      if (!lpFrameCur || lpFrameCur == lpFrameInit)
        break;
    }
  }

  //Turn on watch file
  if (dwState & 0x8 /*MF_CHECKED*/)
    AkelPad.Command(4253 /*IDM_OPTIONS_WATCHFILE*/);
}
