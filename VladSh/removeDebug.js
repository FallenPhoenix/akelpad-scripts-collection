/// ������� ���������� ������� ������
// 
// Version: 1.0 (2012.06.20)
//	-"������� ���������� ������" Call("Scripts::Main", 1, "removeDebug.js")


if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
oCh.runWithRedraw();


function process()
{
	oCh.Text = oCh.getTextAll();
	
	var pFuncRemove;		//��� ����, ����� �� ��������� ���� ����� ������
	
	pFuncRemove = "Echo";
	oCh.Text = removeTextLineAll(oCh.Text, "WScript." + pFuncRemove);
	
	pFuncRemove = "Log::Output";
	oCh.Text = removeTextLineAll(oCh.Text, 'AkelPad.Call("' + pFuncRemove + '"');
	
//	pFuncRemove = "Quit";
//	oCh.Text = cleanbyBorders(oCh.Text, "\/\/", "WScript\." + pFuncRemove + "\(\);");
	
	oCh.Text = oCh.Text.replace(/\r{3,}/gm, oStr.repeat(pBreak, 2));	//����� �������� �������� �����
}


//		WScript.Quit();