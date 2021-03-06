// FileInfo.js - ver. 2012-09-01
//
// File info and text statistics.
//
// Required to include: ChooseFont_function.js and FileAndStream_functions.js
//
// Call("Scripts::Main", 1, "FileInfo.js")          - without arguments - shows dialog box
// Call("Scripts::Main", 1, "FileInfo.js", "0")     - general statistics all
// Call("Scripts::Main", 1, "FileInfo.js", "1")     - detailed statistics all
// Call("Scripts::Main", 1, "FileInfo.js", "1 CL")  - detailed statistics of chars and lines only
// Call("Scripts::Main", 1, "FileInfo.js", "0 W 2") - general statistics of words, outupt in log window
//
// First argument:
//   0 - general
//   1 - details
// Second argument (default is "CWL"):
//   C - chars
//   W - words
//   L - lines
// Third argument, output:
//  -1 - MDI mode - output in new tab, SDI - output in log window (default)
//   0 - output in new window
//   1 - output in new tab (MDI), SDI - output in new window
//   2 - output in log window

var DT_DWORD     = 3;
var oSys         = AkelPad.SystemFunction();
var hMainWnd     = AkelPad.GetMainWnd();
var hEditWnd     = AkelPad.GetEditWnd();
var hInstanceDLL = AkelPad.GetInstanceDll();
var bChars       = 1;
var bWords       = 1;
var bLines       = 1;
var bCharsDet    = 0;
var bWordsDet    = 0;
var bLinesDet    = 0;
var nOutput      = -1;
var bFont        = 0;
var aFontOut;

if ((! hEditWnd) || (! AkelPad.Include("ChooseFont_function.js")) || (! AkelPad.Include("FileAndStream_functions.js")))
  WScript.Quit();

GetLangStrins();

if (WScript.Arguments.length)
{
  if (WScript.Arguments(0) == "1")
    {
      bCharsDet = 1;
      bWordsDet = 1;
      bLinesDet = 1;
    }
  if (WScript.Arguments.length > 1)
  {
    bChars = /C/i.test(WScript.Arguments(1));
    bWords = /W/i.test(WScript.Arguments(1));
    bLines = /L/i.test(WScript.Arguments(1));
  }
  if (WScript.Arguments.length > 2)
  {
    nOutput = parseInt(WScript.Arguments(2));
    if ((nOutput < 0) || (nOutput > 2))
      nOutput = -1;
  }
}
else
{
  var sClassName = "AkelPad::Scripts::" + WScript.ScriptName + "::" + hInstanceDLL;
  var bCancel    = 1;
  var hFocus;

  var CLASS = 0;
  var HWND  = 1;
  var STYLE = 2;
  var X     = 3;
  var Y     = 4;
  var W     = 5;
  var H     = 6;
  var TXT   = 7;

  var aWnd       = [];
  var IDSTATSG   = 2000;
  var IDALLG     = 2001;
  var IDCHARS    = 2002;
  var IDCHARSDET = 2003;
  var IDWORDS    = 2004;
  var IDWORDSDET = 2005;
  var IDLINES    = 2006;
  var IDLINESDET = 2007;
  var IDALL      = 2008;
  var IDALLDET   = 2009;
  var IDOUTPUTG  = 2010;
  var IDWND      = 2011;
  var IDTAB      = 2012;
  var IDLOG      = 2013;
  var IDFONT     = 2014;
  var IDFONTSET  = 2015;
  var IDOK       = 2016;
  var IDCANCEL   = 2017;

  ReadWriteIni(0);
  if (! aFontOut)
    aFontOut = ConvertFontFormat(AkelPad.SendMessage(hEditWnd, 0x0031 /*WM_GETFONT*/, 0, 0), 2, 3);

  //0x50000007 - WS_VISIBLE|WS_CHILD|BS_GROUPBOX
  //0x50000009 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTORADIOBUTTON
  //0x50010000 - WS_VISIBLE|WS_CHILD|WS_TABSTOP
  //0x50010001 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_DEFPUSHBUTTON
  //0x50010003 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
  //Windows              CLASS,HWND,      STYLE,   X,   Y,   W,   H, TXT
  aWnd[IDSTATSG  ] = ["BUTTON",   0, 0x50000007,  10,  10, 180, 115, sTxtStats];
  aWnd[IDALLG    ] = ["BUTTON",   0, 0x50000007,  10,  85, 180,  40, ""];
  aWnd[IDCHARS   ] = ["BUTTON",   0, 0x50010003,  20,  30,  80,  16, sTxtChars];
  aWnd[IDCHARSDET] = ["BUTTON",   0, 0x50010003, 100,  30,  80,  16, sTxtDetails];
  aWnd[IDWORDS   ] = ["BUTTON",   0, 0x50010003,  20,  50,  80,  16, sTxtWords];
  aWnd[IDWORDSDET] = ["BUTTON",   0, 0x50010003, 100,  50,  80,  16, sTxtDetails];
  aWnd[IDLINES   ] = ["BUTTON",   0, 0x50010003,  20,  70,  80,  16, sTxtLines];
  aWnd[IDLINESDET] = ["BUTTON",   0, 0x50010003, 100,  70,  80,  16, sTxtDetails];
  aWnd[IDALL     ] = ["BUTTON",   0, 0x50010003,  20, 100,  80,  16, sTxtAll];
  aWnd[IDALLDET  ] = ["BUTTON",   0, 0x50010003, 100, 100,  80,  16, sTxtAllDet];
  aWnd[IDOUTPUTG ] = ["BUTTON",   0, 0x50000007,  10, 135, 180, 130, sTxtOutput];
  aWnd[IDWND     ] = ["BUTTON",   0, 0x50000009,  50, 155, 120,  16, sTxtNewWnd];
  aWnd[IDTAB     ] = ["BUTTON",   0, 0x50000009,  50, 175, 120,  16, sTxtNewTab];
  aWnd[IDLOG     ] = ["BUTTON",   0, 0x50000009,  50, 195, 120,  16, sTxtLogWnd];
  aWnd[IDFONT    ] = ["BUTTON",   0, 0x50010003,  20, 215, 120,  16, sTxtFont];
  aWnd[IDFONTSET ] = ["BUTTON",   0, 0x50010000,  20, 235, 160,  20, aFontOut.toString()];
  aWnd[IDOK      ] = ["BUTTON",   0, 0x50010001,  10, 275,  85,  23, sTxtOK];
  aWnd[IDCANCEL  ] = ["BUTTON",   0, 0x50010000, 105, 275,  85,  23, sTxtCancel];

  AkelPad.WindowRegisterClass(sClassName);

  oSys.Call("User32::CreateWindowEx" + _TCHAR,
            0,               //dwExStyle
            sClassName,      //lpClassName
            sTxtCaption,     //lpWindowName
            0x90C80000,      //dwStyle=WS_POPUP|WS_VISIBLE|WS_CAPTION|WS_SYSMENU
            0,               //x
            0,               //y
            206,             //nWidth
            340,             //nHeight
            hMainWnd,        //hWndParent
            0,               //ID
            hInstanceDLL,    //hInstance
            DialogCallback); //Script function callback. To use it class must be registered by WindowRegisterClass.

  oSys.Call("User32::EnableWindow", hMainWnd, 0);

  AkelPad.WindowGetMessage();

  AkelPad.WindowUnregisterClass(sClassName);

  if (bCancel)
    WScript.Quit();
}

