// Choose & insert/change color in RGB-format by standard color selection dialog
// supported short format of standard colors
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=8611#8611
// http://staynormal.org.ua/akelpad/scripts/ChooseColor.js
// Version: 1.7.1 (2012.09.14)   VladSh (warning fixes by Lint)
// Version: 1.7   (2012.09.13)   VladSh (bug fixes, added/changed variation of formats of input/output data)
// Version: 1.6.1 (2011.02.16)   se7h (autoselect color under caret)
// Version: 1.5   (2011.02.01)   VladSh (change; short format)
// Version: 1.4   (2011.01.26)   VladSh (изменение выделенного цвета)
// Version: 1.3   (2011.01.18)   © FeyFre
//
// Arguments:
//    default - значения цветов, которые будут отображаться при открытии (при отсутствии выделенного текста); см. пример ниже
//    lcase ([0 | без параметра] / 1) - возможность вывода результата в нижнем регистре
//    place - куда помещать выводимый результат:
//       • [0 | без параметра] - в окно редактирования (замена выделенного текста)
//       • 1 - в буфер обмена
//       • 2 - в поле диалога (InputBox)
//
// Examples:
// -"Insert color..." Call("Scripts::Main", 1, "ChooseColor.js") Icon("%a\AkelFiles\Plugs\Toolbar.dll", 30)
// -"Вставка цвета..." Call("Scripts::Main", 1, "ChooseColor.js", `-default="127 127 127"`) Icon("%a\AkelFiles\Plugs\Toolbar.dll", 30)      //initial color values from se7h

//color values by default
var nRGB = [255 /*RED*/, 0 /*GREEN*/, 0 /*BLUE*/];

var nPlace = AkelPad.GetArgValue("place", 0);
var hWndEdit = AkelPad.GetEditWnd();
if (hWndEdit)
{
   var crSel = [];
   var pSelText = AkelPad.GetSelText();
   if (!pSelText) {
      crSel = getWordCaretInfo(hWndEdit);
      if (crSel) pSelText = AkelPad.GetTextRange(crSel.min, crSel.max);
   }
   else {
      crSel.min = AkelPad.GetSelStart();
      crSel.max = AkelPad.GetSelEnd();
   }
   if (pSelText) {
      // проверка возможного НЕзахвата решётки
      if (AkelPad.GetTextRange(crSel.min-1, crSel.min) == "#")
         crSel.min = crSel.min - 1;
      // корректировка избыточной длины (при выделении вручную)
      var lRgbMax = 7;
      if ((crSel.max - crSel.min) > lRgbMax)
         crSel.max = crSel.min + lRgbMax;
      AkelPad.SetSel(crSel.min, crSel.max);
      pSelText = AkelPad.GetSelText();
   }
}
else {
   // если окна редактирования нет, то выводим результат в InputBox, игнорируя переданный параметр
   if (nPlace === 0) nPlace = 2;
}

if (!pSelText) {
   var dRGB = AkelPad.GetArgValue("default", "");
   if (dRGB) {
      dRGB = dRGB.split(" ");
      for (var i = 0; i < dRGB.length; i++)
         nRGB[i] = parseInt(dRGB[i]);
      dRGB = null;
   }
}
else
   nRGB = HexToRGB(pSelText);

var oFunc = AkelPad.SystemFunction();
var /*CHOOSECOLOR*/ ccs = AkelPad.MemAlloc((_X64?8:4) * 9);
var /*COLORREF[16]*/ lprgbcustcol = AkelPad.MemAlloc(4 * 16);
for (i = 0; i < 16; i++)
   AkelPad.MemCopy(lprgbcustcol + i * 4, 0x0FFFFFF, 3 /*DT_DWORD*/);

