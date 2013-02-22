///LS: �������������� dot-���������� GetItemValue � ������������
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
		sLine = oStr.rtrim(arrContent[nLine], " \t");		//������� ������ ������� � �����
		if (sLine)
		{
			iPoint = sLine.indexOf(".");
			
			iEnd = sLine.indexOf(", ", iPoint);		//������: Join(nd.Value, "/") + text
			iTmp = sLine.indexOf("(", iPoint);		//������: nd.Value(0) + function(...)
			if (iTmp < iEnd)		//��� ������� (nd.Value(0), ...)
				iEnd = iTmp;
			
			
			iTmp = sLine.indexOf(")", iPoint);
			
			if (iTmp > iEnd || iEnd > 0)		//������ ��� ����������� ������ ��� (0)
				sLine = replacebyBorders(sLine, iEnd, iEnd, '")');		//������� � ������ ����� ����������� ������� � ������
			else
				sLine = sLine + '")';		//������: �������� ������ nd.Value

//			if (iEnd == -1)
				
//			else
				
			sLine = replacebyBorders(sLine, iPoint, iPoint + 1, '.GetItemValue("');		//������ �����
			
			arrContent[nLine] = sLine;
		}
	}
	strContent = arrContent.join(pBreak);
	
	AkelPad.ReplaceSel(strContent, true);
	AkelPad.SetClipboardText(strContent);
}