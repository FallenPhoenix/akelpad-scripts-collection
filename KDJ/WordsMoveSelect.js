// WordsMoveSelect.js - ver. 2013-08-24 (x86/x64)
//
// Moves left/right/up/down selected words or only selects whole words.
// If there is no selection, it moves or selects the current word.
// Does not work with columnar selection.
//
// Usage:
// Call("Scripts::Main", 1, "WordsMoveSelect.js", "0")  - only select whole words, not move (default)
// Call("Scripts::Main", 1, "WordsMoveSelect.js", "-1") - move left, to the previous word
// Call("Scripts::Main", 1, "WordsMoveSelect.js", "1")  - move right, to the next word
// Call("Scripts::Main", 1, "WordsMoveSelect.js", "-2") - move left, to the first word in the line
// Call("Scripts::Main", 1, "WordsMoveSelect.js", "2")  - move right, to the last word in the line
// Call("Scripts::Main", 1, "WordsMoveSelect.js", "-3") - move up
// Call("Scripts::Main", 1, "WordsMoveSelect.js", "3")  - move down
//
// Can assign shortcut keys, eg:
// Ctrl+Shift+W, Ctrl+Shift+Alt+Left, Ctrl+Shift+Alt+Right, Ctrl+Shift+Alt+Home, Ctrl+Shift+Alt+End, Ctrl+Shift+Alt+Up, Ctrl+Shift+Alt+Down

var DT_DWORD              = 3;
var AEM_GETINDEX          = 3130;
var AEM_INDEXCOMPARE      = 3133;
var AEM_INDEXTORICHOFFSET = 3136;
var AEM_GETNEXTBREAK      = 3144;
var AEM_GETPREVBREAK      = 3145;
var AEM_ISDELIMITER       = 3146;
var AEDLM_WORD            = 0x00000010;
var AEDLM_PREVCHAR        = 0x00000001;
var AEWB_LEFTWORDSTART    = 0x00000001;
var AEWB_LEFTWORDEND      = 0x00000002;
var AEWB_RIGHTWORDSTART   = 0x00000004;
var AEWB_RIGHTWORDEND     = 0x00000008;
var AEGI_FIRSTSELCHAR     = 3;
var AEGI_LASTSELCHAR      = 4;
var AEGI_WRAPLINEBEGIN    = 18;
var AEGI_WRAPLINEEND      = 19;

var hEditWnd = AkelPad.GetEditWnd();
if (! hEditWnd)
  WScript.Quit();

if (SendMessage(hEditWnd, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0))
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

var lpIndex1 = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
var lpIndex2 = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
var lpIndex3 = AkelPad.MemAlloc(_X64 ? 24 : 12 /*sizeof(AECHARINDEX)*/);
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
var sText;
var nRow;
var nCol;
var i;

