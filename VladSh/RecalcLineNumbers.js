///Recalculation of line numbers
///����������� ������� �����
// - ������� � ���, �� ������� ���������� ������
// - ���� ����� � ���������� ������� (����� ��� ��������� ���������)
// 
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=4890#4890
// Version: 1.0 (2011.07.19)
// 
// ������������ ���������� ������: Alt + Shift + N

//O������, � �������� ����� ���������� ��� ����������� ������
var nonNullIndexBase;		//������ ������� ��������� �������
var pSymbolBase;				//�������, ������� ���� ����� �� ������
var pNumberBase;				//�������

if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
if (! AkelPad.Include("ProcessRowText.js")) WScript.Quit();

oCh.runWithRedraw();


function process()
{
	var nSelStart = AkelPad.GetSelStart();
	if (nSelStart == AkelPad.GetSelEnd())
		oCh.setCompleteLineRange(nSelStart, -2);		//���� ����� �� ������, �� ������� ����� ������ � �� ����� �����
	else
		oCh.setCompleteLineRange(nSelStart, AkelPad.GetSelEnd());
	
	oCh.Text = processRowText(oCh.Text, pBreak);
}


function processString(s)
{
	//code modify the string s...
	var pResult;		//������, � ������� ���������� ���������
	
	var nonNullIndex = s.lastIndexOf(oStr.trim(s, " \t"));
	if (nonNullIndexBase == undefined) nonNullIndexBase = nonNullIndex;
	
	if (nonNullIndex == nonNullIndexBase)
	{
		var shiftExistent = s.slice(0, nonNullIndex);		//������ 1-�� ��������� ������� �� ������ ������
		
		var nShiftStart = s.indexOf(" ", nonNullIndex) || s.indexOf("\t", nonNullIndex);		//������ ������ ������� ������ �� ������
		
		var pSymbol = s.slice(nonNullIndex, nShiftStart);		//������ ������
		
		if (pSymbol.length <= 5)
		{
			var pNumber = parseInt(pSymbol);
			if (!isNaN(pNumber))
			{
				pSymbol = pSymbol.replace(new RegExp(pNumber), "");
				if (pSymbol)
				{
					if (!pSymbolBase) pSymbolBase = pSymbol;
					
					if (pSymbol == pSymbolBase)
					{
						if (pNumberBase) pNumberBase += 1; else pNumberBase = pNumber;
						
						pSymbol = pNumberBase + pSymbol;
						var pRowText = s.slice(nShiftStart);		//����� �� ������ ������� ������
						
						pResult = shiftExistent + pSymbol + pRowText;
					}
				}
			}
		}
	}
	
	if (!pResult) pResult = s;
	return pResult;
}

function addToResult(arrOutput, vResult)
{
	arrOutput[arrOutput.length] = vResult;
}