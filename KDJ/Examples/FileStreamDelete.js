// Delete NTFS stream

var sFile   = AkelPad.GetEditFile(0);
var sStream = "";
var sDrive;
var aStream;

if (AkelPad.Include("FileAndStream_functions.js") && sFile)
{
  sDrive = sFile.substr(0, 3).toUpperCase();

  if (IsSupportStreams(sDrive))
  {
    aStream = EnumStreams(sFile);
    if (aStream.length > 1)
      sStream = aStream[1][0];

    sStream = AkelPad.InputBox(AkelPad.GetMainWnd(), "Delete NTFS stream", "Input stream name:", sStream);

    if (sStream)
    {
      if (IsStreamExists(sFile, sStream))
      {
        if (DeleteFile(sFile, sStream))
          WScript.Echo('Stream "'  + sStream + '" has been deleted.');
        else
          WScript.Echo('Error: failed to delete.');
      }
      else
        WScript.Echo('Stream "' + sStream + '" does not exists.');
    }
  }
  else
    WScript.Echo("Drive "  + sDrive + " does not supports NTFS streams.");
}
