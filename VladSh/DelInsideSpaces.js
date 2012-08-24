///Delete repeated spaces inside the text
///”бирает пустые символы внутри текста
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=5577#5577
// Version: 3.5 (2011.03.22)

if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
oCh.runWithRedraw();


function process()
{
	oCh.Text = oCh.getSelTextAll();
	oCh.Text = oCh.Text.replace(/\ {2,}/g, ' ');		//”бираем повтор€ющиес€ пробелы
	oCh.Text = oCh.Text.replace(/\t{2,}/g, '\t');		//”бираем повтор€ющиес€ табул€ции
}