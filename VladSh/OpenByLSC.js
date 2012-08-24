///Open by Linked, Selected or Clipboard text: file (supported the opening of scripts from AkalPad directory), folder; url, ets...
///ѕредназначен дл€ открыти€ автовыбором:
// 	Х ссылок в браузере (из контекстного меню ссылок)
// 	Х файлов (чаще всего скриптов) в AkelPad'е (работает при выделении текста либо по содержимому буфера; поддерживаетс€ открытие скриптов из ..\Scripts\Include\
// 	Х папок (в Windoes Explorer'е), в т.ч. сетевых
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=5598#5598
// Version: 2.2 (2011.07.21)
// 
// в меню ссылок: -"ќткрыть (автовыбор)" Call("Scripts::Main", 1, "OpenByLSC.js", `"%u"`)
// в диалоге скриптов дл€ выделенного текста или того, что в буфере обмена, предлагаетс€ комбинаци€ клавиш Alt+O

var slash = "\\";

//1. - провер€ем в аргументах (L- Link); 2 - берЄм выделенный текст (S- Selected); 3 - берЄм содержимое буфера обмена (C - Clipboard)
var tObject = AkelPad.GetArgLine() || AkelPad.GetSelText() || AkelPad.GetClipboardText();

if (!tObject) WScript.Quit();

//ќпредел€ем: URL, ‘айл или ѕапка

if (tObject.indexOf("//") != -1)
{
	openbyDefault(tObject);		//URL
	WScript.Quit();
}

var nPos = tObject.indexOf("AkelFiles");
if (nPos != -1 && nPos <= 4)
	tObject = AkelPad.GetAkelDir() + correctSlashes(tObject);		//кусок (не полный путь) сущности из дирректории AkelPad'а

nPos = tObject.lastIndexOf(".");
if (nPos != -1)
{
	var nPosSlash = tObject.lastIndexOf(slash);
	if (nPosSlash < nPos)
	{	//‘айл
		if (nPosSlash <= 1)		//им€ скрипта из окна редактировани€ (и дирректории) AkelPad'а (со слэшами впереди)
			tObject = tObject.replace(/\\/gm, "");
		
		if (tObject.indexOf(slash) == -1)
			tObject = AkelPad.GetAkelDir(6) /*ADTYPE_INCLUDE*/ + slash + tObject;		//им€ скрипта, например просто скопированное в буфер обмена (из ContextMenu-плагина или др.)
		
		if (!openFile(tObject, false))
		{
			tObject = tObject.substr(tObject.lastIndexOf(slash) + 1);		//выкусываем чисто им€ скрипта
			tObject = AkelPad.GetAkelDir(5) /*ADTYPE_SCRIPTS*/ + slash + tObject;		//сначала искали в папке ..\Scripts\Include\, а теперь смотрим в ..\Scripts\
			openFile(tObject, true);
		}
		WScript.Quit();
	}
}

//ѕапка
openbyDefault(tObject);


function openbyDefault(tObject)
{
	var WshShell = new ActiveXObject("WScript.Shell");
	WshShell.Exec('rundll32.exe shell32, ShellExec_RunDLL "' + tObject + '"');
}

function openFile(tObject, bErrMsg)
{
	tObject = correctSlashes(tObject);
	
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	if (fso.FileExists(tObject) == true)
	{
		AkelPad.OpenFile(tObject);
		return true;
	}
	else
	{
		if (bErrMsg) openbyDefault(tObject);
		return false;
	}
}

function correctSlashes(pPath)
{
	return pPath.replace(/\\\\/g, slash);
}