// AkelPadManualSettings.js - ver. 2013-09-03 (x86/x64)
//
// GUI for manual settings.
//
// Usage:
// Call("Scripts::Main", 1, "AkelPadManualSettings.js")
//
// Note:
// The script should be saved in Unicode format

var hMainWnd = AkelPad.GetMainWnd();
var hEditWnd = AkelPad.GetEditWnd();
if (! hMainWnd)
  WScript.Quit();

var oSys        = AkelPad.SystemFunction();
var hInstDLL    = AkelPad.GetInstanceDll();
var sClassName  = "AkelPad::Scripts::" + WScript.ScriptName + "::" + hInstDLL;
var sScriptName = "AkelPad manual settings";
var oFSO        = new ActiveXObject("Scripting.FileSystemObject");
var nHistMax    = 20;
var bSaveHist;
var hDlg;
var hFocus;
var i;

var nTextLen = 512;
var lpText   = AkelPad.MemAlloc(nTextLen * 2);
var lpLVITEM = AkelPad.MemAlloc(_X64 ? 72 : 60); //sizeof(LVITEM)
AkelPad.MemCopy(lpLVITEM, 0x0001 /*LVIF_TEXT*/, 3 /*DT_DWORD*/);
AkelPad.MemCopy(lpLVITEM + (_X64 ? 24 : 20), lpText, 2 /*DT_QWORD*/);
AkelPad.MemCopy(lpLVITEM + (_X64 ? 32 : 24), nTextLen, 3 /*DT_DWORD*/);

//.ini settings
var nDlgX = 100;
var nDlgY = 120;
var nSel  = 0;
var nLang = 0;
var aAkelUpdaterOptions = [];
var aCmdLineBegin       = [];
var aCmdLineEnd         = [];
var aDateInsertFormat   = [];
var aDateLogFormat      = [];
var aStatusUserFormat   = [];
var aUrlCommand         = [];
ReadIni();

//0x50000000 = WS_VISIBLE|WS_CHILD
//0x50000001 = WS_VISIBLE|WS_CHILD|BS_DEFPUSHBUTTON
//0x50000007 - WS_VISIBLE|WS_CHILD|BS_GROUPBOX
//0x50000009 = WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
//0x50010003 = WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
//0x50012403 = WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_MULTILINE|BS_TOP|BS_AUTOCHECKBOX
//0x50010009 = WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTORADIOBUTTON
//0x50010042 - WS_VISIBLE|WS_CHILD|WS_TABSTOP|CBS_AUTOHSCROLL|CBS_DROPDOWN
//0x50010800 = WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_READONLY
//0x50210804 = WS_VISIBLE|WS_CHILD|WS_VSCROLL|WS_TABSTOP|ES_READONLY|ES_MULTILINE
//0x5081800D = WS_VISIBLE|WS_CHILD|WS_BORDER|WS_TABSTOP|LVS_NOSORTHEADER|LVS_SHOWSELALWAYS|LVS_SINGLESEL|LVS_REPORT

var oAkelAdminResident =
{
  Value    : 0,
  Default  : 1,
  Wnd      : [],
  IDTEXT   : 2001,
  IDBUTTON1: 2002,
  IDBUTTON2: 2003,
  IDDEF    : 2004,

  Initialize: function()
  {
    this.Value = SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 126 /*MI_AKELADMINRESIDENT*/, 0);
    this.Wnd[this.IDTEXT   ] = {Class: 'STATIC', Style: 0x50000000, X: 140, Y:  20, W: 640, H:  13, Txt: 'Defines residency of "AkelAdmin.exe":',
                                                                                                    Rus: 'Определяет будет ли AkelAdmin.exe оставаться в памяти:'};
    this.Wnd[this.IDBUTTON1] = {Class: 'BUTTON', Style: 0x50010009, X: 140, Y:  40, W: 640, H:  16, Txt: '0 - AkelAdmin.exe unloaded from memory. Password will be prompted each time to change protected file.',
                                                                                                    Rus: '0 - AkelAdmin.exe выгружается из памяти. Каждый раз будет запрашиваться пароль на изменение защищенного файла.'};
    this.Wnd[this.IDBUTTON2] = {Class: 'BUTTON', Style: 0x50010009, X: 140, Y:  60, W: 640, H:  16, Txt: '1 - AkelAdmin.exe remains in memory. Password will be prompted only for the first time to change protected file.',
                                                                                                    Rus: '1 - AkelAdmin.exe остается в памяти. Пароль будет запрошен только первый раз на изменение защищенного файла.'};
    this.Wnd[this.IDDEF    ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  86, W: 640, H:  16, Txt: 'By default: 1',
                                                                                                    Rus: 'По умолчанию: 1'};
  },

  Apply: function()
  {
    SendMessage(hMainWnd, 1219 /*AKD_SETMAININFO*/, 126 /*MIS_AKELADMINRESIDENT*/, this.Value);
  },

  SetValue: function()
  {
    for (var i = this.IDBUTTON1; i <= this.IDBUTTON2; ++i)
      SendMessage(this.Wnd[i].Handle, 241 /*BM_SETCHECK*/, this.Value == i - this.IDBUTTON1, 0);
    SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
  },

  Command: function(nID, nCode, hWnd)
  {
    if ((nID >= this.IDBUTTON1) && (nID <= this.IDBUTTON2))
    {
      this.Value = nID - this.IDBUTTON1;
      this.SetValue();
      SendMessage(aDlg[IDENGB + nLang].Handle, 241 /*BM_SETCHECK*/, 1, 0);
    }
    else if ((nID == this.IDDEF) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
    {
      this.Value = this.Default;
      this.SetValue();
    }
    else if ((nID == IDENGB) ||(nID == IDRUSB))
      this.SetValue();
  }
};

var oAkelUpdaterOptions =
{
  Value  : '',
  Default: '',
  Wnd    : [],
  IDTEXT : 2001,
  IDVALUE: 2002,
  IDDEF  : 2003,
  IDEDIT : 2004,

  Initialize: function()
  {
    SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 131 /*MI_AKELUPDATEROPTIONS*/, lpText);
    this.Value = AkelPad.MemRead(lpText, 1 /*DT_UNICODE*/);
    this.Wnd[this.IDTEXT ] = {Class: 'STATIC',    Style: 0x50000000, X: 140, Y:  20, W: 640, H:  13, Txt: 'Defines command line options for the AkelUpdater.exe, when launched from "Help/Update..." menu item:',
                                                                                                     Rus: 'Определяет параметры командной строки для AkelUpdater.exe:'};
    this.Wnd[this.IDVALUE] = {Class: 'COMBOBOX',  Style: 0x50010042, X: 140, Y:  40, W: 640, H:  21};
    this.Wnd[this.IDDEF  ] = {Class: 'BUTTON',    Style: 0x50010003, X: 140, Y:  71, W: 640, H:  16, Txt: 'By default: ""',
                                                                                                     Rus: 'По умолчанию: ""'};
    this.Wnd[this.IDEDIT ] = {Class: 'AkelEditW', Style: 0x50210804, X: 140, Y:  96, W: 640, H: 266, Txt: '/PROXY=IP:PORT\n\tCurrent proxy settings. IE settings will be used by default.\n/AUTH=LOGIN:PASSWORD\n\tProxy login and password (http only).\n/NOPROXY\n\tDisables proxy settings for this connection (if any).\n/LANG=[eng|rus]\n\tSelect language.\n/BIT=[32|64]\n\tUpdate to 32-bit or to 64-bit version. If not specified it will be autodetected.\n/SAVEDIR=[path]\n\tSave downloads to directory.\n/DLONLY\n\tDon\'t update, download only.\n/NOCOPIES\n\tDon\'t load DLLs to find original plugin name.\n/UNZIP=[options]\n\tnsUnzip options.\n\nExample: /PROXY=192.168.0.1:3128 /SAVEDIR="%a\\AkelFiles\\Updates"'};
  },

  Apply: function()
  {
    SendMessage(hMainWnd, 1219 /*AKD_SETMAININFO*/, 131 /*MIS_AKELUPDATEROPTIONS*/, this.Value);
  },

  SetValue: function()
  {
    oSys.Call("User32::SetWindowTextW", this.Wnd[this.IDVALUE].Handle, this.Value);
    SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
  },

  Command: function(nID, nCode, hWnd)
  {
    if ((nID == this.IDVALUE) && ((nCode == 5 /*CBN_EDITCHANGE*/) || (nCode == 8 /*CBN_CLOSEUP*/)))
    {
      this.Value = GetWindowText(hWnd);
      SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
    }
    else if ((nID == this.IDDEF) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
    {
      this.Value = this.Default;
      this.SetValue();
    }
  }
};

