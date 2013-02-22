///Script "library" for working with text
// must be placed in ...\Scripts\Include\
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1607#1607
// Version: 4.7 (2012.06.20)

//GLOBAL VARIABLES
var pBreak = "\r";		//by default
var pTab = "\t";
var sShift;					//shift definition (\t for Tab or Spaces)
var sbOpen = "{";
var sbClose = "}";
var nEndLineOfFile = -1;		//������ ������� � ��������� ������ �����; (�� -2 � ������� �� ������� ����������, �.�. � correctRangebyBorders ������� �������)
var pContent = "";		//���������� ����� ����������� �����; ������������ � ������������ ������ ������� �������, ����� ������� �� ������!


//"�����"-������ ����������� ������
var oCh =
{
	rBegin: [],					//������� ��������� ��� ������� ������� - ������� �������� � ����� ��� ������ � ��������� ���������
	Text: "",						//������������ ������ - ��������� ������ �������
	rResult: [],				//������� ��������� ����������� ������
	rCaret: [],					//������� ��� ��������� ��������� ����� ������ �������
	
	saveSelRange: function()						//���������� ������� ��������� ��� ������� ������� (��������������� Private-�����)
	{
		if (typeof(rBegin) == "undefined")
		{
			this.rBegin[0] = AkelPad.GetSelStart();
			this.rBegin[1] = AkelPad.GetSelEnd();
			this.rCaret = [this.rBegin[0], this.rBegin[0]];			//�� ��������� �� ��������� ������ ������ ������� � ������ ���������, ������� � ������ ������ ������������
		}
	},
	
	getSelTextEmpty: function()				//���� ����� �� �������, ���������� ������ ������
	{
		this.rResult = this.rBegin;
		
		if (this.rBegin[0] == this.rBegin[1])
			return "";
		else
			return getTextbyRange(this.rBegin);
	},
	
	getSelTextAll: function()						//���� ����� �� �������, ���������� �� ���������� �����
	{
		if (this.rBegin[0] == this.rBegin[1])
		{
			this.rResult = getTextAll();
			return pContent;
		}
		else
		{
			this.rResult = this.rBegin;
			return getTextbyRange(this.rResult);
		}
	},
	
	getTextAll: function()						//���������� �� ���������� ����� ��� �����������, �������� ���-�� ��� ���
	{
		this.rResult = getTextAll();
		return pContent;
	},
	
	setCompleteLineText: function()		//�������� ������������� �� ���������
	{
		this.rResult = getRangeCompleteLine(this.rBegin[0], this.rBegin[1]);
		this.Text = getTextbyRange(this.rResult);
	},
	
	setCompleteLineRange: function(nPosStart, nPosEnd)			//������������ � ������� �������, ����� ���������� ������ ���������� � �������� �������
	{
		this.rResult = getRangeCompleteLine(nPosStart, nPosEnd);
		this.Text = getTextbyRange(this.rResult);
	},
	
	run: function()											//�������� ����� ������� (��� ���������� ����������)
	{
		this.start();
		this.modify();
	},
	
	runWithRedraw: function()					//�������� ����� ������� (� ����������� ����������)
	{
		this.start();
		
		var hWndEdit = AkelPad.GetEditWnd();
		AutoRedrawOff(hWndEdit);
		this.modify();
		AutoRedrawOn(hWndEdit);
	},
	
	start: function()										//��������������� "Private"-�����
	{
		this.saveSelRange();
		process();								//������������ ������ ����������� �������!
	},
	
	setSelCaret: function(nCaretStart, nCaretEnd)				//��������� ���������� ���������; 2-� �������� ������������
	{
		if (nCaretStart != null)												//���� � nCaretStart ������� null - ��������� ��������� � ReplaceSel (��. ����� modify)
		{
			this.rCaret[0] = nCaretStart;
			this.rCaret[1] = nCaretEnd || nCaretStart;		//���� nCaretEnd �� ����� - ������������� ������ � ������� nCaretStart
		}
		else
			this.rCaret = null;
	},
	
	modify: function()									//��������� ������ �������: ��������� � ������ ��������� + ��������� ������� (��������������� Private-�����)
	{
		if (this.rResult != null)
		{
			AkelPad.SetSel(this.rResult[0], this.rResult[1]);
			var bSelect = (this.rCaret == null);
			AkelPad.ReplaceSel(this.Text, bSelect);
			if (!bSelect)
				AkelPad.SetSel(this.rCaret[0], this.rCaret[1]);
		}
	},
	
	testSetSelResult: function()				//������������ ��������� ��������� ����������� ������
	{
		if (this.rResult != null)
			AkelPad.SetSel(this.rResult[0], this.rResult[1]);
		else
			AkelPad.MessageBox(AkelPad.GetEditWnd(), " this.rResult = null", "oCh.testSetSelResult() function", 0 /*MB_OK*/);
		AutoRedrawOn(AkelPad.GetEditWnd());		//���� ����� ������ �������� � ������ runWithRedraw
		WScript.Quit();
	}
};

