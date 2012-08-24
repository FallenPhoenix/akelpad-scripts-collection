// === Set Coder Extension theme ===
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=10672#10672
// FeyFre (c) 2011-2012
//
//	Popups a dockbar which allows choose extension to activate for coder plugin.
//	Script should be positioned as a proof of concept for dockbar creation from scripts.
//	I have had no idea about existence of Highlighter.js when started to develop this script.
//	!!!Not tested on X64!!!
//
// Example:
//	Call("Scripts::Main", 1, "SetCoderExt.js")
//
//// REQUIRED: WIN32 Constant library at http://akelpad.sourceforge.net/forum/viewtopic.php?p=9420#9420

//! Окно редактора
var g_hAkelPad = AkelPad.GetMainWnd();
//! Прокси системных вызовов
var oSys=AkelPad.SystemFunction();
//! Модуль плагина
var g_hModuleDll = AkelPad.GetInstanceDll();
//! Флаг завершения обработы скрипта
var QuitMutext = false;
//! Shell
var WshShell=new ActiveXObject("WScript.shell");
//! Константы используемые системными вызовами
AkelPad.Include("win32\\user32.js");

//! Панелька
var g_pDock = 0;
//! Окно панельки
var g_hDockWnd = 0;
//! Класс окна панельки
var DOCKCLASSNAME = "WNDCLS_"+WScript.ScriptBaseName;
//! Элементы управления на панельке
var combo_ext	= 0;
var btn_set	= 0;
var btn_exit	= 0;
//! Идентификаторы элементов управления на панельке
var IDC_EXT	= 1000;
var IDC_SET	= 1001;
var IDC_EXIT	= 1002;

//! Взято из AkelDLL.h
var DKS_LEFT	=1
var DKS_RIGHT	=2
var DKS_TOP	=3
var DKS_BOTTOM	=4

//Dock flags
var DKF_OWNTHREAD		=0x00000001
var DKF_FIXEDSIZE		=0x00000002
var DKF_DRAGDROP		=0x00000004
var DKF_HIDDEN			=0x00000008
var DKF_NODROPLEFT		=0x00000010
var DKF_NODROPRIGHT		=0x00000020
var DKF_NODROPTOP		=0x00000040
var DKF_NODROPBOTTOM	=0x00000080

//Dock action
var DK_ADD		=0x00000001
var DK_DELETE		=0x00000002
var DK_SUBCLASS	=0x00000004
var DK_UNSUBCLASS	=0x00000008
var DK_SETLEFT		=0x00000010
var DK_SETRIGHT	=0x00000020
var DK_SETTOP		=0x00000040
var DK_SETBOTTOM	=0x00000080
var DK_HIDE		=0x00000100
var DK_SHOW		=0x00000200
var DK_FINDDOCK	=0x00000400
var DK_FINDCHILD	=0x00000800

var BIF_BITMAP		=0x001; //Bitmap handle is used in BUTTONDRAW.hImage.
var BIF_ICON		=0x002; //Icon handle is used in BUTTONDRAW.hImage.
var BIF_CROSS		=0x004; //Draw small cross 8x7. BUTTONDRAW.hImage is ignored.
var BIF_DOWNARROW	=0x008; //Draw small down arrow 7x4. BUTTONDRAW.hImage is ignored.
var BIF_ETCHED		=0x100; //Draw edge around button.
var BIF_ENABLEFOCUS	=0x200; //Draw focus rectangle when button receive focus.

var AKD_RESIZE			= WM_USER + 253;
var AKD_DOCK			= WM_USER + 254;
var AKD_SETBUTTONDRAW	= WM_USER + 255;
var AKDN_MAIN_ONFINISH	= WM_USER + 6;


