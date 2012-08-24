///Commented text or block of text
// variants comments see included CommentsExt.js
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1653#1653
// Version: 3.6 (2011.03.25)
// 
// Proposed to use a keyboard shortcut in Scripts-plugin box: Ctrl + /

if (! AkelPad.Include("CommentsExt.js")) WScript.Quit();
if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();

setComments(getFileExt(AkelPad.GetEditFile(0)));
oCh.run();


function process()
{
	var nCaretPos = 0;
	
	oCh.Text = oCh.getSelTextEmpty();
	
	if (oCh.Text.length)
	{
		if (!cBlockOpen)
			WScript.Quit();		//если блочные комменты не поддерживаютс€ - выходим
		
		var tmpText = oStr.rtrim(oCh.Text, pBreak);
		var nDiff = oCh.Text.length - tmpText.length;
		if (nDiff)		//если перевод строки в конце выделени€ захвачен
		{
			oCh.Text = tmpText;
			oCh.rBegin[1] -= nDiff;		//дл€ возможного дальнейшего полного выделени€ строк (если их выбрано несколько) с помощью setCompleteLineText
		}
		
		var pBreakValue = "";
		if (oCh.Text.indexOf(pBreak) !== -1)		//если выделенный текст в несколько строк
		{
			oCh.setCompleteLineText();
			if (!nDiff) pBreakValue = pBreak;		//специфика при отключенном NoSelEOL - переводы строк вокруг текста не вставл€ютс€
		}
		
		oCh.Text = cBlockOpen + pBreakValue + oCh.Text + pBreakValue + cBlockClose;
		nCaretPos = oCh.rBegin[0] + (pBreakValue + cBlockOpen).length;
	}
	else
	{
		if (!cSimple)
			WScript.Quit();		//если простые комменты не поддерживаютс€ - выходим
		
		oCh.setCompleteLineText();
		oCh.Text = cSimple + oCh.Text;
		nCaretPos = oCh.rBegin[0] + cSimple.length;
	}
	
	oCh.setSelCaret(nCaretPos);		//в этом скрипте восстанавливаем первоначальное положение каретки
}