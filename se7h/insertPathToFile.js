/// insertPathToFile v0.1.1
// (c) se7h
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=11477#11477
//
// Insert relative/absolute path to selected file
//
// Usage in Toolbar/ContextMenu plugin:
// -"Insert relative path..." Call("Scripts::Main", 1, "insertRelativePath.js", `"%d"`) Icon(pathToAnyIcon)
// -"Insert absolute path..." Call("Scripts::Main", 1, "insertRelativePath.js") Icon(pathToAnyIcon)
//
// CommonFunctions.js you found here http://akelpad.sourceforge.net/forum/viewtopic.php?p=1582#1582

//Options
var pFilter = "Text files (*.txt)\x00*.txt\x00All Files (*.*)\x00*.*\x00\x00";
var nFilterIndex = 2;
var dirSysSeparator = "\\";

//Variables
var hMainWnd = AkelPad.GetMainWnd();
var pInitialFile = AkelPad.GetEditFile(0);
var pSelFilePath;
var DirPath = "";

if(WScript.Arguments.length) {
	DirPath = WScript.Arguments(0);
}

if(hMainWnd) {
	if (! AkelPad.Include("CommonFunctions.js"))
		pSelFilePath = FileDialog(true, hMainWnd, pInitialFile, pFilter, nFilterIndex);
	else
		pSelFilePath = FileDialogDefault(true, pInitialFile, "*");

	if(pSelFilePath) {
		if(!DirPath) {
			AkelPad.ReplaceSel(pSelFilePath);
		} else {
			AkelPad.ReplaceSel(GetRelativePath(DirPath, pSelFilePath));
		}
	}
}

function GetRelativePath(mainDirPath, absoluteFilePath) {
	var firstPathParts = new Array();
	var secondPathParts = new Array();
	firstPathParts = mainDirPath.split(dirSysSeparator);
	secondPathParts = absoluteFilePath.split(dirSysSeparator);
	var sameCounter = 0;

	for(var i = 0; i < Math.min(firstPathParts.length, secondPathParts.length); i++) {
		if(!(firstPathParts[i].toLowerCase() == secondPathParts[i].toLowerCase())) {
			break;
		}

		sameCounter++;
	}

	if(sameCounter == 0) {
		return absoluteFilePath;
	}

	var newPath = "";

	for(var i = sameCounter; i < firstPathParts.length; i++) {
		if(i > sameCounter) {
			newPath += dirSysSeparator;
		}

		newPath += "..";
	}

	if(newPath.length == 0) {
		newPath = ".";
	}

	for(var i = sameCounter; i < secondPathParts.length; i++) {
		newPath += dirSysSeparator;
		newPath += secondPathParts[i];
	}

	return newPath;
}

//Instructor function
function FileDialog(bOpenTrueSaveFalse, hWnd, pInitialFile, pFilter, nFilterIndex) {
	var nFlags = 0x880804; //OFN_HIDEREADONLY|OFN_PATHMUSTEXIST|OFN_EXPLORER|OFN_ENABLESIZING
	var pDefaultExt = "txt";
	var lpStructure;
	var lpFilterBuffer;
	var lpFileBuffer;
	var lpExtBuffer;
	var oSys;
	var pResultFile = "";
	var nCallResult;

	if(lpFilterBuffer = AkelPad.MemAlloc(256 * _TSIZE)) {
		AkelPad.MemCopy(lpFilterBuffer, pFilter.substr(0, 255), _TSTR);

		if(lpFileBuffer = AkelPad.MemAlloc(256 * _TSIZE)) {
			AkelPad.MemCopy(lpFileBuffer, pInitialFile.substr(0, 255), _TSTR);

			if(lpExtBuffer = AkelPad.MemAlloc(256 * _TSIZE)) {
				AkelPad.MemCopy(lpExtBuffer, pDefaultExt.substr(0, 255), _TSTR);

				if(lpStructure = AkelPad.MemAlloc(_X64 ? 136 : 76)) { //sizeof(OPENFILENAMEA) or sizeof(OPENFILENAMEW)
					//Fill structure
					AkelPad.MemCopy(lpStructure, _X64 ? 136 : 76, 3 /*DT_DWORD*/);             //lStructSize
					AkelPad.MemCopy(lpStructure + (_X64 ? 8 : 4), hWnd, 2 /*DT_QWORD*/);         //hwndOwner
					AkelPad.MemCopy(lpStructure + (_X64 ? 24 : 12), lpFilterBuffer, 2 /*DT_QWORD*/); //lpstrFilter
					AkelPad.MemCopy(lpStructure + (_X64 ? 44 : 24), nFilterIndex, 3 /*DT_DWORD*/); //nFilterIndex
					AkelPad.MemCopy(lpStructure + (_X64 ? 48 : 28), lpFileBuffer, 2 /*DT_QWORD*/); //lpstrFile
					AkelPad.MemCopy(lpStructure + (_X64 ? 56 : 32), 256, 3 /*DT_DWORD*/);         //nMaxFile
					AkelPad.MemCopy(lpStructure + (_X64 ? 96 : 52), nFlags, 3 /*DT_DWORD*/);      //Flags
					AkelPad.MemCopy(lpStructure + (_X64 ? 104 : 60), lpExtBuffer, 2 /*DT_QWORD*/); //lpstrDefExt

					if(oSys = AkelPad.SystemFunction()) {
						//Call dialog
						if(bOpenTrueSaveFalse == true) {
							nCallResult = oSys.Call("comdlg32::GetOpenFileName" + _TCHAR, lpStructure);
						} else {
							nCallResult = oSys.Call("comdlg32::GetSaveFileName" + _TCHAR, lpStructure);
						}

						//Result file
						if(nCallResult) {
							pResultFile = AkelPad.MemRead(lpFileBuffer, _TSTR);
						}
					}

					AkelPad.MemFree(lpStructure);
				}

				AkelPad.MemFree(lpExtBuffer);
			}

			AkelPad.MemFree(lpFileBuffer);
		}

		AkelPad.MemFree(lpFilterBuffer);
	}

	return pResultFile;
}