///Opens coder-plugin configuration file
///��������� ���� ���������� Coder-�������
// ���� � ���������� �� �������� ���������� �����, �� ����������� ���� ����������, ��������������� �������� �����;
// ������� ���� ���� ������ ���� �������
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=8164#8164
// Version: 1.5 (2012.02.23)

var pExt = AkelPad.GetArgLine();

if (!pExt)
{
	if (AkelPad.Include("CommonFunctions.js"))
		pExt = getExtBySyntaxFile(AkelPad.GetEditWnd());
	
	if (!pExt)
		pExt = GetExtensionName(AkelPad.GetEditFile(0))
}

if (pExt)
{
	if (! AkelPad.Include("OpenHelpString.js")) WScript.Quit();
	
	var pParamFile = "\\AkelFiles\\Plugs\\Coder\\" + pExt + ".coder";
	
	openHelpString(pParamFile, AkelPad.GetSelText(), 2);
}


function GetExtensionName(pFile)
{
	return pFile.substr(pFile.lastIndexOf(".") + 1);
}