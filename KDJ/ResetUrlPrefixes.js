// ResetUrlPrefixes.js - 2011-12-15
//
// Reset URL prefixes.
//
// Call("Scripts::Main", 1, "ResetUrlPrefixes.js")

var URL_PREFIXES_SIZE = 128;

var hMainWnd  = AkelPad.GetMainWnd();
var hEditWnd  = AkelPad.GetEditWnd();
var sPrefixes = "";
var sPrefix1;
var lpBuffer;
var nOffset;

if (hMainWnd && hEditWnd)
{
  lpBuffer = AkelPad.MemAlloc(URL_PREFIXES_SIZE * _TSIZE);

  AkelPad.SendMessage(hEditWnd, 3252 /*AEM_SETURLPREFIXES*/, 0, 0);
  AkelPad.SendMessage(hEditWnd, 3251 /*AEM_GETURLPREFIXES*/, URL_PREFIXES_SIZE, lpBuffer);

  do
  {
    nOffset    = sPrefixes.length * _TSIZE;
    sPrefix1   = AkelPad.MemRead(lpBuffer + nOffset, _TSTR);
    sPrefixes += sPrefix1 + " ";
  }
  while (sPrefix1);
  sPrefixes = sPrefixes.replace(/ +$/, ""); //Rtrim

  AkelPad.MemCopy(lpBuffer, sPrefixes, _TSTR);
  AkelPad.SetFrameInfo(0, 41 /*FIS_URLPREFIXES*/, lpBuffer);

  AkelPad.MemFree(lpBuffer);
}
