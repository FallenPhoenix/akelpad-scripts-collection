// Create new NTFS stream

var sFile = AkelPad.GetEditFile(0);
var sStream;
var sDrive;

if (AkelPad.Include("FileAndStream_functions.js") && sFile)
{
  sDrive = sFile.substr(0, 3).toUpperCase();

  if (IsSupportStreams(sDrive))
  {
    sStream = AkelPad.InputBox(AkelPad.GetMainWnd(), "Create new NTFS stream", "Input stream name:", "");

    if (sStream)
    {
      if (IsStreamExists(sFile, sStream))
        WScript.Echo('Stream "' + sStream + '" already exists.');
      else
      {
        if (CreateFile(sFile, sStream))
          WScript.Echo('Stream "'  + sStream + '" has been created.');
        else
          WScript.Echo('Error: failed to create stream.');
      }
    }
  }
  else
    WScript.Echo("Drive "  + sDrive + " does not supports NTFS streams.");
}
