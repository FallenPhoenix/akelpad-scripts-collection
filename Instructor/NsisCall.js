// http://akelpad.sourceforge.net/forum/viewtopic.php?p=9530#9530
// Version v1.1
//
//
//// Call NSIS plugin example.

var hMainWnd=AkelPad.GetMainWnd();
var oSys=AkelPad.SystemFunction();
var pMD5;

//NSIS
var NSIS_MAX_STRLEN=1024;
var nNsisUnicode=0 /*DT_ANSI*/;
var lpStack=0;

if (hMainWnd)
{
  //Get MD5 of file
  pushstring("c:\\_1.txt");
  nsiscall("md5dll::GetMD5File");
  pMD5=popstring();
  WScript.Echo(pMD5);
}


//Functions
function nsiscall(pFunction)
{
  var lppStack;

  if (lppStack=AkelPad.MemAlloc(4 /*DWORD*/))
  {
    AkelPad.MemCopy(lppStack, lpStack, 3 /*DT_DWORD*/);
    oSys.Call(pFunction, hMainWnd, NSIS_MAX_STRLEN, 0, lppStack);
    lpStack=AkelPad.MemRead(lppStack, 3 /*DT_DWORD*/);
    AkelPad.MemFree(lppStack);
  }
}

function pushstring(pString)
{
  var lpTop;

  if (lpTop=oSys.Call("kernel32::GlobalAlloc", 0x40 /*GPTR*/, (nNsisUnicode?NSIS_MAX_STRLEN * 2:NSIS_MAX_STRLEN) + 8 /*sizeof(stack_t)*/))
  {
    AkelPad.MemCopy(lpTop + 4 /*stack_t.text*/, pString.substr(0, NSIS_MAX_STRLEN), nNsisUnicode);
    AkelPad.MemCopy(lpTop + 0 /*stack_t.next*/, lpStack, 3 /*DT_DWORD*/);
    lpStack=lpTop;
  }
}

function popstring(pString)
{
  var lpTop;
  var pString="";

  if (lpStack)
  {
    lpTop=lpStack;
    pString=AkelPad.MemRead(lpTop + 4 /*stack_t.text*/, nNsisUnicode);
    lpStack=AkelPad.MemRead(lpTop + 0 /*stack_t.next*/, 3 /*DT_DWORD*/);
    oSys.Call("kernel32::GlobalFree", lpTop);
  }
  return pString;
}
