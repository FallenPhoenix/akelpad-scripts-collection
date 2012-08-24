// === [QuoteExtend.js] ===
// Panych Y.W. aka FeyFre(c) 2012
//
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=17980#17980
// http://staynormal.org.ua/akelpad/scripts/QuoteExtend.js
//
// Extends selection into delimiting quotes(parenthesis)
//
// Argument:
//	string, specifies left & right bound characters. If string consists of single character - side delimiters are equal. If opted treated as double-quote delimiter
//
// Example:
//   Call("Scripts::Main", 1, "QuoteExtend.js") - default, extend to bounding double-quotes
//   Call("Scripts::Main", 1, "QuoteExtend.js", '"') - the same
//   Call("Scripts::Main", 1, "QuoteExtend.js", "'") - extend to bounding single-quotes
//   Call("Scripts::Main", 1, "QuoteExtend.js", "()") - extend to bounding round parenthesis
//

var FR_DOWN	= 0x00000001;
var FR_UP	= 0x00100000;
var edit = AkelPad.GetEditWnd();
var doit = function(edit, quote)
{
	var qt = quote || '"';
	var ql = qt.charAt(0) || '"';
	var qr = qt.charAt(1) || ql;
	var wnd = edit || AkelPad.GetEditWnd();
	var l = AkelPad.GetSelStart();
	var r = AkelPad.GetSelEnd();
	AkelPad.SetSel(r,r);
	var fr = AkelPad.TextFind(wnd, qr, FR_DOWN);
	AkelPad.SetSel(l,l);
	var fl = AkelPad.TextFind(wnd, ql, FR_UP);
	AkelPad.SetSel(fl==-1?l:(fl+1), fr==-1?r:fr);
}

var quotes = (WScript.Arguments.length >0)? WScript.Arguments(0):'"';
if(edit)
{
	doit(edit,quotes);
}
