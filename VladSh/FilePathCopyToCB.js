///Copy to clipboard file name full (%f) or file directory (%d)
///Копирование полного имени файла (%f) или папки (%d) в буфер обмена
// Version: 1.1 (2010.07.30)
// -"Полное имя файла" Call("Scripts::Main", 1, "FilePathCopyToCB.js", `"%f"`)

if (WScript.Arguments.length)
   AkelPad.SetClipboardText(WScript.Arguments(0));