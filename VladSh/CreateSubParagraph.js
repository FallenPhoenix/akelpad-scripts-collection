///�������� ����� ������ � �������� � ������������ ����� ������; �������������� ���������������� ��������� �����
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=4890#4890
// Version: 4.6 (2011.07.19)

if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
oCh.runWithRedraw();

function process()
{
	var nCursor = AkelPad.GetSelEnd();
	oCh.setCompleteLineRange(nCursor, nCursor);
	
	var nonNullIndex = oCh.Text.lastIndexOf(oStr.trim(oCh.Text, " \t"));		//������ ������� ��������� �������
	var shiftExistent = oCh.Text.slice(0, nonNullIndex);		//������ 1-�� ��������� ������� �� ������ ������
	
	var nShiftStart = oCh.Text.indexOf(" ", nonNullIndex) || oCh.Text.indexOf("\t", nonNullIndex);		//������ ������ ������� ������ �� ������
	var pSymbol = oCh.Text.slice(nonNullIndex, nShiftStart);		//������ ������
	
	nCursor = nCursor - oCh.rResult[0];
	if (nCursor < nShiftStart) nCursor = nShiftStart;
	
	var pTextLeft = oCh.Text.substr(0, nCursor);		//����� ������ �� ������� (������� �� ������� ������)
	var pTextRight = oStr.ltrim(oCh.Text.substr(nCursor), " \t");		//����� ������ ����� ������� (����������� � ����� ������)
	
	var shiftAfterSymbol = "";
	if (pSymbol.length <= 5)
	{
		shiftAfterSymbol = oCh.Text.slice(nShiftStart);
		if (oStr.trim(shiftAfterSymbol, " \t"))		//���� � ������ ����� ������� ������ ���-�� ����
		{
			var nShiftEnd = oCh.Text.indexOf(oStr.trim(shiftAfterSymbol, " \t"), nShiftStart);
			shiftAfterSymbol = oCh.Text.slice(nShiftStart, nShiftEnd);		//������ ����� �������� ������ � �������
		}
	}
	else
		pSymbol = "";
	
	var pNumber = parseInt(pSymbol);
	if (!isNaN(pNumber))
	{
		pSymbol = pSymbol.replace(new RegExp(pNumber), "");
		pSymbol = (pNumber + 1) + pSymbol;
	}
	
	oCh.Text = pTextLeft + pBreak + shiftExistent + pSymbol + shiftAfterSymbol + pTextRight;

	oCh.setSelCaret(oCh.rResult[0] + oCh.Text.length);		//������ ������� ����� ������������ ������
}