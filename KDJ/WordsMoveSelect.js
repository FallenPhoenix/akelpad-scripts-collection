// WordsMoveSelect.js - 2011-12-15
//
// Moves left/right/up/down selected words or only selects whole words.
// If there is no selection, it moves or selects the current word.
// Does not work with columnar selection.
//
// Call("Scripts::Main", 1, "WordsMoveSelect.js", "0")  - only select whole words, not move (can be ommited)
// Call("Scripts::Main", 1, "WordsMoveSelect.js", "-1") - move left, to the previous word
// Call("Scripts::Main", 1, "WordsMoveSelect.js", "1")  - move right, to the next word
// Call("Scripts::Main", 1, "WordsMoveSelect.js", "-2") - move left, to the first word in the line
// Call("Scripts::Main", 1, "WordsMoveSelect.js", "2")  - move right, to the last word in the line
// Call("Scripts::Main", 1, "WordsMoveSelect.js", "-3") - move up
// Call("Scripts::Main", 1, "WordsMoveSelect.js", "3")  - move down
//
// Can assign shortcut keys, eg:
// Ctrl+Shift+W, Ctrl+Shift+Alt+Left, Ctrl+Shift+Alt+Right, Ctrl+Shift+Alt+Home, Ctrl+Shift+Alt+End,
// Ctrl+Shift+Alt+Up, Ctrl+Shift+Alt+Down,

var AEM_GETINDEX          = 3130;
var AEM_INDEXCOMPARE      = 3133;
var AEM_INDEXTORICHOFFSET = 3136;
var AEM_GETNEXTBREAK      = 3144;
var AEM_GETPREVBREAK      = 3145;
var AEM_ISDELIMITER       = 3146;

var AEDLM_WORD     = 0x00000010;
var AEDLM_PREVCHAR = 0x00000001;

var AEWB_LEFTWORDSTART  = 0x00000001;
var AEWB_LEFTWORDEND    = 0x00000002;
var AEWB_RIGHTWORDSTART = 0x00000004;
var AEWB_RIGHTWORDEND   = 0x00000008;

var AEGI_FIRSTSELCHAR  = 3;
var AEGI_LASTSELCHAR   = 4;
var AEGI_WRAPLINEBEGIN = 18;
var AEGI_WRAPLINEEND   = 19;

var DT_DWORD = 3;

var hMainWnd = AkelPad.GetMainWnd();
var hEditWnd = AkelPad.GetEditWnd();
if (! hEditWnd)
  WScript.Quit();

if (AkelPad.SendMessage(hEditWnd, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0))
{
  WScript.Echo("Does not work with columnar selection.");
  WScript.Quit();
}

var nAction = 0;
if (WScript.Arguments.length)
  nAction = Number(WScript.Arguments(0));
if (!((nAction == 0) || (nAction == -1) || (nAction == 1) || (nAction == -2) || (nAction == 2) ||
      (nAction == -3) || (nAction == 3)))
  WScript.Quit();

var lpIndex1 = AkelPad.MemAlloc(12); //sizeof(AECHARINDEX)
var lpIndex2 = AkelPad.MemAlloc(12);
var lpIndex3 = AkelPad.MemAlloc(12);
var nOffset1;
var nOffset2;
var nOffset3;
var lpBuffer;
var sSeps;
var rWords;
var rSeps;
var aWords;
var aSeps;
var bCanMove;
var sTxt;
var nRow;
var nCol;
var i;

