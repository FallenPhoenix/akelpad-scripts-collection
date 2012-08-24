///Копирует содержимое файла в определённую структуру [] для выкладки на форум
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=13573#13573
// Version: 1.1 (2011.11.22)
// 
// -"Содержимое файла в [more]..."  Call("Scripts::Main", 1, "ScriptCopyToBlock.js", `-file="%f"`)
// -"Содержимое файла в [spoiler]..."  Call("Scripts::Main", 1, "ScriptCopyToBlock.js", `-file="%f" -block="spoiler"`)

var pFileName = GetFileName(AkelPad.GetArgValue("file", ""));
var pBlockName = AkelPad.GetArgValue("block", "more");
var pScript = '[b][' + pBlockName + '="' + pFileName + '"][/b]\r[code]' + AkelPad.GetTextRange(0, -1) + '[/code][/' + pBlockName + ']';
if (pScript)
	AkelPad.SetClipboardText(pScript);


function GetFileName(pFile)
{
	return pFile.slice(pFile.lastIndexOf('\\') + 1);
}