if (WordsSelect() && nAction && (! AkelPad.GetEditReadOnly(hEditWnd)))
{
  if (nAction < 0)
  {
    SendMessage(hEditWnd, AEM_GETINDEX, AEGI_FIRSTSELCHAR, lpIndex3);
    if (nAction == -1) //left
    {
      if (SendMessage(hEditWnd, AEM_GETPREVBREAK, AEWB_LEFTWORDSTART, lpIndex3) &&
         (! SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD, lpIndex3)))
        bCanMove = true;
    }
    else if (nAction == -2) //begin of line
    {
      SendMessage(hEditWnd, AEM_GETINDEX, AEGI_WRAPLINEBEGIN, lpIndex3);
      if (SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD, lpIndex3))
        SendMessage(hEditWnd, AEM_GETNEXTBREAK, AEWB_RIGHTWORDSTART, lpIndex3);
      if (SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpIndex3, lpIndex1) == -1)
        bCanMove = true;
    }
    else //up
    {
      SendMessage(hEditWnd, AEM_GETINDEX, AEGI_WRAPLINEBEGIN, lpIndex3);
      if (SendMessage(hEditWnd, AEM_GETPREVBREAK, AEWB_LEFTWORDSTART, lpIndex3) &&
         (! SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD, lpIndex3)))
      {
        bCanMove = true;

        nRow = AkelPad.MemRead(lpIndex3, DT_DWORD);
        nCol = AkelPad.MemRead(lpIndex1 + (_X64 ? 16 : 8), DT_DWORD);
        while (nCol < AkelPad.MemRead(lpIndex3 + (_X64 ? 16 : 8), DT_DWORD))
        {
          if (SendMessage(hEditWnd, AEM_GETPREVBREAK, AEWB_LEFTWORDSTART, lpIndex3))
          {
            if (SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD, lpIndex3) ||
               (nRow != AkelPad.MemRead(lpIndex3, DT_DWORD)))
            {
              SendMessage(hEditWnd, AEM_GETNEXTBREAK, AEWB_RIGHTWORDSTART, lpIndex3);
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
    SendMessage(hEditWnd, AEM_GETINDEX, AEGI_LASTSELCHAR, lpIndex3);
    if (nAction == 1) //right
    {
      if (SendMessage(hEditWnd, AEM_GETNEXTBREAK, AEWB_RIGHTWORDEND, lpIndex3) &&
         (! SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD|AEDLM_PREVCHAR, lpIndex3)))
        bCanMove = true;
    }
    else if (nAction == 2) //end of line
    {
      SendMessage(hEditWnd, AEM_GETINDEX, AEGI_WRAPLINEEND, lpIndex3);
      if (SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD|AEDLM_PREVCHAR, lpIndex3))
        SendMessage(hEditWnd, AEM_GETPREVBREAK, AEWB_LEFTWORDEND, lpIndex3);
      if (SendMessage(hEditWnd, AEM_INDEXCOMPARE, lpIndex2, lpIndex3) == -1)
        bCanMove = true;
    }
    else //down
    {
      SendMessage(hEditWnd, AEM_GETINDEX, AEGI_WRAPLINEEND, lpIndex3);
      if (SendMessage(hEditWnd, AEM_GETNEXTBREAK, AEWB_RIGHTWORDEND, lpIndex3) &&
         (! SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD|AEDLM_PREVCHAR, lpIndex3)))
      {
        bCanMove = true;

        nRow = AkelPad.MemRead(lpIndex3, DT_DWORD);
        nCol = AkelPad.MemRead(lpIndex2 + (_X64 ? 16 : 8), DT_DWORD);
        while (nCol > AkelPad.MemRead(lpIndex3 + (_X64 ? 16 : 8), DT_DWORD))
        {
          if (SendMessage(hEditWnd, AEM_GETNEXTBREAK, AEWB_RIGHTWORDEND, lpIndex3))
          {
            if (SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD|AEDLM_PREVCHAR, lpIndex3) ||
               (nRow != AkelPad.MemRead(lpIndex3, DT_DWORD)))
            {
              SendMessage(hEditWnd, AEM_GETPREVBREAK, AEWB_LEFTWORDEND, lpIndex3);
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

    nOffset3 = SendMessage(hEditWnd, AEM_INDEXTORICHOFFSET, 0, lpIndex3);
    sText    = AkelPad.GetTextRange(nOffset3, (nAction < 0) ? nOffset1 : nOffset2);
    lpBuffer = SendMessage(AkelPad.GetMainWnd(), 1223 /*AKD_GETFRAMEINFO*/, 108 /*FI_WORDDELIMITERS*/, 0);
    sSeps    = AkelPad.MemRead(lpBuffer, _TSTR).replace(/[\\\/.^$+*?|()\[\]{}-]/g, "\\$&");
    sSeps    = sSeps.replace(/\n/g, "\r");
    rWords   = new RegExp("[^" + sSeps + "]+", "g");
    rSeps    = new RegExp("[" + sSeps + "]+", "g");
    aWords   = sText.match(rWords);
    aSeps    = sText.match(rSeps);
    sText    = AkelPad.GetSelText();
    nWordLen = sText.length;

    if (nAction < 0)
      aWords.unshift(sText);
    else
      aWords.push(sText);

    sText = aWords[0];
    for (i = 0; i < aSeps.length; ++i)
      sText += aSeps[i] + aWords[i + 1];

    AkelPad.SetSel(nOffset3, (nAction < 0) ? nOffset2 : nOffset1);
    AkelPad.ReplaceSel(sText);
    AkelPad.SetSel(nOffset3 + ((nAction < 0) ? nWordLen : -nWordLen), nOffset3);
    SetRedraw(hEditWnd, true);
  }
}

AkelPad.MemFree(lpIndex1);
AkelPad.MemFree(lpIndex2);
AkelPad.MemFree(lpIndex3);

function WordsSelect()
{
  var bSelWord = false;

  SendMessage(hEditWnd, AEM_GETINDEX, AEGI_FIRSTSELCHAR, lpIndex1);
  if (SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD, lpIndex1))
  {
    if (SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD|AEDLM_PREVCHAR, lpIndex1))
      SendMessage(hEditWnd, AEM_GETNEXTBREAK, AEWB_RIGHTWORDSTART, lpIndex1);
    else
      SendMessage(hEditWnd, AEM_GETPREVBREAK, AEWB_LEFTWORDSTART, lpIndex1);
  }
  else if (! SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD|AEDLM_PREVCHAR, lpIndex1))
    SendMessage(hEditWnd, AEM_GETPREVBREAK, AEWB_LEFTWORDSTART, lpIndex1);

  SendMessage(hEditWnd, AEM_GETINDEX, AEGI_LASTSELCHAR, lpIndex2);
  if (SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD, lpIndex2))
  {
    if (SendMessage(hEditWnd, AEM_ISDELIMITER, AEDLM_WORD|AEDLM_PREVCHAR, lpIndex2))
      SendMessage(hEditWnd, AEM_GETPREVBREAK, AEWB_LEFTWORDEND, lpIndex2);
  }
  else
    SendMessage(hEditWnd, AEM_GETNEXTBREAK, AEWB_RIGHTWORDEND, lpIndex2);

  nOffset1 = SendMessage(hEditWnd, AEM_INDEXTORICHOFFSET, 0, lpIndex1);
  nOffset2 = SendMessage(hEditWnd, AEM_INDEXTORICHOFFSET, 0, lpIndex2);

  if (nOffset1 < nOffset2)
  {
    AkelPad.SetSel(nOffset1, nOffset2);
    bSelWord = true;
  }

  return bSelWord;
}

function SetRedraw(hWnd, bRedraw)
{
  SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
  bRedraw && AkelPad.SystemFunction().Call("User32::InvalidateRect", hWnd, 0, true);
}

function SendMessage(hWnd, uMsg, wParam, lParam)
{
  return AkelPad.SystemFunction().Call("User32::SendMessage" + _TCHAR, hWnd, uMsg, wParam, lParam);
}
