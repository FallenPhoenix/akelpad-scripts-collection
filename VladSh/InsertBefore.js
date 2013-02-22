///Insert any values before each line
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1976#1976
// Version: 3.8 (2011.10.18)
// 
// ���������:
// text							- ����������� ����� ���������� �����
// fillEmpty	(0/1)	- ��������� �� � ������ ������
// selAll			(1/0)	- �������� �� (������������ �� ��� ������), ���� ������ �� ��������
// 
// ������� �������:
// 
// -"> ..." Call("Scripts::Main", 1, "InsertBefore.js")			-	������� "������" ��� ������ �� ������ � "��������"-����� (�������� ��� ������ ������ InsertInetStyleQuote.js)
// -"�������� ������ ������" Call("Scripts::Main", 1, "InsertBefore.js", `-text="� " -selAll=0`)


if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
oCh.runWithRedraw();

function process()
{
	var txtInserted = AkelPad.GetArgValue("text", "> ");
	var bFillEmptyString = AkelPad.GetArgValue("fillEmpty", 0);
	var bSelAllisNoSelected = AkelPad.GetArgValue("selAll", 1);
	var nCaret = -1;
	
	if (oCh.rBegin[0] == oCh.rBegin[1])
	{
		if (bSelAllisNoSelected)
			oCh.Text = oCh.getSelTextAll();		//�������� ���� �����
		else
		{
		   //������� ������� � ������� �������
		   oCh.rResult = oCh.rBegin;
		   oCh.Text = txtInserted;
		   nCaret = getOffset(AkelPad.GetEditWnd(), 19 /*AEGI_WRAPLINEEND*/, oCh.rResult[0]) + oCh.Text.length;
		   oCh.setSelCaret(nCaret);
		   return;
		}
	}
	if (!oCh.Text)
		oCh.setCompleteLineText();					//�������� ���������� ������
	
	if (oCh.Text.length)
	{
		var arrRow = oCh.Text.split(pBreak);
		
		var r = 0;		//2 �����: ������� ������� �� ���� - �������� ������ �������
		if (bFillEmptyString)
		{
			for (; r < arrRow.length; r++)
				arrRow[r] = txtInserted + arrRow[r];
		}
		else
		{
			for (; r < arrRow.length; r++)
				if (oStr.trim(arrRow[r], " \t")) arrRow[r] = txtInserted + arrRow[r];
		}
		
		var tmpVar = arrRow.join(pBreak);
		
		if (oCh.Text.length != tmpVar.length)
			oCh.Text = tmpVar;
		else
			oCh.Text = tmpVar + txtInserted;		//��� ���� ������ (��������, ���������� ���������), � � ��� ������ � ����� �� ����������
		
		//�������� ��������� �������� ����� ������������ ������
		tmpVar = oStr.rtrim(oStr.repeat(txtInserted, 2), " ");
		var oR = new RegExp(tmpVar, "g");
		tmpVar = tmpVar.replace(/ /g, "");
		tmpVar = tmpVar.replace(/\t/g, "");
		oCh.Text = oCh.Text.replace(oR, tmpVar);
		
		nCaret = oCh.Text.indexOf(pBreak);
	}
	else
		oCh.Text = txtInserted;
	
	//������������� ������� ����� �� �� ������ �������: ����� �����, ��� ���� ������ �������, � ��� ������������� ������ ��������� ������� �� ������ ������ (�������� � ������� ������� CreateSubParagraph.js)
	nCaret = oCh.rResult[0] + (nCaret != -1 ? nCaret : oCh.Text.length);
	oCh.setSelCaret(nCaret);
}