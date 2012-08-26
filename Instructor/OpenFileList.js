// http://akelpad.sourceforge.net/forum/viewtopic.php?p=5464#5464
// Version v1.0
//
//
//// Open files in file list.
//
// Arguments:
// -FileList="files.lst"
//
// Usage:
// Call("Scripts::Main", 1, "OpenFileList.js", `-FileList="C:\MyFiles.txt"`)

var pFileList=AkelPad.GetArgValue("FileList", "");

OpenFilesInFileList(pFileList);

function OpenFilesInFileList(pFileList)
{
  var pFilesText;
  var nIndex;

  if (pFileList)
  {
    if (pFilesText=AkelPad.ReadFile(pFileList))
    {
      pFilesText=pFilesText.replace(/\r\r\n|\r\n|\r|\n/g, "\n");
      if (pLinesArray=pFilesText.split("\n"))
      {
        for (nIndex=0; nIndex < pLinesArray.length; ++nIndex)
        {
          if (pLinesArray[nIndex])
          {
            AkelPad.OpenFile(pLinesArray[nIndex]);
          }
        }
      }
    }
  }
}
