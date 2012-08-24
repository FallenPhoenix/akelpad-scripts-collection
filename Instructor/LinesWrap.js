// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1908#1908
// Version v1.3
//
//
//// Wrap lines in specified format.
//
// Arguments:
// -ParaIndent="    "          -Paragraph indent (default is "    ").
// -LineIndent="  "            -Line indent (default is "").
// -MaxLength=40               -Maximum line length is 40 (default is 80).
// -KeepFirstLineIndent=false  -Keep first line indent (default is true).
// -ShowInput=false            -Show input dialog (default is true).
//
// Usage:
// Call("Scripts::Main", 1, "LinesWrap.js", `-ParaIndent="" -LineIndent="  " -MaxLength=40 -ShowInput=false`)

//Arguments
var pParaIndent=AkelPad.GetArgValue("ParaIndent", "    ");
var pLineIndent=AkelPad.GetArgValue("LineIndent", "");
var nMaxLength=AkelPad.GetArgValue("MaxLength", 80);
var bKeepFirstLineIndent=AkelPad.GetArgValue("KeepFirstLineIndent", true);
var bShowInput=AkelPad.GetArgValue("ShowInput", true);

var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var oSys=AkelPad.SystemFunction();
var hWndStatus=0;
var hWndProgress=0;
var pFirstLineIndent="";
var pSelText;
var lpResultArray=[];
var lpMatchArray=[];
var lpLinesArray=[];
var pLineCut;
var pLineEnd;
var nLine;
var nLineMaxLength=0;
var bParagraph;
var nCharInLine;
var pContinueLineEnd;
var dwOptions;

if (bShowInput)
  nMaxLength=AkelPad.InputBox(hMainWnd, WScript.ScriptName, "Maximum line length:", nMaxLength);

if (nMaxLength)
{
  if (AkelPad.GetSelStart() == AkelPad.GetSelEnd())
    AkelPad.SetSel(0, -1);
  pSelText=AkelPad.GetSelText(2 /*\n*/);

  if (bKeepFirstLineIndent)
  {
    if (pFirstLineIndent=pSelText.match(/^[ \t]+/))
      pFirstLineIndent=pFirstLineIndent[0];
    else
      pFirstLineIndent="";
  }
  pParaIndent=pFirstLineIndent + pParaIndent;
  pLineIndent=pFirstLineIndent + pLineIndent;
  nMaxLength=parseInt(nMaxLength);

  //Trim leading and trailing spaces
  pSelText=pSelText.replace(/(^[ \t]+)|([ \t]+$)/gm, "");

  //Unwrap lines
  pSelText=pSelText.replace(/([^.?!:;\n\(\)\[\]\-\=])\n[ \t]*([^\n])/g, "$1 $2");

  if (lpLinesArray=pSelText.split("\n"))
  {
    //Lock edit window and show progress bar
    dwOptions=AkelPad.SendMessage(hWndEdit, 3227 /*AEM_GETOPTIONS*/, 0, 0);
    if (!(dwOptions & 0x1 /*AECO_READONLY*/))
      AkelPad.SendMessage(hWndEdit, 3228 /*AEM_SETOPTIONS*/, 2 /*AECOOP_OR*/, 0x100001 /*AECO_READONLY|AECO_LOCKSELECTION*/);
    if (hWndStatus=oSys.Call("user32::GetDlgItem", hMainWnd, 10002 /*ID_STATUS*/))
    {
      if (hWndProgress=oSys.Call("user32::GetDlgItem", hWndStatus, 10004 /*ID_PROGRESS*/))
      {
        AkelPad.SendMessage(hWndProgress, 1030 /*PBM_SETRANGE32*/, 0, lpLinesArray.length);
        AkelPad.SendMessage(hWndProgress, 1026 /*PBM_SETPOS*/, 0, 0);
        oSys.Call("user32::ShowWindow", hWndProgress, 5 /*SW_SHOW*/);
      }
    }

    pSelText="";
    lpResultArray[0]=pParaIndent;
    nLineMaxLength=nMaxLength - pParaIndent.length;
    bParagraph=true;

    for (nLine=0; nLine < lpLinesArray.length; ++nLine)
    {
      if (hWndProgress)
        AkelPad.SendMessage(hWndProgress, 1026 /*PBM_SETPOS*/, nLine, 0);
      pLineEnd=nLine < lpLinesArray.length - 1?"\n":"";
      if (nLineMaxLength < 0)
      {
        AkelPad.MessageBox(hMainWnd, "Indents are more than line limit.", WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/);
        break;
      }

      if (lpLinesArray[nLine].length > nLineMaxLength)
      {
        for (nCharInLine=0; nCharInLine < lpLinesArray[nLine].length;)
        {
          pLineCut=lpLinesArray[nLine].substr(nCharInLine, nLineMaxLength);

          if (pLineCut.length == nLineMaxLength && (lpMatchArray=pLineCut.match(/[ \t]+/g)))
          {
            lpResultArray[nLine]+=(bParagraph?"":pLineIndent) + pLineCut.substr(0, lpMatchArray.lastIndex) + "\n";
            nCharInLine+=lpMatchArray.lastIndex;
          }
          else
          {
            if (pLineCut.length != nLineMaxLength && nLine == lpLinesArray.length - 1)
              pContinueLineEnd="";
            else
              pContinueLineEnd="\n";
            lpResultArray[nLine]+=(bParagraph?"":pLineIndent) + pLineCut + pContinueLineEnd;
            nCharInLine+=pLineCut.length;
          }
          nLineMaxLength=nMaxLength - pLineIndent.length;
          bParagraph=false;
        }
      }
      else
      {
        if (lpLinesArray[nLine])
        {
          lpResultArray[nLine]+=(bParagraph?"":pLineIndent) + lpLinesArray[nLine] + pLineEnd;
          nLineMaxLength=nMaxLength - pLineIndent.length;
          bParagraph=false;
        }
        else
        {
          lpResultArray[nLine]+=pLineEnd + pParaIndent;
          nLineMaxLength=nMaxLength - pParaIndent.length;
          bParagraph=true;
        }
      }
      lpResultArray[nLine + 1]="";
      lpLinesArray[nLine]="";
    }
    lpLinesArray=[];

    pSelText=lpResultArray.join("");
    lpResultArray=[];
    if (pLineIndent || pParaIndent)
      pSelText=pSelText.replace(/[ \t]+$/gm, "");

    //Hide progress bar and unlock edit window
    if (hWndProgress)
      oSys.Call("user32::ShowWindow", hWndProgress, 0 /*SW_HIDE*/);
    if (!(dwOptions & 0x1 /*AECO_READONLY*/))
      AkelPad.SendMessage(hWndEdit, 3228 /*AEM_SETOPTIONS*/, 4 /*AECOOP_XOR*/, 0x100001 /*AECO_READONLY|AECO_LOCKSELECTION*/);

    if (nLineMaxLength >= 0)
      AkelPad.ReplaceSel(pSelText, true);
  }
}
