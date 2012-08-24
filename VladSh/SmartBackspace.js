///Deleting block of whitespaces; for other characters - a usual deleting (1 symbol)
/// Удаляет пробелы блоками (количество пробелов в блоке берётся из настроек программы);
/// для других символов - обычное удаление (посимвольно)
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=11267#11267
// Version: 2.0 (2011.01.21) - 2.2 (2011.01.26) by VladSh
// Version: 1.0 by lexa
// Предлагаемая комбинация клавиш:	Shift+Alt+Backspace

var nPosCurrent = AkelPad.GetSelStart();
if (!nPosCurrent) WScript.Quit();

if (nPosCurrent == AkelPad.GetSelEnd())
{
	var hWndEdit = AkelPad.GetEditWnd();
	var oLine = getBlockLeft(nPosCurrent);
	
	var nTabStop = AkelPad.SendMessage(AkelPad.GetEditWnd(), 3239 /*AEM_GETTABSTOP*/, 0, 0);		//количество пробелов (из настроек)
	var pSpaces = repeat(" ", nTabStop);
	
	var posCursorNew = oLine.len - nTabStop;
	var pPartDel = oLine.text.substr(posCursorNew);		//предполагаемая удаляемая часть
	if (pPartDel != pSpaces)
		posCursorNew = oLine.len - 1;
	var pPartRemain = oLine.text.substr(0, posCursorNew);
	
	var bNoSelEOL = false;
	if (!oLine.start)
	{
		var fNoSelEOL = "SmartSel::NoSelEOL";
		var bNoSelEOL = AkelPad.IsPluginRunning(fNoSelEOL);
		if (bNoSelEOL) AkelPad.Call(fNoSelEOL);		//Turn OFF
	}
	
	setRedraw(hWndEdit, false);
	AkelPad.SetSel(nPosCurrent - oLine.text.length, nPosCurrent);
	AkelPad.ReplaceSel(pPartRemain);
	setRedraw(hWndEdit, true);
	
	if (bNoSelEOL) AkelPad.Call(fNoSelEOL);		//Turn ON
}
else
	AkelPad.ReplaceSel("");


function repeat(pText, nCount)
{
	return (new Array(nCount + 1)).join(pText);
}

function getBlockLeft(nPos)
{
	var line = AkelPad.SendMessage(hWndEdit, 1078 /*EM_EXLINEFROMCHAR*/, 0, nPos);
	var index = AkelPad.SendMessage(hWndEdit, 187 /*EM_LINEINDEX*/, line, 0);
	if (index == nPos && index != 0)
	{
		var line = AkelPad.SendMessage(hWndEdit, 1078 /*EM_EXLINEFROMCHAR*/, 0, nPos - 1);
		var index = AkelPad.SendMessage(hWndEdit, 187 /*EM_LINEINDEX*/, line, 0);
	}
	var text = AkelPad.GetTextRange(index, nPos);
	
	return {
		text: text,
		start: index,
		len: text.length
	};
}

function setRedraw(hWnd, bRedraw)
{
   var oSys = AkelPad.SystemFunction();
   AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
   bRedraw && oSys.Call("user32::InvalidateRect", hWnd, 0, true);
}