///Script "library" for working with time and date; return it in specified format. Must be placed in ...\Scripts\Include\
///Скрипт-"библиотека" для работы с датами; возвращает дату/время в определённом формате. Должен находиться в директории ...\Scripts\Include\
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1211#1211
// Version: 2.1 (2011.07.20)
// 
// Time:
// h			Hours with no leading zero for single-digit hours; 12-hour clock.
// hh			Hours with leading zero for single-digit hours; 12-hour clock.
// H			Hours with no leading zero for single-digit hours; 24-hour clock.
// HH			Hours with leading zero for single-digit hours; 24-hour clock.
// m			Minutes with no leading zero for single-digit minutes.
// mm		Minutes with leading zero for single-digit minutes.
// s			Seconds with no leading zero for single-digit seconds.
// ss			Seconds with leading zero for single-digit seconds.
// t			One character time-marker string, such as A or P.
// tt			Multicharacter time-marker string, such as AM or PM.
//
// Date:
// d			Day of month as digits with no leading zero for single-digit days.
// dd			Day of month as digits with leading zero for single-digit days.
// ddd		Day of week as a three-letter abbreviation.
// dddd		Day of week as its full name.
// M			Month as digits with no leading zero for single-digit months.
// MM		Month as digits with leading zero for single-digit months.
// MMM		Month as a three-letter abbreviation.
// MMMM	Month as its full name.
// y			Year as last two digits, but with no leading zero for years less than 10.
// yy			Year as last two digits, but with leading zero for years less than 10.
// yyyy		Year represented by full four digits.
//
// Example:
// "H:mm:ss dd MMMM yyyy" -> "12:50:24 07 January 2008"


function DateFormat(pFormat)
{
	if (AkelPad.GetMainWnd())
	{
		if (!pFormat)
			pFormat = AkelPad.GetArgLine() || "dd.MM.yyyy HH:mm";		//default value
			
		return TimeFormat(pFormat);
	}
}


function TimeFormat(pFormat)
{
	var _TCHAR;
	var _TSTR;
	var _TSIZE;

	if (AkelPad.IsOldWindows())
	{
		_TCHAR = "A";
		_TSTR = 0		/*DT_ANSI*/;
		_TSIZE = 1	/*sizeof(char)*/;
	}
	else
	{
		_TCHAR = "W";
		_TSTR = 1		/*DT_UNICODE*/;
		_TSIZE = 2	/*sizeof(wchar_t)*/;
	}

	var lpFormatBuffer;
	var lpTimeBuffer;
	var pTime = "";

	if (lpFormatBuffer = AkelPad.MemAlloc(256 * _TSIZE))
	{
		AkelPad.MemCopy(lpFormatBuffer, pFormat.substr(0, 255), _TSTR);

		if (lpTimeBuffer = AkelPad.MemAlloc(256 * _TSIZE))
		{
			var oSys = AkelPad.SystemFunction();
			
			oSys.AddParameter(1024);	//LOCALE_USER_DEFAULT
			oSys.AddParameter(0);
			oSys.AddParameter(0);
			oSys.AddParameter(lpFormatBuffer);
			oSys.AddParameter(lpTimeBuffer);
			oSys.AddParameter(256);
			oSys.Call("kernel32::GetTimeFormat" + _TCHAR);

			oSys.AddParameter(1024);	//LOCALE_USER_DEFAULT
			oSys.AddParameter(0);
			oSys.AddParameter(0);
			oSys.AddParameter(lpTimeBuffer);
			oSys.AddParameter(lpFormatBuffer);
			oSys.AddParameter(256);
			oSys.Call("kernel32::GetDateFormat" + _TCHAR);

			pTime = AkelPad.MemRead(lpFormatBuffer, _TSTR);

			AkelPad.MemFree(lpTimeBuffer);
		}
		AkelPad.MemFree(lpFormatBuffer);
	}
	return pTime;
}
