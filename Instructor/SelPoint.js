// http://akelpad.sourceforge.net/forum/viewtopic.php?p=6064#6064
// Version v1.0
//
//
//// Selection point. First call sets selection start point, second call make selection.

var oSet=AkelPad.ScriptSettings();
var nRegSelStart=-1;
var nCurSelStart=AkelPad.GetSelStart();

if (oSet.Begin(WScript.ScriptBaseName, 0x1 /*POB_READ*/))
{
  nRegSelStart=oSet.Read("StartPos", 1 /*PO_DWORD*/);
  oSet.End();
}

if (oSet.Begin(WScript.ScriptBaseName, 0x2 /*POB_SAVE*/))
{
  if (nRegSelStart != -1)
  {
    if (nRegSelStart != nCurSelStart)
    {
      AkelPad.SetSel(nRegSelStart, nCurSelStart);
      oSet.Write("StartPos", 1 /*PO_DWORD*/, -1);
    }
  }
  else oSet.Write("StartPos", 1 /*PO_DWORD*/, nCurSelStart);

  oSet.End();
}
