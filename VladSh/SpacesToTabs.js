/// Convert space to tabulation
// Arguments:
//    1 - definition of number of spaces in block: "1" - from program settings; "2" - by default (2 spases), "3" - InputBox
//    2 - what to do with the residual single-spaces: "0" (or without this argument) - remain unchanged (use for processing scripts); "-1" - remove it; "1" - replace on a Tab character
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=7947#7947
// Version: 2.0 (2011.02.03)

if (AkelPad.GetMainWnd())
{
	var hWndEdit = AkelPad.GetEditWnd();
	if (WScript.Arguments.length == 0)
	{
		AkelPad.MessageBox(hWndEdit, "јргументы отсутствуют; операци€ остановлена...", WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/);
		WScript.Quit();
	}
	
	//Getting selected text
	var bTextSelected = true;
	var pSelText = AkelPad.GetSelText();
	if (!pSelText)
	{
		pSelText = AkelPad.GetTextRange(0, -1);
		bTextSelected = false;
	}
	if (!pSelText) WScript.Quit();
	
	var nTabStopDefault = 2;
	var nTabStop;
	switch (WScript.Arguments(0))
	{
		case "1":		//from program settings
			var nTabStop = AkelPad.SendMessage(hWndEdit, 3239 /*AEM_GETTABSTOP*/, 0, 0);
			break
		case "3":		//InputBox
			nTabStop = AkelPad.InputBox(hWndEdit, WScript.ScriptName, "¬ведите количество пробелов в одном символе табул€ции", nTabStopDefault);
			
			if (isNaN(nTabStop))		//not isNumber
			{
				if (nTabStop) AkelPad.MessageBox(hWndEdit, "¬ведено нечисловое значение, операци€ отменена...", WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/);			//press Cancel
				WScript.Quit();
			}
			break
		default:		//by default
			nTabStop = nTabStopDefault;
	}
	
	//Running the code change (common part)
	for (var nSpaceCount = nTabStop; nSpaceCount > 1; --nSpaceCount)
	{
		var exprSpases = new RegExp(' {' + nSpaceCount + '}', "g");
		pSelText = pSelText.replace(exprSpases, "\t");
	}
	
	if (WScript.Arguments.length > 1)
	{
		switch (WScript.Arguments(1))
		{
			case "1":		//replace on a Tab character
				pSelText = pSelText.replace(/ /g, "\t");
				break
			case "-1":		//remove it
				pSelText = pSelText.replace(/ /g, "");
				break
		}
	}
	
	if (!bTextSelected) AkelPad.SetSel(0, -1);
	AkelPad.ReplaceSel(pSelText);
}