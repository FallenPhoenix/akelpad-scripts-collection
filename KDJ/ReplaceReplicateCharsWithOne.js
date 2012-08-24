// Replace replicate chars with one char - 2011-03-12
//
// Call("Scripts::Main", 1, "ReplaceReplicateCharsWithOne.js")

var oSys = AkelPad.SystemFunction();

if (oSys.Call("kernel32::GetUserDefaultLangID") == 0x0415) //Polish
{
  var pTxtCaption = "Zamieñ powtórzenia znaków na jeden";
  var pTxtLabel   = "Podaj znaki do zamiany (jeœli puste, bêd¹ zamienione wszystkie):";
}
else
{
  var pTxtCaption = "Replace replicate chars with one char";
  var pTxtLabel   = "Input chars to replace (if blank, it will be replaced all):";
}

var hEditWnd = AkelPad.GetEditWnd();
var pChars;
var pSelTxt;
var rRE;
var i;

if (hEditWnd)
{
  if (AkelPad.GetSelStart() == AkelPad.GetSelEnd())
    AkelPad.SetSel(0, -1);

  pChars = AkelPad.InputBox(hEditWnd, pTxtCaption, pTxtLabel, pChars);

  if (pChars != undefined)
  {
    pSelTxt = AkelPad.GetSelText();

    if (! pChars) //replace all
      pSelTxt = pSelTxt.replace(/(.)\1+/g, "$1");

    else
    {
      for (i = 0; i < pChars.length ; ++i)
      {
        rRE = new RegExp("(" + escapeRegExp(pChars.charAt(i)) + ")\\1+", "g");
        pSelTxt = pSelTxt.replace(rRE, "$1");
      }
    }

    AkelPad.ReplaceSel(pSelTxt, 1);
  }
}

// function written by Infocatcher
function escapeRegExp(str)
{
  return str.replace(/[\\\/.^$+*?|()\[\]{}]/g, "\\$&");
}
