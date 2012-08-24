// http://akelpad.sourceforge.net/forum/viewtopic.php?p=2168#2168
// Version v1.0
//
//
//// Process current file in external tool.

var WshShell=new ActiveXObject("WScript.shell");
var fso=new ActiveXObject("Scripting.FileSystemObject");

var pToolPath="c:\\Incoming\\tidy.exe";
var pToolFlags="-utf16le";
var hWndEdit=AkelPad.GetEditWnd();
var oSys=AkelPad.SystemFunction();
var pTmpFile1;
var pTmpFile2;
var pText;

if (hWndEdit)
{
  if (pTmpFile1=CreateTempFile())
  {
    if (pTmpFile2=CreateTempFile())
    {
      AkelPad.SaveFile(hWndEdit, pTmpFile1, 1200, true, false);

      if (pToolPath.search(/ /) != -1)
        pToolPath="\"" + pToolPath + "\"";
      if (pTmpFile1.search(/ /) != -1)
        pTmpFile1="\"" + pTmpFile1 + "\"";
      WshShell.Run("%COMSPEC% /c " + pToolPath + " " + pToolFlags + " " + pTmpFile1 + ">" + pTmpFile2, 0, true);

      SetRedraw(hWndEdit, false);
      AkelPad.SendMessage(hWndEdit, 3185 /*AEM_LOCKSCROLL*/, 3 /*SB_BOTH*/, true);
      pText=AkelPad.ReadFile(pTmpFile2);
      AkelPad.SetSel(0, -1);
      AkelPad.ReplaceSel(pText);
      AkelPad.SendMessage(hWndEdit, 3185 /*AEM_LOCKSCROLL*/, 3 /*SB_BOTH*/, false);
      SetRedraw(hWndEdit, true);

      fso.DeleteFile(pTmpFile2);
    }
    fso.DeleteFile(pTmpFile1);
  }
}


//Functions
function CreateTempFile()
{
  var oTmpFolder;
  var oTmpFile;
  var pTmpName;

  if (oTmpFolder=fso.GetSpecialFolder(2 /*TemporaryFolder*/))
  {
    pTmpName=fso.GetTempName();
    if (oTmpFile=oTmpFolder.CreateTextFile(pTmpName))
      oTmpFile.Close();
    return (oTmpFolder.Path + "\\" + pTmpName);
  }
  return "";
}

function SetRedraw(hWnd, bRedraw)
{
  AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
  if (bRedraw) oSys.Call("user32::InvalidateRect", hWnd, 0, true);
}
