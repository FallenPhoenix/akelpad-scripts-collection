// Enumerate NTFS streams

var sFile = AkelPad.GetEditFile(0);
var sText;
var sDrive;
var aStream;
var i;

if (AkelPad.Include("FileAndStream_functions.js") && sFile)
{
  sDrive = sFile.substr(0, 3).toUpperCase();

  if (IsSupportStreams(sDrive))
  {
    aStream = EnumStreams(sFile);
    sText   = sFile + "\n\nNumber of streams: " + aStream.length + "\n\n";

    for (i = 0; i < aStream.length; ++i)
      sText += ((aStream[i][0]) ? aStream[i][0] : "<unnamed - main stream>") + "      " + aStream[i][1] + " B\n";

    WScript.Echo(sText);
  }
  else
    WScript.Echo("Drive "  + sDrive + " does not supports NTFS streams.");
}
