///Copies the name of the script in BBCode, substituting in URL is first found the link in edit window
///�������� �������� ������� � BBCode, ���������� � URL ������ ��������� � ���� �������������� ������
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=13573#13573
// Version: 1.3 (2011.10.20)
// 
// -"��� ��� BBCode" Call("Scripts::Main", 1, "ScriptNameCopyAsBBCode.js", `"%f"`)		- ��� ������������ ���� �������, �� ����� �������� � �� ���� ��������

var pFileName = AkelPad.GetEditFile(0) || AkelPad.GetArgLine();

if (pFileName)
{
	var pURL = AkelPad.GetTextRange(0, -1);		//���� �� ����� �����
	if (pURL)
		pURL = getSubString(pURL, "http://", "\r");
	pFileName = GetFileName(pFileName);
	AkelPad.SetClipboardText("[url=" + pURL + "]" + pFileName + "[/url]");
}
else
	AkelPad.MessageBox(AkelPad.GetEditWnd(), "��� ����� �� ������. ��������� ���� � ���������� �����...", WScript.ScriptName, 0 /*MB_OK*/ + 48);


function getSubString(pText, pStartSmbs, pEnd)
{
	var pResult = "";
	var nIndex = pText.indexOf(pStartSmbs);
	if (nIndex != -1)
	{
		pResult = pText.slice(nIndex);
		nIndex = pResult.indexOf(pEnd);
		pResult = pResult.slice(0, nIndex);
	}
	return pResult;
}

function GetFileName(pFile)
{
	return pFile.slice(pFile.lastIndexOf('\\') + 1);
}