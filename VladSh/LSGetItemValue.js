///LS: Преобразование dot-синтаксиса GetItemValue к стандартному
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=7982#7982
// Version: 1.3 (2011.04.06)

var strContent = AkelPad.GetSelText() || AkelPad.GetClipboardText();

if (strContent)
{
	if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
	
	var arrContent = strContent.split(pBreak);
	var sLine = "";
	var iPoint; var iEnd; var iTmp;
	
	for (var nLine = 0; nLine < arrContent.length; nLine++)
	{
		sLine = oStr.rtrim(arrContent[nLine], " \t");		//Убираем пустые символы в конце
		if (sLine)
		{
			iPoint = sLine.indexOf(".");
			
			iEnd = sLine.indexOf(", ", iPoint);		//пример: Join(nd.Value, "/") + text
			iTmp = sLine.indexOf("(", iPoint);		//пример: nd.Value(0) + function(...)
			if (iTmp < iEnd)		//это вариант (nd.Value(0), ...)
				iEnd = iTmp;
			
			
			iTmp = sLine.indexOf(")", iPoint);
			
			if (iTmp > iEnd || iEnd > 0)		//значит это закрывающая скобка для (0)
				sLine = replacebyBorders(sLine, iEnd, iEnd, '")');		//вставка в нужное место закрывающей кавычки и скобки
			else
				sLine = sLine + '")';		//пример: выделено просто nd.Value

//			if (iEnd == -1)
				
//			else
				
			sLine = replacebyBorders(sLine, iPoint, iPoint + 1, '.GetItemValue("');		//замена точки
			
			arrContent[nLine] = sLine;
		}
	}
	strContent = arrContent.join(pBreak);
	
	AkelPad.ReplaceSel(strContent, true);
	AkelPad.SetClipboardText(strContent);
}