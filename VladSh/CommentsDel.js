///Decommented text or block of text
// variants comments see included CommentsExt.js
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1653#1653
// Version: 3.7 (2011.09.22)
// 
// Proposed to use a keyboard shortcut in Scripts-plugin box: Ctrl + \

if (! AkelPad.Include("CommentsExt.js")) WScript.Quit();
if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();

setComments(getFileExt(AkelPad.GetEditFile(0)));
oCh.run();


function process()
{
	var bSimple = false;
	var nCaretPos = AkelPad.GetSelEnd();
	var pSelText = "";
	
	if (cSimple != null)
	{
		//��������: �������� ��� ������� �����������
		oCh.setCompleteLineText();
		
		if (oCh.Text.indexOf(cSimple) != -1)			//������ �� ��������� �������������
		{
			pSelText = oCh.Text;		//���������� ��� ������������� ������� ������� �� ���������� �������� ������������
			
			var arrText = oCh.Text.split(pBreak);
			for (var nLine = 0; nLine < arrText.length; nLine++)
				arrText[nLine] = arrText[nLine].replace(cSimple, "");
			oCh.Text = arrText.join(pBreak);
			
			nCaretPos -= (pSelText.length - oCh.Text.length);
			if (nCaretPos < oCh.rResult[0]) nCaretPos = oCh.rResult[0];	//����� ������� ���������� ����� ����� �� ����������� ������ ����������..
			bSimple = true;
		}
	}
	
	if (!bSimple && cBlockOpen)			//������ � ������� ������������
	{
		oCh.rResult = getRangebyBorders(nCaretPos, nCaretPos, cBlockOpen, cBlockClose, true);
		if (oCh.rResult == null)
			quitIsNotComment();		//���� ���� �����-�� ����� �������� �� �������, ������ ������� ����������� �������
		
		oCh.Text = getTextbyRange(oCh.rResult);
		
		oCh.Text = oCh.Text.substr(cBlockOpen.length, oCh.Text.length - cBlockOpen.length - cBlockClose.length - (oCh.Text.charAt(oCh.Text.length) == pBreak));		//���� ������ ��� ��������� � ������� ���������; ��������� ����� � ������� - ������ �������� ������ � ������������� ������������
		
		if (oCh.Text.indexOf(cBlockOpen) != -1 || (oCh.Text.indexOf(cBlockClose) != -1))
			quitIsNotComment();		//���� ������ ������ ������ ��������������� �������, ������� ��� ������� ����������� �������
		
		pSelText = oCh.Text;		//���������� ��� ������������� ������� ������� �� ���������� ��������� ������� ��������� �����
		//����������� ������������� ������: ����� �������� �������� �����
		oCh.Text = oStr.ltrim(oCh.Text, pBreak);
		nCaretPos -= (cBlockOpen.length + (pSelText.length - oCh.Text.length));		//��������� �����, �.�. ��� ������ ������� ����� ������ ������� �����: ������ ������������ �������� � ��������� ������� ������
		oCh.Text = oStr.rtrim(oCh.Text, pBreak);
	}
	
	oCh.setSelCaret(nCaretPos);
}

function quitIsNotComment()
{
	AkelPad.MessageBox(AkelPad.GetEditWnd(), "������ ���������� �� � ������, ��� ���� �����������, ���� �� ��������� ����� �����������.", WScript.ScriptName, 64 /*MB_INFORMATION*/);
	WScript.Quit();
}