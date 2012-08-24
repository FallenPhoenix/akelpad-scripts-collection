// Page: http://akelpad.sourceforge.net/forum/viewtopic.php?p=13021#13021
// Version: 2.0
//
//
//// Export highlighted text to HTML or BBCode.
//
// Arguments:
// -Format="html"                     -Output highlighting in HTML format (default is "BBCode").
// -Enclose="[code]${result}[/code]"  -Enclose result string (default is "<pre>${result}</pre>").
// -XHTML=false                       -use "<br>" instead of "<br/>" (default is true).
// -Strict=true                       -use "<span style=" instead of "<font" (default is false).
// -Info=false                        -Don't add link to CodePoster.js script (default is true).
//
// Usage:
// Call("Scripts::Main", 1, "CodePoster.js", `-Format="BBCode" -Enclose="[code]${result}[/code]"`)
// Call("Scripts::Main", 1, "CodePoster.js", `-Strict=true -Info=false`)

//Arguments
var pFormat=AkelPad.GetArgValue("Format", "BBCode");
var pEnclose=AkelPad.GetArgValue("Enclose", "<pre>${result}</pre>");
var bXHTML=AkelPad.GetArgValue("XHTML", true);
var bStrict=AkelPad.GetArgValue("Strict", false);
var bInfo=AkelPad.GetArgValue("Info", true);

//Variables
var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var oSys=AkelPad.SystemFunction();
var dwSystemTextColor=oSys.Call("user32::GetSysColor", 8 /*COLOR_WINDOWTEXT*/);
var dwSystemBkColor=oSys.Call("user32::GetSysColor", 5 /*COLOR_WINDOW*/);
var lpGH;
var lpCallback;
var pText="";
var pColorBegin;
var pColorEnd;
var lpMemText=0;
var nMemTextBytes;
var bBBCode;
var pScriptURL="";

if (hWndEdit)
{
  if (pFormat.toLowerCase() == "html")
    bBBCode=false;
  else
    bBBCode=true;

  if (bInfo)
    pScriptURL="http://akelpad.sourceforge.net/forum/viewtopic.php?p=13021#13021";

  if (lpGH=AkelPad.MemAlloc(_X64?80:40 /*sizeof(AEGETHIGHLIGHT)*/))
  {
    if (lpCallback=oSys.RegisterCallback("GetHighLightCallback"))
    {
      AkelPad.MemCopy(lpGH + (_X64?16:8) /*offsetof(AEGETHIGHLIGHT, lpCallback)*/, lpCallback, 2 /*DT_QWORD*/);
      AkelPad.MemCopy(lpGH + (_X64?72:36) /*offsetof(AEGETHIGHLIGHT, dwFlags)*/, 0x7 /*AEGHF_NOSELECTION|AEGHF_NOACTIVELINETEXT|AEGHF_NOACTIVELINEBK*/, 3 /*DT_DWORD*/);

      if (!AkelPad.SendMessage(hWndEdit, 3123 /*AEM_EXGETSEL*/, lpGH + (_X64?24:12) /*offsetof(AEGETHIGHLIGHT, crText.ciMin)*/, lpGH + (_X64?48:24) /*offsetof(AEGETHIGHLIGHT, crText.ciMax)*/))
      {
        AkelPad.SendMessage(hWndEdit, 3130 /*AEM_GETINDEX*/, 1 /*AEGI_FIRSTCHAR*/, lpGH + (_X64?24:12) /*offsetof(AEGETHIGHLIGHT, crText.ciMin)*/);
        AkelPad.SendMessage(hWndEdit, 3130 /*AEM_GETINDEX*/, 2 /*AEGI_LASTCHAR*/, lpGH + (_X64?48:24) /*offsetof(AEGETHIGHLIGHT, crText.ciMax)*/);
      }

      //Calculate nMemTextBytes
      nMemTextBytes=0;
      AkelPad.SendMessage(hWndEdit, 3595 /*AEM_HLGETHIGHLIGHT*/, 0, lpGH);

      if (lpMemText=AkelPad.MemAlloc(nMemTextBytes + _TSIZE))
      {
        //Fill lpMemText
        nMemTextBytes=0;
        AkelPad.SendMessage(hWndEdit, 3595 /*AEM_HLGETHIGHLIGHT*/, 0, lpGH);

        pText=AkelPad.MemRead(lpMemText, _TSTR);
        AkelPad.MemFree(lpMemText);
      }
      oSys.UnregisterCallback(lpCallback);
    }
    AkelPad.MemFree(lpGH);
  }

  if (pText)
  {
    pText=pEnclose.replace(/\$\{result\}/, pText);
    if (bInfo)
    {
      if (bBBCode)
        pText+="[color=Purple][size=1]* " + GetLangString(0) + " [URL=" + pScriptURL + "]CodePoster.js[/URL] " + GetLangString(1) + "[/size][/color]\r";
      else
      {
        if (bStrict)
          pText+="\r<span style=\"color:Purple; font-size:xx-small;\">* " + GetLangString(0) + " <a href=\"" + pScriptURL + "\">CodePoster.js</a> " + GetLangString(1) + "</span>\r";
        else
          pText+="\r<font color=\"Purple\" size=\"1\">* " + GetLangString(0) + " <a href=\"" + pScriptURL + "\">CodePoster.js</a> " + GetLangString(1) + "</font>\r";
      }
    }
    AkelPad.SetClipboardText(pText);
    AkelPad.MessageBox(hMainWnd, GetLangString(2), WScript.ScriptName, 64 /*MB_ICONINFORMATION*/);
  }
}

