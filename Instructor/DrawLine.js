// http://akelpad.sourceforge.net/forum/viewtopic.php?p=19835#19835
// Version v1.0
//
//
//// Draw tables with pseudographic symbols.
//// Lines are drawn with Arrow + Shift/Ctrl/Alt key.
//// Second script call will turn off drawing.
//
// Arguments:
// -DoubleLine=true  -Draw with double line (default is false).
// -Shift=true       -Lines are drawn with Arrow + Shift key (default is true).
// -Ctrl=true        -Lines are drawn with Arrow + Ctrl key (default is false).
// -Alt=true         -Lines are drawn with Arrow + Alt key (default is false).
//
// Examples:
// -"Draw lines" Call("Scripts::Main", 1, "DrawLine.js", `-DoubleLine=true -Shift=false -Ctrl=true`)


//Arguments
var bDoubleLine=AkelPad.GetArgValue("DoubleLine", false);
var bShift=AkelPad.GetArgValue("Shift", true);
var bCtrl=AkelPad.GetArgValue("Ctrl", false);
var bAlt=AkelPad.GetArgValue("Alt", false);

//Variables
var hMainWnd=AkelPad.GetMainWnd();
var oSys=AkelPad.SystemFunction();
var hSubClass;
var hScript;
var lpCaretIndex;
var lpLeftIndex;
var lpUpIndex;
var lpRightIndex;
var lpDownIndex;
var nCaretChar;
var nCharInLine;
var nLeftChar;
var nRightChar;
var nUpChar;
var nDownChar;
var nInsertChar;
var dwOptions;
var bOvertype;
var bMove;
var bInit;
var lpCharsConnect;
var lpLeftConnect;
var lpUpConnect;
var lpRightConnect;
var lpDownConnect;

if (!bShift && !bCtrl && !bAlt)
{
  AkelPad.MessageBox(hMainWnd, GetLangString(0), WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/);
  WScript.Quit();
}

if (bDoubleLine)
{
  lpCharsConnect=[9574, 9552, 9559, 9580, 9571, 9577, 9565, 9568, 9553, 9562, 9556];
  lpLeftConnect=[9574, 9552, 9559, 9580, 9571, 9577, 9565];
  lpUpConnect=[9568, 9580, 9571, 9553, 9562, 9577, 9565];
  lpRightConnect=[9556, 9552, 9574, 9568, 9580, 9562, 9577];
  lpDownConnect=[9556, 9574, 9559, 9553, 9568, 9580, 9571];
}
else
{
  lpCharsConnect=[9516, 9472, 9488, 9532, 9508, 9524, 9496, 9500, 9474, 9492, 9484];
  lpLeftConnect=[9516, 9472, 9488, 9532, 9508, 9524, 9496];
  lpUpConnect=[9500, 9532, 9508, 9474, 9492, 9524, 9496];
  lpRightConnect=[9484, 9472, 9516, 9500, 9532, 9492, 9524];
  lpDownConnect=[9484, 9516, 9488, 9474, 9500, 9532, 9508];
}

if ((hScript=AkelPad.ScriptHandle(WScript.ScriptName, 3 /*SH_FINDSCRIPT*/)) && AkelPad.ScriptHandle(hScript, 13 /*SH_GETMESSAGELOOP*/))
{
  //Script is running, second call close it.
  AkelPad.ScriptHandle(hScript, 33 /*SH_CLOSESCRIPT*/);
}
else
{
  lpCaretIndex=AkelPad.MemAlloc(_X64?24:12 /*sizeof(AECHARINDEX)*/);
  lpLeftIndex=AkelPad.MemAlloc(_X64?24:12 /*sizeof(AECHARINDEX)*/);
  lpUpIndex=AkelPad.MemAlloc(_X64?24:12 /*sizeof(AECHARINDEX)*/);
  lpRightIndex=AkelPad.MemAlloc(_X64?24:12 /*sizeof(AECHARINDEX)*/);
  lpDownIndex=AkelPad.MemAlloc(_X64?24:12 /*sizeof(AECHARINDEX)*/);

  if (hSubClass=AkelPad.WindowSubClass(2 /*WSC_EDITPROC*/, EditCallback, 256 /*WM_KEYDOWN*/))
  {
    //Allow other scripts running.
    AkelPad.ScriptNoMutex();

    //Message loop
    AkelPad.WindowGetMessage();

    AkelPad.WindowUnsubClass(2 /*WSC_EDITPROC*/);
  }
  AkelPad.MemFree(lpCaretIndex);
  AkelPad.MemFree(lpLeftIndex);
  AkelPad.MemFree(lpUpIndex);
  AkelPad.MemFree(lpRightIndex);
  AkelPad.MemFree(lpDownIndex);
}

function EditCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 256 /*WM_KEYDOWN*/)
  {
    if (wParam == 0x25 /*VK_LEFT*/ ||
        wParam == 0x26 /*VK_UP*/ ||
        wParam == 0x27 /*VK_RIGHT*/ ||
        wParam == 0x28 /*VK_DOWN*/)
    {
      if ((!bShift || (oSys.Call("user32::GetKeyState", 0x10 /*VK_SHIFT*/) & 0x8000)) &&
          (!bCtrl || (oSys.Call("user32::GetKeyState", 0x11 /*VK_CONTROL*/) & 0x8000)) &&
          (!bAlt || (oSys.Call("user32::GetKeyState", 0x12 /*VK_MENU*/) & 0x8000)))
      {
        if (!(bOvertype=AkelPad.SendMessage(hWnd, 3235 /*AEM_GETOVERTYPE*/, 0, 0)))
        {
          SetRedraw(hWnd, false);
          AkelPad.SendMessage(hWnd, 3236 /*AEM_SETOVERTYPE*/, true, false);
        }
        dwOptions=AkelPad.SendMessage(hWnd, 3227 /*AEM_GETOPTIONS*/, 0, 0);
        if (!(dwOptions & 0x200 /*AECO_CARETOUTEDGE*/))
          AkelPad.SendMessage(hWnd, 3228 /*AEM_SETOPTIONS*/, 2 /*AECOOP_OR*/, 0x200 /*AECO_CARETOUTEDGE*/);
        bInit=true;

        for (;;)
        {
          nLeftChar=0;
          nRightChar=0;
          nUpChar=0;
          nDownChar=0;
          bMove=false;

          AkelPad.SendMessage(hWnd, 3130 /*AEM_GETINDEX*/, 5 /*AEGI_CARETCHAR*/, lpCaretIndex);
          nCaretChar=AkelPad.SendMessage(hWnd, 3046 /*AEM_CHARAT*/, lpCaretIndex, 0);
          nCharInLine=AkelPad.MemRead(lpCaretIndex + (_X64?16:8) /*offsetof(AECHARINDEX, nCharInLine)*/, 3 /*DT_DWORD*/);

          oSys.Call("kernel32::RtlMoveMemory", lpLeftIndex, lpCaretIndex, _X64?24:12 /*sizeof(AECHARINDEX)*/);
          if (AkelPad.SendMessage(hWnd, 3130 /*AEM_GETINDEX*/, 21 /*AEGI_PREVCHARINLINE*/, lpLeftIndex))
            nLeftChar=AkelPad.SendMessage(hWnd, 3046 /*AEM_CHARAT*/, lpLeftIndex, 0);

          oSys.Call("kernel32::RtlMoveMemory", lpRightIndex, lpCaretIndex, _X64?24:12 /*sizeof(AECHARINDEX)*/);
          if (AkelPad.SendMessage(hWnd, 3130 /*AEM_GETINDEX*/, 20 /*AEGI_NEXTCHARINLINE*/, lpRightIndex))
            nRightChar=AkelPad.SendMessage(hWnd, 3046 /*AEM_CHARAT*/, lpRightIndex, 0);

          oSys.Call("kernel32::RtlMoveMemory", lpUpIndex, lpCaretIndex, _X64?24:12 /*sizeof(AECHARINDEX)*/);
          if (AkelPad.SendMessage(hWnd, 3130 /*AEM_GETINDEX*/, 25 /*AEGI_PREVLINE*/, lpUpIndex))
          {
            AkelPad.MemCopy(lpUpIndex + (_X64?16:8) /*offsetof(AECHARINDEX, nCharInLine)*/, nCharInLine, 3 /*DT_DWORD*/);
            nUpChar=AkelPad.SendMessage(hWnd, 3046 /*AEM_CHARAT*/, lpUpIndex, 0);
          }

          oSys.Call("kernel32::RtlMoveMemory", lpDownIndex, lpCaretIndex, _X64?24:12 /*sizeof(AECHARINDEX)*/);
          if (AkelPad.SendMessage(hWnd, 3130 /*AEM_GETINDEX*/, 24 /*AEGI_NEXTLINE*/, lpDownIndex))
          {
            AkelPad.MemCopy(lpDownIndex + (_X64?16:8) /*offsetof(AECHARINDEX, nCharInLine)*/, nCharInLine, 3 /*DT_DWORD*/);
            nDownChar=AkelPad.SendMessage(hWnd, 3046 /*AEM_CHARAT*/, lpDownIndex, 0);
          }

          if (wParam == 0x25 /*VK_LEFT*/)
          {
            if (InArray(nDownChar, lpUpConnect) && InArray(nUpChar, lpDownConnect) && InArray(nRightChar, lpLeftConnect))
              nInsertChar=lpCharsConnect[3];
            else if (InArray(nDownChar, lpUpConnect) && InArray(nRightChar, lpLeftConnect))
              nInsertChar=lpCharsConnect[0];
            else if (InArray(nUpChar, lpDownConnect) && InArray(nRightChar, lpLeftConnect))
              nInsertChar=lpCharsConnect[5];
            else if (InArray(nDownChar, lpUpConnect) && InArray(nUpChar, lpDownConnect))
              nInsertChar=lpCharsConnect[4];
            else if (InArray(nDownChar, lpUpConnect))
              nInsertChar=lpCharsConnect[2];
            else if (InArray(nUpChar, lpDownConnect))
              nInsertChar=lpCharsConnect[6];
            else
              nInsertChar=lpCharsConnect[1];
            if (nCaretChar == nInsertChar)
            {
              if (bInit)
              {
                nInsertChar=lpCharsConnect[1];
                bMove=true;
              }
              else break;
            }
            if (bMove) AkelPad.SendMessage(hWnd, 3044 /*AEM_KEYDOWN*/, 0x25 /*VK_LEFT*/, 0);
            AkelPad.SendMessage(hWnd, 3045 /*AEM_INSERTCHAR*/, nInsertChar, 0);
            AkelPad.SendMessage(hWnd, 3044 /*AEM_KEYDOWN*/, 0x25 /*VK_LEFT*/, 0);
          }
          else if (wParam == 0x26 /*VK_UP*/)
          {
            if (InArray(nLeftChar, lpRightConnect) && InArray(nRightChar, lpLeftConnect) && InArray(nDownChar, lpUpConnect))
              nInsertChar=lpCharsConnect[3];
            else if (InArray(nLeftChar, lpRightConnect) && InArray(nDownChar, lpUpConnect))
              nInsertChar=lpCharsConnect[4];
            else if (InArray(nRightChar, lpLeftConnect) && InArray(nDownChar, lpUpConnect))
              nInsertChar=lpCharsConnect[7];
            else if (InArray(nLeftChar, lpRightConnect) && InArray(nRightChar, lpLeftConnect))
              nInsertChar=lpCharsConnect[5];
            else if (InArray(nLeftChar, lpRightConnect))
              nInsertChar=lpCharsConnect[6];
            else if (InArray(nRightChar, lpLeftConnect))
              nInsertChar=lpCharsConnect[9];
            else
              nInsertChar=lpCharsConnect[8];
            if (nCaretChar == nInsertChar)
            {
              if (bInit)
              {
                nInsertChar=lpCharsConnect[8];
                bMove=true;
              }
              else break;
            }
            if (bMove) AkelPad.SendMessage(hWnd, 3044 /*AEM_KEYDOWN*/, 0x26 /*VK_UP*/, 0);
            AkelPad.SendMessage(hWnd, 3045 /*AEM_INSERTCHAR*/, nInsertChar, 0);
            AkelPad.SendMessage(hWnd, 3044 /*AEM_KEYDOWN*/, 0x25 /*VK_LEFT*/, 0);
          }
          else if (wParam == 0x27 /*VK_RIGHT*/)
          {
            if (InArray(nDownChar, lpUpConnect) && InArray(nUpChar, lpDownConnect) && InArray(nLeftChar, lpRightConnect))
              nInsertChar=lpCharsConnect[3];
            else if (InArray(nDownChar, lpUpConnect) && InArray(nLeftChar, lpRightConnect))
              nInsertChar=lpCharsConnect[0];
            else if (InArray(nUpChar, lpDownConnect) && InArray(nLeftChar, lpRightConnect))
              nInsertChar=lpCharsConnect[5];
            else if (InArray(nDownChar, lpUpConnect) && InArray(nUpChar, lpDownConnect))
              nInsertChar=lpCharsConnect[7];
            else if (InArray(nDownChar, lpUpConnect))
              nInsertChar=lpCharsConnect[10];
            else if (InArray(nUpChar, lpDownConnect))
              nInsertChar=lpCharsConnect[9];
            else
              nInsertChar=lpCharsConnect[1];

            if (nCaretChar == nInsertChar)
            {
              if (bInit)
              {
                nInsertChar=lpCharsConnect[1];
                bMove=true;
              }
              else break;
            }
            if (bMove) AkelPad.SendMessage(hWnd, 3044 /*AEM_KEYDOWN*/, 0x27 /*VK_RIGHT*/, 0);
            AkelPad.SendMessage(hWnd, 3045 /*AEM_INSERTCHAR*/, nInsertChar, 0);
            AkelPad.SendMessage(hWnd, 3044 /*AEM_KEYDOWN*/, 0x25 /*VK_LEFT*/, 0);
          }
          else if (wParam == 0x28 /*VK_DOWN*/)
          {
            if (InArray(nLeftChar, lpRightConnect) && InArray(nRightChar, lpLeftConnect) && InArray(nUpChar, lpDownConnect))
              nInsertChar=lpCharsConnect[3];
            else if (InArray(nLeftChar, lpRightConnect) && InArray(nUpChar, lpDownConnect))
              nInsertChar=lpCharsConnect[4];
            else if (InArray(nRightChar, lpLeftConnect) && InArray(nUpChar, lpDownConnect))
              nInsertChar=lpCharsConnect[7];
            else if (InArray(nLeftChar, lpRightConnect) && InArray(nRightChar, lpLeftConnect))
              nInsertChar=lpCharsConnect[0];
            else if (InArray(nLeftChar, lpRightConnect))
              nInsertChar=lpCharsConnect[2];
            else if (InArray(nRightChar, lpLeftConnect))
              nInsertChar=lpCharsConnect[10];
            else
              nInsertChar=lpCharsConnect[8];
            if (nCaretChar == nInsertChar)
            {
              if (bInit)
              {
                nInsertChar=lpCharsConnect[8];
                bMove=true;
              }
              else break;
            }
            if (bMove)
            {
              if (!nDownChar) AppendText("\n");
              AkelPad.SendMessage(hWnd, 3044 /*AEM_KEYDOWN*/, 0x28 /*VK_DOWN*/, 0);
            }
            AkelPad.SendMessage(hWnd, 3045 /*AEM_INSERTCHAR*/, nInsertChar, 0);
            AkelPad.SendMessage(hWnd, 3044 /*AEM_KEYDOWN*/, 0x25 /*VK_LEFT*/, 0);
          }
          if (bInit && bMove)
            bInit=false;
          else
            break;
        }
        if (!(dwOptions & 0x200 /*AECO_CARETOUTEDGE*/))
          AkelPad.SendMessage(hWnd, 3228 /*AEM_SETOPTIONS*/, 4 /*AECOOP_XOR*/, 0x200 /*AECO_CARETOUTEDGE*/);
        if (!bOvertype)
        {
          AkelPad.SendMessage(hWnd, 3236 /*AEM_SETOVERTYPE*/, false, true);
          SetRedraw(hWnd, true);
        }

        AkelPad.WindowNoNextProc(hSubClass);
        return 0;
      }
    }
  }
}

