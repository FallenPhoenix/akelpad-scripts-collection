// FontIniRestore.js - 2011-09-22
//
// Restores initial settings of font face, style and size from AkelPad.ini or registry.
//
// Call("Scripts::Main", 1, "FontIniRestore.js")
// Can assign shortcut key, eg. Ctrl+Num*

var lpLOGFONT = AkelPad.MemAlloc(28 + 32 * _TSIZE); //sizeof(LOGFONT);
var hMainWnd  = AkelPad.GetMainWnd();
var oFSO      = new ActiveXObject("Scripting.FileSystemObject");
var bSetInReg = true;
var sIniName  = AkelPad.GetAkelDir(0 /*ADTYPE_ROOT*/) + "\\AkelPad.ini";
var sIniText;
var oShell;
var oRE;
var aFontVal;
var sFontVal;
var sFaceVal;
var oError;
var i;

if (oFSO.FileExists(sIniName))
{
  sIniText = AkelPad.ReadFile(sIniName);

  if (sIniText.substr(sIniText.indexOf("SaveSettings=") + 13, 1) == "2")
    bSetInReg = false;
}

//Settings in registry
if (bSetInReg)
{
  oShell = new ActiveXObject("WScript.shell");
  try
  {
    aFontVal = oShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Options\\Font").toArray();
    sFaceVal = oShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Options\\FontFace");

    if (aFontVal.length && sFaceVal.length)
    {
      for (i = 0; i < aFontVal.length; ++i)
        AkelPad.MemCopy(lpLOGFONT + i, aFontVal[i], 5 /*DT_BYTE*/);

      AkelPad.MemCopy(lpLOGFONT + 28, sFaceVal, _TSTR);
      AkelPad.SendMessage(hMainWnd, 1234 /*AKD_SETFONT*/, 0, lpLOGFONT);
    }
  }
  catch (oError)
  {
  }
}

//Settings in .ini file
else
{
  oRE = new RegExp("Font=([\\dA-F]*)");
  if (oRE.test(sIniText))
    sFontVal = RegExp.$1;

  oRE = new RegExp("FontFace=([^\r\n]*)");
  if (oRE.test(sIniText))
    sFaceVal = RegExp.$1;

  if (sFontVal.length && sFaceVal.length)
  {
    for (i = 0; i < sFontVal.length; i += 2)
      AkelPad.MemCopy(lpLOGFONT + i / 2, parseInt(sFontVal.substr(i, 2), 16), 5 /*DT_BYTE*/);

    AkelPad.MemCopy(lpLOGFONT + 28, sFaceVal, _TSTR);
    AkelPad.SendMessage(hMainWnd, 1234 /*AKD_SETFONT*/, 0, lpLOGFONT);
  }
}

AkelPad.MemFree(lpLOGFONT);
