///Inserts the selected text file into the current file
///Вставка выбранного текстового файла в текущий
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1357#1357
// Version: 1.10 (2011.07.21)
// 
// -"Вставить\Файл..." Call("Scripts::Main", 1, "InsertFileEx.js", `"%f"`)

var fileName = WScript.Arguments(0);

if (fileName == AkelPad.GetEditFile(0))
{
   //Диалог открытия файла
   if (! AkelPad.Include("CommonFunctions.js")) WScript.Quit();
   fileName = FileDialogDefault(true, fileName, GetFileExt(fileName));
}

if (fileName)
{
   //Считывание содержимого файла
   var fso = new ActiveXObject("Scripting.FileSystemObject");
   if (fso.FileExists(fileName))
   {
      //Считывание содержимого файла
      var Content = AkelPad.ReadFile(fileName);

      //Запись содержимого в окно редактирования Akel'а
      AkelPad.ReplaceSel(Content);
   }
}