var oCmdLineBegin =
{
  Value  : '',
  Default: '',
  Wnd    : [],
  IDTEXT : 2001,
  IDVALUE: 2002,
  IDDEF  : 2003,
  IDEDIT1: 2004,
  IDEDIT2: 2005,

  Initialize: function()
  {
    SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 105 /*MI_CMDLINEBEGIN*/, lpText);
    this.Value = AkelPad.MemRead(lpText, 1 /*DT_UNICODE*/);
    this.Wnd[this.IDTEXT ] = {Class: 'STATIC',    Style: 0x50000000, X: 140, Y:  20, W: 640, H:  13, Txt: 'Specifies code to be added to the beginning of the command line before processing it:',
                                                                                                     Rus: 'Задает код, который будет добавлен к началу командной строки, перед ее обработкой:'};
    this.Wnd[this.IDVALUE] = {Class: 'COMBOBOX',  Style: 0x50010042, X: 140, Y:  40, W: 640, H:  21};
    this.Wnd[this.IDDEF  ] = {Class: 'BUTTON',    Style: 0x50010003, X: 140, Y:  71, W: 640, H:  16, Txt: 'By default: ""',
                                                                                                     Rus: 'По умолчанию: ""'};
    this.Wnd[this.IDEDIT1] = {Class: 'AkelEditW', Style: 0x50010800, X: 140, Y:  96, W: 640, H:  21, Txt: 'Example: /C+',
                                                                                                     Rus: 'Пример: /C+'};
    this.Wnd[this.IDEDIT2] = {Class: 'AkelEditW', Style: 0x50210804, X: 140, Y: 127, W: 640, H: 348, Txt: '*** Command line parameters ***\n\nAkelPad.exe [parameters] "file1.ext" [parameters] "file2.ext" [parameters] ...\n\n/x\t\t- don\'t use MS Notepad compatibility mode when parsing command line parameters.\n/p\t\t- print next file and close it.\n/C+\t\t- silently create new file, if it doesn\'t exist.\n/C-\t\t- don\'t create new file, if it doesn\'t exist.\n/C\t\t- ask for new file creation, if it doesn\'t exist (by default).\n/B+\t\t- silently open file, if binary.\n/B-\t\t- don\'t open file, if binary.\n/B\t\t- ask for file open, if binary (by default).\n/L+\t\t- silently save file, even if symbols will be lost in specified encoding.\n/L-\t\t- don\'t save file, if symbols will be lost in specified encoding.\n/L\t\t- ask for file save, if symbols will be lost in specified encoding (by default).\n/Z\t\t- ignore next command line parameter.\n/reassoc\t- reinstall assigned earlier associations of file types.\n/deassoc\t- uninstall assigned earlier associations of file types.\n/quit\t\t- stop parsing command line parameters and close program.\n/end\t\t- stop parsing command line parameters.\n\nMethods:\n/Show(MainWindowStyle)\n\tMainWindowStyle\n\t\t0 hidden window.\n\t\t1 window as is (by default).\n\t\t2 minimized window.\n\t\t3 maximized window.\n\t\t6 minimized, inactive window.\n\t\t9 non-maximized window.\n\t/Show(2)\n\t\tmethod shows main window in minimized style.\n/OpenFile("file", [OpenCodepage], [OpenBOM])\n\t"file"\n\t\tFile to open.\n\tOpenCodepage\n\t\tOpen codepage. If -1 or not specified, it will be autodetected.\n\tOpenBOM\n\t\tFile byte order mark. If -1 or not specified, it will be autodetected.\n\t/OpenFile("C:\File.txt", 65001, -1)\n\t\tmethod opens file in UTF-8 codepage.\n/SaveFile("file", [SaveCodepage], [SaveBOM])\n\t"file"\n\t\tSave current document to a specified file name.\n\tSaveCodepage\n\t\tSave codepage. If -1 or not specified, current codepage will be used.\n\tSaveBOM\n\t\tFile byte order mark. 1 - exist, 0 - doesn\'t exist, -1 or not specified - current BOM will be used.\n\t/SaveFile("C:\\File.txt", 65001, 0)\n\t\tmethod saves file in UTF-8 codepage without BOM.\n/Command(InternalCommand)\n\t/Command(4162)\n\t\tmethod calls the internal command at number 4162.\n/Call("Plugin::Function", [additional parameters])\n\t/Call("Scripts::Main")\n\t\tmethod calls Scripts plugin and Main function.\n/Exec("command line", ["working directory"], [Wait])\n\t"command line"\n\t\tCommand line string.\n\t"working directory"\n\t\tWorking directory string. Default is "".\n\tWait\n\t\tWait until the program finishes. 1 - wait, 0 - return immediately.\n\t/Exec("notepad.exe")\n\t\tmethod calls notepad.\n\t/Exec(`notepad.exe`)\n\t\tmethod calls notepad.\n\t/Exec(\'notepad.exe\')\n\t\tmethod calls notepad.\n\t/Exec(\'%windir%\\notepad.exe\')\n\t\tmethod calls notepad.\n\t/Exec(`rundll32.exe shell32,ShellExec_RunDLL "%%f"`, "%%d")\n\t\tmethod pass an active file for opening on Windows association.\n/Font("FaceName", Style, Size)\n\t"FaceName"\n\t\tFont face, for example, "Courier". Unchanged, if "".\n\tStyle (one of the following):\n\t\t0 ignored.\n\t\t1 normal.\n\t\t2 bold.\n\t\t3 italic.\n\t\t4 bold italic.\n\tSize\n\t\tFont size. Unchanged, if 0.\n\t/Font("Courier", 4, 10)\n\t\tmethod sets Courier bold italic font with 10 pt.\n/Recode(RecodeFrom, RecodeTo)\n\tRecodeFrom\n\t\tCodepage source. If -1, it will be auto-detected.\n\tRecodeTo\n\t\tCodepage target. If -1, it will be auto-detected.\n\t/Recode(1252, 437)\n\t\tmethod recodes the text from 1252 codepage to 437.\n/Insert("text", [Esc-sequences])\n\t"text"\n\t\tInserted text.\n\tEsc-sequences:\n\t\t0 - "text" doesn\'t contain Esc-sequences (default).\n\t\t1 - "text" contains Esc-sequences. A set of sequences similar to the find/replace dialog in the program, and also:\n\t\t\t"\\s" - replaced by the selected text of the editing window;\n\t\t\t"\\|" - set the caret position after text insertion.\n\t/Insert("Some string")\n\t\tmethod replaces selection with the specified text.\n\t/Insert("<B>\\s</B>", 1)\n\t\tmethod enclose selection.\n\t/Insert("\\[0031 0032 0033]", 1)\n\t\tmethod replaces selection with "123".\n\nVariables available for use in methods:\n\t%%f - active file\n\t%%d - directory of active file\n\t%%a - AkelPad\'s directory (i.e. contains AkelPad.exe)\n\t%%%% - % symbol\n\t%system variable% (i.e. Environment variable)\n\n\n*** Internal commands ***\n\nCan be used in command line method /Command() and also in ContextMenu, ToolBar, Hotkeys, Scripts plugins.\n\n4101\tCreate new edit window\n4102\tCreate new instance of program\n4103\tOpen file dialog\n4104\tReopen file\n4105\tSave file\n4106\tSave file dialog\n4107\tPrint setup dialog\n4108\tPrint dialog\n4109\tExit program\n4110\tSave all documents\n4111\tSave all as dialog\n4113\tPrint without dialog\n4114\tPrint preview dialog\n4121\tRedetect code page of the current file\n4122\tReopen file as ANSI\n4123\tReopen file as OEM\n4124\tReopen file as KOI-R\n4125\tReopen file as UTF16LE\n4126\tReopen file as UTF16BE\n4127\tReopen file as UTF8\n4131\tSave file as ANSI\n4132\tSave file as OEM\n4133\tSave file as KOI-R\n4134\tSave file as UTF16LE\n4135\tSave file as UTF16BE\n4136\tSave file as UTF8\n4137\tSave file as UTF8 without BOM\n4140\tShow codepages context menu\n4151\tUndo last operation\n4152\tRedo last operation\n4153\tCut\n4154\tCopy\n4155\tPaste\n4156\tDelete\n4157\tSelect all\n4158\tFind dialog\n4159\tFind last string down\n4160\tFind last string up\n4161\tReplace dialog\n4162\tGo to line dialog\n4163\tRun charmap.exe\n4164\tInsert tabulation\n4165\tInsert tabulation only if several lines selected\n4166\tDelete tabulation\n4167\tDelete tabulation only if several lines selected\n4168\tInsert space\n4169\tInsert space only if several lines selected\n4170\tDelete space\n4171\tDelete space only if several lines selected\n4172\tDelete first char\n4173\tDelete first char only if selection not empty\n4174\tDelete trailing whitespaces\n4175\tConvert text to "UPPERCASE"\n4176\tConvert text to "lowercase"\n4177\tConvert text to "Sentence case."\n4178\tConvert text to "Title Case"\n4179\tConvert text to "iNVERT cASE"\n4180\tCycle case\n4182\tRecode dialog\n4183\tInsert date\n4184\tWindows newline format\n4185\tUnix newline format\n4186\tMac newline format\n4190\tInsert/Overtype mode\n4191\tPaste as ANSI text\n4192\tPaste to column selection\n4193\tPaste text after caret\n4196\tInsert new line with keeping left spaces, if option "Keep space" is off.\n\t\tInsert new line without keeping left spaces, if option "Keep space" is on.\n4197\tDelete current line\n4198\tMove caret to opposite end of selection\n4199\tMove caret to previous location\n4200\tMove caret to next location\n4201\tFont dialog\n4202\tColor theme dialog\n4204\tIncrease font 1pt\n4205\tDecrease font 1pt\n4206\tRestore font to size at startup\n4209\tWord wrap (on/off)\n4210\tAlways on top (on/off)\n4211\tShow status bar (on/off)\n4212\tSplit window into four panes\n4213\tSplit window into two vertical panes\n4214\tSplit window into two horizontal panes\n4215\tSplit window (on/off)\n4216\tRead only (on/off)\n4251\tExecute command\n4252\tSave file time (on/off)\n4253\tWatch file change (on/off)\n4254\tKeep left spaces (on/off)\n4255\tSingle open file (on/off)\n4256\tSingle open program (on/off)\n4259\tPlugins dialog\n4260\tOptions dialog\n4261\tSDI mode\n4262\tMDI mode\n4263\tPseudo MDI mode\n4301\tTab list window at the top of the main window\n4302\tTab list window at the bottom of the main window\n4303\tHide tab list\n4304\tStandard tab list style\n4305\tButtons tab list style\n4306\tFlat buttons tab list style\n4307\tMDI windows - horizontal tile\n4308\tMDI windows - vertical tile\n4309\tMDI windows - cascade\n4310\tSwitch tabs: next-previous.\n4311\tSwitch tabs: right-left.\n4316\tActivate next tab\n4317\tActivate previous tab\n4318\tClose current tab\n4319\tClose all tabs\n4320\tClose all tabs but active\n4321\tClose all unmodified tabs\n4324\tClose file\n4325\tClose file and exit program (SDI) or close tab of a file (MDI/PMDI).\n4327\tSelect window dialog (MDI/PMDI). Same as 10019.\n4331\tRestore/Maximize main window\n4332\tActivate next dialog window\n4333\tActivate previous dialog window\n4341\tActivate next pane (split window)\n4342\tActivate previous pane (split window)\n4351\tAbout dialog\n4352\tOpen user\'s manual (this file)\n4353\tCheck updates (AkelUpdater), uses AkelUpdaterOptions string\n5001\tDelete dead recent files from "Recent files" list\n5001+n\tOpen recent file n\n6001\tActivate internal language\n6001+n\tActivate language n\n7001\tReopen file in first codepage of codepage list\n7001+n\tReopen file in codepage n of codepage list\n8001\tSave file in first codepage of codepage list\n8001+n\tSave file in codepage n of codepage list\n10019\tSelect window dialog (MDI/PMDI). Same as 4327.',
                                                                                                     Rus: '*** Параметры командной строки ***\n\nAkelPad.exe [параметры] "file1.ext" [параметры] "file2.ext" [параметры] ...\n\n/x\t\t- не использовать режим совместимости с MS Notepad при обработке параметров командной строки.\n/p\t\t- напечатать следующий файл и закрыть его.\n/C+\t\t- молча создавать новый файл, если он не существует.\n/C-\t\t- не создавать новый файл, если он не существует.\n/C\t\t- спрашивать о создании нового файла, если он не существует (по умолчанию).\n/B+\t\t- молча открывать файл, если он бинарный.\n/B-\t\t- не открывать файл, если он бинарный.\n/B\t\t- спрашивать об открытии файла, если он бинарный (по умолчанию).\n/L+\t\t- молча сохранить файл, даже если потеряются символы в указанной кодировке.\n/L-\t\t- не сохранять файл, если потеряются символы в указанной кодировке.\n/L\t\t- спрашивать о сохранении файла, если потеряются символы в указанной кодировке (по умолчанию).\n/Z\t\t- игнорировать следующий параметр командной строки.\n/reassoc\t- переустановить ранее назначенные ассоциации типов файлов.\n/deassoc\t- снять ранее назначенные ассоциации типов файлов.\n/quit\t\t- закончить обработку параметров командной строки и выйти из программы.\n/end\t\t- закончить обработку параметров командной строки.\n\nМетоды:\n/Show(СтильГлавногоОкна)\n\tСтильГлавногоОкна\n\t\t0 скрытое окно.\n\t\t1 окно как есть (по умолчанию).\n\t\t2 свернутое окно.\n\t\t3 развернутое окно.\n\t\t6 свернутое, не активное окно.\n\t\t9 не развернутое окно.\n\t/Show(2)\n\t\tметод отображает главное окно в свернутом режиме.\n/OpenFile("файл", [Кодировка], [СигнатураBOM])\n\t"файл"\n\t\tФайл для открытия.\n\tКодировка\n\t\tКодировка открытия. Если -1 либо не указана, она будет определена автоматически.\n\tСигнатураBOM\n\t\tСигнатура BOM файла. Если -1 либо не указана, она будет определена автоматически.\n\t/OpenFile("C:\\File.txt", 65001, -1)\n\t\tметод открывает файл в кодировке UTF-8.\n/SaveFile("файл", [Кодировка], [СигнатураBOM])\n\t"файл"\n\t\tСохранение текущего документа в указанный файл.\n\tКодировка\n\t\tКодировка сохранения. Если -1 либо не указана, будет использована текущая кодировка.\n\tСигнатураBOM\n\t\tСигнатура BOM файла. 1 - присутствует, 0 - отсутствует, -1 либо не указана - используется текущий BOM.\n\t/SaveFile("C:\\File.txt", 65001, 0)\n\t\tметод сохраняет файл в кодировке UTF-8 без BOM.\n/Command(ВнутренняяКоманда)\n\t/Command(4162)\n\t\tметод вызывает внутреннюю команду под номером 4162.\n/Call("Плагин::Функция", [дополнительные параметры])\n\t/Call("Scripts::Main")\n\t\tметод вызывает плагин Scripts и функцию Main.\n/Exec("командная строка", ["рабочая директория"], [Ожидать])\n\t"командная строка"\n\t\tКомандная строка.\n\t"рабочая директория"\n\t\tРабочая директория. По умолчанию "".\n\tОжидать\n\t\tОжидать завершения программы. 1 - ожидать, 0 - не ожидать.\n\t/Exec("notepad.exe")\n\t\tметод вызывает блокнот.\n\t/Exec(`notepad.exe`)\n\t\tметод вызывает блокнот.\n\t/Exec(\'notepad.exe\')\n\t\tметод вызывает блокнот.\n\t/Exec(\'%windir%\\notepad.exe\')\n\t\tметод вызывает блокнот.\n\t/Exec(`rundll32.exe shell32,ShellExec_RunDLL "%%f"`, "%%d")\n\t\tметод передает активный файл для открытия по ассоциации Windows.\n/Font("Шрифт", Начертание, Размер)\n\t"Шрифт"\n\t\tИмя шрифта, например, "Courier". Не изменяется, если "".\n\tНачертание (одно из следующих):\n\t\t0 игнорировать.\n\t\t1 обычный шрифт.\n\t\t2 жирный шрифт.\n\t\t3 курсивный шрифт.\n\t\t4 жирный курсивный шрифт.\n\tРазмер\n\t\tРазмер шрифта. Не изменяется, если 0.\n\t/Font("Courier", 4, 10)\n\t\tметод устанавливает жирный курсив Courier шрифт размером 10 pt.\n/Recode(ПерекодироватьИз, ПерекодироватьВ)\n\tПерекодироватьИз\n\t\tКодировка источник. Если -1, она будет определена автоматически.\n\tПерекодироватьВ\n\t\tКодировка приемник. Если -1, она будет определена автоматически.\n\t/Recode(1251, 866)\n\t\tметод перекодирует текст из кодировки 1251 в 866.\n/Insert("текст", [Esc-последовательности])\n\t"текст"\n\t\tВставляемый текст.\n\tEsc-последовательности:\n\t\t0 - "текст" не содержит Esc-последовательностей (по умолчанию).\n\t\t1 - "текст" содержит Esc-последовательности. Набор последовательностей аналогичен диалогу поиска/замены в программе, а также:\n\t\t\t"\\s" - заменяется на выделенный в окне редактирования текст;\n\t\t\t"\\|" - указывает на положение каретки после вставки текста.\n\t/Insert("Некая строка")\n\t\tметод заменяет выделение на указанный текст.\n\t/Insert("<B>\\s</B>", 1)\n\t\tметод добавляет к выделению текст по краям.\n\t/Insert("\\[0031 0032 0033]", 1)\n\t\tметод заменяет выделение на "123".\n\nПеременные в методах:\n\t%%f - активный файл\n\t%%d - директория активного файла\n\t%%a - директория AkelPad\'а\n\t%%%% - символ %\n\t%системная переменная%\n\n\n*** Внутренние команды ***\n\nМогут быть использованы в параметрах командной строки, а также в ContextMenu, ToolBar, Hotkeys, Scripts плагинах.\n\n4101\tСоздать новое окно редактирования\n4102\tСоздать новую копию программы\n4103\tДиалог открытия файлов\n4104\tПереоткрыть файл\n4105\tСохранить файл\n4106\tДиалог сохранения файлов\n4107\tДиалог настроек печати\n4108\tДиалог печати\n4109\tВыход из программы\n4110\tСохранить все документы\n4111\tДиалог сохранения всех документов\n4113\tПечать без диалога\n4114\tДиалог предпросмотра печати\n4121\tОпределить кодировку текущего документа заново\n4122\tПереоткрыть файл как ANSI\n4123\tПереоткрыть файл как OEM\n4124\tПереоткрыть файл как KOI-R\n4125\tПереоткрыть файл как UTF16LE\n4126\tПереоткрыть файл как UTF16BE\n4127\tПереоткрыть файл как UTF8\n4131\tСохранить файл как ANSI\n4132\tСохранить файл как OEM\n4133\tСохранить файл как KOI-R\n4134\tСохранить файл как UTF16LE\n4135\tСохранить файл как UTF16BE\n4136\tСохранить файл как UTF8\n4137\tСохранить файл как UTF8 без BOM\n4140\tПоказать контекстное меню кодировок\n4151\tОтменить последнюю операцию (Undo)\n4152\tПовторить последнюю операцию (Redo)\n4153\tВырезать\n4154\tСкопировать\n4155\tВставить\n4156\tУдалить\n4157\tВыделить все\n4158\tДиалог поиска\n4159\tНайти далее вниз\n4160\tНайти далее вверх\n4161\tДиалог замены\n4162\tДиалог перехода к строке\n4163\tЗапуск charmap.exe\n4164\tВставить табуляцию\n4165\tВставить табуляцию, только если выделено несколько строк\n4166\tУдалить табуляцию\n4167\tУдалить табуляцию, только если выделено несколько строк\n4168\tВставить пробел\n4169\tВставить пробел, только если выделено несколько строк\n4170\tУдалить пробел\n4171\tУдалить пробел, только если выделено несколько строк\n4172\tУдалить первый символ\n4173\tУдалить первый символ, только если есть выделение\n4174\tУдалить табы и пробелы в конце\n4175\tПреобразовать в "ВСЕ ПРОПИСНЫЕ"\n4176\tПреобразовать в "все строчные"\n4177\tПреобразовать в "Как в предложениях."\n4178\tПреобразовать в "Начинать С Прописных"\n4179\tПреобразовать в "иНВЕРТИРОВАТЬ\n4180\tПреобразовать по кругу\n4182\tДиалог перекодирования\n4183\tВставить дату\n4184\tФормат новой строки Windows\n4185\tФормат новой строки Unix\n4186\tФормат новой строки Mac\n4190\tРежим вставки/замены\n4191\tВставить текст как ANSI\n4192\tВставить из буфера обмена в вертикальное выделение\n4193\tВставить текст из буфера обмена после каретки\n4196\tВставить новую строку с сохранением отступов слева, если отключено "Сохранять отступы слева".\n\t\tВставить новую строку без сохранения отступов слева, если включено "Сохранять отступы слева".\n4197\tУдалить текущую строку\n4198\tПеревести каретку на другой конец выделения\n4199\tПеревести каретку на предыдущую позицию\n4200\tПеревести каретку на следующую позицию\n4201\tДиалог выбора шрифта\n4202\tДиалог выбора цветовой темы\n4204\tУвеличить шрифт на 1pt\n4205\tУменьшить шрифт на 1pt\n4206\tВосстановить размер шрифта\n4209\tПеренос по словам (вкл/выкл)\n4210\tПоверх всех окон (вкл/выкл)\n4211\tПоказать строку состояния (вкл/выкл)\n4212\tРазделить окно на четыре части\n4213\tРазделить окно на две вертикальные части\n4214\tРазделить окно на две горизонтальные части\n4215\tРазделить окно (вкл/выкл)\n4216\tТолько чтение (вкл/выкл)\n4251\tВыполнить\n4252\tСохранять время файла (вкл/выкл)\n4253\tСледить за изменением файла (вкл/выкл)\n4254\tСохранять отступы слева (вкл/выкл)\n4255\tНе открывать файл дважды (вкл/выкл)\n4256\tНе открывать программу дважды (вкл/выкл)\n4259\tДиалог плагинов\n4260\tДиалог настроек\n4261\tОднооконный (SDI) режим\n4262\tМногооконный (MDI) режим\n4263\tПсевдо-многооконный (PMDI) режим\n4301\tВкладки сверху\n4302\tВкладки снизу\n4303\tСкрыть вкладки\n4304\tСтандартные вкладки\n4305\tВкладки как кнопки\n4306\tВкладки как плоские кнопки\n4307\tВыстроить горизонтально MDI окна\n4308\tВыстроить вертикально MDI окна\n4309\tВыстроить каскадом MDI окна\n4310\tПереключение вкладок: следующая-предыдущая.\n4311\tПереключение вкладок: правая-левая.\n4316\tАктивировать следующую вкладку\n4317\tАктивировать предыдущую вкладку\n4318\tЗакрыть текущую вкладку\n4319\tЗакрыть все вкладки\n4320\tЗакрыть все вкладки, кроме активной\n4321\tЗакрыть все неизмененные вкладки\n4324\tЗакрыть файл\n4325\tЗакрыть файл и выйти из программы (SDI) или закрыть вкладку файла (MDI/PMDI).\n4327\tДиалог выбора окна (MDI/PMDI). Тоже что и 10019.\n4331\tВосстановить/Развернуть главное окно программы\n4332\tПерейти к следующему диалогу\n4333\tПерейти к предыдущему диалогу\n4341\tПерейти к следующей части разделенного окна\n4342\tПерейти к предыдущей части разделенного окна\n4351\tДиалог о программе\n4352\tОткрыть руководство пользователя\n4353\tПроверить обновления (AkelUpdater)\n5001\tВ списке последних файлов удалить несуществующие\n5001+n\tИз списка последних файлов, открыть файл n\n6001\tВыбрать внутренний язык\n6001+n\tИз списка языков, выбрать язык n\n7001\tИз списка кодировок, открыть в первой кодировке\n7001+n\tИз списка кодировок, открыть в кодировке n\n8001\tИз списка кодировок, сохранить в первой кодировке\n8001+n\tИз списка кодировок, сохранить в кодировке n\n10019\tДиалог выбора окна (MDI/PMDI). Тоже что и 4327.'};
  },

  Apply: function()
  {
    SendMessage(hMainWnd, 1219 /*AKD_SETMAININFO*/, 105 /*MIS_CMDLINEBEGIN*/, this.Value);
  },

  SetValue: function()
  {
    oSys.Call("User32::SetWindowTextW", this.Wnd[this.IDVALUE].Handle, this.Value);
    SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
  },

  Command: function(nID, nCode, hWnd)
  {
    if ((nID == this.IDVALUE) && ((nCode == 5 /*CBN_EDITCHANGE*/) || (nCode == 8 /*CBN_CLOSEUP*/)))
    {
      this.Value = GetWindowText(hWnd);
      SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
    }
    else if ((nID == this.IDDEF) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
    {
      this.Value = this.Default;
      this.SetValue();
    }
  }
};

