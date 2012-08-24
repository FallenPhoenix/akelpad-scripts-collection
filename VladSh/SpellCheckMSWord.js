///Spell check using Microsoft Word
///Проверка орфографии используя MS Word
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1346#1346
// Version: 1.2 (2011.06.08)

var pSelText;
var hMainWnd = AkelPad.GetMainWnd();
var nCursor = -1;

if (hMainWnd)
{
   var pScriptName = WScript.ScriptName;
   
   pSelText = AkelPad.GetSelText();
   if (!pSelText)
   {
      nCursor = AkelPad.GetSelStart();
      pSelText = AkelPad.GetTextRange(0, -1);
   }
   
   if (pSelText.charCodeAt(0) != 0)
   {
      var Word = new ActiveXObject("Word.application");
      if (Word)
      {
         var oSpellDoc;
         var pMessage;
         var pTextIn;
         var pTextOut;
         
         Word.Visible = false;
         Word.Options.SuggestSpellingCorrections = true;
   
         if (oSpellDoc = Word.Documents.Add())
         {
            Word.ActiveWindow.WindowState = 2;  //wdWindowStateMinimize
            oSpellDoc.Content.Text = pSelText;

            pTextIn = oSpellDoc.Content.Text;
            if (Word.Options.CheckGrammarWithSpelling == true)
               oSpellDoc.CheckGrammar();
            else
               oSpellDoc.CheckSpelling();
            pTextOut = oSpellDoc.Content.Text;

            oSpellDoc.Close(false);

            if (pTextIn != pTextOut)
            {
               if (AkelPad.MessageBox(hMainWnd, GetLangString(3), pScriptName, 36 /*MB_ICONQUESTION|MB_YESNO*/) == 6 /*IDYES*/)
               {
                  if (nCursor != -1) AkelPad.SetSel(0, -1);
                  AkelPad.ReplaceSel(pTextOut.substr(0, pTextOut.length - 1));
               }
            }
         }
      Word.Quit(0);
      }
      else
      {
         AkelPad.MessageBox(hMainWnd, GetLangString(0), pScriptName, 48 /*MB_ICONEXCLAMATION*/);
      }
   }
   else
   {
      AkelPad.MessageBox(hMainWnd, GetLangString(1), pScriptName, 64 /*MB_ICONINFORMATION*/);
   }
}

if (nCursor != -1) AkelPad.SetSel(nCursor, nCursor);


function GetLangString(nStringID)
{
   var nLangID = AkelPad.GetLangId(1 /*LANGID_PRIMARY*/);
   
   if (nLangID == 0x19)		//LANG_RUSSIAN
   {
      if (nStringID == 0)
         return "Необходимо сначала установить Microsoft Word 97 или выше.";
      if (nStringID == 1)
         return "Текст отсутствует.";
      if (nStringID == 3)
         return "Вставить исправленый текст?";
   }
   else
   {
      if (nStringID == 0)
         return "You must first install Microsoft Word 97 or higher.";
      if (nStringID == 1)
         return "The text is absent.";
      if (nStringID == 3)
         return "Insert corrected text?";
   }
   return "";
}
