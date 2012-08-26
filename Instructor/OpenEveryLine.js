// http://akelpad.sourceforge.net/forum/viewtopic.php?p=5464#5464
// Version v1.1
//
//
//// One line - one file. Open all selected lines.

var WshShell=new ActiveXObject("WScript.shell");

var pSelText;
var nIndex;

if (pSelText=AkelPad.GetSelText())
{
  if (pLinesArray=pSelText.split("\r"))
  {
    for (nIndex=0; nIndex < pLinesArray.length; ++nIndex)
    {
      if (pLinesArray[nIndex])
      {
        WshShell.Run(pLinesArray[nIndex], 1, false);
      }
    }
  }
}
