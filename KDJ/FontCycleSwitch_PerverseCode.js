// FontCycleSwitch_PerverseCode.js - ver. 2012-06-04
//
// Cycle switch between fonts. Alternative version of FontSwitch.js by Instructor.
//
// Call("Scripts::Main", 1, "FontCycleSwitch_PerverseCode.js")
//
// Note: This script modifies itself (saves nFont value).
//       The script must be saved in ANSI format.

//here you can insert the desired fonts:
var aFonts = [
               ["Courier New",    0, 11],
               ["MS Sans Serif",  1, 17],
               ["Tahoma",         2,  9],
               ["Lucida Console", 3, 12],
               ["Arial",          4, 15]
             ];

//////////////
var nFont = 0;
//////////////

if (nFont >= aFonts.length)
  nFont = 0;

AkelPad.Font(aFonts[nFont][0], aFonts[nFont][1], aFonts[nFont][2]);

var sScrFile = WScript.ScriptFullName;
var sScrText = AkelPad.ReadFile(sScrFile).replace(/(var\s+nFont\s*=\s*)(\d+)(\s*;)/, "$1" + ++nFont + "$3");
var oFSO     = new ActiveXObject("Scripting.FileSystemObject");
var oFile    = oFSO.OpenTextFile(sScrFile, 2, true, 0);

oFile.Write(sScrText);
oFile.Close();
