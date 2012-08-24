///Delete current opened file
///Удаляет текущий, открытый на экране, файл
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1988#1988
// Version: 2.2 (2011.07.21)
//
// -"Delete file" Call("Scripts::Main", 1, "DeleteFile.js") Icon("%a\AkelFiles\Plugs\ToolBar.dll", 25)		- without warning
// -"Delete file" Call("Scripts::Main", 1, "DeleteFile.js", "1") Icon("%a\AkelFiles\Plugs\ToolBar.dll", 25)		- with warning

var iCloseWithWarning = parseInt(AkelPad.GetArgLine() || 0);

var hWndMain = AkelPad.GetMainWnd()
var pFileFullName = AkelPad.GetEditFile(0);

if (iCloseWithWarning)
{
	if (AkelPad.MessageBox(hWndMain, 'Delete this file ' + pFileFullName + '?', WScript.ScriptName, 4 /*MB_YESNO*/ + 48 /*MB_ICONEXCLAMATION*/) == 7 /*IDNO*/)
		WScript.Quit();
}

AkelPad.SendMessage(hWndMain, 1229 /*AKD_SETMODIFY*/, 0, false);

AkelPad.Command(4324 /*IDM_WINDOW_FILECLOSE*/);
AkelPad.Command(4318 /*IDM_WINDOW_FRAMECLOSE*/);

if (pFileFullName)		//File already exist on fisical disk
{
   fso = new ActiveXObject("Scripting.FileSystemObject");
   if (fso.FileExists(pFileFullName))
   	fso.DeleteFile(pFileFullName, true);
}