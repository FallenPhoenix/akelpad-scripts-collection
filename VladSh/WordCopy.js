/// Copy the word at the cursor position
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=7969#7969
// Version: 1.4 (2012.08.23)

if (! AkelPad.Include("CaretSelect.js")) WScript.Quit();
AkelPad.SetClipboardText(getWordCaret());