var hWndWait       = GetWaitWindow();
var sLineSep       = "----------------------------------------------";
var sFileName      = AkelPad.GetEditFile(0);
var aOutput        = [];
var aChars         = [];
var aWords         = [];
var aLines         = [];
var aLinesWhite    = [];
var aLinesWhiteEnd = [];
var aLinesBadNL    = [];
var aStreams       = [];
var bStream        = false;
var nMinLenL       = Infinity;
var nMaxLenL       = 0;
var nEmptyEntire   = 0;
var sStreamName;
var oFSO;
var oFile;
var nFileSize;
var dFileDate;
var sFileDateC;
var sFileDateM;
var sText;
var nChars;
var nLatins;
var nDigits;
var nUnders;
var nWhites;
var nSpaces;
var nHTabs;
var nVTabs;
var nFF;
var nCR;
var nLF;
var nOthers;
var aWordTDH;
var nWordTDH;
var nWordDH;
var nWordT;
var nWordD;
var nWordH;
var aTextLines;
var nFirstLine;
var nEmptyLines;
var nEmptyWhite;
var nWhiteEnd;
var reBadNL;
var sChar;
var nCode;
var sWord;
var aExec;
var i, n;

if (sFileName)
{
  i = sFileName.lastIndexOf(":");

  if (i > 3) //NTFS stream
  {
    bStream     = true;
    sStreamName = sFileName.substr(i + 1);
    sFileName   = sFileName.substr(0, i);
  }

  aStreams = EnumStreams(sFileName);

  if (bStream)
  {
    for (i = 1; i < aStreams.length; ++i)
    {
      if (aStreams[i][0] == sStreamName)
      {
        nFileSize  = aStreams[i][1];
        break;
      }
    }
    sFileName = sFileName + ":" + sStreamName;
  }
  else
  {
    oFSO       = new ActiveXObject("Scripting.FileSystemObject");
    oFile      = oFSO.GetFile(sFileName);
    nFileSize  = oFile.Size;
    dFileDate  = new Date(oFile.DateCreated);
    sFileDateC = DateToShortLocaleString(dFileDate);
    dFileDate  = new Date(oFile.DateLastModified);
    sFileDateM = DateToShortLocaleString(dFileDate);
  }
}
else
{
  sFileName  = sTxtNoFile;
  nFileSize  = "?";
  sFileDateC = "?";
  sFileDateM = "?";
}

aOutput.push(Pad(sTxtFile, 22) + sFileName);
aOutput.push(Pad(sTxtSize, 22) + nFileSize + (bStream ? " " + sTxtStream : ""));
if (! bStream)
{
  aOutput.push(Pad(sTxtCreated,  22) + sFileDateC);
  aOutput.push(Pad(sTxtModified, 22) + sFileDateM);

  for (i = 1; i < aStreams.length; ++i)
  {
    if (i == 1)
      aOutput.push(Pad(sTxtStreams, 22) + aStreams[i][0]);
    else
      aOutput.push(Pad(aStreams[i][0], aStreams[i][0].length + 22, "L"));
  }
}

if (bLines)
{
  if (AkelPad.GetSelStart() == AkelPad.GetSelEnd())
  {
    sText      = AkelPad.GetTextRange(0, -1, 1 /*\r*/);
    nFirstLine = 1;
  }
  else
  {
    sText      = AkelPad.GetSelText(1 /*\r*/);
    nFirstLine = AkelPad.SendMessage(hEditWnd, 3129 /*AEM_GETLINENUMBER*/, 1 /*AEGL_FIRSTSELLINE*/, 0);
    nFirstLine = AkelPad.SendMessage(hEditWnd, 3143 /*AEM_GETUNWRAPLINE*/, nFirstLine, 0) + 1;
  }
  aTextLines = sText.split("\r");
}

