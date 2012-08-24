/// WinMerge v0.5.0
// (с) se7h, VladSh
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=11455#11455
//
// Comparison of current and selected files using WinMerge (http://winmerge.org/)
//
// Usage in Toolbar/ContextMenu plugin:
// -"Compare with file..." Call("Scripts::Main", 1, "WinMerge.js") Icon(pathToAnyIcon)		- searching for a path to WinMerge automatically
// -"Compare with file..." Call("Scripts::Main", 1, "WinMerge.js", `"d:\Programs\TotalCmd\UTILs\WinMerge\"`)		- takes a path from scripts Arguments, else searching a path automatically
//
// FileTabs.js you found here: http://akelpad.sourceforge.net/forum/viewtopic.php?p=16297#16297
// CommonFunctions.js - here: http://akelpad.sourceforge.net/forum/viewtopic.php?p=1582#1582

if (!AkelPad.GetMainWnd()) WScript.Quit();

if (!AkelPad.Include("FileTabs.js")) WScript.Quit();
if (!AkelPad.Include("CommonFunctions.js")) WScript.Quit();

var WshShell = new ActiveXObject("WScript.shell");
var fso = new ActiveXObject("Scripting.FileSystemObject");

var FILES = {};
var nFileCurIndex = getTabIndexCurrent();
if (nFileCurIndex > 1) nFileCurIndex = 1;
FILES[nFileCurIndex] = getCurrentFileWithSave();
if (!FILES[nFileCurIndex]) WScript.Quit();

var pToolFileName = "WinMergeU.exe";
var pToolPath = "";

if (WScript.Arguments.length)		//сначала пытаемся взять из аргументов
	pToolPath = getEnvironmentPath(WScript.Arguments(0) + pToolFileName);

if (!pToolPath)
{
	try {
		//ищем по записи в реестре
		pToolPath = WshShell.RegRead("HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\" + pToolFileName + "\\");
		if (pToolPath)
			pToolPath = getEnvironmentPath(pToolPath);
	} catch(e) {}

	if (!pToolPath)
	{
		//ищем в путях по системмным переменным
		var appPaths = ["%ProgramFiles%\\WinMerge\\", "%ProgramFiles (x86)%\\WinMerge\\"];
		var p = 0;
		do
		{
			pToolPath = getEnvironmentPath(appPaths[p] + pToolFileName);
			if (pToolPath) break;
			p += 1;
		}
		while (p < appPaths.length)

		if (!pToolPath)
		{
			//ищем в стандартных путях по доступным локальным дискам
			appPaths = [":\\Program Files\\WinMerge\\", ":\\Program Files(x86)\\WinMerge\\"];
			var disks = getDrivesList();
			for (var d = 0; d < disks.length; d++)
			{
				p = 0;
				do
				{
					pToolPath = getEnvironmentPath(disks[d] + appPaths[p] + pToolFileName);
					if (pToolPath) break;
					p += 1;
				}
				while (p < appPaths.length)
				if (pToolPath) break;
			}

			if (!pToolPath)
			{
				AkelPad.MessageBox(hWndMain, "Application WinMerge was not found!", WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/);
				WScript.Quit();
			}
		}
	}
}

var nFileOtherIndex = Number(!nFileCurIndex);
if (AkelPad.SendMessage(hWndMain, 1291 /*AKD_FRAMESTATS*/, 0 /*FWS_COUNTALL*/, 0) == 2)		//если открыто всего 2 файла, то будем передавать их
{
	FILES[nFileOtherIndex] = getTabFileByIndex(nFileOtherIndex);
	if (!FILES[nFileOtherIndex])		//если файл новый, переходим на его вкладку чтобы попытаться сохранить
	{
//		AkelPad.Command(4316 /*IDM_WINDOW_FRAMENEXT*/);
		activateTabByIndex(nFileOtherIndex);
		FILES[nFileOtherIndex] = getCurrentFileWithSave();
	}
}
else		//если открыто не 2 файла, то в утилиту будем передавать текущий и выбранный в диалоге открытия файла
{
	FILES[nFileOtherIndex] = FILES[nFileCurIndex];
	FILES[nFileCurIndex] = FileDialogDefault(true, FILES[nFileCurIndex], GetFileExt(FILES[nFileCurIndex]));
}

if (FILES[nFileOtherIndex])
{
	var cmdLine = "\"" + pToolPath + "\" \"" + FILES[0] + "\" \"" + FILES[1] + "\"";
//	WScript.Echo(cmdLine);
//	WScript.Quit();
	WshShell.Exec(cmdLine);
}


//VladSh by MSDN :)
function getDrivesList()
{
	var e = new Enumerator(fso.Drives);
	var x;
	var i = 0;
	var disks = [];
	for (; !e.atEnd(); e.moveNext())
	{
		x = e.item();
		if (x.DriveType == 3 && x.IsReady)
		{
			disks[i] = x.DriveLetter;
			i += 1;
		}
	}
	return disks;
}

function getEnvironmentPath(paths)
{
	var path = WshShell.ExpandEnvironmentStrings(paths);
	if (fso.FileExists(path)) return path;
	return "";
}

function getCurrentFileWithSave()
{
	var pCurrentFile = AkelPad.GetEditFile(0);
	if (!pCurrentFile)		//если файл не сохранён, пытаемся его сохранить
	{
		AkelPad.Command(4105);
		pCurrentFile = AkelPad.GetEditFile(0);
	}
	return pCurrentFile;
}