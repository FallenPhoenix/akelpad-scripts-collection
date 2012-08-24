///Change registry: mixed -> UPPER -> lower -> Proper, by analogy with Shift+F3 in MS Word
///Изменяет регистр текста по кругу: смешанный -> ВЕРХНИЙ -> нижний -> Начинать С Прописных по аналогии, как это делает MS Word
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=12318#12318
// Version: 1.1 (2012.08.23)


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
	{
		tmpText = pText.toLowerCase();
		if (pText == tmpText)
			AkelPad.Command(4178);		//Начинать С Прописных
		else
			AkelPad.Command(4175);		//переводим в ВЕРХНИЙ регистр
	}
}