function InArray(nItem, lpArray)
{
  var i;

  for (i=0; i < lpArray.length; ++i)
  {
    if (lpArray[i] == nItem)
      return true;
  }
  return false;
}

function AppendText(pText)
{
  var lpAppend;

  if (lpAppend=AkelPad.MemAlloc(_X64?24:12 /*sizeof(AEAPPENDTEXTW)*/))
  {
    AkelPad.MemCopy(lpAppend /*offsetof(AEAPPENDTEXTW, pText)*/, AkelPad.MemStrPtr(pText), 2 /*DT_QWORD*/);
    AkelPad.MemCopy(lpAppend + (_X64?8:4) /*offsetof(AEAPPENDTEXTW, dwTextLen)*/, pText.length, 2 /*DT_QWORD*/);
    AkelPad.MemCopy(lpAppend + (_X64?16:8) /*offsetof(AEAPPENDTEXTW, nNewLine)*/, 1 /*AELB_ASINPUT*/, 3 /*DT_DWORD*/);
    AkelPad.SendMessage(AkelPad.GetEditWnd(), 3028 /*AEM_APPENDTEXTW*/, 0, lpAppend);
    AkelPad.MemFree(lpAppend);
  }
}

function SetRedraw(hWnd, bRedraw)
{
  AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
  if (bRedraw) oSys.Call("user32::InvalidateRect", hWnd, 0, true);
}

function GetLangString(nStringID)
{
  var nLangID=AkelPad.GetLangId(1 /*LANGID_PRIMARY*/);

  if (nLangID == 0x19) //LANG_RUSSIAN
  {
    if (nStringID == 0)
      return "\x0425\x043E\x0442\x044F\x0020\x0431\x044B\x0020\x043E\x0434\x0438\x043D\x0020\x0438\x0437\x0020\x043C\x043E\x0434\x0438\x0444\x0438\x043A\x0430\x0442\x043E\x0440\x043E\x0432 Ctrl, Shift, Alt \x0434\x043E\x043B\x0436\x0435\x043D\x0020\x0431\x044B\x0442\x044C\x0020\x0432\x043A\x043B\x044E\x0447\x0435\x043D\x002E";
  }
  else
  {
    if (nStringID == 0)
      return "At least one of the modifiers Ctrl, Shift, Alt must be enabled.";
  }
  return "";
}
