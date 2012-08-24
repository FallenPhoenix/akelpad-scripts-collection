// Move up or down selected lines - 2010-07-28
// If there is no selection, it moves the current line.
// Saves the position of the selection, and the position of the caret relative moving text.
//
// Call("Scripts::Main", 1, "MoveLinesUpDown.js", "-1") - move up
// Call("Scripts::Main", 1, "MoveLinesUpDown.js", "1")  - move down
//
// Can assign shortcut keys, eg: Ctrl+Alt+Up, Ctrl+Alt+Down


var nMovDir;
if (WScript.Arguments.length)
   nMovDir = WScript.Arguments(0);
if (!((nMovDir == -1) || (nMovDir == 1)))
   WScript.Quit();

var hEditWnd = AkelPad.GetEditWnd();

SetRedraw(hEditWnd, false);


// SmartSel::NoSelEOL plugin
var pFuncEOL  = "SmartSel::NoSelEOL";
var bNoSelEOL = AkelPad.IsPluginRunning(pFuncEOL);
if (bNoSelEOL)
   AkelPad.Call(pFuncEOL);


// Word Wrap
var nWordWrap = AkelPad.SendMessage(hEditWnd, 3241 /*AEM_GETWORDWRAP*/, 0, 0);
if (nWordWrap > 0)
   AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/);


var nBegSel   = AkelPad.GetSelStart();
var nEndSel   = AkelPad.GetSelEnd();
var nLine1    = AkelPad.SendMessage(hEditWnd, 1078 /*EM_EXLINEFROMCHAR*/, 0, nBegSel);
var nLine2    = AkelPad.SendMessage(hEditWnd, 1078 /*EM_EXLINEFROMCHAR*/, 0, nEndSel);
var nLastLine = AkelPad.SendMessage(hEditWnd, 1078 /*EM_EXLINEFROMCHAR*/, 0, -2);
var bColSel   = AkelPad.SendMessage(hEditWnd, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0);
var pEOL      = "\r";

var bCarOnEnd;
var nBegLine1;
var nBegLine2;
var nLenLine2;
var nSel1;
var nSel2;
var pSelTxt;
var pTxt1;
var pTxt2;

if (((nMovDir == 1) && (nLine2 < nLastLine) || (nMovDir == -1) && (nLine1 > 0)) && !AkelPad.GetEditReadOnly(hEditWnd))
{
   if (nEndSel == GetOffset(hEditWnd, 5 /*AEGI_CARETCHAR*/))
      bCarOnEnd = true;

   if (nMovDir == 1)
      ++ nLine2;
   else
      -- nLine1;

   nBegLine1 = AkelPad.SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/, nLine1, 0);
   nBegLine2 = AkelPad.SendMessage(hEditWnd, 187 /*EM_LINEINDEX*/, nLine2, 0);
   nLenLine2 = AkelPad.SendMessage(hEditWnd, 193 /*EM_LINELENGTH*/, nBegLine2, 0);
   nSel1 = nBegLine1;
   nSel2 = nBegLine2 + nLenLine2;
   if (nLine2 < nLastLine)
      ++ nSel2;

   AkelPad.SetSel(nSel1, nSel2);
   pSelTxt = AkelPad.GetSelText(1 /*\r*/);

   if (nMovDir == 1)
   {
      if (nLine2 < nLastLine)
      {
         pTxt1 = pSelTxt.substr(0, pSelTxt.lastIndexOf(pEOL) - nLenLine2);
         pTxt2 = pSelTxt.substr(pTxt1.length);
      }
      else
      {
         pTxt1 = pSelTxt.substr(0, pSelTxt.lastIndexOf(pEOL));
         pTxt2 = pSelTxt.substr(pSelTxt.lastIndexOf(pEOL) + 1) + pEOL;
      }
      nBegSel += pTxt2.length;
      nEndSel += pTxt2.length;
   }
   else
   {
      if (nLine2 < nLastLine)
      {
         pTxt1 = pSelTxt.substr(0, pSelTxt.indexOf(pEOL) + 1);
         pTxt2 = pSelTxt.substr(pSelTxt.indexOf(pEOL) + 1);
         nBegSel -= pTxt1.length;
         nEndSel -= pTxt1.length;
      }
      else
      {
         pTxt1 = pSelTxt.substr(0, pSelTxt.indexOf(pEOL));
         pTxt2 = pSelTxt.substr(pSelTxt.indexOf(pEOL) + 1) + pEOL;
         nBegSel -= (pTxt1.length + 1);
         nEndSel -= (pTxt1.length + 1);
      }
   }

   AkelPad.ReplaceSel(pTxt2 + pTxt1);

   if (bCarOnEnd)
      AkelPad.SetSel(nBegSel, nEndSel);
   else
      AkelPad.SetSel(nEndSel, nBegSel);

   if (bColSel)
      AkelPad.SendMessage(hEditWnd, 3128 /*AEM_UPDATESEL*/, 0x1 /*AESELT_COLUMNON*/, 0);
}

if (nWordWrap > 0)
   AkelPad.Command(4209 /*IDM_VIEW_WORDWRAP*/);

if (bNoSelEOL)
   AkelPad.Call(pFuncEOL);

SetRedraw(hEditWnd, true);


///////////////////////////////

function SetRedraw(hWnd, bRedraw)
{
   var oSys = AkelPad.SystemFunction();
   AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
   bRedraw && oSys.Call("user32::InvalidateRect", hWnd, 0, true);
}


function GetOffset(hWnd, nFlag)
{
  var lpIndex;
  var nOffset=-1;

  if (lpIndex=AkelPad.MemAlloc(12 /*sizeof(AECHARINDEX)*/))
  {
    AkelPad.SendMessage(hWnd, 3130 /*AEM_GETINDEX*/, nFlag, lpIndex);
    nOffset=AkelPad.SendMessage(hWnd, 3136 /*AEM_INDEXTORICHOFFSET*/, 0, lpIndex);
    AkelPad.MemFree(lpIndex);
  }
  return nOffset;
}
