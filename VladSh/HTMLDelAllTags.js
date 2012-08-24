///Remove all HTML tags...
///”дал€ет все тэги, превраща€ HTML-документ в простой текстовый файл
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1994#1994
// Version: 3.5 (2011.03.22)

if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
oCh.runWithRedraw();


function process()
{
   oCh.Text = oCh.getSelTextAll();
   
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<script', '\\/script>');		//корректно чистим скрипты, чтобы не оставались хвосты
   
   oCh.Text = oCh.Text.replace(/<[^>]*>/g, '');		//чистим другие HTML-тэги
   
   oCh.Text = oCh.Text.replace(/&nbsp;/g, ' ');
   oCh.Text = oCh.Text.replace(/&quot;/g, '"');
   oCh.Text = oCh.Text.replace(/&amp;/g, '&');
   oCh.Text = oCh.Text.replace(/&lt;/g, '<');
   oCh.Text = oCh.Text.replace(/&gt;/g, '>');
   
   oCh.Text = oCh.Text.replace(/&ndash;/g, '-');
   oCh.Text = oCh.Text.replace(/&mdash;/g, 'Ч');
   
   oCh.Text = oCh.Text.replace(/&lsquo;/g, 'С');		//лева€ одиночна€ кавычка
   oCh.Text = oCh.Text.replace(/&rsquo;/g, 'Т');		//права€ одиночна€ кавычка
   oCh.Text = oCh.Text.replace(/&sbquo;/g, 'В');		//нижн€€ одиночна€ кавычка
   oCh.Text = oCh.Text.replace(/&ldquo;/g, 'У');		//лева€ двойна€ кавычка
   oCh.Text = oCh.Text.replace(/&rdquo;/g, 'Ф');		//права€ двойна€ кавычка
   oCh.Text = oCh.Text.replace(/&bdquo;/g, 'Д');
   
   oStr.flags = "gm";
   oCh.Text = oStr.trim(oCh.Text, " \t");				//чистим строки от кучи пустых пробелов и табул€ций
   
   oCh.Text = oCh.Text.replace(/\r{3,}/gm, '\r\r');	//гасим ненужные переводы строк
}