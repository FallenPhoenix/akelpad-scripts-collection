///Выполняет команду с помощью cmd (аналог WshShell.Run), с выводом результата выполнения в консоли Log-плагина
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1212#1212
// Version: 2.8 (2012.12.18)
// 
// -"ipconfig" Call("Scripts::Main", 1, "ConsoleRun.js", `-cmd="ipconfig"`)

var pCommand = AkelPad.GetArgValue("cmd", "");
if (!pCommand) {
	if (!AkelPad.Include("ShowMenuEx.js")) WScript.Quit();
	pCommand = getSelectedMenuItem(POS_CURSOR, "", 0);
	if (!pCommand) WScript.Quit();
}

AkelPad.Call("Log::Output", 1, pCommand, "", "", "", -1, -1);