// === [XMLValidator.js] ===
// Panych Y.W. aka FeyFre (c) 2011
//
//  Validates selected XML fragment or whole document, pointing potential error place
//  Argument: keep selection if any(not set cursor to error place)
// Example:
//   Call("Scripts::Main", 1, "XMLValidator.js",["true"])
//
//  http://akelpad.sourceforge.net/forum/viewtopic.php?p=15256#15256
//

var keep = false;
var selection = true;
if (WScript.Arguments.length >= 1)
{
	var arg = WScript.Arguments(0);
	if(arg)
	{
		if(arg.match(/true|yes/gi))
			keep = true;
		else {
			var m = arg.match(/\d+/gi);
			if(m && parseInt(m) !=0)
				keep = true;
		}
	}
}
var xml = new ActiveXObject("msxml2.DOMDocument");
try
{
	xml.async=false;
	xml.validateOnParse = true;
	xml.resolveExternals = false;
}
catch(e)
{
	WScript.Echo("Internal parser error: "+e.description);
	WScript.Quit();
}
var text = AkelPad.GetSelText();

if(!text)
{
	text = AkelPad.GetTextRange(0,-1);
	selection = false;
}
xml.loadXML(text);
if(xml.parseError.errorCode!=0)
{
	var err = xml.parseError;
	if(!selection || !keep)
	{
		var np = Math.min(AkelPad.GetSelStart(),AkelPad.GetSelEnd());
		if(selection)
		{
			np = np + err.filepos;
		}
		else np = err.filepos;
		AkelPad.SetSel(np,np);
	}
	WScript.Echo("Validation error("+err.linepos+","+err.line+"):\n"+err.reason);
}
else
{
	WScript.Echo("XML fragment is valid");
}