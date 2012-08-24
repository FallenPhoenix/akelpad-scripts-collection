// http://akelpad.sourceforge.net/forum/viewtopic.php?p=18278#18278
// Version v1.2
//
//
//// Cycle switch between fonts.

//Options
var lpFontList=[["Courier New", 10],
                ["MS Sans Serif", 8],
                ["Arial", 10]];

//Variables
var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var lpLogFont;
var pFontName="";
var nFontSize=0;
var i;

if (lpLogFont=AkelPad.MemAlloc(92 /*sizeof(LOGFONTW)*/))
{
  AkelPad.SendMessage(hMainWnd, 1233 /*AKD_GETFONTW*/, hWndEdit, lpLogFont);
  pFontName=AkelPad.MemRead(lpLogFont + 28 /*offsetof(LOGFONTW, lfFaceName)*/, 1 /*DT_UNICODE*/);
  nFontSize=AkelPad.SendMessage(hWndEdit, 3188 /*AEM_GETCHARSIZE*/, 3 /*AECS_POINTSIZE*/, 0);
  AkelPad.MemFree(lpLogFont);
}

if (pFontName && nFontSize)
{
  for (i=0; i < lpFontList.length; ++i)
  {
    if (lpFontList[i][0] == pFontName && lpFontList[i][1] == nFontSize)
      break;
  }
  if (++i >= lpFontList.length) i=0;
  AkelPad.Font(lpFontList[i][0], 0, lpFontList[i][1]);
}
