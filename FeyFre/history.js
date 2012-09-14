// === Closed document history collector ===
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=16205#16205
// http://staynormal.org.ua/akelpad/scripts/history.js
// FeyFre (c) 2011-2012
// v0.11 (2012.09.14) Persistent storage UI option
// v0.10.1 (2012.09.14) Sync with AkelPad API
// v0.10 Dock anywhere + SmartRun
// v0.9 Filtering
// v0.8.2 3.12
// v0.8.1 3.12
// v0.8 Persist history
// v0.7 Internal reforge
// v0.6 Added hidden mode: hotkey+button
// v0.5.2
// v0.5.1
// v0.5 Reopen by keyboard. Hotkeys editing.
// v0.4 Set standart system font. No autofocus on dockbar creation(it useless anyway now). Manual hotkey setup.
// v0.3 Added hotkeys: ALT+Z, CTRL+SHIFT+ALT+Z - single and whole reopen.
// v0.2 Some fixes, optimisations. Persistent settings.
// v0.1 Initial public release
//
// Example:
//	Call("Scripts::Main", 1, "History.js")
//
//	SmartRun Call
//	Call("Scripts::Main", 1, "History.js","sr")
//		Run if absent
//		Show if hidden
//		Close if visible
//
//	Autostart it.
//	AkelPad.ini or registry key CmdLineBegin append /Call("Scripts::Main", 1, "History.js")
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
var oSet=AkelPad.ScriptSettings()
//! Shell
//var WshShell=new ActiveXObject("WScript.shell");

//! Константы используемые системными вызовами
AkelPad.Include("win32\\user32.js");
AkelPad.Include("win32\\comctl32.js");

//! Панелька
var g_pDock = 0;
//! Окно панельки
var g_hDockWnd = 0;
//! Класс окна панельки
var DOCKCLASSNAME = "WNDCLS_"+WScript.ScriptBaseName;
//! Для удобства
var lb_hist			= 0;

var HK_CallBackAddr	= 0;
var func_opentop	= 0;
var func_openall	= 0;
var func_showhide	= 0;

//! Settings
var _W = 0;
var _H = 0;
var _BS = 0;
var _GAP = 0;
var _SIDE = 0;
var _ELSE = 0;
var _FULLDND = 0;
var _HK_RT = 0;
var _HK_RA = 0;
var _HK_SH = 0;
var _HIDE = 0;
var _PERSIST = 0;
var _FILTER = "";
var _APPLY = 0;

//! Идентификаторы элементов управления на панельке
var IDC_DNDST	= 1000;
var IDC_HIDE	= 1001
var IDC_EXIT	= 1002;
var IDC_FILT	= 1003;
var IDC_APPLY	= 1004;
var IDC_HIST	= 1005;
var IDC_HKT		= 1006;
var IDC_HKA		= 1007;
var IDC_HKSH	= 1008;
var IDC_HKBT	= 1009;
var IDC_HKBA	= 1010;
var IDC_HKBSH	= 1011;
var IDC_SMARTRUN= 1012;
var IDC_PERSIST = 1013;
var layout = {};
layout[IDC_DNDST]  ={sf:1,c:"STATIC",    t:"History",            wse:0,ws:WS_CHILD|WS_VISIBLE|SS_SUNKEN|SS_CENTER,hwnd:0,
                   x:{W:0,H:0,G:1,B:0},  y:{W:0,H:0,G:1,B:0},  w:{W:1,H:0,G:-4,B:-2},h:{W:0,H:0,G:0,B:1}};
layout[IDC_HIDE]   ={sf:0,c:"BUTTON",    t:"",                   wse:0,ws:WS_CHILD|WS_VISIBLE|WS_TABSTOP|BS_PUSHBUTTON|BS_OWNERDRAW,hwnd:0,
                   x:{W:1,H:0,G:-2,B:-2},y:{W:0,H:0,G:1,B:0},  w:{W:0,H:0,G:0,B:1},  h:{W:0,H:0,G:0,B:1}};
layout[IDC_EXIT]   ={sf:0,c:"BUTTON",    t:"",                   wse:0,ws:WS_CHILD|WS_VISIBLE|WS_TABSTOP|BS_PUSHBUTTON|BS_OWNERDRAW,hwnd:0,
                   x:{W:1,H:0,G:-1,B:-1},y:{W:0,H:0,G:1,B:0},  w:{W:0,H:0,G:0,B:1},  h:{W:0,H:0,G:0,B:1}};
layout[IDC_FILT]   ={sf:1,c:"EDIT",      t:"",                   wse:WS_EX_CLIENTEDGE,ws:WS_CHILD|WS_VISIBLE|WS_TABSTOP,hwnd:0,
                   x:{W:0,H:0,G:1,B:0},  y:{W:0,H:0,G:2,B:1},  w:{W:1,H:0,G:-3,B:-1},h:{W:0,H:0,G:0,B:1}};
layout[IDC_APPLY]  ={sf:0,c:"BUTTON",    t:"",                   wse:0,ws:WS_CHILD|WS_VISIBLE|WS_TABSTOP|BS_AUTOCHECKBOX|BS_PUSHLIKE,hwnd:0,
                   x:{W:1,H:0,G:-1,B:-1},y:{W:0,H:0,G:2,B:1},  w:{W:0,H:0,G:0,B:1},  h:{W:0,H:0,G:0,B:1}};
