///Script "library" for working with text
// must be placed in ...\Scripts\Include\
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1607#1607
// Version: 4.7 (2012.06.20)

//GLOBAL VARIABLES
var pBreak = "\r";		//by default
var pTab = "\t";
var sShift;					//shift definition (\t for Tab or Spaces)
var sbOpen = "{";
var sbClose = "}";
var nEndLineOfFile = -1;		//индекс доступа к последней строке файла; (на -2 с наскока не удалось переделать, т.к. в correctRangebyBorders сложные условия)
var pContent = "";		//содержимое всего изменяемого файла; определяется и используется внутри данного скрипта, извне вручную не менять!


//"Класс"-объект модификации текста
var oCh =
{
	rBegin: [],					//Границы выделения при запуске скрипта - позиции символов в файле для начала и окончания выделения
	Text: "",						//Обработанная строка - результат работы скрипта
	rResult: [],				//Границы выделения изменяемого текста
	rCaret: [],					//Границы для установки выделения после работы скрипта
	
	saveSelRange: function()						//Запоминает границы выделения при запуске скрипта (вспомогательный Private-метод)
	{
		if (typeof(rBegin) == "undefined")
		{
			this.rBegin[0] = AkelPad.GetSelStart();
			this.rBegin[1] = AkelPad.GetSelEnd();
			this.rCaret = [this.rBegin[0], this.rBegin[0]];			//по умолчанию по окончании работы ставим каретку в начало выделения, которое в начале сделал пользователь
		}
	},
	
	getSelTextEmpty: function()				//Если текст не выделен, возвращает пустую строку
	{
		this.rResult = this.rBegin;
		
		if (this.rBegin[0] == this.rBegin[1])
			return "";
		else
			return getTextbyRange(this.rBegin);
	},
	
	getSelTextAll: function()						//Если текст не выделен, возвращает всё содержимое файла
	{
		if (this.rBegin[0] == this.rBegin[1])
		{
			this.rResult = getTextAll();
			return pContent;
		}
		else
		{
			this.rResult = this.rBegin;
			return getTextbyRange(this.rResult);
		}
	},
	
	getTextAll: function()						//Возвращает всё содержимое файла вне зависимости, выделено что-то или нет
	{
		this.rResult = getTextAll();
		return pContent;
	},
	
	setCompleteLineText: function()		//Работает автоматически по выделению
	{
		this.rResult = getRangeCompleteLine(this.rBegin[0], this.rBegin[1]);
		this.Text = getTextbyRange(this.rResult);
	},
	
	setCompleteLineRange: function(nPosStart, nPosEnd)			//Используется в сложних случаях, когда необходимо самому просчитать и передать границы
	{
		this.rResult = getRangeCompleteLine(nPosStart, nPosEnd);
		this.Text = getTextbyRange(this.rResult);
	},
	
	run: function()											//Основной метод запуска (без отключения прорисовки)
	{
		this.start();
		this.modify();
	},
	
	runWithRedraw: function()					//Основной метод запуска (с отключением прорисовки)
	{
		this.start();
		
		var hWndEdit = AkelPad.GetEditWnd();
		AutoRedrawOff(hWndEdit);
		this.modify();
		AutoRedrawOn(hWndEdit);
	},
	
	start: function()										//Вспомогательный "Private"-метод
	{
		this.saveSelRange();
		process();								//Определяется внутри вызывающего скрипта!
	},
	
	setSelCaret: function(nCaretStart, nCaretEnd)				//Установка параметров выделения; 2-й параметр необязателен
	{
		if (nCaretStart != null)												//Если в nCaretStart передан null - оставляем выделение в ReplaceSel (см. метод modify)
		{
			this.rCaret[0] = nCaretStart;
			this.rCaret[1] = nCaretEnd || nCaretStart;		//Если nCaretEnd не задан - устанавливаем курсор в позицию nCaretStart
		}
		else
			this.rCaret = null;
	},
	
	modify: function()									//Окончание работы скрипта: установка и замена выделения + установка курсора (вспомогательный Private-метод)
	{
		if (this.rResult != null)
		{
			AkelPad.SetSel(this.rResult[0], this.rResult[1]);
			var bSelect = (this.rCaret == null);
			AkelPad.ReplaceSel(this.Text, bSelect);
			if (!bSelect)
				AkelPad.SetSel(this.rCaret[0], this.rCaret[1]);
		}
	},
	
	testSetSelResult: function()				//Тестирование установки выделения заменяемого текста
	{
		if (this.rResult != null)
			AkelPad.SetSel(this.rResult[0], this.rResult[1]);
		else
			AkelPad.MessageBox(AkelPad.GetEditWnd(), " this.rResult = null", "oCh.testSetSelResult() function", 0 /*MB_OK*/);
		AutoRedrawOn(AkelPad.GetEditWnd());		//если вдруг работу начинали с вызова runWithRedraw
		WScript.Quit();
	}
};

