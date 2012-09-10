// http://akelpad.sourceforge.net/forum/viewtopic.php?p=9418#9418
// Version v2.2
//
//
//// Show help for keyword.
//
// Arguments:
// -Name="help_name.chm"  -Use "help_name.chm" to search keyword (default is predefined CHM names).
// -Path="C:\MyPath"      -Path to CHM files (default is "[AkelPad]\AkelFiles\Help").
// -Maximize=false        -Don't maximize CHM help dialog (default is true).
// -CatchEsc=false        -Don't close CHM help dialog after escape key pressed (default is true).
//
// Usage #1:
// Use predefined CHM names that depends on current file extension (lpExt2Chm variable).
// Call("Scripts::Main", 1, "ChmKeyword.js")
//
// Usage #2:
// Use "help_name.chm" to search keyword.
// Call("Scripts::Main", 1, "ChmKeyword.js", `-Name="help_name.chm"`)

//Options
var lpExt2Chm={"js"   : "wsh.chm",
               "vbs"  : "wsh.chm",
               "c"    : "cpp.chm",
               "cpp"  : "cpp.chm",
               "h"    : "cpp.chm",
               "nsi"  : "nsis.chm",
               "css"  : "css.chm",
               "php"  : "php.chm",
               "htm"  : "html.chm",
               "html" : "html.chm",
               ""     : "html.chm"};

//Arguments
var pChmName=AkelPad.GetArgValue("Name", "");
var pChmPath=AkelPad.GetArgValue("Path", AkelPad.GetAkelDir() + "\\AkelFiles\\Help");
var bMaximize=AkelPad.GetArgValue("Maximize", true);
var bCatchEsc=AkelPad.GetArgValue("CatchEsc", true);

//Variables
var fso=new ActiveXObject("Scripting.FileSystemObject");
var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var oSys=AkelPad.SystemFunction();
var hWndHelpDlg=0;
var pFile;
var pExt;
var pKeyword="";
var nSelStart;
var nSelEnd;
var nWordBegin;
var nWordEnd;
var nTimeOut;

if (hMainWnd)
{
  //File
  if (!pChmName)
  {
    pExt=fso.GetExtensionName(AkelPad.GetEditFile(0)).toLowerCase();
    if (!lpExt2Chm[pExt])
    {
      AkelPad.MessageBox(hMainWnd, GetLangString(0).replace(/%s/, pExt), WScript.ScriptName, 16 /*MB_ICONERROR*/);
      WScript.Quit();
    }
    pFile=pChmPath + "\\" + lpExt2Chm[pExt];
  }
  else pFile=pChmPath + "\\" + pChmName;

  if (!fso.FileExists(pFile))
  {
    AkelPad.MessageBox(hMainWnd, GetLangString(1).replace(/%s/, pFile), WScript.ScriptName, 16 /*MB_ICONERROR*/);
    WScript.Quit();
  }

  //Keyword
  nSelStart=AkelPad.GetSelStart();
  nSelEnd=AkelPad.GetSelEnd();

  if (nSelStart == nSelEnd)
  {
    //Select word under caret
    nWordBegin=AkelPad.SendMessage(hWndEdit, 1100 /*EM_FINDWORDBREAK*/, 0 /*WB_LEFT*/, nSelStart);
    nWordEnd=AkelPad.SendMessage(hWndEdit, 1100 /*EM_FINDWORDBREAK*/, 7 /*WB_RIGHTBREAK*/, nWordBegin);
    if (nWordEnd > nSelStart)
      pKeyword=AkelPad.GetTextRange(nWordBegin, nWordEnd);
  }
  else pKeyword=AkelPad.GetTextRange(nSelStart, nSelEnd);

  //Show help
  ChmKeyword(pFile, pKeyword);
}

