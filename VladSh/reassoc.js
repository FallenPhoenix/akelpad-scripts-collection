///�������������� � ���������� ����������, ��������� � AkelPad.ini
///Associating with program the file extensions, listed in AkelPad.ini
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=12169#12169
// Version: 1.2 (2011.03.24)
//
// -"Files associating" Call("Scripts::Main", 1, "reassoc.js")								- reassoc all operations
// -"Files associating (Edit)" Call("Scripts::Main", 1, "reassoc.js", "Edit")		- reassoc Edit operation only

if (! AkelPad.Include("INI.js")) WScript.Quit();

var pMenuFileName = "AkelPad.ini";
var pMenuFile = AkelPad.GetAkelDir(0) /*ADTYPE_ROOT*/ + "\\" + pMenuFileName;

if (! oINI.setFile(pMenuFile))
{
	AkelPad.MessageBox(AkelPad.GetMainWnd(), pMenuFileName + " not found...", WScript.ScriptName, 64 /*MB_ICONINFORMATION*/);
	WScript.Quit();
}

var arrOperations;
if (WScript.Arguments.length)
	arrOperations = [WScript.Arguments(0)];
if (!arrOperations) arrOperations = ["Open", "Edit", "Print"];

var WshShell = new ActiveXObject("WScript.Shell");

for (var nOper = 0; nOper < arrOperations.length; nOper++)
{
	var sExts = oINI.read("FileTypes" + arrOperations[nOper]);
	if (sExts) reassocList(sExts.split(";"), arrOperations[nOper].toLowerCase(), '"' + AkelPad.GetAkelDir(0) + '\\AkelPad.exe" "%1"', "AkelUndo");
}

AkelPad.MessageBox(AkelPad.GetMainWnd(), "�������������� ����� ������ � ���������� ���������.", WScript.ScriptName, 64);


function reassocList(arrExt, pOreration, pCommandLineNew, pUndoParamName)
{
	for (var nExt = 0; nExt < arrExt.length; nExt++)
		reassocExt(arrExt[nExt], pOreration, pCommandLineNew, pUndoParamName);
}

function reassocExt(pExt, pOreration, pCommandLineNew, pUndoParamName)
{
	//���������� ��� ������ � ����������� ����������, ���� ��� ����������������
	var pExtSectionPName = "HKCR\\." + pExt + "\\";
	var pExtSectionName = RegRead(pExtSectionPName);		//������ ����� �������� �� ��������� (��� ������ � �����������)
	
	if (!pExtSectionName)		//���� ���������� �� ���������������� ��� �� ��������� �� ������ � �����������
	{
		pExtSectionName = pExt + "file";
		WshShell.RegWrite(pExtSectionPName, pExtSectionName, "REG_SZ");		//���������� �������� �� ��������� (��� ������ � �����������)
	}
	
	//�������� � ������� �������� ����������
	var pCommandSectionName = "HKCR\\" + pExtSectionName + "\\shell\\" + pOreration + "\\command\\";
	var pCommandLine = RegRead(pCommandSectionName);		//������ ����� �������� ��������� ������, �������� ��������� �������� ����, � ��� ���������
	
	if (pCommandLine != '"%1" %*')		//���� ��� �� ����������� ����, - �������������
	{
		if (pCommandLine != pCommandLineNew)		//���� ��������� ������ ������
		{
			if (pCommandLine)		//���� � ������ ��������� ������ ���-�� ����, - �������� � �������� pUndoParamName
				RegWriteSZ(pCommandSectionName + pUndoParamName, pCommandLine);
			
			RegWriteSZ(pCommandSectionName, pCommandLineNew);		//���������� ����� �������� �� ���������
		}
	}
}

function RegRead(pPath)
{
	try
		{ return WshShell.RegRead(pPath) }
	catch(e)
		{ return null }
}

function RegWriteSZ(pSection, pValue)
{
	var arrValue = pValue.split('" "');
	var pType = (arrValue[0].charAt(0) == "%") ? "REG_EXPAND_SZ" : "REG_SZ";
	WshShell.RegWrite(pSection, pValue, pType);
}