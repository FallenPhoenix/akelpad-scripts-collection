//! === [transparency.js] ===
//!   FeyFre (c) 2010
//!
//!   Sets transparency level of Akelpad main window(for Windows 2000/XP and newer)
//!   Arguments:
//!      * integer transparency level to set in range 0 till 255
//!      * "m" or "M" to set minimal and maximal alpha value
//!      * +value -value to change current transparency level
//!
//! Example:
//!      Fully visible
//!         Call("Scripts::Main", 1, "transparency.js", "m")
//!      Fully transparent(do not recommended to use unless you have assigned hotkey to reset transparency level)
//!         Call("Scripts::Main", 1, "transparency.js", "M")
//!      Semitransparent:
//!         Call("Scripts::Main", 1, "transparency.js", "127")
//!      Increase transparency
//!         Call("Scripts::Main", 1, "transparency.js", "+33")
//!      Decrease transparency
//!         Call("Scripts::Main", 1, "transparency.js", "-33")
//!
var ACTION_NONE = -1;
var ACTION_SET = 0
var ACTION_INC = 1;
//! Defaults
var action = ACTION_SET;
var data = 127;
var oSys = AkelPad.SystemFunction();
//! Parameters
if(WScript.Arguments.length > 0)
{
	var arg = WScript.Arguments(0);
	if(arg=='m')
	{
		action = ACTION_SET;
		data = 0;
	}
	else if(arg=='M')
	{
		action = ACTION_SET;
		data = 255;
	}
	else
	{
		action = ACTION_NONE;
		if(Number(arg) != NaN)
		{
			var ch = arg.charAt(0);
			data = Number(arg);
			if(ch =='+' || ch == '-')
			{
				action = ACTION_INC;
				//data = - data;
			}
			else
			{
				action = ACTION_SET;
			}
		}
	}
}

if(action != ACTION_NONE)
{
	var akel = AkelPad.GetMainWnd();
	//! We should add WS_EX_LAYERED extended style for windows in order to enable transparency
	var styleex = oSys.Call("user32::GetWindowLong"+_TCHAR,akel,-20/*GWL_EXSTYLE*/);
	styleex |= 0x00080000/*WS_EX_LAYERED*/;
	oSys.Call("user32::SetWindowLong"+_TCHAR,akel,-20/*GWL_EXSTYLE*/,styleex);
	do
	{
		if(action == ACTION_INC)
		{
			var mem = AkelPad.MemAlloc(1);
			var memfl = AkelPad.MemAlloc(4);
			AkelPad.MemCopy(memfl, 2, 3 /*DT_DWORD*/);
			AkelPad.MemCopy(mem, 0, 5 /*DT_BYTE*/);
			//! Get current transparency level if any
			if(oSys.Call("user32::GetLayeredWindowAttributes",akel,0,mem,memfl))
			{
				var fl = AkelPad.MemRead(memfl, 3 /*DT_DWORD*/);
				if(fl & 2)
				{
					//! Do increase
					data = 255-AkelPad.MemRead(mem, 5 /*DT_BYTE*/) + data;
				}
				else data = 0;
			}
			AkelPad.MemFree(memfl);
			AkelPad.MemFree(mem);
		}
		//! Range checks
		if(data < 0) data = 0;
		if(data > 255) data = 255
		//! Set transparency
		oSys.Call("user32::SetLayeredWindowAttributes",akel,0,255-data,2/*LWA_ALPHA*/);
	}
	while(0);
	//! Force to redraw window, since we have changed extended style
	oSys.Call("user32::SetWindowPos",akel,0,0,0,0,0,55/*SWP_NOSIZE|SWP_NOMOVE|SWP_ZORDER|SWP_NOACTIVATE|SWP_FRAMECHANGED*/);
}