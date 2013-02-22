///Select textblock by borders
///�������� ���� �� �������� ��������
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=12241#12241
// Version: 1.1 (2011.07.21)
// 
// �������:
// -"ScriptBlock select" Call("Scripts::Main", 1, "BlockSelect.js")		- �� ��������� (��� ����������) ���������� ��������� ����, ������� ��������� � {}
// -"SelCompleteLine" Call("Scripts::Main", 1, "BlockSelect.js", `-tagStart="\r" -tagEnd="\r" -inclTags=0`)		- ������ ��������� ���� ���������� �����
// -"CommentBlock select" Call("Scripts::Main", 1, "BlockSelect.js", `-tagStart="/*" -tagEnd="*/"`)		- ��������� ����� ������������
// -"[code]{...}[/code]" Call("Scripts::Main", 1, "BlockSelect.js", `-tagStart="[code]" -tagEnd="[/code]" -inclTags=0`) - ��������� ������, ������������ ����� ������������ ������


if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();

sbOpen = escSequencesProcessing(AkelPad.GetArgValue("tagStart", sbOpen));		//���, � �������� �������� ���������
sbClose = escSequencesProcessing(AkelPad.GetArgValue("tagEnd", sbClose));			//���, �� ������� ����������� ���������
var bIncludeTags = AkelPad.GetArgValue("inclTags", 1);					//����������� ���� � ��������� ��� ���

var Range;

if (sbOpen != pBreak)
	Range = getRangebyBordersEx(AkelPad.GetSelStart(), sbOpen, sbClose, bIncludeTags);
else
	Range = getRangebyBorders(AkelPad.GetSelStart(), AkelPad.GetSelEnd(), pBreak, pBreak, bIncludeTags)

if (Range != null)
	AkelPad.SetSel(Range[0], Range[1]);