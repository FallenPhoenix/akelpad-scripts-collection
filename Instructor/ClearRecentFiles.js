// http://akelpad.sourceforge.net/forum/viewtopic.php?p=10810#10810
// Version: 1.0
//
//// Clear recent files list.
//
// Arguments:
// -Msg=false  -Clear recent files list without prompt (default is true).
//
// Usage:
// -"Clear list" Call("Scripts::Main", 1, "ClearRecentFiles.js", `-Msg=false`)

var hWndMain=AkelPad.GetMainWnd();

if (AkelPad.GetArgValue("Msg", true))
{
  if (AkelPad.MessageBox(hWndMain, GetLangString(0), WScript.ScriptName, 0x24 /*MB_ICONQUESTION|MB_YESNO*/) == 7 /*IDNO*/)
    WScript.Quit();
}
AkelPad.SendMessage(hWndMain, 1238 /*AKD_RECENTFILES*/, 5 /*RF_CLEAR*/, 0);
AkelPad.SendMessage(hWndMain, 1238 /*AKD_RECENTFILES*/, 4 /*RF_SAVE*/, 0);


function GetLangString(nStringID)
{
  var nLangID=AkelPad.GetLangId(1 /*LANGID_PRIMARY*/);

  if (nLangID == 0x19) //LANG_RUSSIAN
  {
    if (nStringID == 0)
      return "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C\u0020\u0441\u043F\u0438\u0441\u043E\u043A\u0020\u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0445\u0020\u0444\u0430\u0439\u043B\u043E\u0432\u003F";
  }
  else
  {
    if (nStringID == 0)
      return "Clear recent files list?";
  }
  return "";
}
