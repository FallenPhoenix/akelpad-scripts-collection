///Opens a file on the specified path, opens it and is positioned at a certain text
///Скрипт-функция: открывает файл по заданному пути ищет в нём определённое вхождение ВЫДЕЛЕННОГО ТЕКСТА
// must be placed in ...\Scripts\Include\
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=8164#8164
// Version: 1.7 (2012.08.23)

function openHelpString(pFileInAkelDirPath, pSearchText, nCycles)
{
	if (!pSearchText)
	{
		if (! AkelPad.Include("CaretSelect.js")) WScript.Quit();
		pSearchText = getWordCaret();
	}
	
	var pFile = AkelPad.GetAkelDir() + pFileInAkelDirPath;
	
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	if (fso.FileExists(pFile) == false)
		WScript.Quit();
	
	AkelPad.OpenFile(pFile);
	if (pSearchText)
	{
		AkelPad.SetSel(0, 0);
		
		for (var n = nCycles; n > 0; n--)
		{
			AkelPad.TextFind(AkelPad.GetEditWnd(), pSearchText, 0x00000002 /*FR_WHOLEWORD*/ + 0x00000001 /*FR_DOWN*/);
		}
	}
}