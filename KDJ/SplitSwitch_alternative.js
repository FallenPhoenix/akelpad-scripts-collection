// Split window switch.
//
// How to use:
// Add menu to ContextMenu plugin:
//
//  "Split window"
//  {
//    -"Four panes" Call("Scripts::Main", 1, "SplitSwitch.js", `"%m" "%i" "4212" "1" "4"`)
//    -"Two vertical panes" Call("Scripts::Main", 1, "SplitSwitch.js", `"%m" "%i" "4213" "2" "4"`)
//    -"Two horizontal panes" Call("Scripts::Main", 1, "SplitSwitch.js", `"%m" "%i" "4214" "3" "4"`)
//    SEPARATOR
//    -"Remove split" Call("Scripts::Main", 1, "SplitSwitch.js", `"%m" "%i" "4215" "4" "4"`)
//  }
//
// or in a different order:
//
//  {
//    -"Two vertical panes" Call("Scripts::Main", 1, "SplitSwitch.js", `"%m" "%i" "4213" "1" "4"`)
//    -"Two horizontal panes" Call("Scripts::Main", 1, "SplitSwitch.js", `"%m" "%i" "4214" "2" "4"`)
//    -"Four panes" Call("Scripts::Main", 1, "SplitSwitch.js", `"%m" "%i" "4212" "3" "4"`)
//    SEPARATOR
//    -"Remove split" Call("Scripts::Main", 1, "SplitSwitch.js", `"%m" "%i" "4215" "4" "4"`)
//  }
//
/// Переключение между режимами разделения окна.
//
// Как использовать:
// Добавляем меню в ContextMenu плагин:
//
//  "Разделить окно"
//  {
//    -"Четыре части" Call("Scripts::Main", 1, "SplitSwitch.js", `"%m" "%i" "4212" "1" "4"`)
//    -"Две вертикальные части" Call("Scripts::Main", 1, "SplitSwitch.js", `"%m" "%i" "4213" "2" "4"`)
//    -"Две горизонтальные части" Call("Scripts::Main", 1, "SplitSwitch.js", `"%m" "%i" "4214" "3" "4"`)
//    SEPARATOR
//    -"Убрать разделение" Call("Scripts::Main", 1, "SplitSwitch.js", `"%m" "%i" "4215" "4" "4"`)
//  }
//
// или в другом порядке:
//
//  {
//    -"Две вертикальные части" Call("Scripts::Main", 1, "SplitSwitch.js", `"%m" "%i" "4213" "1" "4"`)
//    -"Две горизонтальные части" Call("Scripts::Main", 1, "SplitSwitch.js", `"%m" "%i" "4214" "2" "4"`)
//    -"Четыре части" Call("Scripts::Main", 1, "SplitSwitch.js", `"%m" "%i" "4212" "3" "4"`)
//    SEPARATOR
//    -"Убрать разделение" Call("Scripts::Main", 1, "SplitSwitch.js", `"%m" "%i" "4215" "4" "4"`)
//  }


//Arguments
var nMenuHandle=0;
var nItemID=0;
var nAction=0;
var nOpt=0;
var nLastOpt=0;
if (WScript.Arguments.length >= 5)
{
  nMenuHandle=parseInt(WScript.Arguments(0));
  nItemID=parseInt(WScript.Arguments(1));
  nAction=parseInt(WScript.Arguments(2));
  nOpt=parseInt(WScript.Arguments(3));
  nLastOpt=parseInt(WScript.Arguments(4));
}

var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var oFunction=AkelPad.SystemFunction();
var nFirstIdInGroup;
var nLastIdInGroup;

if (hMainWnd)
{
  if (nMenuHandle && nItemID && nAction && nOpt && nLastOpt)
  {
    nFirstIdInGroup=nItemID - nOpt + 1;
    nLastIdInGroup=nItemID - nOpt + nLastOpt;
    if (nAction == 4215 /*IDM_VIEW_SPLIT_WINDOW_OFF*/)
      nItemID=-1;

    //Turn off
    if (AkelPad.SendMessage(hWndEdit, 3447 /*AEM_GETMASTER*/, 0, 0))
      AkelPad.SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4212 /*IDM_VIEW_SPLIT_WINDOW_ALL*/, 0);

    //Turn on
    if (nAction != 4215 /*IDM_VIEW_SPLIT_WINDOW_OFF*/)
      AkelPad.SendMessage(hMainWnd, 273 /*WM_COMMAND*/, nAction, 0);

    //Set radio button
    oFunction.AddParameter(nMenuHandle);
    oFunction.AddParameter(nFirstIdInGroup);
    oFunction.AddParameter(nLastIdInGroup);
    oFunction.AddParameter(nItemID);
    oFunction.AddParameter(0x0 /*MF_BYCOMMAND*/);
    oFunction.Call("user32::CheckMenuRadioItem");
  }
} 
