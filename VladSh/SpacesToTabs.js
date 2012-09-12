///Convert space to tabulation
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=7947#7947
// Version: 3.1 (2012.09.12) - добален функционал + некоторые идеи вз€ты из соответствующего скрипта от F.Phoenix (2012-08-18a)
//
// Arguments:
//		lead:
//			Х 0 - processing of all text (used for vertical text blocks)
//			Х [1] - processing of lead spaces only (used for scripts)
//		bSpaces - definition of count of spaces in block:
//			Х [0] - from program settings
//			Х -1 - InputBox
//			Х > 0 - count of spaces to be replaced by a tab
//		oActn - what to do with other (the residual) single-spaces:
//			Х [0] (or without this argument) - do nothing, to limit the processing of block spaces only (used for scripts)
//			Х 1 - replace single-spaces
//			Х -1 - remove single-spaces (can also be used for scripts)
//		sel (0/1) - leave the result text selected; without this argument it defined automatically
//
//	Example:
//		-"Convert space to tabulation" Call("Scripts::Main", 1, "SpacesToTabs.js") - script process by default options: processing of lead spaces only, definition of count of spaces in block from program settings, residual single-spaces will not be processed

var constsDefault = {
	msgp_SpasesInTab: "Enter the number of spaces in a tab character:",
	msgp_InputNaN: "Input non-numeric value, the operation is canceled.",
	msgp_ArgumentNaN: "Arguments passed a non-numeric value, the operation is canceled."
};

if (AkelPad.GetMainWnd()) {
	var hWndEdit = AkelPad.GetEditWnd();
	
	var bTextSelected = true;
	var pSelText = AkelPad.GetSelText();
	if (!pSelText) {
		pSelText = AkelPad.GetTextRange(0, -1);
		bTextSelected = false;
	}
	if (!pSelText) WScript.Quit();
	
	var sReplaced = "\t";		// замен€ющий текст
	var nTabStop;
	var nBSAction = AkelPad.GetArgValue("bSpaces", 0);
	if (nBSAction <= 0) {
		//0 - from program settings
		var nTabStop = AkelPad.SendMessage(hWndEdit, 3239 /*AEM_GETTABSTOP*/, 0, 0);
		// InputBox
		if (nBSAction == -1) {
			if (!(nTabStop = AkelPad.InputBox(hWndEdit, WScript.ScriptName, getConst("msgp_SpasesInTab"), nTabStop))) WScript.Quit();
			checkTabStopIsNaN(hWndEdit, nTabStop, "msgp_InputNaN");
		}
	}
	else {
		checkTabStopIsNaN(hWndEdit, nBSAction, "msgp_ArgumentNaN");
		nTabStop = nBSAction;
	}
	
	// ќбработка блоков из определЄнного количества пробелов
	if (AkelPad.GetArgValue("lead", 1)) {
		// обработка только лидирующиех пробелов
		pSelText = pSelText.replace(/^\s+/mg, replacer);
	}
	else {
		// обработка пробелов всего текста (дл€ вертикальных блоков)
		pSelText = replacer(pSelText);
		
		// ќбработка оставшихс€ пробелов
		var nOSAction = AkelPad.GetArgValue("oActn", 0);
		if (nOSAction != 0) {
			//replace residual space on a Tab character or remove it
			sReplaced = (nOSAction == 1) ? "\t" : "";
			pSelText = pSelText.replace(/ /g, sReplaced);
		}
	}
	
	if (!bTextSelected) AkelPad.SetSel(0, -1);
	var bTextSelected = AkelPad.GetArgValue("sel", bTextSelected);
	AkelPad.ReplaceSel(pSelText, bTextSelected);
}

function checkTabStopIsNaN(hWndEdit, nTabStop, pPlaceActionMsg) {
	if (isNaN(nTabStop))	{
		AkelPad.MessageBox(hWndEdit, getConst(pPlaceActionMsg), WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/);			//press Cancel
		WScript.Quit();
	}
}

function replacer(str) {
	for (var nSpaceCount = nTabStop; nSpaceCount > 1; --nSpaceCount) {
		var exprSpases = new RegExp(' {' + nSpaceCount + '}', "g");
		str = str.replace(exprSpases, sReplaced);
	}
	return str;
}

function getConst(constName) {
	var sResult;
	var oSet = AkelPad.ScriptSettings();
	if (oSet.Begin(WScript.ScriptBaseName, 0x1 /*POB_READ*/)) {
		sResult = oSet.Read(AkelPad.GetLangId(0 /*LANGID_FULL*/) + "_" + constName, 3 /*PO_STRING*/);
		oSet.End();
	}
	else
		sResult = constsDefault[constName];
	return sResult;
}