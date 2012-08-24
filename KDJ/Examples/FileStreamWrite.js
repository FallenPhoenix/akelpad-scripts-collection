// Write selected text to NTFS stream.
// If no selection, all text.
// Previous contents of the stream will be deleted.

var sFile   = AkelPad.GetEditFile(0);
var sStream = "";
var sDrive;
var aStream;
var sData;

if (AkelPad.Include("FileAndStream_functions.js") && sFile)
{
  sDrive = sFile.substr(0, 3).toUpperCase();

  if (IsSupportStreams(sDrive))
  {
    aStream = EnumStreams(sFile);
    if (aStream.length > 1)
      sStream = aStream[1][0];

    sStream = AkelPad.InputBox(AkelPad.GetMainWnd(), "Write text to NTFS stream", "Input stream name:", sStream);

    if (sStream)
    {
      if (IsStreamExists(sFile, sStream))
      {
        if (AkelPad.GetSelStart() == AkelPad.GetSelEnd())
          sData = AkelPad.GetTextRange(0, -1);
        else
          sData = AkelPad.GetSelText();

        if (WriteFile(sFile, sStream, sData, 1))
          WScript.Echo('Stream "'  + sStream + '" has been written.');
        else
          WScript.Echo('Error: failed to write.');
      }
      else
        WScript.Echo('Stream "' + sStream + '" does not exists.');
    }
  }
  else
    WScript.Echo("Drive "  + sDrive + " does not supports NTFS streams.");
}
