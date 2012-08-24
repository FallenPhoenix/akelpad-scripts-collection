///Универсальное открытие файла (диалог) по файлу
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1585#1585
// Version: 2.0 (2011.09.23)
// -"Open from Folder..." Call("Scripts::Main", 1, "OpenFromFileFolder.js", `"%f"`)

var fileName = AkelPad.GetArgLine();

//На основе текущего или выбранного файла из списка свежих
if (! AkelPad.Include("CommonFunctions.js")) WScript.Quit();

fileName = FileDialogDefault(true, GetParentClosed(fileName), GetFileExt(fileName));
if (fileName) AkelPad.OpenFile(fileName);