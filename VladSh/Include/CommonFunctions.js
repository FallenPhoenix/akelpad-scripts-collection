///Script "library" for working with for WinFS
// must be placed in ...\Scripts\Include\
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1582#1582
// Version: 2.7 (2012.09.02)

//Default variables
var pSlash = "\\";
var pExtTXT = "txt";
var pDefaultExt;			//можно задать извне, это будет приоритетнее, т.е. не заменится при вызове функции

//FUNCTIONS

//определение расширения по умолчанию
function getDefaultExt()
{
	if (!pDefaultExt)
	{
		var lParam;
		if (lParam = AkelPad.MemAlloc(256))
		{
			AkelPad.SendMessage(AkelPad.GetMainWnd(), 1222 /*AKD_GETMAININFO*/, 224 /*MI_DEFAULTSAVEEXT*/, lParam);
			pDefaultExt = AkelPad.MemRead(lParam, 1 /*DT_UNICODE*/);
			AkelPad.MemFree(lParam);
		}
	}
	return pDefaultExt || pExtTXT;
}

//возвращает имя используемого coder-файла ("псевдорасширение"); на основе кода Instructor'а
function getActiveSyntax(hWndE)
{
	var lpFile;
	var pExt = "";
	if (lpFile = AkelPad.MemAlloc(256))
	{
		AkelPad.Call("Coder::Settings", 16, hWndE, lpFile, 256);
		pExt = AkelPad.MemRead(lpFile, 1  /*DT_UNICODE*/);
		AkelPad.MemFree(lpFile);
		pExt = GetFileNameOnly(pExt);
	}
	return pExt;
}

//Вызов диалога Открытия/Сохранения файла (WinAPI) с предварительной обработкой и инициализацией всех необходимых параметров
function FileDialogDefault(bOpenTrueSaveFalse, pInitialFile, pInitialExt)
{
	var pInitialDir = GetParentClosed(pInitialFile);
	
	//<определение фильтров>
	var nFilterIndex = 1;		//номер фильтра по порядку (не индекс!) для arrExtLines; по умолчанию считаем, что расширение пока не найдено..
	var arrExtAll;
	var arrExtLines = [];
	arrExtAll = getFileContent(AkelPad.GetAkelDir(5) + "\\Params\\" + "FileDialogExtentions.param", "\r\n");
	if (arrExtAll)
	{
		var n = 0;
		var arrFTypeInfo;
		for (var i = 0, l = arrExtAll.length; i < l; i++)
		{
			arrFTypeInfo = arrExtAll[i].split("=");
			arrExtAll[i] = getFilter(arrFTypeInfo[0], arrFTypeInfo[1]);
			if (!n)
			{
			   if ((";" + arrFTypeInfo[1] + ";").split(";" + pInitialExt + ";").length == 2)		//если есть точное совпадение расширения, то полный список не нужен
				{
					if (bOpenTrueSaveFalse)
					{
					   nFilterIndex = i + 1;
					   n = 1;
					}
					else
					{
	   				n += 1;
	   				arrExtLines[n] = arrExtAll[i];
	   				break;
					}
				}
			}
		}
		if (bOpenTrueSaveFalse)
			arrExtLines = arrExtAll;
		else
		{
			if (n == 1)
			{
				arrExtLines[0] = arrExtAll[0];
				nFilterIndex = 2;
			}
			else
			{
				arrExtLines = arrExtAll;		//не нашли расширение в списке
				nFilterIndex = -1;
			}
		}
	}
	else		//если файл со списком типов не существует или пуст
	{
		arrExtLines[0] = getFilter("All Files", "*");
		arrExtLines[1] = getFilter("Plain Text files", pExtTXT);
		if (pInitialExt)
		{
			if (pInitialExt != pExtTXT)		//если это расширение не txt, значит вручную добавляем его..
			{
				arrExtLines[2] = getFilter(pInitialExt.toUpperCase() + " files", pInitialExt);
				nFilterIndex = 3;
			}
			else
				nFilterIndex = 2;
		}
	}
	var pFilter = arrExtLines.join("");
	//</определение фильтров>
	
	//если расширение точно определено в списке, то в имени файла его выдавать не надо
	if (nFilterIndex > 0)
	{
		var sExtTmp = GetFileExt(pInitialFile);
		if (sExtTmp && ((sExtTmp != pInitialExt) || (nFilterIndex == 1)))		//если был выделен файл с расширением, отличающимся от текущего файла - выдаём, чтобы пользователь мог подтвердить или исправить
			pInitialFile = GetFileName(pInitialFile) || "filename";
		else
			pInitialFile = GetFileNameOnly(pInitialFile);
	}
	else
	{
		nFilterIndex = 1;
		if (!bOpenTrueSaveFalse)
		{
			if (pInitialExt)
				pInitialFile = GetFileNameOnly(pInitialFile) + "." + pInitialExt;		//если расширение определено, но отсутствует в списке, то выдаём его в имени файла
			pInitialExt = getDefaultExt();			//для того, чтобы при неопределении расширения файла он не сохранялся без расширения
		}
	}
	
	return FileDialog(bOpenTrueSaveFalse, AkelPad.GetMainWnd(), pInitialDir, pInitialFile, pInitialExt, pFilter, nFilterIndex);
}

