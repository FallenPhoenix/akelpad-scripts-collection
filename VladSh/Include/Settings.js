///Script "library" for working with settings
///������-"����������" ��� ������ � ����������� �������� (nSubDir=4) � �������� (nSubDir=5)
// must be placed in ...\Scripts\Include\
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=11993#11993
// Version: 1.1 (2011.10.20)

var oSet;

function SettingsRead(nSubDir /*�������������� 4 � 5 - ��. AkelPad.GetAkelDir()*/, pFileName, pParameterName, nType /*��. oSet.Read()*/)
{
	var vResult;
	if (SettingsOpen(nSubDir, pFileName, 0x1 /*POB_READ*/))
	   vResult = oSet.Read(pParameterName, nType);
	return vResult;
}

function SettingsWrite(nSubDir, pFileName, pParameterName, nType, vParameterValue)
{
	var bResult = false;
	if (SettingsOpen(nSubDir, pFileName, 0x2 /*POB_SAVE*/))
	{
	   oSet.Write(pParameterName, nType, vParameterValue);
	   oSet.End();
	}
	return bResult;
}

function SettingsDelete(nSubDir, pFileName, pParameterName)
{
	var bResult = false;
	if (SettingsOpen(nSubDir, pFileName, 0x2 /*POB_SAVE*/))
	{
	   oSet.Delete(pParameterName);
	   oSet.End();
	}
	return bResult;
}


function SettingsOpen(nSubDir, pFileName, nFlags /*��. oSet.Begin()*/)
{
	oSet = AkelPad.ScriptSettings();
	return oSet.Begin(((nSubDir == 4) ? "..\\" : "") + pFileName, nFlags);
}