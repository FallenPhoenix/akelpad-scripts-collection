/// Show help for selected or word at caret position
//
// Required ChmKw.exe (AkelPad\AkelFiles\Tools)
//
// Version: 1.6 (05.08.2010)
//
// Path to CHM files: AkelPad\AkelFiles\Help
//
// Usage:
// Call("Scripts::Main", 1, "LanguageHelp.js", "help_name.chm")
//
// Or support ShowMenuEx.js if you do not specify a flags in argument:
//  Call("Scripts::Main", 1, "LanguageHelp.js")

var nPos = AkelPad.GetSelStart();
var WshShell = new ActiveXObject("WScript.shell");
var pChmKwPath = AkelPad.GetAkelDir() + "\\AkelFiles\\Tools\\ChmKw.exe";

var fso = new ActiveXObject("Scripting.FileSystemObject");

if(fso.FileExists(pChmKwPath) == false)
	AkelPad.MessageBox(hWndEdit, 'File "' + pChmKwPath + '" Not found!', "AkelPad -> " + WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/);

var pHelpDir = AkelPad.GetAkelDir() + "\\AkelFiles\\Help\\";
var pHelpPath = "";

if(WScript.Arguments.length) {
	pHelpPath = pHelpDir + WScript.Arguments(0);
} else if(pHelpPath == "") {
	eval(AkelPad.ReadFile(AkelPad.GetAkelDir() + "\\AkelFiles\\Plugs\\Scripts\\ShowMenuEx.js"));
	var pHelpFile = getSelectedMenuItem(POS_CURSOR, "", 0);

	if(pHelpFile == "") {
		WScript.Quit();
	}

	pHelpPath = pHelpDir + pHelpFile;
}

var hWndEdit = AkelPad.GetEditWnd();

if(hWndEdit) {
	if(AkelPad.GetSelEnd() == nPos) {
		var nWordBeg = AkelPad.SendMessage(hWndEdit, 1100 /*EM_FINDWORDBREAK */, 0/*WB_LEFT*/, nPos);
		var nWordEnd = AkelPad.SendMessage(hWndEdit, 1100 /*EM_FINDWORDBREAK */, 7/*WB_RIGHTBREAK*/, nWordBeg);

		if(nWordEnd < nPos) {
			nWordBeg = AkelPad.SendMessage(hWndEdit, 1100 /*EM_FINDWORDBREAK */, 0/*WB_LEFT*/, nPos);
			nWordEnd = AkelPad.SendMessage(hWndEdit, 1100 /*EM_FINDWORDBREAK */, 7/*WB_RIGHTBREAK*/, nWordBeg);
		}

		if(nWordEnd > nPos) {
			AkelPad.SetSel(nWordBeg, nWordEnd);
		}
	}

	var sSel = AkelPad.GetSelText();
	pHelpPath = pHelpPath + "::/@" + sSel;
}

pHelpPath = correctCommandLine(pHelpPath);
pChmKwPath = correctCommandLine(pChmKwPath);
WshShell.Run("%COMSPEC% /c " + "\"" + pChmKwPath + " " + pHelpPath + "\"", 0, false);

function correctCommandLine(pPath) {
	if(pPath.search( / /) != -1) {
		return "\"" + pPath + "\"";
	} else {
		return pPath;
	}
}