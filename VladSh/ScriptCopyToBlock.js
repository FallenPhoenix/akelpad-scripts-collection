///Копирует содержимое файла в определённую структуру [] для выкладки на форум
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=13573#13573
// Version: 1.2 (2012.09.14)
// 
// Аргументы:
// 	-file="%f" - ссылка на файл
// 	-block - наименование тэга контейнера
// 	-bold ([0]/1) - "жирное" наименование скрипта
// 
// Примеры:
// -"Содержимое файла в [more]..."  Call("Scripts::Main", 1, "ScriptCopyToBlock.js", `-file="%f"`)
// -"Содержимое файла в [spoiler]..."  Call("Scripts::Main", 1, "ScriptCopyToBlock.js", `-file="%f" -block="spoiler"`)

var pFileName = GetFileName(AkelPad.GetArgValue("file", ""));
var pBlockName = AkelPad.GetArgValue("block", "more");
var bOpen = ""; var bClose = "";
var b = AkelPad.GetArgValue("bold", 0);
if (b) {
	bOpen = "[b]";
	bClose = "[/b]";
}
var pScript = bOpen + '[' + pBlockName + '="' + pFileName + '"]' + bClose + '\r[code]' + AkelPad.GetTextRange(0, -1) + '[/code][/' + pBlockName + ']';
if (pScript)
	AkelPad.SetClipboardText(pScript);

function GetFileName(pFile) {
	return pFile.slice(pFile.lastIndexOf('\\') + 1);
}