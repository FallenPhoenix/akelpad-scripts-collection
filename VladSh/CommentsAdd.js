///Commented text or block of text
// variants comments see included CommentsExt.js
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1653#1653
// Version: 3.6 (2011.03.25)
// 
// Proposed to use a keyboard shortcut in Scripts-plugin box: Ctrl + /

if (! AkelPad.Include("CommentsExt.js")) WScript.Quit();
if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();

setComments(getFileExt(AkelPad.GetEditFile(0)));
oCh.run();


function process()
{
	var nCaretPos = 0;
	
	oCh.Text = oCh.getSelTextEmpty();
	
	if (oCh.Text.length)
	{
		if (!cBlockOpen)
			WScript.Quit();		//���� ������� �������� �� �������������� - �������
		
		var tmpText = oStr.rtrim(oCh.Text, pBreak);
		var nDiff = oCh.Text.length - tmpText.length;
		if (nDiff)		//���� ������� ������ � ����� ��������� ��������
		{
			oCh.Text = tmpText;
			oCh.rBegin[1] -= nDiff;		//��� ���������� ����������� ������� ��������� ����� (���� �� ������� ���������) � ������� setCompleteLineText
		}
		
		var pBreakValue = "";
		if (oCh.Text.indexOf(pBreak) !== -1)		//���� ���������� ����� � ��������� �����
		{
			oCh.setCompleteLineText();
			if (!nDiff) pBreakValue = pBreak;		//��������� ��� ����������� NoSelEOL - �������� ����� ������ ������ �� �����������
		}
		
		oCh.Text = cBlockOpen + pBreakValue + oCh.Text + pBreakValue + cBlockClose;
		nCaretPos = oCh.rBegin[0] + (pBreakValue + cBlockOpen).length;
	}
	else
	{
		if (!cSimple)
			WScript.Quit();		//���� ������� �������� �� �������������� - �������
		
		oCh.setCompleteLineText();
		oCh.Text = cSimple + oCh.Text;
		nCaretPos = oCh.rBegin[0] + cSimple.length;
	}
	
	oCh.setSelCaret(nCaretPos);		//� ���� ������� ��������������� �������������� ��������� �������
}