var oCmdLineEnd =
{
  Value  : '',
  Default: '',
  Wnd    : [],
  IDTEXT : 2001,
  IDVALUE: 2002,
  IDDEF  : 2003,
  IDEDIT1: 2004,
  IDEDIT2: 2005,

  Initialize: function()
  {
    SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 106 /*MI_CMDLINEEND*/, lpText);
    this.Value = AkelPad.MemRead(lpText, 1 /*DT_UNICODE*/);
    this.Wnd[this.IDTEXT ] = {Class: 'STATIC',    Style: 0x50000000, X: 140, Y:  20, W: 640, H:  13, Txt: 'Specifies code to be added to the end of the command line before processing it:',
                                                                                                     Rus: 'Задает код, который будет добавлен к концу командной строки, перед ее обработкой:'};
    this.Wnd[this.IDVALUE] = {Class: 'COMBOBOX',  Style: 0x50010042, X: 140, Y:  40, W: 640, H:  21};
    this.Wnd[this.IDDEF  ] = {Class: 'BUTTON',    Style: 0x50010003, X: 140, Y:  71, W: 640, H:  16, Txt: 'By default: ""',
                                                                                                     Rus: 'По умолчанию: ""'};
    this.Wnd[this.IDEDIT1] = {Class: 'AkelEditW', Style: 0x50010800, X: 140, Y:  96, W: 640, H:  21, Txt: 'Example: /Call("Scripts::Main", 1, "InsertDate.js", "") /C /B /L',
                                                                                                     Rus: 'Пример: /Call("Scripts::Main", 1, "InsertDate.js", "") /C /B /L'};
    this.Wnd[this.IDEDIT2] = {Class: 'AkelEditW', Style: 0x50210804, X: 140, Y: 127, W: 640, H: 348, Txt: oCmdLineBegin.Wnd[oCmdLineBegin.IDEDIT2].Txt,
                                                                                                     Rus: oCmdLineBegin.Wnd[oCmdLineBegin.IDEDIT2].Rus};
  },

  Apply: function()
  {
    SendMessage(hMainWnd, 1219 /*AKD_SETMAININFO*/, 106 /*MIS_CMDLINEEND*/, this.Value);
  },

  SetValue: function()
  {
    oSys.Call("User32::SetWindowTextW", this.Wnd[this.IDVALUE].Handle, this.Value);
    SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
  },

  Command: function(nID, nCode, hWnd)
  {
    if ((nID == this.IDVALUE) && ((nCode == 5 /*CBN_EDITCHANGE*/) || (nCode == 8 /*CBN_CLOSEUP*/)))
    {
      this.Value = GetWindowText(hWnd);
      SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
    }
    else if ((nID == this.IDDEF) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
    {
      this.Value = this.Default;
      this.SetValue();
    }
  }
};

var oDateInsertFormat =
{
  Value  : '',
  Default: '',
  Wnd    : [],
  IDTEXT : 2001,
  IDVALUE: 2002,
  IDDEF  : 2003,
  IDEDIT : 2004,

  Initialize: function()
  {
    SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 130 /*MI_DATEINSERTFORMAT*/, lpText);
    this.Value = AkelPad.MemRead(lpText, 1 /*DT_UNICODE*/);
    this.Wnd[this.IDTEXT ] = {Class: 'STATIC',    Style: 0x50000000, X: 140, Y:  20, W: 640, H:  13, Txt: 'Defines insert date and time format:',
                                                                                                     Rus: 'Определяет формат вставляемой даты:'};
    this.Wnd[this.IDVALUE] = {Class: 'COMBOBOX',  Style: 0x50010042, X: 140, Y:  40, W: 640, H:  21};
    this.Wnd[this.IDDEF  ] = {Class: 'BUTTON',    Style: 0x50010003, X: 140, Y:  71, W: 640, H:  16, Txt: 'By default: "" - program defined date and time format.',
                                                                                                     Rus: 'По умолчанию: "" - формат определяется программой.'};
    this.Wnd[this.IDEDIT ] = {Class: 'AkelEditW', Style: 0x50210804, X: 140, Y:  96, W: 640, H: 357, Txt: 'Time:\nh\t\tHours with no leading zero for single-digit hours; 12-hour clock.\nhh\t\tHours with leading zero for single-digit hours; 12-hour clock.\nH\t\tHours with no leading zero for single-digit hours; 24-hour clock.\nHH\t\tHours with leading zero for single-digit hours; 24-hour clock.\nm\t\tMinutes with no leading zero for single-digit minutes.\nmm\t\tMinutes with leading zero for single-digit minutes.\ns\t\tSeconds with no leading zero for single-digit seconds.\nss\t\tSeconds with leading zero for single-digit seconds.\nt\t\tOne character time-marker string, such as A or P.\ntt\t\tMulticharacter time-marker string, such as AM or PM.\n\nDate:\nd\t\tDay of month as digits with no leading zero for single-digit days.\ndd\t\tDay of month as digits with leading zero for single-digit days.\nddd\t\tDay of week as a three-letter abbreviation.\ndddd\tDay of week as its full name.\nM\t\tMonth as digits with no leading zero for single-digit months.\nMM\t\tMonth as digits with leading zero for single-digit months.\nMMM\tMonth as a three-letter abbreviation.\nMMMM\tMonth as its full name.\ny\t\tYear as last two digits, but with no leading zero for years less than 10.\nyy\t\tYear as last two digits, but with leading zero for years less than 10.\nyyyy\t\tYear represented by full four digits.\ngg\t\tPeriod/era string (e.g. B.C., A.D.).\n\nExample: "H:mm:ss dd MMMM yyyy" -> "12:50:24 01 September 2010"',
                                                                                                     Rus: 'Время:\nh\t\tЧасы без ведущего нуля в 12-часовом формате.\nhh\t\tЧасы с ведущим нулем в 12-часовом формате.\nH\t\tЧасы без ведущего нуля в 24-часовом формате.\nHH\t\tЧасы с ведущим нулем в 24-часовом формате.\nm\t\tМинуты без ведущего нуля.\nmm\t\tМинуты с ведущим нулем.\ns\t\tСекунды без ведущего нуля.\nss\t\tСекунды с ведущим нулем.\nt\t\tМаркер (такой как A или P).\ntt\t\tМногосимвольный маркер (такой как AM или PM).\n\nДата:\nd\t\tДень месяца без ведущего нуля.\ndd\t\tДень месяца с ведущим нулем.\nddd\t\tТрехбуквенное сокращение дня недели.\ndddd\tПолное название дня недели.\nM\t\tНомер месяца без ведущего нуля.\nMM\t\tНомер месяца с ведущим нулем.\nMMM\tТрехбуквенное сокращение названия месяца.\nMMMM\tПолное название месяца.\ny\t\tДвухзначное обозначение года без ведущего нуля (последние две цифры года).\nyy\t\tДвухзначное обозначение года с ведущим нулем.\nyyyy\t\tПолный номер года.\ngg\t\tНазвание периода или эры.\n\nПример: "H:mm:ss dd MMMM yyyy" -> "12:50:24 01 сентября 2010"'};
  },

  Apply: function()
  {
    SendMessage(hMainWnd, 1219 /*AKD_SETMAININFO*/, 130 /*MIS_DATEINSERTFORMAT*/, this.Value);
  },

  SetValue: function()
  {
    oSys.Call("User32::SetWindowTextW", this.Wnd[this.IDVALUE].Handle, this.Value);
    SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
  },

  Command: function(nID, nCode, hWnd)
  {
    if ((nID == this.IDVALUE) && ((nCode == 5 /*CBN_EDITCHANGE*/) || (nCode == 8 /*CBN_CLOSEUP*/)))
    {
      this.Value = GetWindowText(hWnd);
      SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
    }
    else if ((nID == this.IDDEF) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
    {
      this.Value = this.Default;
      this.SetValue();
    }
  }
};