if (AkelPad.GetSelStart() == AkelPad.GetSelEnd())
{
  sText = AkelPad.GetTextRange(0, -1, 0);
  sTxtStatsTxt += sTxtEntire;
}
else
{
  sText = AkelPad.GetSelText(0);
  sTxtStatsTxt += sTxtSelect;
}

if (bChars || bWords || bLines)
{
  aOutput.push(sLineSep);
  aOutput.push(Pad(sTxtStatsTxt, 46, "C"));
  aOutput.push(sLineSep);
}

//chars
if (bChars)
{
  nChars  = sText.length;
  nLatins = Count(/[a-z]/gi);
  nDigits = Count(/\d/g);
  nUnders = Count(/_/g);
  nSpaces = Count(/ /g);
  nHTabs  = Count(/\t/g);
  nVTabs  = Count(/\v/g);
  nFF     = Count(/\f/g);
  nCR     = Count(/\r/g);
  nLF     = Count(/\n/g);
  nWhites = nSpaces + nHTabs + nVTabs + nFF + nCR + nLF;
  nOthers = nChars - nLatins - nDigits - nUnders - nWhites;

  aOutput.push(         Pad(sTxtChars + ":",  32) + nChars);
  aOutput.push("  "   + Pad(sTxtLatin,  32) + nLatins);
  aOutput.push("  "   + Pad(sTxtDigits, 32) + nDigits);
  aOutput.push("  "   + Pad(sTxtUnders, 32) + nUnders);
  aOutput.push("  "   + Pad(sTxtWhites, 32) + nWhites);
  aOutput.push("    " + Pad(sTxtSpaces, 32) + nSpaces);
  aOutput.push("    " + Pad(sTxtHTabs,  32) + nHTabs);
  aOutput.push("    " + Pad(sTxtVTabs,  32) + nVTabs);
  aOutput.push("    " + Pad(sTxtFF,     32) + nFF);
  aOutput.push("    " + Pad(sTxtCR,     32) + nCR);
  aOutput.push("    " + Pad(sTxtLF,     32) + nLF);
  aOutput.push("  "   + Pad(sTxtOther,  32) + nOthers);
  aOutput.push(sLineSep);
}

