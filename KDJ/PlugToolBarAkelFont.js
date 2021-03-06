// PlugToolBarAkelFont.js - ver. 2012-04-12
//
// Change the font in ToolBar plugin window, that is set in AkelPad or modified
//
// Required to include: EnumerateWindows_functions.js
// Call("Scripts::Main", 1, "PlugToolBarAkelFont.js") - set font from AkelPad
// or
// Call("Scripts::Main", 1, "PlugToolBarAkelFont.js", 'pFont nStyle nSize') - set modified font
// Arguments (as in AkelPad.Font() method):
//  pFont
//    Font face, for example, "Courier". Unchanged, if "".
//  nStyle
//    0 ignored.
//    1 normal.
//    2 bold.
//    3 italic.
//    4 bold italic.
//  nSize
//    Font size in pixels. Unchanged, if 0.
// Example:
// Call("Scripts::Main", 1, "PlugToolBarAkelFont.js", '"Lucida Console" 3 14')
//
// You must first open ToolBar plugin dialog box, and then run the script.
// Because there is no way to call ToolBar dialog box from the script.

if (! AkelPad.Include("EnumerateWindows_functions.js"))
  WScript.Quit();

var oSys     = AkelPad.SystemFunction();
var hMainWnd = AkelPad.GetMainWnd();
var hPlugWnd;
var hCtrlWnd;
var lpLOGFONT;
var sFontName;
var nFontStyle;
var nFontSize;
var hDC;
var nDevCap;
var nHeight;
var nWeight;
var bItalic;
var hFont;

if ((hPlugWnd = GetPluginWnd()) &&
    (hCtrlWnd = oSys.Call("user32::FindWindowEx" + _TCHAR, hPlugWnd, 0, "RichEdit20" + _TCHAR, 0)))
{
  lpLOGFONT = AkelPad.MemAlloc(28 + 32 * _TSIZE); //sizeof(LOGFONT)
  AkelPad.SendMessage(hMainWnd, 1231 /*AKD_GETFONT*/, 0, lpLOGFONT);

  if (WScript.Arguments.length >= 1)
  {
    if (sFontName = WScript.Arguments(0))
      AkelPad.MemCopy(lpLOGFONT + 28, sFontName, _TSTR); //lfFaceName
  }

  if ((WScript.Arguments.length >= 2) && isFinite(WScript.Arguments(1)))
  {
    nFontStyle = Number(WScript.Arguments(1));
    if ((nFontStyle > 0) && (nFontStyle < 5))
    {
      nWeight = 400;
      bItalic = 0;
      if (nFontStyle == 2)
        nWeight = 700;
      else if (nFontStyle == 3)
        bItalic = 1;
      else if (nFontStyle == 4)
      {
        nWeight = 700;
        bItalic = 1;
      }
      AkelPad.MemCopy(lpLOGFONT + 16, nWeight, 3 /*DT_DWORD*/); //lfWeight
      AkelPad.MemCopy(lpLOGFONT + 20, bItalic, 5 /*DT_BYTE*/);  //lfItalic
    }
  }

  if ((WScript.Arguments.length >= 3) && isFinite(WScript.Arguments(2)))
  {
    nFontSize = Number(WScript.Arguments(2));
    if (nFontSize > 0)
    {
      hDC     = oSys.Call("user32::GetDC", hCtrlWnd);
      nDevCap = oSys.Call("gdi32::GetDeviceCaps" , hDC, 90 /*LOGPIXELSY*/);
      nHeight = -oSys.Call("kernel32::MulDiv", nFontSize, nDevCap, 72);
      oSys.Call("user32::ReleaseDC", hCtrlWnd, hDC);
      AkelPad.MemCopy(lpLOGFONT, nHeight, 3 /*DT_DWORD*/); //lfHeight
    }
  }

  hFont = oSys.Call("gdi32::CreateFontIndirect" + _TCHAR, lpLOGFONT);
  AkelPad.MemFree(lpLOGFONT);

  AkelPad.SendMessage(hCtrlWnd, 48 /*WM_SETFONT*/, hFont, true);

  oSys.Call("user32::SetForegroundWindow", hPlugWnd);
}
else
  WScript.Echo("There is no open dialog box of ToolBar plugin");

function GetPluginWnd()
{
  var hPlugWnd = 0;
  var sEndName;
  var aWndList;
  var oRE;
  var i;

  if (AkelPad.GetLangId(1 /*LANGID_PRIMARY*/) == 0x19 /*LANG_RUSSIAN*/)
    sEndName = "плагин";
  else
    sEndName = "plugin";

  oRE = new RegExp("ToolBar.*" + sEndName);

  aWndList = EnumTopLevelWindows(1, 1, 2, 2, 1, 2, 0);

  for (i = 0; i < aWndList.length; ++i)
  {
    if (oRE.test(aWndList[i].Title))
    {
      hPlugWnd = aWndList[i].Handle;
      break;
    }
  }

  return hPlugWnd;
}
