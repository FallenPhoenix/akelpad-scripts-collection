///Declose scriptblock
///������� ��������� (������ { ����� }) ����������� �������
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=12241#12241
// Version: 1.1 (2011.03.30)


if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();

var iSelStart = AkelPad.GetSelStart();
var iSelEnd = AkelPad.GetSelEnd();
var Range;

if (iSelStart == iSelEnd)
{
	Range = getRangebyBordersEx(iSelStart, sbOpen, sbClose, true);
	if (Range == null) WScript.Quit();
	iSelStart = Range[0];
	iSelEnd = Range[1] - 1;		//��� ��������� �������� ������
}
Range = getRangeCompleteLine(iSelStart, iSelEnd);
if (Range == null) WScript.Quit();

var pText = getTextbyRange(Range);

getShift();		//����������� ����������� ������ �� ��������

pText = pText.replace(new RegExp(pBreak + sShift, "g"), pBreak);		//������� ������ ������ �� ����� �����
pText = pText.replace(new RegExp(sbOpen), "");		//������� ����������� ���
pText = oStr.leftback(pText, sbClose);		//������� ����������� ���

if (pText.indexOf(pBreak) != 0)
	pText += sShift;		//��������������� ������� �������� ����� �����-������

AkelPad.SetSel(Range[0], Range[1]);
AkelPad.ReplaceSel(pText);