// http://akelpad.sourceforge.net/forum/viewtopic.php?p=4678#4678
// Version v1.0
//
//
//// Save new file to a default folder.

var fso=new ActiveXObject("Scripting.FileSystemObject");

//Options
var pDefaultDir="C:\\MyFolder\\";
var pDefaultName="new";
var pDefaultExt=".txt";
var nDefaultCodePage=-1;
var bDefaultBOM=-1;

var hMainWnd=AkelPad.GetMainWnd();
var hEditWnd=AkelPad.GetEditWnd();
var pFile=AkelPad.GetEditFile(0);
var nFileCount;
var nSaveResult;

if (hMainWnd)
{
  if (pFile == "")
  {
    if (fso.FolderExists(pDefaultDir))
    {
      for (nFileCount=1; ; ++nFileCount)
      {
        pFile="" + pDefaultDir + pDefaultName + nFileCount + pDefaultExt;

        if (!fso.FileExists(pFile))
        {
          if (nSaveResult=AkelPad.SaveFile(hEditWnd, pFile, nDefaultCodePage, bDefaultBOM))
            AkelPad.MessageBox(hMainWnd, "Error: " + nSaveResult, WScript.ScriptName, 16 /*MB_ICONERROR*/);
          break;
        }
      }
    }
    else AkelPad.MessageBox(hMainWnd, "Folder \"" + pDefaultDir + "\" doesn't exist", WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/);
  }
  else AkelPad.SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4105 /*IDM_FILE_SAVE*/, 0);
}
