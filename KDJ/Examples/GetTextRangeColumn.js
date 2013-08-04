// GetTextRangeColumn() function returns columnar text, without selecting - 2011-01-15
//
// Example of use:

var Txt = GetTextRangeColumn([0, 3], [6, 12], 1, 1, 1);
AkelPad.Command(4101);
AkelPad.ReplaceSel(Txt);

/////////////////////////////////////////////
// aBeg = [nBeginLine, nBeginColumn]
// aEnd = [nEndLine,   nEndColumn]
// Optional:
// bReturnText = 0 //return array of lines (default)
//               1 //return text
// nNewLine = 1  //"\r" new line (default)
//            2  //"\n" new line
//            3  //"\r\n" new line
// bFillSpaces = 0 //(default)
//               1 //fill empties with spaces
/////////////////////////////////////////////
function GetTextRangeColumn(aBeg, aEnd, bReturnText, nNewLine, bFillSpaces)
{
  var hEditWnd  = AkelPad.GetEditWnd();
  var nBegLine1;
  var nBegLine2;
  var nLenLine2;
  var nLine1;
  var nLine2;
  var nCol1;
  var nCol2;
  var aLines;
  var nWidth;
  var i;

  if (aBeg[0] < aEnd[0])
  {
    nLine1 = aBeg[0];
    nLine2 = aEnd[0];
  }
  else
  {
    nLine1 = aEnd[0];
    nLine2 = aBeg[0];
  }

  if (aBeg[1] < aEnd[1])
  {
    nCol1 = aBeg[1];
    nCol2 = aEnd[1];
  }
  else
  {
    nCol1 = aEnd[1];
    nCol2 = aBeg[1];
  }

	nBegLine1 = AkelPad.SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/, nLine1, 0);
	nBegLine2 = AkelPad.SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/, nLine2, 0);
	nLenLine2 = AkelPad.SendMessage(hEditWnd, 193 /*EM_LINELENGTH*/, nBegLine2, 0);
  aLines    = AkelPad.GetTextRange(nBegLine1, nBegLine2 + nLenLine2, 1 /*"\r"*/).split("\r");
  nWidth    = nCol2 - nCol1;

  for (i = 0; i < aLines.length; ++i)
  {
    aLines[i] = aLines[i].substring(nCol1, nCol2);
    if (bFillSpaces)
      while (aLines[i].length < nWidth)
        aLines[i] += " ";
  }

  if (bReturnText)
  {
    if ((! nNewLine) || (nNewLine == 1))
      pNewLine = "\r";
    else if (nNewLine == 2)
      pNewLine = "\n";
    else
      pNewLine = "\r\n";

    return aLines.join(pNewLine);
  }
  else
    return aLines;
}