if (WordsSelect() && nAction && (! AkelPad.GetEditReadOnly(hEditWnd)))
{
  if (nAction < 0)
  {
    AkelPad.SendMessage(hEditWnd, AEM_GETINDEX, AEGI_FIRSTSELCHAR, lpIndex3);
    if (nAction == -1) //left
    {
      if (AkelPad.SendMessage(hEditWnd, AEM_GETPREVBREAK, AEWB_LEFTWORDSTART, lpIndex3) &&
         (! AkelPad.SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD, lpIndex3)))
        bCanMove = true;
    }
    else if (nAction == -2) //begin of line
    {
      AkelPad.SendMessage(hEditWnd, AEM_GETINDEX, AEGI_WRAPLINEBEGIN, lpIndex3);
      if (AkelPad.SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD, lpIndex3))
        AkelPad.SendMessage(hEditWnd, AEM_GETNEXTBREAK, AEWB_RIGHTWORDSTART, lpIndex3);
      if (AkelPad.SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpIndex3, lpIndex1) == -1)
        bCanMove = true;
    }
    else //up
    {
      AkelPad.SendMessage(hEditWnd, AEM_GETINDEX, AEGI_WRAPLINEBEGIN, lpIndex3);
      if (AkelPad.SendMessage(hEditWnd, AEM_GETPREVBREAK, AEWB_LEFTWORDSTART, lpIndex3) &&
         (! AkelPad.SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD, lpIndex3)))
      {
        bCanMove = true;

        nRow = AkelPad.MemRead(lpIndex3, DT_DWORD);
        nCol = AkelPad.MemRead(lpIndex1 + 8, DT_DWORD);
        while (nCol < AkelPad.MemRead(lpIndex3 + 8, DT_DWORD))
        {
          if (AkelPad.SendMessage(hEditWnd, AEM_GETPREVBREAK, AEWB_LEFTWORDSTART, lpIndex3))
          {
            if (AkelPad.SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD, lpIndex3) ||
               (nRow != AkelPad.MemRead(lpIndex3, DT_DWORD)))
            {
              AkelPad.SendMessage(hEditWnd, AEM_GETNEXTBREAK, AEWB_RIGHTWORDSTART, lpIndex3);
              break;
            }
          }
          else
            break;
        }
      }
    }
  }

  else
  {
    AkelPad.SendMessage(hEditWnd, AEM_GETINDEX, AEGI_LASTSELCHAR, lpIndex3);
    if (nAction == 1) //right
    {
      if (AkelPad.SendMessage(hEditWnd, AEM_GETNEXTBREAK, AEWB_RIGHTWORDEND, lpIndex3) &&
         (! AkelPad.SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD|AEDLM_PREVCHAR, lpIndex3)))
        bCanMove = true;
    }
    else if (nAction == 2) //end of line
    {
      AkelPad.SendMessage(hEditWnd, AEM_GETINDEX, AEGI_WRAPLINEEND, lpIndex3);
      if (AkelPad.SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD|AEDLM_PREVCHAR, lpIndex3))
        AkelPad.SendMessage(hEditWnd, AEM_GETPREVBREAK, AEWB_LEFTWORDEND, lpIndex3);
      if (AkelPad.SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpIndex2, lpIndex3) == -1)
        bCanMove = true;
    }
    else //down
    {
      AkelPad.SendMessage(hEditWnd, AEM_GETINDEX, AEGI_WRAPLINEEND, lpIndex3);
      if (AkelPad.SendMessage(hEditWnd, AEM_GETNEXTBREAK, AEWB_RIGHTWORDEND, lpIndex3) &&
         (! AkelPad.SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD|AEDLM_PREVCHAR, lpIndex3)))
      {
        bCanMove = true;

        nRow = AkelPad.MemRead(lpIndex3, DT_DWORD);
        nCol = AkelPad.MemRead(lpIndex2 + 8, DT_DWORD);
        while (nCol > AkelPad.MemRead(lpIndex3 + 8, DT_DWORD))
        {
          if (AkelPad.SendMessage(hEditWnd, AEM_GETNEXTBREAK, AEWB_RIGHTWORDEND, lpIndex3))
          {
            if (AkelPad.SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD|AEDLM_PREVCHAR, lpIndex3) ||
               (nRow != AkelPad.MemRead(lpIndex3, DT_DWORD)))
            {
              AkelPad.SendMessage(hEditWnd, AEM_GETPREVBREAK, AEWB_LEFTWORDEND, lpIndex3);
              break;
            }
          }
          else
            break;
        }
      }
    }
  }

  if (bCanMove)
  {
    SetRedraw(hEditWnd, false);

    nOffset3 = AkelPad.SendMessage(hEditWnd, AEM_INDEXTORICHOFFSET, 0, lpIndex3);
    sTxt     = AkelPad.GetTextRange(nOffset3, (nAction < 0) ? nOffset1 : nOffset2);
    lpBuffer = AkelPad.SendMessage(hMainWnd, 1223 /*AKD_GETFRAMEINFO*/, 108 /*FI_WORDDELIMITERS*/, 0);
    sSeps    = AkelPad.MemRead(lpBuffer, _TSTR).replace(/[\\\/.^$+*?|()\[\]{}-]/g, "\\$&");
    sSeps    = sSeps.replace(/\n/g, "\r");
    rWords   = new RegExp("[^" + sSeps + "]+", "g");
    rSeps    = new RegExp("[" + sSeps + "]+", "g");
    aWords   = sTxt.match(rWords);
    aSeps    = sTxt.match(rSeps);
    sTxt     = AkelPad.GetSelText();
    nWordLen = sTxt.length;

    if (nAction < 0)
      aWords.unshift(sTxt);
    else
      aWords.push(sTxt);

    sTxt = aWords[0];
    for (i = 0; i < aSeps.length; ++i)
      sTxt += aSeps[i] + aWords[i + 1];

    AkelPad.SetSel(nOffset3, (nAction < 0) ? nOffset2 : nOffset1);
    AkelPad.ReplaceSel(sTxt);
    AkelPad.SetSel(nOffset3 + ((nAction < 0) ? nWordLen : -nWordLen), nOffset3);
    SetRedraw(hEditWnd, true);
  }
}

