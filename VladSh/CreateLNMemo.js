///Создание письма в клиенте Lotus Notes на основе открытого файла в текстовом редакторе AkelPad (2009.05.20)
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=4873#4873
// Version: 1.8 (2011.01.21)	© VladSh

var WshShell = new ActiveXObject("WScript.Shell");
var LNAppHeader = "Lotus Notes";		//не изменять!
var APAppHeader = "AkelPad";		//не изменять!
var subject = "";
var content = "";
if (WScript.Arguments.length && WScript.Arguments(0))
{
	//Для файла из списка свежих
	var fso = new ActiveXObject("Scripting.FileSystemObject"); 
	if (fso.FileExists(WScript.Arguments(0))) 
		content = AkelPad.ReadFile(WScript.Arguments(0));
	else
	{
		AkelPad.MessageBox(AkelPad.GetMainWnd(), "Файла '" + WScript.Arguments(0) + "' не существует на диске!", APAppHeader + " -> " + WScript.ScriptName, 48);
		WScript.Quit();
	}
	
	subject = getFileNameOnly(WScript.Arguments(0));
}
else
{
	//Для файла, открытого в текущей вкладке
	var tmpSelStart = AkelPad.GetSelStart();
	content = AkelPad.GetSelText() || AkelPad.GetTextRange(0, -1);
	AkelPad.SetSel(tmpSelStart, tmpSelStart);
	
	subject = getFileNameOnly(AkelPad.GetEditFile(0)) || (content.slice(0, content.indexOf("\r"))).replace(/\/\/\//, "");		//Если файл не сохранён, то для темы письма берём его первую строку
}

if (startNotes())
{
	var errText = createNotesMemo(subject, content);
	if (errText)
	{
		WshShell.AppActivate(APAppHeader);
		AkelPad.MessageBox(AkelPad.GetMainWnd(), errText, APAppHeader + " -> " + WScript.ScriptName, 48);
	}
}


/* ===== FUNCTIONS ===== */

function getFileNameOnly(fileNameFull)
{
	return fileNameFull.slice(fileNameFull.lastIndexOf("\\") + 1, fileNameFull.lastIndexOf("."))
}


function startNotes()
{
	var LN_PROCNAME = "nlnotes.exe";

	if (isProcessRunning(LN_PROCNAME) == 0)
	{
		//Запуск клиента Lotus в стандартном режиме (с возможностью смены пользователя при загрузке)
		
		var pathLN_app = regGetStringValue(0x80000002	/* HKEY_LOCAL_MACHINE */, "Software\\Lotus\\Notes\\", "Path");
		if (pathLN_app == null)
		{
			AkelPad.MessageBox(AkelPad.GetMainWnd(), "Приложение ''" + LNAppHeader + "'' не зарегистрировано в реестре Windows!", APAppHeader + " -> " + WScript.ScriptName, 48);
			WScript.Quit();
		}
		var pathLN_ini = regGetStringValue(0x80000001	/* HKEY_CURRENT_USER */, "Software\\Lotus\\Notes\\Installer", "VDIR_INI") || pathLN_app;
		
/*
		var oWMIService = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\.\\root\\cimv2");
		var oClass = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\.\\root\\cimv2:Win32_Process");
		var oStartup = oWMIService.Get("Win32_ProcessStartup");
		var oConfig = oStartup.SpawnInstance_();
		oConfig.ShowWindow = 3		//максимизированное окно
		var PID = "";
		var res = oClass.Create('"' + pathLN_app + '\\notes.exe" "=' + pathLN_ini + '\\notes.ini"', null, oConfig, PID);
		if (res != 0)
		{
			AkelPad.MessageBox(AkelPad.GetMainWnd(), "Код ошибки запуска: " + res, APAppHeader + " -> " + WScript.ScriptName, 48);
			WScript.Quit();
		}
*/
		var oLNExec = WshShell.Exec('"' + pathLN_app + '\\notes.exe" "=' + pathLN_ini + '\\notes.ini"');
		//Даём инициализироваться и запуститься животному
		while (oLNExec.Status == 0)
			WScript.Sleep(100);
		
		//Ждём, пока пользователь не введёт пароль
		while (isProcessRunning("nfileret.exe") == 1)
			WScript.Sleep(100);
		
		//Обрабатываем ситуацию, когда пользователь выбрал выход из Lotus Notes
		WScript.Sleep(400);		//Даём животинке полностью выгрузится
		if (isProcessRunning(LN_PROCNAME) != 0)
			return true
		else
			return false
	}
	else
		return true
}


function isProcessRunning(processName)
{
	var oWMIService = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\.\\root\\cimv2");
	var colProcesses = oWMIService.ExecQuery("SELECT * FROM Win32_Process WHERE Name = '" + processName + "'");
	return colProcesses.Count
}


function createNotesMemo(subject, content)
{
	var NS = new ActiveXObject("Notes.NotesSession");
	
	var mailServer = NS.GetEnvironmentString("MailServer", true);
	var mailFile = NS.GetEnvironmentString("MailFile", true);
	
	var NDB_Mail = NS.GetDatabase(mailServer, mailFile);
	if (NDB_Mail.IsOpen == true)
	{
		var ND_Memo = NDB_Mail.CreateDocument();
		ND_Memo.ReplaceItemValue("Form", "Memo");
		ND_Memo.ReplaceItemValue("Subject", subject);
		var RTBody = ND_Memo.CreateRichTextItem("Body");
		RTBody.AppendText(content);
		RTBody.GetFormattedText(false, 1);									//Ставшие привычными танцы с бубном :-)
		
		//Открываем созданное письмо
		var NUIWS = new ActiveXObject("Notes.NotesUIWorkspace");
		NUIWS.EditDocument(true, ND_Memo);
		
		//Выводим окно Lotus Notes на передний план
		WshShell.AppActivate(LNAppHeader);
		return ""
	}
	else
		return "Почтовая база выбранного пользователя " + mailServer + "!!" + mailFile + " не может быть открыта! Проверьте настройки подключения и текущее место вызова."
}


function regGetStringValue(hKey, sKey, sParam)
{
	var oWMIReg = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\.\\root\\default:StdRegProv");
	
	oMethod = oWMIReg.Methods_.Item("GetStringValue");
	oInParam = oMethod.InParameters.SpawnInstance_();
	oInParam.hDefKey = hKey;
	oInParam.sSubKeyName = sKey;
	oInParam.sValueName = sParam;
	
	oOutParam = oWMIReg.ExecMethod_(oMethod.Name, oInParam);
	
	return oOutParam.sValue		//Если параметр не найден, то возвращает null, в отличие от WshShell.RegRead(), которая генерит ошибку
}