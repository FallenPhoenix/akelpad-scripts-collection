///Creation of a new file on the basis of the contained allocated file in the list of the fresh
///������������� �������� ������ ����� �� ������ ���������� � ���� �������������� ��� � ������ ������
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1505#1505
// Version: 2.7 (2012.09.02)
// 
// -"����� �� ������ ����������" Call("Scripts::Main", 1, "NewFilebyRecent.js", `"%f"`)  Icon("%a\AkelFiles\Plugs\ToolBar.dll", 1) - �� ���� ������ ������ (�������� `"%f"` ����������!)
// -"����� �� ������ ��������" Call("Scripts::Main", 1, "NewFilebyRecent.js")  Icon("%a\AkelFiles\Plugs\ToolBar.dll", 1) - ���� �������, ���� �������������� ��� �������

var fileName = "";
var pContent = "";
var ext = "";
var fso = new ActiveXObject("Scripting.FileSystemObject");

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
	AkelPad.Command(4101 /*IDM_FILE_NEW*/);		//�������� (��������) ������ �����
}
else {
	fileName = AkelPad.GetEditFile(0);			//���������� �� ���� ������� ��� ���� ��������������
	
	//�������� ������� ����� ���������� ����� � �� ������ ��� ������� ���, ����� ������ �� ������ ����� ������ ����� ������� �������
	pContent = AkelPad.GetSelText() || AkelPad.GetTextRange(0, -1);
	
	if (AkelPad.Include("CommonFunctions.js")) {
		ext = getActiveSyntax(0);
		CreateByFile(0);		//������ �� ����� ����������� ��������� �����
	}
	else
		AkelPad.Command(4101 /*IDM_FILE_NEW*/);
}

//������ ����������� � ���� �������������� Akel'�
AkelPad.ReplaceSel(pContent);

if (ext && AkelPad.IsPluginRunning("Coder::HighLight") == true)
	AkelPad.Call("Coder::Settings", 1, ext);

//��������� ������� � ������ ������ �����
AkelPad.SetSel(0, 0);