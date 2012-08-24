///Select textblock by borders
///Выделяет блок по заданным границам
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=12241#12241
// Version: 1.1 (2011.07.21)
// 
// Примеры:
// -"ScriptBlock select" Call("Scripts::Main", 1, "BlockSelect.js")		- по умолчанию (без агрументов) выделяется текстовый блок, который находится в {}
// -"SelCompleteLine" Call("Scripts::Main", 1, "BlockSelect.js", `-tagStart="\r" -tagEnd="\r" -inclTags=0`)		- полное выделение всех затронутых строк
// -"CommentBlock select" Call("Scripts::Main", 1, "BlockSelect.js", `-tagStart="/*" -tagEnd="*/"`)		- выделение блока комментариев
// -"[code]{...}[/code]" Call("Scripts::Main", 1, "BlockSelect.js", `-tagStart="[code]" -tagEnd="[/code]" -inclTags=0`) - выделение текста, находящегося между определёнными тэгами


if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();

sbOpen = escSequencesProcessing(AkelPad.GetArgValue("tagStart", sbOpen));		//тэг, с которого начинать выделение
sbClose = escSequencesProcessing(AkelPad.GetArgValue("tagEnd", sbClose));			//тэг, на котором заканчивать выделение
var bIncludeTags = AkelPad.GetArgValue("inclTags", 1);					//захватывать тэги в выделение или нет

var Range;

if (sbOpen != pBreak)
	Range = getRangebyBordersEx(AkelPad.GetSelStart(), sbOpen, sbClose, bIncludeTags);
else
	Range = getRangebyBorders(AkelPad.GetSelStart(), AkelPad.GetSelEnd(), pBreak, pBreak, bIncludeTags)

if (Range != null)
	AkelPad.SetSel(Range[0], Range[1]);