///Correction of Cyrillic characters of Clipboard
///Корректировка кириллических символов буфера обмена
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1413#1413
// Version: 2.2 (2011.07.20)

//Создание (закладки) нового файла
AkelPad.Command(4101);

//это работало при вставке текста в виде вопросиков; добавил следующую строку, когда попадётся такая строка, то надо проверить, работает ли это при ней, и если нет, тогда думать, как заставить скрипт работать в 2-х вариантах
//AkelPad.ReplaceSel(AkelPad.GetClipboardText());

//корректировка текста в виде "умляутов" (такой текст гораздо чаще бывает); см. http://akelpad.sourceforge.net/forum/viewtopic.php?p=1306#1306
AkelPad.Command(4191);

AkelPad.SetSel(0, -2);

AkelPad.SetClipboardText(AkelPad.GetSelText());

AkelPad.SendMessage(AkelPad.GetMainWnd(), 1229 /*AKD_SETMODIFY*/, 0, false);		//помечаем как неизменявшийся, чтобы не спрашивало, сохранить или нет
AkelPad.Command(4318);		//закрываем текущую вкладку