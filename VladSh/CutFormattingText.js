///Cutting text with formatting
///�������� ����� � "���������������" (� ���������� "����������" ��� �������� �����, ������������� � ������� ������� Coder)
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=13256#13256
// Version: 1.4 (2011.07.21)
// -"�������� (� ���������������)" Call("Scripts::Main", 1, "CutFormattingText.js")


var nFLAGS = AkelPad.GetArgLine() || 48;		//�� ��������� "���������� � ��������������� � ��������� ��������� ����� ������" (16+32)

var pText = AkelPad.GetSelText() || AkelPad.SetSel(0, -1) || AkelPad.GetSelText();
if (pText)
{
	if (AkelPad.Call("Coder::Settings", 4, nFLAGS) >= 0)
		AkelPad.ReplaceSel("");
}