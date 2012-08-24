///¬ыполн€ет команду методом WshShell.Exec; используетс€ дл€ запуска некоторых приложений, аналог команды "ѕуск" -> "¬ыполнить"
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1212#1212
// Version: 2.7 (2011.06.21)
// 
// -"Calculator" Call("Scripts::Main", 1, "ConsoleExec.js", `"calc"`)	- пример задани€ игнорировани€ вывода меню, если в param-файле одна запись

var pCommand;

if (WScript.Arguments.length == 1)
	pCommand = WScript.Arguments(0);
else
{
	if (! AkelPad.Include("ShowMenuEx.js")) WScript.Quit();
	pCommand = getSelectedMenuItem(POS_CURSOR, "", 0);
}

if (pCommand)
{
	var WshShell = new ActiveXObject("WScript.Shell");
	var oExec = WshShell.Exec(pCommand);
}