//FUNCTIONS

//Берёт текст чисто по указанным границам; вынесена, чтобы сделать "класс" более абстрактным
function getTextbyRange(Range)
{
	return AkelPad.GetTextRange(Range[0], Range[1]);
}

//Нужно для простых случаев, когда надо сразу выделить захваченые строки; иначе пользуемся алгоритмами с GetTextRange
function selCompleteLine(nCaretPosStart, nCaretPosEnd)
{
	var Range = getRangeCompleteLine(nCaretPosStart, nCaretPosEnd);
	AkelPad.SetSel(Range[0], Range[1]);
}

//Возвращает границы выделенных полных строк с учётом ограничивающих переводов строк; также поддерживаются значения -1 и -2.
function getRangeCompleteLine(nCaretPosStart, nCaretPosEnd)
{
	var hWndEdit = AkelPad.GetEditWnd();
	var Range = [];
	Range[0] = getOffset(hWndEdit, 18 /*AEGI_WRAPLINEBEGIN*/, nCaretPosStart);
	Range[1] = getOffset(hWndEdit, 19 /*AEGI_WRAPLINEEND*/, nCaretPosEnd);
	return Range;
	//return getRangebyBorders(nCaretPosStart, nCaretPosEnd, pBreak, pBreak, false);		//старая рабочая; закоментил на всякий случай, вдруг придётся открывать...
}

//Возвращает смещение объекта, определяемого nType (см. ScriptConsts.js в папке документации).
//by Instructor function: http://akelpad.sourceforge.net/forum/viewtopic.php?p=11382#11382
function getOffset(hWndEdit, nType /*AEGI_*/, nOffset)
{
	var lpIndex;
	if (lpIndex = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/))
	{
		if (nOffset != -1)
			AkelPad.SendMessage(hWndEdit, 3137 /*AEM_RICHOFFSETTOINDEX*/, nOffset, lpIndex);
		
		AkelPad.SendMessage(hWndEdit, 3130 /*AEM_GETINDEX*/, nType, lpIndex);
		nOffset = AkelPad.SendMessage(hWndEdit, 3136 /*AEM_INDEXTORICHOFFSET*/, 0, lpIndex);
		AkelPad.MemFree(lpIndex);
	}
	return nOffset;
}

//Получает весь текст; при работе с "классом" перед её вызовом желателен вызов saveSelRange, чтобы запомнить границы выделения
function getTextAll()
{
	var rResult = [0, nEndLineOfFile];
	pContent = pContent || getTextbyRange(rResult);			//берём весь текст в бэкграунде в глобальную переменную
	if (pContent)
		return rResult;
}

//Простое определение границ по открывающему и закрывающему тэгу
function getRangebyBorders(nMinSel, nMaxSel, pBOpen, pBClose, bIncludeBorders)
{
	var Range = [];
	if (getTextAll())
	{
		Range[1] = pContent.indexOf(pBClose, nMaxSel);							//Ищем вниз
		Range[0] = pContent.lastIndexOf(pBOpen, nMinSel);					//Ищем вверх
		
		Range = correctRangebyBorders(nMinSel, pBOpen, pBClose, bIncludeBorders, Range);
	}
	return Range;
}

//Определение границ по открывающему и закрывающему тэгу с учётом возможности их вложенности
function getRangebyBordersEx(iCursor, pBOpen, pBClose, bIncludeBorders)
{
	var Range = [];
	var iStart;
	var cBOpen;
	var cBClose;
	if (!getTextAll())
		return null;
	
	var iBOpen = pContent.lastIndexOf(pBOpen, iCursor);					//ищем вверх индекс открывающего тэга
	var iBClose = pContent.lastIndexOf(pBClose, iCursor);					//ищем вверх индекс закрывающего тэга
	
	if (iBOpen < iBClose)		//если закрывающий тэг ниже открывающего, значит продолжаем искать открывающий тэг выше
	{
		do
		{
			iStart = iBOpen - 1;
			iBOpen = pContent.lastIndexOf(pBOpen, iStart);		//индекс открывающего тэга
			if (iBOpen == -1)
				return null;			//защита от зацикливания при передаче неправильных или несуществующих в файле тэгов
			
			cBOpen = substringCount(pContent, iBOpen, iCursor, pBOpen);		//количество открывающих тэгов
			cBClose = substringCount(pContent, iBOpen, iCursor, pBClose);		//количество закрывающих тэгов
		}
		while (cBOpen - 1 != cBClose);
		iBClose = iBOpen - 1;		//чтобы зайти в следующее условие (поиск последнего закрывающего тэга)
	}
	
	if (iBOpen > iBClose)		//если закрывающий тэг выше открывающего, значит ищем закрывающий тэг ниже курсора
	{
		iStart = iCursor;
		do
		{
			iBClose = pContent.indexOf(pBClose, iStart);		//индекс закрывающего тэга
			if (iBClose == -1)
				return null;			//защита от зацикливания при передаче неправильных или несуществующих в файле тэгов
			
			cBOpen = substringCount(pContent, iBOpen, iBClose, pBOpen);
			cBClose = substringCount(pContent, iBOpen, iBClose, pBClose);
			
			iStart = iBClose + 1;
		}
		while (cBOpen - 1 != cBClose);
	}
	
	Range[0] = iBOpen;
	Range[1] = iBClose;
	
	Range = correctRangebyBorders(iCursor, pBOpen, pBClose, bIncludeBorders, Range);
	
	return Range;
}

