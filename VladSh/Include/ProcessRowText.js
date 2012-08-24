///Script "library" for working with each string of selected text
///Скрипт-"библиотека", организующая обработку каждой строки текста
// must be placed in ...\Scripts\Include\
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=8655#8655
// Version: 4.0 (2011.07.19)

function processRowText(pSelText, pBreakLine)
{
	var arrOutput = [];											// output array of strings
	
	if (pSelText.length > 0)
	{
		var arrInput = pSelText.split(pBreakLine);		// input array of strings; универсальный "символ разрыва" для внутренних и внешних файлов: /\r\n|\n|\r/, но в виде "\r\n|\n|\r" в split это не работает
		var vResult;											// the result of processing row
		
		for (var i = 0; i < arrInput.length; i++)
		{
			vResult = processString(arrInput[i]); // process each string
			addToResult(arrOutput, vResult);
		}
	}
	
	pSelText = arrOutput.join(pBreakLine);
	return pSelText;
}


// User-defined function; copy into your script, decomment and modify it

//function processString(s)
//{
//	var pResult;
//	//code modify the string s...
//	return pResult;
//}

//function addToResult(arrOutput, vResult)
//{
//	//condition and code added value in the resulting array
//	arrOutput[arrOutput.length] = vResult;		//by default return all values (with empty)
//}