layout[IDC_HIST]   ={sf:1,c:"LISTBOX",   t:"",                   wse:0,ws:WS_CHILD|WS_VISIBLE|LBS_NOINTEGRALHEIGHT|WS_VSCROLL|WS_HSCROLL|LBS_NOTIFY|WS_TABSTOP,hwnd:0,
                   x:{W:0,H:0,G:1,B:0},  y:{W:0,H:0,G:3,B:2},  w:{W:1,H:0,G:-2,B:0}, h:{W:0,H:1,G:-8,B:-6}};
layout[IDC_PERSIST]={sf:1,c:"BUTTON",    t:"Persistent storage", wse:0,ws:WS_CHILD|WS_VISIBLE|WS_TABSTOP|BS_AUTOCHECKBOX,hwnd:0,
                   x:{W:0,H:0,G:1,B:0},  y:{W:0,H:1,G:-4,B:-4},w:{W:1,H:0,G:-2,B:0},  h:{W:0,H:0,G:0,B:1}};
layout[IDC_HKT]    ={sf:1,c:HOTKEY_CLASS,t:"",                   wse:0,ws:WS_CHILD|WS_VISIBLE|WS_TABSTOP,hwnd:0,
                   x:{W:0,H:0,G:1,B:0},  y:{W:0,H:1,G:-3,B:-3},w:{W:1,H:0,G:-2,B:-1},h:{W:0,H:0,G:0,B:1}};
layout[IDC_HKBT]   ={sf:0,c:"BUTTON",    t:"",                   wse:0,ws:WS_CHILD|WS_VISIBLE|WS_TABSTOP|BS_PUSHBUTTON,hwnd:0,
                   x:{W:1,H:0,G:-1,B:-1},y:{W:0,H:1,G:-3,B:-3},w:{W:0,H:0,G:0,B:1},  h:{W:0,H:0,G:0,B:1}};
layout[IDC_HKA]    ={sf:1,c:HOTKEY_CLASS,t:"",                   wse:0,ws:WS_CHILD|WS_VISIBLE|WS_TABSTOP,hwnd:0,
                   x:{W:0,H:0,G:1,B:0},  y:{W:0,H:1,G:-2,B:-2},w:{W:1,H:0,G:-2,B:-1},h:{W:0,H:0,G:0,B:1}};
layout[IDC_HKBA]   ={sf:0,c:"BUTTON",    t:"",                   wse:0,ws:WS_CHILD|WS_VISIBLE|WS_TABSTOP|BS_PUSHBUTTON,hwnd:0,
                   x:{W:1,H:0,G:-1,B:-1},y:{W:0,H:1,G:-2,B:-2},w:{W:0,H:0,G:0,B:1},  h:{W:0,H:0,G:0,B:1}};
layout[IDC_HKSH]   ={sf:1,c:HOTKEY_CLASS,t:"",                   wse:0,ws:WS_CHILD|WS_VISIBLE|WS_TABSTOP,hwnd:0,
                   x:{W:0,H:0,G:1,B:0},  y:{W:0,H:1,G:-1,B:-1},w:{W:1,H:0,G:-2,B:-1},h:{W:0,H:0,G:0,B:1}};
layout[IDC_HKBSH]  ={sf:0,c:"BUTTON",    t:"",                   wse:0,ws:WS_CHILD|WS_VISIBLE|WS_TABSTOP|BS_PUSHBUTTON,hwnd:0,
                   x:{W:1,H:0,G:-1,B:-1},y:{W:0,H:1,G:-1,B:-1},w:{W:0,H:0,G:0,B:1},  h:{W:0,H:0,G:0,B:1}};
//! Названия функций
var rott = "Reopen Last";
var rota = "Reopen All";
var showhide = "Show/Hide";
//! Хранилище истории
var history		= HList();
var CBC_OPENTOP = 0;
var CBC_OPENALL = 1;
var CBC_SHOWHIDE = 2;

//! Взято из AkelDLL.h
var DKS_LEFT	=1
var DKS_RIGHT	=2
var DKS_TOP		=3
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
var DK_ADD			=0x00000001
var DK_DELETE		=0x00000002
var DK_SUBCLASS		=0x00000004
var DK_UNSUBCLASS	=0x00000008
var DK_SETLEFT		=0x00000010
var DK_SETRIGHT		=0x00000020
var DK_SETTOP		=0x00000040
var DK_SETBOTTOM	=0x00000080
var DK_HIDE			=0x00000100
var DK_SHOW			=0x00000200
var DK_FINDDOCK		=0x00000400
var DK_FINDCHILD	=0x00000800

var BIF_BITMAP		=0x001; //Bitmap handle is used in BUTTONDRAW.hImage.
var BIF_ICON		=0x002; //Icon handle is used in BUTTONDRAW.hImage.
var BIF_CROSS		=0x004; //Draw small cross 8x7. BUTTONDRAW.hImage is ignored.
var BIF_DOWNARROW	=0x008; //Draw small down arrow 7x4. BUTTONDRAW.hImage is ignored.
var BIF_ETCHED		=0x100; //Draw edge around button.
var BIF_ENABLEFOCUS	=0x200; //Draw focus rectangle when button receive focus.