var oDateLogFormat =
{
  Value   : '',
  Default : '',
  Enable  : 0,
  Wnd     : [],
  IDTEXT  : 2001,
  IDVALUE : 2002,
  IDDEF   : 2003,
  IDENABLE: 2004,
  IDEDIT  : 2005,

  Initialize: function()
  {
    SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 129 /*MI_DATELOGFORMAT*/, lpText);
    this.Value  = AkelPad.MemRead(lpText, 1 /*DT_UNICODE*/);
    this.Enable = SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 217 /*MI_DATELOG*/, 0);
    this.Wnd[this.IDTEXT  ] = {Class: 'STATIC',    Style: 0x50000000, X: 140, Y:  20, W: 640, H:  13, Txt: 'Defines date and time format for files containing ".LOG" at the beginning:',
                                                                                                      Rus: 'Определяет формат даты для файлов содержащих ".LOG" в начале:'};
    this.Wnd[this.IDVALUE ] = {Class: 'COMBOBOX',  Style: 0x50010042, X: 140, Y:  40, W: 640, H:  21};
    this.Wnd[this.IDDEF   ] = {Class: 'BUTTON',    Style: 0x50010003, X: 140, Y:  71, W: 640, H:  16, Txt: oDateInsertFormat.Wnd[oDateInsertFormat.IDDEF].Txt,
                                                                                                      Rus: oDateInsertFormat.Wnd[oDateInsertFormat.IDDEF].Rus};
    this.Wnd[this.IDENABLE] = {Class: 'BUTTON',    Style: 0x50010003, X: 140, Y:  91, W: 640, H:  16, Txt: 'Works only if enabled "Insert date if file has .LOG at the beginning" in settings (DateLog=1).',
                                                                                                      Rus: 'Работает только при отмеченном пункте в настройках "Вставить дату, если файл содержит .LOG в начале" (DateLog=1).'};
    this.Wnd[this.IDEDIT  ] = {Class: 'AkelEditW', Style: 0x50210804, X: 140, Y: 117, W: 640, H: 357, Txt: oDateInsertFormat.Wnd[oDateInsertFormat.IDEDIT].Txt,
                                                                                                      Rus: oDateInsertFormat.Wnd[oDateInsertFormat.IDEDIT].Rus};
  },

  Apply: function()
  {
    SendMessage(hMainWnd, 1219 /*AKD_SETMAININFO*/, 129 /*MIS_DATELOGFORMAT*/, this.Value);
    SendMessage(hMainWnd, 1219 /*AKD_SETMAININFO*/, 217 /*MIS_DATELOG*/, this.Enable);
  },

  SetValue: function()
  {
    oSys.Call("User32::SetWindowTextW", this.Wnd[this.IDVALUE].Handle, this.Value);
    SendMessage(this.Wnd[this.IDDEF   ].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
    SendMessage(this.Wnd[this.IDENABLE].Handle, 241 /*BM_SETCHECK*/, this.Enable, 0);
  },

  Command: function(nID, nCode, hWnd)
  {
    if ((nID == this.IDVALUE) && ((nCode == 5 /*CBN_EDITCHANGE*/) || (nCode == 8 /*CBN_CLOSEUP*/)))
    {
      this.Value = GetWindowText(hWnd);
      SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
    }
    else if ((nID == this.IDDEF) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
    {
      this.Value = this.Default;
      this.SetValue();
    }
    else if (nID == this.IDENABLE)
      this.Enable = SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0);
  }
};

var oMouseOptions =
{
  Value    : 0,
  Default  : 7,
  Wnd      : [],
  IDTEXT   : 2001,
  IDBUTTON1: 2002,
  IDBUTTON2: 2003,
  IDBUTTON3: 2004,
  IDBUTTON4: 2005,
  IDBUTTON5: 2006,
  IDBUTTON6: 2007,
  IDBUTTON7: 2008,
  IDBUTTON8: 2009,
  IDDEF    : 2010,
  IDSUM    : 2011,

  Initialize: function()
  {
    if (! hEditWnd)
      SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4101 /*wParam=MAKEWPARAM(0,IDM_FILE_NEW)*/, 1 /*lParam=TRUE*/);

    this.Value = SendMessage(hMainWnd, 1223 /*AKD_GETFRAMEINFO*/, 87 /*FI_MOUSEOPTIONS*/, 0);

    if (! hEditWnd)
      AkelPad.Command(4318 /*IDM_WINDOW_FRAMECLOSE*/);

    this.Wnd[this.IDTEXT   ] = {Class: 'STATIC', Style: 0x50000000, X: 140, Y:  20, W: 640, H:  13,                                        Txt: 'Defines mouse settings. Set by the sum of members:',
                                                                                                                                           Rus: 'Определяет настройки мыши. Задается суммой членов:'};
    this.Wnd[this.IDBUTTON1] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  40, W: 640, H:  16, Type:   1 /*MO_LEFTMARGINSELECTION*/,  Txt: '1 - GUI (left click on margin selects line).'};
    this.Wnd[this.IDBUTTON2] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  60, W: 640, H:  16, Type:   2 /*MO_RICHEDITMOUSE*/,        Txt: '2 - GUI (use RichEdit mouse selection).'};
    this.Wnd[this.IDBUTTON3] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  80, W: 640, H:  16, Type:   4 /*MO_MOUSEDRAGGING*/,        Txt: '4 - GUI (enable mouse dragging).'};
    this.Wnd[this.IDBUTTON4] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 100, W: 640, H:  16, Type:   8 /*MO_RCLICKMOVECARET*/,      Txt: '8 - GUI (right click moves caret).'};
    this.Wnd[this.IDBUTTON5] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 120, W: 640, H:  16, Type:  16 /*MO_NONEWLINEMOUSESELECT*/, Txt: '16 - Triple click and left margin click selects line without newline character(s).',
                                                                                                                                           Rus: '16 - Не выделять новую строку при клике в зону левого отступа, а также при тройном клике.'};
    this.Wnd[this.IDBUTTON6] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 140, W: 640, H:  16, Type:  32 /*MO_NOWHEELFONTCHANGE*/,    Txt: '32 - Disable font size change using Ctrl+mouse scroll wheel.',
                                                                                                                                           Rus: '32 - Не менять размер шрифта посредством колесика мыши и клавиши Ctrl.'};
    this.Wnd[this.IDBUTTON7] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 160, W: 640, H:  16, Type:  64 /*MO_MARGINSELUNWRAPLINE*/,  Txt: '64 - Left margin line selection with mouse selects all wrapped line.',
                                                                                                                                           Rus: '64 - Выделять всю, разделенную переносами, строку при клике в зону левого отступа.'};
    this.Wnd[this.IDBUTTON8] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 180, W: 640, H:  16, Type: 128 /*MO_MBUTTONDOWNNOSCROLL*/,  Txt: '128 - No scrolling after middle mouse click.',
                                                                                                                                           Rus: '128 - Не прокручивать окно после клика средней клавишей мыши.'};
    this.Wnd[this.IDDEF    ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 226, W: 640, H:  16,                                        Txt: 'By default: 1+2+4=7',
                                                                                                                                           Rus: 'По умолчанию: 1+2+4=7'};
    this.Wnd[this.IDSUM    ] = {Class: 'STATIC', Style: 0x50000000, X: 150, Y: 200, W:  70, H:  13};
  },

  Apply: function()
  {
    if (! hEditWnd)
      SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4101 /*wParam=MAKEWPARAM(0,IDM_FILE_NEW)*/, 1 /*lParam=TRUE*/);

    AkelPad.SetFrameInfo(0, 34 /*FIS_MOUSEOPTIONS*/, this.Value);

    if (! hEditWnd)
      AkelPad.Command(4318 /*IDM_WINDOW_FRAMECLOSE*/);
  },

  SetValue: function()
  {
    for (var i = this.IDBUTTON1; i <= this.IDBUTTON8; ++i)
      SendMessage(this.Wnd[i].Handle, 241 /*BM_SETCHECK*/, this.Value & this.Wnd[i].Type, 0);
    oSys.Call("User32::SetWindowTextW", this.Wnd[this.IDSUM].Handle, '=' + this.Value);
    SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
  },

  Command: function(nID, nCode, hWnd)
  {
    if ((nID >= this.IDBUTTON1) && (nID <= this.IDBUTTON8))
    {
      this.Value = 0;
      for (var i = this.IDBUTTON1; i <= this.IDBUTTON8; ++i)
      {
        if (SendMessage(this.Wnd[i].Handle, 240 /*BM_GETCHECK*/, 0, 0))
          this.Value |= this.Wnd[i].Type;
      }
      this.SetValue();
    }
    else if ((nID == this.IDDEF) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
    {
      this.Value = this.Default;
      this.SetValue();
    }
  }
};

var oPaintOptions =
{
  Value    : 0,
  Default  : 0,
  Wnd      : [],
  IDTEXT   : 2001,
  IDBUTTON1: 2002,
  IDBUTTON2: 2003,
  IDBUTTON3: 2004,
  IDBUTTON4: 2005,
  IDBUTTON5: 2006,
  IDBUTTON6: 2007,
  IDBUTTON7: 2008,
  IDBUTTON8: 2009,
  IDDEF    : 2010,
  IDSUM    : 2011,
  IDNOTE   : 2012,

  Initialize: function()
  {
    this.Value = SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 121 /*MI_PAINTOPTIONS*/, 0);
    this.Wnd[this.IDTEXT   ] = {Class: 'STATIC', Style: 0x50000000, X: 140, Y:  20, W: 640, H:  13,                                             Txt: 'Defines, some text draw settings. Sets by the sum of members:',
                                                                                                                                                Rus: 'Определяет некоторые установки по рисованию текста. Задается суммой членов:'};
    this.Wnd[this.IDBUTTON1] = {Class: 'BUTTON', Style: 0x50012403, X: 140, Y:  40, W: 640, H:  52, Type:    1 /*PAINT_PAINTGROUP*/,            Txt: '1 - Paint text by groups of characters (default is character by character). With this flag some text recognition programs could start to work, printer could print faster, but highlighted symbols and combined unicode symbols can be drawn differently and editing of whose characters may become uncomfortable.',
                                                                                                                                                Rus: '1 - Рисование текста по группам символов (по умолчанию посимвольная прорисовка). С этим флагом некоторые программы, использующие графическое распознавание текста, могут начать работать (если не работали), принтер может печатать быстрее, но подсвеченные символы и комбинированные символы юникода могут рисоваться иначе, а также редактирование этих символов может стать некомфортным.'};
    this.Wnd[this.IDBUTTON2] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  98, W: 640, H:  16, Type:    2 /*PAINT_NONEWLINEDRAW*/,         Txt: '2 - Disable drawing new line selection as space character.',
                                                                                                                                                Rus: '2 - Не рисовать выделение перевода строки как пробела.'};
    this.Wnd[this.IDBUTTON3] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 118, W: 640, H:  16, Type:    4 /*PAINT_ENTIRENEWLINEDRAW*/,     Txt: '4 - Draw newline selection to right edge of text area.',
                                                                                                                                                Rus: '4 - Рисовать выделение перевода строки до правой границы.'};
    this.Wnd[this.IDBUTTON4] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 138, W: 640, H:  16, Type:    8 /*PAINT_HIDESEL*/,               Txt: '8 - Hides the selection when the control loses the input focus.',
                                                                                                                                                Rus: '8 - Скрывать выделение при потере фокуса.'};
    this.Wnd[this.IDBUTTON5] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 158, W: 640, H:  16, Type:   16 /*PAINT_NOMARKERAFTERLASTLINE*/, Txt: '16 - Disable marker painting after last line.',
                                                                                                                                                Rus: '16 - Не рисовать вертикальный маркер после последней строки.'};
    this.Wnd[this.IDBUTTON6] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 178, W: 640, H:  16, Type:  256 /*PAINT_HIDENOSCROLL*/,          Txt: '256 - Show scroll bars only when needed.',
                                                                                                                                                Rus: '256 - Скрывать прокрутку текста у окна редактирования, если она не требуется.'};
    this.Wnd[this.IDBUTTON7] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 198, W: 640, H:  16, Type:  512 /*PAINT_STATICEDGE*/,            Txt: '512 - Draw thin edit window border.',
                                                                                                                                                Rus: '512 - Рисовать тонкую границу у окна редактирования.'};
    this.Wnd[this.IDBUTTON8] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 218, W: 640, H:  16, Type: 1024 /*PAINT_NOEDGE*/,                Txt: '1024 - Draw no edit window border.',
                                                                                                                                                Rus: '1024 - Не рисовать границу у окна редактирования.'};
    this.Wnd[this.IDDEF    ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 264, W: 640, H:  16,                                             Txt: 'By default: 0',
                                                                                                                                                Rus: 'По умолчанию: 0'};
    this.Wnd[this.IDSUM    ] = {Class: 'STATIC', Style: 0x50000000, X: 150, Y: 238, W:  70, H:  13};
    this.Wnd[this.IDNOTE   ] = {Class: 'STATIC', Style: 0x50000000, X: 140, Y: 293, W: 640, H:  13,                                             Txt: 'Note: changes are applied for a new edit windows.'};
  },

  Apply: function()
  {
    SendMessage(hMainWnd, 1219 /*AKD_SETMAININFO*/, 121 /*MIS_PAINTOPTIONS*/, this.Value);
  },

  SetValue: function()
  {
    for (var i = this.IDBUTTON1; i <= this.IDBUTTON8; ++i)
      SendMessage(this.Wnd[i].Handle, 241 /*BM_SETCHECK*/, this.Value & this.Wnd[i].Type, 0);
    oSys.Call("User32::SetWindowTextW", this.Wnd[this.IDSUM].Handle, '=' + this.Value);
    SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
  },

  Command: function(nID, nCode, hWnd)
  {
    if ((nID >= this.IDBUTTON1) && (nID <= this.IDBUTTON8))
    {
      this.Value = 0;
      for (var i = this.IDBUTTON1; i <= this.IDBUTTON8; ++i)
      {
        if (SendMessage(this.Wnd[i].Handle, 240 /*BM_GETCHECK*/, 0, 0))
          this.Value |= this.Wnd[i].Type;
      }
      this.SetValue();
    }
    else if ((nID == this.IDDEF) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
    {
      this.Value = this.Default;
      this.SetValue();
    }
  }
};

