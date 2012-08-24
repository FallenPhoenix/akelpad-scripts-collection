///XML: Convert SelectedText to predefine structure
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1420#1420
// Version: 4.5 (2012.06.20)
// 
// -"<ul>...</ul>" Call("Scripts::Main", 1, "XMLStructure.js")		- '<ul> ... </ul>'		- by default
// -"<stanza>...</stanza>" Call("Scripts::Main", 1, "XMLStructure.js", `"<stanza>#<v>#</v>#</stanza>"`)


if (AkelPad.GetMainWnd() && AkelPad.IsAkelEdit())
{
	if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
	
	var arrStruct = (AkelPad.GetArgLine() || "<ul>#<li>#</li>#</ul>").split("#");
	
	oCh.runWithRedraw();
}


function process()
{
	var oValues;
	getShift();
	
	oCh.setCompleteLineText();
	
	if (oCh.Text)
	{
		var arrLines = oCh.Text.split(pBreak);
		
		for (line = 0; line < arrLines.length; ++line)
		{
			oValues = separateRow(arrLines[line]);
			
			if (oStr.ltrim(oValues.right, " \t"))
				arrLines[line] = mountRow(oValues.left, oValues.right);
			else
				arrLines[line] = oValues.right + arrStruct[3] + pBreak + oValues.right + arrStruct[0];
		}
		
		oCh.Text = arrLines.join(pBreak);
	}
	else
	{
		oCh.Text = mountRow("", "");
		oValues.left = "";
	}
	
	oCh.Text = oValues.left + arrStruct[0] + pBreak + oCh.Text + pBreak + oValues.left + arrStruct[3];
}


function mountRow(pEmpty, pNotEmpty)
{
	return sShift + pEmpty + arrStruct[1] + pNotEmpty + arrStruct[2];
}