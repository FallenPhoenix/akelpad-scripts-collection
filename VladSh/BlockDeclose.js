///Declose scriptblock
///Убирает блочность (скобки { текст }) выделенного скрипта
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=12241#12241
// Version: 1.1 (2011.03.30)


if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();

var iSelStart = AkelPad.GetSelStart();
var iSelEnd = AkelPad.GetSelEnd();
var Range;

if (iSelStart == iSelEnd)
{
	Range = getRangebyBordersEx(iSelStart, sbOpen, sbClose, true);
	if (Range == null) WScript.Quit();
	iSelStart = Range[0];
	iSelEnd = Range[1] - 1;		//без конечного перевода строки
}
Range = getRangeCompleteLine(iSelStart, iSelEnd);
if (Range == null) WScript.Quit();

var pText = getTextbyRange(Range);

getShift();		//определение содержимого сдвига из настроек

pText = pText.replace(new RegExp(pBreak + sShift, "g"), pBreak);		//удаляем лишние сдвиги по всему блоку
pText = pText.replace(new RegExp(sbOpen), "");		//удаляем открывающий тэг
pText = oStr.leftback(pText, sbClose);		//удаляем закрывающий тэг

if (pText.indexOf(pBreak) != 0)
	pText += sShift;		//восстанавливаем излишне удалённый сдвиг внизу-справа

AkelPad.SetSel(Range[0], Range[1]);
AkelPad.ReplaceSel(pText);