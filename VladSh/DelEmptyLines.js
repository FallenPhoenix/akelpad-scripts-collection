///Delete empty lines
///Удаляет пустые строки
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=2023#2023
// Version: 3.6 (2011.03.22)

if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
oCh.runWithRedraw();


function process()
{
	oCh.Text = oCh.getSelTextAll().replace(/\r{2,}/g, pBreak);		//убираем 2 и более переводов строк внутри
	oCh.Text = oStr.trim(oCh.Text, pBreak);		//убираем переводы строк по краям
}