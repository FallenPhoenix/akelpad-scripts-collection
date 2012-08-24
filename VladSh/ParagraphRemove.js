///Удаление параграфа по Ctrl+Alt+Y
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=11267#11267
// Version: 1.2 (2011.12.12)

if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
selCompleteLine(AkelPad.GetSelStart(), AkelPad.GetSelEnd());

AkelPad.Command(4197);