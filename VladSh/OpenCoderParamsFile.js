///Opens coder-plugin configuration file
///Открывает файл параметров Coder-плагина
// Если в аргументах не передано расширение файла, то открывается файл параметров, соответствующий текущему файлу;
// текущий файл файл должен быть сохранён
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=8164#8164
// Version: 1.7 (2012.09.11)

if (! AkelPad.Include("OpenHelpString.js")) WScript.Quit();

var pExt = AkelPad.GetArgLine();
var coderFileName;

if (!pExt)
{
	if (AkelPad.Include("CoderFunctions.js"))
		coderFileName = GetSyntaxFile(AkelPad.GetEditWnd());
	
	if (!coderFileName) {
		pExt = GetExtensionName(AkelPad.GetEditFile(0))
		if (!pExt) WScript.Quit();
		coderFileName = pExt + ".coder";
	}
}

openHelpString("\\AkelFiles\\Plugs\\Coder\\" + coderFileName, AkelPad.GetSelText(), 2);

function GetExtensionName(pFile) {
	return pFile.substr(pFile.lastIndexOf(".") + 1);
}