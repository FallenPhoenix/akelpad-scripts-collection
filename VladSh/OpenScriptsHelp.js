///Opens help for Scripts-plugin and goes to the requested method
///Открывает справку по Scripts-плагину и переходит к запрашиваемому методу
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=8164#8164
// Version: 1.3 (2011.07.21)

if (! AkelPad.Include("OpenHelpString.js")) WScript.Quit();

var pLng = AkelPad.GetArgLine() || "Rus";

var pHelpFile = "\\AkelFiles\\Docs\\Plugs\\Scripts-" + pLng + ".txt";

openHelpString(pHelpFile, AkelPad.GetSelText(), 2);