// Choose & insert/change color in RGB-format by standard color selection dialog
// supported short format of standard colors
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=8611#8611
// http://staynormal.org.ua/akelpad/scripts/ChooseColor.js
// Version: 1.8   (2013.01.25)   Infocatcher (support for color names like "silver")
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
      var hex = getHexFromName(pSelText);
      if (!hex) {
         // корректировка избыточной длины (при выделении вручную)
         var lRgbMax = 7;
         if ((crSel.max - crSel.min) > lRgbMax)
            crSel.max = crSel.min + lRgbMax;
      }
      AkelPad.SetSel(crSel.min, crSel.max);
      pSelText = hex || AkelPad.GetSelText();
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

function getHexFromName(colorName) {
   var colors = {
      "aliceblue":            "#f0f8ff",
      "antiquewhite":         "#faebd7",
      "aqua":                 "#00ffff",
      "aquamarine":           "#7fffd4",
      "azure":                "#f0ffff",
      "beige":                "#f5f5dc",
      "bisque":               "#ffe4c4",
      "black":                "#000000",
      "blanchedalmond":       "#ffebcd",
      "blue":                 "#0000ff",
      "blueviolet":           "#8a2be2",
      "brown":                "#a52a2a",
      "burlywood":            "#deb887",
      "cadetblue":            "#5f9ea0",
      "chartreuse":           "#7fff00",
      "chocolate":            "#d2691e",
      "coral":                "#ff7f50",
      "cornflowerblue":       "#6495ed",
      "cornsilk":             "#fff8dc",
      "crimson":              "#dc143c",
      "cyan":                 "#00ffff",
      "darkblue":             "#00008b",
      "darkcyan":             "#008b8b",
      "darkgoldenrod":        "#b8860b",
      "darkgray":             "#a9a9a9",
      "darkgreen":            "#006400",
      "darkkhaki":            "#bdb76b",
      "darkmagenta":          "#8b008b",
      "darkolivegreen":       "#556b2f",
      "darkorange":           "#ff8c00",
      "darkorchid":           "#9932cc",
      "darkred":              "#8b0000",
      "darksalmon":           "#e9967a",
      "darkseagreen":         "#8fbc8f",
      "darkslateblue":        "#483d8b",
      "darkslategray":        "#2f4f4f",
      "darkturquoise":        "#00ced1",
      "darkviolet":           "#9400d3",
      "deeppink":             "#ff1493",
      "deepskyblue":          "#00bfff",
      "dimgray":              "#696969",
      "dodgerblue":           "#1e90ff",
      "firebrick":            "#b22222",
      "floralwhite":          "#fffaf0",
      "forestgreen":          "#228b22",
      "fuchsia":              "#ff00ff",
      "gainsboro":            "#dcdcdc",
      "ghostwhite":           "#f8f8ff",
      "gold":                 "#ffd700",
      "goldenrod":            "#daa520",
      "gray":                 "#808080",
      "green":                "#008000",
      "greenyellow":          "#adff2f",
      "honeydew":             "#f0fff0",
      "hotpink":              "#ff69b4",
      "indianred":            "#cd5c5c",
      "indigo":               "#4b0082",
      "ivory":                "#fffff0",
      "khaki":                "#f0e68c",
      "lavender":             "#e6e6fa",
      "lavenderblush":        "#fff0f5",
      "lawngreen":            "#7cfc00",
      "lemonchiffon":         "#fffacd",
      "lightblue":            "#add8e6",
      "lightcoral":           "#f08080",
      "lightcyan":            "#e0ffff",
      "lightgoldenrodyellow": "#fafad2",
      "lightgreen":           "#90ee90",
      "lightgrey":            "#d3d3d3",
      "lightpink":            "#ffb6c1",
      "lightsalmon":          "#ffa07a",
      "lightseagreen":        "#20b2aa",
      "lightskyblue":         "#87cefa",
      "lightslategray":       "#778899",
      "lightsteelblue":       "#b0c4de",
      "lightyellow":          "#ffffe0",
      "lime":                 "#00ff00",
      "limegreen":            "#32cd32",
      "linen":                "#faf0e6",
      "magenta":              "#ff00ff",
      "maroon":               "#800000",
      "mediumaquamarine":     "#66cdaa",
      "mediumblue":           "#0000cd",
      "mediumorchid":         "#ba55d3",
      "mediumpurple":         "#9370db",
      "mediumseagreen":       "#3cb371",
      "mediumslateblue":      "#7b68ee",
      "mediumspringgreen":    "#00fa9a",
      "mediumturquoise":      "#48d1cc",
      "mediumvioletred":      "#c71585",
      "midnightblue":         "#191970",
      "mintcream":            "#f5fffa",
      "mistyrose":            "#ffe4e1",
      "moccasin":             "#ffe4b5",
      "navajowhite":          "#ffdead",
      "navy":                 "#000080",
      "oldlace":              "#fdf5e6",
      "olive":                "#808000",
      "olivedrab":            "#6b8e23",
      "orange":               "#ffa500",
      "orangered":            "#ff4500",
      "orchid":               "#da70d6",
      "palegoldenrod":        "#eee8aa",
      "palegreen":            "#98fb98",
      "paleturquoise":        "#afeeee",
      "palevioletred":        "#db7093",
      "papayawhip":           "#ffefd5",
      "peachpuff":            "#ffdab9",
      "peru":                 "#cd853f",
      "pink":                 "#ffc0cb",
      "plum":                 "#dda0dd",
      "powderblue":           "#b0e0e6",
      "purple":               "#800080",
      "red":                  "#ff0000",
      "rosybrown":            "#bc8f8f",
      "royalblue":            "#4169e1",
      "saddlebrown":          "#8b4513",
      "salmon":               "#fa8072",
      "sandybrown":           "#f4a460",
      "seagreen":             "#2e8b57",
      "seashell":             "#fff5ee",
      "sienna":               "#a0522d",
      "silver":               "#c0c0c0",
      "skyblue":              "#87ceeb",
      "slateblue":            "#6a5acd",
      "slategray":            "#708090",
      "snow":                 "#fffafa",
      "springgreen":          "#00ff7f",
      "steelblue":            "#4682b4",
      "tan":                  "#d2b48c",
      "teal":                 "#008080",
      "thistle":              "#d8bfd8",
      "tomato":               "#ff6347",
      "turquoise":            "#40e0d0",
      "violet":               "#ee82ee",
      "wheat":                "#f5deb3",
      "white":                "#ffffff",
      "whitesmoke":           "#f5f5f5",
      "yellow":               "#ffff00",
      "yellowgreen":          "#9acd32"
   };
   return colors[colorName.toLowerCase()] || undefined;
}