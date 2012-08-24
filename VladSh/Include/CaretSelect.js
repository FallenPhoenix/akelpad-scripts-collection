///Select the word at the cursor position
// script must be placed in ...\Scripts\Include\
///Выделение текущего слова; будет выделено, даже если курсор стоит перед первой и после последней буквы слова
// скрипт должен находиться в ..\Scripts\Include\
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=7969#7969
// Version: 2.3 (2012.08.24)

// Возвращает границы слова, на котором установлена каретка
// используется алгоритм от FeyFre
function getWordCaretRange()
{
	var nCaretPos = AkelPad.GetSelStart();
	var hWndEdit = AkelPad.GetEditWnd();
	if (hWndEdit)
	{
		var Range = [];
		Range[0] = AkelPad.SendMessage(hWndEdit, 1100 /*EM_FINDWORDBREAK */, 0/*WB_LEFT*/, nCaretPos);
		Range[1] = AkelPad.SendMessage(hWndEdit, 1100 /*EM_FINDWORDBREAK */, 7/*WB_RIGHTBREAK*/, Range[0]);
		//! For case when caret located on word start position i.e. "prev-word |word-to-copy"
		if (Range[1] < nCaretPos)
		{
			Range[0] = AkelPad.SendMessage(hWndEdit, 1100/*EM_FINDWORDBREAK*/, 0/*WB_LEFT*/, nCaretPos + 1);
			Range[1] = AkelPad.SendMessage(hWndEdit, 1100/*EM_FINDWORDBREAK*/, 7/*WB_RIGHTBREAK*/, Range[0]);
		}
		if (Range[1] >= nCaretPos) return Range;
	}
}

// Возвращает текст слова, на котором установлена каретка
function getWordCaret()
{
	var pResult = "";
	var Range = getWordCaretRange();
	if (Range) pResult = AkelPad.GetTextRange(Range[0], Range[1]);
	return pResult;
}

// Выделяет слово, на котором установлена каретка
function WordCaretSelect()
{
	var Range = getWordCaretRange();
	if (Range) AkelPad.SetSel(Range[0], Range[1]);
}


// Возвращает текст ссылки, на которой установлена каретка
// По коду KDJ:
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=19312#19312
function getLinkCaret() {
	var sURL = "";
	var hWndEdit = AkelPad.GetEditWnd();
	var oLinkInfo = getLinkInfoUnderCaret(hWndEdit);
	if (oLinkInfo) {
		var nLinkStart = AkelPad.SendMessage(hWndEdit, 3136 /*AEM_INDEXTORICHOFFSET*/, 0, oLinkInfo.lpSel);
		var nLinkEnd = AkelPad.SendMessage(hWndEdit, 3136 /*AEM_INDEXTORICHOFFSET*/, 0, oLinkInfo.lpSel + (_X64?24:12));
		memFreeLinkInfo(oLinkInfo);
		sURL = AkelPad.GetTextRange(nLinkStart, nLinkEnd);
	}
	return sURL;
}

// Выделяет ссылку, на которой установлена каретка
// По коду Instructor'а:
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=17717#17717
function LinkCaretSelect() {
	var bSelected = false;
	var hWndEdit = AkelPad.GetEditWnd();
	var oLinkInfo = getLinkInfoUnderCaret(hWndEdit);
	if (oLinkInfo) {
		AkelPad.SendMessage(hWndEdit, 3126 /*AEM_SETSEL*/, oLinkInfo.lpCaret, oLinkInfo.lpSel);
		memFreeLinkInfo(oLinkInfo);
		bSelected = true;
	}
	return bSelected;
}

// Возвращает объект с информацией о ссылке для использовании в вышележащих функциях
// По коду Instructor'а
function getLinkInfoUnderCaret(hWndEdit) {
	var lpCaret;
	var lpSel;
	if (lpCaret = AkelPad.MemAlloc(_X64?24:12 /*sizeof(AECHARINDEX)*/))
	{
		AkelPad.SendMessage(hWndEdit, 3130 /*AEM_GETINDEX*/, 5 /*AEGI_CARETCHAR*/, lpCaret);
		if (lpSel = AkelPad.MemAlloc(_X64?56:28 /*sizeof(AESELECTION)*/))
		{
			if (AkelPad.SendMessage(hWndEdit, 3149 /*AEM_INDEXINURL*/, lpCaret, lpSel))
			{
				return {
					lpCaret: lpCaret,
					lpSel: lpSel
				};
			}
			AkelPad.MemFree(lpSel);
		}
		AkelPad.MemFree(lpCaret);
	}
	return null;
}

// Возвращает память после работы с объектом информации о ссылке
function memFreeLinkInfo(oLinkInfo) {
	AkelPad.MemFree(oLinkInfo.lpSel);
	AkelPad.MemFree(oLinkInfo.lpCaret);
}