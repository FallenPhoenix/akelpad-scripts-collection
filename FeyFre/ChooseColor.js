// Choose & insert/change color in RGB-format by standard color selection dialog
// supported short format of standard colors
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=8611#8611
// Version: 1.6.1 (2011.02.16)	se7h (autoselect color under caret)
// Version: 1.5 (2011.02.01)	VladSh (change; short format)
// Version: 1.4 (2011.01.26)	VladSh (изменение выделенного цвета)
// Version: 1.3 (2011.01.18)	© FeyFre
//
// -"Insert color..." Call("Scripts::Main", 1, "ChooseColor.js") Icon("%a\AkelFiles\Plugs\Toolbar.dll", 30)
// -"Вставка цвета..." Call("Scripts::Main", 1, "ChooseColor.js", `"127" "127" "127"`) Icon("%a\AkelFiles\Plugs\Toolbar.dll", 30)		//initial color values from se7h

//color values by default
var nRGB = [255 /*RED*/, 0 /*GREEN*/, 0 /*BLUE*/];

var pSelText = "";
var hWndEdit=AkelPad.GetEditWnd();
var nSelStart;
var nSelEnd;
var nWordBegin;
var nWordEnd;

if(hWndEdit)
{
	nSelStart=AkelPad.GetSelStart();
	nSelEnd=AkelPad.GetSelEnd();
	if(nSelStart == nSelEnd)
	{
		//Select word under caret
		nWordBegin=AkelPad.SendMessage(hWndEdit, 1100 /*EM_FINDWORDBREAK*/, 0 /*WB_LEFT*/, nSelStart);
		nWordEnd=AkelPad.SendMessage(hWndEdit, 1100 /*EM_FINDWORDBREAK*/, 7 /*WB_RIGHTBREAK*/, nWordBegin);
		if (nWordEnd > nSelStart)
		{
			pSelText=AkelPad.GetTextRange(nWordBegin, nWordEnd);
			if(AkelPad.GetTextRange(nWordBegin-1, nWordBegin) == "#")
				nWordBegin = nWordBegin - 1;
			AkelPad.SetSel(nWordBegin, nWordEnd);
		}
	}
	else pSelText=AkelPad.GetTextRange(nSelStart, nSelEnd);
}

if(!pSelText)
{
	if(WScript.Arguments.length >= 1)
	{
		nRGB[0] = parseInt(WScript.Arguments(0));
		if(WScript.Arguments.length >= 2)
		{
			nRGB[1] = parseInt(WScript.Arguments(1));
			if(WScript.Arguments.length > 2)
				nRGB[2] = parseInt(WScript.Arguments(2));
		}
	}
}
else
	HexToRGB(pSelText, nRGB);

var oFunc = AkelPad.SystemFunction();
var /*CHOOSECOLOR*/ ccs = AkelPad.MemAlloc((_X64?8:4) * 9);
var /*COLORREF[16]*/ lprgbcustcol = AkelPad.MemAlloc(4 * 16);
for(var i = 0; i < 16; i++)
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

var res = oFunc.Call("comdlg32::ChooseColor"+_TCHAR, ccs);
if(res)
{
	// COLORREF in format 0x00BBGGRR
	var xColor = AkelPad.MemRead(ccs + (_X64?24:12), 3 /*DT_DWORD*/);

	var hColor = RGBToHex(xColor);

	AkelPad.ReplaceSel(hColor, true);
	//AkelPad.InputBox(AkelPad.GetMainWnd(), "AkelPad -> " + WScript.ScriptName, "Цвет в RGB:", hColor);
}

AkelPad.MemFree(ccs);
AkelPad.MemFree(lprgbcustcol);


function HexToRGB(hColor, xColor)
{
	hColor = hColor.replace("#", "");

	var nStart = ((hColor.length == 6) + 1);
	var nOffset = 0;
	var vColor = "";
	for(var n = 0; n <= 2; n++)
	{
		vColor = hColor.substring(0 + nOffset, nStart + nOffset);
		if(vColor.length == 1) vColor += vColor;
		xColor[n] = (parseInt(vColor, 16)) || 0;
		nOffset += nStart;
	}
}

function RGBToHex(xColor)
{
	var hex = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
	var hRGB = ['', '', ''];
	for(var n = 0; n <= 2; n++)
	{
		for(var i = 0; i < 2; i++)
		{
			hRGB[n] = hex[xColor%16] + hRGB[n];
			xColor = Math.floor(xColor / 16);
		}
	}
	return "#" + hRGB.join("");
}