var oRichEditClass =
{
  Value    : 0,
  Default  : 0,
  Wnd      : [],
  IDTEXT   : 2001,
  IDBUTTON1: 2002,
  IDBUTTON2: 2003,
  IDDEF    : 2004,
  IDNOTE   : 2005,

  Initialize: function()
  {
    this.Value = SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 125 /*MI_RICHEDITCLASS*/, 0);
    this.Wnd[this.IDTEXT   ] = {Class: 'STATIC', Style: 0x50000000, X: 140, Y:  20, W: 640, H:  13, Txt: 'Defines edit control class name:',
                                                                                                    Rus: 'Определяет какое имя класса будет у окна редактирования:'};
    this.Wnd[this.IDBUTTON1] = {Class: 'BUTTON', Style: 0x50010009, X: 140, Y:  40, W: 640, H:  16, Txt: '0 - "AkelEdit".'};
    this.Wnd[this.IDBUTTON2] = {Class: 'BUTTON', Style: 0x50010009, X: 140, Y:  60, W: 640, H:  16, Txt: '1 - "RichEdit20".'};
    this.Wnd[this.IDDEF    ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  86, W: 640, H:  16, Txt: 'By default: 0',
                                                                                                    Rus: 'По умолчанию: 0'};
    this.Wnd[this.IDNOTE   ] = {Class: 'STATIC', Style: 0x50000000, X: 140, Y: 115, W: 640, H:  13, Txt: 'Note: changes are applied for a new edit windows.'};
  },

  Apply: function()
  {
    SendMessage(hMainWnd, 1219 /*AKD_SETMAININFO*/, 125 /*MIS_RICHEDITCLASS*/, this.Value);
  },

  SetValue: function()
  {
    for (var i = this.IDBUTTON1; i <= this.IDBUTTON2; ++i)
      SendMessage(this.Wnd[i].Handle, 241 /*BM_SETCHECK*/, this.Value == i - this.IDBUTTON1, 0);
    SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
  },

  Command: function(nID, nCode, hWnd)
  {
    if ((nID >= this.IDBUTTON1) && (nID <= this.IDBUTTON2))
    {
      this.Value = nID - this.IDBUTTON1;
      this.SetValue();
      SendMessage(aDlg[IDENGB + nLang].Handle, 241 /*BM_SETCHECK*/, 1, 0);
    }
    else if ((nID == this.IDDEF) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
    {
      this.Value = this.Default;
      this.SetValue();
    }
    else if ((nID == IDENGB) ||(nID == IDRUSB))
      this.SetValue();
  }
};

var oShowModify =
{
  Value    : 0,
  Default  : 9,
  ShowAll  : 15,
  Wnd      : [],
  IDTEXT   : 2001,
  IDBUTTON1: 2002,
  IDBUTTON2: 2003,
  IDBUTTON3: 2004,
  IDBUTTON4: 2005,
  IDDEF    : 2006,
  IDALL    : 2007,
  IDSUM    : 2008,

  Initialize: function()
  {
    this.Value = SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 110 /*MI_SHOWMODIFY*/, 0);
    this.Wnd[this.IDTEXT   ] = {Class: 'STATIC', Style: 0x50000000, X: 140, Y:  20, W: 640, H:  13,                                Txt: 'Determines where document changed status will be displayed. Set by the sum of members:',
                                                                                                                                   Rus: 'Определяет, где можно будет увидеть, что документ изменен. Задается суммой членов:'};
    this.Wnd[this.IDBUTTON1] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  40, W: 640, H:  16, Type: 1 /*SM_STATUSBAR*/,      Txt: '1 - Display "Modified" in status bar.',
                                                                                                                                   Rus: '1 - Отображение "Изменен" в строке состояния.'};
    this.Wnd[this.IDBUTTON2] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  60, W: 640, H:  16, Type: 2 /*SM_MAINTITLE_SDI*/,  Txt: '2 - Display asterisk * in main window title (SDI).',
                                                                                                                                   Rus: '2 - Отображение звездочки * в заголовке главного окна (SDI).'};
    this.Wnd[this.IDBUTTON3] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  80, W: 640, H:  16, Type: 4 /*SM_FRAMETITLE_MDI*/, Txt: '4 - Display asterisk * in main window title and in frame window title (MDI/PMDI).',
                                                                                                                                   Rus: '4 - Отображение звездочки * в заголовке главного окна и в заголовке окна вкладки (MDI/PMDI).'};
    this.Wnd[this.IDBUTTON4] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 100, W: 640, H:  16, Type: 8 /*SM_TABTITLE_MDI*/,   Txt: '8 - Display asterisk * in tab button name (MDI/PMDI).',
                                                                                                                                   Rus: '8 - Отображение звездочки * в имени кнопки вкладки (MDI/PMDI).'};
    this.Wnd[this.IDDEF    ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 146, W: 640, H:  16,                                Txt: 'By default: 1+8=9',
                                                                                                                                   Rus: 'По умолчанию: 1+8=9'};
    this.Wnd[this.IDALL    ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 166, W: 640, H:  16,                                Txt: 'Show all: 1+2+4+8=15',
                                                                                                                                   Rus: 'Отображать везде: 1+2+4+8=15'};
    this.Wnd[this.IDSUM    ] = {Class: 'STATIC', Style: 0x50000000, X: 150, Y: 120, W:  70, H:  13};
  },

  Apply: function()
  {
    SendMessage(hMainWnd, 1219 /*AKD_SETMAININFO*/, 110 /*MIS_SHOWMODIFY*/, this.Value);
  },

  SetValue: function()
  {
    for (var i = this.IDBUTTON1; i <= this.IDBUTTON4; ++i)
      SendMessage(this.Wnd[i].Handle, 241 /*BM_SETCHECK*/, this.Value & this.Wnd[i].Type, 0);
    oSys.Call("User32::SetWindowTextW", this.Wnd[this.IDSUM].Handle, '=' + this.Value);
    SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
    SendMessage(this.Wnd[this.IDALL].Handle, 241 /*BM_SETCHECK*/, this.Value == this.ShowAll, 0);
  },

  Command: function(nID, nCode, hWnd)
  {
    if ((nID >= this.IDBUTTON1) && (nID <= this.IDBUTTON4))
    {
      this.Value = 0;
      for (var i = this.IDBUTTON1; i <= this.IDBUTTON4; ++i)
      {
        if (SendMessage(this.Wnd[i].Handle, 240 /*BM_GETCHECK*/, 0, 0))
          this.Value |= this.Wnd[i].Type;
      }
      this.SetValue();
    }
    else if (((nID == this.IDDEF) || (nID == this.IDALL)) && (SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0)))
    {
      this.Value = (nID == this.IDDEF) ? this.Default : this.ShowAll;
      this.SetValue();
    }
  }
};

var oStatusPosType =
{
  Value    : 0,
  Default  : 0,
  Wnd      : [],
  IDTEXT   : 2001,
  IDBUTTON1: 2002,
  IDBUTTON2: 2003,
  IDDEF    : 2004,
  IDSUM    : 2005,

  Initialize: function()
  {
    this.Value = SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 111 /*MI_STATUSPOSTYPE*/, 0);
    this.Wnd[this.IDTEXT   ] = {Class: 'STATIC', Style: 0x50000000, X: 140, Y:  20, W: 640, H:  13,                           Txt: 'Defines how status bar statistics will be displayed. Set by the sum of members:',
                                                                                                                              Rus: 'Определяет, как будет отражаться статистика в строке статуса. Задается суммой членов:'};
    this.Wnd[this.IDBUTTON1] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  40, W: 640, H:  16, Type: 1 /*SPT_COLUMN*/,   Txt: '1 - "Line:Column". By default: "Line:Symbol".',
                                                                                                                              Rus: '1 - "Строка:Столбец". По умолчанию: "Строка:Символ".'};
    this.Wnd[this.IDBUTTON2] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  60, W: 640, H:  16, Type: 2 /*SPT_LINEWRAP*/, Txt: '2 - Wrap line numbers. By default: Non-wrap line numbers.',
                                                                                                                              Rus: '2 - Перенесённые номера строк. По умолчанию: неперенесённые номера строк.'};
    this.Wnd[this.IDDEF    ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 106, W: 640, H:  16,                           Txt: 'By default: 0',
                                                                                                                              Rus: 'По умолчанию: 0'};
    this.Wnd[this.IDSUM    ] = {Class: 'STATIC', Style: 0x50000000, X: 150, Y:  80, W:  70, H:  13};
  },

  Apply: function()
  {
    SendMessage(hMainWnd, 1219 /*AKD_SETMAININFO*/, 111 /*MIS_STATUSPOSTYPE*/, this.Value);
  },

  SetValue: function()
  {
    for (var i = this.IDBUTTON1; i <= this.IDBUTTON2; ++i)
      SendMessage(this.Wnd[i].Handle, 241 /*BM_SETCHECK*/, this.Value & this.Wnd[i].Type, 0);
    oSys.Call("User32::SetWindowTextW", this.Wnd[this.IDSUM].Handle, '=' + this.Value);
    SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
  },

  Command: function(nID, nCode, hWnd)
  {
    if ((nID >= this.IDBUTTON1) && (nID <= this.IDBUTTON2))
    {
      this.Value = 0;
      for (var i = this.IDBUTTON1; i <= this.IDBUTTON2; ++i)
      {
        if (SendMessage(this.Wnd[i].Handle, 240 /*BM_GETCHECK*/, 0, 0))
          this.Value |= this.Wnd[i].Type;
      }
      this.SetValue();
    }
    else if ((nID == this.IDDEF) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
    {
      this.Value = this.Default;
      this.SetValue();
    }
  }
};

var oStatusUserFormat =
{
  Value  : '',
  Default: '',
  Wnd    : [],
  IDTEXT : 2001,
  IDVALUE: 2002,
  IDDEF  : 2003,
  IDEDIT : 2004,

  Initialize: function()
  {
    SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 112 /*MI_STATUSUSERFORMAT*/, lpText);
    this.Value = AkelPad.MemRead(lpText, 1 /*DT_UNICODE*/).replace(/\t/g, '\\t');
    this.Wnd[this.IDTEXT ] = {Class: 'STATIC',    Style: 0x50000000, X: 140, Y:  20, W: 640, H:  13, Txt: 'Defines user status bar format:',
                                                                                                     Rus: 'Определяет формат пользователя для строки состояния:'};
    this.Wnd[this.IDVALUE] = {Class: 'COMBOBOX',  Style: 0x50010042, X: 140, Y:  40, W: 640, H:  21};
    this.Wnd[this.IDDEF  ] = {Class: 'BUTTON',    Style: 0x50010003, X: 140, Y:  71, W: 640, H:  16, Txt: 'By default: "" - format is not defined, additional status bar section is not displayed.',
                                                                                                     Rus: 'По умолчанию: "" - формат не определен, дополнительная секция строки состояния не отображается.'};
    this.Wnd[this.IDEDIT ] = {Class: 'AkelEditW', Style: 0x50210804, X: 140, Y:  96, W: 640, H: 383, Txt: '%[width]\t\tAdd status bar delimiter.\n%Ch\t\t\tCurrent character hex code in file codepage (lowercase).\n%CH\t\t\tCurrent character hex code in file codepage (uppercase).\n%ch\t\t\tCurrent character hex code (lowercase).\n%cH\t\t\tCurrent character hex code (uppercase).\n%cd\t\t\tCurrent character decimal code.\n%cl\t\t\tCurrent character letter.\n%or\t\t\tOffset in symbols. Any newline breaks counted as one symbol (RichEdit).\n%ob\t\t\tOffset in symbols. Newline breaks: \\r\\r\\n - three symbols, \\r\\n - two symbols, \\r - one symbol, \\n - one symbol.\n%al\t\t\tCount of lines in document.\n%ar\t\t\tCount of symbols in document (RichEdit).\n%lb\t\t\tNumber of first selected line.\n%le\t\t\tNumber of last selected line.\n%ls\t\t\tCount of lines in selection.\n%f\t\t\tFont size.\n%t\t\t\tTabulation size.\n%m\t\t\tColumn marker position.\n%cap[text]\tText displayed when "Caps Lock" is on.\n%num[text]\tText displayed when "Num Lock" is on.\n%se[text]\t\tText displayed when end of the document reached during search.\n%r\t\t\tReplace count after "Replace all".\n%dc\t\t\tCount of all documents (MDI/PMDI).\n%dm\t\t\tCount of modified documents (MDI/PMDI).\n%ds\t\t\tCount of unmodified documents (MDI/PMDI).\n%di\t\t\tActive document index (MDI/PMDI).\n%%\t\t\t% symbol.\nTabulation\tOne tabulation aligns text to center, second tabulation to right edge (use \\t or \\t\\t).\n\nExample: "Symbol:0x%ch%[85]Font:%f%[48]Tab:%t%[38]Marker:%m%[60]Docs:%dm*/%dc"',
                                                                                                     Rus: '%[ширина]\tДобавить разделитель в строку состояния.\n%Ch\t\t\tШестнадцатеричный код текущего символа в кодировке файла (нижний регистр).\n%CH\t\t\tШестнадцатеричный код текущего символа в кодировке файла (верхний регистр).\n%ch\t\t\tШестнадцатеричный код текущего символа (нижний регистр).\n%cH\t\t\tШестнадцатеричный код текущего символа (верхний регистр).\n%cd\t\t\tДесятеричный код текущего символа.\n%cl\t\t\tБуква текущего символа.\n%or\t\t\tСмещение в символах. Любые переводы строки считаются за один символ (RichEdit).\n%ob\t\t\tСмещение в символах. Переводы строки: \\r\\r\\n - три символа, \\r\\n - два символа, \\r - один символ, \\n - один символ.\n%al\t\t\tКоличество строк в документе.\n%ar\t\t\tКоличество символов в документе (RichEdit).\n%lb\t\t\tНомер первой строки выделения.\n%le\t\t\tНомер последней строки выделения.\n%ls\t\t\tКоличество выделенных строк.\n%f\t\t\tРазмер шрифта.\n%t\t\t\tРазмер табуляции.\n%m\t\t\tРазмер вертикального маркера.\n%cap[текст]\tТекст отображающийся при включенной клавише CapsLock.\n%num[текст]\tТекст отображающийся при включенной клавише NumLock.\n%se[текст]\tТекст отображающийся по достижению конца документа при поиске.\n%r\t\t\tКоличество замен после "Заменить все".\n%dc\t\t\tКоличество всех документов (MDI/PMDI).\n%dm\t\t\tКоличество измененных документов (MDI/PMDI).\n%ds\t\t\tКоличество неизмененных документов (MDI/PMDI).\n%di\t\t\tИндекс активного документа (MDI/PMDI).\n%%\t\t\tСимвол %.\nТабуляция\tПервая табуляция выравнивает текст по центру, вторая по правому краю (\\t или \\t\\t).\n\nПример: "Символ:0x%ch%[88]Шрифт:%f%[62]Таб:%t%[38]Маркер:%m%[64]Док:%dm*/%dc"'};
  },

  Apply: function()
  {
    SendMessage(hMainWnd, 1219 /*AKD_SETMAININFO*/, 112 /*MIS_STATUSUSERFORMAT*/, this.Value.replace(/\\t/g, '\t'));
  },

  SetValue: function()
  {
    oSys.Call("User32::SetWindowTextW", this.Wnd[this.IDVALUE].Handle, this.Value);
    SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
  },

  Command: function(nID, nCode, hWnd)
  {
    if ((nID == this.IDVALUE) && ((nCode == 5 /*CBN_EDITCHANGE*/) || (nCode == 8 /*CBN_CLOSEUP*/)))
    {
      this.Value = GetWindowText(hWnd);
      SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
    }
    else if ((nID == this.IDDEF) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
    {
      this.Value = this.Default;
      this.SetValue();
    }
  }
};

