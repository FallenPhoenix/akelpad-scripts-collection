///Convert selected lines to predefine structure
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1420#1420
// Version: 5.0 (2012.10.04)
// 
// Parameters:
//    -shift - lines shift to the right:
//       • without this parameter - shift from program settings;
//       • "" / "\t" or other value
// 
// Examples:
//    • HTML (ul):
// -"<ul>...</ul>" Call("Scripts::Main", 1, "insertStructure.js", `-rootOpen="<ul>" -lineOpen="<li>" -lineClose="</li>" -rootClose="</ul>"`)
//    • fb2 (stanza);
//    • BbCode (list):
// -"[list]...[/list]" Call("Scripts::Main", 1, "insertStructure.js", `-rootOpen="[list]" -lineOpen="[*]" -rootClose="[/list]" -shift=""`)


if (AkelPad.IsAkelEdit()) {
	if (WScript.Arguments.length == 0) WScript.Quit();
	
	if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
	
	oCh.runWithRedraw();
}

function process() {
	var rootOpen = AkelPad.GetArgValue("rootOpen", "");
	var lineOpen = AkelPad.GetArgValue("lineOpen", "");
	var lineClose = AkelPad.GetArgValue("lineClose", "");
	var rootClose = AkelPad.GetArgValue("rootClose", "");
	
	if (AkelPad.GetArgLine().indexOf("-shift") != -1) {
		sShift = escSequencesProcessing(AkelPad.GetArgValue("shift", ""));
	}
	else
		getShift();
	lineOpen = sShift + lineOpen;
	
	oCh.setCompleteLineText();
	
	var spaces = oCh.Text.match(/^[ \t]*/)[0];
	if (rootOpen) rootOpen = spaces + rootOpen + "\r";
	if (rootClose) rootClose = "\r" + spaces + rootClose;
	
	var lines = oCh.Text.replace(/^([ \t]*)(\S)/mg, "$1" + lineOpen + "$2").replace("\r", lineClose + "\r") + lineClose;
	if (!oCh.Text)
		lines = lineOpen + lines;
	
	oCh.Text = rootOpen + lines + rootClose;
}