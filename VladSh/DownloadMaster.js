///Downloading a file by URL using Download Master
///Передача URL на закачку в Download Master; работает из контекстного меню ссылок
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=13156#13156
// Version: 1.2 (2011.08.22)
// 
// -"Закачать при помощи DM" Call("Scripts::Main", 1, "DownloadMaster.js", `-url="%u" -cmdline="hidden=1"`);		parameters of the comandLine see: http://www.westbyte.com/dm/help/tutorial_commandline.htm
// -"Добавление закачки в DM..." Call("Scripts::Main", 1, "DownloadMaster.js", `-url="%u"`)
// -"Добавление закачки в DM..." Call("Scripts::Main", 1, "DownloadMaster.js", `-url="%u" -dmpath="%ProgramFiles%\Download Master\dmaster.exe"`)

var WshShell = new ActiveXObject("WScript.Shell");

var url = AkelPad.GetArgValue("url", "");		//URL
if (!url)
	showErrorMessage('Параметр (-url="%u") отсутствует в аргументах.', true);

var pProgram = AkelPad.GetArgValue("dmpath", "");		//ПУТЬ К ПРОГРАММЕ; сначала берём из агрументов

if (pProgram)
{
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	if (fso.FileExists(pProgram) == false)
		showErrorMessage("Приложение Download Master не найдено!" + "\r" + "Путь: '" + pProgram + "'.", true);
}
else
{
	pProgram = RegRead("HKCR\\Applications\\dmaster.exe\\shell\\open\\command\\");		//читаем значение по умолчанию
	if (!pProgram)
		showErrorMessage("Приложение Download Master не зарегистрировано в системе.", true);	
	pProgram = pProgram.replace('"%L"', "");
}

var commandLine = AkelPad.GetArgValue("cmdline", "");		//КОМАНДНАЯ СТРОКА
if (commandLine)
	commandLine = " " + commandLine;

WshShell.Exec(pProgram + " " + url + commandLine);


function showErrorMessage(pText, bQuit)
{
	AkelPad.MessageBox(AkelPad.GetEditWnd(), pText, WScript.ScriptName, 48);
	if (bQuit) WScript.Quit();
}

function RegRead(pPath)
{
	try
		{ return WshShell.RegRead(pPath) }
	catch(e)
		{ return null }
}