///Delete leading and trailing spaces selected or all text
///Убирает пустые символы по краям текста
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=2023#2023
// Version: 3.5 (2011.03.22)

if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
oCh.runWithRedraw();


function process()
{
	oCh.Text = oCh.getSelTextAll();
	oStr.flags = "gm";
	oCh.Text = oStr.trim(oCh.Text, " \t");
}