var oTabOptionsMDI =
{
  Value     : 0,
  Default   : 131330,
  Wnd       : [],
  IDTEXT    : 2001,
  IDBUTTON1 : 2002,
  IDBUTTON2 : 2003,
  IDBUTTON3 : 2004,
  IDBUTTON4 : 2005,
  IDBUTTON5 : 2006,
  IDBUTTON6 : 2007,
  IDBUTTON7 : 2008,
  IDBUTTON8 : 2009,
  IDBUTTON9 : 2010,
  IDBUTTON10: 2011,
  IDBUTTON11: 2012,
  IDBUTTON12: 2013,
  IDBUTTON13: 2014,
  IDDEF     : 2015,
  IDSUM     : 2016,

  Initialize: function()
  {
    this.Value = SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 157 /*MI_TABOPTIONSMDI*/, 0);
    this.Wnd[this.IDTEXT    ] = {Class: 'STATIC', Style: 0x50000000, X: 140, Y:  20, W: 640, H:  13,                                            Txt: 'Defines tabs settings in MDI/PMDI mode. Set by the sum of members:',
                                                                                                                                                Rus: 'Определяет настройки вкладок в режиме MDI/PMDI. Задается суммой членов:'};
    this.Wnd[this.IDBUTTON1 ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  40, W: 640, H:  16, Type: 1       /*TAB_VIEW_NONE*/,           Txt: '1 - GUI (tabs are hidden).'};
    this.Wnd[this.IDBUTTON2 ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  60, W: 640, H:  16, Type: 2       /*TAB_VIEW_TOP*/,            Txt: '2 - GUI (tabs shown at top of edit window).'};
    this.Wnd[this.IDBUTTON3 ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  80, W: 640, H:  16, Type: 4       /*TAB_VIEW_BOTTOM*/,         Txt: '4 - GUI (tabs shown at bottom of edit window).'};
    this.Wnd[this.IDBUTTON4 ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 100, W: 640, H:  16, Type: 256     /*TAB_TYPE_STANDARD*/,       Txt: '256 - GUI (standard tab style).'};
    this.Wnd[this.IDBUTTON5 ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 120, W: 640, H:  16, Type: 512     /*TAB_TYPE_BUTTONS*/,        Txt: '512 - GUI (button tab style).'};
    this.Wnd[this.IDBUTTON6 ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 140, W: 640, H:  16, Type: 1024    /*TAB_TYPE_FLATBUTTONS*/,    Txt: '1024 - GUI (flat button tab style).'};
    this.Wnd[this.IDBUTTON7 ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 160, W: 640, H:  16, Type: 65536   /*TAB_SWITCH_NEXTPREV*/,     Txt: '65536 - GUI (hotkeys transfer focus as next-prev).'};
    this.Wnd[this.IDBUTTON8 ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 180, W: 640, H:  16, Type: 131072  /*TAB_SWITCH_RIGHTLEFT*/,    Txt: '131072 - GUI (hotkeys transfer focus as right-left).'};
    this.Wnd[this.IDBUTTON9 ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 200, W: 640, H:  16, Type: 524288  /*TAB_ADD_AFTERCURRENT*/,    Txt: '524288 - create tabs after the current one.',
                                                                                                                                                Rus: '524288 - создавать вкладки сразу после текущей.'};
    this.Wnd[this.IDBUTTON10] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 220, W: 640, H:  16, Type: 1048576 /*TAB_NOADD_LBUTTONDBLCLK*/, Txt: '1048576 - disable new tab creation using left button double click on the tab bar.',
                                                                                                                                                Rus: '1048576 - не создавать вкладки двойным кликом левой кнопки по панели вкладок.'};
    this.Wnd[this.IDBUTTON11] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 240, W: 640, H:  16, Type: 2097152 /*TAB_NOADD_MBUTTONDOWN*/,   Txt: '2097152 - disable new tab creation using middle button click on the tab bar.',
                                                                                                                                                Rus: '2097152 - не создавать вкладки кликом средней кнопки по панели вкладок.'};
    this.Wnd[this.IDBUTTON12] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 260, W: 640, H:  16, Type: 4194304 /*TAB_NODEL_LBUTTONDBLCLK*/, Txt: '4194304 - disable close tab using left button double click on the tab.',
                                                                                                                                                Rus: '4194304 - не закрывать вкладки двойным кликом левой кнопки по вкладке.'};
    this.Wnd[this.IDBUTTON13] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 280, W: 640, H:  16, Type: 8388608 /*TAB_NODEL_MBUTTONDOWN*/,   Txt: '8388608 - disable close tab using middle button click on the tab.',
                                                                                                                                                Rus: '8388608 - не закрывать вкладки кликом средней кнопки по вкладке.'};
    this.Wnd[this.IDDEF     ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 326, W: 640, H:  16,                                            Txt: 'By default: 2+256+131072=131330',
                                                                                                                                                Rus: 'По умолчанию: 2+256+131072=131330'};
    this.Wnd[this.IDSUM     ] = {Class: 'STATIC', Style: 0x50000000, X: 150, Y: 300, W:  70, H:  13};
  },

  Apply: function()
  {
    SendMessage(hMainWnd, 1219 /*AKD_SETMAININFO*/, 157 /*MIS_TABOPTIONSMDI*/, this.Value);
  },

  SetValue: function()
  {
    for (var i = this.IDBUTTON1; i <= this.IDBUTTON13; ++i)
      SendMessage(this.Wnd[i].Handle, 241 /*BM_SETCHECK*/, this.Value & this.Wnd[i].Type, 0);
    oSys.Call("User32::SetWindowTextW", this.Wnd[this.IDSUM].Handle, '=' + this.Value);
    SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
  },

  Command: function(nID, nCode, hWnd)
  {
    if ((nID >= this.IDBUTTON1) && (nID <= this.IDBUTTON13))
    {
      if (nID == this.IDBUTTON1)
      {
        if (SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
        {
          SendMessage(this.Wnd[this.IDBUTTON2].Handle, 241 /*BM_SETCHECK*/, 0, 0);
          SendMessage(this.Wnd[this.IDBUTTON3].Handle, 241 /*BM_SETCHECK*/, 0, 0);
        }
        else
          SendMessage(this.Wnd[this.IDBUTTON2].Handle, 241 /*BM_SETCHECK*/, 1, 0);
      }
      else if (nID == this.IDBUTTON2)
      {
        if (SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
        {
          SendMessage(this.Wnd[this.IDBUTTON1].Handle, 241 /*BM_SETCHECK*/, 0, 0);
          SendMessage(this.Wnd[this.IDBUTTON3].Handle, 241 /*BM_SETCHECK*/, 0, 0);
        }
        else
          SendMessage(this.Wnd[this.IDBUTTON3].Handle, 241 /*BM_SETCHECK*/, 1, 0);
      }
      else if (nID == this.IDBUTTON3)
      {
        if (SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
        {
          SendMessage(this.Wnd[this.IDBUTTON1].Handle, 241 /*BM_SETCHECK*/, 0, 0);
          SendMessage(this.Wnd[this.IDBUTTON2].Handle, 241 /*BM_SETCHECK*/, 0, 0);
        }
        else
          SendMessage(this.Wnd[this.IDBUTTON2].Handle, 241 /*BM_SETCHECK*/, 1, 0);
      }

      else if (nID == this.IDBUTTON4)
      {
        if (SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
        {
          SendMessage(this.Wnd[this.IDBUTTON5].Handle, 241 /*BM_SETCHECK*/, 0, 0);
          SendMessage(this.Wnd[this.IDBUTTON6].Handle, 241 /*BM_SETCHECK*/, 0, 0);
        }
        else
          SendMessage(this.Wnd[this.IDBUTTON5].Handle, 241 /*BM_SETCHECK*/, 1, 0);
      }
      else if (nID == this.IDBUTTON5)
      {
        if (SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
        {
          SendMessage(this.Wnd[this.IDBUTTON4].Handle, 241 /*BM_SETCHECK*/, 0, 0);
          SendMessage(this.Wnd[this.IDBUTTON6].Handle, 241 /*BM_SETCHECK*/, 0, 0);
        }
        else
          SendMessage(this.Wnd[this.IDBUTTON6].Handle, 241 /*BM_SETCHECK*/, 1, 0);
      }
      else if (nID == this.IDBUTTON6)
      {
        if (SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
        {
          SendMessage(this.Wnd[this.IDBUTTON4].Handle, 241 /*BM_SETCHECK*/, 0, 0);
          SendMessage(this.Wnd[this.IDBUTTON5].Handle, 241 /*BM_SETCHECK*/, 0, 0);
        }
        else
          SendMessage(this.Wnd[this.IDBUTTON5].Handle, 241 /*BM_SETCHECK*/, 1, 0);
      }
      else if (nID == this.IDBUTTON7)
        SendMessage(this.Wnd[this.IDBUTTON8].Handle, 241 /*BM_SETCHECK*/, (! SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0)), 0);
      else if (nID == this.IDBUTTON8)
        SendMessage(this.Wnd[this.IDBUTTON7].Handle, 241 /*BM_SETCHECK*/, (! SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0)), 0);

      this.Value = 0;

      for (var i = this.IDBUTTON1; i <= this.IDBUTTON13; ++i)
      {
        if (SendMessage(this.Wnd[i].Handle, 240 /*BM_GETCHECK*/, 0, 0))
          this.Value |= this.Wnd[i].Type;
      }
      this.SetValue();
    }
    else if ((nID == this.IDDEF) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
    {
      this.Value = this.Default;
      this.SetValue();
    }
  }
};

var oUrlCommand =
{
  Value  : '',
  Default: '',
  Wnd    : [],
  IDTEXT : 2001,
  IDVALUE: 2002,
  IDDEF  : 2003,
  IDEDIT : 2004,

  Initialize: function()
  {
    SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 132 /*MI__URLCOMMAND*/, lpText);
    this.Value = AkelPad.MemRead(lpText, 1 /*DT_UNICODE*/);
    this.Wnd[this.IDTEXT ] = {Class: 'STATIC',    Style: 0x50000000, X: 140, Y:  20, W: 640, H:  13, Txt: 'Defines command for hyperlink click. Herewith variable %u denotes hyperlink text:',
                                                                                                     Rus: 'Определяет команду для запуска при клике по гиперссылке. При этом переменная %u обозначает текст гиперссылки:'};
    this.Wnd[this.IDVALUE] = {Class: 'COMBOBOX',  Style: 0x50010042, X: 140, Y:  40, W: 640, H:  21};
    this.Wnd[this.IDDEF  ] = {Class: 'BUTTON',    Style: 0x50010003, X: 140, Y:  71, W: 640, H:  16, Txt: 'By default: "" - hyperlink opens by operating system.',
                                                                                                     Rus: 'По умолчанию: "" - гиперссылка открывается операционной системой.'};
    this.Wnd[this.IDEDIT ] = {Class: 'AkelEditW', Style: 0x50010800, X: 140, Y:  96, W: 640, H:  21, Txt: 'Example: Exec(`"%ProgramFiles%\\Mozilla Firefox\\firefox.exe" "%u"`)',
                                                                                                     Rus: 'Пример: Exec(`"%ProgramFiles%\\Mozilla Firefox\\firefox.exe" "%u"`)'};
  },

  Apply: function()
  {
    SendMessage(hMainWnd, 1219 /*AKD_SETMAININFO*/, 132 /*MIS_URLCOMMAND*/, this.Value);
  },

  SetValue: function()
  {
    oSys.Call("User32::SetWindowTextW", this.Wnd[this.IDVALUE].Handle, this.Value);
    SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
  },

  Command: function(nID, nCode, hWnd)
  {
    if ((nID == this.IDVALUE) && ((nCode == 5 /*CBN_EDITCHANGE*/) || (nCode == 8 /*CBN_CLOSEUP*/)))
    {
      this.Value = GetWindowText(hWnd);
      SendMessage(this.Wnd[this.IDDEF].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
    }
    else if ((nID == this.IDDEF) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
    {
      this.Value = this.Default;
      this.SetValue();
    }
  }
};

var oWordBreak =
{
  Value    : 0,
  Default  : 9,
  DefaultAE: 111,
  Enable   : 0,
  Wnd      : [],
  IDTEXT   : 2001,
  IDBUTTON1: 2002,
  IDBUTTON2: 2003,
  IDBUTTON3: 2004,
  IDBUTTON4: 2005,
  IDBUTTON5: 2006,
  IDBUTTON6: 2007,
  IDBUTTON7: 2008,
  IDBUTTON8: 2009,
  IDBUTTON9: 2010,
  IDDEF    : 2011,
  IDDEFAE  : 2012,
  IDENABLE : 2013,
  IDSUM    : 2014,
  IDNOTE   : 2015,

  Initialize: function()
  {
    if (! hEditWnd)
      SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4101 /*wParam=MAKEWPARAM(0,IDM_FILE_NEW)*/, 1 /*lParam=TRUE*/);

    this.Value  = SendMessage(hMainWnd, 1222 /*AKD_GETMAININFO*/, 117 /*MI_WORDBREAKCUSTOM*/, 0);
    this.Enable = SendMessage(hMainWnd, 1223 /*AKD_GETFRAMEINFO*/, 107 /*FI_WORDDELIMITERSENABLE*/, 0);

    if (! hEditWnd)
      AkelPad.Command(4318 /*IDM_WINDOW_FRAMECLOSE*/);

    this.Wnd[this.IDTEXT   ] = {Class: 'STATIC', Style: 0x50000000, X: 140, Y:  20, W: 640, H:  13,                                    Txt: 'Defines how the caret on Ctrl+Left/Ctrl+Right will move. Set by the sum of members:',
                                                                                                                                       Rus: 'Определяет, как будет перемещаться каретка по Ctrl+Left/Ctrl+Right. Задается суммой членов:'};
    this.Wnd[this.IDBUTTON1] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  40, W: 640, H:  16, Type:   1 /*AEWB_LEFTWORDSTART*/,  Txt: '1 - Left movement is stopped, when word start is found.',
                                                                                                                                       Rus: '1 - Движение влево прекращается, когда встречается начало слова.'};
    this.Wnd[this.IDBUTTON2] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  60, W: 640, H:  16, Type:   2 /*AEWB_LEFTWORDEND*/,    Txt: '2 - Left movement is stopped, when word end is found.',
                                                                                                                                       Rus: '2 - Движение влево прекращается, когда встречается конец слова.'};
    this.Wnd[this.IDBUTTON3] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y:  80, W: 640, H:  16, Type:   4 /*AEWB_RIGHTWORDSTART*/, Txt: '4 - Right movement is stopped, when word start is found.',
                                                                                                                                       Rus: '4 - Движение вправо прекращается, когда встречается начало слова.'};
    this.Wnd[this.IDBUTTON4] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 100, W: 640, H:  16, Type:   8 /*AEWB_RIGHTWORDEND*/,   Txt: '8 - Right movement is stopped, when word end is found.',
                                                                                                                                       Rus: '8 - Движение вправо прекращается, когда встречается конец слова.'};
    this.Wnd[this.IDBUTTON5] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 120, W: 640, H:  16, Type:  16 /*AEWB_STOPSPACESTART*/, Txt: '16 - Movement is stopped, when spacing start is found. Cannot be combined with 64.',
                                                                                                                                       Rus: '16 - Движение прекращается, когда встречается начало серии пробелов. Не может быть использовано совместно с 64.'};
    this.Wnd[this.IDBUTTON6] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 140, W: 640, H:  16, Type:  32 /*AEWB_STOPSPACEEND*/,   Txt: '32 - Movement is stopped, when spacing end is found. Cannot be combined with 128.',
                                                                                                                                       Rus: '32 - Движение прекращается, когда встречается конец серии пробелов. Не может быть использовано совместно с 128.'};
    this.Wnd[this.IDBUTTON7] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 160, W: 640, H:  16, Type:  64 /*AEWB_SKIPSPACESTART*/, Txt: '64 - Movement is continued, when spacing start is found. Cannot be combined with 16.',
                                                                                                                                       Rus: '64 - Движение продолжается, когда встречается начало серии пробелов. Не может быть использовано совместно с 16.'};
    this.Wnd[this.IDBUTTON8] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 180, W: 640, H:  16, Type: 128 /*AEWB_SKIPSPACEEND*/,   Txt: '128 - Movement is continued, when spacing end is found. Cannot be combined with 32.',
                                                                                                                                       Rus: '128 - Движение продолжается, когда встречается конец серии пробелов. Не может быть использовано совместно с 32.'};
    this.Wnd[this.IDBUTTON9] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 200, W: 640, H:  16, Type: 256 /*AEWB_STOPNEWLINE*/,    Txt: '256 - Movement is stopped, when new line is found.',
                                                                                                                                       Rus: '256 - Движение прекращается, когда встречается конец строки.'};
    this.Wnd[this.IDDEF    ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 246, W: 640, H:  16,                                    Txt: 'By default: 1+8=9 (AkelPad)',
                                                                                                                                       Rus: 'По умолчанию: 1+8=9 (AkelPad)'};
    this.Wnd[this.IDDEFAE  ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 266, W: 640, H:  16,                                    Txt: 'By default: 1+2+4+8+32+64=111 (AkelEdit)',
                                                                                                                                       Rus: 'По умолчанию: 1+2+4+8+32+64=111 (AkelEdit)'};
    this.Wnd[this.IDENABLE ] = {Class: 'BUTTON', Style: 0x50010003, X: 140, Y: 286, W: 640, H:  16,                                    Txt: 'Works only if enabled "Word delimiters" in settings (WordDelimitersEnable=1).',
                                                                                                                                       Rus: 'Работает только при отмеченном пункте в настройках "Разделители слов" (WordDelimitersEnable=1).'};
    this.Wnd[this.IDSUM    ] = {Class: 'STATIC', Style: 0x50000000, X: 150, Y: 220, W:  70, H:  13};
    this.Wnd[this.IDNOTE   ] = {Class: 'STATIC', Style: 0x50000000, X: 140, Y: 315, W: 640, H:  13,                                    Txt: 'Note: changes are applied for a new edit windows.'};
  },

  Apply: function()
  {
    if (! hEditWnd)
      SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4101 /*wParam=MAKEWPARAM(0,IDM_FILE_NEW)*/, 1 /*lParam=TRUE*/);

    SendMessage(hMainWnd, 1219 /*AKD_SETMAININFO*/, 117 /*MIS_WORDBREAKCUSTOM*/, this.Value);
    AkelPad.SetFrameInfo(0, 54 /*FIS_WORDDELIMITERSENABLE*/, this.Enable);

    if (! hEditWnd)
      AkelPad.Command(4318 /*IDM_WINDOW_FRAMECLOSE*/);
  },

  SetValue: function()
  {
    for (var i = this.IDBUTTON1; i <= this.IDBUTTON9; ++i)
      SendMessage(this.Wnd[i].Handle, 241 /*BM_SETCHECK*/, this.Value & this.Wnd[i].Type, 0);
    oSys.Call("User32::SetWindowTextW", this.Wnd[this.IDSUM].Handle, '=' + this.Value);
    SendMessage(this.Wnd[this.IDDEF   ].Handle, 241 /*BM_SETCHECK*/, this.Value == this.Default, 0);
    SendMessage(this.Wnd[this.IDDEFAE ].Handle, 241 /*BM_SETCHECK*/, this.Value == this.DefaultAE, 0);
    SendMessage(this.Wnd[this.IDENABLE].Handle, 241 /*BM_SETCHECK*/, this.Enable, 0);
  },

  Command: function(nID, nCode, hWnd)
  {
    if ((nID >= this.IDBUTTON1) && (nID <= this.IDBUTTON9))
    {
      if ((nID == this.IDBUTTON5) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
        SendMessage(this.Wnd[this.IDBUTTON7].Handle, 241 /*BM_SETCHECK*/, 0, 0);
      else if ((nID == this.IDBUTTON7) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
        SendMessage(this.Wnd[this.IDBUTTON5].Handle, 241 /*BM_SETCHECK*/, 0, 0);
      else if ((nID == this.IDBUTTON6) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
        SendMessage(this.Wnd[this.IDBUTTON8].Handle, 241 /*BM_SETCHECK*/, 0, 0);
      else if ((nID == this.IDBUTTON8) && SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0))
        SendMessage(this.Wnd[this.IDBUTTON6].Handle, 241 /*BM_SETCHECK*/, 0, 0);

      this.Value = 0;

      for (var i = this.IDBUTTON1; i <= this.IDBUTTON9; ++i)
      {
        if (SendMessage(this.Wnd[i].Handle, 240 /*BM_GETCHECK*/, 0, 0))
          this.Value |= this.Wnd[i].Type;
      }
      this.SetValue();
    }
    else if (((nID == this.IDDEF) || (nID == this.IDDEFAE)) && (SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0)))
    {
      this.Value = (nID == this.IDDEF) ? this.Default : this.DefaultAE;
      this.SetValue();
    }
    else if (nID == this.IDENABLE)
      this.Enable = SendMessage(hWnd, 240 /*BM_GETCHECK*/, 0, 0);
  }
};