var DT_ANSI    = 0;
var DT_UNICODE = 1;
var DT_QWORD   = 2;
var DT_DWORD   = 3;
var DT_WORD    = 4;
var DT_BYTE    = 5;

var PO_DWORD  = 1;
var PO_BIANRY = 2;
var PO_STRING = 3;

var AKD_RESIZE			= WM_USER + 253;
var AKD_DOCK			= WM_USER + 254;
var AKD_SETBUTTONDRAW	= WM_USER + 255;
var AKD_DLLADD			= WM_USER + 308;
var AKD_DLLDELETE		= WM_USER + 311;
var AKDN_MAIN_ONFINISH	= WM_USER + 6;
var AKDN_FRAME_DESTROY	= WM_USER + 24;
var AKDN_OPENDOCUMENT_FINISH = WM_USER + 54;
var AKD_GETEDITINFO		= WM_USER + 200;
var EOD_SUCCESS			= 0;
var sizeof_EDITINFO		= _X64?160:80;
//// РАБОЧИЕ ФУНКЦИИ
//! Создаёт панельку
function CreateDock()
{
	var pDock = AkelPad.MemAlloc(52/*sizeof(DOCK)*/);
	switch(_SIDE)
	{
		case DKS_LEFT:case DKS_RIGHT:
		case DKS_TOP:case DKS_BOTTOM:break;
		default:_SIDE = DKS_RIGHT;WRITE_SETTINGS();break;
	}
	AkelPad.MemCopy(pDock + 8, DKF_OWNTHREAD|DKF_DRAGDROP, DT_DWORD);
	AkelPad.MemCopy(pDock + 16, _SIDE, DT_DWORD);
	g_pDock = AkelPad.SendMessage(g_hAkelPad, AKD_DOCK, DK_ADD, pDock);
	AkelPad.MemFree(pDock);
	if(g_pDock != 0)
	{
		
		g_hDockWnd = CreateWindowEx(0,DOCKCLASSNAME,DOCKCLASSNAME,WS_CHILD|WS_CLIPCHILDREN,0,0,_W,_H,g_hAkelPad,0,DockWindowProc);
		if(g_hDockWnd!=0)
		{
			GetWindowRect(g_hDockWnd,g_pDock+20);
			var szL = AkelPad.MemRead(g_pDock+20, DT_DWORD);
			var szT = AkelPad.MemRead(g_pDock+24, DT_DWORD);
			var szR = AkelPad.MemRead(g_pDock+28, DT_DWORD);
			var szB = AkelPad.MemRead(g_pDock+32, DT_DWORD);
			//rcSize={0,0,right-left,bottom-top}
			AkelPad.MemCopy(g_pDock+20, 0, DT_DWORD);
			AkelPad.MemCopy(g_pDock+24, 0, DT_DWORD);
			AkelPad.MemCopy(g_pDock+28, szR-szL, DT_DWORD);
			AkelPad.MemCopy(g_pDock+32, szB-szT, DT_DWORD);
			/*rcDragDrop=rcSize*/
			AkelPad.MemCopy(g_pDock+36, 0, DT_DWORD);
			AkelPad.MemCopy(g_pDock+40, 0, DT_DWORD);
			AkelPad.MemCopy(g_pDock+44, szR-szL, DT_DWORD);
			AkelPad.MemCopy(g_pDock+48, szB-szT, DT_DWORD);
			AkelPad.MemCopy(g_pDock+12, g_hDockWnd, DT_DWORD);
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
	//! Закладку закрыли
	if(umsg == AKDN_FRAME_DESTROY)
	{
		var addr = AkelPad.MemRead(lparam+5*(_X64?8:4), DT_QWORD);
		if(addr)
		{
			var string = AkelPad.MemRead(addr, _TSTR);
			if(string && string.length>0)
			{
				var name = string.split("\\");
				name = name[name.length-1];
				var regex = new RegExp(QuoteFilter(_FILTER),"ig");
				var newid = history.InsertTop(string);
				if(!_APPLY || _FILTER.length==0 || regex.test(name))
				{
					var na = AkelPad.MemAlloc((name.length+1)*_TSIZE);
					AkelPad.MemCopy(na, name, _TSTR);
					if(oSys.Call("user32::IsWindow", lb_hist))
					{
						var ind = AkelPad.SendMessage(lb_hist,LB_INSERTSTRING, 0, na);
						AkelPad.SendMessage(lb_hist, LB_SETITEMDATA, ind, newid);
					}
					AkelPad.MemFree(na);
				}
			}
		}
	}
	//! Открыли документ. Нужно его убрать из списка закрытых, если есть такой
	if(umsg == AKDN_OPENDOCUMENT_FINISH && lparam == EOD_SUCCESS)
	{
		var ei = AkelPad.MemAlloc(sizeof_EDITINFO);
		AkelPad.SendMessage(g_hAkelPad, AKD_GETEDITINFO, wparam, ei);
		var addr = AkelPad.MemRead(ei + 2*(_X64?8:4), DT_QWORD);
		var file = AkelPad.MemRead(addr, _TSTR);
		AkelPad.MemFree(ei);
		var i =0;
		file = file.toLowerCase();
		var ids = [];
		history.IterateTop(function(p,id,val)
		{
			var t = val.toLowerCase();
			if(t == file)
			{
				ids.push(id);
			}
			return true;
		},0);
		var cnt = AkelPad.SendMessage(lb_hist, LB_GETCOUNT, 0, 0);
		var ci = cnt-1;
		while(ci >= 0)
		{
			var del = false;
			var id = AkelPad.SendMessage(lb_hist, LB_GETITEMDATA, ci, 0);
			var i = 0;
			for(; i<ids.length;i++)
			{
				if(id == ids[i])
				{
					del = true;
					break;
				}
			}
			if(del)
			{
				AkelPad.SendMessage(lb_hist, LB_DELETESTRING, ci, 0);
			}
			ci--;
		}
	}
	return 0;
}
//! События в списке
function ListSubClass(hwnd,umsg,wparam,lparam)
{
	if(umsg == WM_KEYDOWN)
	{
		var mod = GetKeyState(VK_SHIFT) && GetKeyState(VK_CONTROL) && GetKeyState(VK_MENU);
		if(! mod)
		{
			//! Нажали на в списке - открыть его
			if(wparam == VK_RETURN || wparam == VK_SPACE)
			{
				var ind = AkelPad.SendMessage(lb_hist, LB_GETCURSEL, 0, 0);
				if(ind != LB_ERR)
				{
					var id = AkelPad.SendMessage(lb_hist,LB_GETITEMDATA, ind, 0);
					AkelPad.SendMessage(lb_hist, LB_DELETESTRING, ind, 0);
					DoReopen(id);
				}
				return 1;
			}
		}
	}
	else if (umsg == WM_GETDLGCODE)
	{
		//! Да, мы хотим обрабатывать все нажатия клавиш
		return DLGC_WANTALLKEYS;
	}
	return 0;
}
//! Оконная процедура панельки
function DockWindowProc(hwnd, umsg, wparam,lparam)
{
	//! Панельку создают
	if(umsg == WM_CREATE)
	{
		var font = oSys.Call("gdi32::GetStockObject", 17);
		//! Создать все контролы
		var wia = [IDC_DNDST,IDC_HIDE,IDC_EXIT,IDC_FILT,IDC_APPLY,IDC_HIST,IDC_PERSIST,IDC_HKT,IDC_HKA,IDC_HKSH,IDC_HKBT,IDC_HKBA,IDC_HKBSH];
		for(var ci in wia)
		{
			var id = wia[ci];
			var pos = GetControlPos(_W,_H,id);
			var lay = layout[id];
			layout[id].hwnd = CreateWindowEx(lay.wse,lay.c,lay.t,lay.ws,pos.x,pos.y,pos.w,pos.h,hwnd,id,0);
			if(lay.sf)
			{
				AkelPad.SendMessage(layout[id].hwnd, WM_SETFONT, font, 1);
			}
			ShowWindow(layout[id].hwnd,SW_SHOW);
			UpdateWindow(layout[id].hwnd);
		}
		lb_hist = layout[IDC_HIST].hwnd;
		//! Настройка агрегатора горячих клавиш
		AkelPad.SendMessage(layout[IDC_HKT].hwnd,HKM_SETRULES,0, HOTKEYF_ALT|HOTKEYF_CONTROL|HOTKEYF_SHIFT);
		AkelPad.SendMessage(layout[IDC_HKA].hwnd,HKM_SETRULES,0, HOTKEYF_ALT|HOTKEYF_CONTROL|HOTKEYF_SHIFT);
		AkelPad.SendMessage(layout[IDC_HKSH].hwnd,HKM_SETRULES,0, HOTKEYF_ALT|HOTKEYF_CONTROL|HOTKEYF_SHIFT);
		AkelPad.SendMessage(layout[IDC_HKT].hwnd,HKM_SETHOTKEY,_HK_RT, 0);
		AkelPad.SendMessage(layout[IDC_HKA].hwnd,HKM_SETHOTKEY,_HK_RA, 0);
		AkelPad.SendMessage(layout[IDC_HKSH].hwnd,HKM_SETHOTKEY,_HK_SH, 0);
		//! Рисовать кнопку закрытия
		var memBD = AkelPad.MemAlloc(16/*sizeof BUTTONDRAW*/);
		AkelPad.MemCopy(memBD+0, BIF_CROSS|BIF_ETCHED, DT_DWORD);
		AkelPad.SendMessage(g_hAkelPad, AKD_SETBUTTONDRAW, layout[IDC_EXIT].hwnd, memBD);
		AkelPad.MemCopy(memBD+0, BIF_DOWNARROW|BIF_ETCHED, DT_DWORD);
		AkelPad.SendMessage(g_hAkelPad, AKD_SETBUTTONDRAW, layout[IDC_HIDE].hwnd, memBD);
		AkelPad.MemFree(memBD);
		//! Сабкласим список, нужен перехват клавиш VK_RETURN и VK_SPACE
		AkelPad.WindowSubClass(lb_hist, ListSubClass, WM_KEYDOWN, WM_GETDLGCODE);
		AkelPad.SendMessage(layout[IDC_APPLY].hwnd, BM_SETCHECK, _APPLY?BST_CHECKED:BST_UNCHECKED, 0);
		AkelPad.SendMessage(layout[IDC_PERSIST].hwnd, BM_SETCHECK, _PERSIST?BST_CHECKED:BST_UNCHECKED, 0);
		ReApplyFilter();
		return 0;
	}
	else if(umsg == WM_KEYDOWN)
	{
		//! Перехват клавиш Escape на окне
		var mod = GetKeyState(VK_SHIFT) && GetKeyState(VK_CONTROL) && GetKeyState(VK_MENU);
		if(! mod)
		{
			if(wparam == VK_ESCAPE)
			{
				AkelPad.SendMessage(hwnd, WM_COMMAND, MAKEWPARAM(IDC_EXIT,BN_CLICKED), 0);
			}
		}
	}
	else if(umsg == WM_SETFOCUS)
	{
		//! Фокус на список
		SetFocus(lb_hist);
	}
	else if(umsg == WM_COMMAND)
	{
		var CODE = HIWORD(wparam);
		var IDC  = LOWORD(wparam);
		if(CODE == BN_CLICKED)
		{
			if(IDC == IDC_SMARTRUN)
			{
				//! SmartRun
				//! Show if hidden
				//! Close if visible
				IDC = (_HIDE)?IDC_HIDE:IDC_EXIT;
			}
			if(IDC == IDC_EXIT)
			{
				//! Нажата кнопка выйти.
				AkelPad.SendMessage(hwnd,WM_CLOSE, 0, 0);
			}
			if(IDC == IDC_HIDE)
			{
				if(_HIDE==0)
				{
					AkelPad.SendMessage(g_hAkelPad, AKD_DOCK, DK_HIDE, g_pDock);
					_HIDE = 1;
				}
				else
				{
					AkelPad.SendMessage(g_hAkelPad, AKD_DOCK, DK_SHOW, g_pDock);
					_HIDE = 0;
				}
				WRITE_SETTINGS();
			}
			if(IDC == IDC_HKBT)
			{
				//! Применить новую гор.кл. открыть последнее
				var r = AkelPad.SendMessage(layout[IDC_HKT].hwnd , HKM_GETHOTKEY, 0, 0);
				//! Только если изменилось
				if(r != _HK_RT)
				{
					//! Запомнить
					_HK_RT = r;
					//! Удалить старую
					DelFunction(func_opentop);
					//! Сделать новую
					func_opentop = AddFunction(rott,_HK_RT,HK_CallBackAddr,CBC_OPENTOP);
					//! Сохранить
					WRITE_SETTINGS();
				}
			}
			if(IDC == IDC_HKBA)
			{
				//! Применить новую гор.кл. открыть все
				var r = AkelPad.SendMessage(layout[IDC_HKA].hwnd, HKM_GETHOTKEY, 0, 0);
				if(r != _HK_RA)
				{
					//! Запомнить
					_HK_RA = r;
					//! Удалить старую
					DelFunction(func_openall);
					//! Сделать новую
					func_openall = AddFunction(rota,_HK_RA,HK_CallBackAddr,CBC_OPENALL);
					//! Сохранить
					WRITE_SETTINGS();
				}
			}
			if(IDC == IDC_HKBSH)
			{
				//! Применить новую гор.кл. открыть все
				var r = AkelPad.SendMessage(layout[IDC_HKSH].hwnd, HKM_GETHOTKEY, 0, 0);
				if(r != _HK_SH)
				{
					//! Запомнить
					_HK_SH = r;
					//! Удалить старую
					DelFunction(func_showhide);
					//! Сделать новую
					func_showhide = AddFunction(showhide,_HK_SH,HK_CallBackAddr,CBC_SHOWHIDE);
					//! Сохранить
					WRITE_SETTINGS();
				}
			}
			if(IDC == IDC_APPLY)
			{
				_APPLY = (AkelPad.SendMessage(layout[IDC_APPLY].hwnd, BM_GETCHECK, 0, 0)==BST_CHECKED)?1:0;
				ReApplyFilter();
			}
			if(IDC == IDC_PERSIST)
			{
				_PERSIST = (AkelPad.SendMessage(layout[IDC_PERSIST].hwnd, BM_GETCHECK, 0, 0)==BST_CHECKED)?1:0;
				WRITE_SETTINGS();
			}
		}
		if(CODE == LBN_DBLCLK)
		{
			//! Двойной клик на списке
			if(IDC == IDC_HIST)
			{
				var ind = AkelPad.SendMessage(lb_hist, LB_GETCURSEL, 0, 0);
				//! По чем кликнули
				if(ind != LB_ERR)
				{
					var id = AkelPad.SendMessage(lb_hist, LB_GETITEMDATA, ind, 0);
					AkelPad.SendMessage(lb_hist, LB_DELETESTRING, ind, 0);
					//! Переоткрыть это
					DoReopen(id);
				}
			}
		}
		if(CODE == EN_CHANGE)
		{
			if(IDC == IDC_FILT)
			{
				if(_APPLY)
				{
					var was = _FILTER.toLowerCase();
					var len = 1+AkelPad.SendMessage(layout[IDC_FILT].hwnd, WM_GETTEXTLENGTH, 0, 0);
					var pflt = AkelPad.MemAlloc(len*_TSIZE);
					AkelPad.MemCopy(pflt, 0, (_TSIZE==1)?DT_BYTE:DT_WORD);
					AkelPad.SendMessage(layout[IDC_FILT].hwnd, WM_GETTEXT, len, pflt);
					_FILTER = AkelPad.MemRead(pflt, _TSTR);
					AkelPad.MemFree(pflt);
					if(was != _FILTER.toLowerCase())
					{
						ReApplyFilter();
					}
				}
			}
		}
		return 0;
	}
	else if(umsg == WM_SIZE)
	{
		//! Меняем Drag&Drob область за размером панельки
		if(g_pDock)
		{
//			GetWindowRect(g_hDockWnd,g_pDock+36);
//			var szL = AkelPad.MemRead(g_pDock+36, DT_DWORD);
//			var szT = AkelPad.MemRead(g_pDock+40, DT_DWORD);
//			var szR = AkelPad.MemRead(g_pDock+44, DT_DWORD);
//			var szB = AkelPad.MemRead(g_pDock+48, DT_DWORD);
//			_H = szB-szT;
//			_W = szR-szL;
			_H=HIWORD(lparam);
			_W=LOWORD(lparam);
			//! Взять положение надписи
			var pos = GetControlPos(_W,_H,IDC_DNDST);
			if(_FULLDND)
			{
				//! Если тягаем за всю панельку
				AkelPad.MemCopy(g_pDock+36, 0, DT_DWORD);
				AkelPad.MemCopy(g_pDock+40, 0, DT_DWORD);
				AkelPad.MemCopy(g_pDock+44, _W, DT_DWORD);
				AkelPad.MemCopy(g_pDock+48, _H, DT_DWORD);
			}
			else
			{
				//! Если тягаем только за надпись
				AkelPad.MemCopy(g_pDock+36, pos.x, DT_DWORD);
				AkelPad.MemCopy(g_pDock+40, pos.y, DT_DWORD);
				AkelPad.MemCopy(g_pDock+44, pos.x+pos.w, DT_DWORD);
				AkelPad.MemCopy(g_pDock+48, pos.y+pos.h, DT_DWORD);
			}
			//! Запомним новое состояние
			WRITE_SETTINGS();
			//! Переразместим контролы
			for(var ci in layout)
			{
				pos = GetControlPos(_W,_H,ci);
				MoveWindow(layout[ci].hwnd, pos.x, pos.y, pos.w, pos.h, 0);
			}
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
		_SIDE = AkelPad.MemRead(g_pDock+16, DT_DWORD);
		WRITE_SETTINGS();
		AkelPad.SendMessage(g_hAkelPad,AKD_DOCK,DK_UNSUBCLASS,g_pDock);
		AkelPad.SendMessage(g_hAkelPad,AKD_DOCK,DK_DELETE,g_pDock);
		g_pDock = 0;
		AkelPad.SendMessage(g_hAkelPad, AKD_RESIZE, 0, 0);
		g_hDockWnd = 0;
		//! Отпускаем список
		AkelPad.WindowUnsubClass(lb_hist);
		//! Выйти из цикла
		PostQuitMessage(0);
		return 0;
	}
	return 0;
}
function ReApplyFilter()
{
	var regex = new RegExp(QuoteFilter(_FILTER),"gi");
	AkelPad.SendMessage(lb_hist, LB_RESETCONTENT, 0, 0);
	history.IterateBottom(function(patam,id,val)
	{
		var name = val.split("\\");
		if(name.length>0)
		{
			var name = name[name.length-1];
			regex.lastIndex = 0;
			if(!_APPLY || (_FILTER.length==0) || regex.test(name))
			{
				var na = AkelPad.MemAlloc((1+name.length)*_TSIZE);
				AkelPad.MemCopy(na, name, _TSTR)
				var ind = AkelPad.SendMessage(lb_hist, LB_INSERTSTRING, 0, na);
				AkelPad.SendMessage(lb_hist, LB_SETITEMDATA, ind, id);
				AkelPad.MemFree(na);
			}
		}
		return true;
	},0);
}
function QuoteFilter(str)
{
	return str.replace("\\","\\\\")
	          .replace("[","\\[").replace("]","\\]").replace("(","\\(").replace("(","\\(")
	          .replace("{","\\{").replace("}","\\}").replace(".","\\.").replace("*","\\*")
	          .replace("?","\\?").replace("+","\\+").replace("$","\\$").replace("^","\\^");
}

function FirstInstance(smart)
{
	var dock = FindWindowEx(g_hAkelPad,DOCKCLASSNAME);
	if(dock)
	{
		if(smart)
		{
			AkelPad.SendMessage(dock, WM_COMMAND, MAKEWPARAM(IDC_SMARTRUN,BN_CLICKED), 0);
		}
		else
		{
			AkelPad.SendMessage(dock, WM_CLOSE, 0, 0);
		}
		return false;
	}
	else
		return true;
}
var smartrun = false;
if(WScript.Arguments.length>0)
{
	var arg = WScript.Arguments(0);
	if(arg.toLowerCase()=="sr")
	{
		smartrun = true;
	}
}
if(FirstInstance(smartrun))
{
	READ_SETTINGS();
	layout[IDC_HIST].wse = _ELSE;
	layout[IDC_FILT].t = _FILTER;
	//! Регистрируем класс окна
	var res = AkelPad.WindowRegisterClass(DOCKCLASSNAME);
	
	//! Создаем панельку
	if(CreateDock())
	{
		AkelPad.SendMessage(g_hAkelPad, AKD_DOCK, _HIDE?DK_HIDE:DK_SHOW, g_pDock);
		//! Создаем функции быстрого вызова
		HK_CallBackAddr   = oSys.RegisterCallback("HK_CallBack");
		func_opentop = AddFunction(rott,_HK_RT,HK_CallBackAddr,CBC_OPENTOP);
		func_openall = AddFunction(rota,_HK_RA,HK_CallBackAddr,CBC_OPENALL);
		func_showhide = AddFunction(showhide,_HK_SH,HK_CallBackAddr,CBC_SHOWHIDE);
		//! Сабкласим главное окно
		if(AkelPad.WindowSubClass(g_hAkelPad, AkelPadCallBack, AKDN_OPENDOCUMENT_FINISH, AKDN_MAIN_ONFINISH, AKDN_FRAME_DESTROY))
		{
			//! Мы инициализировались, можно дать работать другим скриптам
			AkelPad.ScriptNoMutex();
			//! Поток в цикл сообщений
			AkelPad.WindowGetMessage();
			//! Вышли(только по закрытии панельки)
			AkelPad.WindowUnsubClass(g_hAkelPad);
			//! Сняли хук
		}
		//! Функции нужно удалить
		DelFunction(func_opentop);
		DelFunction(func_openall);
		DelFunction(func_showhide);
		oSys.UnregisterCallback(HK_CallBackAddr);
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
//! Переоткрывет указаный файл из списка
function DoReopen(id)
{
	if(id == 0) return;
	var file = history.GetItem(id).value;
	//! Открыть
	AkelPad.OpenFile(file);
	history.RemoveId(id);
}
//! Обработчик горячей клавиши
function HK_CallBack(regparam,callparam,support)
{
	var task=regparam;
	if(task == CBC_OPENALL)
	{
		var str;
		//! Открыть все
		while(history.GetCount()>0)
		{
			var id = history.GetTop();
			str = str+id+";";
			DoReopen(id);
		}
		//AkelPad.SendMessage(lb_hist, LB_RESETCONTENT, 0, 0);
	}
	if(task == CBC_OPENTOP)
	{
		var id = history.GetTop();
		//! Открыть последнее
		if(id != 0)
		{
			DoReopen(id);
/*			var cnt = AkelPad.SendMessage(lb_hist, LB_GETCOUNT, 0, 0);
			var ci = cnt - 1;
			while(ci >= 0)
			{
				var del = false;
				var lid = AkelPad.SendMessage(lb_hist, LB_GETITEMDATA, ci, 0);
				var i = 0;
				if(id==lid)
				{
					AkelPad.SendMessage(lb_hist, LB_DELETESTRING, ci, 0);
				}
				ci--;
			}*/
		}
	}
	if(task == CBC_SHOWHIDE)
	{
		if(_HIDE)
		{
			AkelPad.SendMessage(g_hAkelPad, AKD_DOCK, DK_SHOW, g_pDock);
			_HIDE = 0;
		}
		else
		{
			AkelPad.SendMessage(g_hAkelPad, AKD_DOCK, DK_HIDE, g_pDock);
			_HIDE = 1;
		}
		WRITE_SETTINGS();
	}
}
//! Вернуть позицию указанного контрола по размеру панельки
function GetControlPos(W,H,what)
{
	var r = {"x":0,"y":0,"w":W,"h":H};
	if(layout[what])
	{
		var lo = layout[what];
		r.x = lo.x.W*W + lo.x.H*H + lo.x.B*_BS+lo.x.G*_GAP;
		r.y = lo.y.W*W + lo.y.H*H + lo.y.B*_BS+lo.y.G*_GAP;
		r.w = lo.w.W*W + lo.w.H*H + lo.w.B*_BS+lo.w.G*_GAP;
		r.h = lo.h.W*W + lo.h.H*H + lo.h.B*_BS+lo.h.G*_GAP;
	}
	return r;
}
///// UTILITY
//! Register hotkey-ed function
function AddFunction(name,hk,proc,param)
{
	var szof = _X64?8:4;
	var func = AkelPad.MemAlloc(5*szof);
	var mn = AkelPad.MemAlloc((name.length+1)*_TSIZE);
	AkelPad.MemCopy(mn, name, _TSTR);
	AkelPad.MemCopy(func, 			mn,		DT_QWORD);    //name
	AkelPad.MemCopy(func+szof,		hk,		DT_WORD);     //hotkey
	AkelPad.MemCopy(func+2*szof,	0,		DT_WORD);     //FALSE
	AkelPad.MemCopy(func+3*szof,	proc,	DT_QWORD);    //proc
	AkelPad.MemCopy(func+4*szof,	param,	DT_QWORD);    //param
	var res = AkelPad.SendMessage(g_hAkelPad, AKD_DLLADD, 0, func);
	AkelPad.MemFree(mn);
	AkelPad.MemFree(func);
	return res;
}
//! Unregister hotkey-ed function
function DelFunction(prs)
{
	AkelPad.SendMessage(g_hAkelPad, AKD_DLLDELETE, 0, prs);
}
//! Записать настройки скрипта
function WRITE_SETTINGS()
{
	oSet.Begin(WScript.ScriptBaseName, 0x2 /*POB_SAVE*/);
	oSet.Write("WIDTH", PO_DWORD, _W);
	oSet.Write("HEIGHT", PO_DWORD, _H);
	oSet.Write("BS", PO_DWORD,    _BS);
	oSet.Write("GAP", PO_DWORD,   _GAP);
	oSet.Write("SIDE", PO_DWORD,  _SIDE);
	oSet.Write("ELSE", PO_DWORD, _ELSE);
	oSet.Write("FULLDND", PO_DWORD, _FULLDND);
	oSet.Write("HK_RT", PO_DWORD, _HK_RT);
	oSet.Write("HK_RA", PO_DWORD, _HK_RA);
	oSet.Write("HK_SH", PO_DWORD, _HK_SH);
	oSet.Write("HIDE", PO_DWORD, _HIDE);
	oSet.Write("PS", PO_DWORD, _PERSIST);
	if(_PERSIST)
	{
		oSet.Write("DATA", PO_STRING, history.serialize());
	}
	else oSet.Write("DATA", PO_STRING, "");
	oSet.Write("FILTER", PO_STRING, _FILTER);
	oSet.Write("APPLY", PO_DWORD, _APPLY);
	oSet.End();
}
//! Прочитать настройки скрипта
function READ_SETTINGS()
{
	oSet.Begin(WScript.ScriptBaseName, 0x1 /*POB_READ*/);
	_W    = oSet.Read("WIDTH", PO_DWORD, 100);
	_H    = oSet.Read("HEIGHT", PO_DWORD, 300);
	_BS   = oSet.Read("BS", PO_DWORD, 20);
	_GAP  = oSet.Read("GAP", PO_DWORD, 5);
	_SIDE = oSet.Read("SIDE", PO_DWORD, DKS_RIGHT);
	_ELSE = oSet.Read("ELSE", PO_DWORD, WS_EX_CLIENTEDGE);
	_FULLDND = oSet.Read("FULLDND", PO_DWORD, 0);
	_HK_RT = oSet.Read("HK_RT", PO_DWORD, MAKEWORD(0x5A,HOTKEYF_ALT));
	_HK_RA = oSet.Read("HK_RA", PO_DWORD, MAKEWORD(0x5A,HOTKEYF_ALT|HOTKEYF_CONTROL|HOTKEYF_SHIFT));
	_HK_SH = oSet.Read("HK_SH", PO_DWORD, MAKEWORD(0x48,HOTKEYF_ALT|HOTKEYF_CONTROL));
	_HIDE = oSet.Read("HIDE", PO_DWORD, 0);
	_PERSIST = oSet.Read("PS", PO_DWORD, 0);
	if(_PERSIST)
	{
		history.unserialize(oSet.Read("DATA", PO_STRING,""));
	}
	_FILTER = oSet.Read("FILTER", PO_STRING,"");
	_APPLY = oSet.Read("APPLY", PO_DWORD, 0);
	oSet.End();
}
///// HELPERS: функции для упрощения системных вызовов
//! Передвинуть окно
function MoveWindow(hwnd,x,y,w,h,repaint)
{
	oSys.Call("user32::MoveWindow",hwnd,x,y,w,h,repaint);
}
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
//! Получить состояние кнопки
function GetKeyState(key)
{
	return oSys.Call("user32::GetKeyState",key);
}
//! MAKEWORD
function MAKEWORD(lo,hi)
{
	return (lo & 0xFF) + ((hi & 0xFF)<<8);
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
function HList()
{
	var obj = {};
	obj.gid = 0;
	obj.head = {prev:null,next:null,id:0,value:null};
	obj.tail = {prev:null,next:null,id:0,value:null};
	obj.count = 0;
	obj.head.next = obj.tail;
	obj.tail.prev = obj.head;
	obj.all = {};
	var NextId = function(o){
		o.gid++;
		while(o.all[o.gid]!=null || o.gid==0)
			o.gid++;
	}
	obj.GetCount = function(){return obj.count;}
	obj.GetItem = function(id)	{
		if(id == 0) return null;
		if(obj.all[id]) return obj.all[id];
		return null;
	}
	obj.RemoveId = function(id)	{
		if(id == 0) return;
		var it = this.GetItem(id);
		if(it != null)
		{
			it.next.prev = it.prev;
			it.prev.next = it.next;
			obj.count = obj.count - 1;
		}
		obj.all[id] = null;
	}
	obj.GetTop = function()	{
		return obj.head.next.id;
	}
	obj.IterateTop = function(func,param)	{
		var cur = obj.head.next;
		while(cur != obj.tail)
		{
			if(!func(param,cur.id,cur.value))
				return;
			cur = cur.next;
		}
	}
	obj.IterateBottom = function(func,param)	{
		var cur = obj.tail.prev;
		while(cur != obj.head)
		{
			if(!func(param,cur.id,cur.value))
				return;
			cur = cur.prev;
		}
	}
	obj.InsertTop = function(val)
	{
		NextId(obj);
		var item = {prev:obj.head,next:obj.head.next,id:obj.gid,value:val};
		obj.head.next.prev = item;
		obj.head.next = item;
		obj.all[obj.gid] = item;
		obj.count++;
		return obj.gid;
	}
	obj.serialize = function()
	{
		var arr = [];
		var cur = obj.head.next;
		while(cur != obj.tail)
		{
			arr.push(cur.value);
			cur = cur.next;
		}
		return arr.join("|");
	}
	obj.unserialize = function(data)
	{
		if(!data) return;
		var arr = data.split("|");
		while(arr.length>0)
		{
			var t = arr.pop();
			if(t)
			obj.InsertTop(t);
		}
	}
	return obj;
}