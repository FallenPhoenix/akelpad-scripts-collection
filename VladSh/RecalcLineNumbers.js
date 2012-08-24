///Recalculation of line numbers
///Перепросчёт номеров строк
// - начиная с той, на которой установлен курсор
// - либо чисто в выделенных строках (нужно для подблоков нумерации)
// 
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=4890#4890
// Version: 1.0 (2011.07.19)
// 
// предлагаемая комбинация клавиш: Alt + Shift + N

//Oбразцы, с которыми будем сравнивать все последующие строки
var nonNullIndexBase;		//индекс первого значащего символа
var pSymbolBase;				//символы, которые идут сразу за числом
var pNumberBase;				//счётчик

if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
if (! AkelPad.Include("ProcessRowText.js")) WScript.Quit();

oCh.runWithRedraw();


function process()
{
	var nSelStart = AkelPad.GetSelStart();
	if (nSelStart == AkelPad.GetSelEnd())
		oCh.setCompleteLineRange(nSelStart, -2);		//берём текст от строки, на которой стоит курсор и до конца файла
	else
		oCh.setCompleteLineRange(nSelStart, AkelPad.GetSelEnd());
	
	oCh.Text = processRowText(oCh.Text, pBreak);
}


function processString(s)
{
	//code modify the string s...
	var pResult;		//строка, в которую записываем результат
	
	var nonNullIndex = s.lastIndexOf(oStr.trim(s, " \t"));
	if (nonNullIndexBase == undefined) nonNullIndexBase = nonNullIndex;
	
	if (nonNullIndex == nonNullIndexBase)
	{
		var shiftExistent = s.slice(0, nonNullIndex);		//отступ 1-го значащего символа от начала строки
		
		var nShiftStart = s.indexOf(" ", nonNullIndex) || s.indexOf("\t", nonNullIndex);		//индекс начала отступа текста от пункта
		
		var pSymbol = s.slice(nonNullIndex, nShiftStart);		//символ пункта
		
		if (pSymbol.length <= 5)
		{
			var pNumber = parseInt(pSymbol);
			if (!isNaN(pNumber))
			{
				pSymbol = pSymbol.replace(new RegExp(pNumber), "");
				if (pSymbol)
				{
					if (!pSymbolBase) pSymbolBase = pSymbol;
					
					if (pSymbol == pSymbolBase)
					{
						if (pNumberBase) pNumberBase += 1; else pNumberBase = pNumber;
						
						pSymbol = pNumberBase + pSymbol;
						var pRowText = s.slice(nShiftStart);		//текст от начала отступа текста
						
						pResult = shiftExistent + pSymbol + pRowText;
					}
				}
			}
		}
	}
	
	if (!pResult) pResult = s;
	return pResult;
}

function addToResult(arrOutput, vResult)
{
	arrOutput[arrOutput.length] = vResult;
}