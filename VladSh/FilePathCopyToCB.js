///Copy to clipboard file name full (%f) or file directory (%d)
///����������� ������� ����� ����� (%f) ��� ����� (%d) � ����� ������
// Version: 1.1 (2010.07.30)
// -"������ ��� �����" Call("Scripts::Main", 1, "FilePathCopyToCB.js", `"%f"`)

if (WScript.Arguments.length)
   AkelPad.SetClipboardText(WScript.Arguments(0));