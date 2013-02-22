///Open by Linked, Selected or Clipboard text: file (supported the opening of scripts from AkalPad directory), folder; url, ets...
///������������ ��� �������� �����������:
// 	� ������ � �������� (�� ������������ ���� ������)
// 	� ������ (���� ����� ��������) � AkelPad'� (�������� ��� ��������� ������ ���� �� ����������� ������; �������������� �������� �������� �� ..\Scripts\Include\
// 	� ����� (� Windoes Explorer'�), � �.�. �������
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=5598#5598
// Version: 2.2 (2011.07.21)
// 
// � ���� ������: -"������� (���������)" Call("Scripts::Main", 1, "OpenByLSC.js", `"%u"`)
// � ������� �������� ��� ����������� ������ ��� ����, ��� � ������ ������, ������������ ���������� ������ Alt+O

var slash = "\\";

//1. - ��������� � ���������� (L- Link); 2 - ���� ���������� ����� (S- Selected); 3 - ���� ���������� ������ ������ (C - Clipboard)
var tObject = AkelPad.GetArgLine() || AkelPad.GetSelText() || AkelPad.GetClipboardText();

if (!tObject) WScript.Quit();

//����������: URL, ���� ��� �����

if (tObject.indexOf("//") != -1)
{
	openbyDefault(tObject);		//URL
	WScript.Quit();
}

var nPos = tObject.indexOf("AkelFiles");
if (nPos != -1 && nPos <= 4)
	tObject = AkelPad.GetAkelDir() + correctSlashes(tObject);		//����� (�� ������ ����) �������� �� ����������� AkelPad'�

nPos = tObject.lastIndexOf(".");
if (nPos != -1)
{
	var nPosSlash = tObject.lastIndexOf(slash);
	if (nPosSlash < nPos)
	{	//����
		if (nPosSlash <= 1)		//��� ������� �� ���� �������������� (� �����������) AkelPad'� (�� ������� �������)
			tObject = tObject.replace(/\\/gm, "");
		
		if (tObject.indexOf(slash) == -1)
			tObject = AkelPad.GetAkelDir(6) /*ADTYPE_INCLUDE*/ + slash + tObject;		//��� �������, �������� ������ ������������� � ����� ������ (�� ContextMenu-������� ��� ��.)
		
		if (!openFile(tObject, false))
		{
			tObject = tObject.substr(tObject.lastIndexOf(slash) + 1);		//���������� ����� ��� �������
			tObject = AkelPad.GetAkelDir(5) /*ADTYPE_SCRIPTS*/ + slash + tObject;		//������� ������ � ����� ..\Scripts\Include\, � ������ ������� � ..\Scripts\
			openFile(tObject, true);
		}
		WScript.Quit();
	}
}

//�����
openbyDefault(tObject);


function openbyDefault(tObject)
{
	var WshShell = new ActiveXObject("WScript.Shell");
	WshShell.Exec('rundll32.exe shell32, ShellExec_RunDLL "' + tObject + '"');
}

function openFile(tObject, bErrMsg)
{
	tObject = correctSlashes(tObject);
	
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	if (fso.FileExists(tObject) == true)
	{
		AkelPad.OpenFile(tObject);
		return true;
	}
	else
	{
		if (bErrMsg) openbyDefault(tObject);
		return false;
	}
}

function correctSlashes(pPath)
{
	return pPath.replace(/\\\\/g, slash);
}