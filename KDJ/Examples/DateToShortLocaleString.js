// DateToShortLocaleString(dDate) function returns a short local date - 2010-12-02
//
// Here is an example of use:

var dToday     = new Date();
var pLongDate  = dToday.toLocaleString();
var pShortDate = DateToShortLocaleString(dToday);

WScript.Echo("Long date:  " + pLongDate + "\n" + "Short date: " + pShortDate);

////////
function DateToShortLocaleString(dDate)
{
  var DT_WORD   = 4;
  var oSys      = AkelPad.SystemFunction();
  var lpSysTime = AkelPad.MemAlloc(16 /*sizeof(SYSTEMTIME)*/);
  var lpString  = AkelPad.MemAlloc(256 * _TSIZE);
  var pDateTime;

  AkelPad.MemCopy(lpSysTime,     dDate.getFullYear(),     DT_WORD);
  AkelPad.MemCopy(lpSysTime + 2, dDate.getMonth() + 1,    DT_WORD);
  AkelPad.MemCopy(lpSysTime + 4, dDate.getDay(),          DT_WORD);
  AkelPad.MemCopy(lpSysTime + 6, dDate.getDate(),         DT_WORD);
  AkelPad.MemCopy(lpSysTime + 8, dDate.getHours(),        DT_WORD);
  AkelPad.MemCopy(lpSysTime +10, dDate.getMinutes(),      DT_WORD);
  AkelPad.MemCopy(lpSysTime +12, dDate.getSeconds(),      DT_WORD);
  AkelPad.MemCopy(lpSysTime +14, dDate.getMilliseconds(), DT_WORD);

  oSys.Call("kernel32::GetDateFormat" + _TCHAR,
            0x400, //LOCALE_USER_DEFAULT
            0x1,   //DATE_SHORTDATE
            lpSysTime,
            0,
            lpString,
            256);
  pDateTime = AkelPad.MemRead(lpString, _TSTR) + " ";

  oSys.Call("kernel32::GetTimeFormat" + _TCHAR,
            0x400, //LOCALE_USER_DEFAULT
            0x8,   //TIME_FORCE24HOURFORMAT
            lpSysTime,
            0,
            lpString,
            256);
  pDateTime += AkelPad.MemRead(lpString, _TSTR);

  AkelPad.MemFree(lpSysTime);
  AkelPad.MemFree(lpString);

  return pDateTime;
}