//!CHOOSECOLOR.lStructSize
AkelPad.MemCopy(ccs + (_X64?0:0), (_X64?8:4) * 9, 3 /*DT_DWORD*/);
//!CHOOSECOLOR.hWndOwner
AkelPad.MemCopy(ccs + (_X64?8:4), 0 + AkelPad.GetMainWnd(), 2 /*DT_QWORD*/);
//!CHOOSECOLOR.hInstance
AkelPad.MemCopy(ccs + (_X64?16:8), 0, 2 /*DT_QWORD*/);
//!CHOOSECOLOR.rgbResult
AkelPad.MemCopy(ccs + (_X64?24:12), (nRGB[2]<<16) + (nRGB[1]<<8) + (nRGB[0]), 3 /*DT_DWORD*/);
//!CHOOSECOLOR.lpCustColors
AkelPad.MemCopy(ccs + (_X64?32:16), lprgbcustcol, 2 /*DT_QWORD*/);
//!CHOOSECOLOR.FLAGS
AkelPad.MemCopy(ccs + (_X64?40:20), 0x00000103/*CC_ANYCOLOR|CC_FULLOPEN|CC_RGBINIT*/, 3 /*DT_DWORD*/);
//!CHOOSECOLOR.lCustData
AkelPad.MemCopy(ccs + (_X64?48:24), 0, 2 /*DT_QWORD*/);
//!CHOOSECOLOR.lpfnHook
AkelPad.MemCopy(ccs + (_X64?56:28), 0, 2 /*DT_QWORD*/);
//!CHOOSECOLOR.lpTemplateName
AkelPad.MemCopy(ccs + (_X64?64:32), 0, 2 /*DT_QWORD*/);

if (oFunc.Call("comdlg32::ChooseColor" + _TCHAR, ccs)) {
   // COLORREF in format 0x00BBGGRR
   var xColor = AkelPad.MemRead(ccs + (_X64?24:12), 3 /*DT_DWORD*/);

   var hColor = RGBToHex(xColor);
   if (AkelPad.GetArgValue("lcase", 0))
      hColor = hColor.toLowerCase();

   switch (nPlace) {
      case 1:
         AkelPad.SetClipboardText(hColor);
         break;
      case 2:
         AkelPad.InputBox(AkelPad.GetMainWnd(), WScript.ScriptName, "Color in RGB:", hColor);
         break;
      default:
         AkelPad.ReplaceSel(hColor, true);
         break;
   }
}

AkelPad.MemFree(ccs);
AkelPad.MemFree(lprgbcustcol);


function HexToRGB(hColor) {
   var dec = parseInt(hColor.charAt(0) == '#' ? hColor.slice(1) : hColor, 16);
   return [dec >> 16, dec >> 8 & 255, dec & 255];
}

function RGBToHex(xColor) {
// переделать бы как-то на алгоритм от 2: http://jsperf.com/rgbtohex/5 ...
   var hex = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
   var hRGB = ['', '', ''];
   for (var n = 0; n <= 2; n++) {
      for (var i = 0; i < 2; i++) {
         hRGB[n] = hex[xColor%16] + hRGB[n];
         xColor = Math.floor(xColor / 16);
      }
   }
   return "#" + hRGB.join("");
}

//Select word under caret
function getWordCaretInfo(hWndEdit) {
   if (hWndEdit) {
      var nCaretPos = AkelPad.GetSelStart();
      var crInfo = [];
      crInfo.min = AkelPad.SendMessage(hWndEdit, 1100 /*EM_FINDWORDBREAK */, 0/*WB_LEFT*/, nCaretPos);
      crInfo.max = AkelPad.SendMessage(hWndEdit, 1100 /*EM_FINDWORDBREAK */, 7/*WB_RIGHTBREAK*/, crInfo.min);
      //! For case when caret located on word start position i.e. "prev-word |word-to-copy"
      if (crInfo.max < nCaretPos) {
         crInfo.min = AkelPad.SendMessage(hWndEdit, 1100/*EM_FINDWORDBREAK*/, 0/*WB_LEFT*/, nCaretPos + 1);
         crInfo.max = AkelPad.SendMessage(hWndEdit, 1100/*EM_FINDWORDBREAK*/, 7/*WB_RIGHTBREAK*/, crInfo.min);
      }
      if (crInfo.max >= nCaretPos)
         return crInfo;
   }
}