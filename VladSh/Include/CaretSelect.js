///Select the word at the cursor position
// script must be placed in ...\Scripts\Include\
///��������� �������� �����; ����� ��������, ���� ���� ������ ����� ����� ������ � ����� ��������� ����� �����
// ������ ������ ���������� � ..\Scripts\Include\
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=7969#7969
// Version: 2.4 (2012.09.10)

// ���������� ������� �����, �� ������� ����������� �������
// ������������ �������� �� FeyFre: http://akelpad.sourceforge.net/forum/viewtopic.php?p=7973#7973
function getWordCaretInfo(hWndEdit) {
	if (hWndEdit) {
		var nCaretPos = AkelPad.GetSelStart();
		var crInfo = [];
		crInfo.min = AkelPad.SendMessage(hWndEdit, 1100 /*EM_FINDWORDBREAK */, 0/*WB_LEFT*/, nCaretPos);
		crInfo.max = AkelPad.SendMessage(hWndEdit, 1100 /*EM_FINDWORDBREAK */, 7/*WB_RIGHTBREAK*/, crInfo.min);
		//! For case when caret located on word start position i.e. "prev-word |word-to-copy"
		if (crInfo.max < nCaretPos)
		{
			crInfo.min = AkelPad.SendMessage(hWndEdit, 1100/*EM_FINDWORDBREAK*/, 0/*WB_LEFT*/, nCaretPos + 1);
			crInfo.max = AkelPad.SendMessage(hWndEdit, 1100/*EM_FINDWORDBREAK*/, 7/*WB_RIGHTBREAK*/, crInfo.min);
		}
		if (crInfo.max >= nCaretPos)
			return crInfo;
	}
}

// ���������� ����� �����, �� ������� ����������� �������
function getWordCaret() {
	var sResult = "";
	var hWndEdit = AkelPad.GetEditWnd();
	var crInfo = getWordCaretInfo(hWndEdit);
	if (crInfo) sResult = AkelPad.GetTextRange(crInfo.min, crInfo.max);
	return sResult;
}

// �������� �����, �� ������� ����������� �������
function WordCaretSelect() {
	var bSelected = false;
	var hWndEdit = AkelPad.GetEditWnd();
	var crInfo = getWordCaretInfo(hWndEdit);
	if (crInfo) {
		if (crInfo) AkelPad.SetSel(crInfo.min, crInfo.max);
		bSelected = true;
	}
	return bSelected;
}


// ���������� ������� ������, �� ������� ����������� �������
// ��� KDJ, VladSh, Instructor; ������� ������: http://akelpad.sourceforge.net/forum/viewtopic.php?p=19312#19312
function getLinkCaretInfo(hWndEdit) {
	if (hWndEdit) {
		var bResult = false;
		var lpCaret;
		var lpInfo;
		var crInfo = [];
		if (lpCaret = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/))
		{
			AkelPad.SendMessage(hWndEdit, 3130 /*AEM_GETINDEX*/, 5 /*AEGI_CARETCHAR*/, lpCaret);
			if (lpInfo = AkelPad.MemAlloc(_X64 ? 48 : 24 /*sizeof(AECHARInfo)*/))
			{
				if (AkelPad.SendMessage(hWndEdit, 3149 /*AEM_INDEXINURL*/, lpCaret, lpInfo))
				{
					crInfo.min = AkelPad.SendMessage(hWndEdit, 3136 /*AEM_INDEXTORICHOFFSET*/, 0, lpInfo);
					crInfo.max = AkelPad.SendMessage(hWndEdit, 3136 /*AEM_INDEXTORICHOFFSET*/, 0, lpInfo + (_X64 ? 24 : 12) /*offsetof(AECHARInfo, ciMax)*/);
					bResult = true;
				}
				AkelPad.MemFree(lpInfo);
			}
			AkelPad.MemFree(lpCaret);
		}
		if (bResult)
			return crInfo;
	}
}

// ���������� ����� ������, �� ������� ����������� �������
function getLinkCaret() {
	var sResult = "";
	var hWndEdit = AkelPad.GetEditWnd();
	var crInfo = getLinkCaretInfo(hWndEdit);
	if (crInfo) sResult = AkelPad.GetTextRange(crInfo.min, crInfo.max);
	return sResult;
}

// �������� ������, �� ������� ����������� �������
function LinkCaretSelect() {
	var bSelected = false;
	var hWndEdit = AkelPad.GetEditWnd();
	var crInfo = getLinkCaretInfo(hWndEdit);
	if (crInfo) {
		if (crInfo) AkelPad.SetSel(crInfo.min, crInfo.max);
		bSelected = true;
	}
	return bSelected;
}