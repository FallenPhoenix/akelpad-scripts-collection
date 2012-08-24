// Opens NTFS stream for editing in AkelPad window.
// If the stream does not exists, creates new empty stream and opens it.

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

    sStream = AkelPad.InputBox(AkelPad.GetMainWnd(), "Open NTFS stream", "Input stream name:", sStream);

    if (sStream)
      AkelPad.OpenFile(sFile + ":" + sStream);
  }
  else
    WScript.Echo("Drive "  + sDrive + " does not supports NTFS streams.");
}
