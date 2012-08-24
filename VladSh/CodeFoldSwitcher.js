///Show area/window code navigation
///Отображение области/окна навигации по коду
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=15158#15158
// Version: 1.3 (2012.02.17)
// 
// -"Область навигации слева" Call("Scripts::Main", 1, "CodeFoldSwitcher.js") Icon("%a\AkelFiles\Plugs\Coder.dll", 1)		-	при отключении отключает и окошко, т.к. окошко без области слева вывести невозможно (
// -"Окно навигации..." Call("Scripts::Main", 1, "CodeFoldSwitcher.js", `-ShowDock=1`) Icon("%a\AkelFiles\Plugs\Coder.dll", 3)		-	отображает область с окошком, скрывает только окошко
// -"Область навигации с окном" Call("Scripts::Main", 1, "CodeFoldSwitcher.js", `-ShowDock=1 -hideAll=1`) Icon("%a\AkelFiles\Plugs\Coder.dll", 3)		-	отображает область с окошком и скрывает их все
// P.S. И ещё жаль, что теперь, т.к. используется Scripts-плагин, кнопки не вдавливаются/отжимаются...

if (! AkelPad.Include("Settings.js")) WScript.Quit();

var sParameterName = "ShowDock";

var nShowArg = AkelPad.GetArgValue(sParameterName, 0);		//наличие окошка: командуем при вызове
var nHideAll = AkelPad.GetArgValue("hideAll", 0);

var nSubDir = 4;
var sPluginFileName = "Coder";
var nType = 1 /*PO_DWORD*/;

var nShowDock = SettingsRead(nSubDir, sPluginFileName, sParameterName, nType) || 0;		//наличие окошка: что имеется в настройках

var cf = sPluginFileName + "::CodeFold";
if (AkelPad.IsPluginRunning(cf))
{
	if (nShowArg)
	{
		AkelPad.Call(cf, 1);
		if (nHideAll && nShowDock)		//на строчке выше ShowDock изменился, но если он раньше был включен, значит надо погасить
			AkelPad.Call(cf);	//выключаем плаг
	}
	else
	{
		if (nShowDock)
			AkelPad.Call(cf, 1);	//выключаем окошко
		AkelPad.Call(cf);	//выключаем плаг
	}
}
else
{
	if (!nShowArg && nShowDock)		//для случая, когда окно включать ненужно, но в ini указано ShowDock=1 (мог остаться там при нажатии стандартных кнопок либо закрывалась прога с открытым окном)
		SettingsWrite(nSubDir, sPluginFileName, sParameterName, nType, 0);
	
	AkelPad.Call(cf);	//загружаем плаг - включается область навигации слева и то, что указано в ShowDock в ini
	
	if (nShowArg && !nShowDock)		//для случая, когда окно нужно включить, а в ini ShowDock=0, ещё одним запуском с "1" выводим и окошко
		AkelPad.Call(cf, 1);
}