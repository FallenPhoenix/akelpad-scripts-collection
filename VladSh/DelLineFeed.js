///Delete lines feed
///Убирает переводы строк
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=2023#2023
// Version: 3.7 (2011.07.21)

if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
oCh.runWithRedraw();


function process()
{
	oCh.Text = oCh.getSelTextAll();
	if (oCh.Text)
	{
		oStr.flags = "gm";			//выставляем флаг обработки всех строк, а не только первой
		oCh.Text = oStr.rtrim(oCh.Text, " \t");			//во многих текстах, скачанных из инета в конце каждой строки идёт пробел, который здесь удаляем
		oCh.Text = oCh.Text.replace(/-\r/g, "");			//склеиваем строки, удаляя <знак переноса>(спорная вещь, т.к. это может быть слово, состоящее из 2-х слов) + <перевод строки>
		oCh.Text = oCh.Text.replace(/\r/g, " ");			//склеиваем, оставшиеся не соединёнными, строки через пробел
		oCh.Text = oCh.Text.replace(/  /g, " ");			//убираем повторяющиеся пробелы
		
		oCh.setSelCaret(oCh.rBegin[0] + oCh.Text.length);			//ставим каретку - в конец текста
	}
}