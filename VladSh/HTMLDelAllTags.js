///Remove all HTML tags...
///������� ��� ����, ��������� HTML-�������� � ������� ��������� ����
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1994#1994
// Version: 3.5 (2011.03.22)

if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
oCh.runWithRedraw();


function process()
{
   oCh.Text = oCh.getSelTextAll();
   
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<script', '\\/script>');		//��������� ������ �������, ����� �� ���������� ������
   
   oCh.Text = oCh.Text.replace(/<[^>]*>/g, '');		//������ ������ HTML-����
   
   oCh.Text = oCh.Text.replace(/&nbsp;/g, ' ');
   oCh.Text = oCh.Text.replace(/&quot;/g, '"');
   oCh.Text = oCh.Text.replace(/&amp;/g, '&');
   oCh.Text = oCh.Text.replace(/&lt;/g, '<');
   oCh.Text = oCh.Text.replace(/&gt;/g, '>');
   
   oCh.Text = oCh.Text.replace(/&ndash;/g, '-');
   oCh.Text = oCh.Text.replace(/&mdash;/g, '�');
   
   oCh.Text = oCh.Text.replace(/&lsquo;/g, '�');		//����� ��������� �������
   oCh.Text = oCh.Text.replace(/&rsquo;/g, '�');		//������ ��������� �������
   oCh.Text = oCh.Text.replace(/&sbquo;/g, '�');		//������ ��������� �������
   oCh.Text = oCh.Text.replace(/&ldquo;/g, '�');		//����� ������� �������
   oCh.Text = oCh.Text.replace(/&rdquo;/g, '�');		//������ ������� �������
   oCh.Text = oCh.Text.replace(/&bdquo;/g, '�');
   
   oStr.flags = "gm";
   oCh.Text = oStr.trim(oCh.Text, " \t");				//������ ������ �� ���� ������ �������� � ���������
   
   oCh.Text = oCh.Text.replace(/\r{3,}/gm, '\r\r');	//����� �������� �������� �����
}