var ControlH = 25;
var ComboW = 130;
//// РАБОЧИЕ ФУНКЦИИ
//! Создаёт панельку
function CreateDock()
{
	var pDock = AkelPad.MemAlloc(52/*sizeof(DOCK)*/);
	var dockside = DKS_BOTTOM;
	try
	{
		dockside = WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\SetCoderExt\\Side");
	}catch(e){}
	switch(dockside)
	{
		case DKS_BOTTOM:case DKS_TOP:break;
		default:dockside = DKS_BOTTOM;
	}
	AkelPad.MemCopy(pDock + 8, DKF_OWNTHREAD|DKF_NODROPLEFT|DKF_NODROPRIGHT|DKF_FIXEDSIZE|DKF_DRAGDROP, 3 /*DT_DWORD*/);
	AkelPad.MemCopy(pDock + 16, dockside, 3 /*DT_DWORD*/);
	g_pDock = AkelPad.SendMessage(g_hAkelPad, AKD_DOCK, DK_ADD, pDock);
	AkelPad.MemFree(pDock);
	if(g_pDock != 0)
	{
		
		g_hDockWnd = CreateWindowEx(0,DOCKCLASSNAME,DOCKCLASSNAME,WS_CHILD|WS_CLIPCHILDREN|WS_CLIPSIBLINGS,0,0,400,ControlH + 4,g_hAkelPad,0,DockWindowProc);
		if(g_hDockWnd!=0)
		{
			GetWindowRect(g_hDockWnd,g_pDock+20);
			var szL = AkelPad.MemRead(g_pDock+20, 3 /*DT_DWORD*/);
			var szT = AkelPad.MemRead(g_pDock+24, 3 /*DT_DWORD*/);
			var szR = AkelPad.MemRead(g_pDock+28, 3 /*DT_DWORD*/);
			var szB = AkelPad.MemRead(g_pDock+32, 3 /*DT_DWORD*/);
			/*rcSize={0,0,right-left,bottom-top}*/
			AkelPad.MemCopy(g_pDock+20, 0, 3 /*DT_DWORD*/);
			AkelPad.MemCopy(g_pDock+24, 0, 3 /*DT_DWORD*/);
			AkelPad.MemCopy(g_pDock+28, szR-szL, 3 /*DT_DWORD*/);
			AkelPad.MemCopy(g_pDock+32, szB-szT, 3 /*DT_DWORD*/);
			/*rcDragDrop=rcSize*/
			AkelPad.MemCopy(g_pDock+36, 0, 3 /*DT_DWORD*/);
			AkelPad.MemCopy(g_pDock+40, 0, 3 /*DT_DWORD*/);
			AkelPad.MemCopy(g_pDock+44, szR-szL, 3 /*DT_DWORD*/);
			AkelPad.MemCopy(g_pDock+48, szB-szT, 3 /*DT_DWORD*/);
			AkelPad.MemCopy(g_pDock+12, g_hDockWnd, 3 /*DT_DWORD*/);
			AkelPad.SendMessage(g_hAkelPad, AKD_DOCK, DK_SUBCLASS, g_pDock);
			AkelPad.SendMessage(g_hAkelPad, AKD_DOCK, DK_SHOW, g_pDock);
			return 1;
		}
		else
		{
			AkelPad.SendMessage(g_hAkelPad,AKD_DOCK,DK_DELETE,g_pDock);
			g_pDock = 0;
			return 0;
		}
	}
	else return 0;
}
//! Хук главного окна.
function AkelPadCallBack(hwnd,umsg,wparam,lparam)
{
	//! Нотификция о закрытии редактора
	if(umsg == AKDN_MAIN_ONFINISH)
	{
		AkelPad.SendMessage(g_hDockWnd, WM_CLOSE, 0, 0);
		while(!QuitMutext)
		{
			oSys.Call("kernel32::SwitchToThread");
		}
	}
	return 0;
}
//! Хук окна редактирования. Для перехвата Enter и Esc
function ComboSubClass(hwnd,umsg,wparam,lparam)
{
	if(umsg == WM_KEYDOWN)
	{
		var mod = GetKeyState(VK_SHIFT) && GetKeyState(VK_CONTROL) && GetKeyState(VK_MENU);
		if(! mod)
		{
			if(wparam == VK_RETURN)
			{
				AkelPad.SendMessage(g_hDockWnd, WM_COMMAND, (BN_CLICKED <<16)+IDC_SET, 0);
			}
			else if(wparam == VK_ESCAPE)
			{
				AkelPad.SendMessage(g_hDockWnd, WM_COMMAND, (BN_CLICKED <<16)+IDC_EXIT, 0);
			}
		}
	}
	else if (umsg == WM_GETDLGCODE)
	{
		return DLGC_WANTALLKEYS;
	}
}
//! Заполнить список доступных расширений
function FillCombo(hwnd, curext)
{
	//! Extension supported by Coder collected here(ini-format file)
	var txtExt = AkelPad.ReadFile(AkelPad.GetAkelDir()+"\\AkelFiles\\Plugs\\Coder\\cache");
	var lines = txtExt.split("\r\n");
	var inSection = false, l = 0;
	var cat=[];
	if(lines.length==0) return;
	for(l = 1; l<lines.length;l++)
	{
		var line = lines[l];
		var parts=line.split('=');
		if(parts.length>=2)
		{
			var exts=parts[1].split(" ");
			var each = null
			for(each in exts)
			{
				exts[each] = exts[each].replace('"','').replace('"','');
			}
			cat[parts[0]] = exts;
		}
	}
	var catname = "";
	for(catname in cat)
	{
		var catlabel = '==' + catname.toUpperCase() + '==';
		var cats = cat[catname];
		var mem = AkelPad.MemAlloc((catlabel.length+1)*_TSIZE);
		AkelPad.MemCopy(mem, catlabel, _TSTR);
		var index = AkelPad.SendMessage(hwnd, CB_ADDSTRING, 0, mem);
		if(index != -1)
		{
			AkelPad.SendMessage(hwnd, CB_SETITEMDATA, index, 0);
		}
		AkelPad.MemFree(mem);
		var exti=0;
		for(exti in cats)
		{
			var ext = cats[exti];
			mem = AkelPad.MemAlloc((ext.length+1)*_TSIZE);
			AkelPad.MemCopy(mem, ext, _TSTR);
			index = AkelPad.SendMessage(hwnd, CB_ADDSTRING, 0, mem);
			if(index != -1)
			{
				AkelPad.SendMessage(hwnd, CB_SETITEMDATA, index, 1);
			}
			AkelPad.MemFree(mem);
			if(curext == ext)
			{
				AkelPad.SendMessage(hwnd, CB_SETCURSEL, index, 0);
			}
		}
	}
}
//! Оконная процедура панельки
function DockWindowProc(hwnd, umsg, wparam,lparam)
{
	if(umsg == WM_CREATE)
	{
		var fname = AkelPad.GetEditFile(0);
		if(fname != "")
		{
			fname = fname.split('\\');
			fname = fname[fname.length-1];
			fname = fname.split('.');
			fname = fname[fname.length-1];
		}
		//! Создаем элементы управления
		combo_ext = CreateWindowEx(WS_EX_CLIENTEDGE,"COMBOBOX","",
							WS_CHILD|WS_VISIBLE|WS_BORDER|WS_CLIPCHILDREN|WS_CLIPSIBLINGS|
							CBS_DROPDOWNLIST|CBS_AUTOHSCROLL,
							10,2,ComboW,ControlH,hwnd,IDC_EXT,0);
		FillCombo(combo_ext, fname);
		btn_set = CreateWindowEx(0,"BUTTON","SET",WS_CHILD|WS_VISIBLE|BS_DEFPUSHBUTTON|WS_CLIPCHILDREN|WS_CLIPSIBLINGS,145,2,50,ControlH,hwnd,IDC_SET,0);
		btn_exit = CreateWindowEx(0,"BUTTON","EXIT",WS_CHILD|WS_VISIBLE|BS_PUSHBUTTON|WS_CLIPCHILDREN|WS_CLIPSIBLINGS|BS_OWNERDRAW,200,2,25,ControlH,hwnd,IDC_EXIT,0);
		//! Отображаем их
		ShowWindow(btn_set,SW_SHOW);UpdateWindow(btn_set);
		ShowWindow(btn_exit,SW_SHOW);UpdateWindow(btn_exit);
		ShowWindow(combo_ext,SW_SHOW);UpdateWindow(combo_ext);
		//! Рисовать кнопку закрытия
		var memBD = AkelPad.MemAlloc(16/*sizeof BUTTONDRAW*/);
		AkelPad.MemCopy(memBD+0, BIF_CROSS|BIF_ETCHED, 3 /*DT_DWORD*/);
		AkelPad.SendMessage(g_hAkelPad, AKD_SETBUTTONDRAW, btn_exit, memBD);
		AkelPad.MemFree(memBD);
		//! Фокус на строку ввода
		SetFocus(combo_ext);
		//! Сабкласим её, нужен перехват клавиш Escape и Enter
		AkelPad.WindowSubClass(combo_ext, ComboSubClass, WM_KEYDOWN, WM_GETDLGCODE);
		return 0;
	}
	else if(umsg == WM_KEYDOWN)
	{
		//! Перехват клавиш Escape и Enter на окне
		var mod = GetKeyState(VK_SHIFT) && GetKeyState(VK_CONTROL) && GetKeyState(VK_MENU);
		if(! mod)
		{
			if(wparam == VK_RETURN)
			{
				AkelPad.SendMessage(hwnd, WM_COMMAND, MAKEWPARAM(IDC_SET,BN_CLICKED), 0);
			}
			else if(wparam == VK_ESCAPE)
			{
				AkelPad.SendMessage(hwnd, WM_COMMAND, MAKEWPARAM(IDC_EXIT,BN_CLICKED), 0);
			}
		}
	}
	else if(umsg == WM_SETFOCUS)
	{
		//! Фокус на троку ввода
		SetFocus(combo_ext);
	}
	else if(umsg == WM_COMMAND)
	{
		var CODE = HIWORD(wparam);
		var IDC  = LOWORD(wparam);
		if(CODE == BN_CLICKED)
		{
			if(IDC == IDC_SET)
			{
				//! Нажата кнопка установить
				var ext = GetWindowText(combo_ext);
				if(	AkelPad.IsPluginRunning("Coder::CodeFold") ||
					AkelPad.IsPluginRunning("Coder::HighLight") ||
					AkelPad.IsPluginRunning("Coder::AutoComplete"))
				{
					AkelPad.Call("Coder::Settings",1,ext);
				}
				//AkelPad.SendMessage(hwnd,WM_CLOSE, 0, 0);
			}
			else if(IDC == IDC_EXIT)
			{
				//! Нажата кнопка выйти.
				AkelPad.SendMessage(hwnd,WM_CLOSE, 0, 0);
			}
		}
		return 0;
	}
	else if(umsg == WM_SIZE)
	{
		//! Меняем Drag&Drob область за размером панельки
		if(g_pDock)
		{
			GetWindowRect(g_hDockWnd,g_pDock+36);
			var szL = AkelPad.MemRead(g_pDock+36, 3 /*DT_DWORD*/);
			var szT = AkelPad.MemRead(g_pDock+40, 3 /*DT_DWORD*/);
			var szR = AkelPad.MemRead(g_pDock+44, 3 /*DT_DWORD*/);
			var szB = AkelPad.MemRead(g_pDock+48, 3 /*DT_DWORD*/);
			AkelPad.MemCopy(g_pDock+36, 0, 3 /*DT_DWORD*/);
			AkelPad.MemCopy(g_pDock+40, 0, 3 /*DT_DWORD*/);
			AkelPad.MemCopy(g_pDock+44, szR-szL, 3 /*DT_DWORD*/);
			AkelPad.MemCopy(g_pDock+48, szB-szT, 3 /*DT_DWORD*/);
		}
	}
	else if(umsg == WM_CLOSE)
	{
		//! Нас закрывают.
		DestroyWindow(hwnd);
		return 1;
	}
	else if(umsg == WM_DESTROY)
	{
		//! Закрыли нас. 
		try
		{
			WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\SetCoderExt\\Side",
					AkelPad.MemRead(g_pDock+16, 3 /*DT_DWORD*/),"REG_DWORD");
		}catch(e){}
		AkelPad.SendMessage(g_hAkelPad,AKD_DOCK,DK_UNSUBCLASS,g_pDock);
		AkelPad.SendMessage(g_hAkelPad,AKD_DOCK,DK_DELETE,g_pDock);
		g_pDock = 0;
		AkelPad.SendMessage(g_hAkelPad, AKD_RESIZE, 0, 0);
		//! Убрать сабкласинг
		AkelPad.WindowUnsubClass(combo_ext);
		g_hDockWnd = 0;
		//! Выйти из цикла
		PostQuitMessage(0);
		return 0;
	}
	//return DefWindowProc(hwnd,umsg,wparam,lparam);
	return 0;
}
//! Проверка на однократный запуск скриптам
//! Используется вместе с AkelPad.ScriptNoMutex();
//! Типичное использование:
//! 1. При первом запуске скрипта, скрипт должен создать в системе объект с помощью которого можно
//!    будет с ним связаться, например окно(видимое или невидимое), объект синхронизации(событие),
//!    именованный канал, сокетом или прочее.
//! 2. Функция FirstInstance должна проверить наличие этого объекта(найти окно, открыть объект
//!    синхронизации, соединиться с каналом или сокетом).
//! 3. По желанию программиста(по заданию), функция может сразу попытаться прервать работу первого скрипта
//!    (как это сделано в этом примере)либо вернуть идентификатор объекта, через который будет осуществляться управление
//! 4. При отсутствии такого объекта(первый запуск), скрипт инициализируется, потом должен создать связной объект,
//!    и приготовившись взаимодействовать с ним, делает вызов AkelPad.ScriptNoMutex() которые и даст работать
//!    другим скриптам(в том числе второму экземпляру). После успешного вызова скрипт может делать свою фоновую
//!    задачу или просто ждать внешней команды.
//!
//!    В этом примере:
//!     1. Скрипт регистрирует оконный класс и создает окно(который и служит объектом взаимодействия)
//!     2. В случае успеха вызывается AkelPad.ScriptNoMutex(), иначе - завершение
//!     3. Пользователь взаимодействует с окном, и закрыв его завершает скрипт
//!     4. При повторном вызове, скрипт находит окно, и закрывает его(в следствии чего и завершается первый скрипт),
//!        после чего завершается сам.
//!
//! ВАЖНО: такой фоновый скрипт разрешает полное взаимодействие с окнами редактора, потому для корректной работы
//! скрипа должен уметь определять момент когда ему нужно завершится досрочно(например, при закрытии редактора,
//! при закрытии рабочего окна, при выключении зависимых плагинов)
function FirstInstance()
{
	var dock = FindWindowEx(g_hAkelPad,DOCKCLASSNAME);
	if(dock)
	{
		AkelPad.SendMessage(dock, WM_CLOSE, 0, 0);
		return false;
	}
	else
		return true;
}

