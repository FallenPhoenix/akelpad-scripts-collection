///Universal linking selectedText
// example: <a href="SelectedText befor space (URL)">SelectedText after space (Text)</a>

// ���������� � ���� ������� ������, �.�. ������ ������������ ������ Infocatcher'� insertTag.js
// �����, ����� ������������� ����� �� �������� ��������, ���������� ��

// Version: 2.0 (2010.06.22)

var tags = unescape(WScript.Arguments(0)).split('#');	//decodeURI

var SelText = AkelPad.GetSelText();
var iSpace = SelText.indexOf(' ', 0);
var sCaption = SelText.substr(iSpace + 1);
var sURL = SelText.substring(0, iSpace);
if (sURL == '') sURL = sCaption;

AkelPad.ReplaceSel( tags[0] + sURL + tags[1] + sCaption + tags[2] );
