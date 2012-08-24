// http://akelpad.sourceforge.net/forum/viewtopic.php?p=4393#4393
// Version v1.0
//
//
//// Increment selection (version).
//
//  1.0.1 -> 1.0.2
//  1.0.9 -> 1.1.0


var hMainWnd=AkelPad.GetMainWnd();
var pSelText;
var pDelimiter;
var pLinesArray;
var nIndex;

if (hMainWnd)
{
  if (pSelText=AkelPad.GetSelText())
  {
    if (pSelText.match(/([.,])/))
    {
      pDelimiter=RegExp.$1;

      if (pLinesArray=pSelText.split(pDelimiter))
      {
        for (nIndex=pLinesArray.length - 1; nIndex >= 0; --nIndex)
        {
          pLinesArray[nIndex]=parseInt(pLinesArray[nIndex]) + 1;
          pLinesArray[nIndex]="" + pLinesArray[nIndex];
          if (pLinesArray[nIndex].length <= 1)
            break;
          pLinesArray[nIndex]=0;
        }
        pSelText=pLinesArray.join(pDelimiter);
        AkelPad.ReplaceSel(pSelText, true);
      }
    }
  }
}