//Сборка фильтра
function getFilter(sFTypeInfo, sExts /*расширения ч/з ";"*/)
{
	var sMask = "*." + (sExts).replace(/;/g, ";*.");		//маска для всех расширений этого типа, без пробелов
	return sFTypeInfo + " (" + sMask.replace(/;/g, "; ") + ")\0" + sMask + "\0";		//фильтр в полном виде
}


//Стандартный диалог Открытия/Сохранения файла (WinAPI)
function FileDialog(bOpenTrueSaveFalse, hWnd, pInitialDir, pInitialFile, pInitialExt, pFilter, nFilterIndex)
{
	var nFlags = 0x880804; //OFN_HIDEREADONLY|OFN_PATHMUSTEXIST|OFN_EXPLORER|OFN_ENABLESIZING
	var lpStructure;
	var lpFilterBuffer;
	var lpFileBuffer;
	var lpExtBuffer;
	var lpDirBuffer;
	var oSys;
	var pResultFile = "";
	var nCallResult;
	
	var lFilterBuffer = pFilter.length;		//передаём не 256, а реальный размер pFilter
	if (lpFilterBuffer = AkelPad.MemAlloc((lFilterBuffer+1) * _TSIZE))
	{
		AkelPad.MemCopy(lpFilterBuffer, pFilter.substr(0, lFilterBuffer), _TSTR);

		if (lpFileBuffer = AkelPad.MemAlloc(256 * _TSIZE))
		{
			AkelPad.MemCopy(lpFileBuffer, pInitialFile.substr(0, 255), _TSTR);

			if (lpExtBuffer = AkelPad.MemAlloc(256 * _TSIZE))
			{
				AkelPad.MemCopy(lpExtBuffer, pInitialExt.substr(0, 255), _TSTR);
				
				if (lpDirBuffer = AkelPad.MemAlloc(256 * _TSIZE)) 
				{ 
					AkelPad.MemCopy(lpDirBuffer, pInitialDir.substr(0, 255), _TSTR);
					
					if (lpStructure = AkelPad.MemAlloc(_X64?136:76))
					{
						//Fill structure
						AkelPad.MemCopy(lpStructure, _X64?136:76, 3 /*DT_DWORD*/);										 //lStructSize
						AkelPad.MemCopy(lpStructure + (_X64?8:4), hWnd, 2 /*DT_QWORD*/);							 //hwndOwner
						AkelPad.MemCopy(lpStructure + (_X64?24:12), lpFilterBuffer, 2 /*DT_QWORD*/);	 //lpstrFilter
						AkelPad.MemCopy(lpStructure + (_X64?44:24), nFilterIndex, 3 /*DT_DWORD*/);		 //nFilterIndex
						AkelPad.MemCopy(lpStructure + (_X64?48:28), lpFileBuffer, 2 /*DT_QWORD*/);		 //lpstrFile
						AkelPad.MemCopy(lpStructure + (_X64?56:32), 256, 3 /*DT_DWORD*/);							//nMaxFile
						AkelPad.MemCopy(lpStructure + (_X64?68:44), lpDirBuffer, 2 /*DT_QWORD*/);       //lpstrInitialDir
						AkelPad.MemCopy(lpStructure + (_X64?96:52), nFlags, 3 /*DT_DWORD*/);					 //Flags
						AkelPad.MemCopy(lpStructure + (_X64?104:60), lpExtBuffer, 2 /*DT_QWORD*/);		 //lpstrDefExt
	
						if (oSys = AkelPad.SystemFunction())
						{
							//Call dialog
							if (bOpenTrueSaveFalse == true)
								nCallResult = oSys.Call("comdlg32::GetOpenFileName" + _TCHAR, lpStructure);
							else
								nCallResult = oSys.Call("comdlg32::GetSaveFileName" + _TCHAR, lpStructure);
	
							//Result file
							if (nCallResult) pResultFile = AkelPad.MemRead(lpFileBuffer, _TSTR);
						}
						AkelPad.MemFree(lpStructure);
					}
					AkelPad.MemFree(lpDirBuffer);
				}
				AkelPad.MemFree(lpExtBuffer);
			}
			AkelPad.MemFree(lpFileBuffer);
		}
		AkelPad.MemFree(lpFilterBuffer);
	}
	return pResultFile;
}


