///��������� ������� � ������� cmd (������ WshShell.Run), � ������� ���������� ���������� � ������� Log-�������
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1212#1212
// Version: 2.7 (2012.09.12)
// 
// -"ipconfig" Call("Scripts::Main", 1, "ConsoleRun.js", `-cmd="ipconfig"`)

var pCommand = AkelPad.GetArgValue("cmd", "");
if (!pCommand) {
	if (! AkelPad.Include("ShowMenuEx.js")) WScript.Quit();
	pCommand = getSelectedMenuItem(POS_CURSOR, "0", 0);
	if (!pCommand) WScript.Quit();
}

AkelPad.Call("Log::Output", 1, pCommand, "", "", "", -1, -1);