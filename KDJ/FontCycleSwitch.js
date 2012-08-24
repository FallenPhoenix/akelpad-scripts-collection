/***************************************************************************************
FontCycleSwitch.js - ver. 2012-06-17

Cycle switch between fonts. Extended version of FontSwitch.js by Instructor.

Call("Scripts::Main", 1, "FontCycleSwitch.js")
Call("Scripts::Main", 1, "FontCycleSwitch.js", '-AddCurFont=1 -Reverse=1 -Local=1')
Arguments:
  AddCurFont
    1 - add font from current edit window to the list (if not exists)
    0 - not add (default)
  Reverse
    1 - switch in reverse direction
    0 - switch with increasing index (default)
  Local
    1 - change font locally
    0 - change font globally (default)

The script saves settings in .ini file. To change the font list, you can edit this file.
Example of contents the configuration file:
nFont=0;
aFonts=[
["Courier New",3,11],
["MS Sans Serif",1,17],
["Tahoma",2,9],
["Lucida Console",3,12],
["Arial",4,15]
];
***************************************************************************************/

var bAddFont = AkelPad.GetArgValue("AddCurFont", 0);
var bReverse = AkelPad.GetArgValue("Reverse", 0);
var bLocal   = AkelPad.GetArgValue("Local", 0);
var oSys     = AkelPad.SystemFunction();
var sIniFile = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";
var oFSO     = new ActiveXObject("Scripting.FileSystemObject");
var hEditWnd = AkelPad.GetEditWnd(); 
var nFont    = 0;
var aFonts   = [];
var hFont;
var aCurFont;
var oError;
var sIniTxt;
var oFile;
var i;

if (hEditWnd)
{
  //read settings
  if (oFSO.FileExists(sIniFile))
  {
    try
    {
      eval(AkelPad.ReadFile(sIniFile));
    }
    catch (oError)
    {
    }
  }

  //check index
  if ((nFont < 0) || (! aFonts.length))
    nFont = 0;
  else if (nFont >= aFonts.length)
    nFont = aFonts.length - 1;

  //add current font
  if (bAddFont || (! aFonts.length))
  {
    hFont    = AkelPad.SendMessage(hEditWnd, 0x0031 /*WM_GETFONT*/, 0, 0);
    aCurFont = ConvertFontFormat(hFont, 2, 3);

    for (i = 0; i < aFonts.length; ++i)
    {
      if ((aFonts[i][0] == aCurFont[0]) && (aFonts[i][1] == aCurFont[1]) && (aFonts[i][2] == aCurFont[2]))
        break;
    }
    if (i == aFonts.length)
    {
      aFonts.splice(nFont, 0, aCurFont);
      if (! bReverse)
        ++nFont;
    }
  } 

  //next index
  if (bReverse)
  {
    if (--nFont < 0)
      nFont = aFonts.length - 1;
  }
  else
  {
    if (++nFont >= aFonts.length)
      nFont = 0;
  }

  //set font
  if (bLocal)
  {
    hFont = ConvertFontFormat(aFonts[nFont], 3, 2);
    AkelPad.SendMessage(hEditWnd, 0x0030 /*WM_SETFONT*/, hFont, 1);
    oSys.Call("Gdi32::DeleteObjectW", hFont);
  }
  else
    AkelPad.Font(aFonts[nFont][0], aFonts[nFont][1], aFonts[nFont][2]);

  //save settings
  sIniTxt = 'nFont='+ nFont + ';\r\naFonts=[\r\n';

  for (i = 0; i < aFonts.length; ++i)
    sIniTxt += '["' + aFonts[i][0] + '",' + aFonts[i][1] + ',' + aFonts[i][2] + '],\r\n';
  
  if (sIniTxt.slice(-3, -2) == ",")
    sIniTxt = sIniTxt.slice(0, -3);
  
  sIniTxt += '\r\n];';

  oFile = oFSO.OpenTextFile(sIniFile, 2, true, 0);
  oFile.Write(sIniTxt);
  oFile.Close();
}

function ConvertFontFormat(vFont, nInType, nRetType)
{
  //nInType, nRetType:
  //1 - pointer to LOGFONT structure
  //2 - handle to font
  //3 - array [sFontName, nFontStyle, nFontSize]

  if (nInType == nRetType)
    return vFont;

  var nLFSize  = 28 + 32 * 2; //sizeof(LOGFONTW)
  var lpLF     = AkelPad.MemAlloc(nLFSize);
  var hFont;
  var hDC;
  var nHeight;
  var nWeight;
  var bItalic;
  var vRetVal;
  var i;

  if (nInType == 1)
  {
    for (i = 0; i < nLFSize; ++i)
      AkelPad.MemCopy(lpLF + i, AkelPad.MemRead(vFont + i,  5 /*DT_BYTE*/, 5 /*DT_BYTE*/));
  }
  else if (nInType == 2)
  {
    if (! vFont)
      vFont = oSys.Call("Gdi32::GetStockObject", 13 /*SYSTEM_FONT*/);

    oSys.Call("Gdi32::GetObjectW", vFont, nLFSize, lpLF);
  }
  else if (nInType == 3)
  {
    hDC     = oSys.Call("User32::GetDC", hEditWnd);
    nHeight = -oSys.Call("Kernel32::MulDiv", vFont[2], oSys.Call("Gdi32::GetDeviceCaps", hDC, 90 /*LOGPIXELSY*/), 72);
    oSys.Call("User32::ReleaseDC", hEditWnd, hDC);

    nWeight = 400;
    bItalic = 0;
    if ((vFont[1] == 2) || (vFont[1] == 4))
      nWeight = 700;
    if (vFont[1] > 2)
      bItalic = 1;

    AkelPad.MemCopy(lpLF     , nHeight, 3 /*DT_DWORD*/); //lfHeight
    AkelPad.MemCopy(lpLF + 16, nWeight, 3 /*DT_DWORD*/); //lfWeight
    AkelPad.MemCopy(lpLF + 20, bItalic, 5 /*DT_BYTE*/);  //lfItalic
    AkelPad.MemCopy(lpLF + 28, vFont[0], 1 /*DT_UNICODE*/); //lfFaceName
  }

  if (nRetType == 1)
    vRetVal = lpLF;
  else if (nRetType == 2)
  {
    vRetVal = oSys.Call("Gdi32::CreateFontIndirectW", lpLF);
    AkelPad.MemFree(lpLF);
  }
  else if (nRetType == 3)
  {
    vRetVal    = [];
    vRetVal[0] = AkelPad.MemRead(lpLF + 28, 1 /*DT_UNICODE*/); //lfFaceName

    nWeight = AkelPad.MemRead(lpLF + 16, 3 /*DT_DWORD*/); //lfWeight
    bItalic = AkelPad.MemRead(lpLF + 20, 5 /*DT_BYTE*/);  //lfItalic

    if (nWeight < 600)
      vRetVal[1] = 1;
    else
      vRetVal[1] = 2;

    if (bItalic)
      vRetVal[1] += 2;

    hDC        = oSys.Call("User32::GetDC", hEditWnd);
    nHeight    = AkelPad.MemRead(lpLF, 3 /*DT_DWORD*/); //lfHeight
    vRetVal[2] = -oSys.Call("Kernel32::MulDiv", nHeight, 72, oSys.Call("Gdi32::GetDeviceCaps", hDC, 90 /*LOGPIXELSY*/));
    oSys.Call("User32::ReleaseDC", hEditWnd, hDC); 
    AkelPad.MemFree(lpLF);
  }

  return vRetVal;
}
