///Go to FullScreen-mode with additional options for display panels; a return to normal-mode
///Переход в полноэкранный режим с возможностью отображения определённого тулбара; возвращение в нормальный режим
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=18081#18081
// Version: 2.1 (2012.05.24)
// 
// Examples:
// -"Обычный" Call("Scripts::Main", 1, "FullScreenEx.js")
// -"С тулбаром по умолчанию" Call("Scripts::Main", 1, "FullScreenEx.js", `-ToolBar="ToolBar"`)
// -"С панелями для работы с XML" Call("Scripts::Main", 1, "FullScreenEx.js", `-ToolBar="ToolBar-XML" -CodeFold=1`)
// -"Псевдо-SDI" Call("Scripts::Main", 1, "FullScreenEx.js", `-ToolBar="ToolBar" -Menu=1 -StatusBar=1`)

var pFullScreen = "FullScreen::Main";
var pToolBar = AkelPad.GetArgValue("ToolBar", "");
if (pToolBar) 
	pToolBar += "::Main";

//ПЕРЕХОД ИЗ ОБЫЧНОГО РЕЖИМА В ПОЛНОЭКРАННЫЙ
if (!AkelPad.IsPluginRunning(pFullScreen))
{
	var pExplorer = "Explorer::Main";
	var pCodeFold = "Coder::CodeFold";
	var pClipboard = "Clipboard::Capture";
	var pLog = "Log::Output";
	var IDM_VIEW_SHOW_STATUSBAR = 4211;
	var hWndMain = AkelPad.GetMainWnd();
	
	var bExplorer = AkelPad.GetArgValue("Explorer", 0);
	var bCodeFold = AkelPad.GetArgValue("CodeFold", 0);
	var bClipboard = AkelPad.GetArgValue("Clipboard", 0);
	var bLog = AkelPad.GetArgValue("Log", 0);
	var bStatusBar = AkelPad.GetArgValue("StatusBar", 0);
	var bMenu = AkelPad.GetArgValue("Menu", 0);
	
	//если панели перед запуском включены, - отключаем, т.к. без этого потом не запустятся
	
	if (pToolBar && AkelPad.IsPluginRunning(pToolBar))
		AkelPad.Call(pToolBar);
	
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
	
	if (bMenu)
	{
		var oSys = AkelPad.SystemFunction();
		var hMenu = oSys.Call("user32::GetMenu", hWndMain);
	}
	
	//ЗАПУСК ПОЛНОЭКРАННОГО РЕЖИМА
	AkelPad.Call(pFullScreen);
	
	if (pToolBar)
			AkelPad.Call(pToolBar);
	
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
}

//ПЕРЕХОД ИЗ ПОЛНОЭКРАННОГО РЕЖИМА В ОБЫЧНЫЙ
else
{
	AkelPad.Call(pFullScreen);
	
	if (!AkelPad.IsPluginRunning(pToolBar))		//если тулбар отключён - включаем для нормального восстановления вида проги
		AkelPad.Call(pToolBar);
}