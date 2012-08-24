///Opens the directory where the files are stored sessions
///ќткрывает папку, в которой сохран€ютс€ файлы сессий
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=12937#12937
// Version: 1.2 (2011.10.20)
// 
// -"Directory of sessions" Call("Scripts::Main", 1, "OpenSessionsDir.js")

if (! AkelPad.Include("Settings.js")) WScript.Quit();

var nSubDir = 4;
var pAkelPlugsDir = AkelPad.GetAkelDir(nSubDir) /*ADTYPE_PLUGS*/ + "\\";

var pPluginFileName = "Sessions";
var pParameterName = "SaveSessions";

nParameterValue = SettingsRead(nSubDir, pPluginFileName, pParameterName, 3 /*PO_STRING*/)

var WshShell = new ActiveXObject("WScript.Shell");
var pPluginDataDir;		//папка, которую мы собственно и будем открывать

switch (nParameterValue)
{
	case "1":		//ƒирректори€ программы
		pPluginDataDir = pAkelPlugsDir + pPluginFileName;
		break;
	case "2":		//ƒирректори€ пользовател€
		pPluginDataDir = WshShell.ExpandEnvironmentStrings("%APPDATA%\\AkelPad\\" + pPluginFileName);
		break;
	default:
		AkelPad.MessageBox(AkelPad.GetEditWnd(), "Unhandled value of parameter " + pParameterName + "=" + nParameterValue + "!", WScript.ScriptName, 48);
		WScript.Quit();
}

var fso = new ActiveXObject("Scripting.FileSystemObject");

if (fso.FolderExists(pPluginDataDir) == false)
{
	AkelPad.MessageBox(AkelPad.GetEditWnd(), "Directory of sessions '" + pPluginDataDir + "' not found!'", WScript.ScriptName, 48);
	WScript.Quit();
}

var nResult = -1;

if (fso.FileExists(pAkelPlugsDir + "Explorer.dll") == true)		//пытаемс€ сначала открыть в Explorer-плагине
	nResult = AkelPad.Call("Explorer::Main", 1, pPluginDataDir);

if (nResult == -1)
	WshShell.Exec('rundll32.exe shell32, ShellExec_RunDLL "' + pPluginDataDir + '"');