function correctRangebyBorders(nMinSel, pBOpen, pBClose, bIncludeBorders, Range)
{
	if ((Range[0] == -1 && pBOpen != pBreak) || (Range[1] == -1 && pBClose != pBreak))
		return null;
	else if (Range[0] == Range[1])			//Конец строки
	{
		if (Range[0] != 0)
			Range[0] = pContent.lastIndexOf(pBOpen, nMinSel - 1);		//Повторно ищем вверх
		else
			bIncludeBorders = null;
	}
	
	if (bIncludeBorders != null)
	{
		if (bIncludeBorders)
			Range[1] += (pBClose.length);
		else
			Range[0] += pBOpen.length;
	}
	return Range;
}

//Возвращает границы блока текста ограниченный разделителями
//поиск производится снизу вверх
//nMaxSel - позиция в файле, с которой будет начинаться поиск;
//	для внешнего цикла будет быстрее; по умолчанию передавать длину строки
function getRangebyBordersBack(pContent, pBOpen, pBClose, nMaxSel)
{
	var Range = [];
	var nMaxSelTmp = pContent.lastIndexOf(pBClose, nMaxSel);
	if ( !(nMaxSelTmp == -1 && pBClose == pBreak) )
		nMaxSel = nMaxSelTmp;
	if (nMaxSel != -1)
	{
		Range[1] = nMaxSel + pBClose.length;
		Range[0] = pContent.lastIndexOf(pBOpen, nMaxSel);
		var nMaxSel = Range[0];
		if (nMaxSel != -1)
			return Range;
	}
	return null;
}

//Возвращает границы строки, в которой находится искомое вхождение
//3-й элемент результирующего массива - nMaxSel для следующей итерации
function getTextLineRange(pContent, pText, nMaxSel)
{
	var Range = [];
	// находим вхождение строки
	nMaxSel = pContent.lastIndexOf(pText, nMaxSel);
	if (nMaxSel != -1)
	{
		// ищем её окончание
		Range[1] = pContent.indexOf(pBreak, nMaxSel);
		if (Range[1] == -1)
			Range[1] = pContent.length;
		// ищем её начало
		Range[0] = pContent.lastIndexOf(pBreak, nMaxSel);
		if (Range[0] == -1)
			Range[0] = 0;
		var nMaxSel = Range[0];
		return Range;
	}
	return null;
}

//Удаляет строку, в которой находится искомое вхождение;
//Возвращает массив:
//		- 1-й элемент - содержимое строки;
//		- 2-й - nMaxSel, т.е. точка отсчёта, откуда начинать поиск в следующей итерации
function removeTextLine(pContent, pText, nMaxSel)
{
	var iRange = getTextLineRange(pContent, pText, nMaxSel)
	if (iRange != null)
	{
		var sRange = splitbyBorders(pContent, iRange[0], iRange[1]);
		sRange[0] = sRange[0] + sRange[1];
		sRange[1] = iRange[0];
		return sRange;
	}
	return null;
}

//Удаляет все строки, в которых находится искомое вхождение
function removeTextLineAll(pContent, pTextRemove)
{
	var nMaxSel = pContent.length;
	do
	{
		var Range = removeTextLine(pContent, pTextRemove, nMaxSel);
		if (Range == null)
			return pContent;
		pContent = Range[0];
		nMaxSel = Range[1];
	}
	while (true);
}

//Разбивка строки: слева "пустые" символы начала строки, справа все остальные значащие
//by Infocatcher code
function separateRow(line)
{
	var sNull = line.match(/^\s*/)[0];
	return {
		left: sNull,			//начальные "пустые" символы текущей строки
		right: line.substr(sNull.length) 		//все символы текущей строки, идущие после "пустых"
    };
}

