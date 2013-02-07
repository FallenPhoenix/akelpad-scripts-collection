// http://akelpad.sourceforge.net/forum/viewtopic.php?p=12548#12548
// Version v1.5
//
//
//// Open/Convert files.
//
// Arguments:
// -OpenMask="C:\MyFolder\*.*" -Search any files in "C:\MyFolder".
// -OpenList="C:\files.lst"    -Open files specified in "files.lst".
// -SubDir=true                -Search recursively (default is false).
// -OpenCodepage=-1            -Open codepage, if -1 it will be autodetected (default is -1).
// -OpenBOM=-1                 -File byte order mark, if -1 it will be autodetected (default is -1).
// -OpenBinary=-1              -Open binary file, 1 - open if binary, 0 - don't open if binary, -1 - prompt (default is 0).
// -SaveDir=""                 -Save directory, if "" files will be saved in place.
// -SaveCodepage=65001         -Save codepage, if -1 current codepage will be used (default is -1).
// -SaveBOM=1                  -File byte order mark, 1 - exist, 2 - doesn't exist, -1 - current BOM will be used (default is -1).
// -Silent=true                -Display no messages (default is false).
// -CloseNoFiles=false         -Don't close program, if after script ending no files are opened (default is true).
//
// Remark:
// If SaveCodepage and SaveBOM not specified when no convertion operation will occur and files will be just opened.
//
// Usage (open):
// Call("Scripts::Main", 1, "OpenSaveMask.js", `-OpenMask="C:\MyFolder\*.txt" -SubDir=true`)
//
// Usage (convert by mask):
// Call("Scripts::Main", 1, "OpenSaveMask.js", `-OpenMask="C:\MyFolder\*.txt" -SubDir=true -SaveCodepage=65001 -SaveBOM=1`)

//Arguments
var pOpenMask=AkelPad.GetArgValue("OpenMask", "");
var pOpenList=AkelPad.GetArgValue("OpenList", "");
var bSubDir=AkelPad.GetArgValue("SubDir", false);
var nOpenCodepage=AkelPad.GetArgValue("OpenCodepage", -1);
var nOpenBOM=AkelPad.GetArgValue("OpenBOM", -1);
var nOpenBinary=AkelPad.GetArgValue("OpenBinary", 0);
var pSaveDir=AkelPad.GetArgValue("SaveDir", "");
var nSaveCodepage=AkelPad.GetArgValue("SaveCodepage", -1);
var nSaveBOM=AkelPad.GetArgValue("SaveBOM", -1);
var bSilent=AkelPad.GetArgValue("Silent", false);
var bCloseNoFiles=AkelPad.GetArgValue("CloseNoFiles", true);

var hMainWnd=AkelPad.GetMainWnd();
var oSys=AkelPad.SystemFunction();
var pFileList="";
var dwCmdOptions;
var nAllFiles=0;
var nDoneFiles=0;
var nErrors=0;

if (pOpenMask || pOpenList)
{
  dwCmdOptions=AkelPad.SendMessage(hMainWnd, 1145 /*AKD_GETCMDLINEOPTIONS*/, 0, 0);
  if (nOpenBinary == 1)
    AkelPad.SendMessage(hMainWnd, 1146 /*AKD_SETCMDLINEOPTIONS*/, (dwCmdOptions | 0x10 /*CLO_MSGOPENBINARYYES*/) & ~0x20 /*CLO_MSGOPENBINARYNO*/, 0);
  else if (nOpenBinary == 0)
    AkelPad.SendMessage(hMainWnd, 1146 /*AKD_SETCMDLINEOPTIONS*/, (dwCmdOptions & ~0x10 /*CLO_MSGOPENBINARYYES*/) | 0x20 /*CLO_MSGOPENBINARYNO*/, 0);
  else if (nOpenBinary == -1)
    AkelPad.SendMessage(hMainWnd, 1146 /*AKD_SETCMDLINEOPTIONS*/, (dwCmdOptions & ~0x10 /*CLO_MSGOPENBINARYYES*/) & ~0x20 /*CLO_MSGOPENBINARYNO*/, 0);

  if (pOpenMask)
  {
    Locate(pOpenMask, bSubDir);
  }
  if (pOpenList)
  {
    var pFilesText;
    var pLinesArray;
    var nIndex;

    if (pFilesText=AkelPad.ReadFile(pOpenList))
    {
      pFilesText=pFilesText.replace(/\r\r\n|\r\n|\r|\n/g, "\n");
      if (pLinesArray=pFilesText.split("\n"))
      {
        for (nIndex=0; nIndex < pLinesArray.length; ++nIndex)
        {
          if (pLinesArray[nIndex])
          {
            DoFile(pLinesArray[nIndex], pSaveDir);
          }
        }
      }
    }
  }

  AkelPad.SendMessage(hMainWnd, 1146 /*AKD_SETCMDLINEOPTIONS*/, dwCmdOptions, 0);

  if (nSaveCodepage != -1 || nSaveBOM != -1)
  {
    if (nAllFiles && AkelPad.IsMDI())
      AkelPad.Command(4325 /*IDM_WINDOW_FILEEXIT*/);
    if (!bSilent)
      WScript.Echo("Converted: " + nDoneFiles + " of " + nAllFiles + " files (" + nErrors + " errors)");
  }
  if (bCloseNoFiles)
  {
    if (AkelPad.SendMessage(hMainWnd, 1292 /*AKD_FRAMENOWINDOWS*/, 0, 0) ||
        (AkelPad.IsMDI() == 1 && AkelPad.SendMessage(hMainWnd, 1291 /*AKD_FRAMESTATS*/, 0 /*FWS_COUNTALL*/, 0) == 1 &&
         !AkelPad.GetEditFile(0) && !AkelPad.GetEditModified(0)))
    {
      AkelPad.Command(4109 /*IDM_FILE_EXIT*/);
    }
  }
}

