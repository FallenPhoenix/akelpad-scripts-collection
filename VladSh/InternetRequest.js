///Internet request for formed url in the arguments
///Интернет-запрос по сформированному в аргументах URL
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=7303#7303
// Version: 2.1 (24.06.2010)

if (WScript.Arguments.length == 1)
{
	var pSelText = AkelPad.GetSelText();
	if (pSelText)
	{
		var pLink = WScript.Arguments(0).replace("\\s", pSelText);
		
		var WshShell = new ActiveXObject("WScript.Shell");
		WshShell.Run('\"' + pLink + '\"');
	}
}