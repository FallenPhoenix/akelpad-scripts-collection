///Copy to clipboard DateTime in specified format
///Копирование в буфер обмена даты-времени в определённом в аргументах формате
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1346#1346
// Version: 1.3 (2011.07.20)

if (! AkelPad.Include("DateFormat.js")) WScript.Quit();

AkelPad.SetClipboardText(DateFormat(""));