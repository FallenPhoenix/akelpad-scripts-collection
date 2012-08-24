///LS: Преобразование столбца наименований айтемов в строки описаний констант
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=7982#7982
// Version: 1.3 (2011.04.06)

var pBreak = "\r";
var strContent = AkelPad.GetSelText() || AkelPad.GetClipboardText();

if (strContent)
{
	var arrContent = strContent.split(pBreak);
	
	for (var nLine = 0; nLine < arrContent.length; nLine++)
	{
		sLine = arrContent[nLine].replace(/([ \t]+$)/, "");		//Убираем пустые символы в конце
		if (sLine)
		{
			arrContent[nLine] = 'Public Const IN_' + sLine.toUpperCase() + ' = "' + sLine + '"'
		}
	}
	strContent = arrContent.join(pBreak);
	
	AkelPad.ReplaceSel(strContent);
	AkelPad.SetClipboardText(strContent);
}