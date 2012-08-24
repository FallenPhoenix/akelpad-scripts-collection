//Create RichEdit or AkelEdit control.
//Script can be run in AkelPad window or from command line (ActiveX).
//Required AkelEdit.dll and registration Scripts.dll.

GetAkelPadObject();

var oSys         = AkelPad.SystemFunction();
var hMainWnd     = AkelPad.GetMainWnd();
var hInstanceDLL = AkelPad.GetInstanceDll();
var sClassName   = "AkelPad::Scripts::" + WScript.ScriptName + "::" + hInstanceDLL;
var sDlgName     = "Edit control";
var bAkelEdit;
var sEditLibName;
var hEditLib;
var sEditClass;
var hEdit;
var hButton;

var nChoice = AkelPad.MessageBox(hMainWnd, "Create RichEdit or AkelEdit?", sDlgName, 0x23 /*MB_ICONQUESTION|MB_YESNOCANCEL*/);

if (nChoice == 2 /*IDCANCEL*/)
  WScript.Quit();

bAkelEdit = nChoice - 6 /*IDYES*/;

if (hMainWnd)
{
  if (bAkelEdit)
  {
    sEditClass = "AkelEditW";
    //or
    //sEditClass = "RichEdit20W";
  }
  else
  {
    sEditClass = "RICHEDIT50W";
    sEditLibName = "Msftedit.dll";
    LoadLibrary();
  }
  sDlgName += " - AkelPad - " + sEditClass;
}
else
{
  if (bAkelEdit)
  {
    sEditClass = "AkelEditW";
    sEditLibName = "AkelEdit.dll";
  }
  else
  {
    sEditClass = "RichEdit20W";
    sEditLibName = "Riched20.dll";
    //or
    //sEditClass = "RICHEDIT50W";
    //sEditLibName = "Msftedit.dll";
  }
  sDlgName += " - ActiveX - " + sEditClass;
  LoadLibrary();
}

AkelPad.WindowRegisterClass(sClassName);

oSys.Call("user32::CreateWindowExW",
          0,               //dwExStyle
          sClassName,      //lpClassName
          sDlgName,        //lpWindowName
          0x90CA0000,      //dwStyle=WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX
          300,             //x
          200,             //y
          360,             //nWidth
          240,             //nHeight
          hMainWnd,        //hWndParent
          0,               //ID
          hInstanceDLL,    //hInstance
          DialogCallback); //Script function callback. To use it class must be registered by WindowRegisterClass.

AkelPad.WindowGetMessage();

if (hEditLib)
  oSys.Call("kernel32::FreeLibrary", hEditLib);

AkelPad.WindowUnregisterClass(sClassName);

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1) //WM_CREATE
  {
    hEdit =
      oSys.Call("user32::CreateWindowExW",
                0,             //dwExStyle
                sEditClass,    //lpClassName
                0,             //lpWindowName
                0x50311104,    //dwStyle=WS_VISIBLE|WS_CHILD|WS_HSCROLL|WS_VSCROLL|WS_TABSTOP|ES_WANTRETURN|ES_NOHIDESEL|ES_MULTILINE
                10,            //x
                10,            //y
                335,           //nWidth
                140,           //nHeight
                hWnd,          //hWndParent
                0,             //ID
                hInstanceDLL,  //hInstance
                0);            //lpParam
    oSys.Call("user32::SetWindowTextW", hEdit, "The original specification for rich edit controls is Microsoft Rich Edit 1.0; the current specification is Microsoft Rich Edit 4.1. Each version of rich edit is a superset of the preceding one, except that only Asian builds of Microsoft Rich Edit 1.0 have a vertical text option. Before creating a rich edit control, you should call the LoadLibrary function to verify which version of Microsoft Rich Edit is installed.");

    hButton =
      oSys.Call("user32::CreateWindowExW",
                0,            //dwExStyle
                "BUTTON",     //lpClassName
                "Wrap lines", //lpWindowName
                0x50010003,   //dwStyle=WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
                130,          //x
                170,          //y
                100,          //nWidth
                25,           //nHeight
                hWnd,         //hWndParent
                0,            //ID
                hInstanceDLL, //hInstance
                0);           //lpParam
  }
  else if (uMsg == 7) //WM_SETFOCUS
    oSys.Call("user32::SetFocus", hButton);
  else if (uMsg == 256) //WM_KEYDOWN
  {
    if (wParam == 27) //VK_ESCAPE
      oSys.Call("user32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
  }
  else if (uMsg == 273) //WM_COMMAND
  {
    if (lParam == hButton)
      SetWordWrap();
  }
  else if (uMsg == 16) //WM_CLOSE
    oSys.Call("user32::DestroyWindow", hWnd);
  else if (uMsg == 2) //WM_DESTROY
    oSys.Call("user32::PostQuitMessage", 0);

  return 0;
}

function LoadLibrary()
{
  hEditLib = oSys.Call("kernel32::LoadLibraryW", sEditLibName);

  if (! hEditLib)
  {
    WScript.Echo("Can not load library: " + sEditLibName);
    WScript.Quit();
  }
}

function SetWordWrap()
{
  var bWordWrap = AkelPad.SendMessage(hButton, 240 /*BM_GETCHECK*/, 0, 0);

  if (bAkelEdit)
    AkelPad.SendMessage(hEdit, 0x0CAA /*AEM_SETWORDWRAP*/, bWordWrap, 0);
  else
    AkelPad.SendMessage(hEdit, 1096 /*EM_SETTARGETDEVICE*/, 0, ! bWordWrap);
}

function GetAkelPadObject()
{
  if (typeof AkelPad == "undefined")
  {
    var oError;

    try
    {
      AkelPad = new ActiveXObject("AkelPad.Document");
      _TCHAR  = AkelPad.Constants._TCHAR;
      _TSTR   = AkelPad.Constants._TSTR;
      _TSIZE  = AkelPad.Constants._TSIZE;
    }
    catch (oError)
    {
      WScript.Echo("You need register Scripts.dll");
      WScript.Quit();
    }
  }
}
