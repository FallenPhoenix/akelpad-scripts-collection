///Copy to clipboard file name short (%f)
///Копирование только имени файла (%f) в буфер обмена
// Version: 1.1 (2010.07.30)
// -"Только имя" Call("Scripts::Main", 1, "FileNameCopyToCB.js", `"%f"`)

if (WScript.Arguments.length)
	AkelPad.SetClipboardText(GetFileName(WScript.Arguments(0)));


function GetFileName(pFile)
{
	return pFile.slice(pFile.lastIndexOf('\\') + 1);
}