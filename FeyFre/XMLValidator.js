// === [XMLValidator.js] ===
// Validates selected XML fragment or whole document, pointing potential error place 
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=15256#15256 
// http://staynormal.org.ua/akelpad/scripts/XMLValidator.js
// Version: 1.6 (2012.10.24) by VladSh
// Version: 1.0 (2011.10.25) (c) Panych Y.W. aka FeyFre
//
// Arguments:
//	 keep:
//			• [0 | без параметра] - не сохранять исходное выделение, устанавливая курсор в место ошибки
//			• 1 - сохранять исходное выделение; если выделения нет, то курсор также будет установлен в место ошибки
//	 msgOpts - параметры вывода сообщений:
//		 • [0 | без параметра] - в диалоговое окно;
//		 • перечень кодов сообщений через запятую, которые выводить в панели вывода Log-плагина:
//			 1 - все сообщения/ошибки;
//				16 - критическая ошибка xml-парсера;
//				48 - ошибка xml-синтаксиса (можно выводить только её, т.к. можно переходить на место ошибки);
//				64 - сообщение об успешной проверке валидации
//		append - параметры вывода в панель Log-плагина:
//		 • 0 - очищать содержимое панели перед записью
//		 • 1 - не очищать
//
// Examples:
//	 Call("Scripts::Main", 1, "XMLValidator.js")					 - вывод в обычное диалоговое сообщение
//	 Call("Scripts::Main", 1, "XMLValidator.js", `-msgOpts=1`) - вывод всех сообщений в панель Log-плагина
//	 Call("Scripts::Main", 1, "XMLValidator.js", `-msgOpts=48 -append=1`) - вывод в панель Log-плагина только сообщений об ошибках xml-синтаксиса с добавлением их к уже существующим в панели сообщениям

var parserName = "msxml2.DOMDocument";
var xml = new ActiveXObject(parserName);
try {
	xml.async = false;
	xml.validateOnParse = true;
	xml.resolveExternals = false;
}
catch (e) {
	output("Internal parser " + parserName + " error: " + e.description, 16 /*MB_ICONSTOP*/);
	WScript.Quit();
}

var text = AkelPad.GetSelText();
var selection;
if (!text) {
	text = AkelPad.GetTextRange(0, -1);
	selection = false;
}
else
	selection = true;

var t = new Date();
var extInfo = t.toLocaleTimeString() + " " + (AkelPad.GetEditFile(0) || "*") + " -> ";

xml.loadXML(text);
if (xml.parseError.errorCode !== 0) {
	var err = xml.parseError;
	if (!selection || !AkelPad.GetArgValue("keep", 0)) {
		var np = Math.min(AkelPad.GetSelStart(), AkelPad.GetSelEnd());
		if (selection)
			np += err.filepos;
		else
			np = err.filepos;
		AkelPad.SetSel(np, np);
	}
	var errInfo = extInfo + "XML validation error:\r(" + err.line + "," + err.linepos + ")\t\t" + err.reason;
	output(errInfo, 48 /*MB_ICONEXCLAMATION*/);
}
else {
	output(extInfo + "XML fragment is valid.\r", 64 /*MB_ICONINFORMATION*/);
}

function output(msg, nIcon /*MB_ICON...*/) {
	var slog = AkelPad.GetArgValue("msgOpts", "0");
	if (slog == "1" || (slog != "0" && slog.indexOf(nIcon.toString()) != -1)) {
		var fLogOutput = "Log::Output";
		if (AkelPad.Call(fLogOutput, 1, "", "", "^\\((\\d+),(\\d+)\\)", "/GOTOLINE=$1:$2") != -1) {
			var nAppend = AkelPad.GetArgValue("append", 0);
			AkelPad.Call(fLogOutput, 5, msg, -1, nAppend);
			return;
		}
	}
	AkelPad.MessageBox(AkelPad.GetEditWnd(), msg, WScript.ScriptName, nIcon);
}
