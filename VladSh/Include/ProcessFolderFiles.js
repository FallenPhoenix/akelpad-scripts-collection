///Script "library" for working with all files located in specified folder
///Скрипт-"библиотека", организующая обработку каждого файла определённой папки
// must be placed in ...\Scripts\Include\
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=8655#8655
// Version: 1.1 (2011.07.21)

function processFolderFiles(pFilePath, bErrMsg)
{
	if (pFilePath)
	{
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		
		var dir = fso.GetParentFolderName(pFilePath);
		if (fso.FolderExists(dir))
		{
			var folder = fso.getFolder(dir);
			
			filescollection = new Enumerator(folder.files);
			
			for (; !filescollection.atEnd(); filescollection.moveNext())
				processFile(filescollection.item());
		}
		else
		{
			if (bErrMsg)
				AkelPad.MessageBox(AkelPad.GetEditWnd(), 'Папка "' + dir + '" не найдена на диске.', "AkelPad -> " + WScript.ScriptName, 0 /*MB_OK*/ + 64 /*MB_ICONINFORMATION*/);
		}
	}
}


/*
// user-defined function (copy it to the calling script)
function processFile(file)
{
	//code
}
*/