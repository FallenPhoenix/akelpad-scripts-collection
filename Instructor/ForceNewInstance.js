// http://akelpad.sourceforge.net/forum/viewtopic.php?p=4222#4222
// Version v1.2
//
//
//// Force create new instance.

var hMainWnd=AkelPad.GetMainWnd();

ForceNewInstance(hMainWnd, true);

function ForceNewInstance(hMainWnd, bNoSessions)
{
  var hNewMainWnd=0;
  var lpPluginFunction;
  var bAutoLoad=false;

  //Turn off Sessions plugin autoload
  if (bNoSessions)
  {
    if (lpPluginFunction=AkelPad.SendMessage(hMainWnd, 1331 /*AKD_DLLFINDW*/, AkelPad.MemStrPtr("Sessions::Main"), 0))
    {
      if (bAutoLoad=AkelPad.MemRead(lpPluginFunction + (_X64?812:800) /*offsetof(PLUGINFUNCTION, bAutoLoad)*/, 3 /*DT_DWORD*/))
      {
        AkelPad.MemCopy(lpPluginFunction + (_X64?812:800) /*offsetof(PLUGINFUNCTION, bAutoLoad)*/, false, 3 /*DT_DWORD*/);
        AkelPad.SendMessage(hMainWnd, 1336 /*AKD_DLLSAVE*/, 0x1 /*DLLSF_NOW*/, 0);
      }
    }
  }

  if (AkelPad.SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 153 /*MI_SINGLEOPENPROGRAM*/, 0))
  {
    AkelPad.Command(4256 /*IDM_OPTIONS_SINGLEOPEN_PROGRAM*/);
    hNewMainWnd=AkelPad.Command(4102 /*IDM_FILE_CREATENEW*/);
    AkelPad.Command(4256 /*IDM_OPTIONS_SINGLEOPEN_PROGRAM*/);
    AkelPad.SendMessage(hNewMainWnd, 273 /*WM_COMMAND*/, 4256 /*IDM_OPTIONS_SINGLEOPEN_PROGRAM*/, 0);
  }
  else hNewMainWnd=AkelPad.Command(4102 /*IDM_FILE_CREATENEW*/);

  //Turn on Sessions plugin autoload
  if (bNoSessions && bAutoLoad)
  {
    AkelPad.MemCopy(lpPluginFunction + (_X64?812:800) /*offsetof(PLUGINFUNCTION, bAutoLoad)*/, bAutoLoad, 3 /*DT_DWORD*/);
    AkelPad.SendMessage(hMainWnd, 1336 /*AKD_DLLSAVE*/, 0x1 /*DLLSF_NOW*/, 0);
  }
  return hNewMainWnd;
}
