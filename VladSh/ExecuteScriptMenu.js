///Run the script from his own menu of some scripts
///Запуск скрипта из собственного меню избранных скриптов
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=8663#8663
// Version: 1.5 (2012.12.18)
// 
// Параметры:
// 	paramFile - имя файла параметров (с расширением), по которому будет формироваться меню;
// 	sep - разделитель для разбора идентификаторов и надписей в param-файле (подробнее см. параметр pParsepProcSep в ShowMenuEx.js);
// 	place - место экрана, где будет выведено меню (см. параметр pPOS_PLACE в ShowMenuEx.js)
// 	
// Примеры:
// 	Call("Scripts::Main", 1, "ExecuteScriptMenu.js")															- menu is displayed from ExecuteScriptMenu.param
// 	Call("Scripts::Main", 1, "ExecuteScriptMenu.js", `-paramFile="LS.param" -sep="="`)  			- menu is displayed from LS.param
// 	Call("Scripts::Main", 1, "ExecuteScriptMenu.js", `-paramFile="LS.param" -sep="=" -place=-2`) - menu is displayed from LS.param at the cursor position (see constants in ShowMenuEx.js)


if (WScript.Arguments.length == 0) WScript.Quit();

if (!AkelPad.Include("ShowMenuEx.js")) WScript.Quit();

var pPLACE = AkelPad.GetArgValue("place", "");
if (pPLACE == "") pPLACE = POS_CARET;		// если ничего не передано, то отталкиваемся от позиции каретки

var pScriptName = getSelectedMenuItem(pPLACE, AkelPad.GetArgValue("sep", ""), 0);
if (pScriptName) {
	quitIfNotFileExist(getScriptNameFull(pScriptName));
	AkelPad.Call("Scripts::Main", 1, pScriptName);
}


function quitIfNotFileExist(pFileNameFull) {
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	
	if (fso.FileExists(pFileNameFull) == true)
		return pFileNameFull;
	else {
		AkelPad.MessageBox(hWndEdit, "Скрипт '" + fso.GetFileName(pFileNameFull) + "' НЕ СУЩЕСТВУЕТ!", WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/);
		WScript.Quit();
	}
}

function getScriptNameFull(pScriptNameShort) {
	return AkelPad.GetAkelDir(5) + "\\" + pScriptNameShort;
}