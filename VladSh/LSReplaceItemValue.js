///LS: Преобразование dot-синтаксиса ReplaceItemValue к стандартному
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=7982#7982
// Version: 1.4 (2011.04.06)

var pBreak = "\r";
var strContent = AkelPad.GetSelText() || AkelPad.GetClipboardText();

if (strContent)
{
	var arrContent = strContent.split(pBreak);
	var sLine = "";
	
	for (var nLine = 0; nLine < arrContent.length; nLine++)
	{
		sLine = arrContent[nLine].replace(/([ \t]+$)/, "");		//Убираем пустые символы в конце
		if (sLine)
		{
			sLine = sLine.replace(/\./, '.ReplaceItemValue("');
			sLine = sLine.replace(/\s*=\s*/, '", ');
			arrContent[nLine] = 'Call ' + sLine + ')'
		}
	}
	strContent = arrContent.join(pBreak);
	
	AkelPad.ReplaceSel(strContent, true);
	AkelPad.SetClipboardText(strContent);
}