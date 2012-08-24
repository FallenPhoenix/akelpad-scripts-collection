// FontDialogMonospace.js - 2011-10-16
//
// Allows you to change the font, to monospace font.
// It works similarly to Command(4201) - Font dialog, but displays only monospace fonts.
//
// Usage:
// Call("Scripts::Main", 1, "FontDialogMonospace.js")

if (AkelPad.Include("ChooseFont_function.js"))
{
  var hMainWnd = AkelPad.GetMainWnd();
  var hEditWnd = AkelPad.GetEditWnd();
  var lpLOGFONT;

  if (hEditWnd)
  {
    if (lpLOGFONT = ChooseFont(hMainWnd, 4, hEditWnd, 0, 1, 1))
      AkelPad.SendMessage(hMainWnd, 1234 /*AKD_SETFONT*/, 0, lpLOGFONT);

    AkelPad.MemFree(lpLOGFONT);
  }
}