var aParam =
[
  ["AkelAdminResident",  oAkelAdminResident],
  ["AkelUpdaterOptions", oAkelUpdaterOptions, aAkelUpdaterOptions],
  ["CmdLineBegin",       oCmdLineBegin,       aCmdLineBegin],
  ["CmdLineEnd",         oCmdLineEnd,         aCmdLineEnd],
  ["DateInsertFormat",   oDateInsertFormat,   aDateInsertFormat],
  ["DateLogFormat",      oDateLogFormat,      aDateLogFormat],
  ["MouseOptions",       oMouseOptions],
  ["PaintOptions",       oPaintOptions],
  ["RichEditClass",      oRichEditClass],
  ["ShowModify",         oShowModify],
  ["StatusPosType",      oStatusPosType],
  ["StatusUserFormat",   oStatusUserFormat,   aStatusUserFormat],
  ["TabOptionsMDI",      oTabOptionsMDI],
  ["UrlCommand",         oUrlCommand,         aUrlCommand],
  ["WordBreak",          oWordBreak]
];

for (i = 0; i < aParam.length; ++i)
  aParam[i][1].Initialize();

var aDlg      = [];
var IDNAMELV  = 1001;
var IDLANGG   = 1002;
var IDENGB    = 1003;
var IDRUSB    = 1004;
var IDRESETB  = 1005;
var IDAPPLY   = 1006;
var IDOKB     = 1007;
var IDCANCELB = 1008;
aDlg[IDNAMELV ] = {Class: 'SysListView32', Style: 0x5081800D, X: 10, Y:  10, W: 110, H: 285};
aDlg[IDLANGG  ] = {Class: "BUTTON",        Style: 0x50000007, X: 10, Y: 305, W: 110, H:  65, Txt: "Language"};
aDlg[IDENGB   ] = {Class: "BUTTON",        Style: 0x50000009, X: 30, Y: 325, W:  60, H:  16, Txt: "&English"};
aDlg[IDRUSB   ] = {Class: "BUTTON",        Style: 0x50000009, X: 30, Y: 345, W:  60, H:  16, Txt: "&Russian"};
aDlg[IDRESETB ] = {Class: 'BUTTON',        Style: 0x50000000, X: 10, Y: 382, W: 110, H:  23, Txt: 'Set all to &default'};
aDlg[IDAPPLY  ] = {Class: 'BUTTON',        Style: 0x50000000, X: 10, Y: 410, W: 110, H:  23, Txt: '&Apply'};
aDlg[IDOKB    ] = {Class: 'BUTTON',        Style: 0x50000001, X: 10, Y: 438, W: 110, H:  23, Txt: 'OK'};
aDlg[IDCANCELB] = {Class: 'BUTTON',        Style: 0x50000000, X: 10, Y: 466, W: 110, H:  23, Txt: 'Cancel'};

AkelPad.WindowRegisterClass(sClassName);

hDlg = oSys.Call("User32::CreateWindowExW",
  0,              //dwExStyle
  sClassName,     //lpClassName
  sScriptName,    //lpWindowName
  0x90C80000,     //dwStyle=WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU
  nDlgX,          //x
  nDlgY,          //y
  806,            //nWidth
  530,            //nHeight
  hMainWnd,       //hWndParent
  0,              //ID
  hInstDLL,       //hInstance
  DialogCallback);//Script function callback. To use it class must be registered by WindowRegisterClass.

oSys.Call("user32::EnableWindow", hMainWnd, false);
AkelPad.WindowGetMessage();
AkelPad.WindowUnregisterClass(sClassName);
AkelPad.MemFree(lpText);
AkelPad.MemFree(lpLVITEM);

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    CreateWindows(hWnd, aDlg, IDNAMELV);
    SendMessage(aDlg[IDENGB + nLang].Handle, 241 /*BM_SETCHECK*/, 1, 0);
    FillLV();
    hFocus = aDlg[IDNAMELV].Handle;
  }

  else if ((uMsg == 6 /*WM_ACTIVATE*/) && (! wParam))
    hFocus = oSys.Call("User32::GetFocus");

  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("User32::SetFocus", hFocus);

  else if (uMsg == 15) //WM_PAINT
    PaintFrame();

  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (wParam == 9 /*VK_TAB*/)
    {
      hFocus = oSys.Call("User32::GetFocus");
      if (Ctrl())
      {
        oSys.Call("User32::SetFocus", aDlg[IDNAMELV].Handle);
        if (Shift())
        {
          if (nSel > 0)
            SetCurSelLV(nSel - 1);
          else
            SetCurSelLV(aParam.length - 1);
        }
        else
        {
          if (nSel < aParam.length - 1)
            SetCurSelLV(nSel + 1);
          else
            SetCurSelLV(0);
        }
      }
      else if ((hFocus == aDlg[IDENGB].Handle) || (hFocus == aDlg[IDRUSB].Handle))
        oSys.Call("User32::SetFocus", oSys.Call("User32::GetNextDlgTabItem", hWnd, hFocus, Shift()));
    }
    else if ((wParam == 13 /*VK_RETURN*/) && IsCloseCB())
      PostMessage(hWnd, 273 /*WM_COMMAND*/, IDOKB, 0);
    else if ((wParam == 27 /*VK_ESCAPE*/) && IsCloseCB())
      PostMessage(hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 260) //WM_SYSKEYDOWN
  {
    if ((wParam == 0x2E /*VK_DELETE*/) && aParam[nSel][2] && (! IsCloseCB()))
      DeleteFromHistory();
  }

  else if ((uMsg == 0x004E /*WM_NOTIFY*/) && (wParam == IDNAMELV))
  {
    switch (AkelPad.MemRead(lParam + (_X64 ? 16 : 8), 3 /*DT_DWORD*/))
    {
      case -101 : //LVN_ITEMCHANGED
        if (AkelPad.MemRead(lParam + (_X64 ? 32 : 20) /*NMLISTVIEW.uNewState*/, 3 /*DT_DWORD*/) & 0x2 /*LVIS_SELECTED*/)
        {
          DestroyWindows(aParam[nSel][1].Wnd, 2001);
          nSel = GetCurSelLV();
          CreateWindows(hWnd, aParam[nSel][1].Wnd, 2001);
          if (aParam[nSel][2])
            FillCB();
          aParam[nSel][1].SetValue();
        }
        break;
      case -2 : //NM_CLICK
      case -3 : //NM_DBLCLK
      case -5 : //NM_RCLICK
      case -6 : //NM_RDBLCLK
        if (AkelPad.MemRead(lParam + (_X64 ? 24 : 12) /*NMITEMACTIVATE.iItem*/, 3 /*DT_DWORD*/) == -1)
          SetCurSelLV(GetCurFocLV());
        break;
    }
  }

  else if (uMsg == 273) //WM_COMMAND
  {
    var nLowParam = LoWord(wParam);
    var nHiwParam = HiWord(wParam);

    if (nLowParam > 2001)
      aParam[nSel][1].Command(nLowParam, nHiwParam, lParam);
    else if ((nLowParam == IDENGB) || (nLowParam == IDRUSB))
    {
      nLang = nLowParam - IDENGB;
      aParam[nSel][1].Command(nLowParam, nHiwParam, lParam);
      SetTextInWindows(aParam[nSel][1].Wnd, 2001);
      oSys.Call("User32::SetFocus", aDlg[IDNAMELV].Handle);
    }
    else if (nLowParam == IDRESETB)
    {
      ResetAll();
      DefPushButtonBorder(nLowParam);
    }
    else if (nLowParam == IDAPPLY)
    {
      ApplyAll();
      DefPushButtonBorder(nLowParam);
    }
    else if (nLowParam == IDOKB)
    {
      bSaveHist = true;
      ApplyAll();
      PostMessage(hWnd, 16 /*WM_CLOSE*/, 0, 0);
    }
    else if (nLowParam == IDCANCELB)
      PostMessage(hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }

  else if (uMsg == 16) //WM_CLOSE
  {
    WriteIni();
    oSys.Call("user32::EnableWindow", hMainWnd, true);
    oSys.Call("User32::DestroyWindow", hWnd);
  }

  else if (uMsg == 2) //WM_DESTROY
    oSys.Call("User32::PostQuitMessage", 0);

  return 0;
}

