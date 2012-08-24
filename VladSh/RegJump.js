///Opens the selected branch in the registry editor
///Открывает выделенную ветвь в редакторе реестра
// если выделения искомой ветви не произошло, значит её не существует
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=11092#11092
// Version: 1.4 (2011.01.21) - 1.9 (2012.04.03) by VladSh
// Version: 1.3 by mozers™ (SciTE)
//
// Понимает записи вида:
//		HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control
//		[HKLM\SYSTEM\CurrentControlSet\Control]	/символы [] обрезаются/
//		HKLM\\SYSTEM\\CurrentControlSet\\Control
//	Предлагаемая комбинация клавиш:	Ctrl+Alt+J

var key = AkelPad.GetSelText();
if (!key)
{		//Если текст не выделен, то будем пытаться получить "ссылку" из текущей строки
	var hWndEdit = AkelPad.GetEditWnd();
	var nPosCurrent = AkelPad.GetSelStart();		//позиция курсора в файле
	
	var oLine = getLine(nPosCurrent);
	var nIndexCurrent = nPosCurrent - oLine.start + 1;		//позиция курсора в строке
	
	key = getKey(oLine.text, nIndexCurrent)		//предварительный поиск ключа, отталкиваясь от позиции курсора
	if (!key)
		key = getKey(oLine.text, -1);		//предварительный поиск ключа - во всей строке
}
else
{
	key = getKey(key, -1);		//предварительный поиск ключа - по выделенному тексту
	if (!key) WScript.Quit();
}
//Проверяем, есть ли что-то похожее на ветку реестра
var posStart = key.indexOf("HK");
if (posStart == -1) WScript.Quit();
key = key.substr(posStart);

var pSlash = "\\";
var procRegEdit = "regedit.exe";
var WshShell = new ActiveXObject("WScript.Shell");

var LastKeyPath = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Applets\\Regedit\\";
var LastKeyName = LastKeyPath + "Lastkey";		//параметр отдельно от пути, т.к. с помощью Run выделение осуществляется только для каталога
key = key.replace(/^HKLM\\/, "HKEY_LOCAL_MACHINE\\");
key = key.replace(/^HKCR\\/, "HKEY_CLASSES_ROOT\\");
key = key.replace(/^HKCU\\/, "HKEY_CURRENT_USER\\");
key = key.replace(/\\\\/g, pSlash);
key = key.replace(/\[/g, "");		//обрезаем [] (для строки из *.reg-файла)
key = key.replace(/\]/g, "");
key = WshShell.RegRead(LastKeyName).match(/^[^\\]+/) + pSlash + key;

if (key.lastIndexOf(pSlash) == key.length - pSlash.length)
	key = key.substr(0, key.length - pSlash.length);		//обрезаем финальный слэш, если он есть, т.к. с ним не происходит выделения ветки

TaskKill(procRegEdit);		//для "обновления", т.к. иначе перехода на нужную ветку не производится

WshShell.RegWrite(LastKeyName, key, "REG_SZ");
WshShell.Run(procRegEdit, 1, false);


function getLine(nPos)
{
	var line = AkelPad.SendMessage(hWndEdit, 1078 /*EM_EXLINEFROMCHAR*/, 0, nPos);
	var index = AkelPad.SendMessage(hWndEdit, 187 /*EM_LINEINDEX*/, line, 0);
	var len = AkelPad.SendMessage(hWndEdit, 193 /*EM_LINELENGTH*/, index, 0);
	var text = AkelPad.GetTextRange(index, index + len);
	
	return {
		text: text,
		start: index,
		len: len
	};
}

///Поиск ключа по границам, иначе берём всю переданную строку, т.к. возможно текст выделен правильно, без ограничителей
function getKey(pText, nIndex)
{
	var key = getBlock(pText, nIndex, '[', ']');		//ищём внутри []
	if (!key)
	{
		key = getBlock(pText, nIndex, '"', '"');		//иначе ищём внутри ""
		if (!key)
			key = getBlock(pText, nIndex, "'", "'");		//иначе ищём внутри ''
			if (!key)
				key = pText;		//берём всю переданную строку
	}
	return key;
}

function getBlock(pText, nPos, pTextStart, pTextEnd)		//если в nPos передано -1, то искать во всей строке
{
	var pBlock = "";
	var nLbound;
	var nUbound;
	if (nPos != -1)
	{
		nLbound = nPos;
		nUbound = nPos;
	}
	else
	{
		nLbound = pTextStart.length + 1;
		nUbound = pText.length - pTextEnd.length - 1;
	}
	
	var posTextStart = pText.lastIndexOf(pTextStart, nUbound);					//Ищем вверх
	if (posTextStart != -1)
	{
		var posTextEnd = pText.indexOf(pTextEnd, nLbound);							//Ищем вниз
		if (posTextEnd != -1)
		{
			posTextStart += 1;
			if (posTextStart < posTextEnd)
				pBlock = pText.substring(posTextStart, posTextEnd);
			else
				pBlock = pText.substring(posTextEnd + pTextStart.length, posTextStart - pTextEnd.length);
		}
	}
	return pBlock;
}

function TaskKill(process_name)
{
	var objWMIService = GetObject("winmgmts:\\\\.\\root\\CIMV2");
	var colProcessList = objWMIService.ExecQuery ('SELECT * FROM Win32_Process WHERE NAME = "' + process_name + '"');
	var enumItems = new Enumerator(colProcessList);
	for (; !enumItems.atEnd(); enumItems.moveNext())
		enumItems.item().Terminate();
}