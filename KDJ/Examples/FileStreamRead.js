// Read contents of NTFS stream to variable.

var sFile   = AkelPad.GetEditFile(0);
var sStream = "";
var sDrive;
var aStream;
var sContents;

if (AkelPad.Include("FileAndStream_functions.js") && sFile)
{
  sDrive = sFile.substr(0, 3).toUpperCase();

  if (IsSupportStreams(sDrive))
  {
    aStream = EnumStreams(sFile);
    if (aStream.length > 1)
      sStream = aStream[1][0];

    sStream = AkelPad.InputBox(AkelPad.GetMainWnd(), "Read NTFS stream", "Input stream name:", sStream);

    if (sStream)
    {
      if (IsStreamExists(sFile, sStream))
      {
        sContents = AkelPad.ReadFile(sFile + ":" + sStream);
        WScript.Echo(sContents);
      }
      else
        WScript.Echo('Stream "' + sStream + '" does not exists.');
    }
  }
  else
    WScript.Echo("Drive "  + sDrive + " does not supports NTFS streams.");
}
