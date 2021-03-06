//Example of use InputBox function - ver. 2013-04-14

if (! AkelPad.Include("InputBox_function.js")) WScript.Quit();

var hMainWnd = AkelPad.GetMainWnd();
var vRetVal;

vRetVal = InputBox();
MessageBox(vRetVal);

vRetVal = InputBox(
  hMainWnd,
  "InputBox - medium version",
  ["Input value a:", "Input value b:", "Input value c:"],
  ["Edit value a", "Edit value b", "Edit value c"]);
MessageBox(vRetVal);

vRetVal = InputBox(
  hMainWnd,
  "InputBox - full version",
  ["Top label 1\nInput value a:", "Input value b:", "Top label 3\nInput value c:"],
  ["Edit value a", "Edit value x", "Edit value c"],
  2,
  ErrorBox,
  ["Edit value a", "Edit value b", "Edit value c"],
  300,
  ["Bottom label 1\nin two rows", "Bottom label 2", "Bottom label 3\n\nIf you want to save the values press OK button."],
  ["Left label 1:", "Left label 2:", "Left label 3:"],
  ["Right label 1", "Right label 2", "Right label 3"]);
MessageBox(vRetVal);

function MessageBox(vRetVal)
{
  AkelPad.MessageBox(hMainWnd, "Returned value:\n" + (vRetVal == undefined ? ""  : vRetVal) + "\n\nType:\n" + typeof vRetVal + (vRetVal instanceof Array ? " Array" : ""), "Message", 0x40);
}

function ErrorBox(hWnd, aEdit, aLimit)
{
  for (var i = 0; i < aEdit.length; i++)
  {
    if (aEdit[i] != aLimit[i])
    {
      AkelPad.MessageBox(hWnd, 'In the field #' + (i + 1) + ' must be: "' + aLimit[i] + '"', "Error", 0x30);
      return i;
    }
  }
  return -1;
}
