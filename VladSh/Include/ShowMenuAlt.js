///Script "library" for working with menu of users (code of menu take from *.js-files)
// must be placed in ...\Scripts\Include\
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=8153#8153
// Version: 3.0 (2011.06.21)
//
/// Show custom popup menu (run this script with arguments)
//
// Various menu code located at "[AkelPad]\AkelFiles\Plugs\Scripts\Params\ShowMenuEx" directory.
//
// Your custom menu call example via ContextMenu plugin:
//  -"My menu" Call("Scripts::Main", 1, "ShowMenuEx.js", `"MyMenu.js"`)
// Toolbar button menu example via Toolbar plugin:
//  -"Button menu" Call("Scripts::Main", 1, "ShowMenuEx.js", `"TestButton.js" "%m" "%i"`) Icon(0)

/// Показывает пользовательское меню
//
// Код различных меню размещается в директории "[AkelPad]\AkelFiles\Plugs\Scripts\Params\ShowMenuEx".
//
// Пример вызова своего меню через ContextMenu плагин:
//  -"Моё меню" Call("Scripts::Main", 1, "ShowMenuEx.js", `"MyMenu.js"`)
// Пример вызова меню для кнопки на панели инструментов через Toolbar плагин:
//  -"Меню кнопки" Call("Scripts::Main", 1, "ShowMenuEx.js", `"TestButton.js" "%m" "%i"`) Icon(0)


//Подключение общего скрипта-"библиотеки" вывода меню
if (! AkelPad.Include("ShowMenuCommon.js")) WScript.Quit();

if (hWndMain)
{
	//Arguments
	if (WScript.Arguments.length >= 1)
	{
		pMenuFile = WScript.Arguments(0);		//имя файла скрипта, в котором хранятся описания меню
		
		if (WScript.Arguments.length >= 2)
		{
			hToolbarHandle = parseInt(WScript.Arguments(1));
	
			if (WScript.Arguments.length >= 3)
				nToolbarItemID = parseInt(WScript.Arguments(2));
		}
	}
	
	if (!pMenuFile)
		pMenuFile = "Default.js";
	INCLUDE("\\Params\\" + "ShowMenuAlt.js" + "\\" + pMenuFile);
}


///Подключает файл скрипта из ..\Scripts\...
function INCLUDE(pScript)
{
	eval(AkelPad.ReadFile(AkelPad.GetAkelDir(5) /*ADTYPE_SCRIPTS*/ + pScript));
}