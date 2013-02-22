///Show area/window code navigation
///����������� �������/���� ��������� �� ����
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=15158#15158
// Version: 1.3 (2012.02.17)
// 
// -"������� ��������� �����" Call("Scripts::Main", 1, "CodeFoldSwitcher.js") Icon("%a\AkelFiles\Plugs\Coder.dll", 1)		-	��� ���������� ��������� � ������, �.�. ������ ��� ������� ����� ������� ���������� (
// -"���� ���������..." Call("Scripts::Main", 1, "CodeFoldSwitcher.js", `-ShowDock=1`) Icon("%a\AkelFiles\Plugs\Coder.dll", 3)		-	���������� ������� � �������, �������� ������ ������
// -"������� ��������� � �����" Call("Scripts::Main", 1, "CodeFoldSwitcher.js", `-ShowDock=1 -hideAll=1`) Icon("%a\AkelFiles\Plugs\Coder.dll", 3)		-	���������� ������� � ������� � �������� �� ���
// P.S. � ��� ����, ��� ������, �.�. ������������ Scripts-������, ������ �� ������������/����������...

if (! AkelPad.Include("Settings.js")) WScript.Quit();

var sParameterName = "ShowDock";

var nShowArg = AkelPad.GetArgValue(sParameterName, 0);		//������� ������: ��������� ��� ������
var nHideAll = AkelPad.GetArgValue("hideAll", 0);

var nSubDir = 4;
var sPluginFileName = "Coder";
var nType = 1 /*PO_DWORD*/;

var nShowDock = SettingsRead(nSubDir, sPluginFileName, sParameterName, nType) || 0;		//������� ������: ��� ������� � ����������

var cf = sPluginFileName + "::CodeFold";
if (AkelPad.IsPluginRunning(cf))
{
	if (nShowArg)
	{
		AkelPad.Call(cf, 1);
		if (nHideAll && nShowDock)		//�� ������� ���� ShowDock ���������, �� ���� �� ������ ��� �������, ������ ���� ��������
			AkelPad.Call(cf);	//��������� ����
	}
	else
	{
		if (nShowDock)
			AkelPad.Call(cf, 1);	//��������� ������
		AkelPad.Call(cf);	//��������� ����
	}
}
else
{
	if (!nShowArg && nShowDock)		//��� ������, ����� ���� �������� �������, �� � ini ������� ShowDock=1 (��� �������� ��� ��� ������� ����������� ������ ���� ����������� ����� � �������� �����)
		SettingsWrite(nSubDir, sPluginFileName, sParameterName, nType, 0);
	
	AkelPad.Call(cf);	//��������� ���� - ���������� ������� ��������� ����� � ��, ��� ������� � ShowDock � ini
	
	if (nShowArg && !nShowDock)		//��� ������, ����� ���� ����� ��������, � � ini ShowDock=0, ��� ����� �������� � "1" ������� � ������
		AkelPad.Call(cf, 1);
}