//FUNCTIONS

//���� ����� ����� �� ��������� ��������; ��������, ����� ������� "�����" ����� �����������
function getTextbyRange(Range)
{
	return AkelPad.GetTextRange(Range[0], Range[1]);
}

//����� ��� ������� �������, ����� ���� ����� �������� ���������� ������; ����� ���������� ����������� � GetTextRange
function selCompleteLine(nCaretPosStart, nCaretPosEnd)
{
	var Range = getRangeCompleteLine(nCaretPosStart, nCaretPosEnd);
	AkelPad.SetSel(Range[0], Range[1]);
}

//���������� ������� ���������� ������ ����� � ������ �������������� ��������� �����; ����� �������������� �������� -1 � -2.
function getRangeCompleteLine(nCaretPosStart, nCaretPosEnd)
{
	var hWndEdit = AkelPad.GetEditWnd();
	var Range = [];
	Range[0] = getOffset(hWndEdit, 18 /*AEGI_WRAPLINEBEGIN*/, nCaretPosStart);
	Range[1] = getOffset(hWndEdit, 19 /*AEGI_WRAPLINEEND*/, nCaretPosEnd);
	return Range;
	//return getRangebyBorders(nCaretPosStart, nCaretPosEnd, pBreak, pBreak, false);		//������ �������; ���������� �� ������ ������, ����� ������� ���������...
}

//���������� �������� �������, ������������� nType (��. ScriptConsts.js � ����� ������������).
//by Instructor function: http://akelpad.sourceforge.net/forum/viewtopic.php?p=11382#11382
function getOffset(hWndEdit, nType /*AEGI_*/, nOffset)
{
	var lpIndex;
	if (lpIndex = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/))
	{
		if (nOffset != -1)
			AkelPad.SendMessage(hWndEdit, 3137 /*AEM_RICHOFFSETTOINDEX*/, nOffset, lpIndex);
		
		AkelPad.SendMessage(hWndEdit, 3130 /*AEM_GETINDEX*/, nType, lpIndex);
		nOffset = AkelPad.SendMessage(hWndEdit, 3136 /*AEM_INDEXTORICHOFFSET*/, 0, lpIndex);
		AkelPad.MemFree(lpIndex);
	}
	return nOffset;
}

//�������� ���� �����; ��� ������ � "�������" ����� � ������� ��������� ����� saveSelRange, ����� ��������� ������� ���������
function getTextAll()
{
	var rResult = [0, nEndLineOfFile];
	pContent = pContent || getTextbyRange(rResult);			//���� ���� ����� � ���������� � ���������� ����������
	if (pContent)
		return rResult;
}

//������� ����������� ������ �� ������������ � ������������ ����
function getRangebyBorders(nMinSel, nMaxSel, pBOpen, pBClose, bIncludeBorders)
{
	var Range = [];
	if (getTextAll())
	{
		Range[1] = pContent.indexOf(pBClose, nMaxSel);							//���� ����
		Range[0] = pContent.lastIndexOf(pBOpen, nMinSel);					//���� �����
		
		Range = correctRangebyBorders(nMinSel, pBOpen, pBClose, bIncludeBorders, Range);
	}
	return Range;
}

//����������� ������ �� ������������ � ������������ ���� � ������ ����������� �� �����������
function getRangebyBordersEx(iCursor, pBOpen, pBClose, bIncludeBorders)
{
	var Range = [];
	var iStart;
	var cBOpen;
	var cBClose;
	if (!getTextAll())
		return null;
	
	var iBOpen = pContent.lastIndexOf(pBOpen, iCursor);					//���� ����� ������ ������������ ����
	var iBClose = pContent.lastIndexOf(pBClose, iCursor);					//���� ����� ������ ������������ ����
	
	if (iBOpen < iBClose)		//���� ����������� ��� ���� ������������, ������ ���������� ������ ����������� ��� ����
	{
		do
		{
			iStart = iBOpen - 1;
			iBOpen = pContent.lastIndexOf(pBOpen, iStart);		//������ ������������ ����
			if (iBOpen == -1)
				return null;			//������ �� ������������ ��� �������� ������������ ��� �������������� � ����� �����
			
			cBOpen = substringCount(pContent, iBOpen, iCursor, pBOpen);		//���������� ����������� �����
			cBClose = substringCount(pContent, iBOpen, iCursor, pBClose);		//���������� ����������� �����
		}
		while (cBOpen - 1 != cBClose);
		iBClose = iBOpen - 1;		//����� ����� � ��������� ������� (����� ���������� ������������ ����)
	}
	
	if (iBOpen > iBClose)		//���� ����������� ��� ���� ������������, ������ ���� ����������� ��� ���� �������
	{
		iStart = iCursor;
		do
		{
			iBClose = pContent.indexOf(pBClose, iStart);		//������ ������������ ����
			if (iBClose == -1)
				return null;			//������ �� ������������ ��� �������� ������������ ��� �������������� � ����� �����
			
			cBOpen = substringCount(pContent, iBOpen, iBClose, pBOpen);
			cBClose = substringCount(pContent, iBOpen, iBClose, pBClose);
			
			iStart = iBClose + 1;
		}
		while (cBOpen - 1 != cBClose);
	}
	
	Range[0] = iBOpen;
	Range[1] = iBClose;
	
	Range = correctRangebyBorders(iCursor, pBOpen, pBClose, bIncludeBorders, Range);
	
	return Range;
}

