///Rename current editing file with dialog
///Переименование текущего файла
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1584#1584
// Version: 2.8 (2011.07.21)
// 
// Аргумент -ext (1/0) - по умолчанию (1) отображает в окошке расширение, (0) - не отображает
// -"RenameFile..." Call("Scripts::Main", 1, "RenameFileDialog.js", `"-ext=0"`)		- меняет только имя файла
// 
//		- если необходимо заменить имя файла с расширением, то необходимо в окошке дописать к имени файла новое расширение;
//		- если необходимо удалить расширение, то после имени файла достаточно поставить точку

var hMainWnd = AkelPad.GetMainWnd();

var fileNameFull = AkelPad.GetEditFile(0);
if (fileNameFull)		//File already exist
{
	if (! AkelPad.Include("CommonFunctions.js")) WScript.Quit();
	
	var useExt = AkelPad.GetArgValue("ext", 1);
	
	var File = SeparateFile(fileNameFull);
	var extInfo = "";
	
	var fileSelect;
	if (useExt == true && File.ext)
		fileSelect = File.name + "." + File.ext;
	else
	{
		fileSelect = File.name;
		if (File.ext) extInfo = " for *." + File.ext;
	}
	
	var pScriptName = WScript.ScriptName;
	var Prompt = "New name" + extInfo + ":";
	var fileSelectNew = "";
	var fileNameNew = "";
	var fso;
	var fileExist;
	
	if (hMainWnd)
	{
		fso = new ActiveXObject("Scripting.FileSystemObject");
		
		do
		{
			fileSelectNew = AkelPad.InputBox(hMainWnd, pScriptName, Prompt, fileSelect);
			if (fileSelectNew)
			{
				fileSelectNew = CorrectFileName(fileSelectNew);			//Remove special symbols
				if (useExt == true || File.ext == "" || fileSelectNew.lastIndexOf(".") != -1)
					fileNameNew = fileSelectNew;
				else
					fileNameNew = fileSelectNew + "." + File.ext;
				
				var fileNameFullNew = File.path + fileNameNew;
				
				if (fileSelectNew != "" & (fileNameFullNew != fileNameFull))
				{
					fileExist = fso.FileExists(fileNameFullNew);
					if (fileExist == false)							//Check already newFileName existent
					{
						var nSelStart = AkelPad.GetSelStart();
						var nSelEnd = AkelPad.GetSelEnd();
						
						AkelPad.Command(4324);			//Close editing file
						
						if (AkelPad.GetEditFile(0) != fileNameFull)			//Check noCANCEL click for changed document!
						{
							var Err;
							//Rename file
							try {fso.MoveFile(fileNameFull, fileNameFullNew);}
							catch(e)
							{
								Err = e;
								fileNameFullNew = fileNameFull;
							}
							
							if (fso.FileExists(fileNameFullNew) == true)
							{
								//Open file
								AkelPad.OpenFile(fileNameFullNew);
								
								//Recovery selection
								AkelPad.SetSel(nSelStart, nSelEnd);
							}
							if (Err)
							{
								if (0x100000000 + Err.number == 0x800a0046)
									AkelPad.MessageBox(hMainWnd, "Insufficient rights, or file is locked by another application!", "AkelPad -> " + WScript.ScriptName, 48);
								else
									throw Err;
							}
						}
					}
				else
				{
					Prompt = "File '" + fileNameNew + "' already exist!  Input other filename" + extInfo + ":";
				}
			}
		}
		else
		{
			break;
		}
	}
		while (fileExist);
	}
}
else					//File is new - try new document save
	AkelPad.Command(4106)