//Количество вхождений в определённом диапазоне
function substringCount(pContent, nStart, nEnd, pTextSearch)
{
	var pTextSource = pContent.substring(nStart, nEnd);
	return pTextSource.split(pTextSearch).length - 1;
}

//Разбивка строки в массив исключая участок, ограниченный номерами позиций;
//массив будет содержать 2 элемента
function splitbyBorders(pText, nStart, nEnd)
{
	var arrTmp = [];
	arrTmp[0] = pText.substring(0, nStart);
	arrTmp[1] = pText.substr(nEnd);
	return arrTmp;
}

//Замена участка, ограниченного номерами позиций, на подстроку;
//при nStart = nEnd будет, естественно, производиться вставка
function replacebyBorders(pText, nStart, nEnd, pTextIns)
{
	return splitbyBorders(pText, nStart, nEnd).join(pTextIns);
}


//STOP redraw window (by code of the Instructor)
function AutoRedrawOff(hWndEdit)
{
	AkelPad.SendMessage(hWndEdit, 11 /*WM_SETREDRAW*/, false, 0);
}

//START redraw window (by code of the Instructor)
function AutoRedrawOn(hWndEdit)
{
	AkelPad.SendMessage(hWndEdit, 11 /*WM_SETREDRAW*/, true, 0);
	var oFunction = AkelPad.SystemFunction();
	oFunction.Call("user32::InvalidateRect", hWndEdit, 0, true);
}


//Определение символа(-ов) сдвига из настроек
function getShift()
{
	if (sShift == undefined)
	{
		var bTabStopAsSpaces = AkelPad.SendMessage(AkelPad.GetMainWnd(), 1223 /*AKD_GETFRAMEINFO*/, 53 /*FI_TABSTOPASSPACES*/, 0);
		if (bTabStopAsSpaces)
		{
			var nTabStop = AkelPad.SendMessage(AkelPad.GetEditWnd(), 3239 /*AEM_GETTABSTOP*/, 0, 0);		//Number of Spaces in Tabs (take from the program settings)
			sShift = oStr.repeat(" ", nTabStop);
		}
		else
			sShift = pTab;
	}
}

function shiftRightText(pText)
{
	getShift();
	return sShift + pText.replace(/\r/g, pBreak + sShift);
}


//"Класс"-объект расширенного функционала по работе со строками
var oStr =
{
	flags: "g",		//by default
	
	ltrim: function(pText, chars)
	{
		chars = chars || "\\s";
		return pText.replace(new RegExp("^[" + chars + "]+", this.flags), "");
	},
	
	rtrim: function(pText, chars)
	{
		chars = chars || "\\s";
		return pText.replace(new RegExp("[" + chars + "]+$", this.flags), "");
	},
	
	trim: function(pText, chars)
	{
		return this.ltrim(this.rtrim(pText, chars), chars);
	},
	
	left: function(pText, pSep)
	{
		var poz = pText.indexOf(pSep);
		if (poz > 0)
			return pText.slice(0, poz);
		else
			return "";
	},
	
	right: function(pText, pSep)
	{
		var poz = pText.indexOf(pSep);
		if (poz > 0)
			return pText.slice(poz + 1, pText.length);
		else
			return "";
	},
	
	leftback: function(pText, pSep)
	{
		var poz = pText.lastIndexOf(pSep);
		if (poz > 0)
			return pText.slice(0, poz);
		else
			return "";
	},
	
	rightback: function(pText, pSep)
	{
		var poz = pText.lastIndexOf(pSep);
		if (poz > 0)
			return pText.slice(poz + 1);
		else
			return "";
	},
	
	cleanbyBorders: function(pText, pBStart, pBEnd)
	{
		//При создании объекта RegExp в паттерне все слэши д.б. экранированы! Передавать тоже экранированные!
		return pText.replace(new RegExp(pBStart + "*?[\\s\\S]*?" + pBEnd, this.flags), "");
	},
	
	repeat: function(pText, nCount)
	{
		return (new Array(nCount + 1)).join(pText);
	}
};

//Обработка Esc-последовательностей
function escSequencesProcessing(pText)
{
	if (pText)
	{
		pText = pText.replace(/\\\\/g, "\0");
	//	if (pText.search(/\\[^rnt]/g) != -1)
	//	{
			pText = pText.replace(/\\r\\n|\\r|\\n/g, "\r");
			pText = pText.replace(/\\t/g, pTab);
			pText = pText.replace(/\0/g, "\\");
	//	}
	}
	return pText;
}