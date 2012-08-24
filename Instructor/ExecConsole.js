// http://akelpad.sourceforge.net/forum/viewtopic.php?p=2150#2150
// Version v1.0
//
//
//// Exec console program without DOS-box and capture output.

var WshShell=new ActiveXObject("WScript.shell");
var fso=new ActiveXObject("Scripting.FileSystemObject");

//Options
var pDelimiter="\n========================================\n";
var bEraseEdit=false;

var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var oSys=AkelPad.SystemFunction();
var pCommand;
var pTmpFile;
var pText;
var nSelStart;

if (hWndEdit)
{
  if (WScript.Arguments.length)
    pCommand=WScript.Arguments(0);
  else
    pCommand=AkelPad.InputBox(hMainWnd, WScript.ScriptName, "Command:", "ipconfig");

  if (pCommand)
  {
    if (pTmpFile=CreateTempFile())
    {
      if (pTmpFile.search(/ /) != -1)
        pTmpFile="\"" + pTmpFile + "\"";
      WshShell.Run("%COMSPEC% /c " + pCommand + ">" + pTmpFile, 0, true);

      pText=AkelPad.ReadFile(pTmpFile);
      pText=pDelimiter + pText;

      SetRedraw(hWndEdit, false);
      if (bEraseEdit)
        AkelPad.SetSel(0, -1);
      else
        AkelPad.SetSel(0x7FFFFFFF, 0x7FFFFFFF);
      nSelStart=AkelPad.GetSelStart();
      AkelPad.ReplaceSel(pText);
      AkelPad.SetSel(nSelStart + 1, nSelStart + 1);
      SetRedraw(hWndEdit, true);

      fso.DeleteFile(pTmpFile);
    }
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
