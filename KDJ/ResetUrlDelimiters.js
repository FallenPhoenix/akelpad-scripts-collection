// ResetUrlDelimiters.js - 2011-12-15
//
// Reset URL delimiters.
//
// Call("Scripts::Main", 1, "ResetUrlDelimiters.js")      - reset left and right delimiters
// Call("Scripts::Main", 1, "ResetUrlDelimiters.js", "L") - reset left delimiters
// Call("Scripts::Main", 1, "ResetUrlDelimiters.js", "R") - reset right delimiters

var URL_DELIMITERS_SIZE = 128;

var hMainWnd = AkelPad.GetMainWnd();
var hEditWnd = AkelPad.GetEditWnd();
var lpBuffer;
var sAction;

if (WScript.Arguments.length)
{
  sAction = WScript.Arguments(0);
  if ((sAction != "L") && (sAction != "R"))
  {
    WScript.Echo("Incorrect script argument: " + sAction);
    WScript.Quit();
  }
}

if (hMainWnd && hEditWnd)
{
  lpBuffer = AkelPad.MemAlloc(URL_DELIMITERS_SIZE * _TSIZE);

  if ((! sAction) || (sAction == "L"))
  {
    AkelPad.SendMessage(hEditWnd, 3248 /*AEM_SETURLLEFTDELIMITERS*/, 0, 0);
    AkelPad.SendMessage(hEditWnd, 3247 /*AEM_GETURLLEFTDELIMITERS*/, URL_DELIMITERS_SIZE, lpBuffer);
    AkelPad.SetFrameInfo(0, 46 /*FIS_URLLEFTDELIMITERS*/, lpBuffer);
  }

  if ((! sAction) || (sAction == "R"))
  {
    AkelPad.SendMessage(hEditWnd, 3250 /*AEM_SETURLRIGHTDELIMITERS*/, 0, 0);
    AkelPad.SendMessage(hEditWnd, 3249 /*AEM_GETURLRIGHTDELIMITERS*/, URL_DELIMITERS_SIZE, lpBuffer);
    AkelPad.SetFrameInfo(0, 50 /*FIS_URLRIGHTDELIMITERS*/, lpBuffer);
  }

  AkelPad.MemFree(lpBuffer);
}
