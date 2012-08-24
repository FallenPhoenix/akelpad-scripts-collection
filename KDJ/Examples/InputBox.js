if (! AkelPad.Include("InputBox_function.js"))
  WScript.Quit();

var vReturnValue;

vReturnValue = InputBox(
  AkelPad.GetMainWnd(),
  "Input Box - narrow width",
  "Rename file\n\nInputBox_example.js\n\ninput new name:",
  "InputBox_example_new_name.js");
WScript.Echo(((vReturnValue == undefined) ? ""  : vReturnValue) + "\n" + typeof vReturnValue);

vReturnValue = InputBox(
  AkelPad.GetMainWnd(),
  "Input Box - large width",
  "Copy file\n\nInputBox_example_new_name.js\n\nto\n\nC:\\WINDOWS\\system32\\config\\systemprofile\\Dane aplikacji\\Microsoft\\SystemCertificates\\My\\Certificates\\Other\\Certificat_ViseGroup_20130531\\",
 "InputBox_function.js");
WScript.Echo(((vReturnValue == undefined) ? ""  : vReturnValue) + "\n" + typeof vReturnValue);

vReturnValue = InputBox(
  AkelPad.GetMainWnd(),
  "Input Box - multivalue",
  ["Label 1\nInput value a:", "Input value b:", "Label 3\nInput value c:"],
  ["Value a", "Value b", "Value c"]);
WScript.Echo(((vReturnValue == undefined) ? ""  : vReturnValue) + "\n" + typeof vReturnValue);