if(FirstInstance())
{
	//! Регистрируем класс окна
	var res = AkelPad.WindowRegisterClass(DOCKCLASSNAME);
	
	//! Создаем панельку
	if(CreateDock())
	{
		//! Сабкласим главное окно
		if(AkelPad.WindowSubClass(g_hAkelPad, AkelPadCallBack,AKDN_MAIN_ONFINISH))
		{
			//! Мы инициализировались, можно дать работать другим скриптам
			AkelPad.ScriptNoMutex();
			//! Поток в цикл сообщений
			AkelPad.WindowGetMessage();
			//! Вышли(только по закрытии панельки)
			AkelPad.WindowUnsubClass(g_hAkelPad);
			//! Сняли хук
		}
		if(g_hDockWnd != 0)
		{
			//AkelPad.MessageBox(0, "Text", "Caption", 0 /*MB_OK*/);
			//! По идее сюда не попадем
			AkelPad.SendMessage(g_hDockWnd, WM_CLOSE, 0, 0);
			g_hDockWnd = 0;
		}
	}
	//! Класс долой
	AkelPad.WindowUnregisterClass(DOCKCLASSNAME);
	//! Вернуть фокус
	SetFocus(g_hAkelPad);
	//! Взводим флаг разрешения выхода из скрипта.
	QuitMutext = true;
}
///// UTILITY
///// HELPERS: функции для упрощения системных вызовов
//! Поиск окна в пределах рабочего стола по родителю и имени класса
function FindWindowEx(hwndParent,lpszClassName)
{
	var memclass =0;
	var t = "" + lpszClassName;
	memclass = AkelPad.MemAlloc((t.length+1)*_TSIZE);
	AkelPad.MemCopy(memclass, t, _TSTR);
	var hwnd = oSys.Call("user32::FindWindowEx"+_TCHAR, hwndParent,0,memclass,0);
	AkelPad.MemFree(memclass);
	return hwnd;
}
//! Создаёт окно
function CreateWindowEx(styleex,_class,title,style,x,y,cx,cy,parent,menu,lparam)
{
	//! Нативные строки
	var mem_class = AkelPad.MemAlloc((_class.length+1)*_TSIZE);
	AkelPad.MemCopy(mem_class, _class, _TSTR);
	var mem_title = AkelPad.MemAlloc((title.length+1)*_TSIZE);
	AkelPad.MemCopy(mem_title, title, _TSTR);
	var hwnd = oSys.Call("user32::CreateWindowEx" + _TCHAR,
							styleex,				//! Расширенный стиль
							mem_class,			//! Класс окна
							mem_title,			//! Заголовок окна
							style,				//! Стиль окна
							x,y,cx,cy,			//! Координаты и размер
							parent, menu,			//! Родитель и меню(идентификатор)
							g_hModuleDll,			//! принадлежность коду
							lparam);				//! Доп. параметр
	//! Освободить память
	AkelPad.MemFree(mem_class);
	AkelPad.MemFree(mem_title);
	return hwnd;
}
//! Показать окно, SW_* константы
function ShowWindow(hwnd,how)
{
	return oSys.Call("user32::ShowWindow",hwnd,how);
}
//! Обновить окно
function UpdateWindow(hwnd)
{
	return oSys.Call("user32::UpdateWindow",hwnd);
}
//! Выйти из оконного цикла
function PostQuitMessage(code)
{
	return oSys.Call("user32::PostQuitMessage",code);
}
//! Уничтожить окно
function DestroyWindow(hwnd)
{
	return oSys.Call("user32::DestroyWindow",hwnd);
}
//! Получить размер окна
function GetWindowRect(hwnd,rc)
{
	return oSys.Call("user32::GetWindowRect",hwnd,rc);
}
//! Дать фокус
function SetFocus(hwnd)
{
	return oSys.Call("user32::SetFocus",hwnd);
}
//! Получить текст окна
function GetWindowText(hwnd)
{
	//! Получить размер текста
	var res = AkelPad.SendMessage(hwnd, WM_GETTEXTLENGTH, 0, 0);
	//! Выделить память
	var mem = AkelPad.MemAlloc((res+2)*_TSIZE);
	//! Полчиуть текст
	AkelPad.SendMessage(hwnd, WM_GETTEXT,res+1, mem);
	var str = AkelPad.MemRead(mem, _TSTR);
	//! Освободить память
	AkelPad.MemFree(mem);
	return str;
}
//! Получить состояние кнопки
function GetKeyState(key)
{
	return oSys.Call("user32::GetKeyState",key);
}
//! LOWORD
function LOWORD(long)
{
	return long & 0x0FFFF;
}
//! HIWORD
function HIWORD(long)
{
	return (long >> 16) & 0x0FFFF;
}
//! MAKEWPARAM
function MAKEWPARAM(l, h)
{
	return MAKELONG(l, h);
}
//! MAKELONG
function MAKELONG(l, h)
{
	return (l & 0x0FFFF) + ((h & 0x0FFFF) << 16);
}
///// UNUSED HELPERS, STILL CAN BE USEFUL IN FUTURE
//! Системная оконная процедура 
////function DefWindowProc(hwnd,umsg,wparam,lparam)
////{
////	return oSys.Call("user32::DefWindowProc"+_TSTR,hwnd,umsg,wparam,lparam);
////}
//! Получить контекст рисования
////function BeginPaint(hwnd,ps)
////{
////	return oSys.Call("user32::BeginPaint",hwnd,ps);
////}
//! Закончить рисование
////function EndPaint(hwnd,ps)
////{
////	return oSys.Call("user32::EndPaint",hwnd,ps);
////}
//! Перерисовать область окна
////function InvalidateRect(hwnd,rect,erase)
////{
////	return oSys.Call("user32::InvalidateRect",hwnd,rect,erase);
////}
/*****************************************************
	Manuals
*****************************************************/
/***
	typedef struct _DOCK {
0	struct _DOCK *next;
4	struct _DOCK *prev;
8	DWORD dwFlags;			//Dock flags: see DKF_* defines.
12	HWND hWnd;			//Dock window handle.
16	int nSide;			//Dock side: DKS_LEFT, DKS_TOP, DKS_RIGHT or DKS_BOTTOM.
20	RECT rcSize;			//Dock window client RECT.
20	.left
24	.top
28	.right
32	.bottom
36	RECT rcDragDrop;		//Drag-and-drop client RECT.
36	.left
40	.top
44	.right
48	.bottom
	} DOCK;
***/

