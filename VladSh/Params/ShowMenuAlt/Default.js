///Default menu for ShowMenuAlt.js script

var lpItems;
var nItem;

lpItems =	[[101, MF_NORMAL, "ItemA"],
					[102, MF_SUBMENU, "ItemB"],
					[102-1, MF_NORMAL, "ItemB-1"],
					[102-2, MF_NORMAL, "ItemB-2"],
					[102-3, MF_NORMAL|MF_LAST, "ItemB-3"],
					[103, MF_NORMAL, "ItemC"],
					[104, MF_SEPARATOR, ""],
					[105, MF_NORMAL|MF_GRAYED, "ItemD"],
					[106, MF_SUBMENU, "ItemF"],
					[106-1, MF_NORMAL|MF_CHECKED, "ItemF-1"],
					[106-2, MF_NORMAL, "ItemF-2"],
					[106-3, MF_SUBMENU|MF_LAST, "ItemF-3"],
					[106-3a, MF_NORMAL, "ItemF-3a"],
					[106-3b, MF_NORMAL|MF_LAST, "ItemF-3b"]];

nItem = ShowMenu(lpItems, POS_CURSOR, POS_CURSOR);
if (nItem == -1)
	WScript.Echo("Nothing selected");
else
	WScript.Echo("Item index: " + nItem + "\nItem name: " + lpItems[nItem][0] + "\nItem ID: " + lpItems[nItem][2]);
