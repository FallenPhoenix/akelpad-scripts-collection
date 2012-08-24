///Open URL or Site
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=4548#4548
// Version: 2.1 (2011.04.06)
// 
// Arguments:	`"%u" "SiteFind" "Program"`
//					- SiteFind = 0		-	opened URL
//					- SiteFind = 1		-	opened Site

if (WScript.Arguments.length == 0) WScript.Quit();

var URL = WScript.Arguments(0);
//default values for this script:
var SiteOpen = 1;
var Program = 'rundll32.exe shell32, ShellExec_RunDLL';

if (WScript.Arguments.length > 1)
{
	SiteOpen = WScript.Arguments(1);
	if (WScript.Arguments.length == 3)
		Program = WScript.Arguments(2);
}

if (SiteOpen == "1")
{
	//определяем адрес сайта
	URL = URL.slice(0, URL.indexOf('/', URL.indexOf(':/', 0) + 3));
}

var WshShell = new ActiveXObject("WScript.Shell");
WshShell.Exec(Program + ' "' + URL + '"');
