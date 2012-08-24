///Создание новой строки с отступом и существующим типом пункта; поддерживается последовательная нумерация строк
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=4890#4890
// Version: 4.6 (2011.07.19)

if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
oCh.runWithRedraw();

function process()
{
	var nCursor = AkelPad.GetSelEnd();
	oCh.setCompleteLineRange(nCursor, nCursor);
	
	var nonNullIndex = oCh.Text.lastIndexOf(oStr.trim(oCh.Text, " \t"));		//индекс первого значащего символа
	var shiftExistent = oCh.Text.slice(0, nonNullIndex);		//отступ 1-го значащего символа от начала строки
	
	var nShiftStart = oCh.Text.indexOf(" ", nonNullIndex) || oCh.Text.indexOf("\t", nonNullIndex);		//индекс начала отступа текста от пункта
	var pSymbol = oCh.Text.slice(nonNullIndex, nShiftStart);		//символ пункта
	
	nCursor = nCursor - oCh.rResult[0];
	if (nCursor < nShiftStart) nCursor = nShiftStart;
	
	var pTextLeft = oCh.Text.substr(0, nCursor);		//часть текста до курсора (остаётся на текущей строке)
	var pTextRight = oStr.ltrim(oCh.Text.substr(nCursor), " \t");		//часть текста после курсора (переводится в новую строку)
	
	var shiftAfterSymbol = "";
	if (pSymbol.length <= 5)
	{
		shiftAfterSymbol = oCh.Text.slice(nShiftStart);
		if (oStr.trim(shiftAfterSymbol, " \t"))		//если в строке после символа пункта что-то есть
		{
			var nShiftEnd = oCh.Text.indexOf(oStr.trim(shiftAfterSymbol, " \t"), nShiftStart);
			shiftAfterSymbol = oCh.Text.slice(nShiftStart, nShiftEnd);		//отступ между символом пункта и текстом
		}
	}
	else
		pSymbol = "";
	
	var pNumber = parseInt(pSymbol);
	if (!isNaN(pNumber))
	{
		pSymbol = pSymbol.replace(new RegExp(pNumber), "");
		pSymbol = (pNumber + 1) + pSymbol;
	}
	
	oCh.Text = pTextLeft + pBreak + shiftExistent + pSymbol + shiftAfterSymbol + pTextRight;

	oCh.setSelCaret(oCh.rResult[0] + oCh.Text.length);		//ставим каретку после вставленного текста
}