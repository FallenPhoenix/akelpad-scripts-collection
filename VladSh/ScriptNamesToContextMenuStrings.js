///Converting the scriptnames to the string for ContextMenu-plugin
///Преобразование имён скриптов в строки вызова ContextMenu-плагина
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=8131#8131
// Version: 2.1 (2011.07.21)
//
// - если выделение есть, то скрипт преобразует выделение в строку меню и заменит выделение результатом;
// - если выделения нет, то текст для преобразования будет браться из буфера обмена, результат будет записываться тоже в буфер

var pArg = AkelPad.GetArgLine();
if (pArg) pArg = ", `" + WScript.Arguments(0) + "`";

var pBreak = "\r";
var pContent = AkelPad.GetSelText();
var bPasteToClipboard = false;

if (!pContent)
{
	pContent = AkelPad.GetClipboardText();
	if (!pContent) WScript.Quit();
	bPasteToClipboard = true;
}

var arrContent = pContent.split(pBreak);

for (line = 0; line < arrContent.length; line++)
{
	if (arrContent[line])
	{
		arrContent[line] = '-"" Call("Scripts::Main", 1, "' + arrContent[line] + '"' + pArg + ')';
	}
}
pContent = arrContent.join(pBreak);

if (bPasteToClipboard)
	AkelPad.SetClipboardText(pContent);
else
	AkelPad.ReplaceSel(pContent);