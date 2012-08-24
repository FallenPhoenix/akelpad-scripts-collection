///Change registry: mixed -> UPPER <-> lower
///Изменяет регистр текста по кругу: смешанный -> ВЕРХНИЙ -> нижний
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=12318#12318
// Version: 1.4 (2012.08.23)


var pText = AkelPad.GetSelText();
if (!pText)
{
	if (! AkelPad.Include("CaretSelect.js")) WScript.Quit();
	WordCaretSelect();
	pText = AkelPad.GetSelText();
}

if (pText)
{
	var tmpText = pText.toUpperCase();
	if (pText == tmpText)
		AkelPad.Command(4176);		//переводим в нижний регистр
	else
		AkelPad.Command(4175);		//переводим в ВЕРХНИЙ регистр
}