function correctRangebyBorders(nMinSel, pBOpen, pBClose, bIncludeBorders, Range)
{
	if ((Range[0] == -1 && pBOpen != pBreak) || (Range[1] == -1 && pBClose != pBreak))
		return null;
	else if (Range[0] == Range[1])			//����� ������
	{
		if (Range[0] != 0)
			Range[0] = pContent.lastIndexOf(pBOpen, nMinSel - 1);		//�������� ���� �����
		else
			bIncludeBorders = null;
	}
	
	if (bIncludeBorders != null)
	{
		if (bIncludeBorders)
			Range[1] += (pBClose.length);
		else
			Range[0] += pBOpen.length;
	}
	return Range;
}

//���������� ������� ����� ������ ������������ �������������
//����� ������������ ����� �����
//nMaxSel - ������� � �����, � ������� ����� ���������� �����;
//	��� �������� ����� ����� �������; �� ��������� ���������� ����� ������
function getRangebyBordersBack(pContent, pBOpen, pBClose, nMaxSel)
{
	var Range = [];
	var nMaxSelTmp = pContent.lastIndexOf(pBClose, nMaxSel);
	if ( !(nMaxSelTmp == -1 && pBClose == pBreak) )
		nMaxSel = nMaxSelTmp;
	if (nMaxSel != -1)
	{
		Range[1] = nMaxSel + pBClose.length;
		Range[0] = pContent.lastIndexOf(pBOpen, nMaxSel);
		var nMaxSel = Range[0];
		if (nMaxSel != -1)
			return Range;
	}
	return null;
}

//���������� ������� ������, � ������� ��������� ������� ���������
//3-� ������� ��������������� ������� - nMaxSel ��� ��������� ��������
function getTextLineRange(pContent, pText, nMaxSel)
{
	var Range = [];
	// ������� ��������� ������
	nMaxSel = pContent.lastIndexOf(pText, nMaxSel);
	if (nMaxSel != -1)
	{
		// ���� � ���������
		Range[1] = pContent.indexOf(pBreak, nMaxSel);
		if (Range[1] == -1)
			Range[1] = pContent.length;
		// ���� � ������
		Range[0] = pContent.lastIndexOf(pBreak, nMaxSel);
		if (Range[0] == -1)
			Range[0] = 0;
		var nMaxSel = Range[0];
		return Range;
	}
	return null;
}

//������� ������, � ������� ��������� ������� ���������;
//���������� ������:
//		- 1-� ������� - ���������� ������;
//		- 2-� - nMaxSel, �.�. ����� �������, ������ �������� ����� � ��������� ��������
function removeTextLine(pContent, pText, nMaxSel)
{
	var iRange = getTextLineRange(pContent, pText, nMaxSel)
	if (iRange != null)
	{
		var sRange = splitbyBorders(pContent, iRange[0], iRange[1]);
		sRange[0] = sRange[0] + sRange[1];
		sRange[1] = iRange[0];
		return sRange;
	}
	return null;
}

//������� ��� ������, � ������� ��������� ������� ���������
function removeTextLineAll(pContent, pTextRemove)
{
	var nMaxSel = pContent.length;
	do
	{
		var Range = removeTextLine(pContent, pTextRemove, nMaxSel);
		if (Range == null)
			return pContent;
		pContent = Range[0];
		nMaxSel = Range[1];
	}
	while (true);
}

//�������� ������: ����� "������" ������� ������ ������, ������ ��� ��������� ��������
//by Infocatcher code
function separateRow(line)
{
	var sNull = line.match(/^\s*/)[0];
	return {
		left: sNull,			//��������� "������" ������� ������� ������
		right: line.substr(sNull.length) 		//��� ������� ������� ������, ������ ����� "������"
    };
}

