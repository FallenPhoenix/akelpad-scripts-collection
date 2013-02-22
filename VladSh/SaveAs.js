///"Save as ..." by analogy with the way it makes MS Word
///"��������� ���..." �� �������� � ���, ��� ��� ������ MS Word
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=5837#5837
// Version: 2.14 (2012.03.20)
// 
// -"��������� ���..." Call("Scripts::Main", 1, "SaveAs.js")
// -"��������� � js..." Call("Scripts::Main", 1, "SaveAs.js", `"js"`)

var pAllText = AkelPad.GetTextRange(0, -1);		//���� ���� �����

if (! AkelPad.Include("CommonFunctions.js")) WScript.Quit();

var pSelText = AkelPad.GetSelText();		//���� ���� ���������� �����, �� ������ �� ����, � �� �� ������ ������, ����� ����� ������������ �������� �����

var hWndEdit = AkelPad.GetEditWnd();
var pCurrentFile = AkelPad.GetEditFile(hWndEdit);

var pInitialFile = pSelText || pCurrentFile || pAllText;		//��������� ����� ��� ���������� ����� �����

//���������� ���������� �������� �����; �������� � ���������� ������������
var fileExt = AkelPad.GetArgLine() || GetFileExt(pCurrentFile) || getExtBySyntaxFile(hWndEdit);
if (fileExt == "bbc") fileExt = "";		//bbc ����� ������ ��� ���������, � ��� ���������� ��, ��� ������� � ��������� �����; ���� ����� bbc, �� ��� ����� ������� � �������

if (pInitialFile && (pInitialFile != pCurrentFile))
	pInitialFile = getFileNameByFirstRow(pInitialFile);		//��������� ���������� ����� ����� �� ��� ������ ������

pInitialFile = FileDialogDefault(false, pInitialFile, fileExt);		//����� � ������� - ����� ��������
if (pInitialFile)
{
	pInitialFile = CorrectFileNameFull(pInitialFile);
	if (pInitialFile)
	{
		//��������, �������� ����� ���������� ���� ��������� � ��� �������������
		var dFile = SeparateFile(pInitialFile);
		var tmpFileName = GetFileNameOnly(pInitialFile);
		if (dFile.name.length != tmpFileName.length)
			pInitialFile = dFile.path + tmpFileName + "." + dFile.ext;		//��, ��� ���� ������� � �������, ������������!
		
		//�������� �� ������������� ����� � ����� ������
		fso = new ActiveXObject("Scripting.FileSystemObject");
		if (fso.FileExists(pInitialFile) == true)
		{
			if (AkelPad.MessageBox(AkelPad.GetMainWnd(), "File '" + pInitialFile + "' already exist! Replace it?!", "AkelPad message...", 48+4) != 6) WScript.Quit();
			
			//�������� �������� ����� � ��� �������
			AkelPad.Command(4324 /*IDM_WINDOW_FILECLOSE*/);
			AkelPad.Command(4318 /*IDM_WINDOW_FRAMECLOSE*/);
		}
		
		if (pCurrentFile)
		{
			CreateByFile(hWndEdit);
			AkelPad.ReplaceSel(pAllText);
		}
		
		//������� ���������� �����
		AkelPad.SaveFile(0, pInitialFile);
	}
}


//���� ������ ������, ��� ��� ������ MS Word
function getFileNameByFirstRow(pInitialFile)
{
	var pTmpFile = pInitialFile.replace(new RegExp("^[" + " \t\r" + "]+", "gm"), "");
	pTmpFile = pTmpFile.split(/\r/)[0]
	
	return CorrectFileName(pTmpFile);
}