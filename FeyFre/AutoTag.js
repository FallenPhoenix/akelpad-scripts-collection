// http://akelpad.sourceforge.net/forum/viewtopic.php?p=9326#9326
//
// Version: 1.2 (2011.06.24) (by Poma)
//    Now correctly closes tags with attributes
// Version: 1.1 (2010.09.27) (by VladSh)
//    Added handling BBCode-style tags
// Version: 1.0 (2010.09.26) (by FeyFre)
//    Initial release
//
// Examples:
// Call("Scripts::Main", 1, "AutoTag.js", `"<" ">"`) or without arguments      ;for HTML   (Ctrl+.)
// Call("Scripts::Main", 1, "AutoTag.js", `"[" "]"`)      ;for BBCode (Ctlr+])
// Usage:
// For smooth integration into AkelPad you can assign hotkey for this Script, which equal keystroke correspondent closing tag style you using (i.e ] for BBCode and Shift+. for XML/HTML/SGML derived markups)
//
// CONST
var WM_USER               = 0x0400;
var EM_EXGETSEL            = WM_USER + 52;
var EM_SETSEL            = 0x00B1
var sizeof_CHARRANGE      = 8;         // 2*sizeof(LONG)
var DT_DWORD            = 3;

var edit = AkelPad.GetEditWnd();
if (edit)
{
	var sbStart = "<";
	var sbEnd = ">";
	if (WScript.Arguments.length >= 1)
	{
		sbStart = WScript.Arguments(0) || sbStart;
		if (WScript.Arguments.length >= 2)
		{
			sbEnd = WScript.Arguments(1) || sbEnd;
		}
	}
	
	var /*CHARRANGE*/pos = AkelPad.MemAlloc(sizeof_CHARRANGE);
	AkelPad.SendMessage(edit, EM_EXGETSEL, 0, pos);
	var sel_s = AkelPad.MemRead(pos, DT_DWORD);
	var sel_f = AkelPad.MemRead(pos + 4, DT_DWORD);
	var caret = sel_f;
	if (sel_s != sel_f)
	{
		//! Have selection. Anchor point is its start
		caret = sel_s;
	}
	var worker = caret - 1;
	var text = "";
	var match = false;
	while (worker >= 0)
	{
		text = AkelPad.GetTextRange(worker, worker + 1);
		if (text.match(/[^<>(){}\[\]\\\/]/i))
		{
			//! Good :)
		}
		else if (text == sbStart)
		{
			match = true;
			break;
		}
		else break;
		worker --;
	}
	if (match)
	{
		var tagEnd = worker + 1;
		while (tagEnd < caret && AkelPad.GetTextRange(tagEnd, tagEnd + 1) != " ")
			tagEnd++;   
	
		var tag = AkelPad.GetTextRange(worker + 1, tagEnd);
		AkelPad.ReplaceSel(sbEnd + sbStart + "/" + tag + sbEnd);
		//! Position caret into block
		AkelPad.SendMessage(edit, EM_SETSEL, caret + 1, caret + 1)
	}
	else
	{
		AkelPad.ReplaceSel(sbEnd);
	}
	AkelPad.MemFree(pos);
}