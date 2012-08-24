///Run the script from his own menu of some scripts
///Запуск скрипта из собственного меню избранных скриптов
// Call("Scripts::Main", 1, "ExecuteScriptMenu.js")                       - menu is displayed from ExecuteScriptMenu.param
// Call("Scripts::Main", 1, "ExecuteScriptMenu.js", `"LS.param"`)  - menu is displayed from LS.param
// Call("Scripts::Main", 1, "ExecuteScriptMenu.js", `"LS.param" -2`)  - menu is displayed from LS.param at the cursor position (see constants in ShowMenuEx.js)
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=8663#8663
// Version: 1.3 (2011.06.21)

if (! AkelPad.Include("ShowMenuEx.js")) WScript.Quit();

if (WScript.Arguments.length >= 2)
	POS_PLACE = parseInt(WScript.Arguments(1));
else
	POS_PLACE = POS_CARET;

var pScriptName = getSelectedMenuItem(POS_PLACE, "", 0);
if (pScriptName)
{
	quitIfNotFileExist(getScriptNameFull(pScriptName));
	AkelPad.Call("Scripts::Main", 1, pScriptName);
}


function quitIfNotFileExist(pFileNameFull)
{
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	
	if (fso.FileExists(pFileNameFull) == true)
		return pFileNameFull;
	else
	{
		AkelPad.MessageBox(hWndEdit, "Скрипт '" + fso.GetFileName(pFileNameFull) + "' НЕ СУЩЕСТВУЕТ!", WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/);
		WScript.Quit();
	}
}


function getScriptNameFull(pScriptNameShort)
{
	return AkelPad.GetAkelDir(5) + "\\" + pScriptNameShort;
}