///Создание вкладки нового файла со всеми параметрами исходного файла
function CreateByFile(hWnd /*hWndEdit*/)
{
	var nCodePage = AkelPad.GetEditCodePage(hWnd);
	var bBOM = AkelPad.GetEditBOM(hWnd);
	var nNewLine = AkelPad.GetEditNewLine(hWnd);
	AkelPad.Command(4101 /*IDM_FILE_NEW*/);		//создание (закладки) для сохранения выделения отдельным файлом
	AkelPad.SaveFile(0, "", nCodePage, bBOM);		//выставление кодировки как у исходного файла
	AkelPad.SendMessage(AkelPad.GetMainWnd(), 1230 /*AKD_SETNEWLINE*/, 0, nNewLine);		//выставление "формата новой строки" как у исходного файла
}


//Разбивает полный путь в массив [Папка, Имя_файла, Расширение]
function SeparateFile(pFile)
{
	var pPath = "";
	var pFileName = "";
	var pFileExt = "";
	
	var pos = pFile.lastIndexOf(pSlash);
	if (pos != -1)
		pPath = pFile.slice(0, pos + 1);
	
	pFileName = pFile.slice(pos + 1);
	if (pFileName)
	{
		pos = pFileName.lastIndexOf(".");
		if (pos != -1)
		{
			pFileExt = pFileName.slice(pos + 1);
			pFileName = pFileName.slice(0, pos);
		}
	}
	
	return {
		path: pPath,
		name: pFileName,
		ext: pFileExt
	};
}

//Возвращает полное имя папки БЕЗ закрывающего \
function GetParent(pFile)
{
	var pDir = "";
	var pozLastSep = pFile.lastIndexOf(pSlash);
	if (pozLastSep != -1)
		pDir = pFile.slice(0, pozLastSep);
	return pDir;
}

//Возвращает полное имя папки С закрывающим \
function GetParentClosed(pFile)
{
	var pDir = GetParent(pFile);
	if (pDir) pDir = pDir + pSlash;
	return pDir;
}

//Возвращает имя файла С расширением
function GetFileName(pFile)
{
	return pFile.slice(pFile.lastIndexOf(pSlash) + 1);
}

//Возвращает имя файла БЕЗ расширения
function GetFileNameOnly(pFile)
{
	var pFileName = GetFileName(pFile);
	var pos = pFileName.lastIndexOf(".");
	if (pos != -1)
		pFileName = pFileName.slice(0, pos);
	return pFileName;
}

//Возвращает расширение файла
function GetFileExt(pFile)
{
	var ext = "";
	var pos = pFile.lastIndexOf(".");
	if (pos != -1) ext = pFile.substr(pos + 1);
	return ext;
}

//Remove inadmissible symbols (from wisgest)
function CorrectFileName(pFileNameOnly)
{
	pFileNameOnly = pFileNameOnly.replace(/\t/g, " ");		//валим табуляции, т.к. диалог с ними иногда просто не отображается
	pFileNameOnly = pFileNameOnly.replace(/  /g, " ");		//убираем повторяющиеся пробелы
	return pFileNameOnly.replace(/[\\\/:\*\?"{}<>\|]/g, "");
}

function CorrectFileNameFull(pFile)
{
	pFileNameOnly = GetFileName(pFile);
	pFileNameOnly = CorrectFileName(pFileNameOnly);
	return GetParent(pFile) + pSlash + pFileNameOnly;
}

//Получает содержимое файла; возвращает:
//если файла нет - undefined; если pSepRow не передан - возвращает содержимое в виде строки; если передан - возвращает массив, разбитый через pSepRow
function getFileContent(pFile, pSepRow)
{
	var result;
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	if (fso.FileExists(pFile) == true)
	{
		result = AkelPad.ReadFile(pFile);
		if (pSepRow.length != 0)
			result = result.split(pSepRow);
	}
	return result;
}