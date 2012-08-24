///Formation, carrying over and disclosing of symbols of the block
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1608#1608
// Version: 3.6 (2011.03.29)

if (AkelPad.GetMainWnd() && AkelPad.IsAkelEdit())
{
	if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
	oCh.runWithRedraw();
}


function process()
{
	var existentShift = "";
	var existentLeft = "";
	var existentRight = "";
	var smbNull = " \t";
	getShift();
	
	oCh.setCompleteLineText();
	
	if (oCh.Text)
		existentShift = oCh.Text.slice(0, oCh.Text.lastIndexOf(oStr.trim(oCh.Text, smbNull)));		//Определяем существующий отступ 1-го значащего символа от начала строки
	
	if (oCh.rBegin[0] == oCh.rBegin[1])															         //Если нет выделения
	{
		pozOpen = oCh.Text.lastIndexOf(" " + sbOpen);
		if (pozOpen == -1)
			pozOpen = oCh.Text.lastIndexOf("\t" + sbOpen);
		if (pozOpen > 0)																							         //Действия, выполняемые, если в текущей строке есть открывающая скобка
		{
			existentLeft = oStr.rtrim(oCh.Text.slice(0, pozOpen), smbNull);					//Остающиеся символы выделения перед открывающей скобкой
			if (existentLeft.length)
				existentLeft += pBreak;
			
			existentRight = oStr.trim(oCh.Text.slice(pozOpen + 2), smbNull);				//Кусок выделения после открывающей скобки, т.е. который должен быть внутри блока; 2 - размер искомого блока: " " + sbOpen
		}
		else
		{
			existentLeft = oStr.trim(AkelPad.GetTextRange(oCh.rResult[0], oCh.rBegin[0]), smbNull);
			if (existentLeft.length)
				existentLeft = existentShift + existentLeft + pBreak;
			
			existentRight = oStr.trim(AkelPad.GetTextRange(oCh.rBegin[0], oCh.rResult[1]), smbNull);
		}
		
		if (existentRight.charAt(existentRight.length - 1) == sbClose)							//Если закрывающая скобка есть - удаляем, так проще, - потом всё равно проставляем
			existentRight = existentRight.substr(0, existentRight.length - 1);
		
		existentRight = existentShift + sShift + existentRight;
	}
	else
	{
		existentRight = sShift + oCh.Text.replace(/\r/g, pBreak + sShift);
	}
	
	oCh.Text = existentLeft + existentShift + sbOpen + pBreak + existentRight + pBreak + existentShift + sbClose;
	
	oCh.setSelCaret(oCh.rResult[0] + oCh.Text.length - (existentShift.length + 2));				//Устанавливаем каретку в конец блока
}