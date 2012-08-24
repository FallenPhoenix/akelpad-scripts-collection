///"Save as ..." by analogy with the way it makes MS Word
///"Сохранить как..." по аналогии с тем, как это делает MS Word
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=5837#5837
// Version: 2.14 (2012.03.20)
// 
// -"Сохранить как..." Call("Scripts::Main", 1, "SaveAs.js")
// -"Сохранить в js..." Call("Scripts::Main", 1, "SaveAs.js", `"js"`)

var pAllText = AkelPad.GetTextRange(0, -1);		//берём весь текст

if (! AkelPad.Include("CommonFunctions.js")) WScript.Quit();

var pSelText = AkelPad.GetSelText();		//если есть выделенный текст, то значит из него, а не из первой строки, будем брать наименование будущего файла

var hWndEdit = AkelPad.GetEditWnd();
var pCurrentFile = AkelPad.GetEditFile(hWndEdit);

var pInitialFile = pSelText || pCurrentFile || pAllText;		//начальный текст для возможного имени файла

//Определяем расширение будущего файла; значение в аргументах приоритетнее
var fileExt = AkelPad.GetArgLine() || GetFileExt(pCurrentFile) || getExtBySyntaxFile(hWndEdit);
if (fileExt == "bbc") fileExt = "";		//bbc важно только для подсветки, а для сохранения то, что указано в настроках проги; если нужно bbc, то его можно выбрать в диалоге

if (pInitialFile && (pInitialFile != pCurrentFile))
	pInitialFile = getFileNameByFirstRow(pInitialFile);		//получение возможного имени файла по его первой строке

pInitialFile = FileDialogDefault(false, pInitialFile, fileExt);		//выдаём в диалоге - можно поменять
if (pInitialFile)
{
	pInitialFile = CorrectFileNameFull(pInitialFile);
	if (pInitialFile)
	{
		//Проверка, возможно новое расширение было добавлено к уже существующему
		var dFile = SeparateFile(pInitialFile);
		var tmpFileName = GetFileNameOnly(pInitialFile);
		if (dFile.name.length != tmpFileName.length)
			pInitialFile = dFile.path + tmpFileName + "." + dFile.ext;		//то, что было введено в диалоге, приоритетнее!
		
		//Проверка на существование файла с таким именем
		fso = new ActiveXObject("Scripting.FileSystemObject");
		if (fso.FileExists(pInitialFile) == true)
		{
			if (AkelPad.MessageBox(AkelPad.GetMainWnd(), "File '" + pInitialFile + "' already exist! Replace it?!", "AkelPad message...", 48+4) != 6) WScript.Quit();
			
			//Закрытие текущего файла и его вкладки
			AkelPad.Command(4324 /*IDM_WINDOW_FILECLOSE*/);
			AkelPad.Command(4318 /*IDM_WINDOW_FRAMECLOSE*/);
		}
		
		if (pCurrentFile)
		{
			CreateByFile(hWndEdit);
			AkelPad.ReplaceSel(pAllText);
		}
		
		//внешнее сохранение файла
		AkelPad.SaveFile(0, pInitialFile);
	}
}


//Берём первую строку, как это делает MS Word
function getFileNameByFirstRow(pInitialFile)
{
	var pTmpFile = pInitialFile.replace(new RegExp("^[" + " \t\r" + "]+", "gm"), "");
	pTmpFile = pTmpFile.split(/\r/)[0]
	
	return CorrectFileName(pTmpFile);
}