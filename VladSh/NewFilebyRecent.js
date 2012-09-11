///Creation of a new file on the basis of the contained allocated file in the list of the fresh
///Универсальное создание нового файла на основе имеющегося в окне редактирования или в списке свежих
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1505#1505
// Version: 2.8 (2012.09.11)
// 
// -"Новый на основе выбранного" Call("Scripts::Main", 1, "NewFilebyRecent.js", `"%f"`)  Icon("%a\AkelFiles\Plugs\ToolBar.dll", 1) - из меню свежих файлов (параметр `"%f"` обязателен!)
// -"Новый на основе текущего" Call("Scripts::Main", 1, "NewFilebyRecent.js")  Icon("%a\AkelFiles\Plugs\ToolBar.dll", 1) - меню вкладок, окна редактирования или тулбара

var fileName = "";
var ext = "";
var fso = new ActiveXObject("Scripting.FileSystemObject");
var pContent = "";

if (WScript.Arguments.length) {
	if (WScript.Arguments(0) != AkelPad.GetEditFile(0))
		fileName = WScript.Arguments(0);			//стартовали из меню списка свежих!
}

if (fileName) {
	//Создание на основе выделенного в списке свежих
	if (fso.FileExists(fileName)) {
		//Считывание содержимого файла
		pContent = AkelPad.ReadFile(fileName)
	}
	ext = fso.GetExtensionName(fileName);
}
else {
	//Стартовали из меню вкладок или окна редактирования
	//Пытаемся сначала взять выделенный текст и на основе его создать док, иначе создаём на основе всего текста файла текущей вкладки
	pContent = AkelPad.GetSelText() || AkelPad.GetTextRange(0, -1);
}

if (AkelPad.Include("CommonFunctions.js"))
	CreateByFile(0, ext);		//создаём со всеми параметрами исходного файла
else
	AkelPad.Command(4101 /*IDM_FILE_NEW*/);

//Запись содержимого в окно редактирования Akel'а
AkelPad.ReplaceSel(pContent);

//Установка курсора в начало нового файла
AkelPad.SetSel(0, 0);