//words
if (bWords)
{
  aWordTDH = sText.match(/[^\s'`"\\\|\[\]\(\)\{\}<>,\.;:\+\-=~!@#\$%^&\*/\?]+/g);
  nWordTDH = aWordTDH ? aWordTDH.length : 0;
  nWordD   = Count(/(^|[\s'`"\\\|\[\]\(\)\{\}<>,\.;:\+\-=~!@#\$%^&\*/\?])\d+(?=($|[\s'`"\\\|\[\]\(\)\{\}<>,\.;:\+\-=~!@#\$%^&\*/\?]))/g);
  nWordH   = Count(/(^|[\s'`"\\\|\[\]\(\)\{\}<>,\.;:\+\-=~!@#\$%^&\*/\?])0x[\da-f]+(?=($|[\s'`"\\\|\[\]\(\)\{\}<>,\.;:\+\-=~!@#\$%^&\*/\?]))/gi);
  nWordT   = nWordTDH - nWordD - nWordH;
  nWordDH  = nWordD   + nWordH;

  aOutput.push(         Pad(sTxtWords + ":", 32) + nWordTDH);
  aOutput.push("  "   + Pad(sTxtText,  32) + nWordT);
  aOutput.push("  "   + Pad(sTxtInt,   32) + nWordDH);
  aOutput.push("    " + Pad(sTxtDec,   32) + nWordD);
  aOutput.push("    " + Pad(sTxtHex,   32) + nWordH);
  aOutput.push(sLineSep);
}

//lines
if (bLines)
{
  for (i = 0; i < aTextLines.length; ++i)
  {
    if (aTextLines[i].length < nMinLenL)
      nMinLenL = aTextLines[i].length;
    if (aTextLines[i].length > nMaxLenL)
      nMaxLenL = aTextLines[i].length;
    if (aTextLines[i].length == 0)
      ++nEmptyEntire;
  }

  nEmptyWhite = Count(/^[ \t\v\f]+$/gm);
  nWhiteEnd   = Count(/\S+[ \t\v\f]+$/gm);
  nEmptyLines = nEmptyEntire + nEmptyWhite;

  if (AkelPad.GetEditNewLine(hEditWnd) == 1) //Win
  {
    reBadNL = /\r\r\n|\r\n|\r|\n/g;
    while (aExec = reBadNL.exec(sText))
    {
      if (aExec[0] != "\r\n")
        aLinesBadNL.push(RegExp.index);
    }
  }
  else
  {
    if (AkelPad.GetEditNewLine(hEditWnd) == 2) //Unix
      reBadNL = /\r{1,2}\n|\r/g;
    else //Mac
      reBadNL = /\r{0,2}\n/g;
    while (reBadNL.test(sText))
      aLinesBadNL.push(RegExp.index);
  }

  aOutput.push(         Pad(sTxtLines + ":",    32) + aTextLines.length);
  aOutput.push("  "   + Pad(sTxtEmptyL,   32) + nEmptyLines);
  aOutput.push("    " + Pad(sTxtEnEmptyL, 32) + nEmptyEntire);
  aOutput.push("    " + Pad(sTxtWhiteL,   32) + nEmptyWhite);
  aOutput.push("  "   + Pad(sTxtWhiteEnd, 32) + nWhiteEnd);
  aOutput.push("  "   + Pad(sTxtBadNLF,   32) + aLinesBadNL.length);
  aOutput.push(sLineSep);
  aOutput.push(         Pad(sTxtMinLenL,  32) + nMinLenL);
  aOutput.push(         Pad(sTxtMaxLenL,  32) + nMaxLenL);
  aOutput.push(sLineSep);
}

//chars details
if (bChars && bCharsDet)
{
  for (i = 0; i < sText.length; ++i)
  {
    nCode = sText.charCodeAt(i);
    if (nCode > 31)
      sChar = sText.charAt(i);
    else
      sChar = " ";
    if (aChars[nCode])
      ++aChars[nCode][0];
    else
      aChars[nCode] = [1, sChar];
  }
  if (aChars.length)
  {
    aOutput.push(sTxtDetails + " " + sTxtChars + ":");
    aOutput.push(Pad(sTxtCount, 9, "L") + Pad(sTxtChar, 9, "L") + Pad(sTxtCode, 10, "L") + Pad("(hex)", 11, "L"));
    aOutput.push(sLineSep);
    for (i = 0; i < aChars.length; ++i)
    {
      if (aChars[i])
        aOutput.push(Pad(aChars[i][0].toString(), 9, "L") + "      " + aChars[i][1] + Pad("(" + i + ")", 12, "L") + "     (" + Pad(i.toString(16).toUpperCase(), 4, "L", "0") + ")");
    }
    aOutput.push(sLineSep);
  }
}

//words details
if (bWords && bWordsDet)
{
  if (nWordTDH)
  {
    aWordTDH.sort();
    i = 0;
    while (i < nWordTDH)
    {
      sWord = aWordTDH[i];
      n     = 1;
      ++i;
      while ((i < nWordTDH) && (sWord == aWordTDH[i]))
      {
        ++n;
        ++i;
      }
      aWords.push([n, sWord]);
    }
  }
  if (aWords.length)
  {
    aOutput.push(sTxtDetails + " " + sTxtWords + ":");
    aOutput.push(Pad(sTxtCount, 9, "L") + "      " + sTxtWord);
    aOutput.push(sLineSep);
    for (i = 0; i < aWords.length; ++i)
      aOutput.push(Pad(aWords[i][0].toString(), 9, "L") + "      " + aWords[i][1]);

    aOutput.push(sLineSep);
  }
}

//lines details
if (bLines && bLinesDet)
{
  for (i = 0; i < aTextLines.length; ++i)
  {
    if (/^\s+$/.test(aTextLines[i]))
      aLinesWhite.push(i + nFirstLine);
    else if (/\S+\s+$/.test(aTextLines[i]))
      aLinesWhiteEnd.push(i + nFirstLine);

    if (aLines[aTextLines[i].length])
    {
      ++aLines[aTextLines[i].length][0];
      aLines[aTextLines[i].length][1].push(i + nFirstLine);
    }
    else
      aLines[aTextLines[i].length] = [1, [i + nFirstLine]];
  }

  aOutput.push(sTxtDetails + " " + sTxtLines + ":");
  aOutput.push(Pad(sTxtCount, 9, "L") + Pad(sTxtLineLen, 21, "C") + sTxtLineNum);
  aOutput.push(sLineSep);
  for (i = 0; i < aLines.length; ++i)
  {
    if (aLines[i])
      aOutput.push(Pad(aLines[i][0].toString(), 9, "L") + Pad(i.toString(), 11, "L") + "          [" + aLines[i][1] + "]");
  }

  if (aLinesWhite.length)
    aOutput.push(Pad(sTxtWhiteL, 30) + "[" + aLinesWhite + "]");
  if (aLinesWhiteEnd.length)
    aOutput.push(Pad(sTxtWhiteEnd, 30) + "[" + aLinesWhiteEnd + "]");
  if (aLinesBadNL.length)
  {
    OffsetToLineNumber(aLinesBadNL);
    aOutput.push(Pad(sTxtBadNLF, 30) + "[" + aLinesBadNL + "]");
  }
  aOutput.push(sLineSep);
}

oSys.Call("User32::DestroyWindow", hWndWait);
oSys.Call("User32::SendMessage" + _TCHAR, GetOutputWindow(), 0x000C /*WM_SETTEXT*/, 0, aOutput.join("\r"));

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    var hGuiFont = oSys.Call("Gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
    var i;

    for (i = 2000; i < aWnd.length; ++i)
    {
      aWnd[i][HWND] =
        oSys.Call("User32::CreateWindowEx" + _TCHAR,
                  0,                //dwExStyle
                  aWnd[i][CLASS],   //lpClassName
                  0,                //lpWindowName
                  aWnd[i][STYLE],   //dwStyle
                  aWnd[i][X],       //x
                  aWnd[i][Y],       //y
                  aWnd[i][W],       //nWidth
                  aWnd[i][H],       //nHeight
                  hWnd,             //hWndParent
                  i,                //ID
                  hInstanceDLL,     //hInstance
                  0);               //lpParam

      AkelPad.SendMessage(aWnd[i][HWND], 48 /*WM_SETFONT*/, hGuiFont, 0);
      oSys.Call("User32::SetWindowText" + _TCHAR, aWnd[i][HWND], aWnd[i][TXT]);
    }

    CheckButtons();
    CheckRadioButtons();
    CenterWindow(hWnd);
    hFocus = aWnd[IDCHARS][HWND];
  }

  else if ((uMsg == 6 /*WM_ACTIVATE*/) && (wParam == 0 /*WA_INACTIVE*/))
    hFocus = oSys.Call("user32::GetFocus");

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("User32::SetFocus", hFocus);

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if ((wParam == 13 /*VK_RETURN*/) && (oSys.Call("User32::GetFocus") != aWnd[IDFONTSET][HWND]) && (oSys.Call("User32::GetFocus") != aWnd[IDCANCEL][HWND]))
      oSys.Call("User32::PostMessage" + _TCHAR, hWnd, 273 /*WM_COMMAND*/, IDOK, 0);
    else if (wParam == 27 /*VK_ESCAPE*/)
      oSys.Call("User32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    var nLowParam = wParam & 0xFFFF;

    if (((nLowParam >= IDCHARS) && (nLowParam <= IDALLDET)) || (nLowParam == IDFONT))
    {
      if (nLowParam == IDCHARS)
        bChars = ! bChars;
      else if (nLowParam == IDWORDS)
        bWords = ! bWords;
      else if (nLowParam == IDLINES)
        bLines = ! bLines;
      else if (nLowParam == IDCHARSDET)
        bCharsDet = ! bCharsDet;
      else if (nLowParam == IDWORDSDET)
        bWordsDet = ! bWordsDet;
      else if (nLowParam == IDLINESDET)
        bLinesDet = ! bLinesDet;
      else if (nLowParam == IDALL)
        bChars = bWords = bLines = AkelPad.SendMessage(lParam, 0x00F0 /*BM_GETCHECK*/, 0, 0);
      else if (nLowParam == IDALLDET)
        bCharsDet = bWordsDet = bLinesDet = AkelPad.SendMessage(lParam, 0x00F0 /*BM_GETCHECK*/, 0, 0);
      else if (nLowParam == IDFONT)
        bFont = ! bFont;

      CheckButtons();
    }
    else if ((nLowParam >= IDWND) && (nLowParam <= IDLOG))
      nOutput = nLowParam - IDWND;
    else if (nLowParam == IDFONTSET)
      MenuFont(hWnd);
    else if (nLowParam == IDOK)
    {
      bCancel = 0;
      oSys.Call("User32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);
    }
    else if (nLowParam == IDCANCEL)
      oSys.Call("User32::PostMessage" + _TCHAR, hWnd, 16 /*WM_CLOSE*/, 0, 0);

  }

  else if (uMsg == 16) //WM_CLOSE
  {
    ReadWriteIni(1);
    oSys.Call("User32::EnableWindow", hMainWnd, 1);
    oSys.Call("User32::DestroyWindow", hWnd);
  }

  else if (uMsg == 2) //WM_DESTROY
    oSys.Call("User32::PostQuitMessage", 0);

  return 0;
}

function CheckButtons()
{
  AkelPad.SendMessage(aWnd[IDCHARS][HWND], 0x00F1 /*BM_SETCHECK*/, bChars, 0);
  AkelPad.SendMessage(aWnd[IDWORDS][HWND], 0x00F1 /*BM_SETCHECK*/, bWords, 0);
  AkelPad.SendMessage(aWnd[IDLINES][HWND], 0x00F1 /*BM_SETCHECK*/, bLines, 0);

  AkelPad.SendMessage(aWnd[IDCHARSDET][HWND], 0x00F1 /*BM_SETCHECK*/, bCharsDet, 0);
  AkelPad.SendMessage(aWnd[IDWORDSDET][HWND], 0x00F1 /*BM_SETCHECK*/, bWordsDet, 0);
  AkelPad.SendMessage(aWnd[IDLINESDET][HWND], 0x00F1 /*BM_SETCHECK*/, bLinesDet, 0);

  AkelPad.SendMessage(aWnd[IDALL   ][HWND], 0x00F1 /*BM_SETCHECK*/, bChars && bWords && bLines, 0);
  AkelPad.SendMessage(aWnd[IDALLDET][HWND], 0x00F1 /*BM_SETCHECK*/, bCharsDet && bWordsDet && bLinesDet, 0);

  AkelPad.SendMessage(aWnd[IDFONT][HWND], 0x00F1 /*BM_SETCHECK*/, bFont, 0);

  oSys.Call("User32::EnableWindow", aWnd[IDCHARSDET][HWND], bChars);
  oSys.Call("User32::EnableWindow", aWnd[IDWORDSDET][HWND], bWords);
  oSys.Call("User32::EnableWindow", aWnd[IDLINESDET][HWND], bLines);
  oSys.Call("User32::EnableWindow", aWnd[IDFONTSET ][HWND], bFont);
}

function CheckRadioButtons()
{
  if (nOutput < 0)
  {
    if (AkelPad.IsMDI())
      nOutput = 1;
    else
      nOutput = 0;
  }

  if ((nOutput == 2) && (! IsLogPluginExists()))
    nOutput = 1;

  if ((nOutput == 1) && (! AkelPad.IsMDI()))
    nOutput = 0;

  AkelPad.SendMessage(aWnd[IDWND + nOutput][HWND], 0x00F1 /*BM_SETCHECK*/, 1, 0);

  oSys.Call("User32::EnableWindow", aWnd[IDTAB][HWND], AkelPad.IsMDI());
  oSys.Call("User32::EnableWindow", aWnd[IDLOG][HWND], IsLogPluginExists());
}

function IsLogPluginExists()
{
  return IsFileExists(AkelPad.GetAkelDir(4 /*ADTYPE_PLUGS*/) + "\\Log.dll");
}

function MenuFont(hWndOwn)
{
  var hMenu = oSys.Call("User32::CreatePopupMenu");
  var oRect = {};
  var nCmd;
  var vCF;

  GetWindowPos(aWnd[IDFONT][HWND], oRect);

  oSys.Call("User32::AppendMenu" + _TCHAR, hMenu, 0 /*MF_STRING*/, 1, sTxtMonoFonts);
  oSys.Call("User32::AppendMenu" + _TCHAR, hMenu, 0 /*MF_STRING*/, 2, sTxtAllFonts);

  nCmd = oSys.Call("User32::TrackPopupMenu", hMenu, 0x0180 /*TPM_RETURNCMD|TPM_NONOTIFY*/, oRect.X + 16, oRect.Y + 16, 0, hWndOwn, 0);
  oSys.Call("User32::DestroyMenu", hMenu);

  if (nCmd)
  {
    if (vCF = ChooseFont(hWndOwn, 3, aFontOut, 0, nCmd - 2, 3))
    {
      aFontOut = vCF;
      oSys.Call("User32::SetWindowText" + _TCHAR, aWnd[IDFONTSET][HWND], aFontOut.toString());
    }
  }
}

function GetWindowPos(hWnd, oRect)
{
  var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)

  oSys.Call("User32::GetWindowRect", hWnd, lpRect);

  oRect.X = AkelPad.MemRead(lpRect,      DT_DWORD);
  oRect.Y = AkelPad.MemRead(lpRect +  4, DT_DWORD);
  oRect.W = AkelPad.MemRead(lpRect +  8, DT_DWORD) - oRect.X;
  oRect.H = AkelPad.MemRead(lpRect + 12, DT_DWORD) - oRect.Y;

  AkelPad.MemFree(lpRect);
}

function GetWaitWindow()
{
  WScript.Sleep(20); //without it, doesn't show Wait window. I don't know why
  var hWnd =
        oSys.Call("User32::CreateWindowEx" + _TCHAR,
                  0,          //dwExStyle
                  "STATIC",   //lpClassName
                  0,          //lpWindowName
                  0x50400001, //dwStyle = WS_VISIBLE|WS_CHILD|WS_DLGFRAME|SS_CENTER
                  0,          //x
                  0,          //y
                  200,        //nWidth
                  90,         //nHeight
                  hMainWnd,   //hWndParent
                  0,          //ID
                  hInstanceDLL,
                  0);

  CenterWindow(hWnd);
  WScript.Sleep(20); //without it, doesn't show Wait window. I don't know why
  oSys.Call("User32::SetWindowText" + _TCHAR, hWnd, "\n\n" + sTxtWait);

  return hWnd;
}

function CenterWindow(hWnd)
{
  var oRectEdit = {};
  var oRect     = {};

  GetWindowPos(hEditWnd, oRectEdit);
  GetWindowPos(hWnd, oRect);

  oRect.X = oRectEdit.X + (oRectEdit.W - oRect.W) / 2;
  oRect.Y = oRectEdit.Y + (oRectEdit.H - oRect.H) / 2;

  oSys.Call("User32::SetWindowPos", hWnd, 0, oRect.X, oRect.Y, 0, 0, 0x15 /*SWP_NOZORDER|SWP_NOACTIVATE|SWP_NOSIZE*/);
}

function Count(oRE)
{
  var aMatch = sText.match(oRE);
  return aMatch ? aMatch.length : 0;
}

function Pad(sString, nLen, sType, sChar)
{
  var i = 0;

  if (! sType) sType = "R";
  if (! sChar) sChar = " ";

  if (sType == "R")
  {
    while (sString.length < nLen)
      sString += sChar;
  }
  else if (sType == "L")
  {
    while (sString.length < nLen)
      sString = sChar + sString;
  }
  else if (sType == "C")
  {
    while (sString.length < nLen)
    {
      if ((i % 2) == 0)
        sString += sChar;
      else
        sString = sChar + sString;
      ++ i;
    }
  }
  return sString;
}

function DateToShortLocaleString(dDate)
{
  var DT_WORD   = 4;
  var lpSysTime = AkelPad.MemAlloc(16 /*sizeof(SYSTEMTIME)*/);
  var lpString  = AkelPad.MemAlloc(256 * _TSIZE);
  var sDateTime;

  AkelPad.MemCopy(lpSysTime,     dDate.getFullYear(),     DT_WORD);
  AkelPad.MemCopy(lpSysTime + 2, dDate.getMonth() + 1,    DT_WORD);
  AkelPad.MemCopy(lpSysTime + 4, dDate.getDay(),          DT_WORD);
  AkelPad.MemCopy(lpSysTime + 6, dDate.getDate(),         DT_WORD);
  AkelPad.MemCopy(lpSysTime + 8, dDate.getHours(),        DT_WORD);
  AkelPad.MemCopy(lpSysTime +10, dDate.getMinutes(),      DT_WORD);
  AkelPad.MemCopy(lpSysTime +12, dDate.getSeconds(),      DT_WORD);
  AkelPad.MemCopy(lpSysTime +14, dDate.getMilliseconds(), DT_WORD);

  oSys.Call("Kernel32::GetDateFormat" + _TCHAR,
            0x400, //LOCALE_USER_DEFAULT
            0x1,   //DATE_SHORTDATE
            lpSysTime,
            0,
            lpString,
            256);
  sDateTime = AkelPad.MemRead(lpString, _TSTR) + " ";

  oSys.Call("Kernel32::GetTimeFormat" + _TCHAR,
            0x400, //LOCALE_USER_DEFAULT
            0x8,   //TIME_FORCE24HOURFORMAT
            lpSysTime,
            0,
            lpString,
            256);
  sDateTime += AkelPad.MemRead(lpString, _TSTR);

  AkelPad.MemFree(lpSysTime);
  AkelPad.MemFree(lpString);

  return sDateTime;
}

function OffsetToLineNumber(aLinesBadNL)
{
  var lpCharIndex1  = AkelPad.MemAlloc(12); //sizeof(AECHARINDEX)
  var lpCharIndex2  = AkelPad.MemAlloc(12);
  var lpIndexOffset = AkelPad.MemAlloc(16); //sizeof(AEINDEXOFFSET)
  var i;

  AkelPad.MemCopy(lpIndexOffset,     lpCharIndex1, DT_DWORD);
  AkelPad.MemCopy(lpIndexOffset + 4, lpCharIndex2, DT_DWORD);
  AkelPad.MemCopy(lpIndexOffset + 12, 3 /*AELB_ASIS*/, DT_DWORD);

  AkelPad.SendMessage(hEditWnd, 3130 /*AEM_GETINDEX*/, (AkelPad.GetSelStart() == AkelPad.GetSelEnd()) ? 1 /*AEGI_FIRSTCHAR*/ : 3 /*AEGI_FIRSTSELCHAR*/, lpCharIndex1);

  for (i = 0; i < aLinesBadNL.length; ++i)
  {
    AkelPad.MemCopy(lpIndexOffset + 8, aLinesBadNL[i], DT_DWORD);
    AkelPad.SendMessage(hEditWnd, 3135 /*AEM_INDEXOFFSET*/, 0, lpIndexOffset);

    aLinesBadNL[i] = AkelPad.SendMessage(hEditWnd, 3136 /*AEM_INDEXTORICHOFFSET*/, 0, lpCharIndex2);
  	aLinesBadNL[i] = AkelPad.SendMessage(hEditWnd, 1078 /*EM_EXLINEFROMCHAR*/, 0, aLinesBadNL[i]);
    aLinesBadNL[i] = AkelPad.SendMessage(hEditWnd, 3143 /*AEM_GETUNWRAPLINE*/, aLinesBadNL[i], 0) + 1;
  }

  AkelPad.MemFree(lpCharIndex1);
  AkelPad.MemFree(lpCharIndex2);
  AkelPad.MemFree(lpIndexOffset);
}

function GetOutputWindow()
{
  var hWnd;

  if (AkelPad.IsMDI())
  {
    if (nOutput == 2)
      hWnd = GetLogWindow();
    else
      hWnd = GetNewEditWindow(nOutput);
  }
  else
  {
    if ((nOutput == -1) || (nOutput == 2))
      hWnd = GetLogWindow();
    else
      hWnd = GetNewEditWindow(0);
  }

  return hWnd;
}

function GetNewEditWindow(bNewTab)
{
  var aFontEdit;

  if (bNewTab)
  {
    //To eliminate conflict with Templates plugin: lParam=1
    AkelPad.SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4101 /*wParam=MAKEWPARAM(0,IDM_FILE_NEW)*/, 1 /*lParam=TRUE*/);

    if (bFont)
    {
      WScript.Sleep(10);
      AkelPad.Font(aFontOut[0], aFontOut[1], aFontOut[2])
    }
  }
  else
  {
    if (bFont)
    {
      aFontEdit = ConvertFontFormat(AkelPad.SendMessage(hEditWnd, 49 /*WM_GETFONT*/, 0, 0), 2, 3);
  
      AkelPad.SendMessage(hEditWnd, 11 /*WM_SETREDRAW*/, 0, 0);
      AkelPad.Font(aFontOut[0], aFontOut[1], aFontOut[2])
    }

    //Force create new instance
    if (AkelPad.SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 153 /*MI_SINGLEOPENPROGRAM*/, 0))
    {
      AkelPad.Command(4256 /*IDM_OPTIONS_SINGLEOPEN_PROGRAM*/);
      hMainWnd = AkelPad.Command(4102 /*IDM_FILE_CREATENEW*/);
      AkelPad.Command(4256 /*IDM_OPTIONS_SINGLEOPEN_PROGRAM*/);
      AkelPad.SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4256 /*IDM_OPTIONS_SINGLEOPEN_PROGRAM*/, 0);
    }
    else
      hMainWnd = AkelPad.Command(4102 /*IDM_FILE_CREATENEW*/);

    if (bFont)
    {
      AkelPad.Font(aFontEdit[0], aFontEdit[1], aFontEdit[2])
      AkelPad.SendMessage(hEditWnd, 11 /*WM_SETREDRAW*/, 1, 0);
    }
  }

  return AkelPad.SendMessage(hMainWnd, 1223 /*AKD_GETFRAMEINFO*/, 2 /*FI_WNDEDIT*/, 0);
}

function GetLogWindow()
{
  var lpWnd = AkelPad.MemAlloc(4);
  var hWnd;

  if (! AkelPad.IsPluginRunning("Log::Output"))
    AkelPad.Call("Log::Output");

  AkelPad.Call("Log::Output", 2, lpWnd);
  hWnd = AkelPad.MemRead(lpWnd, DT_DWORD);
  AkelPad.MemFree(lpWnd);

  if (bFont)
    AkelPad.SendMessage(hWnd, 48 /*WM_SETFONT*/, ConvertFontFormat(aFontOut, 3, 2), 0);

  return hWnd;
}

function ReadWriteIni(bWrite)
{
  var sIniFile = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";
  var sIniTxt;
  var oError;

  if (bWrite)
  {
    sIniTxt = 'bChars='     + bChars    + ';\r\n' +
              'bWords='     + bWords    + ';\r\n' +
              'bLines='     + bLines    + ';\r\n' +
              'bCharsDet='  + bCharsDet + ';\r\n' +
              'bWordsDet='  + bWordsDet + ';\r\n' +
              'bLinesDet='  + bLinesDet + ';\r\n' +
              'nOutput='    + nOutput   + ';\r\n' +
              'bFont='      + bFont     + ';\r\n' +
              'aFontOut=["' + aFontOut[0] + '",' + aFontOut[1] + ',' + aFontOut[2] + '];';

    WriteFile(sIniFile, null, sIniTxt, 1);
  }

  else if (IsFileExists(sIniFile))
  {
    try
    {
      eval(AkelPad.ReadFile(sIniFile));
    }
    catch (oError)
    {
    }
  }
}

function GetLangStrins()
{
  if (AkelPad.GetLangId(0 /*LANGID_FULL*/) == 0x0415) //Polish
  {
    sTxtCaption   = "Informacja o pliku";
    sTxtWait      = "Proszę czekać...";
    sTxtNoFile    = "Brak nazwy, plik nie został zapisany";
    sTxtStatsTxt  = "Statystyka tekstu";
    sTxtEntire    = " - cały tekst";
    sTxtSelect    = " - obszar zaznaczenia";
    sTxtDetails   = "Szczegóły";
    sTxtCount     = "Licznik";
    sTxtWord      = "Słowo";
    sTxtChar      = "Znak";
    sTxtCode      = "(Kod)";
    sTxtLineLen   = "Długość wiersza";
    sTxtLineNum   = "[Numery wierszy]";
    sTxtFile      = "Plik, pełna nazwa:";
    sTxtSize      = "Rozmiar [Bajty]:";
    sTxtCreated   = "Utworzony:";
    sTxtModified  = "Ostatnio zapisany:";
    sTxtChars     = "Znaki";
    sTxtLatin     = "Litery łacińskie:";
    sTxtDigits    = "Cyfry:";
    sTxtUnders    = "Znaki podkreślenia:";
    sTxtWhites    = "Białe znaki:";
    sTxtSpaces    = "Spacje:";
    sTxtHTabs     = "Tabulatory (09h):";
    sTxtVTabs     = "Tabulatory pionowe (0Bh):";
    sTxtFF        = "Wysuw strony FF (0Ch):";
    sTxtCR        = "Powrót karetki CR (0Dh):";
    sTxtLF        = "Nowy wiersz LF (0Ah):";
    sTxtOther     = "Inne:";
    sTxtWords     = "Słowa";
    sTxtText      = "Teksty:";
    sTxtInt       = "Liczby całkowite:";
    sTxtDec       = "Dziesiętne:";
    sTxtHex       = "Hex (0x...):";
    sTxtLines     = "Wiersze";
    sTxtEmptyL    = "Puste wiersze:";
    sTxtEnEmptyL  = "Całkowicie puste:";
    sTxtWhiteL    = "Tylko z białymi znakami:";
    sTxtWhiteEnd  = "Zakończone białymi znakami:";
    sTxtBadNLF    = "Błędny format nowego wiersza:";
    sTxtMinLenL   = "Min. długość wiersza:";
    sTxtMaxLenL   = "Max. długość wiersza:";
    sTxtStream    = "(strumień NTFS)";
    sTxtStreams   = "Strumienie NTFS:";
    sTxtStats     = "Statystyki";
    sTxtAll       = "&Wszystko";
    sTxtAllDet    = "&Szczegółowo";
    sTxtOutput    = "Wyjście";
    sTxtNewWnd    = "Nowe okno";
    sTxtNewTab    = "Nowa karta (MDI)";
    sTxtLogWnd    = "Okno log";
    sTxtFont      = "Czcionka";
    sTxtMonoFonts = "Czcionki monospace";
    sTxtAllFonts  = "Wszystkie czcionki";
    sTxtOK        = "OK";
    sTxtCancel    = "Anuluj";
  }
  else
  {
    sTxtCaption   = "File info";
    sTxtWait      = "Please wait...";
    sTxtNoFile    = "No name, the file is not saved";
    sTxtStatsTxt  = "Text statistics";
    sTxtEntire    = " - entire text";
    sTxtSelect    = " - selected text";
    sTxtDetails   = "Details";
    sTxtCount     = "Count";
    sTxtWord      = "Word";
    sTxtChar      = "Char";
    sTxtCode      = "(Code)";
    sTxtLineLen   = "Line length";
    sTxtLineNum   = "[Line numbers]";
    sTxtFile      = "File, full name:";
    sTxtSize      = "Size [Bytes]:";
    sTxtCreated   = "Created time:";
    sTxtModified  = "Last modified:";
    sTxtChars     = "Chars";
    sTxtLatin     = "Latin letters:";
    sTxtDigits    = "Digits:";
    sTxtUnders    = "Underscore chars:";
    sTxtWhites    = "Whitespaces:";
    sTxtSpaces    = "Spaces:";
    sTxtHTabs     = "Tabs (09h):";
    sTxtVTabs     = "Vertical Tabs (0Bh):";
    sTxtFF        = "Form Feed (0Ch):";
    sTxtCR        = "Carriage Return (0Dh):";
    sTxtLF        = "Line Feed (0Ah):";
    sTxtOther     = "Other:";
    sTxtWords     = "Words";
    sTxtText      = "Text:";
    sTxtInt       = "Integers:";
    sTxtDec       = "Decimal:";
    sTxtHex       = "Hex (0x...):";
    sTxtLines     = "Lines";
    sTxtEmptyL    = "Empty lines:";
    sTxtEnEmptyL  = "Entirely empty:";
    sTxtWhiteL    = "Only with whitespaces:";
    sTxtWhiteEnd  = "Terminated by whitespaces:";
    sTxtBadNLF    = "Bad NewLine format:";
    sTxtMinLenL   = "Min line length:";
    sTxtMaxLenL   = "Max line length:";
    sTxtStream    = "(NTFS stream)";
    sTxtStreams   = "NTFS streams:";
    sTxtStats     = "Statistics";
    sTxtAll       = "&All";
    sTxtAllDet    = "With &details";
    sTxtOutput    = "Output";
    sTxtNewWnd    = "New window";
    sTxtNewTab    = "New tab (MDI)";
    sTxtLogWnd    = "Log window";
    sTxtFont      = "Font";
    sTxtMonoFonts = "Monospace fonts";
    sTxtAllFonts  = "All fonts";
    sTxtOK        = "OK";
    sTxtCancel    = "Cancel";
  }
}
