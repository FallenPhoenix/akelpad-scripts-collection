///Insert line feed after <br />, replace <br> on <br /> (XHTML)
///¬ставка переводов строк после <br>, замена <br> на <br /> (стандарт XHTML)
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1854#1854
// Version: 3.5 (2011.03.22)

if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
oCh.runWithRedraw();


function process()
{
	oCh.Text = oCh.getSelTextAll();
	
	var poz = oCh.Text.indexOf('<br');
	if (poz != -1)
	{
		oCh.Text = oCh.Text.replace(/<br>/g, '<br />');
		var br = new RegExp('<br />', "g");
		oCh.Text = oCh.Text.replace(br, '<br />\n');
		
		oCh.Text = oCh.Text.replace(/></g, '>\n<');
		
		oCh.Text = oCh.Text.replace(/(\S)[ \t]*(<hr([ \t][^<>]*)?>)/, "$1\n$2");
		oCh.Text = oCh.Text.replace(/(<hr([ \t][^<>]*)?>)[ \t]*(\S)/, "$1\n$3");
	}
	else
	{
		oCh.Text = oCh.Text.replace(/\r/g, '<br />\r')
	}
}