//���������� ��������� � ����������� ���������
function substringCount(pContent, nStart, nEnd, pTextSearch)
{
	var pTextSource = pContent.substring(nStart, nEnd);
	return pTextSource.split(pTextSearch).length - 1;
}

//�������� ������ � ������ �������� �������, ������������ �������� �������;
//������ ����� ��������� 2 ��������
function splitbyBorders(pText, nStart, nEnd)
{
	var arrTmp = [];
	arrTmp[0] = pText.substring(0, nStart);
	arrTmp[1] = pText.substr(nEnd);
	return arrTmp;
}

//������ �������, ������������� �������� �������, �� ���������;
//��� nStart = nEnd �����, �����������, ������������� �������
function replacebyBorders(pText, nStart, nEnd, pTextIns)
{
	return splitbyBorders(pText, nStart, nEnd).join(pTextIns);
}


//STOP redraw window (by code of the Instructor)
function AutoRedrawOff(hWndEdit)
{
	AkelPad.SendMessage(hWndEdit, 11 /*WM_SETREDRAW*/, false, 0);
}

//START redraw window (by code of the Instructor)
function AutoRedrawOn(hWndEdit)
{
	AkelPad.SendMessage(hWndEdit, 11 /*WM_SETREDRAW*/, true, 0);
	var oFunction = AkelPad.SystemFunction();
	oFunction.Call("user32::InvalidateRect", hWndEdit, 0, true);
}


//����������� �������(-��) ������ �� ��������
function getShift()
{
	if (sShift == undefined)
	{
		var bTabStopAsSpaces = AkelPad.SendMessage(AkelPad.GetMainWnd(), 1223 /*AKD_GETFRAMEINFO*/, 53 /*FI_TABSTOPASSPACES*/, 0);
		if (bTabStopAsSpaces)
		{
			var nTabStop = AkelPad.SendMessage(AkelPad.GetEditWnd(), 3239 /*AEM_GETTABSTOP*/, 0, 0);		//Number of Spaces in Tabs (take from the program settings)
			sShift = oStr.repeat(" ", nTabStop);
		}
		else
			sShift = pTab;
	}
}

function shiftRightText(pText)
{
	getShift();
	return sShift + pText.replace(/\r/g, pBreak + sShift);
}


//"�����"-������ ������������ ����������� �� ������ �� ��������
var oStr =
{
	flags: "g",		//by default
	
	ltrim: function(pText, chars)
	{
		chars = chars || "\\s";
		return pText.replace(new RegExp("^[" + chars + "]+", this.flags), "");
	},
	
	rtrim: function(pText, chars)
	{
		chars = chars || "\\s";
		return pText.replace(new RegExp("[" + chars + "]+$", this.flags), "");
	},
	
	trim: function(pText, chars)
	{
		return this.ltrim(this.rtrim(pText, chars), chars);
	},
	
	left: function(pText, pSep)
	{
		var poz = pText.indexOf(pSep);
		if (poz > 0)
			return pText.slice(0, poz);
		else
			return "";
	},
	
	right: function(pText, pSep)
	{
		var poz = pText.indexOf(pSep);
		if (poz > 0)
			return pText.slice(poz + 1, pText.length);
		else
			return "";
	},
	
	leftback: function(pText, pSep)
	{
		var poz = pText.lastIndexOf(pSep);
		if (poz > 0)
			return pText.slice(0, poz);
		else
			return "";
	},
	
	rightback: function(pText, pSep)
	{
		var poz = pText.lastIndexOf(pSep);
		if (poz > 0)
			return pText.slice(poz + 1);
		else
			return "";
	},
	
	cleanbyBorders: function(pText, pBStart, pBEnd)
	{
		//��� �������� ������� RegExp � �������� ��� ����� �.�. ������������! ���������� ���� ��������������!
		return pText.replace(new RegExp(pBStart + "*?[\\s\\S]*?" + pBEnd, this.flags), "");
	},
	
	repeat: function(pText, nCount)
	{
		return (new Array(nCount + 1)).join(pText);
	}
};

//��������� Esc-�������������������
function escSequencesProcessing(pText)
{
	if (pText)
	{
		pText = pText.replace(/\\\\/g, "\0");
	//	if (pText.search(/\\[^rnt]/g) != -1)
	//	{
			pText = pText.replace(/\\r\\n|\\r|\\n/g, "\r");
			pText = pText.replace(/\\t/g, pTab);
			pText = pText.replace(/\0/g, "\\");
	//	}
	}
	return pText;
}