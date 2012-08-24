///LS: Преобразование наименований полей в функциях в константы
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=7982#7982
// Version: 1.3 (2011.04.06)

var pBreak = "\r";
var strContent = AkelPad.GetSelText() || AkelPad.GetClipboardText();

if (strContent)
{
	var arrContent = strContent.split(pBreak);
	var sLine = "";
	var iStart;
	var iEnd;
	var sItemName = "";
	
	for (var nLine = 0; nLine < arrContent.length; nLine++)
	{
		sLine = arrContent[nLine].replace(/([ \t]+$)/, "");		//Убираем пустые символы в конце
		
		if (sLine)
		{
			iStart = sLine.indexOf('("');
			if (iStart != -1)
			{
				iStart += 2;
				iEnd = sLine.indexOf('"', iStart);
			}
			else
			{
				iEnd = sLine.lastIndexOf('")');
				if (iEnd != -1)
				{
					iStart = sLine.lastIndexOf('"', iEnd - 1);
					if (iStart != -1) iStart += 1;
				}
			}
			sItemName = sLine.substring(iStart, iEnd);
			
			var expr = new RegExp('"' + sItemName + '"', 'g');
			sLine = sLine.replace(expr, 'IN_' + sItemName.toUpperCase());
			
			arrContent[nLine] = sLine;
		}
	}
	strContent = arrContent.join(pBreak);
	
	AkelPad.ReplaceSel(strContent);
	AkelPad.SetClipboardText(strContent);
}