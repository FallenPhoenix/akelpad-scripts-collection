// http://akelpad.sourceforge.net/forum/viewtopic.php?p=9326#9326
// http://staynormal.org.ua/akelpad/scripts/autotag.js
//
// Version: 1.3 (2012.10.20) (by VladSh)
//   Исправлено:
//     - неправильное срабатывание после уже установленного закрывающего символа;
//     - раздвоение закрывающего символа в некоторых случаях
//   + Оптимизация кода
// Version: 1.2 (2011.06.24) (by Poma)
//     Now correctly closes tags with attributes
// Version: 1.1 (2010.09.27) (by VladSh)
//     Added handling BBCode-style tags
// Version: 1.0 (2010.09.26) (by FeyFre)
//     Initial release
//
// Examples:
//   Call("Scripts::Main", 1, "AutoTag.js", `"<" ">"`) or without arguments      ;for HTML   (Ctrl+.)
//   Call("Scripts::Main", 1, "AutoTag.js", `"[" "]"`)      ;for BBCode (Ctlr+])
// Usage:
//   For smooth integration into AkelPad you can assign hotkey for this Script, which equal keystroke correspondent closing tag style you using (i.e ] for BBCode and Shift+. for XML/HTML/SGML derived markups)

var hWndEdit = AkelPad.GetEditWnd();
if (hWndEdit)
{
	var qStart = "<";
	var qEnd = ">";
	if(WScript.Arguments.length >= 1)
	{
		qStart = WScript.Arguments(0) || qStart;
		if(WScript.Arguments.length >= 2)
		{
			qEnd = WScript.Arguments(1) || qEnd;
		}
	}

	var nCaret = AkelPad.GetSelStart();
	var lEnd = qEnd.length;
	var worker = nCaret - lEnd;
	var text = "";
	var tag = new Array();
	while(worker >= 0)
	// берём по одному символу от каретки до открывающего символа
	{
		text = AkelPad.GetTextRange(worker, worker + lEnd);
		if(text.match(/[^<(){}\[\]\\\/]/i))
		{
			// собираем тэг
			if(text != " ")
				tag.push(text);
			else
				tag = new Array();
		}
		else if(text == qStart)
		{
			// получаем тэг и добавляем
			tag = tag.reverse().join("");
			text = qStart + "/" + tag;
			if(AkelPad.GetTextRange(nCaret - lEnd, nCaret) != qEnd)
			{
				text = qEnd + text;
				nCaret += lEnd;
			}
			if(tag.substr(tag.length - lEnd) != qEnd)
				text += qEnd;
			AkelPad.ReplaceSel(text);
			AkelPad.SetSel(nCaret, nCaret);
			WScript.Quit();
		}
		else break;
		worker--;
	}
	AkelPad.ReplaceSel(qEnd);
}