function Locate(pSearchFor, bSubDir)
{
  var lpFindData=AkelPad.MemAlloc(592 /*sizeof(WIN32_FIND_DATAW)*/);
  var lpLocalFileTime=AkelPad.MemAlloc(8 /*sizeof(FILETIME)*/);
  var lpSystemTime=AkelPad.MemAlloc(16 /*sizeof(SYSTEMTIME)*/);
  var lpWriteTime=[];
  var hSearch;
  var pDir;
  var pWildcard;
  var pFileName;
  var nSize;
  var nFileSizeHigh;
  var nFileSizeLow;
  var dwAttributes;
  var nOffset;
  var bStop=false;

  if ((nOffset=pSearchFor.lastIndexOf("\\")) != -1)
  {
    pDir=pSearchFor.substr(0, nOffset);
    pWildcard=pSearchFor.substr(nOffset + 1);

    //Enumerate directory
    if ((hSearch=oSys.Call("kernel32::FindFirstFile" + _TCHAR, pSearchFor, lpFindData)) != -1 /*INVALID_HANDLE_VALUE*/)
    {
      do
      {
        pFileName=AkelPad.MemRead(lpFindData + 44 /*offsetof(WIN32_FIND_DATAW, cFileName)*/, _TSTR);
        if (pFileName == "." || pFileName == "..") continue;
        dwAttributes=AkelPad.MemRead(lpFindData /*offsetof(WIN32_FIND_DATAW, dwAttributes)*/, 3 /*DT_DWORD*/);

        if (!(dwAttributes & 0x10 /*FILE_ATTRIBUTE_DIRECTORY*/))
        {
          //File size
          nFileSizeHigh=AkelPad.MemRead(lpFindData + 28 /*offsetof(WIN32_FIND_DATAW, nFileSizeHigh)*/, 3 /*DT_DWORD*/);
          nFileSizeLow=AkelPad.MemRead(lpFindData + 32 /*offsetof(WIN32_FIND_DATAW, nFileSizeLow)*/, 3 /*DT_DWORD*/);
          nSize=(nFileSizeHigh * (0xFFFFFFFF + 1)) + nFileSizeLow;

          //Get write time
          oSys.Call("kernel32::FileTimeToLocalFileTime", lpFindData + 20 /*offsetof(WIN32_FIND_DATAW, ftLastWriteTime)*/, lpLocalFileTime);
          oSys.Call("kernel32::FileTimeToSystemTime", lpLocalFileTime, lpSystemTime);
          lpWriteTime.wYear=AkelPad.MemRead(lpSystemTime /*offsetof(SYSTEMTIME, wYear)*/, 4 /*DT_WORD*/);
          lpWriteTime.wMonth=AkelPad.MemRead(lpSystemTime + 2 /*offsetof(SYSTEMTIME, wMonth)*/, 4 /*DT_WORD*/);
          lpWriteTime.wDayOfWeek=AkelPad.MemRead(lpSystemTime + 4 /*offsetof(SYSTEMTIME, wDayOfWeek)*/, 4 /*DT_WORD*/);
          lpWriteTime.wDay=AkelPad.MemRead(lpSystemTime + 6 /*offsetof(SYSTEMTIME, wDay)*/, 4 /*DT_WORD*/);
          lpWriteTime.wHour=AkelPad.MemRead(lpSystemTime + 8 /*offsetof(SYSTEMTIME, wHour)*/, 4 /*DT_WORD*/);
          lpWriteTime.wMinute=AkelPad.MemRead(lpSystemTime + 10 /*offsetof(SYSTEMTIME, wMinute)*/, 4 /*DT_WORD*/);
          lpWriteTime.wSecond=AkelPad.MemRead(lpSystemTime + 12 /*offsetof(SYSTEMTIME, wSecond)*/, 4 /*DT_WORD*/);
          lpWriteTime.wMilliseconds=AkelPad.MemRead(lpSystemTime + 14 /*offsetof(SYSTEMTIME, wMilliseconds)*/, 4 /*DT_WORD*/);

          if (bStop=LocateCallback(pDir, pFileName, dwAttributes, nSize, lpWriteTime))
            break;
        }
      }
      while (oSys.Call("kernel32::FindNextFile" + _TCHAR, hSearch, lpFindData));

      oSys.Call("kernel32::FindClose", hSearch);
    }

    //Go to subdirectory
    if (!bStop && bSubDir)
    {
      if ((hSearch=oSys.Call("kernel32::FindFirstFile" + _TCHAR, pDir + "\\" + "*.*", lpFindData)) != -1 /*INVALID_HANDLE_VALUE*/)
      {
        do
        {
          pFileName=AkelPad.MemRead(lpFindData + 44 /*offsetof(WIN32_FIND_DATAW, cFileName)*/, _TSTR);
          if (pFileName == "." || pFileName == "..") continue;
          dwAttributes=AkelPad.MemRead(lpFindData /*offsetof(WIN32_FIND_DATAW, dwAttributes)*/, 3 /*DT_DWORD*/);

          if (dwAttributes & 0x10 /*FILE_ATTRIBUTE_DIRECTORY*/)
          {
            if (bSubDir)
            {
              //Recursive call
              if (bStop=Locate(pDir + "\\" + pFileName + "\\" + pWildcard, true))
                break;
            }
          }
        }
        while (oSys.Call("kernel32::FindNextFile" + _TCHAR, hSearch, lpFindData));

        oSys.Call("kernel32::FindClose", hSearch);
      }
    }
  }

  AkelPad.MemFree(lpFindData);
  AkelPad.MemFree(lpLocalFileTime);
  AkelPad.MemFree(lpSystemTime);
  return bStop;
}

