///Correction of Cyrillic characters of Clipboard
///������������� ������������� �������� ������ ������
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1413#1413
// Version: 2.2 (2011.07.20)

//�������� (��������) ������ �����
AkelPad.Command(4101);

//��� �������� ��� ������� ������ � ���� ����������; ������� ��������� ������, ����� �������� ����� ������, �� ���� ���������, �������� �� ��� ��� ���, � ���� ���, ����� ������, ��� ��������� ������ �������� � 2-� ���������
//AkelPad.ReplaceSel(AkelPad.GetClipboardText());

//������������� ������ � ���� "��������" (����� ����� ������� ���� ������); ��. http://akelpad.sourceforge.net/forum/viewtopic.php?p=1306#1306
AkelPad.Command(4191);

AkelPad.SetSel(0, -2);

AkelPad.SetClipboardText(AkelPad.GetSelText());

AkelPad.SendMessage(AkelPad.GetMainWnd(), 1229 /*AKD_SETMODIFY*/, 0, false);		//�������� ��� ��������������, ����� �� ����������, ��������� ��� ���
AkelPad.Command(4318);		//��������� ������� �������