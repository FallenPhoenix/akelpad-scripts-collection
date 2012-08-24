/// Process current file in HTML TiDy
// Version 1.11
//
// Usage:
// Call("Scripts::Main", 1, "HTMLTidy.js", "config_name")
//
// Support ShowMenuEx.js if you do not specify a flags in argument:
// Call("Scripts::Main", 1, "HTMLTidy.js")
//
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=7814#7814

var WshShell = new ActiveXObject("WScript.shell");
var fso = new ActiveXObject("Scripting.FileSystemObject");

var pToolPath = AkelPad.GetAkelDir() + "\\AkelFiles\\Tools\\HTMLTidy\\tidy.exe";
var pConfigPath = AkelPad.GetAkelDir() + "\\AkelFiles\\Tools\\HTMLTidy\\";

if(WScript.Arguments.length) {
	pConfigPath += WScript.Arguments(0);
} else {
	if (! AkelPad.Include("ShowMenuEx.js")) WScript.Quit();
	var pCfgFile = getSelectedMenuItem(POS_CURSOR, "", 0);

	if(pCfgFile == "") {
		WScript.Quit();
	}

	pConfigPath += pCfgFile;
}

var hEditWnd = AkelPad.GetEditWnd();
var pTmpFile;

if(pTmpFile = CreateTempFile()) {
	AkelPad.SaveFile(hEditWnd, pTmpFile, 1200 /*UTF-16LE*/, true, false);
	pToolPath = correctCommandLine(pToolPath);
	pConfigPath = correctCommandLine(pConfigPath);
	pTmpFile = correctCommandLine(pTmpFile);
	
	WshShell.Run("%COMSPEC% /c " + "\"" + pToolPath + " -config " + pConfigPath + " -m -utf16le " + pTmpFile + "\"", 0, true);

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