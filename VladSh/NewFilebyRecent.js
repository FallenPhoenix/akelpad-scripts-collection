///Creation of a new file on the basis of the contained allocated file in the list of the fresh
///������������� �������� ������ ����� �� ������ ���������� � ���� �������������� ��� � ������ ������
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1505#1505
// Version: 2.8 (2012.09.11)
// 
// -"����� �� ������ ����������" Call("Scripts::Main", 1, "NewFilebyRecent.js", `"%f"`)  Icon("%a\AkelFiles\Plugs\ToolBar.dll", 1) - �� ���� ������ ������ (�������� `"%f"` ����������!)
// -"����� �� ������ ��������" Call("Scripts::Main", 1, "NewFilebyRecent.js")  Icon("%a\AkelFiles\Plugs\ToolBar.dll", 1) - ���� �������, ���� �������������� ��� �������

var fileName = "";
var ext = "";
var fso = new ActiveXObject("Scripting.FileSystemObject");
var pContent = "";

if (WScript.Arguments.length) {
	if (WScript.Arguments(0) != AkelPad.GetEditFile(0))
		fileName = WScript.Arguments(0);			//���������� �� ���� ������ ������!
}

if (fileName) {
	//�������� �� ������ ����������� � ������ ������
	if (fso.FileExists(fileName)) {
		//���������� ����������� �����
		pContent = AkelPad.ReadFile(fileName)
	}
	ext = fso.GetExtensionName(fileName);
}
else {
	//���������� �� ���� ������� ��� ���� ��������������
	//�������� ������� ����� ���������� ����� � �� ������ ��� ������� ���, ����� ������ �� ������ ����� ������ ����� ������� �������
	pContent = AkelPad.GetSelText() || AkelPad.GetTextRange(0, -1);
}

if (AkelPad.Include("CommonFunctions.js"))
	CreateByFile(0, ext);		//������ �� ����� ����������� ��������� �����
else
	AkelPad.Command(4101 /*IDM_FILE_NEW*/);

//������ ����������� � ���� �������������� Akel'�
AkelPad.ReplaceSel(pContent);

//��������� ������� � ������ ������ �����
AkelPad.SetSel(0, 0);