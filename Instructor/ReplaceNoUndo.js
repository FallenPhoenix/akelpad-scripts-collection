// http://akelpad.sourceforge.net/forum/viewtopic.php?p=5891#5891
// Version v1.0
//
//
//// Turn off undo while replace dialog is open.

var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var nUndoLimit;
var lpType;

if (hMainWnd)
{
  if (lpType=AkelPad.MemAlloc(4 /*sizeof(int)*/))
  {
    nUndoLimit=AkelPad.SendMessage(hWndEdit, 3084 /*AEM_GETUNDOLIMIT*/, 0, 0);
    AkelPad.SendMessage(hWndEdit, 3079 /*AEM_EMPTYUNDOBUFFER*/, 0, 0);
    AkelPad.SendMessage(hWndEdit, 3085 /*AEM_SETUNDOLIMIT*/, 0, 0);
    AkelPad.Command(4161 /*IDM_EDIT_REPLACE*/);

    for (;;)
    {
      //Wait for closing replace dialog
      AkelPad.SendMessage(hMainWnd, 1275 /*AKD_GETMODELESS*/, 0, lpType);
      if (AkelPad.MemRead(lpType, 3 /*DT_DWORD*/) == 4 /*MLT_REPLACE*/)
        WScript.Sleep(100);
      else
        break;
    }

    AkelPad.SendMessage(hWndEdit, 3085 /*AEM_SETUNDOLIMIT*/, nUndoLimit, 0);
    AkelPad.MemFree(lpType);
  }
}
