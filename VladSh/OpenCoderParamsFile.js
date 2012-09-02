///Opens coder-plugin configuration file
///Открывает файл параметров Coder-плагина
// Если в аргументах не передано расширение файла, то открывается файл параметров, соответствующий текущему файлу;
// текущий файл файл должен быть сохранён
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=8164#8164
// Version: 1.6 (2012.09.02)

var pExt = AkelPad.GetArgLine();

if (!pExt)
{
	if (AkelPad.Include("CommonFunctions.js"))
		pExt = getActiveSyntax(AkelPad.GetEditWnd());
	
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