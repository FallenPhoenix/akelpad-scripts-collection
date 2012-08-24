/// Process current file in CSSTidy
// v1.11
//
// Usage:
// Call("Scripts::Main", 1, "CSSTidy.js", "`flags`")
//
// Or support ShowMenuEx.js if you do not specify a flags in argument:
// Call("Scripts::Main", 1, "CSSTidy.js")
//
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=7814#7814

var WshShell = new ActiveXObject("WScript.shell");
var fso = new ActiveXObject("Scripting.FileSystemObject");

var pToolPath = AkelPad.GetAkelDir() + "\\AkelFiles\\Tools\\CSSTidy\\csstidy.exe";

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
var pTmpFile1;
var pTmpFile2;
var pText;

if(pTmpFile1 = CreateTempFile()) {
	if(pTmpFile2 = CreateTempFile()) {
		AkelPad.SaveFile(hEditWnd, pTmpFile1, 65001 /*UTF-8*/, true, false);
		pToolPath = correctCommandLine(pToolPath);
		pTmpFile1 = correctCommandLine(pTmpFile1);
		WshShell.Run("%COMSPEC% /c " + pToolPath + " " + pTmpFile1 + " " + pToolFlags + " " + pTmpFile2, 0, true);
		pText = AkelPad.ReadFile(pTmpFile2);

		setRedraw(hEditWnd, false);
		AkelPad.SetSel(0, -1);
		AkelPad.ReplaceSel(pText);
		setRedraw(hEditWnd, true);

		fso.DeleteFile(pTmpFile2);
	}

	fso.DeleteFile(pTmpFile1);
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