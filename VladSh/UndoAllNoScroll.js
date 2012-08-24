///Undo all changes without scroll (4.x.x only)
///Отменяет все изменения без скролирования документа
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=4537#4537
// Version: 2.3 (2012.07.31)

var hWndEdit = AkelPad.GetEditWnd();
var oSys = AkelPad.SystemFunction();

if (AkelPad.GetMainWnd() && hWndEdit
	&& AkelPad.SendMessage(hWndEdit, 3075 /*AEM_CANUNDO*/, 0, 0)
	//&& AkelPad.SendMessage(hWndEdit, 3086 /*AEM_GETMODIFY*/, 0, 0)			//закоментил, т.к. иначе не работало, - на форуме были багрепорты
)
{
	SetRedraw(hWndEdit, false);
	AkelPad.SendMessage(hWndEdit, 3185 /*AEM_LOCKSCROLL*/, 3 /*SB_BOTH*/, true)

	while (AkelPad.SendMessage(hWndEdit, 3075 /*AEM_CANUNDO*/, 0, 0)) {
		AkelPad.SendMessage(hWndEdit, 3077 /*AEM_UNDO*/, 0, 0)
	}
	
	AkelPad.SendMessage(hWndEdit, 3185 /*AEM_LOCKSCROLL*/, 3 /*SB_BOTH*/, false);
	SetRedraw(hWndEdit, true);
}

function SetRedraw(hWnd, bRedraw) 
{ 
	AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0); 
	if (bRedraw) oSys.Call("user32::InvalidateRect", hWnd, 0, true); 
}