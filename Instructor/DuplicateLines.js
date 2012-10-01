// http://akelpad.sourceforge.net/forum/viewtopic.php?p=6504#6504
// Version v1.1
//
//
//// Duplicate selected lines.

var hWndEdit=AkelPad.GetEditWnd();
var pSelText;
var pLinesArray;
var pResultArray=new Array();
var nLinesIndex;
var nResultIndex=0;

if (hWndEdit)
{
  if (AkelPad.GetSelStart() == AkelPad.GetSelEnd())
    SelectCaretLine(hWndEdit);

  if (pSelText=AkelPad.GetSelText())
  {
    if (pLinesArray=pSelText.split("\r"))
    {
      for (nLinesIndex=0; nLinesIndex < pLinesArray.length; ++nLinesIndex)
      {
        pResultArray[nResultIndex++]=pLinesArray[nLinesIndex];
        pResultArray[nResultIndex++]=pLinesArray[nLinesIndex];
      }
      pSelText=pResultArray.join("\r");
    }
    AkelPad.ReplaceSel(pSelText, true);
  }
}

function SelectCaretLine(hWnd)
{
  var nCaretOffset=AkelPad.GetSelStart();
  var nCaretLine;
  var nLineStart;
  var nLineEnd;

  nCaretLine=AkelPad.SendMessage(hWnd, 1078 /*EM_EXLINEFROMCHAR*/, 0, nCaretOffset);
  nLineStart=AkelPad.SendMessage(hWnd, 187 /*EM_LINEINDEX*/, nCaretLine, 0);
  nLineEnd=nLineStart + AkelPad.SendMessage(hWnd, 193 /*EM_LINELENGTH*/, nCaretOffset, 0);

  AkelPad.SetSel(nLineStart, nLineEnd);
}
