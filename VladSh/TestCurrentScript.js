///Running open in current tab script (for testing)
///Запуск открытого в текущей вкладке скрипта
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1213#1213
// Version: 1.1 (2011.02.02)
// Предлагаемая комбинация клавиш:	Alt+T

var fso = new ActiveXObject("Scripting.FileSystemObject");
var pFileName = fso.GetFileName(AkelPad.GetEditFile(0));

if (pFileName) AkelPad.Call("Scripts::Main", 1, pFileName);