///LS: Преобразование столбца наименований айтемов в строки описаний констант
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=7982#7982
// Version: 1.4 (2012.10.05)

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
			arrContent[nLine] = 'Const IN_' + sLine.toUpperCase() + ' = "' + sLine + '"'
		}
	}
	strContent = arrContent.join(pBreak);
	
	AkelPad.ReplaceSel(strContent);
	AkelPad.SetClipboardText(strContent);
}