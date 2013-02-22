///Downloading a file by URL using Download Master
///�������� URL �� ������� � Download Master; �������� �� ������������ ���� ������
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=13156#13156
// Version: 1.2 (2011.08.22)
// 
// -"�������� ��� ������ DM" Call("Scripts::Main", 1, "DownloadMaster.js", `-url="%u" -cmdline="hidden=1"`);		parameters of the comandLine see: http://www.westbyte.com/dm/help/tutorial_commandline.htm
// -"���������� ������� � DM..." Call("Scripts::Main", 1, "DownloadMaster.js", `-url="%u"`)
// -"���������� ������� � DM..." Call("Scripts::Main", 1, "DownloadMaster.js", `-url="%u" -dmpath="%ProgramFiles%\Download Master\dmaster.exe"`)

var WshShell = new ActiveXObject("WScript.Shell");

var url = AkelPad.GetArgValue("url", "");		//URL
if (!url)
	showErrorMessage('�������� (-url="%u") ����������� � ����������.', true);

var pProgram = AkelPad.GetArgValue("dmpath", "");		//���� � ���������; ������� ���� �� ����������

if (pProgram)
{
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	if (fso.FileExists(pProgram) == false)
		showErrorMessage("���������� Download Master �� �������!" + "\r" + "����: '" + pProgram + "'.", true);
}
else
{
	pProgram = RegRead("HKCR\\Applications\\dmaster.exe\\shell\\open\\command\\");		//������ �������� �� ���������
	if (!pProgram)
		showErrorMessage("���������� Download Master �� ���������������� � �������.", true);	
	pProgram = pProgram.replace('"%L"', "");
}

var commandLine = AkelPad.GetArgValue("cmdline", "");		//��������� ������
if (commandLine)
	commandLine = " " + commandLine;

WshShell.Exec(pProgram + " " + url + commandLine);


function showErrorMessage(pText, bQuit)
{
	AkelPad.MessageBox(AkelPad.GetEditWnd(), pText, WScript.ScriptName, 48);
	if (bQuit) WScript.Quit();
}

function RegRead(pPath)
{
	try
		{ return WshShell.RegRead(pPath) }
	catch(e)
		{ return null }
}