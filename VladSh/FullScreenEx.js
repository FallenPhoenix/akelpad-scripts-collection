///Go to FullScreen-mode with additional options for display panels; a return to normal-mode
///Переход в полноэкранный режим с возможностью отображения определённого тулбара; возвращение в нормальный режим
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=18081#18081
// Version: 2.4 (2012.12.14)
// 
// Parameters:
// 	• ToolBar - ["имя dll-файла_1 плагина без расширения","номера рядов через запятую"],["имя dll-файла_2 плагина без расширения","номера рядов через запятую"];
//				если в одном из плагинов нужно отобразить все ряды, то параметр с номерами рядов можно не записывать
// 	• Explorer, CodeFold, Clipboard, Log, StatusBar, Menu: [0] - не отображать / 1 - отображать
//		• TabBar: [0] - не отображать / 1 - отображать с автоопределением положения / 4301 - сверху / 4302 - снизу
// 
// Examples:
// -"Обычный" Call("Scripts::Main", 1, "FullScreenEx.js")
// -"С тулбаром по умолчанию" Call("Scripts::Main", 1, "FullScreenEx.js", `-ToolBar=["ToolBar"]`)
// -"С дополнительной панелью для работы с XML" Call("Scripts::Main", 1, "FullScreenEx.js", `-ToolBar=["ToolBar","1,3"],["ToolBar-XML"] -CodeFold=1`)
// -"Псевдо-SDI" Call("Scripts::Main", 1, "FullScreenEx.js", `-ToolBar=["ToolBar"] -Menu=1 -StatusBar=1`)

var pFullScreen = "FullScreen::Main";
var Toolbars = AkelPad.GetArgValue("ToolBar", "");
if (Toolbars) {
	Toolbars = eval('[' + Toolbars + ']');
	for (i = 0; i < Toolbars.length; i++) {
		Toolbars[i] = getToolbar(Toolbars[i]);
	}
}

//ПЕРЕХОД ИЗ ОБЫЧНОГО РЕЖИМА В ПОЛНОЭКРАННЫЙ
if (!AkelPad.IsPluginRunning(pFullScreen)) {
	var pExplorer = "Explorer::Main";
	var pCodeFold = "Coder::CodeFold";
	var pClipboard = "Clipboard::Capture";
	var pLog = "Log::Output";
	var hWndMain = AkelPad.GetMainWnd();
	
	var bExplorer = AkelPad.GetArgValue("Explorer", 0);
	var bCodeFold = AkelPad.GetArgValue("CodeFold", 0);
	var bClipboard = AkelPad.GetArgValue("Clipboard", 0);
	var bLog = AkelPad.GetArgValue("Log", 0);
	var IDM_VIEW_SHOW_STATUSBAR = 4211;
	var bStatusBar = AkelPad.GetArgValue("StatusBar", 0);
	var bMenu = AkelPad.GetArgValue("Menu", 0);
	var nTabBar = AkelPad.GetArgValue("TabBar", 0);
	
	//если панели перед запуском включены, - отключаем, т.к. без этого потом не запустятся
	
	if (Toolbars) {
		for (i = Toolbars.length - 1; i >= 0; i--) {
			if (AkelPad.IsPluginRunning(Toolbars[i].file))
				AkelPad.Call(Toolbars[i].file);
		}
	}
	
	if (bExplorer && AkelPad.IsPluginRunning(pExplorer))
		AkelPad.Call(pExplorer);
	
	if (bCodeFold && AkelPad.IsPluginRunning(pCodeFold))
		AkelPad.Call(pCodeFold);
	
	if (bClipboard && AkelPad.IsPluginRunning(pClipboard))
		AkelPad.Call(pClipboard);
	
	if (bLog && AkelPad.IsPluginRunning(pLog))
		AkelPad.Call(pLog);
	
	if (bStatusBar && AkelPad.SendMessage(hWndMain, 1222 /*AKD_GETMAININFO*/, 142 /*MI_STATUSBAR*/, 0))
		AkelPad.Command(IDM_VIEW_SHOW_STATUSBAR);
	
	if (bMenu) {
		var oSys = AkelPad.SystemFunction();
		var hMenu = oSys.Call("user32::GetMenu", hWndMain);
	}
	
	//ЗАПУСК ПОЛНОЭКРАННОГО РЕЖИМА
	AkelPad.Call(pFullScreen);
	
	if (Toolbars) {
		for (i = Toolbars.length - 1; i >= 0; i--) {
			AkelPad.Call(Toolbars[i].file, 1, Toolbars[i].rows);
		}
	}
	
	if (bExplorer)
		AkelPad.Call(pExplorer);
	
	if (bCodeFold)
		AkelPad.Call(pCodeFold);
	
	if (bClipboard)
		AkelPad.Call(pClipboard);
	
	if (bLog)
		AkelPad.Call(pLog);
	
	if (bStatusBar)
		AkelPad.Command(IDM_VIEW_SHOW_STATUSBAR);
	
	if (bMenu)
		oSys.Call("user32::SetMenu", hWndMain, hMenu);
	
	if (nTabBar) {
		var nCommand;
		if (nTabBar > 1)
			nCommand = nTabBar;
		else {
			var nState = AkelPad.SendMessage(hWndMain, 1222 /*AKD_GETMAININFO*/, 157 /*MI_TABOPTIONSMDI*/, 0);
			if (nState & 2 /*TAB_VIEW_TOP*/)
				nCommand = 4301;		/*IDM_WINDOW_TABVIEW_TOP*/
			else
				nCommand = 4302;		/*IDM_WINDOW_TABVIEW_BOTTOM*/
		}
		AkelPad.Command(4303 /*IDM_WINDOW_TABVIEW_NONE*/);
		AkelPad.Command(nCommand);
	}
}

//ПЕРЕХОД ИЗ ПОЛНОЭКРАННОГО РЕЖИМА В ОБЫЧНЫЙ
else
{
	AkelPad.Call(pFullScreen);
	
	//если тулбар отключён - включаем для нормального восстановления вида проги
	if (Toolbars) {
		for (i = Toolbars.length - 1; i >= 0; i--) {
			if (!AkelPad.IsPluginRunning(Toolbars[i].file))
				AkelPad.Call(Toolbars[i].file);
		}
	}
}

// преобразование отдельного тулбара из соотв. аргумента в определённую структуру
function getToolbar(pToolbar) {
	return {
		file: pToolbar[0] + "::Main",
		rows: (Toolbars.length > 1 && pToolbar[Toolbars.length-1]) ? pToolbar[1] : ""
	}
}