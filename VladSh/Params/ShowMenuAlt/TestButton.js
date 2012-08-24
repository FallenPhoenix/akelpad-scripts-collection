///Test Toolbar button menu example for ShowMenuAlt.js script

var lpItems;
var nItem;

lpItems =	[[101, MF_NORMAL, "ItemA"],
					[101-sep, MF_SEPARATOR, ""],
					[102, MF_NORMAL|MF_CHECKED|MF_USECHECKBITMAPS, "ItemB"]];

nItem = ShowMenu(lpItems, POS_TOOLBAR, POS_TOOLBAR);
if (nItem != -1)
	WScript.Echo("Item index: " + nItem + "\nItem name: " + lpItems[nItem][0] + "\nItem ID: " + lpItems[nItem][2]);
