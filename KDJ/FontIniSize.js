// Set initial font size from AkelPad.ini or registry - 2010-10-26
//
// Call("Scripts::Main", 1, "FontIniSize.js")
//
// Can assign shortcut key, eg: Ctrl+Num/ or Ctrl+Num*

var hEditWnd = AkelPad.GetEditWnd();
var oSys     = AkelPad.SystemFunction();
var pIniFile = AkelPad.GetAkelDir() + "\\AkelPad.ini";

var pTxtIni     = "";
var pTxtSaveSet = "";
var pTxtFont    = "";
var pTxt        = "";
var lfHeight;
var hDC;
var nDevCap;
var nFontSize;
var i;

if (! hEditWnd)
  WScript.Quit();

pTxtIni     = AkelPad.ReadFile(pIniFile);
pTxtSaveSet = pTxtIni.substr(pTxtIni.indexOf("SaveSettings=") + 13, 1);

//settings in .ini file
if (pTxtSaveSet == "2")
{
  pTxtFont = pTxtIni.substr(pTxtIni.indexOf("Font=") + 5, 8);
  for (i = 6; i >= 0; i -= 2)
    pTxt += pTxtFont.substr(i, 2);

  lfHeight = Number("0x" + pTxt);
}
//settings in registry
else
{
  lfHeight = ReadRegistry();
}

hDC       = oSys.Call("user32::GetDC", hEditWnd);
nDevCap   = oSys.Call("gdi32::GetDeviceCaps" , hDC, 90 /*LOGPIXELSY*/);
nFontSize = -oSys.Call("kernel32::MulDiv", lfHeight, 72, nDevCap);
oSys.Call("user32::ReleaseDC", hEditWnd, hDC); 

if (nFontSize > 0)
  AkelPad.Font("", 0, nFontSize);

//////////////////
function ReadRegistry()
{
  var DT_DWORD          = 3;
  var HKEY_CURRENT_USER = 0x80000001;
  var KEY_QUERY_VALUE   = 0x0001;
  var REG_BINARY        = 3;
  var ERROR_SUCCES      = 0;
  var ERROR_MORE_DATA   = 234;

  var lpSubKey   = MakeString("SOFTWARE\\Akelsoft\\AkelPad\\Options");
  var lpValue    = MakeString("Font");
  var lpKey      = AkelPad.MemAlloc(4);
  var lpType     = AkelPad.MemAlloc(4);
  var lpData     = AkelPad.MemAlloc(28);
  var lpDataSize = AkelPad.MemAlloc(4);
  var lfHeight   = 0;
  var hKey;
  var nError;

  nError = oSys.Call("advapi32::RegOpenKeyEx" + _TCHAR,
             HKEY_CURRENT_USER, // Parent key
             lpSubKey,          // Subkey
             0,                 // Reserved. must be 0
             KEY_QUERY_VALUE,   // Desired access
             lpKey);            // Result key

  if(nError == ERROR_SUCCES)
  {
    hKey = AkelPad.MemRead(lpKey, DT_DWORD);
    AkelPad.MemCopy(lpType, REG_BINARY, DT_DWORD);
    AkelPad.MemCopy(lpDataSize, 28, DT_DWORD);

    nError = oSys.Call("advapi32::RegQueryValueEx" + _TCHAR,
               hKey,        // Parent key
               lpValue,     // Value name
               0,           // Must be NULL
               lpType,      // Value type receiver: will be REG_BINARY
               lpData,      // Buffer with data
               lpDataSize); // Buffer size
    if ((nError == ERROR_SUCCES || nError == ERROR_MORE_DATA) &&
        (AkelPad.MemRead(lpType, DT_DWORD) == REG_BINARY)     && //! Must be binary
        (AkelPad.MemRead(lpDataSize, DT_DWORD) >= 4)             //! Must be at least 4 bytes
       )
    {
      lfHeight = AkelPad.MemRead(lpData, DT_DWORD);
    }

    oSys.Call("advapi32::RegCloseKey", hKey);
  }

  AkelPad.MemFree(lpDataSize);
  AkelPad.MemFree(lpData);
  AkelPad.MemFree(lpType);
  AkelPad.MemFree(lpKey);
  AkelPad.MemFree(lpValue);
  AkelPad.MemFree(lpSubKey);
  return lfHeight;
}

function MakeString(pStr)
{
  var lpBuffer = AkelPad.MemAlloc((pStr.length + 1) * _TSIZE);
  AkelPad.MemCopy(lpBuffer, pStr, _TSTR);
  return lpBuffer;
}
