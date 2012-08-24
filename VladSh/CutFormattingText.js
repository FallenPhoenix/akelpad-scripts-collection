///Cutting text with formatting
///¬ырезает текст с "форматированием" (с подсветкой "синтаксиса" дл€ текущего файла, установленной с помощью плагина Coder)
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=13256#13256
// Version: 1.4 (2011.07.21)
// -"¬ырезать (с форматированием)" Call("Scripts::Main", 1, "CutFormattingText.js")


var nFLAGS = AkelPad.GetArgLine() || 48;		//по умолчанию "копировать с форматированием и заполн€ть текстовый буфер обмена" (16+32)

var pText = AkelPad.GetSelText() || AkelPad.SetSel(0, -1) || AkelPad.GetSelText();
if (pText)
{
	if (AkelPad.Call("Coder::Settings", 4, nFLAGS) >= 0)
		AkelPad.ReplaceSel("");
}