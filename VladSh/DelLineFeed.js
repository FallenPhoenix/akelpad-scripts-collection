///Delete lines feed
///������� �������� �����
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=2023#2023
// Version: 3.7 (2011.07.21)

if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
oCh.runWithRedraw();


function process()
{
	oCh.Text = oCh.getSelTextAll();
	if (oCh.Text)
	{
		oStr.flags = "gm";			//���������� ���� ��������� ���� �����, � �� ������ ������
		oCh.Text = oStr.rtrim(oCh.Text, " \t");			//�� ������ �������, ��������� �� ����� � ����� ������ ������ ��� ������, ������� ����� �������
		oCh.Text = oCh.Text.replace(/-\r/g, "");			//��������� ������, ������ <���� ��������>(������� ����, �.�. ��� ����� ���� �����, ��������� �� 2-� ����) + <������� ������>
		oCh.Text = oCh.Text.replace(/\r/g, " ");			//���������, ���������� �� �����������, ������ ����� ������
		oCh.Text = oCh.Text.replace(/  /g, " ");			//������� ������������� �������
		
		oCh.setSelCaret(oCh.rBegin[0] + oCh.Text.length);			//������ ������� - � ����� ������
	}
}