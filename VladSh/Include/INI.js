///Script "library" for working with ini-files
///������-"����������" ��� ������ � �������� ini-�������; ��� ������ �� �����������!
// must be placed in ...\Scripts\Include\
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=11993#11993
// Version: 1.0 (2011.03.15)

var fso = new ActiveXObject("Scripting.FileSystemObject");

//"�����"-������ ��� ������������ ������/������ �������� � �������� ini-�����
var oINI =
{
	file: {					//����������� ��������� �����
		name: "",			//������ ��� �����
		text: ""				//������ ����������
	},
	value: {				//�������� ���������
		start: 0,				//������� ������ ��������� � �����
		end: 0				//������� ��������� ��������� � �����
	},
	
	//��������� ����� � ��������� ��� �����������
	setFile: function(pFileName)
	{
		this.file.name = pFileName;
		if (fso.FileExists(pFileName) == true)
		{
			this.file.text = AkelPad.ReadFile(pFileName);
			return true
		}
		else
			return false
	},
	
	//��������� ������ �������� ���������
	getParameter: function(pParamName)
	{
		this.value.start = this.file.text.indexOf(pParamName);
		
		if (this.value.start >= 0)
		{
			this.value.start = this.file.text.indexOf("=", this.value.start) + 1;
			this.value.end = this.file.text.indexOf("\r\n", this.value.start);
			return true
		}
		else
			return false
	},
	
	//��������� �������� ���������
	read: function(pParamName)
	{
		if (this.getParameter(pParamName))
			return this.file.text.substring(this.value.start, this.value.end)
		else
			return ""
	},
	
	//������ �������� ���������
	write: function(pParamName, pParamValue)		//����� ������� �������� �� ini, ����������� � �������� null
	{
		var fw;
		if (this.getParameter(pParamName))
		{
			fw = fso.OpenTextFile(this.file.name, 2 /*ForWriting*/, (pParamValue != null), true);
			if (fw)
			{
				if (pParamValue != null)
				{
					//��������� �������� ���������
					this.file.text = this.file.text.substring(0, this.value.start) + pParamValue + this.file.text.substring(this.value.end);
				}
				else
				{
					//�������� ���������
					this.value.start = this.file.text.indexOf(pParamName) - 1;
					this.file.text = this.file.text.substring(0, this.value.start) + this.file.text.substring(this.value.end);
				}
				
				fw.Write(this.file.text);
				fw.Close();
			}
		}
		else
		{
			if (pParamValue != null)
			{
				//���������� ��������� (���� ��� �� ����)
				fw = fso.OpenTextFile(this.file.name, 8 /*ForAppend*/, true, true);
				fw.Write(pParamName + "=" + pParamValue);
				fw.WriteBlankLines(1);
				fw.Close();
			}
		}
	}
	
};
