// === [SetMargins.js] ===
// FeyFre (c) 2011
//
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=14026#14026
// Set both left and right margin value
// Arguments:
//         Margin value to set
//
// Example:
//   Call("Scripts::Main", 1, "SetMargins.js", "22")
//


// check arguments
if (!WScript.Arguments(0))
	WScript.Quit();
var mainwnd = AkelPad.GetMainWnd();
var WM_USER = 1024;
var AKD_GETEDITOPTION = WM_USER + 216;
var AKD_SETEDITOPTION = WM_USER + 217;
var EO_TEXTMARGINS = 1;
var margin = WScript.Arguments(0);
if(Number(margin) == NaN)
	WScript.Quit();
AkelPad.SendMessage(mainwnd, AKD_SETEDITOPTION, EO_TEXTMARGINS, 0x00010001*Number(margin));