function GetHighLightCallback(dwCookie, crAkelRange, crRichRange, hlp)
{
  var nRangeStart=AkelPad.MemRead(crRichRange + 0 /*offsetof(CHARRANGE64, crRichRange.cpMin)*/, 2 /*DT_QWORD*/);
  var nRangeEnd=AkelPad.MemRead(crRichRange + (_X64?8:4) /*offsetof(CHARRANGE64, crRichRange.cpMax)*/, 2 /*DT_QWORD*/);
  var pRangeText;
  var dwFontStyle=AkelPad.MemRead(hlp + (_X64?16:16) /*offsetof(AEHLPAINT, dwFontStyle)*/, 3 /*DT_DWORD*/);
  var dwActiveTextColor=AkelPad.MemRead(hlp + (_X64?8:8) /*offsetof(AEHLPAINT, dwActiveText)*/, 3 /*DT_DWORD*/);
  var dwActiveBkColor=AkelPad.MemRead(hlp + (_X64?12:12) /*offsetof(AEHLPAINT, dwActiveBk)*/, 3 /*DT_DWORD*/);
  var dwPaintType=AkelPad.MemRead(hlp + (_X64?20:20) /*offsetof(AEHLPAINT, dwPaintType)*/, 3 /*DT_DWORD*/);

  if (pRangeText=AkelPad.GetTextRange(nRangeStart, nRangeEnd))
  {
    if (!bBBCode)
    {
      //pRangeText=pRangeText.replace(/[ ]{2,}/g, "&nbsp;");
      pRangeText=pRangeText.replace(/&/g, "&amp;");
      pRangeText=pRangeText.replace(/</g, "&lt;");
      pRangeText=pRangeText.replace(/>/g, "&gt;");
      pRangeText=pRangeText.replace(/"/g, "&quot;");
    }

    if (dwPaintType & 0x80 /*AEHPT_LINK*/)
    {
      if (bBBCode)
        pRangeText="[url=" + pRangeText + "]" + pRangeText + "[/url]";
      else
        pRangeText="<a href=\"" + pRangeText + "\">" + pRangeText + "</a>";
    }
    if (dwFontStyle == 2 /*AEHLS_FONTBOLD*/)
    {
      if (bBBCode)
        pRangeText="[b]" + pRangeText + "[/b]";
      else
        pRangeText="<b>" + pRangeText + "</b>";
    }
    else if (dwFontStyle == 3 /*AEHLS_FONTITALIC*/)
    {
      if (bBBCode)
        pRangeText="[i]" + pRangeText + "[/i]";
      else
        pRangeText="<i>" + pRangeText + "</i>";
    }
    else if (dwFontStyle == 4 /*AEHLS_FONTBOLDITALIC*/)
    {
      if (bBBCode)
        pRangeText="[b][i]" + pRangeText + "[/i][/b]";
      else
        pRangeText="<b><i>" + pRangeText + "</i></b>";
    }

    if (dwSystemTextColor != dwActiveTextColor || (!bBBCode && bStrict && dwSystemBkColor != dwActiveBkColor))
    {
      if (bBBCode)
        nMemTextBytes+=AkelPad.MemCopy(lpMemText?lpMemText + nMemTextBytes:0, "[color=#" + rgb2hex(dwActiveTextColor) + "]" + pRangeText + "[/color]", _TSTR) - _TSIZE;
      else
      {
        if (bStrict)
          nMemTextBytes+=AkelPad.MemCopy(lpMemText?lpMemText + nMemTextBytes:0, "<span style=\"" + (dwSystemTextColor != dwActiveTextColor?"color:#" + rgb2hex(dwActiveTextColor) + ";":"") + (dwSystemBkColor != dwActiveBkColor?"background:#" + rgb2hex(dwActiveBkColor) + ";":"") + "\">" + pRangeText + "</span>", _TSTR) - _TSIZE;
        else
          nMemTextBytes+=AkelPad.MemCopy(lpMemText?lpMemText + nMemTextBytes:0, "<font color=\"#" + rgb2hex(dwActiveTextColor) + "\">" + pRangeText + "</font>", _TSTR) - _TSIZE;
      }
    }
    else nMemTextBytes+=AkelPad.MemCopy(lpMemText?lpMemText + nMemTextBytes:0, pRangeText, _TSTR) - _TSIZE;
  }

  if (IsLastCharInLine(crAkelRange + (_X64?24:12) /*offsetof(AECHARRANGE, ciMax)*/) && IndexCompare(crAkelRange + (_X64?24:12) /*offsetof(AECHARRANGE, ciMax)*/, lpGH + (_X64?48:24) /*offsetof(AEGETHIGHLIGHT, crText.ciMax)*/))
  {
    if (bBBCode)
      nMemTextBytes+=AkelPad.MemCopy(lpMemText?lpMemText + nMemTextBytes:0, "\r", _TSTR) - _TSIZE;
    else
      nMemTextBytes+=AkelPad.MemCopy(lpMemText?lpMemText + nMemTextBytes:0, "\r" + (bXHTML?"<br/>":"<br>"), _TSTR) - _TSIZE;
  }
  return 0;
}

function rgb2hex(dwColor)
{
  var pHexColor;

  pHexColor=dwColor.toString(16);
  pHexColor="000000".substr(pHexColor.length) + pHexColor;
  return pHexColor.substr(4, 2) + pHexColor.substr(2, 2) + pHexColor.substr(0, 2);
}

function IsLastCharInLine(lpCharIndex)
{
  var nCharInLine=AkelPad.MemRead(lpCharIndex + (_X64?16:8) /*offsetof(AECHARINDEX, nCharInLine)*/, 3 /*DT_DWORD*/);
  var lpLine=AkelPad.MemRead(lpCharIndex + (_X64?8:4) /*offsetof(AECHARINDEX, lpLine)*/, 2 /*DT_QWORD*/);
  var nLineLen=AkelPad.MemRead(lpLine + (_X64?24:12) /*offsetof(AELINEDATA, nLineLen)*/, 3 /*DT_DWORD*/);
  var nLineBreak=AkelPad.MemRead(lpLine + (_X64?28:16) /*offsetof(AELINEDATA, nLineBreak)*/, 3 /*DT_DWORD*/);

  if (nCharInLine == nLineLen && nLineBreak != 9 /*AELB_WRAP*/)
    return true;
  return false;
}

function IndexCompare(lpCharIndex1, lpCharIndex2)
{
  var nCharInLine1=AkelPad.MemRead(lpCharIndex1 + (_X64?16:8) /*offsetof(AECHARINDEX, nCharInLine)*/, 3 /*DT_DWORD*/);
  var nLine1=AkelPad.MemRead(lpCharIndex1 + 0 /*offsetof(AECHARINDEX, nLine)*/, 3 /*DT_DWORD*/);
  var nCharInLine2=AkelPad.MemRead(lpCharIndex2 + (_X64?16:8) /*offsetof(AECHARINDEX, nCharInLine)*/, 3 /*DT_DWORD*/);
  var nLine2=AkelPad.MemRead(lpCharIndex2 + 0 /*offsetof(AECHARINDEX, nLine)*/, 3 /*DT_DWORD*/);

  if (nLine1 == nLine2 && nCharInLine1 == nCharInLine2)
    return 0;
  if (nLine1 < nLine2 || (nLine1 == nLine2 && nCharInLine1 < nCharInLine2))
    return -1;
  return 1;
}

function GetLangString(nStringID)
{
  var nLangID=AkelPad.GetLangId(1 /*LANGID_PRIMARY*/);

  if (nLangID == 0x19) //LANG_RUSSIAN
  {
    if (nStringID == 0)
      return "\u041F\u043E\u0434\u0441\u0432\u0435\u0447\u0435\u043D\u043E\u0020\u0441\u0020\u043F\u043E\u043C\u043E\u0449\u044C\u044E\u0020\u0441\u043A\u0440\u0438\u043F\u0442\u0430";
    if (nStringID == 1)
      return "\u0434\u043B\u044F AkelPad";
    if (nStringID == 2)
      return "\u041A\u043E\u0434\u0020\u043F\u043E\u043C\u0435\u0449\u0435\u043D\u0020\u0432\u0020\u0431\u0443\u0444\u0435\u0440\u0020\u043E\u0431\u043C\u0435\u043D\u0430\u002E";
  }
  else
  {
    if (nStringID == 0)
      return "Highlighted with script";
    if (nStringID == 1)
      return "for AkelPad";
    if (nStringID == 2)
      return "Code has been placed in clipboard.";
  }
  return "";
}
