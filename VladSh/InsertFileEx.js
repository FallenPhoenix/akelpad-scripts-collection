///Inserts the selected text file into the current file
///������� ���������� ���������� ����� � �������
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1357#1357
// Version: 1.10 (2011.07.21)
// 
// -"��������\����..." Call("Scripts::Main", 1, "InsertFileEx.js", `"%f"`)

var fileName = WScript.Arguments(0);

if (fileName == AkelPad.GetEditFile(0))
{
   //������ �������� �����
   if (! AkelPad.Include("CommonFunctions.js")) WScript.Quit();
   fileName = FileDialogDefault(true, fileName, GetFileExt(fileName));
}

if (fileName)
{
   //���������� ����������� �����
   var fso = new ActiveXObject("Scripting.FileSystemObject");
   if (fso.FileExists(fileName))
   {
      //���������� ����������� �����
      var Content = AkelPad.ReadFile(fileName);

      //������ ����������� � ���� �������������� Akel'�
      AkelPad.ReplaceSel(Content);
   }
}