//Functions
function ChmKeyword(pFile, pKeyword)
{
  var hModule;
  var lpKeywordBuffer;
  var lpStructure;
  var hWndHelpList=0;
  var hWndHelpChild;
  var hWndHelpFocus;
  var dwCurThreadID;
  var dwHelpThreadID;
  var hHook;
  var hMutex;

  //Load library manually to prevent hhctrl.ocx unload after HtmlHelp call
  if (!(hModule=oSys.Call("kernel32::GetModuleHandle" + _TCHAR, "hhctrl.ocx")))
    hModule=oSys.Call("kernel32::LoadLibrary" + _TCHAR, "hhctrl.ocx");

  if (hModule)
  {
    if (lpKeywordBuffer=AkelPad.MemAlloc(256 * _TSIZE))
    {
      AkelPad.MemCopy(lpKeywordBuffer, pKeyword.substr(0, 255), _TSTR);

      if (lpStructure=AkelPad.MemAlloc(_X64?56:32 /*sizeof(HH_AKLINK)*/))
      {
        //Fill structure
        AkelPad.MemCopy(lpStructure, _X64?56:32, 3 /*DT_DWORD*/);                    //HH_AKLINK.cbStruct
        AkelPad.MemCopy(lpStructure + (_X64?8:8), lpKeywordBuffer, 2 /*DT_QWORD*/);  //HH_AKLINK.pszKeywords
        AkelPad.MemCopy(lpStructure + (_X64?48:28), true, 3 /*DT_DWORD*/);           //HH_AKLINK.fIndexOnFail

        hWndHelpDlg=oSys.Call("hhctrl.ocx::HtmlHelp" + _TCHAR, oSys.Call("user32::GetDesktopWindow"), pFile, 0xD /*HH_KEYWORD_LOOKUP*/, lpStructure);

        //Send VK_RETURN
        if (hWndHelpDlg)
        {
          dwCurThreadID=oSys.Call("kernel32::GetCurrentThreadId");
          dwHelpThreadID=oSys.Call("user32::GetWindowThreadProcessId", hWndHelpDlg, 0);

          if (pKeyword)
          {
            if (oSys.Call("user32::AttachThreadInput", dwCurThreadID, dwHelpThreadID, true))
            {
              hWndHelpFocus=oSys.Call("user32::GetFocus");

              if (oSys.Call("user32::GetWindowTextLength" + _TCHAR, hWndHelpFocus))
              {
                AkelPad.SendMessage(hWndHelpFocus, 0x0100 /*WM_KEYDOWN*/, 0x0D /*VK_RETURN*/, 0x011C001);
                AkelPad.SendMessage(hWndHelpFocus, 0x0101 /*WM_KEYUP*/, 0x0D /*VK_RETURN*/, 0xC11C001);
              }
              else oSys.Call("user32::SetWindowText" + _TCHAR, hWndHelpFocus, lpKeywordBuffer);

              oSys.Call("user32::AttachThreadInput", dwCurThreadID, dwHelpThreadID, false);
            }
          }

          if (bMaximize)
          {
            //Maximize CHM window
            oSys.Call("user32::ShowWindow", hWndHelpDlg, 3 /*SW_MAXIMIZE*/);
          }
          if (bCatchEsc)
          {
            if (hMutex=oSys.Call("kernel32::CreateEvent" + _TCHAR, 0, 0, 0, WScript.ScriptName))
            {
              //Allow WindowSubClass and ThreadHook only for single script
              if (oSys.GetLastError() != 183 /*ERROR_ALREADY_EXISTS*/)
              {
                //Catch WM_CLOSE
                if (AkelPad.WindowSubClass(hWndHelpDlg, SubClassCallback, 2 /*WM_DESTROY*/))
                {
                  //Catch VK_ESCAPE
                  if (hHook=AkelPad.ThreadHook(3 /*WH_GETMESSAGE*/, HookCallback, dwHelpThreadID))
                  {
                    //Allow other scripts running
                    AkelPad.ScriptNoMutex();

                    //Message loop
                    AkelPad.WindowGetMessage();

                    //Wait while CHM window complitelly destroyed
                    for (nTimeOut=5000; nTimeOut > 0 && oSys.Call("user32::IsWindow", hWndHelpDlg); nTimeOut-=100)
                      WScript.Sleep(100);

                    AkelPad.ThreadUnhook(hHook);
                  }
                  AkelPad.WindowUnsubClass(hWndHelpDlg);
                }
              }
              oSys.Call("kernel32::CloseHandle", hMutex);
            }
          }
        }
        AkelPad.MemFree(lpStructure);
      }
      AkelPad.MemFree(lpKeywordBuffer);
    }
  }
}

function SubClassCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 2 /*WM_DESTROY*/)
  {
    //Exit message loop
    oSys.Call("user32::PostQuitMessage", 0);
  }
}

function HookCallback(nCode, wParam, lParam)
{
  var uMsg=AkelPad.MemRead(lParam + (_X64?8:4) /*MSG.message*/, 3 /*DT_DWORD*/);
  var wParam;

  if (uMsg == 0x100 /*WM_KEYDOWN*/)
  {
    wParam=AkelPad.MemRead(lParam + (_X64?16:8) /*MSG.wParam*/, 2 /*DT_QWORD*/);

    if (wParam == 0x1B /*VK_ESCAPE*/)
    {
      if (oSys.Call("user32::GetForegroundWindow") == hWndHelpDlg)
        AkelPad.SendMessage(hWndHelpDlg, 16 /*WM_CLOSE*/, 0, 0);
    }
  }
}

function GetLangString(nStringID)
{
  var nLangID=AkelPad.GetLangId(1 /*LANGID_PRIMARY*/);

  if (nLangID == 0x19) //LANG_RUSSIAN
  {
    if (nStringID == 0)
      return "\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 \"%s\" \u043D\u0435\u0020\u0430\u0441\u0441\u043E\u0446\u0438\u0438\u0440\u043E\u0432\u0430\u043D\u043E\u0020\u043D\u0438\u0020\u0441\u0020\u043E\u0434\u043D\u0438\u043C\u0020\u0043\u0048\u004D\u0020\u0444\u0430\u0439\u043B\u043E\u043C\u002E";
    if (nStringID == 1)
      return "\u041D\u0435\u0020\u043D\u0430\u0439\u0434\u0435\u043D\u043E\u003A \"%s\"";
  }
  else
  {
    if (nStringID == 0)
      return "Extension \"%s\" is not associated with any CHM file.";
    if (nStringID == 1)
      return "Missing: \"%s\"";
  }
  return "";
}
