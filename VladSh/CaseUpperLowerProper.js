///Change registry: mixed -> UPPER -> lower -> Proper, by analogy with Shift+F3 in MS Word
///�������� ������� ������ �� �����: ��������� -> ������� -> ������ -> �������� � ��������� �� ��������, ��� ��� ������ MS Word
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
		AkelPad.Command(4176);		//��������� � ������ �������
	else
	{
		tmpText = pText.toLowerCase();
		if (pText == tmpText)
			AkelPad.Command(4178);		//�������� � ���������
		else
			AkelPad.Command(4175);		//��������� � ������� �������
	}
}