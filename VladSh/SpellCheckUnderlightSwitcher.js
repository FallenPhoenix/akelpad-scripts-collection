///Enable/Disable highlighting misspelled words
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=15158#15158
// Version: 1.2 (2012.01.17)
//
// -"ѕравописание: подсветить" Call("Scripts::Main", 1, "SpellCheckUnderlightSwitcher.js", `"txt"`) Icon("%a\AkelFiles\Plugs\Toolbar\spellcheck-error.ico")

var pFunc = "SpellCheck::Background";

if (AkelPad.IsPluginRunning(pFunc))
	AkelPad.Call(pFunc);
else
{
	var fileExt = AkelPad.GetArgLine();
	if (!fileExt)
	{
		if (!AkelPad.GetEditFile(0))
			fileExt = "txt";
		else
			fileExt = 0;		//инициируем авто-определение расширени€
	}
	AkelPad.Call(pFunc, 0, fileExt);
}