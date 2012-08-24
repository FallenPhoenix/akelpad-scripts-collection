///Add the current word to the white list
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=15158#15158
// Version: 1.2 (2012.08.23)
//
// -"¬ белый список" Call("Scripts::Main", 1, "SpellCheckAddToWhiteList.js")	-	будет добавлено в белый список по текущему расширению в ASCII
// -"¬ белый список" Call("Scripts::Main", 1, "SpellCheckAddToWhiteList.js", `-ext="txt" -format=-1`)	-	будет добавлено в белый список дл€ txt в Unicode

if (! AkelPad.Include("CaretSelect.js")) WScript.Quit();

var sWord = getWordCaret();
if (!sWord) WScript.Quit();

var fso = new ActiveXObject("Scripting.FileSystemObject");

//pFormat - a constant specifying ASCII or Unicode format (тип Long) (по умолчанию 0)
//Const TristateFalse = 0 ' Opens as ASCII
//Const TristateTrue = -1 ' Opens as Unicode
//Const TristateUseDefault = -2 ' Opens as System default
var pFormat = AkelPad.GetArgValue("format", 0);

var pFileExt = AkelPad.GetArgValue("ext", "") || fso.GetExtensionName(AkelPad.GetEditFile(0)) || "txt";

var sFileNameFull = AkelPad.GetAkelDir(4) + "\\SpellCheck\\" + pFileExt + ".spck";

var oFile;
if (fso.FileExists(sFileNameFull))
	oFile = fso.OpenTextFile(sFileNameFull, 8, true, pFormat);
if (!oFile) WScript.Quit();

var sAddedText = "|" + sWord;
oFile.WriteLine(sAddedText);
oFile.Close();

var pBreakf = "\n";
AkelPad.Call("SpellCheck::Background", 1, pBreakf + "+" + pFileExt + pBreakf + sAddedText + pBreakf);