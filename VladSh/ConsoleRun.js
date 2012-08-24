///Выполняет команду с помощью cmd (аналог WshShell.Run), с выводом результата выполнения в консоли Log-плагина
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1212#1212
// Version: 2.6 (2012.02.23)
// 
// -"ipconfig" Call("Scripts::Main", 1, "ConsoleRun.js", `"ipconfig"`)

var pCommand;

if (WScript.Arguments.length == 1)
	pCommand = WScript.Arguments(0);
else
{
	if (! AkelPad.Include("ShowMenuEx.js")) WScript.Quit();
	pCommand = getSelectedMenuItem(POS_CURSOR, "0", 0);
}

if (pCommand)
	AkelPad.Call("Log::Output", 1, pCommand, "", "", "", -1, -1);