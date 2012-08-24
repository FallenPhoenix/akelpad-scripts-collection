///Opens all files located in the folder
///Открывает все файлы, находящиеся в папке
// -"Открыть все файлы папки" Call("Scripts::Main", 1, "OpenAllFilesFromFileFolder.js", `"%f"`) Icon("%a\AkelFiles\Plugs\Coder.dll", 1)
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=8303#8303
// Version: 1.3 (2011.03.22)

var path = "";

if (WScript.Arguments.length)
	path = WScript.Arguments(0);
else
	path = AkelPad.GetEditFile(0);

if (! AkelPad.Include("ProcessFolderFiles.js")) WScript.Quit();
//if (typeof(processFolderFiles) == "function")		//Проверка, подключена ли функция, т.к. подключаемого скрипта может не быть на диске (оставил для памяти)
processFolderFiles(path, true);


function processFile(file)
{
	AkelPad.OpenFile(file);
}