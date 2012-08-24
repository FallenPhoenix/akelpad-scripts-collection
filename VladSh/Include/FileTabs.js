///Script "library" for working with AkelPad tabs
// must be placed in ...\Scripts\Include\
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=16297#16297
// Version: 1.1 (2011.12.30)

var hWndMain = AkelPad.GetMainWnd();

function getTabIndexCurrent()
{
	var lpFrame = AkelPad.SendMessage(hWndMain, 1288 /*AKD_FRAMEFIND*/, 1 /*FWF_CURRENT*/, 0)
	return AkelPad.SendMessage(hWndMain, 1294 /*AKD_FRAMEINDEX*/, 0, lpFrame);
}


function getTabFileByIndex(nTabIndex)
{
	var lpFrame = getTabFrameByIndex(nTabIndex);
	var hWnd = AkelPad.SendMessage(hWndMain, 1223 /*AKD_GETFRAMEINFO*/, 2 /*FI_WNDEDIT*/, lpFrame);
	var ei = AkelPad.MemAlloc(_X64?160:80 /*sizeof(EDITINFO)*/);
	AkelPad.SendMessage(hWndMain, 1224 /*AKD_GETEDITINFO*/, hWnd, ei);
	var addr = AkelPad.MemRead(ei + 2*(_X64?8:4), 2 /*DT_QWORD*/);
	var file = AkelPad.MemRead(addr, _TSTR);
	AkelPad.MemFree(ei);
	return file;
}

function activateTabByIndex(nTabIndex)
{
	var lpFrame = getTabFrameByIndex(nTabIndex);
	AkelPad.SendMessage(hWndMain, 1285 /*AKD_FRAMEACTIVATE*/, 0, lpFrame);
}

function getTabFrameByIndex(nTabIndex)
{
	return AkelPad.SendMessage(hWndMain, 1288 /*AKD_FRAMEFIND*/, 8 /*FWF_BYTABINDEX*/, nTabIndex);
}