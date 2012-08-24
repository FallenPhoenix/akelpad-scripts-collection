///Script "library" for working with ini-files
///Скрипт-"библиотека" для работы с внешними ini-файлами; имя секции не учитывается!
// must be placed in ...\Scripts\Include\
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=11993#11993
// Version: 1.0 (2011.03.15)

var fso = new ActiveXObject("Scripting.FileSystemObject");

//"Класс"-объект для одноразового чтения/записи значения в параметр ini-файла
var oINI =
{
	file: {					//необходимые параметры файла
		name: "",			//полное имя файла
		text: ""				//полное содержимое
	},
	value: {				//значение параметра
		start: 0,				//позиция начала параметра в файле
		end: 0				//позиция окончания параметра в файле
	},
	
	//Установка файла и получение его содержимого
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
	
	//Получение границ значения параметра
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
	
	//Получение значения параметра
	read: function(pParamName)
	{
		if (this.getParameter(pParamName))
			return this.file.text.substring(this.value.start, this.value.end)
		else
			return ""
	},
	
	//Запись значения параметра
	write: function(pParamName, pParamValue)		//чтобы удалить параметр из ini, передавайте в значении null
	{
		var fw;
		if (this.getParameter(pParamName))
		{
			fw = fso.OpenTextFile(this.file.name, 2 /*ForWriting*/, (pParamValue != null), true);
			if (fw)
			{
				if (pParamValue != null)
				{
					//изменение значения параметра
					this.file.text = this.file.text.substring(0, this.value.start) + pParamValue + this.file.text.substring(this.value.end);
				}
				else
				{
					//удаление параметра
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
				//добавление параметра (если его не было)
				fw = fso.OpenTextFile(this.file.name, 8 /*ForAppend*/, true, true);
				fw.Write(pParamName + "=" + pParamValue);
				fw.WriteBlankLines(1);
				fw.Close();
			}
		}
	}
	
};