AkelPad.MemFree(lpIndex1);
AkelPad.MemFree(lpIndex2);
AkelPad.MemFree(lpIndex3);

////////
function WordsSelect()
{
  var bSelWord = false;

  AkelPad.SendMessage(hEditWnd, AEM_GETINDEX, AEGI_FIRSTSELCHAR, lpIndex1);
  if (AkelPad.SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD, lpIndex1))
  {
    if (AkelPad.SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD|AEDLM_PREVCHAR, lpIndex1))
      AkelPad.SendMessage(hEditWnd, AEM_GETNEXTBREAK, AEWB_RIGHTWORDSTART, lpIndex1);
    else
      AkelPad.SendMessage(hEditWnd, AEM_GETPREVBREAK, AEWB_LEFTWORDSTART, lpIndex1);
  }
  else if (! AkelPad.SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD|AEDLM_PREVCHAR, lpIndex1))
    AkelPad.SendMessage(hEditWnd, AEM_GETPREVBREAK, AEWB_LEFTWORDSTART, lpIndex1);

  AkelPad.SendMessage(hEditWnd, AEM_GETINDEX, AEGI_LASTSELCHAR, lpIndex2);
  if (AkelPad.SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD, lpIndex2))
  {
    if (AkelPad.SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD|AEDLM_PREVCHAR, lpIndex2))
      AkelPad.SendMessage(hEditWnd, AEM_GETPREVBREAK, AEWB_LEFTWORDEND, lpIndex2);
  }
  else
    AkelPad.SendMessage(hEditWnd, AEM_GETNEXTBREAK, AEWB_RIGHTWORDEND, lpIndex2);

  nOffset1 = AkelPad.SendMessage(hEditWnd, AEM_INDEXTORICHOFFSET, 0, lpIndex1);
  nOffset2 = AkelPad.SendMessage(hEditWnd, AEM_INDEXTORICHOFFSET, 0, lpIndex2);

  if (nOffset1 < nOffset2)
  {
    AkelPad.SetSel(nOffset1, nOffset2);
    bSelWord = true;
  }

  return bSelWord;
}

function SetRedraw(hWnd, bRedraw)
{
  var oSys = AkelPad.SystemFunction();
  AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
  bRedraw && oSys.Call("user32::InvalidateRect", hWnd, 0, true);
}
