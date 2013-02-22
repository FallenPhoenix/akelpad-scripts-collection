///Opens the selected branch in the registry editor
///��������� ���������� ����� � ��������� �������
// ���� ��������� ������� ����� �� ���������, ������ � �� ����������
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=11092#11092
// Version: 1.4 (2011.01.21) - 1.9 (2012.04.03) by VladSh
// Version: 1.3 by mozers� (SciTE)
//
// �������� ������ ����:
//		HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control
//		[HKLM\SYSTEM\CurrentControlSet\Control]	/������� [] ����������/
//		HKLM\\SYSTEM\\CurrentControlSet\\Control
//	������������ ���������� ������:	Ctrl+Alt+J

var key = AkelPad.GetSelText();
if (!key)
{		//���� ����� �� �������, �� ����� �������� �������� "������" �� ������� ������
	var hWndEdit = AkelPad.GetEditWnd();
	var nPosCurrent = AkelPad.GetSelStart();		//������� ������� � �����
	
	var oLine = getLine(nPosCurrent);
	var nIndexCurrent = nPosCurrent - oLine.start + 1;		//������� ������� � ������
	
	key = getKey(oLine.text, nIndexCurrent)		//��������������� ����� �����, ������������ �� ������� �������
	if (!key)
		key = getKey(oLine.text, -1);		//��������������� ����� ����� - �� ���� ������
}
else
{
	key = getKey(key, -1);		//��������������� ����� ����� - �� ����������� ������
	if (!key) WScript.Quit();
}
//���������, ���� �� ���-�� ������� �� ����� �������
var posStart = key.indexOf("HK");
if (posStart == -1) WScript.Quit();
key = key.substr(posStart);

var pSlash = "\\";
var procRegEdit = "regedit.exe";
var WshShell = new ActiveXObject("WScript.Shell");

var LastKeyPath = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Applets\\Regedit\\";
var LastKeyName = LastKeyPath + "Lastkey";		//�������� �������� �� ����, �.�. � ������� Run ��������� �������������� ������ ��� ��������
key = key.replace(/^HKLM\\/, "HKEY_LOCAL_MACHINE\\");
key = key.replace(/^HKCR\\/, "HKEY_CLASSES_ROOT\\");
key = key.replace(/^HKCU\\/, "HKEY_CURRENT_USER\\");
key = key.replace(/\\\\/g, pSlash);
key = key.replace(/\[/g, "");		//�������� [] (��� ������ �� *.reg-�����)
key = key.replace(/\]/g, "");
key = WshShell.RegRead(LastKeyName).match(/^[^\\]+/) + pSlash + key;

if (key.lastIndexOf(pSlash) == key.length - pSlash.length)
	key = key.substr(0, key.length - pSlash.length);		//�������� ��������� ����, ���� �� ����, �.�. � ��� �� ���������� ��������� �����

TaskKill(procRegEdit);		//��� "����������", �.�. ����� �������� �� ������ ����� �� ������������

WshShell.RegWrite(LastKeyName, key, "REG_SZ");
WshShell.Run(procRegEdit, 1, false);


function getLine(nPos)
{
	var line = AkelPad.SendMessage(hWndEdit, 1078 /*EM_EXLINEFROMCHAR*/, 0, nPos);
	var index = AkelPad.SendMessage(hWndEdit, 187 /*EM_LINEINDEX*/, line, 0);
	var len = AkelPad.SendMessage(hWndEdit, 193 /*EM_LINELENGTH*/, index, 0);
	var text = AkelPad.GetTextRange(index, index + len);
	
	return {
		text: text,
		start: index,
		len: len
	};
}

///����� ����� �� ��������, ����� ���� ��� ���������� ������, �.�. �������� ����� ������� ���������, ��� �������������
function getKey(pText, nIndex)
{
	var key = getBlock(pText, nIndex, '[', ']');		//���� ������ []
	if (!key)
	{
		key = getBlock(pText, nIndex, '"', '"');		//����� ���� ������ ""
		if (!key)
			key = getBlock(pText, nIndex, "'", "'");		//����� ���� ������ ''
			if (!key)
				key = pText;		//���� ��� ���������� ������
	}
	return key;
}

function getBlock(pText, nPos, pTextStart, pTextEnd)		//���� � nPos �������� -1, �� ������ �� ���� ������
{
	var pBlock = "";
	var nLbound;
	var nUbound;
	if (nPos != -1)
	{
		nLbound = nPos;
		nUbound = nPos;
	}
	else
	{
		nLbound = pTextStart.length + 1;
		nUbound = pText.length - pTextEnd.length - 1;
	}
	
	var posTextStart = pText.lastIndexOf(pTextStart, nUbound);					//���� �����
	if (posTextStart != -1)
	{
		var posTextEnd = pText.indexOf(pTextEnd, nLbound);							//���� ����
		if (posTextEnd != -1)
		{
			posTextStart += 1;
			if (posTextStart < posTextEnd)
				pBlock = pText.substring(posTextStart, posTextEnd);
			else
				pBlock = pText.substring(posTextEnd + pTextStart.length, posTextStart - pTextEnd.length);
		}
	}
	return pBlock;
}

function TaskKill(process_name)
{
	var objWMIService = GetObject("winmgmts:\\\\.\\root\\CIMV2");
	var colProcessList = objWMIService.ExecQuery ('SELECT * FROM Win32_Process WHERE NAME = "' + process_name + '"');
	var enumItems = new Enumerator(colProcessList);
	for (; !enumItems.atEnd(); enumItems.moveNext())
		enumItems.item().Terminate();
}