/// Process current file in AStyle
// v1.11
//
// Usage:
// Call("Scripts::Main", 1, "AStyle.js", "`flags`")
//
// Or support ShowMenuEx.js if you do not specify a flags in argument:
// Call("Scripts::Main", 1, "AStyle.js")
//
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=7814#7814

var WshShell = new ActiveXObject("WScript.shell");
var fso = new ActiveXObject("Scripting.FileSystemObject");
var pToolPath = AkelPad.GetAkelDir() + "\\AkelFiles\\Tools\\AStyle\\AStyle.exe";

var pToolFlags = "";

if(WScript.Arguments.length) {
	pToolFlags = WScript.Arguments(0);
} else if(pToolFlags == "") {
	if (! AkelPad.Include("ShowMenuEx.js")) WScript.Quit();
	var pFlags = getSelectedMenuItem(POS_CURSOR, "", 0);

	if(pFlags == "") {
		WScript.Quit();
	}

	pToolFlags = pFlags;
}

var hEditWnd = AkelPad.GetEditWnd();
var pTmpFile;
var pText;

if(pTmpFile = CreateTempFile()) {
	AkelPad.SaveFile(hEditWnd, pTmpFile, 65001 /*UTF-8*/, true, false);

	pToolPath = correctCommandLine(pToolPath);
	pTmpFile = correctCommandLine(pTmpFile);

	WshShell.Run("%COMSPEC% /c " + pToolPath + " " + pToolFlags + " " + pTmpFile, 0, true);
	pText = AkelPad.ReadFile(pTmpFile);

	setRedraw(hEditWnd, false);
	AkelPad.SetSel(0, -1);
	AkelPad.ReplaceSel(pText);
	setRedraw(hEditWnd, true);

	fso.DeleteFile(pTmpFile);
}


//Functions
function CreateTempFile() {
	var oTmpFolder;
	var oTmpFile;
	var pTmpName;

	if(oTmpFolder = fso.GetSpecialFolder(2 /*TemporaryFolder*/)) {
		pTmpName = fso.GetTempName();

		if(oTmpFile = oTmpFolder.CreateTextFile(pTmpName)) {
			oTmpFile.Close();
		}

		return (oTmpFolder.Path + "\\" + pTmpName);
	}

	return "";
}

function correctCommandLine(pPath) {
	if(pPath.search( / /) != -1) {
		return "\"" + pPath + "\"";
	} else {
		return pPath;
	}
}

function setRedraw(hWnd, bRedraw) {
	var oSys = AkelPad.SystemFunction();
	AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
	bRedraw && oSys.Call("user32::InvalidateRect", hWnd, 0, true);
}