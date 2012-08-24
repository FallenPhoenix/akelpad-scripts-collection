// http://akelpad.sourceforge.net/forum/viewtopic.php?p=13770#13770
// Version v1.0
//
//
//// Get composition number members. For example: 0x7 is expaned to 0x1|0x2|0x4 and 7 expaned to 1+2+4.

var pSelText=AkelPad.GetSelText();
var dwInitNumber=parseInt(pSelText);

if (dwInitNumber)
{
  var pResult10="" + dwInitNumber.toString(10) + "=";
  var pResult16="0x" + dwInitNumber.toString(16) + "=";
  var dwNumber=dwInitNumber;
  var dwCount;

  for (dwCount=0x00000001; dwCount <= 0x80000000; dwCount*=2)
  {
    if (dwNumber & dwCount)
    {
      pResult10+=(dwNumber == dwInitNumber?"":"+") + dwCount.toString(10);
      pResult16+=(dwNumber == dwInitNumber?"0x":"|0x") + dwCount.toString(16);
      if (!(dwNumber=dwNumber & ~dwCount))
        break;
    }
  }
  AkelPad.ReplaceSel(pResult16 + "\n" + pResult10);
}