function LocateCallback(pDir, pFileName, dwAttributes, nSize, lpWriteTime)
{
  DoFile(pDir + "\\" + pFileName, pSaveDir);

  //WScript.Echo("Name:" + pDir + "\\" + pFileName + "\n" +
  //             "Attr:" + dwAttributes + "\n" +
  //             "Size:" + nSize + "\n" +
  //             "WriteTime:" + lpWriteTime.wYear + "." + lpWriteTime.wMonth + "." + lpWriteTime.wDay + " " +
  //                            lpWriteTime.wHour + ":" + lpWriteTime.wMinute + ":" + lpWriteTime.wSecond + " " +
  //                            lpWriteTime.wMilliseconds + "ms, DayOfWeek:" + lpWriteTime.wDayOfWeek);

  //Stop?
  return false;
}

function DoFile(pOpenFile, pSaveFile)
{
  var nOpenResult;
  var dwOpenFlags=0x1 /*OD_ADT_BINARY_ERROR*/;

  if (nOpenCodepage == -1)
    dwOpenFlags|=0x4 /*OD_ADT_DETECT_CODEPAGE*/;
  if (nOpenBOM == -1)
    dwOpenFlags|=0x8 /*OD_ADT_DETECT_BOM*/;

  if (!(nOpenResult=AkelPad.OpenFile(pOpenFile, dwOpenFlags, nOpenCodepage, nOpenBOM)))
  {
    if (nSaveCodepage != -1 || nSaveBOM != -1)
    {
      if ((nSaveCodepage != -1 && AkelPad.GetEditCodePage(0) != nSaveCodepage) ||
          (nSaveBOM != -1 && AkelPad.GetEditBOM(0) != nSaveBOM))
      {
        if (!pSaveFile)
          pSaveFile=pOpenFile;
        else if (oSys.Call("kernel32::GetFileAttributes" + _TCHAR, pSaveFile) & 0x10 /*FILE_ATTRIBUTE_DIRECTORY*/)
          pSaveFile=pSaveFile + "\\" + GetFileName(pOpenFile);

        if (!AkelPad.SaveFile(0, pSaveFile, nSaveCodepage, nSaveBOM))
          ++nDoneFiles;
        else
          ++nErrors;
      }
      AkelPad.Command(4324 /*IDM_WINDOW_FILECLOSE*/);
    }
  }
  else if (nOpenResult != -20 /*EOD_MSGNO*/)
  {
    ++nErrors;
  }
  ++nAllFiles;
}

function GetFileName(pFile)
{
  var nOffset;

  if ((nOffset=pFile.lastIndexOf("\\")) != -1)
    pFile=pFile.substr(nOffset);
  return pFile;
}
