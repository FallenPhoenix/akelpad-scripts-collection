// http://akelpad.sourceforge.net/forum/viewtopic.php?p=5808#5808
// Version v1.0
//
//
//// Select range of lines.

var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var pInputText;
var lpRangeArray;
var nMinLine;
var nMaxLine;
var nMinLineIndex;
var nMaxLineIndex;

if (hMainWnd)
{
  nMinLine=AkelPad.SendMessage(hWndEdit, 1078 /*EM_EXLINEFROMCHAR*/, 0, AkelPad.GetSelStart());
  nMaxLine=AkelPad.SendMessage(hWndEdit, 1078 /*EM_EXLINEFROMCHAR*/, 0, AkelPad.GetSelEnd());

  if (pInputText=AkelPad.InputBox(hMainWnd, WScript.ScriptName, "LineStart-LineEnd", nMinLine + "-" + nMaxLine))
  {
    if (lpRangeArray=pInputText.split("-"))
    {
      if (lpRangeArray.length == 1)
      {
        nMinLineIndex=AkelPad.SendMessage(hWndEdit, 187 /*EM_LINEINDEX*/, lpRangeArray[0], 0);
        AkelPad.SetSel(nMinLineIndex, nMinLineIndex);
      }
      else if (lpRangeArray.length == 2)
      {
        nMinLineIndex=AkelPad.SendMessage(hWndEdit, 187 /*EM_LINEINDEX*/, lpRangeArray[0], 0);
        nMaxLineIndex=AkelPad.SendMessage(hWndEdit, 187 /*EM_LINEINDEX*/, lpRangeArray[1], 0);
        AkelPad.SetSel(nMinLineIndex, nMaxLineIndex);
      }
    }
  }
}