function LoWord(nDwNum)
{
  return nDwNum & 0xFFFF;
}

function HiWord(nDwNum)
{
  return (nDwNum >> 16) & 0xFFFF;
}

function Ctrl()
{
  return Boolean(oSys.Call("User32::GetKeyState", 0x11 /*VK_CONTROL*/) & 0x8000);
}

function Shift()
{
  return Boolean(oSys.Call("User32::GetKeyState", 0x10 /*VK_SHIFT*/) & 0x8000);
}

function SendMessage(hWnd, uMsg, wParam, lParam)
{
  return oSys.Call("User32::SendMessageW", hWnd, uMsg, wParam, lParam);
}

function PostMessage(hWnd, uMsg, wParam, lParam)
{
  return oSys.Call("User32::PostMessageW", hWnd, uMsg, wParam, lParam);
}

function GetWindowText(hWnd)
{
  oSys.Call("User32::GetWindowTextW", hWnd, lpText, nTextLen);
  return AkelPad.MemRead(lpText, 1 /*DT_UNICODE*/);
}

function GetCurFocLV()
{
  return SendMessage(aDlg[IDNAMELV].Handle, 0x100C /*LVM_GETNEXTITEM*/, -1, 0x0001 /*LVNI_FOCUSED*/);
}

function GetCurSelLV()
{
  return SendMessage(aDlg[IDNAMELV].Handle, 0x100C /*LVM_GETNEXTITEM*/, -1, 0x0002 /*LVNI_SELECTED*/);
}

function SetCurSelLV(nItem)
{
  AkelPad.MemCopy(lpLVITEM + 12, 0x0003 /*LVIS_SELECTED|LVIS_FOCUSED*/, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpLVITEM + 16, 0x0003 /*LVIS_SELECTED|LVIS_FOCUSED*/, 3 /*DT_DWORD*/);
  SendMessage(aDlg[IDNAMELV].Handle, 0x102B /*LVM_SETITEMSTATE*/, nItem, lpLVITEM);
  SendMessage(aDlg[IDNAMELV].Handle, 0x1013 /*LVM_ENSUREVISIBLE*/, nItem, false);
}

function FillLV()
{
  var lpLVCOLUMN = AkelPad.MemAlloc(_X64 ? 56 : 44); //sizeof(LVCOLUMN)
  var i;

  AkelPad.MemCopy(lpLVCOLUMN, 4 /*mask=LVCF_TEXT*/, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpLVCOLUMN + (_X64 ? 16 : 12), lpText, 2 /*DT_QWORD*/);
  AkelPad.MemCopy(lpText, "Parameter", 1 /*DT_UNICODE*/);

  SendMessage(aDlg[IDNAMELV].Handle, 0x1061 /*LVM_INSERTCOLUMNW*/, 0, lpLVCOLUMN);
  AkelPad.MemFree(lpLVCOLUMN);

  SendMessage(aDlg[IDNAMELV].Handle, 0x101E /*LVM_SETCOLUMNWIDTH*/, 0, -2 /*LVSCW_AUTOSIZE_USEHEADER*/);
  SendMessage(aDlg[IDNAMELV].Handle, 0x1036 /*LVM_SETEXTENDEDLISTVIEWSTYLE*/, 0x0020 /*LVS_EX_FULLROWSELECT*/, 0x0020);

  for (i = 0; i < aParam.length; ++i)
  {
    AkelPad.MemCopy(lpLVITEM + 4, i, 3 /*DT_DWORD*/);
    AkelPad.MemCopy(lpText, aParam[i][0], 1 /*DT_UNICODE*/);
    SendMessage(aDlg[IDNAMELV].Handle, 0x104D /*LVM_INSERTITEMW*/, 0, lpLVITEM);
  }

  if (nSel < 0)
    nSel = 0;
  else if (nSel >= aParam.length)
    nSel = aParam.length - 1;

  SetCurSelLV(nSel);
}

function FillCB()
{
  var hWndCB = aParam[nSel][1].Wnd[aParam[nSel][1].IDVALUE].Handle;
  var i;

  SendMessage(hWndCB, 321 /*CB_LIMITTEXT*/, nTextLen, 0);
  SendMessage(hWndCB, 341 /*CB_SETEXTENDEDUI*/, 1, 0);

  for (i = 0; i < aParam[nSel][2].length; ++i)
    SendMessage(hWndCB, 0x0143 /*CB_ADDSTRING*/, 0, aParam[nSel][2][i]);
}

function IsCloseCB()
{
  if (aParam[nSel][2])
    return (! SendMessage(aParam[nSel][1].Wnd[aParam[nSel][1].IDVALUE].Handle, 343 /*CB_GETDROPPEDSTATE*/, 0, 0));

  return true;
}

function CreateWindows(hWndParent, aWnd, nFirst)
{
  var hGuiFont   = oSys.Call("Gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
  var lpAECOLORS = AkelPad.MemAlloc(17 * 4);
  var lpRect     = AkelPad.MemAlloc(16); //sizeof(RECT)
  var i;

  AkelPad.MemCopy(lpAECOLORS, 0x00000008 /*AECLR_BASICBK*/, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpAECOLORS + 12, oSys.Call("User32::GetSysColor", 15 /*COLOR_BTNFACE*/), 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpRect,      2, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpRect +  4, 2, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpRect +  8, 2, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpRect + 12, 2, 3 /*DT_DWORD*/);

  for (i = nFirst; i < aWnd.length; ++i)
  {
    aWnd[i].Handle = oSys.Call("User32::CreateWindowExW",
      0,            //dwExStyle
      aWnd[i].Class,//lpClassName
      0,            //lpWindowName
      aWnd[i].Style,//dwStyle
      aWnd[i].X,    //x
      aWnd[i].Y,    //y
      aWnd[i].W,    //nWidth
      aWnd[i].H,    //nHeight
      hWndParent,   //hWndParent
      i,            //ID
      hInstDLL,     //hInstance
      0);           //lpParam

    SendMessage(aWnd[i].Handle, 48 /*WM_SETFONT*/, hGuiFont, true);

    if (aWnd[i].Class == "AkelEditW")
    {
      oSys.Call("User32::SetWindowLongW", aWnd[i].Handle, -20 /*GWL_EXSTYLE*/, 0x20000 /*WS_EX_STATICEDGE*/);
      oSys.Call("User32::SetWindowPos", aWnd[i].Handle, 0, 0, 0, 0, 0, 0x37 /*SWP_FRAMECHANGED|SWP_NOACTIVATE|SWP_NOZORDER|SWP_NOMOVE|SWP_NOSIZE*/);
      SendMessage(aWnd[i].Handle, 3232 /*AEM_SETCOLORS*/, 0, lpAECOLORS);
      SendMessage(aWnd[i].Handle, 3178 /*AEM_SETRECT*/, 0x02 /*AERC_MARGINS*/, lpRect);
    }
  }

  SetTextInWindows(aWnd, nFirst);
  AkelPad.MemFree(lpAECOLORS);
  AkelPad.MemFree(lpRect);
}

function SetTextInWindows(aWnd, nFirst)
{
  for (var i = nFirst; i < aWnd.length; ++i)
  {
    if (aWnd[i].Txt)
      oSys.Call("User32::SetWindowTextW", aWnd[i].Handle, ((nLang == 1) && aWnd[i].Rus) ? aWnd[i].Rus : aWnd[i].Txt);
  }
}

function DestroyWindows(aWnd, nFirst)
{
  for (var i = nFirst; i < aWnd.length; ++i)
  {
    oSys.Call("User32::DestroyWindow", aWnd[i].Handle);
    aWnd[i].Handle = 0;
  }
}

function DeleteFromHistory()
{
  var hWndCB = aParam[nSel][1].Wnd[aParam[nSel][1].IDVALUE].Handle;
  var nPos   = SendMessage(hWndCB, 0x0147 /*CB_GETCURSEL*/, 0, 0);
  var i;

  aParam[nSel][2].splice(nPos, 1);
  SendMessage(hWndCB, 0x0144 /*CB_DELETESTRING*/, nPos, 0);

  if (nPos > aParam[nSel][2].length - 1)
    nPos = aParam[nSel][2].length - 1;

  SendMessage(hWndCB, 0x014E /*CB_SETCURSEL*/, nPos, 0);
}

function ResetAll()
{
  if (AkelPad.MessageBox(hDlg, "Set all parameters to default values?", sScriptName, 0x121 /*MB_DEFBUTTON2|MB_ICONQUESTION|MB_OKCANCEL*/) == 1 /*IDOK*/)
  {
    for (var i = 0; i < aParam.length; ++i)
      aParam[i][1].Value = aParam[i][1].Default;

    aParam[nSel][1].SetValue();
  }
}

function ApplyAll()
{
  for (var i = 0; i < aParam.length; ++i)
    aParam[i][1].Apply();
}

function DefPushButtonBorder(nID)
{
  if (oSys.Call("User32::GetFocus") == aDlg[nID].Handle)
  {
    oSys.Call("User32::SetFocus", aDlg[IDNAMELV].Handle);
    oSys.Call("User32::DefDlgProcW", hDlg, 1025 /*DM_SETDEFID*/, nID, 0);
    oSys.Call("User32::DefDlgProcW", hDlg, 1025 /*DM_SETDEFID*/, IDOKB, 0);
  }
}

function PaintFrame()
{
  var lpPaint = AkelPad.MemAlloc(_X64 ? 72 : 64); //sizeof(PAINTSTRUCT)
  var lpRect  = AkelPad.MemAlloc(16); //sizeof(RECT)
  var hDC     = oSys.Call("User32::BeginPaint", hDlg, lpPaint);

  AkelPad.MemCopy(lpRect,      130, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpRect +  4,  10, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpRect +  8, 790, 3 /*DT_DWORD*/);
  AkelPad.MemCopy(lpRect + 12, 489, 3 /*DT_DWORD*/);

  oSys.Call("user32::DrawEdge", hDC, lpRect, 0x9 /*EDGE_BUMP*/, 0x800F /*BF_MONO|BF_RECT*/);
  oSys.Call("user32::EndPaint", hDlg, lpPaint);

  AkelPad.MemFree(lpPaint);
  AkelPad.MemFree(lpRect);
}

function ReadIni()
{
  var sIniFile = WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini";
  var oFile;

  if (oFSO.FileExists(sIniFile))
  {
    oFile = oFSO.OpenTextFile(sIniFile, 1, false, -1);
    try
    {
      eval(oFile.ReadAll());
    }
    catch (oError)
    {}
    oFile.Close();
  }
}

function WriteIni()
{
  var oFile  = oFSO.OpenTextFile(WScript.ScriptFullName.substring(0, WScript.ScriptFullName.lastIndexOf(".")) + ".ini", 2, true, -1);
  var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)
  var sIniTxt;
  var i, n;

  oSys.Call("User32::GetWindowRect", hDlg, lpRect);

  sIniTxt =
    'nDlgX=' + AkelPad.MemRead(lpRect,     3 /*DT_DWORD*/) + ';\r\n' +
    'nDlgY=' + AkelPad.MemRead(lpRect + 4, 3 /*DT_DWORD*/) + ';\r\n' +
    'nSel='  + nSel + ';\r\n' +
    'nLang=' + nLang + ';\r\n';

  for (i = 0; i < aParam.length; ++i)
  {
    if (aParam[i][2])
    {
      //add to history
      if (bSaveHist && aParam[i][1].Value)
      {
        for (n = aParam[i][2].length - 1; n >= 0; --n)
        {
          if (aParam[i][2][n] == aParam[i][1].Value)
            aParam[i][2].splice(n, 1);
        }

        aParam[i][2].unshift(aParam[i][1].Value);

        if (aParam[i][2].length > nHistMax)
          aParam[i][2].length = nHistMax;
      }

      sIniTxt += 'a' + aParam[i][0] + '=[';

      for (n = 0; n < aParam[i][2].length; ++n)
        sIniTxt += '"' + aParam[i][2][n].replace(/[\\"]/g, '\\$&') + '"' + ((n < aParam[i][2].length - 1) ? ',' : '');

      sIniTxt += '];\r\n';
    }
  }
	
  oFile.Write(sIniTxt);
  oFile.Close();
  AkelPad.MemFree(lpRect);
}
