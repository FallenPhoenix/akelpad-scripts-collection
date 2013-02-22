///��������� ������� ������� WshShell.Exec; ������������ ��� ������� ��������� ����������, ������ ������� "����" -> "���������"
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1212#1212
// Version: 2.11 (2012.12.18)
// 
// ���������:
// 	cmd - ��� �������; ���� �������, �� ���� ���������� �� �����, � ���������� ��������� �������;
// 	sep - ����������� ��� ������� ��������������� � �������� � param-����� (��������� ��. �������� pParsepProcSep � ShowMenuEx.js)
// 
// �������:
// 	-"�����������" Call("Scripts::Main", 1, "ConsoleExec.js", `-cmd="calc"`)
// 	-"����� ��������� ��� �������..." Call("Scripts::Main", 1, "ConsoleExec.js", `-sep="=" -ignore1menu=1`)	- ������ ������� ������������� ������ ����, ���� � param-����� ���� ������

var pCommand = AkelPad.GetArgValue("cmd", "");
if (!pCommand) {
	if (!AkelPad.Include("ShowMenuEx.js")) WScript.Quit();
	pCommand = getSelectedMenuItem(POS_CURSOR, AkelPad.GetArgValue("sep", ""), 0);
	if (!pCommand) WScript.Quit();
}

var WshShell = new ActiveXObject("WScript.Shell");
try {
	WshShell.Exec(pCommand);
}
catch (e) {
	var errInfo = e.name + ": " + e.description + "Command: " + pCommand;
	if (AkelPad.Call("Log::Output",5, errInfo, -1,1) == -1)
		AkelPad.MessageBox(AkelPad.GetEditWnd(), errInfo, WScript.ScriptName, 48 /*MB_EXCLAMATION*/);
}